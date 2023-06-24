import * as anchor from "@coral-xyz/anchor";

import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from "@solana/spl-token";
import {
  getBidStateKey,
  getCollectionAuthorityKey,
  getConfigKey,
  getTokenStateKey,
} from "../sdk/src";

import { BN } from "bn.js";
import { HarbergerNft } from "../target/types/harberger_nft";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Program } from "@coral-xyz/anchor";
import { generateSeededKeypair } from "./utils";

import { expect } from "chai";

const suiteName = "harberger-nft";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const metaplex = new Metaplex(connection);

  const program = anchor.workspace.HarbergerNft as Program<HarbergerNft>;
  let users: Keypair[];
  let taxMint: PublicKey;

  before(async () => {
    users = await Promise.all(
      Array(3)
        .fill(0)
        .map(async (_, i) => {
          const kp = generateSeededKeypair(`${suiteName}+${i}`);

          await connection.confirmTransaction(
            await connection.requestAirdrop(kp.publicKey, 10 * LAMPORTS_PER_SOL)
          );

          return kp;
        })
    );

    metaplex.use(keypairIdentity(users[0]));

    const { mint } = await metaplex
      .tokens()
      .createMint({ mintAuthority: users[0].publicKey, decimals: 6 });
    taxMint = mint.address;

    await getOrCreateAssociatedTokenAccount(
      connection,
      users[1],
      taxMint,
      users[1].publicKey,
      true
    );

    await mintToChecked(
      connection,
      users[0],
      taxMint,
      getAssociatedTokenAddressSync(taxMint, users[1].publicKey, true),
      users[0],
      10 ** 10,
      6
    );
  });

  it("Mint collection", async () => {
    const admin = users[0];
    const holder = users[1];
    const adminMintKeypair = Keypair.generate();

    const collectionMintKeypair = generateSeededKeypair(
      `${suiteName}+collection`
    );
    const price = new anchor.BN(10);

    const configKey = getConfigKey(collectionMintKeypair.publicKey);
    const collectionAuthority = getCollectionAuthorityKey(
      collectionMintKeypair.publicKey
    );

    // Mint collection
    const createCollectionAccounts = {
      config: configKey,
      taxMint,
      admin: admin.publicKey,
      adminMint: adminMintKeypair.publicKey,
      adminAccount: getAssociatedTokenAddressSync(
        adminMintKeypair.publicKey,
        admin.publicKey,
        true
      ),
      collectionAuthority,
      collectionMint: collectionMintKeypair.publicKey,
      collectionMetadata: metaplex
        .nfts()
        .pdas()
        .metadata({ mint: collectionMintKeypair.publicKey }),
      collectionMasterEdition: metaplex
        .nfts()
        .pdas()
        .masterEdition({ mint: collectionMintKeypair.publicKey }),
      collectionAccount: getAssociatedTokenAddressSync(
        collectionMintKeypair.publicKey,
        collectionAuthority,
        true
      ),
      metadataProgram: metaplex.programs().getTokenMetadata().address,
    };
    await program.methods
      .createCollection(price)
      .accounts(createCollectionAccounts)
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([adminMintKeypair, collectionMintKeypair])
      .rpc();

    let collectionMetadata = await metaplex
      .nfts()
      .findByMint({ mintAddress: collectionMintKeypair.publicKey });
    expect(collectionMetadata.collection).to.be.null;

    let collectionConfig = await program.account.collectionConfig.fetch(
      configKey
    );
    expect(collectionConfig.collectionMint.toString()).to.equal(
      collectionMintKeypair.publicKey.toString()
    );
    expect(collectionConfig.adminMint.toString()).to.equal(
      adminMintKeypair.publicKey.toString()
    );
    expect(collectionConfig.taxMint.toString()).to.equal(taxMint.toString());
    expect(collectionConfig.pricePerTimeUnit.toString()).to.equal(
      price.toString()
    );

    const tokenMintKeypair = generateSeededKeypair(`${suiteName}+token-1`);
    const tokenStateKey = getTokenStateKey(
      collectionMintKeypair.publicKey,
      tokenMintKeypair.publicKey
    );

    // Mint a token
    await program.methods
      .createToken()
      .accounts({
        config: configKey,
        receiver: holder.publicKey,
        admin: admin.publicKey,
        adminMint: adminMintKeypair.publicKey,
        adminAccount: getAssociatedTokenAddressSync(
          adminMintKeypair.publicKey,
          admin.publicKey,
          true
        ),
        collectionAuthority,
        collectionMint: collectionMintKeypair.publicKey,
        collectionMetadata: metaplex
          .nfts()
          .pdas()
          .metadata({ mint: collectionMintKeypair.publicKey }),
        collectionMasterEdition: metaplex
          .nfts()
          .pdas()
          .masterEdition({ mint: collectionMintKeypair.publicKey }),
        tokenState: tokenStateKey,
        tokenMint: tokenMintKeypair.publicKey,
        tokenMetadata: metaplex
          .nfts()
          .pdas()
          .metadata({ mint: tokenMintKeypair.publicKey }),
        tokenMasterEdition: metaplex
          .nfts()
          .pdas()
          .masterEdition({ mint: tokenMintKeypair.publicKey }),
        tokenAccount: getAssociatedTokenAddressSync(
          tokenMintKeypair.publicKey,
          holder.publicKey,
          true
        ),
        delegateRecord: metaplex.nfts().pdas().metadataDelegateRecord({
          mint: tokenMintKeypair.publicKey,
          type: "ProgrammableConfigV1",
          delegate: collectionAuthority,
          updateAuthority: collectionAuthority,
        }),
        metadataProgram: metaplex.programs().getTokenMetadata().address,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([admin, tokenMintKeypair])
      .rpc({ skipPreflight: true });

    let tokenMetadata = await metaplex
      .nfts()
      .findByMint({ mintAddress: tokenMintKeypair.publicKey });
    expect(tokenMetadata.collection.address.toString()).to.equal(
      collectionMintKeypair.publicKey.toString()
    );
    expect(tokenMetadata.collection.verified).to.equal(true);

    let tokenState = await program.account.tokenState.fetch(tokenStateKey);
    expect(tokenState.config.toString()).to.equal(configKey.toString());
    expect(tokenState.tokenMint.toString()).to.equal(
      tokenMintKeypair.publicKey.toString()
    );
    expect(tokenState.deposited.toString()).to.equal("0");

    const bidStateKey = getBidStateKey(
      collectionMintKeypair.publicKey,
      tokenMintKeypair.publicKey,
      holder.publicKey
    );
    await program.methods
      .createBid()
      .accounts({
        depositor: holder.publicKey,
        config: configKey,
        collectionAuthority,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .rpc({ skipPreflight: true });

    let bidState = await program.account.bidState.fetch(bidStateKey);
    expect(bidState.tokenState.toString()).to.equal(tokenStateKey.toString());
    expect(bidState.depositor.toString()).to.equal(holder.publicKey.toString());
    expect(bidState.amount.toString()).to.equal("0");

    const depositedAmount = new BN(10);
    await program.methods
      .updateDeposit(depositedAmount)
      .accounts({
        depositor: holder.publicKey,
        config: configKey,
        collectionAuthority,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
        taxMint,
        depositorAccount: getAssociatedTokenAddressSync(
          taxMint,
          holder.publicKey,
          true
        ),
        depositAccount: getAssociatedTokenAddressSync(
          taxMint,
          collectionAuthority,
          true
        ),
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([holder])
      .rpc({ skipPreflight: true });

    bidState = await program.account.bidState.fetch(bidStateKey);
    expect(bidState.tokenState.toString()).to.equal(tokenStateKey.toString());
    expect(bidState.depositor.toString()).to.equal(holder.publicKey.toString());
    expect(bidState.amount.toString()).to.equal(depositedAmount.toString());
  });
});

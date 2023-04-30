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
  getCollectionAuthorityKey,
  getConfigKey,
  getDepositStateKey,
  getTokenStateKey,
} from "../sdk/src";

import { HarbergerNft } from "../target/types/harberger_nft";
import { Metaplex } from "@metaplex-foundation/js";
import { Program } from "@coral-xyz/anchor";
import { generateSeededKeypair } from "./utils";

const suiteName = "harberger-nft";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const metaplex = new Metaplex(connection);
  anchor.setProvider(provider);

  const program = anchor.workspace.HarbergerNft as Program<HarbergerNft>;
  let users: Keypair[];
  let taxMint: PublicKey;

  before(async () => {
    users = await Promise.all(
      Array(3)
        .fill(0)
        .map(async (_, i) => {
          const kp = Keypair.fromSeed(
            anchor.utils.bytes.utf8
              .encode(anchor.utils.sha256.hash(`${suiteName}+${i}`))
              .slice(0, 32)
          );

          await connection.confirmTransaction(
            await connection.requestAirdrop(kp.publicKey, 10 * LAMPORTS_PER_SOL)
          );

          return kp;
        })
    );

    taxMint = await createMint(
      connection,
      users[0],
      users[0].publicKey,
      users[0].publicKey,
      6
    );

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

  it("Is initialized!", async () => {
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

    await program.methods
      .createCollection(price)
      .accounts({
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
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([adminMintKeypair, collectionMintKeypair])
      .rpc({ skipPreflight: true });

    console.log(await program.account.collectionConfig.fetch(configKey));

    const tokenMintKeypair = generateSeededKeypair(`${suiteName}+token-1`);
    const tokenStateKey = getTokenStateKey(
      collectionMintKeypair.publicKey,
      tokenMintKeypair.publicKey
    );

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
        metadataProgram: metaplex.programs().getTokenMetadata().address,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([admin, tokenMintKeypair])
      .rpc({ skipPreflight: true });

    console.log(await program.account.tokenState.fetch(tokenStateKey));

    const depositState = getDepositStateKey(
      collectionMintKeypair.publicKey,
      tokenMintKeypair.publicKey,
      holder.publicKey
    );
    await program.methods
      .createDepositAccount()
      .accounts({
        depositor: holder.publicKey,
        config: configKey,
        collectionAuthority,
        tokenState: tokenStateKey,
        depositState,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .rpc({ skipPreflight: true });
  });
});

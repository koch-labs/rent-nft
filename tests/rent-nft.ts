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
import { RentNft } from "../target/types/rent_nft";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Program } from "@coral-xyz/anchor";
import {
  createTokenAuthorizationRules,
  generateSeededKeypair,
  sleep,
} from "./utils";

import { expect } from "chai";
import { createPassRuleSet } from "../deps/metaplex-program-library/token-metadata/js/test/utils/programmable";
import {
  getRuleSetRevisionFromJson,
  serializeRuleSetRevision,
} from "@metaplex-foundation/mpl-token-auth-rules";

const suiteName = "rent-nft";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const metaplex = new Metaplex(connection);

  const program = anchor.workspace.RentNft as Program<RentNft>;
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

    const collectionMintKeypair = generateSeededKeypair(
      `${suiteName}+collection`
    );
    const price = new anchor.BN(10);
    const timePeriod = 2;
    const contestWindowSize = 10;
    const depositedAmount = new BN(100);
    const biddingRate = new anchor.BN(10);

    const configKey = getConfigKey(collectionMintKeypair.publicKey);
    const collectionAuthority = getCollectionAuthorityKey(
      collectionMintKeypair.publicKey
    );

    // const ruleSetKey = await createTokenAuthorizationRules(
    //   connection,
    //   admin,
    //   `${suiteName}+rules`,
    //   serializeRuleSetRevision(
    //     getRuleSetRevisionFromJson(
    //       JSON.stringify({
    //         libVersion: 2,
    //         name: "Program Owned Rule Set",
    //         owner: admin.publicKey.toString(),
    //         operations: {
    //           "Transfer:Holder": {
    //             type: "Any",
    //             rules: [
    //               {
    //                 type: "PubkeyMatch",
    //                 publicKey: "2PxKnBob4KBH2UWnrCmyYotXTaE6Zytaf29vHfWRbXio",
    //                 field: "Destination",
    //               },
    //               {
    //                 type: "PubkeyMatch",
    //                 publicKey: "",
    //                 field: "Source",
    //               },
    //             ],
    //           },
    //         },
    //       })
    //     )
    //   )
    // );

    // Mint collection
    await program.methods
      .createCollection(price, timePeriod, contestWindowSize)
      .accounts({
        config: configKey,
        taxMint,
        admin: admin.publicKey,
        adminCollectionAccount: getAssociatedTokenAddressSync(
          collectionMintKeypair.publicKey,
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
        metadataProgram: metaplex.programs().getTokenMetadata().address,
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([collectionMintKeypair])
      .rpc({ skipPreflight: true });

    let adminCollectionAccount = await connection.getTokenAccountBalance(
      getAssociatedTokenAddressSync(
        collectionMintKeypair.publicKey,
        admin.publicKey,
        true
      )
    );
    expect(adminCollectionAccount.value.amount.toString()).to.equal("1");

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
        adminCollectionAccount: getAssociatedTokenAddressSync(
          collectionMintKeypair.publicKey,
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
        tokenRecord: metaplex
          .nfts()
          .pdas()
          .tokenRecord({
            mint: tokenMintKeypair.publicKey,
            token: getAssociatedTokenAddressSync(
              tokenMintKeypair.publicKey,
              holder.publicKey,
              true
            ),
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
        bidder: holder.publicKey,
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
    expect(bidState.bidder.toString()).to.equal(holder.publicKey.toString());
    expect(bidState.amount.toString()).to.equal("0");

    await program.methods
      .updateDeposit(depositedAmount.mul(new BN(2)))
      .accounts({
        bidder: holder.publicKey,
        config: configKey,
        collectionAuthority,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
        taxMint,
        bidderAccount: getAssociatedTokenAddressSync(
          taxMint,
          holder.publicKey,
          true
        ),
        bidAccount: getAssociatedTokenAddressSync(
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
    expect(bidState.bidder.toString()).to.equal(holder.publicKey.toString());
    expect(bidState.amount.toString()).to.equal(
      depositedAmount.mul(new BN(2)).toString()
    );

    await program.methods
      .updateDeposit(depositedAmount.neg())
      .accounts({
        bidder: holder.publicKey,
        config: configKey,
        collectionAuthority,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
        taxMint,
        bidderAccount: getAssociatedTokenAddressSync(
          taxMint,
          holder.publicKey,
          true
        ),
        bidAccount: getAssociatedTokenAddressSync(
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
    expect(bidState.bidder.toString()).to.equal(holder.publicKey.toString());
    expect(bidState.amount.toString()).to.equal(depositedAmount.toString());

    let bidAccount = await connection.getTokenAccountBalance(
      getAssociatedTokenAddressSync(taxMint, collectionAuthority, true)
    );
    expect(bidAccount.value.amount).to.equal(depositedAmount.toString());

    console.log(await program.account.tokenState.fetch(tokenStateKey));
    // Start bidding
    await program.methods
      .updateTokenState()
      .accounts({
        collectionMint: collectionMintKeypair.publicKey,
        config: configKey,
        collectionAuthority,
        tokenState: tokenStateKey,
      })
      .rpc({ skipPreflight: true });

    console.log(await program.account.tokenState.fetch(tokenStateKey));
    console.log(await program.account.bidState.fetch(bidStateKey));

    await program.methods
      .updateBidState()
      .accounts({
        admin: admin.publicKey,
        collectionMint: collectionMintKeypair.publicKey,
        adminCollectionAccount: getAssociatedTokenAddressSync(
          collectionMintKeypair.publicKey,
          admin.publicKey,
          true
        ),
        config: configKey,
        collectionAuthority,
        taxMint,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
        bidAccount: getAssociatedTokenAddressSync(
          taxMint,
          collectionAuthority,
          true
        ),
        adminAccount: getAssociatedTokenAddressSync(
          taxMint,
          admin.publicKey,
          true
        ),
      })
      .rpc({ skipPreflight: true });
    await program.methods
      .setBiddingRate(biddingRate)
      .accounts({
        bidder: holder.publicKey,
        admin: admin.publicKey,
        collectionMint: collectionMintKeypair.publicKey,
        adminCollectionAccount: getAssociatedTokenAddressSync(
          collectionMintKeypair.publicKey,
          admin.publicKey,
          true
        ),
        config: configKey,
        collectionAuthority,
        taxMint,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
        bidAccount: getAssociatedTokenAddressSync(
          taxMint,
          collectionAuthority,
          true
        ),
        adminAccount: getAssociatedTokenAddressSync(
          taxMint,
          admin.publicKey,
          true
        ),
      })
      .signers([holder])
      .rpc({ skipPreflight: true });

    let newBidAccount = await connection.getTokenAccountBalance(
      getAssociatedTokenAddressSync(taxMint, collectionAuthority, true)
    );
    expect(newBidAccount.value.amount).to.equal(bidAccount.value.amount);

    tokenState = await program.account.tokenState.fetch(tokenStateKey);
    bidState = await program.account.bidState.fetch(bidStateKey);
    expect(bidState.biddingRate.toString()).to.equal(biddingRate.toString());
    expect(bidState.biddingPeriod.toString()).to.equal(
      tokenState.lastPeriod.toString()
    );

    console.log(bidState);

    await sleep(timePeriod * 2);
    await program.methods
      .setBiddingRate(new BN(0))
      .accounts({
        bidder: holder.publicKey,
        admin: admin.publicKey,
        collectionMint: collectionMintKeypair.publicKey,
        adminCollectionAccount: getAssociatedTokenAddressSync(
          collectionMintKeypair.publicKey,
          admin.publicKey,
          true
        ),
        config: configKey,
        collectionAuthority,
        taxMint,
        tokenState: tokenStateKey,
        bidState: bidStateKey,
        bidAccount: getAssociatedTokenAddressSync(
          taxMint,
          collectionAuthority,
          true
        ),
        adminAccount: getAssociatedTokenAddressSync(
          taxMint,
          admin.publicKey,
          true
        ),
      })
      .preInstructions([
        ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ])
      .signers([holder])
      .rpc({ skipPreflight: true });

    bidState = await program.account.bidState.fetch(bidStateKey);
    console.log(bidState);
    console.log(
      await connection.getTokenAccountBalance(
        getAssociatedTokenAddressSync(taxMint, collectionAuthority, true)
      )
    );

    expect(bidState.biddingRate.toString()).to.equal("0");
    expect(bidState.biddingPeriod.toString()).to.equal(
      tokenState.lastPeriod.toString()
    );
  });
});

import * as anchor from "@coral-xyz/anchor";

import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from "@solana/spl-token";
import {
  SHADOW_NFT_PROGRAM_ID,
  getCollectionAuthorityKey,
  getCollectionKey,
  getConfigKey,
} from "../sdk/src";

import { BN } from "bn.js";
import { ShadowNftStandard } from "../deps/shadow-nft-standard/target/types/shadow_nft_standard";
import shadowIdl from "../deps/shadow-nft-standard/target/idl/shadow_nft_standard.json";
import { RentNft } from "../target/types/rent_nft";
import { Program } from "@coral-xyz/anchor";
import { TestValues, createValues, generateSeededKeypair } from "./utils";

import { expect } from "chai";

const suiteName = "rent-nft";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.RentNft as Program<RentNft>;
  const programShadowNft = new Program<ShadowNftStandard>(
    shadowIdl as any,
    SHADOW_NFT_PROGRAM_ID,
    provider
  );
  let values: TestValues;

  before(async () => {
    values = createValues();

    await Promise.all(
      [values.admin].map(async (kp, i) => {
        await connection.confirmTransaction(
          await connection.requestAirdrop(kp.publicKey, 10 * LAMPORTS_PER_SOL)
        );
      })
    );

    await createMint(
      connection,
      values.admin,
      values.admin.publicKey,
      values.admin.publicKey,
      6,
      values.taxMintKeypair,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await createAssociatedTokenAccountIdempotent(
      connection,
      values.admin,
      values.taxMintKeypair.publicKey,
      values.admin.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await mintToChecked(
      connection,
      values.admin,
      values.taxMintKeypair.publicKey,
      values.adminTaxAccount,
      values.admin,
      10 ** 10,
      6,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await programShadowNft.methods
      .createGroup({
        name: values.creatorGroupName,
      })
      .accounts({
        creatorGroup: values.creatorGroupKey,
        creator: values.admin.publicKey,
      })
      .signers([values.admin])
      .rpc({ skipPreflight: true });
  });

  it("Mint collection", async () => {
    // Mint collection
    await program.methods
      .createCollection(
        values.collectionName,
        values.collectionSymbol,
        values.collectionPeriod
      )
      .accounts({
        config: values.configKey,
        admin: values.admin.publicKey,
        collectionAuthority: values.collectionAuthority,
        collection: values.collectionKey,
        metadataProgram: SHADOW_NFT_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true });

    let collectionConfig = await program.account.collectionConfig.fetch(
      values.configKey
    );
    expect(collectionConfig.collection.toString()).to.equal(
      values.collectionKey.toString()
    );
    expect(collectionConfig.taxMint.toString()).to.equal(
      values.taxMintKeypair.publicKey.toString()
    );

    // const tokenMintKeypair = generateSeededKeypair(`${suiteName}+token-1`);
    // const tokenStateKey = getTokenStateKey(
    //   collectionMintKeypair.publicKey,
    //   tokenMintKeypair.publicKey
    // );

    // // Mint a token
    // await program.methods
    //   .createToken()
    //   .accounts({
    //     config: configKey,
    //     receiver: holder.publicKey,
    //     admin: admin.publicKey,
    //     adminCollectionAccount: getAssociatedTokenAddressSync(
    //       collectionMintKeypair.publicKey,
    //       admin.publicKey,
    //       true
    //     ),
    //     collectionAuthority,
    //     collectionMint: collectionMintKeypair.publicKey,
    //     collectionMetadata: metaplex
    //       .nfts()
    //       .pdas()
    //       .metadata({ mint: collectionMintKeypair.publicKey }),
    //     collectionMasterEdition: metaplex
    //       .nfts()
    //       .pdas()
    //       .masterEdition({ mint: collectionMintKeypair.publicKey }),
    //     tokenState: tokenStateKey,
    //     tokenMint: tokenMintKeypair.publicKey,
    //     tokenMetadata: metaplex
    //       .nfts()
    //       .pdas()
    //       .metadata({ mint: tokenMintKeypair.publicKey }),
    //     tokenMasterEdition: metaplex
    //       .nfts()
    //       .pdas()
    //       .masterEdition({ mint: tokenMintKeypair.publicKey }),
    //     tokenAccount: getAssociatedTokenAddressSync(
    //       tokenMintKeypair.publicKey,
    //       holder.publicKey,
    //       true
    //     ),
    //     delegateRecord: metaplex.nfts().pdas().metadataDelegateRecord({
    //       mint: tokenMintKeypair.publicKey,
    //       type: "ProgrammableConfigV1",
    //       delegate: collectionAuthority,
    //       updateAuthority: collectionAuthority,
    //     }),
    //     tokenRecord: metaplex
    //       .nfts()
    //       .pdas()
    //       .tokenRecord({
    //         mint: tokenMintKeypair.publicKey,
    //         token: getAssociatedTokenAddressSync(
    //           tokenMintKeypair.publicKey,
    //           holder.publicKey,
    //           true
    //         ),
    //       }),
    //     metadataProgram: metaplex.programs().getTokenMetadata().address,
    //   })
    //   .preInstructions([
    //     ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    //   ])
    //   .signers([admin, tokenMintKeypair])
    //   .rpc({ skipPreflight: true });

    // let tokenMetadata = await metaplex
    //   .nfts()
    //   .findByMint({ mintAddress: tokenMintKeypair.publicKey });
    // expect(tokenMetadata.collection.address.toString()).to.equal(
    //   collectionMintKeypair.publicKey.toString()
    // );
    // expect(tokenMetadata.collection.verified).to.equal(true);

    // let tokenState = await program.account.tokenState.fetch(tokenStateKey);
    // expect(tokenState.config.toString()).to.equal(configKey.toString());
    // expect(tokenState.tokenMint.toString()).to.equal(
    //   tokenMintKeypair.publicKey.toString()
    // );
    // expect(tokenState.deposited.toString()).to.equal("0");

    // const bidStateKey = getBidStateKey(
    //   collectionMintKeypair.publicKey,
    //   tokenMintKeypair.publicKey,
    //   holder.publicKey
    // );
    // await program.methods
    //   .createBid()
    //   .accounts({
    //     bidder: holder.publicKey,
    //     config: configKey,
    //     collectionAuthority,
    //     tokenState: tokenStateKey,
    //     bidState: bidStateKey,
    //   })
    //   .preInstructions([
    //     ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    //   ])
    //   .rpc({ skipPreflight: true });

    // let bidState = await program.account.bidState.fetch(bidStateKey);
    // expect(bidState.tokenState.toString()).to.equal(tokenStateKey.toString());
    // expect(bidState.bidder.toString()).to.equal(holder.publicKey.toString());
    // expect(bidState.amount.toString()).to.equal("0");

    // await program.methods
    //   .updateDeposit(depositedAmount.mul(new BN(2)))
    //   .accounts({
    //     bidder: holder.publicKey,
    //     config: configKey,
    //     collectionAuthority,
    //     tokenState: tokenStateKey,
    //     bidState: bidStateKey,
    //     taxMint,
    //     bidderAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       holder.publicKey,
    //       true
    //     ),
    //     bidAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       collectionAuthority,
    //       true
    //     ),
    //   })
    //   .preInstructions([
    //     ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    //   ])
    //   .signers([holder])
    //   .rpc({ skipPreflight: true });

    // bidState = await program.account.bidState.fetch(bidStateKey);
    // expect(bidState.tokenState.toString()).to.equal(tokenStateKey.toString());
    // expect(bidState.bidder.toString()).to.equal(holder.publicKey.toString());
    // expect(bidState.amount.toString()).to.equal(
    //   depositedAmount.mul(new BN(2)).toString()
    // );

    // await program.methods
    //   .updateDeposit(depositedAmount.neg())
    //   .accounts({
    //     bidder: holder.publicKey,
    //     config: configKey,
    //     collectionAuthority,
    //     tokenState: tokenStateKey,
    //     bidState: bidStateKey,
    //     taxMint,
    //     bidderAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       holder.publicKey,
    //       true
    //     ),
    //     bidAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       collectionAuthority,
    //       true
    //     ),
    //   })
    //   .preInstructions([
    //     ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    //   ])
    //   .signers([holder])
    //   .rpc({ skipPreflight: true });

    // bidState = await program.account.bidState.fetch(bidStateKey);
    // expect(bidState.tokenState.toString()).to.equal(tokenStateKey.toString());
    // expect(bidState.bidder.toString()).to.equal(holder.publicKey.toString());
    // expect(bidState.amount.toString()).to.equal(depositedAmount.toString());

    // let bidAccount = await connection.getTokenAccountBalance(
    //   getAssociatedTokenAddressSync(taxMint, collectionAuthority, true)
    // );
    // expect(bidAccount.value.amount).to.equal(depositedAmount.toString());

    // console.log(await program.account.tokenState.fetch(tokenStateKey));
    // // Start bidding
    // await program.methods
    //   .updateTokenState()
    //   .accounts({
    //     collectionMint: collectionMintKeypair.publicKey,
    //     config: configKey,
    //     collectionAuthority,
    //     tokenState: tokenStateKey,
    //   })
    //   .rpc({ skipPreflight: true });

    // console.log(await program.account.tokenState.fetch(tokenStateKey));
    // console.log(await program.account.bidState.fetch(bidStateKey));

    // await program.methods
    //   .updateBidState()
    //   .accounts({
    //     admin: admin.publicKey,
    //     collectionMint: collectionMintKeypair.publicKey,
    //     adminCollectionAccount: getAssociatedTokenAddressSync(
    //       collectionMintKeypair.publicKey,
    //       admin.publicKey,
    //       true
    //     ),
    //     config: configKey,
    //     collectionAuthority,
    //     taxMint,
    //     tokenState: tokenStateKey,
    //     bidState: bidStateKey,
    //     bidAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       collectionAuthority,
    //       true
    //     ),
    //     adminAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       admin.publicKey,
    //       true
    //     ),
    //   })
    //   .rpc({ skipPreflight: true });
    // await program.methods
    //   .setBiddingRate(biddingRate)
    //   .accounts({
    //     bidder: holder.publicKey,
    //     admin: admin.publicKey,
    //     collectionMint: collectionMintKeypair.publicKey,
    //     adminCollectionAccount: getAssociatedTokenAddressSync(
    //       collectionMintKeypair.publicKey,
    //       admin.publicKey,
    //       true
    //     ),
    //     config: configKey,
    //     collectionAuthority,
    //     taxMint,
    //     tokenState: tokenStateKey,
    //     bidState: bidStateKey,
    //     bidAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       collectionAuthority,
    //       true
    //     ),
    //     adminAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       admin.publicKey,
    //       true
    //     ),
    //   })
    //   .signers([holder])
    //   .rpc({ skipPreflight: true });

    // let newBidAccount = await connection.getTokenAccountBalance(
    //   getAssociatedTokenAddressSync(taxMint, collectionAuthority, true)
    // );
    // expect(newBidAccount.value.amount).to.equal(bidAccount.value.amount);

    // tokenState = await program.account.tokenState.fetch(tokenStateKey);
    // bidState = await program.account.bidState.fetch(bidStateKey);
    // expect(bidState.biddingRate.toString()).to.equal(biddingRate.toString());
    // expect(bidState.biddingPeriod.toString()).to.equal(
    //   tokenState.lastPeriod.toString()
    // );

    // console.log(bidState);

    // await sleep(timePeriod * 2);
    // await program.methods
    //   .setBiddingRate(new BN(0))
    //   .accounts({
    //     bidder: holder.publicKey,
    //     admin: admin.publicKey,
    //     collectionMint: collectionMintKeypair.publicKey,
    //     adminCollectionAccount: getAssociatedTokenAddressSync(
    //       collectionMintKeypair.publicKey,
    //       admin.publicKey,
    //       true
    //     ),
    //     config: configKey,
    //     collectionAuthority,
    //     taxMint,
    //     tokenState: tokenStateKey,
    //     bidState: bidStateKey,
    //     bidAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       collectionAuthority,
    //       true
    //     ),
    //     adminAccount: getAssociatedTokenAddressSync(
    //       taxMint,
    //       admin.publicKey,
    //       true
    //     ),
    //   })
    //   .preInstructions([
    //     ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
    //   ])
    //   .signers([holder])
    //   .rpc({ skipPreflight: true });

    // bidState = await program.account.bidState.fetch(bidStateKey);
    // console.log(bidState);
    // console.log(
    //   await connection.getTokenAccountBalance(
    //     getAssociatedTokenAddressSync(taxMint, collectionAuthority, true)
    //   )
    // );

    // expect(bidState.biddingRate.toString()).to.equal("0");
    // expect(bidState.biddingPeriod.toString()).to.equal(
    //   tokenState.lastPeriod.toString()
    // );
  });
});

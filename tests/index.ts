import * as anchor from "@coral-xyz/anchor";

import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  createMint,
  mintToChecked,
  getMintLen,
  ExtensionType,
  createInitializeMintInstruction,
  createInitializePermanentDelegateInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import {
  NFT_STANDARD_PROGRAM_ID,
  fetchMetadata,
  getInclusionKey,
} from "@koch-labs/nft-standard";

import { RentNft } from "../target/types/rent_nft";
import { TestValues, createValues } from "./values";

import { expect } from "chai";

const suiteName = "rent-nft";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.RentNft as Program<RentNft>;
  let values: TestValues;

  before(async () => {
    values = createValues();

    await Promise.all(
      [values.admin, values.holder, values.bidder].map(async (kp, i) => {
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
    await createAssociatedTokenAccountIdempotent(
      connection,
      values.admin,
      values.taxMintKeypair.publicKey,
      values.holder.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    await createAssociatedTokenAccountIdempotent(
      connection,
      values.admin,
      values.taxMintKeypair.publicKey,
      values.bidder.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    await mintToChecked(
      connection,
      values.admin,
      values.taxMintKeypair.publicKey,
      values.holderTaxAccount,
      values.admin,
      10 ** 10,
      6,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    await mintToChecked(
      connection,
      values.admin,
      values.taxMintKeypair.publicKey,
      values.bidderTaxAccount,
      values.admin,
      10 ** 10,
      6,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  });

  it("Mint collection", async () => {
    // Mint collection
    await program.methods
      .createCollection(
        values.authoritiesGroupId,
        values.collectionData,
        values.collectionPeriod,
        values.collectionRate
      )
      .accounts({
        config: values.configKey,
        admin: values.admin.publicKey,
        taxMint: values.taxMintKeypair.publicKey,
        authoritiesGroup: values.authoritiesGroupKey,
        collectionAuthority: values.collectionAuthority,
        collectionMint: values.collectionMintKeypair.publicKey,
        collectionMetadata: values.collectionMetadata,
        adminCollectionMintAccount: values.adminCollectionMintAccount,
        metadataProgram: NFT_STANDARD_PROGRAM_ID,
        taxTokenProgram: TOKEN_2022_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([values.admin, values.collectionMintKeypair])
      .rpc({ skipPreflight: true });

    let collectionConfig = await program.account.collectionConfig.fetch(
      values.configKey
    );
    expect(collectionConfig.collectionMint.toString()).to.equal(
      values.collectionMintKeypair.publicKey.toString()
    );
    expect(collectionConfig.taxMint.toString()).to.equal(
      values.taxMintKeypair.publicKey.toString()
    );

    let collectionMetadata = await fetchMetadata(
      provider,
      values.collectionMintKeypair.publicKey
    );
    expect(collectionMetadata.mint.toString()).to.equal(
      values.collectionMintKeypair.publicKey.toString()
    );

    const uri = "ijsiodfjsodifjo";
    // Mint a token
    await program.methods
      .createToken(uri)
      .accounts({
        config: values.configKey,
        receiver: values.holder.publicKey,
        admin: values.admin.publicKey,
        authoritiesGroup: values.authoritiesGroupKey,
        collectionAuthority: values.collectionAuthority,
        collectionMint: values.collectionMintKeypair.publicKey,
        collectionMetadata: values.collectionMetadata,
        tokenMint: values.tokenMintKeypair.publicKey,
        tokenState: values.tokenStateKey,
        tokenMetadata: values.tokenMetadata,
        inclusion: getInclusionKey(
          values.collectionMintKeypair.publicKey,
          values.tokenMintKeypair.publicKey
        ),
        tokenAccount: values.tokenMintAccount,
        adminCollectionMintAccount: values.adminCollectionMintAccount,
        metadataProgram: NFT_STANDARD_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([values.admin, values.tokenMintKeypair])
      .rpc({ skipPreflight: true });

    let tokenMetadata = await fetchMetadata(
      provider,
      values.tokenMintKeypair.publicKey
    );
    expect(tokenMetadata.mint.toString()).to.equal(
      values.tokenMintKeypair.publicKey.toString()
    );
    let tokenState = await program.account.tokenState.fetch(
      values.tokenStateKey
    );
    expect(tokenState.config.toString()).to.equal(values.configKey.toString());
    expect(tokenState.tokenMint.toString()).to.equal(
      values.tokenMintKeypair.publicKey.toString()
    );
    expect(tokenState.deposited.toString()).to.equal("0");

    await program.methods
      .createBid()
      .accounts({
        bidder: values.bidder.publicKey,
        config: values.configKey,
        collectionAuthority: values.collectionAuthority,
        tokenState: values.tokenStateKey,
        bidState: values.bidderBidStateKey,
      })
      .rpc({ skipPreflight: true });

    let bidState = await program.account.bidState.fetch(
      values.bidderBidStateKey
    );
    expect(bidState.tokenState.toString()).to.equal(
      values.tokenStateKey.toString()
    );
    expect(bidState.bidder.toString()).to.equal(
      values.bidder.publicKey.toString()
    );
    expect(bidState.amount.toString()).to.equal("0");

    // await program.methods
    //   .updateDeposit(values.depositedAmount.mul(new anchor.BN(2)))
    //   .accounts({
    //     bidder: values.bidder.publicKey,
    //     config: values.configKey,
    //     collectionAuthority: values.collectionAuthority,
    //     tokenState: values.tokenStateKey,
    //     bidState: values.bidderBidStateKey,
    //     taxMint: values.taxMintKeypair.publicKey,
    //     bidderAccount: values.bidderAccount,
    //     bidAccount: values.bidAccount,
    //     tokenProgram: TOKEN_2022_PROGRAM_ID,
    //   })
    //   .signers([values.bidder])
    //   .rpc({ skipPreflight: true });

    // bidState = await program.account.bidState.fetch(values.bidderBidStateKey);
    // expect(bidState.tokenState.toString()).to.equal(
    //   values.tokenStateKey.toString()
    // );
    // expect(bidState.bidder.toString()).to.equal(
    //   values.bidder.publicKey.toString()
    // );
    // expect(bidState.amount.toString()).to.equal(
    //   values.depositedAmount.mul(new anchor.BN(2)).toString()
    // );

    // await program.methods
    //   .updateDeposit(values.depositedAmount.neg())
    //   .accounts({
    //     bidder: values.bidder.publicKey,
    //     config: values.configKey,
    //     collectionAuthority: values.collectionAuthority,
    //     tokenState: values.tokenStateKey,
    //     bidState: values.bidderBidStateKey,
    //     taxMint: values.taxMintKeypair.publicKey,
    //     bidderAccount: values.bidderAccount,
    //     bidAccount: values.bidAccount,
    //     tokenProgram: TOKEN_2022_PROGRAM_ID,
    //   })
    //   .signers([values.bidder])
    //   .rpc({ skipPreflight: true });

    // bidState = await program.account.bidState.fetch(values.bidderBidStateKey);
    // expect(bidState.tokenState.toString()).to.equal(
    //   values.tokenStateKey.toString()
    // );
    // expect(bidState.bidder.toString()).to.equal(
    //   values.bidder.publicKey.toString()
    // );
    // expect(bidState.amount.toString()).to.equal(
    //   values.depositedAmount.toString()
    // );

    // let bidAccount = await connection.getTokenAccountBalance(values.bidAccount);
    // expect(bidAccount.value.amount).to.equal(values.depositedAmount.toString());

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
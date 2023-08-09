import * as anchor from "@coral-xyz/anchor";

import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  createInitializeMint2Instruction,
  createMint,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  mintToChecked,
} from "@solana/spl-token";
import { SHADOW_NFT_PROGRAM_ID } from "../../sdk/src";

import { IDL as standardIdl, ShadowNftStandard } from "../standard-idl";
import { RentNft } from "../../target/types/rent_nft";
import { Program } from "@coral-xyz/anchor";
import { TestValues, createValues } from "../utils";

import { expect } from "chai";

const suiteName = "nft-standard";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.RentNft as Program<RentNft>;
  const programShadowNft = new Program<ShadowNftStandard>(
    standardIdl as any,
    SHADOW_NFT_PROGRAM_ID,
    provider
  );
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

  it("Mint collection", async () => {});
});

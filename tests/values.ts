import * as anchor from "@coral-xyz/anchor";

import { Keypair, PublicKey } from "@solana/web3.js";
import { getBidStateKey, getConfigKey, getTokenStateKey } from "../sdk/src";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  getAuthoritiesGroupKey,
  getMetadataKey,
  MetadataData,
  createExternalMetadataData,
} from "@koch-labs/metadata-standard";

export interface TestValues {
  admin: Keypair;
  adminTaxAccount: PublicKey;
  holder: Keypair;
  holderTaxAccount: PublicKey;
  bidder: Keypair;
  bidderTaxAccount: PublicKey;
  taxMintKeypair: Keypair;
  authoritiesGroupId: PublicKey;
  authoritiesGroupKey: PublicKey;
  collectionPeriod: number;
  collectionRate: anchor.BN;
  collectionMinimumPrice: anchor.BN;
  collectionName: string;
  collectionData: MetadataData;
  collectionMetadata: PublicKey;
  collectionMintKeypair: Keypair;
  configKey: PublicKey;
  tokenMintKeypair: Keypair;
  holderTokenMintAccount: PublicKey;
  bidderTokenMintAccount: PublicKey;
  adminTokenMintAccount: PublicKey;
  adminCollectionMintAccount: PublicKey;
  tokenMetadata: PublicKey;
  tokenStateKey: PublicKey;
  holderBidStateKey: PublicKey;
  bidderBidStateKey: PublicKey;
  bidAccount: PublicKey;
  depositedAmount: anchor.BN;
  newTokenPrice: anchor.BN;
}

export const createValues = (): TestValues => {
  const admin = Keypair.generate();
  const holder = Keypair.generate();
  const bidder = Keypair.generate();
  const taxMintKeypair = Keypair.generate();
  const adminTaxAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    admin.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const holderTaxAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    holder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const bidderTaxAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    bidder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const authoritiesGroupId = Keypair.generate().publicKey;
  const authoritiesGroupKey = getAuthoritiesGroupKey(authoritiesGroupId);
  const collectionMintKeypair = Keypair.generate();
  const collectionMetadata = getMetadataKey(collectionMintKeypair.publicKey);
  const collectionData = createExternalMetadataData("okokokkok");
  const collectionName = "name collection";
  const collectionRate = new anchor.BN(10000 * 365 * 8640); // 1/10 of price per second
  const collectionPeriod = 2;
  const collectionMinimumPrice = new anchor.BN(100);
  const configKey = getConfigKey(collectionMintKeypair.publicKey);
  const tokenMintKeypair = Keypair.generate();
  const holderTokenMintAccount = getAssociatedTokenAddressSync(
    tokenMintKeypair.publicKey,
    holder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const bidderTokenMintAccount = getAssociatedTokenAddressSync(
    tokenMintKeypair.publicKey,
    bidder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const adminCollectionMintAccount = getAssociatedTokenAddressSync(
    collectionMintKeypair.publicKey,
    admin.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const adminTokenMintAccount = getAssociatedTokenAddressSync(
    tokenMintKeypair.publicKey,
    admin.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const tokenMetadata = getMetadataKey(tokenMintKeypair.publicKey);
  const tokenStateKey = getTokenStateKey(
    collectionMintKeypair.publicKey,
    tokenMintKeypair.publicKey
  );
  const holderBidStateKey = getBidStateKey(
    collectionMintKeypair.publicKey,
    tokenMintKeypair.publicKey,
    holder.publicKey
  );
  const bidderBidStateKey = getBidStateKey(
    collectionMintKeypair.publicKey,
    tokenMintKeypair.publicKey,
    bidder.publicKey
  );
  const bidAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    configKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const depositedAmount = new anchor.BN(10000);
  const newTokenPrice = new anchor.BN(200);
  return {
    admin,
    holder,
    bidder,
    adminTaxAccount,
    holderTaxAccount,
    bidderTaxAccount,
    taxMintKeypair,
    authoritiesGroupId,
    authoritiesGroupKey,
    collectionName,
    collectionData,
    collectionMetadata,
    collectionMintKeypair,
    collectionPeriod,
    collectionRate,
    collectionMinimumPrice,
    configKey,
    tokenMintKeypair,
    holderTokenMintAccount,
    bidderTokenMintAccount,
    adminCollectionMintAccount,
    adminTokenMintAccount,
    tokenMetadata,
    tokenStateKey,
    holderBidStateKey,
    bidderBidStateKey,
    bidAccount,
    depositedAmount,
    newTokenPrice,
  };
};

import * as anchor from "@coral-xyz/anchor";

import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  getBidStateKey,
  getCollectionAuthorityKey,
  getCollectionKey,
  getConfigKey,
  getCreatorGroupKey,
  getMetadataKey,
  getTokenStateKey,
} from "../sdk/src";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

export async function sleep(seconds: number) {
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export const generateSeededKeypair = (seed: string) => {
  return Keypair.fromSeed(
    anchor.utils.bytes.utf8.encode(anchor.utils.sha256.hash(seed)).slice(0, 32)
  );
};

export interface TestValues {
  admin: Keypair;
  adminTaxAccount: PublicKey;
  holder: Keypair;
  holderTaxAccount: PublicKey;
  taxMintKeypair: Keypair;
  creators: PublicKey[];
  creatorGroupName: string;
  creatorGroupKey: PublicKey;
  collectionName: string;
  collectionSymbol: string;
  collectionPeriod: number;
  collectionKey: PublicKey;
  collectionAuthority: PublicKey;
  configKey: PublicKey;
  tokenMintKeypair: Keypair;
  tokenMintAccount: PublicKey;
  adminTokenMintAccount: PublicKey;
  tokenMetadata: PublicKey;
  tokenStateKey: PublicKey;
  bidStateKey: PublicKey;
  depositedAmount: anchor.BN;
  biddingRate: anchor.BN;
}

export const createValues = (): TestValues => {
  const admin = Keypair.generate();
  const holder = Keypair.generate();
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
  const creatorGroupName = "Harbies";
  const creators = [admin].map((e) => e.publicKey);
  const creatorGroupKey = getCreatorGroupKey(creators);
  const collectionName = "Harbies";
  const collectionSymbol = "HRB";
  const collectionKey = getCollectionKey(creatorGroupKey, collectionName);
  const collectionAuthority = getCollectionAuthorityKey(collectionKey);
  const collectionPeriod = 2;
  const configKey = getConfigKey(collectionKey);
  const tokenMintKeypair = Keypair.generate();
  const tokenMintAccount = getAssociatedTokenAddressSync(
    tokenMintKeypair.publicKey,
    holder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_PROGRAM_ID
  );
  const adminTokenMintAccount = getAssociatedTokenAddressSync(
    tokenMintKeypair.publicKey,
    admin.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_PROGRAM_ID
  );
  const tokenMetadata = getMetadataKey(tokenMintKeypair.publicKey);
  const tokenStateKey = getTokenStateKey(
    collectionKey,
    tokenMintKeypair.publicKey
  );
  const bidStateKey = getBidStateKey(
    collectionKey,
    tokenMintKeypair.publicKey,
    holder.publicKey
  );
  const depositedAmount = new anchor.BN(100);
  const biddingRate = new anchor.BN(10);
  return {
    admin,
    holder,
    adminTaxAccount,
    holderTaxAccount,
    taxMintKeypair,
    creators,
    creatorGroupName,
    creatorGroupKey,
    collectionName,
    collectionSymbol,
    collectionKey,
    collectionPeriod,
    collectionAuthority,
    configKey,
    tokenMintKeypair,
    tokenMintAccount,
    adminTokenMintAccount,
    tokenMetadata,
    tokenStateKey,
    bidStateKey,
    depositedAmount,
    biddingRate,
  };
};

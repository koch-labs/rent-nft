import * as anchor from "@coral-xyz/anchor";

import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  getCollectionAuthorityKey,
  getCollectionKey,
  getConfigKey,
  getCreatorGroupKey,
} from "../sdk/src";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

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
  depositedAmount: anchor.BN;
  biddingRate: anchor.BN;
}

export const createValues = (): TestValues => {
  const admin = Keypair.generate();
  const taxMintKeypair = Keypair.generate();
  const adminTaxAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    admin.publicKey,
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
  const depositedAmount = new anchor.BN(100);
  const biddingRate = new anchor.BN(10);
  const configKey = getConfigKey(collectionKey);
  return {
    admin,
    adminTaxAccount,
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
    depositedAmount,
    biddingRate,
  };
};

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
} from "../../sdk/src";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

export interface TestValues {
  admin: Keypair;
  adminTaxAccount: PublicKey;
  holder: Keypair;
  holderTaxAccount: PublicKey;
  bidder: Keypair;
  bidderTaxAccount: PublicKey;
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
  holderBidStateKey: PublicKey;
  bidderBidStateKey: PublicKey;
  bidAccount: PublicKey;
  bidderAccount: PublicKey;
  depositedAmount: anchor.BN;
  biddingRate: anchor.BN;
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
  const holderBidStateKey = getBidStateKey(
    collectionKey,
    tokenMintKeypair.publicKey,
    holder.publicKey
  );
  const bidderBidStateKey = getBidStateKey(
    collectionKey,
    tokenMintKeypair.publicKey,
    bidder.publicKey
  );
  const bidderAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    holder.publicKey,
    true
  );
  const bidAccount = getAssociatedTokenAddressSync(
    taxMintKeypair.publicKey,
    collectionAuthority,
    true
  );
  const depositedAmount = new anchor.BN(100);
  const biddingRate = new anchor.BN(10);
  return {
    admin,
    holder,
    bidder,
    adminTaxAccount,
    holderTaxAccount,
    bidderTaxAccount,
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
    holderBidStateKey,
    bidderBidStateKey,
    bidAccount,
    bidderAccount,
    depositedAmount,
    biddingRate,
  };
};

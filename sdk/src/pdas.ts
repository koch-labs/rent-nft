import {
  COLLECTION_AUTHORITY_SEED,
  DEPOSITS_SEED,
  RENT_NFT_PROGRAM_ID,
  TREASURY_SEED,
} from "./constants";

import { PublicKey } from "@solana/web3.js";

// Rent NFT PDAs
export const getDepositsKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer(), Buffer.from(DEPOSITS_SEED)],
    RENT_NFT_PROGRAM_ID
  )[0];
};
export const getTreasuryKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer(), Buffer.from(TREASURY_SEED)],
    RENT_NFT_PROGRAM_ID
  )[0];
};
export const getCollectionAuthorityKey = (collectionMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer(), Buffer.from(COLLECTION_AUTHORITY_SEED)],
    RENT_NFT_PROGRAM_ID
  )[0];
};
export const getConfigKey = (collectionMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer()],
    RENT_NFT_PROGRAM_ID
  )[0];
};
export const getTokenStateKey = (
  collection: PublicKey,
  tokenMint: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [collection.toBuffer(), tokenMint.toBuffer()],
    RENT_NFT_PROGRAM_ID
  )[0];
};
export const getBidStateKey = (
  collectionMint: PublicKey,
  tokenMint: PublicKey,
  depositor: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer(), tokenMint.toBuffer(), depositor.toBuffer()],
    RENT_NFT_PROGRAM_ID
  )[0];
};

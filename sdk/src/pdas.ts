import {
  COLLECTION_AUTHORITY_SEED,
  DEPOSITS_SEED,
  HARBERGER_PROGRAM_ID,
  TREASURY_SEED,
} from "./constants";

import { PublicKey } from "@solana/web3.js";

export const getDepositsKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer(), Buffer.from(DEPOSITS_SEED)],
    HARBERGER_PROGRAM_ID
  )[0];
};
export const getTreasuryKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer(), Buffer.from(TREASURY_SEED)],
    HARBERGER_PROGRAM_ID
  )[0];
};
export const getCollectionAuthorityKey = (collectionMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer(), Buffer.from(COLLECTION_AUTHORITY_SEED)],
    HARBERGER_PROGRAM_ID
  )[0];
};
export const getConfigKey = (collectionMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer()],
    HARBERGER_PROGRAM_ID
  )[0];
};
export const getTokenStateKey = (
  collectionMint: PublicKey,
  tokenMint: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer(), tokenMint.toBuffer()],
    HARBERGER_PROGRAM_ID
  )[0];
};

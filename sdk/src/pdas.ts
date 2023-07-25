import crypto from "crypto";
import { utils } from "@coral-xyz/anchor";
import {
  COLLECTION_AUTHORITY_SEED,
  DEPOSITS_SEED,
  RENT_NFT_PROGRAM_ID,
  SHADOW_NFT_PROGRAM_ID,
  TREASURY_SEED,
} from "./constants";

import { PublicKey } from "@solana/web3.js";

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
  collectionMint: PublicKey,
  tokenMint: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [collectionMint.toBuffer(), tokenMint.toBuffer()],
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

// Shadow PDAs
export const getCreatorGroupKey = (creators: PublicKey[]) => {
  const hasher = crypto.createHash("sha256");
  for (const c of creators) {
    hasher.update(c.toBuffer());
  }
  const digest = hasher.digest("hex");

  return PublicKey.findProgramAddressSync(
    [utils.bytes.hex.decode(digest)],
    SHADOW_NFT_PROGRAM_ID
  )[0];
};
export const getCollectionKey = (
  creatorGroup: PublicKey,
  collectionName: string
) => {
  return PublicKey.findProgramAddressSync(
    [creatorGroup.toBuffer(), Buffer.from(collectionName)],
    SHADOW_NFT_PROGRAM_ID
  )[0];
};
export const getMetadataKey = (assetMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [assetMint.toBuffer()],
    SHADOW_NFT_PROGRAM_ID
  )[0];
};

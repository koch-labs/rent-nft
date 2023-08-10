import * as anchor from "@coral-xyz/anchor";

import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAuthoritiesGroupKey,
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
  transferAuthority: Keypair;
  updateAuthority: Keypair;
  inclusionAuthority: Keypair;
  authoritiesGroupId: PublicKey;
  authoritiesGroupKey: PublicKey;
  holder: Keypair;
  creators: PublicKey[];
  creatorGroupName: string;
  creatorGroupKey: PublicKey;
  collectionName: string;
  collectionSymbol: string;
  collectionPeriod: number;
  collectionKey: PublicKey;
  collectionAuthority: PublicKey;
  tokenMetadata: PublicKey;
}

export const createValues = (): TestValues => {
  const admin = Keypair.generate();
  const transferAuthority = Keypair.generate();
  const updateAuthority = Keypair.generate();
  const inclusionAuthority = Keypair.generate();
  const authoritiesGroupId = Keypair.generate().publicKey;
  const authoritiesGroupKey = getAuthoritiesGroupKey(authoritiesGroupId);
  const holder = Keypair.generate();
  const creatorGroupName = "Harbies";
  const creators = [admin].map((e) => e.publicKey);
  const creatorGroupKey = getCreatorGroupKey(creators);
  const collectionName = "Harbies";
  const collectionSymbol = "HRB";
  const collectionKey = getCollectionKey(creatorGroupKey, collectionName);
  const collectionAuthority = getCollectionAuthorityKey(collectionKey);
  const collectionPeriod = 2;
  const tokenMintKeypair = Keypair.generate();
  const tokenMetadata = getMetadataKey(tokenMintKeypair.publicKey);
  return {
    admin,
    transferAuthority,
    updateAuthority,
    inclusionAuthority,
    authoritiesGroupId,
    authoritiesGroupKey,
    holder,
    creators,
    creatorGroupName,
    creatorGroupKey,
    collectionName,
    collectionSymbol,
    collectionKey,
    collectionPeriod,
    collectionAuthority,
    tokenMetadata,
  };
};

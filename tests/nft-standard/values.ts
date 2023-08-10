import { Keypair, PublicKey } from "@solana/web3.js";
import {
  getAuthoritiesGroupKey,
  getCollectionAuthorityKey,
  getCollectionKey,
  getCreatorGroupKey,
  getMetadataKey,
} from "../../sdk/src";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  MetadataData,
  createExternalMetadataData,
} from "../../sdk/src/metadataData";

export interface TestValues {
  admin: Keypair;
  transferAuthority: Keypair;
  updateAuthority: Keypair;
  inclusionAuthority: Keypair;
  authoritiesGroupId: PublicKey;
  authoritiesGroupKey: PublicKey;
  mintKeypair: Keypair;
  metadataUri: string;
  metadataData: MetadataData;
  metadataKey: PublicKey;
  holder: Keypair;
  holderMintAccount: PublicKey;
  holderMintAccount2022: PublicKey;
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
  const mintKeypair = Keypair.generate();
  const metadataUri = "some uri";
  const metadataData = createExternalMetadataData("some uri");
  const metadataKey = getMetadataKey(mintKeypair.publicKey);
  const holder = Keypair.generate();
  const holderMintAccount = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    holder.publicKey,
    true,
    TOKEN_PROGRAM_ID
  );
  const holderMintAccount2022 = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
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
  const tokenMintKeypair = Keypair.generate();
  const tokenMetadata = getMetadataKey(tokenMintKeypair.publicKey);
  return {
    admin,
    transferAuthority,
    updateAuthority,
    inclusionAuthority,
    authoritiesGroupId,
    authoritiesGroupKey,
    mintKeypair,
    metadataUri,
    metadataData,
    metadataKey,
    holder,
    holderMintAccount,
    holderMintAccount2022,
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

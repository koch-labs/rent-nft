import { Keypair, PublicKey } from "@solana/web3.js";
import {
  getAuthoritiesGroupKey,
  getCollectionAuthorityKey,
  getCollectionKey,
  getCreatorGroupKey,
  getInclusionKey,
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
  parentAuthoritiesGroupId: PublicKey;
  parentAuthoritiesGroupKey: PublicKey;
  mintKeypair: Keypair;
  mintKeypair2022: Keypair;
  parentMintKeypair2022: Keypair;
  metadataUri: string;
  metadataData: MetadataData;
  metadataKey: PublicKey;
  metadata2022Key: PublicKey;
  parentMetadata2022Key: PublicKey;
  holder: Keypair;
  holderMintAccount: PublicKey;
  holderMintAccount2022: PublicKey;
  holderParentMintAccount2022: PublicKey;
  inclusionKey: PublicKey;
}

export const createValues = (): TestValues => {
  const admin = Keypair.generate();
  const transferAuthority = Keypair.generate();
  const updateAuthority = Keypair.generate();
  const inclusionAuthority = Keypair.generate();
  const authoritiesGroupId = Keypair.generate().publicKey;
  const authoritiesGroupKey = getAuthoritiesGroupKey(authoritiesGroupId);
  const parentAuthoritiesGroupId = Keypair.generate().publicKey;
  const parentAuthoritiesGroupKey = getAuthoritiesGroupKey(
    parentAuthoritiesGroupId
  );
  const mintKeypair = Keypair.generate();
  const mintKeypair2022 = Keypair.generate();
  const parentMintKeypair2022 = Keypair.generate();
  const metadataUri = "some uri";
  const metadataData = createExternalMetadataData("some uri");
  const metadataKey = getMetadataKey(mintKeypair.publicKey);
  const metadata2022Key = getMetadataKey(mintKeypair2022.publicKey);
  const parentMetadata2022Key = getMetadataKey(parentMintKeypair2022.publicKey);
  const holder = Keypair.generate();
  const holderMintAccount = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    holder.publicKey,
    true,
    TOKEN_PROGRAM_ID
  );
  const holderMintAccount2022 = getAssociatedTokenAddressSync(
    mintKeypair2022.publicKey,
    holder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const holderParentMintAccount2022 = getAssociatedTokenAddressSync(
    parentMintKeypair2022.publicKey,
    holder.publicKey,
    true,
    TOKEN_2022_PROGRAM_ID
  );
  const inclusionKey = getInclusionKey(
    parentMintKeypair2022.publicKey,
    mintKeypair2022.publicKey
  );
  return {
    admin,
    transferAuthority,
    updateAuthority,
    inclusionAuthority,
    authoritiesGroupId,
    authoritiesGroupKey,
    parentAuthoritiesGroupId,
    parentAuthoritiesGroupKey,
    mintKeypair,
    mintKeypair2022,
    parentMintKeypair2022,
    metadataUri,
    metadataData,
    metadataKey,
    metadata2022Key,
    parentMetadata2022Key,
    holder,
    holderMintAccount,
    holderMintAccount2022,
    holderParentMintAccount2022,
    inclusionKey,
  };
};

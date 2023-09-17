import { Program, Provider } from "@coral-xyz/anchor";
import { IDL, RentNft } from "./generated";
import { PROGRAM_ID } from "./generated/programId";
import { getConfigKey } from "./pdas";
import {
  METADATA_STANDARD_PROGRAM_ID,
  getMetadataKey,
} from "@koch-labs/metadata-standard";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const getProgram = (provider: Provider) => {
  return new Program<RentNft>(IDL as any, PROGRAM_ID, provider);
};

export default {
  createCollection: ({
    provider,
    taxMint,
    taxRate,
    minPrice,
    collectionMint,
    authoritiesGroup,
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods
        .createCollection(taxMint, taxRate, minPrice)
        .accounts({
          payer: provider.publicKey,
          admin: provider.publicKey,
          config,
          authoritiesGroup,
          collectionMint,
          collectionMetadata: getMetadataKey(collectionMint),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          metadataProgram: METADATA_STANDARD_PROGRAM_ID,
        }),
      config,
    };
  },
  createToken: ({
    provider,
    collectionMint,
    authoritiesGroup,
    uri,
    contentHash,
    name,
  }: {
    provider: Provider;
    collectionMint: PublicKey;
    authoritiesGroup: PublicKey;
    uri: string;
    contentHash: number[];
    name: string;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.createToken(uri, contentHash, name).accounts({
        payer: provider.publicKey,
        mintAuthority: provider.publicKey,
        config,
        authoritiesGroup,
        collectionMint,
        collectionMetadata: getMetadataKey(collectionMint),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        metadataProgram: METADATA_STANDARD_PROGRAM_ID,
      }),
      config,
    };
  },
};

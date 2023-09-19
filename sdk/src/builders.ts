import { BN, Program, Provider } from "@coral-xyz/anchor";
import { IDL, RentNft } from "./generated";
import { PROGRAM_ID } from "./generated/programId";
import { getBidStateKey, getConfigKey, getTokenStateKey } from "./pdas";
import {
  METADATA_STANDARD_PROGRAM_ID,
  getInclusionKey,
  getMetadataKey,
} from "@koch-labs/metadata-standard";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
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
    receiver = provider.publicKey,
    collectionMint,
    authoritiesGroup,
    tokenMint,
    uri,
    contentHash,
    name,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    receiver?: PublicKey;
    collectionMint: PublicKey;
    authoritiesGroup: PublicKey;
    tokenMint: PublicKey;
    uri: string;
    contentHash: number[];
    name: string;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.createToken(uri, contentHash, name).accounts({
        payer: provider.publicKey,
        receiver,
        mintAuthority: provider.publicKey,
        config,
        authoritiesGroup,
        collectionMint,
        collectionMetadata: getMetadataKey(collectionMint),
        tokenMint,
        tokenMetadata: getMetadataKey(tokenMint),
        inclusion: getInclusionKey(collectionMint, tokenMint),
        tokenAccount: getAssociatedTokenAddressSync(
          tokenMint,
          receiver,
          true,
          tokenProgram
        ),
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        tokenProgram,
        metadataProgram: METADATA_STANDARD_PROGRAM_ID,
      }),
      config,
    };
  },
  createBid: ({
    provider,
    bidder = provider.publicKey,
    collectionMint,
    authoritiesGroup,
    tokenMint,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    bidder?: PublicKey;
    collectionMint: PublicKey;
    authoritiesGroup: PublicKey;
    tokenMint: PublicKey;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.createBid().accounts({
        bidder,
        payer: provider.publicKey,
        config,
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        bidState: getBidStateKey(collectionMint, tokenMint, bidder),
      }),
      config,
      tokenMint,
      tokenProgram,
    };
  },
  increaseBid: ({
    provider,
    amount,
    taxMint,
    depositor = provider.publicKey,
    bidder = provider.publicKey,
    collectionMint,
    authoritiesGroup,
    tokenMint,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    amount: BN;
    taxMint: PublicKey;
    depositor?: PublicKey;
    bidder?: PublicKey;
    collectionMint: PublicKey;
    authoritiesGroup: PublicKey;
    tokenMint: PublicKey;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.increaseBid(amount).accounts({
        bidder,
        depositor,
        depositorAccount: getAssociatedTokenAddressSync(
          taxMint,
          depositor,
          true,
          tokenProgram
        ),
        bidsAccount: getAssociatedTokenAddressSync(
          taxMint,
          config,
          true,
          tokenProgram
        ),
        config,
        taxMint,
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        bidState: getBidStateKey(collectionMint, tokenMint, bidder),
        tokenProgram,
      }),
      config,
    };
  },
  decreaseBid: ({
    provider,
    amount,
    taxMint,
    bidder = provider.publicKey,
    collectionMint,
    authoritiesGroup,
    tokenMint,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    amount: BN;
    taxMint: PublicKey;
    depositor?: PublicKey;
    bidder?: PublicKey;
    collectionMint: PublicKey;
    authoritiesGroup: PublicKey;
    tokenMint: PublicKey;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.decreaseBid(amount).accounts({
        bidder,
        bidderAccount: getAssociatedTokenAddressSync(
          taxMint,
          bidder,
          true,
          tokenProgram
        ),
        bidsAccount: getAssociatedTokenAddressSync(
          taxMint,
          config,
          true,
          tokenProgram
        ),
        config,
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        bidState: getBidStateKey(collectionMint, tokenMint, bidder),
        taxMint,
        tokenProgram,
      }),
      config,
    };
  },
  updateBid: ({
    provider,
    bidder = provider.publicKey,
    collectionMint,
    tokenMint,
  }: {
    provider: Provider;
    bidder?: PublicKey;
    collectionMint: PublicKey;
    tokenMint: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.updateBid().accounts({
        config,
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        bidState: getBidStateKey(collectionMint, tokenMint, bidder),
      }),
      config,
    };
  },
  claimToken: ({
    provider,
    newSellPrice,
    oldOwner,
    newOwner = provider.publicKey,
    collectionMint,
    tokenMint,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    newSellPrice: BN;
    oldOwner: PublicKey;
    newOwner?: PublicKey;
    collectionMint: PublicKey;
    tokenMint: PublicKey;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.claimToken(newSellPrice).accounts({
        newOwner,
        config,
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        tokenMint,
        newOwnerTokenAccount: getAssociatedTokenAddressSync(
          tokenMint,
          newOwner,
          true,
          tokenProgram
        ),
        oldOwnerTokenAccount: getAssociatedTokenAddressSync(
          tokenMint,
          oldOwner,
          true,
          tokenProgram
        ),
        ownerBidState: getBidStateKey(collectionMint, tokenMint, newOwner),
        tokenProgram,
      }),
      config,
    };
  },
  buyToken: ({
    provider,
    newSellPrice,
    owner,
    buyer = provider.publicKey,
    collectionMint,
    tokenMint,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    newSellPrice: BN;
    owner: PublicKey;
    buyer?: PublicKey;
    collectionMint: PublicKey;
    tokenMint: PublicKey;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.buyToken(newSellPrice).accounts({
        owner,
        buyer,
        config,
        tokenState: getTokenStateKey(collectionMint, tokenMint),
        tokenMint,
        ownerTokenAccount: getAssociatedTokenAddressSync(
          tokenMint,
          owner,
          true,
          tokenProgram
        ),
        buyerTokenAccount: getAssociatedTokenAddressSync(
          tokenMint,
          buyer,
          true,
          tokenProgram
        ),
        ownerBidState: getBidStateKey(collectionMint, tokenMint, owner),
        buyerBidState: getBidStateKey(collectionMint, tokenMint, buyer),
        tokenProgram,
      }),
      config,
    };
  },
  withdrawTax: ({
    provider,
    admin = provider.publicKey,
    collectionMint,
    taxMint,
    tokenProgram = TOKEN_2022_PROGRAM_ID,
  }: {
    provider: Provider;
    admin?: PublicKey;
    collectionMint: PublicKey;
    taxMint: PublicKey;
    tokenProgram?: PublicKey;
  }) => {
    const program = getProgram(provider);
    const config = getConfigKey(collectionMint);
    return {
      builder: program.methods.withdrawTax().accounts({
        admin,
        config,
        collectionMint,
        mint: taxMint,
        adminAccount: getAssociatedTokenAddressSync(
          taxMint,
          admin,
          true,
          tokenProgram
        ),
        bidsAccount: getAssociatedTokenAddressSync(
          taxMint,
          config,
          true,
          tokenProgram
        ),
        taxTokenProgram: tokenProgram,
        tokenProgram,
      }),
      config,
    };
  },
};

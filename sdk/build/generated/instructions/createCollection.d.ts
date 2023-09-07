import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export interface CreateCollectionArgs {
    timePeriod: number;
    taxRate: BN;
    minPrice: BN;
}
export interface CreateCollectionAccounts {
    payer: PublicKey;
    admin: PublicKey;
    config: PublicKey;
    taxMint: PublicKey;
    authoritiesGroup: PublicKey;
    collectionMint: PublicKey;
    collectionMetadata: PublicKey;
    adminCollectionMintAccount: PublicKey;
    /** Common Solana programs */
    taxTokenProgram: PublicKey;
    tokenProgram: PublicKey;
    metadataProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
}
export declare const layout: any;
/**
 * Initializes a collection from an existing metadata
 * The metadata update authority will be transfered to the collection
 */
export declare function createCollection(args: CreateCollectionArgs, accounts: CreateCollectionAccounts, programId?: PublicKey): TransactionInstruction;

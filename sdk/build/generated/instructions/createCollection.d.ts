import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export interface CreateCollectionArgs {
    id: PublicKey;
    uri: string;
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
    associatedTokenProgram: PublicKey;
    metadataProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
}
export declare const layout: any;
export declare function createCollection(args: CreateCollectionArgs, accounts: CreateCollectionAccounts, programId?: PublicKey): TransactionInstruction;

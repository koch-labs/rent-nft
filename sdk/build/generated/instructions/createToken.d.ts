import { TransactionInstruction, PublicKey } from "@solana/web3.js";
export interface CreateTokenArgs {
    uri: string;
}
export interface CreateTokenAccounts {
    payer: PublicKey;
    admin: PublicKey;
    receiver: PublicKey;
    /** The config */
    config: PublicKey;
    collectionMint: PublicKey;
    adminCollectionMintAccount: PublicKey;
    collectionMetadata: PublicKey;
    authoritiesGroup: PublicKey;
    /** The mint of the new token */
    tokenMint: PublicKey;
    /** Metadata of the token */
    tokenMetadata: PublicKey;
    /** Proof of inclusion */
    inclusion: PublicKey;
    /** The account storing the new token */
    tokenAccount: PublicKey;
    /** The wrapper */
    tokenState: PublicKey;
    /** Common Solana programs */
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
    metadataProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
}
export declare const layout: any;
export declare function createToken(args: CreateTokenArgs, accounts: CreateTokenAccounts, programId?: PublicKey): TransactionInstruction;

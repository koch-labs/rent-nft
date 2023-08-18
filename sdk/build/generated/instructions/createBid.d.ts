import { TransactionInstruction, PublicKey } from "@solana/web3.js";
export interface CreateBidAccounts {
    payer: PublicKey;
    bidder: PublicKey;
    /** The config */
    config: PublicKey;
    /** The state for the token assessement */
    tokenState: PublicKey;
    bidState: PublicKey;
    /** Common Solana programs */
    systemProgram: PublicKey;
    rent: PublicKey;
}
export declare function createBid(accounts: CreateBidAccounts, programId?: PublicKey): TransactionInstruction;

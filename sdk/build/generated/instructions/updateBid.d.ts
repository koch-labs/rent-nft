import { TransactionInstruction, PublicKey } from "@solana/web3.js";
export interface UpdateBidAccounts {
    payer: PublicKey;
    /** The config */
    config: PublicKey;
    /** The state for the token assessement */
    tokenState: PublicKey;
    bidState: PublicKey;
}
export declare function updateBid(accounts: UpdateBidAccounts, programId?: PublicKey): TransactionInstruction;

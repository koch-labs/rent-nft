import { TransactionInstruction, PublicKey } from "@solana/web3.js";
export interface ClaimTokenAccounts {
    payer: PublicKey;
    newOwner: PublicKey;
    config: PublicKey;
    tokenState: PublicKey;
    /** The mint of the token */
    tokenMint: PublicKey;
    newOwnerTokenAccount: PublicKey;
    oldOwnerTokenAccount: PublicKey;
    ownerBidState: PublicKey;
    /** Common Solana programs */
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
}
export declare function claimToken(accounts: ClaimTokenAccounts, programId?: PublicKey): TransactionInstruction;

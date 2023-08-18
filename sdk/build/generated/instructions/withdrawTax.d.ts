import { TransactionInstruction, PublicKey } from "@solana/web3.js";
export interface WithdrawTaxAccounts {
    admin: PublicKey;
    /** The config */
    config: PublicKey;
    collectionMint: PublicKey;
    collectionMintAccount: PublicKey;
    /** The token used to pay taxes */
    taxMint: PublicKey;
    adminAccount: PublicKey;
    bidsAccount: PublicKey;
    /** Common Solana programs */
    tokenProgram: PublicKey;
    taxTokenProgram: PublicKey;
}
export declare function withdrawTax(accounts: WithdrawTaxAccounts, programId?: PublicKey): TransactionInstruction;

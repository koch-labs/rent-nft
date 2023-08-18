import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export interface IncreaseBidArgs {
    amount: BN;
}
export interface IncreaseBidAccounts {
    payer: PublicKey;
    bidder: PublicKey;
    /** The config */
    config: PublicKey;
    /** The token used to pay taxes */
    taxMint: PublicKey;
    /** The state for the token assessement */
    tokenState: PublicKey;
    bidState: PublicKey;
    bidderAccount: PublicKey;
    bidsAccount: PublicKey;
    /** Common Solana programs */
    tokenProgram: PublicKey;
}
export declare const layout: any;
export declare function increaseBid(args: IncreaseBidArgs, accounts: IncreaseBidAccounts, programId?: PublicKey): TransactionInstruction;

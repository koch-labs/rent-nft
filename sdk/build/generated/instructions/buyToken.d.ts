import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export interface BuyTokenArgs {
    newSellPrice: BN;
}
export interface BuyTokenAccounts {
    payer: PublicKey;
    owner: PublicKey;
    buyer: PublicKey;
    /** The config */
    config: PublicKey;
    /** The state for the token assessement */
    tokenState: PublicKey;
    /** The mint of the token */
    tokenMint: PublicKey;
    ownerTokenAccount: PublicKey;
    buyerTokenAccount: PublicKey;
    buyerBidState: PublicKey;
    ownerBidState: PublicKey;
    /** Common Solana programs */
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
}
export declare const layout: any;
export declare function buyToken(args: BuyTokenArgs, accounts: BuyTokenAccounts, programId?: PublicKey): TransactionInstruction;

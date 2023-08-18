/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
export interface TokenStateFields {
    /** The collection config */
    config: PublicKey;
    /** The mint of the token */
    tokenMint: PublicKey;
    ownerBidState: PublicKey | null;
    /** The sum of all deposits */
    deposited: BN;
    currentSellingPrice: BN;
}
export interface TokenStateJSON {
    /** The collection config */
    config: string;
    /** The mint of the token */
    tokenMint: string;
    ownerBidState: string | null;
    /** The sum of all deposits */
    deposited: string;
    currentSellingPrice: string;
}
export declare class TokenState {
    /** The collection config */
    readonly config: PublicKey;
    /** The mint of the token */
    readonly tokenMint: PublicKey;
    readonly ownerBidState: PublicKey | null;
    /** The sum of all deposits */
    readonly deposited: BN;
    readonly currentSellingPrice: BN;
    static readonly discriminator: Buffer;
    static readonly layout: any;
    constructor(fields: TokenStateFields);
    static fetch(c: Connection, address: PublicKey, programId?: PublicKey): Promise<TokenState | null>;
    static fetchMultiple(c: Connection, addresses: PublicKey[], programId?: PublicKey): Promise<Array<TokenState | null>>;
    static decode(data: Buffer): TokenState;
    toJSON(): TokenStateJSON;
    static fromJSON(obj: TokenStateJSON): TokenState;
}

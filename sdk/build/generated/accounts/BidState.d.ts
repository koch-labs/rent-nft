/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
export interface BidStateFields {
    /** The token state */
    tokenState: PublicKey;
    /** The owner of the deposit */
    bidder: PublicKey;
    /** Timestamp of the last update */
    lastUpdate: BN;
    /** The amount deposited */
    amount: BN;
    sellingPrice: BN;
}
export interface BidStateJSON {
    /** The token state */
    tokenState: string;
    /** The owner of the deposit */
    bidder: string;
    /** Timestamp of the last update */
    lastUpdate: string;
    /** The amount deposited */
    amount: string;
    sellingPrice: string;
}
export declare class BidState {
    /** The token state */
    readonly tokenState: PublicKey;
    /** The owner of the deposit */
    readonly bidder: PublicKey;
    /** Timestamp of the last update */
    readonly lastUpdate: BN;
    /** The amount deposited */
    readonly amount: BN;
    readonly sellingPrice: BN;
    static readonly discriminator: Buffer;
    static readonly layout: any;
    constructor(fields: BidStateFields);
    static fetch(c: Connection, address: PublicKey, programId?: PublicKey): Promise<BidState | null>;
    static fetchMultiple(c: Connection, addresses: PublicKey[], programId?: PublicKey): Promise<Array<BidState | null>>;
    static decode(data: Buffer): BidState;
    toJSON(): BidStateJSON;
    static fromJSON(obj: BidStateJSON): BidState;
}

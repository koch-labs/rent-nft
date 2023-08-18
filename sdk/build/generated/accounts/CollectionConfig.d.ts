/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
export interface CollectionConfigFields {
    /** The collection mint */
    collectionMint: PublicKey;
    /** The mint of the tax token */
    taxMint: PublicKey;
    /** Seconds in a time period */
    timePeriod: number;
    /** Basis points per year of tax on the selling price */
    taxRate: BN;
    minimumSellPrice: BN;
    collectedTax: BN;
}
export interface CollectionConfigJSON {
    /** The collection mint */
    collectionMint: string;
    /** The mint of the tax token */
    taxMint: string;
    /** Seconds in a time period */
    timePeriod: number;
    /** Basis points per year of tax on the selling price */
    taxRate: string;
    minimumSellPrice: string;
    collectedTax: string;
}
/**
 * A group contains all the parameters required to compute taxes.
 * It's used to save space in each token account.
 */
export declare class CollectionConfig {
    /** The collection mint */
    readonly collectionMint: PublicKey;
    /** The mint of the tax token */
    readonly taxMint: PublicKey;
    /** Seconds in a time period */
    readonly timePeriod: number;
    /** Basis points per year of tax on the selling price */
    readonly taxRate: BN;
    readonly minimumSellPrice: BN;
    readonly collectedTax: BN;
    static readonly discriminator: Buffer;
    static readonly layout: any;
    constructor(fields: CollectionConfigFields);
    static fetch(c: Connection, address: PublicKey, programId?: PublicKey): Promise<CollectionConfig | null>;
    static fetchMultiple(c: Connection, addresses: PublicKey[], programId?: PublicKey): Promise<Array<CollectionConfig | null>>;
    static decode(data: Buffer): CollectionConfig;
    toJSON(): CollectionConfigJSON;
    static fromJSON(obj: CollectionConfigJSON): CollectionConfig;
}

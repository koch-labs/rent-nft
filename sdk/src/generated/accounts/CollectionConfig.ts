import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CollectionConfigFields {
  /** The collection mint */
  collectionMint: PublicKey
  /** The mint of the tax token */
  taxMint: PublicKey
  /** Seconds in a time period */
  timePeriod: number
  /** Basis points per year of tax on the selling price */
  taxRate: BN
  minimumSellPrice: BN
  collectedTax: BN
}

export interface CollectionConfigJSON {
  /** The collection mint */
  collectionMint: string
  /** The mint of the tax token */
  taxMint: string
  /** Seconds in a time period */
  timePeriod: number
  /** Basis points per year of tax on the selling price */
  taxRate: string
  minimumSellPrice: string
  collectedTax: string
}

/**
 * A group contains all the parameters required to compute taxes.
 * It's used to save space in each token account.
 */
export class CollectionConfig {
  /** The collection mint */
  readonly collectionMint: PublicKey
  /** The mint of the tax token */
  readonly taxMint: PublicKey
  /** Seconds in a time period */
  readonly timePeriod: number
  /** Basis points per year of tax on the selling price */
  readonly taxRate: BN
  readonly minimumSellPrice: BN
  readonly collectedTax: BN

  static readonly discriminator = Buffer.from([
    223, 110, 152, 160, 174, 157, 106, 255,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("collectionMint"),
    borsh.publicKey("taxMint"),
    borsh.u32("timePeriod"),
    borsh.u64("taxRate"),
    borsh.u64("minimumSellPrice"),
    borsh.u64("collectedTax"),
  ])

  constructor(fields: CollectionConfigFields) {
    this.collectionMint = fields.collectionMint
    this.taxMint = fields.taxMint
    this.timePeriod = fields.timePeriod
    this.taxRate = fields.taxRate
    this.minimumSellPrice = fields.minimumSellPrice
    this.collectedTax = fields.collectedTax
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<CollectionConfig | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<CollectionConfig | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): CollectionConfig {
    if (!data.slice(0, 8).equals(CollectionConfig.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = CollectionConfig.layout.decode(data.slice(8))

    return new CollectionConfig({
      collectionMint: dec.collectionMint,
      taxMint: dec.taxMint,
      timePeriod: dec.timePeriod,
      taxRate: dec.taxRate,
      minimumSellPrice: dec.minimumSellPrice,
      collectedTax: dec.collectedTax,
    })
  }

  toJSON(): CollectionConfigJSON {
    return {
      collectionMint: this.collectionMint.toString(),
      taxMint: this.taxMint.toString(),
      timePeriod: this.timePeriod,
      taxRate: this.taxRate.toString(),
      minimumSellPrice: this.minimumSellPrice.toString(),
      collectedTax: this.collectedTax.toString(),
    }
  }

  static fromJSON(obj: CollectionConfigJSON): CollectionConfig {
    return new CollectionConfig({
      collectionMint: new PublicKey(obj.collectionMint),
      taxMint: new PublicKey(obj.taxMint),
      timePeriod: obj.timePeriod,
      taxRate: new BN(obj.taxRate),
      minimumSellPrice: new BN(obj.minimumSellPrice),
      collectedTax: new BN(obj.collectedTax),
    })
  }
}

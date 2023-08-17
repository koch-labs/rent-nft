import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface BidStateFields {
  /** The token state */
  tokenState: PublicKey
  /** The owner of the deposit */
  bidder: PublicKey
  /** Timestamp of the last update */
  lastUpdate: BN
  /** The amount deposited */
  amount: BN
  sellingPrice: BN
}

export interface BidStateJSON {
  /** The token state */
  tokenState: string
  /** The owner of the deposit */
  bidder: string
  /** Timestamp of the last update */
  lastUpdate: string
  /** The amount deposited */
  amount: string
  sellingPrice: string
}

export class BidState {
  /** The token state */
  readonly tokenState: PublicKey
  /** The owner of the deposit */
  readonly bidder: PublicKey
  /** Timestamp of the last update */
  readonly lastUpdate: BN
  /** The amount deposited */
  readonly amount: BN
  readonly sellingPrice: BN

  static readonly discriminator = Buffer.from([
    155, 197, 5, 97, 189, 60, 8, 183,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("tokenState"),
    borsh.publicKey("bidder"),
    borsh.i64("lastUpdate"),
    borsh.u64("amount"),
    borsh.u64("sellingPrice"),
  ])

  constructor(fields: BidStateFields) {
    this.tokenState = fields.tokenState
    this.bidder = fields.bidder
    this.lastUpdate = fields.lastUpdate
    this.amount = fields.amount
    this.sellingPrice = fields.sellingPrice
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<BidState | null> {
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
  ): Promise<Array<BidState | null>> {
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

  static decode(data: Buffer): BidState {
    if (!data.slice(0, 8).equals(BidState.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = BidState.layout.decode(data.slice(8))

    return new BidState({
      tokenState: dec.tokenState,
      bidder: dec.bidder,
      lastUpdate: dec.lastUpdate,
      amount: dec.amount,
      sellingPrice: dec.sellingPrice,
    })
  }

  toJSON(): BidStateJSON {
    return {
      tokenState: this.tokenState.toString(),
      bidder: this.bidder.toString(),
      lastUpdate: this.lastUpdate.toString(),
      amount: this.amount.toString(),
      sellingPrice: this.sellingPrice.toString(),
    }
  }

  static fromJSON(obj: BidStateJSON): BidState {
    return new BidState({
      tokenState: new PublicKey(obj.tokenState),
      bidder: new PublicKey(obj.bidder),
      lastUpdate: new BN(obj.lastUpdate),
      amount: new BN(obj.amount),
      sellingPrice: new BN(obj.sellingPrice),
    })
  }
}

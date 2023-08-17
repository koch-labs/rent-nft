import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface TokenStateFields {
  /** The collection config */
  config: PublicKey
  /** The mint of the token */
  tokenMint: PublicKey
  ownerBidState: PublicKey | null
  /** The sum of all deposits */
  deposited: BN
  currentSellingPrice: BN
}

export interface TokenStateJSON {
  /** The collection config */
  config: string
  /** The mint of the token */
  tokenMint: string
  ownerBidState: string | null
  /** The sum of all deposits */
  deposited: string
  currentSellingPrice: string
}

export class TokenState {
  /** The collection config */
  readonly config: PublicKey
  /** The mint of the token */
  readonly tokenMint: PublicKey
  readonly ownerBidState: PublicKey | null
  /** The sum of all deposits */
  readonly deposited: BN
  readonly currentSellingPrice: BN

  static readonly discriminator = Buffer.from([
    218, 112, 6, 149, 55, 186, 168, 163,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("config"),
    borsh.publicKey("tokenMint"),
    borsh.option(borsh.publicKey(), "ownerBidState"),
    borsh.u64("deposited"),
    borsh.u64("currentSellingPrice"),
  ])

  constructor(fields: TokenStateFields) {
    this.config = fields.config
    this.tokenMint = fields.tokenMint
    this.ownerBidState = fields.ownerBidState
    this.deposited = fields.deposited
    this.currentSellingPrice = fields.currentSellingPrice
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<TokenState | null> {
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
  ): Promise<Array<TokenState | null>> {
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

  static decode(data: Buffer): TokenState {
    if (!data.slice(0, 8).equals(TokenState.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = TokenState.layout.decode(data.slice(8))

    return new TokenState({
      config: dec.config,
      tokenMint: dec.tokenMint,
      ownerBidState: dec.ownerBidState,
      deposited: dec.deposited,
      currentSellingPrice: dec.currentSellingPrice,
    })
  }

  toJSON(): TokenStateJSON {
    return {
      config: this.config.toString(),
      tokenMint: this.tokenMint.toString(),
      ownerBidState:
        (this.ownerBidState && this.ownerBidState.toString()) || null,
      deposited: this.deposited.toString(),
      currentSellingPrice: this.currentSellingPrice.toString(),
    }
  }

  static fromJSON(obj: TokenStateJSON): TokenState {
    return new TokenState({
      config: new PublicKey(obj.config),
      tokenMint: new PublicKey(obj.tokenMint),
      ownerBidState:
        (obj.ownerBidState && new PublicKey(obj.ownerBidState)) || null,
      deposited: new BN(obj.deposited),
      currentSellingPrice: new BN(obj.currentSellingPrice),
    })
  }
}

import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateSellingPriceArgs {
  newSellPrice: BN
}

export interface UpdateSellingPriceAccounts {
  owner: PublicKey
  /** The config */
  config: PublicKey
  /** The state for the token assessement */
  tokenState: PublicKey
  ownerBidState: PublicKey
}

export const layout = borsh.struct([borsh.u64("newSellPrice")])

export function updateSellingPrice(
  args: UpdateSellingPriceArgs,
  accounts: UpdateSellingPriceAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.config, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: false },
    { pubkey: accounts.ownerBidState, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([58, 75, 43, 244, 100, 238, 130, 69])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      newSellPrice: args.newSellPrice,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

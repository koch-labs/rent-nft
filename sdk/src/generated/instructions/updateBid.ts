import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateBidAccounts {
  /** The config */
  config: PublicKey
  /** The state for the token assessement */
  tokenState: PublicKey
  bidState: PublicKey
}

export function updateBid(
  accounts: UpdateBidAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.config, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
    { pubkey: accounts.bidState, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([30, 24, 210, 187, 71, 101, 78, 46])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

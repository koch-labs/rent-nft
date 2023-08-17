import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateBidAccounts {
  payer: PublicKey
  bidder: PublicKey
  collectionAuthority: PublicKey
  /** The config */
  config: PublicKey
  /** The state for the token assessement */
  tokenState: PublicKey
  bidState: PublicKey
  /** Common Solana programs */
  systemProgram: PublicKey
  rent: PublicKey
}

export function createBid(
  accounts: CreateBidAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.bidder, isSigner: false, isWritable: false },
    { pubkey: accounts.collectionAuthority, isSigner: false, isWritable: true },
    { pubkey: accounts.config, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: false },
    { pubkey: accounts.bidState, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([234, 10, 213, 160, 52, 26, 91, 142])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

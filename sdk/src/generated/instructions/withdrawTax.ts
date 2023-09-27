import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface WithdrawTaxAccounts {
  admin: PublicKey
  /** The config */
  config: PublicKey
  collectionMint: PublicKey
  /** The token to withdraw */
  mint: PublicKey
  adminAccount: PublicKey
  bidsAccount: PublicKey
  /** Common Solana programs */
  taxTokenProgram: PublicKey
}

export function withdrawTax(
  accounts: WithdrawTaxAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.config, isSigner: false, isWritable: true },
    { pubkey: accounts.collectionMint, isSigner: false, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: true },
    { pubkey: accounts.adminAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.bidsAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.taxTokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([220, 150, 84, 199, 3, 29, 223, 96])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

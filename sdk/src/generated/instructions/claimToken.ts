import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ClaimTokenAccounts {
  newOwner: PublicKey
  config: PublicKey
  tokenState: PublicKey
  /** The mint of the token */
  tokenMint: PublicKey
  newOwnerTokenAccount: PublicKey
  oldOwnerTokenAccount: PublicKey
  ownerBidState: PublicKey
  /** Common Solana programs */
  tokenProgram: PublicKey
}

export function claimToken(
  accounts: ClaimTokenAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.newOwner, isSigner: true, isWritable: false },
    { pubkey: accounts.config, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
    {
      pubkey: accounts.newOwnerTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accounts.oldOwnerTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.ownerBidState, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([116, 206, 27, 191, 166, 19, 0, 73])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

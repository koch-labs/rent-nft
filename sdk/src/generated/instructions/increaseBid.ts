import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface IncreaseBidArgs {
  amount: BN
}

export interface IncreaseBidAccounts {
  payer: PublicKey
  bidder: PublicKey
  depositor: PublicKey
  /** The config */
  config: PublicKey
  /** The token used to pay taxes */
  taxMint: PublicKey
  /** The state for the token assessement */
  tokenState: PublicKey
  bidState: PublicKey
  depositorAccount: PublicKey
  bidsAccount: PublicKey
  /** Common Solana programs */
  tokenProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("amount")])

export function increaseBid(
  args: IncreaseBidArgs,
  accounts: IncreaseBidAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.bidder, isSigner: false, isWritable: false },
    { pubkey: accounts.depositor, isSigner: true, isWritable: false },
    { pubkey: accounts.config, isSigner: false, isWritable: false },
    { pubkey: accounts.taxMint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
    { pubkey: accounts.bidState, isSigner: false, isWritable: true },
    { pubkey: accounts.depositorAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.bidsAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([244, 160, 83, 58, 129, 198, 54, 135])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      amount: args.amount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

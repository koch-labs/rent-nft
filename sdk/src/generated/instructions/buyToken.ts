import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface BuyTokenArgs {
  newSellPrice: BN
}

export interface BuyTokenAccounts {
  payer: PublicKey
  owner: PublicKey
  buyer: PublicKey
  /** The config */
  config: PublicKey
  /** The state for the token assessement */
  tokenState: PublicKey
  /** The mint of the token */
  tokenMint: PublicKey
  ownerTokenAccount: PublicKey
  buyerTokenAccount: PublicKey
  buyerBidState: PublicKey
  ownerBidState: PublicKey
  /** Common Solana programs */
  tokenProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
}

export const layout = borsh.struct([borsh.u64("newSellPrice")])

export function buyToken(
  args: BuyTokenArgs,
  accounts: BuyTokenAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.owner, isSigner: false, isWritable: false },
    { pubkey: accounts.buyer, isSigner: true, isWritable: false },
    { pubkey: accounts.config, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
    { pubkey: accounts.ownerTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.buyerTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.buyerBidState, isSigner: false, isWritable: true },
    { pubkey: accounts.ownerBidState, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([138, 127, 14, 91, 38, 87, 115, 105])
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

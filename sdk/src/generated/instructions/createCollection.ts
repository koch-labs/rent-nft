import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateCollectionArgs {
  taxCollector: PublicKey
  timePeriod: number
  taxRate: BN
  minPrice: BN
}

export interface CreateCollectionAccounts {
  payer: PublicKey
  admin: PublicKey
  config: PublicKey
  taxMint: PublicKey
  authoritiesGroup: PublicKey
  collectionMint: PublicKey
  collectionMetadata: PublicKey
  /** Common Solana programs */
  taxTokenProgram: PublicKey
  tokenProgram: PublicKey
  metadataProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
}

export const layout = borsh.struct([
  borsh.publicKey("taxCollector"),
  borsh.u32("timePeriod"),
  borsh.u64("taxRate"),
  borsh.u64("minPrice"),
])

/**
 * Initializes a collection from an existing metadata
 * The metadata update authority will be transfered to the collection
 */
export function createCollection(
  args: CreateCollectionArgs,
  accounts: CreateCollectionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.config, isSigner: false, isWritable: true },
    { pubkey: accounts.taxMint, isSigner: false, isWritable: false },
    { pubkey: accounts.authoritiesGroup, isSigner: false, isWritable: true },
    { pubkey: accounts.collectionMint, isSigner: false, isWritable: true },
    { pubkey: accounts.collectionMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.taxTokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([156, 251, 92, 54, 233, 2, 16, 82])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      taxCollector: args.taxCollector,
      timePeriod: args.timePeriod,
      taxRate: args.taxRate,
      minPrice: args.minPrice,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

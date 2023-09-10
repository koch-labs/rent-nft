import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateCollectionArgs {
  timePeriod: number | null
  taxRate: BN | null
  minPrice: BN | null
  uri: string | null
  contentHash: Array<number> | null
  name: string | null
}

export interface UpdateCollectionAccounts {
  payer: PublicKey
  admin: PublicKey
  config: PublicKey
  authoritiesGroup: PublicKey
  collectionMint: PublicKey
  collectionMetadata: PublicKey
  /** Common Solana programs */
  tokenProgram: PublicKey
  metadataProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.option(borsh.u32(), "timePeriod"),
  borsh.option(borsh.u64(), "taxRate"),
  borsh.option(borsh.u64(), "minPrice"),
  borsh.option(borsh.str(), "uri"),
  borsh.option(borsh.array(borsh.u8(), 32), "contentHash"),
  borsh.option(borsh.str(), "name"),
])

export function updateCollection(
  args: UpdateCollectionArgs,
  accounts: UpdateCollectionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.config, isSigner: false, isWritable: true },
    { pubkey: accounts.authoritiesGroup, isSigner: false, isWritable: true },
    { pubkey: accounts.collectionMint, isSigner: false, isWritable: false },
    { pubkey: accounts.collectionMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([97, 70, 36, 49, 138, 12, 199, 239])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      timePeriod: args.timePeriod,
      taxRate: args.taxRate,
      minPrice: args.minPrice,
      uri: args.uri,
      contentHash: args.contentHash,
      name: args.name,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

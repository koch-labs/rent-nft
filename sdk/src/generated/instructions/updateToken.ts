import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateTokenArgs {
  uri: string | null
  contentHash: Array<number> | null
  name: string | null
}

export interface UpdateTokenAccounts {
  mintAuthority: PublicKey
  currentAuthority: PublicKey
  /** The config */
  config: PublicKey
  collectionMint: PublicKey
  collectionMetadata: PublicKey
  authoritiesGroup: PublicKey
  tokenMint: PublicKey
  tokenMetadata: PublicKey
  tokenState: PublicKey
  /** Common Solana programs */
  tokenProgram: PublicKey
  metadataProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.option(borsh.str(), "uri"),
  borsh.option(borsh.array(borsh.u8(), 32), "contentHash"),
  borsh.option(borsh.str(), "name"),
])

export function updateToken(
  args: UpdateTokenArgs,
  accounts: UpdateTokenAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.mintAuthority, isSigner: true, isWritable: true },
    { pubkey: accounts.currentAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.config, isSigner: false, isWritable: true },
    { pubkey: accounts.collectionMint, isSigner: false, isWritable: false },
    { pubkey: accounts.collectionMetadata, isSigner: false, isWritable: false },
    { pubkey: accounts.authoritiesGroup, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenMint, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([92, 200, 25, 239, 138, 254, 58, 102])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
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

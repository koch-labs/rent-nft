import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateTokenArgs {
  uri: string
}

export interface CreateTokenAccounts {
  payer: PublicKey
  admin: PublicKey
  receiver: PublicKey
  collectionAuthority: PublicKey
  /** The config */
  config: PublicKey
  collectionMint: PublicKey
  adminCollectionMintAccount: PublicKey
  collectionMetadata: PublicKey
  authoritiesGroup: PublicKey
  /** The mint of the new token */
  tokenMint: PublicKey
  /** Metadata of the token */
  tokenMetadata: PublicKey
  /** Proof of inclusion */
  inclusion: PublicKey
  /** The account storing the new token */
  tokenAccount: PublicKey
  /** The wrapper */
  tokenState: PublicKey
  /** Common Solana programs */
  tokenProgram: PublicKey
  associatedTokenProgram: PublicKey
  metadataProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
}

export const layout = borsh.struct([borsh.str("uri")])

export function createToken(
  args: CreateTokenArgs,
  accounts: CreateTokenAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.receiver, isSigner: false, isWritable: false },
    {
      pubkey: accounts.collectionAuthority,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.config, isSigner: false, isWritable: false },
    { pubkey: accounts.collectionMint, isSigner: false, isWritable: false },
    {
      pubkey: accounts.adminCollectionMintAccount,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.collectionMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.authoritiesGroup, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenMint, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.inclusion, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([84, 52, 204, 228, 24, 140, 234, 75])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      uri: args.uri,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}

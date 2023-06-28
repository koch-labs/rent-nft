import * as anchor from "@coral-xyz/anchor";

import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  PREFIX,
  PROGRAM_ID,
  createCreateOrUpdateInstruction,
} from "@metaplex-foundation/mpl-token-auth-rules";

export async function sleep(seconds: number) {
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export const generateSeededKeypair = (seed: string) => {
  return Keypair.fromSeed(
    anchor.utils.bytes.utf8.encode(anchor.utils.sha256.hash(seed)).slice(0, 32)
  );
};

export const findRuleSetPDA = (payer: PublicKey, name: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PREFIX), payer.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
};

export const createTokenAuthorizationRules = async (
  connection: Connection,
  payer: Keypair,
  name: string,
  data: Uint8Array
) => {
  const ruleSetAddress = await findRuleSetPDA(payer.publicKey, name);

  let createIX = createCreateOrUpdateInstruction(
    {
      payer: payer.publicKey,
      ruleSetPda: ruleSetAddress[0],
      systemProgram: SystemProgram.programId,
    },
    {
      createOrUpdateArgs: { __kind: "V1", serializedRuleSet: data },
    },
    PROGRAM_ID
  );

  const tx = new Transaction().add(createIX);

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer.publicKey;
  const sig = await connection.sendTransaction(tx, [payer]);
  await connection.confirmTransaction(sig, "finalized");
  return ruleSetAddress[0];
};

import * as anchor from "@coral-xyz/anchor";

import { Keypair } from "@solana/web3.js";

export const generateSeededKeypair = (seed: string) => {
  // HACK
  return Keypair.generate()
  return Keypair.fromSeed(
    anchor.utils.bytes.utf8.encode(anchor.utils.sha256.hash(seed)).slice(0, 32)
  );
};

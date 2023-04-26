import {
  DEPOSITS_SEED,
  HARBERGER_PROGRAM_ID,
  TREASURY_SEED,
} from "./constants";

import { PublicKey } from "@solana/web3.js";

export const getDepositsKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer(), Buffer.from(DEPOSITS_SEED)],
    HARBERGER_PROGRAM_ID
  )[0];
};
export const getTreasuryKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer(), Buffer.from(TREASURY_SEED)],
    HARBERGER_PROGRAM_ID
  )[0];
};
export const getGroupKey = (id: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [id.toBuffer()],
    HARBERGER_PROGRAM_ID
  )[0];
};

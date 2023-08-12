import { PublicKey } from "@solana/web3.js";
import { getInclusionBump } from "./pdas";

export const getPathBumpsFromMints = (mints: PublicKey[]) => {
  if (mints.length < 2) {
    throw new Error("Provided path is too short");
  }

  let res = [];
  for (let i = 0; i < mints.length - 1; i++) {
    res.push(getInclusionBump(mints[i], mints[i + 1]));
  }

  return Buffer.from(res);
};

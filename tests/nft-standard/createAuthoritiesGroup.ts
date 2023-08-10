import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";

import { TestValues, createValues } from "./values";
import { NftStandard } from "../../target/types/nft_standard";
import { expect } from "chai";

const suiteName = "Nft Standard: Create authorities group";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.NftStandard as Program<NftStandard>;
  let values: TestValues;

  before(async () => {
    values = createValues();

    await Promise.all(
      [
        values.admin,
        values.transferAuthority,
        values.updateAuthority,
        values.inclusionAuthority,
        values.holder,
      ].map(async (kp, i) => {
        await connection.confirmTransaction(
          await connection.requestAirdrop(kp.publicKey, 10 * LAMPORTS_PER_SOL)
        );
      })
    );
  });

  it("Create a group", async () => {
    await program.methods
      .createAuthoritiesGroup(
        values.authoritiesGroupId,
        values.transferAuthority.publicKey,
        values.updateAuthority.publicKey,
        values.inclusionAuthority.publicKey
      )
      .accounts({
        authoritiesGroup: values.authoritiesGroupKey,
      })
      .rpc({ skipPreflight: true });

    const authoritiesGroup = await program.account.authoritiesGroup.fetch(
      values.authoritiesGroupKey
    );

    expect(authoritiesGroup.id.toString()).to.equal(
      values.authoritiesGroupId.toString()
    );
    expect(authoritiesGroup.transferAuthority.toString()).to.equal(
      values.transferAuthority.publicKey.toString()
    );
    expect(authoritiesGroup.updateAuthority.toString()).to.equal(
      values.updateAuthority.publicKey.toString()
    );
    expect(authoritiesGroup.inclusionAuthority.toString()).to.equal(
      values.inclusionAuthority.publicKey.toString()
    );
  });
});

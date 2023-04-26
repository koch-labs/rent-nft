import * as anchor from "@coral-xyz/anchor";

import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  mintToChecked,
} from "@solana/spl-token";
import { getDepositsKey, getGroupKey, getTreasuryKey } from "../sdk/src";

import { HarbergerNft } from "../target/types/harberger_nft";
import { Program } from "@coral-xyz/anchor";

const suiteName = "harberger-nft";
describe(suiteName, () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.HarbergerNft as Program<HarbergerNft>;
  let users: Keypair[];
  let taxMint: PublicKey;

  before(async () => {
    users = await Promise.all(
      Array(3)
        .fill(0)
        .map(async (_, i) => {
          const kp = Keypair.fromSeed(
            anchor.utils.bytes.utf8
              .encode(anchor.utils.sha256.hash(`${suiteName}+${i}`))
              .slice(0, 32)
          );

          await connection.confirmTransaction(
            await connection.requestAirdrop(kp.publicKey, 10 * LAMPORTS_PER_SOL)
          );

          return kp;
        })
    );

    taxMint = await createMint(
      connection,
      users[0],
      users[0].publicKey,
      users[0].publicKey,
      6
    );

    await getOrCreateAssociatedTokenAccount(
      connection,
      users[1],
      taxMint,
      users[1].publicKey,
      true
    );

    await mintToChecked(
      connection,
      users[0],
      taxMint,
      getAssociatedTokenAddressSync(taxMint, users[1].publicKey, true),
      users[0],
      10 ** 10,
      6
    );
  });

  it("Is initialized!", async () => {
    const admin = users[0];
    const adminMintKeypair = Keypair.generate();

    const groupId = Keypair.fromSeed(
      anchor.utils.bytes.utf8
        .encode(anchor.utils.sha256.hash(`${suiteName}+group`))
        .slice(0, 32)
    ).publicKey;
    const price = new anchor.BN(10);

    const groupKey = getGroupKey(groupId);
    const depositsKey = getDepositsKey(groupId);
    const treasuryKey = getTreasuryKey(groupId);

    await program.methods
      .createConfig(groupId, price)
      .accounts({
        group: groupKey,
        deposits: depositsKey,
        treasury: treasuryKey,
        taxMint,
        depositsAccount: getAssociatedTokenAddressSync(
          taxMint,
          depositsKey,
          true
        ),
        treasuryAccount: getAssociatedTokenAddressSync(
          taxMint,
          treasuryKey,
          true
        ),
        admin: admin.publicKey,
        adminMint: adminMintKeypair.publicKey,
        adminAccount: getAssociatedTokenAddressSync(
          adminMintKeypair.publicKey,
          admin.publicKey,
          true
        ),
      })
      .signers([adminMintKeypair])
      .rpc({ skipPreflight: true });

    console.log(await program.account.harbergerGroup.fetch(groupKey));
  });
});

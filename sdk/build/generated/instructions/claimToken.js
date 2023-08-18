"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimToken = void 0;
const web3_js_1 = require("@solana/web3.js"); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
function claimToken(accounts, programId = programId_1.PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.payer, isSigner: true, isWritable: true },
        { pubkey: accounts.newOwner, isSigner: true, isWritable: false },
        { pubkey: accounts.config, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
        {
            pubkey: accounts.newOwnerTokenAccount,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: accounts.oldOwnerTokenAccount,
            isSigner: false,
            isWritable: true,
        },
        { pubkey: accounts.ownerBidState, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    ];
    const identifier = Buffer.from([116, 206, 27, 191, 166, 19, 0, 73]);
    const data = identifier;
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data });
    return ix;
}
exports.claimToken = claimToken;
//# sourceMappingURL=claimToken.js.map
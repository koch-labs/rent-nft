"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawTax = void 0;
const web3_js_1 = require("@solana/web3.js"); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
function withdrawTax(accounts, programId = programId_1.PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.admin, isSigner: true, isWritable: false },
        { pubkey: accounts.config, isSigner: false, isWritable: true },
        { pubkey: accounts.collectionMint, isSigner: false, isWritable: false },
        {
            pubkey: accounts.collectionMintAccount,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: accounts.taxMint, isSigner: false, isWritable: true },
        { pubkey: accounts.adminAccount, isSigner: false, isWritable: true },
        { pubkey: accounts.bidsAccount, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.taxTokenProgram, isSigner: false, isWritable: false },
    ];
    const identifier = Buffer.from([220, 150, 84, 199, 3, 29, 223, 96]);
    const data = identifier;
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data });
    return ix;
}
exports.withdrawTax = withdrawTax;
//# sourceMappingURL=withdrawTax.js.map
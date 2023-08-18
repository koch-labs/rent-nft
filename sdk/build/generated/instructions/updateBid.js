"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBid = void 0;
const web3_js_1 = require("@solana/web3.js"); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
function updateBid(accounts, programId = programId_1.PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.payer, isSigner: true, isWritable: true },
        { pubkey: accounts.config, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
        { pubkey: accounts.bidState, isSigner: false, isWritable: true },
    ];
    const identifier = Buffer.from([30, 24, 210, 187, 71, 101, 78, 46]);
    const data = identifier;
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data });
    return ix;
}
exports.updateBid = updateBid;
//# sourceMappingURL=updateBid.js.map
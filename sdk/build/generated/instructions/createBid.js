"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBid = void 0;
const web3_js_1 = require("@solana/web3.js"); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
function createBid(accounts, programId = programId_1.PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.payer, isSigner: true, isWritable: true },
        { pubkey: accounts.bidder, isSigner: false, isWritable: false },
        { pubkey: accounts.config, isSigner: false, isWritable: false },
        { pubkey: accounts.tokenState, isSigner: false, isWritable: false },
        { pubkey: accounts.bidState, isSigner: false, isWritable: true },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.rent, isSigner: false, isWritable: false },
    ];
    const identifier = Buffer.from([234, 10, 213, 160, 52, 26, 91, 142]);
    const data = identifier;
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data });
    return ix;
}
exports.createBid = createBid;
//# sourceMappingURL=createBid.js.map
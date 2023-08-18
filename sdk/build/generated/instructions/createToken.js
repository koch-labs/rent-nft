"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = exports.layout = void 0;
const web3_js_1 = require("@solana/web3.js"); // eslint-disable-line @typescript-eslint/no-unused-vars
const borsh = __importStar(require("@coral-xyz/borsh")); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
exports.layout = borsh.struct([borsh.str("uri")]);
function createToken(args, accounts, programId = programId_1.PROGRAM_ID) {
    const keys = [
        { pubkey: accounts.payer, isSigner: true, isWritable: true },
        { pubkey: accounts.admin, isSigner: true, isWritable: true },
        { pubkey: accounts.receiver, isSigner: false, isWritable: false },
        { pubkey: accounts.config, isSigner: false, isWritable: false },
        { pubkey: accounts.collectionMint, isSigner: false, isWritable: false },
        {
            pubkey: accounts.adminCollectionMintAccount,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: accounts.collectionMetadata, isSigner: false, isWritable: true },
        { pubkey: accounts.authoritiesGroup, isSigner: false, isWritable: false },
        { pubkey: accounts.tokenMint, isSigner: true, isWritable: true },
        { pubkey: accounts.tokenMetadata, isSigner: false, isWritable: true },
        { pubkey: accounts.inclusion, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenAccount, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenState, isSigner: false, isWritable: true },
        { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
        {
            pubkey: accounts.associatedTokenProgram,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
        { pubkey: accounts.rent, isSigner: false, isWritable: false },
    ];
    const identifier = Buffer.from([84, 52, 204, 228, 24, 140, 234, 75]);
    const buffer = Buffer.alloc(1000);
    const len = exports.layout.encode({
        uri: args.uri,
    }, buffer);
    const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
    const ix = new web3_js_1.TransactionInstruction({ keys, programId, data });
    return ix;
}
exports.createToken = createToken;
//# sourceMappingURL=createToken.js.map
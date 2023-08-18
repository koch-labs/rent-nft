"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBidStateKey = exports.getTokenStateKey = exports.getConfigKey = exports.getCollectionAuthorityKey = exports.getTreasuryKey = exports.getDepositsKey = void 0;
const constants_1 = require("./constants");
const web3_js_1 = require("@solana/web3.js");
// Rent NFT PDAs
const getDepositsKey = (id) => {
    return web3_js_1.PublicKey.findProgramAddressSync([id.toBuffer(), Buffer.from(constants_1.DEPOSITS_SEED)], constants_1.RENT_NFT_PROGRAM_ID)[0];
};
exports.getDepositsKey = getDepositsKey;
const getTreasuryKey = (id) => {
    return web3_js_1.PublicKey.findProgramAddressSync([id.toBuffer(), Buffer.from(constants_1.TREASURY_SEED)], constants_1.RENT_NFT_PROGRAM_ID)[0];
};
exports.getTreasuryKey = getTreasuryKey;
const getCollectionAuthorityKey = (collectionMint) => {
    return web3_js_1.PublicKey.findProgramAddressSync([collectionMint.toBuffer(), Buffer.from(constants_1.COLLECTION_AUTHORITY_SEED)], constants_1.RENT_NFT_PROGRAM_ID)[0];
};
exports.getCollectionAuthorityKey = getCollectionAuthorityKey;
const getConfigKey = (collectionMint) => {
    return web3_js_1.PublicKey.findProgramAddressSync([collectionMint.toBuffer()], constants_1.RENT_NFT_PROGRAM_ID)[0];
};
exports.getConfigKey = getConfigKey;
const getTokenStateKey = (collection, tokenMint) => {
    return web3_js_1.PublicKey.findProgramAddressSync([collection.toBuffer(), tokenMint.toBuffer()], constants_1.RENT_NFT_PROGRAM_ID)[0];
};
exports.getTokenStateKey = getTokenStateKey;
const getBidStateKey = (collectionMint, tokenMint, depositor) => {
    return web3_js_1.PublicKey.findProgramAddressSync([collectionMint.toBuffer(), tokenMint.toBuffer(), depositor.toBuffer()], constants_1.RENT_NFT_PROGRAM_ID)[0];
};
exports.getBidStateKey = getBidStateKey;
//# sourceMappingURL=pdas.js.map
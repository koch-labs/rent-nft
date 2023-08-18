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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenState = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js")); // eslint-disable-line @typescript-eslint/no-unused-vars
const borsh = __importStar(require("@coral-xyz/borsh")); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
class TokenState {
    constructor(fields) {
        this.config = fields.config;
        this.tokenMint = fields.tokenMint;
        this.ownerBidState = fields.ownerBidState;
        this.deposited = fields.deposited;
        this.currentSellingPrice = fields.currentSellingPrice;
    }
    static fetch(c, address, programId = programId_1.PROGRAM_ID) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield c.getAccountInfo(address);
            if (info === null) {
                return null;
            }
            if (!info.owner.equals(programId)) {
                throw new Error("account doesn't belong to this program");
            }
            return this.decode(info.data);
        });
    }
    static fetchMultiple(c, addresses, programId = programId_1.PROGRAM_ID) {
        return __awaiter(this, void 0, void 0, function* () {
            const infos = yield c.getMultipleAccountsInfo(addresses);
            return infos.map((info) => {
                if (info === null) {
                    return null;
                }
                if (!info.owner.equals(programId)) {
                    throw new Error("account doesn't belong to this program");
                }
                return this.decode(info.data);
            });
        });
    }
    static decode(data) {
        if (!data.slice(0, 8).equals(TokenState.discriminator)) {
            throw new Error("invalid account discriminator");
        }
        const dec = TokenState.layout.decode(data.slice(8));
        return new TokenState({
            config: dec.config,
            tokenMint: dec.tokenMint,
            ownerBidState: dec.ownerBidState,
            deposited: dec.deposited,
            currentSellingPrice: dec.currentSellingPrice,
        });
    }
    toJSON() {
        return {
            config: this.config.toString(),
            tokenMint: this.tokenMint.toString(),
            ownerBidState: (this.ownerBidState && this.ownerBidState.toString()) || null,
            deposited: this.deposited.toString(),
            currentSellingPrice: this.currentSellingPrice.toString(),
        };
    }
    static fromJSON(obj) {
        return new TokenState({
            config: new web3_js_1.PublicKey(obj.config),
            tokenMint: new web3_js_1.PublicKey(obj.tokenMint),
            ownerBidState: (obj.ownerBidState && new web3_js_1.PublicKey(obj.ownerBidState)) || null,
            deposited: new bn_js_1.default(obj.deposited),
            currentSellingPrice: new bn_js_1.default(obj.currentSellingPrice),
        });
    }
}
exports.TokenState = TokenState;
TokenState.discriminator = Buffer.from([
    218, 112, 6, 149, 55, 186, 168, 163,
]);
TokenState.layout = borsh.struct([
    borsh.publicKey("config"),
    borsh.publicKey("tokenMint"),
    borsh.option(borsh.publicKey(), "ownerBidState"),
    borsh.u64("deposited"),
    borsh.u64("currentSellingPrice"),
]);
//# sourceMappingURL=TokenState.js.map
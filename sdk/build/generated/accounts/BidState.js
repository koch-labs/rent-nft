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
exports.BidState = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js")); // eslint-disable-line @typescript-eslint/no-unused-vars
const borsh = __importStar(require("@coral-xyz/borsh")); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
class BidState {
    constructor(fields) {
        this.tokenState = fields.tokenState;
        this.bidder = fields.bidder;
        this.lastUpdate = fields.lastUpdate;
        this.amount = fields.amount;
        this.sellingPrice = fields.sellingPrice;
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
        if (!data.slice(0, 8).equals(BidState.discriminator)) {
            throw new Error("invalid account discriminator");
        }
        const dec = BidState.layout.decode(data.slice(8));
        return new BidState({
            tokenState: dec.tokenState,
            bidder: dec.bidder,
            lastUpdate: dec.lastUpdate,
            amount: dec.amount,
            sellingPrice: dec.sellingPrice,
        });
    }
    toJSON() {
        return {
            tokenState: this.tokenState.toString(),
            bidder: this.bidder.toString(),
            lastUpdate: this.lastUpdate.toString(),
            amount: this.amount.toString(),
            sellingPrice: this.sellingPrice.toString(),
        };
    }
    static fromJSON(obj) {
        return new BidState({
            tokenState: new web3_js_1.PublicKey(obj.tokenState),
            bidder: new web3_js_1.PublicKey(obj.bidder),
            lastUpdate: new bn_js_1.default(obj.lastUpdate),
            amount: new bn_js_1.default(obj.amount),
            sellingPrice: new bn_js_1.default(obj.sellingPrice),
        });
    }
}
exports.BidState = BidState;
BidState.discriminator = Buffer.from([
    155, 197, 5, 97, 189, 60, 8, 183,
]);
BidState.layout = borsh.struct([
    borsh.publicKey("tokenState"),
    borsh.publicKey("bidder"),
    borsh.i64("lastUpdate"),
    borsh.u64("amount"),
    borsh.u64("sellingPrice"),
]);
//# sourceMappingURL=BidState.js.map
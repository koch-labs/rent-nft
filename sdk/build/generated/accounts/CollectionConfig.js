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
exports.CollectionConfig = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js")); // eslint-disable-line @typescript-eslint/no-unused-vars
const borsh = __importStar(require("@coral-xyz/borsh")); // eslint-disable-line @typescript-eslint/no-unused-vars
const programId_1 = require("../programId");
/**
 * A group contains all the parameters required to compute taxes.
 * It's used to save space in each token account.
 */
class CollectionConfig {
    constructor(fields) {
        this.collectionMint = fields.collectionMint;
        this.taxMint = fields.taxMint;
        this.timePeriod = fields.timePeriod;
        this.taxRate = fields.taxRate;
        this.minimumSellPrice = fields.minimumSellPrice;
        this.collectedTax = fields.collectedTax;
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
        if (!data.slice(0, 8).equals(CollectionConfig.discriminator)) {
            throw new Error("invalid account discriminator");
        }
        const dec = CollectionConfig.layout.decode(data.slice(8));
        return new CollectionConfig({
            collectionMint: dec.collectionMint,
            taxMint: dec.taxMint,
            timePeriod: dec.timePeriod,
            taxRate: dec.taxRate,
            minimumSellPrice: dec.minimumSellPrice,
            collectedTax: dec.collectedTax,
        });
    }
    toJSON() {
        return {
            collectionMint: this.collectionMint.toString(),
            taxMint: this.taxMint.toString(),
            timePeriod: this.timePeriod,
            taxRate: this.taxRate.toString(),
            minimumSellPrice: this.minimumSellPrice.toString(),
            collectedTax: this.collectedTax.toString(),
        };
    }
    static fromJSON(obj) {
        return new CollectionConfig({
            collectionMint: new web3_js_1.PublicKey(obj.collectionMint),
            taxMint: new web3_js_1.PublicKey(obj.taxMint),
            timePeriod: obj.timePeriod,
            taxRate: new bn_js_1.default(obj.taxRate),
            minimumSellPrice: new bn_js_1.default(obj.minimumSellPrice),
            collectedTax: new bn_js_1.default(obj.collectedTax),
        });
    }
}
exports.CollectionConfig = CollectionConfig;
CollectionConfig.discriminator = Buffer.from([
    223, 110, 152, 160, 174, 157, 106, 255,
]);
CollectionConfig.layout = borsh.struct([
    borsh.publicKey("collectionMint"),
    borsh.publicKey("taxMint"),
    borsh.u32("timePeriod"),
    borsh.u64("taxRate"),
    borsh.u64("minimumSellPrice"),
    borsh.u64("collectedTax"),
]);
//# sourceMappingURL=CollectionConfig.js.map
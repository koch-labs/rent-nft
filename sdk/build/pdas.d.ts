import { PublicKey } from "@solana/web3.js";
export declare const getDepositsKey: (id: PublicKey) => PublicKey;
export declare const getTreasuryKey: (id: PublicKey) => PublicKey;
export declare const getCollectionAuthorityKey: (collectionMint: PublicKey) => PublicKey;
export declare const getConfigKey: (collectionMint: PublicKey) => PublicKey;
export declare const getTokenStateKey: (collection: PublicKey, tokenMint: PublicKey) => PublicKey;
export declare const getBidStateKey: (collectionMint: PublicKey, tokenMint: PublicKey, depositor: PublicKey) => PublicKey;

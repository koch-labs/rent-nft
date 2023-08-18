export type CustomError = NotAdmin | InvalidTokenStatePeriod | InvalidBidStatePeriod | BadPreviousOwner | NotEnoughDeposited | OutOfDateBid | InsufficientBid;
export declare class NotAdmin extends Error {
    readonly logs?: string[];
    static readonly code = 6000;
    readonly code = 6000;
    readonly name = "NotAdmin";
    readonly msg = "Not the admin";
    constructor(logs?: string[]);
}
export declare class InvalidTokenStatePeriod extends Error {
    readonly logs?: string[];
    static readonly code = 6001;
    readonly code = 6001;
    readonly name = "InvalidTokenStatePeriod";
    readonly msg = "Invalid token state period";
    constructor(logs?: string[]);
}
export declare class InvalidBidStatePeriod extends Error {
    readonly logs?: string[];
    static readonly code = 6002;
    readonly code = 6002;
    readonly name = "InvalidBidStatePeriod";
    readonly msg = "Invalid bid state period";
    constructor(logs?: string[]);
}
export declare class BadPreviousOwner extends Error {
    readonly logs?: string[];
    static readonly code = 6003;
    readonly code = 6003;
    readonly name = "BadPreviousOwner";
    readonly msg = "Invalid owner bid state passed";
    constructor(logs?: string[]);
}
export declare class NotEnoughDeposited extends Error {
    readonly logs?: string[];
    static readonly code = 6004;
    readonly code = 6004;
    readonly name = "NotEnoughDeposited";
    readonly msg = "Owner bid state does not have enough deposited, token should return to minimum price";
    constructor(logs?: string[]);
}
export declare class OutOfDateBid extends Error {
    readonly logs?: string[];
    static readonly code = 6005;
    readonly code = 6005;
    readonly name = "OutOfDateBid";
    readonly msg = "Owner bid state needs to be updated";
    constructor(logs?: string[]);
}
export declare class InsufficientBid extends Error {
    readonly logs?: string[];
    static readonly code = 6006;
    readonly code = 6006;
    readonly name = "InsufficientBid";
    readonly msg = "Needs a bigger amount to bid";
    constructor(logs?: string[]);
}
export declare function fromCode(code: number, logs?: string[]): CustomError | null;

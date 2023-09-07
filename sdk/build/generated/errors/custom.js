"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromCode = exports.InsufficientBid = exports.OutOfDateBid = exports.NotEnoughDeposited = exports.BadPreviousOwner = exports.InvalidBidStatePeriod = exports.InvalidTokenStatePeriod = exports.NotAdmin = exports.OwnZero = void 0;
class OwnZero extends Error {
    constructor(logs) {
        super("6000: Admin should own at least one token");
        this.logs = logs;
        this.code = 6000;
        this.name = "OwnZero";
        this.msg = "Admin should own at least one token";
    }
}
exports.OwnZero = OwnZero;
OwnZero.code = 6000;
class NotAdmin extends Error {
    constructor(logs) {
        super("6001: Not the admin");
        this.logs = logs;
        this.code = 6001;
        this.name = "NotAdmin";
        this.msg = "Not the admin";
    }
}
exports.NotAdmin = NotAdmin;
NotAdmin.code = 6001;
class InvalidTokenStatePeriod extends Error {
    constructor(logs) {
        super("6002: Invalid token state period");
        this.logs = logs;
        this.code = 6002;
        this.name = "InvalidTokenStatePeriod";
        this.msg = "Invalid token state period";
    }
}
exports.InvalidTokenStatePeriod = InvalidTokenStatePeriod;
InvalidTokenStatePeriod.code = 6002;
class InvalidBidStatePeriod extends Error {
    constructor(logs) {
        super("6003: Invalid bid state period");
        this.logs = logs;
        this.code = 6003;
        this.name = "InvalidBidStatePeriod";
        this.msg = "Invalid bid state period";
    }
}
exports.InvalidBidStatePeriod = InvalidBidStatePeriod;
InvalidBidStatePeriod.code = 6003;
class BadPreviousOwner extends Error {
    constructor(logs) {
        super("6004: Invalid owner bid state passed");
        this.logs = logs;
        this.code = 6004;
        this.name = "BadPreviousOwner";
        this.msg = "Invalid owner bid state passed";
    }
}
exports.BadPreviousOwner = BadPreviousOwner;
BadPreviousOwner.code = 6004;
class NotEnoughDeposited extends Error {
    constructor(logs) {
        super("6005: Owner bid state does not have enough deposited, token should return to minimum price");
        this.logs = logs;
        this.code = 6005;
        this.name = "NotEnoughDeposited";
        this.msg = "Owner bid state does not have enough deposited, token should return to minimum price";
    }
}
exports.NotEnoughDeposited = NotEnoughDeposited;
NotEnoughDeposited.code = 6005;
class OutOfDateBid extends Error {
    constructor(logs) {
        super("6006: Owner bid state needs to be updated");
        this.logs = logs;
        this.code = 6006;
        this.name = "OutOfDateBid";
        this.msg = "Owner bid state needs to be updated";
    }
}
exports.OutOfDateBid = OutOfDateBid;
OutOfDateBid.code = 6006;
class InsufficientBid extends Error {
    constructor(logs) {
        super("6007: Needs a bigger amount to bid");
        this.logs = logs;
        this.code = 6007;
        this.name = "InsufficientBid";
        this.msg = "Needs a bigger amount to bid";
    }
}
exports.InsufficientBid = InsufficientBid;
InsufficientBid.code = 6007;
function fromCode(code, logs) {
    switch (code) {
        case 6000:
            return new OwnZero(logs);
        case 6001:
            return new NotAdmin(logs);
        case 6002:
            return new InvalidTokenStatePeriod(logs);
        case 6003:
            return new InvalidBidStatePeriod(logs);
        case 6004:
            return new BadPreviousOwner(logs);
        case 6005:
            return new NotEnoughDeposited(logs);
        case 6006:
            return new OutOfDateBid(logs);
        case 6007:
            return new InsufficientBid(logs);
    }
    return null;
}
exports.fromCode = fromCode;
//# sourceMappingURL=custom.js.map
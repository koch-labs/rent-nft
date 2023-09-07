export type CustomError =
  | OwnZero
  | NotAdmin
  | InvalidTokenStatePeriod
  | InvalidBidStatePeriod
  | BadPreviousOwner
  | NotEnoughDeposited
  | OutOfDateBid
  | InsufficientBid

export class OwnZero extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "OwnZero"
  readonly msg = "Admin should own at least one token"

  constructor(readonly logs?: string[]) {
    super("6000: Admin should own at least one token")
  }
}

export class NotAdmin extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "NotAdmin"
  readonly msg = "Not the admin"

  constructor(readonly logs?: string[]) {
    super("6001: Not the admin")
  }
}

export class InvalidTokenStatePeriod extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "InvalidTokenStatePeriod"
  readonly msg = "Invalid token state period"

  constructor(readonly logs?: string[]) {
    super("6002: Invalid token state period")
  }
}

export class InvalidBidStatePeriod extends Error {
  static readonly code = 6003
  readonly code = 6003
  readonly name = "InvalidBidStatePeriod"
  readonly msg = "Invalid bid state period"

  constructor(readonly logs?: string[]) {
    super("6003: Invalid bid state period")
  }
}

export class BadPreviousOwner extends Error {
  static readonly code = 6004
  readonly code = 6004
  readonly name = "BadPreviousOwner"
  readonly msg = "Invalid owner bid state passed"

  constructor(readonly logs?: string[]) {
    super("6004: Invalid owner bid state passed")
  }
}

export class NotEnoughDeposited extends Error {
  static readonly code = 6005
  readonly code = 6005
  readonly name = "NotEnoughDeposited"
  readonly msg =
    "Owner bid state does not have enough deposited, token should return to minimum price"

  constructor(readonly logs?: string[]) {
    super(
      "6005: Owner bid state does not have enough deposited, token should return to minimum price"
    )
  }
}

export class OutOfDateBid extends Error {
  static readonly code = 6006
  readonly code = 6006
  readonly name = "OutOfDateBid"
  readonly msg = "Owner bid state needs to be updated"

  constructor(readonly logs?: string[]) {
    super("6006: Owner bid state needs to be updated")
  }
}

export class InsufficientBid extends Error {
  static readonly code = 6007
  readonly code = 6007
  readonly name = "InsufficientBid"
  readonly msg = "Needs a bigger amount to bid"

  constructor(readonly logs?: string[]) {
    super("6007: Needs a bigger amount to bid")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new OwnZero(logs)
    case 6001:
      return new NotAdmin(logs)
    case 6002:
      return new InvalidTokenStatePeriod(logs)
    case 6003:
      return new InvalidBidStatePeriod(logs)
    case 6004:
      return new BadPreviousOwner(logs)
    case 6005:
      return new NotEnoughDeposited(logs)
    case 6006:
      return new OutOfDateBid(logs)
    case 6007:
      return new InsufficientBid(logs)
  }

  return null
}

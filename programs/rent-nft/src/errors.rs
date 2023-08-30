use anchor_lang::prelude::*;

#[error_code]
pub enum RentNftError {
    #[msg("Admin should own at least one token")]
    OwnZero,

    #[msg("Not the admin")]
    NotAdmin,

    #[msg("Invalid token state period")]
    InvalidTokenStatePeriod,

    #[msg("Invalid bid state period")]
    InvalidBidStatePeriod,

    #[msg("Invalid owner bid state passed")]
    BadPreviousOwner,

    #[msg("Owner bid state does not have enough deposited, token should return to minimum price")]
    NotEnoughDeposited,

    #[msg("Owner bid state needs to be updated")]
    OutOfDateBid,

    #[msg("Needs a bigger amount to bid")]
    InsufficientBid,
}

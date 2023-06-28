use anchor_lang::prelude::*;

#[error_code]
pub enum HarbergerError {
    #[msg("Not the admin")]
    NotAdmin,

    #[msg("Invalid token state period")]
    InvalidTokenStatePeriod,

    #[msg("Invalid bid state period")]
    InvalidBidStatePeriod,
}

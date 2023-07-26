use anchor_lang::prelude::*;

#[error_code]
pub enum RentNftError {
    #[msg("Not the admin")]
    NotAdmin,

    #[msg("Invalid token state period")]
    InvalidTokenStatePeriod,

    #[msg("Invalid bid state period")]
    InvalidBidStatePeriod,

    // Shadow Standard
    #[msg("Creator group does not match the collection's")]
    BadCreatorGroup,
}

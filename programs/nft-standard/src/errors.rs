use anchor_lang::prelude::*;

#[error_code]
pub enum NftStandardError {
    #[msg("Mints are required to have 0 decimals")]
    InvalidMintDecimals,
}

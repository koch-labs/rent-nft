use anchor_lang::prelude::*;

#[error_code]
pub enum NftStandardError {
    #[msg("Bumps do not match remaining accounts")]
    InvalidBumps,
    #[msg("Invalid validation path")]
    InvalidPath,
    #[msg("Remaining accounts path start does not match the root")]
    InvalidPathStart,
    #[msg("Remaining accounts path end does not match the child")]
    InvalidPathEnd,
}

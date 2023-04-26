use anchor_lang::prelude::*;

#[error_code]
pub enum HarbergerError {
    #[msg("Not the admin")]
    NotAdmin,
}

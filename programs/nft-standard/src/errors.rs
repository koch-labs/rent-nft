use anchor_lang::prelude::*;

#[error_code]
pub enum NftStandardError {
    #[msg("Authorities group does not match metadata's")]
    WrongAuthoritiesGroup,
}

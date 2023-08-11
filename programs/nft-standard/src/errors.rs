use anchor_lang::prelude::*;

#[error_code]
pub enum NftStandardError {
    #[msg("The supply of new mints should be zero")]
    SupplyNotZero,
}

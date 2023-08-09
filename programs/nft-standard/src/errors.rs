use anchor_lang::prelude::*;

#[error_code]
pub enum NftStandardError {
    /// Authority Node errors

    #[msg("'Signer' node could not be validated")]
    InvalidSigner,
}

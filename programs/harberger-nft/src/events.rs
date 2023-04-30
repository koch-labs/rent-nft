use anchor_lang::prelude::*;

#[event]
pub struct CollectionCreated {
    /// The config
    #[index]
    pub config: Pubkey,

    /// The collection mint
    pub collection: Pubkey,

    /// The tax mint
    pub tax_mint: Pubkey,
}

#[event]
pub struct TokenCreated {
    /// The config
    pub config: Pubkey,

    /// The created mint
    #[index]
    pub mint: Pubkey,

    /// The collection mint
    pub collection_mint: Pubkey,
}

#[event]
pub struct CreatedDepositAccount {
    /// The depositor
    pub depositor: Pubkey,

    /// The created mint
    #[index]
    pub mint: Pubkey,

    /// The collection mint
    pub collection_mint: Pubkey,
}

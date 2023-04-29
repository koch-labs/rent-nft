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
pub struct WrapperCreated {
    /// The group
    #[index]
    pub group: Pubkey,

    /// The wrapper
    pub wrapper: Pubkey,

    /// The wrapped mint
    pub original_mint: Pubkey,
}

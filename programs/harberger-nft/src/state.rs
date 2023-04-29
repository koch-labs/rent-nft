use anchor_lang::prelude::*;

/// A group contains all the parameters required to compute taxes.
/// It's used to save space in each token account.
#[account]
pub struct CollectionConfig {
    /// The mint of the tax token
    pub collection_mint: Pubkey,

    /// Mint of the authority token
    pub admin_mint: Pubkey,

    /// The mint of the tax token
    pub tax_mint: Pubkey,

    /// The accumulated shares at the last update
    pub price_per_time_unit: u64,
}

impl CollectionConfig {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Collection
        + 32 // Admin
        + 32 // Tax
        + 8; // Price
}

#[account]
pub struct HarbergerWrapper {
    /// The Harberger group
    pub group: Pubkey,

    /// The mint of the token
    pub mint: Pubkey,
}

impl HarbergerWrapper {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Bribe
        + 32; // Claimant
}

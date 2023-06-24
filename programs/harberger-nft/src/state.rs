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
pub struct TokenState {
    /// The collection config
    pub config: Pubkey,

    /// The mint of the token
    pub token_mint: Pubkey,

    /// The sum of all deposits
    pub deposited: u64,
}

impl TokenState {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Config
        + 32 // Mint
        + 8; // Sum
}

#[account]
pub struct BidState {
    /// The token state
    pub token_state: Pubkey,

    /// The owner of the deposit
    pub depositor: Pubkey,

    /// Timestamp of the last update
    pub last_update: i64,

    /// The amount deposited
    pub amount: u64,
}

impl BidState {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Token state
        + 32 // Depositor
        + 8 // Update
        + 8; // Amount
}

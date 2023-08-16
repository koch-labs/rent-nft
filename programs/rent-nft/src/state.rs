use anchor_lang::prelude::*;

/// A group contains all the parameters required to compute taxes.
/// It's used to save space in each token account.
#[account]
pub struct CollectionConfig {
    /// The collection mint
    pub collection_mint: Pubkey,

    /// The mint of the tax token
    pub tax_mint: Pubkey,

    /// Seconds in a time period
    pub time_period: u32,

    /// Basis points per year of tax on the selling price
    pub tax_rate: u32,

    pub minimum_sell_price: u64,
}

impl CollectionConfig {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Collection
        + 32 // Tax
        + 4 // Period
        + 4 // Rate
        + 8; // Min price
}

#[account]
pub struct TokenState {
    /// The collection config
    pub config: Pubkey,

    /// The mint of the token
    pub token_mint: Pubkey,

    /// The sum of all deposits
    pub deposited: u64,

    pub current_selling_price: u64,
}

impl TokenState {
    pub const LEN: usize = 8 // Discriminator
            + 32 // Config
            + 32 // Mint
            + 8 // Deposits
            + 8; // Price
}

#[account]
pub struct BidState {
    /// The token state
    pub token_state: Pubkey,

    /// The owner of the deposit
    pub bidder: Pubkey,

    /// Timestamp of the last update
    pub last_update: i64,

    /// The amount deposited
    pub amount: u64,

    // Determines tax rate to pay when owning the token
    pub selling_price: u64,
}

impl BidState {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Token state
        + 32 // Depositor
        + 8 // Update
        + 8 // Amount
        + 8; // Bidding rate
}

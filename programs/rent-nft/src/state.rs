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

    /// The number of period won to start claiming a token
    pub contest_window_size: u8,
}

impl CollectionConfig {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Collection
        + 32 // Tax
        + 4 // Period
        + 1; // Window size
}

#[account]
pub struct TokenState {
    /// The collection config
    pub config: Pubkey,

    /// The mint of the token
    pub token_mint: Pubkey,

    /// The sum of all deposits
    pub deposited: u64,

    /// Timestamp of the last period's end
    pub last_period: i64,

    /// Number of active bidders
    pub bidders: u32,

    /// Sum of all bids for recent time periods
    pub total_bids_window: Vec<u64>,
}

impl TokenState {
    pub fn len(window_size: u8) -> usize {
        return 8 // Discriminator
            + 32 // Config
            + 32 // Mint
            + 8 // Sum
            + 8 // Period end
            + 4 // Participants
            + 4 + 8 * (window_size as usize); // Window
    }
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

    // Units per time period payable to
    pub bidding_rate: u64,

    // Whether this account is actively bidding
    pub actively_bidding: bool,

    /// Timestamp of the moment the user started actively bidding
    pub bidding_period: i64,

    /// Bids paid recently
    pub bids_window: Vec<u64>,
}

impl BidState {
    pub fn len(window_size: u8) -> usize {
        return 8 // Discriminator
        + 32 // Token state
        + 32 // Depositor
        + 8 // Update
        + 8 // Amount
        + 8 // Bidding rate
        + 1 // Active
        + 8 // Start bid
        + 4 + 8 * (window_size as usize); // Window
    }
}

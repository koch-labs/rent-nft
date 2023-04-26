use anchor_lang::prelude::*;

/// A group contains all the parameters required to compute taxes.
/// It's used to save space in each token account.
#[account]
pub struct HarbergerGroup {
    /// Unique identifier of the group
    pub id: Pubkey,

    /// The mint of the tax token
    pub tax_mint: Pubkey,

    /// The accumulated shares at the last update
    pub price_per_time_unit: u64,
}

impl HarbergerGroup {
    pub const LEN: usize = 8 // Discriminator
        + 32 // ID
        + 32 // Mint
        + 8; // Price
}

#[account]
pub struct HarbergerToken {
    /// The mint of the token
    pub mint: Pubkey,

    /// The claimant
    pub claimant: Pubkey,

    /// The accumulated shares at the last update
    pub accumulated_stake: u64,

    /// The last time the bribe was updated
    pub last_update: i64,
}

impl HarbergerToken {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Bribe
        + 32 // Claimant
        + 8  // Accumulated stake
        + 8; // Update
}

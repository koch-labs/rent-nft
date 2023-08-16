use anchor_lang::prelude::*;

#[event]
pub struct CollectionCreated {
    /// The collection
    #[index]
    pub collection: Pubkey,

    /// The config
    pub config: Pubkey,

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

    /// The collection
    pub collection: Pubkey,
}

#[event]
pub struct CreatedBidState {
    /// The bidder
    #[index]
    pub bidder: Pubkey,

    /// The created mint
    #[index]
    pub mint: Pubkey,

    /// The collection
    pub collection: Pubkey,
}

#[event]
pub struct BidUpdated {
    /// The collection
    pub collection: Pubkey,

    /// The bidder
    pub bidder: Pubkey,

    /// The created mint
    #[index]
    pub mint: Pubkey,

    pub amount: i128,
}

#[event]
pub struct BoughtToken {
    /// The collection
    #[index]
    pub collection: Pubkey,

    /// The created mint
    #[index]
    pub mint: Pubkey,

    /// The new owner claiming the token
    pub buyer: Pubkey,
}

#[event]
pub struct UpdatedTokenState {
    /// The collection
    pub collection: Pubkey,

    /// The contested mint
    pub mint: Pubkey,

    #[index]
    pub token_state: Pubkey,
}

#[event]
pub struct UpdatedBidState {
    /// The collection
    pub collection: Pubkey,

    /// The contested mint
    pub mint: Pubkey,

    #[index]
    pub bid_state: Pubkey,
}

#[event]
pub struct NewBiddingRate {
    /// The collection
    #[index]
    pub collection: Pubkey,

    /// The contested mint
    #[index]
    pub mint: Pubkey,

    pub bid_state: Pubkey,

    pub new_rate: u64,
}

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("FQ9MA87E8H8B3aGxnGQwmXNGzgRTap9WL9Yhk3GZT9w8");

#[program]
pub mod rent_nft {
    use super::*;

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        id: Pubkey,
        uri: String,
        time_period: u32,
        tax_rate: u32,
        min_price: u64,
    ) -> Result<()> {
        instructions::create_collection(ctx, id, uri, time_period, tax_rate, min_price)
    }

    pub fn create_token(ctx: Context<CreateToken>, uri: String) -> Result<()> {
        instructions::create_token(ctx, uri)
    }

    pub fn create_bid(ctx: Context<CreateBid>) -> Result<()> {
        instructions::create_bid(ctx)
    }

    pub fn update_bid(ctx: Context<UpdateBid>, amount: i128) -> Result<()> {
        instructions::update_bid(ctx, amount)
    }

    pub fn buy_token(ctx: Context<BuyToken>, new_sell_price: u64) -> Result<()> {
        instructions::buy_token(ctx, new_sell_price)
    }

    // pub fn update_bid_state(ctx: Context<UpdateBidState>) -> Result<()> {
    //     instructions::update_bid_state(ctx)
    // }

    // pub fn set_bidding_rate(ctx: Context<SetBiddingRate>, new_rate: u64) -> Result<()> {
    //     instructions::set_bidding_rate(ctx, new_rate)
    // }
}

mod constants;
mod errors;
mod events;
mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("FQ9MA87E8H8B3aGxnGQwmXNGzgRTap9WL9Yhk3GZT9w8");

#[program]
pub mod rent_nft {

    use super::*;

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: String,
        symbol: String,
        time_period: u32,
    ) -> Result<()> {
        instructions::create_collection(ctx, name, symbol, time_period)
    }

    // pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
    //     instructions::create_token(ctx)
    // }

    // pub fn create_bid(ctx: Context<CreateBid>) -> Result<()> {
    //     instructions::create_bid(ctx)
    // }

    // pub fn update_deposit(ctx: Context<UpdateBid>, amount: i128) -> Result<()> {
    //     instructions::update_bid(ctx, amount)
    // }

    // pub fn update_token_state(ctx: Context<UpdateTokenState>) -> Result<()> {
    //     instructions::update_token_state(ctx)
    // }

    // pub fn update_bid_state(ctx: Context<UpdateBidState>) -> Result<()> {
    //     instructions::update_bid_state(ctx)
    // }

    // pub fn set_bidding_rate(ctx: Context<SetBiddingRate>, new_rate: u64) -> Result<()> {
    //     instructions::set_bidding_rate(ctx, new_rate)
    // }
}

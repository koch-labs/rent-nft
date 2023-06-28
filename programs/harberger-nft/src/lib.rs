mod constants;
mod errors;
mod events;
mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("9DBWBHwWi2UaDXL6Y6t5rhtHaYyQ5xyiroRReEvZsJDu");

#[program]
pub mod harberger_nft {

    use super::*;

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        price_per_time_unit: u64,
        time_period: u32,
        contest_window_size: u8,
    ) -> Result<()> {
        instructions::create_collection(ctx, price_per_time_unit, time_period, contest_window_size)
    }

    pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
        instructions::create_token(ctx)
    }

    pub fn create_bid(ctx: Context<CreateBid>) -> Result<()> {
        instructions::create_bid(ctx)
    }

    pub fn update_deposit(ctx: Context<UpdateBid>, amount: i128) -> Result<()> {
        instructions::update_bid(ctx, amount)
    }

    pub fn update_token_state(ctx: Context<UpdateTokenState>) -> Result<()> {
        instructions::update_token_state(ctx)
    }

    pub fn set_bidding_rate(ctx: Context<SetBiddingRate>, new_rate: u64) -> Result<()> {
        instructions::set_bidding_rate(ctx, new_rate)
    }
}

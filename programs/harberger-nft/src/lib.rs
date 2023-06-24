mod constants;
mod errors;
mod events;
mod instructions;
mod state;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("9DBWBHwWi2UaDXL6Y6t5rhtHaYyQ5xyiroRReEvZsJDu");

#[program]
pub mod harberger_nft {
    use super::*;

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        price_per_time_unit: u64,
    ) -> Result<()> {
        instructions::create_collection(ctx, price_per_time_unit)
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
}

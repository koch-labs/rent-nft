mod constants;
mod errors;
mod events;
mod instructions;
mod state;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("Nm6XtrnTEFrFwVA54Au6LrCnEy8FKi5masevtj86Fmr");

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

    pub fn create_deposit_account(ctx: Context<CreateDepositAccount>) -> Result<()> {
        instructions::create_deposit_account(ctx)
    }

    pub fn update_deposit(ctx: Context<UpdateDeposit>, amount: i128) -> Result<()> {
        instructions::update_deposit(ctx, amount)
    }
}

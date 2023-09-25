use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;

pub fn update_selling_price(ctx: Context<UpdateSellingPrice>, new_sell_price: u64) -> Result<()> {
    msg!("Updating bid state");

    let token_state = &mut ctx.accounts.token_state;
    token_state.current_selling_price = new_sell_price;
    let bid_state = &mut ctx.accounts.owner_bid_state;
    bid_state.selling_price = new_sell_price;

    emit!(UpdatedBid {
        collection: ctx.accounts.config.collection_mint.key(),
        mint: ctx.accounts.token_state.token_mint.key(),
        bid_state: ctx.accounts.owner_bid_state.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateSellingPrice<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The config
    #[account(
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The state for the token assessement
    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes()
        ],
        bump,
        has_one = config,
        constraint = token_state.owner_bid_state.unwrap() == owner_bid_state.key(),
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &owner.key().to_bytes(),
        ],
        bump,
        constraint = owner_bid_state.last_update == Clock::get()?.unix_timestamp @ RentNftError::OutOfDateBid,
    )]
    pub owner_bid_state: Box<Account<'info, BidState>>,
}

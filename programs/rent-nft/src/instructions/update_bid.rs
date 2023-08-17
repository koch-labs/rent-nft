use crate::constants::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;

pub fn update_bid(ctx: Context<UpdateBid>) -> Result<()> {
    msg!("Updating bid");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.bid_state;

    let current_time = Clock::get()?.unix_timestamp;
    if token_state.owner_bid_state.unwrap_or(Pubkey::default()) == bid_state.key() {
        // Only the owner pays a fee
        let elapsed_time = (current_time - bid_state.last_update) as u64;
        let amount_owed = token_state.current_selling_price * elapsed_time / SECONDS_PER_YEAR
            * config.tax_rate
            / 10000;

        msg!("Owner {} owes {} tokens", bid_state.bidder, amount_owed);

        if amount_owed > bid_state.amount {
            // Owner can not pay, loose ownership
            token_state.deposited -= bid_state.amount;
            token_state.owner_bid_state = None;
            config.collected_tax += bid_state.amount;
            bid_state.amount = 0;
        } else {
            token_state.deposited -= amount_owed;
            bid_state.amount -= amount_owed;
            config.collected_tax += amount_owed;
        }
    }

    bid_state.last_update = current_time;

    emit!(UpdatedBid {
        collection: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        bid_state: ctx.accounts.bid_state.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateBid<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The config
    #[account(
        mut,
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
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &bid_state.bidder.to_bytes(),
        ],
        bump,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
}

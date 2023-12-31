use anchor_lang::prelude::*;

use crate::events::*;
use crate::state::*;

pub fn create_bid(ctx: Context<CreateBid>) -> Result<()> {
    msg!("Creating a bid account");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.bid_state;

    bid_state.bidder = ctx.accounts.bidder.key();
    bid_state.token_state = token_state.key();
    bid_state.last_update = Clock::get()?.unix_timestamp;

    emit!(CreatedBidState {
        bidder: ctx.accounts.bidder.key(),
        mint: token_state.token_mint.key(),
        collection: config.collection_mint.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateBid<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Delegatable creation
    pub bidder: UncheckedAccount<'info>,

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
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes()
        ],
        bump,
        has_one = config,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    #[account(
        init,
        payer = payer,
        space = BidState::LEN,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &bidder.key().to_bytes(),
        ],
        bump,
    )]
    pub bid_state: Box<Account<'info, BidState>>,

    /// Common Solana programs
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

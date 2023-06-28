use crate::constants::*;
use crate::events::*;
use crate::state::*;
use crate::utils::min;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token};

pub fn update_token_state(ctx: Context<UpdateTokenState>) -> Result<()> {
    msg!("Update token state");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;

    let current_time = min(
        Clock::get()?.unix_timestamp,
        token_state.last_period + config.time_period as i64,
    );
    let missed_periods = min(
        (current_time - token_state.last_period) / config.time_period as i64,
        config.contest_window_size as i64,
    );

    for _ in missed_periods..0 {
        token_state.last_period += config.time_period as i64;
        token_state.total_bids_window.insert(0, 0);
        token_state.total_bids_window.pop();
    }

    emit!(UpdatedTokenState {
        collection_mint: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        token_state: token_state.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateTokenState<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The mint of the collection
    pub collection_mint: Box<Account<'info, Mint>>,

    /// CHECK: Seeded authority
    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            COLLECTION_AUTHORITY_SEED.as_bytes(),
        ],
        bump,
    )]
    pub collection_authority: UncheckedAccount<'info>,

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
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;

use crate::constants::*;
use crate::events::*;
use crate::state::*;

pub fn create_deposit_account(ctx: Context<CreateDepositAccount>) -> Result<()> {
    msg!("Creating a deposit account");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let deposit_state = &mut ctx.accounts.deposit_state;

    deposit_state.depositor = ctx.accounts.depositor.key();
    deposit_state.token_state = token_state.key();

    emit!(CreatedDepositAccount {
        depositor: ctx.accounts.depositor.key(),
        mint: token_state.token_mint.key(),
        collection_mint: config.collection_mint.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateDepositAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Delegatable creation
    pub depositor: UncheckedAccount<'info>,

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
        space = DepositState::LEN,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &depositor.key().to_bytes(),
        ],
        bump,
    )]
    pub deposit_state: Box<Account<'info, DepositState>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

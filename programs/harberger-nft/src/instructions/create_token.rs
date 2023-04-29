use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;

pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
    msg!("Creating a wrapper");

    let group = &mut ctx.accounts.group;
    let wrapper = &mut ctx.accounts.wrapper;

    wrapper.group = group.key();
    wrapper.mint = ctx.accounts.wrapped_mint.key();

    emit!(WrapperCreated {
        group: group.key(),
        wrapper: wrapper.key(),
        original_mint: ctx.accounts.wrapped_mint.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Delegatable creation
    pub admin: Signer<'info>,

    /// The group
    #[account(
        seeds = [
            &group.collection_mint.to_bytes(),
        ],
        bump,
        has_one = admin_mint,
    )]
    pub group: Box<Account<'info, CollectionConfig>>,

    /// The token representing the group authority
    pub admin_mint: Box<Account<'info, Mint>>,

    /// The account that receives the token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = admin_mint,
        associated_token::authority = admin,
        constraint = admin_account.amount == 1 @ HarbergerError::NotAdmin,
    )]
    pub admin_account: Box<Account<'info, TokenAccount>>,

    /// The token representing the group authority
    pub wrapped_mint: Box<Account<'info, Mint>>,

    /// The wrapper
    #[account(
        init,
        payer = payer,
        space = HarbergerWrapper::LEN,
        seeds = [
            &group.collection_mint.to_bytes(),
            &wrapped_mint.key().to_bytes()
        ],
        bump,
    )]
    pub wrapper: Box<Account<'info, HarbergerWrapper>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

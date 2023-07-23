use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::instruction::builders::TransferBuilder;
use mpl_token_metadata::instruction::InstructionBuilder;
use mpl_token_metadata::instruction::TransferArgs;
use mpl_token_metadata::processor::AuthorizationData;
use solana_program::program::invoke_signed;

pub fn claim_token(ctx: Context<ClaimToken>) -> Result<()> {
    msg!("Claiming a token");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.claimant_bid_state;

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &config.collection_mint.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signers_seeds = &[&authority_seeds[..]];

    invoke_signed(
        &TransferBuilder::new()
            .mint(ctx.accounts.token_mint.key())
            .metadata(ctx.accounts.token_metadata.key())
            .edition(ctx.accounts.token_master_edition.key())
            .destination_owner(ctx.accounts.claimant.key())
            .destination(ctx.accounts.claimant_account.key())
            .authority(ctx.accounts.collection_authority.key())
            .payer(ctx.accounts.payer.key())
            .sysvar_instructions(ctx.accounts.system_program.key())
            .build(TransferArgs::V1 {
                amount: 1,
                authorization_data: Some(AuthorizationData::new_empty()),
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.token_master_edition.to_account_info(),
            ctx.accounts.token_metadata.to_account_info(),
            ctx.accounts.token_mint.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signers_seeds,
    )?;

    emit!(ClaimedToken {
        collection_mint: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        claimant: ctx.accounts.claimant.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub claimant: Signer<'info>,

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
        has_one = tax_mint,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The token used to pay taxes
    pub tax_mint: Box<Account<'info, Mint>>,

    /// The state for the token assessement
    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_mint.key().to_bytes()
        ],
        bump,
        has_one = config,
        has_one = token_mint,
        constraint = token_state.last_period <= Clock::get()?.unix_timestamp @ HarbergerError::InvalidTokenStatePeriod,
        constraint = token_state.last_period + config.time_period as i64 >= Clock::get()?.unix_timestamp @ HarbergerError::InvalidTokenStatePeriod,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// The mint of the token
    pub token_mint: Box<Account<'info, Mint>>,

    /// Metadata of the token
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_metadata: UncheckedAccount<'info>,

    /// Master edition of the token
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_master_edition: UncheckedAccount<'info>,

    /// The token account of the claimant
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = claimant
    )]
    pub claimant_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &claimant.key().to_bytes(),
        ],
        bump,
    )]
    pub claimant_bid_state: Box<Account<'info, BidState>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &owner_bid_state.key().to_bytes(),
        ],
        bump,
    )]
    pub owner_bid_state: Box<Account<'info, BidState>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

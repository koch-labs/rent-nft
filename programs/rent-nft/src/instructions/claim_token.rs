use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::get_associated_token_address_with_program_id;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

pub fn claim_token(ctx: Context<ClaimToken>) -> Result<()> {
    msg!("Claiming a token");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let owner_bid_state = &mut ctx.accounts.owner_bid_state;

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&config.collection_mint.to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    config.collected_tax += config.minimum_sell_price;
    owner_bid_state.amount -= config.minimum_sell_price;
    owner_bid_state.selling_price = config.minimum_sell_price;
    token_state.current_selling_price = config.minimum_sell_price;
    token_state.owner_bid_state = Some(owner_bid_state.key());

    // Transfer the token
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.old_owner_token_account.to_account_info(),
                to: ctx.accounts.new_owner_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                authority: config.to_account_info(),
            },
            signer_seeds,
        ),
        1,
        0,
    )?;

    emit!(BoughtToken {
        collection: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        buyer: ctx.accounts.new_owner.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub new_owner: Signer<'info>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_mint.key().to_bytes()
        ],
        bump,
        has_one = config,
        has_one = token_mint,
        constraint = token_state.owner_bid_state.is_none() @ RentNftError::BadPreviousOwner,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// The mint of the token
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            new_owner.key,
            &token_mint.key(),
            &token_program.key(),
        ),
    )]
    pub new_owner_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub old_owner_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &new_owner.key().to_bytes(),
        ],
        bump,
        constraint = owner_bid_state.amount >= config.minimum_sell_price @ RentNftError::InsufficientBid,
    )]
    pub owner_bid_state: Account<'info, BidState>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

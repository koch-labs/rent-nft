use crate::events::*;
use crate::{errors::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use anchor_spl::token_interface::TokenAccount;
use anchor_spl::token_interface::TokenInterface;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_interface::{transfer_checked, TransferChecked},
};

pub fn increase_bid(ctx: Context<IncreaseBid>, amount: u64) -> Result<()> {
    msg!("Increase bid by {}", amount);

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.bid_state;

    let amount_before = ctx.accounts.bids_account.amount;
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.tax_mint.to_account_info(),
                from: ctx.accounts.bidder_account.to_account_info(),
                to: ctx.accounts.bids_account.to_account_info(),
                authority: ctx.accounts.bidder.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.tax_mint.decimals,
    )?;
    ctx.accounts.bids_account.reload()?;

    // Using the delta as the amount to account for transfer fees
    let amount = ctx.accounts.bids_account.amount - amount_before;
    token_state.deposited += amount;
    bid_state.amount += amount;

    emit!(BidAmountChanged {
        collection: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        bidder: ctx.accounts.bidder.key(),
        amount: bid_state.amount
    });

    Ok(())
}

#[derive(Accounts)]
pub struct IncreaseBid<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub bidder: Signer<'info>,

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
    #[account(
        mint::token_program = token_program
    )]
    pub tax_mint: Box<InterfaceAccount<'info, Mint>>,

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
            &bidder.key().to_bytes(),
        ],
        bump,
        constraint = bid_state.last_update == Clock::get()?.unix_timestamp @ RentNftError::OutOfDateBid,
    )]
    pub bid_state: Box<Account<'info, BidState>>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            bidder.key,
            &tax_mint.key(),
            &token_program.key(),
        ),
    )]
    pub bidder_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            &config.key(),
            &tax_mint.key(),
            &token_program.key(),
        ),
    )]
    pub bids_account: InterfaceAccount<'info, TokenAccount>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
}

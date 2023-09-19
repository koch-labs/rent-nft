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

pub fn decrease_bid(ctx: Context<DecreaseBid>, amount: u64) -> Result<()> {
    msg!("Decrease bid by {}", amount);

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.bid_state;

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&config.collection_mint.to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.tax_mint.to_account_info(),
                from: ctx.accounts.bids_account.to_account_info(),
                to: ctx.accounts.bidder_account.to_account_info(),
                authority: config.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
        ctx.accounts.tax_mint.decimals,
    )?;

    token_state.deposited -= amount;
    bid_state.amount -= amount;

    emit!(BidAmountChanged {
        collection: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        bidder: ctx.accounts.bidder.key(),
        amount: bid_state.amount
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DecreaseBid<'info> {
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

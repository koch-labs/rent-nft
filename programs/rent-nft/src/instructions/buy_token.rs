use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

pub fn buy_token(ctx: Context<BuyToken>, new_sell_price: u64) -> Result<()> {
    msg!("Claiming a token");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let owner_bid_state = &mut ctx.accounts.owner_bid_state;
    let buyer_bid_state = &mut ctx.accounts.buyer_bid_state;

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &config.collection_mint.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    if let Some(bid_state) = owner_bid_state {
        bid_state.amount += token_state.current_selling_price;
    } else {
        config.collected_tax += token_state.current_selling_price;
    }
    buyer_bid_state.amount -= token_state.current_selling_price;
    buyer_bid_state.selling_price = new_sell_price;
    token_state.current_selling_price = new_sell_price;
    token_state.owner_bid_state = Some(buyer_bid_state.key());

    // Transfer the token
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.owner_token_account.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signer_seeds,
        ),
        1,
        0,
    )?;

    emit!(BoughtToken {
        collection: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        buyer: ctx.accounts.buyer.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Verifying on bid state
    pub owner: Option<UncheckedAccount<'info>>,

    pub buyer: Signer<'info>,

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
            &token_mint.key().to_bytes()
        ],
        bump,
        has_one = config,
        has_one = token_mint,
        constraint = token_state.owner_bid_state.is_none() ||
            token_state.owner_bid_state.unwrap() == owner_bid_state.as_ref().unwrap().key() @ RentNftError::BadPreviousOwner,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// The mint of the token
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = owner,
        associated_token::token_program = token_program,
    )]
    pub owner_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program,
    )]
    pub buyer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &buyer.key().to_bytes(),
        ],
        bump,
        constraint = buyer_bid_state.amount >= token_state.current_selling_price @ RentNftError::InsufficientBid,
    )]
    pub buyer_bid_state: Box<Account<'info, BidState>>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.key().to_bytes(),
            &owner.as_ref().unwrap().key().to_bytes(),
        ],
        bump,
        constraint = owner_bid_state.last_update == Clock::get()?.unix_timestamp @ RentNftError::OutOfDateBid,
    )]
    pub owner_bid_state: Option<Account<'info, BidState>>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;
use crate::utils::max;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

pub fn set_bidding_rate(ctx: Context<SetBiddingRate>, new_rate: u64) -> Result<()> {
    msg!("Setting bidding rate");

    let bid_state = &mut ctx.accounts.bid_state;

    if new_rate == 0 {
        bid_state.bidding_rate = 0;
        bid_state.bidding_period = None;
        return Ok(());
    }

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;

    if let Some(bidding_period) = bid_state.bidding_period {
        // Bidding process already started, update bid
        // Lock-in past bid
        if bidding_period != token_state.last_period {
            let missed_period = max(
                (token_state.last_period - bidding_period) / config.time_period as i64,
                config.contest_window_size as i64,
            );

            // Compute the owed amount now
            // Debit the bid account later
            let mut debt = 0;
            for p in 0..missed_period {
                if p == 0 {
                    // Check if the bid started mid period
                    let prorata_bp = (10000 * (bid_state.last_update - bidding_period)
                        / config.time_period as i64) as u64;
                    debt += bid_state.bidding_rate * prorata_bp / 10000;

                    bid_state.last_update = bidding_period + config.time_period as i64;
                } else if p == missed_period - 1 {
                    // Maybe updating mid period
                } else {
                    debt += bid_state.bidding_rate;

                    bid_state.amount;
                    bid_state.last_update += config.time_period as i64;
                }

                // Abort if the bid account is empty
                if debt > bid_state.amount {
                    debt = bid_state.amount;
                }
            }

            transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.bid_account.to_account_info(),
                        to: ctx.accounts.admin_account.to_account_info(),
                        authority: ctx.accounts.bidder.to_account_info(),
                    },
                ),
                debt,
            )?;
        }
        bid_state.bidding_period = Some(Clock::get()?.unix_timestamp);
    } else {
        // First time bidding
        bid_state.bids_window.clear();
        bid_state.bidding_rate = new_rate;
        // Bidding can start mid period but are synced with the token period
        bid_state.bidding_period = Some(token_state.last_period);
    }

    // emit!(BidUpdated {
    //     collection_mint: config.collection_mint.key(),
    //     mint: token_state.token_mint.key(),
    //     depositor: ctx.accounts.bidder.key(),
    //     amount
    // });

    Ok(())
}

#[derive(Accounts)]
pub struct SetBiddingRate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub bidder: Signer<'info>,

    /// CHECK: Only reading admin authority
    pub admin: UncheckedAccount<'info>,

    /// The mint of the collection
    #[account(mut)]
    pub collection_mint: Box<Account<'info, Mint>>,

    /// The account that holds the collection mint
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = collection_mint,
        associated_token::authority = admin,
        constraint = admin_collection_account.amount == 1 @ HarbergerError::NotAdmin,
    )]
    pub admin_collection_account: Box<Account<'info, TokenAccount>>,

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
    )]
    pub bid_state: Box<Account<'info, BidState>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = tax_mint,
        associated_token::authority = bidder
    )]
    pub bidder_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = tax_mint,
        associated_token::authority = collection_authority
    )]
    pub bid_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = tax_mint,
        associated_token::authority = collection_authority
    )]
    pub admin_account: Box<Account<'info, TokenAccount>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

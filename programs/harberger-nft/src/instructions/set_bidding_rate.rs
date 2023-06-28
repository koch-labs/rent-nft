use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;
use crate::utils::min;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

fn owed_amount_for_duration(
    bid_state: &mut Account<BidState>,
    config: &Account<CollectionConfig>,
    start_time: i64,
    end_time: i64,
) -> u64 {
    let period_time_elapsed = (end_time - start_time) as u64;
    let prorata_debt =
        10000 * period_time_elapsed * bid_state.bidding_rate / config.time_period as u64 / 10000;

    if prorata_debt > bid_state.amount {
        // The user can't pay the full amount owed
        // Empty the account and finish the period
        bid_state.amount as u64
    } else {
        prorata_debt
    }
}

fn update_bid_state_for_finished_period(
    bid_state: &mut Account<BidState>,
    token_state: &mut Account<TokenState>,
    config: &Account<CollectionConfig>,
    period_offset: usize,
) -> u64 {
    let amount = if bid_state.actively_bidding {
        owed_amount_for_duration(
            bid_state,
            config,
            bid_state.bidding_period,
            bid_state.last_update,
        )
    } else {
        0
    };

    // Add the debt to the latest user bids
    bid_state.bids_window[0] += amount;
    token_state.total_bids_window[period_offset] += amount;
    bid_state.amount -= amount;
    // Shift bids to start a new period
    bid_state.last_update = bid_state.bidding_period + config.time_period as i64;
    bid_state.bidding_period = bid_state.last_update;
    bid_state.bids_window.insert(0, 0);
    bid_state.bids_window.pop();

    amount
}

fn update_bid_state_for_current_period(
    bid_state: &mut Account<BidState>,
    token_state: &mut Account<TokenState>,
    config: &Account<CollectionConfig>,
    new_rate: u64,
) -> Result<u64> {
    let current_time = min(
        Clock::get()?.unix_timestamp,
        token_state.last_period + config.time_period as i64,
    );
    let amount = min(
        bid_state.amount,
        owed_amount_for_duration(bid_state, config, bid_state.last_update, current_time),
    );

    if !bid_state.actively_bidding && new_rate != 0 {
        token_state.bidders += 1;
    } else if bid_state.actively_bidding && new_rate == 0 {
        token_state.bidders -= 1;
    }

    bid_state.bidding_rate = new_rate;
    bid_state.actively_bidding = new_rate != 0;
    bid_state.amount -= amount;
    bid_state.last_update = current_time;
    bid_state.bids_window[0] += amount;
    token_state.total_bids_window[0] += amount;

    Ok(amount)
}

fn update_token_period(
    token_state: &mut Account<TokenState>,
    config: &Account<CollectionConfig>,
) -> Result<()> {
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

    Ok(())
}

pub fn set_bidding_rate(ctx: Context<SetBiddingRate>, new_rate: u64) -> Result<()> {
    msg!("Setting bidding rate");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.bid_state;

    update_token_period(token_state, config)?;

    // Bidding process already started, update bid
    // Lock-in past bid
    // Debit the bid account later
    let mut debt = 0;
    if bid_state.bidding_period != token_state.last_period {
        let missed_period = min(
            (token_state.last_period - bid_state.bidding_period) / config.time_period as i64,
            config.contest_window_size as i64,
        );

        // Compute the owed amount now
        // Exclude the current period
        for offset in (missed_period - 1)..0 {
            debt += update_bid_state_for_finished_period(
                bid_state,
                token_state,
                config,
                offset as usize,
            );
        }
    }

    debt += update_bid_state_for_current_period(bid_state, token_state, config, new_rate)?;

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &ctx.accounts.collection_mint.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bid_account.to_account_info(),
                to: ctx.accounts.admin_account.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signer_seeds,
        ),
        debt,
    )?;

    emit!(NewBiddingRate {
        collection_mint: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        bid_state: ctx.accounts.bid_state.key(),
        new_rate
    });

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
        associated_token::authority = admin
    )]
    pub admin_account: Box<Account<'info, TokenAccount>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

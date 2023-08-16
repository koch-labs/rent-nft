use crate::constants::*;
use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use anchor_spl::token_interface::TokenAccount;
use anchor_spl::token_interface::TokenInterface;
use anchor_spl::{
    associated_token::get_associated_token_address_with_program_id,
    token_interface::{transfer_checked, TransferChecked},
};

pub fn update_bid(ctx: Context<UpdateBid>, amount: i128) -> Result<()> {
    msg!("Updating bid account");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;
    let bid_state = &mut ctx.accounts.bid_state;

    if amount > 0 {
        let amount = amount as u64;

        token_state.deposited += amount;
        bid_state.amount += amount;

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
    } else {
        let amount = if (-amount) as u64 > bid_state.amount {
            bid_state.amount
        } else {
            (-amount) as u64
        };

        token_state.deposited -= amount;
        bid_state.amount -= amount;

        let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
        let authority_seeds = &[
            &config.collection_mint.to_bytes(),
            COLLECTION_AUTHORITY_SEED.as_bytes(),
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
                    authority: ctx.accounts.collection_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
            ctx.accounts.tax_mint.decimals,
        )?;
    }

    emit!(BidUpdated {
        collection: config.collection_mint.key(),
        mint: token_state.token_mint.key(),
        bidder: ctx.accounts.bidder.key(),
        amount
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateBid<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub bidder: Signer<'info>,

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
            collection_authority.key,
            &tax_mint.key(),
            &token_program.key(),
        ),
    )]
    pub bids_account: InterfaceAccount<'info, TokenAccount>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

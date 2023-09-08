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

pub fn withdraw_tax(ctx: Context<WithdrawTax>) -> Result<()> {
    let config = &mut ctx.accounts.config;

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&config.collection_mint.to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    let amount = config.collected_tax;

    msg!("Withdrawing {} fees", amount);

    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.bids_account.to_account_info(),
                to: ctx.accounts.tax_collector_account.to_account_info(),
                authority: config.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
        ctx.accounts.mint.decimals,
    )?;

    config.collected_tax = 0;

    emit!(WithdrewFees {
        collection: config.collection_mint.key(),
        amount
    });

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawTax<'info> {
    pub tax_collector: Signer<'info>,

    /// The config
    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
        // Not checking the tax token, can be any token
        has_one = tax_collector,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The token to withdraw
    #[account(mut)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            tax_collector.key,
            &mint.key(),
            &tax_token_program.key(),
        ),
    )]
    pub tax_collector_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            &config.key(),
            &mint.key(),
            &tax_token_program.key(),
        ),
    )]
    pub bids_account: InterfaceAccount<'info, TokenAccount>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub tax_token_program: Interface<'info, TokenInterface>,
}

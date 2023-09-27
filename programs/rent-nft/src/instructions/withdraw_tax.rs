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
            ctx.accounts.tax_token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.bids_account.to_account_info(),
                to: ctx.accounts.admin_account.to_account_info(),
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
    pub admin: Signer<'info>,

    /// The config
    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
        has_one = collection_mint,
        // Not checking the tax token, can be any token
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    pub collection_mint: InterfaceAccount<'info, Mint>,

    /// The token to withdraw
    #[account(mut)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            admin.key,
            &mint.key(),
            &tax_token_program.key(),
        ),
    )]
    pub admin_account: InterfaceAccount<'info, TokenAccount>,

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
    pub tax_token_program: Interface<'info, TokenInterface>,
}

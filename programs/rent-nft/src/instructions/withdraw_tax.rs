use crate::constants::*;
use crate::errors::*;
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

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &config.collection_mint.to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    let amount = config.collected_tax;

    msg!("Withdrawing {} fees", amount);

    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.tax_mint.to_account_info(),
                from: ctx.accounts.bids_account.to_account_info(),
                to: ctx.accounts.admin_account.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
        ctx.accounts.tax_mint.decimals,
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
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
        has_one = tax_mint,
        has_one = collection_mint
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
        address = get_associated_token_address_with_program_id(
            admin.key,
            &collection_mint.key(),
            &token_program.key(),
        ),
        constraint = collection_mint_account.amount == 1 @ RentNftError::NotAdmin,
    )]
    pub collection_mint_account: InterfaceAccount<'info, TokenAccount>,

    /// The token used to pay taxes
    #[account(mut)]
    pub tax_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            admin.key,
            &tax_mint.key(),
            &tax_token_program.key(),
        ),
    )]
    pub admin_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            collection_authority.key,
            &tax_mint.key(),
            &tax_token_program.key(),
        ),
    )]
    pub bids_account: InterfaceAccount<'info, TokenAccount>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub tax_token_program: Interface<'info, TokenInterface>,
}

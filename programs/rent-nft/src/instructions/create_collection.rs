use crate::{errors::*, events::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use nft_standard::cpi::update_authorities_group;
use nft_standard::state::{AuthoritiesGroup, Metadata};
use nft_standard::{cpi::accounts::UpdateAuthoritiesGroup, program::NftStandard};

pub fn create_collection(
    ctx: Context<CreateCollection>,
    time_period: u32,
    tax_rate: u64,
    min_price: u64,
) -> Result<()> {
    msg!("Creating a collection");
    let config = &mut ctx.accounts.config;

    config.collection_mint = ctx.accounts.collection_mint.key();
    config.tax_mint = ctx.accounts.tax_mint.key();
    config.time_period = time_period;
    config.tax_rate = tax_rate;
    config.minimum_sell_price = min_price;

    update_authorities_group(
        CpiContext::new(
            ctx.accounts.metadata_program.to_account_info(),
            UpdateAuthoritiesGroup {
                update_authority: ctx.accounts.admin.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
            },
        ),
        config.key(),
        ctx.accounts.authorities_group.metadata_authority,
        config.key(),
    )?;

    emit!(CollectionCreated {
        collection: ctx.accounts.collection_mint.key(),
        config: config.key(),
        tax_mint: config.tax_mint.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = CollectionConfig::LEN,
        seeds = [
            &collection_mint.key().to_bytes(),
        ],
        bump,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    #[account(mint::token_program = tax_token_program)]
    pub tax_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub authorities_group: Account<'info, AuthoritiesGroup>,

    #[account(
        mut,
        mint::authority = admin,
        mint::decimals = 0,
        mint::token_program = token_program,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub collection_metadata: Account<'info, Metadata>,

    #[account(
        mut,
        associated_token::mint = collection_mint,
        associated_token::authority = admin,
        associated_token::token_program = token_program,
        constraint = admin_collection_mint_account.amount > 0 @ RentNftError::OwnZero,
    )]
    pub admin_collection_mint_account: InterfaceAccount<'info, TokenAccount>,

    /// Common Solana programs
    pub tax_token_program: Interface<'info, TokenInterface>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, NftStandard>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

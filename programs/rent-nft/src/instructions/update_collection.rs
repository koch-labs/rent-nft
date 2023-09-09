use crate::{events::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
use metadata_standard::cpi::update_authorities_group;
use metadata_standard::state::{AuthoritiesGroup, Metadata};
use metadata_standard::{cpi::accounts::UpdateAuthoritiesGroup, program::MetadataStandard};

pub fn update_collection(
    ctx: Context<UpdateCollection>,
    tax_collector: Pubkey,
    time_period: u32,
    tax_rate: u64,
    min_price: u64,
    metadata_authority: Pubkey,
) -> Result<()> {
    msg!("Updating a collection");
    let config = &mut ctx.accounts.config;

    config.tax_collector = tax_collector;
    config.time_period = time_period;
    config.tax_rate = tax_rate;
    config.minimum_sell_price = min_price;

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&ctx.accounts.collection_mint.key().to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    update_authorities_group(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            UpdateAuthoritiesGroup {
                update_authority: config.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
            },
            signer_seeds,
        ),
        config.key(),
        metadata_authority,
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
pub struct UpdateCollection<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [
            &config.collection_mint.key().to_bytes(),
        ],
        bump,
        has_one = collection_mint
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    #[account(mut)]
    pub authorities_group: Account<'info, AuthoritiesGroup>,

    #[account(
        mint::authority = admin,
        mint::decimals = 0,
        mint::token_program = token_program,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = authorities_group,
        constraint = collection_metadata.mint == collection_mint.key(),
    )]
    pub collection_metadata: Account<'info, Metadata>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub metadata_program: Program<'info, MetadataStandard>,
}

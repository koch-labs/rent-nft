use crate::{events::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
use metadata_standard::cpi::update_external_metadata;
use metadata_standard::state::{AuthoritiesGroup, Metadata, MetadataData};
use metadata_standard::{cpi::accounts::UpdateMetadata, program::MetadataStandard};

pub fn update_collection(
    ctx: Context<UpdateCollection>,
    time_period: Option<u32>,
    tax_rate: Option<u64>,
    min_price: Option<u64>,
    uri: Option<String>,
    content_hash: Option<[u8; 32]>,
    name: Option<String>,
) -> Result<()> {
    msg!("Updating a collection");
    let config = &mut ctx.accounts.config;

    config.time_period = time_period.unwrap_or(config.time_period);
    config.tax_rate = tax_rate.unwrap_or(config.tax_rate);
    config.minimum_sell_price = min_price.unwrap_or(config.minimum_sell_price);

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&ctx.accounts.collection_mint.key().to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    update_external_metadata(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            UpdateMetadata {
                metadata_authority: config.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
                metadata: ctx.accounts.collection_metadata.to_account_info(),
            },
            signer_seeds,
        ),
        uri.unwrap_or(match ctx.accounts.collection_metadata.data.clone() {
            MetadataData::External { uri } => uri,
            _ => "".to_string(),
        }),
        content_hash.unwrap_or(ctx.accounts.collection_metadata.content_hash),
        name.unwrap_or(ctx.accounts.collection_metadata.name.clone()),
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

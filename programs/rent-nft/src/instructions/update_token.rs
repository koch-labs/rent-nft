use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    set_authority, spl_token_2022::instruction::AuthorityType, Mint, SetAuthority, TokenInterface,
};
use metadata_standard::{
    cpi::{accounts::UpdateMetadata, update_external_metadata},
    program::MetadataStandard,
    state::{AuthoritiesGroup, Metadata, MetadataData},
};

use crate::{errors::*, events::*, state::*};

pub fn update_token(
    ctx: Context<UpdateToken>,
    uri: Option<String>,
    content_hash: Option<[u8; 32]>,
    name: Option<String>,
) -> Result<()> {
    msg!("Updating a token");

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
                metadata_authority: ctx.accounts.config.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
                metadata: ctx.accounts.token_metadata.to_account_info(),
            },
            signer_seeds,
        ),
        uri.unwrap_or(match ctx.accounts.token_metadata.data.clone() {
            MetadataData::External { uri } => uri,
            _ => "".to_string(),
        }),
        content_hash.unwrap_or(ctx.accounts.token_metadata.content_hash),
        name.unwrap_or(ctx.accounts.token_metadata.name.clone()),
    )?;

    if ctx.accounts.token_mint.mint_authority != ctx.accounts.collection_mint.mint_authority {
        set_authority(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                SetAuthority {
                    current_authority: ctx.accounts.current_authority.to_account_info(),
                    account_or_mint: ctx.accounts.token_mint.to_account_info(),
                },
            ),
            AuthorityType::MintTokens,
            Some(ctx.accounts.mint_authority.key()),
        )?;
    }

    emit!(TokenCreated {
        config: ctx.accounts.config.key(),
        mint: ctx.accounts.token_mint.key(),
        collection: ctx.accounts.collection_mint.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub mint_authority: Signer<'info>,

    /// CHECK: Current token min authority
    pub current_authority: UncheckedAccount<'info>,

    /// The config
    #[account(
        mut,
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
        has_one = collection_mint,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    #[account(
        mint::token_program = token_program,
        constraint = collection_mint.mint_authority == Some(mint_authority.key()).into() @ RentNftError::NoAuthority
    )]
    pub collection_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        has_one = authorities_group
    )]
    pub collection_metadata: Box<Account<'info, Metadata>>,

    pub authorities_group: Account<'info, AuthoritiesGroup>,

    #[account(
        mut,
        mint::token_program = token_program,
        constraint = token_mint.mint_authority == Some(current_authority.key()).into() @ RentNftError::NoAuthority
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        has_one = authorities_group
    )]
    pub token_metadata: Account<'info, Metadata>,

    #[account(
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_state.token_mint.to_bytes()
        ],
        bump,
        has_one = token_mint,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// Common Solana programs
    pub token_program: Interface<'info, TokenInterface>,
    pub metadata_program: Program<'info, MetadataStandard>,
}

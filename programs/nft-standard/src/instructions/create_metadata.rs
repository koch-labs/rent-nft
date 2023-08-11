use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        mint_to, set_authority, spl_token_2022::instruction::AuthorityType, Mint, MintTo,
        SetAuthority, TokenAccount, TokenInterface,
    },
};

use crate::{
    constants::*,
    state::{AuthoritiesGroup, Metadata, MetadataData},
};

pub fn create_metadata(ctx: Context<CreateMetadata>, data: MetadataData) -> Result<()> {
    let metadata = &mut ctx.accounts.metadata;
    metadata.mint = ctx.accounts.mint.key();
    metadata.authorities_set = ctx.accounts.authorities_group.key();
    metadata.data = data;

    // Mint one token
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
            },
        ),
        1,
    )?;

    // Transfer ownership to the nft standard program
    set_authority(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            SetAuthority {
                current_authority: ctx.accounts.creator.to_account_info(),
                account_or_mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        AuthorityType::MintTokens,
        Some(ctx.accounts.authorities_group.key()),
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [
            AUTHORITIES_SEED.as_ref(),
            authorities_group.id.as_ref()
        ],
        bump
    )]
    pub authorities_group: Account<'info, AuthoritiesGroup>,

    #[account(
        init,
        payer = payer,
        mint::authority = creator,
        mint::decimals = 0,
        mint::token_program = token_program,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = creator,
        associated_token::token_program = token_program,
    )]
    pub token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        space = Metadata::LEN,
        seeds = [
            METADATA_SEED.as_ref(),
            mint.key().as_ref()
        ],
        bump
    )]
    pub metadata: Account<'info, Metadata>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

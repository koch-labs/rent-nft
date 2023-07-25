use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use shadow_nft_standard;
use shadow_nft_standard::common::creator_group::CreatorGroup;
use shadow_nft_standard::common::token_2022::{Mint, Token2022 as Token};
use shadow_nft_standard::instructions::create_collection::CreateCollectionArgs;

use crate::constants::*;
use crate::events::*;
use crate::state::*;

pub fn create_collection(
    ctx: Context<CreateCollection>,
    name: String,
    symbol: String,
    time_period: u32,
) -> Result<()> {
    msg!("Creating a collection");

    let config = &mut ctx.accounts.config;

    config.collection = ctx.accounts.collection.key();
    config.tax_mint = ctx.accounts.tax_mint.key();
    config.time_period = time_period;

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &ctx.accounts.collection.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    shadow_nft_standard::cpi::create_collection(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            shadow_nft_standard::cpi::accounts::CreateCollection {
                collection: ctx.accounts.collection.to_account_info(),
                creator_group: ctx.accounts.creator_group.to_account_info(),
                payer_creator: ctx.accounts.admin.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer_seeds,
        ),
        CreateCollectionArgs {
            name,
            symbol,
            for_minter: false,
            royalty_50bps: ctx
                .accounts
                .creator_group
                .creators
                .iter()
                .map(|_| 0)
                .collect(),
        },
    )?;

    emit!(CollectionCreated {
        collection: ctx.accounts.collection.key(),
        config: config.key(),
        tax_mint: config.tax_mint.key(),
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Delegatable creation
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Seeded authority
    #[account(
        seeds = [
            &collection.key().to_bytes(),
            COLLECTION_AUTHORITY_SEED.as_bytes(),
        ],
        bump,
    )]
    pub collection_authority: UncheckedAccount<'info>,

    /// The configuration
    #[account(
        init,
        payer = payer,
        space = CollectionConfig::LEN,
        seeds = [
            &collection.key().to_bytes(),
        ],
        bump,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The token used to pay taxes
    pub tax_mint: Box<Account<'info, Mint>>,

    /// The collection
    /// CHECK: Verifications handled by Shadow
    #[account(mut)]
    pub collection: UncheckedAccount<'info>,

    /// The creator group
    pub creator_group: Account<'info, CreatorGroup>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK: Metaplex
    #[account(address = shadow_nft_standard::ID)]
    pub metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

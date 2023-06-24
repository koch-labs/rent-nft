use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::instruction::builders::CreateBuilder;
use mpl_token_metadata::instruction::{CreateArgs, InstructionBuilder};
use mpl_token_metadata::state::{AssetData, PrintSupply, TokenStandard};

use crate::constants::*;
use crate::events::*;
use crate::state::*;

pub fn create_collection(ctx: Context<CreateCollection>, price_per_time_unit: u64) -> Result<()> {
    msg!("Creating a collection");

    let config = &mut ctx.accounts.config;

    config.collection_mint = ctx.accounts.collection_mint.key();
    config.admin_mint = ctx.accounts.admin_mint.key();
    config.tax_mint = ctx.accounts.tax_mint.key();
    config.price_per_time_unit = price_per_time_unit;

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &ctx.accounts.collection_mint.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signers_seeds = &[&authority_seeds[..]];

    // Mint the admin token
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.admin_mint.to_account_info(),
                to: ctx.accounts.admin_account.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signers_seeds,
        ),
        1,
    )?;

    // Mint the collection mint
    let asset_data = AssetData::new(
        TokenStandard::NonFungible,
        "name".to_string(),
        "HARBIE".to_string(),
        "uri".to_string(),
    );

    invoke_signed(
        &CreateBuilder::new()
            .mint(ctx.accounts.collection_mint.key())
            .metadata(ctx.accounts.collection_metadata.key())
            .master_edition(ctx.accounts.collection_master_edition.key())
            .authority(ctx.accounts.collection_authority.key())
            .update_authority(ctx.accounts.collection_authority.key())
            .update_authority_as_signer(true)
            .initialize_mint(true)
            .payer(ctx.accounts.payer.key())
            .spl_token_program(ctx.accounts.token_program.key())
            .sysvar_instructions(ctx.accounts.system_program.key())
            .system_program(ctx.accounts.system_program.key())
            .build(CreateArgs::V1 {
                asset_data,
                decimals: None,
                print_supply: Some(PrintSupply::Zero),
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.collection_master_edition.to_account_info(),
            ctx.accounts.collection_metadata.to_account_info(),
            ctx.accounts.collection_mint.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signers_seeds,
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

    /// CHECK: Delegatable creation
    pub admin: UncheckedAccount<'info>,

    /// The token representing the group authority
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_authority,
    )]
    pub admin_mint: Box<Account<'info, Mint>>,

    /// The account that receives the token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = admin_mint,
        associated_token::authority = admin,
    )]
    pub admin_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: Seeded authority
    #[account(
        seeds = [
            &collection_mint.key().to_bytes(),
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
            &collection_mint.key().to_bytes(),
        ],
        bump,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The token used to pay taxes
    pub tax_mint: Box<Account<'info, Mint>>,

    /// The mint of the collection
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_authority,
        mint::freeze_authority = collection_authority,
    )]
    pub collection_mint: Box<Account<'info, Mint>>,

    /// Metadata of the collection
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// Master edition of the collection
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub collection_master_edition: UncheckedAccount<'info>,

    /// The account storing the collection token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = collection_mint,
        associated_token::authority = collection_authority,
    )]
    pub collection_account: Box<Account<'info, TokenAccount>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK: Metaplex
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

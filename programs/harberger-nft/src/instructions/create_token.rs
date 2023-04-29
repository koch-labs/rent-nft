use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{
    create_master_edition_v3, create_metadata_accounts_v3, set_and_verify_collection,
    CreateMasterEditionV3, CreateMetadataAccountsV3, SetAndVerifyCollection,
};
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::state::{Creator, DataV2};

use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;

pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
    msg!("Creating a token");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;

    token_state.config = config.key();
    token_state.mint = ctx.accounts.token_mint.key();

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &ctx.accounts.collection_mint.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    // Mint
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.token_metadata.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.collection_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        ),
        DataV2 {
            name: "Name".to_string(),
            symbol: "NAME".to_string(),
            uri: "".to_string(),
            seller_fee_basis_points: 0,
            creators: Some(vec![Creator {
                address: ctx.accounts.collection_authority.key(),
                verified: true,
                share: 100,
            }]),
            collection: None,
            uses: None,
        },
        true,
        true,
        None,
    )?;

    create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.token_master_edition.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                update_authority: ctx.accounts.collection_authority.to_account_info(),
                mint_authority: ctx.accounts.collection_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                metadata: ctx.accounts.token_metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        ),
        None,
    )?;

    set_and_verify_collection(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            SetAndVerifyCollection {
                metadata: ctx.accounts.token_metadata.to_account_info(),
                update_authority: ctx.accounts.collection_authority.to_account_info(),
                collection_authority: ctx.accounts.collection_authority.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx.accounts.collection_master_edition.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
            },
            signer_seeds,
        ),
        None,
    )?;

    emit!(TokenCreated {
        config: config.key(),
        mint: ctx.accounts.token_mint.key(),
        collection_mint: ctx.accounts.collection_mint.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Delegatable creation
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
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
        has_one = collection_mint,
        has_one = admin_mint,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The token representing the group authority
    pub admin_mint: Box<Account<'info, Mint>>,

    /// The account that receives the token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = admin_mint,
        associated_token::authority = admin,
        constraint = admin_account.amount == 1 @ HarbergerError::NotAdmin,
    )]
    pub admin_account: Box<Account<'info, TokenAccount>>,

    /// The mint of the collection
    #[account(mut)]
    pub collection_mint: Box<Account<'info, Mint>>,

    /// Metadata of the collection
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    /// Master edition of the collection
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub collection_master_edition: UncheckedAccount<'info>,

    /// The mint of the new token
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = collection_authority,
        mint::freeze_authority = collection_authority,
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    /// Metadata of the collection
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_metadata: UncheckedAccount<'info>,

    /// Master edition of the collection
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_master_edition: UncheckedAccount<'info>,

    /// The account storing the collection token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = collection_authority,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// The wrapper
    #[account(
        init,
        payer = payer,
        space = TokenState::LEN,
        seeds = [
            &config.collection_mint.to_bytes(),
            &token_mint.key().to_bytes()
        ],
        bump,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK: Metaplex
    #[account(address = mpl_token_metadata::ID)]
    pub metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

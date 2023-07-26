use std::str::FromStr;

use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use shadow_nft_standard::{
    common::{
        collection::Collection,
        creator_group::CreatorGroup,
        token_2022::{Mint, Token2022 as Token, TokenAccount},
        Url,
    },
    instructions::create::CreateMetaArgs,
};

use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateTokenArgs {
    pub update_authority: Pubkey,
    pub name: String,
    pub uri: String,
    pub mutable: bool,
    pub collection_key: Pubkey,
}

pub fn create_token(ctx: Context<CreateToken>, args: CreateTokenArgs) -> Result<()> {
    msg!("Creating a token");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;

    token_state.config = config.key();
    token_state.token_mint = ctx.accounts.token_mint.key();
    token_state.last_period = Clock::get()?.unix_timestamp;
    token_state
        .total_bids_window
        .resize(config.contest_window_size as usize, 0);

    let authority_bump = *ctx.bumps.get("collection_authority").unwrap();
    let authority_seeds = &[
        &ctx.accounts.collection.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    shadow_nft_standard::cpi::create_metadata_account(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            shadow_nft_standard::cpi::accounts::CreateMetadataAccount {
                metadata: ctx.accounts.token_metadata.to_account_info(),
                creator_group: ctx.accounts.creator_group.to_account_info(),
                asset_mint: ctx.accounts.token_mint.to_account_info(),
                collection: ctx.accounts.collection.to_account_info(),
                payer_creator: ctx.accounts.admin.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer_seeds,
        ),
        CreateMetaArgs {
            update_authority: args.update_authority,
            name: args.name,
            uri: Url::from_str(args.uri.as_str()).unwrap(),
            mutable: args.mutable,
            collection_key: args.collection_key,
        },
    )?;

    shadow_nft_standard::cpi::mint_nft(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            shadow_nft_standard::cpi::accounts::MintNFT {
                metadata: ctx.accounts.token_metadata.to_account_info(),
                asset_mint: ctx.accounts.token_mint.to_account_info(),
                minter: ctx.accounts.admin.to_account_info(),
                minter_ata: ctx.accounts.admin_token_account.to_account_info(),
                collection: ctx.accounts.collection.to_account_info(),
                associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer_seeds,
        ),
        0,
    )?;

    emit!(TokenCreated {
        config: config.key(),
        mint: ctx.accounts.token_mint.key(),
        collection: ctx.accounts.collection.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Delegatable creation
    #[account(mut)]
    pub receiver: UncheckedAccount<'info>,

    /// The creator group
    pub creator_group: Account<'info, CreatorGroup>,

    /// CHECK: Seeded authority
    #[account(
        mut,
        seeds = [
            &config.collection.to_bytes(),
            COLLECTION_AUTHORITY_SEED.as_bytes(),
        ],
        bump,
    )]
    pub collection_authority: UncheckedAccount<'info>,

    /// The config
    #[account(
        seeds = [
            &config.collection.to_bytes(),
        ],
        bump,
        has_one = collection,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The Shadow collection
    #[account(
        mut,
        constraint = collection.creator_group_key == creator_group.key() @ RentNftError::BadCreatorGroup
    )]
    pub collection: Box<Account<'info, Collection>>,

    /// The mint of the new token
    /// CHECK: Will be initialized by Shadow
    #[account(mut)]
    pub token_mint: UncheckedAccount<'info>,

    /// Metadata of the token
    /// CHECK: Verified by Shadow
    #[account(mut)]
    pub token_metadata: UncheckedAccount<'info>,

    /// The account storing the collection token
    /// CHECK: Will be initialized by Shadow
    #[account(
        mut,
        address = anchor_spl::associated_token::get_associated_token_address_with_program_id(
            receiver.key,
            &token_mint.key(),
            &token_program.key(),
        )
    )]
    pub token_account: UncheckedAccount<'info>,

    /// The account storing the collection token
    /// CHECK: Will be initialized by Shadow
    #[account(
        mut,
        address = anchor_spl::associated_token::get_associated_token_address_with_program_id(
            admin.key,
            &token_mint.key(),
            &token_program.key(),
        )
    )]
    pub admin_token_account: UncheckedAccount<'info>,

    /// The wrapper
    #[account(
        init,
        payer = payer,
        space = TokenState::len(config.contest_window_size),
        seeds = [
            &config.collection.to_bytes(),
            &token_mint.key().to_bytes()
        ],
        bump,
    )]
    pub token_state: Box<Account<'info, TokenState>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK: Shadow standard
    #[account(address = shadow_nft_standard::ID)]
    pub metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

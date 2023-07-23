use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::instruction::builders::{CreateBuilder, MintBuilder, VerifyBuilder};
use mpl_token_metadata::instruction::{CreateArgs, InstructionBuilder, MintArgs, VerificationArgs};
use mpl_token_metadata::state::{AssetData, Collection, PrintSupply, TokenStandard};

use crate::constants::*;
use crate::errors::*;
use crate::events::*;
use crate::state::*;

pub fn create_token(ctx: Context<CreateToken>) -> Result<()> {
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
        &ctx.accounts.collection_mint.key().to_bytes(),
        COLLECTION_AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signers_seeds = &[&authority_seeds[..]];

    let mut asset_data = AssetData::new(
        TokenStandard::ProgrammableNonFungible,
        "name".to_string(),
        "symbol".to_string(),
        "uri".to_string(),
    );
    asset_data.collection = Some(Collection {
        verified: false,
        key: config.collection_mint,
    });

    invoke_signed(
        &CreateBuilder::new()
            .mint(ctx.accounts.token_mint.key())
            .metadata(ctx.accounts.token_metadata.key())
            .master_edition(ctx.accounts.token_master_edition.key())
            .authority(ctx.accounts.collection_authority.key())
            .update_authority(ctx.accounts.collection_authority.key())
            .update_authority_as_signer(true)
            .initialize_mint(true)
            .payer(ctx.accounts.payer.key())
            .sysvar_instructions(ctx.accounts.system_program.key())
            .build(CreateArgs::V1 {
                asset_data,
                decimals: None,
                print_supply: Some(PrintSupply::Zero),
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.token_master_edition.to_account_info(),
            ctx.accounts.token_metadata.to_account_info(),
            ctx.accounts.token_mint.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signers_seeds,
    )?;

    invoke_signed(
        &VerifyBuilder::new()
            .metadata(ctx.accounts.token_metadata.key())
            .collection_master_edition(ctx.accounts.collection_master_edition.key())
            .authority(ctx.accounts.collection_authority.key())
            .collection_metadata(ctx.accounts.collection_metadata.key())
            .collection_mint(ctx.accounts.collection_mint.key())
            .delegate_record(ctx.accounts.delegate_record.key())
            .sysvar_instructions(ctx.accounts.system_program.key())
            .build(VerificationArgs::CollectionV1)
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.token_metadata.to_account_info(),
            ctx.accounts.collection_master_edition.to_account_info(),
            ctx.accounts.collection_metadata.to_account_info(),
            ctx.accounts.collection_mint.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.delegate_record.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signers_seeds,
    )?;

    invoke_signed(
        &MintBuilder::new()
            .mint(ctx.accounts.token_mint.key())
            .metadata(ctx.accounts.token_metadata.key())
            .master_edition(ctx.accounts.token_master_edition.key())
            .token(ctx.accounts.token_account.key())
            .authority(ctx.accounts.collection_authority.key())
            .token_owner(ctx.accounts.receiver.key())
            .delegate_record(ctx.accounts.delegate_record.key())
            .token_record(ctx.accounts.token_record.key())
            .payer(ctx.accounts.payer.key())
            .sysvar_instructions(ctx.accounts.system_program.key())
            .build(MintArgs::V1 {
                amount: 1,
                authorization_data: None,
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.token_mint.to_account_info(),
            ctx.accounts.token_metadata.to_account_info(),
            ctx.accounts.token_master_edition.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.receiver.to_account_info(),
            ctx.accounts.delegate_record.to_account_info(),
            ctx.accounts.token_record.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signers_seeds,
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

    pub admin: Signer<'info>,

    /// CHECK: Delegatable creation
    pub receiver: UncheckedAccount<'info>,

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
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    /// The account that receives the token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = collection_mint,
        associated_token::authority = admin,
        constraint = admin_collection_account.amount == 1 @ HarbergerError::NotAdmin,
    )]
    pub admin_collection_account: Box<Account<'info, TokenAccount>>,

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

    /// Metadata of the token
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_metadata: UncheckedAccount<'info>,

    /// Master edition of the token
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_master_edition: UncheckedAccount<'info>,

    /// Delegate record of the programmable token
    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub delegate_record: UncheckedAccount<'info>,

    /// CHECK: Verified by Metaplex
    #[account(mut)]
    pub token_record: UncheckedAccount<'info>,

    /// The account storing the collection token
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = receiver,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// The wrapper
    #[account(
        init,
        payer = payer,
        space = TokenState::len(config.contest_window_size),
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

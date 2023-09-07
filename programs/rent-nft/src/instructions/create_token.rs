use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::{
        create_idempotent, get_associated_token_address_with_program_id, AssociatedToken, Create,
    },
    token_interface::{
        initialize_mint, mint_to, spl_token_2022::instruction::initialize_permanent_delegate,
        InitializeMint, Mint, MintTo, TokenAccount, TokenInterface,
    },
};
use metadata_standard::{
    cpi::{
        accounts::{CreateMetadata, IncludeInSet},
        create_external_metadata, include_in_set,
    },
    program::MetadataStandard,
    state::{AuthoritiesGroup, Metadata},
};

use crate::events::*;
use crate::state::*;

pub fn create_token(
    ctx: Context<CreateToken>,
    uri: String,
    content_hash: [u8; 32],
    name: String,
) -> Result<()> {
    msg!("Creating a token");

    let config = &mut ctx.accounts.config;
    let token_state = &mut ctx.accounts.token_state;

    token_state.config = config.key();
    token_state.token_mint = ctx.accounts.token_mint.key();
    token_state.current_selling_price = config.minimum_sell_price;

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&ctx.accounts.collection_mint.key().to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    invoke_signed(
        &initialize_permanent_delegate(
            ctx.accounts.token_program.key,
            &ctx.accounts.token_mint.key(),
            &config.key(),
        )?,
        &[
            ctx.accounts.token_program.to_account_info(),
            config.to_account_info(),
            ctx.accounts.token_mint.to_account_info(),
        ],
        signer_seeds,
    )?;

    initialize_mint(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            InitializeMint {
                mint: ctx.accounts.token_mint.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        0,
        &config.key(),
        Some(&config.key()),
    )?;

    create_idempotent(CpiContext::new(
        ctx.accounts.associated_token_program.to_account_info(),
        Create {
            payer: ctx.accounts.payer.to_account_info(),
            associated_token: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.receiver.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        },
    ))?;

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                to: ctx.accounts.token_account.to_account_info(),
                authority: config.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    create_external_metadata(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadata {
                payer: ctx.accounts.payer.to_account_info(),
                mint_authority: config.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                metadata: ctx.accounts.token_metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer_seeds,
        ),
        uri,
        content_hash,
        name,
    )?;

    include_in_set(CpiContext::new_with_signer(
        ctx.accounts.metadata_program.to_account_info(),
        IncludeInSet {
            payer: ctx.accounts.payer.to_account_info(),
            inclusion_authority: config.to_account_info(),
            authorities_group: ctx.accounts.authorities_group.to_account_info(),
            parent_metadata: ctx.accounts.collection_metadata.to_account_info(),
            child_metadata: ctx.accounts.token_metadata.to_account_info(),
            inclusion: ctx.accounts.inclusion.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        },
        signer_seeds,
    ))?;

    emit!(TokenCreated {
        config: config.key(),
        mint: ctx.accounts.token_mint.key(),
        collection: ctx.accounts.collection_mint.key()
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
    pub receiver: UncheckedAccount<'info>,

    /// The config
    #[account(
        seeds = [
            &config.collection_mint.to_bytes(),
        ],
        bump,
        has_one = collection_mint,
    )]
    pub config: Box<Account<'info, CollectionConfig>>,

    pub collection_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        address = get_associated_token_address_with_program_id(
            admin.key,
            &collection_mint.key(),
            &token_program.key(),
        ),
        constraint = admin_collection_mint_account.amount == 1,
    )]
    pub admin_collection_mint_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        has_one = authorities_group
    )]
    pub collection_metadata: Box<Account<'info, Metadata>>,

    pub authorities_group: Account<'info, AuthoritiesGroup>,

    /// The mint of the new token
    /// CHECK: Will be initialized by Standard
    #[account(
        init,
        owner = token_program.key(),
        payer = payer,
        space = 202, // Token2022 mint with permanent delegation extension
        mint::token_program = token_program,
    )]
    pub token_mint: AccountInfo<'info>,

    /// Metadata of the token
    /// CHECK: Verified by Standard
    #[account(mut)]
    pub token_metadata: UncheckedAccount<'info>,

    /// Proof of inclusion
    /// CHECK: Verified by Standard
    #[account(mut)]
    pub inclusion: UncheckedAccount<'info>,

    /// The account storing the new token
    /// CHECK: Will be initialized by Standard
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

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
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, MetadataStandard>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

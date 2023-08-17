use crate::events::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::associated_token::Create;
use anchor_spl::associated_token::{
    create_idempotent, get_associated_token_address_with_program_id,
};
use anchor_spl::token_interface::{mint_to, Mint, MintTo, TokenAccount, TokenInterface};
use nft_standard::cpi::{
    accounts::{CreateAuthoritiesGroup, CreateMetadata},
    create_authorities_group, create_external_metadata,
};
use nft_standard::program::NftStandard;

pub fn create_collection(
    ctx: Context<CreateCollection>,
    id: Pubkey,
    uri: String,
    time_period: u32,
    tax_rate: u64,
    min_price: u64,
) -> Result<()> {
    msg!("Creating a collection");
    let config = &mut ctx.accounts.config;

    config.collection_mint = ctx.accounts.collection_mint.key();
    config.tax_mint = ctx.accounts.tax_mint.key();
    config.time_period = time_period;
    config.tax_rate = tax_rate;
    config.minimum_sell_price = min_price;

    let authority_bump = *ctx.bumps.get("config").unwrap();
    let authority_seeds = &[
        (&ctx.accounts.collection_mint.key().to_bytes()) as &[u8],
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    // Create collection's tax account
    create_idempotent(CpiContext::new(
        ctx.accounts.associated_token_program.to_account_info(),
        Create {
            payer: ctx.accounts.payer.to_account_info(),
            associated_token: ctx.accounts.bids_account.to_account_info(),
            authority: config.to_account_info(),
            mint: ctx.accounts.tax_mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.tax_token_program.to_account_info(),
        },
    ))?;

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                to: ctx.accounts.admin_collection_mint_account.to_account_info(),
                authority: config.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    create_authorities_group(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateAuthoritiesGroup {
                payer: ctx.accounts.payer.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer_seeds,
        ),
        id,
        config.key(),
        config.key(),
    )?;

    create_external_metadata(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadata {
                payer: ctx.accounts.payer.to_account_info(),
                authorities_group: ctx.accounts.authorities_group.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                metadata: ctx.accounts.collection_metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer_seeds,
        ),
        uri,
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

    #[account(mut)]
    pub admin: Signer<'info>,

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

    #[account(mint::token_program = tax_token_program)]
    pub tax_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: Verified by Koch Standard
    #[account(mut)]
    pub authorities_group: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::authority = config,
        mint::decimals = 0,
        mint::token_program = token_program,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    /// CHECK: Verified by Koch Standard
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = collection_mint,
        associated_token::authority = admin,
        associated_token::token_program = token_program,
    )]
    pub admin_collection_mint_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Tax ATA
    #[account(
        mut,
        address = get_associated_token_address_with_program_id(
            &config.key(),
            &tax_mint.key(),
            &tax_token_program.key(),
        ),
    )]
    pub bids_account: UncheckedAccount<'info>,

    /// Common Solana programs
    pub tax_token_program: Interface<'info, TokenInterface>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, NftStandard>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

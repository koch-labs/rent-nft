use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use crate::constants::*;
use crate::events::*;
use crate::state::*;

pub fn create_group(ctx: Context<CreateGroup>, id: Pubkey, price_per_time_unit: u64) -> Result<()> {
    msg!("Creating a config");

    let group = &mut ctx.accounts.group;

    group.id = id;
    group.admin_mint = ctx.accounts.admin_mint.key();
    group.tax_mint = ctx.accounts.tax_mint.key();
    group.price_per_time_unit = price_per_time_unit;

    // Mint the admin token
    let authority_bump = *ctx.bumps.get("treasury").unwrap();
    let authority_seeds = &[&id.to_bytes(), TREASURY_SEED.as_bytes(), &[authority_bump]];
    let signer_seeds = &[&authority_seeds[..]];
    let mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.admin_mint.to_account_info(),
            to: ctx.accounts.admin_account.to_account_info(),
            authority: ctx.accounts.treasury.to_account_info(),
        },
        signer_seeds,
    );
    token::mint_to(mint_ctx, 1)?;

    emit!(GroupCreated {
        group: group.key(),
        tax_mint: group.tax_mint.key(),
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct CreateGroup<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Delegatable creation
    pub admin: UncheckedAccount<'info>,

    /// Account handling users deposits
    /// CHECK: Seeded authority
    #[account(
        seeds = [
            &id.to_bytes(),
            DEPOSITS_SEED.as_bytes(),
        ],
        bump,
    )]
    pub deposits: UncheckedAccount<'info>,

    /// Account handling paid taxes
    /// CHECK: Seeded authority
    #[account(
        seeds = [
            &id.to_bytes(),
            TREASURY_SEED.as_bytes(),
        ],
        bump,
    )]
    pub treasury: UncheckedAccount<'info>,

    /// The configuration
    #[account(
        init,
        payer = payer,
        space = HarbergerGroup::LEN,
        seeds = [
            &id.to_bytes(),
        ],
        bump,
    )]
    pub group: Box<Account<'info, HarbergerGroup>>,

    /// The token representing the group authority
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = treasury,
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

    /// The token used to pay taxes
    pub tax_mint: Box<Account<'info, Mint>>,

    /// The account storing the tax treasury
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = tax_mint,
        associated_token::authority = deposits,
    )]
    pub deposits_account: Box<Account<'info, TokenAccount>>,

    /// The account storing the tax deposits
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = tax_mint,
        associated_token::authority = treasury,
    )]
    pub treasury_account: Box<Account<'info, TokenAccount>>,

    /// Common Solana programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

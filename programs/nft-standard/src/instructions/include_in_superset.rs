use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::*,
    state::{validate_inclusion, Inclusion, Metadata, SupersetInclusion},
};

pub fn include_in_superset(ctx: Context<IncludeInSuperset>, bumps: &[u8]) -> Result<()> {
    msg!("{} {}", bumps.len(), ctx.remaining_accounts.len());
    if bumps.len() * 2 + 1 != ctx.remaining_accounts.len() {
        return err!(NftStandardError::InvalidBumps);
    }

    for i in 0..(bumps.len() - 1) {
        let parent_metadata: Account<Metadata> =
            Account::try_from_unchecked(&ctx.remaining_accounts[i]).unwrap();
        if i == 0 && parent_metadata.key() != ctx.accounts.parent_metadata.key() {
            return err!(NftStandardError::InvalidPathStart);
        }

        let inclusion: Account<Inclusion> =
            Account::try_from_unchecked(&ctx.remaining_accounts[i + 1]).unwrap();

        let child_metadata: Account<Metadata> =
            Account::try_from_unchecked(&ctx.remaining_accounts[i + 2]).unwrap();
        if i == bumps.len() / 2 && child_metadata.key() != ctx.accounts.child_metadata.key() {
            return err!(NftStandardError::InvalidPathEnd);
        }

        if !validate_inclusion(
            &parent_metadata,
            &child_metadata,
            &inclusion.to_account_info(),
            bumps[i],
        ) {
            return err!(NftStandardError::InvalidPath);
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct IncludeInSuperset<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            METADATA_SEED.as_ref(),
            parent_metadata.mint.as_ref()
        ],
        bump,
    )]
    pub parent_metadata: Account<'info, Metadata>,

    #[account(
        mut,
        seeds = [
            METADATA_SEED.as_ref(),
            child_metadata.mint.as_ref()
        ],
        bump,
    )]
    pub child_metadata: Account<'info, Metadata>,

    #[account(
        init,
        payer = payer,
        space = SupersetInclusion::LEN,
        seeds = [
            SUPERSET_SEED.as_ref(),
            parent_metadata.key().as_ref(),
            child_metadata.key().as_ref(),
        ],
        bump
    )]
    pub inclusion: Account<'info, SupersetInclusion>,

    pub system_program: Program<'info, System>,
}

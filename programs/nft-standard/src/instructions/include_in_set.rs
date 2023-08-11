use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::*,
    state::{AuthoritiesGroup, Inclusion, Metadata},
};

pub fn include_in_set(_: Context<IncludeInSet>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct IncludeInSet<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub inclusion_authority: Signer<'info>,

    #[account(
        seeds = [
            AUTHORITIES_SEED.as_ref(),
            parent_authorities_group.id.as_ref()
        ],
        bump,
        has_one = inclusion_authority,
    )]
    pub parent_authorities_group: Account<'info, AuthoritiesGroup>,

    #[account(
        mut,
        seeds = [
            METADATA_SEED.as_ref(),
            parent_metadata.mint.as_ref()
        ],
        bump,
        constraint = parent_metadata.authorities_group == parent_authorities_group.key() @ NftStandardError::WrongAuthoritiesGroup,
    )]
    pub parent_metadata: Account<'info, Metadata>,

    #[account(
        seeds = [
            AUTHORITIES_SEED.as_ref(),
            parent_authorities_group.id.as_ref()
        ],
        bump,
        has_one = inclusion_authority,
    )]
    pub child_authorities_group: Account<'info, AuthoritiesGroup>,

    #[account(
        mut,
        seeds = [
            METADATA_SEED.as_ref(),
            child_metadata.mint.as_ref()
        ],
        bump,
        constraint = parent_metadata.authorities_group == parent_authorities_group.key() @ NftStandardError::WrongAuthoritiesGroup,
    )]
    pub child_metadata: Account<'info, Metadata>,

    #[account(
        init,
        payer = payer,
        space = Inclusion::LEN,
        seeds = [
            INCLUSION_SEED.as_ref(),
            parent_metadata.key().as_ref(),
            child_metadata.key().as_ref(),
        ],
        bump
    )]
    pub inclusion: Account<'info, Inclusion>,

    pub system_program: Program<'info, System>,
}

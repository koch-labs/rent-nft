use anchor_lang::prelude::*;

use crate::{constants::AUTHORITIES_SEED, state::AuthoritiesGroup};

pub fn create_authorities_group(
    ctx: Context<CreateAuthoritiesGroup>,
    id: Pubkey,
    transfer_authority: Pubkey,
    update_authority: Pubkey,
    inclusion_authority: Pubkey,
) -> Result<()> {
    let group = &mut ctx.accounts.authorities_group;
    group.id = id;
    group.transfer_authority = transfer_authority;
    group.update_authority = update_authority;
    group.inclusion_authority = inclusion_authority;

    Ok(())
}

#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct CreateAuthoritiesGroup<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = AuthoritiesGroup::LEN,
        seeds = [
            AUTHORITIES_SEED.as_ref(),
            id.as_ref()
        ],
        bump
    )]
    pub authorities_group: Account<'info, AuthoritiesGroup>,

    pub system_program: Program<'info, System>,
}

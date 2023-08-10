pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

use anchor_lang::prelude::*;

declare_id!("9msweUGitRR1ELUe4XZi6xhecPCko54kSqSnfWH7LLiZ");

#[program]
pub mod nft_standard {

    use super::*;

    pub fn create_authorities_group(
        ctx: Context<CreateAuthoritiesGroup>,
        id: Pubkey,
        transfer_authority: Pubkey,
        update_authority: Pubkey,
        inclusion_authority: Pubkey,
    ) -> Result<()> {
        instructions::create_authorities_group(
            ctx,
            id,
            transfer_authority,
            update_authority,
            inclusion_authority,
        )
    }

    // pub fn set_authorities_group(
    //     ctx: Context<CreateAuthorityNode>,
    //     node_type: AuthorityNodeType,
    // ) -> Result<()> {
    //     instructions::create_authority_node(ctx, node_type)
    // }
}

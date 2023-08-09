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
    use crate::state::AuthorityNodeType;

    use super::*;

    pub fn create_authority_node(
        ctx: Context<CreateAuthorityNode>,
        node_type: AuthorityNodeType,
    ) -> Result<()> {
        instructions::create_authority_node(ctx, node_type)
    }

    pub fn set_authority_node(
        ctx: Context<CreateAuthorityNode>,
        node_type: AuthorityNodeType,
    ) -> Result<()> {
        instructions::create_authority_node(ctx, node_type)
    }
}

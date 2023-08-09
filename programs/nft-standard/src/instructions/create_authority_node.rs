use anchor_lang::prelude::*;

use crate::state::{AuthorityNode, AuthorityNodeType};

pub fn create_authority_node(
    ctx: Context<CreateAuthorityNode>,
    node_type: AuthorityNodeType,
) -> Result<()> {
    let node = &mut ctx.accounts.authority_node;
    node.controller = *ctx.accounts.controller.key;
    node.node_type = node_type;

    node.validate(ctx.remaining_accounts.to_vec())?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateAuthorityNode<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub controller: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = AuthorityNode::LEN,
    )]
    pub authority_node: Account<'info, AuthorityNode>,

    pub system_program: Program<'info, System>,
}

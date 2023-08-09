use anchor_lang::prelude::*;

use crate::state::{AuthorityNode, AuthorityNodeType};

pub fn set_authority_node(
    ctx: Context<SetAuthorityNode>,
    controller: Pubkey,
    node_type: AuthorityNodeType,
) -> Result<()> {
    let node = &mut ctx.accounts.authority_node;
    node.controller = controller;
    node.node_type = node_type;

    node.validate(ctx.remaining_accounts.to_vec())?;

    Ok(())
}

#[derive(Accounts)]
pub struct SetAuthorityNode<'info> {
    pub controller: Signer<'info>,

    #[account(
        mut,
        has_one = controller,
    )]
    pub authority_node: Account<'info, AuthorityNode>,

    pub system_program: Program<'info, System>,
}

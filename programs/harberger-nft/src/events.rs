use anchor_lang::prelude::*;

#[event]
pub struct GroupCreated {
    /// The group
    #[index]
    pub group: Pubkey,

    /// The tax mint
    pub tax_mint: Pubkey,
}

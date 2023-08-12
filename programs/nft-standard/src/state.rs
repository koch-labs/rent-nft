use anchor_lang::prelude::*;

use crate::constants::{MAX_URI_LENGTH, METADATA_SEED};

#[account]
pub struct AuthoritiesGroup {
    pub id: Pubkey,

    pub transfer_authority: Pubkey,

    pub update_authority: Pubkey,

    pub inclusion_authority: Pubkey,
}

impl AuthoritiesGroup {
    pub const LEN: usize = 8 // Discriminator
        + 32 // ID
        + 32 // Transfer
        + 32 // Update
        + 32; // Inclusion
}

/// Onchain Data Type describes the format of the onchain data
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum OnchainDataType {
    Bytes,
    Hex,
    Base64,
}

/// Metadata type describes how the actual token data is stored
#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum MetadataData {
    External {
        uri: String,
    },
    Reference {
        metadata_account: Pubkey,
    },
    Onchain {
        data_type: OnchainDataType,
        data_account: Pubkey,
    },
}

impl MetadataData {
    pub const LEN: usize = 1 + MAX_URI_LENGTH;
}

#[account]
pub struct Metadata {
    pub mint: Pubkey,

    pub authorities_group: Pubkey,

    pub set_version_counter: u32,

    pub data: MetadataData,
}

impl Metadata {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Mint
        + 32 // Authorities
        + 4 // SVC
        + MetadataData::LEN; // Metadata
}

pub fn validate_inclusion(
    parent: &Account<Metadata>,
    child: &Account<Metadata>,
    inclusion: &AccountInfo,
    bump: u8,
) -> bool {
    let (_key, _bump) = Pubkey::find_program_address(
        &[
            METADATA_SEED.as_ref(),
            parent.key().as_ref(),
            child.key().as_ref(),
        ],
        &crate::ID,
    );

    inclusion.key() == _key && bump == _bump
}

#[account]
pub struct Inclusion {}

impl Inclusion {
    pub const LEN: usize = 8; // Discriminator
}

#[account]
pub struct SupersetInclusion {}

impl SupersetInclusion {
    pub const LEN: usize = 8; // Discriminator
}

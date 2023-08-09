use anchor_lang::prelude::*;

use crate::constants::MAX_URI_LENGTH;

/// Onchain Data Type describes the format of the onchain data
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum OnchainDataType {
    Bytes,
    Hex,
    Base64,
}

/// Metadata type describes how the actual token data is stored
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum MetadataType {
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

impl MetadataType {
    pub const LEN: usize = 1 + MAX_URI_LENGTH;
}

#[account]
pub struct Metadata {
    pub mint: Pubkey,

    pub metadata_type: MetadataType,

    pub authority: Pubkey,
}

impl Metadata {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Mint
        + MetadataType::LEN // Metadata
        + 32; // Authority
}

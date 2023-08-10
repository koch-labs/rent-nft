use anchor_lang::prelude::*;

use crate::constants::MAX_URI_LENGTH;

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

// /// Onchain Data Type describes the format of the onchain data
// #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
// pub enum OnchainDataType {
//     Bytes,
//     Hex,
//     Base64,
// }

// /// Metadata type describes how the actual token data is stored
// #[derive(AnchorDeserialize, AnchorSerialize, Clone)]
// pub enum MetadataType {
//     External {
//         uri: String,
//     },
//     Reference {
//         metadata_account: Pubkey,
//     },
//     Onchain {
//         data_type: OnchainDataType,
//         data_account: Pubkey,
//     },
// }

// impl MetadataType {
//     pub const LEN: usize = 1 + MAX_URI_LENGTH;
// }

#[account]
pub struct Metadata {
    pub mint: Pubkey,

    // pub metadata_type: MetadataType,
    pub authorities_set: Pubkey,
}

impl Metadata {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Mint
        // + MetadataType::LEN // Metadata
        + 32; // Authorities
}

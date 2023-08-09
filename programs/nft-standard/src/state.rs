use anchor_lang::prelude::*;

use crate::{constants::MAX_URI_LENGTH, errors::NftStandardError};

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

    pub authorities_set: Pubkey,
}

impl Metadata {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Mint
        + MetadataType::LEN // Metadata
        + 32; // Authorities
}

/// There is a set of authorities, one for each action.
/// Although sets can have redundant elements, only one set can be used for any number of NFT.
#[account]
pub struct AuthoritiesSet {
    pub freeze: Pubkey,

    pub update: Pubkey,

    pub mint: Pubkey,

    pub print: Pubkey,
}

impl AuthoritiesSet {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Freeze
        + 32 // Update
        + 32 // Print
        + 32; // Mint
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum AuthorityNodeType {
    Signing { signer: Pubkey },
    Owning { owner: Pubkey },
}

impl AuthorityNodeType {
    pub const LEN: usize = 1 + 32;
}

/// Authority nodes are the building blocks of validation circuits.
/// A circuit is valid if all condition have been recursively validated.
/// Each node has a controller than can update the node at any time.
#[account]
pub struct AuthorityNode {
    pub controller: Pubkey,

    pub node_type: AuthorityNodeType,
}

impl AuthorityNode {
    pub const LEN: usize = 8 // Discriminator
        + 32 // Controller
        + AuthorityNodeType::LEN; // Type

    pub fn validate(&self, accounts: Vec<AccountInfo>) -> Result<()> {
        match self.node_type {
            AuthorityNodeType::Owning { owner } => {
                todo!();
            }
            AuthorityNodeType::Signing { signer } => {
                if let Some(_) = accounts
                    .iter()
                    .position(|e| *e.key == signer && e.is_signer)
                {
                    Ok(())
                } else {
                    err!(NftStandardError::InvalidSigner)
                }
            }
        }
    }
}

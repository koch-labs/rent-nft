pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("FQ9MA87E8H8B3aGxnGQwmXNGzgRTap9WL9Yhk3GZT9w8");

#[program]
pub mod rent_nft {
    use super::*;

    /// Initializes a collection from an existing metadata
    /// The metadata update authority will be transfered to the collection
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        tax_mint: Pubkey,
        tax_collector: Pubkey,
        time_period: u32,
        tax_rate: u64,
        min_price: u64,
    ) -> Result<()> {
        instructions::create_collection(
            ctx,
            tax_mint,
            tax_collector,
            time_period,
            tax_rate,
            min_price,
        )
    }

    pub fn update_collection(
        ctx: Context<UpdateCollection>,
        tax_collector: Option<Pubkey>,
        time_period: Option<u32>,
        tax_rate: Option<u64>,
        min_price: Option<u64>,
        uri: Option<String>,
        content_hash: Option<[u8; 32]>,
        name: Option<String>,
    ) -> Result<()> {
        instructions::update_collection(
            ctx,
            tax_collector,
            time_period,
            tax_rate,
            min_price,
            uri,
            content_hash,
            name,
        )
    }

    pub fn create_token(
        ctx: Context<CreateToken>,
        uri: String,
        content_hash: [u8; 32],
        name: String,
    ) -> Result<()> {
        instructions::create_token(ctx, uri, content_hash, name)
    }

    pub fn update_token(
        ctx: Context<UpdateToken>,
        uri: Option<String>,
        content_hash: Option<[u8; 32]>,
        name: Option<String>,
    ) -> Result<()> {
        instructions::update_token(ctx, uri, content_hash, name)
    }

    pub fn create_bid(ctx: Context<CreateBid>) -> Result<()> {
        instructions::create_bid(ctx)
    }

    pub fn increase_bid(ctx: Context<IncreaseBid>, amount: u64) -> Result<()> {
        instructions::increase_bid(ctx, amount)
    }

    pub fn decrease_bid(ctx: Context<DecreaseBid>, amount: u64) -> Result<()> {
        instructions::decrease_bid(ctx, amount)
    }

    pub fn claim_token(ctx: Context<ClaimToken>) -> Result<()> {
        instructions::claim_token(ctx)
    }

    pub fn buy_token(ctx: Context<BuyToken>, new_sell_price: u64) -> Result<()> {
        instructions::buy_token(ctx, new_sell_price)
    }

    pub fn update_bid(ctx: Context<UpdateBid>) -> Result<()> {
        instructions::update_bid(ctx)
    }

    pub fn withdraw_tax(ctx: Context<WithdrawTax>) -> Result<()> {
        instructions::withdraw_tax(ctx)
    }
}

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("TNS1111111111111111111111111111111111111111");

#[program]
pub mod troptions_namespace {
    use super::*;

    pub fn initialize_namespace(
        ctx: Context<InitializeNamespace>,
        name: String,
        ipfs_metadata: String,
        rarity_class: String,
        tier: String,
    ) -> Result<()> {
        let namespace = &mut ctx.accounts.namespace_account;
        namespace.owner = *ctx.accounts.owner.key;
        namespace.name = name;
        namespace.ipfs_metadata = ipfs_metadata;
        namespace.rarity_class = rarity_class;
        namespace.tier = tier;
        namespace.tba_wallet = Pubkey::default();
        namespace.minted_at = Clock::get()?.unix_timestamp;
        namespace.bump = ctx.bumps.namespace_account;
        
        emit!(NamespaceMinted {
            name: namespace.name.clone(),
            owner: namespace.owner,
            ipfs_metadata: namespace.ipfs_metadata.clone(),
            timestamp: namespace.minted_at,
        });

        Ok(())
    }

    pub fn set_tba_wallet(
        ctx: Context<SetTBAWallet>,
        tba_wallet: Pubkey,
    ) -> Result<()> {
        let namespace = &mut ctx.accounts.namespace_account;
        require_keys_eq!(namespace.owner, *ctx.accounts.owner.key, NamespaceError::Unauthorized);
        namespace.tba_wallet = tba_wallet;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeNamespace<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 4 + 64 + 4 + 128 + 4 + 32 + 4 + 32 + 32 + 8 + 1,
        seeds = [b"namespace", name.as_bytes()],
        bump
    )]
    pub namespace_account: Account<'info, NamespaceState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetTBAWallet<'info> {
    #[account(mut)]
    pub namespace_account: Account<'info, NamespaceState>,
    pub owner: Signer<'info>,
}

#[account]
pub struct NamespaceState {
    pub owner: Pubkey,
    pub name: String,
    pub ipfs_metadata: String,
    pub rarity_class: String,
    pub tier: String,
    pub tba_wallet: Pubkey,
    pub minted_at: i64,
    pub bump: u8,
}

#[event]
pub struct NamespaceMinted {
    pub name: String,
    pub owner: Pubkey,
    pub ipfs_metadata: String,
    pub timestamp: i64,
}

#[error_code]
pub mod NamespaceError {
    #[msg("You are not authorized to update this namespace.")]
    Unauthorized,
}

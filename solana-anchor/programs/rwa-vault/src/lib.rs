use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("RWA1111111111111111111111111111111111111111");

#[program]
pub mod rwa_vault {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        asset_id: String,
        name: String,
        valuation_usd: u64,
        total_shares: u64,
        yield_apy_bps: u32,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        vault.authority = *ctx.accounts.authority.key;
        vault.asset_id = asset_id;
        vault.name = name;
        vault.valuation_usd = valuation_usd;
        vault.total_shares = total_shares;
        vault.shares_minted = 0;
        vault.yield_apy_bps = yield_apy_bps;
        vault.is_compliance_gated = false;
        vault.bump = ctx.bumps.vault_account;
        Ok(())
    }

    pub fn mint_shares(
        ctx: Context<MintShares>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        require_keys_eq!(vault.authority, *ctx.accounts.authority.key, VaultError::Unauthorized);
        require!(vault.shares_minted + amount <= vault.total_shares, VaultError::MaxCapReached);
        
        vault.shares_minted += amount;
        
        // Handle actual token minting to user if a token mint is associated
        // token::mint_to(ctx.accounts.into_mint_to_context(), amount)?;
        
        emit!(SharesIssued {
            asset_id: vault.asset_id.clone(),
            to: *ctx.accounts.recipient.key,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn trigger_payout(
        ctx: Context<TriggerPayout>,
        dividend_amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault_account;
        require_keys_eq!(vault.authority, *ctx.accounts.authority.key, VaultError::Unauthorized);

        // Perform CPI transfer of stablecoin rewards from vault treasury to recipient
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_treasury.to_account_info(),
            to: ctx.accounts.recipient_wallet.to_account_info(),
            authority: vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        let asset_id_bytes = vault.asset_id.as_bytes();
        let seeds = &[
            b"vault",
            asset_id_bytes,
            &[vault.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, dividend_amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(asset_id: String)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 64 + 4 + 128 + 8 + 8 + 8 + 4 + 1 + 1,
        seeds = [b"vault", asset_id.as_bytes()],
        bump
    )]
    pub vault_account: Account<'info, VaultState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintShares<'info> {
    #[account(mut)]
    pub vault_account: Account<'info, VaultState>,
    pub authority: Signer<'info>,
    /// CHECK: Recipient of the shares
    pub recipient: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TriggerPayout<'info> {
    #[account(mut)]
    pub vault_account: Account<'info, VaultState>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub vault_treasury: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_wallet: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct VaultState {
    pub authority: Pubkey,
    pub asset_id: String,
    pub name: String,
    pub valuation_usd: u64,
    pub total_shares: u64,
    pub shares_minted: u64,
    pub yield_apy_bps: u32,
    pub is_compliance_gated: bool,
    pub bump: u8,
}

#[event]
pub struct SharesIssued {
    pub asset_id: String,
    pub to: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub mod VaultError {
    #[msg("Not authorized to perform this operation.")]
    Unauthorized,
    #[msg("Total capacity/shares cap reached.")]
    MaxCapReached,
}

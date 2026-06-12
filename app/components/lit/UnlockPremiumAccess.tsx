'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface UnlockPremiumAccessProps {
  walletAddress?: string;
  isConnected?: boolean;
  onAccessGranted?: (jwt: string) => void;
}

export function UnlockPremiumAccess({ walletAddress, isConnected, onAccessGranted }: UnlockPremiumAccessProps) {
  const [address, setAddress] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync internal state with props if provided
  useEffect(() => {
    if (walletAddress) setAddress(walletAddress);
    if (isConnected !== undefined) setConnected(isConnected);
  }, [walletAddress, isConnected]);

  // Fallback check for window.ethereum if props not provided
  useEffect(() => {
    if (!walletAddress && typeof window !== 'undefined' && (window as any).ethereum) {
      const getAccount = async () => {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts[0]) {
            setAddress(accounts[0]);
            setConnected(true);
          }
        } catch (err) {
          console.error("Error checking eth accounts:", err);
        }
      };
      getAccount();
    }
  }, [walletAddress]);

  const handleUnlock = async () => {
    const activeAddress = address || walletAddress;
    if (!activeAddress) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/gated/verify-affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress }),
      });

      const data = await res.json();

      if (data.access && data.jwt) {
        // Store JWT
        localStorage.setItem('lit_jwt', data.jwt);
        setSuccess(true);
        
        if (onAccessGranted) {
          onAccessGranted(data.jwt);
        }
      } else {
        setError(data.error || 'Access denied. You need an Affiliate Badge.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isUserConnected = connected || isConnected;

  if (!isUserConnected) {
    return (
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 text-center backdrop-blur-md max-w-xl mx-auto shadow-2xl">
        <div className="h-12 w-12 rounded-full bg-navy-950 border border-navy-800 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-400">Connect your wallet to unlock premium GMIIE macro intelligence access.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/50 max-w-xl mx-auto shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-bold text-sm">Premium access unlocked</p>
            <p className="text-xs text-emerald-500 mt-1">You can now access GMIIE insights and gated reports.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-navy-900/60 border border-navy-850 space-y-5 max-w-xl mx-auto shadow-2xl backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 shrink-0">
          <Shield className="h-6 w-6 text-gold-400" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-lg tracking-tight">Unlock Premium GMIIE Access</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Hold the **Soulbound Affiliate Badge NFT** in your wallet to unlock exclusive macro intelligence feed, Rings analytics, and oracle predictions.
          </p>
        </div>
      </div>

      <button
        onClick={handleUnlock}
        disabled={isLoading}
        className="w-full py-3 px-6 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-xl font-bold transition-all duration-200 text-sm shadow-lg shadow-gold-500/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block h-4 w-4 border-2 border-navy-950 border-t-transparent rounded-full" />
            Verifying with Lit Protocol...
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            Unlock Premium Access
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/50 flex items-center gap-2 text-xs text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

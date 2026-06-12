"use client";

import { useState } from "react";
import { Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import QRCodeView from "@/app/components/QRCodeView";

interface WalletItemProps {
  wallet: {
    id: string;
    chain: string;
    publicAddress: string;
    label: string | null;
    balanceSnapshot: string | null;
  };
  chainLabel: string;
}

export default function WalletItem({ wallet, chainLabel }: WalletItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="vault-card p-0 overflow-hidden border border-navy-700 hover:border-navy-600 transition-all duration-300">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-5 hover:bg-navy-900/40 text-left outline-none"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">{wallet.label ?? "Unnamed wallet"}</p>
            <p className="text-xs text-slate-500">{chainLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-xs text-cyan-400">{truncateAddress(wallet.publicAddress, 8)}</p>
            {wallet.balanceSnapshot && (
              <p className="text-xs text-slate-500 mt-0.5">{wallet.balanceSnapshot}</p>
            )}
          </div>
          <div className="text-slate-500">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="p-5 border-t border-navy-800 bg-navy-950/40 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="text-xs text-slate-400 space-y-2 max-w-md">
            <p>
              <strong>Public Address:</strong>
              <code className="block mt-1 font-mono text-cyan-400 bg-navy-950/80 p-2 rounded border border-navy-800 select-all break-all">
                {wallet.publicAddress}
              </code>
            </p>
            <p className="text-slate-500">
              Use this QR code to scan and verify ownership on-chain, or to receive assets for estate distributions.
            </p>
            <div className="pt-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/vault/wallets/mint", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ address: wallet.publicAddress }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert(`TROPTIONS Mint Queued:\n\nStatus: ${data.status}\nSignature: ${data.signature}`);
                    } else {
                      alert(`Mint failed: ${data.error}`);
                    }
                  } catch (err) {
                    alert("Failed to request TROPTIONS mint");
                  }
                }}
                className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Mint to TROPTIONS (Unity Token)
              </button>
            </div>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <QRCodeView
              data={wallet.publicAddress}
              label={`${chainLabel} Address`}
              size={160}
            />
          </div>
        </div>
      )}
    </div>
  );
}

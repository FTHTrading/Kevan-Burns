"use client";

import { useState } from "react";
import { Check, Copy, Download, QrCode } from "lucide-react";

interface QRCodeViewProps {
  data: string;
  label?: string;
  size?: number;
}

export default function QRCodeView({ data, label, size = 200 }: QRCodeViewProps) {
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=d4af37&bgcolor=0f172a`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  async function handleDownload() {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${label || "qrcode"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download QR code: ", err);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-navy-700/50 bg-navy-900/60 backdrop-blur-md max-w-sm mx-auto shadow-xl">
      {label && <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">{label}</p>}
      
      {/* QR Wrapper with premium border glow */}
      <div className="relative p-3 rounded-2xl border border-gold-500/20 bg-navy-950 shadow-inner group">
        <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/10 to-cyan-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
        <img
          src={qrUrl}
          alt={data}
          width={size}
          height={size}
          className="relative rounded-lg aspect-square object-contain"
        />
      </div>

      <p className="mt-4 text-xs font-mono text-slate-400 bg-navy-950/80 px-3 py-1.5 rounded-lg max-w-full truncate select-all border border-navy-800">
        {data}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 w-full">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-navy-700 bg-navy-800/50 hover:bg-navy-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy URL
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-navy-700 bg-navy-800/50 hover:bg-navy-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors"
          title="Download QR Code"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}

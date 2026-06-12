"use client";

import { useRef, useState, MouseEvent } from "react";
import { Shield, FileText, Wallet, Heart, Users, Lock } from "lucide-react";

/**
 * VaultCard3D — Pure CSS 3D perspective card.
 * Tracks mouse to create a realistic 3D tilt effect.
 * No external libraries. Warm family aesthetic.
 */
export default function VaultCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTilt({
      x: ((y - cy) / cy) * -12,
      y: ((x - cx) / cx) * 12,
    });
  }

  const VAULT_ITEMS = [
    { icon: FileText, label: "Will & Trust",       color: "text-amber-600",  bg: "bg-amber-50" },
    { icon: Wallet,   label: "Crypto Wallets",      color: "text-blue-600",   bg: "bg-blue-50" },
    { icon: Heart,    label: "Personal Messages",   color: "text-rose-500",   bg: "bg-rose-50" },
    { icon: Users,    label: "Family Instructions", color: "text-emerald-600",bg: "bg-emerald-50" },
    { icon: Shield,   label: "Insurance Docs",      color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Lock,     label: "Access Policy",       color: "text-legacy-gold",bg: "bg-amber-50" },
  ];

  return (
    <div
      className="inline-block"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setTilt({ x: 0, y: 0 }); }}
    >
      <div
        ref={cardRef}
        style={{
          transform: hovering
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03,1.03,1.03)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
          transformStyle: "preserve-3d",
          transition: hovering ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
          willChange: "transform",
        }}
        className="relative w-80 rounded-3xl bg-white shadow-2xl shadow-amber-900/15 border border-warm-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 px-6 py-5 relative overflow-hidden">
          {/* Shine layer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: hovering
                ? `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 + tilt.x * 2}%, rgba(255,255,255,0.25) 0%, transparent 60%)`
                : "none",
            }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-base leading-tight">Legacy Vault</p>
              <p className="text-amber-100 text-xs font-medium">Encrypted · Sealed · Sovereign</p>
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider mb-1">Namespace</p>
            <p className="text-white font-mono text-sm font-bold">smithfamily.legacy</p>
          </div>
        </div>

        {/* Items */}
        <div className="p-5">
          <p className="text-xs font-bold text-warm-600 uppercase tracking-wider mb-3">Vault Contents</p>
          <div className="grid grid-cols-2 gap-2">
            {VAULT_ITEMS.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`flex items-center gap-2 rounded-xl ${bg} px-3 py-2.5`}>
                <Icon className={`h-4 w-4 ${color} shrink-0`} />
                <span className="text-xs font-semibold text-estate-800 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Status bar */}
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-emerald-700">Vault Secured</p>
              <p className="text-[10px] text-emerald-600">5-proof release configured</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Depth shadow layer */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    </div>
  );
}

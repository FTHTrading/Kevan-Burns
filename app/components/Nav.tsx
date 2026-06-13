"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";

const DEMO_BANNER = true;

const navGroups = [
  {
    label: "Namespace Registry",
    items: [
      { href: "/namespaces/register", label: "Claim a Name (.legacy & .troptions)" },
      { href: "/namespaces", label: "Registry Database & Anchors" },
      { href: "/namespaces/demo", label: "Try Registry Demo" },
      { href: "/namespaces/cockpit", label: "Sovereign Minting Cockpit" },
    ],
  },
  {
    label: "Family Vaults",
    items: [
      { href: "/legacy-vault", label: "Legacy Vault Platform" },
      { href: "/vault", label: "My Vault Dashboard" },
      { href: "/vault/create", label: "Initialize New Vault" },
      { href: "/executor", label: "Executor Portal" },
    ],
  },
  {
    label: "How It Works",
    items: [
      { href: "/vault-explained", label: "Overview & Security" },
      { href: "/pricing", label: "Plans & Pricing" },
      { href: "/lifetime", label: "Sovereign Lifetime Membership" },
      { href: "/onboard", label: "Conversational Setup" },
      { href: "/troptions", label: "Troptions Platform & Manual" },
      { href: "/research", label: "Technical Research & Specs" },
      { href: "/media", label: "Media Swarm & Portfolio" },
    ],
  },
];

export default function Nav() {
  const pathname = usePathname() || "";
  const isLegalRoute =
    pathname === "/legacy-vault" ||
    pathname.startsWith("/vault") ||
    pathname.startsWith("/executor") ||
    pathname === "/pricing" ||
    pathname === "/onboard" ||
    pathname === "/vault-explained" ||
    pathname === "/lifetime";

  if (!isLegalRoute) return null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic Theme State (Dark mode for onboard, vault, namespaces, and main console screens)
  const isDarkTheme = pathname === "/onboard" || pathname?.startsWith("/vault") || pathname?.startsWith("/namespaces") || pathname === "/" || pathname === "/troptions";

  // Onboard Sync States
  const [onboardNamespace, setOnboardNamespace] = useState("");
  const [showSidebarState, setShowSidebarState] = useState(true);

  // Sync state events from onboarding page
  useEffect(() => {
    const handleNamespaceSync = (e: Event) => {
      setOnboardNamespace((e as CustomEvent).detail);
    };
    const handleSidebarSync = (e: Event) => {
      setShowSidebarState((e as CustomEvent).detail);
    };

    window.addEventListener("sync-onboard-namespace", handleNamespaceSync);
    window.addEventListener("sync-onboard-sidebar-state", handleSidebarSync);

    return () => {
      window.removeEventListener("sync-onboard-namespace", handleNamespaceSync);
      window.removeEventListener("sync-onboard-sidebar-state", handleSidebarSync);
    };
  }, []);

  const isActive = (href: string) => pathname === href;
  const groupActive = (items: { href: string }[]) => items.some((i) => isActive(i.href));

  const openDropdown = (label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenGroup(label);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setOpenGroup(null), 120);
  };

  return (
    /* Single sticky wrapper — banner + nav scroll as one unit, then stick together */
    <header className="sticky top-0 z-50 shrink-0">
      {/* Trust bar */}
      {(pathname === "/legacy-vault" || pathname?.startsWith("/vault") || pathname === "/executor" || pathname === "/pricing" || pathname === "/onboard" || pathname === "/vault-explained" || pathname === "/lifetime") && (
        <div className={`border-b px-4 py-1.5 text-center transition-colors duration-200 ${
          isDarkTheme 
            ? "bg-amber-950/40 border-amber-500/20 text-amber-400" 
            : "bg-amber-50 border-amber-200/60 text-amber-800 font-bold"
        }`}>
          <span className="text-xs font-medium uppercase tracking-wider">
            Unykorn Platforms • Moltbook Genesis Protocol • Live on Solana & Stellar • Deterministic Systems
          </span>
        </div>
      )}

      <nav className={`border-b px-4 py-2.5 transition-colors duration-200 ${
        isDarkTheme 
          ? "border-white/5 bg-[#0a0f1d]/90 backdrop-blur-md text-slate-100" 
          : "border-estate-200 bg-white shadow-sm shadow-estate-900/8 text-estate-900"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo — Transparent on both dark/light */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/legacy/logo-nav.png"
              alt="Unykorn"
              width={260}
              height={64}
              className={`h-12 w-auto object-contain transition-all duration-200 ${isDarkTheme ? "brightness-110" : ""}`}
              priority
            />
          </Link>

          {/* Desktop nav groups */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navGroups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => openDropdown(group.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    groupActive(group.items)
                      ? isDarkTheme 
                        ? "text-amber-400 bg-amber-500/10" 
                        : "text-amber-700 bg-amber-100"
                      : isDarkTheme 
                        ? "text-slate-300 hover:text-amber-400 hover:bg-white/5" 
                        : "text-estate-900 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-150 ${
                      openGroup === group.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                {openGroup === group.label && (
                  <>
                    <div className="absolute top-full left-0 w-full h-2" />
                    <div
                      className={`absolute top-full left-0 mt-2 w-60 rounded-xl border py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100 ${
                        isDarkTheme 
                          ? "border-white/10 bg-[#111827] shadow-2xl text-slate-200" 
                          : "border-estate-200 bg-white shadow-2xl shadow-estate-900/15 text-estate-900"
                      }`}
                      onMouseEnter={() => openDropdown(group.label)}
                      onMouseLeave={scheduleClose}
                    >
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-4 py-2.5 text-sm font-semibold transition-colors ${
                            isActive(item.href)
                              ? isDarkTheme 
                                ? "text-amber-400 bg-amber-500/10" 
                                : "text-amber-700 bg-amber-55"
                              : isDarkTheme 
                                ? "text-slate-300 hover:text-amber-400 hover:bg-white/5" 
                                : "text-estate-900 hover:text-amber-700 hover:bg-amber-50"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Right side: custom controls on /onboard, standard CTA elsewhere */}
          {pathname === "/onboard" ? (
            <div className="flex items-center gap-3">
              {/* Namespace suffix selector */}
              {onboardNamespace && (
                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs gap-1 font-mono text-emerald-400">
                  <span className="font-bold">{onboardNamespace.split('.')[0]}</span>
                  <select
                    value={onboardNamespace.endsWith('.troptions') ? '.troptions' : '.legacy'}
                    onChange={(e) => {
                      window.dispatchEvent(new CustomEvent('change-onboard-suffix', { detail: e.target.value }));
                    }}
                    className="bg-transparent border-none text-emerald-400 focus:outline-none cursor-pointer p-0 font-bold"
                  >
                    <option value=".legacy" className="bg-[#0a0f1a] text-emerald-400 font-mono">.legacy</option>
                    <option value=".troptions" className="bg-[#0a0f1a] text-emerald-400 font-mono">.troptions</option>
                  </select>
                </div>
              )}

              {/* Sidebar toggle button */}
              <button 
                onClick={() => {
                  const nextVal = !showSidebarState;
                  setShowSidebarState(nextVal);
                  window.dispatchEvent(new CustomEvent('toggle-onboard-sidebar'));
                }} 
                className={`px-3 py-1.5 rounded-xl transition-all hidden md:flex items-center gap-1.5 text-xs font-semibold ${
                  showSidebarState 
                    ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" 
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                }`}
                title="Toggle Vault Directory Checklist"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {showSidebarState ? "Hide Directory" : "Show Directory"}
              </button>

              <Link href="/login" className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-300">
                Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/onboard"
                className="hidden sm:block rounded-xl bg-amber-600 hover:bg-amber-700 transition-colors text-xs px-4 py-2 font-bold text-white"
              >
                Protect My Family
              </Link>
              <Link
                href="/namespaces/demo"
                className={`hidden sm:block rounded-xl border-2 text-xs px-3 py-2 font-bold transition-colors ${
                  isDarkTheme 
                    ? "border-white/10 hover:border-amber-500 text-slate-300 hover:text-amber-400 hover:bg-white/5" 
                    : "border-estate-300 hover:border-amber-500 text-estate-800 hover:text-amber-700"
                }`}
              >
                Try Demo
              </Link>
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className={`lg:hidden p-1.5 rounded-lg transition-colors ${
                  isDarkTheme 
                    ? "text-slate-400 hover:text-slate-100 hover:bg-white/5" 
                    : "text-estate-700 hover:text-estate-900 hover:bg-amber-50"
                }`}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={`lg:hidden border-t mt-3 pt-3 pb-2 max-w-7xl mx-auto space-y-1 ${
            isDarkTheme 
              ? "border-white/10 bg-[#0a0f1d] text-slate-200" 
              : "border-warm-200 bg-white text-estate-900"
          }`}>
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold text-estate-400 uppercase tracking-widest">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.href)
                        ? isDarkTheme 
                          ? "text-amber-400 bg-amber-500/10 font-semibold" 
                          : "text-amber-700 bg-amber-50 font-semibold"
                        : isDarkTheme 
                          ? "text-slate-300 hover:text-slate-100 hover:bg-white/5" 
                          : "text-estate-600 hover:text-estate-900 hover:bg-warm-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex gap-2 pt-3 px-3">
              <Link
                href="/onboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-xs px-3 py-2 flex-1 text-center font-bold text-white"
              >
                Protect My Family
              </Link>
              <Link
                href="/namespaces/demo"
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl text-xs px-3 py-2 flex-1 text-center font-semibold ${
                  isDarkTheme 
                    ? "border border-white/10 text-slate-300 hover:bg-white/5" 
                    : "border border-estate-300 text-estate-600 hover:bg-warm-50"
                }`}
              >
                Try Demo
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

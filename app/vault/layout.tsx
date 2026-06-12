"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Wallet,
  FileText,
  Users,
  Settings,
  BookOpen,
  Scale,
  Brain,
} from "lucide-react";

const navItems = [
  { href: "/vault",                label: "Overview",       icon: LayoutDashboard },
  { href: "/vault/assets",         label: "Assets",         icon: BookOpen },
  { href: "/vault/wallets",        label: "Wallets",        icon: Wallet },
  { href: "/vault/documents",      label: "Documents",      icon: FileText },
  { href: "/vault/executors",      label: "Executors",      icon: Users },
  { href: "/vault/beneficiaries",  label: "Beneficiaries",  icon: Users },
  { href: "/vault/release-policy", label: "Release Policy", icon: Settings },
  { href: "/vault/agents",         label: "AI Copilots",    icon: Brain },
];

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold-400" />
          <Link
            href="/"
            className="text-sm font-bold text-slate-100 hover:text-gold-400 transition-colors"
          >
            Legacy Vault Protocol
          </Link>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="status-active">ACTIVE</span>
          <span>Demo Vault</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-white/10 p-3 flex flex-col gap-0.5 shrink-0 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(href)
                  ? "bg-gold-500/10 text-gold-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive(href) ? "text-gold-400" : ""}`}
              />
              {label}
            </Link>
          ))}

          <div className="divider" />

          <Link
            href="/admin/audit"
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive("/admin/audit")
                ? "bg-gold-500/10 text-gold-400 font-medium"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            Audit Log
          </Link>

          <Link
            href="/vault/release-policy"
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive("/executor")
                ? "bg-gold-500/10 text-gold-400 font-medium"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Scale className="h-4 w-4 shrink-0" />
            Executor Portal
          </Link>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Shield } from "lucide-react";

export default function BeneficiaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-gold-400" />
        <Link href="/" className="text-sm font-bold text-slate-100 hover:text-gold-400 transition-colors">
          Legacy Vault Protocol
        </Link>
        <span className="text-slate-600 mx-2">/</span>
        <span className="text-sm text-slate-400">Beneficiary Portal</span>
      </header>
      <main className="flex-1 p-8 max-w-3xl mx-auto w-full">{children}</main>
    </div>
  );
}

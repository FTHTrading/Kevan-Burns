import Link from "next/link";
import { Shield, Users } from "lucide-react";

export default function ExecutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold-400" />
          <Link href="/" className="text-sm font-bold text-slate-100 hover:text-gold-400 transition-colors">
            Legacy Vault Protocol
          </Link>
          <span className="text-slate-600 mx-2">/</span>
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-400">Executor Portal</span>
        </div>
      </header>
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">{children}</main>
    </div>
  );
}

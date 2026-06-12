export const runtime = 'edge';
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Globe, Vault, FileText, Wallet, Users, Shield, Download, GitBranch, Zap } from "lucide-react";
import NamespacesRegistry from "./NamespacesRegistry";

type NamespaceStatus = "ACTIVE" | "REVIEW_PENDING" | "RELEASE_PENDING" | "RELEASED" | "LOCKED" | "DISPUTED" | "ARCHIVED";

const statusColors: Record<NamespaceStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REVIEW_PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  RELEASE_PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RELEASED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  LOCKED: "bg-slate-700/40 text-slate-400 border-slate-600/30",
  DISPUTED: "bg-red-500/10 text-red-400 border-red-500/20",
  ARCHIVED: "bg-slate-800/40 text-slate-500 border-slate-700/20",
};

const exampleNamespaces = [
  {
    id: "smithfamily.legacy",
    label: "Smith Family",
    description: "Multi-generational estate with real estate, investments, and digital asset portfolio.",
    status: "ACTIVE" as NamespaceStatus,
    vaults: 3,
    docs: 14,
    wallets: 8,
    members: 5,
  },
  {
    id: "doe-trust.legacy",
    label: "Doe Family Trust",
    description: "Revocable living trust with executor workflow active and guardians assigned.",
    status: "REVIEW_PENDING" as NamespaceStatus,
    vaults: 1,
    docs: 7,
    wallets: 4,
    members: 3,
  },
  {
    id: "apexholdings.legacy",
    label: "Apex Holdings",
    description: "Enterprise namespace for business equity, IP records, and succession documentation.",
    status: "ACTIVE" as NamespaceStatus,
    vaults: 5,
    docs: 31,
    wallets: 12,
    members: 8,
  },
];

const namespaceCapabilities = [
  { icon: <Vault className="h-5 w-5" />, label: "Linked Vaults", note: "one or many vaults per namespace" },
  { icon: <FileText className="h-5 w-5" />, label: "Document Filing", note: "13 document types, categorized" },
  { icon: <Wallet className="h-5 w-5" />, label: "Wallet Registry", note: "owner-authorized addresses only" },
  { icon: <Users className="h-5 w-5" />, label: "Role Assignments", note: "executor, guardian, beneficiary, attorney" },
  { icon: <Shield className="h-5 w-5" />, label: "Release Policy", note: "per-namespace or per-vault rules" },
  { icon: <Download className="h-5 w-5" />, label: "Download Packets", note: "executor, beneficiary, audit exports" },
  { icon: <GitBranch className="h-5 w-5" />, label: "Audit Log", note: "chain-anchored, append-only" },
  { icon: <Globe className="h-5 w-5" />, label: "Cross-chain Links", note: "ETH, SOL, XRPL, Stellar, Base" },
  { icon: <Zap className="h-5 w-5" />, label: "x402 Services", note: "metered operator actions" },
];

export default async function NamespacesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const rawNamespaces = await prisma.namespaceEntitlement.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Convert Date types to ISO string for safe client boundary serialization
  const realNamespaces = rawNamespaces.map((ns) => ({
    ...ns,
    createdAt: ns.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-20 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gold-500">.legacy & .troptions Namespace Model</p>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white md:text-5xl leading-tight">
          Every estate gets its own<br />
          <span className="text-gold-400">sovereign namespace</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          A <code className="rounded bg-navy-800 px-1.5 py-0.5 text-gold-400 text-base">.legacy</code> or <code className="rounded bg-navy-800 px-1.5 py-0.5 text-gold-400 text-base">.troptions</code> namespace
          is your estate&apos;s operating identity — grouping vaults, documents, wallets, policies,
          executors, and beneficiaries under a single governed namespace.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["smithfamily.legacy", "smithfamily.troptions", "doe-trust.legacy", "apexholdings.legacy"].map((ns) => (
            <span key={ns} className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-sm font-mono text-gold-400">
              {ns}
            </span>
          ))}
        </div>
      </section>

      {/* Interactive SFT Registry Component */}
      <NamespacesRegistry 
        realNamespaces={realNamespaces}
        userId={userId}
        exampleNamespaces={exampleNamespaces}
        namespaceCapabilities={namespaceCapabilities}
        statusColors={statusColors}
      />

      {/* CTA */}
      <section className="px-6 py-14 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/namespaces/register" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-colors">
            Register a Namespace →
          </Link>
          <Link href="/namespaces/cockpit" className="rounded-lg border border-gold-500 bg-gold-500/10 px-6 py-3 text-sm font-bold text-gold-400 hover:bg-gold-500/20 transition-colors">
            Sovereign Minting Cockpit ⚡
          </Link>
          <Link href="/downloads" className="rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-gold-500 hover:text-gold-400 transition-colors">
            Download Templates
          </Link>
        </div>
      </section>
    </div>
  );
}

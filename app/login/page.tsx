"use client";

import { Suspense, useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/vault";
  const urlError = params.get("error");

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [formError, setFormError] = useState<string | null>(
    urlError === "CredentialsSignin" ? "Invalid email or password." : null
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setFormError("Invalid email or password. Check your credentials and try again.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {formError}
        </div>
      )}

      <div>
        <label className="form-label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="form-input pl-9"
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="form-input pl-9 pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-navy-950/30 border-t-navy-950 animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            Access My Vault
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-navy-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gold-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/legacy/logo-v2.png"
            alt="Legacy Vault Protocol"
            width={72}
            height={72}
            className="mb-4 drop-shadow-[0_0_20px_rgba(212,160,23,0.3)]"
          />
          <h1 className="text-xl font-black text-white tracking-tight">Legacy Vault Protocol</h1>
          <p className="text-xs text-slate-500 mt-1">Sovereign estate infrastructure</p>
        </div>

        {/* Card */}
        <div className="vault-card">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-4 w-4 text-gold-400" />
            <h2 className="text-sm font-semibold text-slate-200">Sign in to your vault</h2>
          </div>

          {/* Suspense wraps useSearchParams */}
          <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-white/5" />}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-3">
            <p className="text-xs text-slate-500">
              No account?{" "}
              <Link href="/namespaces/register" className="text-gold-400 hover:text-gold-300 transition-colors">
                Register your namespace →
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Want to explore first?{" "}
              <Link href="/namespaces/demo" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Try demo mode
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          End-to-end encrypted · Private blockchain anchored · Zero plaintext stored
        </p>
      </div>
    </div>
  );
}

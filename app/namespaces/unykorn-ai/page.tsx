"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnykornAiRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#03060f] text-slate-100 flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Redirecting to UnyKorn Cockpit root...</p>
      </div>
    </div>
  );
}

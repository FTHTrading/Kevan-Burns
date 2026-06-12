"use client";
import { useState, useEffect } from "react";
import VaultCard3D from "./VaultCard3D";
import VaultHero3D from "./VaultHero3D";

export function VaultCard3DDynamic() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-80 h-96 rounded-3xl bg-warm-100 animate-pulse" />;
  }
  return <VaultCard3D />;
}

export function VaultHero3DDynamic() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return <VaultHero3D />;
}


"use client";
import dynamic from "next/dynamic";

const VaultHero3D = dynamic(() => import("./VaultHero3D"), {
  ssr: false,
  loading: () => null,
});

export default function VaultHero3DLoader() {
  return <VaultHero3D />;
}

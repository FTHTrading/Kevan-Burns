"use client";

import Script from "next/script";

/** Cross-ecosystem monetization strip — hosted on genesis402.com */
export default function EcosystemStrip() {
  return (
    <Script
      src="https://genesis402.com/ecosystem-bar.js"
      data-source="troptionsunity"
      strategy="lazyOnload"
    />
  );
}

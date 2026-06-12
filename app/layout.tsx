import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";
import GlobalVoiceBar from "./components/GlobalVoiceBar";
// import EcosystemStrip from "./components/EcosystemStrip";
import { JsonLd } from "./components/JsonLd";

// Unykorn — Primary Entity for SEO/GEO
const BUSINESS_NAME = "Unykorn";
const OWNER = "Founder-Architect";
const ADDRESS = "5655 Peachtree Parkway, Norcross, GA 30092";
const FULL_ADDRESS = "5655 Peachtree Parkway, Suite 100, Norcross, GA 30092 (Technology Park / Peachtree Corners)";
const CITY = "Norcross";
const REGION = "GA";
const POSTAL = "30092";
const COUNTRY = "US";
const PHONE = "+1-770-555-0199"; 
const SITE_URL = "https://unykorn.ai";
const DESCRIPTION = "Unykorn operates permanent Web3 namespaces, digital identity systems, and real-world asset infrastructure across Solana and Stellar.";

export const metadata: Metadata = {
  title: "Unykorn - Sovereign Web3 Namespaces & Infrastructure",
  description: DESCRIPTION,
  keywords: [
    "Unykorn",
    "web3 namespace",
    "sovereign identity",
    "blockchain registry",
    "digital legacy",
    "legacy vault",
    "rwa tokenization",
    "solana stellar"
  ],
  authors: [{ name: "Unykorn Platforms", url: SITE_URL }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Unykorn - Sovereign Web3 Infrastructure",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    images: [{ url: "/images/legacy/hero-vault.png" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unykorn - Sovereign Web3 Infrastructure",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Base LocalBusiness + Product + Service schema for entity authority (E-E-A-T + GEO + AI citation). Anchored at 5655 Peachtree Parkway, Norcross, GA 30092. Cross-promotes BlockchainFraud.org for scam detection.
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS_NAME,
    description: DESCRIPTION,
    url: SITE_URL,
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "5655 Peachtree Parkway, Suite 100",
      addressLocality: CITY,
      addressRegion: REGION,
      postalCode: POSTAL,
      addressCountry: COUNTRY,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.956,
      longitude: -84.232, 
    },
    areaServed: ["Norcross GA", "Peachtree Corners", "Gwinnett County", "Atlanta Metro", "Georgia", "United States"],
    priceRange: "$29.95 - $499.95",
    paymentAccepted: "Stripe, Troptions Pay, Unity Token, X402",
    sameAs: [
      "https://unykorn.ai",
      "https://blockchainfraud.org", 
    ],
  };

  const pricingProducts = [
    {
      "@type": "Product",
      "name": "Unykorn Legacy Vault - Essential Vault",
      "description": "Straightforward legacy protection for families and individuals. 1 sovereign namespace, client AES-256 + basic 5-Proof ZK + Dead Man's Switch. $29.95/mo. Provided by Unykorn at 5655 Peachtree Parkway, Norcross, GA 30092.",
      "offers": {
        "@type": "Offer",
        "price": "29.95",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "Unykorn Legacy Vault - Premium Estate Vault",
      "description": "Scaled for complex families, trusts, and estates. Up to 5 vaults, advanced time-locks/tiered heirs, professional Heirloom Strategist AI, business docs, white-glove, 5-Proof ZK. $49.95/mo (most popular). Provided by Unykorn at 5655 Peachtree Parkway, Norcross, GA 30092.",
      "offers": {
        "@type": "Offer",
        "price": "49.95",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "Unykorn Legacy Vault - Elite Trust Vault",
      "description": "Advanced privacy controls, custom ZK trust quorums, secure asset protection triggers, active Heirloom Trust Defense AI, biometric triggers. $89.95/mo. Provided by Unykorn at 5655 Peachtree Parkway, Norcross, GA 30092.",
      "offers": {
        "@type": "Offer",
        "price": "89.95",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "Product",
      "name": "Unykorn Legacy Vault - Enterprise & Family Office",
      "description": "Generational planning for family offices, legal firms, and institutions. Custom quorums, dedicated SLAs, self-hosted enterprise option. Custom Pricing. Provided by Unykorn at 5655 Peachtree Parkway, Norcross, GA 30092.",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Unykorn Legacy Vault + BlockchainFraud.org Detection",
    "description": "ZK 5-Proof crypto legacy protection paired with X402/Stripe fraud detection (top5 GitHub repos, recovery scam patterns, batch engine). Anchor: 5655 Peachtree Parkway, Norcross, GA 30092.",
    "provider": { "@id": `${SITE_URL}/#organization` },
    "areaServed": "United States",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Legacy Protection + Fraud Intelligence",
      "itemListElement": pricingProducts.map(p => ({ "@type": "Offer", itemOffered: p }))
    }
  };

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-navy-950">
        <Nav />
        <GlobalVoiceBar />
        {children}
        {/* <EcosystemStrip /> */}
        {/* Base entity schema for all pages — strengthens "Unykorn" + exact address as authoritative Georgia entity. Includes Product for $29.95/$49.95 + cross to BlockchainFraud.org. */}
        <JsonLd data={localBusinessSchema} />
        <JsonLd data={pricingProducts} />
        <JsonLd data={serviceSchema} />
      </body>
    </html>
  );
}

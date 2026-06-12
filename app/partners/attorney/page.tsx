"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, ArrowRight, CheckCircle, Scale, Building, Hash, Wallet, Phone, Mail } from "lucide-react";

export default function AttorneyRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    firm: "",
    email: "",
    phone: "",
    barNumber: "",
    officeAddress: "",
    walletAddress: "",
    willsAndTrusts: true,
    probateAvoidance: true,
    digitalAssets: true,
    corporateSuccession: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const practiceAreas = [];
    if (formData.willsAndTrusts) practiceAreas.push("Wills & Trusts");
    if (formData.probateAvoidance) practiceAreas.push("Probate Avoidance");
    if (formData.digitalAssets) practiceAreas.push("Digital Asset Planning");
    if (formData.corporateSuccession) practiceAreas.push("Corporate Succession");

    try {
      const res = await fetch("/api/partners/attorney", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          firm: formData.firm,
          email: formData.email,
          phone: formData.phone,
          barNumber: formData.barNumber,
          officeAddress: formData.officeAddress,
          walletAddress: formData.walletAddress,
          practiceAreas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50 text-estate-900 pb-20">
      {/* Hero Banner */}
      <section className="bg-estate-900 text-white px-6 py-16 text-center border-b-4 border-amber-500">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-300 mb-6">
            <Scale className="h-4 w-4" /> Georgia State Bar Professional Network
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Join the Attorney Referral Network
          </h1>
          <p className="text-lg text-estate-300 max-w-xl mx-auto leading-relaxed">
            Partner with Legacy Vault Protocol to provide Georgia families in Gwinnett County and the Atlanta Metro with sovereign, zero-knowledge estate planning solutions.
          </p>
        </div>
      </section>

      {/* Main Registration Content */}
      <section className="max-w-4xl mx-auto px-6 mt-12 grid md:grid-cols-5 gap-10">
        
        {/* Left Side Info column (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border-2 border-warm-200 bg-white p-6 shadow-md">
            <h3 className="font-black text-lg mb-3" style={{ color: '#1a0f00' }}>Why Join Our Network?</h3>
            <ul className="space-y-4">
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-estate-900">Direct Referrals</p>
                  <p className="text-xs text-estate-600">Receive priority consultation requests from local Norcross and Gwinnett County clients.</p>
                </div>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-estate-900">On-Chain Attestations</p>
                  <p className="text-xs text-estate-600">Earn smart-contract settlement fees (x402) directly to your secure wallet for completing legal validations.</p>
                </div>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-estate-900">RUFADAA & Georgia Probate Avoidance</p>
                  <p className="text-xs text-estate-600">Integrate digital asset planning tools that comply strictly with Georgia trust codes.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-300 bg-amber-50/50 p-6">
            <h4 className="font-bold text-sm text-amber-900 mb-2">Physical Office Verification</h4>
            <p className="text-xs text-estate-700 leading-relaxed">
              We anchor our services at <strong>5655 Peachtree Parkway, Norcross, GA 30092</strong>. Registered attorneys are eligible for local coordination meetings, continuing legal education (CLE) credits, and joint client onboarding ceremonies in Gwinnett County.
            </p>
          </div>
        </div>

        {/* Right Side Form column (3 cols) */}
        <div className="md:col-span-3">
          <div className="rounded-3xl border-2 border-warm-200 bg-white p-8 shadow-xl">
            {success ? (
              <div className="text-center py-10">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black mb-3">Application Submitted</h3>
                <p className="text-estate-600 text-sm max-w-md mx-auto mb-8">
                  Thank you for applying. Our operations team will verify your Georgia State Bar credentials and contact you at the email provided within 2 business days to activate your on-chain attestation status.
                </p>
                <Link href="/partners" className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3 transition-colors text-sm">
                  Return to Ecosystem Page
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-black mb-2" style={{ color: '#1a0f00' }}>Credential Verification</h3>
                <p className="text-xs text-estate-500 mb-4">Complete all fields to submit your registration for Georgia State Bar verification.</p>

                {error && (
                  <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-black uppercase text-estate-700 mb-1.5 flex items-center gap-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sarah Jenkins, Esq."
                      className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Firm & Bar Number */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-estate-700 mb-1.5 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" /> Law Firm
                    </label>
                    <input
                      type="text"
                      name="firm"
                      required
                      value={formData.firm}
                      onChange={handleChange}
                      placeholder="e.g. Jenkins & Associates LLC"
                      className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-estate-700 mb-1.5 flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5 text-slate-400" /> Georgia Bar Number
                    </label>
                    <input
                      type="text"
                      name="barNumber"
                      required
                      value={formData.barNumber}
                      onChange={handleChange}
                      placeholder="e.g. 543210"
                      className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-estate-700 mb-1.5 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. sjenkins@jenkinslaw.com"
                      className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-estate-700 mb-1.5 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 678-555-0199"
                      className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Office Address */}
                <div>
                  <label className="block text-xs font-black uppercase text-estate-700 mb-1.5">
                    Georgia Office Address
                  </label>
                  <textarea
                    name="officeAddress"
                    required
                    rows={2}
                    value={formData.officeAddress}
                    onChange={handleChange}
                    placeholder="e.g. 120 Peachtree Street NE, Suite 400, Atlanta, GA 30303"
                    className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-medium resize-none"
                  />
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-xs font-black uppercase text-estate-700 mb-1.5 flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-slate-400" /> EVM Wallet Address (payouts)
                  </label>
                  <input
                    type="text"
                    name="walletAddress"
                    required
                    value={formData.walletAddress}
                    onChange={handleChange}
                    placeholder="e.g. 0x7d9a65d06dcc435a..."
                    className="w-full bg-warm-50/50 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>

                {/* Practice Areas */}
                <div>
                  <label className="block text-xs font-black uppercase text-estate-700 mb-2">
                    Ecosystem Practice Areas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "willsAndTrusts", label: "Wills & Trusts" },
                      { name: "probateAvoidance", label: "Probate Avoidance" },
                      { name: "digitalAssets", label: "Digital Assets" },
                      { name: "corporateSuccession", label: "Corporate Succession" },
                    ].map((area) => (
                      <label key={area.name} className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-warm-100/50">
                        <input
                          type="checkbox"
                          name={area.name}
                          checked={(formData as any)[area.name]}
                          onChange={handleChange}
                          className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                        <span className="text-xs font-bold text-estate-800">{area.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black py-4 transition-colors disabled:opacity-70 mt-4 shadow-lg shadow-amber-600/20"
                >
                  {loading ? "Registering Credentials..." : "Submit Verification Application"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

      </section>
    </main>
  );
}

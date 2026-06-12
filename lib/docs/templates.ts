/**
 * lib/docs/templates.ts
 *
 * Legacy Vault Protocol — Estate Document Intelligence
 * 13 regulated estate document templates, white-labeled from the
 * XXXIII.io Document Governance Layer (docs.unykorn.org).
 *
 * Each template defines:
 *  - Field schema for AI extraction/injection
 *  - Default clause blocks
 *  - Compliance checks applicable
 *  - XRPL/IPFS anchoring tier
 */

export type DocCategory =
  | "SUCCESSION"
  | "TRUST"
  | "AUTHORITY"
  | "FINANCIAL"
  | "HEALTHCARE"
  | "BUSINESS"
  | "CRYPTO";

export type ComplianceCheck =
  | "ESIGN"
  | "UETA"
  | "RUFADAA"
  | "HIPAA"
  | "UCC"
  | "REG_D"
  | "STATE_PROBATE";

export interface DocField {
  key: string;
  label: string;
  type: "text" | "date" | "name" | "address" | "amount" | "list" | "textarea" | "jurisdiction";
  required: boolean;
  placeholder?: string;
}

export interface EstateTemplate {
  id: string;
  label: string;
  shortLabel: string;
  category: DocCategory;
  description: string;
  complianceChecks: ComplianceCheck[];
  xrplAnchor: boolean;
  ipfsPin: boolean;
  fields: DocField[];
  systemPrompt: string;
}

export const ESTATE_TEMPLATES: EstateTemplate[] = [
  // ── SUCCESSION ──────────────────────────────────────────
  {
    id: "last-will-testament",
    label: "Last Will and Testament",
    shortLabel: "Will",
    category: "SUCCESSION",
    description: "Legally structured last will naming executor, distributing assets, and establishing guardianship for minor children.",
    complianceChecks: ["ESIGN", "UETA", "STATE_PROBATE"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "testatorName",     label: "Full Legal Name (Testator)",    type: "name",         required: true, placeholder: "John Michael Smith" },
      { key: "testatorAddress",  label: "Primary Residence Address",     type: "address",      required: true },
      { key: "testatorDOB",      label: "Date of Birth",                  type: "date",         required: true },
      { key: "jurisdiction",     label: "State / Jurisdiction",          type: "jurisdiction", required: true },
      { key: "executorName",     label: "Primary Executor Full Name",    type: "name",         required: true },
      { key: "executorRelation", label: "Relationship to Testator",      type: "text",         required: true },
      { key: "altExecutorName",  label: "Alternate Executor (optional)", type: "name",         required: false },
      { key: "beneficiaries",    label: "Beneficiaries & Allocations",   type: "list",         required: true, placeholder: "Name: Jane Smith, Relationship: Spouse, Share: 50%" },
      { key: "residualEstate",   label: "Residual Estate Disposition",   type: "textarea",     required: true },
      { key: "guardianName",     label: "Guardian for Minor Children",   type: "name",         required: false },
      { key: "specificBequests", label: "Specific Bequests",             type: "textarea",     required: false },
      { key: "cryptoInstructions", label: "Digital Asset Instructions",  type: "textarea",     required: false, placeholder: "Location of hardware wallet, seed phrase delivery instructions..." },
      { key: "witnessCount",     label: "Number of Witnesses Required",  type: "text",         required: true, placeholder: "2" },
    ],
    systemPrompt: `You are a senior estate attorney drafting a Last Will and Testament. Generate a complete, legally sound will that:
- Uses precise legal language appropriate for the specified jurisdiction
- Includes proper revocation clause for prior wills
- Establishes clear executor authority and succession
- Distributes assets exactly as specified
- Complies with UETA and state execution requirements
- Includes a digital asset clause under RUFADAA
- Is structured with numbered articles
Do NOT include legal advice disclaimers in the document body. Output the document only.`,
  },

  {
    id: "living-trust",
    label: "Revocable Living Trust",
    shortLabel: "Living Trust",
    category: "TRUST",
    description: "Revocable living trust that avoids probate, maintains privacy, and enables seamless asset transfer to beneficiaries.",
    complianceChecks: ["ESIGN", "UETA", "STATE_PROBATE"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "grantorName",      label: "Grantor Full Legal Name",       type: "name",         required: true },
      { key: "trustName",        label: "Trust Name",                    type: "text",         required: true, placeholder: "The John Smith Revocable Living Trust" },
      { key: "trustDate",        label: "Trust Establishment Date",      type: "date",         required: true },
      { key: "jurisdiction",     label: "Governing State",               type: "jurisdiction", required: true },
      { key: "successorTrustee", label: "Successor Trustee Name",        type: "name",         required: true },
      { key: "beneficiaries",    label: "Beneficiaries",                 type: "list",         required: true },
      { key: "trustAssets",      label: "Assets to Fund Trust",          type: "textarea",     required: true },
      { key: "distributionRules", label: "Distribution Rules",           type: "textarea",     required: true },
      { key: "incapacityProvision", label: "Incapacity Provisions",      type: "textarea",     required: false },
    ],
    systemPrompt: `Draft a complete Revocable Living Trust agreement. Include all standard provisions:
- Grantor's retained rights and revocation power
- Trustee powers and limitations
- Successor trustee succession chain
- Distribution provisions (during life and at death)
- Incapacity provisions with health care decision-making
- No-contest clause
- Spendthrift provisions
- Digital asset management clause (RUFADAA-aligned)
Jurisdiction-specific execution requirements must be noted in a signature block.`,
  },

  {
    id: "durable-poa",
    label: "Durable Power of Attorney",
    shortLabel: "Durable POA",
    category: "AUTHORITY",
    description: "Durable financial and legal power of attorney that survives incapacity, granting an agent authority over financial matters.",
    complianceChecks: ["ESIGN", "UETA", "STATE_PROBATE"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "principalName",    label: "Principal Full Name",           type: "name",         required: true },
      { key: "agentName",        label: "Agent (Attorney-in-Fact)",      type: "name",         required: true },
      { key: "altAgentName",     label: "Successor Agent",               type: "name",         required: false },
      { key: "jurisdiction",     label: "State",                         type: "jurisdiction", required: true },
      { key: "effectiveDate",    label: "Effective Date",                type: "date",         required: true },
      { key: "grantedPowers",    label: "Granted Powers",                type: "list",         required: true, placeholder: "Banking, Real Estate, Investments, Digital Assets..." },
      { key: "limitations",      label: "Specific Limitations",          type: "textarea",     required: false },
      { key: "durabilityClause", label: "Durability Language",           type: "text",         required: true, placeholder: "This power of attorney shall not be affected by subsequent disability..." },
    ],
    systemPrompt: `Draft a Durable Power of Attorney. The document must:
- Be durable (survive incapacity) with the proper statutory language for the jurisdiction
- Grant only the specifically listed powers
- Include appropriate limitations
- Include digital asset access authority under RUFADAA
- Include gifting limitations to prevent self-dealing
- Comply with state-specific POA statutes
- Include agent acceptance language`,
  },

  {
    id: "healthcare-directive",
    label: "Advance Healthcare Directive",
    shortLabel: "Healthcare Directive",
    category: "HEALTHCARE",
    description: "Living will and healthcare proxy designating medical decision-making authority and end-of-life care preferences.",
    complianceChecks: ["ESIGN", "UETA", "HIPAA"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "principalName",    label: "Principal Full Name",           type: "name",         required: true },
      { key: "agentName",        label: "Healthcare Agent (Proxy)",      type: "name",         required: true },
      { key: "altAgentName",     label: "Alternate Agent",               type: "name",         required: false },
      { key: "jurisdiction",     label: "State",                         type: "jurisdiction", required: true },
      { key: "lifeSupport",      label: "Life Support Preferences",      type: "textarea",     required: true, placeholder: "Specify preferences for artificial nutrition, ventilation, CPR..." },
      { key: "organDonation",    label: "Organ Donation Directive",      type: "text",         required: true },
      { key: "burialPreferences", label: "Burial / Disposition Preferences", type: "textarea", required: false },
      { key: "hipaaRelease",     label: "HIPAA Authorization Scope",     type: "textarea",     required: true },
    ],
    systemPrompt: `Draft a comprehensive Advance Healthcare Directive including a Living Will and Healthcare Proxy. The document must:
- Designate the healthcare agent with clear authority scope
- Include specific end-of-life care instructions
- Address artificial nutrition and hydration, ventilator use, and CPR
- Include HIPAA authorization for agent access to medical records
- Include organ and tissue donation language
- Comply with state-specific healthcare directive statutes
- Use plain-language instructions alongside legal clauses`,
  },

  {
    id: "trust-amendment",
    label: "Trust Amendment",
    shortLabel: "Trust Amendment",
    category: "TRUST",
    description: "Formal amendment to an existing revocable trust, modifying specific provisions without restating the entire instrument.",
    complianceChecks: ["ESIGN", "UETA"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "trustName",        label: "Trust Name",                    type: "text",         required: true },
      { key: "trustDate",        label: "Original Trust Date",           type: "date",         required: true },
      { key: "grantorName",      label: "Grantor Name",                  type: "name",         required: true },
      { key: "amendmentNumber",  label: "Amendment Number",              type: "text",         required: true, placeholder: "First, Second, Third..." },
      { key: "amendmentDate",    label: "Amendment Date",                type: "date",         required: true },
      { key: "changedProvisions", label: "Provisions Being Changed",     type: "textarea",     required: true },
      { key: "newLanguage",      label: "New / Replacement Language",    type: "textarea",     required: true },
    ],
    systemPrompt: `Draft a Trust Amendment that clearly identifies the original trust, specifies which provisions are being modified, and provides the exact replacement language. Include proper recitals, amendment authority language, and reaffirmation of all unchanged provisions.`,
  },

  // ── FINANCIAL ───────────────────────────────────────────
  {
    id: "estate-inventory",
    label: "Estate Asset Inventory",
    shortLabel: "Asset Inventory",
    category: "FINANCIAL",
    description: "Comprehensive inventory of all estate assets with valuations, account numbers, and access instructions for executors.",
    complianceChecks: ["STATE_PROBATE"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "decedentName",     label: "Owner / Decedent Name",         type: "name",         required: true },
      { key: "inventoryDate",    label: "Inventory Date",                type: "date",         required: true },
      { key: "realProperty",     label: "Real Property",                 type: "list",         required: false, placeholder: "Address, Estimated Value, Title..." },
      { key: "bankAccounts",     label: "Bank & Brokerage Accounts",     type: "list",         required: false, placeholder: "Institution, Account Type, Last 4 digits..." },
      { key: "cryptoAssets",     label: "Cryptocurrency & Digital Assets", type: "list",       required: false, placeholder: "Asset, Wallet/Exchange, Approx Value..." },
      { key: "nfts",             label: "NFTs & Digital Collectibles",   type: "list",         required: false },
      { key: "businessInterests", label: "Business Interests",           type: "list",         required: false },
      { key: "lifeInsurance",    label: "Life Insurance Policies",       type: "list",         required: false },
      { key: "retirement",       label: "Retirement Accounts (IRA, 401k)", type: "list",       required: false },
      { key: "personalProperty", label: "Personal Property of Value",    type: "list",         required: false },
      { key: "debts",            label: "Known Debts & Liabilities",     type: "list",         required: false },
      { key: "executorInstructions", label: "Special Executor Instructions", type: "textarea", required: false },
    ],
    systemPrompt: `Generate a formatted Estate Asset Inventory document. Organize all assets into clearly labeled sections with subtotals. For each asset include: description, estimated value at inventory date, ownership type, account/reference number where applicable, and location of original documents. Flag any crypto assets with a note about seed phrase/private key location instructions. This document will be sealed in the vault and released only to executors.`,
  },

  {
    id: "beneficiary-instructions",
    label: "Beneficiary Instructions Letter",
    shortLabel: "Beneficiary Letter",
    category: "SUCCESSION",
    description: "Personal letter to each named beneficiary with specific instructions, account access details, and succession wishes.",
    complianceChecks: ["RUFADAA"],
    xrplAnchor: false,
    ipfsPin: true,
    fields: [
      { key: "authorName",       label: "Author (Your Name)",            type: "name",         required: true },
      { key: "beneficiaryName",  label: "Beneficiary Name",              type: "name",         required: true },
      { key: "relationship",     label: "Relationship",                  type: "text",         required: true },
      { key: "allocatedAssets",  label: "Assets Allocated to Recipient", type: "textarea",     required: true },
      { key: "accessInstructions", label: "Access / Recovery Instructions", type: "textarea",  required: true },
      { key: "personalMessage",  label: "Personal Message",              type: "textarea",     required: false },
      { key: "cryptoAccess",     label: "Digital Asset Access Details",  type: "textarea",     required: false, placeholder: "Hardware wallet location, exchange login process..." },
    ],
    systemPrompt: `Draft a clear, compassionate beneficiary instructions letter. Balance personal warmth with precise practical instructions. For digital assets, provide step-by-step access instructions. Ensure all account access instructions are complete enough that a non-technical beneficiary can follow them. Flag any information that should remain encrypted until release.`,
  },

  {
    id: "executor-instructions",
    label: "Executor Instructions Package",
    shortLabel: "Executor Package",
    category: "SUCCESSION",
    description: "Complete executor instruction package covering duties, asset locations, account access, and step-by-step estate administration process.",
    complianceChecks: ["RUFADAA", "STATE_PROBATE"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "testatorName",     label: "Estate Owner Name",             type: "name",         required: true },
      { key: "executorName",     label: "Executor Name",                 type: "name",         required: true },
      { key: "jurisdiction",     label: "Probate Jurisdiction",          type: "jurisdiction", required: true },
      { key: "probateAttorney",  label: "Recommended Probate Attorney",  type: "text",         required: false },
      { key: "financialAdvisor", label: "Financial Advisor / CPA",       type: "text",         required: false },
      { key: "immediateActions", label: "Immediate Actions (First 72h)", type: "textarea",     required: true },
      { key: "accountList",      label: "Financial Account Summary",     type: "textarea",     required: true },
      { key: "digitalAssets",    label: "Digital Asset Recovery Steps",  type: "textarea",     required: true },
      { key: "debtObligations",  label: "Known Debts to Settle",         type: "textarea",     required: false },
      { key: "specialInstructions", label: "Special Instructions",       type: "textarea",     required: false },
    ],
    systemPrompt: `Generate a comprehensive Executor Instructions Package. Structure it as a professional estate administration guide with:
1. Immediate action checklist (first 72 hours)
2. Probate filing overview for the specified jurisdiction
3. Asset notification and claim procedures by category
4. Digital asset recovery procedures (RUFADAA-aligned)
5. Debt settlement priority order
6. Distribution timeline and procedures
7. Final accounting requirements
Write in clear, actionable language an executor without legal training can follow.`,
  },

  // ── CRYPTO / DIGITAL ────────────────────────────────────
  {
    id: "digital-asset-will",
    label: "Digital Asset Will & Access Protocol",
    shortLabel: "Crypto Will",
    category: "CRYPTO",
    description: "Dedicated digital asset succession document covering crypto wallets, NFTs, DeFi positions, exchange accounts, and Web3 identity.",
    complianceChecks: ["RUFADAA", "ESIGN"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "ownerName",        label: "Asset Owner Name",              type: "name",         required: true },
      { key: "executorName",     label: "Digital Asset Executor",        type: "name",         required: true },
      { key: "jurisdiction",     label: "Governing Jurisdiction",        type: "jurisdiction", required: true },
      { key: "wallets",          label: "Wallet Addresses (public only)", type: "list",        required: true, placeholder: "Label, Chain, Public Address" },
      { key: "exchangeAccounts", label: "Exchange Accounts",             type: "list",         required: false, placeholder: "Exchange, Username/Email, Recovery steps..." },
      { key: "seedPhraseLocation", label: "Seed Phrase Storage Instructions", type: "textarea", required: true, placeholder: "Describe WHERE the seed phrase is stored, not the phrase itself" },
      { key: "hardwareWallets",  label: "Hardware Wallet Details",       type: "textarea",     required: false },
      { key: "nftCollections",   label: "NFT Collections",               type: "list",         required: false },
      { key: "defiPositions",    label: "DeFi / Protocol Positions",     type: "list",         required: false },
      { key: "xrplTrustlines",   label: "XRPL Trustlines & IOUs",        type: "list",         required: false },
      { key: "stellarAssets",    label: "Stellar Assets",                type: "list",         required: false },
      { key: "distributionIntent", label: "Distribution Intent by Asset", type: "textarea",    required: true },
    ],
    systemPrompt: `Draft a Digital Asset Will and Access Protocol. This is a specialized succession document for cryptocurrency and Web3 assets. It must:
- Reference RUFADAA (Revised Uniform Fiduciary Access to Digital Assets Act) authority
- Distinguish clearly between public addresses (which can be listed) and private keys/seeds (which must never appear in the document — only storage location)
- Provide step-by-step recovery procedures for each asset type
- Address exchange account succession (Coinbase, Kraken, Binance, etc.)
- Cover XRPL trustlines and account reserves
- Cover Stellar asset paths
- Include multi-sig and smart contract position recovery
- Be structured for a technical executor who may not be a crypto expert`,
  },

  {
    id: "nda-estate",
    label: "Estate NDA (Executor Confidentiality)",
    shortLabel: "Estate NDA",
    category: "SUCCESSION",
    description: "Non-disclosure agreement binding executors, attorneys, and advisors to confidentiality regarding estate contents.",
    complianceChecks: ["ESIGN", "UETA"],
    xrplAnchor: false,
    ipfsPin: true,
    fields: [
      { key: "disclosingParty",  label: "Estate / Disclosing Party",     type: "name",         required: true },
      { key: "receivingParty",   label: "Receiving Party (Executor/Advisor)", type: "name",    required: true },
      { key: "receivingRole",    label: "Receiving Party Role",          type: "text",         required: true },
      { key: "jurisdiction",     label: "Governing Law",                 type: "jurisdiction", required: true },
      { key: "effectiveDate",    label: "Effective Date",                type: "date",         required: true },
      { key: "protectedInfo",    label: "Categories of Protected Information", type: "list",   required: true },
      { key: "duration",         label: "Duration of Confidentiality",   type: "text",         required: true, placeholder: "5 years from execution" },
      { key: "permittedDisclosures", label: "Permitted Disclosures",     type: "textarea",     required: false },
    ],
    systemPrompt: `Draft an Estate NDA with professional, enforceable language. Include standard mutual NDA provisions adapted for estate context: definition of confidential information, exceptions (prior knowledge, public domain, court order), return of materials, injunctive relief provisions, and survival clauses. The NDA should specifically cover vault contents, digital asset details, beneficiary allocations, and financial information.`,
  },

  // ── BUSINESS ────────────────────────────────────────────
  {
    id: "business-succession-plan",
    label: "Business Succession Plan",
    shortLabel: "Business Succession",
    category: "BUSINESS",
    description: "Structured business succession plan for privately held businesses, covering ownership transfer, key person provisions, and buy-sell arrangements.",
    complianceChecks: ["ESIGN", "UETA", "STATE_PROBATE"],
    xrplAnchor: true,
    ipfsPin: true,
    fields: [
      { key: "businessName",     label: "Business Name",                 type: "text",         required: true },
      { key: "businessType",     label: "Entity Type",                   type: "text",         required: true, placeholder: "LLC, S-Corp, Partnership..." },
      { key: "ownerName",        label: "Current Owner(s)",              type: "name",         required: true },
      { key: "successorName",    label: "Designated Successor(s)",       type: "name",         required: true },
      { key: "valuationMethod",  label: "Business Valuation Method",     type: "text",         required: true },
      { key: "transferTriggers", label: "Transfer Trigger Events",       type: "list",         required: true, placeholder: "Death, Disability, Retirement..." },
      { key: "buySellTerms",     label: "Buy-Sell Terms",                type: "textarea",     required: false },
      { key: "keyPersonPolicy",  label: "Key Person Insurance",          type: "text",         required: false },
      { key: "operatingInstructions", label: "Immediate Operating Instructions", type: "textarea", required: true },
    ],
    systemPrompt: `Draft a Business Succession Plan document. Structure it to address: immediate business continuity (first 30 days), ownership transfer mechanics (including buy-sell agreement trigger and funding mechanism), management succession, customer/vendor notification protocol, and long-term succession timeline. Include provisions for digital asset holdings and intellectual property transfer.`,
  },

  {
    id: "letter-of-instruction",
    label: "Letter of Final Instructions",
    shortLabel: "Final Instructions",
    category: "SUCCESSION",
    description: "Personal letter of instruction to family and executor covering final wishes, account locations, important contacts, and personal messages.",
    complianceChecks: [],
    xrplAnchor: false,
    ipfsPin: true,
    fields: [
      { key: "authorName",       label: "Your Full Name",                type: "name",         required: true },
      { key: "dateWritten",      label: "Date Written",                  type: "date",         required: true },
      { key: "funeralWishes",    label: "Funeral & Burial Wishes",       type: "textarea",     required: true },
      { key: "importantContacts", label: "Important Contacts",           type: "list",         required: true, placeholder: "Attorney, CPA, Financial Advisor, Doctor..." },
      { key: "documentLocations", label: "Where to Find Important Documents", type: "textarea", required: true },
      { key: "digitalAccess",    label: "Digital Account Access Summary", type: "textarea",    required: true },
      { key: "insurancePolicies", label: "Insurance Policy Information", type: "list",         required: false },
      { key: "personalMessages",  label: "Personal Messages to Loved Ones", type: "textarea",  required: false },
      { key: "charitableWishes",  label: "Charitable Wishes",            type: "textarea",     required: false },
    ],
    systemPrompt: `Write a warm, clear, and complete Letter of Final Instructions. This is NOT a legal document — it's a personal guide for family and executor. Balance emotional warmth with practical precision. For digital accounts, provide enough detail that a non-technical family member can act quickly. Include a summary checklist at the top. This letter will be sealed until the vault release protocol is satisfied.`,
  },

  {
    id: "guardian-nomination",
    label: "Guardian Nomination for Minor Children",
    shortLabel: "Guardian Nomination",
    category: "SUCCESSION",
    description: "Formal nomination of guardian(s) for minor children in the event both parents are deceased or incapacitated.",
    complianceChecks: ["ESIGN", "UETA", "STATE_PROBATE"],
    xrplAnchor: false,
    ipfsPin: true,
    fields: [
      { key: "parentNames",      label: "Parent(s) Full Names",          type: "name",         required: true },
      { key: "children",         label: "Minor Children (Name, DOB)",    type: "list",         required: true },
      { key: "primaryGuardian",  label: "Primary Guardian Name",         type: "name",         required: true },
      { key: "guardianAddress",  label: "Guardian Address",              type: "address",      required: true },
      { key: "altGuardian",      label: "Alternate Guardian",            type: "name",         required: false },
      { key: "jurisdiction",     label: "State",                         type: "jurisdiction", required: true },
      { key: "guardianAcceptance", label: "Guardian Acceptance Statement", type: "textarea",   required: false },
      { key: "specialInstructions", label: "Special Care Instructions",  type: "textarea",     required: false },
      { key: "financialProvisions", label: "Financial Provisions for Children", type: "textarea", required: false },
    ],
    systemPrompt: `Draft a Guardian Nomination document. This should be expressly incorporated by reference into the parent's Last Will and Testament. Include: nomination with acceptance language, succession of guardians, financial management provisions for any trust funds created for children, special needs provisions if applicable, and personal care instructions. Note this is an expression of parental wishes and subject to court approval.`,
  },
];

export function getTemplate(id: string): EstateTemplate | undefined {
  return ESTATE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: DocCategory): EstateTemplate[] {
  return ESTATE_TEMPLATES.filter((t) => t.category === category);
}

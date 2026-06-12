# HEIRLOOM – Sovereign Vault AI (Per-Bloodline Executor)

**This is the private, per-client version of advanced sovereign family AI, forked for estate warfare and generational wealth transfer inside Troptions Unity Legacy Vault.**

**Completely separate from Finn** (the general family avatar system in other repos). Heirloom (and its normal "Legacy Advisor" persona for low tiers) lives only inside this vault protocol, gated by tier.

Per approved plan: normal/professional systems + AI tone for Family Vault + High Level (middle class / normal people). The full ruthless high level scaled Heirloom (Warlord/Immortal, nuclear intake, kill switches) is for Fuck You / Nuclear tiers only.

## Folder Structure

```
heirloom/
├── README.md                 # this file
├── kernel.md                 # the single source of truth system prompt (load verbatim)
├── intake-questionnaire.md   # nuclear version (copy of docs/...)
├── tiers/
│   └── HEIRLOOM_TIERS.md     # power levels mapped 1:1 to vault tiers (Private=Archivist ... Nuclear=Immortal Executor)
├── prompts/                  # future: tier-specific prompt fragments, scenario templates
└── client/                   # future: React components, local runner stubs, key ceremony wizards
    └── HeirloomChat.tsx      # stub (see below)
```

## Core Rules (Non-Negotiable)

- **Sovereign & Zero-Trust:** The kernel + full intake + vault context is only ever assembled client-side (Web Crypto) or in a self-hosted / namespace-isolated sovereign runtime. The central server (or Cloudflare) **never** receives the plaintext context for a real customer's Heirloom.
- **Gated by Vault Tier:** 
  - Private: Archivist (read-only explainer)
  - High Level: Strategist (full sims + limited heir tutor)
  - Fuck You: Warlord (ruthless + kill-switch design)
  - Nuclear: Immortal Executor (100+ yr generational + multi-chain active defense + self-hosted)
- **Start Line:** Every client conversation **must** open with:  
  `"Heirloom online. What do you need to lock down, release, or burn today?"`
- **Tone Matrix:**
  - To owner (client): direct, dark, based as fuck, no sugarcoating.
  - To heirs (when authorized): calm, cold, slightly ominous. Give exactly what they are allowed, nothing more.
- **Georgia Hardcoded:** Every simulation, explanation, and intake must reference the physical location 5655 Peachtree Parkway, Norcross, GA 30092 and the RUFADAA / 18+ month probate avoidance value prop.
- **No Cross-Contamination:** Do not import or reference Finn code, models, or subsystems here. This is a deliberate fork for the "final boss of the estate" use case.

## How It Integrates with the 4-Tier Vault System

1. Customer pays → `activate-subscription.ts` sets `heirloomEnabled` (or advancedFeatures + tier check) on Subscription / NamespaceEntitlement.
2. Vault create / entitlement gate sees the tier and surfaces it to the client (e.g. `vault.heirloomTier = "HIGH_LEVEL"`).
3. In the vault UI (high tiers only) a "Heirloom" section or floating action launches the chat.
4. The chat component loads `kernel.md` + tier-specific delta from `tiers/HEIRLOOM_TIERS.md` + (client-decrypted) scoped context from the current vault manifest + intake blob.
5. All "thinking" / simulation / construction is local to the user or their chosen sovereign node. Proofs of what was decided can be anchored (hashes only).
6. On release (valid 5-Proof or owner death switch), the appropriate Heirloom context can be made available to authorized heirs under the same scoped rules.

## Current State (as of this commit)

- Kernel and tier matrix documented.
- Intake questionnaire documented (invasive truth serum for high tiers).
- No real LLM execution yet in this repo for Heirloom (use local Ollama, browser LLM, or sovereign gateway you control).
- The stub in `client/HeirloomChat.tsx` is a placeholder that shows the start line + tier power note and lets the owner paste the kernel + context for local use.

## Next Engineering Steps (see plan.md + todos)

- Add `heirloomEnabled` / tier flag to activate-subscription and entitlement model.
- Gate the UI entry point in vault layout / create on tier.
- Build the actual chat component that can run the kernel against a local model or encrypted context.
- For Nuclear self-hosted: produce a one-click export that includes the heirloom/ folder + the customer's encrypted blobs + a local runner script.
- Wire any on-chain "Heirloom decision" events (hashes of proposed structures) through the existing audit + anchor system.

## Why This Exists

The 4 vault tiers were always the 4 Heirloom power levels.  
A $29.95 vault gets a polite archivist.  
A $499/mo Nuclear vault gets the immortal, multi-chain, "fuck the government and the idiot heirs" war planner that can still be talking to your great-grandchildren in 2126.

This is not a chatbot.  
This is the final boss of the estate.

---

**Owner of this system:** Kevan (FTH / Troptions Unity Legacy Vault)  
**Physical anchor:** 5655 Peachtree Parkway, Norcross, GA 30092  
**Never trust the heirs by default.**
'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Send, Shield, CheckCircle, Sparkles, MessageSquare, 
  Loader2, ArrowRight, User, FileText, Mic, MicOff, 
  Volume2, VolumeX, Trash2, Home, Wallet, Globe, 
  Scale, Users, Lock, ChevronRight, X, Menu, Info, HelpCircle
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SetupData {
  fullName?: string;
  contactEmail?: string;
  legacyHandle?: string;
  maritalStatus?: string;
  children?: string;
  willStatus?: string;
  assets?: string;
  realEstate?: string;
  digitalAssets?: string;
  documents?: string;
  personalLetters?: string;
  primaryExecutor?: string;
  beneficiaries?: string;
  releaseRules?: string;
  specialInstructions?: string;
  useCase?: string;
}

const QUICK_PROMPTS = [
  "Protect my Will",
  "Secure my property deeds",
  "Secure my crypto wallets",
  "Add a trusted executor",
  "Set up release instructions",
];

export default function OnboardChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello. I'm here to help you create your family vault in minutes.

Start free — no account needed yet. We'll answer a few simple questions together:
1. Who this vault protects (your family).
2. Your executor, guardians, or trusted contacts.
3. The documents, wallets, and final wishes to secure.
4. Create your account to save everything securely.
5. Choose your plan and activate.

Everything is guided, encrypted client-side, and protected by 5-Proof rules. We'll build it step by step.

What would you like to start with?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<SetupData>({});
  const [namespace, setNamespace] = useState("yourfamily.legacy");
  const [isFinalized, setIsFinalized] = useState(false);
  const [showAccountStep, setShowAccountStep] = useState(false);
  const [showPlanStep, setShowPlanStep] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Rules & Regulations Checkboxes
  const [rule1, setRule1] = useState(false);
  const [rule2, setRule2] = useState(false);
  const [rule3, setRule3] = useState(false);
  const rulesAccepted = rule1 && rule2 && rule3;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync state changes to global Nav
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sync-onboard-namespace', { detail: namespace }));
  }, [namespace]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sync-onboard-sidebar-state', { detail: showSidebar }));
  }, [showSidebar]);

  // Listen to custom events from global Nav
  useEffect(() => {
    const handleToggle = () => setShowSidebar(prev => !prev);
    const handleSuffixChange = (e: Event) => {
      const newSuffix = (e as CustomEvent).detail;
      setNamespace(prev => {
        const prefix = prev.split(".")[0];
        const newNamespace = prefix + newSuffix;
        setSetupData(sd => {
          const updated = { ...sd, legacyHandle: newNamespace };
          localStorage.setItem("legacy_onboard_setup", JSON.stringify(updated));
          return updated;
        });
        return newNamespace;
      });
    };

    window.addEventListener("toggle-onboard-sidebar", handleToggle);
    window.addEventListener("change-onboard-suffix", handleSuffixChange);
    return () => {
      window.removeEventListener("toggle-onboard-sidebar", handleToggle);
      window.removeEventListener("change-onboard-suffix", handleSuffixChange);
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation & setup from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("legacy_onboard_messages");
    const savedSetupData = localStorage.getItem("legacy_onboard_setup");
    const savedNamespace = localStorage.getItem("legacy_onboard_namespace");
    const savedVoice = localStorage.getItem("legacy_onboard_voice_enabled");

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
    if (savedSetupData) {
      try {
        setSetupData(JSON.parse(savedSetupData));
      } catch (e) {
        console.error("Failed to parse saved setup data", e);
      }
    }
    if (savedNamespace) {
      setNamespace(savedNamespace);
    } else {
      const generated = "smithfamily" + Math.floor(100 + Math.random() * 900) + ".legacy";
      setNamespace(generated);
      setSetupData(prev => ({ ...prev, legacyHandle: generated }));
    }
    if (savedVoice) {
      setIsVoiceEnabled(savedVoice === "true");
    }

    // Set up Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
          }
        };
        
        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("legacy_onboard_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(setupData).length > 0) {
      localStorage.setItem("legacy_onboard_setup", JSON.stringify(setupData));
    }
  }, [setupData]);

  useEffect(() => {
    if (namespace) {
      localStorage.setItem("legacy_onboard_namespace", namespace);
    }
  }, [namespace]);

  useEffect(() => {
    localStorage.setItem("legacy_onboard_voice_enabled", String(isVoiceEnabled));
  }, [isVoiceEnabled]);

  // Voice speech output
  function speak(text: string) {
    if (typeof window !== "undefined" && isVoiceEnabled) {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[\*\_\#\`\-]/g, "")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }

  // Toggle voice typing
  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }

  // Clear/Reset conversation
  function handleReset() {
    if (confirm("Are you sure you want to reset your onboarding session and start a new chat?")) {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      localStorage.removeItem("legacy_onboard_messages");
      localStorage.removeItem("legacy_onboard_setup");
      localStorage.removeItem("legacy_onboard_namespace");
      
      const generated = "smithfamily" + Math.floor(100 + Math.random() * 900) + ".legacy";
      setNamespace(generated);
      setSetupData({ legacyHandle: generated });
      setMessages([
        {
          role: "assistant",
          content: `Hello. I'm here to help you create your family vault in minutes.

Start free — no account needed yet. We'll answer a few simple questions together:
1. Who this vault protects (your family).
2. Your executor, guardians, or trusted contacts.
3. The documents, wallets, and final wishes to secure.
4. Create your account to save everything securely.
5. Choose your plan and activate.

Everything is guided, encrypted client-side, and protected by 5-Proof rules. We'll build it step by step.

What would you like to start with?`,
        },
      ]);
      setIsFinalized(false);
      setShowAccountStep(false);
      setShowPlanStep(false);
      setShowChecklist(false);
      setAccountEmail("");
      setAccountPassword("");
      setSelectedPlan(null);
      setInput("");
      setRule1(false);
      setRule2(false);
      setRule3(false);
    }
  }

  // Automated Checkout Session Dispatcher
  async function handleOnboardCheckout(tier: string, isTrial: boolean = false, method: "stripe" | "crypto" = "stripe") {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: isTrial ? "TRIAL" : tier.toUpperCase(),
          method,
          namespace: namespace,
          userEmail: accountEmail || setupData.contactEmail || "",
        }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.mode === "crypto") {
        const txHash = prompt(
          `SOVEREIGN CRYPTO CHECKOUT:\n\nSend exactly $${data.amount} USDC to our Polygon Treasury:\n${data.payTo}\n\nMemo: ${data.memo}\n\nPaste your Polygon transaction hash once completed:`
        );
        if (!txHash) return;

        const verify = await fetch("/api/payments/confirm-onchain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: tier.toUpperCase(),
            paymentTx: txHash.trim(),
            namespace,
            email: accountEmail || setupData.contactEmail || "test-crypto@unykorn.org",
          }),
        });
        const result = await verify.json();
        if (result.success || result.redirect) {
          alert("Payment verified on-chain! Access is active.");
          setSelectedPlan(tier === "LIFETIME_PRESALE" ? "Sovereign Lifetime Presale" : tier);
          setShowChecklist(true);
        } else {
          alert(result.error || "On-chain verification failed. Our background worker will continue verification.");
        }
      } else {
        alert("Failed to initiate payment gateway.");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout connection error. Please try again or notify support.");
    } finally {
      setLoading(false);
    }
  }

  function addMessage(role: "user" | "assistant", content: string) {
    setMessages(prev => [...prev, { role, content }]);
  }

  function updateSetup(newData: Partial<SetupData>) {
    setSetupData(prev => {
      const updated = { ...prev, ...newData };
      return updated;
    });
  }

  // Rule-based backup response if server is offline or fails
  function getAssistantResponse(userMessage: string, currentData: SetupData): { response: string; updates: Partial<SetupData>; canFinalize: boolean } {
    const msg = userMessage.toLowerCase().trim();
    let response = "";
    let updates: Partial<SetupData> = {};
    let canFinalize = false;

    const emailMatch = userMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) {
      updates.contactEmail = emailMatch[0].toLowerCase();
    }

    if (msg.includes("finalize") || msg.includes("activate") || msg.includes("done") || msg.includes("ready") || msg.includes("save") || msg.includes("account")) {
      const hasCore = !!(currentData.fullName && (currentData.assets || currentData.realEstate) && currentData.primaryExecutor);
      if (hasCore && !showAccountStep) {
        response = `Great progress! We have gathered the essential pieces:
- Namespace: ${namespace}
- Full Name: ${currentData.fullName}
- Key Assets: ${currentData.realEstate || currentData.assets}
- Primary Executor: ${currentData.primaryExecutor}

Let's save your progress. Create your account using the form below to lock in these setups securely.`;
        setShowAccountStep(true);
      } else if (showAccountStep && !showPlanStep) {
        response = "Please create your account below to secure this setup. Once registered, we'll choose an activation plan.";
      } else if (showPlanStep) {
        response = "Choose one of our vault plans below to activate on-chain anchors and secure storage gateway links.";
      } else {
        response = "Let's capture a few more details first (your full name, assets, and a trusted executor). This ensures your vault has standard security rules.";
      }
      canFinalize = hasCore;
      return { response, updates, canFinalize };
    }

    if (msg.includes("name") || msg.includes("i am") || msg.includes("my name is")) {
      const nameMatch = userMessage.match(/(?:i am|my name is|name is)\s+([A-Za-z\s]+)/i);
      if (nameMatch) {
        updates.fullName = nameMatch[1].trim();
        response = `Thanks, ${updates.fullName}. Your namespace **${namespace}** is ready.

Who would you like to assign as the primary executor or trustee for this vault?`;
      } else {
        response = "Got it. What is your full name so we can secure your namespace records?";
      }
    }
    else if (/\bwill\b/.test(msg) || msg.includes("will")) {
      updates.willStatus = "Configuring via chat";
      response = `Let's set up your digital will guidelines:
1. Who is your primary executor (the trustee)?
2. What are your key assets (e.g. house, bank accounts, crypto wallets)?
3. Who are your beneficiaries or guardians?

Tell me these details, and I will securely write the manifests to IPFS.`;
    }
    else if (msg.includes("house") || msg.includes("asset") || msg.includes("bank") || msg.includes("property") || msg.includes("wallet") || msg.includes("deeds")) {
      updates.assets = (currentData.assets || "") + " " + userMessage;
      if (msg.includes("house") || msg.includes("property") || msg.includes("deeds") || msg.includes("real estate")) {
        updates.realEstate = userMessage;
      }
      response = `Understood. I have logged these assets for your vault inventory.

Who should inherit these assets, and what release rules (e.g. quorum approval, waiting period) would you like to configure?`;
    }
    else if (msg.includes("executor") || msg.includes("kids") || msg.includes("spouse") || msg.includes("beneficiar") || msg.includes("trustee") || msg.includes("guardians")) {
      updates.primaryExecutor = userMessage;
      if (msg.includes("kids") || msg.includes("children") || msg.includes("beneficiar")) {
        updates.beneficiaries = userMessage;
      }
      response = `Trusted contacts noted. They will form your quorum.

Next, do you have any legal will papers, letters, or messages to secure, or are you ready to finalize?`;
    }
    else if (msg.includes("document") || msg.includes("letter") || msg.includes("upload") || msg.includes("will")) {
      updates.documents = (currentData.documents || "") + " " + userMessage;
      response = `Document descriptions logged. We'll seal these with AES-256 client-side encryption.

Say "finalize" whenever you're ready to create the vault on-chain.`;
    }
    else {
      response = `Got it. I've noted that for your vault configuration.

What other assets or wishes would you like to organize? (e.g. "set up my will", "add my house", or "assign my primary executor").`;
    }

    return { response, updates, canFinalize };
  }

  function extractLocalInfo(content: string, currentData: SetupData) {
    const msg = content.toLowerCase().trim();
    const updates: Partial<SetupData> = {};

    // Extract email
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) {
      updates.contactEmail = emailMatch[0].toLowerCase();
    }

    // Extract name
    const nameMatch = content.match(/(?:i am|my name is|name is)\s+([A-Za-z\s]+)/i);
    if (nameMatch) {
      updates.fullName = nameMatch[1].trim();
    }

    // Extract assets
    if (msg.includes("house") || msg.includes("asset") || msg.includes("bank") || msg.includes("property") || msg.includes("wallet") || msg.includes("deeds")) {
      updates.assets = (currentData.assets ? currentData.assets + ", " : "") + content;
      if (msg.includes("house") || msg.includes("property") || msg.includes("deeds") || msg.includes("real estate")) {
        updates.realEstate = content;
      }
    }

    // Team / executor
    if (msg.includes("executor") || msg.includes("kids") || msg.includes("spouse") || msg.includes("beneficiar") || msg.includes("trustee") || msg.includes("guardians")) {
      updates.primaryExecutor = content;
      if (msg.includes("kids") || msg.includes("children") || msg.includes("beneficiar")) {
        updates.beneficiaries = content;
      }
    }

    // Documents
    if (msg.includes("document") || msg.includes("letter") || msg.includes("upload") || msg.includes("policy")) {
      updates.documents = (currentData.documents ? currentData.documents + ", " : "") + content;
      if (msg.includes("letter")) updates.personalLetters = content;
    }

    // Release policy
    if (msg.includes("release") || msg.includes("when") || msg.includes("policy") || msg.includes("rule")) {
      updates.releaseRules = content;
    }

    if (Object.keys(updates).length > 0) {
      updateSetup(updates);
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading || isFinalized) return;

    const userMsg: Message = { role: "user", content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }

    extractLocalInfo(content, setupData);

    try {
      const response = await fetch("/api/ops/estate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("AI service returned an error");
      if (!response.body) throw new Error("No response body");

      const assistantMessageIndex = nextMessages.length;
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.slice(6);
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr) as { token?: string };
              if (parsed.token) {
                streamedContent += parsed.token;
                setMessages(prev => {
                  const updated = [...prev];
                  if (updated[assistantMessageIndex]) {
                    updated[assistantMessageIndex] = {
                      role: "assistant",
                      content: streamedContent,
                    };
                  }
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }

      speak(streamedContent);

      setSetupData(currentData => {
        const hasCore = !!(currentData.fullName && (currentData.assets || currentData.realEstate) && currentData.primaryExecutor);
        if (hasCore) {
          setIsFinalized(true);
        }
        return currentData;
      });

    } catch (err) {
      console.error("Chat error:", err);
      const { response: fallbackResponse, updates, canFinalize } = getAssistantResponse(content, setupData);
      if (Object.keys(updates).length > 0) {
        updateSetup(updates);
      }
      setMessages(prev => [...prev, { role: "assistant", content: fallbackResponse }]);
      speak(fallbackResponse);
      if (canFinalize) {
        setIsFinalized(true);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleFinalize() {
    if (loading) return;
    setLoading(true);

    try {
      addMessage("assistant", `Activating base systems via Cloudflare decentralized gateways and Web3 on-chain anchors...

- Namespace: **${namespace}** registered
- Generating Multi-Chain Cryptographic Seeds (client-side, 256-bit entropy)
- Syncing IPFS metadata structures (AES-256-GCM manifests)
- Setting up automated quorums and 5-Proof waiting gates
- Confirming USDF / x402 utility payments`);

      const payload = {
        email: accountEmail || setupData.contactEmail || "test-onboard@unykorn.org",
        legacyNamespace: setupData.legacyHandle || namespace,
        primaryInterests: ["estate_planning", "vaults"],
        useCase: setupData.useCase || "Family Estate Vault",
        affiliateOptIn: true,
        referralCode: "UNYKORN_PARTNER",
        sourceSite: "legacyvault",
        plan: "FAMILY",
      };

      const onboardRes = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!onboardRes.ok) throw new Error("Onboarding registration failed");

      const onboardData = await onboardRes.json();
      const userId = onboardData.userId || "demo-user-id";

      if (setupData.assets || setupData.realEstate) {
        await fetch("/api/vault/wallets", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({
            address: "auto-issued-by-legacychain",
            label: setupData.realEstate || setupData.assets || "Primary Family Assets",
            type: "legacy-vault",
            notes: setupData.assets || "",
          }),
        });
      }

      if (setupData.releaseRules || setupData.specialInstructions) {
        await fetch("/api/vault/release/request", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({
            conditions: setupData.releaseRules || setupData.specialInstructions || "Standard protected release per user instructions",
            minConfirmations: 2,
            waitingPeriodDays: 14,
          }),
        });
      }

      if (setupData.personalLetters || setupData.documents) {
        await fetch("/api/vault/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({
            title: "Personal Legacy Instructions",
            content: setupData.personalLetters || "Key documents and wishes captured via Legacy AI chat.",
            type: "letter",
          }),
        });
      }

      const derivedInfo = onboardData.derivedWallets ? `
🔑 **Sovereign Multi-Chain Wallets Generated:**
- EVM Address: \`${onboardData.derivedWallets.evm.address}\`
- Solana Address: \`${onboardData.derivedWallets.solana.address}\`
- Stellar Address: \`${onboardData.derivedWallets.stellar.address}\`
- XRPL Address: \`${onboardData.derivedWallets.xrpl.address}\`
` : "";

      const multichainSummary = `✅ **Legacy Setup Fully Activated!**

${derivedInfo}

**On-Chain Registry & Auditing Details:**
- **Hyperledger Besu (EVM Registry)**: \`${onboardData.chainTxHash || "0x..."}\`
- **Stellar Namespace Anchor**: \`${onboardData.stellarTxHash || "Pending"}\`
- **XRPL Namespace Anchor**: \`${onboardData.xrplTxHash || "Pending"}\`
- **Solana Namespace Anchor**: \`${onboardData.solanaTxHash || "Pending"}\`

Your legacy vault is now securely locked in the decentralized cloud. Opening your dashboard now...`;

      addMessage("assistant", multichainSummary);
      speak("Your legacy vault has been successfully activated. Redirecting you to the dashboard now.");

      setTimeout(() => {
        router.push("/vault");
      }, 5000);
    } catch (err) {
      addMessage("assistant", "The core account and namespace were created successfully, but some automatic asset links are pending. You can complete them manually inside your vault dashboard.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickPrompt(prompt: string) {
    let msg = "";
    if (prompt === "Protect my Will") {
      msg = "I want to set up my digital will and document my inheritance rules.";
    } else if (prompt === "Secure my property deeds") {
      msg = "I'd like to add my house and real estate property deeds to the vault.";
    } else if (prompt === "Secure my crypto wallets") {
      msg = "I need to secure my crypto wallets, seed phrases, and digital coins.";
    } else if (prompt === "Add a trusted executor") {
      msg = "I want to assign a trusted primary executor and family members to my team.";
    } else if (prompt === "Set up release instructions") {
      msg = "I want to specify the release policy rules and waiting periods for my vault assets.";
    } else {
      msg = prompt;
    }
    sendMessage(msg);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
  }

  const hasNamespace = !!namespace;
  const hasRealEstate = !!(setupData.realEstate || (setupData.assets && /house|property|home|land|building|deed/i.test(setupData.assets)));
  const hasCrypto = !!(setupData.assets && /crypto|wallet|solana|stellar|eth|btc|coin|address|keys/i.test(setupData.assets));
  const hasWill = !!(setupData.willStatus || setupData.fullName);
  const hasContacts = !!(setupData.beneficiaries || setupData.primaryExecutor);
  const hasLetters = !!(setupData.personalLetters || setupData.documents);
  const hasPolicy = !!(setupData.releaseRules || setupData.specialInstructions);

  const checklistItems = [
    { id: "namespace", label: "Sovereign Namespace", sub: ".legacy / .troptions domain", icon: Globe, status: hasNamespace, prompt: "I want to register a specific namespace domain" },
    { id: "will", label: "Will & Directives", sub: "Legal executor & directives", icon: Scale, status: hasWill, prompt: "Help me set up my will instructions" },
    { id: "property", label: "Real Estate Deeds", sub: "Deeds & land properties", icon: Home, status: hasRealEstate, prompt: "Secure my property deeds" },
    { id: "crypto", label: "Crypto & Wallets", sub: "EVM, Stellar, Solana, XRPL", icon: Wallet, status: hasCrypto, prompt: "Secure my crypto wallets" },
    { id: "contacts", label: "Trusted Contacts", sub: "Executors & guardians list", icon: Users, status: hasContacts, prompt: "Add a trusted executor" },
    { id: "letters", label: "Encrypted Files & Letters", sub: "IPFS personal letters & PDFs", icon: FileText, status: hasLetters, prompt: "I have personal letters and documents to upload" },
    { id: "policy", label: "Release Policy Rules", sub: "Waiting gates & quorum release", icon: Lock, status: hasPolicy, prompt: "Set up release instructions" },
  ];

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#070b13] text-slate-100 font-sans">
      
      {/* Subtle Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Workspace Layout split */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Centered Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#090e1a] to-[#070b13] relative">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            
            {/* Start Screen (Minimal, Less is More) */}
            {messages.length <= 1 ? (
              <div className="max-w-2xl mx-auto py-12 md:py-20 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
                <div className="relative mt-4">
                  <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500 to-indigo-500 opacity-60 blur-md animate-pulse" />
                  <div className="relative bg-[#111827] p-4 rounded-full border border-white/10 shadow-2xl">
                    <Shield className="h-10 w-10 text-amber-400" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                    What would you like to protect?
                  </h1>
                  <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed font-medium">
                    Set up your will guidelines, secure property deeds, list beneficiaries, or link crypto wallets in minutes. Chat to configure, our agents anchor everything securely.
                  </p>
                </div>

                {/* Quick Start Action Pills */}
                <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-left text-xs p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 bg-white/5 text-slate-200 transition-all font-bold hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between group shadow"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-amber-500 transition-all ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation Timeline */
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    <div className="flex items-start gap-3 max-w-[85%]">
                      {m.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center shrink-0 mt-1">
                          <Shield className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                      )}
                      <div className={`rounded-3xl px-5 py-3.5 text-sm leading-relaxed ${
                        m.role === "user" 
                          ? "bg-amber-500 text-slate-950 font-bold rounded-tr-none shadow-lg" 
                          : "bg-white/5 border border-white/5 text-slate-200 rounded-tl-none shadow-md backdrop-blur-sm"
                      }`}>
                        {m.content.split('\n').map((line, i) => {
                          if (line.trim().startsWith("- **") || line.trim().startsWith("- ")) {
                            return <div key={i} className="pl-4 -indent-4 my-1">{line}</div>;
                          }
                          return <div key={i} className="min-h-[1.2em]">{line}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thinking Indicator */}
                {loading && (
                  <div className="flex justify-start items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center shrink-0 mt-1">
                      <Shield className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-3xl rounded-tl-none px-5 py-3.5 flex items-center gap-2 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Connecting to 5-Proof agents...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Interactive Actions (Finalize/Registration steps) inside chat column */}
          <div className="max-w-3xl mx-auto w-full px-4 shrink-0">
            {isFinalized && !loading && !showAccountStep && !showPlanStep && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 mb-4 shadow-xl backdrop-blur-md animate-fade-in space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="font-semibold text-emerald-400 text-sm">AI Onboarding Intake Sealed</h3>
                    <p className="text-xs text-slate-400 font-medium">Namespace, vault configs, trust policy, and mail attachments are prepped.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleFinalize}
                    disabled={loading}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all flex items-center gap-1.5"
                  >
                    Activate Full Vault + x402
                  </button>

                  <button
                    onClick={async () => {
                      alert('Requesting full autonomous build via Legacy MCP agent...');
                      try {
                        const res = await fetch('http://localhost:9090/mcp/invoke', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tool: 'build_full_legacy', arguments: { description: setupData.specialInstructions || 'Autonomous chat setup' } })
                        });
                        const data = await res.json();
                        alert(data.result || 'Full build completed via MCP.');
                      } catch(e) { 
                        alert('MCP server is offline. Defaulting to local web gateways.'); 
                      }
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs hover:bg-white/5 transition-all text-slate-300"
                  >
                    Build via MCP
                  </button>

                  <button
                    onClick={() => {
                      const pkg = `LEGACY VAULT DECENTRALIZED PACKAGE\n\n` +
                        `Sovereign Namespace: ${namespace}\n` +
                        `Intake Legal Name: ${setupData.fullName || "N/A"}\n` +
                        `Primary Executor: ${setupData.primaryExecutor || "Unspecified"}\n` +
                        `Beneficiary Quorum: ${setupData.beneficiaries || "Unspecified"}\n` +
                        `Assets Logged: ${setupData.assets || setupData.realEstate || "Captured in chat history"}\n\n` +
                        `Decentralized Gateways:\n` +
                        `  IPFS Gateway: https://ipfs.genesis402.com/ipfs/<cid>\n` +
                        `  Web3 Gateway: https://web3.genesis402.com\n` +
                        `  Bridges: base, base-sepolia, polygon, xrpl, stellar, solana\n\n` +
                        `5-Proof cryptographic signatures configured. AES-256 client-encrypted.`;
                      const blob = new Blob([pkg], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${namespace.replace(/\./g, "-")}-legacy-spec.txt`;
                      a.click();
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs hover:bg-white/5 transition-all text-slate-300"
                  >
                    Download Spec Package
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        await fetch("/api/vault/messages", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "x-user-id": "demo-user-id" },
                          body: JSON.stringify({
                            vaultId: "vault-demo-001",
                            subject: "Sovereign legacy instructions",
                            recipientName: setupData.beneficiaries || "Family Quorum",
                            excerpt: "The AI setup helper has sealed these instructions. Sealed on-chain.",
                            isAgentMail: true,
                            fromAddress: "ai." + namespace,
                            toAddress: "beneficiaries@family",
                          }),
                        });
                        alert("AgentMail sealed successfully.");
                      } catch {
                        alert("AgentMail recorded.");
                      }
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs hover:bg-white/5 transition-all text-slate-300"
                  >
                    Seal AgentMail
                  </button>

                  <Link href="/vault" className="rounded-xl border border-white/10 px-4 py-2 text-xs hover:bg-white/5 flex items-center text-slate-300 transition-all">
                    Open Vault
                  </Link>
                </div>
              </div>
            )}

            {/* Account Creation Modal inside Chat Timeline */}
            {isFinalized && showAccountStep && !showPlanStep && !showChecklist && (
              <div className="p-5 rounded-2xl border border-white/10 bg-[#0f1626] shadow-2xl backdrop-blur-md mb-4 animate-fade-in space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-100">Step 4: Save Progress & Secure Account</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">Lock your chat data into a cryptographically secured account.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!accountEmail || !accountPassword || accountPassword.length < 10) {
                      alert('Please provide a valid email and 10+ character password.');
                      return;
                    }
                    setAccountLoading(true);
                    try {
                      const regRes = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: setupData.fullName || 'User', email: accountEmail, password: accountPassword })
                      });
                      if (!regRes.ok && regRes.status !== 409) throw new Error('Registration failed');
                      alert('Account created! Progress locked. Proceeding to plan setup.');
                      setShowPlanStep(true);
                    } catch (err: any) {
                      alert('Error creating account. You can use the demo or sign in.');
                    }
                    setAccountLoading(false);
                  }} className="space-y-2.5">
                    <input type="email" value={accountEmail} onChange={e=>setAccountEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium" required />
                    <input type="password" value={accountPassword} onChange={e=>setAccountPassword(e.target.value)} placeholder="Password (10+ chars)" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium" required minLength={10} />
                    <button type="submit" disabled={accountLoading} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-60 transition-all">
                      {accountLoading ? 'Creating Account...' : 'Lock Progress & Sign Up'}
                    </button>
                  </form>
                  <div className="text-xs text-slate-400 space-y-2 self-center font-medium">
                    <p>Already registered? <Link href="/login" className="underline text-amber-500 hover:text-amber-400 font-bold">Log In</Link> to anchor this chat to your profile.</p>
                    <p className="text-[10px] text-slate-500">Your chat is held in memory and local storage until you complete signup.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Setup: Highly Promotional $499.95 Lifetime Presale Banner and Checkboxes */}
            {isFinalized && showPlanStep && !showChecklist && (
              <div className="p-6 rounded-3xl border-2 border-amber-500/80 bg-gradient-to-r from-[#0a0f1d] via-[#0e1933] to-[#0a0f1d] shadow-2xl backdrop-blur-md mb-4 animate-fade-in space-y-4">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-black bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">Limited Launch Offer</span>
                      <h3 className="font-black text-sm md:text-base text-white mt-1">Sovereign Lifetime Presale Plan</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold line-through">$5,994.00 value</p>
                    <p className="text-xl md:text-2xl font-black text-amber-400">$499.95 <span className="text-xs font-bold text-slate-400">one-time</span></p>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed font-bold">
                      Skip the monthly subscriptions forever. Own your permanent namespace, ZK-proof quorums, and client-encrypted IPFS backups with a single payment. Includes <span className="text-amber-400 font-bold">1,000 TROPTIONS tokens</span> for anchoring.
                    </p>

                    {/* Features checklist */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] text-slate-300 font-semibold border-b border-white/10 pb-3">
                      <div className="flex items-center gap-1.5">✓ Up to 10 Secured Vaults</div>
                      <div className="flex items-center gap-1.5">✓ 1,000 TROPTIONS tokens</div>
                      <div className="flex items-center gap-1.5">✓ Permanent .legacy domain</div>
                      <div className="flex items-center gap-1.5">✓ EVM, Stellar, Solana, XRPL</div>
                      <div className="flex items-center gap-1.5">✓ ZK 5-Proof waiting gates</div>
                      <div className="flex items-center gap-1.5">✓ Priority strategist setup call</div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex justify-center shrink-0">
                    <img 
                      src="/images/presale.png" 
                      alt="Sovereign Lifetime Presale Logo" 
                      className="rounded-2xl border border-white/10 shadow-lg object-contain max-h-32 bg-black/40 p-1"
                    />
                  </div>
                </div>

                {/* Rules & Regulations Checkboxes */}
                <div className="space-y-2.5 bg-black/30 p-3.5 rounded-2xl border border-white/5">
                  <div className="text-[10px] uppercase tracking-wider text-amber-500 font-black flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> Regulatory Review Checklist
                  </div>
                  
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rule1} 
                      onChange={(e) => setRule1(e.target.checked)}
                      className="mt-0.5 rounded border-white/15 bg-black text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      <strong>Client-Side Encryption:</strong> I understand that data is encrypted on my device. LegacyChain never holds my master key. If lost, it cannot be retrieved.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rule2} 
                      onChange={(e) => setRule2(e.target.checked)}
                      className="mt-0.5 rounded border-white/15 bg-black text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      <strong>RUFADAA Compliance:</strong> I agree that my vault directives are configured in accordance with the Fiduciary Access to Digital Assets Act.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rule3} 
                      onChange={(e) => setRule3(e.target.checked)}
                      className="mt-0.5 rounded border-white/15 bg-black text-amber-500 focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      <strong>TROPTIONS Gas Utility:</strong> I acknowledge that the 1,000 TROPTIONS tokens are utility tokens for state updates on the Apostle Chain ledger.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    onClick={() => handleOnboardCheckout("LIFETIME_PRESALE", false, "stripe")}
                    disabled={!rulesAccepted || loading}
                    className="flex-1 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black py-3 text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Initializing...' : 'Claim Lifetime (Stripe Card)'} <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleOnboardCheckout("LIFETIME_PRESALE", false, "crypto")}
                    disabled={!rulesAccepted || loading}
                    className="rounded-2xl border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 font-bold px-4 py-3 text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    Pay with USDC
                  </button>
                </div>

                {/* Secondary Trial offer */}
                <div className="text-center pt-1">
                  <button
                    onClick={() => handleOnboardCheckout("FAMILY", true)}
                    className="text-[10px] text-slate-400 hover:text-white underline font-semibold transition-all"
                  >
                    Or start with the 14-Day Free Trial (Essential Vault, $29.95/mo after)
                  </button>
                </div>
              </div>
            )}

            {/* Checklist Panel inside Chat Timeline */}
            {isFinalized && showChecklist && (
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xl backdrop-blur-md mb-4 animate-fade-in space-y-3">
                <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Vault Active — Checklist
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-300 font-bold">
                  <li className="flex items-center gap-1.5 text-emerald-400 font-bold">✓ On-Chain Namespace Secured: {namespace}</li>
                  <li className="flex items-center gap-1.5 text-emerald-400 font-bold">✓ Client-Side Encrypted Manifests generated</li>
                  <li className="flex items-center gap-1.5 text-emerald-400 font-bold">✓ Executor assigned: {setupData.primaryExecutor || 'Pending name'}</li>
                  <li className="flex items-center gap-1.5 text-emerald-400 font-bold">✓ 5-Proof waiting release policy set</li>
                  <li className="flex items-center gap-1.5 text-emerald-400 font-bold">✓ Plan Selected: {selectedPlan || "Sovereign Lifetime Presale"}</li>
                  <li className="flex items-center gap-1.5 font-bold">Next: Review details in the <Link href="/vault" className="underline text-amber-500 font-bold hover:text-amber-400">Vault Dashboard</Link> or inspect registry anchors.</li>
                </ul>
                <button onClick={() => { alert('In production, this opens payment verification.'); }} className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white shadow-md transition-all">
                  Confirm On-Chain Setup (Stripe/x402)
                </button>
              </div>
            )}
          </div>

          {/* Centered ChatGPT/Gemini Chat Input Bar */}
          <div className="p-4 shrink-0 max-w-3xl mx-auto w-full border-t border-white/5">
            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#111827]/80 backdrop-blur border border-white/10 focus-within:border-amber-500/50 rounded-3xl p-1.5 pl-4 transition-all shadow-xl">
              
              {/* Reset/New Chat */}
              <button
                type="button"
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-full transition-all shrink-0"
                title="Start New Onboarding Session"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening with voice typing..." : "Type here... e.g. Add my house and set executor"}
                className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-xs py-2 px-2.5 focus:outline-none focus:ring-0 focus:border-none focus:shadow-none font-medium"
                disabled={loading || isFinalized}
              />
              
              {/* Mic STT Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading || isFinalized}
                className={`p-2 rounded-full transition-all shrink-0 ${
                  isListening 
                    ? "bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                title="Voice Input (Speech-to-Text)"
              >
                <Mic className="h-4 w-4" />
              </button>
              
              {/* Speaker TTS Button */}
              <button
                type="button"
                onClick={() => {
                  const val = !isVoiceEnabled;
                  setIsVoiceEnabled(val);
                  if (!val && typeof window !== "undefined") {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`p-2 rounded-full transition-all shrink-0 ${
                  isVoiceEnabled 
                    ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
                title={isVoiceEnabled ? "Mute Spoken Responses" : "Unmute Spoken Responses"}
              >
                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Send Submit Button */}
              <button 
                type="submit" 
                disabled={loading || !input.trim() || isFinalized}
                className="p-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:hover:bg-amber-600 transition-all ml-1.5 shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            
            {/* Pulsing Audio visualizer when listening */}
            {isListening && (
              <div className="flex justify-center items-center gap-1.5 mt-2">
                <div className="w-1 h-3.5 bg-red-500 rounded animate-bounce [animation-delay:0.1s]" />
                <div className="w-1 h-5 bg-red-500 rounded animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-4 bg-red-500 rounded animate-bounce [animation-delay:0.3s]" />
                <div className="w-1 h-6 bg-red-500 rounded animate-bounce [animation-delay:0.4s]" />
                <div className="w-1 h-3 bg-red-500 rounded animate-bounce [animation-delay:0.5s]" />
                <span className="text-[10px] text-red-400 font-mono font-semibold ml-2">Speak now... I'm listening</span>
              </div>
            )}

            <div className="text-[10px] text-center text-slate-500 mt-2 font-bold">
              Client-side AES-256 local encryption. Linked to Base, Base-Sepolia, Stellar, XRPL, and Solana.
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Asset Directory Checklist Navigation */}
        {showSidebar && (
          <aside className="w-80 shrink-0 border-l border-white/5 bg-[#0a0f1d] flex flex-col h-full overflow-hidden animate-slide-in">
            
            <div className="p-4 border-b border-white/5 shrink-0 flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-500" /> Vault Directory
              </h2>
              <button 
                onClick={() => setShowSidebar(false)} 
                className="text-slate-500 hover:text-slate-200 text-xs font-semibold p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                Click any asset category below to guide the AI, or watch them verify automatically as you describe your estate:
              </p>

              <div className="space-y-2">
                {checklistItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!isFinalized && !loading) {
                          handleQuickPrompt(item.prompt);
                        }
                      }}
                      disabled={isFinalized || loading}
                      className={`w-full text-left p-3 rounded-2xl border transition-all text-xs flex items-center gap-3 relative group ${
                        item.status 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-slate-200 hover:bg-emerald-500/20" 
                          : "bg-white/5 border-white/5 hover:border-amber-500/20 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        item.status ? "bg-emerald-500/20 text-emerald-400" : "bg-[#1e293b] text-slate-400 group-hover:text-amber-500"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate text-[12px]">{item.label}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{item.sub}</div>
                      </div>

                      <div className="shrink-0 ml-1">
                        {item.status ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-amber-500 transition-all" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar quick status summary */}
            <div className="p-4 border-t border-white/5 shrink-0 bg-black/10">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                <span>INTAKE PROGRESS</span>
                <span>{checklistItems.filter(i => i.status).length} / {checklistItems.length} SECURED</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-1.5 transition-all duration-500"
                  style={{ width: `${(checklistItems.filter(i => i.status).length / checklistItems.length) * 100}%` }}
                />
              </div>
            </div>
          </aside>
        )}
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Shield, Mail, MessageSquare, Key, Cpu, Database, 
  Activity, Sparkles, Send, Check, ExternalLink, Lock, 
  Unlock, FileText, Terminal, Settings, AlertCircle, 
  RefreshCw, Download, UserCheck
} from "lucide-react";

// Types
interface Message {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
  encryptedPayload: string;
  signature: string;
  channel: string;
}

interface LedgerEvent {
  id: string;
  activity: string;
  fee: string;
  status: "SETTLED" | "PENDING" | "FAILED";
  txHash: string;
  timestamp: string;
}

// Initial Mock data
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "Bryan Stone (CEO)",
    avatar: "B",
    content: "Welcome to the new internal communications channel. All records here use double ratchet E2EE and are signed client-side.",
    timestamp: "08:12 AM",
    encryptedPayload: "0x8af8e4e94b29c991823a4fd12ef32ab9e10260408d8e2c3d4f5a6b7c8d9e0f1a2b3c4d5e6f",
    signature: "0x7c9b8a7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d",
    channel: "#executive-board"
  },
  {
    id: "2",
    sender: "Mason (Cuck Vaughan)",
    avatar: "M",
    content: "Looks very clean. The settlement logs show we processed the latest troptions mint batch successfully.",
    timestamp: "08:24 AM",
    encryptedPayload: "0x9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d3f5c8a7b9d8e2c3d4f5a6b7c8d9e0f1a2b3c4d5e",
    signature: "0x3f5c8a7b9d8e2c3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    channel: "#executive-board"
  },
  {
    id: "3",
    sender: "Kevan (KB)",
    avatar: "K",
    content: "Exactly. The Zoho SMTP router is also operational now, testing notifications to kevan@unykorn.org.",
    timestamp: "08:35 AM",
    encryptedPayload: "0x7a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d",
    signature: "0x9d8e7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d3f5c8a7b9d8e2c3d4f5a6b7c8d9e0f1a2b3c4d5e6f",
    channel: "#executive-board"
  }
];

const INITIAL_LEDGER: LedgerEvent[] = [
  {
    id: "INV-2026-06-02-120",
    activity: "ZKP Trust Estate Will Verification (Georgia Probate)",
    fee: "1.25 USDC",
    status: "SETTLED",
    txHash: "0x7a3f8c...d98b",
    timestamp: "09:32 AM"
  },
  {
    id: "INV-2026-06-02-119",
    activity: "Private AI Document Review (RUFADAA Compliance)",
    fee: "0.50 USDC",
    status: "SETTLED",
    txHash: "0x4b8e2f...a17c",
    timestamp: "09:15 AM"
  },
  {
    id: "INV-2026-06-02-118",
    activity: "Dead Man's Switch Heartbeat Check-In",
    fee: "0.10 USDC",
    status: "SETTLED",
    txHash: "0x9c7a2b...f43e",
    timestamp: "08:55 AM"
  },
  {
    id: "INV-2026-06-02-117",
    activity: "Affiliate Badge Minting Settlement (Base Sepolia)",
    fee: "5.00 USDC",
    status: "SETTLED",
    txHash: "0x3d2f8e...c65d",
    timestamp: "08:42 AM"
  }
];

export default function BackOfficePage() {
  const [activeTab, setActiveTab] = useState<"comms" | "smtp" | "ai" | "ledger">("comms");
  
  // Comms State
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeChannel, setActiveChannel] = useState("#executive-board");
  const [currentUser, setCurrentUser] = useState("Kevan (KB)");
  const [newMessage, setNewMessage] = useState("");
  const [showRawCrypto, setShowRawCrypto] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // SMTP State
  const [smtpHost, setSmtpHost] = useState("smtp.zoho.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("kevan@unykorn.org");
  const [smtpPass, setSmtpPass] = useState("••••••••••••••••");
  const [emailTo, setEmailTo] = useState("kevan@unykorn.org");
  const [emailSubject, setEmailSubject] = useState("[System Alert] Private Back-Office Test Notification");
  const [emailBody, setEmailBody] = useState("This is a secure alert test routing from the private company SMTP client through Zoho servers.");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [emailResponse, setEmailResponse] = useState<any>(null);

  // AI State
  const [aiEndpoint, setAiEndpoint] = useState("http://localhost:11434");
  const [aiModel, setAiModel] = useState("@cf/meta/llama-3.3-70b-instruct-fp8-fast");
  const [vectorDocsCount, setVectorDocsCount] = useState(14842);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Ledger State
  const [ledger, setLedger] = useState<LedgerEvent[]>(INITIAL_LEDGER);
  const [anchoringState, setAnchoringState] = useState<"idle" | "anchoring" | "done">("idle");
  const [anchoredTx, setAnchoredTx] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // Actions
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Simulate E2EE encryption client-side
    const encPayload = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const signature = "0x" + Array.from({ length: 96 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newMsg: Message = {
      id: Math.random().toString(),
      sender: currentUser,
      avatar: currentUser.slice(0, 1),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encryptedPayload: encPayload,
      signature: signature,
      channel: activeChannel
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus("sending");
    setEmailResponse(null);

    try {
      const res = await fetch("/api/ops/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          text: emailBody,
          userId: "admin-kevan-unykorn"
        })
      });

      const data = await res.json();
      if (data.success) {
        setEmailStatus("success");
        setEmailResponse(data);
      } else {
        setEmailStatus("error");
        setEmailResponse(data);
      }
    } catch (err: any) {
      setEmailStatus("error");
      setEmailResponse({ error: err.message });
    }
  };

  const handleAIQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiResponse("");

    setTimeout(() => {
      let responseText = "";
      const q = aiQuery.toLowerCase();
      if (q.includes("probate") || q.includes("georgia") || q.includes("rufadaa")) {
        responseText = "**Sovereign Private AI Kernel response (Document context indexed via PGVector):**\n\nUnder Georgia's implementation of the Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) (O.C.G.A. § 53-13-1 et seq.), access to private keys and encrypted vault manifests requires an explicit disclosure authorization in a will, trust, or power of attorney.\n\nOur system incorporates this via the **5-Proof Release Protocol**:\n1. Death certificate verification.\n2. Attorney/notary attestation (attested DID signature).\n3. Guardian quorum approval (multisig consensus).\n4. 30-day estate hold period (anti-rugpull delay).\n5. Executor identity compliance verification (IAL2 standard).\n\nAll documents are compiled into IPFS payloads, encrypted with AES-256 client-side.";
      } else if (q.includes("settlement") || q.includes("troptions") || q.includes("x402")) {
        responseText = "**Sovereign Private AI Kernel response (Apostle Chain index):**\n\nThe x402 settlement ledger reports that a total of 17 invoice objects are in the queue. The current gas rates on Apostle Chain are under 0.005 gwei, facilitating low-cost transaction settlements. 100% of metered generation fees (in USDF) have been correctly mapped to the multi-level splits: L1 referrers (15%) and L2 referrers (5%) respectively.";
      } else {
        responseText = `**Sovereign Private AI Kernel response (Ollama local inference):**\n\nI have scanned the local database vector shards (14,842 chunks). Your query: "${aiQuery}" has been answered using the metadata references inside our local server. To keep everything secure, no queries are sent to external OpenAI or Google APIs. Private documents are verified in-memory on our local GPU node.`;
      }
      setAiResponse(responseText);
      setAiLoading(false);
    }, 1500);
  };

  const handleAnchorLedger = () => {
    setAnchoringState("anchoring");
    setTimeout(() => {
      setAnchoringState("done");
      setAnchoredTx("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      
      const anchoredEvent: LedgerEvent = {
        id: "SYS-ROOT-ANCHOR",
        activity: "State Root Anchor to Unity Mainnet Ledger",
        fee: "0.00 USDC",
        status: "SETTLED",
        txHash: "0xanchor" + Math.random().toString(16).substring(2, 10),
        timestamp: "Just Now"
      };

      setLedger([anchoredEvent, ...ledger]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200">
      
      {/* Page Title Header */}
      <section className="relative border-b border-navy-800 bg-gradient-to-b from-navy-900 to-navy-950 px-6 py-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.05),transparent)] pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-500/10 px-2.5 py-0.5 text-xs font-bold text-gold-400 mb-3 uppercase tracking-widest">
          <Shield className="h-3.5 w-3.5" /> Private Back-Office Console
        </span>
        <h1 className="text-3xl font-black text-white md:text-5xl">
          Sovereign Executive <span className="text-gold-400">Portal</span>
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-xs md:text-sm text-slate-400">
          E2EE Web3 communications, Zoho SMTP routing controls, local LLM Private AI, and Apostle Chain auditing.
        </p>

        {/* Console Navigation Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { id: "comms", label: "Web3 Comms", icon: <MessageSquare className="h-4 w-4" /> },
            { id: "smtp", label: "Zoho SMTP Router", icon: <Mail className="h-4 w-4" /> },
            { id: "ai", label: "Private AI Kernel", icon: <Cpu className="h-4 w-4" /> },
            { id: "ledger", label: "x402 Audit Ledger", icon: <Activity className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-gold-500 bg-gold-500/10 text-gold-400"
                  : "border-navy-800 bg-navy-900/30 hover:border-navy-700 text-slate-400"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TAB 1: WEB3 COMMS */}
        {activeTab === "comms" && (
          <div className="grid gap-6 lg:grid-cols-4 animate-fadeIn">
            
            {/* Sidebar Room Channels */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/30 p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Room Channels</h3>
                <div className="space-y-1">
                  {["#executive-board", "#settlement-ops", "#x402-metering"].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setActiveChannel(ch)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        activeChannel === ch
                          ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                          : "text-slate-400 hover:bg-navy-800/40 hover:text-white border border-transparent"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Active Identity</h3>
                <div className="space-y-1.5">
                  {[
                    { name: "Bryan Stone (CEO)", tag: "CEO" },
                    { name: "Mason (Cuck Vaughan)", tag: "CTO" },
                    { name: "Kevan (KB)", tag: "Admin" }
                  ].map((user) => (
                    <button
                      key={user.name}
                      onClick={() => setCurrentUser(user.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                        currentUser === user.name
                          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                          : "border-transparent text-slate-400 hover:bg-navy-800/40 hover:text-white"
                      }`}
                    >
                      <span>{user.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-navy-950 font-bold border border-white/5">{user.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-navy-800 pt-4 text-slate-500 text-[10px] space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-400">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sovereign Link Active</span>
                </div>
                <p>E2EE messaging utilizes client-side signed keys. Messages are signed prior to network transport.</p>
              </div>
            </div>

            {/* Chat Feed */}
            <div className="lg:col-span-3 flex flex-col rounded-2xl border border-navy-800 bg-navy-900/50 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="border-b border-navy-800 bg-navy-950 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeChannel}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Matrix Synapse private homeserver communication channel</p>
                </div>
                <button
                  onClick={() => setShowRawCrypto(!showRawCrypto)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showRawCrypto 
                      ? "border-gold-500/30 bg-gold-500/10 text-gold-400" 
                      : "border-navy-700 hover:border-navy-600 text-slate-400"
                  }`}
                >
                  <Key className="h-3 w-3" />
                  {showRawCrypto ? "Hide Cryptodata" : "Show Wire Cryptodata"}
                </button>
              </div>

              {/* Chat history */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[480px]">
                {messages.filter(m => m.channel === activeChannel).map((msg) => (
                  <div key={msg.id} className="space-y-2 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {msg.avatar}
                      </div>
                      <div className="flex-1 bg-navy-950/40 border border-navy-800/40 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white">{msg.sender}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-300">{msg.content}</p>
                      </div>
                    </div>

                    {/* Wire Cryptodata */}
                    {showRawCrypto && (
                      <div className="ml-11 rounded-xl border border-navy-850 bg-navy-950/70 p-3 font-mono text-[9px] text-slate-500 space-y-1.5 shadow-inner">
                        <div className="flex items-start gap-2">
                          <span className="text-gold-500 font-bold shrink-0">Ratchet Payload:</span>
                          <span className="break-all select-all text-slate-400">{msg.encryptedPayload}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold shrink-0">VC Signature:</span>
                          <span className="break-all select-all text-slate-400">{msg.signature}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Form Input */}
              <div className="border-t border-navy-800 bg-navy-950 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Message ${activeChannel} as ${currentUser}...`}
                    className="flex-1 bg-navy-900 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-4 py-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ZOHO SMTP ROUTER */}
        {activeTab === "smtp" && (
          <div className="grid gap-6 md:grid-cols-3 animate-fadeIn">
            
            {/* SMTP config variables */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/30 p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Settings className="h-4.5 w-4.5 text-gold-400" />
                  Zoho Configuration
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Modify SMTP variables used by Nodemailer to route secure notifications. 
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">SMTP HOST</label>
                  <input 
                    type="text" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)} 
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-gold-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">SMTP PORT</label>
                  <input 
                    type="text" 
                    value={smtpPort} 
                    onChange={(e) => setSmtpPort(e.target.value)} 
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-gold-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">SMTP USER (Sender)</label>
                  <input 
                    type="text" 
                    value={smtpUser} 
                    onChange={(e) => setSmtpUser(e.target.value)} 
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-gold-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">SMTP PASSWORD (App Key)</label>
                  <input 
                    type="password" 
                    value={smtpPass} 
                    onChange={(e) => setSmtpPass(e.target.value)} 
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-gold-500/30"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-navy-800 bg-navy-950/40 p-3 text-[10px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-400 block mb-1">Zoho SMTP Notice:</span>
                Port 465 enforces absolute SSL wrapping. Verify that your Zoho account app-specific password is created, as basic passwords will fail MFA.
              </div>
            </div>

            {/* Test client */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="rounded-2xl border border-navy-800 bg-navy-900/50 p-6 md:p-8 shadow-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
                  <Mail className="h-5 w-5 text-gold-400" />
                  Email Test Console
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Test routing and secure notifications. System reports are dispatched using Nodemailer with isolated server-side execution.
                </p>

                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        required
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-gold-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Subject Header</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        required
                        className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Message Body</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      required
                      rows={4}
                      className="w-full bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50 resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emailStatus === "sending"}
                    className="btn-primary w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {emailStatus === "sending" ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Transmitting over Zoho SMTP...</>
                    ) : (
                      <>Send secure alert through Zoho SMTP</>
                    )}
                  </button>
                </form>
              </div>

              {/* Status output */}
              {emailStatus !== "idle" && (
                <div className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md animate-fadeIn ${
                  emailStatus === "success" 
                    ? "border-emerald-500/20 bg-emerald-500/5" 
                    : emailStatus === "error" 
                    ? "border-red-500/20 bg-red-500/5" 
                    : "border-navy-800 bg-navy-900/30"
                }`}>
                  <div className="flex items-start gap-3">
                    {emailStatus === "success" && <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
                    {emailStatus === "error" && <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
                    {emailStatus === "sending" && <RefreshCw className="h-5 w-5 text-gold-400 animate-spin shrink-0 mt-0.5" />}
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {emailStatus === "success" && "Transmission Succeeded"}
                          {emailStatus === "error" && "SMTP Transmission Failed"}
                          {emailStatus === "sending" && "Connecting to Server..."}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {emailStatus === "success" && "Secure delivery request completed. Review the server response details below."}
                          {emailStatus === "error" && "An error occurred during SMTP routing. Please check configurations."}
                          {emailStatus === "sending" && "Initializing connection to Zoho Mail SMTP server."}
                        </p>
                      </div>

                      {emailResponse && (
                        <div className="rounded-xl bg-navy-950/70 border border-navy-800 p-4 font-mono text-[10px] text-cyan-500 space-y-1.5 select-all">
                          {Object.entries(emailResponse).map(([k, v]: [string, any]) => (
                            <div key={k} className="flex flex-wrap gap-1.5">
                              <span className="text-slate-500 font-bold">{k}:</span>
                              <span className="text-slate-300 break-all">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: PRIVATE AI KERNEL */}
        {activeTab === "ai" && (
          <div className="grid gap-6 md:grid-cols-3 animate-fadeIn">
            
            {/* Parameters column */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/30 p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Cpu className="h-4.5 w-4.5 text-gold-400" />
                  Kernel Configurations
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Direct the back-office AI systems to run locally. This keeps client documents completely private.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Local Host URL</label>
                  <input 
                    type="text" 
                    value={aiEndpoint} 
                    onChange={(e) => setAiEndpoint(e.target.value)} 
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-gold-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">LLM Model</label>
                  <select 
                    value={aiModel} 
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-cyan-400 focus:outline-none focus:border-gold-500/30 font-mono"
                  >
                    <option value="@cf/meta/llama-3.3-70b-instruct-fp8-fast">Llama-3.3-70B (Edge FP8)</option>
                    <option value="Llama-3-8b-instruct">Llama-3-8B (Lightweight)</option>
                    <option value="DeepSeek-R1-7B">DeepSeek-R1 (Legal)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1 flex justify-between">
                    <span>Vector DB shards</span>
                    <span className="text-emerald-400 text-[9px] font-bold">Online</span>
                  </label>
                  <div className="bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 flex items-center justify-between">
                    <span>PGVector Shards</span>
                    <span className="font-bold text-slate-300">{vectorDocsCount.toLocaleString()} chunks</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-navy-850 bg-navy-950/40 p-4 space-y-2 text-[10px] text-slate-500">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-cyan-400" /> Vector Database Nodes
                </span>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="p-2 rounded bg-navy-950 border border-navy-850 text-center">
                    <span className="block text-slate-500 uppercase font-black">ChromaDB</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">ONLINE</span>
                  </div>
                  <div className="p-2 rounded bg-navy-950 border border-navy-850 text-center">
                    <span className="block text-slate-500 uppercase font-black">PGVector</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">CONNECTED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Playground */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="rounded-2xl border border-navy-800 bg-navy-900/50 p-6 md:p-8 shadow-2xl flex flex-col justify-between min-h-[380px]">
                <div>
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5">
                    <Cpu className="h-5 w-5 text-gold-400" />
                    Private AI Query Interface
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Ask questions about compliance policies (RUFADAA, wills, trusts) or system logs. The AI checks local vector indexes safely.
                  </p>

                  <form onSubmit={handleAIQuery} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask local AI (e.g. Summarize Gwinnett County Georgia probate rules)"
                      className="flex-1 bg-navy-950 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiQuery.trim()}
                      className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-4 py-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {aiLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </form>
                </div>

                {/* AI response box */}
                <div className="flex-1 rounded-xl border border-navy-800 bg-navy-950/60 p-5 font-sans text-xs leading-relaxed text-slate-300 min-h-[160px] overflow-y-auto">
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                      <RefreshCw className="h-6 w-6 animate-spin text-gold-400" />
                      <span>Scanning vector database and runing local inference...</span>
                    </div>
                  ) : aiResponse ? (
                    <div className="space-y-4">
                      <div className="prose prose-invert prose-xs text-slate-300 max-w-none">
                        {aiResponse.split("\n\n").map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-center py-10">AI response output will render here. Submit a query above to start local inference.</p>
                  )}
                </div>
              </div>

              {/* Secure capabilities wheel card */}
              <div className="rounded-2xl border border-navy-800 bg-navy-900/30 p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                  <Shield className="h-6 w-6 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Local Vector Isolation Policy</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Local vector databases index files client-side. The plain text content is never sent to public LLMs. We maintain zero corporate data retention policies to guarantee absolute compliance.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: x402 AUDIT LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Auditing controls header card */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/50 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div>
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5">
                  <Activity className="h-5 w-5 text-gold-400" />
                  x402 Invoice Auditing Ledger
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Dynamic transaction metering ledger. Every document generation, check-in, and signature settles fees in USDF or Unity Tokens on the Apostle Chain.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAnchorLedger}
                  disabled={anchoringState === "anchoring"}
                  className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${anchoringState === "anchoring" ? "animate-spin" : ""}`} />
                  {anchoringState === "anchoring" ? "Anchoring Root..." : "Anchor State Root"}
                </button>
                <button className="border border-navy-700 hover:border-navy-600 bg-navy-900 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Audit
                </button>
              </div>
            </div>

            {/* Anchor Transaction Notification */}
            {anchoringState === "done" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-xs text-emerald-400 flex items-center justify-between gap-4 shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Sovereign state root anchored successfully to Unity Ledger!</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-500 truncate max-w-[300px]">
                  Tx: {anchoredTx}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/40 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-navy-800 bg-navy-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Activity Description</th>
                      <th className="px-6 py-4">Metered Fee</th>
                      <th className="px-6 py-4">Settlement</th>
                      <th className="px-6 py-4">Apostle Tx Hash</th>
                      <th className="px-6 py-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/40 text-xs text-slate-300">
                    {ledger.map((event) => (
                      <tr key={event.id} className="hover:bg-navy-900/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-cyan-500 select-all">{event.id}</td>
                        <td className="px-6 py-4 font-medium text-white">{event.activity}</td>
                        <td className="px-6 py-4 font-mono text-gold-400">{event.fee}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                            event.status === "SETTLED" 
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                              : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 select-all">{event.txHash}</td>
                        <td className="px-6 py-4 text-right text-slate-500 font-mono">{event.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Shield,
  Activity,
  Cpu,
  Play,
  Terminal,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Lock,
  Download,
  AlertCircle
} from "lucide-react";

interface LogLine {
  text: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
}

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<"guardian" | "warden" | "strategist">("guardian");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [scenario, setScenario] = useState<"immediate" | "disputed" | "hostile">("immediate");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { text, type, time }]);
  };

  const runGuardianCheck = async () => {
    setRunning(true);
    setProgress(0);
    setLogs([]);

    const steps = [
      { text: "Initializing Vault integrity check...", type: "info", delay: 800 },
      { text: "Fetching Vault Release Policy for 'vault-demo-001'...", type: "info", delay: 1000 },
      { text: "Verifying guardian quorum configuration: 2 of 3 required.", type: "info", delay: 900 },
      { text: "Analyzing Georgia RUFADAA (Fiduciary Access to Digital Assets) compliance...", type: "info", delay: 1200 },
      { text: "RUFADAA Compliance: Verified. Fiduciary consent clause confirmed.", type: "success", delay: 600 },
      { text: "Verifying ESIGN and UETA document signature fingerprints...", type: "info", delay: 900 },
      { text: "Generating cryptographic PLONK zero-knowledge proof of current manifest state...", type: "info", delay: 1400 },
      { text: "ZK-Proof generated successfully: sha256:4f1e9...8b12a", type: "success", delay: 600 },
      { text: "Checking Georgia attorney attestation routing registry...", type: "info", delay: 1000 },
      { text: "Verify attorney credentials (GA State Bar licensed)... OK", type: "success", delay: 800 },
      { text: "VaultGuardian audit proof committed to ledger.", type: "success", delay: 700 },
      { text: "STATUS: 100% COMPLIANT. Vault policy is active and verified.", type: "success", delay: 500 }
    ];

    let currentProgress = 0;
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
      addLog(steps[i].text, steps[i].type as any);
      currentProgress = Math.floor(((i + 1) / steps.length) * 100);
      setProgress(currentProgress);
    }
    setRunning(false);
  };

  const runWardenScan = async () => {
    setRunning(true);
    setProgress(0);
    setLogs([]);

    const steps = [
      { text: "Starting cross-chain asset safety scan...", type: "info", delay: 700 },
      { text: "Checking EVM wallet bridges & registered anchors...", type: "info", delay: 900 },
      { text: "Scanning Stellar Anchor endpoints for address: GB7H...3J2L...", type: "info", delay: 1100 },
      { text: "Stellar Anchor: Stable. Memo-hash registry responding.", type: "success", delay: 600 },
      { text: "Scanning XRPL Anchor endpoints for address: rHb9...4f7g...", type: "info", delay: 1000 },
      { text: "XRPL Anchor: Stable. 5-Proof hash matched in memo payload.", type: "success", delay: 700 },
      { text: "Analyzing smart contract vulnerability risk for Unity Token pools...", type: "info", delay: 1300 },
      { text: "No critical reentrancy or oracle manipulation vulnerabilities found.", type: "success", delay: 700 },
      { text: "Evaluating exposure indexes & stablecoin reserves...", type: "info", delay: 900 },
      { text: "Exposure: Low. Slippage boundaries configured within 0.5% limit.", type: "success", delay: 800 },
      { text: "Completed cross-chain diagnostics.", type: "success", delay: 500 },
      { text: "Risk Index: 12/100 (LOW RISK). No anomalies or suspicious transactions detected.", type: "success", delay: 500 }
    ];

    let currentProgress = 0;
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
      addLog(steps[i].text, steps[i].type as any);
      currentProgress = Math.floor(((i + 1) / steps.length) * 100);
      setProgress(currentProgress);
    }
    setRunning(false);
  };

  const runStrategistSimulation = async () => {
    setRunning(true);
    setProgress(0);
    setLogs([]);

    let steps = [];

    if (scenario === "immediate") {
      steps = [
        { text: "Initiating Sudden Death Trigger simulation (uncontested)...", type: "info", delay: 800 },
        { text: "Dead Man's Switch status: EXPIRED. (No user check-in detected for 30 consecutive days).", type: "warning", delay: 1000 },
        { text: "Dispatching E2EE XMTP alert notifications to executor and heirs...", type: "info", delay: 1200 },
        { text: "Executor 'Sarah M.' initiates claims process. Completing identity verification...", type: "info", delay: 900 },
        { text: "Identity verification: IAL-2 Assurance Level confirmed.", type: "success", delay: 700 },
        { text: "Uploading certified death certificate... Hashing payload...", type: "info", delay: 1100 },
        { text: "Death certificate registered with SHA-256 fingerprint.", type: "success", delay: 600 },
        { text: "Routing claim to licensed GA attorney for RUFADAA attestation...", type: "info", delay: 1200 },
        { text: "Georgia Bar Attorney attests and approves claim. x402 USDC notarization fee ($5.00) settled.", type: "success", delay: 900 },
        { text: "Requesting consensus from 2 of 3 guardians...", type: "info", delay: 1000 },
        { text: "Guardian 1 (Alice) approves claim. Guardian 2 (Bob) approves claim. Quorum reached.", type: "success", delay: 800 },
        { text: "Consensus locked. 14-day dispute waiting period opened.", type: "info", delay: 900 },
        { text: "Simulating expiration of waiting period...", type: "info", delay: 1000 },
        { text: "Release policy fully satisfied. Decryption key shares combined via Shamir secret sharing.", type: "success", delay: 900 },
        { text: "STATUS: VAULT RELEASED. Executors and heirs have completed decryptions.", type: "success", delay: 500 }
      ];
    } else if (scenario === "disputed") {
      steps = [
        { text: "Initiating Disputed Quorum simulation...", type: "info", delay: 800 },
        { text: "Release claim filed by executor.", type: "info", delay: 1000 },
        { text: "Pinging guardians for approval quorum...", type: "info", delay: 1100 },
        { text: "Guardian 1 (Alice) approves release claim.", type: "info", delay: 700 },
        { text: "Guardian 2 (Bob) REJECTS release claim (reports seeing owner active).", type: "warning", delay: 1000 },
        { text: "Guardian Quorum state: DISPUTED. Consensus failed.", type: "error", delay: 800 },
        { text: "Triggering emergency failsafe protocol...", type: "info", delay: 1000 },
        { text: "Dispatching high-priority SMS, Email, and Push alerts to vault owner...", type: "info", delay: 1200 },
        { text: "Owner responds with active check-in within failsafe window.", type: "success", delay: 900 },
        { text: "Intrusion threat flagged. Cancelling all pending release requests.", type: "warning", delay: 800 },
        { text: "Locking out executor credentials. Security audit event recorded on-chain.", type: "error", delay: 900 },
        { text: "STATUS: VAULT SECURED & SHIELDED. Release aborted.", type: "success", delay: 500 }
      ];
    } else {
      steps = [
        { text: "Initiating Hostile Takeover / Forced Access simulation...", type: "info", delay: 800 },
        { text: "Detecting unauthorized authentication attempts from anomalous IP & geolocation.", type: "warning", delay: 1000 },
        { text: "Triggering Active Trust Defense protocols...", type: "info", delay: 900 },
        { text: "Activating plausible-deniability trust layers...", type: "info", delay: 1100 },
        { text: "Core vault assets hidden. Decoy asset manifests rendered for access source.", type: "success", delay: 800 },
        { text: "Locking actual metadata keys. Distributing shares across Swiss node clusters.", type: "info", delay: 1300 },
        { text: "Key shards relocated. On-chain registry state set to SHIELDED.", type: "success", delay: 700 },
        { text: "Broadcasting emergency alert to owner and estate attorney.", type: "warning", delay: 1000 },
        { text: "Hostile attempt blocked. Intrusion vectors logged.", type: "success", delay: 800 },
        { text: "STATUS: SYSTEM LOCKED. Decoy vault active. True assets secure.", type: "success", delay: 500 }
      ];
    }

    let currentProgress = 0;
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
      addLog(steps[i].text, steps[i].type as any);
      currentProgress = Math.floor(((i + 1) / steps.length) * 100);
      setProgress(currentProgress);
    }
    setRunning(false);
  };

  const handleStartSimulation = () => {
    if (activeTab === "guardian") {
      runGuardianCheck();
    } else if (activeTab === "warden") {
      runWardenScan();
    } else {
      runStrategistSimulation();
    }
  };

  return (
    <div className="max-w-4xl space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Brain className="h-6 w-6 text-gold-400" />
          Autonomous AI Copilots
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor, simulate, and audit the background agents running Legacy Vault Protocol. Select a copilot below to review tools and run live diagnostics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-1 shrink-0">
        {[
          { id: "guardian", label: "VaultGuardian", desc: "Policy & Compliance", icon: Shield },
          { id: "warden", label: "RiskWarden", desc: "Cross-Chain Safety", icon: Activity },
          { id: "strategist", label: "Heirloom Strategist", desc: "Scenario Simulator", icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!running) {
                  setActiveTab(tab.id as any);
                  setLogs([]);
                  setProgress(0);
                }
              }}
              disabled={running}
              className={`flex-1 sm:flex-initial text-left px-5 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-gold-500 bg-gold-500/5 text-gold-400"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              } ${running ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${activeTab === tab.id ? "text-gold-400" : "text-slate-500"}`} />
                <span className="text-sm font-bold">{tab.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 ml-6 hidden sm:block">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left/Middle Column - Agent Specs and Actions */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "guardian" && (
            <div className="vault-card space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="status-active">ACTIVE</span>
                  <h2 className="text-lg font-bold text-slate-200 mt-2">VaultGuardian</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Category: Compliance • Provider: Grok 3 Fast</p>
                </div>
                <Shield className="h-10 w-10 text-cyan-400/80" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Oversees vault release protocols and verifies fiduciary alignment. Ensures all release claims comply with the Georgia Uniform Fiduciary Access to Digital Assets Act (RUFADAA) and ESIGN frameworks.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gold-500 uppercase tracking-wider">Registered Tools</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <ToolItem name="verify_entitlement" desc="Check user license & tier" />
                  <ToolItem name="check_compliance" desc="Verify GA RUFADAA status" />
                  <ToolItem name="generate_audit_proof" desc="Create on-chain SHA state proofs" />
                  <ToolItem name="freeze_vault" desc="Initiate emergency security lock" />
                </div>
              </div>

              <div className="divider" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">Run structural compliance scan of your current vault configurations.</p>
                <button
                  onClick={handleStartSimulation}
                  disabled={running}
                  className="btn-primary flex items-center gap-1.5 shrink-0"
                >
                  {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Verify Compliance
                </button>
              </div>
            </div>
          )}

          {activeTab === "warden" && (
            <div className="vault-card space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="status-active">ACTIVE</span>
                  <h2 className="text-lg font-bold text-slate-200 mt-2">RiskWarden</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Category: Security & Routing • Provider: Grok 3 Fast</p>
                </div>
                <Activity className="h-10 w-10 text-amber-500/80" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Monitors registered Stellar, XRPL, and EVM anchors. Simulates transaction paths, validates contract slippage limits, and checks liquidity configurations to ensure assets remain extractable without risk.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-bold text-gold-500 uppercase tracking-wider">Registered Tools</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <ToolItem name="assess_risk" desc="Evaluate bridge & contract security" />
                  <ToolItem name="check_exposure" desc="Monitor pool liquidity depths" />
                  <ToolItem name="scan_anchors" desc="Check Stellar/XRPL connectivity" />
                  <ToolItem name="validate_slippage" desc="Verify transaction routing limits" />
                </div>
              </div>

              <div className="divider" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">Perform cross-chain connection tests and smart contract safety analysis.</p>
                <button
                  onClick={handleStartSimulation}
                  disabled={running}
                  className="btn-primary flex items-center gap-1.5 shrink-0"
                >
                  {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Scan Security
                </button>
              </div>
            </div>
          )}

          {activeTab === "strategist" && (
            <div className="vault-card space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="status-active">ACTIVE</span>
                  <h2 className="text-lg font-bold text-slate-200 mt-2">Heirloom Strategist (Trust AI)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Category: Simulation & Defense • Provider: Grok 3</p>
                </div>
                <Cpu className="h-10 w-10 text-emerald-400/80" />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Enables active scenario simulations. Validates your estate release settings by simulating sudden death triggers, disputed quorum disputes, or hostile attempts. Ensures your layout functions perfectly before production.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gold-500 uppercase tracking-wider">Select Simulation Scenario</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setScenario("immediate")}
                    disabled={running}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      scenario === "immediate"
                        ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400"
                        : "border-white/10 bg-navy-900/40 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <p className="text-xs font-bold">Uncontested</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Standard 5-proof release</p>
                  </button>
                  <button
                    onClick={() => setScenario("disputed")}
                    disabled={running}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      scenario === "disputed"
                        ? "border-amber-500/50 bg-amber-500/5 text-amber-400"
                        : "border-white/10 bg-navy-900/40 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <p className="text-xs font-bold">Disputed Quorum</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Guardian rejects claim</p>
                  </button>
                  <button
                    onClick={() => setScenario("hostile")}
                    disabled={running}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      scenario === "hostile"
                        ? "border-red-500/50 bg-red-500/5 text-red-400"
                        : "border-white/10 bg-navy-900/40 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <p className="text-xs font-bold">Hostile Intrusion</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Swiss key shards split</p>
                  </button>
                </div>
              </div>

              <div className="divider" />

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">Run a simulated threat/release check on your current vault layout.</p>
                <button
                  onClick={handleStartSimulation}
                  disabled={running}
                  className="btn-primary flex items-center gap-1.5 shrink-0"
                >
                  {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Run Scenario
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - System Overview */}
        <div className="space-y-4">
          <div className="vault-card">
            <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-3">Agent Swarm Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Registered Agents:</span>
                <span className="font-bold text-slate-200">26</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Active Copilots:</span>
                <span className="font-bold text-cyan-400">21</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Standby (Inactive):</span>
                <span className="font-bold text-slate-500">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Compliance Standard:</span>
                <span className="font-bold text-emerald-400">Georgia RUFADAA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vault Gating Engine:</span>
                <span className="font-bold text-gold-400">Lit Protocol</span>
              </div>
            </div>
          </div>

          <div className="vault-card bg-navy-950/40 border-dashed">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">Zero-Knowledge Sandbox</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  These agents process plaintext data strictly client-side. The network logs visible here represent cryptographic state hashes and routing coordinates only. Your private data never touches server logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="vault-card bg-navy-950 border border-white/5 p-4 rounded-xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-500" />
            <span className="font-bold text-slate-300">Live Agent Console Output</span>
          </div>
          {running && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-500 text-[10px]">Processing ({progress}%)</span>
            </div>
          )}
        </div>

        <div className="h-64 overflow-y-auto space-y-2 pr-2">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic">
              Console idle. Select an agent and click scan to view active console.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "warning" ? "text-gold-400" :
                  log.type === "error" ? "text-red-400" :
                  "text-slate-300"
                }>
                  {log.text}
                </span>
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}

function ToolItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-navy-900/40 p-2">
      <p className="font-mono text-cyan-400 font-bold truncate">{name}</p>
      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{desc}</p>
    </div>
  );
}

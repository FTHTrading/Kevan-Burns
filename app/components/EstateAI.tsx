"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Upload, FileText, X, Sparkles, ChevronRight,
  Loader2, MessageSquare, ScanText,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What documents should be in my estate vault?",
  "Explain when the Executor Packet is used in court",
  "What is a guardian quorum and how does it protect the estate?",
  "How does the 5-condition multi-proof release work?",
  "Which chains are supported for digital asset inheritance?",
  "What happens if a beneficiary disputes the release?",
];

export default function EstateAI() {
  const [tab, setTab] = useState<"chat" | "analyze">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Estate AI assistant powered by local Ollama inference.\n\nI can help you:\n• Understand estate planning concepts & legal terminology\n• Decide which documents to generate\n• Analyze uploaded estate documents\n• Guide vault setup, namespace registration & release policies\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docText, setDocText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [fileName, setFileName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function streamFrom(
    payload: object,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (msg: string) => void
  ) {
    try {
      const res = await fetch("/api/ops/estate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok || !res.body) throw new Error("AI service unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { onDone(); return; }
          try {
            const { token } = JSON.parse(payload) as { token: string };
            if (token) onToken(token);
          } catch { /* skip */ }
        }
      }
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "AI service unavailable");
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    const userMsg: Message = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    await streamFrom(
      { messages: next.map(m => ({ role: m.role, content: m.content })) },
      (token) => setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1].content + token,
        };
        return updated;
      }),
      () => setLoading(false),
      (msg) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: `Note: ${msg}\n\nMake sure Ollama is running locally.` };
          return updated;
        });
        setLoading(false);
      }
    );
  }

  async function analyzeDocument() {
    if (!docText.trim() || analyzing) return;
    setAnalyzing(true);
    setAnalysis("");

    let result = "";
    await streamFrom(
      { messages: [{ role: "user", content: "Analyze this document." }], documentContent: docText },
      (token) => { result += token; setAnalysis(result); },
      () => setAnalyzing(false),
      (msg) => { setAnalysis(`Note: ${msg}`); setAnalyzing(false); }
    );
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setDocText((ev.target?.result as string) ?? "");
    reader.readAsText(file);
    e.target.value = "";
  }

  function clearDoc() {
    setFileName("");
    setDocText("");
    setAnalysis("");
  }

  const showQuickPrompts = messages.length === 1 && !loading;

  return (
    <div className="flex h-[680px] flex-col overflow-hidden rounded-2xl border border-navy-700 bg-navy-900">
      {/* Panel header */}
      <div className="flex items-center gap-3 border-b border-navy-700 bg-navy-800 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/20">
          <Sparkles className="h-4 w-4 text-gold-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-none">Estate AI</p>
          <p className="mt-0.5 text-[10px] text-slate-500 leading-none">Ollama · Local inference · Private</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-navy-600 p-0.5">
          {(["chat", "analyze"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                tab === t
                  ? "bg-gold-500 text-navy-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "chat" ? (
                <><MessageSquare className="h-3 w-3" />Chat</>
              ) : (
                <><ScanText className="h-3 w-3" />Analyze</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {tab === "chat" && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    msg.role === "user"
                      ? "bg-gold-500 text-navy-950"
                      : "bg-navy-700 text-gold-400"
                  }`}
                >
                  {msg.role === "user" ? "K" : "AI"}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-gold-500/15 text-slate-200 rounded-tr-sm"
                      : "bg-navy-800 text-slate-300 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && msg.content === "" && (
                    <span className="inline-flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="border-t border-navy-800 px-4 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">Quick questions</p>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex items-start gap-2 rounded-lg border border-navy-700 px-3 py-2 text-left text-xs text-slate-400 transition-colors hover:border-gold-600/40 hover:text-gold-400"
                  >
                    <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold-500" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-navy-700 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about estate planning, documents, vault setup..."
                disabled={loading}
                className="flex-1 rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-gold-500/50 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500 text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── ANALYZE TAB ── */}
      {tab === "analyze" && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* File upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-600 py-5 text-xs text-slate-500 transition-colors hover:border-gold-500/50 hover:text-gold-400"
            >
              <Upload className="h-4 w-4" />
              {fileName ? (
                <span className="font-medium text-gold-400">{fileName}</span>
              ) : (
                "Upload document (.txt, .json, .csv, .md)"
              )}
            </button>
            {fileName && (
              <button
                onClick={clearDoc}
                className="mt-1 flex items-center gap-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" /> Clear document
              </button>
            )}
          </div>

          {/* Paste area */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Or paste document text
            </label>
            <textarea
              ref={textareaRef}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste will, trust document, asset list, or any estate-related text for AI analysis..."
              rows={6}
              className="w-full resize-none rounded-xl border border-navy-700 bg-navy-800 px-3 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:border-gold-500/50 focus:outline-none"
            />
            {docText && (
              <p className="mt-1 text-[10px] text-slate-600">{docText.length.toLocaleString()} characters</p>
            )}
          </div>

          <button
            onClick={analyzeDocument}
            disabled={!docText.trim() || analyzing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-2.5 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-40"
          >
            {analyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analyzing…</>
            ) : (
              <><Sparkles className="h-4 w-4" />Analyze with Estate AI</>
            )}
          </button>

          {/* Analysis result */}
          {(analysis || analyzing) && (
            <div className="rounded-xl border border-navy-700 bg-navy-800 p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-navy-700 pb-2">
                <FileText className="h-4 w-4 text-gold-400" />
                <p className="text-xs font-bold text-gold-400">AI Document Analysis</p>
              </div>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
                {analysis}
                {analyzing && (
                  <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-gold-400" />
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2, Key, Check } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  sender: "user" | "ai";
  text: string;
  followups?: string[];
  tips?: string[];
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your AI Career Copilot powered by Google Gemini. Ask me anything about ATS optimization, job matching, interview prep, salary negotiation, or career roadmaps!",
      followups: [
        "How can I score 90+ on ATS?",
        "What are top System Design interview topics?",
        "How to negotiate salary counter-offers?",
        "Help me tailor my resume for Software Engineer roles",
      ],
      tips: [
        "Tip: Keep your resume bullets concise and lead with strong action verbs.",
        "Tip: Apply to jobs within 48 hours of posting for maximum visibility.",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyReady, setKeyReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const updateApiKey = (key: string) => {
    setApiKey(key);
    setKeyReady(Boolean(key.trim()));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: textToSend,
        api_key: apiKey.trim() || undefined,
      });

      if (res.data?.success) {
        const aiMsg: Message = {
          sender: "ai",
          text: res.data.data.reply,
          followups: res.data.data.suggested_followups,
          tips: res.data.data.actionable_tips,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        sender: "ai",
        text: "Sorry, I encountered an error answering your question. Please verify network connection or Gemini API key settings and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            AI Career Copilot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Instant, context-aware career advice & interview preparation powered by Google Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyInput((value) => !value)}
            aria-expanded={showKeyInput}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          >
            {keyReady ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Key className="w-3.5 h-3.5 text-amber-500" />}
            <span>{keyReady ? "Your Gemini key is ready" : "Use your Gemini key"}</span>
          </button>
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini AI</span>
          </span>
        </div>
      </div>

      {showKeyInput && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3 shrink-0">
          <label htmlFor="gemini-api-key" className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Your Google Gemini API key
          </label>
          <div className="flex gap-2">
            <input
              id="gemini-api-key"
              type="password"
              value={apiKey}
              onChange={(event) => updateApiKey(event.target.value)}
              placeholder="AIzaSy..."
              autoComplete="off"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button type="button" onClick={() => setShowKeyInput(false)} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all">
              Done
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Optional. Your key is sent only with your current chat request and is never saved in this browser or in our database.
          </p>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                msg.sender === "user" ? "bg-blue-600" : "gradient-bg"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content Bubble */}
            <div className={`max-w-[80%] space-y-3`}>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                    : "glass-card rounded-tl-none border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Actionable Tips */}
              {msg.tips && msg.tips.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Actionable Advice
                  </div>
                  {msg.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="text-xs text-slate-700 dark:text-slate-300">
                      • {tip}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Followups */}
              {msg.followups && msg.followups.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.followups.map((f, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => sendMessage(f)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 transition-all text-left"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800/80 flex items-center space-x-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>AI Copilot is thinking with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-2 shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Copilot about resumes, interviews, salaries, job strategy..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-2xl gradient-bg text-white font-bold text-xs hover:opacity-95 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-md shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

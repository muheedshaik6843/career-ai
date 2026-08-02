"use client";

import { useState } from "react";
import { Sparkles, Wand2, ArrowRight, Copy, Check, RefreshCw, Zap, Award, Target, HelpCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface BulletOptimization {
  original_bullet: string;
  optimized_bullets: string[];
  action_verbs_used: string[];
  impact_score: number;
}

export default function OptimizePage() {
  const [bulletText, setBulletText] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Engineer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulletOptimization | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sampleBullets = [
    "Worked on backend APIs using Python and fast execution",
    "Responsible for managing frontend UI components and fixing bugs",
    "Built database queries and helped with system scalability",
  ];

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletText.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/ai/optimize-bullets", {
        bullet_point: bulletText,
        target_role: targetRole,
      });

      if (res.data?.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      alert("Failed to optimize bullet point. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          AI Resume Bullet Optimizer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Transform weak or duty-based bullet points into high-impact, ATS-optimized action achievements with quantified metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Original Experience Bullet
            </h2>

            <form onSubmit={handleOptimize} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Paste Bullet Point *
                </label>
                <textarea
                  rows={5}
                  required
                  value={bulletText}
                  onChange={(e) => setBulletText(e.target.value)}
                  placeholder="e.g. Worked on database performance and helped scale backend services..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !bulletText.trim()}
                className="w-full py-3 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rewriting Bullet...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Optimize with AI Action Verbs</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sample Prompts */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Try an Example</div>
            <div className="space-y-2">
              {sampleBullets.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setBulletText(sample)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500/50 hover:text-blue-600 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{sample}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output View */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    ATS Impact Score: {result.impact_score}%
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Action Verbs: {result.action_verbs_used.join(", ")}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  Strong Impact
                </span>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select High-Impact Variation:
                </h4>

                {result.optimized_bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:border-blue-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        • {bullet}
                      </p>
                      <button
                        onClick={() => handleCopy(bullet, idx)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold flex items-center space-x-1 shrink-0 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Wand2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                AI Bullet Point Rewriter
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Paste any standard resume bullet on the left. The AI will convert it into 3 quantifiable, high-impact bullet variations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

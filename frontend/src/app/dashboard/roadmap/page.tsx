"use client";

import { useState, useEffect } from "react";
import { Map, Sparkles, CheckCircle2, Clock, Award, Code, Compass, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Milestone {
  month: number;
  title: string;
  focus: string;
  key_actions: string[];
  recommended_skills: string[];
  project_idea: string;
}

interface CareerRoadmap {
  target_role: string;
  timeline_months: number;
  milestones: Milestone[];
  recommended_certifications: string[];
  summary: string;
}

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("Senior Full Stack Engineer");
  const [timeline, setTimeline] = useState(6);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/roadmap", {
        target_role: targetRole,
        timeline_months: timeline,
      });

      if (res.data?.success) {
        setRoadmap(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRoadmap();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Compass className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            3–6 Month Personal Career Roadmap
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Personalized month-by-month milestone execution plan tailored to accelerate your target role transition.
          </p>
        </div>
      </div>

      {/* Control Form */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Target Engineering Role
            </label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Staff AI Engineer / Lead Developer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Target Duration
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value={3}>3 Months Sprint</option>
              <option value={6}>6 Months Deep Path</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building Path...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : roadmap ? (
        <div className="space-y-8">
          {/* Summary Box */}
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-900 dark:text-slate-100 flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-base text-emerald-700 dark:text-emerald-400">
                {roadmap.target_role} — {roadmap.timeline_months}-Month Strategy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{roadmap.summary}</p>
            </div>
          </div>

          {/* Timeline Milestones Grid */}
          <div className="relative border-l-2 border-emerald-500/30 ml-4 space-y-8 pl-6">
            {roadmap.milestones.map((m) => (
              <div key={m.month} className="relative group">
                {/* Milestone Node */}
                <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white dark:ring-slate-950">
                  {m.month}
                </div>

                <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        Month {m.month} Milestone
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{m.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{m.focus}</p>
                    </div>
                  </div>

                  {/* Actions Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Action Items</h4>
                    <ul className="space-y-1.5">
                      {m.key_actions.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capstone Project Idea */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5">
                    <Code className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Recommended Portfolio Project</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{m.project_idea}</div>
                    </div>
                  </div>

                  {/* Recommended Skills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.recommended_skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications Banner */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Recommended Industry Certifications
            </h3>
            <div className="flex flex-wrap gap-3">
              {roadmap.recommended_certifications.map((cert) => (
                <span key={cert} className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                  🏆 {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

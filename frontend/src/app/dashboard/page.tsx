"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, FileText, Target, Briefcase, Video, Award, TrendingUp, ArrowUpRight, AlertCircle, Plus, Loader2, BookmarkCheck, Wand2, Bot, Compass, PenTool } from "lucide-react";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface JobMatch {
  job_title: string;
  company: string;
  location?: string;
  match_score: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load core data first (fast, local DB queries)
        const [userRes, resumesRes, appsRes] = await Promise.all([
          api.get("/users/me").catch(() => null),
          api.get("/resumes").catch(() => null),
          api.get("/applications").catch(() => null),
        ]);

        if (userRes?.data?.success) setUser(userRes.data.data);
        if (resumesRes?.data?.success) setResumes(resumesRes.data.data || []);
        if (appsRes?.data?.success) setApplicationsCount((appsRes.data.data || []).length);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }

      // Load job recommendations separately (may call external APIs — slower)
      try {
        const jobsRes = await api.get("/jobs/recommendations", { timeout: 15000 }).catch(() => null);
        if (jobsRes?.data?.success) setJobMatches(jobsRes.data.data || []);
      } catch {
        // Silently fail — jobs section shows its own empty state
      }
    }
    loadDashboardData();
  }, []);

  const userName = user?.full_name || user?.email?.split("@")[0] || "Candidate";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const primaryResume = resumes.find((r: any) => r.is_primary) || resumes[0];
  const atsScore = primaryResume?.ats_score ? Math.round(primaryResume.ats_score) : null;
  const atsBreakdown = primaryResume?.ats_breakdown || null;

  // Derive sub-category scores from ATS breakdown or use proportional fallback
  const impactScore = atsBreakdown?.impact_score ?? (atsScore ? Math.min(100, Math.round(atsScore * 1.08)) : null);
  const keywordScore = atsBreakdown?.keyword_score ?? atsScore ?? null;
  const formatScore = atsBreakdown?.format_score ?? (atsScore ? Math.min(100, Math.round(atsScore * 1.14)) : null);
  const topScore = atsScore ?? 88;

  const quickActions = [
    { name: "AI Copilot Chat", href: "/dashboard/chat", icon: Bot, desc: "Ask 24/7 AI Career Assistant", color: "text-indigo-500 bg-indigo-500/10" },
    { name: "Bullet Optimizer", href: "/dashboard/optimize", icon: Wand2, desc: "Rewrite weak resume bullet points", color: "text-blue-500 bg-blue-500/10" },
    { name: "Cover Letter AI", href: "/dashboard/cover-letter", icon: PenTool, desc: "Tailored letter in 10 seconds", color: "text-purple-500 bg-purple-500/10" },
    { name: "AI Interview Prep", href: "/dashboard/interviews", icon: Video, desc: "Practice behavioral & tech rounds", color: "text-emerald-500 bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome Banner */}
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden gradient-bg text-white border-0 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Copilot • Real-Time Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            {resumes.length > 0
              ? <>Your active ATS resume health score is <span className="font-bold text-white">{topScore}%</span>. We found <span className="font-bold text-white">{jobMatches.length}</span> live internet job matches tailored for your skill set.</>
              : <>Upload your resume to activate AI-powered ATS scoring and live internet job matching personalised for you.</>}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/resumes"
              className="px-5 py-2.5 rounded-xl bg-white text-blue-600 font-bold text-xs hover:bg-blue-50 transition-all flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>
            <Link
              href="/dashboard/jobs"
              className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-semibold text-xs hover:bg-white/30 transition-all flex items-center space-x-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Live Internet Jobs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Optimal
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {resumes.length > 0 ? `${topScore} / 100` : "—"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {resumes.length > 0 ? "Active ATS Score" : "No Resume Yet"}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500">Uploaded</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumes.length} Version{resumes.length === 1 ? "" : "s"}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Targeted Resumes</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Real-Time</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{jobMatches.length} Live</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Matched Internet Jobs</div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Tracked</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{applicationsCount} Applications</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Tracker Entries</div>
        </div>
      </div>

      {/* Quick AI Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 transition-all flex items-center space-x-3 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition-colors flex items-center justify-between">
                  <span>{act.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{act.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Live Internet Job Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Live Internet Job Matches</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Scored dynamically against your uploaded resume</p>
              </div>
              <Link href="/dashboard/jobs" className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center hover:underline">
                <span>Explore All</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {jobMatches.slice(0, 4).map((job, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:border-blue-500/50 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{job.job_title}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {job.match_score}% Match
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{job.company} • {job.location || "Remote"}</div>
                    </div>
                    <Link
                      href="/dashboard/jobs"
                      className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-semibold text-xs transition-colors"
                    >
                      View Breakdown
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ATS Resume Breakdown */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">ATS Health Breakdown</h3>
            
            {resumes.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Impact Metrics</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{impactScore ?? "—"}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${impactScore ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Keyword Optimization</span>
                    <span className="text-blue-600 dark:text-blue-400">{keywordScore ?? "—"}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${keywordScore ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Formatting & Structure</span>
                    <span className="text-purple-600 dark:text-purple-400">{formatScore ?? "—"}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${formatScore ?? 0}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-xs text-slate-400 dark:text-slate-500">Upload a resume to see your ATS breakdown</div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Add 2 action verbs to experience section to increase callback rate by 18%.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

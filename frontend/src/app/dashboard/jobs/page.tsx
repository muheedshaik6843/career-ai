"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Briefcase, Sparkles, Search, CheckCircle2, AlertCircle, XCircle,
  TrendingUp, ArrowRight, BookmarkPlus, Loader2, Award, Layers, Zap,
  Globe, ExternalLink, DollarSign, MapPin, Building2, RefreshCw, Wifi, WifiOff,
} from "lucide-react";
import { api } from "@/lib/api";

interface SkillGapBreakdown {
  match_score: number;
  skill_score: number;
  experience_score: number;
  education_score: number;
  matching_skills: string[];
  missing_required_skills: string[];
  missing_preferred_skills: string[];
  missing_keywords: string[];
  recommendations: string[];
}

interface JobMatch {
  job_title: string;
  company: string;
  location?: string;
  match_score: number;
  breakdown: SkillGapBreakdown;
  apply_url?: string;
  source?: string;
  salary_range?: string;
}

const SCORE_COLOR = (score: number) =>
  score >= 75 ? "text-emerald-600 dark:text-emerald-400" :
  score >= 55 ? "text-blue-600 dark:text-blue-400" :
  score >= 35 ? "text-amber-600 dark:text-amber-400" :
  "text-rose-600 dark:text-rose-400";

const SCORE_BG = (score: number) =>
  score >= 75 ? "bg-emerald-500/10 border-emerald-500/20" :
  score >= 55 ? "bg-blue-500/10 border-blue-500/20" :
  score >= 35 ? "bg-amber-500/10 border-amber-500/20" :
  "bg-rose-500/10 border-rose-500/20";

export default function JobsPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatch | null>(null);

  const [recommendations, setRecommendations] = useState<JobMatch[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState("");
  const [liveSearchQuery, setLiveSearchQuery] = useState("");
  const [searchingLive, setSearchingLive] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecs(true);
    setRecsError("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout
      const res = await api.get("/jobs/recommendations", { signal: controller.signal });
      clearTimeout(timeout);
      if (res.data?.success) {
        setRecommendations(res.data.data || []);
        setIsOnline(true);
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.code === "ECONNABORTED") {
        setRecsError("Request timed out. Backend may be starting up — please retry.");
      } else if (err.response?.status === 400) {
        setRecsError("Upload a resume first to see personalized job matches.");
      } else {
        setRecsError("Could not load live jobs. Showing cached results.");
      }
      setIsOnline(false);
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingLive(true);
    setRecsError("");
    try {
      const res = await api.get("/jobs/live", { params: { search: liveSearchQuery }, timeout: 12000 });
      if (res.data?.success) {
        setRecommendations(res.data.data || []);
        setIsOnline(true);
      }
    } catch (err: any) {
      setRecsError(err.response?.status === 400 ? "Upload a resume to see personalized scores." : "Search failed — please try again.");
      setIsOnline(false);
    } finally {
      setSearchingLive(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a job description to analyze.");
      return;
    }
    setErrorMsg("");
    setAnalyzing(true);
    try {
      const res = await api.post("/jobs/analyze", {
        title: jobTitle || "Target Position",
        company: company || "Target Company",
        description: jobDescription,
      }, { timeout: 15000 });
      if (res.data?.success) {
        setMatchResult(res.data.data);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Analysis failed. Make sure your resume is uploaded first."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToTracker = async (job: { job_title: string; company: string; location?: string; match_score?: number; apply_url?: string; salary_range?: string }) => {
    try {
      await api.post("/applications", {
        job_title: job.job_title,
        company: job.company,
        location: job.location || "Remote",
        status: "saved",
        match_score: job.match_score,
        url: job.apply_url,
        salary: job.salary_range,
      });
      setSavedMsg(`✓ Saved "${job.job_title}" to tracker!`);
      setTimeout(() => setSavedMsg(""), 4000);
    } catch {
      alert("Failed to save. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Live Job Matching
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time jobs from Remotive, Adzuna & top companies — scored against your resume like LinkedIn/Naukri
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isOnline ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isOnline ? "Live Feed Active" : "Offline Mode"}</span>
        </div>
      </div>

      {/* Banners */}
      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />{savedMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left — Custom Job Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Paste & Analyze Job
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior React Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Company</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Job Description *</label>
                <textarea rows={10} value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description — requirements, responsibilities, qualifications..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={analyzing}
                className="w-full py-3 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {analyzing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing…</span></>
                  : <><Zap className="w-4 h-4" /><span>Analyze ATS Match & Skill Gap</span></>}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Analysis Results */}
        <div className="lg:col-span-7">
          {matchResult ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-5">
              <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">Match Analysis</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{matchResult.job_title}</h3>
                  <p className="text-xs text-slate-500">{matchResult.company}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${SCORE_COLOR(matchResult.match_score)}`}>{Math.round(matchResult.match_score)}%</div>
                  <div className="text-xs font-semibold text-slate-400">ATS Match</div>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Skills", value: matchResult.breakdown.skill_score },
                  { label: "Experience", value: matchResult.breakdown.experience_score },
                  { label: "Education", value: matchResult.breakdown.education_score },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-center">
                    <div className={`text-sm font-bold ${SCORE_COLOR(s.value)}`}>{Math.round(s.value)}%</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Matched skills */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Matched Skills ({matchResult.breakdown.matching_skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.breakdown.matching_skills.length > 0
                    ? matchResult.breakdown.matching_skills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">{s}</span>
                      ))
                    : <span className="text-xs text-slate-400">None detected</span>}
                </div>
              </div>

              {/* Missing skills */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Missing Skills ({matchResult.breakdown.missing_required_skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.breakdown.missing_required_skills.length > 0
                    ? matchResult.breakdown.missing_required_skills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">{s}</span>
                      ))
                    : <span className="text-xs text-emerald-500 font-semibold">🎉 All required skills matched!</span>}
                </div>
              </div>

              {/* Missing keywords */}
              {matchResult.breakdown.missing_keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.breakdown.missing_keywords.map(kw => (
                      <span key={kw} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-500" />AI Suggestions
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {matchResult.breakdown.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-blue-500 font-bold">•</span><span>{rec}</span></li>
                  ))}
                </ul>
              </div>

              <button onClick={() => handleSaveToTracker(matchResult)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                <BookmarkPlus className="w-4 h-4" /><span>Save to Application Tracker</span>
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-4 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Instant Skill Gap Analysis</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Paste any job description on the left and get an instant ATS match score with missing skills and AI suggestions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Internet Job Search Section */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Live Job Board
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real jobs from Remotive · Adzuna · Top Tech Companies — ATS scored against your resume
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <form onSubmit={handleLiveSearch} className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={liveSearchQuery} onChange={e => setLiveSearchQuery(e.target.value)}
                  placeholder="Search: Python, React, DevOps, Java..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button type="submit" disabled={searchingLive}
                className="px-4 py-2 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-95 transition-all flex items-center space-x-1.5 shrink-0">
                {searchingLive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Search</span>
              </button>
            </form>
            <button onClick={fetchRecommendations} disabled={loadingRecs}
              title="Refresh jobs"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:border-blue-500/50 transition-all">
              <RefreshCw className={`w-4 h-4 ${loadingRecs ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error state */}
        {recsError && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{recsError}</span>
            <button onClick={fetchRecommendations} className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold transition-colors">Retry</button>
          </div>
        )}

        {/* Job Cards Grid */}
        {loadingRecs || searchingLive ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-500">Fetching live jobs from the internet…</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No jobs found. Try a different search or upload your resume for personalized matches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recommendations.map((job, idx) => (
              <div key={idx}
                className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 hover:shadow-lg transition-all space-y-4 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight line-clamp-2">{job.job_title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-500 font-semibold truncate">{job.company}</span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 px-2.5 py-1 rounded-full border text-xs font-bold ${SCORE_BG(job.match_score)} ${SCORE_COLOR(job.match_score)}`}>
                    {Math.round(job.match_score)}%
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {job.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  )}
                  {job.salary_range && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary_range}</span>
                  )}
                  {job.source && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">{job.source}</span>
                  )}
                </div>

                {/* Match bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>ATS Match Score</span>
                    <span className={`font-bold ${SCORE_COLOR(job.match_score)}`}>{Math.round(job.match_score)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${job.match_score >= 75 ? "bg-emerald-500" : job.match_score >= 55 ? "bg-blue-500" : job.match_score >= 35 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${job.match_score}%` }}
                    />
                  </div>
                </div>

                {/* Matched skills */}
                {job.breakdown.matching_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.breakdown.matching_skills.slice(0, 4).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">{s}</span>
                    ))}
                    {job.breakdown.matching_skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px]">+{job.breakdown.matching_skills.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 flex items-center gap-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  {job.apply_url && job.apply_url !== "#" ? (
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /><span>Apply Now</span>
                    </a>
                  ) : (
                    <button onClick={() => { setMatchResult(job); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="flex-1 py-2 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-1.5">
                      <ArrowRight className="w-3.5 h-3.5" /><span>View Analysis</span>
                    </button>
                  )}
                  <button onClick={() => handleSaveToTracker(job)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:border-blue-500/50 transition-all"
                    title="Save to tracker">
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

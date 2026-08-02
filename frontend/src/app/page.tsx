"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles, FileText, Target, Award, ArrowRight, CheckCircle2, ShieldCheck, Zap, Briefcase, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 dark:bg-slate-950/75 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">CareerAI</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl gradient-bg hover:opacity-95 transition-all shadow-md flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Career Intelligence SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-8">
              Land Your Dream Job <br className="hidden sm:inline" />
              <span className="gradient-text">3x Faster with AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Supercharge your job search with instant ATS resume scoring, real-time job matching, skill gap analysis, and tailored AI interview prep.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl gradient-bg text-base font-bold flex items-center justify-center space-x-3 shadow-xl hover:shadow-blue-500/25 hover:scale-[1.02] transition-all"
              >
                <span>Optimize Your Resume Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
              >
                <Briefcase className="w-5 h-5 text-slate-500" />
                <span>Explore Live Jobs</span>
              </Link>
            </div>

            {/* Interactive Preview Card */}
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-8 text-left border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800/60 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                    94%
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Senior Full Stack Engineer Match</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Target Role: Tech Lead @ Stripe</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ATS Verified</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="text-xs text-slate-500 mb-1">Impact Score</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">92 / 100</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Top 5% of candidates</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="text-xs text-slate-500 mb-1">Keywords Matched</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">28 / 30</div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">React, Next.js, FastAPI</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800/40">
                  <div className="text-xs text-slate-500 mb-1">Skill Gaps Identified</div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">2 Missing</div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">GraphQL, Kubernetes</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Everything You Need for Career Breakthroughs
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Built with modern AI tools to ensure your resume bypasses automated ATS filters and lands directly on recruiters' desks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="glass-card p-6 rounded-2xl flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">ATS Resume Parsing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Upload PDF or DOCX resumes. Extracts work history, skills, and certifications instantly.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI Job Matching</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Semantic embedding search matches your skills with thousands of active tech job descriptions.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Skill Gap Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Uncover missing critical skills and receive actionable learning recommendations.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI Mock Interviews</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Practice job-specific behavioral and technical questions with real-time AI feedback.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">CareerAI</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 CareerAI SaaS Inc. All rights reserved. Built with Next.js 15 & FastAPI.
          </div>
        </div>
      </footer>
    </div>
  );
}

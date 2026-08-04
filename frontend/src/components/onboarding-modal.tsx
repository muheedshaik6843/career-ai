"use client";

import { useOnboarding } from "@/components/onboarding-context";
import { Sparkles, FileText, Briefcase, Bot, BookmarkCheck, ChevronLeft, ChevronRight, CheckCircle2, X, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper components defined first so they can be used in stepComponents
function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center">
      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
    </div>
  );
}

function BenefitRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{text}</span>
    </div>
  );
}

function ToolCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center">
      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
    </div>
  );
}

export function OnboardingModal() {
  const {
    currentStep,
    totalSteps,
    steps,
    nextStep,
    previousStep,
    completeStep,
    isComplete,
    startOnboarding,
    skipOnboarding
  } = useOnboarding();

  if (isComplete) return null;

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    completeStep(currentStepData.id);
    nextStep();
  };

  const stepComponents = {
    welcome: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to CareerAI</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Your AI-powered career assistant for resume optimization, live job matching, interview preparation, and career growth — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <FeatureCard icon={FileText} title="Resume Parsing" desc="PDF/DOCX upload with ATS scoring" />
          <FeatureCard icon={Briefcase} title="Live Job Matches" desc="Real-time jobs from 5+ sources" />
          <FeatureCard icon={Bot} title="AI Career Copilot" desc="Cover letters, interviews, roadmaps" />
        </div>
      </div>
    ),
    resume: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <FileText className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Upload Your Resume</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Upload your resume (PDF or DOCX) to get instant ATS scoring, skill extraction, and personalized job matching powered by AI.
          </p>
        </div>
        <div className="space-y-3 max-w-md mx-auto">
          <BenefitRow icon={CheckCircle2} text="ATS Score & Skill Gap Analysis" />
          <BenefitRow icon={CheckCircle2} text="Keyword Optimization Suggestions" />
          <BenefitRow icon={CheckCircle2} text="Auto-extracted Skills & Experience" />
          <BenefitRow icon={CheckCircle2} text="Multiple Resume Versions Support" />
        </div>
      </div>
    ),
    jobs: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Briefcase className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Discover Live Job Matches</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Get real-time job recommendations from 5+ sources including TimesJobs, Shine, RemoteOK, Remotive, and Adzuna — all scored against your resume.
          </p>
        </div>
        <div className="space-y-3 max-w-md mx-auto">
          <BenefitRow icon={CheckCircle2} text="ATS Match Score for Every Job" />
          <BenefitRow icon={CheckCircle2} text="Skill Gap Analysis & Recommendations" />
          <BenefitRow icon={CheckCircle2} text="Apply Directly or Save to Tracker" />
          <BenefitRow icon={CheckCircle2} text="Personalized by Your Resume" />
        </div>
      </div>
    ),
    "ai-tools": (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Bot className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Career Toolkit</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Access a complete suite of AI-powered career tools designed to accelerate your job search and career growth.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
          <ToolCard icon={Bot} title="AI Chat" desc="24/7 career advisor" />
          <ToolCard icon={FileText} title="Cover Letters" desc="Tailored in seconds" />
          <ToolCard icon={FileText} title="Interview Prep" desc="Mock interviews with AI grading" />
          <ToolCard icon={FileText} title="Roadmaps" desc="Career growth plans" />
          <ToolCard icon={FileText} title="Bullet Optimizer" desc="Rewrite weak bullets" />
        </div>
      </div>
    ),
    tracker: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <BookmarkCheck className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Track Your Applications</h3>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Save jobs you're interested in, track application status, and manage your entire job search pipeline from one dashboard.
          </p>
        </div>
        <div className="space-y-3 max-w-md mx-auto">
          <BenefitRow icon={CheckCircle2} text="Save Jobs with One Click" />
          <BenefitRow icon={CheckCircle2} text="Track Status: Saved → Applied → Interview → Offer" />
          <BenefitRow icon={CheckCircle2} text="Add Notes, Deadlines & Match Scores" />
          <BenefitRow icon={CheckCircle2} text="Export Your Application History" />
        </div>
      </div>
    ),
  };

  const StepComponent = stepComponents[currentStepData.id as keyof typeof stepComponents] || stepComponents.welcome;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={skipOnboarding}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl"
      >
        {/* Progress Bar */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentStepData.title}
            </h2>
            <button
              onClick={skipOnboarding}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    idx < currentStep
                      ? "bg-emerald-500 text-white"
                      : idx === currentStep
                      ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {idx < currentStep ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-5 h-5 mx-auto" />
                      </motion.span>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 text-center w-20">{step.title}</span>
                  {idx < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 ${idx < currentStep ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {StepComponent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep === totalSteps - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-95 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
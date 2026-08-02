"use client";

import { useState } from "react";
import { Video, Sparkles, Send, CheckCircle2, AlertCircle, Award, Loader2, Play, ArrowRight, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";

interface Question {
  id: string;
  category: string;
  question: string;
}

interface QuestionFeedback {
  question_id: string;
  question: string;
  user_answer: string;
  score: number;
  rating: string;
  feedback: string;
  key_improvements: string[];
}

interface InterviewSession {
  id: string;
  target_role: string;
  difficulty: string;
  status: string;
  questions: Question[];
  answers: QuestionFeedback[];
  overall_score?: number;
  strengths?: string[];
  areas_for_improvement?: string[];
}

export default function InterviewsPage() {
  const [role, setRole] = useState("Full Stack Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    try {
      const res = await api.post("/interviews/start", {
        target_role: role,
        difficulty: difficulty,
      });

      if (res.data?.success) {
        setSession(res.data.data);
        setActiveQuestionIdx(0);
        setFeedback(null);
        setUserAnswer("");
      }
    } catch (err) {
      alert("Failed to start mock interview session.");
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !userAnswer.trim()) return;
    const q = session.questions[activeQuestionIdx];
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${session.id}/answer`, {
        question_id: q.id,
        user_answer: userAnswer,
      });

      if (res.data?.success) {
        const fb = res.data.data;
        setFeedback(fb);

        // Update session answers locally
        const updatedAnswers = [...(session.answers || []), fb];
        const isFinished = updatedAnswers.length >= session.questions.length;

        setSession({
          ...session,
          answers: updatedAnswers,
          status: isFinished ? "completed" : session.status,
          overall_score: isFinished
            ? Math.round(updatedAnswers.reduce((acc, curr) => acc + curr.score, 0) / updatedAnswers.length)
            : session.overall_score,
        });
      }
    } catch (err) {
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    setActiveQuestionIdx(activeQuestionIdx + 1);
    setFeedback(null);
    setUserAnswer("");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          AI Mock Interview Simulator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Practice behavioral and technical interview questions with real-time AI feedback and scoring.
        </p>
      </div>

      {!session ? (
        /* START SESSION FORM */
        <div className="glass-card rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Start New Mock Interview Session
            </h2>
            <p className="text-xs text-slate-500">
              Select your target role and difficulty level to generate customized interview questions.
            </p>
          </div>

          <form onSubmit={handleStartSession} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Target Engineering Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Interview Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="Easy">Standard / Entry Level</option>
                <option value="Medium">Intermediate / Mid-Level</option>
                <option value="Hard">Advanced / Senior Level</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Interview Simulation</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* ACTIVE SESSION INTERFACE */
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                {session.target_role} — {session.difficulty}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                Question {activeQuestionIdx + 1} of {session.questions.length}
              </h2>
            </div>

            <button
              onClick={() => setSession(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center space-x-1 hover:bg-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800/80 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Category: {session.questions[activeQuestionIdx].category}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                "{session.questions[activeQuestionIdx].question}"
              </h3>
            </div>

            {/* Answer Box */}
            {!feedback ? (
              <div className="space-y-4">
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response clearly. Tip: Structure behavioral questions with STAR (Situation, Task, Action, Result)..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !userAnswer.trim()}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Response...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Response for AI Grading</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* AI FEEDBACK VIEW */
              <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        AI Score: {feedback.score} / 100 ({feedback.rating})
                      </div>
                      <div className="text-xs text-slate-500">{feedback.feedback}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Key Improvement Areas</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {feedback.key_improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  {activeQuestionIdx < session.questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-95 transition-all flex items-center space-x-2"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-right space-y-2">
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        🎉 Interview Session Complete! Overall Score: {session.overall_score}%
                      </div>
                      <button
                        onClick={() => setSession(null)}
                        className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
                      >
                        Start Another Practice Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

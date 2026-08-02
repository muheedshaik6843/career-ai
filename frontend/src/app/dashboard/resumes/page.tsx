"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Upload, FileText, Trash2, Star, StarOff, Loader2, AlertCircle,
  CheckCircle2, Clock, XCircle, ChevronRight, Award, Brain,
  Briefcase, GraduationCap, Code2, Lightbulb, ArrowUpRight,
} from "lucide-react";

interface ResumeListItem {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: string;
  version: number;
  is_primary: boolean;
  ats_score: number | null;
  skills_count: number;
  created_at: string;
}

interface ResumeDetail {
  id: string;
  original_filename: string;
  status: string;
  is_primary: boolean;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  summary: string | null;
  skills: string[];
  education: Array<{ institution: string; degree: string; year: string }>;
  experience: Array<{ title: string; company: string; duration: string; description: string[] }>;
  certifications: string[];
  ats_score: number | null;
  ats_feedback: string[];
  improvement_suggestions: string[];
  parse_error: string | null;
  created_at: string;
}

// ─── ATS Score Ring ──────────────────────────────────────────────────────────
function ATSScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{score}</span>
        <span className="text-[10px] font-semibold text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────
function UploadZone({ onUpload, isUploading }: { onUpload: (file: File) => void; isUploading: boolean }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all group
        ${isDragging ? "border-blue-500 bg-blue-500/5 scale-[1.01]" : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-500/3"}
        ${isUploading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
      />
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all
        ${isDragging ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`}>
        {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
      </div>
      <p className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1">
        {isUploading ? "Parsing your resume…" : "Drop your resume here"}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {isUploading ? "AI is extracting skills, experience and computing ATS score" : "Supports PDF and DOCX — up to 10MB"}
      </p>
      {!isUploading && (
        <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
          Browse File
        </button>
      )}
    </div>
  );
}

// ─── Resume Card ─────────────────────────────────────────────────────────────
function ResumeCard({ resume, onSelect, isSelected, onDelete, onSetPrimary }: {
  resume: ResumeListItem; onSelect: () => void; isSelected: boolean;
  onDelete: () => void; onSetPrimary: () => void;
}) {
  const statusIcon = {
    COMPLETED: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    PROCESSING: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
    FAILED: <XCircle className="w-4 h-4 text-red-500" />,
    PENDING: <Clock className="w-4 h-4 text-amber-500" />,
  }[resume.status] ?? <Clock className="w-4 h-4 text-slate-400" />;

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
          : "border-slate-200 dark:border-slate-800 hover:border-blue-400/50 hover:shadow-md"
      } bg-white/60 dark:bg-slate-900/60`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[180px]">{resume.original_filename}</p>
            <p className="text-xs text-slate-500">v{resume.version} • {resume.file_type?.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {statusIcon}
        </div>
      </div>

      {resume.ats_score !== null && (
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-500">ATS Score</span>
            <span className={`font-bold ${resume.ats_score >= 80 ? "text-emerald-600" : resume.ats_score >= 60 ? "text-blue-600" : "text-amber-600"}`}>
              {resume.ats_score}/100
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                resume.ats_score >= 80 ? "bg-emerald-500" : resume.ats_score >= 60 ? "bg-blue-500" : "bg-amber-500"
              }`}
              style={{ width: `${resume.ats_score}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{resume.skills_count} skills • {new Date(resume.created_at).toLocaleDateString()}</span>
        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <button onClick={onSetPrimary} title={resume.is_primary ? "Primary Resume" : "Set as Primary"}
            className={`p-1.5 rounded-lg transition-colors ${resume.is_primary ? "text-amber-500" : "text-slate-400 hover:text-amber-500 hover:bg-amber-500/10"}`}>
            {resume.is_primary ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resume Detail Panel ──────────────────────────────────────────────────────
function ResumeDetailPanel({ resumeId }: { resumeId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["resume-detail", resumeId],
    queryFn: async () => {
      const res = await api.get(`/resumes/${resumeId}`);
      return res.data.data as ResumeDetail;
    },
  });

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-1">
      {/* ATS Score Hero */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-6">
          {data.ats_score !== null && <ATSScoreRing score={data.ats_score} />}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{data.full_name || data.original_filename}</h3>
            {data.email && <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{data.email}</p>}
            {data.phone && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{data.phone}</p>}
            {data.ats_score !== null && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                data.ats_score >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                data.ats_score >= 60 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}>
                <Award className="w-3.5 h-3.5 mr-1.5" />
                {data.ats_score >= 80 ? "Excellent ATS Score" : data.ats_score >= 60 ? "Good ATS Score" : "Needs Improvement"}
              </span>
            )}
          </div>
        </div>

        {data.parse_error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{data.parse_error}</span>
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-2">
            <Brain className="w-4 h-4" /> <span>Professional Summary</span>
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-2">
            <Code2 className="w-4 h-4" /> <span>Skills ({data.skills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center space-x-2">
            <Briefcase className="w-4 h-4" /> <span>Experience</span>
          </h4>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="pl-4 border-l-2 border-blue-500/30">
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{exp.title}</p>
                {exp.company && <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{exp.company}</p>}
                {exp.duration && <p className="text-xs text-slate-500 mb-2">{exp.duration}</p>}
                {exp.description?.slice(0, 3).map((d, j) => (
                  <p key={j} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">• {d}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-2">
            <GraduationCap className="w-4 h-4" /> <span>Education</span>
          </h4>
          <div className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i}>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{edu.institution}</p>
                {edu.degree && <p className="text-xs text-slate-500">{edu.degree}</p>}
                {edu.year && <p className="text-xs text-slate-400">{edu.year}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {data.improvement_suggestions && data.improvement_suggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-amber-200/50 dark:border-amber-800/30 bg-amber-500/3">
          <h4 className="font-bold text-sm uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" /> <span>AI Improvement Suggestions</span>
          </h4>
          <div className="space-y-2">
            {data.improvement_suggestions.map((s, i) => (
              <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResumesPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: resumeData, isLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await api.get("/resumes");
      return res.data.data as ResumeListItem[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/resumes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    },
    onSuccess: (resume) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      setSelectedId(resume.id);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.detail || "Upload failed.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      setSelectedId(null);
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/resumes/${id}/set-primary`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumes"] }),
  });

  const resumes = resumeData || [];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Resume Intelligence</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload, parse, and optimize your resumes with AI-powered ATS scoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            {resumes.length} Resume{resumes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <UploadZone onUpload={(file) => uploadMutation.mutate(file)} isUploading={uploadMutation.isPending} />

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No resumes yet</h3>
          <p className="text-sm text-slate-500">Upload your first resume to get your AI ATS score</p>
        </div>
      ) : (
        <div className="flex gap-6 min-h-0 flex-1">
          {/* Left: Resume Cards */}
          <div className="w-80 flex-shrink-0 space-y-3 overflow-y-auto">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                isSelected={selectedId === resume.id}
                onSelect={() => setSelectedId(resume.id)}
                onDelete={() => deleteMutation.mutate(resume.id)}
                onSetPrimary={() => setPrimaryMutation.mutate(resume.id)}
              />
            ))}
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 overflow-hidden">
            {selectedId ? (
              <ResumeDetailPanel resumeId={selectedId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <ChevronRight className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-semibold text-slate-500">Select a resume to view parsed data & ATS score</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  BookmarkCheck,
  Plus,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  Edit,
  Loader2,
  LayoutGrid,
  List,
  CheckCircle2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

export interface Application {
  id: string;
  job_title: string;
  company: string;
  location?: string;
  salary?: string;
  url?: string;
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected";
  applied_date?: string;
  notes?: string;
  match_score?: number;
  created_at: string;
}

const STAGES = [
  { id: "saved", title: "Saved Jobs", color: "border-slate-500 text-slate-600 bg-slate-50 dark:bg-slate-900" },
  { id: "applied", title: "Applied", color: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
  { id: "interviewing", title: "Interviewing", color: "border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
  { id: "offer", title: "Offer Received", color: "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
  { id: "rejected", title: "Rejected", color: "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    job_title: "",
    company: "",
    location: "",
    salary: "",
    url: "",
    status: "saved",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications");
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title || !formData.company) return;
    setSaving(true);
    try {
      const res = await api.post("/applications", formData);
      if (res.data?.success) {
        setApplications([res.data.data, ...applications]);
        setIsModalOpen(false);
        setFormData({
          job_title: "",
          company: "",
          location: "",
          salary: "",
          url: "",
          status: "saved",
          notes: "",
        });
      }
    } catch (err) {
      alert("Failed to save application.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/applications/${id}`, { status: newStatus });
      if (res.data?.success) {
        setApplications(applications.map((app) => (app.id === id ? res.data.data : app)));
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      alert("Failed to delete application.");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return app.job_title.toLowerCase().includes(q) || app.company.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <BookmarkCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Job Application Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Organize, track, and manage your job applications across all stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "kanban" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "table" ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500"
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-95 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter applications by role or company..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = filteredApplications.filter((app) => app.status === stage.id);
            return (
              <div key={stage.id} className="space-y-4 min-w-[240px]">
                <div className={`p-3 rounded-xl border-l-4 ${stage.color} flex items-center justify-between`}>
                  <h3 className="font-bold text-xs uppercase tracking-wider">{stage.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/60 dark:bg-slate-900/60 font-black text-xs">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="glass-card rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md transition-all space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{app.job_title}</h4>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {app.company}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {app.location && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      )}

                      {/* Stage Selector */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                        </select>

                        {app.match_score && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {app.match_score}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageApps.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-4">Job Title</th>
                <th className="p-4">Company</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Match Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{app.job_title}</td>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{app.company}</td>
                  <td className="p-4 text-slate-500">{app.location || "Remote"}</td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {app.match_score ? `${app.match_score}%` : "—"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Stripe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco / Remote"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Stage Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Recruiter contact, interview dates, referral notes..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-bold hover:opacity-95 shadow-md"
                >
                  {saving ? "Saving..." : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

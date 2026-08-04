"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Briefcase,
  Video,
  BookmarkCheck,
  Compass,
  PenTool,
  Wand2,
  Bot,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Wifi,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Resume ATS Score Available", time: "10m ago", read: false },
    { id: 2, title: "5 New Live Internet Jobs Matched", time: "1h ago", read: false },
    { id: 3, title: "AI Mock Interview Practice Ready", time: "1d ago", read: true },
  ]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get("/users/me");
        if (response.data?.success) {
          setUser(response.data.data);
          setOnlineStatus(true);
        }
      } catch (err) {
        // Backend now returns demo user when no token provided
        setOnlineStatus(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
    { name: "Resume Parsing", href: "/dashboard/resumes", icon: FileText, badge: null },
    { name: "Bullet Optimizer", href: "/dashboard/optimize", icon: Wand2, badge: null },
    { name: "AI Copilot Chat", href: "/dashboard/chat", icon: Bot, badge: "New" },
    { name: "Job Matching & Skill Gap", href: "/dashboard/jobs", icon: Briefcase, badge: "Live" },
    { name: "AI Cover Letter", href: "/dashboard/cover-letter", icon: PenTool, badge: null },
    { name: "AI Interview Prep", href: "/dashboard/interviews", icon: Video, badge: null },
    { name: "Career Roadmap", href: "/dashboard/roadmap", icon: Compass, badge: null },
    { name: "Applications Tracker", href: "/dashboard/applications", icon: BookmarkCheck, badge: null },
    { name: "Account Settings", href: "/dashboard/settings", icon: Settings, badge: null },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Candidate";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-3 mb-6 px-2" onClick={() => setIsSidebarOpen(false)}>
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight gradient-text">CareerAI</span>
          <div className="flex items-center space-x-1 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${onlineStatus ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="text-[10px] text-slate-400 font-medium">{onlineStatus ? "Live Jobs Active" : "Offline Mode"}</span>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"}`} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/settings" className="flex items-center space-x-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-full gradient-bg text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors">{displayName}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role || "Candidate"}</div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 p-5 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 p-5 z-50 flex flex-col transition-transform duration-300 lg:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, skills, resumes..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 relative">
            {/* Live indicator */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${onlineStatus ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
              <Wifi className="w-3.5 h-3.5" />
              <span>{onlineStatus ? "Live Jobs Connected" : "Offline"}</span>
            </div>

            <ThemeToggle />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Dropdown panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition-colors ${
                          n.read
                            ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/40 dark:border-slate-800/40 text-slate-500"
                            : "bg-blue-500/10 border-blue-500/20 text-slate-900 dark:text-slate-100 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar in topbar */}
            <Link
              href="/dashboard/settings"
              className="w-9 h-9 rounded-full gradient-bg text-white flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
            >
              {initials || "U"}
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
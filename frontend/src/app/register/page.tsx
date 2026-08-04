"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Sparkles, User, ArrowRight, AlertCircle, Loader2, Mail, Lock, Eye, EyeOff, Chrome, Github, ChevronRight } from "lucide-react";

const usernameRegisterSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
});

const emailRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UsernameRegisterFormValues = z.infer<typeof usernameRegisterSchema>;
type EmailRegisterFormValues = z.infer<typeof emailRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"username" | "email">("username");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetUsernameForm,
  } = useForm<UsernameRegisterFormValues>({
    resolver: zodResolver(usernameRegisterSchema),
  });

  // Email/password form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    reset: resetEmailForm,
  } = useForm<EmailRegisterFormValues>({
    resolver: zodResolver(emailRegisterSchema),
  });

  const onSubmit = async (data: UsernameRegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Use the same username endpoint - it will create or find user
      const response = await api.post("/auth/username", data);
      if (response.data?.success && response.data?.data) {
        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        router.push("/dashboard");
      } else {
        setErrorMessage(response.data?.error || "Registration failed.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Registration failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitEmail = async (data: EmailRegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: "candidate",
      });
      if (response.data?.success && response.data?.data) {
        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        router.push("/dashboard");
      } else {
        setErrorMessage(response.data?.error || "Registration failed.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Registration failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTab = (tab: "username" | "email") => {
    setActiveTab(tab);
    setErrorMessage(null);
    if (tab === "username") {
      resetEmailForm();
    } else {
      resetUsernameForm();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight gradient-text">CareerAI</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {activeTab === "username" 
              ? "Enter a username to start optimizing your career with AI intelligence"
              : "Create your account with email and password"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl border border-slate-200/80 dark:border-slate-800/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={() => switchTab("username")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === "username"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <User className="w-4 h-4" />
                <span>Username Only</span>
              </span>
              {activeTab === "username" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => switchTab("email")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors relative ${
                activeTab === "email"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <Lock className="w-4 h-4" />
                <span>Email & Password</span>
              </span>
              {activeTab === "email" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === "username" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("username")}
                    type="text"
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === "email" && (
            <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerEmail("full_name")}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                  />
                </div>
                {emailErrors.full_name && (
                  <p className="text-xs text-red-500 mt-1">{emailErrors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerEmail("email")}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                  />
                </div>
                {emailErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{emailErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerEmail("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password (min 8 chars)"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {emailErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{emailErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerEmail("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {emailErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{emailErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            {activeTab === "username" ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Alternative auth methods */}
        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoogleSignInButton
              variant="outline"
              disabled={isLoading}
              onSuccess={() => router.push("/dashboard")}
            />
            <button
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
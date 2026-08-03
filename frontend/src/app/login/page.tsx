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
import { Sparkles, User, ArrowRight, AlertCircle, Loader2, Chrome, Github } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Please enter a username"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post("/auth/username", data);
      if (response.data?.success && response.data?.data) {
        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        router.push("/dashboard");
      } else {
        setErrorMessage(response.data?.error || "Login failed.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Login failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
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
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Enter your username to access your AI Career Dashboard
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl border border-slate-200/80 dark:border-slate-800/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

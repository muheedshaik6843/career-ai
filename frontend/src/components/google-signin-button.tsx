"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Chrome, AlertCircle } from "lucide-react";
import { useState } from "react";

interface GoogleSignInButtonProps {
  variant?: "standard" | "icon_only";
  onSuccess?: () => void;
}

export function GoogleSignInButton({
  variant = "standard",
  onSuccess,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      // Send Google ID token to our backend
      const response = await api.post("/auth/google/token", {
        id_token: credentialResponse.credential,
      });

      if (response.data?.success && response.data?.data) {
        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard");
        }
      } else {
        const errMsg = response.data?.error || "Google authentication failed";
        setError(errMsg);
      }
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Google sign-in failed";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Google OAuth error - please try again");
  };

  if (variant === "icon_only") {
    return (
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="filled_black"
        size="large"
        logo_alignment="center"
      />
    );
  }

  // Standard button - use default Google button with custom className
  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {isLoading && (
        <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm flex items-center space-x-2">
          <span className="animate-pulse">Signing in...</span>
        </div>
      )}
    </div>
  );
}
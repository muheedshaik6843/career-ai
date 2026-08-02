"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";

interface GoogleSignInButtonProps {
  variant?: "standard" | "icon_only";
  onSuccess?: () => void;
}

export function GoogleSignInButton({
  variant = "standard",
  onSuccess,
}: GoogleSignInButtonProps) {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
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
      }
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  };

  const handleError = () => {
    console.error("Google OAuth error");
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
  );
}
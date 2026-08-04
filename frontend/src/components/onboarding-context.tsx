"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  completed: boolean;
  required: boolean;
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string) => void;
  isComplete: boolean;
  startOnboarding: () => void;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Check if user has seen onboarding before
  useEffect(() => {
    const seen = localStorage.getItem("onboarding_completed");
    if (seen) {
      setHasSeenOnboarding(true);
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to CareerAI",
      description: "Your AI-powered career assistant for resume optimization, job matching, and interview prep.",
      component: null, // Will render inline
      completed: false,
      required: true,
    },
    {
      id: "resume",
      title: "Upload Your Resume",
      description: "Upload your resume (PDF/DOCX) for ATS scoring, skill extraction, and personalized job matching.",
      component: null,
      completed: false,
      required: true,
    },
    {
      id: "jobs",
      title: "Discover Live Job Matches",
      description: "Get real-time job recommendations from 5+ sources, scored against your resume with ATS matching.",
      component: null,
      completed: false,
      required: true,
    },
    {
      id: "ai-tools",
      title: "Explore AI Career Tools",
      description: "Cover letters, mock interviews, career roadmaps, bullet optimization, and AI chat assistant.",
      component: null,
      completed: false,
      required: false,
    },
    {
      id: "tracker",
      title: "Track Applications",
      description: "Save jobs, track application status, and manage your job search pipeline in one place.",
      component: null,
      completed: false,
      required: false,
    },
  ];

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    localStorage.setItem("onboarding_completed", "true");
    setHasSeenOnboarding(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    localStorage.setItem("onboarding_completed", "true");
    setHasSeenOnboarding(true);
  };

  const isComplete = hasSeenOnboarding || currentStep >= steps.length - 1;

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps: steps.length,
        steps,
        nextStep,
        previousStep,
        completeStep,
        isComplete,
        startOnboarding,
        skipOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
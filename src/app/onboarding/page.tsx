"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Endeavor",
    description: "A platform where people come together to make things happen. Post what you want to do, find people who want to do it with you, and make it real.",
    icon: ">",
    color: "text-code-green",
  },
  {
    id: "profile",
    title: "Set Up Your Profile",
    description: "Add your skills, interests, and a short bio so others can find you. The more you share, the better your recommendations.",
    icon: "@",
    color: "text-code-blue",
    action: { label: "Edit Profile", href: "/profile" },
  },
  {
    id: "explore",
    title: "Explore Endeavors",
    description: "Browse ongoing endeavors across categories — adventure, science, tech, creative, and more. Filter by location, skills needed, or funding status.",
    icon: "#",
    color: "text-purple-400",
    action: { label: "Browse Feed", href: "/feed" },
  },
  {
    id: "join",
    title: "Join Your First Endeavor",
    description: "Found something interesting? Request to join! Once approved, you'll get access to the team dashboard, discussions, tasks, and more.",
    icon: "+",
    color: "text-yellow-400",
    action: { label: "Find Endeavors", href: "/feed" },
  },
  {
    id: "create",
    title: "Start Your Own",
    description: "Have an idea? Create your own endeavor and recruit a team. Set milestones, track tasks, manage funding, and share your story.",
    icon: "*",
    color: "text-code-green",
    action: { label: "Create Endeavor", href: "/endeavors/create" },
  },
];

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.completedSteps) {
          setCompletedSteps(data.completedSteps);
        }
      })
      .catch(() => {});
  }, []);

  async function completeStep(stepId: string) {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: stepId }),
    });
    setCompletedSteps((prev) => [...prev, stepId]);
  }

  function handleNext() {
    const step = STEPS[currentStep];
    completeStep(step.id);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/feed");
    }
  }

  function handleSkip() {
    router.push("/feed");
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  const step = STEPS[currentStep];
  const isCompleted = completedSteps.includes(step.id);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Progress bar */}
      <div className="mb-12 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 w-12 transition-colors ${
              i <= currentStep ? "bg-code-green" : "bg-medium-gray/20"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="max-w-lg text-center">
        <div className={`mb-6 text-5xl font-bold font-mono ${step.color}`}>
          {step.icon}
        </div>
        <h1 className="mb-4 text-3xl font-bold">{step.title}</h1>
        <p className="mb-8 text-light-gray leading-relaxed">
          {step.description}
        </p>

        {step.action && (
          <Link
            href={step.action.href}
            onClick={() => completeStep(step.id)}
            className="mb-6 inline-block border border-code-blue px-6 py-3 text-sm font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black"
          >
            {step.action.label}
          </Link>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center gap-4">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 text-sm text-medium-gray hover:text-white transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="border border-code-green bg-code-green px-8 py-3 text-sm font-bold uppercase text-black transition-opacity hover:opacity-90"
        >
          {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>

      <button
        onClick={handleSkip}
        className="mt-6 text-xs text-medium-gray hover:text-white transition-colors"
      >
        Skip onboarding
      </button>

      {/* Step indicator */}
      <p className="mt-8 text-xs text-medium-gray">
        {currentStep + 1} of {STEPS.length}
      </p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Joyride, STATUS } from "react-joyride";

const STORAGE_KEY = "virtulab-onboarding-completed-v1";

const steps: any[] = [
  {
    target: "body",
    content: "Welcome to VirtuLab! Let's take a quick tour of the key features.",
    placement: "center",
  },
  {
    target: '[data-tour="hero-cta"]',
    content: "Start exploring experiments right from here.",
  },
  {
    target: '[data-tour="categories"]',
    content: "Browse science modules — physics, chemistry, biology and more.",
  },
  {
    target: '[data-tour="nav-menu"]',
    content: "Use this menu to jump between Library, Builder, Community and Videos.",
  },
  {
    target: "body",
    content: "That's it! Dive in and start your first experiment. You can revisit Help anytime.",
    placement: "center",
  },
];

export function OnboardingTour() {
  const location = useLocation();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (location.pathname !== "/") return;
    const t = setTimeout(() => setRun(true), 1800);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const handleCallback = (data: any) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(STORAGE_KEY, "1");
      setRun(false);
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleCallback}
      options={{
        continuous: true,
        showSkipButton: true,
        showProgress: true,
        disableScrollParentFix: true,
        disableBeacon: true,
      } as any}
      styles={{
        tooltip: {
          maxWidth: "min(92vw, 360px)",
          borderRadius: 12,
          padding: 16,
          fontSize: 14,
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
        },
        overlay: { backgroundColor: "rgba(0,0,0,0.55)" },
      } as any}
    />
  );
}

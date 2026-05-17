import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Joyride, STATUS } from "react-joyride";
type Step = any;
type CallBackProps = any;

const STORAGE_KEY = "virtulab-onboarding-completed-v1";

const steps: Step[] = [
  {
    target: "body",
    content: "Welcome to VirtuLab! Let's take a quick tour of the key features.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="hero-cta"]',
    content: "Start exploring experiments right from here.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="categories"]',
    content: "Browse science modules — physics, chemistry, biology and more.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="nav-menu"]',
    content: "Use this menu to jump between Library, Builder, Community and Videos.",
    disableBeacon: true,
  },
  {
    target: "body",
    content: "That's it! Dive in and start your first experiment. You can revisit Help anytime.",
    placement: "center",
    disableBeacon: true,
  },
];

export function OnboardingTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (location.pathname !== "/") return;
    const t = setTimeout(() => setRun(true), 1800);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const handleCallback = (data: CallBackProps) => {
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
      continuous
      showSkipButton
      showProgress
      disableScrollParentFix
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: "hsl(162, 77%, 46%)",
          zIndex: 10000,
          arrowColor: "hsl(var(--card))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--foreground))",
          overlayColor: "rgba(0,0,0,0.55)",
        },
        tooltip: {
          maxWidth: "min(92vw, 360px)",
          borderRadius: 12,
          padding: 16,
          fontSize: 14,
        },
        buttonNext: { borderRadius: 8, padding: "8px 14px" },
        buttonBack: { color: "hsl(var(--muted-foreground))" },
        buttonSkip: { color: "hsl(var(--muted-foreground))" },
      }}
    />
  );
}

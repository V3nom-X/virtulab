import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Joyride, STATUS } from "react-joyride";
import { useReducedMotion } from "@/hooks/useAccessibility";

const STORAGE_KEY = "virtulab-onboarding-completed-v1";

function buildSteps(isMobile: boolean): any[] {
  const placement = isMobile ? "bottom" : "auto";
  return [
    {
      target: "body",
      content: "Welcome to VirtuLab! Let's take a quick tour of the key features.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="hero-cta"]',
      content: "Start exploring experiments right from here.",
      placement,
      disableBeacon: true,
    },
    {
      target: '[data-tour="categories"]',
      content: "Browse science modules — physics, chemistry, biology and more.",
      placement,
      disableBeacon: true,
    },
    {
      target: '[data-tour="nav-menu"]',
      content: "Use this menu to jump between Library, Builder, Community and Videos.",
      placement,
      disableBeacon: true,
    },
    {
      target: "body",
      content: "That's it! Dive in and start your first experiment. You can revisit Help anytime.",
      placement: "center",
      disableBeacon: true,
    },
  ];
}

export function OnboardingTour() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
      steps={buildSteps(isMobile)}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrollParentFix
      scrollOffset={80}
      floaterProps={{ disableAnimation: reduced }}
      callback={handleCallback}
      styles={{ ...({
        options: {
          arrowColor: "hsl(var(--card))",
          backgroundColor: "hsl(var(--card))",
          textColor: "hsl(var(--foreground))",
          primaryColor: "hsl(var(--primary))",
          overlayColor: "rgba(0,0,0,0.55)",
          zIndex: 10000,
        },
        tooltip: {
          maxWidth: "min(92vw, 360px)",
          borderRadius: 12,
          padding: 16,
          fontSize: 14,
        },
        tooltipContainer: { textAlign: "left" },
        buttonNext: {
          minHeight: 44,
          paddingInline: 16,
          borderRadius: 10,
          fontSize: 14,
        },
        buttonBack: {
          minHeight: 44,
          paddingInline: 12,
          fontSize: 14,
        },
        buttonSkip: {
          minHeight: 44,
          paddingInline: 12,
          fontSize: 14,
        },
      }}
    />
  );
}

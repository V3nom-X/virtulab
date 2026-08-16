import { useState, useEffect } from "react";

const STORAGE_KEY = "virtulab-experiment101-progress";

export function useExperiment101Progress() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCompleted(JSON.parse(stored));
    } catch {
      setCompleted([]);
    }
  }, []);

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { completed, markComplete, total: 6 };
}

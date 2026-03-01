import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "virtulab-acidbase-progress";

export function useAcidBaseProgress() {
  const [completedExperiments, setCompletedExperiments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedExperiments));
  }, [completedExperiments]);

  const markComplete = useCallback((id: string) => {
    setCompletedExperiments((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const totalExperiments = 4;
  const completionPercentage = Math.round((completedExperiments.length / totalExperiments) * 100);

  return { completedExperiments, markComplete, completionPercentage, totalExperiments };
}

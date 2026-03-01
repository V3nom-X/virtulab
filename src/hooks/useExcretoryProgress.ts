import { useState, useEffect } from "react";

const STORAGE_KEY = "virtulab-excretory-progress";

export function useExcretoryProgress() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCompleted(JSON.parse(stored));
  }, []);

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { completed, markComplete, total: 3 };
}

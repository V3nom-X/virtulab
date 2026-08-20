import { useCallback, useEffect, useState } from "react";

const LEGACY_KEY = "virtulab-experiment101-progress";
const keyFor = (id: string) => `virtulab-experiment101-${id}-progress`;

export interface Experiment101Record {
  completed: boolean;
  quizScore: number;
  quizTotal: number;
}

const EMPTY: Experiment101Record = { completed: false, quizScore: 0, quizTotal: 0 };

function readRecord(id: string): Experiment101Record {
  try {
    const raw = localStorage.getItem(keyFor(id));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completed: !!parsed.completed,
        quizScore: Number(parsed.quizScore) || 0,
        quizTotal: Number(parsed.quizTotal) || 0,
      };
    }
  } catch {
    /* ignore malformed entries */
  }
  return EMPTY;
}

/** One-time migration from the old shared array of completed ids. */
function migrateLegacy() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const ids: unknown = JSON.parse(legacy);
    if (Array.isArray(ids)) {
      ids.forEach((id) => {
        if (typeof id !== "string") return;
        if (!localStorage.getItem(keyFor(id))) {
          localStorage.setItem(keyFor(id), JSON.stringify({ ...EMPTY, completed: true }));
        }
      });
    }
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}

/** Progress for a single experiment — fully independent of the other five. */
export function useExperiment101Progress(experimentId?: string) {
  const [record, setRecord] = useState<Experiment101Record>(EMPTY);

  useEffect(() => {
    migrateLegacy();
    if (experimentId) setRecord(readRecord(experimentId));
  }, [experimentId]);

  const saveResult = useCallback(
    (quizScore: number, quizTotal: number, completed: boolean) => {
      if (!experimentId) return;
      const next: Experiment101Record = { completed, quizScore, quizTotal };
      try {
        localStorage.setItem(keyFor(experimentId), JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      setRecord(next);
    },
    [experimentId]
  );

  const reset = useCallback(() => {
    if (!experimentId) return;
    try {
      localStorage.removeItem(keyFor(experimentId));
    } catch {
      /* ignore */
    }
    setRecord(EMPTY);
  }, [experimentId]);

  return { record, saveResult, reset };
}

/** Read the independent records for a list of experiment ids (index page). */
export function useExperiment101Records(ids: string[]) {
  const [records, setRecords] = useState<Record<string, Experiment101Record>>({});

  useEffect(() => {
    migrateLegacy();
    const next: Record<string, Experiment101Record> = {};
    ids.forEach((id) => {
      next[id] = readRecord(id);
    });
    setRecords(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  const completedCount = ids.filter((id) => records[id]?.completed).length;

  return { records, completedCount, total: ids.length };
}

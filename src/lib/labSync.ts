import { enqueue, flushOutbox } from "@/lib/offlineOutbox";
import { readLabProgress } from "@/data/labExperiments";

export const LAB_STORAGE_KEY = "virtulab-lab-setup-v1";
export const LAB_CLIENT_KEY = "default-bench";

/**
 * Queue the current bench (and any newly finished labs / bench time) for the
 * cloud. Entries coalesce in the outbox and replay on reconnect.
 */
export async function queueLabSync(opts: { benchSeconds?: number; completedLabs?: string[] } = {}) {
  let data: unknown = {};
  let name = "My lab setup";
  try {
    const raw = localStorage.getItem(LAB_STORAGE_KEY);
    if (raw) {
      data = JSON.parse(raw);
      name = (data as { name?: string }).name || name;
    }
  } catch {
    /* ignore */
  }
  const done = Object.entries(readLabProgress())
    .filter(([, r]) => r.completed)
    .map(([id]) => id);
  await enqueue({
    kind: "labSetup",
    clientKey: LAB_CLIENT_KEY,
    name,
    data,
    benchSeconds: opts.benchSeconds ?? 0,
    completedLabs: Array.from(new Set([...done, ...(opts.completedLabs ?? [])])),
  });
  return flushOutbox();
}

/**
 * Offline outbox.
 *
 * Quiz results and experiment progress recorded while offline are queued in
 * IndexedDB and flushed to the backend when connectivity returns. Progress that
 * exists both locally and in the cloud reconciles by newest timestamp.
 */
import { get, set } from "idb-keyval";
import { supabase } from "@/integrations/supabase/client";

const OUTBOX_KEY = "virtulab-outbox-v1";

export type OutboxEntry =
  | {
      kind: "quiz";
      id: string;
      queuedAt: number;
      quizId: string;
      answers: number[];
    }
  | {
      kind: "progress";
      id: string;
      queuedAt: number;
      experimentId: string;
      seconds?: number;
      completed?: boolean;
    }
  | {
      kind: "labSetup";
      id: string;
      queuedAt: number;
      clientKey: string;
      name: string;
      data: unknown;
      /** Bench seconds accumulated since the last queued entry (added on sync). */
      benchSeconds: number;
      completedLabs: string[];
    };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Listener = (pending: number) => void;
const listeners = new Set<Listener>();

async function readQueue(): Promise<OutboxEntry[]> {
  try {
    return (await get<OutboxEntry[]>(OUTBOX_KEY)) ?? [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: OutboxEntry[]): Promise<void> {
  try {
    await set(OUTBOX_KEY, queue);
  } catch {
    /* storage unavailable — the local record still holds the result */
  }
  listeners.forEach((fn) => fn(queue.length));
}

export function onOutboxChange(listener: Listener): () => void {
  listeners.add(listener);
  readQueue().then((q) => listener(q.length));
  return () => listeners.delete(listener);
}

export async function pendingCount(): Promise<number> {
  return (await readQueue()).length;
}

type NewEntry = OutboxEntry extends infer E
  ? E extends OutboxEntry
    ? Omit<E, "id" | "queuedAt">
    : never
  : never;

let mutation: Promise<unknown> = Promise.resolve();
function mutate<T>(operation: () => Promise<T>): Promise<T> {
  const next = mutation.then(operation, operation);
  mutation = next.catch(() => {});
  return next;
}

export async function enqueue(entry: NewEntry): Promise<void> {
  return mutate(async () => {
  const queue = await readQueue();
  // Coalesce lab setup saves so autosave never floods the queue.
  if (entry.kind === "labSetup") {
    const prev = queue.find(
      (e): e is Extract<OutboxEntry, { kind: "labSetup" }> =>
        e.kind === "labSetup" && e.clientKey === entry.clientKey,
    );
    if (prev) {
      prev.name = entry.name;
      prev.data = entry.data;
      prev.benchSeconds += entry.benchSeconds;
      prev.completedLabs = Array.from(new Set([...prev.completedLabs, ...entry.completedLabs]));
      prev.queuedAt = Date.now();
      prev.id = crypto.randomUUID();
      await writeQueue(queue);
      return;
    }
  }
  queue.push({
    ...entry,
    id: crypto.randomUUID(),
    queuedAt: Date.now(),
  } as OutboxEntry);
  await writeQueue(queue);
  });
}

async function send(entry: OutboxEntry): Promise<boolean> {
  try {
    if (entry.kind === "quiz") {
      const { error } = await supabase.rpc("grade_quiz", {
        _quiz_id: entry.quizId,
        _answers: entry.answers,
      });
      return !error;
    }

    if (entry.kind === "labSetup") {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = (supabase as any).from("lab_setups");
      const { data: existing } = await table
        .select("bench_seconds, completed_labs")
        .eq("user_id", uid)
        .eq("client_key", entry.clientKey)
        .maybeSingle();
      const labs = Array.from(new Set([...(existing?.completed_labs ?? []), ...entry.completedLabs]));
      const { error } = await (supabase as any).from("lab_setups").upsert(
        {
          user_id: uid,
          client_key: entry.clientKey,
          name: entry.name.slice(0, 120),
          data: entry.data,
          bench_seconds: (existing?.bench_seconds ?? 0) + Math.max(0, Math.round(entry.benchSeconds)),
          completed_labs: labs,
          updated_at: new Date(entry.queuedAt).toISOString(),
        },
        { onConflict: "user_id,client_key" },
      );
      return !error;
    }

    // Built-in modules use text ids that only live on the device; nothing to send.
    if (!UUID_RE.test(entry.experimentId)) return true;

    if (entry.seconds && entry.seconds > 0) {
      const { error } = await supabase.rpc("record_experiment_time", {
        _experiment_id: entry.experimentId,
        _seconds: Math.min(Math.round(entry.seconds), 86400),
      });
      if (error) return false;
    }
    if (entry.completed) {
      const { error } = await supabase.rpc("complete_experiment", {
        _experiment_id: entry.experimentId,
      });
      if (error) return false;
    }
    return true;
  } catch {
    return false;
  }
}

let flushing = false;

/** Flush the queue. Entries that fail stay queued for the next attempt. */
export async function flushOutbox(): Promise<{ sent: number; remaining: number }> {
  if (flushing || typeof navigator !== "undefined" && navigator.onLine === false) {
    const queue = await readQueue();
    return { sent: 0, remaining: queue.length };
  }

  flushing = true;
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const queue = await readQueue();
      return { sent: 0, remaining: queue.length };
    }

    const queue = await readQueue();
    let sent = 0;

    for (const entry of queue) {
      // eslint-disable-next-line no-await-in-loop -- order matters for progress
      const ok = await send(entry);
      if (ok) {
        sent += 1;
        await mutate(async () => {
          const current = await readQueue();
          await writeQueue(current.filter((item) => item.id !== entry.id));
        });
      }
    }

    return { sent, remaining: await pendingCount() };
  } finally {
    flushing = false;
  }
}

/** Attach reconnect listeners once, at app start. */
export function initOutboxSync(): () => void {
  if (typeof window === "undefined") return () => {};

  const onOnline = () => {
    void flushOutbox();
  };
  window.addEventListener("online", onOnline);
  const onVisible = () => {
    if (document.visibilityState === "visible" && navigator.onLine) void flushOutbox();
  };
  document.addEventListener("visibilitychange", onVisible);
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session && event === "SIGNED_IN") window.setTimeout(onOnline, 0);
  });
  const retry = window.setInterval(onOnline, 15_000);
  if (navigator.onLine) void flushOutbox();

  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisible);
    window.clearInterval(retry);
    subscription.unsubscribe();
  };
}

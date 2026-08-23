/**
 * `.vlb` — the VirtuLab Build file format.
 *
 * A `.vlb` file is a UTF-8 JSON document describing one builder experiment:
 * metadata, canvas mode, components, connections, variables, formulas and
 * scripts. A checksum over the payload lets us detect corrupted files, and the
 * `formatVersion` field allows migrating older files forward.
 */
import { z } from "zod";
import { validateScript } from "@/lib/scriptSandbox";

export const VLB_FORMAT_VERSION = 1;
export const VLB_EXTENSION = ".vlb";
export const VLB_MIME = "application/vnd.virtulab.experiment+json";

const MetadataSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(2000).default(""),
  author: z.string().max(120).optional(),
  createdAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  app: z.string().optional(),
});

const VariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  unit: z.string().optional(),
});

/** Components/connections vary by palette item, so they stay permissive records. */
const LooseRecord = z.record(z.unknown());

export const VlbFileSchema = z.object({
  format: z.literal("virtulab-experiment"),
  formatVersion: z.number().int().min(1),
  checksum: z.string().optional(),
  metadata: MetadataSchema,
  canvasMode: z.enum(["2d", "3d"]).default("2d"),
  components: z.array(LooseRecord).max(500).default([]),
  connections: z.array(LooseRecord).max(1000).default([]),
  variables: z.array(VariableSchema).max(100).default([]),
  formulas: z.array(LooseRecord).max(200).default([]),
  scripts: z.record(z.string().max(20000)).default({}),
});

export type VlbFile = z.infer<typeof VlbFileSchema>;

export interface VlbPayload {
  title: string;
  description?: string;
  author?: string;
  canvasMode: "2d" | "3d";
  components: unknown[];
  connections?: unknown[];
  variables?: VlbFile["variables"];
  formulas?: unknown[];
  scripts?: Record<string, string>;
}

/** Stable 32-bit FNV-1a hash of the canonical payload, hex encoded. */
export function checksumOf(file: Omit<VlbFile, "checksum">): string {
  const canonical = JSON.stringify({
    metadata: { title: file.metadata.title, description: file.metadata.description },
    canvasMode: file.canvasMode,
    components: file.components,
    connections: file.connections,
    variables: file.variables,
    formulas: file.formulas,
    scripts: file.scripts,
  });

  let hash = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function createVlbFile(payload: VlbPayload): VlbFile {
  const now = new Date().toISOString();
  const base: Omit<VlbFile, "checksum"> = {
    format: "virtulab-experiment",
    formatVersion: VLB_FORMAT_VERSION,
    metadata: {
      title: payload.title || "Untitled experiment",
      description: payload.description ?? "",
      author: payload.author,
      createdAt: now,
      modifiedAt: now,
      app: "VirtuLab",
    },
    canvasMode: payload.canvasMode,
    components: (payload.components ?? []) as Record<string, unknown>[],
    connections: (payload.connections ?? []) as Record<string, unknown>[],
    variables: payload.variables ?? [],
    formulas: (payload.formulas ?? []) as Record<string, unknown>[],
    scripts: payload.scripts ?? {},
  };
  return { ...base, checksum: checksumOf(base) };
}

export function serializeVlb(payload: VlbPayload): string {
  return JSON.stringify(createVlbFile(payload), null, 2);
}

export function vlbFileName(title: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "experiment";
  return `${slug}${VLB_EXTENSION}`;
}

export type VlbParseResult =
  | { ok: true; file: VlbFile; warnings: string[] }
  | { ok: false; error: string };

/** Forward-migrate older documents to the current shape. */
function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  const version = Number(raw.formatVersion ?? 0);
  const next = { ...raw };
  if (version === 0) {
    // Pre-versioned builder exports: plain { title, components, ... }
    next.format = "virtulab-experiment";
    next.formatVersion = VLB_FORMAT_VERSION;
    next.metadata = next.metadata ?? {
      title: typeof raw.title === "string" ? raw.title : "Imported experiment",
      description: typeof raw.description === "string" ? raw.description : "",
    };
    next.canvasMode = raw.canvasMode === "3d" ? "3d" : "2d";
  }
  return next;
}

export function parseVlb(text: string): VlbParseResult {
  if (text.length > 5_000_000) {
    return { ok: false, error: "This .vlb file is too large to open (limit 5 MB)." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file isn't valid .vlb — the JSON could not be read." };
  }
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "This file isn't a VirtuLab experiment." };
  }

  const migrated = migrate(raw as Record<string, unknown>);
  if (Number(migrated.formatVersion) > VLB_FORMAT_VERSION) {
    return {
      ok: false,
      error: `This experiment was saved by a newer version of VirtuLab (format v${migrated.formatVersion}). Update the app to open it.`,
    };
  }

  const parsed = VlbFileSchema.safeParse(migrated);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: `This .vlb file is malformed: ${first?.path.join(".") || "document"} — ${first?.message ?? "unexpected shape"}.`,
    };
  }

  const file = parsed.data;
  const warnings: string[] = [];

  if (file.checksum && file.checksum !== checksumOf({ ...file, checksum: undefined } as VlbFile)) {
    warnings.push("Checksum mismatch — the file may have been edited outside VirtuLab.");
  }

  // Imported scripts must clear the same sandbox rules as hand-written ones.
  for (const [name, source] of Object.entries(file.scripts)) {
    const result = validateScript(source);
    if (!result.valid) {
      warnings.push(`Script "${name}" was blocked: ${result.error}`);
      file.scripts[name] = `// Blocked on import: ${result.error}\n`;
    }
  }

  return { ok: true, file, warnings };
}

export function downloadVlb(payload: VlbPayload): void {
  const blob = new Blob([serializeVlb(payload)], { type: VLB_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = vlbFileName(payload.title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readVlbFile(file: File): Promise<VlbParseResult> {
  try {
    return parseVlb(await file.text());
  } catch {
    return { ok: false, error: "The file could not be read." };
  }
}

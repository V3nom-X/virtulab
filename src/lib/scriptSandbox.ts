/**
 * Sandbox utilities for user-authored simulation scripts.
 *
 * Scripts are validated with a deny-list of capability escapes and a hard size
 * limit, then executed inside a Web Worker whose global scope has been stripped
 * of network, storage, timer and worker APIs before the script runs. Execution
 * is time-boxed so a runaway loop can never freeze the tab.
 */

export const MAX_SCRIPT_LENGTH = 8000;
export const SCRIPT_TIMEOUT_MS = 3000;

const BLOCKED_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\beval\s*\(/i, label: 'eval()' },
  { re: /\bFunction\s*\(/i, label: 'Function()' },
  { re: /\bconstructor\b/i, label: 'constructor access' },
  { re: /\bset(Timeout|Interval|Immediate)\s*\(/i, label: 'timers' },
  { re: /\bqueueMicrotask\s*\(/i, label: 'queueMicrotask()' },
  { re: /\bfetch\s*\(/i, label: 'fetch()' },
  { re: /\bXMLHttpRequest\b/i, label: 'XMLHttpRequest' },
  { re: /\bWebSocket\b/i, label: 'WebSocket' },
  { re: /\bEventSource\b/i, label: 'EventSource' },
  { re: /\bimportScripts\s*\(/i, label: 'importScripts()' },
  { re: /\bimport\s*\(/i, label: 'dynamic import()' },
  { re: /\brequire\s*\(/i, label: 'require()' },
  { re: /\bpostMessage\s*\(/i, label: 'postMessage()' },
  { re: /\b(local|session)Storage\b/i, label: 'web storage' },
  { re: /\bindexedDB\b/i, label: 'indexedDB' },
  { re: /\bcaches\b/i, label: 'Cache API' },
  { re: /\bnavigator\b/i, label: 'navigator' },
  { re: /\bcrypto\b/i, label: 'crypto' },
  { re: /\bdocument\b/i, label: 'document' },
  { re: /\bwindow\b/i, label: 'window' },
  { re: /\bglobalThis\b/i, label: 'globalThis' },
  { re: /\bself\s*[.[]/i, label: 'worker global scope' },
  { re: /\bnew\s+Worker\s*\(/i, label: 'Worker' },
  { re: /\bSharedArrayBuffer\b/i, label: 'SharedArrayBuffer' },
  { re: /\bAtomics\b/i, label: 'Atomics' },
  { re: /\bwhile\s*\(\s*true\s*\)/i, label: 'infinite loop' },
];

export interface ValidationResult { valid: boolean; error?: string }

export function validateScript(code: string): ValidationResult {
  if (typeof code !== 'string' || code.trim().length === 0) {
    return { valid: false, error: 'Script is empty.' };
  }
  if (code.length > MAX_SCRIPT_LENGTH) {
    return {
      valid: false,
      error: `Script exceeds the maximum allowed length (${MAX_SCRIPT_LENGTH.toLocaleString()} characters).`,
    };
  }
  for (const { re, label } of BLOCKED_PATTERNS) {
    if (re.test(code)) {
      return {
        valid: false,
        error: `Blocked pattern detected: ${label}. Only simulation math and the "vars" object are allowed.`,
      };
    }
  }
  return { valid: true };
}

/** Worker prelude: removes escape hatches from the worker global scope, then syntax-checks and runs the script. */
const WORKER_SOURCE = `
  (function () {
    var strip = [
      'fetch','XMLHttpRequest','WebSocket','EventSource','importScripts','Worker',
      'indexedDB','caches','localStorage','sessionStorage','navigator','crypto',
      'setTimeout','setInterval','queueMicrotask','SharedArrayBuffer','Atomics'
    ];
    for (var i = 0; i < strip.length; i++) {
      try { delete self[strip[i]]; } catch (e) { /* non-configurable */ }
      try { self[strip[i]] = undefined; } catch (e) { /* frozen */ }
    }
    var post = self.postMessage.bind(self);
    self.onmessage = function (e) {
      var code = e.data && e.data.code;
      var variables = (e.data && e.data.variables) || {};
      try {
        var sandbox = Object.freeze(Object.assign({}, variables));
        // eslint-disable-next-line no-new-func
        var fn = new Function('vars', '"use strict";' + code);
        var result = fn(sandbox);
        post({ success: true, result: result === undefined ? null : JSON.parse(JSON.stringify(result)) });
      } catch (err) {
        post({ success: false, error: (err && err.message) || 'Execution error' });
      }
    };
  })();
`;

export interface RunResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

/** Runs a validated script in a throwaway sandboxed worker. Always resolves. */
export function runScriptInWorker(
  code: string,
  variables: Record<string, number>,
  timeoutMs = SCRIPT_TIMEOUT_MS,
): { promise: Promise<RunResult>; cancel: () => void } {
  const validation = validateScript(code);
  if (!validation.valid) {
    return {
      promise: Promise.resolve({ success: false, error: validation.error }),
      cancel: () => {},
    };
  }

  const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
  const worker = new Worker(url);
  let settled = false;

  const cleanup = () => {
    worker.terminate();
    URL.revokeObjectURL(url);
  };

  const promise = new Promise<RunResult>((resolve) => {
    const finish = (res: RunResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(res);
    };

    const timer = setTimeout(
      () => finish({ success: false, error: 'Script execution timed out.' }),
      timeoutMs,
    );

    worker.onmessage = (e: MessageEvent<RunResult>) => {
      clearTimeout(timer);
      finish(e.data);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      finish({ success: false, error: e.message || 'Worker error' });
    };

    worker.postMessage({ code, variables });
  });

  return { promise, cancel: () => { settled = true; cleanup(); } };
}

// Workbench memory — the profile persists in the browser's localStorage (auth-free; no account,
// no password). This is OPERATIONAL CONFIG, not lead PII, so client storage is appropriate and
// privacy-preserving (it never leaves the browser). `schemaVersion` guards forward-compat.
// A storage object is injectable so the logic is unit-testable without a DOM.

import { type CompanyProfile } from './profile';

const KEY = 'recc:workbench:profile';

type Storageish = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStore(): Storageish | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: CompanyProfile, s: Storageish | null = defaultStore()): void {
  if (!s) return;
  try {
    s.setItem(KEY, JSON.stringify(p));
  } catch {
    /* quota / private mode — ignore */
  }
}

/** Load the saved profile, or null if absent / a different schema version (discarded safely). */
export function loadProfile(s: Storageish | null = defaultStore()): CompanyProfile | null {
  if (!s) return null;
  try {
    const raw = s.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<CompanyProfile>;
    return p && p.schemaVersion === 1 ? (p as CompanyProfile) : null;
  } catch {
    return null;
  }
}

export function clearProfile(s: Storageish | null = defaultStore()): void {
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// ---- B1: file-based portability (export / import the profile as JSON) ----
// Solves the "multi-CN hand-entry + lost on a new laptop" pain without an account.

export function exportProfileJson(p: CompanyProfile): string {
  return JSON.stringify(p, null, 2);
}

/** Parse + validate an imported profile JSON string. null if invalid / wrong schema version. */
export function parseProfile(text: string): CompanyProfile | null {
  try {
    const p = JSON.parse(text) as Partial<CompanyProfile>;
    if (!p || p.schemaVersion !== 1 || !Array.isArray(p.facilities) || !Array.isArray(p.cbamProducts)) return null;
    return p as CompanyProfile;
  } catch {
    return null;
  }
}

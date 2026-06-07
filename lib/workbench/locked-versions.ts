// C3 — assurance / freeze: lock a profile as a verified inventory version. After verification an
// inventory should be FROZEN, named, signed and timestamped — and kept as a change trail. This is a
// self-attested local record (NOT third-party assurance); it captures a JSON copy of the profile so
// the figure can be restored / compared later.

import { footprintSummary } from './scope3';
import type { CompanyProfile } from './profile';

const KEY = 'recc:workbench:locked';
const MAX = 40;

export interface LockedVersion {
  id: string;
  at: string; // ISO timestamp the version was frozen
  label: string; // e.g. 「FY2025 已查證版」
  signedBy: string; // self-attested signer (preparer/approver)
  year: number;
  footprintTonnes: number;
  scope12Tonnes: number;
  scope3Tonnes: number;
  profileJson: string; // frozen copy of the profile at lock time
}

type Storageish = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function defaultStore(): Storageish | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** Freeze a profile into a LockedVersion (id + at injected for determinism in tests). */
export function lockVersion(profile: CompanyProfile, label: string, signedBy: string, id: string, at: string): LockedVersion {
  const fp = footprintSummary(profile);
  return {
    id,
    at,
    label: label || `FY${profile.year}`,
    signedBy,
    year: profile.year,
    footprintTonnes: fp.total,
    scope12Tonnes: fp.scope12,
    scope3Tonnes: fp.scope3,
    profileJson: JSON.stringify(profile),
  };
}

export function loadLockedVersions(s: Storageish | null = defaultStore()): LockedVersion[] {
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as LockedVersion[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function appendLockedVersion(v: LockedVersion, s: Storageish | null = defaultStore()): LockedVersion[] {
  const list = [v, ...loadLockedVersions(s)].slice(0, MAX);
  if (s) {
    try {
      s.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  return list;
}

export function removeLockedVersion(id: string, s: Storageish | null = defaultStore()): LockedVersion[] {
  const list = loadLockedVersions(s).filter((v) => v.id !== id);
  if (s) {
    try {
      s.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  return list;
}

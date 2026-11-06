import type { ScoreBreakdown } from "./types";
import { MAX_TOTAL_SCORE } from "./types";

export type LeaderboardRow = {
  id: string;
  display_name: string;
  total: number;
  breakdown: ScoreBreakdown;
  created_at: string;
};

const LOCAL_KEY = "ekumen-leaderboard-local";

/** Personas de muestra para que el ranking no arranque vacío. */
export const MOCK_SCORES: LeaderboardRow[] = [
  {
    id: "mock-sofi",
    display_name: "Sofi",
    total: 846,
    breakdown: { think: 220, together: 210, happen: 206, deliver: 210 },
    created_at: "2026-11-01T12:00:00.000Z",
  },
  {
    id: "mock-martin",
    display_name: "Martín",
    total: 781,
    breakdown: { think: 198, together: 205, happen: 190, deliver: 188 },
    created_at: "2026-11-02T15:30:00.000Z",
  },
];

function supabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function isLeaderboardConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey());
}

export function sanitizeName(raw: string) {
  return raw.trim().replace(/\s+/g, " ").slice(0, 24);
}

function readLocal(): LeaderboardRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: LeaderboardRow[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(0, 50)));
}

/** Ranking local (siempre disponible). */
export function fetchLocalScores(limit = 10): LeaderboardRow[] {
  return [...readLocal()]
    .sort((a, b) => b.total - a.total || a.created_at.localeCompare(b.created_at))
    .slice(0, limit);
}

function saveLocalScore(input: {
  displayName: string;
  total: number;
  breakdown: ScoreBreakdown;
}): LeaderboardRow {
  const row: LeaderboardRow = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    display_name: sanitizeName(input.displayName),
    total: Math.round(input.total),
    breakdown: input.breakdown,
    created_at: new Date().toISOString(),
  };
  const next = [row, ...readLocal()].slice(0, 50);
  writeLocal(next);
  return row;
}

function withMocks(rows: LeaderboardRow[], limit: number) {
  const names = new Set(rows.map((row) => row.display_name.toLowerCase()));
  const extras = MOCK_SCORES.filter((row) => !names.has(row.display_name.toLowerCase()));
  return [...rows, ...extras]
    .sort((a, b) => b.total - a.total || a.created_at.localeCompare(b.created_at))
    .slice(0, limit);
}

async function fetchRemoteScores(limit: number): Promise<LeaderboardRow[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseKey();
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/scores?select=id,display_name,total,breakdown,created_at&order=total.desc,created_at.asc&limit=${limit}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as LeaderboardRow[];
  } catch {
    return null;
  }
}

async function submitRemote(input: {
  displayName: string;
  total: number;
  breakdown: ScoreBreakdown;
}): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseKey();
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/rest/v1/scores`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        display_name: sanitizeName(input.displayName),
        total: Math.round(input.total),
        breakdown: input.breakdown,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchTopScores(limit = 10): Promise<LeaderboardRow[]> {
  const remote = await fetchRemoteScores(limit);
  if (remote) return withMocks(remote, limit);
  return withMocks(fetchLocalScores(limit), limit);
}

export async function submitScore(input: {
  displayName: string;
  total: number;
  breakdown: ScoreBreakdown;
}): Promise<{ ok: boolean; remote: boolean; error?: string }> {
  const name = sanitizeName(input.displayName);
  if (name.length < 2) {
    return { ok: false, remote: false, error: "El nombre debe tener al menos 2 caracteres." };
  }
  if (input.total < 0 || input.total > MAX_TOTAL_SCORE) {
    return { ok: false, remote: false, error: "Puntaje inválido." };
  }

  // Siempre guardamos local: la experiencia funciona sin Supabase.
  saveLocalScore({ ...input, displayName: name });

  if (!isLeaderboardConfigured()) {
    return { ok: true, remote: false };
  }

  const remoteOk = await submitRemote({ ...input, displayName: name });
  return {
    ok: true,
    remote: remoteOk,
    error: remoteOk ? undefined : "Se guardó en este dispositivo; el ranking remoto no respondió.",
  };
}

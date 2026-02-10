export interface CookieGameState {
  v: string;           // visitor UUID (generated once, persists forever)
  d: string;           // date "2026-02-09" — which question this state is for
  g: number[];         // raw guess values [5000, 20, 35]
  r: "p" | "w" | "l"; // playing / win / loss
  sk: number;          // current streak
  sl: number;          // longest streak
  gp: number;          // games played
  ld: string;          // last date completed (streak continuity check)
}

const COOKIE_NAME = "guesstimate_state";
const MAX_AGE = 400 * 24 * 60 * 60; // 400 days in seconds

/**
 * Reads and parses the game state cookie.
 * Returns null if no cookie exists or JSON is invalid.
 */
export function getGameState(): CookieGameState | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const value = decodeURIComponent(cookie.split("=")[1]);
    return JSON.parse(value) as CookieGameState;
  } catch {
    return null;
  }
}

/**
 * Serializes and saves the game state cookie.
 * Cookie persists for 400 days (max allowed), SameSite=Lax.
 */
export function setGameState(state: CookieGameState): void {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

/**
 * Deletes the game state cookie by setting max-age=0.
 */
export function clearGameState(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Generates a visitor UUID using crypto.randomUUID().
 */
export function genVisitorId(): string {
  return crypto.randomUUID();
}

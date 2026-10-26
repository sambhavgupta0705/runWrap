// Tiny in-memory TTL cache with in-flight de-duplication (so React strict-mode
// double fetches and parallel routes share one Strava call). Per server instance;
// swap for the database cache when Postgres lands. Failures are never cached.
const store = new Map<string, { at: number; value: Promise<unknown> }>();

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>;
  const value = fn();
  store.set(key, { at: Date.now(), value });
  value.catch(() => store.delete(key));
  return value;
}

/** Drops every cached entry whose key contains `fragment` (e.g. an athlete id). */
export function clearMatching(fragment: string): void {
  for (const k of store.keys()) if (k.includes(fragment)) store.delete(k);
}

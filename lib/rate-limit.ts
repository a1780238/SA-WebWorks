const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

const ipBuckets = new Map<string, number[]>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const values = (ipBuckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (values.length >= MAX_PER_WINDOW) {
    ipBuckets.set(key, values);
    return false;
  }
  values.push(now);
  ipBuckets.set(key, values);
  return true;
}

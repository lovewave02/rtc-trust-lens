export function normalizeNetworkScore(jitter: number, loss: number) {
  const score = Math.max(0, 100 - jitter * 2 - loss * 5);
  return Math.round(score);
}

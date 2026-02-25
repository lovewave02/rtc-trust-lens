export interface TrustMetrics {
  jitterMs: number;
  packetLossPct: number;
  bitrateKbps: number;
  score: number;
  integrityState: 'ok' | 'warning' | 'critical';
}

export function normalizeNetworkScore(jitter: number, loss: number): number {
  const score = Math.max(0, 100 - jitter * 2 - loss * 5);
  return Math.round(score);
}

export function computeTrustMetrics(jitterMs: number, packetLossPct: number, bitrateKbps: number): TrustMetrics {
  const score = normalizeNetworkScore(jitterMs, packetLossPct);
  const integrityState = score >= 75 ? 'ok' : score >= 45 ? 'warning' : 'critical';

  return {
    jitterMs: Number(jitterMs.toFixed(1)),
    packetLossPct: Number(packetLossPct.toFixed(2)),
    bitrateKbps: Number(bitrateKbps.toFixed(1)),
    score,
    integrityState
  };
}

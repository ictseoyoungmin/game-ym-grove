export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (safe < 1000) return Math.floor(safe).toString();
  if (safe < 1_000_000) return `${(safe / 1000).toFixed(1)}K`;
  return `${(safe / 1_000_000).toFixed(1)}M`;
}

export function formatRate(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return safe.toFixed(safe >= 10 ? 1 : 2);
}

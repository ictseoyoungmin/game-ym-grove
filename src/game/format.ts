export function formatNumber(value: number): string {
  if (value < 1000) return Math.floor(value).toString();
  if (value < 1_000_000) return `${(value / 1000).toFixed(1)}K`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export function formatRate(value: number): string {
  return value.toFixed(value >= 10 ? 1 : 2);
}

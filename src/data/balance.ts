export const balance = {
  tapSpark: 1,
  // v0.1 uses Core Ym's variant effect as the starting passive production source.
  baseSparkPerSecond: 0,
  growCostSpark: 20,
  evolutionBaseCostSpark: 300,
  offlineCapMs: 1000 * 60 * 60 * 8,
  hintCostInsight: 5,
} as const;

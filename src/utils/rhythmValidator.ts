export const validateRhythm = (
  userTaps: { timestamp: number; interval: number | null }[],
  pattern: number[]
): boolean => {
  if (userTaps.length < pattern.length) return false;

  // Calculate intervals between taps
  const userIntervals = userTaps
    .slice(1)
    .map((tap, i) => tap.timestamp - userTaps[i].timestamp);

  // Normalize intervals to account for tempo differences
  const normalizedUserIntervals = normalizeIntervals(userIntervals);
  const normalizedPattern = normalizeIntervals(pattern);

  // Compare patterns with tolerance
  const tolerance = 0.2; // 20% tolerance for human variation
  const isValid = normalizedUserIntervals.every((interval, i) => {
    const target = normalizedPattern[i];
    return Math.abs(interval - target) <= tolerance;
  });

  // Check for too-perfect timing (bot detection)
  const variance = calculateVariance(userIntervals);
  const isTooPerfect = variance < 0.001; // Threshold for detecting mechanical precision

  return isValid && !isTooPerfect;
};

const normalizeIntervals = (intervals: number[]): number[] => {
  const sum = intervals.reduce((a, b) => a + b, 0);
  return intervals.map((interval) => interval / sum);
};

const calculateVariance = (intervals: number[]): number => {
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const squaredDiffs = intervals.map((x) => Math.pow(x - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length;
};
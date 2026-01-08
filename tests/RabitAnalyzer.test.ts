import { describe, expect, it } from "vitest";
import { RabitAnalyzer, RabitDataPoint, RabitPatternStep } from "../src/lib/RabitAnalyzer";

const buildSegment = (
  startTimeSec: number,
  durationSec: number,
  speed: (offset: number) => number,
  heartRate: (offset: number) => number,
): RabitDataPoint[] =>
  Array.from({ length: durationSec + 1 }, (_, index) => ({
    timestampSec: startTimeSec + index,
    speedKmh: speed(index),
    heartRate: heartRate(index),
  }));

const concatSegments = (segments: RabitDataPoint[][]) => segments.flat();

const constant = (value: number) => () => value;

const pattern: RabitPatternStep[] = [
  { name: "Step 1", durationSec: 60 },
  { name: "Step 2", durationSec: 60 },
  { name: "Step 3", durationSec: 60 },
];

describe("RabitAnalyzer active island detection", () => {
  it("smooths speeds using the configured SMA window", () => {
    const points = buildSegment(0, 4, (offset) => offset * 2, constant(100));
    const analyzer = new RabitAnalyzer({ smoothingWindowSec: 2 });

    const smoothed = analyzer.smoothSpeeds(points);

    expect(smoothed).toEqual([0, 1, 2, 4, 6]);
  });

  it("splits islands when rest exceeds 30 seconds", () => {
    const active1 = buildSegment(0, 60, constant(5), constant(120));
    const rest = buildSegment(61, 40, constant(1.5), constant(90));
    const active2 = buildSegment(102, 60, constant(6), constant(130));
    const points = concatSegments([active1, rest, active2]);

    const analyzer = new RabitAnalyzer({
      pattern: pattern.slice(0, 2),
      restSpeedKmh: 2,
      restDurationSec: 30,
    });

    const islands = analyzer.detectActiveIslands(points);

    expect(islands).toHaveLength(2);
    expect(islands[0].durationSec).toBeCloseTo(60, 2);
    expect(islands[1].durationSec).toBeCloseTo(60, 2);
  });

  it("keeps a single island when rest is too short", () => {
    const active1 = buildSegment(0, 60, constant(5), constant(120));
    const rest = buildSegment(61, 20, constant(1.5), constant(90));
    const active2 = buildSegment(82, 60, constant(6), constant(130));
    const points = concatSegments([active1, rest, active2]);

    const analyzer = new RabitAnalyzer({
      pattern: pattern.slice(0, 1),
      restSpeedKmh: 2,
      restDurationSec: 30,
    });

    const islands = analyzer.detectActiveIslands(points);

    expect(islands).toHaveLength(1);
    expect(islands[0].durationSec).toBeCloseTo(142, 2);
  });
});

describe("RabitAnalyzer pattern matching and metrics", () => {
  it("fails when pattern tolerance is exceeded", () => {
    const longStep = buildSegment(0, 90, constant(5), constant(120));
    const rest = buildSegment(91, 40, constant(1), constant(90));
    const shortStep = buildSegment(132, 60, constant(5), constant(120));
    const points = concatSegments([longStep, rest, shortStep]);

    const analyzer = new RabitAnalyzer({
      pattern: pattern.slice(0, 2),
      patternTolerance: 0.2,
    });

    const result = analyzer.matchPattern(points);

    expect(result.status).toBe("failure");
  });

  it("computes last-60s metrics and step 3 onset acceleration", () => {
    const step1 = buildSegment(0, 60, constant(8), constant(120));
    const rest1 = buildSegment(61, 40, constant(1), constant(90));
    const step2 = buildSegment(102, 60, constant(9), constant(125));
    const rest2 = buildSegment(163, 40, constant(1), constant(90));
    const step3 = buildSegment(
      204,
      60,
      (offset) => 10 + (6 * Math.min(offset, 30)) / 30,
      constant(130),
    );

    const points = concatSegments([step1, rest1, step2, rest2, step3]);

    const analyzer = new RabitAnalyzer({
      pattern,
      restSpeedKmh: 2,
      restDurationSec: 30,
    });

    const result = analyzer.analyze(points);

    if (result.status === "failure") {
      throw new Error(result.reason);
    }

    const step3Metrics = result.steps[2].metrics;
    expect(step3Metrics.avgSpeedKmh).toBeCloseTo(13, 1);
    expect(step3Metrics.maxHeartRate).toBe(130);
    expect(step3Metrics.heartRateStdev).toBeCloseTo(0, 5);
    expect(step3Metrics.onsetAccelerationKmhPerSec).toBeCloseTo(0.2, 2);
    expect(step3Metrics.unstablePacing).toBe(false);
  });

  it("flags unstable pacing when speed variance is high", () => {
    const step = buildSegment(
      0,
      60,
      (offset) => (offset % 2 === 0 ? 8 : 16),
      constant(120)
    );

    const analyzer = new RabitAnalyzer({
      pattern: [{ name: "Step 1", durationSec: 60 }],
    });

    const result = analyzer.analyze(step);

    if (result.status === "failure") {
      throw new Error(result.reason);
    }

    expect(result.steps[0].metrics.unstablePacing).toBe(true);
  });
});

export type RabitDataPoint = {
  timestampSec: number;
  speedKmh: number;
  heartRate: number;
};

export type RabitPatternStep = {
  name: string;
  durationSec: number;
};

export type ActiveIsland = {
  startIndex: number;
  endIndex: number;
  startTimeSec: number;
  endTimeSec: number;
  durationSec: number;
};

export type StepWindow = ActiveIsland & {
  name: string;
};

export type StepMetrics = {
  avgSpeedKmh: number;
  avgHeartRate: number;
  maxHeartRate: number;
  heartRateStdev: number;
  unstablePacing: boolean;
  onsetAccelerationKmhPerSec?: number;
};

export type AnalysisStep = {
  window: StepWindow;
  metrics: StepMetrics;
};

export type AnalysisSuccess = {
  status: "ok";
  steps: AnalysisStep[];
};

export type AnalysisFailure = {
  status: "failure";
  reason: string;
};

export type RabitAnalysis = AnalysisSuccess | AnalysisFailure;

export type RabitAnalyzerOptions = {
  pattern?: RabitPatternStep[];
  smoothingWindowSec?: number;
  restSpeedKmh?: number;
  restDurationSec?: number;
  patternTolerance?: number;
  unstablePacingCv?: number;
};

const DEFAULT_PATTERN: RabitPatternStep[] = [
  { name: "Step 1", durationSec: 180 },
  { name: "Step 2", durationSec: 240 },
  { name: "Step 3", durationSec: 180 },
];

const DEFAULT_OPTIONS: Required<RabitAnalyzerOptions> = {
  pattern: DEFAULT_PATTERN,
  smoothingWindowSec: 5,
  restSpeedKmh: 2,
  restDurationSec: 30,
  patternTolerance: 0.2,
  unstablePacingCv: 0.12,
};

const epsilon = 1e-6;

const toRequired = (options?: RabitAnalyzerOptions): Required<RabitAnalyzerOptions> => ({
  ...DEFAULT_OPTIONS,
  ...options,
});

const clampMin = (value: number, min: number) => (value < min ? min : value);

const stdev = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

export class RabitAnalyzer {
  private readonly options: Required<RabitAnalyzerOptions>;

  constructor(options?: RabitAnalyzerOptions) {
    this.options = toRequired(options);
  }

  smoothSpeeds(points: RabitDataPoint[]): number[] {
    const { smoothingWindowSec } = this.options;
    const smoothed: number[] = [];
    let windowStart = 0;
    let windowSum = 0;
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      windowSum += current.speedKmh;
      while (
        points[index].timestampSec - points[windowStart].timestampSec >
        smoothingWindowSec
      ) {
        windowSum -= points[windowStart].speedKmh;
        windowStart += 1;
      }
      const windowSize = index - windowStart + 1;
      smoothed.push(windowSum / clampMin(windowSize, 1));
    }
    return smoothed;
  }

  detectActiveIslands(points: RabitDataPoint[]): ActiveIsland[] {
    if (points.length === 0) {
      return [];
    }
    const { restDurationSec, restSpeedKmh } = this.options;
    const smoothed = this.smoothSpeeds(points);
    const islands: ActiveIsland[] = [];
    let islandStart = 0;
    let restStart: number | null = null;

    for (let index = 0; index < points.length; index += 1) {
      const speed = smoothed[index];
      if (speed < restSpeedKmh) {
        if (restStart === null) {
          restStart = index;
        }
        const restDuration =
          points[index].timestampSec - points[restStart].timestampSec;
        if (restDuration >= restDurationSec) {
          const islandEnd = restStart - 1;
          if (islandEnd >= islandStart) {
            islands.push(this.buildIsland(points, islandStart, islandEnd));
          }
          islandStart = index + 1;
        }
      } else if (restStart !== null) {
        const restDuration =
          points[index].timestampSec - points[restStart].timestampSec;
        if (restDuration >= restDurationSec) {
          islandStart = index;
        }
        restStart = null;
      }
    }

    if (islandStart < points.length) {
      islands.push(this.buildIsland(points, islandStart, points.length - 1));
    }

    return islands.filter((island) => island.durationSec > epsilon);
  }

  matchPattern(points: RabitDataPoint[]):
    | { status: "ok"; steps: StepWindow[] }
    | AnalysisFailure {
    const { pattern, patternTolerance } = this.options;
    const islands = this.detectActiveIslands(points);

    if (islands.length !== pattern.length) {
      return {
        status: "failure",
        reason: `Expected ${pattern.length} active islands, found ${islands.length}.`,
      };
    }

    const steps: StepWindow[] = [];
    for (let index = 0; index < pattern.length; index += 1) {
      const expected = pattern[index];
      const island = islands[index];
      const toleranceWindow = expected.durationSec * patternTolerance;
      const minDuration = expected.durationSec - toleranceWindow;
      const maxDuration = expected.durationSec + toleranceWindow;
      if (island.durationSec < minDuration || island.durationSec > maxDuration) {
        return {
          status: "failure",
          reason: `${expected.name} duration ${island.durationSec.toFixed(
            1,
          )}s outside tolerance ${minDuration.toFixed(1)}-${maxDuration.toFixed(
            1,
          )}s.`,
        };
      }
      steps.push({ ...island, name: expected.name });
    }

    return { status: "ok", steps };
  }

  analyze(points: RabitDataPoint[]): RabitAnalysis {
    const match = this.matchPattern(points);
    if (match.status === "failure") {
      return match;
    }
    const steps = match.steps.map((step, index) => ({
      window: step,
      metrics: this.computeMetrics(points, step, index),
    }));
    return { status: "ok", steps };
  }

  private buildIsland(
    points: RabitDataPoint[],
    startIndex: number,
    endIndex: number,
  ): ActiveIsland {
    const startTimeSec = points[startIndex].timestampSec;
    const endTimeSec = points[endIndex].timestampSec;
    return {
      startIndex,
      endIndex,
      startTimeSec,
      endTimeSec,
      durationSec: endTimeSec - startTimeSec,
    };
  }

  private computeMetrics(
    points: RabitDataPoint[],
    window: StepWindow,
    stepIndex: number,
  ): StepMetrics {
    const { unstablePacingCv } = this.options;
    const startTime = window.startTimeSec;
    const endTime = window.endTimeSec;
    const last60Start = Math.max(startTime, endTime - 60);

    const last60Points = points.filter(
      (point) =>
        point.timestampSec >= last60Start && point.timestampSec <= endTime,
    );

    const speeds = last60Points.map((point) => point.speedKmh);
    const heartRates = last60Points.map((point) => point.heartRate);

    const avgSpeed =
      speeds.reduce((sum, value) => sum + value, 0) / clampMin(speeds.length, 1);
    const avgHeartRate =
      heartRates.reduce((sum, value) => sum + value, 0) /
      clampMin(heartRates.length, 1);
    const maxHeartRate =
      heartRates.length === 0 ? 0 : Math.max(...heartRates);
    const heartRateStdev = stdev(heartRates);

    const speedStdev = stdev(speeds);
    const unstablePacing =
      avgSpeed > epsilon && speedStdev / avgSpeed > unstablePacingCv;

    const metrics: StepMetrics = {
      avgSpeedKmh: avgSpeed,
      avgHeartRate,
      maxHeartRate,
      heartRateStdev,
      unstablePacing,
    };

    if (stepIndex === 2) {
      const onsetEnd = startTime + 30;
      const onsetPoints = points.filter(
        (point) =>
          point.timestampSec >= startTime && point.timestampSec <= onsetEnd,
      );
      if (onsetPoints.length >= 2) {
        const first = onsetPoints[0];
        const last = onsetPoints[onsetPoints.length - 1];
        const duration = clampMin(last.timestampSec - first.timestampSec, 1);
        metrics.onsetAccelerationKmhPerSec =
          (last.speedKmh - first.speedKmh) / duration;
      } else {
        metrics.onsetAccelerationKmhPerSec = 0;
      }
    }

    return metrics;
  }
}

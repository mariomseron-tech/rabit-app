import { DataPoint, RabitMetrics, StepMetrics, StepSegment, StepType } from '../types/rabit';
import { movingAverage, standardDeviation } from '../utils/movingAverage';

const REST_SPEED_THRESHOLD = 2.0;
const REST_MIN_DURATION_S = 30;
const SMA_WINDOW_S = 5;
const LAST_MINUTE_WINDOW_S = 60;
const ONSET_WINDOW_S = 30;

const STEP_TOLERANCE = 0.2;
const STEP_SEQUENCE: Array<{ type: StepType; duration: number }>= [
  { type: 'warmup', duration: 600 },
  { type: 'ant', duration: 300 },
  { type: 'max', duration: 180 },
  { type: 'aert', duration: 600 },
];

interface Island {
  startIndex: number;
  endIndex: number;
  duration: number;
}

export class RabitAnalyzer {
  private readonly records: DataPoint[];

  constructor(records: DataPoint[]) {
    this.records = records;
  }

  autoDetectSteps(): StepSegment[] {
    const smoothedSpeed = movingAverage(
      this.records.map((record) => record.speed),
      SMA_WINDOW_S,
    );

    const restIslands = this.findRestIslands(smoothedSpeed);
    const activeIslands = this.findActiveIslands(restIslands);

    const steps: StepSegment[] = [];
    const candidates = activeIslands.slice(0, STEP_SEQUENCE.length);

    if (candidates.length !== STEP_SEQUENCE.length) {
      return [];
    }

    const matches = candidates.every((candidate, index) => {
      const expected = STEP_SEQUENCE[index];
      return this.isWithinTolerance(candidate.duration, expected.duration, STEP_TOLERANCE);
    });

    if (!matches) {
      return [];
    }

    candidates.forEach((candidate, index) => {
      steps.push({
        type: STEP_SEQUENCE[index].type,
        startIndex: candidate.startIndex,
        endIndex: candidate.endIndex,
      });
    });

    return steps;
  }

  calculateMetrics(steps: StepSegment[]): RabitMetrics | null {
    const stepMap = new Map<StepType, StepMetrics>();

    steps.forEach((step) => {
      const stepData = this.records.slice(step.startIndex, step.endIndex + 1);
      const metrics = this.calculateStepMetrics(stepData, step.type);
      stepMap.set(step.type, metrics);
    });

    const warmup = stepMap.get('warmup');
    const ant = stepMap.get('ant');
    const max = stepMap.get('max');
    const aert = stepMap.get('aert');

    if (!warmup || !ant || !max || !aert) {
      return null;
    }

    return {
      warmup,
      ant,
      max,
      aert,
    };
  }

  private calculateStepMetrics(stepData: DataPoint[], stepType: StepType): StepMetrics {
    const endTime = stepData.at(-1)?.elapsed_s ?? 0;
    const analysisStart = Math.max(0, endTime - LAST_MINUTE_WINDOW_S);
    const analysisSlice = stepData.filter((record) => record.elapsed_s >= analysisStart);

    const speeds = analysisSlice.map((record) => record.speed);
    const heartRates = analysisSlice.map((record) => record.heartRate).filter((value): value is number => value !== null);

    const avgSpeed = speeds.reduce((acc, value) => acc + value, 0) / (speeds.length || 1);
    const avgHeartRate = heartRates.length > 0 ? heartRates.reduce((acc, value) => acc + value, 0) / heartRates.length : null;
    const maxHeartRate = heartRates.length > 0 ? Math.max(...heartRates) : null;
    const speedStdev = standardDeviation(speeds);

    const metrics: StepMetrics = {
      avgSpeed,
      avgHeartRate,
      maxHeartRate,
      speedStdev,
    };

    if (stepType === 'max') {
      metrics.onsetAcceleration = this.calculateOnsetAcceleration(stepData);
    }

    return metrics;
  }

  private calculateOnsetAcceleration(stepData: DataPoint[]): number {
    const window = stepData.filter((record) => record.elapsed_s - stepData[0].elapsed_s <= ONSET_WINDOW_S);
    if (window.length < 2) {
      return 0;
    }

    const startSpeed = window[0].speed;
    const endSpeed = window.at(-1)?.speed ?? startSpeed;
    const deltaTime = window.at(-1)?.elapsed_s ?? 0;

    if (deltaTime === 0) {
      return 0;
    }

    return (endSpeed - startSpeed) / deltaTime;
  }

  private findRestIslands(smoothedSpeed: number[]): Island[] {
    const islands: Island[] = [];
    let startIndex: number | null = null;

    smoothedSpeed.forEach((speed, index) => {
      if (speed < REST_SPEED_THRESHOLD) {
        if (startIndex === null) {
          startIndex = index;
        }
      } else if (startIndex !== null) {
        const duration = this.records[index].elapsed_s - this.records[startIndex].elapsed_s;
        if (duration >= REST_MIN_DURATION_S) {
          islands.push({ startIndex, endIndex: index - 1, duration });
        }
        startIndex = null;
      }
    });

    if (startIndex !== null) {
      const endIndex = smoothedSpeed.length - 1;
      const duration = this.records[endIndex].elapsed_s - this.records[startIndex].elapsed_s;
      if (duration >= REST_MIN_DURATION_S) {
        islands.push({ startIndex, endIndex, duration });
      }
    }

    return islands;
  }

  private findActiveIslands(restIslands: Island[]): Island[] {
    const islands: Island[] = [];
    let startIndex = 0;

    restIslands.forEach((rest) => {
      const endIndex = rest.startIndex - 1;
      if (endIndex >= startIndex) {
        const duration = this.records[endIndex].elapsed_s - this.records[startIndex].elapsed_s;
        islands.push({ startIndex, endIndex, duration });
      }
      startIndex = rest.endIndex + 1;
    });

    if (startIndex < this.records.length) {
      const endIndex = this.records.length - 1;
      const duration = this.records[endIndex].elapsed_s - this.records[startIndex].elapsed_s;
      islands.push({ startIndex, endIndex, duration });
    }

    return islands;
  }

  private isWithinTolerance(value: number, target: number, tolerance: number): boolean {
    return value >= target * (1 - tolerance) && value <= target * (1 + tolerance);
  }
}

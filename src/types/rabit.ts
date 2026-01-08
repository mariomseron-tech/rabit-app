export interface DataPoint {
  timestamp: Date;
  elapsed_s: number;
  lat: number | null;
  lon: number | null;
  speed: number;
  heartRate: number | null;
  distance: number | null;
  cadence: number | null;
  isRest: boolean;
}

export interface FitData {
  records: DataPoint[];
}

export type StepType = 'warmup' | 'ant' | 'max' | 'aert';

export interface StepSegment {
  type: StepType;
  startIndex: number;
  endIndex: number;
}

export interface StepMetrics {
  avgSpeed: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  speedStdev: number;
  onsetAcceleration?: number;
}

export interface RabitMetrics {
  warmup: StepMetrics;
  ant: StepMetrics;
  max: StepMetrics;
  aert: StepMetrics;
}

export interface TrainingZone {
  name: string;
  description: string;
  speedRange: [number, number | null];
  heartRateRange: [number | null, number | null];
}

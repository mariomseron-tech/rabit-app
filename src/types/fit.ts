export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface StepWindow {
  start: number;
  end: number;
  steps: number;
  cadence: number;
}

export interface StepMetrics {
  totalSteps: number;
  averageCadence: number;
  durationMs: number;
}

export interface RabitAnalysis {
  rawBuffer: DataPoint[];
  normalized: DataPoint[];
  detectedWindows: StepWindow[];
  metrics: StepMetrics;
  uiOverrides: {
    selectedWindowId?: string;
    showRaw: boolean;
    showNormalized: boolean;
    showCadence: boolean;
  };
  flags: {
    isCollecting: boolean;
    hasEnoughData: boolean;
  };
}

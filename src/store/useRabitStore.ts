import { create } from 'zustand';

import { DataPoint, RabitMetrics, StepSegment } from '../types/rabit';

interface RabitState {
  records: DataPoint[];
  steps: StepSegment[];
  metrics: RabitMetrics | null;
  setRecords: (records: DataPoint[]) => void;
  setSteps: (steps: StepSegment[]) => void;
  setMetrics: (metrics: RabitMetrics | null) => void;
}

export const useRabitStore = create<RabitState>((set) => ({
  records: [],
  steps: [],
  metrics: null,
  setRecords: (records) => set({ records }),
  setSteps: (steps) => set({ steps }),
  setMetrics: (metrics) => set({ metrics }),
}));

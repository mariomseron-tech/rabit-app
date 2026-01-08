import { computeMetrics, Metrics, StepDefinition } from "../metrics/computeMetrics";

type OverridesState = {
  overrides: Record<string, number>;
  metrics: Metrics;
};

const state: OverridesState = {
  overrides: {},
  metrics: {
    total: 0,
    min: 0,
    max: 0,
    byStep: {},
  },
};

const listeners = new Set<(nextState: OverridesState) => void>();

const notify = () => {
  listeners.forEach((listener) => listener({ ...state }));
};

export const subscribeToOverrides = (
  listener: (nextState: OverridesState) => void
) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getOverridesState = () => ({ ...state });

export const updateStepOverride = (
  stepId: string,
  value: number,
  steps: StepDefinition[]
) => {
  state.overrides = {
    ...state.overrides,
    [stepId]: value,
  };
  state.metrics = computeMetrics(steps, state.overrides);
  notify();
};

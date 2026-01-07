export type StepDefinition = {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
};

export type Metrics = {
  total: number;
  min: number;
  max: number;
  byStep: Record<string, number>;
};

export function computeMetrics(
  steps: StepDefinition[],
  overrides: Record<string, number>
): Metrics {
  const byStep: Record<string, number> = {};

  steps.forEach((step) => {
    const value = overrides[step.id] ?? step.value;
    byStep[step.id] = value;
  });

  const values = Object.values(byStep);
  const total = values.reduce((sum, value) => sum + value, 0);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return {
    total,
    min,
    max,
    byStep,
  };
}

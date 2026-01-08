"use client";

import React, { useMemo, useState } from "react";
import { StepDefinition } from "../metrics/computeMetrics";
import { updateStepOverride } from "../store/stepOverrides";

type StepAdjusterProps = {
  steps: StepDefinition[];
  minGap?: number;
};

type StepError = {
  message: string;
} | null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getBounds = (
  index: number,
  steps: StepDefinition[],
  values: number[],
  minGap: number
) => {
  const current = steps[index];
  const previousValue = values[index - 1];
  const nextValue = values[index + 1];

  const minBound = Math.max(
    current.min,
    previousValue !== undefined ? previousValue + minGap : current.min
  );
  const maxBound = Math.min(
    current.max,
    nextValue !== undefined ? nextValue - minGap : current.max
  );

  return { minBound, maxBound };
};

export const StepAdjuster = ({ steps, minGap = 1 }: StepAdjusterProps) => {
  const initialValues = useMemo(() => steps.map((step) => step.value), [steps]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<StepError[]>(
    steps.map(() => null)
  );

  const handleChange = (index: number, rawValue: number) => {
    const { minBound, maxBound } = getBounds(index, steps, values, minGap);
    const nextValue = clamp(rawValue, minBound, maxBound);

    const nextValues = values.map((value, stepIndex) =>
      stepIndex === index ? nextValue : value
    );

    const nextErrors = errors.map((error, stepIndex) => {
      if (stepIndex !== index) {
        return error;
      }

      if (rawValue < minBound) {
        return {
          message: `Value must be at least ${minBound}.`,
        };
      }

      if (rawValue > maxBound) {
        return {
          message: `Value must be at most ${maxBound}.`,
        };
      }

      return null;
    });

    setValues(nextValues);
    setErrors(nextErrors);
    updateStepOverride(steps[index].id, nextValue, steps);
  };

  return (
    <div>
      {steps.map((step, index) => {
        const { minBound, maxBound } = getBounds(index, steps, values, minGap);

        return (
          <div key={step.id} style={{ marginBottom: 16 }}>
            <label htmlFor={`step-${step.id}`}>
              {step.label}: {values[index]}
            </label>
            <input
              id={`step-${step.id}`}
              type="range"
              min={minBound}
              max={maxBound}
              value={values[index]}
              onChange={(event) =>
                handleChange(index, Number(event.target.value))
              }
            />
            {errors[index] ? (
              <div role="alert" style={{ color: "#b91c1c" }}>
                {errors[index]?.message}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

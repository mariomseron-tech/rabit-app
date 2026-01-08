"use client";

import { useMemo, useState } from "react";

export type BillatCalculatorProps = {
  vvo2max: number;
};

export const BillatCalculator = ({ vvo2max }: BillatCalculatorProps) => {
  const [workPercent, setWorkPercent] = useState(100);
  const [recoveryPercent, setRecoveryPercent] = useState(50);

  const { workSpeed, recoverySpeed } = useMemo(() => {
    return {
      workSpeed: (vvo2max * workPercent) / 100,
      recoverySpeed: (vvo2max * recoveryPercent) / 100,
    };
  }, [vvo2max, workPercent, recoveryPercent]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Billat 30-30 Calculator
        </h3>
        <p className="text-sm text-slate-500">
          Use vVO2max to tune 30/30 intervals.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="billat-work-intensity"
            className="text-sm font-medium text-slate-700"
          >
            Work intensity ({workPercent}%)
          </label>
          <input
            id="billat-work-intensity"
            type="range"
            min={90}
            max={110}
            value={workPercent}
            onChange={(event) => setWorkPercent(Number(event.target.value))}
            className="mt-2 w-full"
            aria-label="Work intensity percentage"
          />
        </div>
        <div>
          <label
            htmlFor="billat-recovery-intensity"
            className="text-sm font-medium text-slate-700"
          >
            Recovery intensity ({recoveryPercent}%)
          </label>
          <input
            id="billat-recovery-intensity"
            type="range"
            min={40}
            max={70}
            value={recoveryPercent}
            onChange={(event) => setRecoveryPercent(Number(event.target.value))}
            className="mt-2 w-full"
            aria-label="Recovery intensity percentage"
          />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-slate-500">30s Work</p>
          <p className="text-xl font-semibold text-slate-900">
            {workSpeed.toFixed(1)} km/h
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-slate-500">30s Recovery</p>
          <p className="text-xl font-semibold text-slate-900">
            {recoverySpeed.toFixed(1)} km/h
          </p>
        </div>
      </div>
    </div>
  );
};

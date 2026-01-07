import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

export type ChartPoint = {
  time: number;
  speed: number;
  hr: number;
};

export type StepSegment = {
  start: number;
  end: number;
  label: string;
};

export type RabitChartProps = {
  data: ChartPoint[];
  steps: StepSegment[];
  lastMinuteWindow?: number;
};

const tooltipFormatter = (value: number, name: string) => {
  if (name === "speed") {
    return [`${value.toFixed(1)} km/h`, "Speed"];
  }
  return [`${Math.round(value)} bpm`, "HR"];
};

export const RabitChart = ({ data, steps, lastMinuteWindow = 60 }: RabitChartProps) => {
  const lastPoint = data[data.length - 1];
  const endTime = lastPoint?.time ?? 0;
  const lastMinuteStart = Math.max(0, endTime - lastMinuteWindow);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Session Progress</h3>
          <p className="text-sm text-slate-500">Speed & HR with step blocks and last-minute overlay.</p>
        </div>
        <div className="text-xs text-slate-400">Last {lastMinuteWindow}s focus</div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="time" tickFormatter={(value) => `${value}s`} />
            <YAxis yAxisId="speed" label={{ value: "Speed (km/h)", angle: -90, position: "insideLeft" }} />
            <YAxis
              yAxisId="hr"
              orientation="right"
              label={{ value: "Heart Rate (bpm)", angle: 90, position: "insideRight" }}
            />
            <Tooltip formatter={tooltipFormatter} labelFormatter={(label) => `${label}s`} />
            <Legend />

            {steps.map((step) => (
              <ReferenceArea
                key={step.label}
                x1={step.start}
                x2={step.end}
                yAxisId="speed"
                fill="#bae6fd"
                fillOpacity={0.35}
                label={{ value: step.label, position: "insideTop" }}
              />
            ))}

            <ReferenceArea
              x1={lastMinuteStart}
              x2={endTime}
              yAxisId="speed"
              fill="#fef9c3"
              fillOpacity={0.4}
              label={{ value: "Last minute", position: "insideTopRight" }}
            />

            <ReferenceLine yAxisId="speed" y={12} stroke="#38bdf8" strokeDasharray="4 4" label="AerT" />
            <ReferenceLine yAxisId="speed" y={14.5} stroke="#fb923c" strokeDasharray="4 4" label="AnT" />

            <Line yAxisId="speed" type="monotone" dataKey="speed" stroke="#0284c7" dot={false} />
            <Line yAxisId="hr" type="monotone" dataKey="hr" stroke="#ef4444" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

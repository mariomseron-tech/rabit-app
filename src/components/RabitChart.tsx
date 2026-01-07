import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DataPoint, StepSegment } from '../types/rabit';

const STEP_COLORS: Record<string, string> = {
  warmup: '#94a3b8',
  ant: '#3b82f6',
  max: '#ef4444',
  aert: '#22c55e',
};

interface RabitChartProps {
  data: DataPoint[];
  steps: StepSegment[];
}

export function RabitChart({ data, steps }: RabitChartProps) {
  return (
    <ComposedChart width={900} height={320} data={data} margin={{ top: 16, right: 40, left: 16, bottom: 16 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="elapsed_s" tickFormatter={(value) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`} />
      <YAxis yAxisId="speed" label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }} />
      <YAxis
        yAxisId="heart"
        orientation="right"
        label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideRight' }}
      />
      <Tooltip />
      <Legend />
      {steps.map((step) => (
        <ReferenceArea
          key={step.type}
          x1={data[step.startIndex]?.elapsed_s}
          x2={data[step.endIndex]?.elapsed_s}
          yAxisId="speed"
          fill={STEP_COLORS[step.type] ?? '#cbd5f5'}
          fillOpacity={0.12}
        />
      ))}
      <Line yAxisId="speed" type="monotone" dataKey="speed" stroke="#0f766e" dot={false} name="Speed" />
      <Line yAxisId="heart" type="monotone" dataKey="heartRate" stroke="#dc2626" dot={false} name="Heart Rate" />
    </ComposedChart>
  );
}

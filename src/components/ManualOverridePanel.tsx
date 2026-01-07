import { StepSegment, StepType } from '../types/rabit';

interface ManualOverridePanelProps {
  segments: StepSegment[];
  onChange: (segments: StepSegment[]) => void;
}

const STEP_LABELS: Record<StepType, string> = {
  warmup: 'Step 1 (Warmup)',
  ant: 'Step 2 (Anaerobic Threshold)',
  max: 'Step 3 (Max)',
  aert: 'Step 4 (Aerobic Threshold)',
};

export function ManualOverridePanel({ segments, onChange }: ManualOverridePanelProps) {
  const updateSegment = (type: StepType, field: 'startIndex' | 'endIndex', value: number) => {
    const next = segments.map((segment) =>
      segment.type === type ? { ...segment, [field]: value } : segment,
    );
    onChange(next);
  };

  return (
    <section>
      <h2>Manual Step Override</h2>
      <p>Adjust the segment boundaries if auto-detection failed or if you paused unexpectedly.</p>
      {segments.map((segment) => (
        <div key={segment.type} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr 1fr' }}>
          <strong>{STEP_LABELS[segment.type]}</strong>
          <label>
            Start Index
            <input
              type="number"
              min={0}
              value={segment.startIndex}
              onChange={(event) => updateSegment(segment.type, 'startIndex', Number(event.target.value))}
            />
          </label>
          <label>
            End Index
            <input
              type="number"
              min={segment.startIndex}
              value={segment.endIndex}
              onChange={(event) => updateSegment(segment.type, 'endIndex', Number(event.target.value))}
            />
          </label>
        </div>
      ))}
    </section>
  );
}

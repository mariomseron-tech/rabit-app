import { BillatWorkout } from '../analyzer/trainingZones';

interface BillatCalculatorProps {
  workout: BillatWorkout;
}

export function BillatCalculator({ workout }: BillatCalculatorProps) {
  return (
    <section>
      <h2>Billat 30-30 Workout</h2>
      <p>
        Run 30s at <strong>{workout.intervalSpeed.toFixed(1)} km/h</strong> ({workout.intervalDistance.toFixed(0)} m),
        recover 30s at <strong>{workout.recoverySpeed.toFixed(1)} km/h</strong> ({workout.recoveryDistance.toFixed(0)} m).
      </p>
      <p>Repeat 15-20 times based on your training plan.</p>
    </section>
  );
}

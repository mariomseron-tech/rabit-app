import { RabitMetrics, TrainingZone } from '../types/rabit';

export function buildTrainingZones(metrics: RabitMetrics): TrainingZone[] {
  const aert = metrics.aert.avgSpeed;
  const ant = metrics.ant.avgSpeed;
  const vvo2 = metrics.max.avgSpeed;

  const hrAert = metrics.aert.avgHeartRate;
  const hrAnt = metrics.ant.avgHeartRate;
  const hrMax = metrics.max.maxHeartRate;

  return [
    {
      name: 'Recovery',
      description: 'Below Aerobic Threshold',
      speedRange: [0, aert],
      heartRateRange: [null, hrAert],
    },
    {
      name: 'Endurance',
      description: 'Aerobic to Midpoint',
      speedRange: [aert, (aert + ant) / 2],
      heartRateRange: [hrAert, hrAnt ? (hrAert !== null ? (hrAert + hrAnt) / 2 : hrAnt) : null],
    },
    {
      name: 'Tempo',
      description: 'Midpoint to Anaerobic Threshold',
      speedRange: [(aert + ant) / 2, ant],
      heartRateRange: [hrAnt ? (hrAert !== null ? (hrAert + hrAnt) / 2 : hrAnt) : null, hrAnt],
    },
    {
      name: 'Interval',
      description: 'Anaerobic Threshold to vVO2max',
      speedRange: [ant, vvo2],
      heartRateRange: [hrAnt, hrMax],
    },
    {
      name: 'Sprint',
      description: 'Above vVO2max',
      speedRange: [vvo2, null],
      heartRateRange: [hrMax, null],
    },
  ];
}

export interface BillatWorkout {
  intervalSpeed: number;
  recoverySpeed: number;
  intervalDistance: number;
  recoveryDistance: number;
}

export function buildBillat3030(metrics: RabitMetrics): BillatWorkout {
  const vvo2 = metrics.max.avgSpeed;
  const intervalSpeed = vvo2;
  const recoverySpeed = vvo2 * 0.5;

  const intervalDistance = (intervalSpeed / 3.6) * 30;
  const recoveryDistance = (recoverySpeed / 3.6) * 30;

  return {
    intervalSpeed,
    recoverySpeed,
    intervalDistance,
    recoveryDistance,
  };
}

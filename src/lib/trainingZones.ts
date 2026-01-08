export type TrainingZone = {
  name: string;
  speedRange: [number, number];
  hrRange: [number, number];
  description: string;
};

export type ZoneInputs = {
  vvo2max: number;
  hrMax: number;
};

const ZONE_PERCENTAGES: Array<{ name: string; min: number; max: number; description: string }> = [
  { name: "Z1 Recovery", min: 0.6, max: 0.7, description: "Easy aerobic recovery pace." },
  { name: "Z2 Endurance", min: 0.7, max: 0.8, description: "Steady endurance running." },
  { name: "Z3 Tempo", min: 0.8, max: 0.9, description: "Moderate tempo effort." },
  { name: "Z4 Threshold", min: 0.9, max: 1.0, description: "Lactate threshold focus." },
  { name: "Z5 VO2", min: 1.0, max: 1.1, description: "High intensity VO2 work." },
];

export const calculateTrainingZones = ({ vvo2max, hrMax }: ZoneInputs): TrainingZone[] => {
  if (vvo2max <= 0 || hrMax <= 0) {
    throw new Error("vVO2max and HR max must be positive values.");
  }

  return ZONE_PERCENTAGES.map((zone) => ({
    name: zone.name,
    speedRange: [vvo2max * zone.min, vvo2max * zone.max],
    hrRange: [hrMax * zone.min, hrMax * zone.max],
    description: zone.description,
  }));
};

export const formatRange = (range: [number, number], digits = 1): string => {
  const [min, max] = range;
  return `${min.toFixed(digits)}-${max.toFixed(digits)}`;
};

import { describe, expect, it } from "vitest";
import { buildBillat3030, buildTrainingZones } from "../trainingZones";
import { RabitMetrics } from "../../types/rabit";

const baseMetrics: RabitMetrics = {
  warmup: {
    avgSpeed: 8,
    avgHeartRate: 120,
    maxHeartRate: 130,
    speedStdev: 0.2,
  },
  ant: {
    avgSpeed: 14,
    avgHeartRate: 160,
    maxHeartRate: 170,
    speedStdev: 0.4,
  },
  max: {
    avgSpeed: 18,
    avgHeartRate: 175,
    maxHeartRate: 190,
    speedStdev: 0.6,
  },
  aert: {
    avgSpeed: 12,
    avgHeartRate: 140,
    maxHeartRate: 150,
    speedStdev: 0.3,
  },
};

describe("buildTrainingZones", () => {
  it("builds speed and HR ranges from Rabit metrics", () => {
    const zones = buildTrainingZones(baseMetrics);

    expect(zones[0]).toMatchObject({
      name: "Recovery",
      speedRange: [0, 12],
      heartRateRange: [null, 140],
    });
    expect(zones[3]).toMatchObject({
      name: "Interval",
      speedRange: [14, 18],
      heartRateRange: [160, 190],
    });
  });

  it("handles missing heart rate values", () => {
    const zones = buildTrainingZones({
      ...baseMetrics,
      aert: { ...baseMetrics.aert, avgHeartRate: null },
      ant: { ...baseMetrics.ant, avgHeartRate: null },
      max: { ...baseMetrics.max, maxHeartRate: null },
    });

    expect(zones[0].heartRateRange).toEqual([null, null]);
    expect(zones[1].heartRateRange).toEqual([null, null]);
    expect(zones[4].heartRateRange).toEqual([null, null]);
  });
});

describe("buildBillat3030", () => {
  it("returns interval/recovery speeds and distances", () => {
    const workout = buildBillat3030(baseMetrics);

    expect(workout.intervalSpeed).toBe(18);
    expect(workout.recoverySpeed).toBe(9);
    expect(workout.intervalDistance).toBeCloseTo(150, 1);
    expect(workout.recoveryDistance).toBeCloseTo(75, 1);
  });
});

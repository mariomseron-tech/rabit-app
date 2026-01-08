import { describe, expect, it } from "vitest";
import { calculateTrainingZones } from "../lib/trainingZones";

describe("calculateTrainingZones", () => {
  it("returns five zones with scaled ranges", () => {
    const zones = calculateTrainingZones({ vvo2max: 20, hrMax: 200 });

    expect(zones).toHaveLength(5);
    expect(zones[0].speedRange).toEqual([12, 14]);
    expect(zones[0].hrRange).toEqual([120, 140]);
    expect(zones[4].speedRange).toEqual([20, 22]);
    expect(zones[4].hrRange).toEqual([200, 220]);
  });

  it("throws for invalid inputs", () => {
    expect(() => calculateTrainingZones({ vvo2max: 0, hrMax: 180 })).toThrow(
      "vVO2max and HR max must be positive values."
    );
  });
});

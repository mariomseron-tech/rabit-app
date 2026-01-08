import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FitRecord } from "fit-file-parser";
import { parseFitFile } from "../FitProcessor";

let mockRecords: FitRecord[] = [];

vi.mock("fit-file-parser", () => {
  return {
    default: class FitParserMock {
      parse(
        _buffer: ArrayBuffer,
        callback: (error: unknown, data: { records: FitRecord[] }) => void
      ) {
        callback(null, { records: mockRecords });
      }
    }
  };
});

describe("parseFitFile normalization", () => {
  beforeEach(() => {
    mockRecords = [];
  });

  it("normalizes speed, position, elapsed time, and missing HR", async () => {
    const start = new Date("2024-01-01T00:00:00Z");
    mockRecords = [
      {
        timestamp: start,
        position_lat: 2 ** 30,
        position_long: -(2 ** 30),
        enhanced_speed: 12,
        speed: 10,
        heart_rate: undefined,
        distance: 100,
        cadence: 80,
      },
      {
        timestamp: new Date(start.getTime() + 1000),
        position_lat: 0,
        position_long: 0,
        speed: 8,
        heart_rate: 140,
      },
    ];

    const result = await parseFitFile(new ArrayBuffer(8));

    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toMatchObject({
      elapsed_s: 0,
      lat: 90,
      lon: -90,
      speed: 12,
      heartRate: null,
      distance: 100,
      cadence: 80,
      isRest: false,
    });
    expect(result.records[1]).toMatchObject({
      elapsed_s: 1,
      lat: 0,
      lon: 0,
      speed: 8,
      heartRate: 140,
    });
  });
});

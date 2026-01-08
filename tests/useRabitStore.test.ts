import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRabitStore } from "../src/state/useRabitStore";
import { DataPoint, StepWindow } from "../src/types/fit";

const makeDataPoint = (timestamp: number, value: number): DataPoint => ({
  timestamp,
  value,
});

const makeWindow = (
  start: number,
  end: number,
  steps: number,
  cadence: number
): StepWindow => ({
  start,
  end,
  steps,
  cadence,
});

describe("Rabit store selectors", () => {
  it("returns only last 60 seconds for raw data", () => {
    const store = createRabitStore();
    const now = 1_000_000;
    store.actions.setRawBuffer([
      makeDataPoint(now - 70_000, 0.1),
      makeDataPoint(now - 61_000, 0.2),
      makeDataPoint(now - 59_000, 0.3),
      makeDataPoint(now - 1_000, 0.4),
    ]);

    const lastMinute = store.selectors.lastMinuteRaw(now);
    assert.deepStrictEqual(
      lastMinute.map((point) => point.value),
      [0.3, 0.4]
    );
  });

  it("returns only last 60 seconds for normalized data", () => {
    const store = createRabitStore();
    const now = 2_000_000;
    store.actions.setNormalized([
      makeDataPoint(now - 90_000, 1),
      makeDataPoint(now - 60_000, 2),
      makeDataPoint(now - 30_000, 3),
    ]);

    const lastMinute = store.selectors.lastMinuteNormalized(now);
    assert.deepStrictEqual(
      lastMinute.map((point) => point.value),
      [2, 3]
    );
  });

  it("returns only last 60 seconds for detected windows using window end time", () => {
    const store = createRabitStore();
    const now = 3_000_000;
    store.actions.setDetectedWindows([
      makeWindow(now - 120_000, now - 90_000, 10, 100),
      makeWindow(now - 80_000, now - 65_000, 12, 110),
      makeWindow(now - 55_000, now - 50_000, 14, 120),
      makeWindow(now - 5_000, now - 1_000, 20, 130),
    ]);

    const lastMinute = store.selectors.lastMinuteWindows(now);
    assert.deepStrictEqual(
      lastMinute.map((window) => window.steps),
      [14, 20]
    );
  });

  it("returns flag snapshot", () => {
    const store = createRabitStore();
    store.actions.setFlags({ isCollecting: true, hasEnoughData: true });

    const flags = store.selectors.flags();
    assert.deepStrictEqual(flags, {
      isCollecting: true,
      hasEnoughData: true,
    });

    const nextFlags = store.selectors.flags();
    assert.notStrictEqual(flags, nextFlags);
  });
});

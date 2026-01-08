import { describe, expect, it } from "vitest";
import { RabitAnalyzer } from "../../src/lib/RabitAnalyzer";

describe("RabitAnalyzer performance", () => {
  it("analyzes a large dataset within a reasonable time budget", () => {
    const points = Array.from({ length: 3601 }, (_, index) => ({
      timestampSec: index,
      speedKmh: 10 + (index % 5),
      heartRate: 140,
    }));

    const analyzer = new RabitAnalyzer({
      pattern: [{ name: "Long step", durationSec: 3600 }],
    });

    const memoryBefore = process.memoryUsage().heapUsed;
    const start = performance.now();
    const result = analyzer.analyze(points);
    const duration = performance.now() - start;
    const memoryAfter = process.memoryUsage().heapUsed;

    expect(result.status).toBe("ok");
    expect(duration).toBeLessThan(1000);
    expect(memoryAfter - memoryBefore).toBeLessThan(50 * 1024 * 1024);
  });
});

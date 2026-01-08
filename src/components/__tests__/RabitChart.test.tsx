import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("recharts", () => {
  const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const ReferenceArea = ({ label }: { label?: { value: string } }) => (
    <div>{label?.value}</div>
  );

  return {
    CartesianGrid: Wrapper,
    ComposedChart: Wrapper,
    Legend: Wrapper,
    Line: Wrapper,
    ReferenceArea,
    ReferenceLine: Wrapper,
    ResponsiveContainer: Wrapper,
    Tooltip: Wrapper,
    XAxis: Wrapper,
    YAxis: Wrapper,
  };
});

import { RabitChart } from "../RabitChart";

describe("RabitChart", () => {
  it("renders step overlays and last-minute band labels", () => {
    const data = [
      { time: 0, speed: 10, hr: 120 },
      { time: 30, speed: 11, hr: 122 },
      { time: 60, speed: 12, hr: 124 },
      { time: 90, speed: 13, hr: 126 },
    ];
    const steps = [
      { start: 0, end: 30, label: "Warm-up" },
      { start: 30, end: 60, label: "AerT" },
    ];

    render(<RabitChart data={data} steps={steps} lastMinuteWindow={90} />);

    expect(screen.getByText("Session Progress")).toBeInTheDocument();
    expect(screen.getByText("Warm-up")).toBeInTheDocument();
    expect(screen.getByText("AerT")).toBeInTheDocument();
    expect(screen.getByText("Last minute")).toBeInTheDocument();
    expect(screen.getByText("Last 90s focus")).toBeInTheDocument();
  });
});

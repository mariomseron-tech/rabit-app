import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StepAdjuster } from "../StepAdjuster";
import { StepDefinition } from "../../metrics/computeMetrics";
import * as stepOverrides from "../../store/stepOverrides";

afterEach(() => {
  vi.restoreAllMocks();
});

const steps: StepDefinition[] = [
  { id: "alpha", label: "Alpha", min: 0, max: 10, value: 2 },
  { id: "beta", label: "Beta", min: 0, max: 10, value: 6 },
  { id: "gamma", label: "Gamma", min: 0, max: 10, value: 9 },
];

describe("StepAdjuster", () => {
  it("clamps values to bounds and shows validation", () => {
    const updateSpy = vi.spyOn(stepOverrides, "updateStepOverride");

    render(<StepAdjuster steps={steps} minGap={1} />);

    const alphaSlider = screen.getByLabelText("Alpha: 2") as HTMLInputElement;

    fireEvent.change(alphaSlider, { target: { value: "-5" } });

    expect(alphaSlider.value).toBe("0");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Value must be at least 0."
    );
    expect(updateSpy).toHaveBeenCalledWith("alpha", 0, steps);
  });

  it("prevents overlap between neighboring steps", () => {
    const updateSpy = vi.spyOn(stepOverrides, "updateStepOverride");

    render(<StepAdjuster steps={steps} minGap={1} />);

    const betaSlider = screen.getByLabelText("Beta: 6") as HTMLInputElement;

    fireEvent.change(betaSlider, { target: { value: "1" } });

    expect(betaSlider.value).toBe("3");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Value must be at least 3."
    );
    expect(updateSpy).toHaveBeenCalledWith("beta", 3, steps);
  });

  it("clamps values to the max bound for the last step", () => {
    const updateSpy = vi.spyOn(stepOverrides, "updateStepOverride");

    render(<StepAdjuster steps={steps} minGap={1} />);

    const gammaSlider = screen.getByLabelText(
      "Gamma: 9"
    ) as HTMLInputElement;

    fireEvent.change(gammaSlider, { target: { value: "15" } });

    expect(gammaSlider.value).toBe("10");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Value must be at most 10."
    );
    expect(updateSpy).toHaveBeenCalledWith("gamma", 10, steps);
  });

  it("supports keyboard focus on sliders", async () => {
    const user = userEvent.setup();
    render(<StepAdjuster steps={steps} minGap={1} />);

    await user.tab();

    expect(screen.getByLabelText("Alpha: 2")).toHaveFocus();
  });
});

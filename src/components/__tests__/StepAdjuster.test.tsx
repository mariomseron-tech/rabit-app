import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { StepAdjuster } from "../StepAdjuster";
import { StepDefinition } from "../../metrics/computeMetrics";
import * as stepOverrides from "../../store/stepOverrides";

afterEach(() => {
  jest.restoreAllMocks();
});

const steps: StepDefinition[] = [
  { id: "alpha", label: "Alpha", min: 0, max: 10, value: 2 },
  { id: "beta", label: "Beta", min: 0, max: 10, value: 6 },
  { id: "gamma", label: "Gamma", min: 0, max: 10, value: 9 },
];

describe("StepAdjuster", () => {
  it("clamps values to bounds and shows validation", () => {
    const updateSpy = jest.spyOn(stepOverrides, "updateStepOverride");

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
    const updateSpy = jest.spyOn(stepOverrides, "updateStepOverride");

    render(<StepAdjuster steps={steps} minGap={1} />);

    const betaSlider = screen.getByLabelText("Beta: 6") as HTMLInputElement;

    fireEvent.change(betaSlider, { target: { value: "1" } });

    expect(betaSlider.value).toBe("3");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Value must be at least 3."
    );
    expect(updateSpy).toHaveBeenCalledWith("beta", 3, steps);
  });
});

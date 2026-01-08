import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BillatCalculator } from "../BillatCalculator";

describe("BillatCalculator", () => {
  it("exposes labeled sliders and supports keyboard focus", async () => {
    const user = userEvent.setup();
    render(<BillatCalculator vvo2max={18} />);

    const workSlider = screen.getByLabelText("Work intensity percentage");
    const recoverySlider = screen.getByLabelText(
      "Recovery intensity percentage"
    );

    await user.tab();
    expect(workSlider).toHaveFocus();

    await user.tab();
    expect(recoverySlider).toHaveFocus();
  });
});

/// <reference types="vitest" />

import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders hero content and features", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome to Rabit Digital" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Explore the App Router docs →" })
    ).toHaveAttribute("href", "https://nextjs.org/docs/app");

    expect(screen.getByLabelText("Feature highlights")).toBeInTheDocument();
  });
});

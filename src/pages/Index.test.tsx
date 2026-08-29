import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Index from "./Index";

describe("Index", () => {
  it("renders the calculator heading without router or query providers", () => {
    render(<Index />);
    expect(
      screen.getByRole("heading", { level: 1, name: /EUA x Brasil/i }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Index from "./Index";

async function typePrice(user: ReturnType<typeof userEvent.setup>, value: string) {
  const input = screen.getByLabelText(/dólares americanos/i);
  await user.clear(input);
  await user.type(input, value);
}

describe("Index", () => {
  it("renders the heading", () => {
    render(<Index />);
    expect(
      screen.getByRole("heading", { level: 1, name: /EUA x Brasil/i }),
    ).toBeInTheDocument();
  });

  it("does not show a result until submit", () => {
    render(<Index />);
    expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Selecione ao menos um método/i)).not.toBeInTheDocument();
  });

  it("shows a result after a valid submit", async () => {
    const user = userEvent.setup();
    render(<Index />);
    await typePrice(user, "100");
    await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
    expect(screen.getByText(/Total Final Estimado/i)).toBeInTheDocument();
  });

  it("hides the result after the price changes", async () => {
    const user = userEvent.setup();
    render(<Index />);
    await typePrice(user, "100");
    await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
    await typePrice(user, "1001");
    expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
  });

  it("does not revive a result when the price is restored without submit", async () => {
    const user = userEvent.setup();
    render(<Index />);
    await typePrice(user, "100");
    await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
    await typePrice(user, "1001");
    await typePrice(user, "100");
    expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
  });

  it("submits on Enter from the price field", async () => {
    const user = userEvent.setup();
    render(<Index />);
    const price = screen.getByLabelText(/dólares americanos/i);
    await user.type(price, "80{Enter}");
    expect(screen.getByText(/Total Final Estimado/i)).toBeInTheDocument();
  });

  it("names the compare switch", () => {
    render(<Index />);
    expect(screen.getByRole("switch", { name: /Modo Comparar/i })).toBeInTheDocument();
  });
});

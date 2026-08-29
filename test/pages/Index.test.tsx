import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import Index from "@/pages/Index";

async function typePrice(user: ReturnType<typeof userEvent.setup>, value: string) {
  const input = screen.getByLabelText(/dólares americanos/i);
  await user.clear(input);
  await user.type(input, value);
}

describe("Index", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

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

  it("toggles compare mode and hides single-method radios", async () => {
    const user = userEvent.setup();
    render(<Index />);
    expect(screen.getByRole("radiogroup", { name: /Método de pagamento/i })).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: /Modo Comparar/i }));
    expect(screen.queryByRole("radiogroup", { name: /Método de pagamento/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Métodos para comparar/i)).toBeInTheDocument();
  });

  it("restores price from the query string without showing a result", () => {
    window.history.replaceState(null, "", "/?p=42&st=NY");
    render(<Index />);
    expect(screen.getByLabelText(/dólares americanos/i)).toHaveValue("42");
    expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
  });

  it("writes the query string when the price changes", async () => {
    window.history.replaceState(null, "", "/");
    const user = userEvent.setup();
    render(<Index />);
    await user.type(screen.getByLabelText(/dólares americanos/i), "15");
    expect(window.location.search).toMatch(/p=15/);
  });

  it("exposes resultado-json after submit", async () => {
    const user = userEvent.setup();
    render(<Index />);
    await user.type(screen.getByLabelText(/dólares americanos/i), "20");
    await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
    const node = document.getElementById("resultado-json");
    expect(node).toBeTruthy();
    const body = JSON.parse(node!.textContent ?? "{}") as {
      priceUsd: number;
      count: number;
      state: string;
      compare: boolean;
    };
    expect(body.priceUsd).toBe(20);
    expect(body.count).toBeGreaterThan(0);

    const region = document.getElementById("resultado");
    expect(region).toHaveAttribute("data-price-usd", "20");
    expect(region).toHaveAttribute("data-state", body.state);
    expect(region).toHaveAttribute("data-compare", "false");
    expect(region).toHaveAttribute("data-count", String(body.count));

    const row = region?.querySelector("[data-method]");
    expect(row).toHaveAttribute("data-method", "cash");
    expect(row).toHaveAttribute("data-institution");
    expect(row).toHaveAttribute("data-final-brl");
    expect(row).toHaveAttribute("data-spread");
    expect(row).toHaveAttribute("data-iof");
    expect(row).toHaveAttribute("data-vet");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthForm } from "./auth-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("AuthForm", () => {
  it("renders login controls", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Entrar com e-mail" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continuar com Google" }),
    ).toBeInTheDocument();
  });

  it("renders signup password confirmation", () => {
    render(<AuthForm mode="signup" />);

    expect(screen.getByLabelText("Confirmar senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar conta" }),
    ).toBeInTheDocument();
  });
});

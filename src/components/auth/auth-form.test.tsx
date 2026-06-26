import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthForm } from "./auth-form";

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

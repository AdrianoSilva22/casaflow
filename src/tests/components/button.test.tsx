import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza o rótulo", () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { DataEnvironmentBadge } from "@/components/DataEnvironmentBadge";

const useDataEnvironment = vi.fn();

vi.mock("@/lib/data-environment-context", () => ({
  useDataEnvironment: () => useDataEnvironment(),
}));

describe("DataEnvironmentBadge", () => {
  it("shows a compact red warning for Supabase", () => {
    useDataEnvironment.mockReturnValue({
      status: "ready",
      data: { environment: "supabase" },
    });

    render(<DataEnvironmentBadge />);

    expect(screen.getByRole("status", { name: "Ambiente de dados atual" })).toHaveTextContent(
      "DADOS REAIS · SUPABASE"
    );
  });

  it("shows a discreet local test badge", () => {
    useDataEnvironment.mockReturnValue({
      status: "ready",
      data: { environment: "local" },
    });

    render(<DataEnvironmentBadge />);

    expect(screen.getByRole("status", { name: "Ambiente de dados atual" })).toHaveTextContent("LOCAL · TESTE");
  });
});

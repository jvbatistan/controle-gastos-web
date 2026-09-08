import { render, screen } from "@testing-library/react";
import { DataEnvironmentBanner } from "@/components/DataEnvironmentBanner";

const useDataEnvironment = vi.fn();

vi.mock("@/lib/data-environment-context", () => ({
  useDataEnvironment: () => useDataEnvironment(),
}));

describe("DataEnvironmentBanner", () => {
  it("shows a strong permanent warning for Supabase", () => {
    useDataEnvironment.mockReturnValue({
      status: "ready",
      data: { environment: "supabase" },
    });

    render(<DataEnvironmentBanner />);

    expect(screen.getByRole("status", { name: "Ambiente de dados atual" })).toHaveTextContent(
      "DADOS REAIS — SUPABASE"
    );
  });

  it("identifies the local environment as test data", () => {
    useDataEnvironment.mockReturnValue({
      status: "ready",
      data: { environment: "local" },
    });

    render(<DataEnvironmentBanner />);

    expect(screen.getByRole("status", { name: "Ambiente de dados atual" })).toHaveTextContent(
      "AMBIENTE DE TESTE — LOCAL"
    );
  });
});

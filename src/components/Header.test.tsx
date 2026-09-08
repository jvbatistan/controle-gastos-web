import { render, screen } from "@testing-library/react";
import { Header } from "@/components/Header";

const useDataEnvironment = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => ({
    status: "authenticated",
    user: { name: "João", email: "joao@example.com" },
    setUnauthenticated: vi.fn(),
  }),
}));

vi.mock("@/lib/auth", () => ({ logout: vi.fn() }));

vi.mock("@/lib/data-environment-context", () => ({
  useDataEnvironment: () => useDataEnvironment(),
}));

describe("Header data environment badge", () => {
  it("keeps the compact badge immediately before New Transaction", () => {
    useDataEnvironment.mockReturnValue({
      status: "ready",
      data: { environment: "local" },
      reset: vi.fn(),
    });

    render(<Header onNewTransactionClick={vi.fn()} />);

    const badge = screen.getByRole("status", { name: "Ambiente de dados atual" });
    const newTransaction = screen.getByRole("button", { name: /Nova Transação/i });

    expect(badge.nextElementSibling).toBe(newTransaction);
  });
});

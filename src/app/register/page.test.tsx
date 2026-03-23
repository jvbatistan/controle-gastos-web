import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/register/page";

const push = vi.fn();
const replace = vi.fn();
const register = vi.fn();
const useAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/lib/auth", () => ({
  register: (...args: unknown[]) => register(...args),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    register.mockReset();
    useAuth.mockReturnValue({ status: "unauthenticated" });
  });

  it("submits registration and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    register.mockResolvedValue({ id: 1, name: "Maria", email: "maria@example.com", active: true });

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("Ex: Joao Vitor"), "Maria");
    await user.type(screen.getByPlaceholderText("seuemail@exemplo.com"), "maria@example.com");
    await user.type(screen.getByPlaceholderText("Minimo de 6 caracteres"), "password123");
    await user.type(screen.getByPlaceholderText("Repita sua senha"), "password123");

    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: "Maria",
        email: "maria@example.com",
        password: "password123",
        password_confirmation: "password123",
      });
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders the backend error message when registration fails", async () => {
    const user = userEvent.setup();
    register.mockRejectedValue(new Error("Limite máximo de usuários atingido"));

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("Ex: Joao Vitor"), "Maria");
    await user.type(screen.getByPlaceholderText("seuemail@exemplo.com"), "maria@example.com");
    await user.type(screen.getByPlaceholderText("Minimo de 6 caracteres"), "password123");
    await user.type(screen.getByPlaceholderText("Repita sua senha"), "password123");

    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText("Limite máximo de usuários atingido")).toBeInTheDocument();
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/profile/page";

const push = vi.fn();
const replace = vi.fn();
const updateProfile = vi.fn();
const useAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/lib/auth", () => ({
  updateProfile: (...args: unknown[]) => updateProfile(...args),
  logout: vi.fn(),
}));

vi.mock("@/components/Header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/Navigation", () => ({
  Navigation: () => <div>Navigation</div>,
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    updateProfile.mockReset();
    useAuth.mockReturnValue({
      status: "authenticated",
      user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
    });
  });

  it("renders the current user information", () => {
    render(<ProfilePage />);

    expect(screen.getByDisplayValue("Joao")).toBeInTheDocument();
    expect(screen.getByDisplayValue("joao@example.com")).toBeInTheDocument();
    expect(screen.getByText("Conta ativa e pronta para uso.")).toBeInTheDocument();
  });

  it("updates the profile and shows a success message", async () => {
    const user = userEvent.setup();
    updateProfile.mockResolvedValue({ id: 1, name: "Joao Atualizado", email: "novo@example.com", active: true });

    render(<ProfilePage />);

    fireEvent.change(screen.getByDisplayValue("Joao"), {
      target: { value: "Joao Atualizado" },
    });
    fireEvent.change(screen.getByDisplayValue("joao@example.com"), {
      target: { value: "novo@example.com" },
    });
    await user.click(screen.getByRole("button", { name: /Salvar alterações/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Perfil atualizado com sucesso.")).toBeInTheDocument();
    });
  });
});

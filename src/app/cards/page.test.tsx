import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardsPage from "@/app/cards/page";

const push = vi.fn();
const replace = vi.fn();
const refetch = vi.fn();
const createCard = vi.fn();
const updateCard = vi.fn();
const deleteCard = vi.fn();
const useCards = vi.fn();
const useAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock("@/lib/useAuth", () => ({
  useAuth: () => useAuth(),
}));

vi.mock("@/components/Header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("@/components/Navigation", () => ({
  Navigation: () => <div>Navigation</div>,
}));

vi.mock("@/features/cards", () => ({
  useCards: () => useCards(),
  createCard: (...args: unknown[]) => createCard(...args),
  updateCard: (...args: unknown[]) => updateCard(...args),
  deleteCard: (...args: unknown[]) => deleteCard(...args),
  type: {},
}));

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  refetch.mockReset().mockResolvedValue(undefined);
  createCard.mockReset().mockResolvedValue({ status: 201, data: { id: 3, name: "NUBANK", due_day: 15, closing_day: 8, limit: 5000 } });
  updateCard.mockReset().mockResolvedValue({ status: 200, data: { id: 1, name: "INTER", due_day: 10, closing_day: 3, limit: 9000 } });
  deleteCard.mockReset().mockResolvedValue({ status: 204 });
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  useCards.mockReturnValue({
    cards: [
      { id: 1, name: "NUBANK", due_day: 15, closing_day: 8, limit: 5000 },
      { id: 2, name: "INTER", due_day: 10, closing_day: 3, limit: null },
    ],
    loading: false,
    error: null,
    refetch,
  });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CardsPage", () => {
  it("creates a card and refreshes the list", async () => {
    const user = userEvent.setup();

    render(<CardsPage />);

    await user.click(screen.getByRole("button", { name: /Novo Cartão/i }));
    await user.clear(screen.getByPlaceholderText("Ex: Nubank"));
    await user.type(screen.getByPlaceholderText("Ex: Nubank"), "C6");
    fireEvent.change(screen.getByDisplayValue("Dia 8"), { target: { value: "9" } });
    fireEvent.change(screen.getByDisplayValue("Dia 15"), { target: { value: "20" } });
    await user.type(screen.getByPlaceholderText("Ex: 5000"), "7000");
    await user.click(screen.getByRole("button", { name: /Criar Cartão/i }));

    await waitFor(() => {
      expect(createCard).toHaveBeenCalledWith({ name: "C6", due_day: 20, closing_day: 9, limit: 7000 });
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText('Cartão "NUBANK" criado com sucesso.')).toBeInTheDocument();
    });
  });

  it("loads a card into the dialog and updates it", async () => {
    const user = userEvent.setup();

    render(<CardsPage />);

    await user.click(screen.getAllByRole("button", { name: /Editar/i })[1]);

    fireEvent.change(screen.getByDisplayValue("NUBANK"), { target: { value: "Inter Black" } });
    fireEvent.change(screen.getByDisplayValue("Dia 8"), { target: { value: "5" } });
    fireEvent.change(screen.getByDisplayValue("Dia 15"), { target: { value: "12" } });
    fireEvent.change(screen.getByDisplayValue("5000"), { target: { value: "10000" } });

    await user.click(screen.getByRole("button", { name: /Salvar Alterações/i }));

    await waitFor(() => {
      expect(updateCard).toHaveBeenCalledWith(1, { name: "Inter Black", due_day: 12, closing_day: 5, limit: 10000 });
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("deletes a card after confirmation", async () => {
    const user = userEvent.setup();

    render(<CardsPage />);

    await user.click(screen.getAllByRole("button", { name: /Excluir/i })[1]);

    await waitFor(() => {
      expect(deleteCard).toHaveBeenCalledWith(1);
      expect(refetch).toHaveBeenCalled();
    });
  });
});

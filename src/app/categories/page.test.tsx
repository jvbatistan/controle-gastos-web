import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesPage from "@/app/categories/page";

const push = vi.fn();
const replace = vi.fn();
const refetch = vi.fn();
const createCategory = vi.fn();
const updateCategory = vi.fn();
const deleteCategory = vi.fn();
const useCategories = vi.fn();
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

vi.mock("@/features/categories", () => ({
  useCategories: () => useCategories(),
  createCategory: (...args: unknown[]) => createCategory(...args),
  updateCategory: (...args: unknown[]) => updateCategory(...args),
  deleteCategory: (...args: unknown[]) => deleteCategory(...args),
  CATEGORY_ICON_OPTIONS: [
    { value: "pie-chart", label: "Padrão" },
    { value: "car", label: "Carro" },
    { value: "shopping-cart", label: "Compras" },
  ],
  getCategoryIconOption: (value: string | null) => {
    if (value === "car") return { label: "Carro", tone: "bg-blue-100", iconTone: "text-blue-600", icon: () => null };
    if (value === "shopping-cart") return { label: "Compras", tone: "bg-amber-100", iconTone: "text-amber-600", icon: () => null };
    return { label: "Padrão", tone: "bg-slate-100", iconTone: "text-slate-600", icon: () => null };
  },
  type: {},
}));

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  refetch.mockReset().mockResolvedValue(undefined);
  createCategory.mockReset().mockResolvedValue({ status: 201, data: { id: 3, name: "Lazer", icon: "shopping-cart" } });
  updateCategory.mockReset().mockResolvedValue({ status: 200, data: { id: 1, name: "Mercado", icon: "shopping-cart" } });
  deleteCategory.mockReset().mockResolvedValue({ status: 204 });
  useAuth.mockReturnValue({
    status: "authenticated",
    user: { id: 1, name: "Joao", email: "joao@example.com", active: true },
  });
  useCategories.mockReturnValue({
    categories: [
      { id: 1, name: "Transporte", icon: "car" },
      { id: 2, name: "Alimentação", icon: null },
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

describe("CategoriesPage", () => {
  it("creates a category and refreshes the list", async () => {
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.click(screen.getByRole("button", { name: /Nova Categoria/i }));
    await user.type(screen.getByPlaceholderText("Ex: Transporte"), "Lazer");
    fireEvent.change(screen.getByDisplayValue("Padrão"), { target: { value: "shopping-cart" } });
    await user.click(screen.getByRole("button", { name: /Criar Categoria/i }));

    await waitFor(() => {
      expect(createCategory).toHaveBeenCalledWith({ name: "Lazer", icon: "shopping-cart" });
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByText('Categoria "Lazer" criada com sucesso.')).toBeInTheDocument();
    });
  });

  it("loads a category into the dialog and updates it", async () => {
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.click(screen.getAllByRole("button", { name: /Editar/i })[1]);

    fireEvent.change(screen.getByDisplayValue("Transporte"), { target: { value: "Mercado" } });
    fireEvent.change(screen.getByDisplayValue("Carro"), { target: { value: "shopping-cart" } });

    await user.click(screen.getByRole("button", { name: /Salvar Alterações/i }));

    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith(1, { name: "Mercado", icon: "shopping-cart" });
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("deletes a category after confirmation", async () => {
    const user = userEvent.setup();

    render(<CategoriesPage />);

    await user.click(screen.getAllByRole("button", { name: /Excluir/i })[1]);

    await waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith(1);
      expect(refetch).toHaveBeenCalled();
    });
  });
});

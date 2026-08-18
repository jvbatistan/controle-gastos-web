import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestionsPage from "@/app/suggestions/page";

const push = vi.fn();
const replace = vi.fn();
const rejectClassificationSuggestion = vi.fn();
const applyClassificationSuggestion = vi.fn();
const refetch = vi.fn();
const useClassificationSuggestions = vi.fn();
const useCategories = vi.fn();
const useAuth = vi.fn();
const useSearchParams = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => useSearchParams(),
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
}));

vi.mock("@/features/classification-suggestions", () => ({
  useClassificationSuggestions: (...args: unknown[]) => useClassificationSuggestions(...args),
  rejectClassificationSuggestion: (...args: unknown[]) => rejectClassificationSuggestion(...args),
  applyClassificationSuggestion: (...args: unknown[]) => applyClassificationSuggestion(...args),
}));

const suggestion = {
  id: 10,
  confidence: 0.6,
  source: "rule" as const,
  suggested_category: { id: 1, name: "Transporte" },
  financial_transaction: {
    id: 99,
    description: "UBER TRIP 1234",
    date: "2026-03-23",
    value: 32.9,
    kind: "expense" as const,
    category: null,
    installment_group_id: "grp-1",
    installment_number: 1,
    installments_count: 3,
    classification_status: "suggestion_pending" as const,
  },
};

beforeEach(() => {
  push.mockReset();
  replace.mockReset();
  rejectClassificationSuggestion.mockReset().mockResolvedValue({});
  applyClassificationSuggestion.mockReset().mockResolvedValue({});
  refetch.mockReset().mockResolvedValue(undefined);
  useAuth.mockReturnValue({ status: "authenticated" });
  useSearchParams.mockReturnValue({ get: (key: string) => (key === "suggestion" ? "10" : null) });
  useCategories.mockReturnValue({
    categories: [
      { id: 1, name: "Transporte" },
      { id: 2, name: "Alimentação" },
    ],
    loading: false,
    error: null,
  });
});

describe("SuggestionsPage", () => {
  it("uses the URL page, displays total_count, and navigates without dropping the selected suggestion", async () => {
    const user = userEvent.setup();
    useSearchParams.mockReturnValue({ get: (key: string) => ({ suggestion: "10", page: "2" })[key] ?? null });
    useClassificationSuggestions.mockReturnValue({ suggestions: [suggestion], pagination: { page: 2, per_page: 25, total_count: 51, total_pages: 3 }, loading: false, error: null, refetch });
    render(<SuggestionsPage />);
    expect(useClassificationSuggestions).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    expect(screen.getByText("51 sugestões")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    expect(push).toHaveBeenCalledWith("/suggestions?page=3");
  });

  it("disables pagination at its boundaries", () => {
    useClassificationSuggestions.mockReturnValue({ suggestions: [suggestion], pagination: { page: 1, per_page: 25, total_count: 26, total_pages: 2 }, loading: false, error: null, refetch });
    render(<SuggestionsPage />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });
  it("renders the empty state when there are no pending suggestions", () => {
    useClassificationSuggestions.mockReturnValue({
      suggestions: [],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    expect(screen.getByText("Nenhuma sugestão pendente")).toBeInTheDocument();
  });

  it("applies only to this purchase with the suggested category and refreshes the list", async () => {
    const user = userEvent.setup();

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    await user.click(screen.getByRole("button", { name: /Aplicar só nesta compra/i }));

    await waitFor(() => {
      expect(applyClassificationSuggestion).toHaveBeenCalledWith(10, 1, false);
      expect(refetch).toHaveBeenCalled();
    });
    expect(screen.getByText("Categoria aplicada somente nesta compra.")).toBeInTheDocument();
  });

  it("teaches Finch with the selected category and refreshes the list", async () => {
    const user = userEvent.setup();

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    fireEvent.change(screen.getByDisplayValue("Transporte"), {
      target: { value: "2" },
    });

    await user.click(screen.getByRole("button", { name: /Ensinar o Finch/i }));

    await waitFor(() => {
      expect(applyClassificationSuggestion).toHaveBeenCalledWith(10, 2, true);
      expect(refetch).toHaveBeenCalled();
    });
    expect(screen.getByText("Finch aprendeu esta categoria para próximas compras semelhantes.")).toBeInTheDocument();
  });

  it("shows loading while teaching Finch", async () => {
    const user = userEvent.setup();
    let resolveApply: (value: unknown) => void = () => undefined;
    applyClassificationSuggestion.mockReturnValue(
      new Promise((resolve) => {
        resolveApply = resolve;
      })
    );

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    await user.click(screen.getByRole("button", { name: /Ensinar o Finch/i }));

    expect(screen.getByRole("button", { name: /Ensinando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Aplicar só nesta compra/i })).toBeDisabled();

    resolveApply({});

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Ensinar o Finch/i })).not.toBeDisabled();
    });
  });

  it("shows the API error when applying fails", async () => {
    const user = userEvent.setup();
    applyClassificationSuggestion.mockRejectedValue(new Error("Categoria inválida"));

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    await user.click(screen.getByRole("button", { name: /Aplicar só nesta compra/i }));

    expect(await screen.findByText("Categoria inválida")).toBeInTheDocument();
    expect(refetch).not.toHaveBeenCalled();
  });

  it("keeps rejecting suggestions as a separate flow", async () => {
    const user = userEvent.setup();

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    await user.click(screen.getByRole("button", { name: /Rejeitar sugestão/i }));

    await waitFor(() => {
      expect(rejectClassificationSuggestion).toHaveBeenCalledWith(10);
      expect(refetch).toHaveBeenCalled();
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuggestionsPage from "@/app/suggestions/page";

const push = vi.fn();
const replace = vi.fn();
const acceptClassificationSuggestion = vi.fn();
const rejectClassificationSuggestion = vi.fn();
const correctClassificationSuggestion = vi.fn();
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
  useClassificationSuggestions: () => useClassificationSuggestions(),
  acceptClassificationSuggestion: (...args: unknown[]) => acceptClassificationSuggestion(...args),
  rejectClassificationSuggestion: (...args: unknown[]) => rejectClassificationSuggestion(...args),
  correctClassificationSuggestion: (...args: unknown[]) => correctClassificationSuggestion(...args),
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
  acceptClassificationSuggestion.mockReset().mockResolvedValue({});
  rejectClassificationSuggestion.mockReset().mockResolvedValue({});
  correctClassificationSuggestion.mockReset().mockResolvedValue({});
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

  it("accepts a suggestion and refreshes the list", async () => {
    const user = userEvent.setup();

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    await user.click(screen.getByRole("button", { name: /Aceitar sugestão/i }));

    await waitFor(() => {
      expect(acceptClassificationSuggestion).toHaveBeenCalledWith(10);
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("corrects a suggestion with the selected category", async () => {
    const user = userEvent.setup();

    useClassificationSuggestions.mockReturnValue({
      suggestions: [suggestion],
      loading: false,
      error: null,
      refetch,
    });

    render(<SuggestionsPage />);

    fireEvent.change(screen.getByDisplayValue("Escolha a categoria correta"), {
      target: { value: "2" },
    });

    await user.click(screen.getByRole("button", { name: /Corrigir categoria/i }));

    await waitFor(() => {
      expect(correctClassificationSuggestion).toHaveBeenCalledWith(10, 2);
      expect(refetch).toHaveBeenCalled();
    });
  });
});

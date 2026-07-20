import { createAccountTransfer, fetchAccountTransfers, reverseAccountTransfer } from "@/features/accounts/services/account-transfers.service";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: vi.fn(),
}));

const apiMock = vi.mocked(api);

const transfer = {
  id: 10,
  from_account: { id: 1, name: "Nubank" },
  to_account: { id: 2, name: "Poupança" },
  amount: "200.0",
  transferred_on: "2026-07-18",
  description: "Reserva do mês",
  note: "Movido para poupança",
  status: "completed" as const,
  created_at: "2026-07-18T10:00:00Z",
  updated_at: "2026-07-18T10:00:00Z",
};

beforeEach(() => {
  apiMock.mockReset();
});

describe("account transfer services", () => {
  it("fetches account transfers", async () => {
    apiMock.mockResolvedValueOnce([transfer]);

    const result = await fetchAccountTransfers();

    expect(apiMock).toHaveBeenCalledWith("/api/account_transfers", {
      cache: "no-store",
      signal: undefined,
    });
    expect(result).toEqual({ status: 200, data: [transfer] });
  });

  it("creates an account transfer with the expected payload", async () => {
    apiMock.mockResolvedValueOnce(transfer);

    const payload = {
      from_account_id: 1,
      to_account_id: 2,
      amount: "200.00",
      transferred_on: "2026-07-18",
      description: "Reserva",
      note: "Mês",
    };

    const result = await createAccountTransfer(payload);

    expect(apiMock).toHaveBeenCalledWith("/api/account_transfers", {
      method: "POST",
      body: JSON.stringify({ account_transfer: payload }),
      cache: "no-store",
    });
    expect(result).toEqual({ status: 201, data: transfer });
  });

  it("reverses an account transfer by endpoint", async () => {
    apiMock.mockResolvedValueOnce({ ...transfer, status: "reversed" });

    const result = await reverseAccountTransfer(10);

    expect(apiMock).toHaveBeenCalledWith("/api/account_transfers/10/reverse", {
      method: "PATCH",
      cache: "no-store",
    });
    expect(result.data?.status).toBe("reversed");
  });

  it("propagates API errors", async () => {
    apiMock.mockRejectedValueOnce(new Error("Conta não encontrada."));

    await expect(createAccountTransfer({
      from_account_id: 1,
      to_account_id: 2,
      amount: "200.00",
      transferred_on: "2026-07-18",
    })).rejects.toThrow("Conta não encontrada.");
  });

  it("returns unauthorized status when API error includes 401", async () => {
    apiMock.mockRejectedValueOnce(new Error("HTTP 401"));

    await expect(fetchAccountTransfers()).resolves.toEqual({ status: 401, data: [] });
  });
});

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Pencil, Plus, RotateCcw, Wallet, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTriggerHTML } from "@/components/ui/select";
import {
  archiveAccount,
  createAccount,
  restoreAccount,
  updateAccount,
  useAccounts,
  type Account,
  type AccountKind,
} from "@/features/accounts";
import { useAuth } from "@/lib/useAuth";

const accountKindOptions: Array<{ value: AccountKind; label: string }> = [
  { value: "checking", label: "Conta corrente" },
  { value: "savings", label: "Poupança" },
  { value: "wallet", label: "Carteira" },
  { value: "digital_wallet", label: "Carteira digital" },
  { value: "other", label: "Outra" },
];

const initialForm = {
  name: "",
  kind: "checking" as AccountKind,
  initial_balance: "0",
  initial_balance_date: new Date().toISOString().slice(0, 10),
};

function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString("pt-BR");
}

function kindLabel(kind: AccountKind) {
  return accountKindOptions.find((option) => option.value === kind)?.label ?? kind;
}

function parseMoney(value: string) {
  const input = value.trim();
  const normalized = input.includes(",") ? input.replace(/\./g, "").replace(",", ".") : input;
  return Number(normalized || "0");
}

export default function AccountsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => router.replace("/login"), [router]);

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/login");
  }, [auth.status, router]);

  const activeAccounts = useAccounts({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
  });
  const archivedAccounts = useAccounts({
    enabled: auth.status === "authenticated",
    onUnauthorized: handleUnauthorized,
    archived: true,
  });

  const availablePatrimony = useMemo(
    () => activeAccounts.accounts.reduce((sum, account) => sum + Number(account.current_balance), 0),
    [activeAccounts.accounts]
  );
  const walletAccountsCount = useMemo(
    () => activeAccounts.accounts.filter((account) => account.kind === "wallet" || account.kind === "digital_wallet").length,
    [activeAccounts.accounts]
  );

  function resetForm() {
    setForm(initialForm);
    setEditingAccount(null);
    setIsDialogOpen(false);
  }

  function openCreateDialog() {
    setEditingAccount(null);
    setForm(initialForm);
    setActionError(null);
    setMessage(null);
    setIsDialogOpen(true);
  }

  function startEdit(account: Account) {
    setEditingAccount(account);
    setForm({
      name: account.name,
      kind: account.kind,
      initial_balance: String(account.initial_balance),
      initial_balance_date: account.initial_balance_date,
    });
    setActionError(null);
    setMessage(null);
    setIsDialogOpen(true);
  }

  async function refetchAll() {
    await Promise.all([activeAccounts.refetch(), archivedAccounts.refetch()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        kind: form.kind,
        initial_balance: parseMoney(form.initial_balance),
        initial_balance_date: form.initial_balance_date,
      };

      if (editingAccount) {
        const result = await updateAccount(editingAccount.id, payload);
        if (result.status === 401) {
          handleUnauthorized();
          return;
        }
        setMessage("Conta atualizada com sucesso.");
      } else {
        const result = await createAccount(payload);
        if (result.status === 401) {
          handleUnauthorized();
          return;
        }
        setMessage("Conta criada com sucesso.");
      }

      resetForm();
      await refetchAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível salvar a conta.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive(account: Account) {
    const confirmed = window.confirm(`Arquivar a conta "${account.name}"?`);
    if (!confirmed) return;

    setActionError(null);
    setMessage(null);

    try {
      const result = await archiveAccount(account.id);
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage("Conta arquivada com sucesso.");
      await refetchAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível arquivar a conta.");
    }
  }

  async function handleRestore(account: Account) {
    setActionError(null);
    setMessage(null);

    try {
      const result = await restoreAccount(account.id);
      if (result.status === 401) {
        handleUnauthorized();
        return;
      }
      setMessage("Conta restaurada com sucesso.");
      await refetchAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível restaurar a conta.");
    }
  }

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Contas</h1>
          <p className="mt-1 text-sm text-neutral-500 sm:text-base">Gerencie onde seu dinheiro está.</p>
        </div>
        <Button type="button" onClick={openCreateDialog} className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      {message && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      )}

      {actionError && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p>
      )}

      {(activeAccounts.error || archivedAccounts.error) && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {activeAccounts.error ?? archivedAccounts.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Contas ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900 sm:text-3xl">{activeAccounts.accounts.length}</div>
            <p className="mt-1 text-xs text-neutral-500">Locais financeiros cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Patrimônio disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold sm:text-3xl ${balanceTextClass(availablePatrimony)}`}>{formatBRL(availablePatrimony)}</div>
            <p className="mt-1 text-xs text-neutral-500">Soma dos saldos atuais das contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Carteiras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 sm:text-3xl">{walletAccountsCount}</div>
            <p className="mt-1 text-xs text-neutral-500">Carteiras físicas ou digitais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas ativas</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Saldo patrimonial calculado por receitas, despesas sem cartão e pagamentos de fatura vinculados.</p>
        </CardHeader>
        <CardContent>
          {activeAccounts.loading ? (
            <p className="text-sm text-neutral-500">Carregando contas...</p>
          ) : activeAccounts.accounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
              <Wallet className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
              <h3 className="mb-2 text-lg font-medium text-neutral-900">Nenhuma conta cadastrada</h3>
              <p className="mb-4 text-neutral-500">Comece criando o local onde seu dinheiro está.</p>
              <Button type="button" onClick={openCreateDialog} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova conta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {activeAccounts.accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={startEdit}
                  onArchive={(selected) => void handleArchive(selected)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas arquivadas</CardTitle>
          <p className="mt-1 text-sm text-neutral-500">Restaure uma conta se ela voltar a ser usada.</p>
        </CardHeader>
        <CardContent>
          {archivedAccounts.loading ? (
            <p className="text-sm text-neutral-500">Carregando contas arquivadas...</p>
          ) : archivedAccounts.accounts.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhuma conta arquivada.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {archivedAccounts.accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  archived
                  onRestore={(selected) => void handleRestore(selected)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{editingAccount ? "Editar conta" : "Nova conta"}</h2>
                <p className="mt-1 text-sm text-neutral-500">Informe o local financeiro e o saldo inicial conhecido.</p>
              </div>
              <button type="button" onClick={resetForm} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800">Nome</label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex: Nubank"
                  disabled={submitting}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-800">Tipo</label>
                  <Select value={form.kind} onValueChange={(value) => setForm((current) => ({ ...current, kind: value as AccountKind }))}>
                    <SelectTriggerHTML
                      placeholder="Selecione o tipo"
                      options={accountKindOptions}
                      className="h-11 rounded-xl"
                    />
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-800">Data do saldo inicial</label>
                  <Input
                    type="date"
                    value={form.initial_balance_date}
                    onChange={(event) => setForm((current) => ({ ...current, initial_balance_date: event.target.value }))}
                    disabled={submitting}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800">Saldo inicial</label>
                <Input
                  value={form.initial_balance}
                  onChange={(event) => setForm((current) => ({ ...current, initial_balance: event.target.value }))}
                  placeholder="0,00"
                  inputMode="decimal"
                  disabled={submitting}
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-neutral-500">Saldo inicial não é receita e não entra no dashboard como income.</p>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {submitting ? "Salvando..." : editingAccount ? "Salvar alterações" : "Criar conta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function AccountCard({
  account,
  archived = false,
  onEdit,
  onArchive,
  onRestore,
}: {
  account: Account;
  archived?: boolean;
  onEdit?: (account: Account) => void;
  onArchive?: (account: Account) => void;
  onRestore?: (account: Account) => void;
}) {
  const currentBalance = Number(account.current_balance);

  return (
    <div className="rounded-2xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-950">{account.name}</p>
            <p className="text-sm text-neutral-500">{kindLabel(account.kind)}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${archived ? "bg-neutral-100 text-neutral-600" : "bg-emerald-50 text-emerald-700"}`}>
          {archived ? "Arquivada" : "Ativa"}
        </span>
      </div>

      <div className="mb-3 rounded-xl bg-neutral-50 p-3">
        <p className="text-xs text-neutral-500">Saldo atual</p>
        <p className={`mt-1 text-2xl font-bold tabular-nums ${balanceTextClass(currentBalance)}`}>{formatBRL(account.current_balance)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-100 p-3">
        <div>
          <p className="text-xs text-neutral-500">Saldo inicial</p>
          <p className="mt-1 font-bold text-neutral-950 tabular-nums">{formatBRL(account.initial_balance)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Data inicial</p>
          <p className="mt-1 font-bold text-neutral-950">{formatDateBR(account.initial_balance_date)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!archived && onEdit && (
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(account)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
        {!archived && onArchive && (
          <Button type="button" variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => onArchive(account)}>
            <Archive className="mr-2 h-4 w-4" />
            Arquivar
          </Button>
        )}
        {archived && onRestore && (
          <Button type="button" variant="outline" size="sm" className="text-emerald-700 hover:bg-emerald-50" onClick={() => onRestore(account)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>
        )}
      </div>
    </div>
  );
}

function balanceTextClass(value: number) {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-rose-600";

  return "text-neutral-700";
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { updateProfile } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const authName = auth.status === "authenticated" ? auth.user.name : null;
  const authEmail = auth.status === "authenticated" ? auth.user.email : null;
  const authActive = auth.status === "authenticated" ? auth.user.active : false;

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (authName && authEmail) {
      setName(authName);
      setEmail(authEmail);
    }
  }, [auth.status, authName, authEmail, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      const user = await updateProfile({ name, email });
      setName(user.name);
      setEmail(user.email);
      setSuccess("Perfil atualizado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header onMenuClick={() => setIsMobileNavOpen(true)} />

      <div className="flex">
        <Navigation isMobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Meu perfil</h1>
              <p className="mt-1 text-neutral-500">
                Atualize seus dados pessoais usados no acesso e na identificacao da conta.
              </p>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Nome</label>
                    <input
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Email</label>
                    <input
                      className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>

                  {success && (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {success}
                    </p>
                  )}

                  {error && (
                    <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                      {saving ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </div>
                </form>
              </div>

              <aside className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-neutral-900 px-5 py-6 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-300">Conta</p>
                  <p className="mt-3 text-2xl font-semibold">{authName}</p>
                  <p className="mt-1 text-sm text-neutral-300">{authEmail}</p>
                </div>

                <div className="mt-5 space-y-4 text-sm text-neutral-600">
                  <div className="rounded-2xl border border-neutral-200 px-4 py-4">
                    <p className="font-medium text-neutral-900">Status do acesso</p>
                    <p className="mt-1">
                      {authActive ? "Conta ativa e pronta para uso." : "Conta inativa no momento."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 px-4 py-4">
                    <p className="font-medium text-neutral-900">Próximos passos</p>
                    <p className="mt-1">
                      Em breve vamos adicionar configuracoes mais completas de conta, perfis e preferencias.
                    </p>
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

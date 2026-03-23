"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { register } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";

const initialForm = {
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.status === "authenticated") router.replace("/dashboard");
  }, [auth.status, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-neutral-900">Finch</h1>
            <Image src="/finch.png" alt="Finch Logo" width={32} height={32} className="ml-2" />
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Crie seu acesso e comece a organizar a vida financeira.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">Criar conta</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Seu perfil precisa de nome, email e senha. O cadastro fica sujeito ao limite atual de usuarios liberados.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Nome</label>
              <input
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Ex: Joao Vitor"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <input
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                type="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Senha</label>
                <input
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimo de 6 caracteres"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Confirmar senha</label>
                <input
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  value={form.passwordConfirmation}
                  onChange={(e) => setForm((current) => ({ ...current, passwordConfirmation: e.target.value }))}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            <span>Ja tem conta? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

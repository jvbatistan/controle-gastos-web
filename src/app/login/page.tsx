"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* “Header” inspirado no Figma */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Finch 🐦</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Controle suas finanças pessoais
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Entrar</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Acesse sua conta para continuar.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Senha</label>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-6">
          © {new Date().getFullYear()} Finch 🐦
        </p>
      </div>
    </div>
  );
}

"use client";

import { Bell, Plus, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

type HeaderProps = {
  onNewTransactionClick?: () => void;
};

export function Header({ onNewTransactionClick }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="h-[73px] border-b bg-white sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div>
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-1">
            Finch <span>🐦</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Controle suas finanças pessoais
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          {/* Nova Transação */}
          <button
            type="button"
            onClick={onNewTransactionClick}
            className="
              inline-flex items-center gap-2
              rounded-lg bg-blue-600 px-4 py-2
              text-sm font-medium text-white
              hover:bg-blue-700 transition
            "
          >
            <Plus className="h-4 w-4" />
            Nova Transação
          </button>

          {/* Notificações */}
          <button
            className="
              h-9 w-9 rounded-lg border
              flex items-center justify-center
              hover:bg-neutral-100 transition
            "
          >
            <Bell className="h-5 w-5 text-neutral-600" />
          </button>

          {/* Avatar */}
          <div
            className="
              h-9 w-9 rounded-full
              bg-neutral-200
              flex items-center justify-center
              text-sm font-medium text-neutral-700
            "
            title="Usuário"
          >
            JV
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              h-9 w-9 rounded-lg border
              flex items-center justify-center
              hover:bg-rose-50 hover:text-rose-600
              transition
            "
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

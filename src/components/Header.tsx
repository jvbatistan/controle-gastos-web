"use client";

import Link from "next/link";
import { Bell, Menu, Plus, Settings, User, LogOut, Hammer } from "lucide-react";
import { logout } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  onNewTransactionClick?: () => void;
  onMenuClick?: () => void;
};

export function Header({ onNewTransactionClick, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const auth = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const accountName = auth.status === "authenticated" ? auth.user.name : "Minha Conta";
  const accountEmail = auth.status === "authenticated" ? auth.user.email : "";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <Link href="/" className="flex gap-2">
                <h1 className="truncate text-lg font-bold leading-tight text-neutral-900 sm:text-xl">
                  Finch
                </h1>
                <Image
                  src="/finch.png"
                  alt="Finch Logo"
                  width={28}
                  height={28}
                  className="shrink-0"
                />
              </Link>
            </div>
            <div className="min-w-0">
              <p className="hidden text-sm text-neutral-500 sm:block">
                Controle suas finanças pessoais
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNewTransactionClick && (
            <button
              type="button"
              onClick={onNewTransactionClick}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          )}

          <button
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 transition hover:bg-neutral-100 sm:inline-flex"
            type="button"
            aria-label="Notificacoes"
          >
            <Bell className="h-4 w-4 text-neutral-600" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-100"
                aria-label="Minha conta"
              >
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">{accountName}</p>
                  {accountEmail && <p className="text-xs font-normal text-neutral-500">{accountEmail}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="items-start text-neutral-400 hover:bg-transparent">
                <span className="mt-0.5 flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm">Configurações</span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    <Hammer className="h-3 w-3" />
                    Em construção
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import {
  X,
  Home,
  CreditCard,
  PieChart,
  Sparkles,
  TrendingUp,
  Calendar,
  Settings,
  User,
  LogOut,
  Hammer,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, enabled: true },
  { href: "/transactions", label: "Transações", icon: CreditCard, enabled: true },
  { href: "/suggestions", label: "Sugestões", icon: Sparkles, enabled: true },
  { href: "/categories", label: "Categorias", icon: PieChart, enabled: true },
  { href: "/cards", label: "Cartões", icon: Wallet, enabled: true },
  { href: "", label: "Investimentos", icon: TrendingUp, enabled: false },
  { href: "", label: "Planejamento", icon: Calendar, enabled: false },
  { href: "", label: "Configurações", icon: Settings, enabled: false },
];

type NavigationProps = {
  isMobileOpen?: boolean;
  onClose?: () => void;
};

export function Navigation({ isMobileOpen = false, onClose }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    onClose?.();
    router.replace("/login");
  }

  const navLinks = (
    <div className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        const isDisabled = !item.enabled;

        if (isDisabled) {
          return (
            <div
              key={item.label}
              className="group flex items-start gap-3 rounded-xl px-4 py-3 text-neutral-400"
              aria-disabled="true"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <span className="text-sm">{item.label}</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                      <Hammer className="h-3 w-3" />
                      Em construção
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className={[
              "group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
              active
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-neutral-700 hover:bg-neutral-50",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                active
                  ? "bg-transparent text-blue-600"
                  : "bg-transparent text-neutral-500",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
            </div>

            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  const profileActive = pathname === "/profile";

  return (
    <>
      <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-56 border-r border-neutral-200 bg-white lg:block">
        <div className="p-3">{navLinks}</div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-label="Fechar menu"
          />

          <aside className="relative h-full w-[18.5rem] max-w-[85vw] border-r border-neutral-200 bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-[2rem] font-bold leading-none text-neutral-900">Menu</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-t border-neutral-100 p-3">{navLinks}</div>
            <div className="mt-2 border-t border-neutral-100 px-3 pt-4">
              <Link
                href="/profile"
                onClick={onClose}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                  profileActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-neutral-700 hover:bg-neutral-50",
                ].join(" ")}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm">Perfil</span>
              </Link>
              <div className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-neutral-400">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm">Configurações</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                      <Hammer className="h-3 w-3" />
                      Em construção
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-rose-600 transition hover:bg-rose-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

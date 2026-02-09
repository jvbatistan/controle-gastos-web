"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  PieChart,
  TrendingUp,
  Calendar,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transações", icon: CreditCard },
  { href: "/categories", label: "Categorias", icon: PieChart },
  { href: "/investments", label: "Investimentos", icon: TrendingUp },
  { href: "/planning", label: "Planejamento", icon: Calendar },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-72 border-r bg-white h-[calc(100vh-73px)] sticky top-[73px]">
      <div className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-neutral-700 hover:bg-neutral-50",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                    active
                      ? "bg-white text-blue-700 border border-blue-100"
                      : "bg-neutral-100 text-neutral-600 group-hover:bg-white group-hover:border group-hover:border-neutral-200",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

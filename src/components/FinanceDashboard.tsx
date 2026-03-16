import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";

type Stat = {
  title: string;
  value: string;
  change: number; // %
  trend: "up" | "down";
  icon: React.ReactNode;
};

function StatCard({ title, value, change, trend, icon }: Stat) {
  const positive = trend === "up";

  return (
    <div className="h-fit w-full self-start rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="mt-8 text-[2rem] font-bold leading-tight text-neutral-950">{value}</p>

          <div className="mt-2 flex items-center text-xs">
            {positive ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-600 mr-1" />
            )}

            <span className={positive ? "text-emerald-600" : "text-rose-600"}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1 text-neutral-500">
              em relação ao mês anterior
            </span>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function FinanceDashboard() {
  const stats: Stat[] = [
    {
      title: "Saldo Total",
      value: "R$ 12.450,00",
      change: 8.2,
      trend: "up",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: "Receitas",
      value: "R$ 8.500,00",
      change: 5.1,
      trend: "up",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: "Despesas",
      value: "R$ 5.230,00",
      change: 12.3,
      trend: "down",
      icon: <TrendingDown className="h-5 w-5" />,
    },
    {
      title: "Economia Mensal",
      value: "R$ 3.270,00",
      change: 15.5,
      trend: "up",
      icon: <Target className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.title} {...s} />
      ))}
    </div>
  );
}

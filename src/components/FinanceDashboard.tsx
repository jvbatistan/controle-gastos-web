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
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm h-fit self-start w-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2 leading-tight">{value}</p>

          <div className="flex items-center text-xs mt-2">
            {positive ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-600 mr-1" />
            )}

            <span className={positive ? "text-emerald-600" : "text-rose-600"}>
              {Math.abs(change)}%
            </span>
            <span className="text-muted-foreground ml-1">
              em relação ao mês anterior
            </span>
          </div>
        </div>

        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s) => (
        <StatCard key={s.title} {...s} />
      ))}
    </div>
  );
}

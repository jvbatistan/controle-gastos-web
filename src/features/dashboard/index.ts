export { useDashboard } from "./hooks/useDashboard";
export { fetchDashboard, type DashboardCompetence } from "./services/dashboard.service";
export type {
  DashboardOverview,
  DashboardSummary,
  DashboardCardTotal,
  DashboardCategoryTotal,
  DashboardMonthlyTrend,
  DashboardRecentExpense,
  DashboardStatement,
} from "./types/dashboard.types";

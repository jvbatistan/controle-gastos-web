import {
  Bus,
  Car,
  Film,
  GraduationCap,
  HeartPulse,
  Home,
  LucideIcon,
  PieChart,
  Shirt,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
} from "lucide-react";

export type CategoryIconOption = {
  value: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  iconTone: string;
};

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: "pie-chart", label: "Padrão", icon: PieChart, tone: "bg-slate-100", iconTone: "text-slate-600" },
  { value: "car", label: "Carro", icon: Car, tone: "bg-blue-100", iconTone: "text-blue-600" },
  { value: "bus", label: "Ônibus", icon: Bus, tone: "bg-cyan-100", iconTone: "text-cyan-600" },
  { value: "shopping-cart", label: "Compras", icon: ShoppingCart, tone: "bg-amber-100", iconTone: "text-amber-600" },
  { value: "utensils", label: "Alimentação", icon: Utensils, tone: "bg-rose-100", iconTone: "text-rose-600" },
  { value: "home", label: "Casa", icon: Home, tone: "bg-violet-100", iconTone: "text-violet-600" },
  { value: "heart-pulse", label: "Saúde", icon: HeartPulse, tone: "bg-emerald-100", iconTone: "text-emerald-600" },
  { value: "graduation-cap", label: "Educação", icon: GraduationCap, tone: "bg-indigo-100", iconTone: "text-indigo-600" },
  { value: "film", label: "Lazer", icon: Film, tone: "bg-fuchsia-100", iconTone: "text-fuchsia-600" },
  { value: "shirt", label: "Roupas", icon: Shirt, tone: "bg-pink-100", iconTone: "text-pink-600" },
  { value: "wallet", label: "Carteira", icon: Wallet, tone: "bg-green-100", iconTone: "text-green-600" },
  { value: "smartphone", label: "Tecnologia", icon: Smartphone, tone: "bg-sky-100", iconTone: "text-sky-600" },
];

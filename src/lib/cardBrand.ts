export type CardBrandPresentation = {
  normalizedName: string;
  displayName: string;
  logoSrc: string | null;
  logoAlt: string | null;
  shortLabel: string;
  solidColor: string;
  softClassName: string;
  textClassName: string;
  ringClassName: string;
  gradientClassName: string;
};

type BrandConfig = Omit<CardBrandPresentation, "displayName" | "normalizedName"> & {
  aliases: string[];
};

const fallbackPalette = [
  {
    solidColor: "#2563eb",
    softClassName: "bg-blue-50",
    textClassName: "text-blue-700",
    ringClassName: "ring-blue-200",
    gradientClassName: "from-blue-600 via-sky-500 to-cyan-400",
  },
  {
    solidColor: "#820AD1",
    softClassName: "bg-violet-50",
    textClassName: "text-violet-700",
    ringClassName: "ring-violet-200",
    gradientClassName: "from-violet-600 via-fuchsia-500 to-purple-400",
  },
  {
    solidColor: "#0f766e",
    softClassName: "bg-teal-50",
    textClassName: "text-teal-700",
    ringClassName: "ring-teal-200",
    gradientClassName: "from-teal-700 via-emerald-600 to-green-400",
  },
  {
    solidColor: "#ea580c",
    softClassName: "bg-orange-50",
    textClassName: "text-orange-700",
    ringClassName: "ring-orange-200",
    gradientClassName: "from-orange-600 via-amber-500 to-yellow-400",
  },
  {
    solidColor: "#db2777",
    softClassName: "bg-pink-50",
    textClassName: "text-pink-700",
    ringClassName: "ring-pink-200",
    gradientClassName: "from-pink-600 via-rose-500 to-red-400",
  },
  {
    solidColor: "#334155",
    softClassName: "bg-slate-100",
    textClassName: "text-slate-700",
    ringClassName: "ring-slate-300",
    gradientClassName: "from-slate-700 via-slate-600 to-slate-400",
  },
] as const;

const knownBrands: BrandConfig[] = [
  {
    aliases: ["nubank", "nu", "roxinho"],
    logoSrc: "/card-brands/nubank.svg",
    logoAlt: "Logo do Nubank",
    shortLabel: "NU",
    solidColor: "#820AD1",
    softClassName: "bg-fuchsia-50",
    textClassName: "text-fuchsia-700",
    ringClassName: "ring-fuchsia-200",
    gradientClassName: "from-fuchsia-700 via-violet-600 to-purple-500",
  },
  {
    aliases: ["inter", "inter black", "banco inter"],
    logoSrc: "/card-brands/inter.svg",
    logoAlt: "Logo do Inter",
    shortLabel: "IN",
    solidColor: "#FF7A00",
    softClassName: "bg-orange-50",
    textClassName: "text-orange-700",
    ringClassName: "ring-orange-200",
    gradientClassName: "from-orange-600 via-amber-500 to-yellow-400",
  },
  {
    aliases: ["c6", "c6 bank", "c6bank"],
    logoSrc: "/card-brands/c6.svg",
    logoAlt: "Logo do C6 Bank",
    shortLabel: "C6",
    solidColor: "#111111",
    softClassName: "bg-lime-50",
    textClassName: "text-lime-800",
    ringClassName: "ring-lime-200",
    gradientClassName: "from-neutral-900 via-neutral-800 to-lime-500",
  },
  {
    aliases: ["casas", "bahia", "casas bahia", "cb"],
    logoSrc: "/card-brands/cb.svg",
    logoAlt: "Logo da CB",
    shortLabel: "CB",
    solidColor: "#0A61AE",
    softClassName: "bg-lime-50",
    textClassName: "text-lime-800",
    ringClassName: "ring-lime-200",
    gradientClassName: "from-neutral-900 via-neutral-800 to-lime-500",
  },
  {
    aliases: ["pan", "banco pan"],
    logoSrc: "/card-brands/banco-pan.svg",
    logoAlt: "Logo do Banco PAN",
    shortLabel: "PA",
    solidColor: "#0057ff",
    softClassName: "bg-blue-50",
    textClassName: "text-blue-700",
    ringClassName: "ring-blue-200",
    gradientClassName: "from-blue-600 via-sky-500 to-cyan-400",
  },
  {
    aliases: ["itau", "itau click", "itaú"],
    logoSrc: "/card-brands/itau.svg",
    logoAlt: "Logo do Itaú",
    shortLabel: "IT",
    solidColor: "#ec7000",
    softClassName: "bg-orange-50",
    textClassName: "text-orange-700",
    ringClassName: "ring-orange-200",
    gradientClassName: "from-orange-600 via-amber-500 to-yellow-400",
  },
  {
    aliases: ["iti"],
    logoSrc: "/card-brands/iti.svg",
    logoAlt: "Logo do Iti",
    shortLabel: "IT",
    solidColor: "#ec7000",
    softClassName: "bg-orange-50",
    textClassName: "text-orange-700",
    ringClassName: "ring-orange-200",
    gradientClassName: "from-orange-600 via-amber-500 to-yellow-400",
  },
  {
    aliases: ["digio"],
    logoSrc: "/card-brands/digio.svg",
    logoAlt: "Logo do Digio",
    shortLabel: "DI",
    solidColor: "#1D2C5C",
    softClassName: "bg-emerald-50",
    textClassName: "text-emerald-700",
    ringClassName: "ring-emerald-200",
    gradientClassName: "from-emerald-600 via-teal-500 to-green-400",
  },
  {
    aliases: ["recargapay", "recarga pay"],
    logoSrc: "/card-brands/recargapay.svg",
    logoAlt: "Logo do RecargaPay",
    shortLabel: "RP",
    solidColor: "#0A427E",
    softClassName: "bg-emerald-50",
    textClassName: "text-emerald-700",
    ringClassName: "ring-emerald-200",
    gradientClassName: "from-emerald-600 via-teal-500 to-green-400",
  },
  {
    aliases: ["renner", "lojas renner"],
    logoSrc: "/card-brands/renner.svg",
    logoAlt: "Logo da Renner",
    shortLabel: "RE",
    solidColor: "#D71A20",
    softClassName: "bg-emerald-50",
    textClassName: "text-emerald-700",
    ringClassName: "ring-emerald-200",
    gradientClassName: "from-emerald-600 via-teal-500 to-green-400",
  },
  {
    aliases: ["will", "will bank"],
    logoSrc: "/card-brands/will.svg",
    logoAlt: "Logo do Will Bank",
    shortLabel: "WI",
    solidColor: "#FFD900",
    softClassName: "bg-teal-50",
    textClassName: "text-teal-700",
    ringClassName: "ring-teal-200",
    gradientClassName: "from-teal-700 via-emerald-600 to-green-400",
  },
];

export function normalizeCardBrandName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function fallbackShortLabel(name: string) {
  const tokens = name.split(" ").filter(Boolean);
  if (tokens.length === 0) return "CC";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase();
}

function fallbackTheme(seed: string) {
  const index = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % fallbackPalette.length;
  return fallbackPalette[index];
}

export function getCardBrandPresentation(cardName: string): CardBrandPresentation {
  const displayName = cardName.trim() || "Cartao";
  const normalizedName = normalizeCardBrandName(displayName);
  const known = knownBrands.find((brand) => brand.aliases.some((alias) => normalizedName.includes(alias)));

  if (known) {
    return {
      normalizedName,
      displayName,
      logoSrc: known.logoSrc,
      logoAlt: known.logoAlt,
      shortLabel: known.shortLabel,
      solidColor: known.solidColor,
      softClassName: known.softClassName,
      textClassName: known.textClassName,
      ringClassName: known.ringClassName,
      gradientClassName: known.gradientClassName,
    };
  }

  const fallback = fallbackTheme(normalizedName || displayName);

  return {
    normalizedName,
    displayName,
    logoSrc: null,
    logoAlt: null,
    shortLabel: fallbackShortLabel(normalizedName || displayName),
    solidColor: fallback.solidColor,
    softClassName: fallback.softClassName,
    textClassName: fallback.textClassName,
    ringClassName: fallback.ringClassName,
    gradientClassName: fallback.gradientClassName,
  };
}

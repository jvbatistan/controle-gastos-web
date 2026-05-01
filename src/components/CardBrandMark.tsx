"use client";

import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import { getCardBrandPresentation } from "@/lib/cardBrand";

type CardBrandMarkProps = {
  cardName: string;
  size?: "sm" | "md" | "lg";
  emphasize?: boolean;
};

export function CardBrandMark({ cardName, size = "md", emphasize = false }: CardBrandMarkProps) {
  const brand = useMemo(() => getCardBrandPresentation(cardName), [cardName]);
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  const imageFailed = Boolean(brand.logoSrc && failedLogoSrc === brand.logoSrc);

  const sizeClasses = {
    sm: {
      shell: "h-10 w-10 rounded-xl",
      inner: "rounded-[10px]",
      icon: "h-4 w-4",
      text: "text-[10px]",
      imagePadding: "p-1.5",
    },
    md: {
      shell: "h-12 w-12 rounded-2xl",
      inner: "rounded-[14px]",
      icon: "h-5 w-5",
      text: "text-xs",
      imagePadding: "p-2",
    },
    lg: {
      shell: "h-14 w-14 rounded-[20px]",
      inner: "rounded-[16px]",
      icon: "h-6 w-6",
      text: "text-sm",
      imagePadding: "p-2.5",
    },
  }[size];

  const shouldInvertLogo = !brand.normalizedName.includes("will");

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden ring-1 ring-inset",
        sizeClasses.shell,
        brand.softClassName,
        brand.ringClassName,
        emphasize ? "shadow-lg shadow-neutral-200/70" : "shadow-sm shadow-neutral-200/70",
      ].join(" ")}
      aria-label={`Identidade visual do cartão ${cardName}`}
    >
      <div
        className={[
          "flex h-full w-full items-center justify-center overflow-hidden text-white",
          sizeClasses.inner,
        ].join(" ")}
        style={{ backgroundColor: brand.solidColor }}
      >
        {brand.logoSrc && !imageFailed ? (
          <Image
            src={brand.logoSrc}
            alt={brand.logoAlt ?? `Logo do emissor ${cardName}`}
            width={56}
            height={56}
            className={[
              "h-full w-full object-contain",
              shouldInvertLogo ? "brightness-0 invert" : "",
              sizeClasses.imagePadding,
            ].join(" ")}
            loading="lazy"
            onError={() => setFailedLogoSrc(brand.logoSrc ?? null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-white">
            <CreditCard className={sizeClasses.icon} aria-hidden="true" />
            <span className={`font-semibold tracking-[0.18em] ${sizeClasses.text}`}>{brand.shortLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

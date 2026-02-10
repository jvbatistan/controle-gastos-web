"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value?: string;
  onValueChange?: (v: string) => void;
};

const SelectContext = React.createContext<SelectContextValue>({});

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  // só aparece no Trigger (placeholder visual)
  return (
    <span className="text-sm text-neutral-500">{placeholder ?? "Selecione"}</span>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  // não renderiza nada aqui — o conteúdo real fica dentro do <select> abaixo
  return <>{children}</>;
}

export function SelectItem({
  value,
  disabled,
  children,
}: {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  // usado pelo nosso SelectTriggerHTML
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}

/**
 * ATALHO: Use este componente no lugar do conjunto Trigger/Content se quiser.
 * Mas pra compatibilidade com Figma, vamos montar o <select> diretamente no Trigger.
 */
export function SelectTriggerHTML({
  className,
  placeholder = "Selecione",
  options,
}: {
  className?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}) {
  const ctx = React.useContext(SelectContext);

  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
        className
      )}
      value={ctx.value ?? ""}
      onChange={(e) => ctx.onValueChange?.(e.target.value)}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

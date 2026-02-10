"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>;
}

export function DropdownMenuContent({
  className,
  align,
  children,
}: {
  className?: string;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  // placeholder (não abre/fecha ainda)
  return (
    <div className={cn("hidden", className)} data-align={align}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-2 py-1.5 text-sm", className)}>{children}</div>;
}

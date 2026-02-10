"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";
type Size = "default" | "sm" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-neutral-900 text-white hover:bg-neutral-800",
        variant === "outline" && "border border-neutral-200 bg-white hover:bg-neutral-50",
        variant === "ghost" && "hover:bg-neutral-100",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3",
        size === "icon" && "h-10 w-10",
        className
      )}
      {...props}
    />
  );
}

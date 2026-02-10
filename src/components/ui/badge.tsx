import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-neutral-900 text-white",
        variant === "secondary" && "bg-neutral-100 text-neutral-700",
        variant === "outline" && "border border-neutral-200 text-neutral-700",
        className
      )}
      {...props}
    />
  );
}

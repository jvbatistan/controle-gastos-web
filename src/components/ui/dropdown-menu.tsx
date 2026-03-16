"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DropdownContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DropdownMenuContext = React.createContext<DropdownContextValue | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used inside DropdownMenu");
  }

  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { open, setOpen } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props as { onClick?: React.MouseEventHandler };

    return React.cloneElement(child, {
      onClick: (event: React.MouseEvent) => {
        childProps.onClick?.(event);
        setOpen((value) => !value);
      },
      "aria-expanded": open,
    });
  }

  return (
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
      {children}
    </button>
  );
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
  const { open } = useDropdownMenu();

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-48 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      data-align={align}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  children,
  onClick,
  disabled,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { setOpen } = useDropdownMenu();

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onClick?.();
        setOpen(false);
      }}
      disabled={disabled}
      className={cn(
        "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-3 py-2 text-sm font-semibold text-neutral-900", className)}>{children}</div>;
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-neutral-200", className)} />;
}

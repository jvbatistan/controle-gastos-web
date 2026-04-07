"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type DropdownContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
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
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideRoot = rootRef.current?.contains(target);
      const clickedInsideContent = contentRef.current?.contains(target);

      if (!clickedInsideRoot && !clickedInsideContent) {
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
    <DropdownMenuContext.Provider value={{ open, setOpen, rootRef, triggerRef, contentRef }}>
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { open, setOpen, triggerRef } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props as { onClick?: React.MouseEventHandler };
    const existingRef = child.props.ref;

    return React.cloneElement(child, {
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;

        if (typeof existingRef === "function") existingRef(node);
        else if (existingRef && typeof existingRef === "object") {
          (existingRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      onClick: (event: React.MouseEvent) => {
        childProps.onClick?.(event);
        setOpen((value) => !value);
      },
      "aria-expanded": open,
    });
  }

  return (
    <button
      type="button"
      ref={(node) => {
        triggerRef.current = node;
      }}
      onClick={() => setOpen((value) => !value)}
      aria-expanded={open}
    >
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
  const { open, triggerRef, contentRef } = useDropdownMenu();
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number; transformOrigin: string }>({
    top: 0,
    left: 0,
    transformOrigin: "top right",
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!open || !mounted) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = 8;
      const safeMargin = 8;

      const spaceBelow = viewportHeight - triggerRect.bottom;
      const shouldOpenUp = spaceBelow < contentRect.height + offset && triggerRect.top > contentRect.height + offset;

      const top = shouldOpenUp
        ? Math.max(safeMargin, triggerRect.top - contentRect.height - offset)
        : Math.min(viewportHeight - contentRect.height - safeMargin, triggerRect.bottom + offset);

      let left = align === "end" ? triggerRect.right - contentRect.width : triggerRect.left;
      left = Math.min(Math.max(safeMargin, left), viewportWidth - contentRect.width - safeMargin);

      setPosition({
        top,
        left,
        transformOrigin: `${shouldOpenUp ? "bottom" : "top"} ${align === "end" ? "right" : "left"}`,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, mounted, open, triggerRef]);

  if (!open || !mounted) return null;

  const content = (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-[80] min-w-48 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg shadow-neutral-900/10",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: position.transformOrigin,
      }}
      data-align={align}
      role="menu"
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
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
      role="menuitem"
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

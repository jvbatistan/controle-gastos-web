"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";

type AppLayoutProps = {
  children: ReactNode;
  maxWidth?: string;
  onNewTransactionClick?: () => void;
  showNewTransaction?: boolean;
};

export function AppLayout({
  children,
  maxWidth = "max-w-[1600px]",
  onNewTransactionClick,
  showNewTransaction = true,
}: AppLayoutProps) {
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const desktopShellOffset = isSidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-60";
  const handleNewTransaction = onNewTransactionClick ?? (() => router.push("/transactions"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100/70">
      <Navigation
        isMobileOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`min-w-0 transition-[padding] duration-300 ${desktopShellOffset}`}>
        <Header
          fluid
          onMenuClick={() => setIsMobileNavOpen(true)}
          onNewTransactionClick={showNewTransaction ? handleNewTransaction : undefined}
        />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className={`mx-auto w-full ${maxWidth} space-y-6`}>{children}</div>
        </main>
      </div>
    </div>
  );
}

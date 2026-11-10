"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AppHeader } from "@/components/layout/app-header";
import { FloatingNav } from "@/components/layout/floating-nav";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { prefetchAppData } from "@/lib/query/prefetch-app-data";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuthSession();

  useEffect(() => {
    if (isLoading) return;
    prefetchAppData(queryClient, { authenticated: isAuthenticated });
  }, [queryClient, isAuthenticated, isLoading]);

  return (
    <div className="min-h-dvh bg-background text-foreground md:bg-muted/50">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background md:border-x md:border-border md:shadow-sm">
        <AppHeader />
        <main className="min-h-dvh pb-28 [padding-bottom:calc(7rem+env(safe-area-inset-bottom,0px))] pt-16">
          <div className="px-4 py-5">{children}</div>
        </main>
        <FloatingNav />
      </div>
    </div>
  );
}

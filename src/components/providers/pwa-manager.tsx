"use client";

import { useEffect } from "react";

export function PWAManager() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !window.isSecureContext ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;

    const checkForUpdate = () => {
      registration?.update().catch(() => {
        // Keep the installed app usable when an update check is offline.
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };

    const register = async () => {
      try {
        const result = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (disposed) return;
        registration = result;
        document.addEventListener("visibilitychange", handleVisibilityChange);
        checkForUpdate();
      } catch (error) {
        console.warn("Rimev PWA registration failed:", error);
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      disposed = true;
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

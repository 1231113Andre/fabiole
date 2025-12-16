"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize theme on mount
    const savedTheme = localStorage.getItem("theme") || "light";
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, "");
    root.classList.add(`theme-${savedTheme}`);
  }, []);

  return <>{children}</>;
}


"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "blue" | "purple";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage or default to light
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, "");
    root.classList.add(`theme-${newTheme}`);
    localStorage.setItem("theme", newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  const themes: { value: Theme; label: string; icon: string; color: string }[] = [
    { value: "light", label: "Light", icon: "fa-sun", color: "from-yellow-400 to-orange-500" },
    { value: "dark", label: "Dark", icon: "fa-moon", color: "from-gray-700 to-gray-900" },
    { value: "blue", label: "Blue", icon: "fa-palette", color: "from-blue-500 to-cyan-500" },
    { value: "purple", label: "Purple", icon: "fa-magic", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border border-border">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => handleThemeChange(t.value)}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
            theme === t.value
              ? "bg-primary text-primary-foreground shadow-lg scale-110"
              : "text-muted-foreground hover:bg-border hover:text-foreground"
          }`}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        >
          <i className={`fas ${t.icon} text-sm`}></i>
        </button>
      ))}
    </div>
  );
}


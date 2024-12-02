"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import StarfieldBackground from "@/components/backgrounds/StarfieldBackground";

export default function ThemeWrapper({ children }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("theme");

    // If there's a saved theme, set it
    if (savedTheme && ["light", "dark", "special"].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    setMounted(true);
  }, [setTheme]);

  // Prevent rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      {theme === "dark" && <StarfieldBackground />}
      {children}
    </>
  );
}

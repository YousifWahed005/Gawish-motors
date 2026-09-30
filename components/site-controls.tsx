"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
export function ThemeToggle({
  lightLabel,
  darkLabel,
}: {
  lightLabel: string;
  darkLabel: string;
}) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme !== "light");
    setReady(true);
  }, []);
  function toggle() {
    const next = document.documentElement.dataset.theme !== "dark";
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("gawish-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <button
      type="button"
      className="theme-toggle"
      disabled={!ready}
      onClick={toggle}
      aria-label={dark ? lightLabel : darkLabel}
      title={dark ? lightLabel : darkLabel}
      aria-pressed={dark}
    >
      {dark ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}
export function MotionObserver() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    function setup() {
      observer?.disconnect();
      elements.forEach((e) => e.classList.remove("reveal-pending"));
      if (motion.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("reveal-pending");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 },
      );
      elements.forEach((e) => {
        if (e.getBoundingClientRect().top > window.innerHeight) {
          e.classList.add("reveal-pending");
          observer!.observe(e);
        }
      });
    }
    setup();
    motion.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", setup);
      elements.forEach((e) => e.classList.remove("reveal-pending"));
    };
  }, []);
  return null;
}

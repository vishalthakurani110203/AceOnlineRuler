/* ============================================================
   Ace Online Ruler — theme (dark mode) controller
   Uses document-level event delegation so it works no matter
   when toggles are added, and reflects state on every toggle.
   Pre-paint inline script in Layout.astro avoids the flash.
   ============================================================ */

export type Theme = "light" | "dark";
const THEME_KEY = "ror.theme.v1";

function systemPrefersDark(): boolean {
  return !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStored(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function syncToggles(theme: Theme): void {
  const isDark = theme === "dark";
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    btn.classList.toggle("is-dark", isDark);
  });
}

export function applyTheme(theme: Theme, persist = true): void {
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0c0c0c" : "#171717");
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }
  syncToggles(theme);
  // tell the ruler canvas to repaint with dark/light strokes
  window.dispatchEvent(new CustomEvent("ror:theme", { detail: theme }));
}

export function initTheme(): void {
  syncToggles(currentTheme());

  // Delegated click — survives DOM timing and multiple toggles.
  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    const toggle = target?.closest("[data-theme-toggle]");
    if (!toggle) return;
    e.preventDefault();
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });

  // Follow system changes only while the user hasn't explicitly chosen.
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStored()) return;
      applyTheme(systemPrefersDark() ? "dark" : "light", false);
    };
    mq.addEventListener?.("change", onChange);
  }
}

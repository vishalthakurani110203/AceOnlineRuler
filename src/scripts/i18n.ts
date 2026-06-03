/* ============================================================
   Ace Online Ruler — runtime i18n (client side)
   Swaps any element carrying [data-i18n] / [data-i18n-ph] /
   [data-i18n-aria] and exposes window.__t for canvas labels.
   Drives the custom flag language pickers ([data-lang-picker]).
   ============================================================ */
import { STRINGS, LANGUAGES, DEFAULT_LANG } from "../i18n/index";
import { flagFor } from "../i18n/flags";

export { LANGUAGES };

const LANG_KEY = "ror.lang.v1";

function dictFor(lang: string): Record<string, string> {
  return STRINGS[lang] || STRINGS[DEFAULT_LANG];
}

function translate(lang: string, key: string): string | undefined {
  const d = dictFor(lang);
  return d[key] ?? STRINGS[DEFAULT_LANG][key];
}

function syncPickers(code: string): void {
  const def = LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  document.querySelectorAll<HTMLElement>("[data-lang-picker]").forEach((root) => {
    const flag = root.querySelector<HTMLElement>("[data-lang-current-flag]");
    const name = root.querySelector<HTMLElement>("[data-lang-current-name]");
    if (flag) flag.innerHTML = flagFor(code);
    if (name) name.textContent = def.name;
    root.querySelectorAll<HTMLElement>(".lang-option").forEach((opt) => {
      opt.setAttribute("aria-selected", opt.dataset.code === code ? "true" : "false");
    });
  });
}

export function applyLanguage(lang: string): void {
  const def = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const code = def.code;

  document.documentElement.lang = code;
  document.documentElement.dir = def.dir === "rtl" ? "rtl" : "ltr";

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const v = translate(code, el.dataset.i18n!);
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-ph]").forEach((el) => {
    const v = translate(code, el.dataset.i18nPh!);
    if (v != null) el.setAttribute("placeholder", v);
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const v = translate(code, el.dataset.i18nAria!);
    if (v != null) el.setAttribute("aria-label", v);
  });

  try {
    localStorage.setItem(LANG_KEY, code);
  } catch {
    /* ignore */
  }

  (window as Window & { __t?: (k: string) => string | undefined }).__t = (k) => translate(code, k);
  syncPickers(code);
  window.dispatchEvent(new CustomEvent("ror:lang", { detail: code }));
}

function initPicker(root: HTMLElement): void {
  const trigger = root.querySelector<HTMLButtonElement>(".lang-trigger");
  const panel = root.querySelector<HTMLElement>(".lang-panel");
  if (!trigger || !panel) return;
  const options = Array.from(root.querySelectorAll<HTMLElement>(".lang-option"));

  const open = () => {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const active = options.find((o) => o.getAttribute("aria-selected") === "true") || options[0];
    active?.scrollIntoView({ block: "nearest" });
  };
  const close = () => {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };
  const toggle = () => (panel.hidden ? open() : close());

  trigger.addEventListener("click", toggle);
  options.forEach((opt) => {
    opt.addEventListener("click", () => {
      const code = opt.dataset.code;
      if (code) applyLanguage(code);
      close();
    });
  });
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target as Node)) close();
  });
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

export function initI18n(): void {
  let lang = DEFAULT_LANG;
  try {
    lang = localStorage.getItem(LANG_KEY) || navigator.language.slice(0, 2) || DEFAULT_LANG;
  } catch {
    lang = DEFAULT_LANG;
  }
  if (!LANGUAGES.some((l) => l.code === lang)) lang = DEFAULT_LANG;

  document.querySelectorAll<HTMLElement>("[data-lang-picker]").forEach(initPicker);
  applyLanguage(lang);
}

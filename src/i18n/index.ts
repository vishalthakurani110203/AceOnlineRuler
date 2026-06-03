/* ============================================================
   i18n registry — merges each locale over English so any
   missing key falls back to the English source string.
   ============================================================ */
import { EN, type Dict } from "./strings";
import { LANGUAGES, DEFAULT_LANG, type Language } from "./strings";
import { ES } from "./locales/es";
import { FR } from "./locales/fr";
import { DE } from "./locales/de";
import { PT } from "./locales/pt";
import { HI } from "./locales/hi";
import { ZH } from "./locales/zh";
import { JA } from "./locales/ja";
import { AR } from "./locales/ar";
import { RU } from "./locales/ru";

export { LANGUAGES, DEFAULT_LANG };
export type { Language, Dict };

const RAW: Record<string, Dict> = {
  en: EN,
  es: ES,
  fr: FR,
  de: DE,
  pt: PT,
  hi: HI,
  zh: ZH,
  ja: JA,
  ar: AR,
  ru: RU,
};

/* Build complete dictionaries: English base overlaid with the locale. */
export const STRINGS: Record<string, Dict> = Object.fromEntries(
  Object.entries(RAW).map(([code, dict]) => [code, { ...EN, ...dict }]),
);

export function getDict(lang: string): Dict {
  return STRINGS[lang] || STRINGS[DEFAULT_LANG];
}

/* Server-side translate helper for Astro templates. */
export function makeT(lang: string): (key: string) => string {
  const dict = getDict(lang);
  return (key: string) => dict[key] ?? EN[key] ?? key;
}

/* ============================================================
   Inline SVG flags for the language picker.
   Kept as simplified 20×14 marks so they render crisply at
   ~18px and identically on every OS (emoji flags don't render
   on Windows). Used server-side in the picker markup and
   client-side when the selected language changes.
   ============================================================ */

export const FLAGS: Record<string, string> = {
  // English → United Kingdom
  en: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#012169"/><path d="M0 0l20 14M20 0L0 14" stroke="#fff" stroke-width="2.4"/><path d="M0 0l20 14M20 0L0 14" stroke="#C8102E" stroke-width="1.2"/><path d="M10 0v14M0 7h20" stroke="#fff" stroke-width="3.6"/><path d="M10 0v14M0 7h20" stroke="#C8102E" stroke-width="2"/></svg>`,
  // Spanish → Spain
  es: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#c60b1e"/><rect y="3.5" width="20" height="7" fill="#ffc400"/></svg>`,
  // French → France
  fr: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff"/><rect width="6.67" height="14" fill="#0055A4"/><rect x="13.33" width="6.67" height="14" fill="#EF4135"/></svg>`,
  // German → Germany
  de: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#000"/><rect y="4.67" width="20" height="4.67" fill="#D00"/><rect y="9.34" width="20" height="4.66" fill="#FFCE00"/></svg>`,
  // Portuguese → Portugal
  pt: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#da291c"/><rect width="8" height="14" fill="#046a38"/><circle cx="8" cy="7" r="2.3" fill="#ffe600" stroke="#fff" stroke-width=".4"/></svg>`,
  // Hindi → India
  hi: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff"/><rect width="20" height="4.67" fill="#FF9933"/><rect y="9.34" width="20" height="4.66" fill="#138808"/><circle cx="10" cy="7" r="1.6" fill="none" stroke="#000080" stroke-width=".5"/></svg>`,
  // Chinese → China
  zh: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#de2910"/><path d="M4.6 2.3l.8 2.5 2.6 0-2.1 1.5.8 2.5-2.1-1.5-2.1 1.5.8-2.5L1 4.8l2.6 0z" fill="#ffde00"/></svg>`,
  // Japanese → Japan
  ja: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="3.9" fill="#bc002d"/></svg>`,
  // Arabic → Saudi Arabia
  ar: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#006c35"/><rect x="3.5" y="9" width="13" height="1.1" rx=".5" fill="#fff"/><rect x="3.5" y="4.2" width="9" height="1" rx=".5" fill="#fff"/></svg>`,
  // Russian → Russia
  ru: `<svg viewBox="0 0 20 14" aria-hidden="true"><rect width="20" height="14" fill="#fff"/><rect y="4.67" width="20" height="4.67" fill="#0039A6"/><rect y="9.34" width="20" height="4.66" fill="#D52B1E"/></svg>`,
};

export function flagFor(code: string): string {
  return FLAGS[code] ?? FLAGS.en;
}

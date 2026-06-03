/* Server-side translation helper for Astro templates.
   Renders the default-language (English) string at build time;
   the runtime i18n script swaps it based on the saved language. */
import { EN } from "./strings";

export function t(key: string): string {
  return EN[key] ?? key;
}

/* ============================================================
   Site-wide configuration.

   AdSense: once your AdSense account is approved, paste your
   publisher ID below in the form "ca-pub-XXXXXXXXXXXXXXXX".
   Leaving it empty keeps all ad code and the cookie banner off,
   which is the correct state while you apply for AdSense.
   ============================================================ */

export const SITE = {
  url: "https://aceonlineruler.com",
  name: "Ace Online Ruler",

  /** e.g. "ca-pub-1234567890123456" — leave "" until approved. */
  adsensePublisherId: "ca-pub-3740092922912999",

  /** Google Analytics 4 Measurement ID, e.g. "G-XXXXXXXXXX". */
  gaMeasurementId: "G-WVC5DL39VQ",

  /** Support / contact email shown on the Contact page. */
  email: "hello@aceonlineruler.com",
};

/** Derives the ads.txt "pub-..." id from the ca-pub-... id. */
export function adsensePubId(): string {
  return SITE.adsensePublisherId.replace(/^ca-/, "");
}

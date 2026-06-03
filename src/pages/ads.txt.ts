/* Serves /ads.txt. Once your AdSense publisher ID is set in
   src/config.ts, this emits the line Google requires to verify
   that you authorize AdSense to sell ad inventory on this domain. */
import type { APIRoute } from "astro";
import { SITE, adsensePubId } from "../config";

export const GET: APIRoute = () => {
  const body = SITE.adsensePublisherId.trim()
    ? `google.com, ${adsensePubId()}, DIRECT, f08c47fec0942fa0\n`
    : "# Add your AdSense publisher ID in src/config.ts to populate ads.txt\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

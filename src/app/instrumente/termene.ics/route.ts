// Calendarul termenelor de e-facturare si SAF-T, ca fisier .ics (decizia §6.6 a planului valului S4).
// Continutul, sursele si regulile formatului: `src/content/efacturare/calendar.ts`.
//
// Static: se genereaza o data la construire, din date comise; nu citeste nimic la cerere.

import { fisierIcs } from "@/content/efacturare/calendar";

export const dynamic = "force-static";

export function GET() {
  return new Response(fisierIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="termene-e-facturare-3s.ics"',
    },
  });
}

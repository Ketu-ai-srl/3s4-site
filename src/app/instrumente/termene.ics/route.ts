// Calendarul termenelor de e-facturare si SAF-T, ca fisier .ics (decizia §6.6 a planului valului S4).
// Continutul, sursele si regulile formatului: `src/content/efacturare/calendar.ts`.
//
// Static: se genereaza o data la construire, din date comise; nu citeste nimic la cerere.
//
// NUMAI PE SITE-UL ROMANESC (fundatia editiilor): calendarul e romanesc, iar ruta e un fisier `.ts`, deci
// supravietuieste si pe build-ul international (`pageExtensions` pastreaza `ts`). Cand editia `ro-RO` lipseste
// din build, raspunsul construit e 404, cu un corp text scurt (un corp gol face cache-ul serverului sa refuze
// intrarea si sa scrie o eroare in jurnal la fiecare cerere, masurat pe build-ul international).

import { fisierIcs } from "@/content/efacturare/calendar";
import { editiaInBuild } from "@/lib/editii";

export const dynamic = "force-static";

export function GET() {
  if (!editiaInBuild("ro-RO")) {
    return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return new Response(fisierIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="termene-e-facturare-3s.ics"',
    },
  });
}

// Punctul de trimitere al formularelor de contact (planul valului S4, §10). Azi, cu
// `config/operator.json` null, raspunde "inactiv" fara sa citeasca corpul. Regula intreaga si
// motivele: `logica.ts`, langa. Contractul pentru felia conversie: `src/components/formular/README.md`.

import { OPERATOR } from "@/lib/operator";
import { trateazaCerere } from "./logica";

export const dynamic = "force-dynamic";

export async function POST(cerere: Request): Promise<Response> {
  return trateazaCerere(cerere, { operator: OPERATOR, destinatie: process.env.FORMULARE_DESTINATIE });
}

// Logica punctului `/api/formular`, separata de `route.ts` ca proba sa o poata rula cu un operator
// si o destinatie date (Next nu permite alte exporturi in fisierul rutei).
//
// REGULA (planul valului S4, §9-§10; decizia owner-ului din 24.09.2026, "Nimeni deocamdata"):
//   - fara operator de date COMPLET, punctul raspunde "inactiv" FARA sa citeasca corpul cererii si
//     fara sa scrie ceva in jurnal: nimic nu se primeste, nimic nu se stocheaza, nimic nu pleaca;
//   - fara destinatie valida in mediu (`FORMULARE_DESTINATIE`), tot "inactiv";
//   - cu amandoua: corpul se citeste (cel mult `MARIME_MAXIMA` octeti), se valideaza cu aceeasi
//     functie ca in browser si se trimite mai departe, o singura data, la destinatie.
// Nimic din corp nu ajunge vreodata in jurnalul serverului: la o eroare se scrie doar motivul.

import { citesteCorp, valideaza } from "@/components/formular/validare";
import { operatorComplet, type Operator } from "@/lib/operator";

export const MARIME_MAXIMA = 16_000;
export const TERMEN_DESTINATIE_MS = 8_000;

export type Mediu = {
  operator: Operator | null;
  destinatie: string | undefined;
  trimite?: typeof fetch;
};

/** Destinatia e o adresa HTTPS, sau HTTP numai pe masina locala (proba). Altfel `null`. */
export function destinatieValida(valoare: string | undefined): string | null {
  const v = (valoare ?? "").trim();
  if (v === "") return null;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return null;
  }
  const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol === "https:" || (url.protocol === "http:" && local)) return url.toString();
  return null;
}

function json(corp: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(corp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function trateazaCerere(cerere: Request, mediu: Mediu): Promise<Response> {
  if (!operatorComplet(mediu.operator)) {
    return json({ stare: "inactiv", motiv: "fara-operator" }, 503);
  }
  const destinatie = destinatieValida(mediu.destinatie);
  if (destinatie === null) {
    return json({ stare: "inactiv", motiv: "fara-destinatie" }, 503);
  }
  const lungime = Number(cerere.headers.get("content-length") ?? "0");
  if (lungime > MARIME_MAXIMA) {
    return json({ stare: "respins", motiv: "prea-mare" }, 413);
  }
  let text: string;
  try {
    text = await cerere.text();
  } catch {
    return json({ stare: "respins", motiv: "corp-necitit" }, 400);
  }
  if (text.length > MARIME_MAXIMA) {
    return json({ stare: "respins", motiv: "prea-mare" }, 413);
  }
  let brut: unknown;
  try {
    brut = JSON.parse(text);
  } catch {
    return json({ stare: "respins", motiv: "forma" }, 400);
  }
  const citit = citesteCorp(brut);
  if (citit === null || Object.keys(valideaza(citit.date)).length > 0) {
    return json({ stare: "respins", motiv: "validare" }, 400);
  }
  const trimite = mediu.trimite ?? fetch;
  const d = citit.date;
  try {
    const raspuns = await trimite(destinatie, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formular: citit.formular,
        nume: d.nume.trim(),
        email: d.email.trim(),
        telefon: d.telefon.trim(),
        companie: d.companie.trim(),
        mesaj: d.mesaj.trim(),
        marketing: d.marketing,
        primit: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(TERMEN_DESTINATIE_MS),
    });
    if (!raspuns.ok) {
      console.error("formular: destinatia a intors codul " + raspuns.status);
      return json({ stare: "eroare" }, 502);
    }
  } catch (e) {
    console.error("formular: destinatia nu a putut fi atinsa (" + (e instanceof Error ? e.name : "necunoscut") + ")");
    return json({ stare: "eroare" }, 502);
  }
  return json({ stare: "trimis" }, 200);
}

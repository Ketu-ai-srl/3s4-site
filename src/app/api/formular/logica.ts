// Logica punctului `/api/formular`, separata de `route.ts` ca proba sa o poata rula cu un operator
// si o destinatie date (Next nu permite alte exporturi in fisierul rutei).
//
// REGULA (planul valului S4, §9-§10; decizia owner-ului din 24.09.2026, "Nimeni deocamdata"):
//   - fara operator de date COMPLET, punctul raspunde "inactiv" FARA sa citeasca corpul cererii si
//     fara sa scrie ceva in jurnal: nimic nu se primeste, nimic nu se stocheaza, nimic nu pleaca;
//   - fara destinatie valida in mediu (`FORMULARE_DESTINATIE`), tot "inactiv";
//   - cu amandoua, INAINTE de citirea corpului, garda (`garda.ts`, constatarea 3S4-F-008): originea
//     site-ului si `application/json` (altfel 403), limita de rata pe adresa (altfel 429);
//   - apoi corpul se citeste in flux (cel mult `MARIME_MAXIMA` OCTETI), se valideaza cu aceeasi
//     functie ca in browser si se trimite mai departe, o singura data, la destinatie;
//   - campul-capcana completat sau o durata DECLARATA mai scurta de `DURATA_MINIMA_MS`: raspunsul e
//     cel de succes, dar nimic nu pleaca. Un robot nu afla ca a fost oprit. Formularul din pagina nu
//     ajunge aici: asteapta pragul inainte de cerere. O cerere fara durata trece (durata e optionala:
//     formularul de cont nu o trimite), deci pragul opreste doar robotii care o declara singuri.
// Corpul trimis la destinatie poarta versiunea notei de informare pe care a vazut-o omul (3S4-F-045),
// iar cererea spre destinatie poarta `X-Formular-Secret` cand `FORMULARE_SECRET` e setat.
// Nimic din corp nu ajunge vreodata in jurnalul serverului: la o eroare se scrie doar motivul.

import type { Formular } from "@/components/consimtamant/evenimente";
import { stareFormular } from "@/components/formular/stare";
import { DURATA_MINIMA_MS, citesteCorp, valideaza } from "@/components/formular/validare";
import { FORMULAR, POLITICA } from "@/content/formular";
import { INREGISTRARE } from "@/content/conversie";
import { amprenta } from "@/lib/analitica";
import { operatorComplet, type Operator } from "@/lib/operator";
import { adresaSite } from "@/lib/site";
import { LimitaRata, adresaClient, citesteCorpLimitat, originePermisa, tipJson } from "./garda";

export const MARIME_MAXIMA = 16_000;
export const TERMEN_DESTINATIE_MS = 8_000;
// Pragul duratei sta langa cheia ei, in validare.ts: il citeste si formularul din pagina.
export { DURATA_MINIMA_MS } from "@/components/formular/validare";
/** Antetul cu secretul destinatiei (`FORMULARE_SECRET`). */
export const ANTET_SECRET = "X-Formular-Secret";

/** Limita de rata a formularului, una pe proces. */
const LIMITA = new LimitaRata();

export type Mediu = {
  operator: Operator | null;
  destinatie: string | undefined;
  trimite?: typeof fetch;
  /** Secretul cerut de destinatie (`FORMULARE_SECRET`); gol sau lipsa = fara antet. */
  secret?: string;
  /** Originea site-ului; implicit `adresaSite()`. */
  site?: string;
  /** Limita de rata; implicit cea a procesului. Parametru pentru probe. */
  limita?: LimitaRata;
};

/**
 * Versiunea notei de informare a unui formular: aceeasi amprenta ca la evidenta cookie-urilor
 * (`VERSIUNE_INFORMARE`, `src/lib/analitica.ts`), pe textele pe care le vede omul langa buton -
 * nota, bifa de noutati, legatura spre politica, termenul de pastrare si denumirea operatorului.
 * O schimbare de text da alta versiune, fara pas manual.
 */
export function versiuneInformare(formular: Formular, operator: Operator | null): string {
  const stare = stareFormular(operator, null, false);
  const texte =
    formular === "inregistrare"
      ? {
          informare: INREGISTRARE.informare,
          marketing: INREGISTRARE.marketing,
          termeni: [INREGISTRARE.termeniInainte, INREGISTRARE.termeni],
        }
      : { informare: FORMULAR.informare, marketing: FORMULAR.marketing, politica: POLITICA, pastrare: stare.pastrare };
  return "ro-" + amprenta(JSON.stringify({ formular, texte, operator: stare.operator }));
}

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
  if (!originePermisa(cerere, mediu.site ?? adresaSite())) {
    return json({ stare: "respins", motiv: "origine" }, 403);
  }
  if (!tipJson(cerere)) {
    return json({ stare: "respins", motiv: "tip" }, 403);
  }
  const limita = mediu.limita ?? LIMITA;
  const adresa = adresaClient(cerere);
  if (!limita.permite(adresa)) {
    const raspuns = json({ stare: "respins", motiv: "prea-multe" }, 429);
    raspuns.headers.set("Retry-After", String(limita.secundeRamase(adresa)));
    return raspuns;
  }
  const corp = await citesteCorpLimitat(cerere, MARIME_MAXIMA);
  if (corp.stare === "prea-mare") {
    return json({ stare: "respins", motiv: "prea-mare" }, 413);
  }
  if (corp.stare === "necitit") {
    return json({ stare: "respins", motiv: "corp-necitit" }, 400);
  }
  let brut: unknown;
  try {
    brut = JSON.parse(corp.text);
  } catch {
    return json({ stare: "respins", motiv: "forma" }, 400);
  }
  const citit = citesteCorp(brut);
  if (citit === null) {
    return json({ stare: "respins", motiv: "validare" }, 400);
  }
  // Capcana si durata: acelasi raspuns ca la succes, fara trimitere si fara jurnal.
  if (citit.capcana !== "" || (citit.durata !== null && citit.durata < DURATA_MINIMA_MS)) {
    return json({ stare: "trimis" }, 200);
  }
  if (Object.keys(valideaza(citit.date)).length > 0) {
    return json({ stare: "respins", motiv: "validare" }, 400);
  }
  const trimite = mediu.trimite ?? fetch;
  const d = citit.date;
  const antete: Record<string, string> = { "Content-Type": "application/json" };
  const secret = (mediu.secret ?? "").trim();
  if (secret !== "") antete[ANTET_SECRET] = secret;
  try {
    const raspuns = await trimite(destinatie, {
      method: "POST",
      headers: antete,
      body: JSON.stringify({
        formular: citit.formular,
        nume: d.nume.trim(),
        email: d.email.trim(),
        telefon: d.telefon.trim(),
        companie: d.companie.trim(),
        mesaj: d.mesaj.trim(),
        marketing: d.marketing,
        versiune_informare: versiuneInformare(citit.formular, mediu.operator),
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

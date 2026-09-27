// Garda punctelor publice de scriere: `/api/formular` (`logica.ts`) si evidenta consimtamantului
// (`src/middleware.ts`). Constatarea de audit 3S4-F-008: fara ea, un script trimite mii de cereri,
// iar fiecare cerere valida pleaca la destinatie (e-mail sau CRM) sau intra in jurnal.
//
// Tot ce e aici se decide INAINTE de citirea corpului, din antete si din adresa clientului:
//   - originea: o cerere venita dintr-un navigator poarta `Origin` la orice POST (Fetch, "request
//     origin"), iar el trebuie sa fie originea site-ului (`adresaSite()`). Pe masina locala, unde
//     probele ruleaza pe 127.0.0.1, se accepta si originea de bucla care coincide cu gazda cererii;
//   - tipul corpului: numai `application/json`. Un POST cu `text/plain` e o cerere "simpla" pe care
//     un navigator o trimite de pe orice site fara intrebare prealabila; JSON o face sa ceara voie;
//   - rata: o fereastra de 60 s pe adresa clientului, in memorie (un singur proces, fara baza de
//     date). Adresa e PRIMA din `X-Forwarded-For`, pusa de proxy-ul din fata (Traefik rescrie
//     antetul primit de la un client care nu e de incredere; Next il completeaza cu adresa
//     socket-ului numai cand lipseste). O adresa de bucla (127.0.0.0/8, ::1) e masina insasi -
//     probele si verificarile locale -, nu un client din retea: ea nu se numara. Masurat 27.09:
//     numarata, proba comutatorului (zeci de alegeri de consimtamant pe minut de la 127.0.0.1)
//     primea 429 dupa a zecea;
//   - marimea: corpul se citeste in flux si citirea se opreste la marimea maxima, in OCTETI, nu in
//     caractere, oricat ar declara `Content-Length` (sau daca lipseste, la o cerere fragmentata).
//
// Ce NU face: nu opreste un client care nu e navigator si care isi scrie singur `Origin` si tipul
// corect. Pentru el raman limita de rata, marimea si validarea stricta a corpului. Limita de la
// marginea proxy-ului (Traefik) e a dispecerului si se adauga peste asta, nu in locul ei.
//
// Codul ruleaza si in middleware (runtime-ul edge), deci numai API-uri web standard.

/** Fereastra limitei de rata. */
export const FEREASTRA_RATA_MS = 60_000;
/** Cereri permise pe adresa, pe fereastra. */
export const CERERI_PE_FEREASTRA = 10;
/** Peste atatea adrese tinute minte, cele expirate se sterg; peste dublu, harta se goleste. */
const PRAG_CURATARE = 5_000;

function gazdaDeBucla(nume: string): boolean {
  return nume === "127.0.0.1" || nume === "localhost" || nume === "[::1]";
}

/**
 * Originea cererii e a site-ului: egala cu `site`, sau o origine de bucla (127.0.0.1, localhost)
 * identica cu gazda la care a ajuns cererea. `lipsa` spune ce se intampla cand antetul lipseste.
 */
export function originePermisa(cerere: Request, site: string, lipsa: "respinge" | "accepta" = "respinge"): boolean {
  const origine = cerere.headers.get("origin");
  if (origine === null || origine === "") return lipsa === "accepta";
  if (origine === site) return true;
  let url: URL;
  try {
    url = new URL(origine);
  } catch {
    return false;
  }
  if (!gazdaDeBucla(url.hostname) || url.origin !== origine) return false;
  const gazda = cerere.headers.get("host");
  return gazda !== null && gazda === url.host;
}

/** Tipul corpului e `application/json` (cu parametri, de pilda `charset`, permisi). */
export function tipJson(cerere: Request): boolean {
  const tip = (cerere.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  return tip === "application/json";
}

function deBucla(adresa: string): boolean {
  const a = adresa.toLowerCase().replace(/^::ffff:/, "");
  return a === "::1" || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(a);
}

/**
 * Adresa clientului: prima din `X-Forwarded-For`, sau `null` cand nu exista una de numarat (antet
 * lipsa sau adresa de bucla, adica masina insasi).
 */
export function adresaClient(cerere: Request): string | null {
  const antet = cerere.headers.get("x-forwarded-for");
  if (antet === null) return null;
  const prima = antet.split(",")[0].trim();
  return prima === "" || deBucla(prima) ? null : prima;
}

/** Limita de rata pe adresa, fereastra fixa, in memoria procesului. */
export class LimitaRata {
  private readonly ferestre = new Map<string, { inceput: number; numar: number }>();

  constructor(
    private readonly cereri: number = CERERI_PE_FEREASTRA,
    private readonly fereastraMs: number = FEREASTRA_RATA_MS,
  ) {}

  /** `true` cand cererea intra in limita (si se numara); `false` cand trebuie refuzata cu 429. */
  permite(adresa: string | null, acum: number = Date.now()): boolean {
    if (adresa === null) return true;
    if (this.ferestre.size > PRAG_CURATARE) this.curata(acum);
    const f = this.ferestre.get(adresa);
    if (f === undefined || acum - f.inceput >= this.fereastraMs) {
      this.ferestre.set(adresa, { inceput: acum, numar: 1 });
      return true;
    }
    if (f.numar >= this.cereri) return false;
    f.numar += 1;
    return true;
  }

  /** Secundele pana la capatul ferestrei, pentru `Retry-After`. */
  secundeRamase(adresa: string | null, acum: number = Date.now()): number {
    const f = adresa === null ? undefined : this.ferestre.get(adresa);
    if (f === undefined) return 0;
    return Math.max(1, Math.ceil((f.inceput + this.fereastraMs - acum) / 1000));
  }

  private curata(acum: number): void {
    for (const [cheie, f] of this.ferestre) {
      if (acum - f.inceput >= this.fereastraMs) this.ferestre.delete(cheie);
    }
    // Un val de adrese distincte, toate in fereastra: memoria procesului bate limita.
    if (this.ferestre.size > PRAG_CURATARE * 2) this.ferestre.clear();
  }
}

export type CorpCitit = { stare: "citit"; text: string } | { stare: "prea-mare" } | { stare: "necitit" };

/**
 * Corpul, citit in flux, cu oprire imediata cand depaseste `maxim` OCTETI. `Content-Length` declarat
 * peste limita se refuza fara citire; unul absent sau mincinos nu ajuta: se numara ce soseste.
 */
export async function citesteCorpLimitat(cerere: Request, maxim: number): Promise<CorpCitit> {
  const declarat = Number(cerere.headers.get("content-length") ?? "0");
  if (Number.isFinite(declarat) && declarat > maxim) return { stare: "prea-mare" };
  if (cerere.body === null) return { stare: "citit", text: "" };
  const cititor = cerere.body.getReader();
  const bucati: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await cititor.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxim) {
        await cititor.cancel().catch(() => undefined);
        return { stare: "prea-mare" };
      }
      bucati.push(value);
    }
  } catch {
    return { stare: "necitit" };
  }
  const tot = new Uint8Array(total);
  let pozitie = 0;
  for (const b of bucati) {
    tot.set(b, pozitie);
    pozitie += b.byteLength;
  }
  return { stare: "citit", text: new TextDecoder().decode(tot) };
}

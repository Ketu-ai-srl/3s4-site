// Evidenta consimtamantului: fiecare alegere din banner lasa un rand pe SERVER, ca operatorul sa
// poata dovedi ce a ales vizitatorul si la ce text (GDPR art. 7 alin. (1); planul E5, pasul 3).
// Alegerea pastrata in browser nu e dovada: e a vizitatorului, nu a operatorului.
//
// DRUMUL: browserul trimite o cerere pe origine proprie (`CALE_EVIDENTA`), iar `src/middleware.ts`
// o valideaza si scrie UN rand JSON in jurnalul serverului. Site-ul nu are baza de date (decizie de
// fabrica), deci jurnalul e locul; cat il pastreaza infrastructura e un pas din
// `docs/ziua-operatorului.md`, nu o promisiune a codului.
//
// CE SE SCRIE: identificatorul aleator al dispozitivului, momentul (ceasul serverului, nu al
// browserului), versiunea informarii, alegerea, butonul folosit, pagina si PREFIXUL de retea
// (ultimul octet zero la IPv4, primii 48 de biti la IPv6). Adresa IP completa nu se scrie.
// Cererea pleaca DUPA alegere, niciodata la simpla vizita, si numai catre origine proprie.
//
// Validarea e stricta si inchisa: exact campurile de mai jos, valori din forme cunoscute, cerere
// mica. Orice altceva se respinge fara sa ajunga in jurnal - un punct de scriere public nu are voie
// sa devina un loc in care oricine scrie orice.

import { METODE, type Alegere, type Metoda } from "./stocare";

/** Calea pe care se trimite alegerea; o serveste `src/middleware.ts`, numai cand analitica e pornita. */
export const CALE_EVIDENTA = "/api/consimtamant";

/** Marimea maxima a unei cereri de evidenta, in octeti. */
export const MARIME_MAXIMA = 1024;

export type CerereEvidenta = {
  id: string;
  versiune: string;
  statistica: boolean;
  metoda: Metoda;
  cale: string;
};

const CAMPURI = ["cale", "id", "metoda", "statistica", "versiune"];
const FORMA_ID = /^[A-Za-z0-9-]{8,64}$/;
const FORMA_VERSIUNE = /^ro-[0-9a-f]{8}$/;
const FORMA_CALE = /^\/[A-Za-z0-9\-._~/]{0,199}$/;

/** Cererea, daca are exact forma asteptata; altfel `null`. */
export function valideazaEvidenta(x: unknown): CerereEvidenta | null {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return null;
  const c = x as Record<string, unknown>;
  const chei = Object.keys(c).sort();
  if (chei.length !== CAMPURI.length || chei.some((k, i) => k !== CAMPURI[i])) return null;
  if (typeof c.id !== "string" || !FORMA_ID.test(c.id)) return null;
  if (typeof c.versiune !== "string" || !FORMA_VERSIUNE.test(c.versiune)) return null;
  if (typeof c.statistica !== "boolean") return null;
  if (typeof c.metoda !== "string" || !(METODE as readonly string[]).includes(c.metoda)) return null;
  if (typeof c.cale !== "string" || !FORMA_CALE.test(c.cale)) return null;
  return { id: c.id, versiune: c.versiune, statistica: c.statistica, metoda: c.metoda as Metoda, cale: c.cale };
}

/** Prefixul de retea: IPv4 cu ultimul octet zero, IPv6 cu primii 48 de biti. Sir gol daca nu se recunoaste. */
export function prefixRetea(brut: string | null | undefined): string {
  const ip = (brut ?? "").split(",")[0].trim();
  const v4 = ip.replace(/^::ffff:/i, "").match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const octeti = v4.slice(1, 5).map(Number);
    if (octeti.every((o) => o <= 255)) return octeti[0] + "." + octeti[1] + "." + octeti[2] + ".0";
    return "";
  }
  if (/^[0-9a-f:]+$/i.test(ip) && ip.includes(":") && ip.split("::").length <= 2) {
    const [stanga, dreapta] = ip.split("::");
    const grupeStanga = stanga ? stanga.split(":") : [];
    const grupeDreapta = dreapta !== undefined && dreapta !== "" ? dreapta.split(":") : [];
    const lipsa = 8 - grupeStanga.length - grupeDreapta.length;
    if (lipsa < 0 || (dreapta === undefined && lipsa !== 0)) return "";
    const grupe = [...grupeStanga, ...Array(dreapta === undefined ? 0 : lipsa).fill("0"), ...grupeDreapta];
    if (grupe.length !== 8 || grupe.some((g) => g.length === 0 || g.length > 4)) return "";
    return grupe.slice(0, 3).map((g) => g.toLowerCase().replace(/^0+(?=.)/, "")).join(":") + "::";
  }
  return "";
}

/** Randul de jurnal, JSON pe o singura linie, cu eticheta dupa care se cauta. */
export function randEvidenta(c: CerereEvidenta, moment: string, retea: string): string {
  return JSON.stringify({
    tip: "3s-consimtamant",
    moment,
    id: c.id,
    versiune: c.versiune,
    statistica: c.statistica,
    metoda: c.metoda,
    cale: c.cale,
    retea,
  });
}

/** Trimite alegerea spre server, fara sa astepte raspuns. Esecul nu schimba alegerea din browser. */
export function trimiteEvidenta(a: Alegere, cale: string): void {
  const corp: CerereEvidenta = { id: a.id, versiune: a.versiune, statistica: a.statistica, metoda: a.metoda, cale };
  const text = JSON.stringify(corp);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      if (navigator.sendBeacon(CALE_EVIDENTA, new Blob([text], { type: "application/json" }))) return;
    }
    void fetch(CALE_EVIDENTA, {
      method: "POST",
      body: text,
      headers: { "content-type": "application/json" },
      keepalive: true,
      credentials: "omit",
    }).catch(() => undefined);
  } catch {
    // Evidenta e pe server; daca cererea nu pleaca, alegerea din browser ramane valabila.
  }
}

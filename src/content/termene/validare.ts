// Regulile datelor de termene, ca functie pura: probele o cheama pe datele reale si pe martori
// fabricati, iar pagina nu depinde de ea.
//
// CE CERE, pe fiecare tara:
//   - exact cele 7 tipuri, fiecare o singura data, in ordinea din `TIPURI`;
//   - randul confirmat: valoare, momentul de la care curge termenul, temeiul si cel putin o sursa;
//   - randul neconfirmat: motivul scris;
//   - fiecare sursa pe https si pe un domeniu PRIMAR din lista de mai jos (portalul legislativ, autoritatea
//     fiscala, autoritatea arhivelor, Parlamentul). Un blog de consultanta sau un editor privat pica.
//   - niciun text cu liniuta lunga sau medie (regula site-ului: doar cratima). Caracterele se
//     construiesc din cod, ca fisierul sa nu le poarte pe litere.

import type { Tara, TipAct } from "./tipuri";

/** Domeniile surselor primare acceptate. Una noua se adauga numai cu institutia care o publica. */
export const DOMENII_PRIMARE: Record<string, string> = {
  "static.anaf.ro": "Agenția Națională de Administrare Fiscală (România)",
  "arhivelenationale.ro": "Arhivele Naționale ale României",
  "www.cdep.ro": "Camera Deputaților (România)",
  "legislatie.just.ro": "Portalul legislativ al Ministerului Justiției (România)",
  "mfinante.gov.ro": "Ministerul Finanțelor (România)",
  "www.legis.md": "Registrul de stat al actelor juridice (Republica Moldova)",
};

const LINIUTE = [String.fromCharCode(0x2013), String.fromCharCode(0x2014)];

function areLiniuta(text: string): boolean {
  return LINIUTE.some((l) => text.includes(l));
}

export function abateriTermene(tari: readonly Tara[], tipuri: readonly TipAct[]): string[] {
  const abateri: string[] = [];
  const coduriTari = new Set<string>();
  for (const tara of tari) {
    if (coduriTari.has(tara.cod)) abateri.push(tara.cod + ": tara apare de doua ori");
    coduriTari.add(tara.cod);
    const ordine = tara.randuri.map((r) => r.tip).join(",");
    const asteptat = tipuri.map((t) => t.cod).join(",");
    if (ordine !== asteptat) abateri.push(tara.cod + ": tipurile sunt [" + ordine + "], nu [" + asteptat + "]");
    for (const r of tara.randuri) {
      const eticheta = tara.cod + "/" + r.tip;
      if (r.valoare !== null) {
        if (!r.valoare.trim()) abateri.push(eticheta + ": valoare goala");
        if (!r.inceput?.trim()) abateri.push(eticheta + ": rand confirmat fara momentul de la care curge termenul");
        if (!r.temei?.trim()) abateri.push(eticheta + ": rand confirmat fara temei legal");
        if (r.surse.length === 0) abateri.push(eticheta + ": rand confirmat fara sursa");
      } else if (!r.motiv?.trim()) {
        abateri.push(eticheta + ": rand neconfirmat fara motiv");
      }
      for (const s of r.surse) {
        let url: URL | null = null;
        try {
          url = new URL(s.url);
        } catch {
          abateri.push(eticheta + ": adresa care nu se poate citi: " + s.url);
        }
        if (url && url.protocol !== "https:") abateri.push(eticheta + ": sursa nu e pe https: " + s.url);
        if (url && !(url.hostname in DOMENII_PRIMARE)) {
          abateri.push(eticheta + ": sursa nu e pe un domeniu primar: " + url.hostname);
        }
        if (!s.eticheta.trim()) abateri.push(eticheta + ": sursa fara eticheta");
      }
      for (const text of [r.valoare, r.inceput, r.temei, r.motiv, ...r.surse.map((s) => s.eticheta)]) {
        if (text && areLiniuta(text)) abateri.push(eticheta + ": liniuta lunga sau medie in text");
      }
    }
  }
  return abateri;
}

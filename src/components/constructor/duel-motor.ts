// Motorul simularii zilei (duelul, acasa-constructor.md §11.2): lista de evenimente cu timpii lor
// si starea la un moment dat. Functii pure: aceeasi intrare da aceeasi zi, deci proba poate cere
// scorul final (26 vs 0, 2h 10m, 3 termene, dosarele 6/5/5/5/5) fara browser, iar miscarea redusa
// arata direct starea finala, fara simulare.
//
// Pentru fiecare document i (pornit la i x pas), cu intarzierile referintei scalate cu pas / 700:
//   0     soseste in culoarul ambelor firme, cu insigna canalului
//   210   jetonul AI apare pe dreapta
//   430   intra in gramada din stanga: nesortate +1, timp pierdut + k minute
//   450   jetonul tipului apare pe dreapta
//   500   la fiecare al 3-lea document, pornind de la al 2-lea, se schimba randul scris de mana
//   620   intra sortat in dreapta: dosarul lui +1, timp economisit + k
// Termenele ratate cad la documentele `indiciTermeneRatate`, iar toastul la `indiciToast` (1,7 s
// vizibil). Finalul vine la n x pas + 700 ms.

import type { CodCanal, CodCine, CodIndustrie, CodVolum } from "@/content/acasa";
import {
  DUEL,
  PARAMETRI_DUEL,
  SCENARII,
  completeaza,
  formatTimp,
  indiciTermeneRatate,
  indiciToast,
  minutePeDocument,
  numeFisier,
} from "@/content/acasa-constructor";

/** Cat sta toastul pe ecran (masurat: 1,7 s). */
export const DURATA_TOAST = 1700;

/** Cate randuri tine gramada (cele mai noi, cel nou sus). */
export const RANDURI_GRAMADA = 8;

type Eveniment =
  | { t: number; fel: "soseste"; doc: number }
  | { t: number; fel: "ai"; doc: number }
  | { t: number; fel: "stanga"; doc: number }
  | { t: number; fel: "tip"; doc: number }
  | { t: number; fel: "stres"; doc: number }
  | { t: number; fel: "dreapta"; doc: number }
  | { t: number; fel: "termen"; doc: number; al: number }
  | { t: number; fel: "toast"; doc: number }
  | { t: number; fel: "toastGata"; doc: number }
  | { t: number; fel: "final" };

export type ParametriSimulare = {
  industrie: CodIndustrie;
  canale: readonly CodCanal[];
  volum: CodVolum;
  cine: CodCine;
};

export type Simulare = {
  evenimente: Eveniment[];
  /** Momentul finalului, in ms de la pornire. */
  sfarsit: number;
  documente: number;
  pas: number;
  minute: number;
};

/** Un document din culoar: numele fisierului si canalul pe care a venit. */
export type DocCuloar = { cheie: number; nume: string; canal: CodCanal };

export type RandStanga = { cheie: string; fel: "doc" | "termen"; text: string };
export type RandDreapta = { cheie: string; nume: string; tip: string };

export type StareDuel = {
  culoarStanga: DocCuloar | null;
  culoarDreapta: (DocCuloar & { ai: boolean; tip: string | null }) | null;
  gramadaStanga: RandStanga[];
  gramadaDreapta: RandDreapta[];
  nesortate: number;
  /** Minute. */
  timpPierdut: number;
  timpEconomisit: number;
  termene: number;
  dosareDreapta: [number, number, number, number, number];
  /** Ultimul dosar crescut si de cate ori (cheia pulsului de scara). */
  puls: { dosar: number; cheie: number } | null;
  stres: { text: string; cheie: number } | null;
  toast: { text: string; cheie: number } | null;
  final: boolean;
};

export function construiesteSimularea(p: ParametriSimulare): Simulare {
  const { documente, pas } = PARAMETRI_DUEL[p.volum];
  const f = pas / 700;
  const evenimente: Eveniment[] = [];
  const termene = indiciTermeneRatate(p.volum);
  const toasturi = indiciToast(p.volum);
  for (let i = 0; i < documente; i++) {
    const b = i * pas;
    evenimente.push({ t: b, fel: "soseste", doc: i });
    evenimente.push({ t: b + 210 * f, fel: "ai", doc: i });
    evenimente.push({ t: b + 430 * f, fel: "stanga", doc: i });
    termene.forEach((d, al) => {
      if (d === i) evenimente.push({ t: b + 440 * f, fel: "termen", doc: i, al });
    });
    evenimente.push({ t: b + 450 * f, fel: "tip", doc: i });
    if (i % 3 === 1) evenimente.push({ t: b + 500 * f, fel: "stres", doc: i });
    evenimente.push({ t: b + 620 * f, fel: "dreapta", doc: i });
    if (toasturi.includes(i)) {
      evenimente.push({ t: b + 620 * f, fel: "toast", doc: i });
      evenimente.push({ t: b + 620 * f + DURATA_TOAST, fel: "toastGata", doc: i });
    }
  }
  const sfarsit = documente * pas + 700;
  evenimente.push({ t: sfarsit, fel: "final" });
  // Sortare stabila dupa timp: la acelasi moment, ordinea de construire ramane.
  const ordonate = evenimente.map((e, i) => ({ e, i })).sort((a, b) => a.e.t - b.e.t || a.i - b.i).map((x) => x.e);
  return { evenimente: ordonate, sfarsit, documente, pas, minute: minutePeDocument(p.canale.length) };
}

/** Cate evenimente au avut loc pana la `t` inclusiv. */
export function evenimentePana(sim: Simulare, t: number): number {
  let n = 0;
  while (n < sim.evenimente.length && sim.evenimente[n].t <= t) n++;
  return n;
}

function canalDoc(canale: readonly CodCanal[], doc: number): CodCanal {
  const lista = canale.length > 0 ? canale : (["email"] as CodCanal[]);
  return lista[doc % lista.length];
}

/** Starea dupa primele `n` evenimente. */
export function stareDupa(sim: Simulare, p: ParametriSimulare, n: number): StareDuel {
  const duel = SCENARII[p.industrie].duel;
  const numeDoc = (doc: number) => numeFisier(duel.fisiere[doc % 5], Math.floor(doc / 5));
  const s: StareDuel = {
    culoarStanga: null,
    culoarDreapta: null,
    gramadaStanga: [],
    gramadaDreapta: [],
    nesortate: 0,
    timpPierdut: 0,
    timpEconomisit: 0,
    termene: 0,
    dosareDreapta: [0, 0, 0, 0, 0],
    puls: null,
    stres: null,
    toast: null,
    final: false,
  };
  let stresuri = 0;
  for (let k = 0; k < n && k < sim.evenimente.length; k++) {
    const e = sim.evenimente[k];
    switch (e.fel) {
      case "soseste": {
        const doc: DocCuloar = { cheie: e.doc, nume: numeDoc(e.doc), canal: canalDoc(p.canale, e.doc) };
        s.culoarStanga = doc;
        s.culoarDreapta = { ...doc, ai: false, tip: null };
        break;
      }
      case "ai":
        if (s.culoarDreapta && s.culoarDreapta.cheie === e.doc) s.culoarDreapta = { ...s.culoarDreapta, ai: true };
        break;
      case "stanga":
        s.gramadaStanga = [{ cheie: "d" + e.doc, fel: "doc" as const, text: numeDoc(e.doc) }, ...s.gramadaStanga].slice(
          0,
          RANDURI_GRAMADA,
        );
        s.nesortate += 1;
        s.timpPierdut += sim.minute;
        break;
      case "termen":
        s.gramadaStanga = [
          { cheie: "t" + e.al, fel: "termen" as const, text: duel.termeneRatate[e.al] },
          ...s.gramadaStanga,
        ].slice(0, RANDURI_GRAMADA);
        s.termene += 1;
        break;
      case "tip":
        if (s.culoarDreapta && s.culoarDreapta.cheie === e.doc) {
          s.culoarDreapta = { ...s.culoarDreapta, tip: duel.tipuri[e.doc % 5] };
        }
        break;
      case "stres":
        s.stres = { text: duel.stres[stresuri % duel.stres.length], cheie: stresuri + 1 };
        stresuri += 1;
        break;
      case "dreapta": {
        const dosar = e.doc % 5;
        s.gramadaDreapta = [{ cheie: "d" + e.doc, nume: numeDoc(e.doc), tip: duel.tipuri[dosar] }, ...s.gramadaDreapta].slice(
          0,
          RANDURI_GRAMADA,
        );
        const dosare = [...s.dosareDreapta] as StareDuel["dosareDreapta"];
        dosare[dosar] += 1;
        s.dosareDreapta = dosare;
        s.puls = { dosar, cheie: e.doc + 1 };
        s.timpEconomisit += sim.minute;
        break;
      }
      case "toast":
        s.toast = { text: duel.toast, cheie: e.doc + 1 };
        break;
      case "toastGata":
        if (s.toast && s.toast.cheie === e.doc + 1) s.toast = null;
        break;
      case "final":
        s.final = true;
        s.culoarStanga = null;
        s.culoarDreapta = null;
        s.toast = null;
        s.stres = { text: completeaza(DUEL.cine[p.cine], { timp: formatTimp(s.timpPierdut) }), cheie: 999 };
        break;
    }
  }
  return s;
}

/** Starea finala, fara simulare (miscarea redusa si proba). */
export function stareFinala(p: ParametriSimulare): StareDuel {
  const sim = construiesteSimularea(p);
  return stareDupa(sim, p, sim.evenimente.length);
}

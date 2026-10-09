// Continutul paletei de cautare, ca functie pura (probata in `tests/fundatie-navigatie.test.ts`).
//
// Fara interogare: grupurile din contractul de navigatie (`PALETA`: Pagini, Actiuni), filtrate pe
// caile existente. Cu interogare: se cauta in TOATE rutele existente (`RUTE`: titlul scurt,
// descrierea si calea), in actiuni si in articolele blogului; grupul de articole apare doar atunci.
// Potrivirea e pe CUVINTE (`potrivesteInterogarea`): fiecare cuvant al interogarii, mai putin cuvintele de
// legatura scurte, e subsir al unui camp, in orice ordine, fara majuscule si FARA diacritice ("cautare"
// gaseste "Căutare", "termene pastrare" gaseste "Termene de păstrare").
//
// ASEZAREA (`src/lib/asezare.ts`): rezultatele poarta calea SURSA (`cale`), pe care se fac comparatiile cu rutele si
// cu caile existente; adresa la care duce un rezultat e cea SERVITA, adaugata la sfarsit de `cuCaiServite` (campul
// `servita`). Pe asezarea `md` cele doua coincid.

import type { ArticolBlog } from "@/content/blog/registru";
import { caleArticol } from "@/content/blog/registru";
import { PALETA, vizibile, type CaiExistente } from "@/content/navigatie";
import type { Ruta } from "@/content/rute";
import { asezareBuild, caSursa, caleServita, type CaleServita, type CodAsezare, type RutaAsezabila } from "@/lib/asezare";

export type ElementPaleta = {
  titlu: string;
  cale: string;
};

export type GrupPaletaRezultat = {
  titlu: string;
  elemente: ElementPaleta[];
};

/** Un rezultat cu adresa la care duce: `cale` ramane sursa, `servita` e adresa de pe domeniu. */
export type ElementPaletaServit = ElementPaleta & { servita: CaleServita };

export type GrupPaletaServit = {
  titlu: string;
  elemente: ElementPaletaServit[];
};

/** Rezultatele cu adresa servita a fiecaruia (navigarea si calea afisata o folosesc pe ea). */
export function cuCaiServite(
  grupuri: readonly GrupPaletaRezultat[],
  rute: readonly RutaAsezabila[],
  asezare: CodAsezare = asezareBuild(),
): GrupPaletaServit[] {
  return grupuri.map((g) => ({
    titlu: g.titlu,
    elemente: g.elemente.map((e) => ({ ...e, servita: caleServita(caSursa(e.cale), rute, asezare) })),
  }));
}

/** Litere mici, fara semne diacritice, spatii comprimate. */
export function normalizeaza(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cuvintele de legatura scurte, romanesti si englezesti, deja normalizate (fara diacritice). Nu poarta
 * subiectul cautarii: "termene de pastrare" si "termene pastrare" cauta acelasi lucru. Lista e scurta
 * deliberat - un cuvant scos din interogare nu mai filtreaza nimic, deci intra aici numai ce nu
 * deosebeste o pagina de alta.
 */
export const CUVINTE_DE_LEGATURA: ReadonlySet<string> = new Set([
  "a", "al", "ale", "ai", "cu", "de", "din", "la", "in", "pe", "si", "sau", "un", "o", "ce", "pentru",
  "the", "of", "and", "or", "to", "for", "on", "an", "with", "by",
]);

/**
 * Cuvintele unei interogari deja normalizate, fara cuvintele de legatura. Daca interogarea are NUMAI
 * cuvinte de legatura ("de"), raman toate: altfel interogarea ar deveni goala si ar potrivi orice.
 */
export function cuvinteInterogare(interogareNormalizata: string): string[] {
  const toate = interogareNormalizata.split(" ").filter((c) => c !== "");
  const purtatoare = toate.filter((c) => !CUVINTE_DE_LEGATURA.has(c));
  return purtatoare.length > 0 ? purtatoare : toate;
}

/**
 * Potrivirea paletei. Interogarea (normalizata: litere mici, fara diacritice) se imparte pe cuvinte, iar
 * un rezultat se potriveste daca fiecare cuvant ramas apare, ca subsir, in cel putin unul din campuri, in
 * orice ordine: "termene pastrare", "pastrare termene" si "termene de păstrare" gasesc aceeasi pagina.
 * Un cuvant fara pereche in niciun camp scoate rezultatul ("termene qzxv" nu gaseste nimic).
 */
export function potrivesteInterogarea(interogareNormalizata: string, ...campuri: string[]): boolean {
  const cuvinte = cuvinteInterogare(interogareNormalizata);
  if (cuvinte.length === 0) return true;
  const text = campuri.map(normalizeaza);
  return cuvinte.every((cuvant) => text.some((c) => c.includes(cuvant)));
}

function potriveste(interogare: string, ...campuri: string[]): boolean {
  return potrivesteInterogarea(interogare, ...campuri);
}

export function continutPaleta(
  interogare: string,
  cai: CaiExistente,
  rute: readonly Ruta[],
  articole: readonly ArticolBlog[],
): GrupPaletaRezultat[] {
  const q = normalizeaza(interogare);
  const [grupPagini, grupActiuni] = PALETA.grupuri;
  const pagini = vizibile(grupPagini?.elemente ?? [], cai).map((l) => ({ titlu: l.text, cale: l.href ?? "/" }));
  const actiuni = vizibile(grupActiuni?.elemente ?? [], cai).map((l) => ({ titlu: l.text, cale: l.href ?? "/" }));

  if (q === "") {
    const grupuri: GrupPaletaRezultat[] = [
      { titlu: grupPagini?.titlu ?? "", elemente: pagini },
      { titlu: grupActiuni?.titlu ?? "", elemente: actiuni },
    ];
    return grupuri.filter((g) => g.elemente.length > 0);
  }

  // Paginile: intai cele din contract (ordinea si titlurile lor), apoi restul rutelor existente.
  const dinContract = new Set(pagini.map((p) => p.cale));
  const toatePaginile = [
    ...pagini.map((p) => {
      const ruta = rute.find((r) => r.cale === p.cale);
      return { ...p, descriere: ruta?.descriere ?? "" };
    }),
    ...rute
      .filter((r) => cai.has(r.cale) && !dinContract.has(r.cale))
      .map((r) => ({ titlu: r.scurt, cale: r.cale, descriere: r.descriere })),
  ];

  const rezultat: GrupPaletaRezultat[] = [
    {
      titlu: grupPagini?.titlu ?? "",
      elemente: toatePaginile
        .filter((p) => potriveste(q, p.titlu, p.descriere, p.cale))
        .map(({ titlu, cale }) => ({ titlu, cale })),
    },
    {
      titlu: grupActiuni?.titlu ?? "",
      elemente: actiuni.filter((a) => potriveste(q, a.titlu, a.cale)),
    },
    {
      titlu: PALETA.grupArticole,
      elemente: articole
        .filter((a) => cai.has(caleArticol(a)) && potriveste(q, a.titlu, a.extras))
        .map((a) => ({ titlu: a.titlu, cale: caleArticol(a) })),
    },
  ];
  return rezultat.filter((g) => g.elemente.length > 0);
}

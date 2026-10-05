// Rutele editiei `en` (site-ul international, la radacina), grupul juridic: paginile juridice in engleza, sub /legal.
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "en"` si `cheie` (identificatorul paginii peste
// editii, `src/content/echivalente.ts`), iar pagina ei e un `page.en.tsx` sub `src/app/(en)`. Portile de rute
// citesc fisierul ca text, pe editia `en`, iar declaratiile G-AI-02 ale grupului stau in
// `config/seo/<marcaj>.json`.
//
// GRUPUL JURIDIC (felia juridic-pagini-3s-md): documentele familiei `md` publicate la poarta curenta, cu adresa
// EN din `config/juridic-rute.json` (singurul loc al adreselor) si titlul scurt si descrierea din
// `./juridic/publicare.ts`. Ca la paginile `/juridic` ale familiei SEE, rutele exista exact cand exista
// paginile: numai cu operator numit din familia `md` (`OPERATOR_NUMIT`, `FAMILIE_JURIDICA`, citite la fel in
// pachetul de browser). Pagina e segmentul `src/app/(en)/legal/[[...document]]/page.en.tsx`, cu
// `generateStaticParams` pe aceleasi chei; un segment dinamic nu are cale fixa, deci caile nu se scriu literal
// aici (poarta de rute le-ar cere o pagina statica).
import { caleMd, cheiPublicate } from "./juridic/md/registru";
import { CALE_JURIDIC_EN, DESCRIERE_MD, FAMILIE_JURIDICA, OPERATOR_NUMIT, SCURT_MD } from "./juridic/publicare";
import type { FamilieJuridica } from "./juridic/familie";
import type { RutaEditie } from "./rute";

/**
 * Rutele juridice EN: documentele `md` publicate la poarta curenta si, la urma, indexul `/legal` (`indexJuridicEn`),
 * numai cand familia publicata e `md`. Ca `ruteJuridice` din `./juridic/publicare.ts` (indexul plus documentele).
 */
export function ruteJuridiceEn(publicat: boolean = OPERATOR_NUMIT, familie: FamilieJuridica | null = FAMILIE_JURIDICA): RutaEditie<"en">[] {
  if (!publicat || familie !== "md") return [];
  return [...documenteJuridiceEn(), ...indexJuridicEn(publicat, familie)];
}

/** Numai documentele `md` publicate la poarta curenta (fara index). */
function documenteJuridiceEn(): RutaEditie<"en">[] {
  return cheiPublicate().map((cheie) => ({
    cale: caleMd(cheie, "en"),
    scurt: SCURT_MD[cheie].en,
    descriere: DESCRIERE_MD[cheie].en,
    inHarta: true,
    editie: "en",
    cheie,
  }));
}

/**
 * INDEXUL `/legal` (felia editie-juridic, decizia 53: ca `/juridic` pe site-ul romanesc): numai cand familia
 * publicata e `md`, adica exact cand pagina lui exista (`generateStaticParams` da si slugul gol). Ruta face legatura
 * din fir (nivelul intermediar) si din paleta sa fie vie: fara ea, `Tinta` randeaza nivelul ca text inert.
 * In harta de site, cu perechea hreflang `/ro/juridic` (cheia `juridic` din `echivalente.ts`). Calea ramane constanta
 * `CALE_JURIDIC_EN`, nu literala: poarta de rute cere o pagina statica pentru o cale literala, iar pagina indexului e
 * segmentul optional `[[...document]]`; proba de acceptanta a lui 3s.md rezolva constanta din `juridic/publicare.ts`.
 */
export function indexJuridicEn(publicat: boolean = OPERATOR_NUMIT, familie: FamilieJuridica | null = FAMILIE_JURIDICA): RutaEditie<"en">[] {
  if (!publicat || familie !== "md") return [];
  return [
    {
      cale: CALE_JURIDIC_EN,
      scurt: "Legal documents",
      descriere: "All legal documents of the 3S platform, in one place.",
      inHarta: true,
      editie: "en",
      cheie: "juridic",
    },
  ];
}

export const RUTE_EN_JURIDIC: RutaEditie<"en">[] = [
  // <<felie:juridic-pagini-3s-md>>
  ...ruteJuridiceEn(),
];

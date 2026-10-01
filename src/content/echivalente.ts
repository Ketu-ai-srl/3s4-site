// Echivalentele paginilor peste editii: cheia paginii (campul `cheie` din manifestul de rute) -> calea ei in
// fiecare editie care o are. Din tabel se scriu, in feliile urmatoare, alternatele hreflang si selectorul de limba.
//
// La fundatia editiilor tabelul e GOL. La lansarea lui 3s.md echivalentele reale sunt numai cele juridice (en si
// ro-MD); `ro-RO` intra abia cand gazda romaneasca serveste pagina si emite reciproca.
//
// Modulul nu importa nimic (acelasi motiv ca `src/components/seo/alternate-cale.ts`): il pot citi si layout-ul,
// si pachetul de browser, fara sa traga manifestul de rute dupa el.

export type CaiPeEditie = {
  "ro-RO"?: string;
  en?: string;
  "ro-MD"?: string;
};

// Perechile juridice (felia juridic-pagini-3s-md): documentele familiei `md` publicate la poarta B, pe cheia din
// registru, cu adresele din `config/juridic-rute.json`. Scrise literal (modulul nu importa nimic); proba
// `tests/juridic-3s-md.test.ts` cere ca ele sa fie exact documentele cu poarta B din fisierul acela, cu
// adresele lui. DPA-ul si subimputernicitii (poarta C) nu au pagina, deci nici pereche.
export const ECHIVALENTE: Readonly<Record<string, CaiPeEditie>> = {
  "informatii-legale": { en: "/legal/legal-information", "ro-MD": "/ro/juridic/informatii-legale" },
  confidentialitate: { en: "/legal/privacy", "ro-MD": "/ro/juridic/confidentialitate" },
  "cookie-uri": { en: "/legal/cookies", "ro-MD": "/ro/juridic/cookies" },
  termeni: { en: "/legal/terms", "ro-MD": "/ro/juridic/termeni" },
  "notificare-si-actiune": { en: "/legal/notice-and-action", "ro-MD": "/ro/juridic/notificare-si-actiune" },
  "inteligenta-artificiala": { en: "/legal/ai-notice", "ro-MD": "/ro/juridic/inteligenta-artificiala" },
};

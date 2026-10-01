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

export const ECHIVALENTE: Readonly<Record<string, CaiPeEditie>> = {};

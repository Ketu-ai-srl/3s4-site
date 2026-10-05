// Echivalentele paginilor peste editii: cheia paginii (campul `cheie` din manifestul de rute) -> calea ei in
// fiecare editie care o are. Din tabel se scriu, in feliile urmatoare, alternatele hreflang si selectorul de limba.
//
// La fundatia editiilor tabelul e GOL. Pe 3s.md echivalentele reale sunt cele juridice, startul si contactul (felia
// ro-md-acasa-contact) si perechile oglinzii /ro (felia ro-md-oglinda); `ro-RO` intra abia cand gazda romaneasca
// serveste pagina si emite reciproca.
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
//
// Perechile paginilor de prezentare (felia ro-md-acasa-contact): pagina de start si pagina de contact, singurele
// pagini RO-MD de continut la lansare (decizia 29). Din ele vin hreflang-ul reciproc `/` - `/ro` si `/contact` -
// `/ro/contact` si selectorul EN | RO pe toate patru paginile.
//
// Perechile oglinzii (felia ro-md-oglinda, decizia 59: /ro oglindeste toate paginile EN): platforma, cautarea, preturile,
// Enterprise, pagina despre 3S, cele doua ghiduri si comparatia. Cheia e cea a paginii EN (`rute-en-*.ts`).
export const ECHIVALENTE: Readonly<Record<string, CaiPeEditie>> = {
  home: { en: "/", "ro-MD": "/ro" },
  contact: { en: "/contact", "ro-MD": "/ro/contact" },
  platform: { en: "/platform", "ro-MD": "/ro/platforma" },
  "features-search": { en: "/features/search", "ro-MD": "/ro/functionalitati/cautare-ai" },
  pricing: { en: "/pricing", "ro-MD": "/ro/preturi" },
  enterprise: { en: "/enterprise", "ro-MD": "/ro/enterprise" },
  about: { en: "/about", "ro-MD": "/ro/securitate" },
  "guides-e-invoice-archiving-eu": { en: "/guides/e-invoice-archiving-eu", "ro-MD": "/ro/ghiduri/arhivare-e-facturi-ue" },
  "guides-records-retention-moldova": { en: "/guides/records-retention-moldova", "ro-MD": "/ro/ghiduri/termene-pastrare-moldova" },
  "compare-3s-vs-google-and-box": { en: "/compare/3s-vs-google-and-box", "ro-MD": "/ro/comparatie-drive" },
  "informatii-legale": { en: "/legal/legal-information", "ro-MD": "/ro/juridic/informatii-legale" },
  confidentialitate: { en: "/legal/privacy", "ro-MD": "/ro/juridic/confidentialitate" },
  "cookie-uri": { en: "/legal/cookies", "ro-MD": "/ro/juridic/cookies" },
  termeni: { en: "/legal/terms", "ro-MD": "/ro/juridic/termeni" },
  "notificare-si-actiune": { en: "/legal/notice-and-action", "ro-MD": "/ro/juridic/notificare-si-actiune" },
  "inteligenta-artificiala": { en: "/legal/ai-notice", "ro-MD": "/ro/juridic/inteligenta-artificiala" },
};

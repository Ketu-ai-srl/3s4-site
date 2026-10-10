// Rutele editiei `en` (site-ul international, la radacina), grupul referinta: ghidurile si comparatiile G1-G3.
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "en"` si `cheie` (identificatorul paginii peste
// editii, `src/content/echivalente.ts`), iar pagina ei e un `page.en.tsx` sub `src/app/(en)`. Portile de rute
// citesc fisierul ca text, pe editia `en`, iar declaratiile G-AI-02 ale grupului stau in
// `config/seo/<marcaj>.json`.
import type { RutaEditie } from "./rute";

//
// GRUPUL REFERINTA (felia en-referinta): textul paginilor sta in `src/content/en/<cheie>.ts`, iar `cheie` de aici e
// cheia acelui modul. Titlul scurt e eticheta din meniu (fisa paginii), descrierea e randul paginii din `llms.txt`
// (arhitectura continutului EN, sectiunea 7). Paginile sunt de poarta B: pe 3s.md raman noindex pana atunci, ca tot site-ul.
export const RUTE_EN_REFERINTA: RutaEditie<"en">[] = [
  // <<felie:en-referinta>>
  {
    cale: "/guides/e-invoice-archiving-eu",
    scurt: "E-invoice archiving in the EU",
    descriere: "Retention period and format to keep for e-invoices, by country, with primary sources and check dates.",
    inHarta: true,
    editie: "en",
    cheie: "guides-e-invoice-archiving-eu",
  },
  {
    cale: "/guides/records-retention-moldova",
    scurt: "Records retention in Moldova",
    descriere: "How long to keep invoices, registers, payroll, contracts and tax returns in Moldova.",
    inHarta: true,
    editie: "en",
    cheie: "guides-records-retention-moldova",
  },
  {
    cale: "/compare/3s-vs-google-drive",
    scurt: "3S vs Google Drive",
    descriere: "A comparison with a section on when not to choose 3S.",
    inHarta: true,
    editie: "en",
    cheie: "compare-3s-vs-google-drive",
  },
];

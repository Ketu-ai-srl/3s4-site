// Rutele editiei `en` (site-ul international, la radacina), grupul nucleu: startul, platforma, preturile, Enterprise, contactul si despre noi (P01, P02, P08, P09, P10, P11).
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "en"` si `cheie` (identificatorul paginii peste
// editii, `src/content/echivalente.ts`), iar pagina ei e un `page.en.tsx` sub `src/app/(en)`. Portile de rute
// citesc fisierul ca text, pe editia `en`, iar declaratiile G-AI-02 ale grupului stau in
// `config/seo/<marcaj>.json`.
import type { RutaEditie } from "./rute";

//
// GRUPUL NUCLEU (felia en-nucleu): textul paginilor sta in `src/content/en/<cheie>.ts`, iar `cheie` de aici e cheia
// acelui modul. Titlul scurt e eticheta din meniu, descrierea e randul paginii din `llms.txt` (arhitectura
// continutului EN, §7), cu Contact pe varianta de dinainte de P-40 (fara e-mail).
export const RUTE_EN_NUCLEU: RutaEditie<"en">[] = [
  // <<felie:en-nucleu>>
  {
    cale: "/",
    scurt: "Home",
    descriere: "What 3S is, who it is for and how a pilot starts.",
    inHarta: true,
    editie: "en",
    cheie: "home",
  },
  {
    cale: "/platform",
    scurt: "Platform",
    descriere: "How documents get in, are kept in the archive and come back as answers with a source.",
    inHarta: true,
    editie: "en",
    cheie: "platform",
  },
  {
    cale: "/enterprise",
    scurt: "Enterprise",
    descriere: "The plan for organizations with more than 20 user accounts.",
    inHarta: true,
    editie: "en",
    cheie: "enterprise",
  },
  {
    cale: "/pricing",
    scurt: "Pricing",
    descriere:
      "Four plans per company, in euros, excluding VAT, from EUR 90 a month (Starter) to Enterprise from EUR 800 a month; every customer starts with a free 14-day assisted pilot.",
    inHarta: true,
    editie: "en",
    cheie: "pricing",
  },
  {
    cale: "/about",
    scurt: "About & security",
    descriere: "What 3S is, who operates it, where data is stored and what 3S does not do.",
    inHarta: true,
    editie: "en",
    cheie: "about",
  },
  {
    cale: "/contact",
    scurt: "Contact",
    descriere: "WhatsApp messages and calls.",
    inHarta: true,
    editie: "en",
    cheie: "contact",
  },
];

// Manifestul rutelor: singurul loc din care se afla ce pagini EXISTA pe site.
//
// CINE IL CITESTE: harta de site (`src/app/sitemap.ts`), multimea cailor existente
// (`src/content/cai.ts`), din care navigatia isi filtreaza legaturile, paleta de cautare si
// portile (`poarta-rute.py`, `poarta-registru-rute.py`, `poarta-identificatori.py`). Meniul,
// subsolul si paleta NU se scriu de aici: textele si ordinea lor sunt in contractul de navigatie
// (`src/content/navigatie.ts`), iar de aici vine numai raspunsul la "exista pagina?".
//
// CUM SE ADAUGA O PAGINA:
//   1. se creeaza `src/app/<segment>/page.tsx`, cu `export const metadata` proprie (titlu 15-65,
//      descriere 50-160, `alternates: { canonical: "/<segment>" }`);
//   2. se adauga intrarea in `RUTE`, SUB MARCAJUL FELIEI care o construieste;
//   3. se adauga afirmatiile paginii in registrul feliei (`src/content/afirmatii/<felia>.json`).
// Legaturile de navigatie catre pagina apar singure: filtrul le arata din clipa in care ruta e aici.
//
// REGULA DURA: aici intra NUMAI rute care exista deja in `src/app`. Navigatia sta in layout, deci
// o intrare scrisa inainte de pagina ar produce o legatura moarta pe fiecare pagina deodata.
// `poarta-rute.py` compara lista asta cu arborele de fisiere, in ambele directii.
//
// MARCAJELE DE FELIE. Fisierul e singurul pe care mai multe felii il ating deodata. Fiecare felie
// scrie NUMAI sub marcajul ei si nu muta celelalte marcaje: marcajele sunt randurile de context
// care lasa imbinarea in trei puncte sa reuseasca fara conflict. Ordinea marcajelor e ordinea din
// meniu (antetul: Acasa, Functionalitati, Solutii, Preturi, Blog), apoi ordinea coloanelor din
// subsol. Feliile fara rute isi pastreaza marcajul, ca ordinea sa ramana completa. Marcajele se
// muta numai de dispecer. Feliile aceluiasi val care scriu aici se pliaza PE RAND.

/** Adresa publica a site-ului. Din ea se compun canonical-urile, harta de site si robots. */
export const ADRESA_BAZA = "https://3s4.ke2.in";

export type Ruta = {
  /** Calea absoluta, exact cum apare in bara de adrese. Fara bara la final, in afara de "/". */
  cale: string;
  /** Titlul scurt: randul din harta de site si din paleta de cautare. */
  scurt: string;
  /** O propozitie despre ce gaseste omul acolo; paleta cauta si in ea. */
  descriere: string;
  /** Intra in `sitemap.xml`? `false` doar pentru pagini care nu se indexeaza. */
  inHarta: boolean;
};

export const RUTE: Ruta[] = [
  // <<felie:fundatie>>
  {
    cale: "/",
    scurt: "Acasă",
    descriere:
      "Scanare, păstrare și căutare cu sursa citată pentru documentele firmei, pe web și pe WhatsApp.",
    inHarta: true,
  },

  // <<felie:text-acasa>>
  // (fara rute: textele startului si ale navigatiei)

  // <<felie:erou>>
  // (fara rute: piesa de pe start)

  // <<felie:constructor>>
  // (fara rute: piesa de pe start)

  // <<felie:functionalitati-acasa>>
  // (fara rute: piesa de pe start)

  // <<felie:flux-efacturare>>

  // <<felie:cinema-1>>
  {
    cale: "/functionalitati/cautare-ai",
    scurt: "Căutare cu sursa citată",
    descriere:
      "Întrebați arhiva cu vorbele dumneavoastră și primiți răspunsul cu documentul și pagina din care vine.",
    inHarta: true,
  },
  {
    cale: "/functionalitati/automatizari-ai",
    scurt: "Reguli automate",
    descriere:
      "Regulile „când / atunci” trimit actul nou la înregistrare, verificare sau aprobare, cu pașii trecuți în jurnal.",
    inHarta: true,
  },
  {
    cale: "/functionalitati/portal-clienti",
    scurt: "Clienții își văd actele",
    descriere:
      "Dosarul fiecărui client în portal: acces dat pe persoană și pe dosar, note interne doar pentru echipă.",
    inHarta: true,
  },

  // <<felie:cinema-2>>

  // <<felie:solutii>>

  // <<felie:preturi>>

  // <<felie:blog>>
  // Articolele NU intra aici: stau in registrul blogului (`src/content/blog/registru.ts`).

  // <<felie:produs>>

  // <<felie:enterprise-formular>>

  // <<felie:comparatii-termene>>

  // <<felie:promo>>

  // <<felie:conversie>>

  // <<felie:juridic>>
];

/** Rutele care intra in `sitemap.xml`. */
export function rutePentruHarta(): Ruta[] {
  return RUTE.filter((r) => r.inHarta);
}

/**
 * Indexarea e permisa DOAR in productie, si implicitul e neindexarea.
 *
 * Scris asa, nu invers, deliberat: o variabila de mediu uitata trebuie sa lase site-ul in afara
 * indexului, nu in el. Se citeste la construire; plasa de siguranta la rulare e antetul
 * `X-Robots-Tag: noindex` pus de `src/middleware.ts`. Se cheama numai din cod de server.
 */
export function indexareaEstePermisa(): boolean {
  return process.env.SITE_ENV === "productie";
}

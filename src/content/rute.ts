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
  {
    cale: "/flux-documente",
    scurt: "Fluxul documentelor",
    descriere:
      "Drumul unui act prin firmă, de la e-mail, WhatsApp sau scanare până la omul care răspunde de el și în arhivă.",
    inHarta: true,
  },
  {
    cale: "/e-facturare",
    scurt: "E-facturare",
    descriere:
      "RO e-Factura, SAF-T și termenele e-facturării în UE, verificate la sursa oficială, plus calendarul descărcabil.",
    inHarta: true,
  },

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
  {
    cale: "/functionalitati/semnatura-calificata",
    scurt: "Semnătura calificată",
    descriere: "Integrarea cu furnizorii acreditați de semnătură calificată e în curs; actele semnate se arhivează deja în 3S.",
    inHarta: true,
  },
  {
    cale: "/functionalitati/aplicatie-mobila",
    scurt: "Arhiva pe telefon",
    descriere: "Fotografiați avizul la client, etichetați-l și trimiteți-l în dosarul lui, fără drum la birou.",
    inHarta: true,
  },
  {
    cale: "/functionalitati/e-facturi-si-avize",
    scurt: "E-facturi și avize",
    descriere: "Factura se face din avizul încărcat și din șablonul clientului, apoi rămâne lângă aviz, în dosar.",
    inHarta: true,
  },

  // <<felie:solutii>>
  {
    cale: "/solutii",
    scurt: "Soluții pe domenii",
    descriere: "Arhiva 3S pe actele fiecărui domeniu: construcții, contabilitate, imobiliare, avocatură și altele.",
    inHarta: true,
  },
  {
    cale: "/solutii/constructii",
    scurt: "Constructori și proiectanți",
    descriere: "Actele fiecărui șantier, pe proiecte, găsite dintr-o întrebare, cu pagina citată.",
    inHarta: true,
  },
  {
    cale: "/solutii/contabilitate",
    scurt: "Contabili și experți fiscali",
    descriere: "Portal pentru fiecare client, acte clasate pe firmă și pe lună, căutare în toți clienții.",
    inHarta: true,
  },
  {
    cale: "/solutii/imobiliare",
    scurt: "Imobiliare și clădiri",
    descriere: "Contractele și actele fiecărei clădiri, găsite după adresă, cu pagina din care vine răspunsul.",
    inHarta: true,
  },
  {
    cale: "/solutii/avocatura",
    scurt: "Avocați și case de avocatură",
    descriere: "Dosarele cauzelor, cu data sosirii fiecărui act, căutate după sens, cu pagina citată.",
    inHarta: true,
  },
  {
    cale: "/solutii/logistica",
    scurt: "Transportatori și expeditori",
    descriere: "CMR-uri, avize și dovezi de livrare, legate de cursă și găsite după cursă sau client.",
    inHarta: true,
  },
  {
    cale: "/solutii/notariate",
    scurt: "Notari publici și arhivele lor",
    descriere: "Registrele biroului notarial, scanate și căutate după numele părților.",
    inHarta: true,
  },
  {
    cale: "/solutii/asigurari",
    scurt: "Asigurări și daune",
    descriere: "Dosarele de daună complete, polițele vechi scanate și actele lipsă semnalate din timp.",
    inHarta: true,
  },

  // <<felie:preturi>>
  {
    cale: "/preturi",
    scurt: "Prețuri",
    descriere:
      "Cele trei pachete 3S, toate la 0 RON astăzi, calculul timpului pierdut căutând acte și întrebările despre plată.",
    inHarta: true,
  },

  // <<felie:blog>>
  // Articolele NU intra aici: stau in registrul blogului (`src/content/blog/registru.ts`).

  // <<felie:produs>>
  {
    cale: "/platforma",
    scurt: "Platforma",
    descriere:
      "Cum preia 3S actele pe hârtie și fișierele, cum le citește, le păstrează în Germania și răspunde cu sursa citată.",
    inHarta: true,
  },
  {
    cale: "/securitate",
    scurt: "Securitate",
    descriere:
      "Unde stau actele în 3S, cum sunt criptate, cine are acces la ele și cum intră în jurnal fiecare document deschis.",
    inHarta: true,
  },
  {
    cale: "/integrari",
    scurt: "Integrări",
    descriere:
      "Programele de care se leagă 3S, de la Microsoft 365 și Google Workspace la contabilitate, stocare și WhatsApp.",
    inHarta: true,
  },

  // <<felie:enterprise-formular>>
  {
    cale: "/enterprise",
    scurt: "Enterprise",
    descriere:
      "Pentru arhive mari: digitizare, mutarea dosarelor, legături cu programele firmei și contract cu nivel de serviciu.",
    inHarta: true,
  },

  // <<felie:comparatii-termene>>
  {
    cale: "/comparatie-drive",
    scurt: "3S comparat cu un drive",
    descriere:
      "Registrul, termenele legale și căutarea din 3S, puse lângă Google Drive funcție cu funcție, cu sursa fiecărui marcaj.",
    inHarta: true,
  },
  {
    cale: "/comparatie-stocare",
    scurt: "Stocarea actelor, comparată",
    descriere:
      "În ce țară stau actele și cum sunt criptate în 3S, într-un bucket S3 propriu și în Google Drive.",
    inHarta: true,
  },
  {
    cale: "/instrumente/termene-pastrare",
    scurt: "Termene de păstrare",
    descriere:
      "Facturi, state de salarii, dosare de personal și contracte: cât se țin în arhivă în România și în Republica Moldova.",
    inHarta: true,
  },
  {
    cale: "/instrumente/termene-pastrare/tipar",
    scurt: "Tabelul termenelor, de tipărit",
    descriere: "Tabelul termenelor de păstrare pentru România și Republica Moldova, gata de tipărit sau de salvat ca PDF.",
    inHarta: false,
  },

  // <<felie:promo>>
  {
    cale: "/promo",
    scurt: "Arhiva care răspunde",
    descriere: "Actele firmei strânse într-o singură arhivă, așezate în dosare și găsite cu o întrebare, pe web sau pe WhatsApp.",
    inHarta: true,
  },
  {
    cale: "/promo/scanare-cu-telefonul",
    scurt: "Bonuri scanate cu telefonul",
    descriere: "Fotografiați bonul, iar 3S îi citește datele și îl pune în dosarul lunii, gata pentru contabil.",
    inHarta: true,
  },

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

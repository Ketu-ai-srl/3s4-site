// Sectorul asigurari (fisa `solutii__asigurari.md`). Scena 3D: cercurile concentrice in jurul unui
// evantai. Nicio afirmatie despre conectori la sistemele de baza ale asiguratorilor sau despre
// conformitati de reglementare pe care 3S nu le are; ce e adevarat: dosarele de dauna pe hartie
// scanate, cautarea cu pagina citata, actele lipsa semnalate, accesul pe dosar si jurnalul. Datele din
// cipuri si din cautare sunt fictive, declarate ca exemplu (plan D9).

import type { Sector } from "./tipuri";

export const ASIGURARI: Sector = {
  cale: "/solutii/asigurari",
  // Rol: ultimul nivel din fir. Lungime: 34.
  nume: "Asigurări și lichidarea daunelor",
  meta: {
    titlu: "Dosare de daună și polițe vechi, scanate și căutabile | 3S",
    descriere:
      "Dosarele de daună, polițele și arhivele vechi scanate, găsite după asigurat, dată sau conținut, cu actele lipsă semnalate din timp.",
  },
  erou: {
    // Rol: h1, un rand (doua la 390). Lungime: 41.
    titlu: "Întrebați dosarul daunei, nu colegii",
    // Rol: subtitlul (3 randuri la 1440, 5 la 390, ca la referinta). Lungime: 178.
    subtitlu:
      "3S ține polițele vechi scanate și actele fiecărei daune în dosarul ei, vă arată ce act mai lipsește și răspunde inspectorilor direct pe WhatsApp, cu pagina exactă din care vine informația.",
  },
  momente: {
    // Rol: subtitlul sinei. Lungime: 55.
    subtitlu: "Un furt, un incendiu și o plată: dosare de daună obișnuite.",
    lista: [
      {
        // Lungimi: eticheta 11, titlul 38, textul 171, fisierul 23, problema 15.
        eticheta: "Când asiguratul anunță furtul",
        titlu: "Asiguratul nu mai găsește polița",
        text: "A încheiat-o acum șase ani, la ghișeu, pe hârtie. Acum întreabă dacă îi acoperă și furtul bicicletei din boxa blocului, iar copia firmei stă într-un dosar din arhivă.",
        fisier: "Polita_2020.pdf",
        problema: "Doar pe hârtie",
      },
      {
        // Lungimi: eticheta 25, titlul 50, textul 154, fisierul 12, problema 18.
        eticheta: "La o săptămână după incendiu",
        titlu: "Lista mărfii distruse, semnată pe hârtie de proprietar",
        text: "Proprietarul magazinului a predat lista mărfii arse ca tabel tipărit și semnat. Foaia a rămas la agenția care a primit avizarea, într-un alt oraș.",
        fisier: "Inventar_marfa_0318.jpg",
        problema: "La altă agenție",
      },
      {
        // Lungimi: eticheta 14, titlul 28, textul 122, fisierul 18 (fara extensie), problema 9.
        eticheta: "Când sună asiguratul",
        titlu: "Asiguratul întreabă de plată",
        text: "Operatorul are un minut la telefon ca să spună ce act mai așteaptă firma. Răspunsul stă într-un e-mail pe care nu l-a văzut.",
        fisier: "Aviz_dauna_IN_0318",
        problema: "Fără răspuns",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte. Lungime: 167.
    punte:
      "Inspectorul întreabă de pe teren și primește actul cu pagina lui. 3S pune fiecare act în dosarul daunei, oricum ar fi sosit, și vă arată ce mai lipsește.",
    // Lungimi: 54 / 55 / 41.
    buline: [
      "Polițele vechi, scanate și căutabile pe pagină",
      "Actele lipsă din dosar, semnalate înainte de termen",
      "Jurnal pentru fiecare dosar deschis",
    ],
    formatie: "cercuri",
    samanta: 7717,
    etichetaScena:
      "Animație: foile împrăștiate se așază în două cercuri în jurul unui evantai de acte, cu cele trei acte din poveste ridicate deasupra",
  },
  pasi: {
    // Pasii urmeaza mecanismul 3S: scanarea arhivei, intrebarea pe WhatsApp, pagina citata.
    lista: [
      {
        // Lungimi: titlul 32, textul 90.
        titlu: "Arhiva pe hârtie merge la scanat",
        text: "Dosarele închise se predau la scanat și intră în 3S ca fișiere căutabile, pagină cu pagină.",
      },
      {
        // Lungimi: titlul 26, textul 114.
        titlu: "Întrebați de pe teren, pe WhatsApp",
        text: "Inspectorul scrie pe WhatsApp numărul daunei și ce caută, iar 3S îi răspunde din dosarul ei, fără să deschidă laptopul.",
      },
      {
        // Lungimi: titlul 35, textul 110.
        titlu: "Fiecare răspuns, cu pagina lui",
        text: "Lângă răspuns stă actul din care vine și pagina exactă, ca o sumă sau o dată să poată fi verificată înainte de plată.",
      },
    ],
    demo: {
      // Lungime: 31. Cauta lista din al doilea moment.
      interogare: "inventarul mărfii arse, dauna 0318",
      rezultat: {
        fisier: "Inventar_marfa_0318.jpg",
        // Lungime: 20 (doua randuri la 390, ca la referinta).
        loc: "Dauna 0318 · Incendiu · Inventar",
        potrivire: "88% potrivire · 1,9 s",
        // Lungime: 135; termenii: 12 si 30.
        fragment:
          "Lista semnată de proprietar pe 9 martie 2026 numără [[42 de baxuri de cafea]] și două rafturi metalice, distruse de [[fumul din depozitul mic]].",
      },
    },
  },
  inainteDupa: {
    // Lungimi: 48 / 49 / 41.
    inainte: [
      "Inspectorul sună la birou ca să afle ce e în dosar",
      "Actele predate la agenții ajung cu zile întârziere",
      "Asiguratul așteaptă la telefon un răspuns clar",
    ],
    // Lungimi: 43 / 39 / 43.
    dupa: [
      "Inspectorul întreabă pe WhatsApp, de pe teren",
      "Actele de la agenție, puse în dosar",
      "Operatorul vede pe loc ce act mai lipsește",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 54, raspunsul 262. O intrebare a sectorului, pe arhiva de hartie.
      intrebare: "Ce facem cu dosarele de daună vechi, pe hârtie?",
      raspuns:
        "Le predați la scanat, cutie cu cutie. Fiecare dosar intră în 3S cu textul tuturor paginilor, legat de numărul daunei și de numele asiguratului, așa că o poliță de acum zece ani se găsește la fel de ușor ca una semnată ieri.",
    },
    {
      // Lungimi: intrebarea 48, raspunsul 321.
      intrebare: "Cine poate deschide dosarele de daună?",
      raspuns:
        "Accesul se dă pe persoană și pe dosar: un inspector vede dosarele lui, iar echipa de audit vede ce îi deschideți. Fiecare căutare și fiecare document deschis se trec în jurnal, cu numele și ora, iar jurnalul vă stă la dispoziție.",
    },
  ],
};

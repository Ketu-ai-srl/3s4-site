// Sectorul avocatura (fisa `solutii__avocatura.md`). Scena 3D: trei bibliorafturi pe doua rafturi,
// vazute din unghi. Iconita sectorului e aceeasi ca in meniu (balanta): la referinta erau doua
// simboluri diferite, iar inconsecventa nu se preia. Datele din cipuri si din cautare sunt fictive,
// declarate ca exemplu (plan D9).

import type { Sector } from "./tipuri";

export const AVOCATURA: Sector = {
  cale: "/solutii/avocatura",
  // Rol: ultimul nivel din fir. Lungime: 28.
  nume: "Avocați și case de avocatură",
  meta: {
    titlu: "Arhiva cabinetului de avocatură, cu pagina citată | 3S",
    descriere:
      "Dosarele cauzelor, cu actele primite și data sosirii lor, găsite după sens și cu pagina citată. Fișierele stau la Amazon, în Germania.",
  },
  erou: {
    // Rol: h1, un rand. Lungime: 40.
    titlu: "Caută în arhiva cabinetului după sens",
    // Rol: subtitlul (3 randuri la 1440, 5 la 390, ca la referinta). Lungime: 200.
    subtitlu:
      "3S scanează dosarele cabinetului, leagă e-mailul și fișierele de pe calculatoare și pune fiecare act pe cauza lui, cu data sosirii. Orice act se găsește după sens, cu pagina din care vine răspunsul.",
  },
  momente: {
    // Rol: subtitlul sinei. Lungime: 57.
    subtitlu: "Trei zile grele dintr-un proces obișnuit, văzute din cabinet.",
    lista: [
      {
        // Lungimi: eticheta 24, titlul 31, textul 129, fisierul 18, problema 22.
        eticheta: "La prima întâlnire",
        titlu: "Un client revine după trei ani",
        text: "Vrea să continue pe baza contractului de asistență semnat atunci cu cabinetul. Nimeni nu mai știe în ce dosar a fost pus originalul.",
        fisier: "Asistenta_2023.pdf",
        problema: "Dosar necunoscut",
      },
      {
        // Lungimi: eticheta 26, titlul 40, textul 128, fisierul 25, problema 21.
        eticheta: "La un telefon de la client",
        titlu: "Clientul întreabă ce a semnat în 2021",
        text: "Contractul redactat de cabinet pentru el stă în arhiva de hârtie. Vrea să afle azi ce termen de denunțare are, iar exemplarul lui s-a pierdut.",
        fisier: "Contract_distributie_2021.pdf",
        problema: "Doar în arhiva de hârtie",
      },
      {
        // Lungimi: eticheta 22, titlul 38, textul 112, fisierul 25, problema 20.
        eticheta: "Luni, după ce se deschide poșta",
        titlu: "Hotărârea a sosit prin poștă",
        text: "Plicul cu hotărârea a fost primit la recepție și pus deoparte. Data la care a sosit contează, dar nu e notată nicăieri.",
        fisier: "Hotarare_dosar_1482_2025.pdf",
        problema: "Data primirii nenotată",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte. Lungime: 158.
    punte:
      "Dosarele pe hârtie se scanează, e-mailul se leagă, iar orice act se găsește dintr-o întrebare, cu pagina lui. Cine are acces la o cauză hotărăști tu.",
    // Lungimi: 42 / 54 / 59.
    buline: [
      "O întrebare, iar actul iese din orice dosar",
      "Actele fiecărei cauze, cu data la care au sosit",
      "Acces pe dosar, iar fiecare deschidere intră în jurnal",
    ],
    formatie: "bibliorafturi",
    samanta: 4409,
    etichetaScena:
      "Animație: foile împrăștiate se strâng în trei bibliorafturi pe două rafturi, cu câte un act din poveste în fața fiecăruia",
  },
  pasi: {
    lista: [
      {
        // Lungimi: titlul 16, textul 103.
        titlu: "Predă cutiile la scanat",
        text: "Dosarele închise pleacă la scanat și se întorc ca fișiere căutabile, iar e-mailul se leagă din setări.",
      },
      {
        // Lungimi: titlul 19, textul 80.
        titlu: "Întreabă pe WhatsApp",
        text: "Din sala de judecată, scrii întrebarea și primești actul potrivit, pe telefon.",
      },
      {
        // Lungimi: titlul 15, textul 114.
        titlu: "Accesul, pe dosar",
        text: "Stabilește cine vede fiecare cauză, iar orice document deschis intră în jurnal, cu numele și ora.",
      },
    ],
    demo: {
      // Lungime: 65. Cauta actul din al treilea moment.
      interogare: "hotărârea din dosarul 1482/2025 și data la care am primit-o",
      rezultat: {
        fisier: "Hotarare_dosar_1482_2025.pdf",
        // Lungime: 30.
        loc: "Dosar 1482/2025 · Hotărâri",
        potrivire: "87% potrivire · 1,3 s",
        // Lungime: 156; termenii: 28 si 24.
        fragment:
          "[[Sentința civilă nr. 312]] din 20 martie 2026, primită la sediul cabinetului pe [[7 aprilie 2026]], cu data scrisă pe plic și scanată în aceeași zi.",
      },
    },
  },
  inainteDupa: {
    // Lungimi: 48 / 51 / 64.
    inainte: [
      "Clientul așteaptă la telefon până se găsește actul",
      "Un act vechi se caută prin cutii, dosar cu dosar",
      "Data primirii unui act se notează pe hârtie, când se notează",
    ],
    // Lungimi: 42 / 35 / 42.
    dupa: [
      "Contractele redactate, găsite după client",
      "Arhiva cabinetului, căutabilă după sens",
      "Fiecare act, cu data la care a sosit",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 54, raspunsul 291. O intrebare a sectorului, pe data primirii.
      intrebare: "Cum aflăm data la care a sosit un act la cabinet?",
      raspuns:
        "Actul scanat la recepție sau primit pe e-mail intră în 3S cu data sosirii, pus pe cauza la care se referă. Cauți hotărârea sau adresa și vezi pe loc când a ajuns la cabinet, cu pagina din care vine răspunsul.",
    },
    {
      // Lungimi: intrebarea 58, raspunsul 367. O intrebare a sectorului, pe acces si gazduire.
      intrebare: "Cine din cabinet vede dosarele unui client?",
      raspuns:
        "Accesul îl stabilești tu, pe persoană și pe dosar: un avocat vede cauzele la care lucrează, iar un coleg nou vede doar ce îi deschizi. Fiecare document deschis se trece în jurnal, cu numele și ora. Fișierele stau pe serverele Amazon din Germania, într-o singură regiune a Uniunii Europene.",
    },
  ],
};

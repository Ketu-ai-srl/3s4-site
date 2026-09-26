// Sectorul notariate (fisa `solutii__notariate.md`). Scena 3D: peretele de registre.
//
// DOAR FUNCTIA PRODUSULUI. Pagina spune ce face 3S cu volumele: scanare, textul paginilor in index,
// cautare dupa numele partilor, trimitere la volum si pagina. Nicio promisiune despre LOCUL scanarii
// (serviciu operational neconfirmat, retras: `solutii-notari-scanare-la-sediu`). Varianta cu
// predarea arhivei notariale spre pastrare in afara biroului (proces-verbal, originale in depozit) a
// fost RETRASA: nimeni n-a verificat-o la sursa primara (Legea 36/1995 si regulamentul ei) si
// owner-ul n-a confirmat-o (registrul: `solutii-notari-custodie`).
// Nicio afirmatie despre parteneriate cu camere notariale sau despre conformitati pe care 3S nu le are.
// Datele din cipuri si din cautare sunt fictive, declarate ca exemplu (plan D9); numele persoanelor
// din cautare sunt EVIDENT fictive (decizia D11), iar cardul poarta eticheta vizibila „exemplu”.

import type { Sector } from "./tipuri";

export const NOTARIATE: Sector = {
  cale: "/solutii/notariate",
  // Rol: ultimul nivel din fir. Lungime: 33.
  nume: "Notari publici și arhivele lor",
  meta: {
    titlu: "Registre notariale scanate și căutabile | 3S",
    descriere:
      "Registrele și volumele biroului notarial, scanate și căutabile după numele părților, cu trimitere la volumul și pagina fiecărui act.",
  },
  erou: {
    // Rol: h1, un rand (doua la 390). Lungime: 41.
    titlu: "Căutați în registre după numele părților",
    // Rol: subtitlul (3 randuri la 1440, 5 la 390, ca la referinta). Lungime: 195.
    subtitlu:
      "Volumele biroului se scanează, iar textul fiecărei pagini intră în 3S. O procură sau un contract vechi se găsește apoi după numele părților, chiar fără numărul actului, cu volumul și pagina lui.",
  },
  momente: {
    // Rol: subtitlul sinei. Lungime: 45.
    subtitlu: "Acte vechi pe care cineva le cere din nou.",
    lista: [
      {
        // Lungimi: eticheta 27, titlul 33, textul 135, fisierul 16, problema 24.
        eticheta: "La cererea unei bănci",
        titlu: "Banca vrea copia unei procuri",
        text: "Clientul a dat o procură acum opt ani, ca un teren să fie vândut în locul lui. Banca cere acum o copie, iar el își amintește doar numele celui împuternicit.",
        fisier: "Procura_speciala_0588.pdf",
        problema: "Doar un nume",
      },
      {
        // Lungimi: eticheta 19, titlul 44, textul 117, fisierul 17, problema 26.
        eticheta: "La ghișeul biroului",
        titlu: "Un duplicat cerut fără numărul actului și fără an",
        text: "Clientul a pierdut contractul apartamentului și nu mai știe anul. Știe doar numele vânzătoarei, o vecină din bloc.",
        fisier: "Duplicat_act_1214.pdf",
        problema: "Numărul actului, necunoscut",
      },
      {
        // Lungimi: eticheta 32, titlul 33, textul 142, fisierul 18 (fara extensie), problema 14.
        eticheta: "La o intabulare întârziată",
        titlu: "Se cere schița anexată unui act vechi",
        text: "Pentru cartea funciară e nevoie de schița atașată unui act din 2011. Numărul actului se știe, dar anexele acelui an stau separat, fără index.",
        fisier: "Anexe_acte_2011_II",
        problema: "Anexă fără index",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte. Lungime: 152.
    punte:
      "Fiecare volum se scanează, iar textul paginilor lui intră în 3S. Un act găsit vine cu trimiterea la volum și la pagină, ca să fie verificat pe original.",
    // Lungimi: 53 / 65 / 52.
    buline: [
      "Volumele vechi, scanate și căutabile pe pagină",
      "Duplicatul cerut, găsit și fără numărul actului vechi",
      "Fiecare act găsit, cu volumul și pagina din registru",
    ],
    formatie: "perete",
    samanta: 6607,
    etichetaScena:
      "Animație: foile împrăștiate se așază într-un perete de registre, cu cele trei acte din poveste în față",
  },
  pasi: {
    lista: [
      {
        // Lungimi: titlul 26, textul 119.
        titlu: "Volume scanate și indexate",
        text: "Volumele și registrele se scanează, iar textul fiecărei pagini intră în index, legat de volumul și pagina de unde vine.",
      },
      {
        // Lungimi: titlul 21, textul 90.
        titlu: "Întrebați și de pe telefon",
        text: "Din fața clientului, notarul întreabă pe telefon și primește actul, cu pagina lui din volum.",
      },
      {
        // Lungimi: titlul 21, textul 95.
        titlu: "Accesul, pe persoană",
        text: "Stabiliți cine din birou caută în arhivă: accesul se dă pe persoană și pe dosar, nu pe tot biroul.",
      },
    ],
    demo: {
      // Lungime: 51. Cauta procura din primul moment, in volumul scanat, dupa numele unei parti.
      interogare: "procura dată de Ion Exemplu pentru vânzarea unui teren",
      rezultat: {
        fisier: "Procura_speciala_0588.pdf",
        // Lungime: 25.
        loc: "Arhiva 2018 · Volumul III",
        potrivire: "82% potrivire · 1,5 s",
        // Lungime: 126; termenii: 12 si 11 (aici 16 si 14).
        fragment:
          "Procură din [[9 octombrie 2018]], prin care Ion Exemplu îi dă lui [[Vasile Exemplu]] dreptul de a vinde, în numele lui, terenul arabil.",
      },
      // Demo-ul arata nume de persoane: eticheta vizibila „exemplu” din coltul cardului (D11).
      insigna: "exemplu",
    },
  },
  inainteDupa: {
    // Lungimi: 42 / 43 / 44.
    inainte: [
      "Banca așteaptă zile întregi copia unei procuri vechi",
      "Pentru un duplicat se răsfoiesc volumele",
      "Anexele unui act stau în volume fără index",
    ],
    // Lungimi: 41 / 49 / 51.
    dupa: [
      "Procura, găsită după numele unei părți",
      "Duplicatul cerut, găsit fără numărul actului vechi",
      "Schița din anexă, găsită lângă actul ei, în orice an",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 52, raspunsul 212. O intrebare a sectorului, pe cautarea fara numar.
      intrebare: "Pot căuta un act dacă nu știu numărul lui?",
      raspuns:
        "Da. Textul fiecărei pagini scanate intră în 3S, așa că un act se găsește după numele celor care l-au semnat sau după o frază din el. Răspunsul vine cu volumul și pagina, ca să verificați pe original.",
    },
    {
      // Lungimi: intrebarea 43, raspunsul 216. Ce contine rezultatul unei cautari.
      intrebare: "Ce primește notarul când 3S găsește un act?",
      raspuns:
        "Fișierul actului, volumul și pagina lui, plus fragmentul în care apar numele sau fraza căutată. Cu trimiterea la volum și pagină, actul se verifică repede pe original, înainte să eliberați copia sau duplicatul cerut.",
    },
  ],
};

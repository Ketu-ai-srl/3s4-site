// Sectorul constructii (fisa `solutii__constructii.md`): pagina-reper a sablonului, cea mai inalta
// din grup. Scena 3D: piramida in trepte. Datele din cipuri si din cautare sunt fictive, declarate ca
// exemplu (plan D9). Afirmatiile: `src/content/afirmatii/solutii.json`, `unde` = acest fisier.
//
// Momentele sunt etapele unei lucrari (ofertare, executie, garantie), nu zile ale saptamanii. Fisa
// tehnica din al treilea moment e un act fictiv; exemplul nu spune ce acte cere legea la receptie
// si nici ce garantii impune ea.

import type { Sector } from "./tipuri";

export const CONSTRUCTII: Sector = {
  cale: "/solutii/constructii",
  // Rol: ultimul nivel din fir. Lungime: 31. Acelasi nume ca in meniul Solutii.
  nume: "Constructori și proiectanți",
  meta: {
    titlu: "Planșe și procese-verbale de șantier, cu pagina citată | 3S",
    descriere:
      "Autorizații, planșe, procese-verbale și certificate de pe fiecare șantier, într-o arhivă în care găsiți orice act dintr-o singură întrebare.",
  },
  erou: {
    // Rol: h1, doua randuri (trei la 390). Lungime: 65.
    titlu: "Planșa corectă, pe telefonul echipei, înainte de turnare",
    // Rol: subtitlul (4 randuri, 18/28,8). Lungime: 267.
    subtitlu:
      "3S scanează bibliorafturile fiecărei lucrări și primește pozele făcute pe șantier cu aplicația de telefon. Citește fiecare planșă, proces-verbal sau aviz, iar la o întrebare pusă pe WhatsApp răspunde cu actul deschis la pagina potrivită, ca să îl verificați pe loc.",
  },
  momente: {
    // Rol: subtitlul sinei (un rand). Lungime: 80.
    subtitlu: "Trei zile dintr-un proiect, fiecare cu un act care lipsește când e nevoie de el.",
    lista: [
      {
        // Lungimi: eticheta 11, titlul 33, textul 178, fisierul 27, problema 14.
        eticheta: "La ofertare",
        titlu: "Cât a costat tâmplăria la blocul trecut?",
        text: "Pentru oferta de mâine, prețul trebuie comparat cu cel plătit acum doi ani, pe alt proiect. Contractul și facturile stau în arhiva de hârtie a proiectului închis, în cutii fără listă.",
        fisier: "Contract_tamplarie_bloc_A.pdf",
        problema: "Proiect închis",
      },
      {
        // Lungimi: eticheta 15, titlul 33, textul 180, fisierul 18, problema 27.
        eticheta: "În timpul execuției",
        titlu: "Echipa caută un detaliu de armare",
        text: "Fierarii sunt pe placa etajului 3 și au nevoie de detaliul pentru golul casei scării. Planșa bună e deschisă pe calculatorul de la birou, iar inginerul răspunde la telefon abia după o oră.",
        fisier: "Plansa_S07_placa.pdf",
        problema: "Doar la birou",
      },
      {
        // Lungimi: eticheta 13, titlul 39, textul 132, fisierul 30, problema 14.
        eticheta: "În perioada de garanție",
        titlu: "Apare o infiltrație la terasa blocului",
        text: "La doi ani după terminare, curge apă în tavanul ultimului etaj. Constructorul trebuie să arate că hidroizolația a fost verificată înainte de acoperire.",
        fisier: "PV_ascunse_hidroizolatie.pdf",
        problema: "Semnat, dar negăsit",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte (22,4/500, 3 randuri). Lungime: 175.
    punte:
      "Orice întrebare despre lucrare primește actul și pagina din care vine răspunsul. 3S citește ce intră din e-mail, din telefon sau de pe scaner și pune fiecare act pe proiectul lui.",
    // Lungimi: 45 / 45 / 58.
    buline: [
      "Actele fiecărui șantier, în dosarul proiectului",
      "Răspunsul vine cu pagina din care e luat",
      "Actele care lipsesc, semnalate înainte de recepție",
    ],
    formatie: "piramida",
    samanta: 1101,
    etichetaScena:
      "Animație: foile împrăștiate se așază într-o piramidă în trepte, cu cele trei acte din poveste în față",
  },
  pasi: {
    // Pasii urmeaza mecanismul 3S: scanarea hartiei si a pozelor, intrebarea pe WhatsApp, pagina citata.
    lista: [
      {
        // Lungimi: titlul 26, textul 133.
        titlu: "Bibliorafturile merg la scanat",
        text: "Dosarele pe hârtie ale lucrărilor se scanează, iar de pe șantier actele intră ca poze din aplicația de telefon, gata de citit.",
      },
      {
        // Lungimi: titlul 22, textul 125.
        titlu: "Detaliul, cerut pe WhatsApp",
        text: "Șeful de echipă scrie pe WhatsApp ce detaliu îi trebuie și primește răspunsul din planșa potrivită, fără drum până la birou.",
      },
      {
        // Lungimi: titlul 23, textul 146.
        titlu: "Verificați pe pagină",
        text: "Fiecare răspuns arată actul și pagina din care vine, ca cifra sau cota citită să poată fi confirmată pe original înainte să turnați sau să comandați.",
      },
    ],
    demo: {
      // Lungime: 41, pe un singur rand si la 390, ca la referinta pe acest sector.
      // Cauta documentul din al treilea moment.
      interogare: "PV-ul pentru hidroizolația terasei B",
      rezultat: {
        fisier: "PV_ascunse_hidroizolatie.pdf",
        // Lungime: 34.
        loc: "Bloc B · Terasă · Hidroizolații",
        potrivire: "84% potrivire · 2,2 s",
        // Lungime: 135 la referinta; aici 160, ca sa tina 2 randuri la 1440 si 4 la 390 (S4 de 933 px, ca in fisa).
        fragment:
          "Proces-verbal de lucrări ascunse pentru hidroizolația terasei blocului B, verificată pe [[5 iunie 2024]] de dirigintele de șantier, cu [[proba de etanșeitate]] trecută.",
      },
    },
  },
  inainteDupa: {
    // Lungimi: 68 / 54 / 62.
    inainte: [
      "Un detaliu din planșă înseamnă un drum până la birou sau un telefon",
      "Prețurile de pe proiectele închise stau în cutii",
      "Procesul-verbal al unei lucrări ascunse stă în biblioraftul dirigintelui",
    ],
    // Lungimi: 46 / 45 / 57.
    dupa: [
      "Detaliul cerut, primit pe WhatsApp, pe șantier",
      "Prețurile vechi, găsite după material",
      "Procesele-verbale ale lucrării, găsite și după ani",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 54, raspunsul 247. O intrebare a sectorului, pe arhiva de hartie.
      intrebare: "Ce facem cu arhiva de hârtie a proiectelor închise?",
      raspuns:
        "O predați la scanat, cutie cu cutie. Fiecare contract, factură sau proces-verbal intră în 3S pe proiectul lui, iar prețul plătit pe o lucrare veche îl găsiți după material sau după furnizor, cu pagina din care vine cifra.",
    },
    {
      // Lungimi: intrebarea 77, raspunsul 257.
      intrebare: "Ne ajută 3S cu actele cerute la recepție și pentru cartea tehnică a construcției?",
      raspuns:
        "Da. Procesele-verbale, avizele și certificatele de calitate stau în dosarul proiectului, pe etape. 3S vă arată din timp ce act lipsește dintr-un dosar, așa că la recepție ajungeți cu actele complete, strânse pe parcursul lucrării.",
    },
  ],
};

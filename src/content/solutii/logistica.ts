// Sectorul logistica (fisa `solutii__logistica.md`). Scena 3D: drumul serpuit. Rutele, cursele si
// numerele de act sunt fictive, romanesti, declarate ca exemplu (plan D9); fara numere de
// inmatriculare, ca un exemplu sa nu poata numi o masina reala. WhatsApp apare numai ca locul in care
// se pune o intrebare arhivei (registrul: `solutii-whatsapp`); ca 3S primeste acte pe WhatsApp nu e o
// afirmatie facuta aici.
//
// Momentele sunt momentele biroului (oferta, reclamatia, decontul), nu ale drumului: hartia ramasa la
// sofer si dauna pe traseu nu sunt povestile paginii.

import type { Sector } from "./tipuri";

export const LOGISTICA: Sector = {
  cale: "/solutii/logistica",
  // Rol: ultimul nivel din fir. Lungime: 29.
  nume: "Transportatori și expeditori",
  meta: {
    titlu: "Actele de transport, legate de cursă și de client | 3S",
    descriere:
      "CMR-uri, avize și dovezi de livrare, legate de cursa lor și găsite după cursă sau după client, cu pagina din care vine răspunsul.",
  },
  erou: {
    // Rol: h1, un rand (doua la 390). Lungime: 35. Scris pe canalul 3S (intrebarea pe WhatsApp).
    titlu: "Cere pe WhatsApp CMR-ul unei curse",
    // Rol: subtitlul (3 randuri). Lungime: 177.
    subtitlu:
      "CMR-urile, avizele și dovezile de livrare ajung în 3S din aplicația de telefon sau de la scanat. Dispecerul găsește orice act după cursă sau după client, iar pe drum îl poate cere pe WhatsApp.",
  },
  momente: {
    // Rol: subtitlul sinei. Lungime: 59.
    subtitlu: "Trei zile obișnuite dintr-un birou de transport rutier.",
    lista: [
      {
        // Lungimi: eticheta 12, titlul 42, textul 150, fisierul 26, problema 22.
        eticheta: "La o ofertă nouă",
        titlu: "Tariful vechi pentru aceeași rută",
        text: "Clientul cere o ofertă pe ruta pe care ați lucrat pentru el anul trecut. Tariful convenit atunci stă într-o anexă la contract, trimisă pe e-mail.",
        fisier: "Anexa_tarife_client_2025.pdf",
        problema: "Negăsită în e-mail",
      },
      {
        // Lungimi: eticheta 10, titlul 54, textul 173, fisierul 23, problema 20.
        eticheta: "La o reclamație de întârziere",
        titlu: "Clientul contestă ora la care a sosit marfa la depozit",
        text: "Contractul are penalități pentru întârziere, iar clientul susține că marfa a ajuns după-amiază. Ora descărcării e scrisă de mână pe avizul semnat la rampă, scanat printre alte sute de avize.",
        fisier: "Aviz_descarcare_2217.jpg",
        problema: "Printre sute de scanări",
      },
      {
        // Lungimi: eticheta 19, titlul 41, textul 123, fisierul 23, problema 19.
        eticheta: "La plata subcontractorului",
        titlu: "Subcontractorul își cere banii pentru o lună întreagă",
        text: "Plata celor 14 curse se face numai cu CMR-urile semnate atașate. Jumătate au venit pe e-mail, restul stau în mapa dispecerului.",
        fisier: "Decont_subcontractor_iunie.xlsx",
        problema: "Șapte CMR-uri lipsă",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte. Lungime: 159.
    punte:
      "Întrebi de oriunde, pe web, pe telefon sau pe WhatsApp, și primești actul cu pagina lui. 3S îl găsește pentru că fiecare act de transport stă legat de cursa și de clientul lui.",
    // Lungimi: 38 / 43 / 45.
    buline: [
      "Răspunsuri pe WhatsApp, oriunde",
      "Răspunsul vine cu pagina actului",
      "Mapele vechi, scanate și căutabile",
    ],
    formatie: "drum",
    samanta: 5503,
    etichetaScena:
      "Animație: foile împrăștiate se înșiră de-a lungul unui drum șerpuit, cu cele trei acte din poveste ridicate deasupra lui",
  },
  pasi: {
    lista: [
      {
        // Lungimi: titlul 18, textul 109.
        titlu: "Întreabă pe WhatsApp",
        text: "Dispecerul scrie numărul cursei și ce act caută, iar 3S îi răspunde cu documentul, din orice loc.",
      },
      {
        // Lungimi: titlul 27, textul 102.
        titlu: "Verifică pe act",
        text: "Răspunsul vine cu actul și pagina din care e luat, deci ora sau semnătura se văd pe original.",
      },
      {
        // Lungimi: titlul 32, textul 107.
        titlu: "Arhiva veche, scanată",
        text: "Mapele cu CMR-uri din anii trecuți se predau la scanat și intră în aceeași căutare cu actele noi.",
      },
    ],
    demo: {
      // Lungime: 39. Cauta actul din al doilea moment.
      interogare: "ora descărcării pentru cursa 2217 la Arad",
      rezultat: {
        fisier: "Aviz_descarcare_2217.jpg",
        // Lungime: 37 (trei randuri la 390, ca la referinta).
        loc: "Cursa 2217 · Pitești - Arad · Avize de descărcare",
        potrivire: "81% potrivire · 1,7 s",
        // Lungime: 150; termenii: 3 si 7 (aici 5 si 12).
        fragment:
          "Marfa din cursa 2217 a fost descărcată la depozitul din Arad pe 14 mai 2026, la ora [[10:40]], cu semnătura și ștampila gestionarului, [[fără rezerve]].",
      },
    },
  },
  inainteDupa: {
    // Lungimi: 43 / 40 / 60.
    inainte: [
      "Tariful vechi se caută prin e-mailuri",
      "O oră contestată se caută prin avize",
      "CMR-urile pentru decont se strâng din mape",
    ],
    // Lungimi: 38 / 57 / 54.
    dupa: [
      "Tariful găsit după rută și client",
      "Ora descărcării, citită pe avizul scanat, cu pagina și semnătura",
      "Decontul pleacă cu toate CMR-urile, găsite după cursă",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 40, raspunsul 161.
      intrebare: "Poate dispecerul să întrebe arhiva pe WhatsApp?",
      raspuns:
        "Da. Scrie numărul cursei sau numele clientului și ce act caută, iar 3S îi răspunde pe WhatsApp cu documentul și cu pagina din care vine informația, fără ca dispecerul să deschidă calculatorul.",
    },
    {
      // Lungimi: intrebarea 50, raspunsul 177.
      intrebare: "Putem căuta și în CMR-urile din anii trecuți?",
      raspuns:
        "Da. Mapele vechi se predau la scanat, iar textul fiecărui CMR intră în index, așa că îl găsești după cursă, client sau dată, cu pagina din care vine răspunsul.",
    },
  ],
};

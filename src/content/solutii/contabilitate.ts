// Sectorul contabilitate (fisa `solutii__contabilitate.md`): singura pagina care iese din sablon, cu
// o sectiune in plus, consola cu toti clientii (S3b), intre banda si pasi. Scena 3D: raftul inclinat.
//
// CONSOLA E O FUNCTIONALITATE EXISTENTA (decizia D4b a owner-ului: functionalitatile se prezinta ca
// existente); nota referintei despre functii „in plan” nu se preia, iar locul ei il ia o nota despre
// accesul pe persoana si jurnal. Firmele din macheta sunt EVIDENT fictive (numele poarta „Exemplu”,
// decizia D11), iar fiecare cod fiscal are cifra de control gresita, deci nu poate apartine unei
// firme reale (proba: `tests/solutii.test.ts`). Macheta poarta eticheta vizibila „Date de exemplu”.
//
// Capabilitatile consolei sunt functiile ei (D4b), scrise pe ce vede contabilul in macheta, in alta
// ordine si cu alte cuvinte decat la referinta.

import type { Sector } from "./tipuri";

export const CONTABILITATE: Sector = {
  cale: "/solutii/contabilitate",
  // Rol: ultimul nivel din fir. Lungime: 29.
  nume: "Contabili și experți fiscali",
  meta: {
    titlu: "Actele clienților, clasate pe firmă și pe lună | 3S",
    descriere:
      "Clienții încarcă actele în portalul lor, 3S le clasează pe firmă și pe lună, iar tu cauți deodată în actele tuturor clienților.",
  },
  erou: {
    // Rol: h1, doua randuri (trei la 390). Lungime: 63.
    titlu: "Arhiva fiecărei firme din portofoliu, clasată pe lună și căutată deodată",
    // Rol: subtitlul (3 randuri la 1440, 5 la 390, ca la referinta). Lungime: 169; aici ~195, ca primul
    // paragraf al paginii sa raspunda singur (poarta G-AI-02 cere 30-80 de cuvinte).
    subtitlu:
      "3S clasează pe lună tot ce trimit clienții, pe e-mail sau din portalul lor, și îți arată la fiecare firmă ce acte lipsesc înainte de închidere. Când cauți o factură, primești actul și pagina lui.",
  },
  momente: {
    // Rol: subtitlul sinei. Lungime: 79.
    subtitlu: "Un birou care ține actele a zeci de firme, în zile aglomerate.",
    lista: [
      {
        // Lungimi: eticheta 11, titlul 42, textul 153, fisierul 12, problema 28.
        eticheta: "Prima zi a lunii",
        titlu: "Un client nou aduce doi ani de acte",
        text: "Firma vine de la alt birou cu o cutie de dosare și un folder de PDF-uri fără nume clare. Pentru balanța lunii trebuie aflat ce există și ce lipsește.",
        fisier: "Preluare_client_nou.zip",
        problema: "Neclasat, fără inventar",
      },
      {
        // Lungimi: eticheta 22, titlul 50, textul 143, fisierul 22, problema 26.
        eticheta: "Când un furnizor schimbă banca",
        titlu: "Același furnizor, la patru clienți diferiți",
        text: "Un furnizor și-a mutat contul la altă bancă, iar plățile trebuie verificate la fiecare firmă care cumpără de la el. Actele lui stau în patru arhive.",
        fisier: "Notificare_cont_AEI.pdf",
        problema: "Patru arhive separate",
      },
      {
        // Lungimi: eticheta 36, titlul 19, textul 151, fisierul 26, problema 18.
        eticheta: "După orele de program",
        titlu: "Un patron vrea confirmarea",
        text: "A trimis de pe telefon factura de chirie a sediului și întreabă dacă a ajuns. La birou mai așteaptă patruzeci de mesaje nedeschise de la alți clienți.",
        fisier: "Factura_chirie_sediu_iunie.pdf",
        problema: "Așteaptă până luni",
      },
    ],
  },
  schimbare: {
    // Rol: paragraful-punte. Lungime: 172.
    punte:
      "Contabilul găsește actele deja clasate, pe firmă și pe lună, cu cele lipsă semnalate. Când clientul întreabă ceva, răspunsul se caută peste toată arhiva.",
    // Lungimi: 44 / 36 / 54.
    buline: [
      "Actele sosite, clasate pe lună",
      "Actele lipsă, văzute din timp pe fiecare client",
      "Fiecare act, cu pagina lui și cu jurnal de acces",
    ],
    formatie: "raft",
    samanta: 2203,
    etichetaScena:
      "Animație: foile împrăștiate se așază pe un raft înclinat, ca un registru deschis, cu cele trei acte din poveste în față",
  },
  pasi: {
    lista: [
      {
        // Lungimi: titlul 20, textul 116.
        titlu: "Arhiva veche merge la scanat",
        text: "Cutiile cu acte din anii trecuți se predau la scanat și se întorc în 3S așezate pe firmă și pe lună, cu textul fiecărei pagini.",
      },
      {
        // Lungimi: titlul 22, textul 109.
        titlu: "Clientul trimite pe e-mail",
        text: "Fiecare firmă are o adresă proprie în 3S, iar atașamentele trimise acolo ajung singure în dosarul ei, fără să le muți.",
      },
      {
        // Lungimi: titlul 22, textul 110.
        titlu: "Întreabă arhiva, nu clientul",
        text: "Când lipsește ceva, cauți întâi în 3S: răspunsul vine cu actul și pagina, din orice firmă.",
      },
    ],
    demo: {
      // Lungime: 27. Cauta notificarea din al doilea moment.
      interogare: "contul nou al furnizorului Alfa Exemplu",
      rezultat: {
        fisier: "Notificare_cont_AEI.pdf",
        // Lungime: 31.
        loc: "Beta Exemplu Agro · 2026 · Furnizori",
        potrivire: "90% potrivire · 0,4 s",
        // Lungime: 130; termenii: 4 si 4 (aici 11 si 23).
        fragment:
          "Începând cu [[1 iunie 2026]], Alfa Exemplu Instal SRL primește plățile numai în contul deschis la noua bancă, iar [[contul vechi se închide]] la sfârșitul lunii.",
      },
      // Demo-ul arata o firma si o plata: eticheta vizibila „exemplu” din coltul cardului (D11).
      insigna: "exemplu",
    },
  },
  inainteDupa: {
    // Lungimi: 57 / 47 / 64.
    inainte: [
      "Actele unui client nou vin nesortate, într-o cutie de carton",
      "Actele unui furnizor se caută firmă cu firmă, pe rând",
      "Un client așteaptă confirmarea până se eliberează contabilul",
    ],
    // Lungimi: 39 / 35 / 57.
    dupa: [
      "Arhiva preluată, clasată pe lună la sosire",
      "Actele unui furnizor, din toate firmele",
      "Clientul vede singur în portal ce acte au ajuns",
    ],
  },
  intrebari: [
    {
      // Lungimi: intrebarea 58, raspunsul 162. O intrebare a sectorului, pe drumurile actelor.
      intrebare: "Pe ce drumuri ajung actele clienților în 3S?",
      raspuns:
        "Clientul le încarcă în portalul firmei lui, le trimite la adresa de e-mail pe care firma o are în 3S sau ți le aduce pe hârtie, iar tu le predai la scanat. Toate ajung în același dosar, clasate pe lună.",
    },
    {
      // Lungimi: intrebarea 46, raspunsul 183. O intrebare a sectorului, pe acces.
      intrebare: "Cine din birou poate vedea actele unei firme?",
      raspuns:
        "Accesul se dă pe persoană și pe firmă: fiecare contabil vede firmele de care se ocupă, iar un coleg nou vede doar ce îi deschizi. Fiecare document deschis se trece în jurnal, cu numele și ora.",
    },
  ],
  consola: {
    // Rol: h2 al consolei. Lungime: 32.
    titlu: "Consola cu firmele biroului",
    // Rol: subtitlul (3 randuri, 16/25,6). Lungime: 229.
    subtitlu:
      "Dimineața deschizi consola și vezi unde e de lucru: ce a sosit peste noapte, ce acte așteaptă verificarea și ce termen a expirat, la fiecare firmă. De acolo intri în arhiva oricărei firme.",
    declaratie:
      "Exemplu de consolă 3S cu firme și date fictive: 14 firme în portofoliu, 29 de acte de verificat, 3 termene expirate, 1.136 de facturi luna aceasta.",
    bara: {
      // Rol: eticheta modulului (11,84/600). Lungime: 26.
      eticheta: "Consolă · portofoliu",
      // Rol: pastila din dreapta barei; eticheta vizibila „exemplu” a machetei (D9, D11). Lungime: 13.
      pastila: "Date de exemplu",
    },
    tigle: [
      { valoare: "14", eticheta: "firme în portofoliu", iconita: "building-2", ton: "neutru" },
      { valoare: "29", eticheta: "acte de verificat", iconita: "clock", ton: "actiune" },
      { valoare: "3", eticheta: "termene expirate", iconita: "calendar-x", ton: "actiune" },
      { valoare: "1.136", eticheta: "facturi luna aceasta", iconita: "file-text", ton: "neutru" },
    ],
    cautare: {
      // Rol: textul-indemn din camp (nu e un camp real). Lungime: 39.
      indemn: "Scrie numele firmei sau CUI-ul",
      contor: "6 / 14",
    },
    // Eticheta se acorda cu numarul de pe fiecare card: „1 expirat”, „3 expirate”, „1 sosit”, „12 sosite”.
    indicatori: {
      asteptare: { unul: "de verificat", multe: "de verificat" },
      depasite: { unul: "expirat", multe: "expirate" },
      noi: { unul: "sosit", multe: "sosite" },
    },
    // Firme EVIDENT fictive (D11); fiecare CUI are cifra de control gresita (invalid prin constructie).
    clienti: [
      { nume: "Alfa Exemplu Instal SRL", cui: "40317258", deFacut: true, asteptare: 7, depasite: 1, noi: 12 },
      { nume: "Beta Exemplu Agro SRL", cui: "31884206", deFacut: true, asteptare: 9, depasite: 0, noi: 15 },
      { nume: "Gama Exemplu Mobila SRL", cui: "27561934", deFacut: true, asteptare: 4, depasite: 2, noi: 6 },
      { nume: "Delta Exemplu Brutărie SRL", cui: "45120887", deFacut: false, asteptare: 0, depasite: 0, noi: 3 },
      { nume: "Epsilon Exemplu Clinic SRL", cui: "38702145", deFacut: true, asteptare: 5, depasite: 0, noi: 8 },
      { nume: "Zeta Exemplu Transport SRL", cui: "33419670", deFacut: false, asteptare: 0, depasite: 0, noi: 2 },
    ],
    // Rol: randul de sub grila (10,88 ardezie-5).
    maiMulti: "Alte 8 firme în portofoliu",
    capabilitati: [
      {
        iconita: "search",
        titlu: "Întreabă toate arhivele deodată",
        text: "Scrii ce cauți, iar 3S răspunde din arhivele tuturor firmelor, cu actul și pagina din care vine răspunsul.",
      },
      {
        iconita: "arrow-left-right",
        titlu: "Același cont pentru toate firmele",
        text: "Alegi firma din listă și lucrezi direct în arhiva ei, fără o a doua parolă.",
      },
      {
        iconita: "inbox",
        titlu: "O adresă de e-mail pentru actele fiecărei firme",
        text: "Facturile și extrasele trimise la adresa firmei ajung în dosarul ei, pe luna potrivită. Clientul le vede apoi în portalul lui, cu tot ce a trimis.",
      },
      {
        iconita: "calendar-clock",
        titlu: "Ce expiră, la toate firmele",
        text: "Termenele tuturor firmelor apar în ordinea în care expiră, ca să vezi ce urmează înainte de orice închidere.",
      },
      {
        iconita: "user-plus",
        titlu: "O firmă nouă, adăugată după CUI",
        text: "Scrii CUI-ul, iar firma apare în consolă cu dosarul ei, gata să primească primele acte chiar în ziua aceea.",
      },
      {
        iconita: "layout-grid",
        titlu: "Punctul albastru arată unde e de lucru",
        text: "Firmele cu acte de verificat au un punct albastru, iar cele la zi rămân gri.",
      },
    ],
    // Rol: nota de sub capabilitati, cu linie sus (14/400 ardezie-5). Lungime: 108.
    nota: "Cine din birou vede o firmă hotărăști tu, iar orice document deschis se trece în jurnal.",
    // Rol: legatura spre contact (14/600 albastru, cu sageata). Lungime: 50.
    legatura: {
      text: "Scrie-ne câți clienți ai și îți arătăm consola",
      href: "/contact",
      ruta: "/contact",
    },
  },
};

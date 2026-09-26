// Textele paginii /functionalitati/cautare-ai (fisa functionalitati__cautare-ai.md; sablonul cinema,
// functionalitati__sablon.md). Scrise de noi pe ROLUL si LUNGIMEA frazelor referintei (plan D1b), PORNIND
// DE LA IDEE, nu de la fraza: alta imagine, alt ritm, alta ordine. Prima scriere urmase fraza cu fraza si
// iesise parafraza apropiata (critic 25.09); rescrisa si masurata contra textului sursei cu bigrame,
// Jaccard pe radacini si difflib. Niciun cuvant, nume de fisier sau exemplu al ei. Lungimile din
// comentarii sunt ale referintei, pe acelasi rol.
//
// CE SPUNE PAGINA E CE ARE 3S (plan D4, D4b): cautarea in limbaj firesc, raspunsul cu documentul si
// pagina citate, textul scos si din scanari. Fiecare afirmatie e in registrul feliei,
// `src/content/afirmatii/cinema-1.json`.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9): firmele (Alfa Exemplu, ca sa nu semene cu una reala), fisierele, sumele, orele, cifrele din
// contoare si replicile colegilor sunt inventate. Fiecare macheta isi poarta eticheta accesibila
// (`declaratie`), care o spune. Contoarele "Inainte" sunt scenariul unei cautari de mana, nu o
// masuratoare; pe "Acum" nu se promite o durata.

export const CALE_CAUTARE_AI = "/functionalitati/cautare-ai";

export const META_CAUTARE_AI = {
  titlu: "Căutare AI în documentele firmei, cu sursa citată | 3S",
  descriere:
    "Întrebați arhiva firmei cu vorbele dumneavoastră și primiți răspunsul împreună cu documentul și pagina din care vine, pe web sau pe WhatsApp.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02), ca text: intrebarea la care raspunde. */
export const INTREBARE_PAGINA = "Cum găsește 3S un rând dintr-un contract fără să deschideți dosarele?";

// ---------------------------------------------------------------------------------------------
// S0 - eroul (fisa S0). La referinta eroul nu are h1; la 3S eticheta e h1, cu forma ei vizuala.
// ---------------------------------------------------------------------------------------------

export const EROU_CAUTARE = {
  // Rol: eticheta paginii, aici si titlul ei (13,6/600). Referinta: 18 (numai eticheta).
  eticheta: "Funcționalitate 01 · Căutare AI în documente",
  // Rol: cererea din terminal (18,4/500).
  // Lungime: ~80 [fisa].
  intrebare: "În câte zile ne plătește Alfa Exemplu facturile de service, după contract?",
  // Rol: primul rand de sub terminal (20/400, alb .55). Lungime: 32 [numarat].
  rand1: "Știți sigur că ați semnat asta.",
  // Rol: al doilea rand (italic). Lungime: 17 [numarat].
  rand2: "...doar nu și în care variantă.",
  // Rol: indiciul de derulare. Lungime: 8 [numarat].
  indiciu: "derulați",
} as const;

// ---------------------------------------------------------------------------------------------
// S1 - avalansa de fisiere (fisa S1): fereastra de dosar cu 13 randuri, ultimul e tinta.
// ---------------------------------------------------------------------------------------------

export type TipRand = "pdf" | "imagine" | "tabel" | "document" | "email";
export type CipRand = { text: string; ton: "neutru" | "alerta" | "succes"; mono?: boolean };
export type RandAvalansa = { tip: TipRand; nume: string; cip?: CipRand; ora: string };

export const AVALANSA = {
  declaratie:
    "Exemplu cu date fictive: dosarul unui client, cu oferta, contractul, actele adiționale, poze și e-mailuri, iar actul căutat la capăt",
  // Rol: calea dosarelor, 5 niveluri (mono 11,52). Lungime: 6 segmente [fisa].
  cale: ["Documente comune", "Alfa Exemplu", "Service utilaje", "2025", "de verificat", "copii"],
  // Rol: numarul de fisiere din dosar (mono, dreapta).
  numar: "53 elemente",
  // Rol: 13 randuri din istoria unui client, in ordinea datei: oferta, contractul si copiile lui, poze,
  // calcule, acte aditionale, e-mailuri, o scanare fara nume (fisa S1). Ultimul e tinta.
  randuri: [
    { tip: "document", nume: "oferta_service_alfa.docx", cip: { text: "Ofertă", ton: "neutru" }, ora: "02.12.2024" },
    { tip: "email", nume: "fw_service_alfa.eml", cip: { text: "7", ton: "alerta", mono: true }, ora: "05.12.2024" },
    { tip: "pdf", nume: "service_alfa_semnat_client.pdf", cip: { text: "Semnat", ton: "neutru" }, ora: "10.12.2024" },
    { tip: "imagine", nume: "poza_pagina_2.jpg", cip: { text: "Telefon", ton: "neutru" }, ora: "10.12.2024" },
    { tip: "pdf", nume: "service_alfa_REV.pdf", ora: "12.12.2024" },
    { tip: "tabel", nume: "calcul_tarife_alfa.xlsx", cip: { text: "Calcul", ton: "neutru" }, ora: "15.01.2025" },
    { tip: "pdf", nume: "act_aditional_1.pdf", cip: { text: "Nou", ton: "succes" }, ora: "03.02.2025" },
    { tip: "imagine", nume: "captura_whatsapp_2.png", cip: { text: "WhatsApp", ton: "neutru" }, ora: "04.02.2025" },
    { tip: "document", nume: "act_aditional_1_obs.docx", cip: { text: "Observații", ton: "neutru" }, ora: "06.02.2025" },
    { tip: "email", nume: "re_termen_plata.eml", cip: { text: "3", ton: "alerta", mono: true }, ora: "20.02.2025" },
    { tip: "pdf", nume: "scan_0007.pdf", cip: { text: "Fără nume", ton: "alerta" }, ora: "21.02.2025" },
    { tip: "tabel", nume: "scadente_2025.xlsx", ora: "28.02.2025" },
    { tip: "pdf", nume: "act_aditional_2_plati.pdf", ora: "01.03.2025" },
  ] as readonly RandAvalansa[],
} as const;

// ---------------------------------------------------------------------------------------------
// S2 - recunoasterea (fisa S2): titlul de 3 cuvinte, ecoul lui urias, formele haosului.
// ---------------------------------------------------------------------------------------------

export const RECUNOASTERE = {
  // Rol: titlul recunoasterii (40/600). Acelasi text face ecoul.
  titlu: "Doi ani, un dosar.",
  // Rol: paragraful recunoasterii, 2 randuri (22,4/400). Lungime: ~95 [numarat].
  paragraf: "Nimeni nu l-a stricat intenționat. S-a umplut cu câte un fișier pe săptămână, doi ani la rând.",
} as const;

// ---------------------------------------------------------------------------------------------
// S3 - frustrarea (fisa S3): sesiunea de cautare cu contoare si 5 replici de birou.
// ---------------------------------------------------------------------------------------------

export type RandSesiune = { eticheta: string; sub: string };

export const FRUSTRARE = {
  declaratie:
    "Exemplu cu date fictive: o căutare făcută de mână, cu fișierele deschise, timpul pierdut și colegii întrebați",
  // Rol: pastila "in direct" (9,92/600). Lungime: 9 [numarat].
  inCurs: "În curs",
  // Rol: titlul sesiunii (12/600). Lungime: 18 [numarat].
  sesiune: "Căutare de mână",
  // Cele 4 randuri (13,12/600 + 10,88): deschideri, durata, oameni deranjati, starea.
  fisiere: { eticheta: "Deschideri", sub: "unele de două ori" },
  timp: { eticheta: "Durată", sub: "de la prima deschidere" },
  colegi: { eticheta: "Oameni deranjați", sub: "doi erau în concediu" },
  rezultat: { eticheta: "Stare", sub: "termenul tot lipsește" },
  // Rol: pastila rosie (11,2/600). Lungime: 13 [numarat].
  negasit: "Fără răspuns",
  // Rol: subsolul cardului, cautarea care nu se termina (11,52). Lungime: 18 [numarat].
  continua: "Încă un dosar...",
  // Valorile finale ale contoarelor (la p = 1): fisiere, minute, colegi. Scenariu, nu masuratoare.
  maxime: { fisiere: 53, minute: 98, colegi: 4 },
  // Rol: 5 replici de birou cat dureaza cautarea (italic 16,8). Lungimi la referinta: 25, 36, 35, 49, 38
  // [numarat]; un rand, in afara celei de-a patra.
  citate: [
    "S-a semnat și actul al doilea?",
    "Scanerul l-a salvat nu știu unde",
    "Contabila zice că l-a trimis în ianuarie",
    "Termenul era 30 sau 45 de zile, că nu mai știu?",
    "Originalul e la Alfa, noi avem doar poza",
  ],
} as const;

// ---------------------------------------------------------------------------------------------
// S4 - soapta (fisa S4): pivotul, cu linia albastra de doua cuvinte.
// ---------------------------------------------------------------------------------------------

export const SOAPTA = {
  // Rol: intrebarea pivotului (sablon §4.4, 22,4/400).
  // Lungime: 31 [numarat].
  intrebare: "Și dacă arhiva v-ar răspunde ca un coleg?",
  // Rol: emfaza pivotului (38,4/600). Lungime: 34 [numarat].
  emfaza: "Un coleg care a citit tot dosarul.",
  // Rol: linia albastra care numeste functionalitatea (32/600). Lungime: 18 [numarat].
  linie: "Asta e căutarea AI.",
} as const;

// ---------------------------------------------------------------------------------------------
// S5 - lumina (fisa S5): bara de cautare in care intrebarea din erou se scrie din nou, la derulare.
// ---------------------------------------------------------------------------------------------

export const LUMINA = {
  declaratie: "Exemplu: bara de căutare a arhivei, cu întrebarea scrisă în cuvinte obișnuite",
  // Rol: indicatia de sub bara, tasta de trimitere (13,6/400). Lungime: 13 [numarat].
  indicatie: "trimiteți cu Enter",
  // Numele tastei, pentru cititorul de ecran (tasta se deseneaza cu o iconita).
  tasta: "Enter",
} as const;

// ---------------------------------------------------------------------------------------------
// S6 - extragerea raspunsului (fisa S6): raza, cardul cu fisierul, pagina si citatul.
// ---------------------------------------------------------------------------------------------

export const EXTRAGERE = {
  declaratie:
    "Exemplu cu date fictive: răspunsul arhivei, cu fișierul, pagina și articolul din care vine fraza citată",
  // Numele tintei din avalansa. Cel mult 26 de caractere: la 390 incape pe un rand cu pagina.
  fisier: "act_aditional_2_plati.pdf",
  // Rol: pagina si punctul din act (mono 11,2). Lungime: 12 [numarat].
  pagina: "pag. 2 · pct. 3.1",
  // Rol: o fraza cu valoarea cautata (italic 19,2). Lungime: ~100 [numarat].
  citat: "Beneficiarul plătește fiecare factură de service în termen de 45 de zile calendaristice de la primire.",
  // Rol: bifa verde si o promisiune de viteza (13,6/600). La 3S: sursa citata, nu o durata.
  meta: "Răspuns cu sursa citată",
  // Rol: legenda de sub card (18,4/400). Lungime: 35 [numarat].
  legenda: "Citatul vine cu fișierul și pagina lui.",
} as const;

// ---------------------------------------------------------------------------------------------
// S7 - contrastul Inainte / Acum (fisa S7).
// ---------------------------------------------------------------------------------------------

export const CONTRAST_CAUTARE = {
  // Rol: titlul contrastului (40/600). Lungime: 40 [numarat].
  titlu: "Aceeași căutare, de două ori",
  // Rol: paragraful contrastului (19,2/400, 1 rand). Lungime: ~100 [numarat].
  paragraf: "În stânga, dosarele deschise unul după altul. În dreapta, răspunsul cu pagina lui, gata de verificat.",
  inainte: {
    titlu: "Înainte",
    subtitlu: "dosar cu dosar",
    declaratie: "Desen: patru documente răsturnate, cu semne de întrebare",
    metrici: [
      { valoare: "53", cheie: "Deschideri" },
      { valoare: "1h 38m", cheie: "Durată" },
      { valoare: "4", cheie: "Oameni deranjați" },
      { valoare: "fără sursă", cheie: "Stare", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "cu o întrebare",
    declaratie: "Exemplu cu date fictive: o întrebare scurtă și răspunsul ei, cu sursa citată",
    // Textele din desenul "Acum" (unitati de 9 si 7 in SVG).
    intrebareScurta: "Alfa plătește în câte zile?",
    raspunsInceput: "Plata vine ",
    raspunsAccent: "în 45 de zile",
    raspunsNota: "de la primirea facturii · act adițional 2",
    sursa: "act_aditional_2_plati.pdf · pag. 2",
    metrici: [
      { valoare: "1", cheie: "Întrebări" },
      { valoare: "pag. 2", cheie: "Pagina citată" },
      { valoare: "0", cheie: "Oameni deranjați" },
      { valoare: "verificabil", cheie: "Stare", calitativ: "bun" },
    ],
  },
  // Rol: eticheta puntii, mono (9,92/700). La 3S cu `->`.
  punte: "de mână -> citat",
} as const;

// ---------------------------------------------------------------------------------------------
// S8 - CTA final (fisa S8, sablon §4.7). Titlul pe un rand (~14 caractere).
// ---------------------------------------------------------------------------------------------

export const CTA_CAUTARE = {
  // Rol: titlul CTA. Lungime: 14 [fisa].
  titlu: "Închideți dosarele.",
  // Rol: paragraful CTA (20,8/400, 2 randuri). Lungime: ~85 [numarat].
  paragraf: "Căutarea AI citește documentele firmei și vă răspunde cu fraza exactă, pe web sau pe WhatsApp.",
  // Rol: butonul (16,8/600). Lungime: 17 [numarat].
  buton: "Deschideți un cont",
  // Rol: pretul de azi si contul fara card (11,52). Lungime: ~56 [fisa].
  nota: "Toate pachetele costă azi 0 RON, iar contul nu cere card.",
} as const;

/** Firul paginii (BreadcrumbList): startul si pagina. Numele, ca in meniul site-ului. */
export const FIR_CAUTARE_AI = [
  { nume: "Acasă", cale: "/" },
  { nume: "Căutare cu sursa citată", cale: CALE_CAUTARE_AI },
] as const;

// Textele paginii /functionalitati/cautare-ai (fisa functionalitati__cautare-ai.md; sablonul cinema,
// functionalitati__sablon.md). Exemplul paginii: garantia unui utilaj, cautata in procesul-verbal de
// punere in functiune al unui furnizor.
//
// CE SPUNE PAGINA E CE ARE 3S (plan D4, D4b): cautarea in limbaj firesc, raspunsul cu documentul si
// pagina citate, textul scos si din scanari. Fiecare afirmatie e in registrul feliei,
// `src/content/afirmatii/cinema-1.json`.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9, D11): furnizorul (Beta Exemplu, evident fictiv), utilajul,
// fisierele, datele, orele, cifrele din contoare si replicile de birou sunt inventate. Fiecare macheta
// isi poarta eticheta accesibila (`declaratie`); macheta cu nume de firma si factura (avalansa) poarta in
// plus eticheta VIZIBILA "exemplu" (`ETICHETA_EXEMPLU`). Contoarele "Inainte" sunt scenariul unei cautari
// de mana, nu o masuratoare; pe "Acum" nu se promite o durata.
//
// LUNGIMI: comentariile `Rol:` numesc rolul fiecarui text si lungimea lui tinta, in caractere, din fisa
// paginii ([numarat] = numarata pe capturile fisei, [fisa] = scrisa in fisa).

export const CALE_CAUTARE_AI = "/functionalitati/cautare-ai";

export const META_CAUTARE_AI = {
  titlu: "Căutare AI în arhiva firmei, cu sursa citată | 3S",
  descriere:
    "Întrebați arhiva firmei cu vorbele dumneavoastră și primiți răspunsul împreună cu documentul și pagina din care vine, pe web sau pe WhatsApp.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02), ca text: intrebarea la care raspunde. */
export const INTREBARE_PAGINA = "Cum găsește 3S fraza căutată într-un document fără să deschideți dosarele?";

/** Eticheta vizibila de pe machetele cu nume de firma si acte (decizia D11): mica, intr-un colt. */
export const ETICHETA_EXEMPLU = "exemplu";

// ---------------------------------------------------------------------------------------------
// S0 - eroul (fisa S0). La referinta eroul nu are h1; la 3S eticheta e h1, cu forma ei vizuala.
// ---------------------------------------------------------------------------------------------

export const EROU_CAUTARE = {
  // Rol: eticheta paginii, aici si titlul ei (13,6/600). Lungime: 18 pentru eticheta simpla; aici e mai
  // lunga, fiindca poarta si titlul.
  eticheta: "Funcționalitate 01 · Căutare AI cu sursa citată",
  // Rol: cererea din terminal (18,4/500), doua randuri la 1440 si trei la 390; in bara din S5 doua si
  // trei (masurat: terminalul 660 x 131 / 350 x 144, bara 620 x 90 / 350 x 104, ca in fisa). Lungime: ~80.
  intrebare: "Cât ține garanția compresorului montat în hala 2 și de când începe să curgă?",
  // Rol: primul rand de sub terminal (20/400, alb .55). Lungime: 32 [numarat].
  rand1: "Hârtia s-a semnat la montaj.",
  // Rol: al doilea rand (italic). Lungime: 17 [numarat].
  rand2: "...acum doi ani și ceva.",
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
    "Exemplu cu date fictive: dosarul unui compresor, cu oferta, comanda, factura, poze și e-mailuri, iar actul căutat la capăt",
  // Rol: calea dosarelor (mono 11,52). Lungime: 6 segmente [fisa].
  cale: ["Documente comune", "Furnizori", "Beta Exemplu", "Compresor hala 2", "2024", "diverse"],
  // Rol: numarul de fisiere din dosar (mono, dreapta).
  numar: "41 elemente",
  // Rol: 13 randuri din dosarul unui utilaj, cumparat, livrat, montat si revizuit: acte de furnizor,
  // poze, calcule, un e-mail de revizie, o scanare fara nume. Datele nu sunt in ordine, ca intr-un dosar
  // umplut de mai multi oameni. Ultimul rand e tinta.
  randuri: [
    { tip: "document", nume: "oferta_compresor_beta.docx", cip: { text: "Ofertă", ton: "neutru" }, ora: "04.03.2024" },
    { tip: "email", nume: "fw_comanda_hala2.eml", cip: { text: "8", ton: "alerta", mono: true }, ora: "06.03.2024" },
    { tip: "pdf", nume: "comanda_semnata.pdf", cip: { text: "Semnat", ton: "neutru" }, ora: "08.03.2024" },
    { tip: "tabel", nume: "consum_aer_hala2.xlsx", cip: { text: "Calcul", ton: "neutru" }, ora: "11.03.2024" },
    { tip: "pdf", nume: "factura_beta_1187.pdf", ora: "17.05.2024" },
    { tip: "pdf", nume: "aviz_insotire_scan.pdf", cip: { text: "Aviz", ton: "neutru" }, ora: "17.05.2024" },
    { tip: "imagine", nume: "poza_placuta_serie.jpg", cip: { text: "Telefon", ton: "neutru" }, ora: "20.05.2024" },
    { tip: "imagine", nume: "captura_montaj.png", cip: { text: "WhatsApp", ton: "neutru" }, ora: "24.05.2024" },
    { tip: "document", nume: "fisa_tehnica_tradusa.docx", cip: { text: "Nou", ton: "succes" }, ora: "27.05.2024" },
    { tip: "pdf", nume: "scan_0012.pdf", cip: { text: "Fără nume", ton: "alerta" }, ora: "28.05.2024" },
    { tip: "email", nume: "re_program_revizie.eml", cip: { text: "4", ton: "alerta", mono: true }, ora: "14.11.2024" },
    { tip: "tabel", nume: "revizii_2025.xlsx", ora: "20.01.2025" },
    { tip: "pdf", nume: "pv_punere_functiune.pdf", ora: "28.05.2024" },
  ] as readonly RandAvalansa[],
} as const;

// ---------------------------------------------------------------------------------------------
// S2 - recunoasterea (fisa S2): titlul de 3 cuvinte, ecoul lui urias, paragraful.
// ---------------------------------------------------------------------------------------------

export const RECUNOASTERE = {
  // Rol: titlul recunoasterii (40/600). Acelasi text face ecoul.
  titlu: "Doi ani, un dosar.",
  // Rol: paragraful recunoasterii, 2 randuri (22,4/400). Lungime: ~95 [numarat]. Spune cum s-a umplut
  // dosarul.
  paragraf: "Fiecare om care a lucrat cu utilajul a mai pus acolo câte un fișier, doi ani la rând, fără să șteargă nimic.",
} as const;

// ---------------------------------------------------------------------------------------------
// S3 - frustrarea (fisa S3): sesiunea de cautare cu contoare si 5 replici de birou.
// ---------------------------------------------------------------------------------------------

export type RandSesiune = { eticheta: string; sub: string };

export const FRUSTRARE = {
  declaratie:
    "Exemplu cu date fictive: o căutare făcută de mână, cu fișierele deschise, timpul pierdut și oamenii deranjați",
  // Rol: pastila "in direct" (9,92/600). Lungime: 9 [numarat].
  inCurs: "În curs",
  // Rol: titlul sesiunii (12/600). Lungime: 18 [numarat].
  sesiune: "Căutare de mână",
  // Cele 4 randuri (13,12/600 + 10,88): deschideri, durata, oameni deranjati, starea.
  fisiere: { eticheta: "Deschideri", sub: "unele de două ori" },
  timp: { eticheta: "Durată", sub: "de la prima deschidere" },
  colegi: { eticheta: "Oameni deranjați", sub: "doi erau în concediu" },
  rezultat: { eticheta: "Stare", sub: "garanția tot lipsește" },
  // Rol: pastila rosie (11,2/600). Lungime: 13 [numarat].
  negasit: "Fără răspuns",
  // Rol: subsolul cardului, cautarea care nu se termina (11,52). Lungime: 18 [numarat].
  continua: "Încă un dosar...",
  // Valorile finale ale contoarelor (la p = 1): fisiere, minute, oameni. Scenariu, nu masuratoare.
  maxime: { fisiere: 29, minute: 85, colegi: 5 },
  // Rol: 5 replici de birou cat dureaza cautarea (italic 16,8). Lungimi: 25, 36, 35, 49, 38 [numarat];
  // cate un rand.
  citate: [
    "Parcă era în biblioraftul verde",
    "Montajul l-a făcut altă firmă",
    "Contabila are doar factura",
    "Cine mai știe cât ține garanția?",
    "Originalul e la furnizor, noi avem poza",
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
    "Exemplu cu date fictive: răspunsul arhivei, cu fișierul, pagina și punctul din care vine fraza citată",
  // Numele tintei din avalansa. Cel mult 26 de caractere: la 390 incape pe un rand cu pagina.
  fisier: "pv_punere_functiune.pdf",
  // Rol: pagina si punctul din act (mono 11,2). Lungime: 12 [numarat].
  pagina: "pag. 2 · pct. 4",
  // Rol: o fraza cu valoarea cautata (italic 19,2). Lungime: ~100 [numarat].
  citat: "Garanția compresorului este de 24 de luni și începe la data punerii în funcțiune, 28 mai 2024.",
  // Rol: bifa verde si o promisiune de viteza (13,6/600). La 3S: sursa citata, nu o durata.
  meta: "Răspuns cu sursa citată",
  // Rol: legenda de sub card (18,4/400). Lungime: 35 [numarat].
  legenda: "Citatul vine cu fișierul și pagina lui.",
} as const;

// ---------------------------------------------------------------------------------------------
// S7 - contrastul Inainte / Acum (fisa S7).
// ---------------------------------------------------------------------------------------------

export const CONTRAST_CAUTARE = {
  // Rol: titlul contrastului (40/600, 1 rand la 1440, 2 la 390). Lungime: 40 [numarat].
  titlu: "Aceeași garanție, căutată de două ori",
  // Rol: paragraful contrastului (19,2/400, 1 rand). Lungime: ~100 [numarat].
  paragraf: "În stânga, dosarele deschise unul după altul. În dreapta, răspunsul cu pagina lui, gata de verificat.",
  // Cheile metricilor stau pe un rand si la 390 (coloana de 71,8 px): o cheie pe doua randuri inalta
  // cardul cu 14 px fata de fisa (masurat).
  inainte: {
    titlu: "Înainte",
    subtitlu: "dosar cu dosar",
    declaratie: "Desen: patru documente răsturnate, cu semne de întrebare",
    metrici: [
      { valoare: "29", cheie: "Deschideri" },
      { valoare: "1h 25m", cheie: "Durată" },
      { valoare: "5", cheie: "Deranjați" },
      { valoare: "fără sursă", cheie: "Stare", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "cu o întrebare",
    declaratie: "Exemplu cu date fictive: o întrebare scurtă și răspunsul ei, cu sursa citată",
    // Textele din desenul "Acum" (unitati de 9 si 7 in SVG).
    intrebareScurta: "Cât ține garanția compresorului?",
    raspunsInceput: "Garanția ține ",
    raspunsAccent: "24 de luni",
    raspunsNota: "de la punerea în funcțiune · pct. 4",
    sursa: "pv_punere_functiune.pdf · pag. 2",
    metrici: [
      { valoare: "1", cheie: "Întrebări" },
      // Pe doua randuri, ca valoarea de timp din fisa pe acelasi loc (cardul "Acum" ramane cu un rand
      // mai inalt; la 390, unde cardurile stau unul sub altul, asta da inaltimea sectiunii). Spatiile
      // nedespartitoare lasa o singura rupere, dupa virgula: "pag. 2," / "pct. 4".
      { valoare: "pag.\u00a02, pct.\u00a04", cheie: "Pagina citată" },
      { valoare: "0", cheie: "Deranjați" },
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
  // Rol: titlul CTA, un indemn pe un rand. Lungime: 14 [fisa].
  titlu: "Citiți doar pagina.",
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

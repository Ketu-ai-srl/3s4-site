// Continutul componentelor paginii P03 pe editia `ro-MD` (`/ro/functionalitati/cautare-ai` pe 3s.md): aceleasi
// componente cinema ca pagina RO `/functionalitati/cautare-ai` si ca perechea EN `/features/search` (decizia 53,
// intrebarea 5 varianta a), in aceeasi ordine, cu textul in romana de business, la "tu".
//
// SURSA TEXTULUI, pe camp: fisa paginii (ro-md/cautare-ai.md), sectiunea "Textele componentelor (decizia 53)", cu cheia
// campului RO (de pilda `cautare-ai.ts:43`) in comentariu. Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
// Scena (intrebarea din erou si din bara, pasajul citat, desenul "Acum") e a acestei editii: fisa o scrie cu "Cat
// dureaza garantia", nu cu intrebarea scenei EN (`functionalitati/cautare-ai-3s-md.ts`), deci sta aici.
//
// CE NU INTRA, cu decizia: cipul "WhatsApp" din dosar (d49); butonul spre cont devine legatura WhatsApp cu `ref`-ul
// paginii (d3); nicio pagina sau punct citat (indicarea paginii e in testare); nicio hartie (poarta juridica 40-41).
//
// Modulul e numai date: il importa si invelitorile client ale insulelor (avalansa, frustrarea, lumina).

/** Scena paginii, in romana: intrebarea, pasajul citat si randurile desenului "Acum" (`cautare-ai.ts:43`, `:172`, `:206-210`). */
export const SCENA_CAUTARE_RO_MD = {
  intrebare: "Cât durează garanția compresorului din hala 2 și de la ce dată se calculează?",
  citat: "Perioada de garanție a compresorului este de 24 de luni, de la punerea în funcțiune din 28 mai 2024.",
  intrebareScurta: "Cât durează garanția compresorului?",
  raspunsInceput: "Garanție de ",
  raspunsAccent: "24 de luni",
  raspunsNota: "de la punerea în funcțiune",
} as const;

/** Eroul: eticheta-titlu (h1) in doua bucati, legate de pagina cu punctul de mijloc (`cautare-ai.ts:40-49`). */
export const EROU_CAUTARE_RO_MD = {
  etichetaNumar: "Funcționalitate 01",
  etichetaNume: "Căutare AI cu sursa citată",
  rand1: "Actul a fost semnat la montaj.",
  rand2: "...acum peste doi ani.",
  indiciu: "derulează",
} as const;

/** Semnele tipografice care leaga bucatile etichetei si ale puntii, ca pe RO. */
export const SEMNE_CAUTARE_RO_MD = { mijloc: " · ", sageata: " → " } as const;

export const AVALANSA_CAUTARE_RO_MD = {
  // cautare-ai.ts:62.
  declaratie:
    "Exemplu cu date fictive: dosarul unui compresor, de la ofertă și comandă la factură, fotografii și e-mailuri; documentul căutat este ultimul",
  // cautare-ai.ts:64, :66.
  cale: ["Documente comune", "Furnizori", "Beta Exemplu", "Compresor hala 2", "2024", "diverse"],
  numar: "41 de elemente",
  // cautare-ai.ts:71-83. Randul 8 n-are cip: "WhatsApp" iese pe 3s.md (decizia 49).
  randuri: [
    { tip: "document", nume: "oferta_compresor_beta.docx", cip: { text: "Ofertă", ton: "neutru" }, ora: "04.03.2024" },
    { tip: "email", nume: "fw_comanda_hala2.eml", cip: { text: "8", ton: "alerta", mono: true }, ora: "06.03.2024" },
    { tip: "pdf", nume: "comanda_semnata.pdf", cip: { text: "Semnat", ton: "neutru" }, ora: "08.03.2024" },
    { tip: "tabel", nume: "consum_aer_hala2.xlsx", cip: { text: "Calcul", ton: "neutru" }, ora: "11.03.2024" },
    { tip: "pdf", nume: "factura_beta_1187.pdf", ora: "17.05.2024" },
    { tip: "pdf", nume: "expeditie_marfa_scan.pdf", cip: { text: "Marfă", ton: "neutru" }, ora: "17.05.2024" },
    { tip: "imagine", nume: "foto_placuta_serie.jpg", cip: { text: "Foto", ton: "neutru" }, ora: "20.05.2024" },
    { tip: "imagine", nume: "captura_montaj.png", ora: "24.05.2024" },
    { tip: "document", nume: "fisa_tehnica_tradusa.docx", cip: { text: "Nou", ton: "succes" }, ora: "27.05.2024" },
    { tip: "pdf", nume: "scan_0012.pdf", cip: { text: "Fără nume", ton: "alerta" }, ora: "28.05.2024" },
    { tip: "email", nume: "re_program_revizie.eml", cip: { text: "4", ton: "alerta", mono: true }, ora: "14.11.2024" },
    { tip: "tabel", nume: "revizii_2025.xlsx", ora: "20.01.2025" },
    { tip: "pdf", nume: "pv_punere_functiune.pdf", ora: "28.05.2024" },
  ],
  // cautare-ai.ts:31.
  etichetaExemplu: "exemplu",
} as const;

export const RECUNOASTERE_CAUTARE_RO_MD = {
  // cautare-ai.ts:93, :96.
  titlu: "Doi ani, un dosar",
  paragraf: "Timp de doi ani, fiecare coleg care a lucrat cu utilajul a adăugat câte un fișier, fără să șteargă vreunul.",
} as const;

export const FRUSTRARE_CAUTARE_RO_MD = {
  // cautare-ai.ts:107-130.
  declaratie: "Exemplu cu date fictive: căutarea manuală a unui document, cu fișierele deschise, durata ei și colegii întrebați",
  inCurs: "În curs",
  sesiune: "Căutare manuală",
  fisiere: { eticheta: "Deschideri", sub: "unele de două ori" },
  timp: { eticheta: "Durată", sub: "de la prima deschidere" },
  colegi: { eticheta: "Colegi întrebați", sub: "doi erau în concediu" },
  rezultat: { eticheta: "Stare", sub: "garanția încă lipsește" },
  negasit: "Fără răspuns",
  continua: "Încă un dosar",
  // Aceleasi valori ca scenariul RO si EN (exemplu, nu masuratoare).
  maxime: { fisiere: 29, minute: 85, colegi: 5 },
  citate: [
    "Cred că era în alt folder",
    "Montajul l-a făcut o altă firmă",
    "Contabila are numai factura",
    "Știe cineva cât durează garanția?",
    "O știe furnizorul, noi avem doar fotografia",
  ],
} as const;

export const SOAPTA_CAUTARE_RO_MD = {
  // cautare-ai.ts:141, :143, :145.
  intrebare: "Și dacă arhiva ți-ar răspunde ca un coleg?",
  emfaza: "Un coleg care a citit tot dosarul.",
  linie: "Iată căutarea AI.",
} as const;

export const LUMINA_CAUTARE_RO_MD = {
  // cautare-ai.ts:153, :155.
  declaratie: "Exemplu: bara de căutare, cu întrebarea de la începutul paginii, formulată liber",
  indicatie: "trimite cu Enter",
} as const;

export const EXTRAGERE_CAUTARE_RO_MD = {
  // cautare-ai.ts:166-176; fara pagina citata (indicarea paginii e in testare).
  declaratie: "Exemplu cu date fictive: răspunsul arhivei, însoțit de fișierul din care provine fragmentul citat",
  fisier: "pv_punere_functiune.pdf",
  pagina: "Fragment",
  meta: "Răspuns cu sursa citată",
  legenda: "Fragmentul are alături fișierul-sursă.",
} as const;

export const CONTRAST_CAUTARE_RO_MD = {
  // cautare-ai.ts:185-222.
  titlu: "Aceeași garanție, căutată de două ori",
  // Fraza pune fata in fata cele doua feluri de lucru, nu asezarea cardurilor: sub 768 px grila trece pe o coloana
  // si "in stanga / in dreapta" ar fi fals. Nici "Acum primesti" nu merge: vizitatorul inca nu foloseste 3S.
  paragraf: "Fără 3S, deschizi dosarele pe rând. Cu 3S, primești răspunsul cu documentul-sursă și îl poți verifica.",
  inainte: {
    titlu: "Înainte",
    subtitlu: "dosar cu dosar",
    declaratie: "Desen: patru documente împrăștiate, cu semne de întrebare",
    metrici: [
      { valoare: "29", cheie: "Deschideri" },
      { valoare: "1 h 25 min", cheie: "Durată" },
      { valoare: "5", cheie: "Colegi" },
      { valoare: "fără sursă", cheie: "Stare", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "cu o întrebare",
    declaratie: "Exemplu cu date fictive: o întrebare scurtă și răspunsul ei, cu sursa citată",
    sursa: "pv_punere_functiune.pdf",
    metrici: [
      { valoare: "1", cheie: "Întrebări" },
      { valoare: "1 document", cheie: "Sursă citată" },
      { valoare: "0", cheie: "Colegi" },
      { valoare: "verificabil", cheie: "Stare", calitativ: "bun" },
    ],
  },
  // Puntea, in doua bucati; pagina le leaga cu sageata, ca pe RO.
  punteDe: "manual",
  punteLa: "citat",
} as const;

export const CTA_CAUTARE_RO_MD = {
  // cautare-ai.ts:231-237; butonul duce la WhatsApp, cu textul precompletat si `ref`-ul din `pagina.cta`.
  titlu: "Citește doar sursa",
  paragraf: "3S răspunde la întrebările tale din conținutul documentelor firmei și indică sursa fiecărui răspuns.",
  buton: "Scrie-ne pe WhatsApp",
  nota: "Îți răspunde o persoană din echipa 3S, în română sau în engleză.",
} as const;

/** Firul paginii (BreadcrumbList), ca pe RO: startul si pagina (`cautare-ai.ts:242-243`). */
export const FIR_CAUTARE_RO_MD = [
  { nume: "Acasă", cale: "/ro" },
  { nume: "Căutare cu sursa citată", cale: "/ro/functionalitati/cautare-ai" },
] as const;

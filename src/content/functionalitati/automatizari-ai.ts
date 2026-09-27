// Textele paginii /functionalitati/automatizari-ai (fisa functionalitati__automatizari-ai.md; sablonul
// cinema, functionalitati__sablon.md). Cel care face treaba pe pagina e REGULA.
//
// CE SPUNE PAGINA E CE ARE 3S (plan D4, D4b): regulile automate "cand / atunci" ale firmei, actul nou
// trimis omului care trebuie sa-l inregistreze, sa-l verifice sau sa-l aprobe, si jurnalul pasilor.
// Semnatura calificata NU apare: integrarea e in curs (D4c); contractul-cadru cere o APROBARE. Fiecare
// afirmatie e in registrul feliei, `src/content/afirmatii/cinema-1.json`.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9): actul, orele, zilele, numerele de intrare, platile,
// departamentele si conditiile regulilor sunt inventate; fiecare macheta isi poarta eticheta accesibila
// (`declaratie`). Nicio macheta a paginii nu are nume de firma, cod fiscal sau sume, deci niciuna nu cere
// eticheta vizibila "exemplu" (D11). Pe "Acum" nu se promite o durata si nici zerouri (fisa S6, "Atentie
// D4"): cifrele numara ce face regula din exemplu (oameni anuntati, pasi trecuti in jurnal).
//
// LUNGIMI: comentariile `Rol:` numesc rolul fiecarui text si lungimea lui tinta, in caractere, din fisa
// paginii ([numarat] = numarata pe capturile fisei, [fisa] = scrisa in fisa).

export const CALE_AUTOMATIZARI_AI = "/functionalitati/automatizari-ai";

export const META_AUTOMATIZARI_AI = {
  titlu: "Reguli automate pentru documentele firmei | 3S",
  descriere:
    "Regulile „când / atunci” trimit fiecare act nou omului care trebuie să-l înregistreze, să-l verifice sau să-l aprobe, iar jurnalul păstrează fiecare pas.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02), ca text: intrebarea la care raspunde. */
export const INTREBARE_PAGINA_AUTOMATIZARI = "Cum ajunge un act nou la omul care trebuie să se ocupe de el?";

/** Actul din exemplu: acelasi in erou, in asteptare, in scena fluxului si in jurnal. */
export const ACT_EXEMPLU = "contract_0417.pdf";

// ---------------------------------------------------------------------------------------------
// S0 - eroul (fisa S0): fara terminal; titlul, subtitlul scris, actul care cade, randul italic.
// ---------------------------------------------------------------------------------------------

export const EROU_AUTOMATIZARI = {
  // Rol: eticheta paginii (13,6/600). Lungime: 18.
  eticheta: "Funcționalitate 02 · Reguli automate",
  // Rol: titlul eroului, un rand (72/600). Lungime: 12 [numarat]. Intrebarea de rutare: al cui e actul.
  titlu: "Cui îi revine?",
  // Rol: subtitlul scris litera cu litera (18,4/500). Lungime: 54 [fisa].
  subtitlu: "Contractul a intrat luni la 9:48. Mesajul către juridic:",
  // Ora de pe cardul actului (mono 9,92).
  ora: "09:48",
  // Rol: randul italic de dupa subtitlu (20/400). Lungime: 11 [numarat].
  liniste: "...nescris.",
  declaratie: "Exemplu cu date fictive: un contract nou intrat luni dimineață, cu mesajul către juridic încă nescris",
} as const;

// ---------------------------------------------------------------------------------------------
// S1 - asteptarea (fisa S1): patru departamente si actul care se stinge.
// ---------------------------------------------------------------------------------------------

export type IconitaRol = "tava" | "calculator" | "stilou" | "balanta";

export type Rol = {
  iconita: IconitaRol;
  /** Numele departamentului (16,8/600 in asteptare, 13,12/600 in scena fluxului). */
  nume: string;
  /** Replica din asteptare (italic 13,12, intre ghilimele). */
  replica: string;
  /** Sarcina din scena fluxului (11,52). */
  sarcina: string;
};

/**
 * Cele patru departamente, in ordinea din asteptare: fiecare cu o iconita (tava, calculator, stilou,
 * balanta), o replica scurta de nedumerire sau urgenta (lungimi 27, 20, 22, 16 [numarat]) si o sarcina in
 * scena fluxului (23, 20, 26, 18 [numarat]).
 */
export const ROLURI: readonly Rol[] = [
  { iconita: "tava", nume: "Registratură", replica: "Pe ce mail a venit?", sarcina: "Dă număr de intrare" },
  { iconita: "calculator", nume: "Contabilitate", replica: "Plătim sau nu?", sarcina: "Programează plata" },
  { iconita: "stilou", nume: "Conducere", replica: "Aștept de joi", sarcina: "Aprobă contractele-cadru" },
  { iconita: "balanta", nume: "Juridic", replica: "Clauza 7 e o problemă", sarcina: "Citește clauzele" },
];

export const ASTEPTARE = {
  // Rol: titlul asteptarii (40/600, alb .5). Lungime: 29 [numarat].
  titlu: "Patru birouri, patru sarcini",
  // Rol: paragraful asteptarii (16/400, 2 randuri). Lungime: 85 [numarat].
  paragraf: "Fiecare birou are partea lui din contract. Fără ordine scrisă, plata pleacă înaintea avizului.",
  // Contorul de zile (mono 9,92/600) si cele doua stari ale actului (9,92/600).
  zi: "Ziua",
  stareInitiala: "primit",
  stareUitat: "neatins",
  declaratie:
    "Exemplu cu date fictive: un contract nou și cele patru birouri care au de făcut câte o parte din el",
} as const;

// ---------------------------------------------------------------------------------------------
// S2 - cronologia (fisa S2): cinci zile, fiecare cu costul ei.
// ---------------------------------------------------------------------------------------------

export type Gravitate = "info" | "avertizare" | "alerta" | "critic" | "urgenta";
export type IconitaEveniment = "incarcare" | "dublura" | "ceas" | "plata" | "avertizare";

export type Eveniment = {
  /** Eticheta de zi (mono 11,2/600): litera + numar. */
  zi: string;
  iconita: IconitaEveniment;
  /** Descrierea (15,04/500; ultimul rand 600). */
  text: string;
  /** Chipul de cost (9,92/600), pe cinci trepte de gravitate. */
  cost: string;
  gravitate: Gravitate;
};

export const PRET = {
  // Rol: titlul cronologiei, 1 rand (40/600). Lungime: 15 [numarat].
  titlu: "Jurnalul unei întârzieri",
  // Rol: subtitlul care fixeaza ce se povesteste (19,2/400, alb .45 -> .5). Lungime: 42 [numarat].
  paragraf: "Același contract, prins între două birouri.",
  // Rol: 5 randuri, fiecare cu costul lui. Scenariul: fara regula, acelasi contract e inregistrat de doua
  // ori, scadenta trece neobservata si rata se plateste pe ambele numere. Lungimi: 19, 44, 32, 32, 37.
  evenimente: [
    { zi: "Z1", iconita: "incarcare", text: "Contractul intră din două birouri deodată.", cost: "2 copii", gravitate: "info" },
    { zi: "Z2", iconita: "dublura", text: "Registratura îi dă două numere de intrare.", cost: "2 numere", gravitate: "avertizare" },
    { zi: "Z3", iconita: "ceas", text: "Prima rată ajunge la scadență neobservată.", cost: "penalități", gravitate: "alerta" },
    { zi: "Z5", iconita: "plata", text: "Contabilitatea plătește rata pe ambele numere.", cost: "plată dublă", gravitate: "critic" },
    { zi: "Z7", iconita: "avertizare", text: "Dublura se vede abia la închiderea lunii.", cost: "bani de recuperat", gravitate: "urgenta" },
  ] as readonly Eveniment[],
  // Rol: eticheta totalului (chip rosu) si patru numere legate prin punct median (14,08/500): costurile
  // scenariului.
  totalEticheta: "Bilanț",
  totalValoare: "2 copii · 2 numere · 2 plăți · 1 penalitate",
  declaratie:
    "Exemplu cu date fictive: cronologia unui contract fără reguli, înregistrat și plătit de două ori",
} as const;

// ---------------------------------------------------------------------------------------------
// S3 - intrebarea (fisa S3): pivotul, cu tipografia proprie a paginii.
// ---------------------------------------------------------------------------------------------

export const INTREBARE_AUTOMATIZARI = {
  // Rol: prima intrebare a pivotului (20/400). Lungime: 47 [numarat]. Cine lucreaza e regula.
  intrebare: "Și dacă regula ar face anunțul în locul tău?",
  // Rol: a doua fraza, emfaza (36,8/600, 2 randuri). Lungime: 53 [numarat].
  emfaza: "Juridicul primește clauzele, contabilitatea scadența.",
  // Rol: linia albastra care numeste functionalitatea 3S (32/600). Lungime: 40 [numarat].
  linie: "Asta fac regulile automate din 3S.",
} as const;

// ---------------------------------------------------------------------------------------------
// S4 - fluxul (fisa S4): actul in centru, cele patru departamente in jur, razele care pleaca spre ele.
// ---------------------------------------------------------------------------------------------

export const FLUX = {
  // Rol: legenda fluxului (italic 19,2/400, 1 rand). Lungime: 60 [numarat].
  legenda: "Intră la 9:48. Juridicul îl citește la prânz. Plata se aprobă joi.",
  declaratie:
    "Exemplu cu date fictive: regula trimite contractul spre registratură, juridic, contabilitate și conducere",
  // Ordinea in care razele pleaca spre departamente (indicii din ROLURI): drumul actului din regula.
  ordine: [0, 3, 1, 2] as const,
} as const;

// ---------------------------------------------------------------------------------------------
// S5 - regula (fisa S5): fereastra cu trei perechi Cand -> Atunci.
// ---------------------------------------------------------------------------------------------

export type RandRegula = {
  tip: "cand" | "atunci";
  /** Textul dinaintea partii evidentiate. */
  inainte: string;
  /** Partea evidentiata: valoarea (mono) la conditii, departamentul (600) la actiuni. */
  accent: string;
  /** Textul de dupa partea evidentiata. */
  dupa?: string;
};

export const REGULA = {
  // Rol: titlul regulii (40/600, 2 randuri la 1440, 3 la 390). Lungime: 52 [numarat]. Spune ce arata
  // fereastra de dedesubt (exemplul).
  titlu: "Trei reguli pentru contractele cu furnizorii, fiecare cu pasul ei",
  // Rol: paragraful regulii (2 randuri la 1440, 3 la 390). Lungime: 98. Doua fapte 3S: jurnalul pasilor si
  // aprobarea ceruta pentru contractul-cadru.
  paragraf: "Un contract-cadru așteaptă aprobarea conducerii, iar pașii făcuți de reguli intră în jurnal, cu ora lor.",
  // Rol: numele fisierului de flux din bara ferestrei (mono 11,52). Lungime: 26 [numarat].
  fisier: "reguli_contracte_furnizori",
  // Etichetele randurilor (9,92/700).
  cand: "Când",
  atunci: "Atunci",
  randuri: [
    { tip: "cand", inainte: "furnizor = ", accent: "nou" },
    { tip: "atunci", inainte: "trimite actul la ", accent: "juridic", dupa: " pentru clauze" },
    { tip: "cand", inainte: "tip act = ", accent: "contract-cadru" },
    { tip: "atunci", inainte: "îl ține pentru aprobarea ", accent: "conducerii" },
    { tip: "cand", inainte: "zile până la scadență < ", accent: "10" },
    { tip: "atunci", inainte: "îl trimite primul la ", accent: "contabilitate" },
  ] as readonly RandRegula[],
  declaratie: "Exemplu cu date fictive: trei reguli scrise de firmă pentru contractele cu furnizorii",
} as const;

// ---------------------------------------------------------------------------------------------
// S6 - contrastul Inainte / Acum (fisa S6), cu desenele saptamanii.
// ---------------------------------------------------------------------------------------------

export const SAPTAMANA = {
  // Rol: titlul contrastului (40/600). Lungime: 20 [numarat].
  titlu: "Cu regula pornită",
  // Rol: paragraful contrastului (19,2/400, 3 randuri). Lungime: 130.
  paragraf:
    "Aceleași șapte zile, aceleași patru birouri, același contract. Diferă doar momentul în care fiecare află că are ceva de făcut.",
  // Initialele zilelor (mono 8 in vizual).
  zile: ["L", "M", "M", "J", "V", "S", "D"] as const,
  // Cheile stau pe un rand si la 390; valoarea de timp de pe "Acum" pe doua, ca in fisa (cardurile ies
  // 412 si 428 px la 390, masurat).
  inainte: {
    titlu: "Înainte",
    subtitlu: "fără reguli",
    // Rol: cuvantul de sub desen, repetat ca a patra metrica (italic).
    cuvant: "la noroc",
    declaratie: "Desen: o săptămână cu zile ratate, e-mailuri adunate grămadă și semne de întrebare",
    metrici: [
      { valoare: "5 zile", cheie: "Primul pas" },
      { valoare: "0", cheie: "Anunțați" },
      { valoare: "0", cheie: "Pași în jurnal", ton: "rau" },
      { valoare: "la noroc", cheie: "Stare", calitativ: "neutru" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "cu reguli 3S",
    cuvant: "la zi",
    declaratie:
      "Exemplu cu date fictive: o săptămână în care regula pornește în fiecare zi, iar fiecare pas intră în jurnal",
    // Jurnalul din desen (mono 7): zi si ora, actul, sageata, departamentul, bifa.
    jurnal: [
      "luni 09:48 · juridic anunțat ✓",
      "luni 09:48 · aprobare cerută ✓",
      "joi 16:20 · plată aprobată ✓",
    ],
    metrici: [
      { valoare: "chiar la intrare", cheie: "Primul pas" },
      { valoare: "4", cheie: "Anunțați" },
      { valoare: "3", cheie: "Pași în jurnal", ton: "bun" },
      { valoare: "la zi", cheie: "Stare", calitativ: "neutru" },
    ],
  },
  // Rol: eticheta puntii, doua cuvinte legate prin sageata (9,92/700). Lungime: 13 [numarat].
  punte: "vineri → luni",
} as const;

// ---------------------------------------------------------------------------------------------
// S7 - CTA final (fisa S7, sablon §4.7). Titlul pe 3 randuri la 1440 (~46 de caractere).
// ---------------------------------------------------------------------------------------------

export const CTA_AUTOMATIZARI = {
  // Rol: titlul CTA, 3 randuri la 1440. Lungime: 46 [numarat]. La 390 fisa cere 4 randuri, aici 3
  // (masurat): randurile depind de latimea cuvintelor, iar un titlu cu 4 randuri la 390 ar trece pe 4 si
  // la 1440. Inaltimea sectiunii e aceeasi (80vh).
  titlu: "Fiecare om află la timp ce are de făcut",
  // Rol: paragraful CTA (20,8/400, 2 randuri la 1440, 3 la 390). Lungime: 85. Doua fapte 3S: regula
  // porneste la intrarea actului, iar pasii ei intra in jurnal.
  paragraf: "O regulă „când / atunci” pornește la intrarea actului, iar jurnalul păstrează fiecare pas.",
  buton: "Testează gratuit",
  nota: "Toate pachetele costă azi 0 RON, iar contul nu cere card.",
} as const;

/** Firul paginii (BreadcrumbList): startul si pagina. Numele, ca in meniul site-ului. */
export const FIR_AUTOMATIZARI_AI = [
  { nume: "Acasă", cale: "/" },
  { nume: "Reguli automate", cale: CALE_AUTOMATIZARI_AI },
] as const;

// Textele paginii /functionalitati/portal-clienti (fisa functionalitati__portal-clienti.md; sablonul
// cinema, functionalitati__sablon.md). Scrise de noi pe ROLUL si LUNGIMEA frazelor referintei (plan D1b),
// PORNIND DE LA IDEE, nu de la fraza: alta imagine, alt ritm, alta ordine. Prima scriere urmase fraza cu
// fraza si iesise parafraza apropiata (critic 25.09: bigrame comune, aceleasi metafore, sinonime puse
// cuvant cu cuvant); rescrisa si masurata contra textului sursei cu bigrame, Jaccard pe radacini si
// difflib. Niciun cuvant, nume de fisier sau exemplu al ei. Lungimile din comentarii sunt ale referintei,
// pe acelasi rol.
//
// CE SPUNE PAGINA E CE ARE 3S (plan D4, D4b): portalul in care clientul isi vede singur actele, accesul
// dat pe persoana si pe dosar, notele interne vazute doar de echipa si jurnalul deschiderilor. Semnatura
// calificata NU apare (integrarea e in curs, D4c): in grila si in document sta "aprobarea". Fara
// "oricand", "complet" sau zerouri promise (fisa S8, "Atentie D4"). Fiecare afirmatie e in registrul
// feliei, `src/content/afirmatii/cinema-1.json`.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9): firmele (numite Alfa / Beta / Gama Exemplu, ca sa nu
// semene cu o firma reala), persoanele, fisierele, sumele, orele, contoarele
// si mesajele sunt inventate; adresele de e-mail sunt pe domeniul rezervat `.example`, iar codul fiscal are
// cifra de control gresita, deci nu poate fi al nimanui (proba `tests/cinema-1.test.ts`).

export const CALE_PORTAL_CLIENTI = "/functionalitati/portal-clienti";

export const META_PORTAL_CLIENTI = {
  titlu: "Portal pentru clienți, cu acces pe persoană | 3S",
  descriere:
    "Facturile și contractele stau în portal, iar clientul și le ia singur. Accesul se acordă pe persoană și pe dosar, cu jurnal pentru fiecare deschidere.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02), ca text: intrebarea la care raspunde. */
export const INTREBARE_PAGINA_PORTAL = "Cum își ia clientul singur actele, fără să i le mai trimiteți pe e-mail?";

/** Clientul si actul din exemplu, aceleasi in toate machetele paginii. */
export const CLIENT_EXEMPLU = "Alfa Exemplu";
export const ACT_PORTAL = "contract_prestari_alfa.pdf";

// ---------------------------------------------------------------------------------------------
// S0 - eroul (fisa S0): terminalul cu cererea, subtitlul italic.
// ---------------------------------------------------------------------------------------------

export const EROU_PORTAL = {
  // Rol: eticheta paginii (13,6/600). Referinta: 18.
  eticheta: "Funcționalitate 04 · Portalul clienților",
  // Rol: titlul eroului, 1 rand (72/600). Lungime: 19 [numarat].
  titlu: "Un munte de mesaje.",
  // Rol: cererea scrisa in terminal (17,6/500). Lungime: 38 [fisa].
  cerere: "Îi trimite cineva clientului Alfa anexa 2?",
  // Rol: subtitlul italic al eroului (20, 1 rand). Lungime: 52 [numarat].
  subtitlu: "Aceeași anexă a plecat de trei ori, de fiecare dată alta.",
  indiciu: "derulați",
} as const;

// ---------------------------------------------------------------------------------------------
// S1 - arborele de dosare din inbox (fisa S1): contorul, fereastra cu 16 randuri.
// ---------------------------------------------------------------------------------------------

export type TipRandArbore = "radacina" | "dosar" | "fisier" | "infinit";
export type RandArbore = {
  tip: TipRandArbore;
  /** Nivelul in arbore: 0 radacina, 1..4. */
  nivel: number;
  nume: string;
  numar: string;
};

/** Valoarea de pornire a contorului de necitite; creste cu derularea pana la +24. */
export const NECITITE_START = 2740;
export const NECITITE_CRESTERE = 24;

export const ARBORE = {
  // Rol: eticheta contorului, un cuvant (12/600). Lungime: 5 [numarat].
  eticheta: "Mesaje",
  // Rol: calea din bara ferestrei (mono 11,52). Lungime: 19 [numarat].
  cale: "căsuța · dosare vechi",
  // Rol: 16 randuri ale arborelui, pe niveluri de la 0 la 4, ultimul fiind randul de capat.
  randuri: [
    { tip: "radacina", nivel: 0, nume: "Mesaje primite", numar: "2.740" },
    { tip: "dosar", nivel: 1, nume: "Parteneri", numar: "902" },
    { tip: "dosar", nivel: 2, nume: "Alfa Exemplu", numar: "388" },
    { tip: "dosar", nivel: 3, nume: "Contract cadru", numar: "76" },
    { tip: "fisier", nivel: 4, nume: "scanat", numar: "14" },
    { tip: "fisier", nivel: 4, nume: "scanat_rotit", numar: "9" },
    { tip: "fisier", nivel: 4, nume: "scanat_rotit_bun", numar: "5" },
    { tip: "fisier", nivel: 4, nume: "asta e???", numar: "2" },
    { tip: "dosar", nivel: 3, nume: "Oferte", numar: "53" },
    { tip: "dosar", nivel: 3, nume: "Arhivă 2024", numar: "241" },
    { tip: "dosar", nivel: 2, nume: "Beta Exemplu", numar: "187" },
    { tip: "dosar", nivel: 2, nume: "Gama Exemplu", numar: "164" },
    { tip: "dosar", nivel: 1, nume: "Facturi furnizori", numar: "219" },
    { tip: "dosar", nivel: 1, nume: "Bănci", numar: "..." },
    { tip: "dosar", nivel: 1, nume: "Diverse", numar: "64" },
    { tip: "infinit", nivel: 1, nume: "(alte 1.100 de dosare mai jos)", numar: "∞" },
  ] as readonly RandArbore[],
  declaratie:
    "Exemplu cu date fictive: o căsuță de e-mail folosită ca dulap, cu dosare pe clienți, pe contracte și pe versiuni",
} as const;

// ---------------------------------------------------------------------------------------------
// S2 - recunoasterea (fisa S2): titlul, paragraful si inboxul in trepte.
// ---------------------------------------------------------------------------------------------

export type MesajInbox = { subiect: string; ora: string; urgent?: boolean; numar?: string };

export const RECUNOASTERE_PORTAL = {
  // Rol: titlul recunoasterii (40/600, 1 rand). Lungime: 19 [numarat].
  titlu: "Arhiva firmei stă în mail.",
  // Rol: paragraful recunoasterii (22,4/400, 2 randuri).
  // Lungime: 104.
  paragraf: "Dosarele pe clienți le-au făcut niște reguli de mail puse acum câțiva ani. Azi nimeni nu mai știe ce e în fiecare.",
  // Bara ferestrei: calea (mono 10,56) si chipul rosu cu necititele (9,92/600).
  cale: "mesaje",
  necitite: "2.740 mesaje noi",
  // Rol: 5 subiecte de mesaje, primul marcat urgent. Continutul e fluxul unui portal 3S: cereri de acces,
  // facturi emise, confirmari de primire, procese-verbale.
  mesaje: [
    { subiect: "Cerere de acces la dosarul Gama", ora: "10:52", urgent: true, numar: "3" },
    { subiect: "Am primit contractul, mulțumim", ora: "10:31" },
    { subiect: "Factura 2291 a fost emisă", ora: "09:47" },
    { subiect: "Proces-verbal de predare", ora: "09:05" },
    { subiect: "Situația plăților pe trimestrul I", ora: "ieri" },
  ] as readonly MesajInbox[],
  declaratie: "Exemplu cu date fictive: cinci mesaje din inboxul unei firme, unul urgent",
} as const;

// ---------------------------------------------------------------------------------------------
// S3 - etichetele (fisa S3): actul acoperit de etichete, titlul, intrebarea, inchiderea.
// ---------------------------------------------------------------------------------------------

export type Eticheta = { text: string; ton: "rosu" | "neutru" };

export const ETICHETE = {
  // Rol: numele fisierului din macheta (mono 11,52). Lungime: 27 [numarat].
  fisier: "oferta_alfa_REV3_ok_ok.pdf",
  // Rol: data si ora (mono 9,92).
  stampila: "13.03.2026 · 18:22",
  // Cele 7 etichete, in ordinea pozitiilor: stanga-sus, sus-dreapta, dreapta, dreapta-jos, jos,
  // stanga-jos, stanga. Doua rosii, cinci neutre; continutul e al nostru: versiuni, anexa, plata.
  etichete: [
    { text: "De ieri", ton: "rosu" },
    { text: "v3 final", ton: "neutru" },
    { text: "Anexa 2", ton: "neutru" },
    { text: "Contabil", ton: "neutru" },
    { text: "Plătit?", ton: "neutru" },
    { text: "Arhivă", ton: "neutru" },
    { text: "Revine", ton: "rosu" },
  ] as readonly Eticheta[],
  // Rol: titlul sectiunii (40/600). Lungime: 30 [numarat].
  titlu: "Ultima versiune e mereu alta.",
  // Rol: randul de dinaintea constatarii (20/400). Lungime: 74 [numarat].
  linie: "Trei revizii au plecat la client, fiecare din alt calculator al biroului.",
  // Rol: constatarea, pe randul italic (italic 28,8/600). Lungime: 29 [numarat]. La 3S e o afirmatie,
  // nu o intrebare intre ghilimele.
  intrebare: "Clientul a răspuns pe cea veche.",
  // Rol: inchiderea sectiunii (21,6/600, albastru). Lungime: 49 [numarat].
  inchidere: "În portal, actul valabil are un singur loc.",
  declaratie: "Exemplu cu date fictive: o ofertă acoperită de șapte etichete lipite una peste alta",
} as const;

// ---------------------------------------------------------------------------------------------
// S4 - anxietatea (fisa S4): doua randuri italice, emfaza, patru fantome, praful.
// ---------------------------------------------------------------------------------------------

export const ANXIETATE_PORTAL = {
  // Rol: doua intrebari italice (20; sablon §4.3). Lungimi la referinta: 41, 31 [numarat].
  randuri: ["Cine mai are, de fapt, parola dosarului?", "Fostul contabil o mai știe?"] as const,
  // Rol: emfaza (29,6/600, roz, 2 randuri). Lungime: 50 [numarat].
  emfaza: "Un act plecat pe mail nu se mai poate lua înapoi.",
  // Rol: 4 replici scurte de birou (italic 14,4). Lungimi: 10, 25, 22, 47 [numarat].
  fantome: ["Cui i-am dat-o?", "Am pus-o pe stick, cred", "Scanerul a sărit pagina 2", "Contabilul vrea tot dosarul, încă o dată."],
} as const;

// ---------------------------------------------------------------------------------------------
// S5 - pivotul (fisa S5).
// ---------------------------------------------------------------------------------------------

export const PIVOT_PORTAL = {
  // Rol: intrebarea pivotului (sablon §4.4, 22,4/400).
  // Lungime: 46 [numarat].
  intrebare: "Și dacă mailul n-ar mai fi dulapul firmei?",
  // Rol: emfaza pivotului (38,4/600, 1 rand). Lungime: 28 [numarat].
  emfaza: "Lista de acces o scrieți voi.",
  // Rol: linia albastra care numeste functionalitatea (32/600, albastru). Lungime: 34 [numarat].
  linie: "Pentru asta există portalul 3S.",
} as const;

// ---------------------------------------------------------------------------------------------
// S6 - portalul (fisa S6): comutatorul de rol, documentul pe zone, grila de drepturi.
// ---------------------------------------------------------------------------------------------

export type RolPortal = "client" | "contabil" | "echipa";

export const ROLURI_PORTAL: readonly RolPortal[] = ["client", "contabil", "echipa"];

export type RandCheie = { cheie: string; valoare: string; cip?: boolean };

export const PORTAL = {
  // Rol: titlul portalului (40/600, 1 rand). Lungime: 24 [numarat].
  titlu: "Un dosar, trei chei diferite.",
  // Rol: paragraful portalului (19,2/400, 2 randuri la max 580; 16/25,6 la 390). Lungime: ~76 (critic
  // 25.09: la 133 iesea pe 3 randuri la 1440 si pe 4 la 390, sectiunea crestea cu 34 / 61 px; la 101
  // ramanea +25 px la 390). Ce vede fiecare rol arata comutatorul de dedesubt.
  paragraf: "Drepturile se dau pe persoană și pe dosar: fiecare rol vede doar partea lui.",
  // Rol: eticheta comutatorului (10,88/600). Lungime: 19 [numarat].
  priviti: "Alegeți cine privește:",
  eticheteRol: "Rolul din care priviți documentul",
  roluri: {
    client: { buton: "Clientul", eticheta: "01 · Clientul", coloana: "Clientul", firma: "Alfa Exemplu SRL" },
    contabil: { buton: "Contabilul", eticheta: "02 · Contabilul", coloana: "Contabilul", firma: "contabil extern" },
    echipa: { buton: "Echipa", eticheta: "03 · Echipa", coloana: "Echipa", firma: "biroul vostru" },
  },
  // Zona clientului: numele fisierului (mono 14,72) si metadatele (mono 11,52).
  meta: "semnat 14.03.2026 · 6 pagini",
  // Zona contabilului: 6 randuri cheie-valoare; unul e cip verde.
  randuri: [
    { cheie: "Sumă", valoare: "18.400,00 lei" },
    { cheie: "Plată în", valoare: "3 rate" },
    { cheie: "Prima rată", valoare: "15.04.2026" },
    { cheie: "CUI client", valoare: "RO 48273610" },
    { cheie: "Încasări", valoare: "La zi", cip: true },
    { cheie: "Cont", valoare: "4111 · Alfa" },
  ] as readonly RandCheie[],
  // Zona echipei: randul de aprobari si nota interna.
  aprobari: "Aprobări:",
  etichetaInterna: "Privat",
  notaInterna: "Radu vorbește marți cu ei despre penalități; anexa nu pleacă până atunci.",
  // Grila de drepturi: bara ferestrei si cele 4 randuri (deschidere, copie, note, acces).
  grila: "portal / drepturi",
  drepturi: ["Deschide actul", "Salvează copia", "Citește notele", "Dă acces"] as const,
  // Matricea: primele doua drepturi pentru toti, ultimele doua doar pentru echipa.
  da: "da",
  nu: "nu",
  declaratieDocument: "Exemplu cu date fictive: același contract văzut pe zone, după rolul ales",
  declaratieGrila: "Exemplu cu date fictive: drepturile fiecărui rol asupra contractului din portal",
} as const;

/** Cine are dreptul r (indice in PORTAL.drepturi) pe coloana rolului. */
export function areDrept(r: number, rol: RolPortal): boolean {
  return r < 2 || rol === "echipa";
}

// ---------------------------------------------------------------------------------------------
// S7 - jurnalul (fisa S7).
// ---------------------------------------------------------------------------------------------

export const JURNAL = {
  // Rol: titlul jurnalului (40/600, 1 rand). Lungime: 26 [numarat].
  titlu: "Portalul ține minte cine a intrat.",
  // Rol: paragraful jurnalului (2 randuri).
  // Lungime: 95.
  paragraf: "Jurnalul păstrează actul, omul, ora și aparatul. Când clientul întreabă, căutați acolo, nu în mail.",
  fisier: "istoric-portal.log",
  // Rol: indicatorul "in direct" (9,92/600, verde).
  inDirect: "În timp real",
  // Rol: 4 intrari de jurnal; dedesubt ora si aparatul.
  randuri: [
    { eveniment: "Anexa 2, salvată de Alfa Exemplu", cand: "10:14 · laptop" },
    { eveniment: "Extrasul din martie, citit de contabila firmei", cand: "09:58 · telefon" },
    { eveniment: "Acces nou pentru Gama Exemplu, dat de Radu", cand: "ieri, 17:30 · browser" },
    { eveniment: "Oferta revizuită, deschisă de două ori de client", cand: "ieri, 11:02 · tabletă" },
  ],
  declaratie: "Exemplu cu date fictive: patru intrări din jurnalul portalului",
} as const;

// ---------------------------------------------------------------------------------------------
// S8 - contrastul (fisa S8): varianta cu machete, metrici pe randuri.
// ---------------------------------------------------------------------------------------------

export const CONTRAST_PORTAL = {
  // Rol: titlul contrastului (40/600, 1 rand). Lungime: 27 [numarat].
  titlu: "Ce se schimbă cu portalul",
  inainte: {
    titlu: "Înainte",
    subtitlu: "atașamente trimise",
    declaratie: "Exemplu cu date fictive: un inbox cu cereri de acces, facturi și confirmări trimise pe mail",
    necitite: "2.740 mesaje noi",
    cale: "mesaje",
    mesaje: [
      { subiect: "Factura 2291 a fost emisă", dela: "De la: office@alfa.example", numar: "2" },
      { subiect: "Cerere de acces la dosarul Gama", dela: "De la: achizitii@gama.example", numar: "3", urgent: true },
    ],
    stinse: ["Proces-verbal de predare", "Situația plăților pe trimestrul I"],
    metrici: [
      { valoare: "7", cheie: "Copii ale actului" },
      { valoare: "oricine are mailul", cheie: "Cine are acces", calitativ: "rau" },
      { valoare: "nu se știe", cheie: "Cine l-a deschis", calitativ: "rau" },
      { valoare: "în mailuri", cheie: "Unde îl căutați", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "cu portalul 3S",
    declaratie: "Exemplu cu date fictive: portalul, cu drepturile fiecărui rol bifate",
    inDirect: "În timp real",
    cale: "portal / drepturi",
    randuri: [
      { rol: "Clientul", actiune: "deschide actul" },
      { rol: "Contabilul", actiune: "salvează copia" },
      { rol: "Echipa", actiune: "citește notele" },
      { rol: "Echipa", actiune: "dă acces" },
    ],
    metrici: [
      { valoare: "1", cheie: "Copii ale actului" },
      { valoare: "doar cine e numit", cheie: "Cine are acces", calitativ: "bun" },
      { valoare: "scris în jurnal", cheie: "Cine l-a deschis", calitativ: "bun" },
      { valoare: "într-un dosar", cheie: "Unde îl căutați", calitativ: "bun" },
    ],
  },
} as const;

// ---------------------------------------------------------------------------------------------
// S9 - CTA final (fisa S9, sablon §4.7). Titlul pe 3 randuri (~42 de caractere).
// ---------------------------------------------------------------------------------------------

export const CTA_PORTAL = {
  // Rol: titlul CTA. Lungime: 42 [numarat].
  titlu: "Clienții își iau singuri actele, direct din portal.",
  // Rol: paragraful CTA (2 randuri).
  // Lungime: 104.
  paragraf: "Dați accesul o singură dată, pe persoană. De acolo, clientul și contabilul nu vă mai scriu după acte.",
  buton: "Deschideți un cont",
  nota: "Toate pachetele costă azi 0 RON, iar contul nu cere card.",
} as const;

/** Firul paginii (BreadcrumbList): startul si pagina. Numele, ca in meniul site-ului. */
export const FIR_PORTAL_CLIENTI = [
  { nume: "Acasă", cale: "/" },
  { nume: "Clienții își văd actele", cale: CALE_PORTAL_CLIENTI },
] as const;

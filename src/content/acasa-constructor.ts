// Continutul constructorului de pe start (felia `constructor`, valul S4-2; fisa de masurare
// `acasa-constructor.md` din depozitul fabricii): cele 9 scenarii de arhiva, chestionarul, duelul
// si formula estimarii. Doar date si functii pure; nicio componenta.
//
// DATELE DIN SCENE SUNT FICTIVE si se declara ca exemplu (plan D9): numele de clienti, numerele de
// dosar, datele, fisierele si persoanele nu exista. Declaratia e pe ecran, in capul panoului
// (`COMUN.tipSpatiu`, arhiva demonstrativa), si in textul estimarii (exemplu de calcul).
//
// CE E ADEVARAT SI UNDE II E SURSA. Afirmatiile despre produs din fisierul asta au fiecare o
// intrare in `src/content/afirmatii/acasa-constructor.json`, cu `unde` pe fisierul asta si cu
// intrarea din `acasa.json` pe care se sprijina (sortarea automata si dosarul potrivit, anuntarea
// omului potrivit, alertele de act lipsa si de expirare, cautarea dupa adresa si dupa nume,
// custodia arhivei notariale, termenul de pastrare dupa categorie, lucrul pe stocarea proprie,
// integrarile cu e-mailul si WhatsApp, pretul de 0 RON, contul fara card). O fraza noua care
// afirma ceva despre produs primeste intrarea ei in acelasi commit. Cifrele estimarii sunt ale
// formulei, date ca EXEMPLU, nu ca promisiune.
//
// LUNGIMILE. Fiecare text sta pe rolul si pe lungimea textului referintei (numarate pe referinta,
// niciodata preluate): fraza de sub alegere, durerea si concluzia fiecarei industrii au in proba
// `tests/constructor.test.ts` lungimea de referinta si o toleranta de 15%. Textul e scris de noi,
// cu o singura forma de adresare (dumneavoastra, scris intreg), diacritice complete si doar cratima.
//
// FARA ETICHETELE REFERINTEI. Actele din scene, listele duelului, declansatoarele benzilor si
// termenele ratate sunt alese de noi pentru fiecare domeniu, nu luate din dictionarul referintei:
// alte acte, alta ordine, alte stari. Raman comune doar etichetele de interfata pe care orice
// formular le are ("in asteptare", "complet", contoarele duelului, numele canalelor).
// Pasul la care se bifeaza fiecare POZITIE de banda e al fisei (coregrafia din §7, pe care o
// verifica proba de browser): de aceea `laPas` urmeaza pozitia, iar actul si actiunea sunt ale
// noastre. Nici formatul capului de obiect (numar, traseu, parti) nu repeta sablonul referintei.
//
// CONTRACTUL SPRE `/inregistrare` nu se scrie aici: il da `adresaInregistrare` din `acasa.ts`.

import { CODURI_CANAL, type CodCanal, type CodCine, type CodIndustrie, type CodVolum } from "./acasa";

// ---------------------------------------------------------------------------------------------
// Tipuri comune
// ---------------------------------------------------------------------------------------------

/** Iconita actiunii dintr-o banda de automatizare (acasa-constructor.md §5.3). */
export type IconitaActiune = "persoana" | "lant" | "ceas" | "dosar" | "bifa";

/** Pasii "rezolvarii" din programul panoului (T1-T5, §6.1). */
export type PasT = 1 | 2 | 3 | 4 | 5;

export type Banda = {
  /** Tipul de document care declanseaza regula (15,2/600). */
  declansator: string;
  /** Ce face arhiva cand soseste documentul (15,2/500, dupa iconita). */
  actiune: string;
  iconita: IconitaActiune;
  /** Pasul T la care banda se bifeaza; `null` = nu se bifeaza (documentul lipseste). */
  laPas: PasT | null;
};

/** Un fisier din duel: `sablon` are `{n}`, un numar care creste cu 1 la fiecare repetare. */
export type FisierDuel = { sablon: string; start: number };

export type DuelIndustrie = {
  /** Cele 5 dosare de sub gramada; documentul i intra in dosarul i. */
  dosare: [string, string, string, string, string];
  fisiere: [FisierDuel, FisierDuel, FisierDuel, FisierDuel, FisierDuel];
  /** Tipul recunoscut al fiecarui fisier (jetonul albastru din dreapta). */
  tipuri: [string, string, string, string, string];
  /** Randurile scrise de mana ale firmei fara arhiva (3-4, se schimba pe rand). */
  stres: string[];
  /** Cele 3 randuri rosii "termen ratat", in ordinea in care apar. */
  termeneRatate: [string, string, string];
  /** Cine a fost anuntat automat (toastul din cardul drept). */
  toast: string;
};

export type ScenariuBaza = {
  /** Sub alegere: unde stau azi actele domeniului si ce face arhiva (14,4/500). */
  fraza: string;
  /** Titlul-durere al scenei (h3, 23,2/600). */
  durere: string;
  /** Concluzia de dupa benzi (17,6/600, cu bifa). */
  concluzie: string;
  /** Benzile proprii ale scenei; banda canalelor se adauga in fata lor (§6.3). */
  benzi: Banda[];
  duel: DuelIndustrie;
};

// ---------------------------------------------------------------------------------------------
// Obiectele celor 9 scene (§7): forma e a referintei, datele sunt ale noastre, fictive.
// ---------------------------------------------------------------------------------------------

export type ObiectConstructii = {
  cod: string;
  nume: string;
  veche: { numar: string; data: string; stare: string; retrasa: string };
  noua: { numar: string; data: string; stare: string; propunere: string };
  /** Bara de stare: numele, cate anexe, contorul (`{n}` din `{total}`) si starea finala. */
  bara: { nume: string; total: number; contor: string; complet: string };
};

export type CelulaContabilitate = { eticheta: string; valoare: string; scurta?: boolean };

export type ObiectContabilitate = {
  client: string;
  perioada: string;
  celule: [CelulaContabilitate, CelulaContabilitate, CelulaContabilitate, CelulaContabilitate, CelulaContabilitate];
  lipsa: string;
  propunere: string;
  termen: string;
};

export type ObiectLogistica = {
  cap: string;
  verigi: [string, string, string, string, string];
  /** Nota verigii a doua cand documentul nu s-a putut citi (T2). */
  notaFierbinte: string;
  notaBlocata: string;
  notaDeblocata: string;
  coada: string;
  fisier: string;
  propunere: string;
};

export type ObiectIt = {
  client: string;
  dataInitiala: string;
  dataNoua: string;
  propunere: string;
  azi: string;
  vechiInVigoare: string;
  vechiInlocuit: string;
  nou: string;
  set: string[];
  /** Pozitia actului lipsa din set. */
  lipsa: number;
  nota: string;
  notaFinala: string;
};

export type ObiectAvocatura = {
  dosar: string;
  stampila: string;
  zileInitial: string;
  zileCorect: string;
  dataInitiala: string;
  dataCorecta: string;
  nota: string;
  acte: [string, string, string];
  asteptare: string;
  ancora: string;
};

export type StareActImobil = "complet" | "invechit" | "asteptare";

export type ObiectImobiliare = {
  programare: string;
  propunere: string;
  adresa: string;
  acte: { nume: string; stare: StareActImobil }[];
  stari: Record<StareActImobil, string>;
  notaInvechit: string;
  /** Linia de stare: `{act}` e primul act inca in asteptare. */
  lipseste: string;
  complet: string;
};

export type ObiectAsigurari = {
  dosar: string;
  returnat: string;
  propunere: string;
  sloturi: [string, string, string, string, string];
  stari: { asteptare: string; complet: string; lipsa: string };
  zile: string;
  fotografii: string;
};

export type RandRegistru = { numar: string; parti: string; pastrare: string };

export type ObiectNotariat = {
  substituent: string;
  /** Textul tastat in caseta: 14 caractere, dezvaluite in 5 trepte (3, 6, 8, 11, 14). */
  cautare: string;
  randuri: [RandRegistru, RandRegistru, RandRegistru];
  potrivit: number;
  gasit: string;
};

export type ObiectConsultanta = {
  nume: string;
  trimis: { nume: string; meta: string; fisier: string; asteptare: string };
  /** Exemplarul intors semnat: o singura linie (16/600, verde) si pastila de propunere. */
  intors: { linie: string; propunere: string };
  factura: { nume: string; asteapta: string; activa: string };
  stare: { nume: string; asteptare: string; complet: string };
};

type Obiecte = {
  constructii: ObiectConstructii;
  contabilitate: ObiectContabilitate;
  logistica: ObiectLogistica;
  it: ObiectIt;
  avocatura: ObiectAvocatura;
  imobiliare: ObiectImobiliare;
  asigurari: ObiectAsigurari;
  notariat: ObiectNotariat;
  consultanta: ObiectConsultanta;
};

export type Scenariu<K extends CodIndustrie = CodIndustrie> = ScenariuBaza & { obiect: Obiecte[K] };

export type Scenarii = { [K in CodIndustrie]: Scenariu<K> };

// ---------------------------------------------------------------------------------------------
// Textele comune ale lumii (§4.2, §5, §17 "Comune")
// ---------------------------------------------------------------------------------------------

export const COMUN = {
  // Rol: legatura care intoarce la grila (12,8/500, subliniata). Referinta: 18.
  schimba: "înapoi la domenii",
  // Rol: numele spatiului din capul cardului (15,2/700, un rand). Referinta: 10.
  numeSpatiu: "Firma dumneavoastră",
  // Rol: tipul spatiului, inaintea domeniului (12,16/500). Declara si exemplul (plan D9).
  tipSpatiu: "Arhivă demonstrativă",
  // Rol: eticheta barei de progres (11,84/600). Referinta: 13.
  progres: "Arhiva dumneavoastră",
  // Rol: eticheta accesibila a butonului rotund de reluare.
  reluare: "Reluați construirea arhivei",
  // Rol: titlul listei de reguli automate (11,84/600). Referinta: 51.
  automatizari: "Reguli care pornesc singure la fiecare act primit",
  // Rol: compatibilitatea cu ce foloseste firma azi (11,2/600) si doua elemente (12,16/500).
  // Afirmatiile: lucrul pe stocarea proprie si integrarile cu e-mailul si WhatsApp
  // (acasa-functii-in-productie, acasa-integrari-si-whatsapp).
  integrari: {
    eticheta: "Merge cu uneltele de azi",
    elemente: [
      { iconita: "server" as const, text: "Stocarea proprie a firmei" },
      { iconita: "mail" as const, text: "Gmail, Outlook și WhatsApp" },
    ],
  },
  // Rol: randul final al cardului: rezumatul, sub-randul si butonul. Referinta: 45 / 27 / 25.
  final: {
    titlu: "Arhiva de mai sus e gata de folosit.",
    subRand: "0 RON astăzi, fără card de plată.",
    buton: "Deschideți contul gratuit",
  },
  // Rol: anuntul pentru cititoarele de ecran cand panoul s-a construit (nu apare pe ecran).
  anuntGata: "Arhiva demonstrativă pentru {industrie} s-a construit.",
};

/** Canalele, cum apar ele in banda canalelor si in fraza finala a duelului. */
export const NUME_CANAL: Record<CodCanal, { banda: string; fraza: string; insigna: string }> = {
  email: { banda: "e-mail", fraza: "prin e-mail", insigna: "e-mail" },
  mesaj: { banda: "WhatsApp", fraza: "prin WhatsApp", insigna: "WhatsApp" },
  hartie: { banda: "hârtie", fraza: "prin poștă", insigna: "scaner" },
};

/**
 * Banda canalelor (§6.3): apare in fata benzilor scenei cand exista raspunsuri (precompletate sau
 * confirmate) si se bifeaza la T1. La referinta o aduc numai e-mailul si hartia; la 3S si WhatsApp,
 * fiindca e canal de primire real al marcii (plan D4c) - o abatere deliberata, numita aici.
 */
export const BANDA_CANALE = {
  actiune: "sortate la sosire",
  iconita: "dosar" as IconitaActiune,
};

/** Lista de canale ca text, cu virgula intre ele si cu "si" inaintea ultimului. */
export function listaCanale(canale: readonly CodCanal[], forma: "banda" | "fraza"): string {
  const texte = CODURI_CANAL.filter((c) => canale.includes(c)).map((c) => NUME_CANAL[c][forma]);
  if (texte.length <= 1) return texte.join("");
  return texte.slice(0, -1).join(", ") + " și " + texte[texte.length - 1];
}

/** Banda canalelor pentru un set de raspunsuri; `null` fara niciun canal. */
export function bandaCanalelor(canale: readonly CodCanal[]): Banda | null {
  if (canale.length === 0) return null;
  return {
    declansator: listaCanale(canale, "banda"),
    actiune: BANDA_CANALE.actiune,
    iconita: BANDA_CANALE.iconita,
    laPas: 1,
  };
}

// ---------------------------------------------------------------------------------------------
// Chestionarul (§10)
// ---------------------------------------------------------------------------------------------

export type OptiuneCine = { cod: CodCine; titlu: string; descriere: string };

export const CHESTIONAR = {
  // Rol: capul expandorului (16/700) si descrierea lui (12,8/500). Referinta: 39 / 79.
  // La 390 amandoua stau pe cate doua randuri, ca la referinta (expandorul inchis are 106 px).
  titlu: "Ce se întâmplă în fiecare zi cu actele firmei?",
  descriere: "Trei clicuri, iar calculul vă arată câte ore pe lună duce sortatul actelor.",
  canale: {
    // Rol: prima intrebare (13,12/600). Referinta: 30.
    intrebare: "Pe unde ajung actele în firmă?",
    optiuni: [
      { cod: "email" as CodCanal, text: "E-mail" },
      { cod: "mesaj" as CodCanal, text: "WhatsApp și mesaje" },
      { cod: "hartie" as CodCanal, text: "Hârtii și plicuri" },
    ],
  },
  volum: {
    // Referinta: 27.
    intrebare: "Câte acte primiți într-o zi?",
    optiuni: [
      { cod: "v10" as CodVolum, text: "Cel mult 10" },
      { cod: "v50" as CodVolum, text: "Între 10 și 50" },
      { cod: "v99" as CodVolum, text: "50 și peste" },
    ],
  },
  cine: {
    // Referinta: 24.
    intrebare: "Cine se ocupă azi de ele?",
    optiuni: [
      { cod: "eu", titlu: "Chiar eu", descriere: "Timpul de conducere se duce pe sortat acte" },
      { cod: "coleg", titlu: "Cineva din echipă", descriere: "E plătit pentru altceva, dar își petrece ziua sortând hârtii" },
      { cod: "nimeni", titlu: "Nimeni anume", descriere: "Actele stau neatinse până le caută cineva în grabă, la termen" },
    ] as OptiuneCine[],
  },
  // Rol: butonul de confirmare, inainte si dupa (13,44/600).
  confirma: "Confirmați",
  confirmat: "Confirmat",
};

/**
 * Raspunsurile precompletate la 5 domenii (§10.4) stau in `acasa-constructor-precompletari.ts`: le
 * citeste starea din pachetul paginii, iar un import de aici ar trage in acel pachet tot fisierul.
 * Reexportul le tine la indemana celor care lucreaza deja cu continutul constructorului.
 */
export { PRECOMPLETARI } from "./acasa-constructor-precompletari";

// ---------------------------------------------------------------------------------------------
// Duelul (§11) si estimarea (§12)
// ---------------------------------------------------------------------------------------------

export const DUEL = {
  // Rol: eticheta simularii (11,52/600) si legatura de reluare (11,84/500). Referinta: 23 / 22.
  eticheta: "Ziua simulată, pas cu pas",
  reluare: "Reluați ziua",
  // Rol: numele celor doua firme (15,2/700). Referinta: 17 / 21.
  firmaFara: "Hârtii și e-mailuri",
  firmaCu: "Totul în arhiva 3S",
  nesortate: "nesortate:",
  inOrdine: "în ordine",
  timpPierdut: "timp pierdut:",
  termeneRatate: "termene ratate:",
  timpEconomisit: "timp economisit:",
  faraEticheta: "fără etichetă",
  ai: "AI",
  // Rol: linia calma din dreapta, la final (12,48/500 verde). Referinta: 33.
  calm: "Actele s-au așezat singure în dosare.",
  // Rol: randul scris de mana la final, dupa "cine" (`{timp}` = timpul pierdut al zilei).
  cine: {
    eu: "Pierdeți {timp} pe zi cu hârtiile, nu cu clienții.",
    coleg: "Colegul pierde {timp} pe zi căutând prin hârtii.",
    nimeni: "Actele se strâng în grămezi și nu le mai vede nimeni.",
  } as Record<CodCine, string>,
  // Rol: fraza finala (13,76/600): volumul, canalele si, dupa "cine", timpul redat sau riscul.
  // `{timp}` = timpul economisit al zilei simulate.
  final: {
    eu: "Cu {volum} sosite {canale}, 3S vă redă {timp} pe zi.",
    coleg: "Cu {volum} sosite {canale}, colegul câștigă înapoi {timp} pe zi.",
    nimeni: "Cu {volum} sosite {canale}, niciun act nu mai stă neobservat până expiră un termen.",
  } as Record<CodCine, string>,
  volumInCuvinte: {
    v10: "cel mult 10 acte pe zi",
    v50: "10-50 de acte pe zi",
    v99: "mai mult de 50 de acte pe zi",
  } as Record<CodVolum, string>,
  scor: { nesortate: "Nesortate", timp: "Timp", termene: "Termene ratate", vs: "vs" },
  // Rol: eticheta accesibila a arenei (datele sunt fictive, plan D9).
  declaratie: "Simulare cu acte fictive, ca exemplu",
};

export const ESTIMARE = {
  // Rol: eticheta estimarii (11,52/600). Referinta: 26.
  eticheta: "Ce vă costă sortatul manual",
  // Rol: cifra mare (25,6/600, cifre tabulare).
  cifra: "≈ {ore} ore pe lună",
  // Rol: formula in cuvinte (11,52/500, doua randuri in 280 px), cu mentiunea ca e un exemplu.
  formula: "{docs} acte pe zi, câte {k} min fiecare, în {zile} de zile lucrătoare (exemplu de calcul)",
  manual: "Manual",
  cuProdus: "Cu 3S",
  // Rol: fraza morala, dupa "cine" (13,44/600).
  morala: {
    eu: "Orele astea ar putea merge spre clienți, nu spre dosare.",
    coleg: "O parte din salariul colegului plătește căutatul prin hârtii.",
    nimeni: "La un control, actul care nu se găsește costă mai mult decât timpul.",
  } as Record<CodCine, string>,
  // Rol: CTA-ul final (14/600, cu sageata) si nota de sub el (12/400). Referinta: 19 / 57.
  buton: "Creați-vă arhiva",
  nota: "Contul pornește cu aceste răspunsuri. Nu cerem card.",
};

// ---------------------------------------------------------------------------------------------
// Formula (§13), verificata pe referinta pe 24 de combinatii (7 seturi de canale x 3 volume, plus
// cele 3 variante de "cine", care nu schimba cifrele). Cifrele ei sunt un EXEMPLU, nu o promisiune.
// ---------------------------------------------------------------------------------------------

/** Zilele lucratoare dintr-o luna, in formula. */
export const ZILE_LUCRATOARE = 22;

/** Divizorul fix al orelor "cu produsul". */
export const DIVIZOR_CU_PRODUS = 11;

/** Mijlocul fiecarui interval de volum: documente pe zi. */
export const DOCUMENTE_PE_ZI: Record<CodVolum, number> = { v10: 8, v50: 30, v99: 60 };

/** Minutele de sortat si cautat pe document: depind doar de CATE canale sunt, nu de care. */
export function minutePeDocument(numarCanale: number): number {
  const n = Math.min(3, Math.max(1, Math.round(numarCanale)));
  return n === 1 ? 4 : n === 2 ? 4.5 : 5;
}

export type Estimare = {
  documente: number;
  minute: number;
  /** Ore pe luna, manual. */
  manual: number;
  /** Ore pe luna, cu produsul (minim 1). */
  cuProdus: number;
  /** Latimea barei a doua, cu 3 zecimale. */
  raport: number;
};

/** Rotunjirea din formula: cea a lui `Math.round` (jumatatea in sus: 49,5 -> 50). */
function rotunjeste(x: number): number {
  return Math.round(x);
}

/**
 * Estimarea pentru un numar de canale si un volum. `divizor` e o cusatura pentru proba: martorul
 * pozitiv muta divizorul prin ea, pe functia paginii, nu pe o copie a formulei. Pagina o cheama
 * fara el.
 */
export function estimare(numarCanale: number, volum: CodVolum, divizor: number = DIVIZOR_CU_PRODUS): Estimare {
  const documente = DOCUMENTE_PE_ZI[volum];
  const minute = minutePeDocument(numarCanale);
  const manual = rotunjeste((documente * minute * ZILE_LUCRATOARE) / 60);
  const cuProdus = Math.max(1, rotunjeste(manual / divizor));
  const raport = Math.round((cuProdus / manual) * 1000) / 1000;
  return { documente, minute, manual, cuProdus, raport };
}

/** Parametrii simularii pe volum (§11.2): cate documente si la ce pas, in ms. */
export const PARAMETRI_DUEL: Record<CodVolum, { documente: number; pas: number; termene: number[] }> = {
  v10: { documente: 8, pas: 1150, termene: [0.65] },
  v50: { documente: 16, pas: 680, termene: [0.4, 0.78] },
  v99: { documente: 26, pas: 430, termene: [0.28, 0.55, 0.8] },
};

/** Indicii documentelor dupa care cade un termen ratat. */
export function indiciTermeneRatate(volum: CodVolum): number[] {
  const p = PARAMETRI_DUEL[volum];
  return p.termene.map((f) => Math.floor(p.documente * f));
}

/** Indicii documentelor la care apare toastul (anuntul automat din dreapta). */
export function indiciToast(volum: CodVolum): number[] {
  const n = PARAMETRI_DUEL[volum].documente;
  return [Math.floor(n * 0.3), Math.floor(n * 0.72)];
}

/** Timpul: sub 60 de minute "N min", altfel "Nh" sau "Nh Mm". */
export function formatTimp(minute: number): string {
  const m = Math.round(minute);
  if (m < 60) return m + " min";
  const ore = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? ore + "h" : ore + "h " + rest + "m";
}

/** Minutele cu virgula romaneasca: 4,5 -> "4,5". */
export function formatMinute(minute: number): string {
  return String(minute).replace(".", ",");
}

/** Numele fisierului `index` (0-4) la a `ciclu`-a trecere prin cele 5 sabloane. */
export function numeFisier(f: FisierDuel, ciclu: number): string {
  return f.sablon.replace("{n}", String(f.start + ciclu));
}

/** Completeaza `{cheie}` intr-un sablon de text. */
export function completeaza(sablon: string, valori: Record<string, string | number>): string {
  return sablon.replace(/\{(\w+)\}/g, (_, k: string) => (k in valori ? String(valori[k]) : "{" + k + "}"));
}

// ---------------------------------------------------------------------------------------------
// Cele 9 scenarii (§7, §17). Ordinea benzilor e cea de pe ecran; `laPas` e momentul bifei.
// ---------------------------------------------------------------------------------------------

export const SCENARII: Scenarii = {
  constructii: {
    // Referinta: 128 / 95 / 86.
    fraza:
      "Pe un șantier, actele vin de la proiectant, de la furnizori și de la inspectori, fiecare pe drumul lui. În 3S ajung la lucrarea lor.",
    durere: "Revizia nouă a planșei a venit acum trei săptămâni, dar se toarnă tot după cea veche.",
    concluzie: "Maistrul, dirigintele și echipa de turnare au în mână revizia C, și numai pe ea.",
    obiect: {
      cod: "PL-204",
      nume: "Structură, etajul 2",
      veche: { numar: "rev. B", data: "11.06.", stare: "folosită de echipă", retrasa: "scoasă din uz pe 02.09." },
      noua: { numar: "rev. C", data: "02.09.", stare: "folosită de echipă", propunere: "sugestie, de verificat" },
      bara: { nume: "Dosarul de recepție", total: 6, contor: "anexe: {n}/{total}", complet: "complet" },
    },
    benzi: [
      { declansator: "revizie de plan", actiune: "anunță maistrul", iconita: "persoana", laPas: 2 },
      { declansator: "PV de lucrări ascunse", actiune: "atașat la etajul lui", iconita: "lant", laPas: 3 },
      { declansator: "garanție de bună execuție", actiune: "alarmă înainte să expire", iconita: "ceas", laPas: 1 },
    ],
    duel: {
      dosare: ["Recepții", "Devize", "Planuri", "Buletine", "Comenzi"],
      fisiere: [
        { sablon: "pv_recepție_{n}.pdf", start: 3 },
        { sablon: "deviz_ofertă_{n}.xlsx", start: 114 },
        { sablon: "plan_fațadă_R{n}.dwg", start: 4 },
        { sablon: "buletin_beton_B{n}.pdf", start: 25 },
        { sablon: "comandă_oțel_{n}.pdf", start: 31 },
      ],
      tipuri: ["Recepție", "Deviz", "Plan", "Buletin", "Comandă"],
      stres: [
        "Revizia nouă e într-un e-mail",
        "Buletinul n-a sosit încă",
        "Planul bun e la proiectant",
        "Dirigintele vine la ora 10",
      ],
      termeneRatate: [
        "Termen ratat: recepția la structură",
        "Termen ratat: comanda de oțel",
        "Termen ratat: devizul pentru beneficiar",
      ],
      toast: "Maistrul a primit planul",
    },
  },

  contabilitate: {
    // Referinta: 145 / 78 / 71.
    fraza:
      "Extrasele, facturile și bonurile unui client sosesc pe bucăți, pe tot parcursul lunii. În 3S le vedeți așezate pe lună, cu golurile marcate.",
    durere: "Balanța se închide vineri, iar în extrasele clientului lipsesc două zile.",
    concluzie: "Zilele lipsă din extrase se văd de când sosește actul, nu vineri seara.",
    obiect: {
      client: "Livada Nord",
      perioada: "08/2026",
      celule: [
        { eticheta: "Facturi de vânzare", valoare: "14" },
        { eticheta: "Bonuri de casă", valoare: "27" },
        { eticheta: "Extrase de cont", valoare: "20", scurta: true },
        { eticheta: "Facturi de achiziție", valoare: "31" },
        { eticheta: "Documente de salarii", valoare: "4" },
      ],
      lipsa: "nu există extras pentru 14 și 15 august",
      propunere: "sugestie, de verificat",
      termen: "balanța pe august se închide vineri",
    },
    benzi: [
      { declansator: "bon de casă", actiune: "sortat pe client și lună", iconita: "dosar", laPas: 2 },
      { declansator: "extras bancar", actiune: "alarmă dacă lipsesc zile", iconita: "ceas", laPas: 3 },
    ],
    duel: {
      dosare: ["Achiziții", "Bancă", "Salarii", "Chitanțe", "Declarații"],
      fisiere: [
        { sablon: "factură_furnizor_F{n}.pdf", start: 1042 },
        { sablon: "extras_cont_{n}.pdf", start: 208 },
        { sablon: "stat_salarii_{n}.xlsx", start: 7 },
        { sablon: "chitanță_{n}.jpg", start: 390 },
        { sablon: "D300_{n}.xml", start: 8 },
      ],
      tipuri: ["Factură furnizor", "Extras bancar", "Stat de salarii", "Chitanță", "Declarație"],
      stres: [
        "Bonurile stau într-un plic",
        "Lipsesc două zile din extras",
        "Totul vine pe WhatsApp",
        "D300 se depune poimâine",
      ],
      termeneRatate: [
        "Termen ratat: transmiterea în e-Factura",
        "Termen ratat: D112 pentru salarii",
        "Termen ratat: D300 pentru august",
      ],
      toast: "Contabila a primit extrasul",
    },
  },

  logistica: {
    // Referinta: 146 / 94 / 67.
    fraza:
      "Documentele unei curse se nasc pe drum: la încărcare, în cabină, la descărcare, fiecare în mâna altcuiva. În 3S vedeți ce hârtie lipsește.",
    durere: "Marfa a ajuns la Hamburg de o săptămână, dar cursa rămâne nefacturată până vine recepția.",
    concluzie: "Cursa se facturează chiar în ziua în care sosește recepția.",
    obiect: {
      cap: "Cursa 418 (Pitești-Hamburg), Stănescu",
      verigi: ["Codul UIT", "Lista de colisaj", "Foaia de parcurs", "Recepția la destinatar", "Factura cursei"],
      notaFierbinte: "poză neclară, se reface",
      notaBlocata: "așteaptă recepția",
      notaDeblocata: "gata de emis",
      coada: "descărcat pe 29.08., recepția lipsește",
      fisier: "receptie_c418.pdf",
      propunere: "sugestie, de verificat",
    },
    benzi: [
      { declansator: "listă de colisaj", actiune: "anunță magazionerul", iconita: "persoana", laPas: 2 },
      { declansator: "cod UIT e-Transport", actiune: "arhivat pe cursă", iconita: "dosar", laPas: 1 },
    ],
    duel: {
      dosare: ["Comenzi", "Livrări", "CMR-uri", "Colisaje", "Facturi"],
      fisiere: [
        { sablon: "comandă_client_{n}.pdf", start: 530 },
        { sablon: "POD_livrare_{n}.pdf", start: 77 },
        { sablon: "CMR_{n}.pdf", start: 418 },
        { sablon: "colisaj_{n}.pdf", start: 61 },
        { sablon: "factură_cursă_{n}.pdf", start: 902 },
      ],
      tipuri: ["Comandă", "Livrare", "CMR", "Colisaj", "Factură cursă"],
      stres: ["Recepția e încă în cabină", "Șoferul e pe drum, fără semnal", "Colisajul e o poză mișcată"],
      termeneRatate: [
        "Termen ratat: facturarea cursei 418",
        "Termen ratat: codul UIT al cursei",
        "Termen ratat: Intrastat pe august",
      ],
      toast: "Magazionerul a primit lista",
    },
  },

  it: {
    // Referinta: 154 / 92 / 88.
    fraza:
      "Contractele cu clienții stau în trei locuri diferite, fiecare cu altă versiune și cu alte anexe. În 3S, fiecare client are un singur dosar, iar versiunea valabilă se vede clar.",
    durere: "Modificați prețul, dar nu știți dacă lucrați pe versiunea semnată sau pe o ciornă.",
    concluzie: "Fiecare modificare pornește de la versiunea semnată, iar ciornele nu se mai confundă cu ea.",
    obiect: {
      client: "Orizont Digital",
      dataInitiala: "01.07.2026.",
      dataNoua: "15.09.2026.",
      propunere: "sugestie, de verificat",
      azi: "astăzi",
      vechiInVigoare: "în vigoare",
      vechiInlocuit: "valabil până la 14.09.",
      nou: "în vigoare",
      set: ["Contract-cadru", "SOW", "Tarife", "Licențe", "Comandă"],
      lipsa: 1,
      nota: "pachet incomplet: 4 acte din 5",
      notaFinala: "Orizont Digital: dosar complet",
    },
    benzi: [
      { declansator: "licență de server", actiune: "alarmă înainte de reînnoire", iconita: "ceas", laPas: 2 },
      { declansator: "cerere de modificare", actiune: "ajunge la șeful de proiect", iconita: "persoana", laPas: 3 },
      { declansator: "proces-verbal de predare", actiune: "atașat la proiect", iconita: "lant", laPas: 4 },
    ],
    duel: {
      dosare: ["Licențe", "SOW-uri", "Facturi", "DPA", "Predări"],
      fisiere: [
        { sablon: "licență_server_{n}.pdf", start: 21 },
        { sablon: "SOW_proiect_{n}.docx", start: 9 },
        { sablon: "factură_IT{n}.pdf", start: 715 },
        { sablon: "DPA_client_{n}.pdf", start: 48 },
        { sablon: "pv_predare_v{n}.pdf", start: 3 },
      ],
      tipuri: ["Licență", "SOW", "Factură", "DPA", "Predare"],
      stres: ["Anexa e într-un chat", "Semnătura e pe v2 sau pe v3?", "Clientul vrea răspuns azi"],
      termeneRatate: [
        "Termen ratat: auditul de securitate",
        "Termen ratat: tichetul critic de luni",
        "Termen ratat: predarea sprintului",
      ],
      toast: "Șeful de proiect e anunțat",
    },
  },

  avocatura: {
    // Referinta: 146 / 93 / 73.
    fraza:
      "Actele de procedură vin prin e-mail și prin curier, iar data primirii rămâne pe un plic. În 3S, ziua sosirii se notează pe act când acesta intră.",
    durere: "Termenul de apel e calculat din memorie și iese cu două săptămâni după cel real.",
    concluzie: "Apelul se depune la timp, fiindcă ziua comunicării e trecută chiar pe actul primit.",
    obiect: {
      dosar: "2318/109/2026, Radu c. Stoica",
      stampila: "comunicată: 03.09.2026",
      zileInitial: "25 de zile",
      zileCorect: "11 zile",
      dataInitiala: "02.10.2026.",
      dataCorecta: "18.09.2026.",
      nota: "socotit de la comunicare; verificați înainte de depunere",
      acte: ["Întâmpinarea pârâtului", "Raportul de expertiză", "Sentința de primă instanță"],
      asteptare: "se așteaptă comunicarea",
      ancora: "comunicarea acestei sentințe pornește numărătoarea",
    },
    benzi: [
      { declansator: "întâmpinare", actiune: "atașată la cauza ei", iconita: "lant", laPas: 2 },
      { declansator: "sentință comunicată", actiune: "alarmă înainte de ultima zi de apel", iconita: "ceas", laPas: null },
      { declansator: "raport de expertiză", actiune: "anunță avocatul titular", iconita: "persoana", laPas: 3 },
    ],
    duel: {
      dosare: ["Sentințe", "Citații", "Acțiuni", "Onorarii", "Expertize"],
      fisiere: [
        { sablon: "sentință_{n}.pdf", start: 845 },
        { sablon: "citație_{n}.pdf", start: 1207 },
        { sablon: "acțiune_{n}.pdf", start: 318 },
        { sablon: "factură_onorariu_{n}.pdf", start: 33 },
        { sablon: "raport_expertiză_{n}.pdf", start: 64 },
      ],
      tipuri: ["Sentință", "Citație", "Acțiune", "Onorariu", "Expertiză"],
      stres: [
        "Plicul cu sentința s-a pierdut",
        "Când am primit citația?",
        "Termenul e notat într-un caiet",
        "Expertiza e la un coleg plecat",
      ],
      termeneRatate: [
        "Termen ratat: notele scrise la dosar",
        "Termen ratat: obiecțiunile la expertiză",
        "Termen ratat: dovada plății taxei",
      ],
      toast: "Titularul a primit raportul",
    },
  },

  imobiliare: {
    // Referinta: 162 / 70 / 91.
    fraza:
      "Actele unei locuințe vin de la proprietar, de la bancă, de la cadastru și de la asociație, fiecare pe alt drum. În 3S le găsiți după adresă și vedeți din timp ce expiră.",
    durere: "Semnarea e joi, iar certificatul fiscal din dosarul locuinței nu mai e valabil.",
    concluzie: "Certificatul nou se cere cu zile înainte, iar joi vânzarea se semnează fără nicio amânare.",
    obiect: {
      programare: "Semnare joi, 10:30",
      propunere: "sugestie, de verificat",
      adresa: "Str. Teilor 12, ap. 5 (Dinu)",
      acte: [
        { nume: "Actele de identitate", stare: "complet" },
        { nume: "Titlul de proprietate", stare: "complet" },
        { nume: "Certificatul fiscal", stare: "invechit" },
        { nume: "Adeverința asociației", stare: "asteptare" },
        { nume: "Planul cadastral", stare: "asteptare" },
      ],
      stari: { complet: "complet", invechit: "de reînnoit", asteptare: "în așteptare" },
      notaInvechit: "emis în iunie, se cere din nou de la primărie",
      lipseste: "lipsește: {act}",
      complet: "dosar gata pentru notar",
    },
    benzi: [
      { declansator: "plan cadastral", actiune: "atașat la adresă", iconita: "lant", laPas: 1 },
      { declansator: "ofertă de cumpărare", actiune: "anunță brokerul", iconita: "persoana", laPas: 2 },
    ],
    duel: {
      dosare: ["Mandate", "Antecontracte", "Evaluări", "Chirii", "Cadastru"],
      fisiere: [
        { sablon: "mandat_vânzare_{n}.pdf", start: 17 },
        { sablon: "antecontract_{n}.pdf", start: 56 },
        { sablon: "raport_evaluare_{n}.pdf", start: 5 },
        { sablon: "chirie_ap{n}.pdf", start: 88 },
        { sablon: "plan_cadastral_{n}.pdf", start: 4410 },
      ],
      tipuri: ["Mandat", "Antecontract", "Evaluare", "Chirie", "Cadastru"],
      stres: [
        "Certificatul fiscal a expirat",
        "Banca cere evaluarea mâine",
        "Vânzătorul nu găsește titlul",
        "Notarul vrea actele azi",
      ],
      termeneRatate: [
        "Termen ratat: plata avansului",
        "Termen ratat: semnarea antecontractului",
        "Termen ratat: prelungirea chiriei",
      ],
      toast: "Brokerul a primit oferta",
    },
  },

  asigurari: {
    // Referinta: 132 / 111 / 84.
    fraza:
      "La o daună, actele vin de la client, de la service și de la poliție. În 3S le vedeți la numărul daunei, cu actele lipsă semnalate din prima zi.",
    durere:
      "Mașina stă în service de două săptămâni, iar plata reparației așteaptă o autorizație încă nesosită.",
    concluzie: "Autorizația se cere în ziua avizării, iar service-ul își primește banii fără întârziere.",
    obiect: {
      dosar: "Coliziune pe 28.08, dosarul 932",
      returnat: "oprit la verificare",
      propunere: "sugestie, de verificat",
      sloturi: [
        "Declarația conducătorului",
        "Talon auto",
        "Autorizația de reparație",
        "Permisul de conducere",
        "Avizarea daunei",
      ],
      stari: { asteptare: "în așteptare", complet: "complet", lipsa: "lipsă" },
      zile: "avizată pe 29.08.",
      fotografii: "12 poze de la daună",
    },
    benzi: [
      { declansator: "poze de la daună", actiune: "atașate la dosarul lor", iconita: "lant", laPas: 1 },
      { declansator: "factură de service", actiune: "anunță lichidatorul", iconita: "persoana", laPas: 2 },
      { declansator: "autorizație de reparație", actiune: "alarmă cât timp lipsește", iconita: "ceas", laPas: null },
    ],
    duel: {
      dosare: ["Avizări", "Expertize", "Reparații", "CASCO", "Poze"],
      fisiere: [
        { sablon: "avizare_daună_{n}.pdf", start: 932 },
        { sablon: "expertiză_{n}.pdf", start: 40 },
        { sablon: "factură_service_{n}.pdf", start: 75 },
        { sablon: "poliță_CASCO_{n}.pdf", start: 6120 },
        { sablon: "poză_daună_{n}.jpg", start: 11 },
      ],
      tipuri: ["Avizare", "Expertiză", "Reparație", "CASCO", "Poză"],
      stres: [
        "CASCO-ul expiră vineri",
        "Service-ul sună după bani",
        "Unde e autorizația de reparație?",
        "Expertul vine abia joi",
      ],
      termeneRatate: [
        "Termen ratat: oferta de despăgubire",
        "Termen ratat: inspecția mașinii",
        "Termen ratat: plata către service",
      ],
      toast: "Lichidatorul a primit factura",
    },
  },

  notariat: {
    // Referinta: 189 / 76 / 66.
    // CUSTODIA e cea din registrul de afirmatii (`acasa-notari-custodie`, aceeasi cu meniul
    // Notariate si cu testimonialul de pe start): arhiva biroului se preia cu proces-verbal si se
    // scaneaza, raspunsul vine din copia scanata, iar originalul se aduce din depozit la cerere.
    // Nicio fraza de aici nu spune ca originalele raman in birou.
    fraza:
      "Registrele au zeci de ani, iar duplicatele se cer mereu în grabă. Cu 3S, arhiva se preia cu proces-verbal și se scanează: actul apare după numele părților, iar originalul vine la cerere.",
    durere: "Banca cere azi copia unei donații din 2018, iar registrul acelui an e în subsol.",
    concluzie: "Donația din 2018 apare pe ecran pe loc, fără drum până în subsol.",
    obiect: {
      substituent: "Căutați după numele părților",
      cautare: "Vasilescu Ioan",
      // A TREIA COLOANA are rolul fisei (§7.8): termenul de pastrare al fiecarui act, calculat
      // dupa categorie (`acasa-termene-calculate`). Se arata POZITIA din nomenclator, nu un an:
      // registrul de pe main (`notari-termen-pastrare-lipsa`) nu admite pe site un termen in ani
      // pentru actele notariale, fiindca nu il putem cita pe articol. Pozitiile sunt de exemplu.
      randuri: [
        { numar: "2018/0412", parti: "Donație · Vasilescu Ioan", pastrare: "păstrare după nomenclator, poz. 12" },
        { numar: "2022/0931", parti: "Partaj · Dobre, Ilie", pastrare: "păstrare după nomenclator, poz. 15" },
        { numar: "2025/0317", parti: "Testament autentic · Enache Maria", pastrare: "păstrare după nomenclator, poz. 9" },
      ],
      potrivit: 0,
      gasit: "Un singur act pe acest nume, din 2018, afișat pe loc",
    },
    benzi: [
      { declansator: "cerere de duplicat", actiune: "anunță depozitul care păstrează originalul", iconita: "persoana", laPas: 1 },
      { declansator: "încheiere de rectificare", actiune: "atașată la actul inițial", iconita: "lant", laPas: 3 },
    ],
    duel: {
      dosare: ["Donații", "Mandate", "Moșteniri", "Declarații", "Partaje"],
      fisiere: [
        { sablon: "contract_donație_{n}.pdf", start: 412 },
        { sablon: "mandat_{n}.pdf", start: 1107 },
        { sablon: "dosar_moștenire_{n}.pdf", start: 86 },
        { sablon: "declarație_{n}.pdf", start: 230 },
        { sablon: "act_partaj_{n}.pdf", start: 519 },
      ],
      tipuri: ["Donație", "Mandat", "Moștenire", "Declarație", "Partaj"],
      stres: ["Registrul vechi e în arhiva din subsol", "Duplicatul trebuie dat până la prânz", "Registrul pe 2016 e la legătorie"],
      termeneRatate: [
        "Termen ratat: inventarul registrelor",
        "Termen ratat: duplicatul cerut ieri",
        "Termen ratat: copia pentru ipotecă",
      ],
      toast: "Depozitul a primit cererea",
    },
  },

  consultanta: {
    // Referinta: 118 / 67 / 90.
    fraza:
      "Rapoartele circulă în mai multe versiuni, iar semnăturile vin pe hârtie. În 3S, fiecare versiune stă lângă semnătura ei.",
    durere: "Ați predat diagnoza acum nouă zile și tot n-o puteți factura.",
    concluzie: "Acordul semnat stă lângă diagnoza pe care o confirmă, iar încasarea pornește din aceeași zi.",
    obiect: {
      nume: "Audit de procese pentru Mureșan",
      trimis: {
        nume: "Diagnoza inițială",
        meta: "predată pe 2 septembrie",
        fisier: "diagnoza_v3_final.pdf",
        asteptare: "lipsește semnătura clientului",
      },
      intors: { linie: "acceptată la 11.09.", propunere: "sugestie, de verificat" },
      factura: { nume: "Factura etapei", asteapta: "nu se emite fără acord scris", activa: "poate fi emisă" },
      stare: { nume: "acordul clientului", asteptare: "în așteptare", complet: "complet" },
    },
    benzi: [
      { declansator: "caiet de sarcini", actiune: "atașat la proiectul lui", iconita: "lant", laPas: 1 },
      { declansator: "raport de etapă", actiune: "anunță partenerul", iconita: "persoana", laPas: 2 },
      { declansator: "acord semnat", actiune: "alarmă dacă întârzie", iconita: "ceas", laPas: 5 },
    ],
    duel: {
      dosare: ["Acceptanțe", "Livrabile", "Încasări", "Propuneri", "Mandate"],
      fisiere: [
        { sablon: "acceptanță_{n}.pdf", start: 5 },
        { sablon: "raport_etapa_{n}.pdf", start: 2 },
        { sablon: "factură_C{n}.pdf", start: 301 },
        { sablon: "propunere_{n}.pdf", start: 27 },
        { sablon: "contract_consultanță_{n}.pdf", start: 14 },
      ],
      tipuri: ["Acceptanță", "Livrabil", "Încasare", "Propunere", "Mandat"],
      stres: ["Semnătura e pe o poză strâmbă", "Factura stă de o săptămână", "Acordul e într-un e-mail vechi"],
      termeneRatate: [
        "Termen ratat: livrarea etapei 2",
        "Termen ratat: ședința de progres",
        "Termen ratat: semnarea acceptanței",
      ],
      toast: "Partenerul a primit raportul",
    },
  },
};

/** Benzile de pe ecran pentru o industrie: banda canalelor (daca exista) plus cele ale scenei. */
export function benziPeEcran(cod: CodIndustrie, canale: readonly CodCanal[] | null): Banda[] {
  const proprii = SCENARII[cod].benzi;
  const banda = canale ? bandaCanalelor(canale) : null;
  return banda ? [banda, ...proprii] : [...proprii];
}

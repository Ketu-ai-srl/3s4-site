// Textele paginii /functionalitati/aplicatie-mobila (fisa functionalitati__aplicatie-mobila.md; sablonul
// cinema). Scrise de noi din faptele 3S (plan D4b, D4c), pe FUNCTIA fiecarui bloc si pe lungimea din fisa
// (plan D1b): alta imagine (torpedoul, curtea clientului), alte etichete, alte ore si alte durate decat
// referinta.
//
// CE SPUNE PAGINA E CE ARE 3S: aplicatia exista pe toate platformele (D4c), face din fotografia unui act o
// scanare curata si il trimite in dosarul lui; biroul il vede in arhiva. NU se promite o durata ("30 de
// secunde") si nici "zero documente pierdute" (fisa S6, "Atentie D4"); pe "Acum" metricile sunt calitative.
// Numele platformelor se scriu generic (telefon, tableta, calculator, browser), fara marci.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9, D11): ziua agentului, orele, duratele, clientul (Gama
// Exemplu), numarul avizului si agentul ("Agent 07") sunt inventate.

export const CALE_APLICATIE_MOBILA = "/functionalitati/aplicatie-mobila";

export const META_APLICATIE_MOBILA = {
  titlu: "Aplicația 3S pe telefon: actele pleacă din teren | 3S",
  descriere:
    "Fotografiați avizul la client, puneți etichetele și trimiteți-l: actul ajunge în dosarul lui, iar biroul lucrează pe el fără hârtii duse înapoi.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02). */
export const INTREBARE_PAGINA_MOBILA = "Cum ajunge un aviz semnat la client în arhiva firmei, fără drum la birou?";

// ---------------------------------------------------------------------------------------------
// S0 - eroul.
// ---------------------------------------------------------------------------------------------

export const EROU_MOBILA = {
  eticheta: "Funcționalitate 05 · Arhiva pe telefon",
  // Rol: titlul, 1 rand (72/600).
  titlu: "Teren, nu birou.",
  // Rol: cererea din terminal (~51 de caractere).
  cerere: "Trimite avizul semnat de Gama Exemplu la contabilitate",
  // Rol: subtitlul italic, 1 rand (~43).
  subtitlu: "Fotografia pleacă înainte să pornească mașina.",
  indiciu: "derulați",
} as const;

// ---------------------------------------------------------------------------------------------
// S1 - ziua de lucru pe teren (fisa S1): contorul si cardul zilei cu 8 segmente.
// ---------------------------------------------------------------------------------------------

export type FelSegment = "client" | "acte" | "pierdut";
export type Segment = { fel: FelSegment; eticheta: string; durata: string };

export const ZIUA = {
  titlu: "O zi obișnuită pe drum.",
  paragraf:
    "Hârtiile stau în torpedou până seara. Cine a fost pe teren le predă, cine a rămas la birou le tastează, iar factura așteaptă după amândoi.",
  // Contorul: eticheta, valoarea (suma segmentelor "acte") si lantul cauzei.
  contorEticheta: "Zi dusă pe acte",
  contorValoare: "3h 35m",
  lant: ["torpedou", "predare", "tastare"] as const,
  // Cardul.
  titluCard: "Ziua unui agent de teren",
  subtitluCard: "zi inventată, trei opriri la clienți",
  // 8 segmente; latimile lor urmeaza duratele (610 minute, 06:50-17:00; mijlocul barei la 11:55).
  segmente: [
    { fel: "acte", eticheta: "Avize", durata: "40m" },
    { fel: "client", eticheta: "Client A", durata: "1h 55m" },
    { fel: "pierdut", eticheta: "Rampă", durata: "50m" },
    { fel: "client", eticheta: "Client B", durata: "1h 30m" },
    { fel: "acte", eticheta: "Note", durata: "40m" },
    { fel: "client", eticheta: "Client C", durata: "2h 20m" },
    { fel: "acte", eticheta: "Predare", durata: "1h 10m" },
    { fel: "acte", eticheta: "Tastare", durata: "1h 05m" },
  ] as readonly Segment[],
  ore: ["06:50", "11:55", "17:00"] as const,
  statistici: [
    { fel: "client", eticheta: "La clienți", valoare: "5h 45m" },
    { fel: "acte", eticheta: "Pe acte și drum", valoare: "3h 35m" },
    { fel: "pierdut", eticheta: "La rampă", valoare: "50m" },
  ] as readonly { fel: FelSegment; eticheta: string; valoare: string }[],
  declaratie: "Exemplu cu date fictive: ziua unui agent de teren, cu trei clienți, o coadă la rampă și timpul dus pe hârtii",
} as const;

/** Minutele unei durate scrise "1h 35m" / "55m". */
export function minuteDin(durata: string): number {
  const ore = /(\d+)h/.exec(durata);
  const min = /(\d+)m/.exec(durata);
  return (ore ? Number(ore[1]) * 60 : 0) + (min ? Number(min[1]) : 0);
}

// ---------------------------------------------------------------------------------------------
// S2 - anxietatea, S3 - pivotul.
// ---------------------------------------------------------------------------------------------

export const ANXIETATE_MOBILA = {
  randuri: ["Avizul a rămas în mașina colegului?", "Clientul sună să întrebe de factură?"] as const,
  emfaza: "Factura nu pleacă până nu vine hârtia.",
} as const;

export const PIVOT_MOBILA = {
  intrebare: "Și dacă actul ar intra în arhivă chiar la client?",
  emfaza: "Hârtia rămâne la client, actul vine la voi.",
  linie: "Pentru asta există aplicația 3S.",
} as const;

// ---------------------------------------------------------------------------------------------
// S4 - telefonul cu trei ecrane (fisa S4).
// ---------------------------------------------------------------------------------------------

export const TELEFON = {
  titlu: "Trei atingeri, gata.",
  paragraf: "Nicio hârtie nu mai urcă în mașină: actul pleacă de pe loc.",
  aplicatie: "3S",
  ora: "11:20",
  document: "aviz_0412_gama.pdf",
  ecrane: [
    { numar: "01", nume: "Fotografiază", legenda: "din poză iese o scanare curată" },
    { numar: "02", nume: "Etichetează", legenda: "pentru cine, ce, unde și când" },
    { numar: "03", nume: "Trimite", legenda: "apare în dosarul clientului" },
  ] as const,
  // Etichetele ecranului 2: firma, starea, locul si ora, agentul.
  etichete: { firma: "Gama Exemplu", stare: "predat", loc: "Depozit 2 · 11:20", persoana: "Agent 07" },
  // Ecranul 3.
  destinatie: "dosarul Gama Exemplu",
  exemplu: "exemplu",
  marca: "2026-04-14 11:21:07",
  declaratie: "Exemplu cu date fictive: aplicația 3S pe telefon, în trei pași, cu avizul unui client",
} as const;

/** Durata unui ecran in ciclu, in ms (fisa S4: 3,5 s). */
export const ECRAN_MS = 3500;

// ---------------------------------------------------------------------------------------------
// S5 - teren -> birou (fisa S5).
// ---------------------------------------------------------------------------------------------

export const SINCRONIZARE = {
  titlu: "Etichetele puse pe teren fac ordinea la birou.",
  paragraf: "Clientul, felul actului și luna, alese pe telefon, așază avizul în dosarul potrivit. Contabila îl găsește acolo.",
  teren: { ora: "Teren · 3 etichete", actiune: "Agentul alege clientul și felul actului" },
  exemplu: "exemplu",
  birou: { ora: "Birou · dosarul Gama", document: "aviz_0412_gama.pdf", marca: "Gama Exemplu / aviz / aprilie", actiune: "Contabila îl găsește în dosar" },
  declaratie: "Exemplu cu date fictive: etichetele puse pe telefonul agentului și dosarul în care ajunge avizul la birou",
} as const;

// ---------------------------------------------------------------------------------------------
// S6 - contrastul, varianta cu machete.
// ---------------------------------------------------------------------------------------------

export const CONTRAST_MOBILA = {
  titlu: "Ce rămâne din zi",
  inainte: {
    titlu: "Înainte",
    subtitlu: "hârtie în torpedou",
    antet: "AVIZ 0412",
    exemplu: "exemplu",
    loc: "La client",
    avertisment: "tastat abia seara",
    declaratie: "Exemplu cu date fictive: un aviz de hârtie semnat la client",
    metrici: [
      { valoare: "3h 35m", cheie: "Timp pe acte" },
      { valoare: "zilnic", cheie: "Drumuri la birou", calitativ: "rau" },
      { valoare: "a doua zi", cheie: "Factura pleacă", calitativ: "rau" },
      { valoare: "în torpedou", cheie: "Originalul", calitativ: "rau" },
    ],
  },
  acum: {
    titlu: "Acum",
    subtitlu: "telefonul agentului",
    aplicatie: "3S",
    ora: "11:21",
    document: "aviz_0412_gama.pdf",
    pasi: ["Fotografiat", "Etichetat", "Trimis"] as const,
    loc: "Pe teren",
    confirmare: "în dosar, la birou",
    declaratie: "Exemplu cu date fictive: aplicația 3S cu avizul trimis",
    metrici: [
      { valoare: "3 atingeri", cheie: "Timp pe acte" },
      { valoare: "niciunul", cheie: "Drumuri la birou", calitativ: "bun" },
      { valoare: "în aceeași zi", cheie: "Factura pleacă", calitativ: "bun" },
      { valoare: "în arhivă", cheie: "Originalul", calitativ: "bun" },
    ],
  },
} as const;

// ---------------------------------------------------------------------------------------------
// S7 - CTA final.
// ---------------------------------------------------------------------------------------------

export const CTA_MOBILA = {
  titlu: "Actele ajung la birou fără voi.",
  paragraf:
    "Instalați aplicația pe telefoanele echipei. Fiecare aviz fotografiat la client e etichetat, trimis și pus în dosarul lui, iar biroul lucrează pe el imediat.",
  buton: "Deschideți un cont",
  nota: "Pe telefon, tabletă, calculator și în browser; 0 RON azi.",
} as const;

export const FIR_APLICATIE_MOBILA = [
  { nume: "Acasă", cale: "/" },
  { nume: "Arhiva pe telefon", cale: CALE_APLICATIE_MOBILA },
] as const;

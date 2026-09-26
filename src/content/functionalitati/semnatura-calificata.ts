// Textele paginii /functionalitati/semnatura-calificata (fisa functionalitati__semnatura-calificata.md;
// sablonul cinema). Scrise de noi pe FUNCTIA fiecarui bloc si pe lungimea din fisa (plan D1b).
//
// SEMNATURA CALIFICATA NU E DISPONIBILA AZI IN 3S (plan D4c: "in proces cu toate"). Pagina exista identic
// ca forma, dar ORIUNDE referinta promite semnarea, textul de aici spune "integrare in curs cu furnizorii
// acreditati". Machetele sunt previzualizari declarate (bara fiecarei ferestre o spune, vizibil), iar
// starile lor nu spun "semnat prin 3S": lotul se "pregateste", re-semnarea e "in curs de integrare".
// Ce e adevarat azi si se spune: 3S arhiveaza si cauta actele semnate pe hartie sau cu alte unelte si tine
// termenele actelor in registrul arhivei (afirmatia `acasa-functii-in-productie`).
//
// FAPTE JURIDICE, verificate la sursa primara in sesiunea de constructie (EUR-Lex, textul in romana al
// Regulamentului (UE) nr. 910/2014, citit pe 2026-09-25): art. 3 pct. 12 (semnatura calificata = semnatura
// avansata creata cu un dispozitiv calificat si bazata pe un certificat calificat) si art. 25 alin. (2)
// (efect juridic echivalent cu al semnaturii olografe). Legatura sta langa valoare, in `NOTA_LEGALA`.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9, D11): semnatarul, firmele, fisierele, numarul de serie,
// orele si zilele sunt inventate; amprenta e SHA-256 real al unui sir demonstrativ, fara valoare juridica.
// Niciun emitent de certificate real nu e numit.

export const CALE_SEMNATURA = "/functionalitati/semnatura-calificata";

export const META_SEMNATURA = {
  titlu: "Semnătura electronică calificată în 3S: integrare în curs | 3S",
  descriere:
    "Integrarea 3S cu furnizorii acreditați de semnătură calificată e în curs. Până atunci, actele semnate se arhivează și se caută în 3S.",
} as const;

/** Declaratia de raspuns a paginii (G-AI-02). */
export const INTREBARE_PAGINA_SEMNATURA = "Se poate semna calificat prin 3S?";

/** Formularea impusa de decizia D4c, oriunde referinta promite semnarea. */
export const IN_CURS = "integrare în curs cu furnizorii acreditați";

// ---------------------------------------------------------------------------------------------
// S0 - eroul.
// ---------------------------------------------------------------------------------------------

export const EROU_SEMNATURA = {
  eticheta: "Funcționalitate 03 · Semnătura calificată",
  // Rol: titlul, 1 rand.
  titlu: "O semnătură lentă",
  // Rol: cererea din terminal (~53).
  cerere: "Contractul cu Alfa Exemplu trebuie semnat până vineri",
  // Rol: subtitlul italic (~41).
  subtitlu: "Vineri e la șapte drumuri de hârtie distanță.",
  indiciu: "derulează",
} as const;

// ---------------------------------------------------------------------------------------------
// S1 - drumul hartiei in 7 pasi, cu contorul de zile (fisa S1).
// ---------------------------------------------------------------------------------------------

export type IconitaPas = "imprimanta" | "stilou" | "scaner" | "plic" | "ceas" | "intoarcere" | "retur";
export type PasHartie = { eticheta: string; cost: string; iconita: IconitaPas };

/** Zilele adunate de cei 7 pasi (30 + 18 + 36 + 36 ore = 120 ore; minutele nu schimba ziua): contorul urca
 * de la 0 la atat, liniar cu progresul. */
export const ZILE_TOTAL = 5;

export const DRUM = {
  titlu: "Cât drum face o semnătură",
  paragraf: "Pe hârtie, fiecare semnătură cere un drum dus și unul întors. Zilele nu se văd pe loc, doar la capăt.",
  contorEticheta: "Zile pe drum",
  unitate: "zile",
  pasi: [
    { eticheta: "Contractul vine prin curier", cost: "+30 de ore", iconita: "plic" },
    { eticheta: "Plicul stă la recepție", cost: "+18 ore", iconita: "ceas" },
    { eticheta: "Juristul cere o corectură", cost: "+36 de ore", iconita: "intoarcere" },
    { eticheta: "Pagina 3 se retipărește", cost: "+10 min", iconita: "imprimanta" },
    { eticheta: "Semnătură pe fiecare pagină", cost: "de mână", iconita: "stilou" },
    { eticheta: "O copie scanată, pentru dosar", cost: "+20 min", iconita: "scaner" },
    { eticheta: "Curierul duce originalul înapoi", cost: "+36 de ore", iconita: "retur" },
  ] as readonly PasHartie[],
  declaratie: "Exemplu: drumul unui contract semnat pe hârtie, pas cu pas, cu timpul adunat",
} as const;

/** Contorul la progresul p: ZILE_TOTAL x p; sub 1 un intreg, de la 1 cu o zecimala, cu virgula. */
export function zileLa(p: number): string {
  const z = ZILE_TOTAL * Math.min(1, Math.max(0, p));
  if (z < 1) return String(Math.round(z));
  return z.toFixed(1).replace(".", ",");
}

// ---------------------------------------------------------------------------------------------
// S2 - anxietatea, S3 - pivotul.
// ---------------------------------------------------------------------------------------------

export const ANXIETATE_SEMNATURA = {
  randuri: ["Clientul a trimis înapoi pagina 3 sau pagina 4?", "Exemplarul semnat e în mail, în dosar sau la curier?"] as const,
  emfaza: "O poză a semnăturii nu arată cine a semnat.",
} as const;

export const PIVOT_SEMNATURA = {
  intrebare: "Și dacă n-ar mai exista un exemplar de hârtie?",
  emfaza: "Semnătura stă în fișier, nu pe o foaie.",
  linie: "Semnătura calificată în 3S: " + IN_CURS + ".",
} as const;

// ---------------------------------------------------------------------------------------------
// S4 - ce contine o semnatura calificata (fisa S4): cardul-sigiliu si nota legala.
// ---------------------------------------------------------------------------------------------

export const AMPRENTA = "3cd8ef3cf068b8eb03da862ee8312ce8202ced723194d83c9928de8dbd47182a";

export const SIGILIU = {
  titlu: "Ce poartă o semnătură calificată",
  paragraf:
    "Certificatul calificat leagă semnătura de om, iar amprenta fișierului arată orice modificare ulterioară.",
  fisier: "contract_service_alfa.pdf",
  stareBara: "exemplu",
  initiala: "S",
  semnatar: "Semnatar Exemplu",
  functie: "administrator, Alfa Exemplu SRL",
  randuri: {
    serie: { cheie: "Număr de serie", valoare: "5e:0b:91:3c:a7:12:d4:88:0f:6a:e3:21" },
    amprenta: { cheie: "Amprenta SHA-256" },
    emitent: { cheie: "Emitent", valoare: "prestator calificat, ales la integrare" },
    marca: { cheie: "Marcă temporală", valoare: "2026-04-14 11:21:07 UTC+3" },
    stare: { cheie: "În 3S", valoare: "semnare: " + IN_CURS },
  },
  declaratie:
    "Exemplu cu date fictive: câmpurile unei semnături electronice calificate; semnarea calificată prin 3S e o integrare în curs",
} as const;

/** Nota legala de sub card, cu sursa primara langa ea: textul preluat din actul citat, la 2026-09-25. */
export const NOTA_LEGALA = {
  text: "Semnătura electronică calificată are efectul juridic echivalent al semnăturii olografe: Regulamentul (UE) nr. 910/2014, art. 25 alin. (2).",
  sursa: "https://eur-lex.europa.eu/legal-content/RO/TXT/HTML/?uri=CELEX:32014R0910",
  citit: "2026-09-25",
} as const;

/** Numarul de caractere ale amprentei scrise la progresul p (fisa S4): floor(64 (p - 0,15) / 0,45). */
export function caractereAmprenta(p: number): number {
  return Math.max(0, Math.min(64, Math.floor((64 * (p - 0.15)) / 0.45)));
}

// ---------------------------------------------------------------------------------------------
// S5 - lotul (fisa S5): fereastra cu file, lista de acte si secventa la prag.
// ---------------------------------------------------------------------------------------------

export type FilaLot = { eticheta: string; descriere: string; iconita: "contract" | "factura" | "proces" };

export const LOT = {
  titlu: "Mai multe acte, o singură semnare",
  paragraf:
    "Integrarea în curs e gândită pe lot: bifezi contractele, facturile și procesele-verbale gata de semnat, iar semnarea calificată se face pentru toate deodată.",
  aplicatie: "3S · previzualizare",
  // Scurt, ca bara sa incapa pe un rand la 390; formularea intreaga D4c e in nota de sub fereastra.
  dreapta: "integrare în curs",
  exemplu: "exemplu",
  file: [
    { eticheta: "Facturi", descriere: "emise luna asta", iconita: "factura" },
    { eticheta: "Contracte", descriere: "cu anexele lor", iconita: "contract" },
    { eticheta: "Procese-verbale", descriere: "predare, recepție", iconita: "proces" },
  ] as readonly FilaLot[],
  bifate: "Bifate",
  acte: ["contract_service_alfa.pdf", "anexa_2_beta.pdf", "factura_0412_gama.pdf", "pv_predare_alfa.pdf", "act_aditional_beta.pdf"] as const,
  restul: 13,
  stareInitiala: "în așteptare",
  stareFinala: "în lot",
  butonInitial: "Pregătește lotul",
  butonLucru: "Pregătesc",
  butonFinal: "gata de semnat",
  statistici: [
    { cheie: "Acte", valoare: "18" },
    { cheie: "Tipărite", valoare: "0" },
    { cheie: "Scanate", valoare: "0" },
  ] as const,
  nota: "Semnarea calificată în 3S: " + IN_CURS + ".",
  declaratie: "Exemplu cu date fictive: previzualizarea unui lot de 18 acte; semnarea calificată e o integrare în curs",
} as const;

/** Totalul lotului: cele 5 vizibile plus restul. */
export const TOTAL_LOT = LOT.acte.length + LOT.restul;
/** Pasul secventei, in ms pe act (fisa S5: ~165 ms, 23 de pasi in 3,82 s). */
export const PAS_LOT_MS = 165;
/** Pragul care porneste secventa, o singura data (fisa S5: ~0,25). */
export const PRAG_LOT = 0.25;

// ---------------------------------------------------------------------------------------------
// S6 - termenele certificatelor (fisa S6).
// ---------------------------------------------------------------------------------------------

export type Gravitate = "urgent" | "atentie";

export const TERMENE = {
  eticheta: "Termenele certificatelor",
  titlu: "Și semnăturile au o dată-limită",
  paragraf:
    "Certificatul unui semnatar are o valabilitate limitată. Termenele actelor stau deja în registrul arhivei 3S; integrarea în curs cu furnizorii acreditați adaugă data certificatului, ca actele atinse să apară din timp.",
  modul: "certificate",
  interval: "termene apropiate",
  exemplu: "exemplu",
  banda: [
    { cheie: "Acte urmărite", valoare: "9", fel: "numar" },
    { cheie: "Certificatul firmei", valoare: "valabil încă 8 luni", fel: "text" },
    { cheie: "Furnizor", valoare: "acreditat, în integrare", fel: "mono" },
  ] as const,
  randuri: [
    { fisier: "contract_service_alfa.pdf", zile: "9 zile", gravitate: "urgent", eticheta: "Urgent" },
    { fisier: "anexa_2_beta.pdf", zile: "26 de zile", gravitate: "atentie", eticheta: "Atenție" },
    { fisier: "pv_predare_gama.pdf", zile: "41 de zile", gravitate: "atentie", eticheta: "Atenție" },
  ] as readonly { fisier: string; zile: string; gravitate: Gravitate; eticheta: string }[],
  nota: "Datele sunt un exemplu. Termenele actelor se țin azi în registrul arhivei 3S; semnarea calificată din nou vine odată cu integrarea cu furnizorii acreditați.",
  buton: "Semnare din nou: integrare în curs",
  declaratie: "Exemplu cu date fictive: registrul termenelor de certificat, cu trei acte aproape de expirare",
} as const;

// ---------------------------------------------------------------------------------------------
// S7 - contrastul (varianta svg).
// ---------------------------------------------------------------------------------------------

export const CONTRAST_SEMNATURA = {
  titlu: "Cinci zile de curier, apoi niciuna",
  paragraf:
    "Pe hârtie, contractul face două drumuri cu curierul și stă la fiecare birou. Cu semnătura calificată, originalul e chiar fișierul; în 3S, integrarea cu furnizorii acreditați e în curs.",
  inainte: {
    titlu: "Înainte",
    subtitlu: "hârtie dus-întors",
    stampila: "fără original",
    eticheta: "RETUR",
    declaratie: "Desen: o foaie semnată de mână, cu ștampila unei copii și șapte pași pe dedesubt",
    metrici: [
      { valoare: "5 zile", cheie: "Pe drum" },
      { valoare: "2", cheie: "Curieri" },
      { valoare: "3", cheie: "Exemplare" },
      { valoare: "PDF din scaner", cheie: "În dosar", calitativ: "rau" },
    ],
  },
  // Coloana a doua NU e starea de azi (D4c): titlul, subtitlul, stampila de pe desen si prima metrica spun ca
  // semnarea calificata prin 3S e o integrare in curs.
  acum: {
    titlu: "După integrare",
    subtitlu: IN_CURS,
    stampila: "INTEGRARE ÎN CURS",
    emitent: "prestator calificat",
    amprenta: "SHA-256 · 3cd8ef...182a",
    marca: "2026-04-14 · 11:21:07",
    declaratie: "Desen: același document, cu locul sigiliului calificat și ștampila: integrare în curs cu furnizorii acreditați",
    metrici: [
      { valoare: "în curs", cheie: "Integrare", calitativ: "neutru" },
      { valoare: "0", cheie: "Curieri" },
      { valoare: "0", cheie: "Exemplare" },
      { valoare: "fișierul semnat", cheie: "În dosar", calitativ: "bun" },
    ],
  },
  punte: "hârtie · fișier",
} as const;

// ---------------------------------------------------------------------------------------------
// S8 - CTA final.
// ---------------------------------------------------------------------------------------------

export const CTA_SEMNATURA = {
  titlu: "Semnătura calificată vine în 3S",
  paragraf:
    "Integrarea cu furnizorii acreditați e în curs. Până atunci, actele semnate de mână sau cu alte unelte se arhivează și se caută în 3S.",
  buton: "Testează gratuit",
  nota: "Contul e gratuit azi, la 0 RON, și nu cere card.",
} as const;

export const FIR_SEMNATURA = [
  { nume: "Acasă", cale: "/" },
  { nume: "Semnătura calificată", cale: CALE_SEMNATURA },
] as const;

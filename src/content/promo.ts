// Textele si datele celor doua pagini promo: `/promo` si `/promo/scanare-cu-telefonul` (fisele promo.md si
// promo__scanare-cu-telefonul.md, sablonul "cinema-promo" din COMPONENTE.md §3).
//
// SCRISE DE NOI, din faptele 3S (plan D1b, regula stransa pe 25.09): registrul de afirmatii, deciziile
// D4-D4c si §6-§7 ale planului. Fisa da FUNCTIA fiecarui bloc (problema, solutia, un card-macheta cu titlu
// si paragraf, testimonialul, contoarele, CTA-ul) si lungimea lui; ideile, exemplele, etichetele si cifrele
// sunt ale noastre. Comentariile `// Rol:` descriu rolul abstract al blocului, nu fraza referintei.
//
// CIFRELE (plan §6.3, D5): nicio cifra de tractiune, client sau recenzie. Contoarele si cardul de cifre
// poarta numai fapte din registru: pretul de azi (0 RON), integrarile numarate din afirmatia confirmata
// (10, cu WhatsApp), regiunea de gazduire (una, Germania), criptarea (AES-256, TLS 1.2+).
//
// TESTIMONIALUL pastreaza forma (ghilimeaua, fraza italica, atribuirea), fara persoana si fara citat: e
// declaratia marcii 3S despre produs (D4b). Nu se atribuie firmei-mame: decizia D10 (25.09) scoate numele
// ei de pe site, inclusiv din atribuiri.
//
// DATE FICTIVE, DECLARATE CA EXEMPLU (plan D9, D11): firmele si persoanele poarta cuvantul "Exemplu",
// numerele de document, sumele si orele sunt inventate, iar pe fiecare macheta scrie vizibil "exemplu".
// Codul fiscal de pe bon are cifra de control GRESITA, deci nu poate fi al nimanui (proba
// `tests/promo.test.ts`). Totalul bonului e suma articolelor (defect al referintei, corectat).

export const CALE_PROMO = "/promo";
export const CALE_PROMO_SCANARE = "/promo/scanare-cu-telefonul";

export const META_PROMO = {
  titlu: "Actele firmei într-o arhivă care răspunde | 3S",
  descriere:
    "3S strânge actele firmei într-o singură arhivă, le așază în dosare și vă răspunde pe web sau pe WhatsApp cu documentul și pagina. Azi costă 0 RON.",
} as const;

export const META_SCANARE = {
  titlu: "Bonuri scanate cu telefonul, direct în dosar | 3S",
  descriere:
    "Bonurile fotografiate cu aplicația 3S intră în arhiva firmei, criptate, pe servere din Germania, și se găsesc apoi întrebând pe web sau pe WhatsApp.",
} as const;

export const FIR_PROMO = [
  { nume: "Acasă", cale: "/" },
  { nume: "Arhiva care răspunde", cale: CALE_PROMO },
] as const;

export const FIR_SCANARE = [
  { nume: "Acasă", cale: "/" },
  { nume: "Arhiva care răspunde", cale: CALE_PROMO },
  { nume: "Bonuri scanate cu telefonul", cale: CALE_PROMO_SCANARE },
] as const;

/** Eticheta vizibila de pe machete (plan D11): datele arata a firma reala, deci se spune ca sunt exemplu. */
export const ETICHETA_EXEMPLU = "exemplu";

// =============================================================================================
// /promo
// =============================================================================================

export type TitluCuAccent = {
  /** Partea de dinaintea ruperii de rand, `ardezie-1`. */
  inainte: string;
  /** Partea de dupa ruperea de rand, in culoarea de accent a paginii. */
  accent: string;
};

export const EROU_PROMO = {
  // Rol: eticheta scurta de deasupra titlului (13,6/600). Referinta: ~20 de caractere.
  eticheta: "O dimineață oarecare",
  // Rol: titlul mare, 4 randuri: situatia (alb) si problema (rosu-deschis).
  titlu: {
    inainte: "Mâine vine inspecția fiscală.",
    accent: "Contractul semnat e pe undeva.",
  } satisfies TitluCuAccent,
  // Rol: paragraful de sub titlu, 2 randuri.
  paragraf: "Colegul care l-a scanat e în concediu, iar căutarea prin e-mail dă sute de rezultate, niciunul cel bun.",
  indiciu: "Derulați",
} as const;

export type NumeIconitaHaos = "dosare" | "poza" | "atasament" | "cutie" | "laptop";

export const HAOS = {
  // Rol: 5 iconite, cate una pe fiecare loc numit in titlu, in aceeasi ordine.
  iconite: ["dosare", "poza", "atasament", "cutie", "laptop"] as NumeIconitaHaos[],
  // Rol: titlul mare cu locurile in care stau actele; ruperea de rand dupa al treilea.
  titlu: {
    randul1: "Dosare. Poze. Mailuri.",
    randul2: "Cutii. Laptopuri.",
  },
  // Rol: paragraful mare, 2 randuri: de ce haosul se repeta.
  paragraf:
    "Fiecare coleg ține actele unde i se pare lui logic. Când pleacă cineva din firmă, pleacă odată cu el și harta lor.",
  // Rol: trei cuvinte-problema cu cate o eticheta scurta; al treilea in rosu-deschis.
  statistici: [
    { valoare: "Copii", eticheta: "aceeași factură în trei variante", rosu: false },
    { valoare: "Semnături", eticheta: "puse pe varianta greșită", rosu: false },
    { valoare: "Termene", eticheta: "ratate fără să observe nimeni", rosu: true },
  ],
} as const;

export const SOLUTIE = {
  // Rol: titlul mare al solutiei: subiectul (alb, 2 randuri), apoi predicatul in albastru.
  titlu: {
    inainte: "3S adună actele firmei într-o singură arhivă",
    accent: "care vă răspunde.",
  } satisfies TitluCuAccent,
  // Rol: paragraful mare, 2 randuri: ce face produsul.
  paragraf:
    "Hârtia se scanează, fiecare act e citit și pus în dosarul lui. Întrebați pe web sau pe WhatsApp.",
} as const;

export const PRIMIRE = {
  rama: "3S · primire",
  // Rol: indemnul din zona de depunere.
  depunere: "Lăsați actul aici sau fotografiați-l",
  fisier: "contract_chirie_beta_exemplu.pdf",
  // Rol: unde l-a asezat clasarea automata (tip si dosar).
  traseu: "contract · Beta Exemplu / Contracte",
  // Rol: titlul cardului, 1 rand.
  titlu: "Actul nou își găsește singur dosarul.",
  // Rol: paragraful cardului, 1 rand.
  paragraf: "Contractul merge la contracte, factura la luna ei.",
} as const;

export type RezultatCautare = { fisier: string; eticheta: string; ton: "rosu" | "verde"; stins?: boolean };

export const CAUTARE = {
  rama: "3S · căutare",
  // Rol: intrebarea scrisa litera cu litera in camp (~37 ms pe caracter).
  intrebare: "contracte care expiră în octombrie",
  rezultate: [
    { fisier: "contract_mentenanta_alfa.pdf", eticheta: "expiră 14.10", ton: "rosu" },
    { fisier: "contract_chirie_gama.pdf", eticheta: "expiră 30.10", ton: "rosu" },
    { fisier: "contract_curatenie_beta.pdf", eticheta: "prelungit", ton: "verde", stins: true },
  ] as RezultatCautare[],
  // Rol: titlul cardului, 2 randuri.
  titlu: "Scrieți întrebarea cum v-ar veni s-o spuneți.",
  // Rol: paragraful cardului, 1 rand.
  paragraf: "Răspunsul vine cu documentul și cu pagina din care e luat.",
} as const;

export const AUTOMATIZARE = {
  rama: "3S · reguli",
  daca: { eticheta: "Dacă", valoare: "Intră o factură de la furnizor" },
  atunci: { eticheta: "Atunci", valoare: "Merge la aprobare, apoi la contabil" },
  jurnal: [
    { ora: "10:04", act: "Factură", rezultat: "aprobată de Ana Exemplu" },
    { ora: "10:31", act: "Factură", rezultat: "trimisă contabilului" },
  ],
  eticheteAuto: "auto",
  // Rol: titlul cardului, 1 rand.
  titlu: "Scrieți regula. 3S o ține minte.",
  // Rol: paragraful cardului, 1 rand.
  paragraf: "Fiecare pas al facturii rămâne în jurnal, cu ora lui.",
} as const;

export const SISTEM_NATIONAL = {
  rama: "3S · e-Factura",
  document: "FACT-EX-2026-0118",
  pasi: ["Emisă", "Trimisă"],
  // Rol: ultimul pas, "ok" (verde-deschis).
  final: "Primită în RO e-Factura",
  // Rol: titlul cardului, 2 randuri.
  titlu: "Facturile pleacă spre RO e-Factura din aceeași arhivă.",
  // Rol: paragraful cardului, 1 rand.
  paragraf: "Fără XML-uri descărcate ca să le urcați în altă parte.",
  /** Sursa primara a numelui sistemului national (ANAF, proiectele de digitalizare). */
  sursaSistem: "https://www.anaf.ro/anaf/internet/ANAF/despre_anaf/strategii_anaf/proiecte_digitalizare/e.factura/",
} as const;

export type Atribuire = { nume: string; rol: string };

export const DECLARATIE_PROMO = {
  // Rol: fraza mare a testimonialului, italica, 2 randuri. Aici o declaratie a marcii, nu un citat.
  fraza: "Arhiva, căutarea și regulile automate fac parte din produsul care rulează azi.",
  atribuire: { nume: "3S", rol: "declarația mărcii, septembrie 2026" } satisfies Atribuire,
} as const;

export type Contor = {
  /** Valoarea afisata; pentru contorul care numara, numarul final. */
  valoare: string;
  eticheta: string;
  /** Contorul care numara de la 0 (~1,8 s, easeOutCubic). */
  numara?: number;
};

export const CONTOARE: Contor[] = [
  // Rol: primul contor. Afirmatia acasa-pret-0-ron.
  { valoare: "0 RON", eticheta: "costă azi toate pachetele" },
  // Rol: contorul care numara. Integrarile din afirmatia acasa-integrari-si-whatsapp: Gmail, Outlook,
  // Google Workspace, Microsoft 365, SAP Business One, Peppol, Storecove, Claude, ChatGPT si WhatsApp.
  { valoare: "10", eticheta: "integrări, cu tot cu WhatsApp", numara: 10 },
  // Rol: al treilea contor, cu eticheta pe 2 randuri. Afirmatia acasa-gazduire-amazon-germania.
  { valoare: "1 regiune", eticheta: "în UE: serverele Amazon din Germania" },
];

export type TextCta = { titlu: TitluCuAccent; paragraf: string; buton: string; nota: string };

export const CTA_PROMO: TextCta = {
  // Rol: titlul CTA-ului, 2 randuri.
  titlu: { inainte: "Deschideți arhiva azi.", accent: "Costă 0 RON." },
  paragraf: "Aplicația 3S merge pe web și pe orice telefon al echipei.",
  buton: "Creați contul",
  nota: "Prețul de azi: 0 RON pentru toate pachetele",
};

// =============================================================================================
// /promo/scanare-cu-telefonul
// =============================================================================================

export const EROU_SCANARE = {
  // Rol: eticheta scurta (3 cuvinte).
  eticheta: "Bonuri, chitanțe, facturi",
  // Rol: titlul mare, 4 randuri: prima fraza alba, a doua in albastru-promo.
  titlu: {
    inainte: "Bonurile firmei, citite de pe telefon.",
    accent: "Și ordonate în arhivă pe luni.",
  } satisfies TitluCuAccent,
  // Rol: paragraful mare, 5 randuri; primul paragraf al paginii, deci raspunsul ei (30-80 de cuvinte).
  paragraf:
    "Bonul fotografiat cu aplicația 3S intră în arhiva comună a firmei, criptat, pe serverele Amazon din Germania. Oricine din echipă îl găsește apoi întrebând pe web sau pe WhatsApp, iar răspunsul vine cu documentul, nu cu o listă de fișiere de răsfoit.",
  indiciu: "Derulați",
} as const;

export const AFIRMATIE_SCANARE = {
  // Rol: titlul mare, 3 randuri, tot in albastru.
  titlu: "Fiecare coleg scanează de pe telefonul lui.",
  // Rol: paragraful mare, 3 randuri.
  paragraf:
    "Aceeași aplicație rulează pe toate platformele, iar ce fotografiază un coleg ajunge în arhiva comună. Poza devine o scanare curată, cu marginile îndreptate.",
} as const;

export type ArticolBon = { denumire: string; cantitate: number; pretBani: number };

/** Bonul fictiv din telefon. Sumele in bani, ca totalul sa fie suma exacta a articolelor. */
export const BON = {
  comerciant: "MAGAZIN EXEMPLU SRL",
  // Cod fiscal fictiv, cu cifra de control GRESITA (corpul 4819273 ar cere 3).
  codFiscal: "RO48192734",
  articole: [
    { denumire: "Hârtie A4", cantitate: 2, pretBani: 2450 },
    { denumire: "Toner", cantitate: 1, pretBani: 18990 },
    { denumire: "Dosare", cantitate: 3, pretBani: 420 },
  ] as ArticolBon[],
  numar: "BON 0042",
  data: "14.03.2026",
  ora: "18:05",
  plata: "numerar",
} as const;

/** Suma articolelor, in bani. */
export function totalBon(articole: readonly ArticolBon[] = BON.articole): number {
  return articole.reduce((s, a) => s + a.cantitate * a.pretBani, 0);
}

/** Bani -> "123,45" (virgula zecimala, punct la mii). */
export function formatBani(bani: number): string {
  const lei = Math.floor(bani / 100);
  const rest = String(bani % 100).padStart(2, "0");
  return lei.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + rest;
}

export const FISIER_BON = "bon_2026-03-14_magazin-exemplu.pdf";

export type RandCitit = { cheie: string; valoare: string };

/** Randurile de date citite din bon: cele 6 simple, in ordinea intarzierilor din fisa. */
export const DATE_CITITE: RandCitit[] = [
  { cheie: "Furnizor", valoare: BON.comerciant },
  { cheie: "Cod fiscal", valoare: BON.codFiscal },
  { cheie: "Total", valoare: formatBani(totalBon()) + " RON" },
  { cheie: "Data și ora", valoare: BON.data + " " + BON.ora },
  { cheie: "Nr. bon", valoare: BON.numar },
  { cheie: "Plată", valoare: BON.plata },
];

export const RAND_QR = {
  cheie: "Cod QR",
  stare: "pătat",
  // Rol: cipul verde de pe randul codului QR.
  cip: "nu e necesar",
} as const;

export const RAND_FISIER = {
  // Rol: cipul verde de pe randul fisierului.
  cip: "în dosarul lunii",
} as const;

export const CARD_SCANARE = {
  // Rol: titlul cardului, 1 rand.
  titlu: "Poza, făcută oriunde, devine date.",
  // Rol: paragraful cardului, 4 randuri.
  paragraf:
    "Din fotografie, 3S scoate furnizorul, codul fiscal, suma, data și numărul bonului, apoi pune fișierul în dosarul lunii. Chiar dacă bonul e mototolit sau decolorat, textul lui se citește și poate fi căutat.",
} as const;

export const CARD_OCR = {
  randuri: [
    { cheie: "Furnizor", valoare: "Magazin Exemplu" },
    { cheie: "Total", valoare: formatBani(totalBon()) + " RON" },
    { cheie: "Data", valoare: BON.data },
  ] as RandCitit[],
  // Rol: titlul cardului, 1 rand.
  titlu: "Fiecare aprobare lasă o urmă.",
  // Rol: paragraful cardului, 4 randuri.
  paragraf:
    "O regulă automată cere aprobarea șefului de echipă pentru bonurile peste o sumă aleasă de dumneavoastră. Cine a aprobat și la ce oră rămâne în jurnal, iar filtrul pe lună arată doar bonurile încă neaprobate.",
} as const;

export type CifraCard = { valoare: string; eticheta: string };

export const CARD_CIFRE = {
  // Rol: 3 cifre statice in albastru-promo; etichetele pe 4 / 3 / 2 randuri.
  cifre: [
    { valoare: "0 RON", eticheta: "costă azi toate pachetele 3S, cu aplicația de telefon cu tot" },
    { valoare: "AES-256", eticheta: "criptarea fișierelor pe disc" },
    { valoare: "TLS 1.2+", eticheta: "la transfer" },
  ] as CifraCard[],
  // Rol: titlul cardului, 1 rand.
  titlu: "Arhiva lunii se face cât lucrați.",
  // Rol: paragraful cardului, 4 randuri.
  paragraf:
    "Fișierele stau criptate pe serverele Amazon din Germania, într-o singură regiune a UE. Le găsiți apoi după furnizor sau după lună, iar toate pachetele, cu aplicația de telefon cu tot, costă azi 0 RON.",
} as const;

export const DECLARATIE_SCANARE = {
  fraza: "Aplicația de scanare pe telefon face parte din produsul de azi.",
  atribuire: { nume: "3S", rol: "declarația mărcii, septembrie 2026" } satisfies Atribuire,
  /** Initiala din cercul de 32 px. */
  initiala: "S",
} as const;

export const CTA_SCANARE = {
  titlu: "Fotografiați primul bon chiar azi.",
  paragraf: "Aplicația 3S merge pe web și pe orice telefon al echipei.",
  buton: "Creați contul",
  nota: "Prețul de azi: 0 RON pentru toate pachetele",
} as const;

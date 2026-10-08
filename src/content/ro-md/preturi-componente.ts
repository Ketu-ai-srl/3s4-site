// Continutul componentelor paginii de preturi pe editia `ro-MD` (P08, `/ro/preturi` pe 3s.md): aceleasi componente si
// aceeasi compunere ca pagina de preturi RO si ca perechea EN `/pricing` (decizia 53), cu textul in romana de business,
// la "tu", si sumele in EUR (decizia 54). Fiecare constanta e tipata pe contractul structural al componentei ei.
//
// SURSA TEXTULUI, pe camp: fisa paginii (ro-md/preturi.md), sectiunea "Textele componentelor (decizia 53)", cu cheia
// campului RO (de pilda `preturi.ts:100`) in comentariu. Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
// Abateri de la fisa, ca sa se vada: pilotul are 14 zile (decizia 65); legatura Enterprise duce la `/ro/enterprise`;
// domeniul cursorului de tarif e cel al perechii EN (5-100 EUR pe ora, pas 1, pornire 15), fiindca fisa il lasa
// nestabilit; biroul se monteaza fara demonstratia dispozitivelor (`faraDispozitive`), ca pe EN.
//
// CE NU INTRA, cu decizia: randurile WhatsApp (d49), portal si aplicatii (d43), AES si accesul pe persoana (d31),
// clasarea automata (val-ro-i2), nota "fara card" (legata de 0 RON), contorul de dispozitive (val-ro-1.1); in locul lor
// stau fapte confirmate, ca listele sa pastreze lungimea RO.
//
// LIMITELE PACHETELOR (deciziile 66-68, felia 129, oglinda lui 127 de pe `/pricing`): cifrele vin din
// `src/content/limite-planuri.ts`, singurul loc in care se schimba; aici stau numai unitatile in romana ("GB de stocare",
// "raspunsuri AI pe luna", "pagini OCR pe luna", "GB de descarcari pe luna"), cu punct la mii si cu "de" dupa
// regula numeralului; randul conturilor pastreaza textul aprobat ("conturi pentru echipa"). Cardurile pastreaza 9 randuri (limitele iau locul faptelor care raman in tabel),
// tabelul pastreaza 4 categorii si 14 randuri, in ordinea perechii EN, iar suplimentele, taxa de conectare si
// intrebarile despre limite stau in al treilea pliu (`SUPLIMENTE_RO_MD`). Textul se publica integral (decizia 69), fara
// "procesare" si fara documente procesate (decizia 66); pilotul, unde e numit in textul nou, are 14 zile (decizia 65).
//
// Modulul e numai date si functii pure: il importa invelitoarea client a preturilor /ro, deci nu aduce nimic din
// continutul RO (tipurile vin prin `import type`; regula numeralului vine din `limba.ts`, cifrele din `limite-planuri.ts`,
// amandoua fara continut).

import type { ContinutBirouConturi } from "@/components/preturi/BirouInteractivVedere";
import type { ContinutComutator } from "@/components/preturi/ComutatorPerioadaVedere";
import type { ContinutFaqPreturi } from "@/components/preturi/FaqPreturi";
import type { ContinutListaPdf } from "@/components/preturi/ListaPdfVedere";
import type { ContinutLiniaDeBaza } from "@/components/preturi/LiniaDeBaza";
import type { ContinutPliuri, ContinutSuplimente, RandSupliment } from "@/components/preturi/PliuriVedere";
import type { ContinutTabelPlanuri } from "@/components/preturi/TabelPlanuri";
import type { NivelFir } from "@/components/primitive/FirPagina";
import { cereDe } from "@/content/limba";
import {
  CONECTARE,
  LIMITE_PLANURI,
  PRAG_AVERTIZARE_PROCENT,
  RESURSE_SUPLIMENTE,
  SUPLIMENTE,
  VALABILITATE_SUPLIMENT_ZILE,
  type CheiePlanLimite,
  type ResursaSupliment,
} from "@/content/limite-planuri";
import type { Legatura } from "@/content/navigatie";
import type { CardPoarta, CategorieTabel, CelulaTabel, CheiePlan, Cursor, Plan, RandPlan } from "@/content/preturi";

/** Calea paginii, scrisa dupa gazda in ultima nota a listei ca PDF. */
export const CALE_PRETURI_RO_MD = "/ro/preturi";

/** Ancorele: aceleasi ca pe RO si pe EN, fiindca semnatura de forma compara id-urile sectiunilor. */
export const ANCORE_PRETURI_RO_MD = { pachete: "pachete", poarta: "alegere", intrebari: "pilot" } as const;

/** " de" cand numeralul o cere ("20 de colegi"), altfel nimic: aceeasi regula ca pe RO (`limba.ts`). */
export function cuDeRoMd(n: number): string {
  return cereDe(n) ? " de" : "";
}

/** O cifra in formatul romanesc: punct la mii ("1.000", "20.000"). */
export function miiRoMd(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Cifra urmata de unitate, cu "de" cand numeralul o cere: "80 de raspunsuri AI", "1.000 de pagini", "5 conturi". */
function cuUnitate(n: number, unitate: string): string {
  return miiRoMd(n) + cuDeRoMd(n) + " " + unitate;
}

/** Taxa de conectare, cuvant cu cuvant, cum o citesc pliul suplimentelor si /ro/enterprise. */
export const CONECTARE_RO_MD = CONECTARE.eur + "\u00a0EUR la\u00a0" + cuUnitate(CONECTARE.pagini, "pagini importate") + ", o singură dată";

/**
 * Limitele unui plan (fara conturi), in unitatile editiei: cifra ingrosata si textul de dupa ea. Dupa GB nu se pune
 * "de" ("100 GB de stocare"); dupa un numeral care il cere, da ("80 de raspunsuri AI pe luna").
 */
export function limiteRoMd(cheie: CheiePlanLimite): { cifra: string; text: string }[] {
  const l = LIMITE_PLANURI[cheie];
  const de = (n: number) => (cereDe(n) ? "de " : "");
  return [
    { cifra: miiRoMd(l.stocareGb), text: "GB de stocare" },
    { cifra: miiRoMd(l.raspunsuriAiPeLuna), text: de(l.raspunsuriAiPeLuna) + "răspunsuri AI pe lună" },
    { cifra: miiRoMd(l.paginiOcrPeLuna), text: de(l.paginiOcrPeLuna) + "pagini OCR pe lună" },
    { cifra: miiRoMd(l.descarcariGbPeLuna), text: "GB de descărcări pe lună" },
  ];
}

/** Eroul interior: `preturi.ts:66-76`. Subtitlul e capsula fisei, scurtata la cutia RO. */
export const ANTET_PRETURI_RO_MD: { fir: NivelFir[]; titlu: string; subtitlu: string } = {
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Prețuri", cale: CALE_PRETURI_RO_MD },
  ],
  titlu: "Prețurile 3S: patru pachete, în euro",
  // Suma si moneda nu se despart la capat de rand: spatiu nedespartitor intre cifra si "EUR".
  subtitlu:
    "3S are patru pachete, cu prețuri pentru întreaga firmă, în euro, fără TVA: Starter 90\u00a0EUR, Pro 150\u00a0EUR și Business 240\u00a0EUR pe lună, pentru 5, 10 și 20 de conturi; Enterprise de la 800\u00a0EUR pe lună. Orice colaborare începe cu un pilot gratuit.",
};

/** `preturi.ts:48-49`: numele accesibile ale poartei si ale pliurilor. */
export const ETICHETE_PRETURI_RO_MD = { poarta: "Cele două variante 3S", pliuri: "Conturile și funcțiile pachetelor" };

/** `preturi.ts:98-105`. */
export const POARTA_BAZA_RO_MD: CardPoarta = {
  nume: "Starter, Pro, Business",
  titlu: "Toate funcțiile incluse",
  text: "Alegi 5, 10 sau 20 de conturi, la un preț pe firmă, fără TVA. Pachetele diferă prin numărul de conturi și prin limitele lunare.",
  mergi: "Alege un pachet",
};

/** `preturi.ts:110-118`: linia Enterprise, cu tinta pagina ei /ro. */
export const POARTA_ENTERPRISE_RO_MD: CardPoarta & { tinta: Legatura } = {
  nume: "Enterprise",
  titlu: "Pentru peste 20 de conturi",
  text: "De la 800\u00a0EUR pe lună, cu contract anual. Îți transmitem o ofertă scrisă.",
  mergi: "Detalii Enterprise",
  tinta: { text: "3S Enterprise", href: "/ro/enterprise", ruta: "/ro/enterprise" },
};

/** `preturi.ts:127-134`; `inapoi` = textul butonului din linia de baza. */
export const LINIA_DE_BAZA_RO_MD: ContinutLiniaDeBaza & { inapoi: string } = {
  inapoi: "Cele două variante 3S",
  titlu: "Starter, Pro, Business",
  promisiune: "Documentele firmei, ușor de regăsit.",
  paragraf:
    "Prețurile sunt în euro, fără TVA, și se calculează pentru întreaga firmă, nu pentru fiecare utilizator. Starter, Pro și Business au aceleași funcții și diferă prin numărul de conturi de utilizator și prin limitele lunare.",
};

/**
 * Planurile, cu sumele grilei (decizia 18): 90 / 150 / 240 EUR pe luna, 75 / 125 / 200 pe luna la plata anuala.
 * Insigna "Recomandat" ramane pe Starter, ca pe RO si pe EN (decizia 59). `preturi.ts:283-303`.
 */
export const PLANURI_RO_MD: Plan[] = [
  {
    cheie: "starter",
    nume: "Starter",
    descriere: "Pentru un birou mic, în care cel mult cinci colegi caută și descarcă documente zilnic, Starter este suficient.",
    pret: { lunar: 90, anual: 75 },
    conturi: 5,
    recomandat: true,
  },
  {
    cheie: "pro",
    nume: "Pro",
    descriere:
      "Când același act trece prin mai multe mâini, de la contabilitate la vânzări și la conducere, zece conturi țin toată echipa în același loc.",
    pret: { lunar: 150, anual: 125 },
    conturi: 10,
    recomandat: false,
  },
  {
    cheie: "business",
    nume: "Business",
    descriere: "Pentru o firmă cu mai multe departamente, fiecare cu dosarele lui, cele douăzeci de conturi acoperă întreaga organizare.",
    pret: { lunar: 240, anual: 200 },
    conturi: 20,
    recomandat: false,
  },
];

/** `preturi.ts:311-320`; butonul planului duce la WhatsApp, cu legatura pusa de pagina. */
export const GRILA_RO_MD = {
  eticheta: "Pachetele 3S",
  recomandat: "Recomandat",
  unitate: "EUR / lună",
  // Langa pretul anual pe luna (75 / 125 / 200), ca sa nu se citeasca drept pret lunar.
  unitateAnual: "EUR / lună, la plata anuală",
  buton: "Scrie-ne pe WhatsApp",
  detalii: (rand: string) => "Ce înseamnă: " + rand,
};

/**
 * `preturi.ts:346-362`: lista de 9 randuri a unui plan; iconita "i" ramane pe randul al saselea. Primele cinci randuri
 * sunt conturile si limitele planului (decizia 66), in ordinea perechii EN; faptele pe care le inlocuiesc (textul din
 * scanari, tipul de act, exportul) raman in tabelul comparativ.
 */
export function randuriPlanRoMd(plan: Plan): RandPlan[] {
  return [
    { cifra: String(plan.conturi), text: (cuDeRoMd(plan.conturi) === "" ? "" : "de ") + "conturi pentru echipă", explicatie: null },
    ...limiteRoMd(plan.cheie).map((l) => ({ cifra: l.cifra, text: l.text, explicatie: null })),
    {
      cifra: null,
      text: "Termen de păstrare pe dosar",
      explicatie: "Pentru fiecare dosar poți stabili un termen de păstrare, care se aplică tuturor documentelor din el.",
    },
    { cifra: null, text: "Căutare cu sursa citată", explicatie: null },
    { cifra: null, text: "Găzduire în UE, Frankfurt", explicatie: null },
    { cifra: null, text: "Preț pe firmă", explicatie: null },
  ];
}

/**
 * Cursoarele calculatorului (`preturi.ts:173-197`). Tariful orar e in EUR (decizia 54), cu domeniul perechii EN
 * (5-100 EUR pe ora, pas 1, pornire 15), de confirmat pe capturi odata cu textul.
 */
export const CURSOARE_RO_MD: Record<"persoane" | "minute" | "tarif", Cursor> = {
  persoane: {
    eticheta: "Câți colegi au nevoie zilnic de acte",
    unitate: "",
    unitateSpusa: { unu: "persoană", multe: "persoane" },
    min: 1,
    max: 50,
    pas: 1,
    implicit: 4,
  },
  minute: {
    eticheta: "Minutele fiecăruia, zilnic, prin dosare",
    unitate: "min",
    unitateSpusa: { unu: "minut pe zi", multe: "minute pe zi" },
    min: 10,
    max: 120,
    pas: 5,
    implicit: 25,
  },
  tarif: {
    eticheta: "Tariful orar mediu al unui coleg",
    unitate: "EUR",
    unitateSpusa: { unu: "euro pe oră", multe: "euro pe oră" },
    min: 5,
    max: 100,
    pas: 1,
    implicit: 15,
  },
};

/**
 * Textele calculatorului (`preturi.ts:161-232`); suma sta inaintea monedei, ca in romana ("1.833 EUR"), legata de ea
 * prin spatiu nedespartitor; tot asa cifra orelor de "h" si "circa" de cifra. Orele afisate sunt rotunjite (o zecimala
 * sub 100, intregi de la 100), iar calculul insusi porneste de la estimari (persoane, minute, 22 de zile), deci fraza
 * spune "circa" langa ore.
 */
export const CALCULATOR_RO_MD = {
  teaser: {
    presupuneri: (oameni: string, minute: string) => "Cu " + oameni + " care caută acte câte " + minute + " zilnic",
    rezultat: (ore: string) => "se adună circa\u00a0" + ore + " lunar",
    cta: "Încearcă cu cifrele firmei",
  },
  eticheta: "Calculul timpului pierdut căutând acte",
  zileLucratoare: 22,
  timpAcum: { inainte: "Acum plătești ", dupaBani: " EUR lunar pentru cele circa ", dupaOre: " h în care echipa caută acte prin dosare." },
  pretInOre: { inainte: "Se potrivește pachetul ", dupaPlan: ": ", dupaPret: " EUR pe lună, adică circa ", dupaOre: " h plătite la tariful ales." },
  // Cu comutatorul pe Anual, pretul pachetului e cel anual pe luna: fraza spune perioada.
  pretInOreAnual: {
    inainte: "Se potrivește pachetul ",
    dupaPlan: ": ",
    dupaPret: " EUR pe lună, la plata anuală, adică circa ",
    dupaOre: " h plătite la tariful ales.",
  },
  pesteConturi: {
    inainte: (persoane: number) => "Pentru " + persoane + cuDeRoMd(persoane) + " persoane, pachetele nu ajung: discută cu echipa 3S despre ",
    dupa: ".",
  },
  nota: "Presupunem 22 de zile lucrătoare pe lună. Rezultatul arată timpul pe care îl pierzi acum.",
};

/** Valoarea unui cursor spusa cititorului de ecran: singular la 1, apoi numeralul romanesc ("25 de minute pe zi"). */
export function valoareSpusaRoMd(cursor: Cursor, n: number): string {
  return n === 1 ? n + " " + cursor.unitateSpusa.unu : n + cuDeRoMd(n) + " " + cursor.unitateSpusa.multe;
}

/** `preturi.ts:242-250`: nota de sub comutator e propozitia TVA a deciziei 24, cuvant cu cuvant. */
export const COMUTATOR_RO_MD: ContinutComutator = {
  eticheta: "Perioada de plată",
  lunar: "Lunar",
  anual: "Anual",
  insigna: "Plătești 10 luni din 12",
  nota: "Prețurile nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură.",
};

const LUNI_RO_MD = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

/** Data zilei in romana: "5 octombrie 2026". */
export function dataRoMd(d: Date): string {
  return d.getDate() + " " + LUNI_RO_MD[d.getMonth()] + " " + d.getFullYear();
}

/** `preturi.ts:372-385`: "preturile", nu "oferta" (oferta scrisa e alt document, valabil 30 de zile). */
export const LISTA_PDF_RO_MD: ContinutListaPdf = {
  buton: "Tipărește prețurile sau salvează-le în PDF",
  foaie: {
    marca: "3S Scan Store Solve",
    titlu: "Prețuri 3S",
    coloane: { plan: "Pachet", lunar: "Lunar (EUR)", anual: "Anual, pe lună (EUR)" },
    note: ["Prețuri orientative, fără TVA.", "Începi cu un pilot gratuit de 14 zile.", "Prețurile sunt cele afișate pe site la data de mai sus."],
    adresa: "Pagina prețurilor: ",
  },
};

/** `preturi.ts:395-397` si `:431-433`: titlurile si paragrafele celor doua pliuri. */
export const PLIURI_RO_MD: ContinutPliuri = {
  eticheta: ETICHETE_PRETURI_RO_MD.pliuri,
  birou: {
    titlu: "Pachetul stabilește numărul de conturi",
    paragraf:
      "Starter, Pro și Business includ 5, 10 sau 20 de conturi de utilizator, iar limitele lunare cresc de la un pachet la următorul. Prețul se calculează pentru întreaga firmă, nu pentru fiecare utilizator.",
  },
  comparatie: { titlu: "Pachetele, față în față", paragraf: "Ce primești în fiecare pachet, rând cu rând" },
};

/** `preturi.ts:405-411`: biroul fara demonstratia dispozitivelor (`:399`, `:401`, `:403`, `:412` sunt X, val-ro-1.1). */
export const BIROU_RO_MD: ContinutBirouConturi = {
  initial: 5,
  conturi: "Conturi în pachet",
  locuri: (n: number) => n + cuDeRoMd(n) + " conturi, câte unul pentru fiecare coleg",
};

const DA: CelulaTabel = { fel: "da" };
const toate = (c: CelulaTabel): Record<CheiePlan, CelulaTabel> => ({ starter: c, pro: c, business: c });
const valoare = (text: string): CelulaTabel => ({ fel: "valoare", text });

/** Celulele unui rand de limita: cifra fiecarui plan, cu unitatea scurta a tabelului ("100 GB", "1.000"). */
function pePlan(cifra: (cheie: CheiePlan) => string): Record<CheiePlan, CelulaTabel> {
  return { starter: valoare(cifra("starter")), pro: valoare(cifra("pro")), business: valoare(cifra("business")) };
}

/**
 * `preturi.ts:431-476`: 4 categorii, 14 randuri, ca pe RO, in ordinea perechii EN. Randurile de limita (decizia 66) si
 * taxa de conectare (decizia 68) iau locul celor de umplutura: jurnalul deschiderilor, incarcarea si raspunsurile din
 * browser, inregistrarea prin invitatie si termenul de pastrare, care ramane pe carduri, cu explicatia lui. Randul
 * pilotului ramane intre conturi si costul pe persoana, ca pe EN.
 */
export const TABEL_RO_MD: ContinutTabelPlanuri = {
  functie: "Funcție",
  inclus: "inclus",
  derulare: "Tabelul pachetelor; pe ecran îngust se derulează orizontal",
  categorii: [
    {
      titlu: "Unde stau fișierele",
      randuri: [
        { functie: "Regiunea din UE", celule: toate(valoare("Frankfurt")) },
        { functie: "Stocare", celule: pePlan((c) => miiRoMd(LIMITE_PLANURI[c].stocareGb) + " GB") },
      ],
    },
    {
      titlu: "Conturile și prețul",
      randuri: [
        { functie: "Lunar (EUR)", celule: { starter: valoare("90"), pro: valoare("150"), business: valoare("240") } },
        { functie: "Conturi pentru echipă", celule: { starter: valoare("5"), pro: valoare("10"), business: valoare("20") } },
        { functie: "Pilot gratuit de 14 zile", celule: toate(DA) },
        // Pretul e pe firma: celula spune ca nu exista cost pe persoana, ca pe EN ("Per-user fee": "None"); "Inclus"
        // se citea si ca "costul pe persoana e inclus", si era singura celula cu majuscula langa "inclus".
        { functie: "Cost pe persoană", celule: toate(valoare("Nu există")) },
        // Celula ramane scurta (coloana planului are 7,5rem): unitatea si "o singura data" stau in eticheta randului.
        { functie: "Taxă de conectare, la " + cuUnitate(CONECTARE.pagini, "pagini") + " (o singură dată)", celule: toate(valoare(CONECTARE.eur + " EUR")) },
      ],
    },
    {
      titlu: "Ce face arhiva",
      randuri: [
        { functie: "Căutare cu sursa citată", celule: toate(DA) },
        { functie: "Text din scanări și imagini", celule: toate(DA) },
        { functie: "Recunoașterea tipului de act", celule: toate(DA) },
        { functie: "Export de acte", celule: toate(DA) },
      ],
    },
    {
      titlu: "Limitele lunare",
      randuri: [
        { functie: "Răspunsuri AI pe lună", celule: pePlan((c) => miiRoMd(LIMITE_PLANURI[c].raspunsuriAiPeLuna)) },
        { functie: "Pagini OCR pe lună", celule: pePlan((c) => miiRoMd(LIMITE_PLANURI[c].paginiOcrPeLuna)) },
        { functie: "Descărcări pe lună", celule: pePlan((c) => miiRoMd(LIMITE_PLANURI[c].descarcariGbPeLuna) + " GB") },
      ],
    },
  ] satisfies CategorieTabel[],
};

/** Numele resursei unui supliment (titlul grupului) si randul lui, in unitatile editiei. */
const RESURSA_RO_MD: Record<ResursaSupliment, { grup: string; unitate: (n: number) => string }> = {
  raspunsuriAi: { grup: "Răspunsuri AI", unitate: (n) => cuUnitate(n, "răspunsuri AI") },
  stocare: { grup: "Stocare", unitate: (n) => miiRoMd(n) + " GB de stocare" },
  paginiOcr: { grup: "Pagini OCR", unitate: (n) => cuUnitate(n, "pagini OCR") },
  descarcari: { grup: "Descărcări", unitate: (n) => miiRoMd(n) + " GB de descărcări" },
};

/** Facturarea unui supliment platit o data: "valabile" se acorda cu continutul lui (raspunsuri, pagini, GB de ...). */
const VALABIL_RO_MD = "O singură dată, valabile " + cuUnitate(VALABILITATE_SUPLIMENT_ZILE, "zile");

/** Randurile tabelului de suplimente, din `SUPLIMENTE`, grupate pe resursa. */
function grupuriSuplimenteRoMd(): { titlu: string; randuri: RandSupliment[] }[] {
  return RESURSE_SUPLIMENTE.map((r) => ({
    titlu: RESURSA_RO_MD[r].grup,
    randuri: SUPLIMENTE.filter((x) => x.resursa === r).map((x) => ({
      supliment: RESURSA_RO_MD[r].unitate(x.cantitate),
      pret: miiRoMd(x.pretEur) + " EUR",
      facturare: x.facturare === "lunar" ? "În fiecare lună" : VALABIL_RO_MD,
    })),
  }));
}

/**
 * Al treilea pliu (deciziile 66-68), oglinda lui `SUPLIMENTE_EN`: suplimentele, taxa de conectare si intrebarile despre
 * limite. Comportamentul la limita e cel scris pe EN (avertizare in aplicatie la 80%; raspunsurile AI, incarcarile si
 * descarcarile se opresc; OCR-ul se amana in luna urmatoare; nicio stergere). Fara legaturi in pliu: comanda unui
 * supliment trece prin butoanele de canal ale paginii.
 */
export const SUPLIMENTE_RO_MD: ContinutSuplimente = {
  titlu: "Ai nevoie de mai mult? Suplimente și regulile limitelor",
  paragrafe: [
    "Dacă o limită lunară se epuizează înainte de sfârșitul lunii, poți adăuga un supliment fără să schimbi pachetul. Ca să comanzi un supliment, scrie-ne.",
    "Conectare: " +
      CONECTARE_RO_MD +
      ". Taxa acoperă arhiva pe care o aduci la pornire; paginile importate în pilotul gratuit de 14 zile intră în ea la trecerea pe un pachet plătit.",
  ],
  coloane: { supliment: "Supliment", pret: "Preț", facturare: "Facturare" },
  derulare: "Tabelul suplimentelor; pe ecran îngust se derulează orizontal",
  grupuri: grupuriSuplimenteRoMd(),
  nota: "Prețurile nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură.",
  intrebari: [
    {
      intrebare: "Limitele se aplică pe utilizator sau pe firmă?",
      raspuns:
        "Pe firmă. Fiecare limită este comună tuturor conturilor de utilizator ale organizației și nu se calculează separat pentru fiecare persoană.",
    },
    {
      intrebare: "Când se reiau limitele lunare?",
      raspuns:
        "În prima zi a fiecărei luni calendaristice. Ce nu folosești într-o lună nu se reportează în luna următoare. Stocarea nu este o limită lunară: reprezintă spațiul ocupat de documente, iar documentele șterse sunt incluse în ea cât timp stau în coșul de gunoi, cel mult 30 de zile.",
    },
    {
      intrebare: "Ce se întâmplă când ajungi la o limită?",
      raspuns:
        "3S îți afișează un avertisment în aplicație când ajungi la " +
        PRAG_AVERTIZARE_PROCENT +
        "% dintr-o limită. La limită, răspunsurile AI se opresc până în luna următoare sau până adaugi un supliment, iar documentele rămân accesibile. Când stocarea este plină, încărcările noi se opresc până eliberezi spațiu sau adaugi stocare; documentele deja păstrate rămân neschimbate. Descărcările se opresc până în luna următoare sau până adaugi un supliment. Scanările peste limita de pagini OCR nu se pierd: sunt păstrate, iar textul lor este recunoscut la începutul lunii următoare. Nu ștergem niciodată date când se atinge o limită.",
    },
    {
      intrebare: "Ce este taxa de conectare?",
      raspuns:
        "Este taxa pentru arhiva pe care o aduci în 3S la pornire: " +
        CONECTARE_RO_MD +
        ", fără TVA. Acoperă recunoașterea textului, indexarea pentru căutare și recunoașterea tipului de act pentru aceste pagini. Paginile importate în pilotul gratuit de 14 zile intră în această taxă la trecerea pe un pachet plătit; dacă nu continui după pilot, nu plătești nimic.",
    },
  ],
};

/** `preturi.ts:490-529`: cele sapte sectiuni ale fisei, in ordinea cutiilor RO. Raspunsurile sunt text simplu. */
export const INTREBARI_RO_MD: ContinutFaqPreturi = {
  titlu: "Plata și pachetele, pe scurt",
  subtitlu: "Ce include fiecare pachet, cât plătești și când",
  intrebari: [
    {
      intrebare: "Prețurile includ TVA?",
      raspuns: "Nu. Prețurile sunt exprimate în euro și nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură.",
    },
    {
      intrebare: "Există reduceri?",
      raspuns:
        "Da. La plata anuală, pentru Starter, Pro și Business plătești 10 luni din 12, adică cu 16,7% mai puțin. Prima lună după pilot se facturează la prețul din grilă.",
    },
    {
      intrebare: "De ce prețul este orientativ?",
      raspuns:
        "Pachetul potrivit depinde de numărul de persoane care vor folosi 3S. După pilot, confirmăm pachetul și prețul într-o ofertă scrisă, valabilă 30 de zile.",
    },
    {
      intrebare: "Când se face plata și cât este valabilă o ofertă?",
      raspuns: "Factura se achită în 14 zile de la emitere, iar abonamentele se facturează în avans. Oferta scrisă și prețul din ea sunt valabile 30 de zile.",
    },
    {
      intrebare: "Ce este un pilot asistat?",
      raspuns:
        "Pilotul durează 14 zile, este gratuit și se desfășoară pe documentele firmei, cu 5 conturi, ca în Starter. Stabilim volumul în scris, pornim după ce accepți Termenii și Acordul de prelucrare a datelor, apoi verificăm împreună răspunsurile.",
    },
    {
      intrebare: "Pot încerca 3S înainte să decid?",
      raspuns: "Da. Pilotul asistat este gratuit timp de 14 zile și se desfășoară pe documentele firmei. Scrie-ne ca să stabilim documentele și întrebările.",
    },
    {
      intrebare: "Cum obțin o ofertă?",
      raspuns:
        "Scrie-ne pe WhatsApp. Sunt suficiente câteva rânduri: ce păstrezi (hârtie, scanări, fișiere sau o combinație), unde se află arhiva și în ce țară, limba documentelor, volumul aproximativ și câte persoane vor folosi 3S. Nu trimite încă documente sau date personale.",
    },
  ],
};

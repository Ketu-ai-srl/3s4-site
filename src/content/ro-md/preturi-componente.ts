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
// Modulul e numai date si functii pure: il importa invelitoarea client a preturilor /ro, deci nu aduce nimic din
// continutul RO (tipurile vin prin `import type`; regula numeralului vine din `limba.ts`, fara continut).

import type { ContinutBirouConturi } from "@/components/preturi/BirouInteractivVedere";
import type { ContinutComutator } from "@/components/preturi/ComutatorPerioadaVedere";
import type { ContinutFaqPreturi } from "@/components/preturi/FaqPreturi";
import type { ContinutListaPdf } from "@/components/preturi/ListaPdfVedere";
import type { ContinutLiniaDeBaza } from "@/components/preturi/LiniaDeBaza";
import type { ContinutPliuri } from "@/components/preturi/PliuriVedere";
import type { ContinutTabelPlanuri } from "@/components/preturi/TabelPlanuri";
import type { NivelFir } from "@/components/primitive/FirPagina";
import { cereDe } from "@/content/limba";
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

/** Eroul interior: `preturi.ts:66-76`. Subtitlul e capsula fisei, scurtata la cutia RO. */
export const ANTET_PRETURI_RO_MD: { fir: NivelFir[]; titlu: string; subtitlu: string } = {
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Prețuri", cale: CALE_PRETURI_RO_MD },
  ],
  titlu: "Prețurile 3S: patru pachete, în euro",
  subtitlu:
    "3S are patru pachete, cu prețuri pentru întreaga firmă, în euro, fără TVA: Starter 90 EUR, Pro 150 EUR și Business 240 EUR pe lună, pentru 5, 10 și 20 de conturi; Enterprise de la 800 EUR pe lună. Orice colaborare începe cu un pilot gratuit.",
};

/** `preturi.ts:48-49`: numele accesibile ale poartei si ale pliurilor. */
export const ETICHETE_PRETURI_RO_MD = { poarta: "Cele două variante 3S", pliuri: "Conturile și funcțiile pachetelor" };

/** `preturi.ts:98-105`. */
export const POARTA_BAZA_RO_MD: CardPoarta = {
  nume: "Starter, Pro, Business",
  titlu: "Toate funcțiile incluse",
  text: "Alegi 5, 10 sau 20 de conturi, la un preț pe firmă, fără TVA. Pachetele diferă numai prin numărul de conturi.",
  mergi: "Alege un pachet",
};

/** `preturi.ts:110-118`: linia Enterprise, cu tinta pagina ei /ro. */
export const POARTA_ENTERPRISE_RO_MD: CardPoarta & { tinta: Legatura } = {
  nume: "Enterprise",
  titlu: "Pentru peste 20 de conturi",
  text: "De la 800 EUR pe lună, cu contract anual. Îți transmitem o ofertă scrisă.",
  mergi: "Detalii Enterprise",
  tinta: { text: "3S Enterprise", href: "/ro/enterprise", ruta: "/ro/enterprise" },
};

/** `preturi.ts:127-134`; `inapoi` = textul butonului din linia de baza. */
export const LINIA_DE_BAZA_RO_MD: ContinutLiniaDeBaza & { inapoi: string } = {
  inapoi: "Cele două variante 3S",
  titlu: "Starter, Pro, Business",
  promisiune: "Documentele firmei, ușor de regăsit.",
  paragraf:
    "Prețurile sunt calculate pentru întreaga firmă, în euro, fără TVA. Toate pachetele au aceleași funcții și diferă numai prin numărul de conturi.",
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
  buton: "Scrie-ne pe WhatsApp",
  detalii: (rand: string) => "Ce înseamnă: " + rand,
};

/** `preturi.ts:346-362`: lista de 9 randuri a unui plan; iconita "i" ramane pe randul al saselea. */
export function randuriPlanRoMd(plan: Plan): RandPlan[] {
  return [
    { cifra: String(plan.conturi), text: (cuDeRoMd(plan.conturi) === "" ? "" : "de ") + "conturi pentru echipă", explicatie: null },
    { cifra: null, text: "Preț pe firmă", explicatie: null },
    { cifra: null, text: "Căutare cu sursa citată", explicatie: null },
    { cifra: null, text: "Text recunoscut în scanări", explicatie: null },
    { cifra: null, text: "Recunoașterea tipului de act", explicatie: null },
    {
      cifra: null,
      text: "Termen de păstrare pe dosar",
      explicatie: "Pentru fiecare dosar poți stabili un termen de păstrare, care se aplică tuturor documentelor din el.",
    },
    { cifra: null, text: "Exportul documentelor", explicatie: null },
    { cifra: null, text: "Găzduire în UE, Frankfurt", explicatie: null },
    { cifra: null, text: "Lucrezi din browser", explicatie: null },
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

/** Textele calculatorului (`preturi.ts:161-232`); suma sta inaintea monedei, ca in romana ("1.833 EUR"). */
export const CALCULATOR_RO_MD = {
  teaser: {
    presupuneri: (oameni: string, minute: string) => "Cu " + oameni + " care caută acte câte " + minute + " zilnic",
    rezultat: (ore: string) => "se adună " + ore + " lunar",
    cta: "Încearcă cu cifrele firmei",
  },
  eticheta: "Calculul timpului pierdut căutând acte",
  zileLucratoare: 22,
  timpAcum: { inainte: "Acum plătești ", dupaBani: " EUR lunar pentru cele ", dupaOre: " h în care echipa caută acte prin dosare." },
  pretInOre: { inainte: "Se potrivește pachetul ", dupaPlan: ": ", dupaPret: " EUR pe lună, adică ", dupaOre: " h plătite la tariful ales." },
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
  insigna: "2 luni gratuite",
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
      "Starter, Pro și Business au aceleași funcții; fiecare include alt număr de conturi: 5, 10 sau 20. Prețul se calculează pentru întreaga firmă.",
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

/** `preturi.ts:431-476`: 4 categorii, 14 randuri, ca pe RO; randurile scoase sunt inlocuite cu fapte confirmate. */
export const TABEL_RO_MD: ContinutTabelPlanuri = {
  functie: "Funcție",
  inclus: "inclus",
  derulare: "Tabelul pachetelor; pe ecran îngust se derulează orizontal",
  categorii: [
    {
      titlu: "Unde și cum stau fișierele",
      randuri: [
        { functie: "Regiunea din UE", celule: toate(valoare("Frankfurt")) },
        { functie: "Termen de păstrare", celule: toate(DA) },
      ],
    },
    {
      titlu: "Echipa și conturile",
      randuri: [
        { functie: "Jurnalul deschiderilor", celule: toate(DA) },
        { functie: "Conturi pentru echipă", celule: { starter: valoare("5"), pro: valoare("10"), business: valoare("20") } },
        { functie: "Pilot gratuit", celule: toate(DA) },
        { functie: "Cost pe persoană", celule: toate(valoare("Inclus")) },
        { functie: "Export de acte", celule: toate(DA) },
      ],
    },
    {
      titlu: "Inteligența arhivei",
      randuri: [
        { functie: "Căutare cu sursa citată", celule: toate(DA) },
        { functie: "Text din scanări și imagini", celule: toate(DA) },
        { functie: "Recunoașterea tipului de act", celule: toate(DA) },
        { functie: "Încărcare din browser", celule: toate(DA) },
      ],
    },
    {
      titlu: "Acces și preț",
      randuri: [
        { functie: "Unde primești răspunsuri", celule: toate(valoare("În browser")) },
        { functie: "Înregistrare", celule: toate(valoare("Prin invitație")) },
        { functie: "Lunar (EUR)", celule: { starter: valoare("90"), pro: valoare("150"), business: valoare("240") } },
      ],
    },
  ] satisfies CategorieTabel[],
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
        "Da, la plata anuală: două luni sunt gratuite. La Starter, Pro și Business plătești 10 luni pentru 12, adică 16,7% mai puțin. Prima lună după pilot se facturează la prețul din grilă.",
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

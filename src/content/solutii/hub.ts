// Hubul solutiilor, `/solutii` (fisa `solutii.md`): eroul de sector cu rand de dovada, benzile de
// 2 + 4 + 1 carduri, cautarea cu 4 file, caseta de conformitate, 7 intrebari si CTA-ul final.
//
// CARDURILE iau numele, descrierea, iconita si tinta din foaia Solutii a meniului (`navigatie.ts`,
// scrisa de felia `text-acasa`). Iconita avocaturii e aceeasi in ambele locuri. Cinci carduri au
// descrierea proprie hub-ului (`DESCRIERI_HUB`): trei fiindca, cu textul meniului, la 390 aveau cate
// un rand mai putin decat la referinta (banda 1: 265 fata de 291 px; banda 2: 283 si 257 fata de 305
// si 279), deci benzile ieseau cu 26 si 43 px mai scurte; notariatele fiindca textul meniului spune
// ca arhiva biroului se preia si se pastreaza in afara lui, afirmatie retrasa pe pagina sectorului
// (`solutii-notari-custodie`); logistica fiindca textul meniului reia ideea referintei despre
// facturarea care asteapta hartia. Textele tin randurile referintei la 1440 si la 390, masurat pe pagina.
//
// CASETA DE CONFORMITATE poarta NUMAI fapte confirmate in registrul de afirmatii (decizia D4):
// gazduirea, stocarea proprie, functiile declarate existente (D4b) si platformele aplicatiei (D4c).
// Nicio certificare si nicio conformitate pe care 3S nu le are.
//
// Cautarea cu file e o macheta cu date fictive, declarate ca exemplu in subtitlul ei (plan D9).
// Lungimile din comentarii sunt ale referintei, pe acelasi rol. FRAGMENTELE au lungimea masurata pe
// ecran, nu pe caractere: 2 randuri la 1440 pe toate filele; la 390, 6 randuri pe imobiliare si 5 pe
// celelalte (solutii.md S3). Rezerva de inaltime ia cel mai inalt rezultat, deci cardul are, in orice
// faza, inaltimea cardului referintei cu rezultatul imobiliarelor (proba: tests/browser/solutii.spec.ts).

import { CALE_INREGISTRARE, FOAIE_SOLUTII, type ElementMeniu, type Legatura } from "@/content/navigatie";
import type { ExempluCautare, Intrebare } from "./tipuri";

export type FilaCautare = ExempluCautare & { eticheta: string };

export type Banda = { titlu: string; elemente: ElementMeniu[] };

/** Descrierile proprii hub-ului, pe cardurile unde textul meniului da alt numar de randuri la 390. */
const DESCRIERI_HUB: Record<string, string> = {
  // Lungime: 159. 4 randuri la 390 (cardul mare al referintei: 291 px).
  "/solutii/contabilitate":
    "Actele fiecărui client, oricum ar sosi, se adună într-un dosar pe lună. Ce lipsește la închidere vezi din timp, iar arhiva tuturor firmelor se caută deodată.",
  // Lungime: 208. 4 randuri la 1440, 5 la 390 (titlul pe 2 randuri: 305 px).
  "/solutii/imobiliare":
    "Ține portofoliul organizat pe clădiri și pe unități, de la titlul de proprietate la ultimul contract de închiriere semnat. Vezi din timp ce contract expiră și ce act mai lipsește din dosarul unei clădiri.",
  // Lungime: 200. 4 randuri la 1440, 5 la 390 (279 px).
  "/solutii/avocatura":
    "Dosarul fiecărei cauze adună actele primite cu data sosirii și termenele procedurale. Accesul se dă pe dosar, iar orice document deschis se trece în jurnal, cu numele celui care l-a deschis și cu ora.",
  // Lungime: 175 la meniu. 3 randuri la 1440, 4 la 390, ca la referinta. Doar functia produsului, fara locul scanarii.
  "/solutii/notariate":
    "Volumele și registrele se scanează pagină cu pagină, iar textul lor intră în 3S. Un act vechi se găsește apoi după numele părților, cu volumul și pagina lui.",
  // Lungime: 117 la meniu. 2 randuri la 1440, 3 la 390, ca la referinta (masurat pe pagina: 43,4 / 65,1 px).
  // Pleaca de la cautarea dupa numarul cursei, un fapt 3S, nu de la o formula despre fiecare act.
  "/solutii/logistica":
    "CMR-urile și avizele se găsesc după numărul cursei sau după client, iar de pe drum se pot cere pe WhatsApp.",
};

function element(cale: string): ElementMeniu {
  const gasit = FOAIE_SOLUTII.elemente.find((e) => e.href === cale);
  if (!gasit) throw new Error("hub: foaia Solutii nu are elementul " + cale);
  const descriere = DESCRIERI_HUB[cale];
  return descriere ? { ...gasit, descriere } : gasit;
}

export const HUB: {
  cale: string;
  nume: string;
  meta: { titlu: string; descriere: string };
  erou: { titlu: string; subtitlu: string; dovada: string; butonPrincipal: Legatura; butonSecundar: Legatura };
  benzi: [Banda, Banda, Banda];
  legaturaCard: string;
  cautare: { titlu: string; subtitlu: string; etichetaFile: string; file: [FilaCautare, FilaCautare, FilaCautare, FilaCautare] };
  conformitate: { eticheta: string; insigne: string[] };
  intrebari: { titlu: string; lista: Intrebare[] };
} = {
  cale: "/solutii",
  nume: "Soluții",
  meta: {
    titlu: "Arhiva 3S pentru șapte domenii de activitate | 3S",
    descriere:
      "Constructori, contabili, avocați, notari, asigurători, transportatori și administratori de clădiri: arhiva 3S, pe actele fiecărui domeniu.",
  },
  erou: {
    // Rol: h1, doua randuri (trei la 390, ca la referinta). Lungime: 57.
    titlu: "De la planșe la procuri, orice act vine cu pagina din care e luat",
    // Rol: subtitlul (2 randuri, margine jos 12). Lungime: 105.
    subtitlu: "Constructori, contabili, avocați sau notari: 3S citește actele fiecărei meserii și îți răspunde cu documentul potrivit.",
    // Rol: randul de dovada (14/500 ardezie-5, un rand). Lungime: 102. Fapte ale produsului (canalele
    // pe care se intreaba arhiva si gazduirea), fara nicio cifra de clienti.
    dovada: "Aceeași arhivă pe web, pe desktop, pe telefon și pe WhatsApp, cu găzduire Amazon în Germania.",
    // Rol: butonul plin. Lungime: 17. Tinta: formularul (cont gratuit).
    butonPrincipal: { text: "Testează gratuit", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
    // Rol: butonul-fantoma, spre pagina care explica stratul AI. Tinta 3S echivalenta (plan §6.6):
    // platforma. Textul numeste tinta si drumul unui act prin 3S; lungimea e aleasa pe LATIMEA
    // butonului, nu pe caractere: 333,9 px masurat pe buton (padding inclus), fata de 324,7 la
    // referinta; incape pe un rand si la 390.
    butonSecundar: { text: "Platforma 3S, de la hârtie la răspuns", href: "/platforma", ruta: "/platforma" },
  },
  benzi: [
    // Rol: banda 1, doua carduri mari. Lungime h2: 17.
    { titlu: "Domeniile principale", elemente: [element("/solutii/constructii"), element("/solutii/contabilitate")] },
    // Rol: banda 2, patru carduri mici. Lungime h2: 19.
    {
      titlu: "Și în alte domenii",
      elemente: [
        element("/solutii/imobiliare"),
        element("/solutii/avocatura"),
        element("/solutii/asigurari"),
        element("/solutii/notariate"),
      ],
    },
    // Rol: banda 3, un card pe coloana de 540. Lungime h2: 11. Titlul numeste domeniul cardului.
    { titlu: "Transport", elemente: [element("/solutii/logistica")] },
  ],
  // Rol: legatura din josul fiecarui card (14/600, cu sageata). Lungime: 15.
  legaturaCard: "Mai multe detalii",
  cautare: {
    // Rol: h2. Lungime: 42.
    titlu: "Întreabă arhiva, primești pagina exactă",
    // Rol: subtitlul (2 randuri; 3 la 390, ca la referinta). Lungime: 104. Declara exemplele (plan D9):
    // o singura fraza, cu cele 4 domenii ale filelor si pagina citata.
    subtitlu:
      "Patru căutări date ca exemplu, din imobiliare, construcții, avocatură și asigurări, fiecare cu pagina citată.",
    etichetaFile: "Exemple de căutare pe domenii",
    file: [
      {
        eticheta: "Imobiliare",
        interogare: "cine plătește reparația lifturilor în contractele de închiriere",
        rezultat: {
          fisier: "Contract_inchiriere_ap7.pdf",
          loc: "Pagina 4 · Art. 9 · Reparații",
          potrivire: "90% potrivire · 1,3 s",
          fragment:
            "Reparațiile mari la instalațiile comune ale clădirii, inclusiv la [[lifturi]], rămân în sarcina proprietarului, iar chiriașul suportă numai [[întreținerea curentă]] a spațiului închiriat și consumurile lui, pe baza facturilor lunare de utilități.",
        },
      },
      {
        eticheta: "Construcții",
        interogare: "procesul-verbal de recepție la terminarea lucrărilor, blocul B",
        rezultat: {
          fisier: "PV_receptie_bloc_B.pdf",
          loc: "Pagina 2 · Constatări · Anexa 1",
          potrivire: "88% potrivire · 0,5 s",
          fragment:
            "Comisia de recepție a constatat, la [[12 iunie 2026]], că lucrările la blocul B sunt terminate. Au rămas [[două remedieri]] la hidroizolația terasei, de făcut până la 30 septembrie, cu verificare la fața locului.",
        },
      },
      {
        eticheta: "Avocatură",
        interogare: "clauzele de confidențialitate care rămân valabile după încetare",
        rezultat: {
          fisier: "Contract_prestari_22.pdf",
          loc: "Art. 11 · Obligații · Pagina 7",
          potrivire: "91% potrivire · 1,4 s",
          fragment:
            "Prestatorul păstrează confidențialitatea informațiilor primite de la beneficiar [[timp de trei ani]] de la încetarea contractului. Obligația [[nu se aplică]] datelor devenite publice fără vina prestatorului.",
        },
      },
      {
        eticheta: "Asigurări",
        interogare: "franșiza la grindină din polița CASCO a autoutilitarei",
        rezultat: {
          fisier: "Polita_CASCO_0192.pdf",
          loc: "Condiții speciale · Art. 6 · Pagina 4",
          potrivire: "89% potrivire · 1,6 s",
          fragment:
            "Pentru daunele produse de [[grindină]], polița acoperă caroseria, parbrizul și oglinzile autoutilitarei, cu o franșiză de [[2% din valoarea asigurată]], reținută din despăgubirea plătită.",
        },
      },
    ],
  },
  conformitate: {
    // Rol: eticheta casetei (14/600). Lungime: 26.
    eticheta: "Găzduire, păstrare și acces",
    // Rol: 8 insigne cu bifa (14/500 ardezie-6). Numai fapte CONFIRMATE in registru (D4).
    // Textele scurte si ordinea tin asezarea masurata la referinta: 5 + 3 la 1440, 6 randuri la 390
    // (caseta 145 / 283 px). Masurat pe pagina: cu textele lungi ieseau 4 + 4 si 8 randuri (352 px).
    insigne: [
      "Găzduire Amazon, în Germania",
      "O singură regiune UE",
      "Stocare proprie",
      "Portal clienți",
      "Reguli automate",
      "Termene de păstrare",
      "Răspuns cu sursa citată",
      "Web, desktop și mobil",
    ],
  },
  intrebari: {
    // Rol: h2. Lungime: 19.
    titlu: "Întrebări frecvente",
    lista: [
      {
        // Rol: prin ce difera de un drive. Lungimi la referinta: intrebari 21-51, raspunsuri 204-425.
        // Ordinea intrebarilor e a paginii 3S (ce este, cum se intreaba, ce intra, cum porneste, unde
        // stau datele, aplicatia, pretul), nu a referintei.
        intrebare: "Prin ce diferă 3S de un drive de fișiere obișnuit?",
        raspuns:
          "Un drive păstrează fișierele în folderele în care le pui. 3S le citește: recunoaște tipul fiecărui act, îl așază în dosarul potrivit, îi calculează termenul de păstrare și îți răspunde la întrebări cu pagina din care vine răspunsul.",
      },
      {
        intrebare: "Pot întreba arhiva pe WhatsApp?",
        raspuns:
          "Da. Pe lângă aplicația web și cea de pe telefon, 3S îți răspunde și pe WhatsApp: scrii întrebarea ca într-o conversație obișnuită și primești răspunsul, cu documentul și pagina din care vine, fără să deschizi alt program.",
      },
      {
        intrebare: "Ce fel de fișiere pot încărca?",
        raspuns:
          "E-mailuri cu atașamente, documente PDF, fișiere Word și Excel, scanări și poze făcute cu telefonul. Din fiecare, AI-ul scoate textul, chiar și dintr-o scanare veche, și îl pune în index, alături de restul arhivei.",
      },
      {
        // Pleaca de la hartie (scanarea) si de la contul fara card; fara promisiunea de continuitate.
        intrebare: "Cât durează până lucrăm în 3S?",
        raspuns:
          "Depinde mai ales de hârtie. Dosarele fizice se predau la scanat, iar timpul ține de câte volume ai. Actele deja electronice nu le așteaptă: deschizi contul fără card de plată și le încarci din browser în aceeași zi.",
      },
      {
        // Alegerea locului (stocarea firmei sau Amazon), apoi accesul, apoi criptarea de pe Amazon.
        intrebare: "Unde stau datele firmei?",
        raspuns:
          "Acolo unde alegi: pe stocarea firmei, dacă o ai deja, fiindcă 3S poate lucra direct pe ea, sau pe serverele Amazon din Germania, într-o singură regiune a Uniunii Europene. În ambele cazuri, accesul se dă pe persoană și pe dosar. Pe serverele Amazon, fișierele sunt criptate AES-256 pe disc și circulă numai prin TLS, versiunea 1.2 sau una mai nouă.",
      },
      {
        // Pleaca de la WhatsApp si de la browserul fara instalare; aplicatia vine la urma.
        intrebare: "Ai aplicație pentru telefon?",
        raspuns:
          "Pentru o întrebare rapidă nici nu ai nevoie de ea: scrie arhivei pe WhatsApp sau deschide 3S în browserul telefonului, fără nimic de instalat. Pentru lucrul de zi cu zi există și aplicația 3S, pe toate platformele, cu aceleași dosare pe care le vezi pe calculator.",
      },
      {
        intrebare: "Cât costă 3S?",
        raspuns:
          "Astăzi toate pachetele costă 0 RON, iar contul se deschide fără card de plată. Structura pachetelor e cea completă, cu tot ce primește fiecare, iar pe pagina de prețuri suma de lângă fiecare pachet este 0 RON.",
      },
    ],
  },
};

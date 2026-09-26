// Contractul de continut al paginii `/securitate` (felia `produs`, sablonul "interior-880" cu noua
// blocuri numerotate si seiful; fisa de masurare `securitate.md`).
//
// SPECIFICATIILE vin DOAR din decizia D4c a owner-ului: gazduire Amazon, Germania, o singura regiune
// a Uniunii Europene; AES-256 la stocare si TLS 1.2 sau mai nou in tranzit. Ce declara referinta in
// plus (a doua regiune, durabilitati, disponibilitate tinta, certificari ale furnizorului, echipe de
// garda, izolarea pe client, autorizarea la fiecare cerere, criptarea pornita implicit, cheile
// gestionate de furnizor) NU apare: 3S nu l-a confirmat. Harta are o singura regiune, in Germania,
// fara oras. Izolarea pe firma si autorizarea pe cerere au fost retrase din registru si revin numai
// dupa confirmarea owner-ului.
//
// Matricea rolurilor e un EXEMPLU declarat pe pagina (decizia D9): drepturile implicite ale unui cont
// nou nu sunt confirmate, deci nu se prezinta ca fapt.
//
// Blocul "operatiuni" al formei vorbeste aici despre originalele pe hartie din depozitul 3S
// (arhivarea fizica e un serviciu al marcii, decizia D10: fara numele vreunei firme): singurele
// reguli de lucru pe care registrul le numeste, neconfirmate inca de owner. Angajamentele despre
// accesul echipei 3S au fost retrase din registru (`acasa-echipa-doar-la-cerere`) si nu se scriu
// nici aici.
//
// Pilonii NU urmeaza ordinea formei masurate: pornesc de la hartie si de la accesul pe nume si
// abia apoi ajung la locul datelor si la criptare, iar iconitele merg cu intelesul pilonului.

import type { Legatura } from "@/content/navigatie";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import type { IconitaProdus } from "./iconite";
import type { BlocIntrebari } from "./intrebari";

export const CALE_SECURITATE = "/securitate";

export const META_SECURITATE = {
  titlu: "Securitate 3S: AES-256, TLS 1.2+ și date în Germania",
  descriere:
    "Cum protejează 3S actele firmei: criptare AES-256 la stocare, TLS 1.2+ în tranzit, servere Amazon în Germania, acces nominal și jurnal pentru fiecare act.",
};

export const FIR_SECURITATE = [
  { text: "Acasă", cale: "/" },
  { text: "Securitate", cale: CALE_SECURITATE },
];

export const EROU_SECURITATE = {
  // Rol: titlul paginii (2 randuri la 1440). Lungime: ~54.
  titlu: "Securitate pentru actele firmei, de la raft până la ecran",
  // Rol: subtitlul eroului (3 randuri la 1440). Primul paragraf din
  // <main>: 30-80 de cuvinte (poarta G-AI-02).
  subtitlu:
    "În 3S, fișierele stau criptate AES-256 pe serverele Amazon din Germania și circulă doar prin TLS 1.2 sau mai nou. Accesul se dă pe persoană și pe dosar, iar originalele rămân în depozitul 3S.",
};

/** Titlul ascuns al pilonilor: tine ierarhia de titluri (h1, apoi h2, apoi titlurile pilonilor). */
export const TITLU_PILONI_SECURITATE = "Protecția actelor, pe scurt";

export const PILONI_SECURITATE: { iconita: IconitaProdus; titlu: string; text: string }[] = [
  {
    iconita: "cheie",
    titlu: "Originalele pe hârtie",
    text: "Actele pe hârtie predate spre arhivare stau în depozitul 3S, pe bază de proces-verbal, până le ceri înapoi.",
  },
  {
    iconita: "scut",
    titlu: "Fiecare dosar, pe nume",
    text: "Accesul se dă pe persoană și pe dosar, iar fiecare căutare și fiecare act deschis rămân în jurnal, cu numele și ora.",
  },
  {
    iconita: "glob",
    titlu: "Un singur loc: Germania",
    text: "Fișierele stau pe serverele Amazon din Germania, într-o singură regiune a UE.",
  },
  {
    iconita: "lacat",
    titlu: "AES-256 și TLS 1.2+",
    text: "Pe servere, fișierele stau criptate AES-256, iar între tine și 3S trec numai prin conexiuni TLS 1.2 sau mai noi.",
  },
];

// --- 01 Infrastructura ---------------------------------------------------------------------------

export const BLOC_INFRASTRUCTURA = {
  numar: "01",
  titlu: "Actele stau în Germania, pe serverele Amazon",
  subtitlu:
    "Arhiva 3S are o singură casă: o regiune Amazon din Germania, în Uniunea Europeană. Acolo stau fișierele păstrate de 3S, criptate AES-256, și de acolo pleacă spre tine numai prin conexiuni TLS 1.2 sau mai noi.",
  harta: {
    descriere: "Harta Europei cu o singură regiune de găzduire, în Germania.",
    eticheta: "Germania",
    // Pozitia reperului pe harta, in procente din cadru (proiectia hartii, `public/produs/harta-europa.svg`).
    reper: { x: 45.076, y: 47.39 },
    legenda: "Germania (UE)",
    nota: "O singură regiune: aici stau fișierele păstrate de 3S.",
  },
  specificatii: [
    {
      termen: "Furnizor de infrastructură",
      valoare: "Amazon, care găzduiește platforma 3S pe servere din Germania.",
      mono: null,
    },
    {
      termen: "Locul datelor",
      valoare: "Germania, o singură regiune a Uniunii Europene.",
      mono: null,
    },
    {
      termen: "Criptare la stocare",
      valoare: ", pentru fișierele păstrate pe serverele din Germania.",
      mono: "AES-256",
    },
    {
      termen: "Criptare în tranzit",
      valoare: " sau mai nou, pe conexiunile dintre tine și 3S.",
      mono: "TLS 1.2",
    },
  ] as { termen: string; valoare: string; mono: string | null }[],
};

// --- Verificarea din browser ---------------------------------------------------------------------

/** Punctul pe care il interogheaza cardul: serverul care serveste chiar pagina aceasta. */
export const CALE_SANATATE = "/api/sanatate";

export const VERIFICARE_BROWSER = {
  titlu: "Conexiunea la acest site, măsurată din browser",
  reia: "Măsoară din nou",
  chei: { server: "Server", criptare: "Conexiune criptată", timp: "Timp de răspuns" },
  // Starea din HTML-ul servit, inainte ca browserul sa masoare ceva.
  asteptare: { server: "se citește", criptare: "se verifică", timp: "se măsoară" },
  criptareDa: "Da, HTTPS",
  criptareNu: "Nu, HTTP",
  indisponibil: "indisponibil",
  nota: "Browserul tău trimite trei cereri spre serverul care servește această pagină; timpul afișat e mediana celor trei, în milisecunde.",
};

// --- 02 Stocarea proprie -------------------------------------------------------------------------

export const BLOC_STOCARE_PROPRIE = {
  numar: "02",
  titlu: "Actele pot rămâne în stocarea firmei",
  subtitlu:
    "În planul Enterprise, 3S se leagă de stocarea pe care firma o are deja, compatibilă S3 sau Azure Blob, iar colegii lucrează pe web și pe WhatsApp ca până atunci.",
  noduri: {
    firma: { eticheta: "Contul firmei", sub: "Stocare compatibilă S3 sau Azure Blob" },
    legatura: "Legătura 3S",
    aplicatie: { eticheta: "Web și WhatsApp", sub: "Întrebări cu pagina citată" },
  },
  beneficii: [
    {
      titlu: "Arhiva nu se mută",
      text: "Actele rămân în stocarea pe care firma o folosește deja; nu le copiezi nicăieri ca să lucrezi cu ele în 3S, nici acum, nici mai târziu, când arhiva crește.",
    },
    {
      titlu: "WhatsApp, ca înainte",
      text: "Colegii pun întrebări pe WhatsApp și pe web ca până acum, iar răspunsul vine tot cu documentul și pagina citată, oriunde ar sta fișierul pe care îl citează.",
    },
    {
      titlu: "Originalele, tot în depozitul 3S",
      text: "Hârtia predată spre arhivare stă mai departe în depozitul 3S, oriunde s-ar afla copia digitală.",
    },
    {
      titlu: "Jurnalul rămâne",
      text: "Accesul pe persoană și pe dosar și jurnalul deschiderilor rămân în 3S, oriunde stau fișierele.",
    },
  ],
  buton: { text: "Scrie-ne despre planul Enterprise", href: "/enterprise#contact-form", ruta: "/enterprise" } as Legatura,
  nota: "Varianta face parte din planul Enterprise.",
};

// --- 03 Criptarea --------------------------------------------------------------------------------

export const BLOC_CRIPTARE = {
  numar: "03",
  titlu: "Actele circulă criptat și stau criptate",
  subtitlu:
    "Între tine și 3S, actele trec prin conexiuni TLS 1.2 sau mai noi, iar pe serverele Amazon din Germania stau criptate AES-256, până la termen.",
  flux: {
    noduri: [
      { iconita: "ecran" as IconitaProdus, eticheta: "Calculator și telefon", sub: null as string | null },
      { iconita: "server" as IconitaProdus, eticheta: "Serverele 3S", sub: null as string | null },
      { iconita: "cilindru" as IconitaProdus, eticheta: "Arhiva criptată", sub: "Germania" as string | null },
    ],
    legaturi: ["TLS 1.2+", "AES-256"],
  },
  carduri: [
    {
      eticheta: "Pe drum",
      titlu: "TLS 1.2 sau mai nou",
      text: "Pe o rețea Wi-Fi publică, la hotel, în gară sau în aeroport, cine ascultă rețeaua vede doar date criptate: între dispozitivul tău și serverele 3S, actele trec numai prin TLS 1.2 sau mai nou.",
    },
    {
      eticheta: "Pe disc",
      titlu: "AES-256",
      text: "Fișierele stocate pe serverele din Germania sunt criptate AES-256. Criptarea le apără pe disc, cât timp rămân în arhiva 3S, de la preluare până la termen.",
    },
    {
      eticheta: "Locul",
      titlu: "Germania, o singură regiune",
      text: "Arhiva criptată stă pe serverele Amazon din Germania, într-o singură regiune a Uniunii Europene, aceeași pe care o arată harta de mai sus.",
    },
  ],
};

// --- 04 Cine vede ce -----------------------------------------------------------------------------

export type DreptMatrice = "da" | "nu" | "limitat";

export const BLOC_ACCES = {
  numar: "04",
  titlu: "Fiecare dosar are lista lui de oameni care îl pot deschide",
  subtitlu:
    "Accesul la acte se dă pe persoană și pe dosar, nu pe toată arhiva deodată. Fiecare deschidere lasă o urmă în jurnal, cu numele și ora, deci știi oricând cine a văzut un act.",
  matrice: {
    titlu: "Exemplu de drepturi pe roluri",
    capRol: "Rol",
    drepturi: ["Vizualizare", "Editare", "Descărcare", "Partajare", "Ștergere"],
    // Roluri si valori alese de noi pentru ilustrare, altele decat cele ale referintei vizuale.
    roluri: [
      { nume: "Administrator", descriere: "Conduce contul firmei", valori: ["da", "da", "da", "da", "da"] as DreptMatrice[] },
      { nume: "Coleg din birou", descriere: "Lucrează zilnic cu actele", valori: ["da", "da", "da", "nu", "nu"] as DreptMatrice[] },
      { nume: "Contabil extern", descriere: "Vede actele contabile", valori: ["limitat", "nu", "da", "nu", "nu"] as DreptMatrice[] },
      { nume: "Client prin portal", descriere: "Doar categoriile lui", valori: ["limitat", "nu", "nu", "nu", "nu"] as DreptMatrice[] },
    ],
    texte: { da: "Da", nu: "Nu", limitat: "Limitat" },
    // Declaratia D9, vizibila sub tabel: valorile sunt alese pentru ilustrare, nu drepturile
    // confirmate ale unui cont nou.
    nota: "Exemplu cu roluri și drepturi alese pentru ilustrare.",
  },
  controale: [
    {
      titlu: "Portal pentru clienți",
      text: "Fiecare client intră doar în categoriile pe care i le deschizi, iar o categorie deschisă primește singură actele noi, fără să le trimită cineva pe e-mail și fără să le caute clientul prin mesajele primite de la firmă.",
    },
    {
      titlu: "Intrare cu contul firmei",
      text: "Echipa poate intra cu conturile firmei din Microsoft Entra ID, Google sau Okta, prin SAML 2.0 sau OIDC, iar grupurile din director se aduc în 3S, fără o listă separată de utilizatori de ținut la zi.",
    },
    {
      titlu: "Jurnal pentru fiecare act",
      text: "Fiecare căutare și fiecare document deschis intră în jurnal, cu numele și ora.",
    },
    {
      titlu: "Dosare date pe nume",
      text: "Un coleg nou nu vede din prima zi toată arhiva: primește, pe numele lui, doar dosarele cu care lucrează, iar fiecare act deschis de el apare în jurnal, cu numele și ora, ca al oricărui alt coleg din firmă.",
    },
  ],
};

// --- 05 Ciclul de viata --------------------------------------------------------------------------

export const BLOC_CICLU = {
  numar: "05",
  titlu: "Fiecare act are un drum clar, de la preluare până la ieșirea din arhivă",
  subtitlu:
    "Știi în fiecare clipă unde e un act, cât mai stă în arhivă și cine hotărăște când iese. Hotărârea de a scoate un act rămâne întotdeauna a firmei, nu a 3S.",
  pasi: [
    { numar: "01", iconita: "incarcare" as IconitaProdus, titlu: "Preluare", text: "Hârtia, pe bază de proces-verbal; fișierele, prin TLS 1.2 sau mai nou." },
    { numar: "02", iconita: "cilindru" as IconitaProdus, titlu: "Păstrare", text: "Criptat AES-256, pe serverele din Germania." },
    { numar: "03", iconita: "arhiva" as IconitaProdus, titlu: "Evidență", text: "Trecut în registrul arhivei, cu categoria și dosarul lui." },
    { numar: "04", iconita: "ceas" as IconitaProdus, titlu: "Termen", text: "Păstrat atât cât cere categoria în care a intrat actul." },
    { numar: "05", iconita: "iesire" as IconitaProdus, titlu: "Ieșire din arhivă", text: "Ce a trecut de termen apare din timp, iar hotărârea îți aparține." },
  ],
};

// --- 06 Reglementare ------------------------------------------------------------------------------

export const BLOC_REGLEMENTARE = {
  numar: "06",
  titlu: "Registrul, jurnalul și locul datelor, gata de arătat",
  subtitlu:
    "Când cineva din afara firmei, un auditor sau un client, întreabă de acte, răspunsul se scoate din 3S, nu din sertare.",
  insigne: [
    { marca: "UE", nume: "Germania", nota: "o singură regiune" },
    { marca: "AES-256", nume: "La stocare", nota: "fișiere criptate" },
    { marca: "TLS 1.2+", nume: "În tranzit", nota: "pe toate conexiunile" },
    { marca: "Amazon", nume: "Infrastructura", nota: "servere în Germania" },
    { marca: "Jurnal", nume: "Acces", nota: "cu nume și oră" },
    { marca: "Registru", nume: "Evidența actelor", nota: "categorie și termen" },
  ],
  carduri: [
    {
      titlu: "Țara actelor, știută dinainte",
      text: "Fișierele stau în Germania, într-o singură regiune a Uniunii Europene, pe infrastructura Amazon. Știi dinainte, și poți spune oricui întreabă, în ce țară sunt actele firmei.",
    },
    {
      titlu: "Registrul arhivei, la zi",
      text: "Fiecare act e trecut în registru cu categoria și termenul lui de păstrare, gata de arătat la un control, fără să fie refăcut de mână înaintea fiecărei vizite și fără tabele ținute separat, în alt program.",
    },
    {
      titlu: "Jurnalul, pus la dispoziție",
      text: "Cine a căutat și cine a deschis fiecare act se vede în jurnal, cu numele și ora, iar jurnalul e al firmei, așa că îl poți da mai departe unui auditor când ți se cere, fără alte pregătiri sau exporturi.",
    },
    {
      titlu: "Originalele, în custodie",
      text: "Actele pe hârtie predate spre arhivare se preiau pe bază de proces-verbal și stau în depozitul 3S până le ceri, iar în arhiva digitală lucrezi între timp cu copia scanată, citită și clasată.",
    },
  ],
};

// --- 07 Originalele pe hartie --------------------------------------------------------------------

export const BLOC_ORIGINALE = {
  numar: "07",
  titlu: "Și originalele pe hârtie, predate spre arhivare, au regulile lor",
  subtitlu:
    "O arhivă sigură nu se oprește la fișiere. Actele pe hârtie predate spre arhivare în depozitul 3S au propriul drum, de la preluare până la restituire, cu un proces-verbal la predare și o listă scrisă cu cine poate cere originalul înapoi.",
  controale: [
    {
      titlu: "Preluare cu proces-verbal",
      text: "Fiecare lot de acte predat spre arhivare se preia pe bază de proces-verbal, ca să știi oricând ce ai predat și când.",
    },
    {
      titlu: "Păstrare în depozit",
      text: "Originalele stau pe rafturi, în depozitul 3S, până când le ceri înapoi, iar în arhiva digitală lucrezi între timp cu copia lor scanată.",
    },
    {
      titlu: "Restituire la cerere",
      text: "Un original scanat îți rămâne oricând la dispoziție: îl ceri, iar dosarul se întoarce la firmă.",
    },
    {
      titlu: "Listă nominală de solicitanți",
      text: "Un original îl cere doar cine e trecut în scris pe lista firmei, nu oricine sună la depozit sau scrie un e-mail.",
    },
  ],
};

// --- 08 Raportarea vulnerabilitatilor ------------------------------------------------------------

// Titlul numeste norma (raportarea responsabila), iar lista spune ce cuprinde mesajul; regula de a
// nu publica detaliile sta o singura data, in paragraf. Titlul are 2 randuri la 1440 si la 390.
export const BLOC_RAPORTARE = {
  numar: "08",
  titlu: "Raportarea responsabilă a unei vulnerabilități în 3S",
  text: "Ca să putem reproduce problema, scrie-ne pe pagina de contact un mesaj cu cele trei lucruri de mai jos. Dacă e vorba de un act anume, dă-ne numele fișierului, nu conținutul lui. Până la reparare, te rugăm să păstrezi detaliile între noi, ca alte conturi să nu rămână expuse.",
  lista: [
    "Adresa exactă a paginii afectate și ora la care ați observat problema.",
    "Pașii, în ordine, prin care putem vedea și noi problema pe ecranul nostru.",
    "Contul folosit la test: lucrează numai pe contul și pe actele propriei firme.",
  ],
  buton: { text: "Pagina de contact", href: "/contact", ruta: "/contact" } as Legatura,
  nota: "Menționează „securitate” în subiectul mesajului.",
};

// --- 09 Intrebari frecvente ----------------------------------------------------------------------

export const INTREBARI_SECURITATE: BlocIntrebari & { numar: string } = {
  numar: "09",
  titlu: "Întrebări frecvente despre securitate",
  intrebari: [
    {
      intrebare: "În ce țară și la ce furnizor stau fișierele?",
      raspuns:
        "Pe serverele Amazon din Germania, într-o singură regiune a Uniunii Europene, cea marcată pe harta de mai sus. Fișierele sunt criptate AES-256 pe disc și circulă doar prin conexiuni TLS 1.2 sau mai noi. Originalele pe hârtie, dacă le predai spre arhivare, stau în depozitul 3S.",
    },
    {
      intrebare: "Cum sunt criptate fișierele?",
      raspuns:
        "Pe serverele din Germania, fișierele stau criptate AES-256 cât timp sunt în arhivă. Între dispozitivul tău și 3S circulă numai prin TLS 1.2 sau o versiune mai nouă.",
    },
    {
      intrebare: "Cine poate vedea un dosar?",
      raspuns:
        "Doar cine are acces nominal la el. Accesul se dă pe persoană și pe dosar, clienții intră prin portal numai în categoriile pe care le deschizi tu, iar fiecare document deschis rămâne în jurnal, cu numele și ora.",
    },
    {
      intrebare: "Putem folosi stocarea proprie a firmei?",
      raspuns:
        "Da, în planul Enterprise: 3S se leagă de o stocare compatibilă S3 sau Azure Blob din contul firmei, iar colegii întreabă pe web și pe WhatsApp ca până atunci.",
    },
    {
      intrebare: "Ce se întâmplă cu originalele pe hârtie?",
      raspuns:
        "Se preiau pe bază de proces-verbal și stau pe rafturi, în depozitul 3S, până când le ceri înapoi. Un original îl poate cere doar cine e trecut în scris pe lista firmei.",
    },
    {
      intrebare: "Ce se întâmplă când un act ajunge la termenul de păstrare?",
      raspuns:
        "Termenul se calculează după categoria actului, iar ce poate ieși din arhivă apare din timp. Hotărârea de a scoate un act rămâne a firmei.",
    },
  ],
};

// --- Seiful --------------------------------------------------------------------------------------

export const SEIF = {
  // Titlul pe un rand si subtitlul pe doua, si la 390 (forma masurata: 1 + 2 randuri la ambele
  // latimi), ca varianta statica sa aiba inaltimea referintei plus doar camera crescuta dupa continut.
  titlu: "Trei acte sub cheie",
  subtitlu: "Derulează mai departe: zăvoarele se trag pe rând, roata se învârte și apoi ușa se deschide.",
  // Varianta pentru miscare redusa: usa lipseste, deci textul nu descrie animatia. Tot pe 2 randuri
  // (masurat: 93 de caractere = 2 randuri la 640 px si la 358 px; 84 incapeau pe unul si scadeau inaltimea).
  subtitluStatic: "Când animațiile sunt reduse din setări, camera seifului rămâne deschisă, iar cele trei acte se văd de la început.",
  declaratie: "Exemplu cu nume de fișiere fictive.",
  // Eticheta vizibila din coltul camerei (decizia D11): un rand numeste o factura.
  etichetaExemplu: "exemplu",
  randuri: [
    { fisier: "Proces_verbal_predare_exemplu.pdf", pastrat: "hârtia, pe raft" },
    { fisier: "Factura_0415_exemplu.pdf", pastrat: "copia, criptată AES-256" },
    { fisier: "Dosar_personal_exemplu.pdf", pastrat: "accesul, doar pe nume" },
  ],
  nota: "Pentru fiecare act, 3S ține hârtia în depozit, copia criptată și lista celor care o pot deschide.",
  buton: { text: "Testează gratuit", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } as Legatura,
  stare: { inchis: "Încuiat", deschis: "Descuiat" },
};

export function toateLegaturileSecuritate(): Legatura[] {
  return [BLOC_STOCARE_PROPRIE.buton, BLOC_RAPORTARE.buton, SEIF.buton];
}

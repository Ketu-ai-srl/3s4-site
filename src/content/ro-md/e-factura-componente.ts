// Continutul paginii "Arhiva e-Factura" pe editia `ro-MD` (`/ro/e-factura` pe 3s.md, `/e-factura` pe 3s.com.ro):
// serviciul de arhivare automata a facturilor din RO e-Factura, in pregatire, cu inscriere la acces timpuriu.
//
// SURSA TEXTULUI: textul paginii v1 din 25.10.2026, aprobat ca directie de owner (sectiunile Meta, Erou, 1-7 si Final),
// cuvant cu cuvant, la "tu". Notele de sursa ale textului (J, P) nu sunt text vizibil: ele stau in registrul de afirmatii
// al feliei (`src/content/afirmatii/ro-md-e-factura.json`). Grila de calcul a preturilor nu apare pe site, numai tabelul.
//
// ABATERILE DE LA TEXT, cu motivul (scrise si in raportul feliei):
//   - §5, randul 2: textul il marca DE CONFIRMAT TEHNIC; pe site sta varianta redusa, fara "numai pentru descarcare" si
//     fara jurnal, cum cerea nota textului pentru cazul neconfirmat.
//   - §5, randul 1: "cu regiunea principala la Frankfurt", forma deciziei 42 pe care o cita textul ("afirmatia existenta a
//     site-ului"); "la Frankfurt" singur ar fi spus mai mult decat afirmatia confirmata.
//   - Meta: titlul (70 de caractere) si descrierea (186) treceau de pragurile portii de SEO (65 si 160); titlul pierde
//     "automat", descrierea pierde sigiliul (ramas in subtitlu si in §3).
//
// Modulul e numai date. Il citesc pagina (`src/app/(romd)/ro/e-factura/page.romd.tsx`) si modulul paginii (`e-factura.ts`).

import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";
import { ctaFinalReferintaRoMd } from "@/content/ro-md/ghid-e-facturare-componente";

/** Calea SURSA a paginii (pe 3s.com.ro e servita fara prefix, `src/lib/asezare.ts`). */
export const CALE_EFACTURA_RO_MD = "/ro/e-factura";

/** Codul `ref` al paginii; codurile stau in constante, nu in proza (poarta de limba citeste proza). */
export const REF_EFACTURA_RO_MD = "ro-md-e-factura";

/** Un pas, un element de lista sau o intrebare cu inceputul ingrosat: `accent` + `rest`, citite impreuna ca o fraza. */
export type FrazaAccent = { accent: string; rest: string };

export type ContinutArhivaEfactura = {
  erou: {
    fir: { text: string; cale: string }[];
    eticheta: string;
    titlu: string;
    subtitlu: string;
    buton: string;
    subButon: string;
  };
  fereastra: { titlu: string; paragrafe: string[] };
  pasi: { titlu: string; pasi: FrazaAccent[]; nota: string };
  primesti: { titlu: string; elemente: (FrazaAccent & { iconita: string })[] };
  contabili: { titlu: string; text: string };
  siguranta: { titlu: string; elemente: string[] };
  preturi: {
    titlu: string;
    capete: [string, string, string];
    randuri: { pachet: string; include: string; pret: string }[];
    nota: string;
  };
  intrebari: { titlu: string; intrebari: { intrebare: string; raspuns: string }[] };
};

export const EFACTURA_RO_MD: ContinutArhivaEfactura = {
  erou: {
    fir: [
      { text: "Acasă", cale: "/ro" },
      { text: "Arhiva e-Factura", cale: CALE_EFACTURA_RO_MD },
    ],
    eticheta: "Acces timpuriu",
    titlu: "Facturile din SPV, păstrate automat cât cere legea",
    subtitlu:
      "Din SPV poți descărca o e-factură doar 60 de zile de la publicare. 3S le va descărca în fiecare zi pe toate, emise și primite, și le va păstra în arhiva firmei, cu XML-ul original, sigiliul Ministerului Finanțelor și o copie PDF pentru citit.",
    buton: "Scrie-ne pe WhatsApp - te înscriem la acces timpuriu",
    subButon: "Serviciul e în pregătire. Îți păstrăm locul și prețul de lansare; nu îți cerem certificatul digital până la pornire.",
  },
  fereastra: {
    titlu: "SPV-ul e o fereastră de 60 de zile, nu o arhivă",
    paragrafe: [
      "În RO e-Factura, fișierul unei facturi se poate descărca direct 60 de zile de la publicarea lui în sistem. După aceea, ANAF îl arhivează și îl eliberează doar la cerere. Legea îți cere însă să păstrezi facturile 5 ani, socotiți de la 1 iulie a anului care urmează încheierii exercițiului financiar.",
      "Până atunci, facturile ajung descărcate de mână, pe calculatoarele cui are timp, în foldere cu nume diferite. Una lipsește exact când o cere un control, un auditor sau banca.",
    ],
  },
  pasi: {
    titlu: "Trei pași, o singură dată",
    pasi: [
      { accent: "Îți faci contul 3S.", rest: "Adaugi firma după CUI." },
      {
        accent: "Autorizezi 3S pe site-ul ANAF.",
        rest: "Te autentifici cu certificatul tău digital calificat pe pagina oficială ANAF; parola și PIN-ul certificatului nu ajung la noi.",
      },
      { accent: "Facturile vin singure.", rest: "În fiecare zi, 3S descarcă facturile emise, cele primite și mesajele de eroare ANAF." },
    ],
    nota: "Autorizarea ANAF se reînnoiește periodic; 3S îți spune din timp când e cazul.",
  },
  primesti: {
    titlu: "Fiecare factură, în forma care contează legal",
    elemente: [
      {
        iconita: "file-badge",
        accent: "XML-ul original și sigiliul electronic al Ministerului Finanțelor",
        rest: ", exact cum le-a livrat ANAF. Acesta e documentul; PDF-ul e doar copia pentru citit.",
      },
      { iconita: "refresh-cw", accent: "Facturile emise, cele primite și erorile ANAF", rest: ", din fiecare zi." },
      {
        iconita: "search",
        accent: "Căutare în cuvintele tale:",
        rest: " scrii „facturile de energie din martie” și primești lista, fiecare cu documentul-sursă.",
      },
      { iconita: "download", accent: "Export CSV și pachetul lunar ZIP", rest: " pentru contabil." },
      {
        iconita: "archive",
        accent: "Facturile lângă restul documentelor firmei:",
        rest: " contracte, procese-verbale, actele scanate de pe hârtie, toate în aceeași arhivă.",
      },
    ],
  },
  contabili: {
    titlu: "Toți clienții tăi, într-un singur cont",
    text: "Ca împuternicit în SPV, poți autoriza 3S o dată cu certificatul tău pentru toate firmele pe care le reprezinți. Clientul care preferă să-și păstreze certificatul primește de la tine un link și autorizează singur, pe site-ul ANAF. Facturile fiecărui client apar zilnic în contul tău, separate pe CUI, cu pachetul lunar gata de descărcat.",
  },
  siguranta: {
    titlu: "Unde stau facturile și cine le vede",
    elemente: [
      "Arhiva e găzduită în Uniunea Europeană, cu regiunea principală la Frankfurt.",
      "Cheia de acces primită de la ANAF se păstrează criptat.",
      "Poți retrage oricând autorizarea, din 3S sau din ANAF.",
      "Arhiva e a ta: o exporți oricând, inclusiv după încheierea abonamentului.",
    ],
  },
  preturi: {
    titlu: "Prețuri pe firmă, în euro, fără TVA",
    capete: ["Pachet", "Ce include", "Preț"],
    randuri: [
      { pachet: "Gratuit", include: "o firmă, până la 100 de facturi pe an", pret: "0 EUR" },
      { pachet: "Firmă", include: "până la 100 de facturi pe lună", pret: "8,49 EUR / an" },
      { pachet: "Firmă plus", include: "până la 1.000 de facturi pe lună", pret: "17,76 EUR / an" },
      { pachet: "Firmă max", include: "până la 10.000 de facturi pe lună", pret: "34,75 EUR / an" },
      { pachet: "Cabinet", include: "firme nelimitate, până la 3.000 de facturi pe lună în total", pret: "61,69 EUR / an" },
      { pachet: "Cabinet max", include: "firme nelimitate, până la 30.000 de facturi pe lună în total", pret: "181,33 EUR / an" },
    ],
    nota: "Prețul pachetului se aplică fiecărei firme (CUI); pachetele Cabinet acoperă oricâte firme. Clienții înscriși la acces timpuriu păstrează prețul de lansare 24 de luni.",
  },
  intrebari: {
    titlu: "Întrebări frecvente",
    intrebari: [
      {
        intrebare: "Facturile dispar din SPV după 60 de zile?",
        raspuns: "Nu dispar: după 60 de zile nu le mai poți descărca direct, iar ANAF le eliberează la cerere. 3S le descarcă înainte, zilnic.",
      },
      {
        intrebare: "Cât trebuie păstrate facturile?",
        raspuns:
          "5 ani, de la 1 iulie a anului care urmează încheierii exercițiului financiar. Pentru bunurile cu durată de folosință mai lungă și pentru situațiile financiare anuale (10 ani), termenul e mai lung.",
      },
      {
        intrebare: "E nevoie de o arhivă electronică acreditată?",
        raspuns:
          "Pentru facturi, nu: Codul fiscal permite stocarea electronică fără acreditare, cu condiția ca facturile să rămână autentice, întregi și lizibile.",
      },
      {
        intrebare: "Ce se întâmplă cu facturile mai vechi de 60 de zile?",
        raspuns:
          "La pornire, 3S le preia pe cele aflate încă în fereastră. Pe cele mai vechi le poți încărca din calculator, iar 3S le pune în aceeași arhivă.",
      },
      {
        intrebare: "Am nevoie de certificat digital?",
        raspuns:
          "Da, pentru autorizarea pe site-ul ANAF: al tău, al reprezentantului legal sau al împuternicitului. Certificatul rămâne la tine.",
      },
    ],
  },
};

/**
 * Blocul de final: titlul si textul sectiunii Final a textului, restul comun paginilor /ro de referinta (microtextul si
 * vizualul cu date fictive declarate, `ctaFinalReferintaRoMd`). Butonul il pune pagina: canalul WhatsApp, cu `ref`-ul paginii.
 */
export const CTA_FINAL_EFACTURA_RO_MD: ContinutCtaFinal = ctaFinalReferintaRoMd(
  "Intră printre primii",
  "Scrie-ne pe WhatsApp numele firmei și câte facturi ai pe lună. Te anunțăm la pornire și îți păstrăm prețul de lansare.",
);

/** Eticheta butonului din blocul de final (aceeasi ca pe celelalte pagini /ro, decizia 35). */
export const ETICHETA_BUTON_FINAL_EFACTURA_RO_MD = "Scrie-ne pe WhatsApp";

/**
 * Blocul "Arhiva e-Factura" de pe pagina de preturi `/ro/preturi` (pe 3s.com.ro `/preturi`), langa abonamentele
 * existente (cererea owner-ului din 25.10.2026: preturile e-Factura si in blocul de preturi). Aceleasi sase pachete si
 * aceleasi sume ca pe pagina serviciului (un singur loc: `EFACTURA_RO_MD.preturi`), eticheta de acces timpuriu, nota
 * despre pretul pe firma si legatura spre pagina serviciului. Doar editia romana; `/pricing` ramane neschimbata.
 */
export const BLOC_PRETURI_EFACTURA_RO_MD = {
  eticheta: "Acces timpuriu",
  titlu: "Arhiva e-Factura",
  text: EFACTURA_RO_MD.preturi.titlu + ".",
  capete: EFACTURA_RO_MD.preturi.capete,
  randuri: EFACTURA_RO_MD.preturi.randuri,
  nota: "Prețul pachetului se aplică fiecărei firme (CUI); pachetele Cabinet acoperă oricâte firme.",
  legatura: { text: "Cum funcționează Arhiva e-Factura", href: CALE_EFACTURA_RO_MD, ruta: CALE_EFACTURA_RO_MD },
};

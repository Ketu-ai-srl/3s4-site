// Continutul componentelor paginii despre 3S pe editia `ro-MD` (P11, `/ro/securitate` pe 3s.md): aceleasi componente si
// aceeasi compunere ca pagina RO `/securitate` si ca perechea EN `/about` (decizia 53), cu textul in romana de business,
// la "tu". Constantele sunt tipate pe contractele structurale ale lui `PaginaSecuritate` si ale vederii verificarii.
//
// SURSA TEXTULUI, pe camp: fisa paginii (ro-md/securitate.md), sectiunea "Textele componentelor (decizia 53)", cu cheia
// campului RO (de pilda `securitate.ts:47`) in comentariu, inclusiv runda deciziei 63 (pe paginile in romana se spun si
// legea SUA, si cadrul UE). Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
//
// VARIANTELE CONDITIONATE ale fisei se aleg din cod, ca pe startul /ro (`acasa.ts`, `operatorInregistrat`): fraza
// "operat din Republica Moldova" (titlul, subtitlul, pilonul, insigna si intrebarea "Cine opereaza 3S?") e adevarata abia
// dupa inregistrarea firmei operatoare; pana atunci se randeaza variantele fisei de dinaintea inregistrarii.
//
// ABATERE DE LA FISA, scrisa aici ca sa se vada: fisa scoate insigna si cardul legaturii de partajare (fara intrare in
// registru) si lasa 5 insigne si 3 carduri, fata de 6 si 4 pe RO si pe EN. Congruenta (decizia 53, lista declarata
// `config/congruenta/p11.json`: "insignele raman 6 si cardurile 4, ca pe RO") cere sloturile; le iau fapte confirmate,
// ca pe EN: raspunsul cu sursa (`ro-md-arhiva-cu-sursa`). Textul lor e scris de constructor, PROPUS, de vazut la critici.
//
// CE NU INTRA, ca pe EN: StocareProprie (d43), Criptare (d31), Acces (d43, d31), Originale (poarta juridica a deciziilor
// 40-41), Raportare (d31) si Seiful (aceeasi poarta, d31). Blocurile numerotate ramase se citesc 01-04.
//
// Modulul e numai date: il importa si invelitoarea client a verificarii.

import type { ContinutPaginaSecuritate, SectiuneSecuritate } from "@/components/produs/PaginaSecuritate";
import type { ContinutVerificareBrowser } from "@/components/produs/VerificareBrowserVedere";

/** Sectiunile montate pe 3s.md, in ordinea componentei (ca pe EN). */
export const SECTIUNI_SECURITATE_RO_MD: readonly SectiuneSecuritate[] = [
  "erou",
  "piloni",
  "infrastructura",
  // `verificare` (conexiunea la acest site, masurata din browser) a iesit: felia 164, documentul lui Adrian Mihai din
  // 04.11.2026 („masoara site-ul de prezentare, nu platforma”), GO owner 04.11; randul de congruenta e in p11-ro.json (pe /about EN verificarea ramane, decizia Marian 04.11).
  "ciclu",
  "reglementare",
  "intrebari",
];

/** Numele accesibil al sectiunii de verificare (`PaginaSecuritate.tsx:94`): implicitul RO, scris aici ca pe EN. */
export const ETICHETA_VERIFICARE_RO_MD = "Verificarea conexiunii din browser";

/**
 * Ancorele paginii, aceleasi ca pe EN (`security`, `limits`): tinte ale legaturilor de pe paginile /ro (platforma,
 * enterprise) si ale subsolului.
 */
export const ANCORE_SECURITATE_RO_MD = { securitate: "security", limite: "limits" } as const;

/** Sectiunile, impartite la ancore, ca pe EN; reuniunea bucatilor, in ordine, e `SECTIUNI_SECURITATE_RO_MD`. */
export const BUCATI_SECURITATE_RO_MD: { ancora: string | null; sectiuni: readonly SectiuneSecuritate[] }[] = [
  { ancora: null, sectiuni: ["erou", "piloni"] },
  { ancora: ANCORE_SECURITATE_RO_MD.securitate, sectiuni: ["infrastructura", "ciclu", "reglementare"] },
  { ancora: ANCORE_SECURITATE_RO_MD.limite, sectiuni: ["intrebari"] },
];

/** Titlul (H1, titlul paginii): cu operatorul numai dupa inregistrarea firmei (variantele conditionate ale fisei). */
export function titluSecuritateRoMd(operator: boolean): string {
  return operator ? "Despre 3S: ce este, cine este în spatele lui și unde sunt datele" : "Despre 3S: ce este și unde sunt păstrate datele";
}

/** Continutul componentelor, cu variantele alese dupa starea firmei operatoare. */
export function securitateRoMd(operator: boolean): ContinutPaginaSecuritate {
  return {
    // securitate.ts:38-39.
    fir: [
      { text: "Acasă", cale: "/ro" },
      { text: "Despre 3S și securitate", cale: "/ro/securitate" },
    ],
    erou: {
      // securitate.ts:44, :47.
      titlu: titluSecuritateRoMd(operator),
      subtitlu: operator
        ? "3S este o arhivă digitală cu căutare AI, dezvoltată în parteneriat cu grupul Adria Arhivare din România și administrată de o companie din Republica Moldova. Fișierele încărcate stau pe serverele Amazon Web Services, în Uniunea Europeană."
        : "3S este o arhivă digitală cu căutare AI, dezvoltată în parteneriat cu grupul Adria Arhivare din România: fiecare răspuns vine cu documentul din care provine. Fișierele încărcate stau pe serverele Amazon Web Services, în Uniunea Europeană.",
    },
    piloni: {
      // securitate.ts:52-73. Iconitele nu sugereaza protectie (d31).
      titlu: "3S, pe scurt",
      elemente: [
        {
          iconita: "arhiva",
          titlu: "O arhivă care răspunde",
          text: "Documentele companiei stau în 3S, iar fiecare răspuns vine cu documentul din care provine.",
        },
        operator
          ? {
              iconita: "panou",
              titlu: "Cine este în spatele lui",
              text: "3S este dezvoltat în parteneriat cu grupul Adria Arhivare din România și administrat de o companie din Republica Moldova. Datele complete sunt pe pagina Informații legale.",
            }
          : {
              iconita: "panou",
              titlu: "Întrebări în română",
              text: "Pui întrebările în română, direct din browser, fără cuvinte-cheie.",
            },
        {
          iconita: "glob",
          titlu: "Servere în UE",
          text: "Fișierele stau pe servere din Uniunea Europeană.",
        },
        {
          iconita: "server",
          titlu: "Găzduit de Amazon",
          text: "Amazon semnează cu clienții un acord de prelucrare a datelor conform GDPR. Legea americană CLOUD Act îi poate cere însă datele pe care le administrează.",
        },
      ],
    },
    infrastructura: {
      // securitate.ts:80-111.
      numar: "01",
      titlu: "Unde sunt păstrate documentele companiei?",
      subtitlu:
        "Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală la Frankfurt, pe serverele Amazon Web Services (AWS). Tot acolo rulează și platforma 3S, cu conturile și arhiva.",
      harta: {
        descriere: "Harta Europei cu regiunea principală de găzduire, Frankfurt, în UE.",
        eticheta: "Frankfurt",
        // Acelasi reper ca pe EN (Frankfurt in proiectia hartii); calculul e in `en/despre-componente.ts`.
        reper: { x: 43.017, y: 50.58 },
        legenda: "Frankfurt (UE)",
        nota: "Frankfurt (UE): aici sunt păstrate fișierele.",
      },
      specificatii: [
        { termen: "Furnizor de găzduire", valoare: "Amazon Web Services, companie americană, cu sediu european în Luxemburg.", mono: null },
        { termen: "Unde sunt datele", valoare: "În Uniunea Europeană.", mono: null },
        { termen: "Protecția datelor (GDPR)", valoare: "Amazon semnează cu clienții un acord de prelucrare a datelor.", mono: null },
        { termen: "Legea SUA (CLOUD Act)", valoare: "Poate cere Amazon datele pe care le administrează.", mono: null },
      ],
    },
    ciclu: {
      // securitate.ts:249-258; renumerotat (blocurile 02-04 ale RO nu se monteaza).
      numar: "02",
      titlu: "Drumul unui document în 3S, de la încărcare la termenul de păstrare",
      subtitlu: "Pentru fiecare dosar, compania ta stabilește cât timp se păstrează documentele. Știi oricând unde sunt și până când.",
      pasi: [
        { numar: "01", iconita: "incarcare", titlu: "Încărcare", text: "Le încarci direct din browser, în arhiva companiei tale." },
        { numar: "02", iconita: "cilindru", titlu: "Păstrare", text: "Pe servere din UE." },
        { numar: "03", iconita: "arhiva", titlu: "Citire", text: "3S citește textul și recunoaște ce fel de document este." },
        { numar: "04", iconita: "ceas", titlu: "Termen", text: "Păstrat până la termenul stabilit pentru dosarul lui." },
        { numar: "05", iconita: "iesire", titlu: "Decizia este a ta", text: "Termenul fiecărui dosar îl stabilești tu, cu consultantul dedicat companiei." },
      ],
    },
    reglementare: {
      // securitate.ts:265-292; sloturile legaturii de partajare (insigna :274, cardul :287-:288) iau raspunsul cu sursa.
      numar: "03",
      titlu: "Ce poți arăta unui auditor sau unui client",
      subtitlu: "Când un auditor sau un client întreabă unde sunt documentele și cât timp se păstrează, răspunsul îl găsești în 3S.",
      insigne: [
        { marca: "UE", nume: "Frankfurt", nota: "regiunea principală" },
        { marca: "Export", nume: "Documente", nota: "la nevoie" },
        operator
          ? { marca: "MD", nume: "Companie", nota: "din Republica Moldova" }
          : { marca: "RO", nume: "Întrebări", nota: "în limba română" },
        { marca: "Amazon", nume: "SUA și UE", nota: "CLOUD Act și GDPR" },
        { marca: "AI", nume: "Răspunsuri", nota: "cu documentul-sursă" },
        { marca: "Dosar", nume: "Termen de păstrare", nota: "stabilit pe dosar" },
      ],
      carduri: [
        {
          titlu: "Știi dinainte unde sunt datele",
          text: "Fișierele stau pe serverele Amazon, în UE. Știi de la început unde sunt documentele companiei și poți răspunde oricui întreabă.",
        },
        {
          titlu: "Termenul, stabilit pe dosar",
          text: "Pentru fiecare dosar stabilești termenul de păstrare, valabil pentru toate documentele din el. Când cineva întreabă cât timp se păstrează un document, găsești răspunsul pe dosarul lui, în 3S.",
        },
        {
          titlu: "Răspunsurile, cu sursa lor",
          text: "Fiecare răspuns din 3S vine cu documentul din care provine. Când un client sau un auditor întreabă de unde știi ceva, îi arăți documentul.",
        },
        {
          titlu: "Documentele, oricând la îndemână",
          text: "Le descarci oricând ai nevoie de ele în afara platformei, de exemplu pentru un eventual control.",
        },
      ],
    },
    intrebari: {
      // securitate.ts:349-380; renumerotat. "Cine opereaza 3S?" numai dupa inregistrarea firmei.
      numar: "04",
      titlu: "Întrebări despre 3S și datele companiei",
      intrebari: [
        {
          intrebare: "Unde și la ce furnizor sunt păstrate fișierele?",
          raspuns:
            "Pe serverele Amazon Web Services, în Uniunea Europeană (locul marcat pe hartă). Unde anume prelucrează documentele funcțiile AI îți spunem la cerere, înainte să ne trimiți documente reale.",
        },
        // Intrebarea „Ce prevad legea SUA si GDPR?” a iesit (felia 164, decizia lui Adrian Mihai din 03.11.2026, GO owner
        // 04.11): prea multa informatie juridica pentru un client; CLOUD Act ramane numai in forma scurta, mai sus.
        ...(operator
          ? [
              {
                intrebare: "Cine este în spatele 3S?",
                raspuns: "3S este dezvoltat în parteneriat cu grupul Adria Arhivare din România și administrat de o companie din Republica Moldova. Datele complete sunt pe pagina Informații legale.",
              },
            ]
          : []),
        {
          intrebare: "Ce este încă în teste și ce nu avem?",
          raspuns:
            "Întrebările în engleză pe documente în română și afișarea paginii exacte sunt în teste. Semnătura electronică calificată nu există încă în 3S.",
        },
        {
          intrebare: "De ce nu avem recenzii de la clienți?",
          raspuns:
            "Nu publicăm nume de clienți, cifre sau recenzii. Poți verifica 3S, în schimb, prin ghidurile cu surse și printr-un test gratuit pe documentele companiei tale.",
        },
        {
          intrebare: "Cine stabilește cât timp se păstrează un document?",
          raspuns:
            "Compania ta. Termenul se stabilește pe dosar și este valabil pentru toate documentele din el. Decizia este a ta.",
        },
      ],
    },
  };
}

/** Verificarea conexiunii (securitate.ts:122-130): spune ca masoara acest site, nu platforma (intrebarea 9). */
export const VERIFICARE_RO_MD: ContinutVerificareBrowser = {
  titlu: "Conexiunea la acest site, măsurată din browser",
  reia: "Măsoară din nou",
  chei: { server: "Server", criptare: "Conexiune criptată", timp: "Timp de răspuns" },
  asteptare: { server: "se citește", criptare: "se verifică", timp: "se măsoară" },
  criptareDa: "Da, HTTPS",
  criptareNu: "Nu, HTTP",
  indisponibil: "indisponibil",
  nota: "Browserul tău trimite trei cereri către serverul care găzduiește acest site, separat de platforma 3S; timpul afișat este mediana lor, în milisecunde.",
};

/** Punctul de sanatate interogat de verificare: acelasi server care serveste pagina. */
export const CALE_SANATATE_RO_MD = "/api/sanatate";

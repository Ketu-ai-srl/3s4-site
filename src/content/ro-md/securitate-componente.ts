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
  "verificare",
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
  { ancora: ANCORE_SECURITATE_RO_MD.securitate, sectiuni: ["infrastructura", "verificare", "ciclu", "reglementare"] },
  { ancora: ANCORE_SECURITATE_RO_MD.limite, sectiuni: ["intrebari"] },
];

/** Titlul (H1, titlul paginii): cu operatorul numai dupa inregistrarea firmei (variantele conditionate ale fisei). */
export function titluSecuritateRoMd(operator: boolean): string {
  return operator ? "Despre 3S: ce este, cine îl operează și unde sunt datele" : "Despre 3S: ce este și unde sunt păstrate datele";
}

/** Continutul componentelor, cu variantele alese dupa starea firmei operatoare. */
export function securitateRoMd(operator: boolean): ContinutPaginaSecuritate {
  return {
    // securitate.ts:38-39.
    fir: [
      { text: "Acasă", cale: "/ro" },
      { text: "Despre 3S", cale: "/ro/securitate" },
    ],
    erou: {
      // securitate.ts:44, :47.
      titlu: titluSecuritateRoMd(operator),
      subtitlu: operator
        ? "3S Scan Store Solve este o arhivă digitală cu căutare AI, operată din Republica Moldova. Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services."
        : "3S Scan Store Solve este o arhivă digitală cu căutare AI: fiecare răspuns indică documentul din care provine. Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services.",
    },
    piloni: {
      // securitate.ts:52-73. Iconitele nu sugereaza protectie (d31).
      titlu: "3S, în câteva fapte",
      elemente: [
        {
          iconita: "arhiva",
          titlu: "O arhivă care răspunde",
          text: "Documentele firmei stau în arhiva digitală 3S, iar fiecare răspuns indică documentul din care provine.",
        },
        operator
          ? {
              iconita: "panou",
              titlu: "Operat din Moldova",
              text: "Serviciul este operat din Republica Moldova, iar firma operatoare este prezentată pe pagina Informații legale.",
            }
          : {
              iconita: "panou",
              titlu: "Întrebări în română",
              text: "Formulezi întrebările în română, direct din browser, fără cuvinte-cheie sau operatori de căutare.",
            },
        {
          iconita: "glob",
          titlu: "Frankfurt, în UE",
          text: "Regiunea principală de găzduire este Frankfurt, în Uniunea Europeană.",
        },
        {
          iconita: "server",
          titlu: "Găzduit de Amazon",
          text: "Amazon oferă un acord de prelucrare a datelor conform GDPR, iar legea SUA (CLOUD Act) îl poate obliga să predea datele aflate sub controlul său.",
        },
      ],
    },
    infrastructura: {
      // securitate.ts:80-111.
      numar: "01",
      titlu: "Unde sunt păstrate documentele firmei?",
      subtitlu:
        "Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services (AWS). Tot acolo rulează platforma 3S, cu conturile utilizatorilor și arhiva digitală.",
      harta: {
        descriere: "Harta Europei cu regiunea principală de găzduire, Frankfurt, în UE.",
        eticheta: "Frankfurt",
        // Acelasi reper ca pe EN (Frankfurt in proiectia hartii); calculul e in `en/despre-componente.ts`.
        reper: { x: 43.017, y: 50.58 },
        legenda: "Frankfurt (UE)",
        nota: "Regiunea principală: aici sunt păstrate fișierele încărcate.",
      },
      specificatii: [
        { termen: "Furnizor de găzduire", valoare: "Amazon Web Services (SUA), cu o entitate europeană în Luxemburg.", mono: null },
        { termen: "Locul datelor", valoare: "În Uniunea Europeană, regiunea principală Frankfurt.", mono: null },
        { termen: "Cadrul UE (GDPR)", valoare: "AWS oferă clienților acordul de prelucrare a datelor (DPA).", mono: null },
        { termen: "Legea SUA (CLOUD Act)", valoare: "Poate obliga Amazon să predea datele aflate sub controlul său.", mono: null },
      ],
    },
    ciclu: {
      // securitate.ts:249-258; renumerotat (blocurile 02-04 ale RO nu se monteaza).
      numar: "02",
      titlu: "Drumul unui document în 3S, de la încărcare la termenul de păstrare",
      subtitlu: "Pentru fiecare dosar, firma ta stabilește cât timp se păstrează documentele. Știi oricând unde sunt păstrate și până când.",
      pasi: [
        { numar: "01", iconita: "incarcare", titlu: "Încărcare", text: "Fișierele se încarcă direct din browser, în arhiva firmei." },
        { numar: "02", iconita: "cilindru", titlu: "Păstrare", text: "În UE, cu regiunea principală Frankfurt." },
        { numar: "03", iconita: "arhiva", titlu: "Indexare", text: "Indexat automat, cu textul recunoscut și tipul identificat." },
        { numar: "04", iconita: "ceas", titlu: "Termen", text: "Păstrat până la termenul stabilit pentru dosarul lui." },
        { numar: "05", iconita: "iesire", titlu: "Decizia firmei", text: "Termenul potrivit fiecărui dosar îl alegi tu, cu consultantul firmei." },
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
          ? { marca: "MD", nume: "Operator", nota: "din Republica Moldova" }
          : { marca: "RO", nume: "Întrebări", nota: "în limba română" },
        { marca: "Amazon", nume: "SUA și UE", nota: "CLOUD Act și GDPR" },
        { marca: "AI", nume: "Răspunsuri", nota: "cu sursa indicată" },
        { marca: "Dosar", nume: "Termen de păstrare", nota: "stabilit de firmă" },
      ],
      carduri: [
        {
          titlu: "Locul datelor, cunoscut dinainte",
          text: "Fișierele sunt păstrate în UE, cu regiunea principală Frankfurt, pe Amazon Web Services. Știi de la început unde se află documentele firmei și poți răspunde oricui întreabă.",
        },
        {
          titlu: "Termenul, stabilit pe dosar",
          text: "Pentru fiecare dosar stabilești termenul de păstrare, valabil pentru toate documentele din el. Când cineva întreabă cât timp se păstrează un document, găsești răspunsul pe dosarul lui, în 3S.",
        },
        {
          titlu: "Răspunsurile, cu sursa lor",
          text: "Fiecare răspuns din 3S indică documentul din care provine. Când un client sau un auditor întreabă de unde vine o informație, îi arăți documentul.",
        },
        {
          titlu: "Documentele, prin export",
          text: "Documentele din arhivă se pot livra prin export atunci când ai nevoie de ele în afara platformei, de pildă pentru un auditor.",
        },
      ],
    },
    intrebari: {
      // securitate.ts:349-380; renumerotat. "Cine opereaza 3S?" numai dupa inregistrarea firmei.
      numar: "04",
      titlu: "Întrebări despre 3S și datele firmei",
      intrebari: [
        {
          intrebare: "Unde și la ce furnizor sunt păstrate fișierele?",
          raspuns:
            "În Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services: regiunea marcată pe harta de mai sus. Locul în care funcțiile AI prelucrează documentele nu este precizat pe acest site; întreabă-ne înainte de a trimite documente reale.",
        },
        {
          intrebare: "Ce prevăd legea SUA și GDPR?",
          raspuns:
            "CLOUD Act, o lege a SUA, poate obliga Amazon să păstreze și să predea datele aflate sub controlul său, indiferent unde se află serverele. Amazon are și entități în Europa, iar AWS oferă clienților un acord de prelucrare a datelor (DPA), conform GDPR. Echipa 3S, moldo-româno-americană, se aliniază la legislația din Republica Moldova, din UE și din SUA. Informația nu înlocuiește consultanța juridică.",
        },
        ...(operator
          ? [
              {
                intrebare: "Cine operează 3S?",
                raspuns: "3S este operat din Republica Moldova. Datele firmei operatoare sunt publicate pe pagina Informații legale.",
              },
            ]
          : []),
        {
          intrebare: "Ce este încă în testare sau indisponibil?",
          raspuns:
            "Întrebările în engleză despre documente redactate în română și indicarea paginii exacte sunt deocamdată în testare. Semnătura electronică calificată nu este disponibilă astăzi.",
        },
        {
          intrebare: "De ce lipsesc referințele de la clienți?",
          raspuns:
            "Nu publicăm numele clienților, rezultate cifrate sau recenzii. Poți evalua 3S, în schimb, pe baza ghidurilor cu surse și a unui pilot pe documentele firmei.",
        },
        {
          intrebare: "Cine stabilește cât timp se păstrează un document?",
          raspuns:
            "Firma ta. Termenul se stabilește pe fiecare dosar și este valabil pentru toate documentele din el; alegerea lui rămâne decizia ta și a consultantului firmei.",
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

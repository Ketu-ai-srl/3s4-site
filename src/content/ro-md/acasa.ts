// Pagina de start a editiei `ro-MD` (`/ro` pe 3s.md), transcrisa din fisa ei de continut aprobata, pana la
// sectiunea de resurse nepublicate. Adresarea e "tu" (decizia 35), textul e cel aprobat (decizia 45) si aliniat pe
// deciziile 43 si 49: fara functiile negasite in codul platformei si fara asistentul pe WhatsApp. WhatsApp ramane
// numai canalul de contact cu o persoana din echipa: butoanele, textul precompletat si pasul 1 din "Cum incep".
//
// VARIANTELE CONDITIONATE ale fisei se aleg AICI, din cod, nu se scriu literal o data pentru totdeauna:
//   - e-mailul (P-40): randurile de e-mail din erou si din blocul final, cuvintele "sau prin e-mail" din pasul 1
//     si fraza despre pagina de contact au forma cu e-mail numai cand domeniul are adresa (`CANALE.email` nevid);
//   - ghidurile: sectiunea "Unde pot verifica informatiile?" si fragmentul despre ghiduri din ultima intrebare
//     apar numai cand cele trei rute G exista in `RUTE` (pana atunci legaturile ar fi inerte);
//   - operatorul: intrebarea "Cine opereaza 3S?" apare numai cand `OPERATOR_JSON` nu poarta `model`, adica dupa
//     inregistrarea firmei operatoare. Existenta paginii de informatii legale NU e criteriul: ea exista deja, cu
//     campurile firmei marcate, iar fraza "operat din Republica Moldova" e adevarata abia odata cu firma.
//
// CE NU INTRA, cu motivul: frazele despre hartie (pasul Scan in forma completa, situatia "Firma are o arhiva pe
// hartie" si raspunsul afirmativ la intrebarea despre hartie) raman deoparte, ca pe paginile EN, pana se deschide
// poarta juridica a deciziei 40; pana atunci se publica variantele fisei de dinaintea portii. Atributul hreflang pe
// legaturile din text nu intra in aceasta felie.
//
// JSON-LD: nodul paginii, fara `@context` (pagina il pune intr-un graf); se leaga de organizatia si de site-ul
// emise de layout (acelasi `@id`), nu le redeclara. Fara FAQPage, ca in fisa.

import { iduri } from "@/components/seo/date-structurate";
import { CANALE, legaturaEmail } from "@/content/canale";
import { caleMd } from "@/content/juridic/md/registru";
import type { PaginaContinut, SectiuneComuna } from "@/content/model/tipuri";
import { RUTE } from "@/content/rute";
import { atributeLimba } from "@/lib/asezare";
import { configurareOperatorDinMediu } from "@/lib/operator-mediu";
import { adresaSite } from "@/lib/site";

/** Microtextul de sub fiecare buton de canal (decizia 3: fara program, fara termen de raspuns). */
export const MICROTEXT = "Îți răspunde o persoană din echipa 3S, în română sau în engleză.";

/** Inceputul liniei de e-mail; adresa vine din canalele domeniului, numai cand exista (P-40). */
export const INAINTE_DE_EMAIL = "Ne poți scrie și la ";

/** Caile celor trei pagini de referinta (G1-G3) spre care trimite pagina: perechile lor /ro (decizia 59). */
export const CAI_GHIDURI = ["/ro/ghiduri/termene-pastrare-moldova", "/ro/ghiduri/arhivare-e-facturi-ue", "/ro/comparatie-drive"] as const;

/** Ghidurile sunt publicate: toate trei rutele exista in manifestul acestui build. */
export function ghiduriPublicate(rute: readonly { cale: string }[] = RUTE): boolean {
  return CAI_GHIDURI.every((c) => rute.some((r) => r.cale === c));
}

/**
 * Firma operatoare e inregistrata: `OPERATOR_JSON` numeste un operator si NU poarta cheia `model` (modelul D2 e
 * forma de dinaintea extrasului din registrul de stat). Fara variabila sau cu operatorul `null`: nu.
 */
export function operatorInregistrat(valoare: string | undefined = process.env.OPERATOR_JSON): boolean {
  const dinMediu = configurareOperatorDinMediu(valoare);
  if (dinMediu === null) return false;
  const cfg = dinMediu.configurare;
  if (typeof cfg !== "object" || cfg === null || Array.isArray(cfg)) return false;
  const o = cfg as Record<string, unknown>;
  return o.operator !== null && o.operator !== undefined && !("model" in o);
}

/** Ce decide variantele paginii; implicit, valorile build-ului. */
export type OptiuniPagina = {
  /** Adresa de e-mail a domeniului; sirul gol = inainte de P-40. */
  email: string;
  /** Rutele G1-G3 exista. */
  ghiduri: boolean;
  /** Firma operatoare e inregistrata. */
  operator: boolean;
};

export const OPTIUNI_BUILD: OptiuniPagina = {
  email: CANALE.email,
  ghiduri: ghiduriPublicate(),
  operator: operatorInregistrat(),
};

/** Blocul de final al paginii: titlul, textul de sub el si randurile de dupa buton. */
export type FinalPagina = {
  text: string;
  dupa: readonly string[];
};

const BAZA = adresaSite();
const ID = iduri(BAZA);
const LEGAL = caleMd("informatii-legale", "ro");

// Titlul neutru pe startul ambelor site-uri (decizia 58, I2): pagina e aceeasi pe 3s.md/ro si pe 3s.com.ro.
const TITLU = "Arhivă digitală cu căutare AI pentru firme | 3S";
const DESCRIERE =
  "Arhivă digitală pentru firme: formulezi întrebări în română și primești răspunsul cu sursa lui. Fișierele sunt păstrate în UE, regiunea principală Frankfurt.";

/** Corpul e-mailului precompletat, ca in fisa (randurile noi se scriu `\r\n`). */
const CORP_EMAIL = "Bună ziua, 3S,\r\n\r\nAm citit site-ul 3S. Aș dori să întreb despre un pilot.\r\n\r\nArhiva mea (hârtie, scanări sau fișiere) și țara:\r\n";

function sectiuni(o: OptiuniPagina): SectiuneComuna[] {
  const intrebari: SectiuneComuna[] = [
    {
      cheie: "intrebari-in-engleza",
      nivel: 3,
      titlu: "Pot formula întrebări în engleză despre documente redactate în română?",
      blocuri: [
        {
          paragrafe: [
            "Deocamdată, numai în regim de testare. Putem verifica funcția pe documentele tale înainte să iei o decizie. Tot în testare se află indicarea paginii exacte din document.",
          ],
        },
      ],
    },
    {
      cheie: "documente-pe-hartie",
      nivel: 3,
      titlu: "Poate 3S să scaneze și documentele pe hârtie?",
      blocuri: [
        {
          paragrafe: [
            "Pentru documentele pe hârtie, discutăm mai întâi volumul, starea și locul în care se află. Descrie-le în primul mesaj, iar noi îți spunem ce variante există.",
          ],
        },
      ],
    },
    ...(o.operator
      ? [
          {
            cheie: "cine-opereaza",
            nivel: 3 as const,
            titlu: "Cine operează 3S?",
            blocuri: [
              { paragrafe: ["3S este operat din Republica Moldova. Datele firmei operatoare sunt publicate pe pagina [Informații legale](" + LEGAL + ")."] },
            ],
          },
        ]
      : []),
    {
      cheie: "referinte-clienti",
      nivel: 3,
      titlu: "De ce site-ul nu include referințe de la clienți?",
      blocuri: [
        {
          paragrafe: [
            "Nu publicăm numele clienților, rezultate cifrate sau recenzii. Poți evalua 3S, în schimb, pe baza " +
              (o.ghiduri ? "ghidurilor cu surse și a " : "") +
              "unui pilot pe documentele firmei; limitele serviciului sunt descrise pe [pagina despre 3S](/ro/securitate#limits).",
          ],
        },
      ],
    },
  ];

  return [
    {
      cheie: "ce-face",
      titlu: "Ce face 3S?",
      blocuri: [
        {
          paragrafe: [],
          lista: {
            elemente: [
              "**Scan.** Fișierele pe care le ai deja în format electronic se încarcă direct în arhiva digitală, iar pregătirea documentelor pe hârtie se discută separat, de la caz la caz.",
              "**Store.** Fiecare document încărcat este păstrat în spațiul de lucru al firmei tale și indexat automat pentru căutare.",
              "**Solve.** Formulezi o întrebare în română, iar 3S îți oferă răspunsul împreună cu documentul din care provine.",
            ],
          },
        },
      ],
    },
    {
      cheie: "cum-arata-un-raspuns",
      titlu: "Cum arată un răspuns?",
      blocuri: [
        {
          paragrafe: [
            "Întrebarea se formulează liber, fără cuvinte-cheie sau operatori de căutare. 3S caută în conținutul documentelor și afișează sub răspuns documentul folosit, ca să poți verifica informația la sursă.",
          ],
        },
        {
          eticheta: "Exemplu",
          paragrafe: [],
          tabel: {
            forma: "cheie-valoare",
            titlu:
              "Exemplu cu date fictive, etichetat „exemplu”: la întrebarea „Până când este valabil contractul de închiriere al depozitului?” răspunsul este „Contractul este valabil până la 31 decembrie 2027.”, iar sursa indicată este fișierul Contract_inchiriere_depozit_exemplu.pdf.",
            randuri: [
              ["Întrebare", "Până când este valabil contractul de închiriere al depozitului?"],
              ["Răspuns", "Contractul este valabil până la 31 decembrie 2027."],
              ["Sursa", "Contract_inchiriere_depozit_exemplu.pdf"],
            ],
          },
          dupa: ["Exemplu cu date fictive; nu se referă la o firmă sau la un document real."],
        },
      ],
    },
    {
      cheie: "pentru-cine",
      titlu: "Pentru cine este potrivit 3S?",
      blocuri: [
        {
          paragrafe: ["3S se adresează oricărei firme care lucrează cu documente, indiferent de domeniu. Este util mai ales în următoarele situații:"],
          lista: {
            elemente: [
              "**Aceleași documente sunt solicitate în mod repetat.** Le regăsești printr-o întrebare, iar răspunsul indică documentul din care provine.",
              "**Un singur coleg știe cum este organizată arhiva.** Toți colegii care au cont lucrează în aceeași arhivă și găsesc aceleași documente, fără să depindă de o singură persoană.",
              "**Documentele sunt dispersate în e-mailuri, foldere și pe calculatoarele colegilor.** După încărcare, ele sunt reunite într-o singură arhivă, în structura de dosare stabilită de firmă.",
              "**Firma are cerințe stricte privind drepturile de acces sau termenele de păstrare.** Comunică-ni-le de la început, iar noi verificăm înainte de ofertă dacă 3S le poate respecta.",
            ],
          },
        },
      ],
    },
    {
      cheie: "alte-functii",
      titlu: "Ce alte funcții are 3S?",
      blocuri: [
        {
          paragrafe: [],
          lista: {
            elemente: [
              "**Termenele de păstrare și jurnalul de acces.** Pentru fiecare dosar se poate stabili termenul de păstrare, iar deschiderile și descărcările documentelor sunt consemnate în jurnal.",
            ],
          },
        },
      ],
    },
    {
      cheie: "unde-sunt-pastrate",
      titlu: "Unde sunt păstrate documentele firmei?",
      blocuri: [
        {
          paragrafe: [
            "Fișierele încărcate în 3S sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt, pe serverele Amazon Web Services (AWS). Amazon are sediul în Statele Unite, iar legislația americană (CLOUD Act) poate obliga compania să păstreze și să predea datele aflate în posesia sau sub controlul său, indiferent unde se află serverele. Detaliile sunt prezentate pe [pagina despre 3S și securitate](/ro/securitate#security).",
          ],
        },
      ],
    },
    {
      cheie: "cum-incep",
      titlu: "Cum încep să folosesc 3S?",
      ancoraInainte: "cum-pornesc",
      blocuri: [
        {
          paragrafe: ["Colaborarea începe cu o perioadă pilot pe documentele firmei, cu asistența echipei 3S."],
          lista: {
            numerotata: true,
            elemente: [
              (o.email === "" ? "Scrie-ne pe WhatsApp" : "Scrie-ne pe WhatsApp sau prin e-mail") +
                " și descrie pe scurt arhiva firmei. În primul mesaj nu trimite documente sau date cu caracter personal.",
              "Stabilim în scris documentele incluse în pilot, volumul acestora și întrebările pe care dorești să le testezi.",
              "Pilotul este gratuit, durează 14 zile, include funcțiile pachetului Starter și începe după ce accepți Termenii și condițiile, precum și Acordul de prelucrare a datelor.",
              "La final analizăm împreună răspunsurile și sursele, iar tu decizi dacă continui cu unul dintre pachete.",
            ],
          },
          dupa: ["În perioada pilot, conturile se creează numai pe bază de invitație, iar înregistrarea directă pe site nu este încă disponibilă."],
        },
      ],
    },
    {
      cheie: "cat-costa",
      titlu: "Cât costă 3S?",
      blocuri: [
        {
          paragrafe: [
            "3S are patru pachete, cu prețuri lunare în euro calculate pentru întreaga firmă. Starter, Pro și Business au aceleași funcții; pachetele se deosebesc numai prin numărul de conturi: 90, 150 și 240 EUR pe lună, pentru 5, 10 și, respectiv, 20 de conturi. Peste 20 de conturi se aplică pachetul Enterprise, de la 800 EUR pe lună, cu contract anual. La plata anuală plătești 10 luni din 12, adică 75, 125 și, respectiv, 200 EUR pe lună. Grila are caracter orientativ. Prețurile nu includ TVA; acolo unde se aplică TVA, aceasta se adaugă pe factură. [Vezi pachetele](/ro/preturi).",
          ],
        },
      ],
    },
    ...(o.ghiduri
      ? [
          {
            cheie: "unde-pot-verifica",
            titlu: "Unde pot verifica informațiile?",
            blocuri: [
              {
                paragrafe: [
                  "Ghidurile 3S citează surse primare și indică, pentru fiecare informație, data la care a fost verificată. Au caracter informativ și nu înlocuiesc consultanța juridică.",
                ],
                lista: {
                  elemente: [
                    "[Termenele de păstrare a actelor în Moldova](" + CAI_GHIDURI[0] + ")",
                    "[Arhivarea facturilor electronice în UE](" + CAI_GHIDURI[1] + ")",
                    "[3S comparat cu Google și Box AI](" + CAI_GHIDURI[2] + ")",
                  ],
                },
              },
            ],
          },
        ]
      : []),
    {
      cheie: "inainte-de-contact",
      titlu: "Ce trebuie să știu înainte de a contacta 3S?",
      blocuri: [],
    },
    ...intrebari,
  ];
}

/** Pagina `/ro`, cu variantele alese din optiuni. */
export function paginaAcasa(o: OptiuniPagina = OPTIUNI_BUILD): PaginaContinut {
  return {
    cheie: "home",
    meta: { titlu: TITLU, descriere: DESCRIERE, cale: "/ro" },
    h1: "Întreabă documentele firmei. Primești răspunsul și sursa lui.",
    capsula:
      "3S Scan Store Solve organizează documentele firmei tale într-o arhivă digitală și oferă răspunsuri la întrebările despre conținutul lor, indicând documentul-sursă al fiecărui răspuns. Întrebările se formulează în română, din browser. Fișierele sunt păstrate în Uniunea Europeană, cu regiunea principală Frankfurt.",
    sectiuni: sectiuni(o),
    cta: {
      ref: "ro-md-acasa",
      titluBloc: "Vrei să vezi cum funcționează 3S pe documentele tale?",
      textWhatsapp: "Bună ziua, 3S. Am citit site-ul 3S [ref:ro-md-acasa]. Aș dori să întreb despre un pilot.",
      subiectEmail: "Întrebare 3S [ref:ro-md-acasa]",
    },
    jsonLd: [
      {
        "@type": "WebPage",
        "@id": BAZA + "/ro#webpage",
        url: BAZA + "/ro",
        name: TITLU,
        description: DESCRIERE,
        // Limba paginii pe domeniu, din asezare: `ro-MD` pe 3s.md, `ro-RO` pe 3s.com.ro (romana la radacina).
        inLanguage: atributeLimba("ro-MD").inLanguage,
        isPartOf: { "@id": ID.site },
        about: { "@id": ID.organizatie },
      },
    ],
    afirmatii: [
      "ro-md-arhiva-cu-sursa",
      "ro-md-trei-pasi-scan-store-solve",
      // Oglinda OCR (felia ro-md-oglinda): pasul Scan al startului spune ca 3S citeste textul prin OCR, ca pe EN
      // (`en-produs-functii-in-productie` in `en/home.ts`).
      "ro-md-functii-in-productie",
      "ro-md-termene-si-jurnal",
      "ro-md-gazduire-ue-frankfurt",
      "ro-md-amazon-sediu-sua",
      "ro-md-pilot-asistat",
      "ro-md-cont-prin-invitatie",
      "ro-md-pret-orientativ-eur",
      "ro-md-fraza-tva",
      "ro-md-engleza-si-pagina-in-testare",
      "ro-md-raspunde-o-persoana",
      ...(o.ghiduri ? ["ro-md-ghiduri-cu-surse"] : []),
      ...(o.operator ? ["ro-md-operator-din-moldova"] : []),
    ],
  };
}

/** Legatura secundara a eroului: spre sectiunea "Cum incep sa folosesc 3S?". */
export const eroSecundar = { text: "Cum începe un pilot", href: "#cum-pornesc" } as const;

/** Blocul de final, cu fraza despre pagina de contact in varianta potrivita (convorbirea numai pe WhatsApp, decizia 56). */
export function finalAcasa(o: OptiuniPagina = OPTIUNI_BUILD): FinalPagina {
  return {
    text:
      "Descrie-ne pe scurt arhiva firmei și țara în care se află documentele. " +
      (o.email === ""
        ? "Dacă preferi o convorbire pe WhatsApp, găsești numărul pe [pagina de contact](/ro/contact)."
        : "Dacă preferi e-mailul sau o convorbire pe WhatsApp, găsești adresa și numărul pe [pagina de contact](/ro/contact)."),
    dupa: ["Documentele care îți răspund."],
  };
}

/** Legatura `mailto:` a paginii, sau `null` inainte de P-40 (domeniul fara adresa). */
export function emailAcasa(email: string = CANALE.email): string | null {
  const p = paginaAcasa({ ...OPTIUNI_BUILD, email });
  return legaturaEmail(p.cta.ref, p.cta.subiectEmail, CORP_EMAIL, { ...CANALE, email });
}

export const pagina: PaginaContinut = paginaAcasa();
export const final: FinalPagina = finalAcasa();

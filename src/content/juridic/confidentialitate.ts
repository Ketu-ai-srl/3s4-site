// Politica de confidentialitate, construita COMPLET din comutatorul operatorului (planul valului S4,
// §9-§10). NEPUBLICATA: nu are ruta si nu intra in `RUTE`; o randeaza felia `juridic` (valul S4-4)
// in ziua in care `config/operator.json` numeste operatorul. Pana atunci, `politicaConfidentialitate`
// se cheama numai din probe, cu un operator sintetic.
//
// CELE 12 ELEMENTE din GDPR art. 13 si Legea 195/2024 art. 13 (G-MD-01) sunt cheile sectiunilor:
// `1a`-`1f` pentru alin. (1) lit. a)-f), `2a`-`2f` pentru alin. (2) lit. a)-f). Pagina pune cheia in
// `data-art13`, iar proba cere toate 12, fiecare cu text.
//
// CE NU SCRIE, deliberat:
//   - niciun cod de inscriere intr-un registru al operatorilor de date: registrul a fost desfiintat,
//     iar un asemenea cod ar fi o mentiune falsa (G-MD-09; poarta juridica, L-10);
//   - "SUA e adecvata" pentru Republica Moldova: acolo decizia Comisiei Europene nu e opozabila, deci
//     se numeste mecanismul din Legea 195/2024 art. 46 (furnizori.ts);
//   - nicio atestare de conformitate pe care n-o avem (G-MD-18).
//
// Termenele de pastrare sunt alese de noi, cu motivul langa ele (legea nu da termene pentru un site
// de prezentare, ci principiul limitarii stocarii, GDPR art. 5 alin. (1) lit. e)). Cele care tin de
// infrastructura (jurnalele serverului, retentia din contul GA4) se regleaza in ziua operatorului,
// cu comanda de verificare scrisa in `docs/ziua-operatorului.md`.

import type { NumeEveniment } from "@/components/consimtamant/evenimente";
import { lipsuriInformare, type Operator } from "@/lib/operator";
import { AUTORITATI, type Autoritate } from "./autoritati";
import { FURNIZORI } from "./furnizori";
import type { DocumentJuridic } from "./tipuri";

/** Cheile celor 12 elemente, in ordinea articolului. */
export const CHEI_ART13 = ["1a", "1b", "1c", "1d", "1e", "1f", "2a", "2b", "2c", "2d", "2e", "2f"] as const;

/** Ce masoara fiecare eveniment din lista inchisa. Un eveniment nou fara descriere nu compileaza. */
export const DESCRIERE_EVENIMENTE: Record<NumeEveniment, string> = {
  clic_cta: "clicurile pe butoanele către contul gratuit și către pagina de contact",
  formular_inceput: "începerea completării unui formular",
  formular_trimis: "formularele trimise",
  industrie_aleasa: "domeniul de activitate ales în constructorul de arhivă de pe pagina de start",
  calculator_folosit: "folosirea calculatorului de pe pagina de prețuri",
};

/** Termenele de pastrare, alese de noi (motivele in comentariu). */
export const PASTRARE = {
  // Suficient ca un atac sau o eroare sa fie observate si depanate; nimic nu cere mai mult.
  jurnale: "cel mult 30 de zile",
  // Cea mai scurta retentie pe care o permite GA4; ajunge pentru comparatii de la o luna la alta.
  statistica: "2 luni",
  // Termenul general de prescriptie (Codul civil, art. 2.517): cat se poate cere dovada acordului.
  evidenta: "36 de luni de la alegere",
  // Planul E5, pasul 16: un ciclu bugetar complet, respectiv termenul de prescriptie.
  formulareFaraOferta: "cel mult 12 luni de la ultima discuție",
  formulareCuOferta: "cel mult 36 de luni",
} as const;

/** Statele Spatiului Economic European, cum le scrie un om (fara diacritice, litere mici). */
const TARI_SEE = [
  "austria", "belgia", "bulgaria", "cehia", "cipru", "croatia", "danemarca", "estonia", "finlanda",
  "franta", "germania", "grecia", "irlanda", "islanda", "italia", "letonia", "liechtenstein",
  "lituania", "luxemburg", "malta", "norvegia", "olanda", "tarile de jos", "polonia", "portugalia",
  "romania", "slovacia", "slovenia", "spania", "suedia", "ungaria",
];

function fara(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

/** Tara operatorului e in SEE: atunci nu e nevoie de reprezentant in Republica Moldova. */
export function inSee(tara: string): boolean {
  return TARI_SEE.includes(fara(tara));
}

/** Verifica operatorul inainte de a scrie textul: un text cu locuri goale nu se construieste. */
export function verificaOperatorPentruTexte(operator: Operator): void {
  const lipsuri = lipsuriInformare(operator);
  if (lipsuri.length > 0) {
    throw new Error("textele juridice cer campurile " + lipsuri.join(", ") + " din config/operator.json");
  }
  if (!inSee(operator.tara)) {
    throw new Error(
      "operatorul nu are sediul in SEE: Legea 195/2024 art. 27 cere atunci un reprezentant in Republica Moldova, cu datele lui in politica",
    );
  }
}

/**
 * Randul de deasupra unui bloc de jurisdictie, cand paragrafele lui nu spun singure pentru cine
 * sunt (felia `juridic`: pagina il arata deasupra blocului, in acelasi `data-jurisdictie`).
 */
export const ETICHETA_RO = "Pentru vizitatorii din România și din Uniunea Europeană";
export const ETICHETA_MD = "Pentru vizitatorii din Republica Moldova";

/** Data versiunii textelor feliei 44, cu etichetele de jurisdictie adaugate de felia `juridic`. */
export const VERSIUNE_CONFIDENTIALITATE = "2026-09-25";

function autoritate(a: Autoritate): string {
  return "Pentru " + a.pentru + ": " + a.nume + " (" + a.sigla + "), " + a.adresa + "; " + a.email + "; " + a.site + ".";
}

export type OptiuniPolitica = {
  /** Gazda site-ului, cum o vede vizitatorul (de pilda `3s4.ke2.in`). */
  domeniu: string;
};

export function politicaConfidentialitate(operator: Operator, { domeniu }: OptiuniPolitica): DocumentJuridic {
  verificaOperatorPentruTexte(operator);
  const contact = operator.email;
  const evenimente = Object.values(DESCRIERE_EVENIMENTE).join("; ");
  return {
    titlu: "Politica de confidențialitate",
    versiune: VERSIUNE_CONFIDENTIALITATE,
    introducere:
      "Aici aflați ce date personale prelucrează site-ul " +
      domeniu +
      " al mărcii 3S Scan Store Solve, în ce scop, pe ce temei, cui le transmitem și ce drepturi aveți. Textul urmează Regulamentul (UE) 2016/679 (GDPR) și Legea nr. 190/2018 pentru vizitatorii din România și din Uniunea Europeană, iar Legea nr. 195/2024 pentru cei din Republica Moldova.",
    sectiuni: [
      {
        cheie: "1a",
        titlu: "Cine prelucrează datele",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Operatorul datelor este " + operator.denumire + ", cu sediul în " + operator.sediu + ", " + operator.tara + ".",
              "Ne puteți scrie la " +
                contact +
                (operator.telefon === "" ? "" : " sau ne puteți suna la " + operator.telefon) +
                ". Aceeași adresă primește și cererile privind datele personale.",
              "Operatorul are sediul într-un stat din Spațiul Economic European, deci nu are obligația de a desemna un reprezentant în Republica Moldova (Legea nr. 195/2024, art. 27 alin. (2)).",
            ],
          },
        ],
      },
      {
        cheie: "1b",
        titlu: "Responsabilul cu protecția datelor",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              operator.dpo === ""
                ? "Nu a fost desemnat un responsabil cu protecția datelor: prelucrările făcute prin acest site nu intră în cazurile în care legea îl cere (GDPR art. 37 alin. (1); Legea nr. 195/2024, art. 37 alin. (1)). Întrebările despre date le primim la " +
                  contact +
                  "."
                : "Responsabilul cu protecția datelor poate fi contactat la " + operator.dpo + ".",
            ],
          },
        ],
      },
      {
        cheie: "1c",
        titlu: "Ce date prelucrăm, în ce scop și pe ce temei",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Afișarea și securitatea site-ului. La fiecare vizită, serverul primește adresa IP, pagina cerută, data și ora, browserul și sistemul de operare. Le folosim ca să vă livrăm paginile și ca să apărăm site-ul de abuzuri. Temeiul este interesul legitim (GDPR art. 6 alin. (1) lit. f)).",
              "Statistica vizitelor. Numai dacă acceptați categoria „Statistică” din bannerul de cookie-uri, Google Analytics 4 măsoară vizitele, paginile citite și câteva acțiuni dintr-o listă închisă: " +
                evenimente +
                ". Temeiul este consimțământul dumneavoastră (GDPR art. 6 alin. (1) lit. a)), cerut înainte de orice stocare în browser (Legea nr. 506/2004, art. 4 alin. (5)).",
              "Evidența alegerii din bannerul de cookie-uri. Când alegeți, serverul notează un identificator aleator al dispozitivului, momentul, versiunea textului afișat, alegerea făcută, pagina și prefixul rețelei, fără adresa IP completă. Temeiul este obligația legală de a putea dovedi consimțământul (GDPR art. 6 alin. (1) lit. c), coroborat cu art. 7 alin. (1)).",
              "Cererile trimise prin formulare. Datele din formularul de contact, din cel de înregistrare și din cel pentru companii le folosim ca să vă răspundem și, dacă ne cereți, să vă facem o ofertă. Temeiul îl constituie demersurile precontractuale făcute la cererea dumneavoastră (GDPR art. 6 alin. (1) lit. b)), nu consimțământul. Acordul de a primi noutăți, dacă îl dați separat, are ca temei consimțământul și îl puteți retrage oricând.",
            ],
          },
        ],
      },
      {
        cheie: "1d",
        titlu: "Interesele legitime",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Invocăm interesul legitim numai pentru jurnalele serverului: ca site-ul să funcționeze, să poată fi depanat și să fie apărat de atacuri. Datele din jurnale nu se folosesc pentru publicitate și nu se combină cu alte surse.",
            ],
          },
        ],
      },
      {
        cheie: "1e",
        titlu: "Cine primește datele",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              ...FURNIZORI.map((f) => f.serviciu + ": " + f.destinatar + ". " + f.rol + " Datele stau în " + f.tara + "."),
              "Datele se comunică autorităților publice numai când legea o cere. Nu vindem date personale și nu le cedăm nimănui pentru publicitate.",
            ],
          },
        ],
      },
      {
        cheie: "1f",
        titlu: "Transferuri în afara Spațiului Economic European",
        // Copia garantiilor sta intr-un bloc pentru toti: pentru Republica Moldova transferul
        // catre SUA se sprijina pe clauzele standard (Legea 195/2024 art. 46), iar art. 13 alin.
        // (1) lit. f) din aceeasi lege cere atunci si mijloacele de a obtine o copie a lor.
        blocuri: [
          {
            jurisdictie: "ro",
            eticheta: ETICHETA_RO,
            paragrafe: FURNIZORI.map((f) => f.serviciu + ": " + f.transferUe),
          },
          {
            jurisdictie: "md",
            eticheta: ETICHETA_MD,
            paragrafe: FURNIZORI.map((f) => f.serviciu + ": " + f.transferMd),
          },
          {
            jurisdictie: null,
            paragrafe: ["O copie a garanțiilor de transfer o puteți cere la " + contact + "."],
          },
        ],
      },
      {
        cheie: "2a",
        titlu: "Cât timp păstrăm datele",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Jurnalele serverului: " + PASTRARE.jurnale + ".",
              "Datele din Google Analytics 4 legate de cookie-uri și de identificatorul dispozitivului: " +
                PASTRARE.statistica +
                ", cea mai scurtă perioadă pe care o permite serviciul. Rapoartele agregate, de pildă numărul de vizite pe pagină, rămân în cont, fără identificatori. Cookie-urile de statistică rămân în browser cel mult 2 ani; unele browsere le șterg mai devreme.",
              "Alegerea din bannerul de cookie-uri: 6 luni în browser, apoi vă întrebăm din nou. Rândul de evidență de pe server: " +
                PASTRARE.evidenta +
                ", termenul general de prescripție (Codul civil, art. 2.517).",
              "Cererile din formulare: " +
                PASTRARE.formulareFaraOferta +
                " dacă nu devin ofertă și " +
                PASTRARE.formulareCuOferta +
                " dacă ați primit o ofertă.",
            ],
          },
        ],
      },
      {
        cheie: "2b",
        titlu: "Drepturile dumneavoastră",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Aveți dreptul de acces la date (art. 15), de rectificare (art. 16), de ștergere (art. 17), de restricționare a prelucrării (art. 18), de a afla cui le-am comunicat (art. 19), la portabilitatea datelor (art. 20), de opoziție (art. 21) și dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrare automată (art. 22). Articolele sunt aceleași în GDPR și în Legea nr. 195/2024.",
              "Cererile le trimiteți la " +
                contact +
                ". Vă răspundem fără întârzieri nejustificate, în cel mult o lună de la primire; pentru cereri complexe, termenul se poate prelungi cu două luni, iar prelungirea și motivele ei vi le comunicăm în prima lună (GDPR art. 12 alin. (3); Legea nr. 195/2024, art. 12 alin. (3)). Răspunsul este gratuit.",
            ],
          },
        ],
      },
      {
        cheie: "2c",
        titlu: "Retragerea consimțământului",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Consimțământul pentru statistică îl puteți retrage oricând, la fel de simplu cum l-ați dat: legătura „Setări cookie-uri” din subsolul oricărei pagini redeschide alegerea, iar butonul „Refuz tot” oprește măsurarea pe loc. Retragerea nu afectează legalitatea prelucrării făcute înainte de ea.",
            ],
          },
        ],
      },
      {
        cheie: "2d",
        titlu: "Plângere la autoritatea de supraveghere",
        blocuri: [
          {
            jurisdictie: "ro",
            paragrafe: [
              autoritate(AUTORITATI.ro),
              "Plângerea se poate depune și la autoritatea din statul membru în care locuiți sau lucrați ori în care a avut loc pretinsa încălcare (GDPR art. 77).",
            ],
          },
          { jurisdictie: "md", paragrafe: [autoritate(AUTORITATI.md)] },
          { jurisdictie: null, paragrafe: ["Vă puteți adresa și instanței de judecată."] },
        ],
      },
      {
        cheie: "2e",
        titlu: "Dacă trebuie să ne dați datele",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Nu există nicio obligație legală sau contractuală de a ne da date prin acest site. Formularele cer numai datele fără de care nu v-am putea răspunde; fără ele, cererea nu poate primi răspuns. Statistica e opțională: dacă o refuzați, site-ul funcționează la fel.",
            ],
          },
        ],
      },
      {
        cheie: "2f",
        titlu: "Decizii automate",
        blocuri: [
          {
            jurisdictie: null,
            paragrafe: [
              "Site-ul nu ia decizii bazate exclusiv pe prelucrare automată și nu creează profiluri care să producă efecte juridice asupra dumneavoastră sau să vă afecteze în mod similar (GDPR art. 22).",
            ],
          },
        ],
      },
    ],
  };
}

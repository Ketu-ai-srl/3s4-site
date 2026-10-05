// Contractul de navigatie al editiei `ro-MD` (romana pentru Republica Moldova, sub `/ro` pe 3s.md).
//
// SURSA: planul valului S4-10, §11 pct. 2b (contractul RO-MD nu are fisa proprie; l-a fixat dispecerul).
//   - Antetul: sigla spre `/ro`, "Contact" (`/ro/contact`), selectorul EN | RO, CTA-ul "Scrie-ne pe WhatsApp"
//     (adresarea "tu" a paginilor RO-MD, decizia 35; eticheta neutra de la fundatie a fost aliniata de felia
//     paginilor RO-MD de start si de contact).
//   - Textele precompletate, pe cale: `/ro` (ro-md-acasa), `/ro/contact` (ro-md-contact), `/ro/juridic/...`
//     (ro-md-juridic) si paginile oglinzii (felia ro-md-oglinda), fiecare cu `ref`-ul si textul fisei ei. Orice alta
//     pagina foloseste textul paginii de start.
//   - Subsolul: coloana "Juridic" (documentele familiei `md`, adresele din `config/juridic-rute.json` editia
//     `ro`, etichetele = titlurile documentelor din `src/content/juridic/md`, nu scrise de mana) si coloana
//     "Contact" (WhatsApp; numarul de WhatsApp ca text, fara legatura de apel, decizia 56; e-mailul numai
//     cu `CANALE.email` nevid).
//   - Oglinda (felia ro-md-oglinda): paleta numeste paginile /ro ca pe EN, iar subsolul primeste coloanele EN
//     (Produs, Ghiduri, Companie) cu perechile /ro. Antetul ramane contractul de mai sus (sigla, Contact, selectorul,
//     CTA-ul): meniul lui e fixat de planul valului si de proba navigatiei, nu de aceasta felie.
// Totul se ascunde singur pana exista ruta (filtrul pe `RUTE`).
//
// Se construieste PE SERVER (`navigatieRoMd()`): canalele (`CANALE_JSON`) si operatorul (`OPERATOR_JSON`)
// nu exista in pachetul de browser.

import { CANALE, randNumarWhatsApp, type Canale } from "./canale";
import { texteJuridice } from "./juridic";
import { CHEI_MD, caleMd } from "./juridic/md/registru";
import { OPERATOR, type Operator } from "@/lib/operator";
import { LIMBI_3S_MD } from "./navigatie-en";
import { ANTET, PALETA, SERTAR, type ColoanaSubsol, type ContractNavigatie, type Legatura } from "./navigatie";
import { emailPePagina, propozitieFaraMarcaj, whatsappPePagina, type TextPePagina } from "@/components/canale/pe-pagina";

/** Eticheta butonului de canal in romana. */
export const ETICHETA_WHATSAPP_RO_MD = "Scrie-ne pe WhatsApp";

const SALUT = "Bună ziua, 3S. ";

/** Codul `ref` al paginii de cautare, ca in modulul ei; codurile nu stau in proza (poarta de limba citeste proza). */
const REF_CAUTARE = "ro-md-cautare-ai";

/** Textele precompletate ale paginilor RO-MD (planul valului §11 pct. 2b). */
export const TEXTE_WHATSAPP_RO_MD: readonly TextPePagina[] = [
  {
    cale: "/ro",
    ref: "ro-md-acasa",
    text: "Bună ziua, 3S. Am citit site-ul 3S [ref:ro-md-acasa]. Aș dori să întreb despre un pilot.",
  },
  {
    cale: "/ro/contact",
    ref: "ro-md-contact",
    text: "Bună ziua, 3S. Am citit pagina de contact [ref:ro-md-contact]. Aș dori să întreb despre un pilot.",
  },
  {
    cale: "/ro/juridic",
    prefix: true,
    ref: "ro-md-juridic",
    text: "Bună ziua, 3S. Am citit informațiile legale [ref:ro-md-juridic]. Am o întrebare.",
  },
  // <<felie:ro-md-oglinda>>: textele din front matter-ul fiselor ro-md, cuvant cu cuvant.
  {
    cale: "/ro/platforma",
    ref: "ro-md-platforma",
    text: "Bună ziua, 3S. Am citit pagina despre platforma 3S [ref:ro-md-platforma]. Aș dori să aflu cum ar funcționa pe documentele firmei noastre.",
  },
  {
    cale: "/ro/functionalitati/cautare-ai",
    ref: REF_CAUTARE,
    text: "Bună ziua, 3S. Am citit pagina despre căutarea cu sursa citată [ref:" + REF_CAUTARE + "]. Aș dori să văd cum funcționează pe documentele firmei.",
  },
  {
    cale: "/ro/preturi",
    ref: "ro-md-preturi",
    text: "Bună ziua, 3S. Am citit pagina de prețuri [ref:ro-md-preturi]. Aș dori o ofertă.",
  },
  {
    cale: "/ro/enterprise",
    ref: "ro-md-enterprise",
    text: "Bună ziua, 3S. Am citit pagina despre 3S Enterprise [ref:ro-md-enterprise]. Aș dori să discutăm cerințele organizației noastre.",
  },
  {
    cale: "/ro/securitate",
    ref: "ro-md-securitate",
    text: "Bună ziua, 3S. Am citit pagina Despre 3S [ref:ro-md-securitate]. Am o întrebare despre locul în care sunt păstrate datele.",
  },
  {
    cale: "/ro/ghiduri/arhivare-e-facturi-ue",
    ref: "ro-md-einv",
    text: "Bună ziua, 3S. Am citit ghidul despre arhivarea e-facturilor [ref:ro-md-einv]. Aș dori să întreb despre un pilot.",
  },
  {
    cale: "/ro/ghiduri/termene-pastrare-moldova",
    ref: "ro-md-termene-moldova",
    text: "Bună ziua, 3S. Am citit ghidul despre termenele de păstrare în Moldova [ref:ro-md-termene-moldova]. Aș dori să întreb despre un pilot.",
  },
  {
    cale: "/ro/comparatie-drive",
    ref: "ro-md-comparatie",
    text: "Bună ziua, 3S. Am citit comparația dintre 3S și Google Drive [ref:ro-md-comparatie]. Aș dori să aflu dacă 3S se potrivește firmei noastre.",
  },
];

function legatura(text: string, href: string, ruta: string = href.split("#")[0]): Legatura {
  return { text, href, ruta };
}

/** Coloanele de subsol ale oglinzii, aceleasi ca pe EN (`navigatie-en.ts`), cu perechile /ro. */
const COLOANE_OGLINDA: ColoanaSubsol[] = [
  {
    titlu: "Produs",
    legaturi: [
      legatura("Platforma", "/ro/platforma"),
      legatura("Căutare cu sursa citată", "/ro/functionalitati/cautare-ai"),
      legatura("Enterprise", "/ro/enterprise"),
    ],
  },
  {
    titlu: "Ghiduri",
    legaturi: [
      legatura("Arhivarea e-facturilor în UE", "/ro/ghiduri/arhivare-e-facturi-ue"),
      legatura("Termene de păstrare în Moldova", "/ro/ghiduri/termene-pastrare-moldova"),
      legatura("3S și Google Drive", "/ro/comparatie-drive"),
    ],
  },
  {
    titlu: "Companie",
    legaturi: [
      legatura("Despre 3S și securitate", "/ro/securitate"),
      legatura("Securitatea și locul datelor", "/ro/securitate#security"),
      legatura("Prețuri", "/ro/preturi"),
      legatura("Contact", "/ro/contact"),
    ],
  },
];

/** E-mailul unei pagini: subiectul cu `ref`, corpul cu salutul si propozitia paginii, fara marcaj. */
const FORMA_EMAIL_RO_MD = {
  subiect: (ref: string) => "Întrebare 3S [ref:" + ref + "]",
  corp: (t: TextPePagina) => "Bună ziua, 3S.\r\n\r\n" + propozitieFaraMarcaj(t, SALUT) + "\r\n",
};

/**
 * Coloana "Juridic": toate documentele familiei `md`, in ordinea registrului, cu titlul documentului roman.
 * Titlurile se iau din documentele construite pentru operatorul domeniului (la poarta cea mai larga, ca
 * lista sa fie completa); fara operator nu exista documente, deci nici coloana. Ce nu e publicat inca nu
 * are ruta si nu se randeaza.
 */
export function coloanaJuridic(operator: Operator | null = OPERATOR): ColoanaSubsol | null {
  const texte = texteJuridice(operator, { limba: "ro", poarta: "C" });
  if (texte === null) {
    return null;
  }
  const legaturi: Legatura[] = CHEI_MD.flatMap((cheie) => {
    const document = texte.get(cheie);
    if (document === undefined) return [];
    const cale = caleMd(cheie, "ro");
    return [{ text: document.titlu, href: cale, ruta: cale }];
  });
  return { titlu: "Juridic", legaturi };
}

/** Contractul RO-MD, cu canalele domeniului. */
export function navigatieRoMd(canale: Canale = CANALE, operator: Operator | null = OPERATOR): ContractNavigatie {
  const juridic = coloanaJuridic(operator);
  const whatsapp = whatsappPePagina(TEXTE_WHATSAPP_RO_MD, "/ro", canale);
  const email = emailPePagina(TEXTE_WHATSAPP_RO_MD, "/ro", FORMA_EMAIL_RO_MD, canale);
  const numar = randNumarWhatsApp(canale);

  return {
    antet: {
      sigla: { text: "3S Scan Store Solve, pagina de start", href: "/ro", ruta: "/ro" },
      meniu: ANTET.meniu,
      legaturi: [{ text: "Contact", href: "/ro/contact", ruta: "/ro/contact", foaie: null }],
      cautare: ANTET.cautare,
      autentificare: { text: "", href: null, ruta: null },
      descarca: null,
      cta:
        whatsapp === null
          ? { text: ETICHETA_WHATSAPP_RO_MD, href: null, ruta: null }
          : { text: ETICHETA_WHATSAPP_RO_MD, href: whatsapp.implicit, ruta: null, peCale: whatsapp },
      hamburger: ANTET.hamburger,
    },
    limbi: LIMBI_3S_MD,
    selector: { eticheta: "Limba site-ului" },
    paleta: {
      ...PALETA,
      grupuri: [
        {
          titlu: "Pagini",
          elemente: [
            legatura("Acasă", "/ro"),
            legatura("Platforma", "/ro/platforma"),
            legatura("Prețuri", "/ro/preturi"),
            legatura("Enterprise", "/ro/enterprise"),
            legatura("Despre 3S și securitate", "/ro/securitate"),
            legatura("Contact", "/ro/contact"),
          ],
        },
        { titlu: "Acțiuni", elemente: [] },
      ],
    },
    sertar: SERTAR,
    subsol: {
      brand: { slogan: "", descriere: "", posta: { text: "", href: null, ruta: null } },
      coloane: juridic === null ? COLOANE_OGLINDA : [...COLOANE_OGLINDA, juridic],
      contact: {
        titlu: "Contact",
        whatsapp: whatsapp === null ? null : { text: ETICHETA_WHATSAPP_RO_MD, legatura: whatsapp },
        numar,
        email: email === null ? null : { text: canale.email, legatura: email },
      },
      insigne: [],
      copyright: { detinator: "3S Scan Store Solve", mentiune: "", drepturi: "Toate drepturile rezervate." },
      urmariti: "",
      retele: [],
    },
    bara: {
      eticheta: "Contact",
      whatsapp: whatsapp === null ? null : { text: "WhatsApp", legatura: whatsapp },
    },
  };
}

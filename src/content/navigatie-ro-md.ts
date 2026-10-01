// Contractul de navigatie al editiei `ro-MD` (romana pentru Republica Moldova, sub `/ro` pe 3s.md).
//
// SURSA: planul valului S4-10, §11 pct. 2b (contractul RO-MD nu are fisa proprie; l-a fixat dispecerul).
//   - Antetul: sigla spre `/ro`, "Contact" (`/ro/contact`), selectorul EN | RO, CTA-ul "Mesaj pe WhatsApp"
//     (formulare neutra: adresarea o decide textul paginilor RO-MD).
//   - Textele precompletate, pe cale: `/ro` (ro-md-acasa), `/ro/contact` (ro-md-contact), `/ro/juridic/...`
//     (ro-md-juridic). Orice alta pagina foloseste textul paginii de start.
//   - Subsolul: coloana "Juridic" (documentele familiei `md`, adresele din `config/juridic-rute.json` editia
//     `ro`, etichetele = titlurile documentelor din `src/content/juridic/md`, nu scrise de mana) si coloana
//     "Contact" (WhatsApp, numarul ca text, e-mailul numai cu `CANALE.email` nevid).
// Totul se ascunde singur pana exista ruta (filtrul pe `RUTE`): paginile RO-MD vin in feliile urmatoare.
//
// Se construieste PE SERVER (`navigatieRoMd()`): canalele (`CANALE_JSON`) si operatorul (`OPERATOR_JSON`)
// nu exista in pachetul de browser.

import { CANALE, legaturaTelefon, numarAfisat, type Canale } from "./canale";
import { texteJuridice } from "./juridic";
import { CHEI_MD, caleMd } from "./juridic/md/registru";
import { OPERATOR, type Operator } from "@/lib/operator";
import { LIMBI_3S_MD } from "./navigatie-en";
import { ANTET, PALETA, SERTAR, type ColoanaSubsol, type ContractNavigatie, type Legatura } from "./navigatie";
import { emailPePagina, propozitieFaraMarcaj, whatsappPePagina, type TextPePagina } from "@/components/canale/pe-pagina";

/** Eticheta butonului de canal in romana. */
export const ETICHETA_WHATSAPP_RO_MD = "Mesaj pe WhatsApp";

const SALUT = "Bună ziua, 3S. ";

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
  const tel = legaturaTelefon(canale);
  const telefon = tel === null ? null : { text: numarAfisat(canale), href: tel };

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
            { text: "Acasă", href: "/ro", ruta: "/ro" },
            { text: "Contact", href: "/ro/contact", ruta: "/ro/contact" },
          ],
        },
        { titlu: "Acțiuni", elemente: [] },
      ],
    },
    sertar: SERTAR,
    subsol: {
      brand: { slogan: "", descriere: "", posta: { text: "", href: null, ruta: null } },
      coloane: juridic === null ? [] : [juridic],
      contact: {
        titlu: "Contact",
        whatsapp: whatsapp === null ? null : { text: ETICHETA_WHATSAPP_RO_MD, legatura: whatsapp },
        telefon,
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
      telefon: telefon === null ? null : { text: "Sună", href: telefon.href },
    },
  };
}

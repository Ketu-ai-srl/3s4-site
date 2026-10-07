// Continutul componentelor paginii de contact pe editia `ro-MD` (`/ro/contact` pe 3s.md): aceleasi componente si
// aceeasi compunere ca pagina de contact RO (decizia 53), cu textul editiei ro-MD (adresarea "tu", decizia 35).
// Constantele sunt tipate pe contractul structural al componentei (felia 101: `PaginaContact` cu `continut?`,
// `randuri?` si `butonCaseta?`).
//
// SURSA TEXTULUI: fisa paginii (ro-md/contact.md) pentru H1, titlul canalelor, capsula si fraza despre documente;
// restul campurilor urmeaza randurile paginii EN de contact (aceleasi decizii, aceleasi tinte), scrise in romana de
// business, fara sa reia textul site-ului RO. Textul nou e PROPUS, pana la aprobarea owner-ului pe capturi (poarta 2).
// `contact.ts` ramane sursa pentru metadata, nodul WebPage si registrul de afirmatii; blocul de final are textul
// startului /ro (`acasa-componente.ts`).
//
// CE NU INTRA, cu decizia: cardurile spre integrari (d43) si spre paginile de segment (d38); randurile formularului si
// al contului (d3) si al demonstratiei (`/incepe` nu exista pe 3s.md); criptarea (d31). Cardurile trimit la perechile
// /ro ale paginilor (decizia 59). Numarul si adresa vin din canalele aplicatiei.

import type { ContinutPaginaContact } from "@/components/conversie/PaginaContact";
import type { CardSubiect } from "@/content/conversie";
import { caleMd } from "@/content/juridic/md/registru";

/** Butonul casetei si al blocului de final: eticheta deciziei 35, tinta WhatsApp cu `ref`-ul paginii. */
export const BUTON_WHATSAPP_RO_MD = "Scrie-ne pe WhatsApp";

/**
 * Legatura unui card spre o pagina: textul e calea SURSA, ca `href`-ul (datele poarta cai sursa). Pe card se vede calea
 * SERVITA a tintei (`textCaleCard` din `PaginaContact`): pe 3s.md `/ro/preturi`, pe 3s.com.ro `/preturi`.
 */
const cale = (c: string) => ({ text: c, href: c, ruta: c });

/** Cinci carduri din sapte, in ordinea RO; fiecare duce la perechea /ro a paginii (decizia 59). */
const CARDURI_RO_MD: CardSubiect[] = [
  {
    iconita: "building-2",
    titlu: "Arhive mari și echipe numeroase",
    descriere: "Pachetul Enterprise: peste 20 de conturi, cu contract anual.",
    legatura: cale("/ro/enterprise"),
  },
  {
    iconita: "wallet",
    titlu: "Pachete și prețuri",
    descriere: "Ce include fiecare pachet și cât costă, în euro, fără TVA.",
    legatura: cale("/ro/preturi"),
  },
  {
    iconita: "shield-check",
    titlu: "Operator și găzduire",
    descriere: "Cine operează 3S și unde sunt stocate fișierele: în UE, cu regiunea principală Frankfurt.",
    legatura: cale("/ro/securitate"),
  },
  {
    iconita: "layers",
    titlu: "Cum funcționează platforma",
    descriere: "De la fișierul încărcat la răspunsul care indică documentul din care provine.",
    legatura: cale("/ro/platforma"),
  },
  {
    iconita: "calendar-clock",
    titlu: "Termene de păstrare a actelor",
    descriere: "Facturi, state de salarii și contracte: cât timp le păstrează firmele din Republica Moldova.",
    legatura: cale("/ro/ghiduri/termene-pastrare-moldova"),
  },
];

/** Bucatile subtitlului din erou: prima si a treia propozitie ale capsulei aprobate, cu canalele aplicatiei. */
export const SUBTITLU_RO_MD = {
  inainte: "Poți contacta echipa 3S pe WhatsApp, prin mesaj sau apel, la ",
  inainteDeEmail: ", ori prin e-mail, la ",
  final: ". Îți răspunde o persoană din echipă, în română sau în engleză.",
};

/** Subtitlul eroului: fara adresa (inainte de P-40) sau cu ea. */
export function subtitluContactRoMd(numar: string, email: string): string {
  const s = SUBTITLU_RO_MD;
  return s.inainte + numar + (email === "" ? "" : s.inainteDeEmail + email) + s.final;
}

/**
 * Randurile panoului de canale: WhatsApp in locul formularului, e-mailul dupa P-40. Fara stare: textul panoului spune
 * ca nu publicam un program, deci un "Deschis" cu ceas langa canal ar contrazice fraza.
 */
export const CANALE_RO_MD = {
  whatsapp: "WhatsApp, mesaje și apeluri",
  email: "E-mail",
};

/** Numele paginii din textul blocului marcii, legat la pagina de informatii legale a editiei. */
export const LEGATURA_INFORMATII_LEGALE_RO_MD = { text: "Informații legale", href: caleMd("informatii-legale", "ro") };

/** Continutul paginii; subtitlul eroului se completeaza cu `subtitluContactRoMd`. */
export const CONTACT_RO_MD: ContinutPaginaContact = {
  fir: { acasa: "Acasă", pagina: "Contact", caleAcasa: "/ro", calePagina: "/ro/contact" },
  erou: { titlu: "Contactează echipa 3S", subtitlu: "" },
  caseta: {
    titlu: "Întrebări despre 3S",
    text: "Sunt suficiente câteva rânduri: ce documente păstrează firma, în ce țară și în ce limbă, și ce vrei să regăsești în ele.",
    butonFormular: BUTON_WHATSAPP_RO_MD,
    nota: "Fără formular și fără cont.",
  },
  subiecte: {
    titlu: "Răspunsuri disponibile deja pe site",
    text: "Unele întrebări au deja un răspuns publicat. Fiecare card deschide pagina dedicată subiectului.",
    carduri: CARDURI_RO_MD,
  },
  canale: {
    titlu: "Prin ce canale pot contacta 3S?",
    text: "Canalele prin care ne poți contacta astăzi. Nu publicăm un program și nu promitem un termen de răspuns.",
    notaEticheta: "De reținut:",
    // O singura fraza pentru ambele stari: pe 3s.md nu exista formular, deci nici comutatorul lui.
    notaInchis: "nu trimite documente sau date cu caracter personal în primul mesaj.",
    notaDeschis: "nu trimite documente sau date cu caracter personal în primul mesaj.",
  },
  marca: {
    titlu: "Marca și platforma 3S",
    text: "3S este operat din Republica Moldova. Datele firmei operatoare sunt publicate pe pagina Informații legale.",
    carduri: [
      {
        titlu: "Marca 3S",
        rol: "Scan, Store, Solve",
        fapte: [
          { eticheta: "Denumirea completă", valoare: "3S Scan Store Solve", mono: false },
          { eticheta: "Rol", valoare: "Arhivă digitală, răspunsuri cu sursa", mono: false },
          { eticheta: "Acces", valoare: "Din browser", mono: false },
        ],
      },
      {
        titlu: "Platforma 3S",
        rol: "Unde sunt stocate fișierele",
        fapte: [{ eticheta: "Găzduire", valoare: "AWS, UE, regiunea principală Frankfurt", mono: false }],
      },
    ],
  },
};

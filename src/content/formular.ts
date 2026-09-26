// Textele formularului de contact, comune paginilor care il folosesc (`/enterprise` azi, `/contact`
// in felia conversie). Ce difera de la o pagina la alta (capul sectiunii, textul-exemplu al mesajului,
// subiectul din previzualizare) se da ca proprietate a componentei, nu se scrie aici.
//
// Adresarea e "tu" (decizia D15), ca pe tot site-ul in afara documentelor juridice. Nicio promisiune de termen de raspuns: 3S nu are
// inca o tinta de raspuns asumata in registrul de afirmatii.

import type { Legatura } from "./navigatie";
import type { CampText, CodEroare } from "@/components/formular/validare";

export type TexteCamp = {
  eticheta: string;
  exemplu: string;
  autocomplete: string;
  tip: "text" | "email" | "tel" | "textarea";
};

export const CAMPURI: Record<Exclude<CampText, "mesaj">, TexteCamp> & { mesaj: Omit<TexteCamp, "exemplu"> } = {
  // Rol: numele persoanei. Lungime: 12 [numarat].
  nume: { eticheta: "Nume complet", exemplu: "Prenume și nume", autocomplete: "name", tip: "text" },
  // Rol: adresa la care se raspunde. Exemplul arata forma, nu o adresa anume.
  email: { eticheta: "Adresă de e-mail", exemplu: "nume@firma.ro", autocomplete: "email", tip: "email" },
  // Rol: telefonul, optional. Exemplul e o masca, nu un numar care poate fi al cuiva.
  telefon: { eticheta: "Telefon", exemplu: "07xx xxx xxx", autocomplete: "tel", tip: "tel" },
  // Rol: firma, optionala.
  companie: { eticheta: "Firmă", exemplu: "Denumirea firmei", autocomplete: "organization", tip: "text" },
  // Rol: mesajul; textul-exemplu il da pagina.
  mesaj: { eticheta: "Mesaj", autocomplete: "off", tip: "textarea" },
};

/** Mesajele de eroare, pe camp si pe cod. */
export const ERORI: Record<CampText, Partial<Record<CodEroare, string>>> = {
  nume: { lipsa: "Scrie numele, ca să știm cui răspundem.", lung: "Numele e prea lung." },
  email: {
    lipsa: "Scrie adresa de e-mail la care îți răspundem.",
    forma: "Adresa nu are forma nume@domeniu.",
    lung: "Adresa e prea lungă.",
  },
  telefon: { forma: "Numărul poate avea doar cifre, spații și semnul plus.", lung: "Numărul e prea lung." },
  companie: { lung: "Denumirea e prea lungă." },
  mesaj: { lipsa: "Scrie pe scurt ce vrei de la 3S.", lung: "Mesajul trece de 5.000 de caractere." },
};

export const FORMULAR = {
  // Rol: butonul de trimitere. Lungime: 17 [numarat].
  trimite: "Trimite cererea",
  trimitere: "Se trimite...",
  corector: {
    // Rol: avertismentul corectorului, 3 randuri la 271 px.
    avertisment:
      "Domeniul adresei e foarte aproape de unul cunoscut, dar nu identic. Dacă adresa e bună așa, apasă încă o dată pe trimitere.",
    // Rol: butonul-text cu adresa propusa; adresa se pune intre cele doua bucati.
    propunereInainte: "Folosește",
    propunereDupa: "în locul ei",
  },
  marketing: "Vreau să primesc pe e-mail noutăți despre 3S (opțional). Mă pot dezabona oricând.",
  // Rol: mesajul de langa buton cat timp formularul nu trimite date (config/operator.json null).
  inactiv:
    "Trimiterea prin formular nu e pornită încă, așa că ce ați scris nu a plecat nicăieri și nu a fost salvat. O deschidem odată cu publicarea politicii de confidențialitate.",
  informare: {
    scop: "Folosim datele doar ca să îți răspundem și, dacă ne ceri, ca să îți facem o ofertă.",
    temei:
      "Temeiul îl constituie demersurile precontractuale făcute la cererea ta (GDPR, art. 6 alin. (1) lit. b)); bifa de noutăți e separată și are ca temei consimțământul.",
    operatorInainte: "Operatorul datelor:",
    pastrareInainte: "Păstrare:",
    politicaInainte: "Detalii în",
    politica: "politica de confidențialitate",
  },
  succes: {
    titlu: "Mulțumim, cererea a ajuns",
    text: "Un om din echipa 3S îți scrie la adresa pe care ai lăsat-o.",
  },
  directInainte: "Ne poți scrie și direct la",
  rezerva: {
    inapoi: "Înapoi la formular",
    explicatie: "Trimiterea nu a reușit. Textul e pregătit mai jos, ca să ni-l trimiți pe e-mail.",
    deschide: "Trimite prin e-mail",
    copiaza: "Copiază textul",
    copiat: "Textul e copiat; îl poți lipi în orice mesaj.",
    necopiat: "Browserul nu a permis copierea; selectează textul de mai sus.",
  },
} as const;

/** Legatura spre politica de confidentialitate: prin `Tinta`, deci inerta cat timp nu e publicata. */
export const POLITICA: Legatura = {
  text: FORMULAR.informare.politica,
  href: "/juridic/confidentialitate",
  ruta: "/juridic/confidentialitate",
};

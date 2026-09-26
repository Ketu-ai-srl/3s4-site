// Logica formularului de cont nou (/inregistrare; inregistrare.md §2b si "Validarea"), fara React,
// ca probele sa o poata rula direct: validarea, citirea parametrilor constructorului si corpul
// cererii catre punctul de trimitere al feliei enterprise-formular.
//
// CAMPURILE OBLIGATORII sunt minimul fara de care un cont nu se poate deschide (GDPR art. 5 alin. (1)
// lit. c), gdprscan FORM-04): prenumele, numele, adresa, utilizatorul, parola si acordul cu termenii.
// Telefonul e optional (la referinta era obligatoriu; aici nu e nevoie de el ca sa existe contul).
// Bifa de noutati e separata, nebifata si nu schimba niciodata rezultatul validarii (FORM-01..03).
//
// PAROLA NU PLEACA NICIODATA spre punctul de trimitere. Contractul lui (`src/components/formular/
// README.md`) are exact cheile formularului de contact si duce la canalul de cereri, nu la un sistem
// de conturi: o parola trimisa acolo ar ajunge in clar intr-un canal de mesaje. Parola se verifica
// aici (8-72 de octeti, ca la referinta) si ramane in pagina. Proba feliei cere asta explicit.

import { formaEmail, type DateFormular } from "@/components/formular/validare";

export const CAMPURI_INREGISTRARE = ["prenume", "nume", "email", "telefon", "utilizator", "parola"] as const;
export type CampInregistrare = (typeof CAMPURI_INREGISTRARE)[number];

export type DateInregistrare = Record<CampInregistrare, string> & { termeni: boolean; marketing: boolean };

export type CodEroareInregistrare =
  | "prenume"
  | "nume"
  | "emailLipsa"
  | "emailForma"
  | "telefon"
  | "utilizatorLipsa"
  | "utilizatorForma"
  | "parola"
  | "termeni"
  | "lung";

export type EroriInregistrare = Partial<Record<CampInregistrare | "termeni", CodEroareInregistrare>>;

export const GOL_INREGISTRARE: DateInregistrare = {
  prenume: "",
  nume: "",
  email: "",
  telefon: "",
  utilizator: "",
  parola: "",
  termeni: false,
  marketing: false,
};

/** Lungimile maxime, in caractere (parola: in octeti, separat). */
export const LUNGIMI_INREGISTRARE: Record<Exclude<CampInregistrare, "parola">, number> = {
  prenume: 60,
  nume: 60,
  email: 254,
  telefon: 40,
  utilizator: 40,
};

export const PAROLA_MIN = 8;
export const PAROLA_MAX_OCTETI = 72;

const FORMA_UTILIZATOR = /^[A-Za-z0-9._-]{3,40}$/;
const FORMA_TELEFON = /^[+()\d.\s-]*$/;

/** Lungimea in octeti UTF-8 (limita de 72 de octeti a referintei e in octeti, nu in caractere). */
export function octeti(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Erorile campurilor, in ordinea formularului. Obiect gol = cererea se poate trimite. */
export function valideazaInregistrare(d: DateInregistrare): EroriInregistrare {
  const e: EroriInregistrare = {};
  const prenume = d.prenume.trim();
  const nume = d.nume.trim();
  const email = d.email.trim();
  const telefon = d.telefon.trim();
  const utilizator = d.utilizator.trim();

  if (prenume === "") e.prenume = "prenume";
  else if (prenume.length > LUNGIMI_INREGISTRARE.prenume) e.prenume = "lung";

  if (nume === "") e.nume = "nume";
  else if (nume.length > LUNGIMI_INREGISTRARE.nume) e.nume = "lung";

  if (email === "") e.email = "emailLipsa";
  else if (email.length > LUNGIMI_INREGISTRARE.email) e.email = "lung";
  else if (!formaEmail(email)) e.email = "emailForma";

  if (telefon !== "") {
    if (telefon.length > LUNGIMI_INREGISTRARE.telefon) e.telefon = "lung";
    else if (!FORMA_TELEFON.test(telefon) || telefon.replace(/\D/g, "").length < 6) e.telefon = "telefon";
  }

  if (utilizator === "") e.utilizator = "utilizatorLipsa";
  else if (!FORMA_UTILIZATOR.test(utilizator)) e.utilizator = "utilizatorForma";

  const lungimeParola = octeti(d.parola);
  if (d.parola.length < PAROLA_MIN || lungimeParola > PAROLA_MAX_OCTETI) e.parola = "parola";

  if (!d.termeni) e.termeni = "termeni";
  return e;
}

/** Primul camp cu eroare, in ordinea formularului (focusul sare acolo). */
export function primaEroare(e: EroriInregistrare): CampInregistrare | "termeni" | null {
  for (const c of [...CAMPURI_INREGISTRARE, "termeni"] as const) {
    if (e[c]) return c;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------
// Parametrii constructorului (contractul din `src/content/acasa.ts`, `PARAMETRI_INREGISTRARE`).
// Citirea e rescrisa aici, mica, fiindca modulul acela are tot continutul startului si ar intra in
// JavaScript-ul paginii; codurile si etichetele le da serverul. Proba cere ca cele doua citiri sa
// dea acelasi rezultat pe aceleasi adrese.
// ---------------------------------------------------------------------------------------------

export type Etichete = Record<string, string>;

export type EticheteConstructor = {
  industrii: Etichete;
  canale: Etichete;
  volume: Etichete;
  cine: Etichete;
  /** Numele parametrilor (`ind`, `src`, `vol`, `who`). */
  parametri: { industrie: string; canale: string; volum: string; cine: string };
};

export type RezumatConstructor = {
  industrie?: string;
  canale?: string[];
  volum?: string;
  cine?: string;
};

/** Codurile valide din adresa, dupa aceleasi reguli ca `citesteParametriInregistrare`. */
export function coduriDinAdresa(
  cautare: URLSearchParams,
  e: EticheteConstructor,
): { ind?: string; src?: string[]; vol?: string; who?: string } {
  const rezultat: { ind?: string; src?: string[]; vol?: string; who?: string } = {};
  const ind = cautare.get(e.parametri.industrie);
  if (ind !== null && Object.prototype.hasOwnProperty.call(e.industrii, ind)) rezultat.ind = ind;
  const src = cautare.get(e.parametri.canale);
  if (src !== null) {
    const cerute = src.split(",").map((s) => s.trim());
    const canale = Object.keys(e.canale).filter((c) => cerute.includes(c));
    if (canale.length > 0) rezultat.src = canale;
  }
  const vol = cautare.get(e.parametri.volum);
  if (vol !== null && Object.prototype.hasOwnProperty.call(e.volume, vol)) rezultat.vol = vol;
  const who = cautare.get(e.parametri.cine);
  if (who !== null && Object.prototype.hasOwnProperty.call(e.cine, who)) rezultat.who = who;
  return rezultat;
}

/** Rezumatul in cuvinte, sau `null` cand adresa nu are niciun parametru valid. */
export function rezumatConstructor(cautare: URLSearchParams, e: EticheteConstructor): RezumatConstructor | null {
  const c = coduriDinAdresa(cautare, e);
  const r: RezumatConstructor = {};
  if (c.ind) r.industrie = e.industrii[c.ind];
  if (c.src) r.canale = c.src.map((x) => e.canale[x]);
  if (c.vol) r.volum = e.volume[c.vol];
  if (c.who) r.cine = e.cine[c.who];
  return Object.keys(r).length > 0 ? r : null;
}

// ---------------------------------------------------------------------------------------------
// Corpul cererii catre `/api/formular` (numai cand exista operator; azi nu pleaca nimic).
// ---------------------------------------------------------------------------------------------

export type TexteCerere = {
  mesajCerere: string;
  mesajUtilizator: string;
  domeniu: string;
  canale: string;
  volum: string;
  cine: string;
};

/** Corpul exact pe contractul punctului de trimitere. Parola NU e in el. */
export function corpCerere(
  d: DateInregistrare,
  rezumat: RezumatConstructor | null,
  t: TexteCerere,
): { formular: "inregistrare" } & DateFormular {
  const randuri: string[] = [t.mesajCerere, t.mesajUtilizator + " " + d.utilizator.trim()];
  if (rezumat?.industrie) randuri.push(t.domeniu + ": " + rezumat.industrie);
  if (rezumat?.canale) randuri.push(t.canale + ": " + rezumat.canale.join(", "));
  if (rezumat?.volum) randuri.push(t.volum + ": " + rezumat.volum);
  if (rezumat?.cine) randuri.push(t.cine + ": " + rezumat.cine);
  return {
    formular: "inregistrare",
    nume: (d.prenume.trim() + " " + d.nume.trim()).trim(),
    email: d.email.trim(),
    telefon: d.telefon.trim(),
    companie: "",
    mesaj: randuri.join("\n"),
    marketing: d.marketing,
  };
}

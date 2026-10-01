// Canalele de contact ale unui domeniu, dintr-o variabila de mediu: `CANALE_JSON`.
//
// DE CE EXISTA. Acelasi cod ruleaza ca aplicatii separate, cate una pe domeniu. Pe unele domenii
// omul scrie prin formular, pe altele numai pe WhatsApp, la telefon sau pe e-mail. Numarul si adresa
// sunt date, nu cod: se schimba din panoul aplicatiei, cu un build nou, fara commit.
//
// FORMA: `{"formulare": true|false, "whatsapp": "...", "telefon": "...", "email": "...",
// "emailSecuritate": "..."}`. Fiecare cheie e optionala; o cheie lipsa ia valoarea implicita, iar
// variabila nesetata sau goala (panourile pot defini o variabila vida) inseamna "toate implicite",
// adica exact comportamentul de dinainte de variabila:
//   - `formulare`: `true` (formularele merg ca pana acum, dupa operator);
//   - `whatsapp`, `telefon`: goale (niciun canal de acest fel);
//   - `email`: adresa marcii din `config/brand.json`, primita ca parametru (modulul nu citeste fisiere);
//     o cheie prezenta si goala inseamna "fara adresa pe acest domeniu", chiar daca marca are una;
//   - `emailSecuritate`: adresa canalului de raportare a problemelor de securitate.
//
// VALIDAREA opreste construirea, cu un mesaj care numeste variabila si campul (fara sa repete valoarea):
// JSON stricat, alt tip decat obiect, cheie necunoscuta, tip gresit, `whatsapp` care nu are 8-15 cifre
// fara plus (forma legaturii wa.me), `telefon` care nu e E.164 cu plus, adresa care nu arata a adresa.
// Invariant: `formulare=false` cere cel putin un canal de contact nevid (whatsapp, telefon sau email),
// altfel domeniul n-ar avea nicio cale prin care sa-i scrie cineva. Adresa de securitate nu se socoteste:
// e canalul raportarilor, nu al clientilor.
//
// DE CE E UN MODUL MIC, FARA IMPORTURI. Il citeste `src/content/canale.ts`, care poate ajunge in pachetul
// de browser. In browser `process.env.CANALE_JSON` e nedefinita (Next inlocuieste numai `NEXT_PUBLIC_*`),
// deci acolo rezultatul e implicitul, fara nicio eroare: canalele unui domeniu care le schimba trebuie
// deci decise pe server si date componentelor ca proprietati. Nicio valoare de canal nu e scrisa aici.

/** Numele variabilei, ca mesajele sa o spuna la fel peste tot. */
export const VARIABILA_CANALE = "CANALE_JSON";

/** Adresa implicita a raportarilor de securitate (aceeasi cu cea din pagina de securitate si security.txt). */
export const EMAIL_SECURITATE_IMPLICIT = "security@3s.com.ro";

export type Canale = {
  /** Formularele de pe site si punctul `/api/formular` sunt pornite (tot dupa operator). */
  formulare: boolean;
  /** Numarul pentru wa.me: 8-15 cifre, fara plus; gol = fara WhatsApp. */
  whatsapp: string;
  /** Numarul de telefon in forma E.164, cu plus; gol = fara telefon. */
  telefon: string;
  /** Adresa de contact; goala = fara e-mail pe domeniu. */
  email: string;
  /** Adresa raportarilor de securitate; niciodata goala. */
  emailSecuritate: string;
};

/** Cheile permise, in ordinea din documentatie. */
export const CHEI_CANALE = ["formulare", "whatsapp", "telefon", "email", "emailSecuritate"] as const;

const FORMA_WHATSAPP = /^[0-9]{8,15}$/;
const FORMA_TELEFON = /^\+[1-9][0-9]{7,14}$/;
/** O adresa de posta plauzibila: un singur @, fara spatii, cu punct in domeniu (ca `adresaMarcii`). */
const FORMA_ADRESEI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function eroare(camp: string | null, ce: string): Error {
  return new Error(VARIABILA_CANALE + (camp === null ? "" : ': campul "' + camp + '"') + " " + ce);
}

function text(camp: string, valoare: unknown): string {
  if (typeof valoare !== "string") {
    throw eroare(camp, "trebuie sa fie text");
  }
  return valoare;
}

/**
 * Canalele domeniului. `valoare` e continutul lui `CANALE_JSON`; `emailImplicit` e adresa folosita cand
 * cheia `email` lipseste (adresa marcii, sau sirul gol). Arunca la orice forma gresita (vezi antetul).
 */
export function configurareCanale(
  valoare: string | undefined = process.env.CANALE_JSON,
  emailImplicit: string = "",
): Canale {
  const implicit: Canale = {
    formulare: true,
    whatsapp: "",
    telefon: "",
    email: emailImplicit,
    emailSecuritate: EMAIL_SECURITATE_IMPLICIT,
  };
  const brut = (valoare ?? "").trim();
  if (brut === "") {
    return implicit;
  }
  let cfg: unknown;
  try {
    cfg = JSON.parse(brut) as unknown;
  } catch (e) {
    const motiv = e instanceof Error ? e.message : String(e);
    throw eroare(null, "nu e JSON valid (" + motiv + ")");
  }
  if (typeof cfg !== "object" || cfg === null || Array.isArray(cfg)) {
    throw eroare(null, "trebuie sa fie un obiect JSON cu cheile " + CHEI_CANALE.join(", "));
  }
  const obiect = cfg as Record<string, unknown>;
  for (const cheie of Object.keys(obiect)) {
    if (!(CHEI_CANALE as readonly string[]).includes(cheie)) {
      throw eroare(cheie, "nu e o cheie cunoscuta (permise: " + CHEI_CANALE.join(", ") + ")");
    }
  }
  const are = (cheie: string) => Object.prototype.hasOwnProperty.call(obiect, cheie);

  const rezultat: Canale = { ...implicit };
  if (are("formulare")) {
    if (typeof obiect.formulare !== "boolean") {
      throw eroare("formulare", "trebuie sa fie true sau false");
    }
    rezultat.formulare = obiect.formulare;
  }
  if (are("whatsapp")) {
    const v = text("whatsapp", obiect.whatsapp);
    if (v !== "" && !FORMA_WHATSAPP.test(v)) {
      throw eroare("whatsapp", "trebuie sa fie gol sau 8-15 cifre, fara plus, spatii sau cratime");
    }
    rezultat.whatsapp = v;
  }
  if (are("telefon")) {
    const v = text("telefon", obiect.telefon);
    if (v !== "" && !FORMA_TELEFON.test(v)) {
      throw eroare("telefon", "trebuie sa fie gol sau un numar E.164: plus si 8-15 cifre, fara spatii");
    }
    rezultat.telefon = v;
  }
  if (are("email")) {
    const v = text("email", obiect.email);
    if (v !== "" && !FORMA_ADRESEI.test(v)) {
      throw eroare("email", "trebuie sa fie gol sau o adresa de e-mail");
    }
    rezultat.email = v;
  }
  if (are("emailSecuritate")) {
    const v = text("emailSecuritate", obiect.emailSecuritate);
    if (!FORMA_ADRESEI.test(v)) {
      throw eroare("emailSecuritate", "trebuie sa fie o adresa de e-mail (nu poate fi gol)");
    }
    rezultat.emailSecuritate = v;
  }
  if (!rezultat.formulare && rezultat.whatsapp === "" && rezultat.telefon === "" && rezultat.email === "") {
    throw eroare(
      "formulare",
      "este false, dar whatsapp, telefon si email sunt goale: domeniul ar ramane fara niciun canal de contact",
    );
  }
  return rezultat;
}

// Canalele de contact ale domeniului, rezolvate, si legaturile catre ele.
//
// `CANALE` vine din `CANALE_JSON` (parsare si validare: `src/lib/canale-mediu.ts`), cu adresa marcii din
// `config/brand.json` ca implicit pentru `email`. Variabila nesetata = comportamentul de dinainte:
// formulare pornite, fara WhatsApp si fara telefon. Nicio valoare de canal nu e scrisa in cod.
//
// ATRIBUIREA se face numai prin codul `ref` din textul mesajului si din subiectul e-mailului, fara
// parametri de urmarire pe legatura. Marcajul are forma `[ref:<cod>]`; legaturile verifica sa fie
// prezent o singura data, ca un text copiat de pe alta pagina sa nu raporteze pagina gresita.
//
// CODIFICAREA textelor e aceeasi cu cea a legaturilor din documentul de continut: toate caracterele,
// in afara de litere ASCII, cifre si `_ . - ~`, devin `%XX` din octetii UTF-8. `encodeURIComponent`
// lasa necodificate si `! ' ( ) *`; aici se codifica si acestea, altfel corpul e-mailului cu paranteze
// ar iesi diferit de legatura de referinta.
//
// Unde se decide: pe server. In pachetul de browser variabila nu exista, deci `CANALE` ar fi implicitul;
// componentele de browser primesc canalele ca proprietati de la server.

import { adresaMarcii } from "./entitate";
import { configurareCanale, type Canale } from "@/lib/canale-mediu";

export type { Canale } from "@/lib/canale-mediu";

/** Canalele acestui build (validate: o forma gresita opreste construirea). */
export const CANALE: Canale = configurareCanale(process.env.CANALE_JSON, adresaMarcii() ?? "");

/** Forma codului `ref`: litere mici, cifre si cratime. */
const FORMA_REF = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Marcajul de atribuire din text, pentru un cod `ref`. */
export function marcajRef(ref: string): string {
  if (!FORMA_REF.test(ref)) {
    throw new Error('Cod ref invalid: "' + ref + '" (litere mici, cifre si cratime)');
  }
  return "[ref:" + ref + "]";
}

function cerePrezentaUnica(ref: string, text: string, unde: string): void {
  const marcaj = marcajRef(ref);
  const aparitii = text.split(marcaj).length - 1;
  if (aparitii !== 1) {
    throw new Error(unde + ": marcajul " + marcaj + " trebuie sa apara o singura data, apare de " + aparitii + " ori");
  }
}

/** Codificare procentuala in care raman necodificate numai `A-Z a-z 0-9 _ . - ~` (vezi antetul). */
export function codifica(text: string): string {
  return encodeURIComponent(text).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * Legatura wa.me cu textul precompletat, sau `null` cand domeniul nu are WhatsApp. Textul trebuie sa
 * contina marcajul `[ref:<ref>]` o singura data.
 */
export function legaturaWhatsApp(ref: string, text: string, canale: Canale = CANALE): string | null {
  cerePrezentaUnica(ref, text, "Textul WhatsApp");
  if (canale.whatsapp === "") {
    return null;
  }
  return "https://wa.me/" + canale.whatsapp + "?text=" + codifica(text);
}

/**
 * Legatura `mailto:` cu subiectul si corpul precompletate, sau `null` cand domeniul nu are adresa.
 * Subiectul trebuie sa contina marcajul `[ref:<ref>]` o singura data; corpul e liber (randurile noi
 * se scriu `\r\n`, ca in forma de referinta).
 */
export function legaturaEmail(ref: string, subiect: string, corp: string, canale: Canale = CANALE): string | null {
  cerePrezentaUnica(ref, subiect, "Subiectul e-mailului");
  if (canale.email === "") {
    return null;
  }
  return "mailto:" + canale.email + "?subject=" + codifica(subiect) + "&body=" + codifica(corp);
}

/** Grupele de cifre de dupa prefix, pe prefixele de tara pe care le afisam. */
const GRUPE_TARA: ReadonlyArray<{ prefix: string; grupe: number[] }> = [
  { prefix: "373", grupe: [2, 3, 3] },
  { prefix: "40", grupe: [3, 3, 3] },
];

/**
 * Numarul domeniului asa cum se citeste: prefixul si grupele tarii, despartite prin spatiu
 * (`+373 XX XXX XXX`). Un numar al altei tari, sau cu alta lungime, ramane in forma E.164.
 * Sirul gol cand domeniul nu are numar.
 *
 * Decizia 56 (03.10.2026): numarul se afiseaza numai ca TEXT, ca numar de WhatsApp. Nicio legatura de apel
 * obisnuit (GSM) nu se construieste din el, pe nicio editie; apelurile se primesc numai pe WhatsApp, prin
 * conversatia deschisa de legatura wa.me.
 */
export function numarAfisat(canale: Canale = CANALE): string {
  const t = canale.telefon;
  if (t === "") {
    return "";
  }
  const cifre = t.slice(1);
  for (const { prefix, grupe } of GRUPE_TARA) {
    const rest = cifre.slice(prefix.length);
    if (cifre.startsWith(prefix) && rest.length === grupe.reduce((a, b) => a + b, 0)) {
      const bucati: string[] = [];
      let i = 0;
      for (const g of grupe) {
        bucati.push(rest.slice(i, i + g));
        i += g;
      }
      return "+" + prefix + " " + bucati.join(" ");
    }
  }
  return t;
}

/**
 * Randul cu numarul de WhatsApp, ca text (`WhatsApp: +373 68 055 599`), pentru subsol; `null` cand domeniul n-are
 * WhatsApp sau n-are numar de afisat. Decizia 56: numarul ramane afisat numai ca numar de WhatsApp, fara legatura.
 */
export function randNumarWhatsApp(canale: Canale = CANALE): string | null {
  const numar = numarAfisat(canale);
  return canale.whatsapp === "" || numar === "" ? null : "WhatsApp: " + numar;
}

// Legaturile de canal ale unei editii, pagina cu pagina: din tabelul cale -> cod `ref` -> text precompletat
// (arhitectura EN §4.4 pentru engleza, planul valului §11 pentru romana din Republica Moldova) se
// construiesc, PE SERVER, tintele WhatsApp si e-mail ale fiecarei pagini (`LegaturaPeCale`). Componentele de
// browser primesc rezultatul ca date si aleg dupa calea curenta; canalele nu ajung in pachetul de browser ca
// variabila.
//
// Un canal gol al domeniului (`CANALE.whatsapp` sau `CANALE.email` gol) da `null`: legatura nu se randeaza.

import { legaturaEmail, legaturaWhatsApp, type Canale } from "@/content/canale";
import type { LegaturaPeCale } from "@/content/navigatie";

/** O pagina a editiei: calea (sau prefixul), codul `ref` si textul WhatsApp, care contine `[ref:<cod>]`. */
export type TextPePagina = {
  cale: string;
  /** Intrarea acopera si paginile de sub cale. */
  prefix?: boolean;
  ref: string;
  text: string;
};

/** Cum se scrie e-mailul unei pagini, din textul ei WhatsApp. */
export type FormaEmail = {
  subiect: (ref: string) => string;
  corp: (intrare: TextPePagina) => string;
};

/** Pagina implicita (fara intrare proprie) se cauta in tabel dupa cale. */
function intrareImplicita(tabel: readonly TextPePagina[], caleImplicita: string): TextPePagina {
  const intrare = tabel.find((t) => t.cale === caleImplicita && !t.prefix);
  if (intrare === undefined) {
    throw new Error("Tabelul de canale nu are pagina implicita " + caleImplicita);
  }
  return intrare;
}

/** Tintele WhatsApp pe pagina, sau `null` cand domeniul nu are WhatsApp. */
export function whatsappPePagina(tabel: readonly TextPePagina[], caleImplicita: string, canale: Canale): LegaturaPeCale | null {
  const implicita = intrareImplicita(tabel, caleImplicita);
  const legatura = (t: TextPePagina) => legaturaWhatsApp(t.ref, t.text, canale);
  const implicit = legatura(implicita);
  if (implicit === null) {
    return null;
  }
  return {
    implicit,
    pagini: tabel.map((t) => ({ cale: t.cale, prefix: t.prefix === true, href: legatura(t) as string })),
  };
}

/** Tintele `mailto:` pe pagina, sau `null` cand domeniul nu are adresa. */
export function emailPePagina(
  tabel: readonly TextPePagina[],
  caleImplicita: string,
  forma: FormaEmail,
  canale: Canale,
): LegaturaPeCale | null {
  const implicita = intrareImplicita(tabel, caleImplicita);
  const legatura = (t: TextPePagina) => legaturaEmail(t.ref, forma.subiect(t.ref), forma.corp(t), canale);
  const implicit = legatura(implicita);
  if (implicit === null) {
    return null;
  }
  return {
    implicit,
    pagini: tabel.map((t) => ({ cale: t.cale, prefix: t.prefix === true, href: legatura(t) as string })),
  };
}

/**
 * Propozitia din mijlocul textului WhatsApp, fara salut si fara marcaj: din
 * `Hello 3S, I read your website [ref:en-home]. I would like...` ramane `I read your website. I would like...`.
 */
export function propozitieFaraMarcaj(intrare: TextPePagina, salut: string): string {
  const fara = intrare.text.split(" [ref:" + intrare.ref + "]").join("");
  return fara.startsWith(salut) ? fara.slice(salut.length) : fara;
}

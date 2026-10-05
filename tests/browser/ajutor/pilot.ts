/**
 * Detectorul duratei pilotului gratuit (decizia owner-ului din 05.10.2026: pilotul are 14 zile, nu 30).
 *
 * Un PILOT DE 30 DE ZILE = o durata de 30 de zile (cifra sau cuvant, in engleza sau in romana) in aceeasi
 * propozitie cu cuvantul "pilot". Propozitia se taie la semnele de sfarsit (. ! ?) si e plafonata la FEREASTRA
 * caractere de fiecare parte, ca un text fara puncte (fluxul RSC, o lista JSON) sa nu lipeasca bucati straine.
 *
 * EXCEPTIA, una singura: durata de valabilitate a ofertei scrise ("valid for 30 days", "valabila 30 de zile"),
 * care sta pe /pricing in aceeasi propozitie cu pilotul ("After the pilot, we confirm ... in a written offer, valid
 * for 30 days.") si e alt termen (ramane 30). Exceptia cere AMBELE conditii: formula de valabilitate imediat
 * inaintea duratei SI cuvantul "offer" / "oferta" in aceeasi propozitie. Un pilot scris cu formula, dar fara
 * oferta ("the free pilot is valid for ..."), e acuzat; o propozitie care pomeneste oferta, dar fara formula
 * de valabilitate in fata duratei, e acuzata si ea. Celelalte termene de 30 de zile (cereri GDPR, cos, stergere,
 * preaviz, termene legale din blog) nu sunt in propozitii cu "pilot", deci nu cer exceptie.
 *
 * Tiparele se asambleaza la rulare: fisierul nu poarta literal forma pe care o vaneaza.
 *
 * CE NU VERIFICA: o durata scrisa altfel ("o luna", "four weeks") trece; o propozitie care pomeneste pilotul
 * fara cuvantul "pilot" ("the free trial lasts ...") trece; daca pilotul si durata stau in propozitii diferite,
 * legatura nu se vede; o propozitie cu AMBELE conditii ale exceptiei ("the pilot offer is valid for ...") trece,
 * fiindca detectorul nu deosebeste al cui e termenul de valabilitate.
 */

const FEREASTRA = 220
const SEP = '(?:\\s|&nbsp;|&#160;|\\u00a0|-)'

function durata(numar: string): RegExp {
  return new RegExp('(?<![\\w.,])' + numar + SEP + '*(?:days?\\b|de' + SEP + '+zile\\b|zile\\b)', 'gi')
}

/** 30, scris ca cifra sau ca numeral (engleza, romana). */
const NUMAR_30 = '(?:' + '3' + '0|' + 'thir' + 'ty|' + 'trei' + 'zeci)'
/** 14, scris ca cifra sau ca numeral (engleza, romana). */
const NUMAR_14 = '(?:' + '1' + '4|' + 'four' + 'teen|' + 'pai' + 'sprezece)'

const PILOT = /\bpilot/i
/** Valabilitatea ofertei: durata vine imediat dupa "valid (for)" sau "valabil(a/e)". */
const VALABILITATE = /(?:\bvalid(?:\s+for)?|\bvalabil[aăe]?)\s+$/i
/** Oferta scrisa, in engleza sau in romana ("offer", "oferta", "ofertei"; nu verbul "ofera"). */
const OFERTA = /\b(?:offer|ofert)/i
const SFARSIT = /[.!?](?=\s|$|<|")/g

function propozitia(text: string, inceput: number, sfarsit: number): string {
  const stanga = text.slice(Math.max(0, inceput - FEREASTRA), inceput)
  const dreapta = text.slice(sfarsit, sfarsit + FEREASTRA)
  let taieStanga = 0
  for (const m of stanga.matchAll(SFARSIT)) taieStanga = (m.index ?? 0) + 1
  const opreste = dreapta.search(SFARSIT)
  return stanga.slice(taieStanga) + text.slice(inceput, sfarsit) + (opreste >= 0 ? dreapta.slice(0, opreste + 1) : dreapta)
}

function cauta(text: string, numar: string, cuExceptie: boolean): string[] {
  const gasite: string[] = []
  for (const m of text.matchAll(durata(numar))) {
    const i = m.index ?? 0
    const p = propozitia(text, i, i + m[0].length)
    if (cuExceptie && VALABILITATE.test(text.slice(Math.max(0, i - 40), i)) && OFERTA.test(p)) continue
    if (PILOT.test(p)) gasite.push(p.replace(/\s+/g, ' ').trim())
  }
  return gasite
}

/** Propozitiile cu un pilot de 30 de zile; goala = curat. */
export function pilot30(text: string): string[] {
  return cauta(text, NUMAR_30, true)
}

/** Propozitiile cu pilotul de 14 zile (controlul ca detectorul vede textul paginilor). */
export function pilot14(text: string): string[] {
  return cauta(text, NUMAR_14, false)
}

/** Cate durate de 30 de zile are textul, cu pilot sau fara (controlul ca detectorul vede termenele care raman). */
export function durate30(text: string): number {
  return [...text.matchAll(durata(NUMAR_30))].length
}

/** Textul unui raspuns HTML: etichetele devin spatii, entitatile de spatiu devin spatii. Scripturile raman (JSON-LD, RSC). */
export function textDinHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
    .replace(/&amp;/g, '&')
}

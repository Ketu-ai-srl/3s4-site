import { expect, type Page } from '@playwright/test'

/**
 * Asteptarea hidratarii, pentru probele care SCRIU in DOM-ul paginii dupa incarcare.
 *
 * DE CE EXISTA. Martorii POZITIVI ai unor detectori fabrica o stare de proba direct in pagina (o legatura
 * moarta in subsol, un element inert in firul de navigare, o legatura in antet) ca sa arate ca detectorul o
 * prinde. `load` nu inseamna ca pagina e hidratata: React hidrateaza dupa el, iar cand gaseste intr-un
 * element ceva ce serverul nu a trimis, arunca eroarea de hidratare (#418 in productie) si regenereaza pe
 * client arborele din jur. Nodurile de proba dispar, iar proba cade cu "asteptate 2 defecte, primit 0"
 * fara ca pagina sa aiba vreun defect. CI 36688120515, incercarea 1: `livrare.spec.ts`, martorul din subsol
 * si fir, 423 ms; incercarea 2 a aceleiasi rulari a trecut.
 *
 * MASURAT, pe /securitate, la 1440, cu serverul local (`next start` din build-ul arborelui). Un nod scris
 * imediat dupa `load` in subsol a disparut in 8 din 10 incarcari la viteza normala si in 5 din 5 cu
 * procesorul incetinit de 4 ori; in firul de navigare, in 1 din 10 si 5 din 5; in antet, in 0 din 10 si
 * 5 din 5. De fiecare data cand nodul a disparut, pagina a dat #418. Scris dupa ce elementul avea cheia de
 * mai jos, nodul s-a pierdut in 0 din 10 la fiecare din cele trei elemente si la ambele viteze, fara #418.
 * Un nod scris direct in `body` nu s-a pierdut niciodata (0 din 15 scrise imediat, 0 din 15 dupa
 * asteptare): `body` e element singleton pentru React 19, iar coada lui nu se verifica, pe cand orice alt
 * element gestionat de React isi verifica coada la hidratare. Locurile de scriere din probe se clasifica
 * dupa asta: in `body` e in siguranta, in orice alt element al paginii cere asteptarea de mai jos.
 *
 * CE FACE. Asteapta ca fiecare element cerut sa poarte cheia interna `__reactFiber$...`. React o pune pe un
 * element abia in `completeWork`, dupa `popHydrationState` (react-dom 19.1, `react-dom-client`: verificarea
 * ca elementul nu mai are copii nehidratati, care da #418, vine INAINTEA lui `prepareToHydrateHostInstance`,
 * cel care scrie cheia). Prezenta ei spune deci exact ce cere proba: elementul a trecut de verificare, iar un
 * copil scris de acum nu mai poate declansa nepotrivirea. Nu se asteapta un timp ales.
 *
 * CE NU FACE. Nu ascunde o pagina care nu se hidrateaza: dupa `timeoutMs`, proba cade cu starea fiecarui
 * element (lipseste din pagina / nehidratat). Nu acopera o nepotrivire cauzata de pagina insasi (aceea ar
 * regenera arborele oricum, cu sau fara proba, si consola paginii o arata).
 */

/** Cat se asteapta hidratarea elementelor dupa `load`: plafon, nu buget (la x4 vine dupa ~0,5-0,8 s). */
export const TIMEOUT_HIDRATARE_MS = 15_000

/** Starea fiecarui selector fata de hidratare. Ruleaza IN pagina, deci nu se poate sprijini pe nimic din afara ei. */
function starileHidratarii(selectoare: string[]): string[] {
  return selectoare.map((selector) => {
    const el = document.querySelector(selector)
    const stare =
      el === null ? 'lipseste din pagina' : Object.keys(el).some((k) => k.startsWith('__reactFiber$')) ? 'hidratat' : 'nehidratat'
    return selector + ': ' + stare
  })
}

/**
 * Asteapta ca toate elementele `selectoare` sa fie hidratate. Se cheama dupa `goto`, inainte de orice proba
 * care scrie in acele elemente. La epuizare, mesajul probei spune care element lipseste sau nu s-a hidratat.
 */
export async function asteaptaHidratarea(
  page: Pick<Page, 'evaluate'>,
  selectoare: string[],
  timeoutMs: number = TIMEOUT_HIDRATARE_MS,
): Promise<void> {
  await expect
    .poll(() => page.evaluate(starileHidratarii, selectoare), {
      message: 'hidratarea nu a ajuns in ' + timeoutMs + ' ms la elementele cerute',
      timeout: timeoutMs,
      intervals: [50, 100, 250],
    })
    .toEqual(selectoare.map((s) => s + ': hidratat'))
}

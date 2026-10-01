import { expect, test as testulDeBaza } from '@playwright/test'
import { CONTOR_NAVIGARE, instaleazaReluarea, linieContor } from './navigare'

/**
 * `test` al probelor de browser: cel din Playwright, plus o fixtura automata de worker care pune
 * reluarea pe eroarea de transport (`ajutor/navigare.ts`) pe prototipul clasei Page a clientului.
 *
 * DE CE AICI, si nu in fiecare apel. Pe runner-ul Windows al CI, `page.goto` a cazut pe
 * `net::ERR_NO_BUFFER_SPACE` inainte ca pagina sa raspunda. Bucla din `navigare.ts` trateaza exact
 * semnatura asta, dar numai unde e chemata explicit; probele scrise cu navigare directa ramaneau
 * neacoperite, iar orice proba noua reintroducea golul. Infasurarea pe prototip acopera toate paginile
 * procesului (fixtura `page`, `browser.newContext()`, `browser.newPage()`), fara sa atinga vreun apel.
 *
 * DE CE TOATE PROBELE IMPORTA DE AICI. Fixtura ruleaza numai in procesele care folosesc acest `test`.
 * O proba care importa `test` direct din Playwright ar fi acoperita numai daca alta proba a instalat
 * deja infasurarea in acelasi proces, adica dupa ordinea fisierelor. Poarta `poarta-navigare.py` (N-01)
 * refuza importul direct.
 *
 * CE SE VEDE IN JURNAL. La inchiderea procesului, o linie
 * `[navigare] navigari N | reluate k | epuizate e`: numitorul (navigari reale) langa numarator
 * (reincercari si epuizari). Fiecare reincercare apare oricum si separat, cu starea masinii.
 *
 * CE NU FACE. Nu schimba `retries` (raman 0), nu reia nimic in afara semnaturii de transport si nu
 * acopera `frame.goto`, `page.request` sau `fetch` din Node.
 */
export const test = testulDeBaza.extend<object, { reluarePeTransport: void }>({
  reluarePeTransport: [
    async ({ browser }, use) => {
      // Prototipul se ia de pe o pagina reala: clasa clientului nu are o cale publica de import.
      const pagina = await browser.newPage()
      instaleazaReluarea(Object.getPrototypeOf(pagina))
      await pagina.close()
      await use()
      console.log(linieContor(CONTOR_NAVIGARE))
    },
    { scope: 'worker', auto: true },
  ],
})

export { expect }

import { spawnSync } from 'node:child_process'
import { freemem, totalmem } from 'node:os'
import type { Page, Response } from '@playwright/test'
import { nemasurat } from './proiect'

/**
 * Navigarea probelor de browser, cu o singura toleranta: eroarea de TRANSPORT a masinii de rulare.
 *
 * DE CE EXISTA. Pe runner-ul Windows al CI, `page.goto` a picat de doua ori in doua rulari (36286812854,
 * 36310864983) cu `net::ERR_NO_BUFFER_SPACE`: sistemul de operare nu a putut deschide conexiunea spre
 * serverul local (WSAENOBUFS), inainte ca vreun octet din pagina sa ajunga. Probele erau `blog-articole`
 * (axe la 1440, dupa 1,1 s) si `comutator` (retragerea din subsol, dupa 66 ms): nicio incalcare axe,
 * nicio asertiune despre pagina - proba nici n-a apucat sa vada pagina, iar testele vecine, inclusiv axe
 * la 390 pe aceeasi pagina de articol, au trecut. Ce nu se stie: DE CE a lipsit spatiul de tampon (epuizarea
 * porturilor efemere, presiune de memorie a driverului de retea?). Cauza la nivel de sistem e NEMASURATA;
 * aici se trateaza numai efectul, si numai semnatura lui exacta, iar la fiecare aparitie se scrie in
 * jurnal starea masinii (`starea masinii`), ca urmatoarea rulare sa aduca cifre despre cauza.
 *
 * CE FACE. Reia navigarea (cel mult `INCERCARI_NAVIGARE` ori, cu pauza crescatoare) DOAR cand eroarea
 * contine semnatura de transport. Orice alta eroare (pagina care nu raspunde, DNS, timeout, o cerere
 * blocata de proba) trece mai departe la prima aparitie, deci o pagina cazuta ramane rosie. Fiecare
 * reincercare se scrie in jurnal, ca frecventa reala sa se vada in CI, nu sa se ascunda.
 *
 * CAND SE EPUIZEAZA. Dupa ultima incercare masuratoarea e NEMASURATA, nu picata: o masina care nu poate
 * deschide conexiuni nu a masurat pagina, iar codul 3 al portii spune exact asta.
 *
 * CE NU FACE. Nu ridica niciun prag, nu asteapta un timp ales pana la "pagina gata" si nu ascunde
 * erori ale paginii. Asteptarea starii reale ramane a probei care o cere. Nu acopera cererile de dupa
 * navigare (scripturile, foile de stil, fonturile paginii): acelea se vad cu `urmareste()`, iar proba
 * care depinde de ele isi asteapta starea (de pilda ceasul de derulare din `cinema-1.spec.ts`).
 */

/** Semnatura erorii de transport, asa cum o scrie Playwright in mesajul lui `page.goto`. */
export const SEMNATURA_TRANSPORT = /net::ERR_NO_BUFFER_SPACE/

/** Incercari de navigare (prima plus reincercarile). */
export const INCERCARI_NAVIGARE = 4

/** Pauza inainte de reincercarea `n`: `n` x aceasta valoare (1 s, 2 s, 3 s). */
export const PAUZA_REINCERCARE_MS = 1000

export function esteEroareDeTransport(eroare: unknown): boolean {
  return SEMNATURA_TRANSPORT.test(eroare instanceof Error ? eroare.message : String(eroare))
}

/**
 * Starea masinii intr-o linie: memoria libera, portile TCP dinamice si cate socket-uri sunt in fiecare
 * stare (TIME_WAIT mare langa un interval dinamic mic = epuizarea porturilor efemere). Citita doar la o
 * eroare de transport, deci costa ceva (doua procese) numai cand chiar e nevoie. Unde `netstat` sau
 * `netsh` lipsesc (alt sistem de operare), spune asta in loc sa taca.
 */
export function stareaMasinii(): string {
  const parti = ['memorie libera ' + Math.round(freemem() / 2 ** 20) + ' din ' + Math.round(totalmem() / 2 ** 20) + ' MB']
  try {
    const r = spawnSync('netstat', ['-an'], { encoding: 'utf8', timeout: 15_000, windowsHide: true, maxBuffer: 256 * 2 ** 20 })
    if (r.status === 0 && typeof r.stdout === 'string') {
      const stari: Record<string, number> = {}
      for (const linie of r.stdout.split(/\r?\n/)) {
        const m = /^\s*TCP\s.*\s(ESTABLISHED|TIME_WAIT|CLOSE_WAIT|FIN_WAIT_1|FIN_WAIT_2|SYN_SENT|LAST_ACK)\s*$/.exec(linie)
        if (m) stari[m[1]] = (stari[m[1]] ?? 0) + 1
      }
      parti.push('socket-uri TCP ' + JSON.stringify(stari))
    } else {
      parti.push('netstat indisponibil')
    }
    const d = spawnSync('netsh', ['int', 'ipv4', 'show', 'dynamicport', 'tcp'], { encoding: 'utf8', timeout: 15_000, windowsHide: true })
    const pornire = /Start Port\s*:\s*(\d+)/i.exec(d.stdout ?? '')
    const numar = /Number of Ports\s*:\s*(\d+)/i.exec(d.stdout ?? '')
    parti.push(pornire && numar ? 'porturi dinamice ' + numar[1] + ' de la ' + pornire[1] : 'netsh indisponibil')
  } catch {
    parti.push('netstat / netsh indisponibile')
  }
  return parti.join(' | ')
}

export type OptiuniNavigare = Parameters<Page['goto']>[1]
export type OptiuniReincarcare = Parameters<Page['reload']>[0]

/**
 * Bucla comuna a lui `navigheaza` si `reincarca`: reia `apel` numai pe eroarea de transport, cu pauza
 * crescatoare, si scrie in jurnal fiecare reincercare. `url` si `ce` doar spun in jurnal si in mesajul
 * NEMASURAT ce se incerca.
 */
async function reiaPeTransport(
  page: Pick<Page, 'waitForTimeout'>,
  url: string,
  apel: () => Promise<Response | null>,
  jurnal: (mesaj: string) => void,
  stare: () => string,
  ce: 'navigarea spre' | 'reincarcarea paginii',
): Promise<Response | null> {
  for (let incercare = 1; incercare <= INCERCARI_NAVIGARE; incercare++) {
    try {
      return await apel()
    } catch (eroare) {
      if (!esteEroareDeTransport(eroare)) throw eroare
      jurnal(
        '[navigare] ' + url + ': incercarea ' + incercare + ' din ' + INCERCARI_NAVIGARE +
          ' a cazut pe transport (net::ERR_NO_BUFFER_SPACE)' + (incercare < INCERCARI_NAVIGARE ? ', reiau' : ''),
      )
      if (incercare === 1) jurnal('[navigare] starea masinii: ' + stare())
      if (incercare < INCERCARI_NAVIGARE) await page.waitForTimeout(PAUZA_REINCERCARE_MS * incercare)
    }
  }
  return nemasurat(
    ce + ' ' + url + ' a cazut de ' + INCERCARI_NAVIGARE +
      ' ori pe net::ERR_NO_BUFFER_SPACE: masina de rulare nu poate deschide conexiuni, deci pagina nu a fost masurata',
  )
}

/**
 * `page.goto` cu reincercare pe eroarea de transport. Semnatura ii este cea a lui `page.goto`; al patrulea
 * argument (`jurnal`) exista ca proba sa poata vedea reincercarile fara sa scrie in consola.
 */
export async function navigheaza(
  page: Pick<Page, 'goto' | 'waitForTimeout'>,
  url: string,
  optiuni?: OptiuniNavigare,
  jurnal: (mesaj: string) => void = console.log,
  stare: () => string = stareaMasinii,
): Promise<Response | null> {
  return reiaPeTransport(page, url, () => page.goto(url, optiuni), jurnal, stare, 'navigarea spre')
}

/**
 * `page.reload` cu aceeasi toleranta. In CI a cazut pana acum numai `goto`; o reincarcare deschide insa
 * conexiuni noi la fel, deci aceeasi eroare de transport e posibila si aici (nemasurat: niciun caz vazut).
 * Adresa din jurnal e cea de pe pagina in momentul cererii.
 */
export async function reincarca(
  page: Pick<Page, 'reload' | 'waitForTimeout' | 'url'>,
  optiuni?: OptiuniReincarcare,
  jurnal: (mesaj: string) => void = console.log,
  stare: () => string = stareaMasinii,
): Promise<Response | null> {
  return reiaPeTransport(page, page.url(), () => page.reload(optiuni), jurnal, stare, 'reincarcarea paginii')
}

/** Ce s-a pierdut pe drum in timp ce se incarca o pagina. */
export type Urmarire = {
  /** Cererile esuate la nivel de retea, ca `GET http://.../x.js: net::ERR_...`. Anularile de navigare (ERR_ABORTED) nu intra. */
  cereriEsuate: string[]
  /** Erorile necapturate ale paginii (`pageerror`), taiate la 200 de caractere. */
  erori: string[]
}

/**
 * Incepe sa noteze cererile esuate si erorile paginii. Se cheama INAINTE de navigare: ce s-a intamplat
 * in timpul incarcarii nu se mai poate afla dupa. Fara ea, o pagina care nu s-a hidratat (un script care
 * n-a ajuns) arata la fel ca una care are un defect, iar mesajul probei nu poate spune care dintre ele.
 */
export function urmareste(page: Pick<Page, 'on'>): Urmarire {
  const u: Urmarire = { cereriEsuate: [], erori: [] }
  page.on('requestfailed', (cerere) => {
    const text = cerere.failure()?.errorText ?? '?'
    if (/ERR_ABORTED/.test(text)) return
    u.cereriEsuate.push(cerere.method() + ' ' + cerere.url() + ': ' + text)
  })
  page.on('pageerror', (eroare) => {
    u.erori.push(String(eroare.message).slice(0, 200))
  })
  return u
}

/** Dintre cererile esuate, cele cu semnatura de transport a masinii de rulare. */
export function esuateDeTransport(u: Urmarire): string[] {
  return u.cereriEsuate.filter((c) => SEMNATURA_TRANSPORT.test(c))
}

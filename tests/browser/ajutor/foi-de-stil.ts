import type { Page } from '@playwright/test'
import { SEMNATURA_TRANSPORT } from './navigare'
import { nemasurat } from './proiect'

/**
 * Foile de stil ale paginii au ajuns? Controlul de dinaintea oricarei masuratori de asezare.
 *
 * DE CE EXISTA. Doua probe au picat intermitent in CI cu semnaturi care NU sunt ale paginii, ci ale
 * paginii FARA una din foile ei de stil:
 *   - `cinema-1.spec.ts`, eroul in doua bucati pe automatizari-ai (37078308172): CLS 0,38, LCP pe un `li`
 *     din cronologie, sectiunea de dupa erou la y 183 (eroul are 100vh, deci ea sta la 844). Cu foaia care
 *     poarta stilurile eroului blocata, local, deplasarile ies identice la pixel: sectiunea [183,515] ->
 *     [209,515], golul [91,51] -> [116,51], subtitlul [142,26] -> [167,26], LCP pe acelasi `li`.
 *   - `livrare.spec.ts`, axe target-size pe /solutii/constructii la 1440 (37075203263): singura incalcare,
 *     `.Antet_lupaMobil`. Cu foaia antetului blocata, local: exact aceeasi incalcare si numai ea (butonul
 *     de cautare mobil nu mai e ascuns peste 1200 px si nu mai are 33 x 33).
 * Fara foi, garda eroului si ascunderea butoanelor mobile (amandoua in CSS) nu exista, deci proba masura
 * alta pagina decat cea construita. DE CE a lipsit foaia in CI e NEMASURAT: jurnalul n-are cererile paginii.
 * Masina de rulare are o eroare de transport cunoscuta (`net::ERR_NO_BUFFER_SPACE`, vezi `navigare.ts`),
 * care acolo a lovit navigarile; reluarea ei nu acopera insa cererile de dupa navigare.
 *
 * CE FACE. `foiLipsa` intoarce adresele foilor declarate in document (`link[rel=stylesheet]`) care nu au
 * foaie incarcata. `cuFoileDeStil` judeca fiecare incarcare careia ii lipsesc foi dupa CAUZA lipsei
 * (`judecaLipsa`), nu dupa simptom:
 *   - o foaie lipsa cu raspuns HTTP de eroare (>= 400) e un defect al serverului site-ului: PICAT pe loc,
 *     fara reluare, chiar daca s-ar fi intamplat o singura data;
 *   - o foaie lipsa fara nicio cerere esuata notata pentru ea: cauza nu e reteaua, deci PICAT pe loc;
 *   - o foaie lipsa a carei cerere a cazut pe drum (`requestfailed`, adica reteaua dintre navigator si
 *     server) sau o cerere cazuta in puntea probei (`punte`): incarcarea nu se masoara si se reia, de cel
 *     mult `INCARCARI_FOI` ori, fiecare reluare scrisa in jurnal. La epuizare: NEMASURAT daca vreo cerere
 *     a cazut pe semnatura de transport a masinii sau in punte, PICAT altfel.
 *
 * CE NU FACE. Nu atinge pragurile si nici masuratoarea: o incarcare cu toate foile se masoara exact ca
 * inainte, iar una fara ele nu se masoara deloc. Nu reia nimic in afara unei foi pierdute pe drum: nici
 * o pagina care masoara prost, nici o foaie pe care serverul a refuzat-o.
 */

/** Incarcari permise per masuratoare (prima plus reluarile). */
export const INCARCARI_FOI = 3

/**
 * O cerere de foaie de stil care n-a adus foaia: `retea` = cererea a cazut pe drum (`requestfailed`),
 * `http` = serverul a raspuns cu eroare (>= 400). `url` e adresa absoluta, ca in `link.href`.
 */
export type ProblemaFoaie = { url: string; fel: 'retea' | 'http'; text: string }

/** Ce s-a pierdut pe drum dintre foile de stil. */
export type UrmarireFoi = { probleme: ProblemaFoaie[] }

/** Se cheama INAINTE de navigare: noteaza cererile de foi de stil esuate sau cu raspuns de eroare. */
export function urmaresteFoile(page: Pick<Page, 'on'>): UrmarireFoi {
  const u: UrmarireFoi = { probleme: [] }
  page.on('requestfailed', (cerere) => {
    if (cerere.resourceType() !== 'stylesheet') return
    u.probleme.push({ url: cerere.url(), fel: 'retea', text: cerere.failure()?.errorText ?? '?' })
  })
  page.on('response', (raspuns) => {
    if (raspuns.request().resourceType() !== 'stylesheet' || raspuns.status() < 400) return
    u.probleme.push({ url: raspuns.url(), fel: 'http', text: 'HTTP ' + raspuns.status() })
  })
  return u
}

/** O problema, pe un rand de jurnal. */
export function descrie(p: ProblemaFoaie): string {
  return p.url + ': ' + p.text
}

/**
 * Foile declarate in document care nu s-au incarcat. Zero foi declarate da lista goala.
 *
 * `sheet` nul NU ajunge: pentru o foaie a carei cerere a esuat, Chromium pastreaza un obiect `sheet`, iar
 * `cssRules` arunca `SecurityError` (masurat 03.10 cu cererea anulata: `sheet` prezent, regulile
 * inaccesibile; martorul pozitiv din `cinema-1.spec.ts` a picat pe varianta cu `sheet` nul). Pe aceeasi
 * origine o foaie incarcata are regulile citibile, deci lipsa = `sheet` nul, `cssRules` care arunca sau
 * zero reguli. O foaie de pe alta origine are mereu regulile inaccesibile: la ea se cere numai `sheet`.
 * Limita: o foaie goala, servita intentionat, ar iesi lipsa (site-ul nu are niciuna; ar pica zgomotos).
 */
export async function foiLipsa(page: Pick<Page, 'evaluate'>): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
      .filter((l) => {
        if (!l.sheet) return true
        if (new URL(l.href, location.href).origin !== location.origin) return false
        try {
          return l.sheet.cssRules.length === 0
        } catch {
          return true
        }
      })
      .map((l) => l.href),
  )
}

/** Rezultatul unei incarcari, cu ce trebuie ca sa se judece daca a avut toate foile. */
export type IncarcareCuFoi<T> = {
  rezultat: T
  /** `foiLipsa` citit pe pagina, dupa incarcare. */
  lipsa: string[]
  /** Ce s-a vazut pe drum la ACEASTA incarcare (`urmaresteFoile`), nu la cele dinainte. */
  probleme: ProblemaFoaie[]
  /** Cererile cazute in afara paginii, in puntea probei (de pilda serverul in doua bucati). */
  punte?: string[]
}

/** Judecata unei incarcari careia ii lipsesc foi: se reia sau e un defect, si de ce. */
export type JudecataLipsei = { reia: boolean; motiv: string }

/**
 * DE CE lipsesc foile. Se reia NUMAI cand lipsa vine de pe drum: o cerere cazuta in puntea probei, sau,
 * pentru FIECARE foaie lipsa, o cerere a ei cazuta in retea. Un raspuns HTTP >= 400 pentru o foaie
 * lipsa e defect pe loc, si are prioritate fata de o cadere in retea a aceleiasi foi. O foaie lipsa fara
 * nimic notat e tot defect pe loc: nu stim ca a fost reteaua, deci nu se presupune.
 */
export function judecaLipsa(i: Pick<IncarcareCuFoi<unknown>, 'lipsa' | 'probleme' | 'punte'>): JudecataLipsei {
  const punte = i.punte ?? []
  if (punte.length > 0) return { reia: true, motiv: 'cereri cazute in puntea probei: ' + punte.join(' ; ') }
  const http = i.probleme.filter((p) => p.fel === 'http' && i.lipsa.includes(p.url))
  if (http.length > 0) {
    return { reia: false, motiv: 'serverul site-ului a raspuns cu eroare la o foaie de stil: ' + http.map(descrie).join(' ; ') }
  }
  const faraCauza = i.lipsa.filter((u) => !i.probleme.some((p) => p.fel === 'retea' && p.url === u))
  if (faraCauza.length > 0) {
    return { reia: false, motiv: 'foi lipsa fara nicio cerere cazuta in retea: ' + faraCauza.join(' ; ') }
  }
  return { reia: true, motiv: 'cereri cazute in retea' }
}

/**
 * Reia `incarca` cat timp paginii ii lipsesc foi de stil pierdute PE DRUM (`judecaLipsa`), de cel mult
 * `INCARCARI_FOI` ori, si intoarce rezultatul primei incarcari complete. Orice alta lipsa e PICATA la prima
 * aparitie. `eticheta` apare in jurnal si in mesajul de refuz.
 */
export async function cuFoileDeStil<T>(
  eticheta: string,
  incarca: (incercare: number) => Promise<IncarcareCuFoi<T>>,
  jurnal: (mesaj: string) => void = console.log,
): Promise<T> {
  let transport = false
  let ultim = ''
  for (let incercare = 1; incercare <= INCARCARI_FOI; incercare++) {
    const i = await incarca(incercare)
    if (i.lipsa.length === 0) return i.rezultat
    const judecata = judecaLipsa(i)
    ultim =
      'foi de stil lipsa: ' + i.lipsa.join(' ; ') + ' | pe drum: ' +
      ([...i.probleme.map(descrie), ...(i.punte ?? []).map((e) => 'puntea probei: ' + e)].join(' ; ') || '(nimic notat)')
    if (!judecata.reia) {
      throw new Error(eticheta + ': incarcarea ' + incercare + ' fara toate foile de stil, nu se reia - ' + judecata.motiv + ' | ' + ultim)
    }
    transport =
      transport || (i.punte ?? []).length > 0 || i.probleme.some((p) => p.fel === 'retea' && SEMNATURA_TRANSPORT.test(p.text))
    jurnal(
      '[foi de stil] ' + eticheta + ': incarcarea ' + incercare + ' din ' + INCARCARI_FOI + ' fara toate foile, nemasurata' +
        (incercare < INCARCARI_FOI ? ', reiau' : '') + ' (' + judecata.motiv + ') | ' + ultim,
    )
  }
  const mesaj = eticheta + ': nicio incarcare din ' + INCARCARI_FOI + ' nu a avut toate foile de stil | ' + ultim
  if (transport) nemasurat(mesaj)
  throw new Error(mesaj)
}

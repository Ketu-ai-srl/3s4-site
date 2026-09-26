import { expect, test, type Page } from '@playwright/test'
import { RUTE } from '../../src/content/rute'

/**
 * DOAR MARCA 3S (decizia owner-ului D10, 25.09.2026, „nu, doar 3s"): pe nicio ruta din `RUTE`
 * nu apare numele firmei care detinea pana acum sigla si faptele de vechime - nici in HTML-ul
 * SERVIT (text, date structurate, payload-ul de hidratare, atribute), nici in textul RANDAT si in
 * atributele din DOM-ul viu (`alt`, `aria-label`, `title`, meta).
 *
 * Numele se asambleaza la RULARE, din bucati: scris pe litere, fisierul asta ar fi el insusi o
 * aparitie, iar controlul de la final (`git grep` pe tot arborele = 0) l-ar numara.
 *
 * MARTORII. Pozitiv: acelasi detector, pe o COPIE a HTML-ului servit si pe DOM-ul viu, dupa ce se
 * injecteaza un fragment cu numele; trebuie prins, altfel un zero pe rute nu inseamna nimic.
 * Negativ: un fragment fara nume, injectat la fel, nu are voie sa fie prins (detectorul nu raspunde
 * "gasit" la orice). `innerWidth` se citeste si se scrie in raport la fiecare masuratoare.
 *
 * Ce NU masoara: literele desenate ca trasee in imagini (sigla). Pe acelea le apara
 * `tests/fundatie-brand.test.ts`, care cere ca fisierul servit al siglei sa aiba numai iconita.
 */

const NUME = ['ad', 'ria'].join('')

/** Aparitiile numelui intr-un text, fara majuscule; pozitia si un fragment, pentru raport. */
function aparitii(text: string): string[] {
  const iesire: string[] = []
  const mic = text.toLowerCase()
  let i = mic.indexOf(NUME)
  while (i >= 0 && iesire.length < 5) {
    iesire.push(i + ': ' + text.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' '))
    i = mic.indexOf(NUME, i + 1)
  }
  return iesire
}

/** Textul randat si toate valorile de atribut din DOM-ul viu, inclusiv `<head>`. */
async function textRandat(page: Page): Promise<string> {
  return page.evaluate(() => {
    const bucati: string[] = [document.title, document.body.innerText]
    for (const el of Array.from(document.querySelectorAll('*'))) {
      // Continutul scripturilor e deja in HTML-ul servit; aici conteaza ce vede sau aude omul.
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue
      for (const a of Array.from(el.attributes)) bucati.push(a.value)
    }
    return bucati.join('\n')
  })
}

async function deschide(page: Page, cale: string): Promise<number> {
  await page.goto(cale, { waitUntil: 'load' })
  return page.evaluate(() => window.innerWidth)
}

test.describe('doar marca 3S pe fiecare ruta din RUTE', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('controlul listei: RUTE are rute si include startul', () => {
    expect(RUTE.length).toBeGreaterThan(10)
    expect(RUTE.some((r) => r.cale === '/')).toBe(true)
  })

  for (const ruta of RUTE) {
    test('fara numele altei firme: ' + ruta.cale, async ({ page, request }) => {
      const raspuns = await request.get(ruta.cale)
      expect(raspuns.status(), ruta.cale).toBe(200)
      const servit = await raspuns.text()
      const latime = await deschide(page, ruta.cale)
      const randat = await textRandat(page)
      console.log('[doar-3s] ' + ruta.cale + ' | innerWidth CITIT: ' + latime + ' | servit ' + servit.length + ' car. | randat ' + randat.length + ' car.')
      // Controlul masuratorii: ambele suprafete au continut, altfel zero aparitii ar fi o cautare in gol.
      expect(servit.length).toBeGreaterThan(1000)
      expect(randat.length).toBeGreaterThan(200)
      expect(aparitii(servit), 'HTML servit ' + ruta.cale).toEqual([])
      expect(aparitii(randat), 'text randat ' + ruta.cale).toEqual([])
    })
  }

  test('martor POZITIV: un fragment cu numele, injectat in copia HTML-ului si in DOM, e prins', async ({ page, request }) => {
    const servit = await (await request.get('/')).text()
    const fragment = '<p>' + NUME.toUpperCase() + ' Exemplu, depozit</p>'
    const copie = servit.replace('</body>', fragment + '</body>')
    // Controlul injectiei: copia chiar s-a schimbat.
    expect(copie.length).toBe(servit.length + fragment.length)
    expect(aparitii(copie).length).toBe(1)

    const latime = await deschide(page, '/')
    await page.evaluate((t) => {
      const p = document.createElement('p')
      p.textContent = t
      p.setAttribute('data-martor', '')
      document.body.appendChild(p)
    }, NUME.charAt(0).toUpperCase() + NUME.slice(1) + ' arhivează')
    const randat = await textRandat(page)
    console.log('[doar-3s martor pozitiv] innerWidth CITIT: ' + latime)
    expect(aparitii(randat).length).toBeGreaterThanOrEqual(1)
  })

  test('martor NEGATIV: un fragment fara nume, injectat la fel, nu e prins', async ({ page, request }) => {
    const servit = await (await request.get('/')).text()
    const copie = servit.replace('</body>', '<p>Alfa Exemplu, arhivare digitală</p></body>')
    expect(copie).not.toBe(servit)
    expect(aparitii(copie)).toEqual([])

    await deschide(page, '/')
    await page.evaluate(() => {
      const p = document.createElement('p')
      p.textContent = 'Arhivă 3S, exemplu'
      document.body.appendChild(p)
    })
    expect(aparitii(await textRandat(page))).toEqual([])
  })
})

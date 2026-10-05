import type { Page } from '@playwright/test'
import { expect, test } from './ajutor/baza'
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'
import { masoaraAccesibilitatea } from './ajutor/detectori'
import * as despre from '../../src/content/en/despre-componente'
import * as platforma from '../../src/content/en/platforma-componente'

/**
 * Felia 103 (`editie-platforma-despre-en`), pe COPIA 3s.md (`ajutor/copie-3s-md.ts`): P02 `/platform` si P11 `/about`
 * compun componentele paginilor RO `/platforma` si `/securitate` (decizia 53), cu textul din
 * `src/content/en/{platforma,despre}-componente.ts`. Forma (radacinile, clasele, numaratorile, stilurile) o masoara
 * `congruenta.spec.ts` contra listelor `config/congruenta/p02.json` si `p11.json`; aici, criteriul de gata al feliei:
 *  1. HTML-ul servit: un singur H1, zero `<form`, zero RON, zero diacritice in `<main>`, firul cu eticheta EN si un
 *     singur BreadcrumbList; pe /platform, WhatsApp cu `[ref:en-platform]` o data in erou si o data in blocul de
 *     final; pe /about, ca pe perechea RO, fara bloc de final: WhatsApp-ul paginii (`[ref:en-about]`) e in antet;
 *  2. FAQPage din JSON-LD = intrebarile si raspunsurile vizibile ale acordeonului, in ordine, pe ambele pagini;
 *  3. `textContent`-ul lui `<main>` contine fiecare sir randat al modulelor EN (numarat, raportat);
 *  4. ancorele `/about#security` si `/about#limits` stau imediat inaintea blocului cu locul datelor si a intrebarilor,
 *     iar navigarea la `#security` aduce titlul blocului sub antet;
 *  5. verificarea din browser masoara pe copia 3s.md (punctul de sanatate raspunde: timpul in milisecunde, textul
 *     EN); eticheta hartii e "Frankfurt";
 *  6. fara defilare orizontala la 1440 si 390; axe fara incalcari grave pe care perechea RO nu le are.
 *
 * MARTORII: detectorul de siruri lipsa prinde un sir fabricat la rulare (POZITIV) si nu acuza H1-ul paginii (NEGATIV);
 * comparatia FAQPage prinde o intrebare scoasa dintr-o copie a nodului; extragerea WhatsApp gaseste legatura cu ref
 * intr-un HTML asamblat la rulare.
 */

const PROFIL = mediuProfil3sMd()
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string }
const WA = 'https://wa.me/' + CANALE.whatsapp + '?text='
const RON = new RegExp('\\b' + 'R' + 'ON\\b')
const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/

/** Cheile care nu poarta text vizibil: iconite, pozitii, tinte, ancore, numerele desenate din atribut. */
const FARA_TEXT = new Set(['iconita', 'reper', 'href', 'ruta', 'cale', 'ancora', 'numar'])

function frunze(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === 'string') {
    const t = valoare.trim()
    if (t !== '' && !/^(\/|#|https?:|mailto:)/.test(t)) acc.push(t)
  } else if (Array.isArray(valoare)) {
    for (const v of valoare) frunze(v, acc)
  } else if (valoare && typeof valoare === 'object') {
    for (const [k, v] of Object.entries(valoare)) if (!FARA_TEXT.has(k)) frunze(v, acc)
  }
  return acc
}

/**
 * Sirurile randate ale fiecarei pagini. Nu intra: butonul principal din continutul blocului de final (pagina pune
 * butonul WhatsApp in locul lui), declaratia machetei si eticheta firului (etichete accesibile, masurate separat),
 * numele listei de insigne (`aria-label`), textele verificarii care apar numai dupa masurare.
 */
const PAGINI = {
  '/platform': {
    ref: '[ref:en-platform]',
    asteptate: (): string[] => {
      const { butonPrincipal: _b, vizual, ...cta } = platforma.CTA_FINAL_PLATFORMA_EN
      void _b
      const p = platforma.PLATFORMA_EN
      return [
        ...new Set(
          frunze([
            p.fir,
            p.erou,
            { ...p.macheta, declaratie: null },
            p.piloni,
            p.model,
            p.blocArhiva,
            p.blocIntrebari,
            { ...p.comparatie, etichetaCriteriu: null },
            p.suveranitate,
            p.cazuri,
            { ...p.conformitate, etichetaInsigne: null },
            p.intrebari,
            platforma.ETICHETA_BUTON_CANAL_PLATFORMA,
            platforma.EROU_SECUNDAR_PLATFORMA.text,
            cta,
            { ...vizual, declaratie: null },
          ]),
        ),
      ]
    },
    intrebari: platforma.PLATFORMA_EN.intrebari!,
    sectiuneIntrebari: 'platforma-intrebari',
    fir: ['Home', 'Platform'],
  },
  '/about': {
    ref: '[ref:en-about]',
    asteptate: (): string[] => {
      const d = despre.DESPRE_EN
      const v = despre.VERIFICARE_EN
      return [
        ...new Set(
          frunze([
            d.fir,
            d.erou,
            d.piloni,
            { ...d.infrastructura, harta: { ...d.infrastructura!.harta, descriere: null } },
            d.ciclu,
            d.reglementare,
            d.intrebari,
            { titlu: v.titlu, reia: v.reia, chei: v.chei, asteptare: v.asteptare, nota: v.nota },
          ]),
        ),
      ]
    },
    intrebari: despre.DESPRE_EN.intrebari!,
    sectiuneIntrebari: 'securitate-intrebari',
    fir: ['Home', 'About'],
  },
} as const
type Cale = keyof typeof PAGINI
const CAI = Object.keys(PAGINI) as Cale[]

const spatii = (t: string) => t.replace(/\s+/g, ' ')

function lipsa(text: string, siruri: string[]): string[] {
  const t = spatii(text)
  return siruri.filter((s) => !t.includes(spatii(s)))
}

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

async function servit(cale: string): Promise<string> {
  const r = await fetch(copie.baza + cale)
  expect(r.status, cale).toBe(200)
  return r.text()
}

function bucata(html: string, deschidere: RegExp, inchidere: string): string {
  const m = deschidere.exec(html)
  if (m === null) return ''
  const sfarsit = html.indexOf(inchidere, m.index)
  return sfarsit < 0 ? '' : html.slice(m.index, sfarsit + inchidere.length)
}

function whatsapp(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1].split('&amp;').join('&')).filter((h) => h.startsWith(WA))
}

/** Nodurile JSON-LD ale paginii servite, din toate blocurile. */
function noduri(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const j = JSON.parse(m[1]) as { '@graph'?: Record<string, unknown>[] } & Record<string, unknown>
    return j['@graph'] ?? [j]
  })
}

test('martor POZITIV: extragerea WhatsApp gaseste legatura cu ref intr-un HTML asamblat la rulare', () => {
  const href = WA + encodeURIComponent('Hello 3S, I read x [ref:' + 'en-proba]. Hi.')
  expect(whatsapp('<main><a class="b" href="' + href + '">Message us</a></main>')).toHaveLength(1)
})

for (const cale of CAI) {
  test(cale + ': HTML-ul servit - un H1, zero <form, zero RON, zero diacritice, firul EN cu un singur BreadcrumbList', async () => {
    const html = await servit(cale)
    expect(html).toMatch(/<html[^>]*\blang="en"/)
    expect(html.match(/<h1\b/g) ?? []).toHaveLength(1)
    expect(html).not.toContain('<form')
    expect(RON.test(html)).toBe(false)
    const main = bucata(html, /<main\b/, '</main>')
    expect(main).not.toBe('')
    const vazut = main.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')
    expect(DIACRITICE.test(vazut), 'diacritice in textul lui <main>').toBe(false)
    expect(DIACRITICE.test(main), 'diacritice in atributele lui <main>').toBe(false)
    expect(main).toContain('aria-label="Breadcrumb"')
    const fire = noduri(html).filter((n) => n['@type'] === 'BreadcrumbList') as { itemListElement: { name: string }[] }[]
    expect(fire).toHaveLength(1)
    expect(fire[0].itemListElement.map((x) => x.name)).toEqual(PAGINI[cale].fir)
    expect(noduri(html).filter((n) => n['@type'] === 'WebPage')).toHaveLength(1)
  })
}

test('/platform: WhatsApp cu [ref:en-platform] o data in erou si o data in blocul de final; butonul secundar duce la /contact', async () => {
  const html = await servit('/platform')
  const erou = bucata(html, /<section\b[^>]*aria-labelledby="platforma-titlu"/, '</section>')
  const final = bucata(html, /<section\b[^>]*aria-labelledby="cta-final-titlu"/, '</section>')
  expect(erou).not.toBe('')
  expect(final).not.toBe('')
  for (const [nume, bloc] of [['erou', erou], ['final', final]] as const) {
    const wa = whatsapp(bloc)
    expect(wa, nume).toHaveLength(1)
    expect(decodeURIComponent(wa[0].slice(WA.length)), nume).toContain(PAGINI['/platform'].ref)
  }
  expect(whatsapp(bucata(html, /<main\b/, '</main>'))).toHaveLength(2)
  expect(erou).toContain('href="/contact"')
})

test('/about: fara bloc de final, ca perechea RO; WhatsApp-ul paginii, cu [ref:en-about], e in antet', async () => {
  const html = await servit('/about')
  const main = bucata(html, /<main\b/, '</main>')
  const antet = bucata(html, /<header\b/, '</header>')
  expect(antet).not.toBe('')
  expect(whatsapp(main)).toHaveLength(0)
  const wa = whatsapp(antet)
  expect(wa.length).toBeGreaterThan(0)
  for (const h of wa) expect(decodeURIComponent(h.slice(WA.length))).toContain(PAGINI['/about'].ref)
  expect(main).not.toContain('cta-final-titlu')
})

for (const cale of CAI) {
  test(cale + ': FAQPage din JSON-LD = intrebarile si raspunsurile vizibile, in ordine', async ({ page }) => {
    await page.goto(copie.baza + cale)
    const html = await page.content()
    const faq = noduri(html).filter((n) => n['@type'] === 'FAQPage') as { inLanguage: string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] }[]
    expect(faq).toHaveLength(1)
    expect(faq[0].inLanguage).toBe('en')
    const sectiune = page.locator('section[aria-labelledby="' + PAGINI[cale].sectiuneIntrebari + '"]')
    const intrebariVazute = (await sectiune.locator('details summary').allTextContents()).map((t) => spatii(t).trim())
    const raspunsuriVazute = (await sectiune.locator('details > div').allTextContents()).map((t) => spatii(t).trim())
    expect(faq[0].mainEntity.map((q) => q.name)).toEqual(intrebariVazute)
    expect(faq[0].mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(raspunsuriVazute)
    expect(intrebariVazute).toEqual(PAGINI[cale].intrebari.intrebari.map((i) => i.intrebare))
    // Martor: o intrebare scoasa dintr-o copie a nodului nu mai egaleaza lista vizibila.
    expect(faq[0].mainEntity.slice(1).map((q) => q.name)).not.toEqual(intrebariVazute)
  })

  test(cale + ': textContent-ul lui <main> contine fiecare sir randat al modulului EN', async ({ page }) => {
    await page.goto(copie.baza + cale)
    const text = (await page.locator('main').textContent()) ?? ''
    const siruri = PAGINI[cale].asteptate()
    console.log('[editie-platforma-despre-en] ' + cale + ': siruri asteptate ' + siruri.length + ', cuvinte ' + siruri.join(' ').split(/\s+/).length)
    expect(siruri.length).toBeGreaterThan(60)
    expect(lipsa(text, siruri)).toEqual([])
  })

  test(cale + ': martor POZITIV - detectorul de siruri lipsa prinde un sir fabricat la rulare, absent din pagina', async ({ page }) => {
    await page.goto(copie.baza + cale)
    const text = (await page.locator('main').textContent()) ?? ''
    const fabricat = ['Qx', 'absent', String(Date.now())].join(' ')
    expect(lipsa(text, [...PAGINI[cale].asteptate(), fabricat])).toEqual([fabricat])
  })

  test(cale + ': martor NEGATIV - detectorul nu acuza H1-ul paginii', async ({ page }) => {
    await page.goto(copie.baza + cale)
    const text = (await page.locator('main').textContent()) ?? ''
    const h1 = ((await page.locator('h1').textContent()) ?? '').trim()
    expect(h1.length).toBeGreaterThan(10)
    expect(lipsa(text, [h1])).toEqual([])
  })
}

test('/about: ancorele security si limits stau imediat inaintea blocului cu locul datelor si a intrebarilor', async ({ page }) => {
  await page.goto(copie.baza + '/about')
  const vecini = await page.evaluate(() =>
    ['security', 'limits'].map((id) => {
      const el = document.getElementById(id)
      const urm = el?.nextElementSibling ?? null
      return {
        id,
        exista: el !== null,
        inMain: el?.closest('main') !== null,
        inaltime: el ? el.getBoundingClientRect().height : -1,
        urmator: urm ? urm.tagName.toLowerCase() + '#' + (urm.getAttribute('aria-labelledby') ?? '') : null,
      }
    }),
  )
  expect(vecini).toEqual([
    { id: 'security', exista: true, inMain: true, inaltime: 0, urmator: 'section#securitate-bloc-01' },
    { id: 'limits', exista: true, inMain: true, inaltime: 0, urmator: 'section#securitate-intrebari' },
  ])
})

test('/about#security: navigarea aduce titlul blocului cu locul datelor in fereastra, sub antet', async ({ page }) => {
  await page.goto(copie.baza + '/about#security')
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const t = document.getElementById('securitate-bloc-01')
    const antet = document.querySelector('header')
    return {
      sus: t ? t.getBoundingClientRect().top : null,
      fereastra: window.innerHeight,
      antet: antet ? antet.getBoundingClientRect().bottom : 0,
      derulat: window.scrollY,
    }
  })
  expect(r.sus).not.toBeNull()
  // Controlul: pagina chiar s-a derulat (titlul nu e in fereastra din prima).
  expect(r.derulat).toBeGreaterThan(200)
  expect(r.sus!).toBeGreaterThanOrEqual(r.antet - 1)
  expect(r.sus!).toBeLessThan(r.fereastra / 2)
})

test('/about: verificarea masoara pe copie (timpul in milisecunde, textul EN); eticheta hartii e Frankfurt', async ({ page }) => {
  await page.goto(copie.baza + '/about')
  const sectiune = page.locator('section[aria-label="' + despre.ETICHETA_VERIFICARE_EN + '"]')
  await expect(sectiune).toHaveCount(1)
  await sectiune.scrollIntoViewIfNeeded()
  await expect(sectiune).toContainText(/\d+ ms/, { timeout: 15_000 })
  // Copia e servita pe http, deci raspunsul conexiunii e cel negativ, in engleza.
  await expect(sectiune).toContainText(despre.VERIFICARE_EN.criptareNu)
  await expect(sectiune).not.toContainText(despre.VERIFICARE_EN.indisponibil)
  const eticheta = page.locator('[class*="securitate_reperEticheta__"]')
  await expect(eticheta).toHaveText('Frankfurt')
  const stil = await eticheta.getAttribute('style')
  expect(stil).toContain('left:' + despre.DESPRE_EN.infrastructura!.harta.reper.x + '%')
})

async function defilare(page: Page): Promise<{ latime: number; defilare: number }> {
  return page.evaluate(() => ({ latime: window.innerWidth, defilare: document.documentElement.scrollWidth }))
}

for (const latime of [1440, 390] as const) {
  test.describe('la ' + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 390 ? 844 : 900 } })

    for (const cale of CAI) {
      test(cale + ': fara defilare orizontala', async ({ page }) => {
        await page.goto(copie.baza + cale)
        const m = await defilare(page)
        expect(m.latime).toBe(latime)
        expect(m.defilare).toBe(m.latime)
      })
    }

    for (const [cale, ro] of [['/platform', '/platforma'], ['/about', '/securitate']] as const) {
      test(cale + ': axe fara incalcari grave pe care perechea RO (' + ro + ') nu le are', async ({ page, baseURL }) => {
        test.setTimeout(120_000)
        const reguli = async (adresa: string) => {
          await page.goto(adresa)
          await page.waitForLoadState('networkidle')
          const m = await masoaraAccesibilitatea(page)
          expect(m.reguliRulate, adresa).toBeGreaterThan(0)
          return new Set(m.grave.map((g) => g.regula))
        }
        const peRo = await reguli(baseURL + ro)
        const peEn = await reguli(copie.baza + cale)
        console.log('[editie-platforma-despre-en] axe ' + latime + ' ' + cale + ': ' + ([...peEn].join(',') || 'zero grave') + ' | ' + ro + ': ' + ([...peRo].join(',') || 'zero grave'))
        expect([...peEn].filter((r) => !peRo.has(r))).toEqual([])
      })
    }
  })
}

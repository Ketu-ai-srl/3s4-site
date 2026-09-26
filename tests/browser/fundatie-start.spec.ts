import { expect, test, type Page } from '@playwright/test'

/**
 * Pagina de start la 1440 si 390 (felia `fundatie`): ordinea sectiunilor, inaltimile cioturilor
 * in starea lor statica, acordeonul si aparitia la derulare cu miscare redusa.
 *
 * INALTIMILE sunt cele masurate pe referinta (acasa-erou.md, acasa-constructor.md,
 * acasa-functionalitati.md), cu toleranta de 2%: cioturile nu au text de lungime fixa, dar
 * cutia lor e data de reguli (100lvh, 80vh, padding-uri si, la functionalitati, minimele din
 * fisa pe fiecare cutie cu text), nu de text. Cifrele se scriu aici o singura data si se compara
 * cu `innerWidth` CITIT din pagina: raportul de pixeli nu se presupune.
 *
 * De ce minimele: la 390 ciotul functionalitatilor a coborat la 2214,8 (-2,24%) cand felia de
 * text a scurtat subtitlul si primul paragraf cu cate un rand. Proba de mai jos scurteaza ea
 * insasi textul, in pagina, si cere aceeasi inaltime: fara minime, pica.
 *
 * UNDE se aplica minimele: la 1440 (desktop) si pana la 400 px, adica acolo unde fisa are
 * masuratoarea (390). Intre 401 si 900 px fisa nu are masuratori, deci cutiile raman la inaltimea
 * continutului, ca in lot. Aplicate pe toata varianta de pana la 900 px, minimele de la 390
 * adaugau gol sub text: 118,8 px la 430, 290,9 la 768, 380,1 la 900 (masurat de critic, runda 1).
 * Proba latimilor 401 / 768 / 900 scurteaza textele in pagina, ca un minim ramas activ sa lase gol
 * oricat de lung ar fi textul de azi, si cere zero gol sub continut in fiecare cutie.
 *
 * Sectiunea functionalitatilor sub 900 px e varianta de miscare redusa (2265,6 la 390): pista
 * lipita de 300lvh e a feliei `functionalitati-acasa`, iar probele de browser ruleaza oricum cu
 * miscare redusa (playwright.config.ts).
 */

type Cutie = { ciot: string | null; id: string; y: number; h: number }

async function sectiuni(page: Page): Promise<Cutie[]> {
  return page.locator('main > section').evaluateAll((noduri) =>
    noduri.map((el) => {
      const r = el.getBoundingClientRect()
      return {
        ciot: el.getAttribute('data-ciot'),
        id: el.id,
        y: Math.round((r.top + window.scrollY) * 10) / 10,
        h: Math.round(r.height * 10) / 10,
      }
    }),
  )
}

/** Toate textele ciotului functionalitatilor devin un singur cuvant, in pagina; intoarce cate. */
async function scurteazaTextele(page: Page): Promise<number> {
  return page.locator('[data-ciot="functionalitati"]').evaluate((s) => {
    const tinte = [...s.querySelectorAll('h2, h3, p')]
    for (const el of tinte) el.textContent = 'Scurt.'
    return tinte.length
  })
}

type Gol = { cutie: string; gol: number }

/**
 * Golul de sub continut al fiecarei cutii cu text a ciotului functionalitatilor: capul, cele 3
 * blocuri de text si fraza de iesire. Gol = inaltimea interioara a cutiei (fara padding si chenar)
 * minus intinderea copiilor ei vizibili, cu tot cu marginile lor. Cutiile sunt coloane flex, deci
 * marginile nu se contopesc si continutul sta lipit sus: un minim mai mare decat continutul apare
 * exact ca gol.
 */
async function goluriCiot(page: Page): Promise<Gol[]> {
  return page.locator('[data-ciot="functionalitati"]').evaluate((s) => {
    const cutii: [string, Element | null][] = [
      ['cap', s.querySelector('header')],
      ...[...s.querySelectorAll('ol > li > div')].map((el, i): [string, Element] => ['text ' + (i + 1), el]),
      ['final', s.querySelector('.container-site > :last-child')],
    ]
    return cutii.map(([cutie, el]) => {
      if (!el) return { cutie, gol: Number.NaN }
      const cs = getComputedStyle(el)
      const interior =
        el.getBoundingClientRect().height -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom) -
        parseFloat(cs.borderTopWidth) -
        parseFloat(cs.borderBottomWidth)
      let sus = Infinity
      let jos = -Infinity
      for (const copil of el.children) {
        const cc = getComputedStyle(copil)
        if (cc.display === 'none') continue
        const r = copil.getBoundingClientRect()
        sus = Math.min(sus, r.top - parseFloat(cc.marginTop))
        jos = Math.max(jos, r.bottom + parseFloat(cc.marginBottom))
      }
      return { cutie, gol: Math.round((interior - (jos - sus)) * 10) / 10 }
    })
  })
}

/** Cioturile a caror inaltime se abate cu mai mult de `toleranta` fata de tinta. */
function abateri(cutii: Cutie[], tinte: Record<string, number>, toleranta = 0.02): string[] {
  const rezultat: string[] = []
  for (const [ciot, tinta] of Object.entries(tinte)) {
    const c = cutii.find((x) => x.ciot === ciot)
    if (!c) rezultat.push(ciot + ': lipseste')
    else if (Math.abs(c.h - tinta) / tinta > toleranta) rezultat.push(ciot + ': ' + c.h + ' fata de ' + tinta)
  }
  return rezultat
}

const TINTE: Record<number, { inaltime: number; ciot: Record<string, number> }> = {
  1440: { inaltime: 900, ciot: { erou: 900, constructor: 1008, functionalitati: 2677.6 } },
  390: { inaltime: 844, ciot: { erou: 925.4, constructor: 928, functionalitati: 2265.6 } },
}

for (const latime of [1440, 390]) {
  test.describe('startul la ' + latime, () => {
    test.use({ viewport: { width: latime, height: TINTE[latime].inaltime } })

    test('cioturile au inaltimea starii statice masurate pe referinta', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const citit = await page.evaluate(() => window.innerWidth)
      const cutii = await sectiuni(page)
      console.log('[start] innerWidth CITIT: ' + citit + ' | ' + cutii.map((c) => (c.ciot ?? c.id ?? '-') + ' ' + c.h).join(' / '))
      expect(citit).toBe(latime)
      expect(abateri(cutii, TINTE[latime].ciot)).toEqual([])
    })

    test('ciotul functionalitatilor pastreaza inaltimea cand textul lui se scurteaza', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const sectiune = page.locator('[data-ciot="functionalitati"]')
      const inainte = await sectiune.evaluate((s) => s.getBoundingClientRect().height)
      const subtitluInainte = await sectiune.locator('header p').evaluate((p) => p.getBoundingClientRect().height)
      // Fiecare text al ciotului devine un singur cuvant: titlul, subtitlul, titlurile si paragrafele
      // pasilor, fraza de iesire. Nimic altceva din pagina nu se atinge.
      const scurtate = await scurteazaTextele(page)
      const dupa = await sectiune.evaluate((s) => s.getBoundingClientRect().height)
      const subtitluDupa = await sectiune.locator('header p').evaluate((p) => p.getBoundingClientRect().height)
      console.log('[text scurt ' + latime + '] innerWidth CITIT: ' + (await page.evaluate(() => window.innerWidth))
        + ' | texte scurtate: ' + scurtate + ' | subtitlu ' + subtitluInainte + ' -> ' + subtitluDupa
        + ' | sectiune ' + inainte + ' -> ' + dupa)
      // Controlul: scurtarea a aterizat (1 titlu + 1 subtitlu + 3 titluri de pas + 3 paragrafe + fraza),
      // iar subtitlul chiar a pierdut randuri. Fara el, un zero de mai jos ar putea fi o pagina neatinsa.
      expect(scurtate).toBe(9)
      expect(subtitluDupa).toBeLessThan(subtitluInainte)
      expect(Math.abs(dupa - inainte)).toBeLessThan(0.5)
    })

    test('ordinea sectiunilor e cea masurata, fara goluri intre ele', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const cutii = await sectiuni(page)
      expect(cutii.map((c) => c.ciot ?? c.id).filter(Boolean)).toEqual([
        'erou',
        'constructor',
        'functionalitati',
        'preturi',
        'intrebari',
        'contact',
      ])
      expect(cutii).toHaveLength(12)
      for (let i = 1; i < cutii.length; i++) {
        expect(Math.abs(cutii[i].y - (cutii[i - 1].y + cutii[i - 1].h)), 'gol inainte de sectiunea ' + i).toBeLessThan(1)
      }
    })
  })
}

// Intre 401 si 900 px: marginile benzii fara masuratori (401, 900) si tableta (768).
for (const latime of [401, 768, 900]) {
  test.describe('ciotul functionalitatilor la ' + latime + ', fara masuratoare in fisa', () => {
    test.use({ viewport: { width: latime, height: 844 } })

    test('cutiile cu text au inaltimea continutului: minimele de la 390 nu se aplica', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const citit = await page.evaluate(() => window.innerWidth)
      const scurtate = await scurteazaTextele(page)
      const goluri = await goluriCiot(page)
      console.log('[gol ' + latime + '] innerWidth CITIT: ' + citit + ' | texte scurtate: ' + scurtate
        + ' | ' + goluri.map((g) => g.cutie + ' ' + g.gol).join(' / '))
      expect(citit).toBe(latime)
      // Controlul scurtarii: toate cele 9 texte, ca un minim ramas activ sa lase gol vizibil.
      expect(scurtate).toBe(9)
      expect(goluri.map((g) => g.cutie)).toEqual(['cap', 'text 1', 'text 2', 'text 3', 'final'])
      expect(goluri.filter((g) => !(Math.abs(g.gol) < 0.5))).toEqual([])

      // Martor POZITIV: un minim pus in pagina pe primul bloc de text, cu 40 px peste continut,
      // iese ca gol de 40. Fara el, zeroul de mai sus ar putea veni dintr-o masuratoare oarba.
      await page.locator('[data-ciot="functionalitati"] ol > li > div').first().evaluate((el) => {
        const bloc = el as HTMLElement
        bloc.style.minHeight = bloc.getBoundingClientRect().height + 40 + 'px'
      })
      const cuMinim = await goluriCiot(page)
      expect(cuMinim.find((g) => g.cutie === 'text 1')?.gol).toBeCloseTo(40, 0)
    })
  })
}

test.describe('comparatia cu tinta', () => {
  test('martor POZITIV: o inaltime abatuta cu 5% e raportata', () => {
    expect(abateri([{ ciot: 'erou', id: '', y: 0, h: 945 }], { erou: 900 })).toEqual(['erou: 945 fata de 900'])
    expect(abateri([], { erou: 900 })).toEqual(['erou: lipseste'])
  })

  test('martor NEGATIV: o abatere sub 2% nu e raportata', () => {
    expect(abateri([{ ciot: 'erou', id: '', y: 0, h: 910 }], { erou: 900 })).toEqual([])
  })
})

test.describe('interactiunile statice ale startului', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('intrebarile: prima deschisa, una singura deschisa odata', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const intrebari = page.locator('#intrebari button[aria-expanded]')
    await expect(intrebari).toHaveCount(4)
    await expect(intrebari.nth(0)).toHaveAttribute('aria-expanded', 'true')
    await intrebari.nth(1).click()
    await expect(intrebari.nth(1)).toHaveAttribute('aria-expanded', 'true')
    await expect(intrebari.nth(0)).toHaveAttribute('aria-expanded', 'false')
    await intrebari.nth(1).click()
    await expect(intrebari.nth(1)).toHaveAttribute('aria-expanded', 'false')
  })

  test('cu miscare redusa, tot ce are aparitie la derulare e vizibil de la incarcare', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const ascunse = await page.locator('[data-reveal]').evaluateAll((noduri) =>
      noduri.filter((el) => getComputedStyle(el).opacity !== '1' || el.classList.contains('reveal-ascuns')).length,
    )
    expect(await page.locator('[data-reveal]').count()).toBeGreaterThan(4)
    expect(ascunse).toBe(0)
  })

})

test.describe('aparitia la derulare, fara miscare redusa', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })

  test('un element de sub fereastra apare abia la derulare', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const cta = page.locator('#contact [data-reveal]')
    await expect(cta).toHaveClass(/reveal-ascuns/)
    await cta.scrollIntoViewIfNeeded()
    await expect(cta).toHaveClass(/reveal-intrat/)
    await expect(cta).toHaveCSS('opacity', '1')
  })

  test('un element aflat deja in fereastra la incarcare nu se ascunde', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Eroul nu are aparitie; sectiunea din prima fereastra care o are ar fi clipit.
    const inFereastra = await page.locator('[data-reveal]').evaluateAll((noduri) =>
      noduri.filter((el) => el.getBoundingClientRect().top < window.innerHeight * 0.9).map((el) => el.className),
    )
    for (const clasa of inFereastra) expect(clasa).not.toContain('reveal-ascuns')
  })
})

import { expect, test } from './ajutor/baza'
import { pornesteCopia3sMd, type Copie3sMd } from './ajutor/copie-3s-md'

/**
 * Tabelele pe telefon (felia 133): tabelul pachetelor si al suplimentelor (/pricing, /ro/preturi pe copia 3s.md,
 * /preturi pe build-ul RO al probelor), tabelul comparativ (/compare/3s-vs-google-and-box, /ro/comparatie-drive) si
 * tabelele cu antet din documentele juridice (confidentialitatea si cookie-urile, /legal si /ro/juridic). Defectele
 * masurate in browserul real la 390:
 *  - prima coloana a tabelului pachetelor lua 288-377 din cei 356 px ai panoului, iar la suplimente 320: nicio valoare
 *    nu se vedea fara derulare, iar indicatia de derulare exista numai in `aria-label`;
 *  - la comparatie coloana 3S era in afara panoului (tabelul avea latimea minima 420 din date);
 *  - in tabelele juridice ultima coloana se strangea pe cuvantul cel mai lung si ramanea la margine cu 1-2 litere;
 *  - la 1440 coloana Facturare a suplimentelor (120 px) rupea textul cel mai lung ("O singura data, valabile 90 de
 *    zile") pe trei randuri.
 *
 * CE SE CERE (masurat in pagina, cu latimea citita din pagina):
 *  1. la 390, tabelul pachetelor: prima coloana <= 45% din panou, lipita la stanga (`sticky`) cu fundal opac, cel putin
 *     o coloana de valori intreaga in panou, indicatia scrisa vizibila (textul `aria-label`, generat deasupra tabelului)
 *     si umbra la marginea dreapta; pagina nu se deruleaza pe orizontala;
 *  2. la 390, suplimentele incap: ambele coloane de valori intregi, fara indicatie (controlul NEGATIV al indicatiei:
 *     ea apare numai cand panoul chiar se deruleaza);
 *  3. la 390, comparatia: capul coloanei 3S intreg in panou, prima coloana <= 45%;
 *  4. la 390, tabelele juridice cu cel putin trei coloane (/legal/privacy, /ro/juridic/confidentialitate; /legal/cookies
 *     si /ro/juridic/cookies pe a doua copie, cu analitica pornita, singura pe care documentul are tabel): prima <= 45%,
 *     lipita, cel putin o coloana intreaga, fiecare coloana de dupa prima are cel putin 150 px, umbra la marginea dreapta,
 *     iar la capatul derularii ultima coloana e intreaga in panou. Pe documentele juridice nu exista indicatie scrisa:
 *     semnul de derulare e umbra, langa coloana taiata la margine, deci umbra se masoara pe fiecare pagina cu asemenea
 *     tabele, nu pe una singura;
 *  4b. la 390, dupa o derulare de 80 px a tabelului pachetelor, titlul randului de categorie se muta cu 80 px
 *     (`text-indent` din `--derulat`), ca sa ramana langa eticheta lipita;
 *  5. la 1440, suplimentele: celula de facturare cu textul cel mai lung sta pe un rand, coloana Supliment ramane mai lata
 *     decat Facturare; tabelul pachetelor isi pastreaza coloanele de plan de 120 px (desktopul neschimbat);
 *  6. martor POZITIV: aceeasi masuratoare, rulata dupa ce in pagina se repune asezarea veche (eticheta fara rupere si
 *     tabelul de 560 px), da prima coloana peste 45% si zero coloane intregi - deci verdictul de la 1 nu e o masuratoare
 *     oarba;
 *  7. martori NEGATIVI: tabelele articolelor de blog (pe build-ul RO) nu primesc coloana lipita, nici umbra - regulile
 *     tabelelor juridice stau pe sectiunile marcate de randatorul documentelor juridice, nu pe orice tabel cu antet.
 *     Doua articole: unul cu doua coloane si unul cu TREI coloane care incape la 390 (exact forma de tabel pe care o
 *     regula legata de numarul de coloane ar prinde-o).
 */

let copie: Copie3sMd

test.beforeAll(async () => {
  test.setTimeout(600_000)
  copie = await pornesteCopia3sMd()
})

test.afterAll(async () => {
  await copie?.opreste()
})

type Masura = {
  latime: number
  pagina: number
  panou: number
  tabel: number
  prima: number
  procent: number
  pozitiePrima: string
  fundalPrima: string
  coloane: number
  intregi: string[]
  latimiColoane: number[]
  indicatie: { text: string; inaltime: number; inPanou: boolean } | null
  umbra: boolean
}

/** Masoara tabelul din panoul derulabil numit (prefixul numelui accesibil sau al legendei), in pagina curenta. */
async function masoara(page: import('@playwright/test').Page, nume: string): Promise<Masura> {
  return page.evaluate((n) => {
    const numeZona = (z: Element) => {
      const id = z.getAttribute('aria-labelledby')
      return (id ? (document.getElementById(id)?.textContent ?? '') : (z.getAttribute('aria-label') ?? '')).trim()
    }
    const zona = [...document.querySelectorAll('[role="region"]')].find((z) => z.querySelector('table') && numeZona(z).startsWith(n)) as HTMLElement
    if (!zona) throw new Error('panoul "' + n + '" lipseste')
    const tabel = zona.querySelector('table') as HTMLTableElement
    const pr = zona.getBoundingClientRect()
    const capete = [...(tabel.querySelector('thead tr') as HTMLTableRowElement).children] as HTMLElement[]
    const primaRand = [...tabel.querySelectorAll('tbody tr > :first-child')].find((c) => !c.hasAttribute('colspan')) as HTMLElement
    const sp = getComputedStyle(primaRand)
    const prima = capete[0].getBoundingClientRect().width
    const inauntru = (r: DOMRect) => r.left >= pr.left - 0.5 && r.right <= pr.right + 0.5
    const inainte = getComputedStyle(zona, '::before')
    const areIndicatie = inainte.content !== 'none' && inainte.display !== 'none' && parseFloat(inainte.height) > 0
    return {
      latime: window.innerWidth,
      pagina: document.documentElement.scrollWidth,
      panou: zona.clientWidth,
      tabel: zona.scrollWidth,
      prima: Math.round(prima),
      procent: Math.round((prima / pr.width) * 100),
      pozitiePrima: sp.position,
      fundalPrima: sp.backgroundColor,
      coloane: capete.length - 1,
      intregi: capete.slice(1).filter((c) => inauntru(c.getBoundingClientRect())).map((c) => (c.textContent ?? '').trim()),
      latimiColoane: capete.map((c) => Math.round(c.getBoundingClientRect().width)),
      indicatie: areIndicatie
        ? { text: inainte.content, inaltime: parseFloat(inainte.height), inPanou: parseFloat(inainte.width) <= zona.clientWidth + 0.5 }
        : null,
      umbra: getComputedStyle(zona).backgroundImage.includes('gradient'),
    }
  }, nume)
}

/** Deschide pliurile cu tabele (pachetele si suplimentele); poarta paginii se trece prin `#pachete`. */
async function deschidePliurile(page: import('@playwright/test').Page, adresa: string): Promise<void> {
  await page.goto(adresa)
  const rezumate = page.locator('main details > summary')
  await expect(rezumate.first()).toBeVisible()
  for (const s of await rezumate.all()) await s.click()
}

function opac(culoare: string): boolean {
  const m = culoare.match(/rgba?\(([^)]+)\)/)
  if (!m) return false
  const p = m[1].split(',').map((x) => parseFloat(x))
  return p.length === 3 || p[3] === 1
}

/**
 * Criteriul 4 pe o pagina juridica: fiecare tabel cu antet de cel putin trei coloane. `minim` = cate asemenea tabele
 * are pagina azi, ca proba sa nu treaca goala daca documentul isi pierde tabelele.
 */
async function verificaTabeleJuridice(page: import('@playwright/test').Page, adresa: string, minim: number): Promise<void> {
  await page.goto(adresa)
  const cale = new URL(adresa).pathname
  const nume = await page.evaluate(() =>
    [...document.querySelectorAll('[role="region"]')]
      .filter((z) => (z.querySelector('thead tr')?.children.length ?? 0) >= 3)
      .map((z) => {
        const id = z.getAttribute('aria-labelledby')
        return (id ? (document.getElementById(id)?.textContent ?? '') : (z.getAttribute('aria-label') ?? '')).trim()
      }),
  )
  console.log('[f133 390] ' + cale + ' tabele cu antet: ' + nume.length)
  expect(nume.length, 'tabele cu antet de cel putin trei coloane pe ' + cale).toBeGreaterThanOrEqual(minim)
  for (const n of nume) {
    const m = await masoara(page, n)
    console.log('[f133 390] ' + cale + ' ' + n.slice(0, 40) + ' ' + JSON.stringify(m))
    expect(m.pagina).toBe(m.latime)
    expect(m.procent).toBeLessThanOrEqual(45)
    expect(m.pozitiePrima).toBe('sticky')
    expect(opac(m.fundalPrima)).toBe(true)
    expect(m.intregi.length).toBeGreaterThanOrEqual(1)
    expect(m.umbra, 'umbra la marginea dreapta').toBe(true)
    for (const l of m.latimiColoane.slice(1)) expect(l).toBeGreaterThanOrEqual(150)
    // La capatul derularii ultima coloana (scopul) e intreaga in panou.
    const capat = await page.evaluate((x) => {
      const z = [...document.querySelectorAll('[role="region"]')].find((e) => {
        const id = e.getAttribute('aria-labelledby')
        return (id ? (document.getElementById(id)?.textContent ?? '') : '').trim() === x
      }) as HTMLElement
      z.scrollLeft = z.scrollWidth
      const pr = z.getBoundingClientRect()
      const ultima = (z.querySelector('thead tr') as HTMLElement).lastElementChild!.getBoundingClientRect()
      const r = { stanga: ultima.left - pr.left, dreapta: pr.right - ultima.right }
      z.scrollLeft = 0
      return r
    }, n)
    expect(capat.stanga).toBeGreaterThanOrEqual(-0.5)
    expect(capat.dreapta).toBeGreaterThanOrEqual(-0.5)
  }
}

/**
 * Analitica proprie pornita, ca la aplicatia 3s.md din productie (are `UMAMI_*`, pe care profilul nu le poarta): fara
 * ea, documentul de cookie-uri n-are tabelul "ce pastram in browser" (blocul lui cere masurarea activa), deci pe copia
 * fara analitica cele doua pagini de cookie-uri nu au niciun tabel de masurat. Instanta e fictiva, pe masina locala, pe
 * un port pe care nu asculta nimic: scriptul se cere numai dupa acord, iar proba nu accepta niciodata. Identificatorul
 * site-ului e sintetic.
 */
const UMAMI_FICTIV = { UMAMI_URL: 'http://127.0.0.1:' + 9, UMAMI_WEBSITE_ID: ['0c0a1b2c', '3d4e', '4f5a', '8b6c', '7d8e9f0a1b2c'].join('-') }

test.describe('la 390', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  const PAGINI_PRETURI = [
    { cale: '/pricing#pachete', planuri: 'Plans table', suplimente: 'Add-ons table' },
    { cale: '/ro/preturi#pachete', planuri: 'Tabelul pachetelor', suplimente: 'Tabelul suplimentelor' },
  ]

  for (const p of PAGINI_PRETURI) {
    test(p.cale + ': pachetele cu eticheta lipita si valori la vedere, suplimentele intregi', async ({ page }) => {
      await deschidePliurile(page, copie.baza + p.cale)
      // Indicatia depinde de masuratoarea vederii dupa hidratare: se asteapta atributul, nu un timp.
      await expect(page.locator('[role="region"][aria-label^="' + p.planuri + '"]')).toHaveAttribute('data-deruleaza', '')
      const m = await masoara(page, p.planuri)
      const s = await masoara(page, p.suplimente)
      console.log('[f133 390] ' + p.cale + ' pachete ' + JSON.stringify(m))
      console.log('[f133 390] ' + p.cale + ' suplimente ' + JSON.stringify(s))
      expect(m.latime).toBe(390)
      expect(m.pagina).toBe(m.latime)
      expect(m.tabel, 'tabelul pachetelor se deruleaza in panou').toBeGreaterThan(m.panou)
      expect(m.procent).toBeLessThanOrEqual(45)
      expect(m.pozitiePrima).toBe('sticky')
      expect(opac(m.fundalPrima), 'fundalul primei coloane: ' + m.fundalPrima).toBe(true)
      expect(m.intregi.length).toBeGreaterThanOrEqual(1)
      expect(m.indicatie, 'indicatia scrisa').not.toBeNull()
      expect(m.indicatie?.text).toContain(p.planuri)
      expect(m.indicatie?.inPanou).toBe(true)
      expect(m.umbra).toBe(true)
      expect(s.tabel).toBeLessThanOrEqual(s.panou)
      expect(s.intregi).toHaveLength(s.coloane)
      expect(s.procent).toBeLessThanOrEqual(45)
      expect(s.indicatie, 'suplimentele incap, deci fara indicatie').toBeNull()
    })
  }

  test('/preturi (build-ul RO): pachetele cu eticheta lipita si valori la vedere', async ({ page, baseURL }) => {
    await deschidePliurile(page, String(baseURL) + '/preturi#pachete')
    await expect(page.locator('[role="region"][aria-label^="Tabelul pachetelor"]')).toHaveAttribute('data-deruleaza', '')
    const m = await masoara(page, 'Tabelul pachetelor')
    console.log('[f133 390] /preturi pachete ' + JSON.stringify(m))
    expect(m.pagina).toBe(m.latime)
    expect(m.procent).toBeLessThanOrEqual(45)
    expect(m.pozitiePrima).toBe('sticky')
    expect(m.intregi.length).toBeGreaterThanOrEqual(1)
    expect(m.indicatie).not.toBeNull()
  })

  // Numele panoului e in limba editiei (corectura din 09.10): "Table: " pe pagina engleza, "Tabel: " pe /ro.
  for (const c of [
    { cale: '/compare/3s-vs-google-and-box', nume: 'Table: ' },
    { cale: '/ro/comparatie-drive', nume: 'Tabel: ' },
  ]) {
    test(c.cale + ': coloana 3S intreaga fara derulare', async ({ page }) => {
      await page.goto(copie.baza + c.cale)
      const m = await masoara(page, c.nume)
      console.log('[f133 390] ' + c.cale + ' ' + JSON.stringify(m))
      expect(m.pagina).toBe(m.latime)
      expect(m.procent).toBeLessThanOrEqual(45)
      expect(m.intregi).toContain('3S')
    })
  }

  for (const j of [
    { cale: '/legal/privacy', minim: 2 },
    { cale: '/ro/juridic/confidentialitate', minim: 2 },
  ]) {
    test(j.cale + ': tabelele cu antet au prima coloana lipita si coloane citibile', async ({ page }) => {
      await verificaTabeleJuridice(page, copie.baza + j.cale, j.minim)
    })
  }

  test('/pricing: titlul randului de categorie urmeaza derularea tabelului pachetelor', async ({ page }) => {
    await deschidePliurile(page, copie.baza + '/pricing#pachete')
    const zona = page.locator('[role="region"][aria-label^="Plans table"]')
    await expect(zona).toHaveAttribute('data-deruleaza', '')
    const titlu = zona.locator('tr[class*="randCategorie"] th').first()
    await expect(titlu).toBeVisible()
    expect(await titlu.evaluate((e) => getComputedStyle(e).textIndent)).toBe('0px')
    const derulat = await zona.evaluate((z) => {
      z.scrollLeft = 80
      return z.scrollLeft
    })
    console.log('[f133 390] /pricing derulat ' + derulat)
    expect(derulat, 'tabelul pachetelor se poate derula cel putin 80 px').toBe(80)
    // Variabila o scrie vederea la evenimentul `scroll`, care vine asincron: se asteapta valoarea, nu un timp.
    await expect.poll(() => titlu.evaluate((e) => getComputedStyle(e).textIndent)).toBe('80px')
  })

  test('martor POZITIV: cu asezarea veche repusa in pagina, masuratoarea vede defectul', async ({ page }) => {
    await deschidePliurile(page, copie.baza + '/pricing#pachete')
    await page.addStyleTag({
      content:
        'main table { width: 100% !important; min-width: 560px !important; }' +
        ' main table thead th:first-child, main table tbody th { position: static !important; white-space: nowrap !important; width: auto !important; }',
    })
    const m = await masoara(page, 'Plans table')
    console.log('[f133 390 martor] ' + JSON.stringify(m))
    expect(m.procent).toBeGreaterThan(45)
    expect(m.intregi).toHaveLength(0)
    expect(m.pozitiePrima).toBe('static')
  })
})

// Paginile de cookie-uri, pe o a doua copie, cu analitica proprie pornita (`UMAMI_FICTIV`): numai asa documentul are
// tabelul de cookie-uri, ca pe 3s.md. Build-ul ei porneste abia la acest bloc, dupa ce prima copie e gata.
test.describe('la 390, cookie-urile cu analitica pornita', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  let copieAnalitica: Copie3sMd

  test.beforeAll(async () => {
    test.setTimeout(600_000)
    copieAnalitica = await pornesteCopia3sMd(UMAMI_FICTIV)
  })

  test.afterAll(async () => {
    await copieAnalitica?.opreste()
  })

  for (const j of [
    { cale: '/legal/cookies', minim: 1 },
    { cale: '/ro/juridic/cookies', minim: 1 },
  ]) {
    test(j.cale + ': tabelele cu antet au prima coloana lipita si coloane citibile', async ({ page }) => {
      await verificaTabeleJuridice(page, copieAnalitica.baza + j.cale, j.minim)
    })
  }
})

test.describe('la 390, martorul negativ', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('martor NEGATIV: tabelul de doua coloane al articolului de blog incape si ramane fara coloana lipita si fara umbra', async ({ page, baseURL }) => {
    await page.goto(String(baseURL) + '/blog/registrul-de-evidenta-a-arhivei')
    // Umbra sta pe invelisul cu `tabindex`; dupa hidratare ZonaDerulabila il lasa numai pe zonele care se deruleaza.
    // In HTML-ul servit il au toate, deci se asteapta hidratarea (atributul scos), nu un timp.
    for (const z of await page.locator('main [role="region"]:has(table)').all()) await expect(z).not.toHaveAttribute('tabindex')
    const nume = await page.evaluate(() =>
      [...document.querySelectorAll('main [role="region"]')]
        .filter((z) => z.querySelector('table'))
        .map((z) => {
          const id = z.getAttribute('aria-labelledby')
          return (id ? (document.getElementById(id)?.textContent ?? '') : (z.getAttribute('aria-label') ?? '')).trim()
        }),
    )
    expect(nume.length).toBeGreaterThanOrEqual(1)
    for (const n of nume) {
      const m = await masoara(page, n)
      console.log('[f133 390 martor negativ] ' + n.slice(0, 40) + ' ' + JSON.stringify(m))
      expect(m.coloane).toBe(1)
      expect(m.tabel).toBeLessThanOrEqual(m.panou)
      expect(m.pozitiePrima).toBe('static')
      expect(m.umbra).toBe(false)
    }
  })

  test('martor NEGATIV: tabelul de trei coloane al articolului de blog incape si ramane fara coloana lipita si fara umbra', async ({ page, baseURL }) => {
    await page.goto(String(baseURL) + '/blog/arhivarea-externalizata')
    const nume = await page.evaluate(() =>
      [...document.querySelectorAll('main [role="region"]')]
        .filter((z) => (z.querySelector('thead tr')?.children.length ?? 0) >= 3)
        .map((z) => {
          const id = z.getAttribute('aria-labelledby')
          return (id ? (document.getElementById(id)?.textContent ?? '') : (z.getAttribute('aria-label') ?? '')).trim()
        }),
    )
    expect(nume.length, 'articolul are un tabel cu antet de trei coloane').toBeGreaterThanOrEqual(1)
    for (const n of nume) {
      const m = await masoara(page, n)
      console.log('[f133 390 martor negativ 3 coloane] ' + n.slice(0, 40) + ' ' + JSON.stringify(m))
      expect(m.coloane).toBe(2)
      expect(m.tabel, 'tabelul incape in panou').toBeLessThanOrEqual(m.panou)
      expect(m.intregi).toHaveLength(m.coloane)
      expect(m.pozitiePrima).toBe('static')
      expect(m.umbra).toBe(false)
    }
  })
})

test.describe('la 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const p of [
    { cale: '/pricing#pachete', planuri: 'Plans table', suplimente: 'Add-ons table' },
    { cale: '/ro/preturi#pachete', planuri: 'Tabelul pachetelor', suplimente: 'Tabelul suplimentelor' },
  ]) {
    test(p.cale + ': facturarea suplimentelor pe un rand, pachetele neschimbate', async ({ page }) => {
      await deschidePliurile(page, copie.baza + p.cale)
      const s = await masoara(page, p.suplimente)
      const m = await masoara(page, p.planuri)
      const randuri = await page.evaluate((n) => {
        const z = document.querySelector('[role="region"][aria-label^="' + n + '"]') as HTMLElement
        return [...z.querySelectorAll('tbody tr')]
          .filter((r) => r.children.length === 3)
          .map((r) => {
            // Textul e un `span` in linie: cate un dreptunghi pe fiecare rand pe care se rupe.
            const text = (r.children[2] as HTMLElement).querySelector('span') as HTMLElement
            return { text: (text.textContent ?? '').trim(), randuri: text.getClientRects().length }
          })
      }, p.suplimente)
      console.log('[f133 1440] ' + p.cale + ' suplimente ' + JSON.stringify(s.latimiColoane) + ' facturare ' + JSON.stringify(randuri))
      console.log('[f133 1440] ' + p.cale + ' pachete ' + JSON.stringify(m.latimiColoane))
      expect(s.latime).toBe(1440)
      expect(randuri.length).toBeGreaterThanOrEqual(5)
      for (const r of randuri) expect(r.randuri, r.text).toBe(1)
      expect(s.latimiColoane[0]).toBeGreaterThan(s.latimiColoane[2])
      expect(s.indicatie).toBeNull()
      expect(m.latimiColoane.slice(1)).toEqual([120, 120, 120])
      expect(m.pozitiePrima).toBe('static')
      expect(m.indicatie).toBeNull()
    })
  }
})

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, describe, expect, it, vi } from 'vitest'

/**
 * TEXTELE SI CALCULUL DE PE 3s.md (testul in browserul real din 06.10.2026): starea "deschis" a canalului de contact,
 * legatura spre pagina de informatii legale pe /about, /contact si perechile /ro, iconitele cardului divizat de pe
 * comparatie, butonul de pe start spre comparatie, perioada langa pretul anual si intrebarea despre reduceri.
 * Calculul (costul din orele exacte, separatorul de mii la ore) e in `tests/preturi.test.ts`, iar fraza calculatorului
 * pe perioada si unitatea de pe carduri in browser, in `tests/browser/editie-preturi-enterprise-contact.spec.ts`.
 *
 * CE SE MASOARA: randarea statica a paginilor 3s.md (EN si /ro) si, ca CONTROL pe fiecare detector, aceeasi masura pe
 * pagina RO pereche, care trebuie sa pastreze forma veche (starea cu ceas, bifele la stanga, textul fara legatura).
 * Partea RO a HTML-ului servit (identic cu baza) o dovedeste `tests/invarianta-ro.test.ts`, pe build.
 *
 * FIXTURILE (cuvintele vechi cautate) se asambleaza la rulare, din bucati.
 *
 * M9 (testul editiei 3s.com.ro din 06.10.2026, rescris dupa auditul functional din 09.10): cardurile de contact nu mai
 * afiseaza calea ca text (o cale bruta nu spune nimic omului; cardul intreg e legatura), pe toate editiile, iar legatura
 * ramane calea SERVITA pe fiecare asezare; martorii: o cale scrisa ca text e prinsa de masura, un text obisnuit ramane.
 */

vi.hoisted(() => {
  // Canalele aplicatiei 3s.md (forma din `config/profil-3s-md.json`), cu un numar de proba: paginile citesc `CANALE` la
  // import, deci variabila se pune inaintea oricarui import al modulelor site-ului.
  process.env.CANALE_JSON = JSON.stringify({ formulare: false, whatsapp: '37300000002', telefon: '', email: '', emailSecuritate: 'security@example.test' })
})

const { default: ContactEn } = await import('../src/app/(en)/contact/page.en')
const { default: ContactRoMd } = await import('../src/app/(romd)/ro/contact/page.romd')
const { default: ContactRo } = await import('../src/app/contact/page')
const { default: DespreEn } = await import('../src/app/(en)/about/page.en')
const { default: SecuritateRoMd } = await import('../src/app/(romd)/ro/securitate/page.romd')
const { default: SecuritateRo } = await import('../src/app/securitate/page')
const { default: ComparatieEn } = await import('../src/app/(en)/compare/3s-vs-google-and-box/page.en')
const { default: ComparatieRoMd } = await import('../src/app/(romd)/ro/comparatie-drive/page.romd')
const { default: ComparatieRo } = await import('../src/app/comparatie-drive/page')
const { PacheteEn } = await import('../src/components/preturi/PreturiEn')
const { PacheteRoMd } = await import('../src/app/(romd)/ro/_editie/PreturiRoMd')
const { FUNCTIONALITATI_EN } = await import('../src/content/en/acasa-componente')
const comparatie = await import('../src/content/en/compare-3s-vs-google-and-box')
const pretEn = await import('../src/content/en/pricing-componente')
const pretRoMd = await import('../src/content/ro-md/preturi-componente')
const despreEn = await import('../src/content/en/despre-componente')
const { caleMd } = await import('../src/content/juridic/md/registru')
const { default: PaginaSecuritate } = await import('../src/components/produs/PaginaSecuritate')
const { securitateRoMd } = await import('../src/content/ro-md/securitate-componente')
const contactRoMd = await import('../src/content/ro-md/contact-componente')

const randeaza = (C: ComponentType) => renderToStaticMarkup(createElement(C))

/** Bucata de HTML a unei sectiuni, dupa `aria-labelledby`. */
function sectiune(html: string, eticheta: string): string {
  const i = html.indexOf('aria-labelledby="' + eticheta + '"')
  expect(i, 'sectiunea ' + eticheta).toBeGreaterThan(-1)
  return html.slice(i, html.indexOf('</section>', i))
}

/** `<main>` fara scripturile lui (datele structurate au acelasi text, ca sir). */
function mainFaraScripturi(html: string): string {
  return html.slice(html.indexOf('<main'), html.indexOf('</main>')).replace(/<script\b[\s\S]*?<\/script>/g, '')
}

const numara = (text: string, cautat: string | RegExp) =>
  typeof cautat === 'string' ? text.split(cautat).length - 1 : (text.match(new RegExp(cautat.source, 'g')) ?? []).length

/** Legaturile `<a>` cu adresa data si textul lor. */
function legaturi(html: string, href: string): string[] {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter((m) => m[1].includes('href="' + href + '"')).map((m) => m[2])
}

const CEAS = 'lucide-' + 'clock'
const LEGAL_EN = caleMd('informatii-legale', 'en')
const LEGAL_RO = caleMd('informatii-legale', 'ro')
// Numele documentului e cel unic din subsol, din /legal si din titlul paginii (felia 150: "Legal notice", nu "Legal
// information"), deci si trimiterile din text il folosesc pe acesta.
const NUME_LEGAL_EN = 'Legal ' + 'notice'
const NUME_LEGAL_RO = 'Informații ' + 'legale'

describe('m1: randul WhatsApp de pe /contact si /ro/contact n-are stare si ceas', () => {
  it('martorul: pe RO, panoul are cele 4 stari, fiecare cu ceas (detectorul vede starea cand exista)', () => {
    const panou = sectiune(randeaza(ContactRo), 'contact-canale')
    expect(numara(panou, CEAS)).toBe(4)
    expect(numara(panou, 'randStare')).toBe(4)
  })

  for (const [nume, Pagina, vechi] of [
    ['/contact', ContactEn, 'Op' + 'en'],
    ['/ro/contact', ContactRoMd, 'Desch' + 'is'],
  ] as const) {
    it(nume + ': randul WhatsApp exista, fara ceas, fara element de stare si fara cuvantul vechi', () => {
      const panou = sectiune(randeaza(Pagina), 'contact-canale')
      // Controlul: randul canalului e randat (altfel absenta starii n-ar dovedi nimic).
      expect(panou).toContain('https://wa.me/37300000002')
      expect(numara(panou, 'randNume')).toBe(1)
      expect(numara(panou, CEAS)).toBe(0)
      expect(numara(panou, 'randStare')).toBe(0)
      expect(panou).not.toContain('>' + vechi + '<')
      expect(panou).not.toContain('</svg>' + vechi)
    })
  }
})

describe('m2: textul care trimite la pagina de informatii legale are legatura', () => {
  it('/contact: blocul marcii leaga "Legal notice" la ' + LEGAL_EN, () => {
    const marca = sectiune(randeaza(ContactEn), 'contact-marca')
    expect(legaturi(marca, LEGAL_EN)).toEqual([NUME_LEGAL_EN])
  })

  it('/ro/contact: blocul marcii leaga "Informatii legale" la ' + LEGAL_RO, () => {
    const marca = sectiune(randeaza(ContactRoMd), 'contact-marca')
    expect(legaturi(marca, LEGAL_RO)).toEqual([NUME_LEGAL_RO])
  })

  it('/about: pilonul "Operated from Moldova" si raspunsul "Who runs 3S?" au legatura; numele nu mai apare fara ea', () => {
    const main = mainFaraScripturi(randeaza(DespreEn))
    expect(legaturi(main, LEGAL_EN)).toEqual([NUME_LEGAL_EN, NUME_LEGAL_EN])
    // Fiecare aparitie a numelui in textul vazut e in legatura.
    expect(numara(main, NUME_LEGAL_EN)).toBe(2)
  })

  it('/ro/securitate: cu firma inregistrata, pilonul si raspunsul despre operator au legatura spre perechea /ro', () => {
    // Pe /ro, textele despre operator apar numai dupa inregistrarea firmei (`operatorInregistrat`: modelul D2 de azi
    // nu le arata), deci build-ul probei nu le are. Se randeaza componenta cu varianta "inregistrat" si cu legatura
    // pe care o paseaza pagina; ca pagina chiar o paseaza, se citeste in sursa ei.
    const html = renderToStaticMarkup(
      createElement(PaginaSecuritate, {
        continut: securitateRoMd(true),
        sectiuni: ['piloni', 'intrebari'],
        legaturaInText: contactRoMd.LEGATURA_INFORMATII_LEGALE_RO_MD,
      }),
    )
    expect(legaturi(html, LEGAL_RO)).toEqual([NUME_LEGAL_RO, NUME_LEGAL_RO])
    expect(numara(html, NUME_LEGAL_RO)).toBe(2)
    // Martorul: fara legatura, aceeasi varianta are numele de doua ori, ca text simplu.
    const simplu = renderToStaticMarkup(createElement(PaginaSecuritate, { continut: securitateRoMd(true), sectiuni: ['piloni', 'intrebari'] }))
    expect([legaturi(simplu, LEGAL_RO).length, numara(simplu, NUME_LEGAL_RO)]).toEqual([0, 2])
    const sursa = readFileSync(join(__dirname, '..', 'src', 'app', '(romd)', 'ro', 'securitate', 'page.romd.tsx'), 'utf8')
    expect(sursa).toContain('legaturaInText={LEGATURA_INFORMATII_LEGALE_RO_MD}')
    // Pagina reala a probei (fara firma inregistrata) se randeaza si n-are textul, deci nici legatura.
    expect(numara(mainFaraScripturi(randeaza(SecuritateRoMd)), NUME_LEGAL_RO)).toBe(0)
  })

  it('FAQPage pe /about pastreaza raspunsul ca text simplu, egal cu sirul din continut', () => {
    const html = randeaza(DespreEn)
    const sir = despreEn.DESPRE_EN.intrebari!.intrebari.find((i) => i.intrebare === 'Who runs 3S?')!.raspuns
    expect(sir).toContain(NUME_LEGAL_EN)
    const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')
    expect(ld).toContain(JSON.stringify(sir).slice(1, -1))
    expect(ld).not.toContain('href=')
  })

  it('martorul: paginile RO (/contact, /securitate) n-au nicio legatura spre informatiile legale ale lui 3s.md', () => {
    for (const html of [randeaza(ContactRo), randeaza(SecuritateRo)]) {
      expect(legaturi(html, LEGAL_EN)).toEqual([])
      expect(legaturi(html, LEGAL_RO)).toEqual([])
    }
  })
})

/** Iconitele celor doua coloane ale cardului divizat: [bife, avertizari] la stanga si la dreapta. */
function iconiteDivizat(html: string): { stanga: [number, number]; dreapta: [number, number] } {
  const i = html.indexOf('divizatStanga')
  const j = html.indexOf('divizatDreapta')
  expect(i).toBeGreaterThan(-1)
  expect(j).toBeGreaterThan(i)
  const stanga = html.slice(i, j)
  const dreapta = html.slice(j, html.indexOf('</ul>', j))
  const bife = (t: string) => numara(t, 'lucide-' + 'check ')
  const avertizari = (t: string) => numara(t, 'lucide-' + 'triangle-alert ')
  return { stanga: [bife(stanga), avertizari(stanga)], dreapta: [bife(dreapta), avertizari(dreapta)] }
}

describe('m10: iconitele cardului divizat de pe comparatie', () => {
  it('martorul: pe RO (/comparatie-drive) bifele raman la stanga (ce face bine un drive), avertizarile la dreapta', () => {
    const m = iconiteDivizat(randeaza(ComparatieRo))
    expect(m.stanga[1]).toBe(0)
    expect(m.dreapta[0]).toBe(0)
    expect(m.stanga[0]).toBeGreaterThan(0)
    expect(m.dreapta[1]).toBeGreaterThan(0)
  })

  it('/compare/3s-vs-google-and-box: avertizari pe "When should you not choose 3S?" (3), bife pe "When does 3S fit?" (4)', () => {
    const html = randeaza(ComparatieEn)
    expect(html.indexOf('When should you not choose 3S?')).toBeLessThan(html.indexOf('divizatDreapta'))
    expect(iconiteDivizat(html)).toEqual({ stanga: [0, 3], dreapta: [4, 0] })
  })

  it('/ro/comparatie-drive: aceeasi asezare pe perechea /ro', () => {
    const html = randeaza(ComparatieRoMd)
    expect(html.indexOf('Când 3S nu este prima alegere')).toBeLessThan(html.indexOf('divizatDreapta'))
    expect(iconiteDivizat(html)).toEqual({ stanga: [0, 3], dreapta: [4, 0] })
  })
})

describe('M7: comparatia spune ce compara (Google), fara Box AI', () => {
  const BOX = 'Bo' + 'x'
  it('titlul, H1 si descrierea paginii numesc Google si nu numesc Box', () => {
    const p = comparatie.pagina
    for (const t of [p.meta.titlu, p.meta.descriere, p.h1]) {
      expect(t).toContain('Google')
      expect(t).not.toContain(BOX)
    }
    // Textul vazut al paginii (fara etichete si atribute) si, din felia 141 (M7 ramas), si atributele: textul
    // precompletat al legaturii WhatsApp (in `href`, codat) spune acum "comparison with Google Drive".
    const main = mainFaraScripturi(randeaza(ComparatieEn))
    expect(main).toContain('<h1')
    expect(main.replace(/<[^>]*>/g, ' ')).not.toContain(BOX)
    // Cuvant intreg: atributul SVG `viewBox` nu e o mentiune a produsului.
    const cuvantBox = new RegExp('\\b' + BOX + '\\b')
    // Martorul detectorului: textul precompletat vechi (asamblat aici) e prins, `viewBox` nu.
    expect(cuvantBox.test('comparison with Google and ' + BOX + ' AI')).toBe(true)
    expect(cuvantBox.test('<svg view' + BOX + '="0 0 16 16">')).toBe(false)
    expect(decodeURIComponent(main)).not.toMatch(cuvantBox)
  })

  it('startul: fraza si butonul spre comparatie numesc Google Drive, nu Box; adresa paginii ramane aceeasi', () => {
    const f = FUNCTIONALITATI_EN.final
    // Martorul detectorului: fraza veche, asamblata aici, era prinsa.
    expect(('For a few dozen files, Google Drive or ' + BOX + ' may be enough.').includes(BOX)).toBe(true)
    expect(f.fraza).not.toContain(BOX)
    expect(f.buton.text).not.toContain(BOX)
    expect(f.buton.text).toContain('Google Drive')
    expect(f.buton.href).toBe('/compare/3s-vs-google-and-box')
  })
})

describe('m11 si m13: preturile pe 3s.md', () => {
  it('cardurile EN, in starea implicita (anual): 75 / 125 / 200, fiecare cu "billed annually" langa suma', () => {
    const html = renderToStaticMarkup(createElement(PacheteEn, { gazda: '3s.md', analitica: false, whatsapp: null }))
    for (const suma of ['75', '125', '200']) expect(html).toContain('>' + suma + '<')
    expect(numara(html, '>EUR / month, billed annually<')).toBe(3)
  })

  it('cardurile /ro, in starea implicita (anual): fiecare cu "la plata anuală" langa suma', () => {
    const html = renderToStaticMarkup(createElement(PacheteRoMd, { gazda: '3s.md', analitica: false, whatsapp: null }))
    for (const suma of ['75', '125', '200']) expect(html).toContain('>' + suma + '<')
    expect(numara(html, '>EUR / lună, la plata anuală<')).toBe(3)
  })

  it('fraza calculatorului la plata anuala numeste perioada, pe ambele editii; cea lunara ramane', () => {
    expect(pretEn.CALCULATOR_EN.pretInOreAnual.dupaPret).toContain('billed annually')
    expect(pretRoMd.CALCULATOR_RO_MD.pretInOreAnual.dupaPret).toContain('la plata anuală')
    expect(pretEn.CALCULATOR_EN.pretInOre.dupaPret).not.toContain('annual')
    expect(pretRoMd.CALCULATOR_RO_MD.pretInOre.dupaPret).not.toContain('anual')
  })

  it('"Există reduceri?" / "Are there discounts?": "10 luni" / "10 months" o singura data', () => {
    const ro = pretRoMd.INTREBARI_RO_MD.intrebari.find((i) => i.intrebare === 'Există reduceri?')!.raspuns
    const en = pretEn.INTREBARI_EN.intrebari.find((i) => i.intrebare === 'Are there discounts?')!.raspuns
    // Martorul: raspunsul vechi, asamblat aici, avea doua aparitii.
    const vechi = 'Da, la plata anuală plătești 10 ' + 'luni din 12. La Starter, Pro și Business plătești 10 ' + 'luni pentru 12.'
    expect(numara(vechi, '10 luni')).toBe(2)
    expect(numara(ro, '10 luni')).toBe(1)
    expect(numara(en, '10 months')).toBe(1)
    expect(ro).toContain('16,7%')
    expect(en).toContain('16.7%')
  })

  it('tabelul /ro: randul "Cost pe persoană" spune "Nu există", iar nicio celula nu mai e "Inclus" cu majuscula', () => {
    const randuri = pretRoMd.TABEL_RO_MD.categorii.flatMap((c) => c.randuri)
    const cost = randuri.find((r) => r.functie === 'Cost pe persoană')!
    expect(Object.values(cost.celule)).toEqual([0, 1, 2].map(() => ({ fel: 'valoare', text: 'Nu există' })))
    const texte = randuri.flatMap((r) => Object.values(r.celule)).flatMap((c) => (c.fel === 'valoare' ? [c.text] : []))
    expect(texte).not.toContain('Incl' + 'us')
  })
})

describe('m2 pe asezarea ro (3s.com.ro): legatura spre informatiile legale trece prin asezare', () => {
  // Profilul aplicatiei 3s.com.ro (`config/profil-3s-com-ro.json`): editiile en si ro-MD, romana la radacina, engleza
  // sub /en. Modulele se reincarca cu acest mediu (rutele si asezarea se citesc la import si la randare); mediul se
  // reface dupa bloc, deci cazurile de mai sus raman pe asezarea md (martorul).
  const PROFIL_RO = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'profil-3s-com-ro.json'), 'utf8')) as Record<string, unknown>
  const text = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))

  async function paginiRo() {
    for (const k of ['SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ASEZARE', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'CANALE_JSON'])
      vi.stubEnv(k, text(PROFIL_RO[k]))
    for (const k of ['NEXT_PUBLIC_SITE_EDITII', 'NEXT_PUBLIC_SITE_ASEZARE', 'NEXT_PUBLIC_OPERATOR_NUMIT', 'NEXT_PUBLIC_FAMILIE_JURIDICA'])
      vi.stubEnv(k, '')
    vi.resetModules()
    return {
      ContactEn: (await import('../src/app/(en)/contact/page.en')).default,
      DespreEn: (await import('../src/app/(en)/about/page.en')).default,
      ContactRoMd: (await import('../src/app/(romd)/ro/contact/page.romd')).default,
    }
  }

  afterAll(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('/en/contact si /en/about duc la /en + calea EN; /contact (ro-MD la radacina) duce la calea fara /ro', async () => {
    expect(PROFIL_RO.SITE_ASEZARE).toBe('ro')
    const p = await paginiRo()
    const servitaEn = '/en' + LEGAL_EN
    const servitaRo = LEGAL_RO.replace(/^\/ro(?=\/)/, '')
    expect(servitaRo).not.toBe(LEGAL_RO)

    const contactEn = randeaza(p.ContactEn)
    // Controlul: pe aceeasi pagina, celelalte legaturi interne poarta prefixul /en (asezarea e activa in randare).
    expect(contactEn).toContain('href="/en/pricing"')
    expect(legaturi(sectiune(contactEn, 'contact-marca'), servitaEn)).toEqual([NUME_LEGAL_EN])
    expect(legaturi(contactEn, LEGAL_EN)).toEqual([])

    const despre = mainFaraScripturi(randeaza(p.DespreEn))
    expect(legaturi(despre, servitaEn)).toEqual([NUME_LEGAL_EN, NUME_LEGAL_EN])
    expect(legaturi(despre, LEGAL_EN)).toEqual([])

    const contactRo = randeaza(p.ContactRoMd)
    expect(contactRo).toContain('href="/preturi"')
    expect(legaturi(sectiune(contactRo, 'contact-marca'), servitaRo)).toEqual([NUME_LEGAL_RO])
    expect(legaturi(contactRo, LEGAL_RO)).toEqual([])
  })
})

/**
 * Cardurile din "Raspunsuri disponibile deja pe site". Pentru fiecare card cu legatura: `hrefs` = calea legaturii, fara
 * fragment si interogare; `frunze` = textele vizibile ale cardului (nodurile de text, fara ce sta sub `aria-hidden`);
 * `caiVizibile` = frunzele care sunt o cale (incep cu "/"). Un card inert (fara `href`) nu se numara.
 */
function cardContact(html: string): { hrefs: string[]; frunze: string[]; caiVizibile: string[] } {
  const s = sectiune(html, 'contact-subiecte')
  const hrefs: string[] = []
  const frunze: string[] = []
  for (const m of s.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = /\shref="([^"]*)"/.exec(m[1])?.[1]
    if (href === undefined) continue
    hrefs.push(href.split(/[?#]/)[0])
    const vizibil = m[2].replace(/<(\w+)\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/g, '')
    for (const t of vizibil.split(/<[^>]*>/)) if (t.trim() !== '') frunze.push(t.trim())
  }
  return { hrefs, frunze, caiVizibile: frunze.filter((t) => t.startsWith('/')) }
}

describe('M9: cardurile de contact nu afiseaza cai brute; legatura ramane calea servita, pe fiecare asezare', () => {
  const text = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))
  const profil = (nume: string) => JSON.parse(readFileSync(join(__dirname, '..', 'config', 'profil-' + nume + '.json'), 'utf8')) as Record<string, unknown>

  /** Pagina de contact si piesele ei, cu mediul aplicatiei date (rutele si asezarea se citesc la import si la randare). */
  async function cuProfil(nume: '3s-md' | '3s-com-ro') {
    const p = profil(nume)
    for (const k of ['SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ASEZARE', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'CANALE_JSON'])
      vi.stubEnv(k, p[k] === undefined ? '' : text(p[k]))
    for (const k of ['NEXT_PUBLIC_SITE_EDITII', 'NEXT_PUBLIC_SITE_ASEZARE', 'NEXT_PUBLIC_OPERATOR_NUMIT', 'NEXT_PUBLIC_FAMILIE_JURIDICA'])
      vi.stubEnv(k, '')
    vi.resetModules()
    return {
      ContactEn: (await import('../src/app/(en)/contact/page.en')).default,
      ContactRoMd: (await import('../src/app/(romd)/ro/contact/page.romd')).default,
      PaginaContact: (await import('../src/components/conversie/PaginaContact')).default,
      CONTACT_RO_MD: (await import('../src/content/ro-md/contact-componente')).CONTACT_RO_MD,
    }
  }

  afterAll(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  // Caile sursa din date (aceleasi pe ambele domenii) si caile servite pe 3s.com.ro (romana la radacina, engleza sub
  // /en: deciziile 71-72), scrise aici, nu calculate de codul probat.
  const SURSA_EN = ['/enterprise', '/pricing', '/about', '/platform', '/guides/records-retention-moldova']
  const SURSA_RO = ['/ro/enterprise', '/ro/preturi', '/ro/securitate', '/ro/platforma', '/ro/ghiduri/termene-pastrare-moldova']
  const SERVITE_EN = SURSA_EN.map((c) => '/en' + c)
  const SERVITE_RO = ['/enterprise', '/preturi', '/securitate', '/platforma', '/ghiduri/termene-pastrare-moldova']

  it('martorul masurii, pe HTML asamblat la rulare: o cale scrisa ca text e prinsa, ce sta sub aria-hidden nu, un text obisnuit e frunza', () => {
    const card = (href: string, interior: string) =>
      '<section aria-labelledby="contact-subiecte"><ul><li><a href="' + href + '" class="c_card"><span class="c_cardTitlu">Titlu</span>' + interior + '</a></li></ul></section>'
    const cale = '/r' + 'o/preturi'
    expect(cardContact(card('/preturi#pachete', '<span class="c_cardAdresa">' + cale + '</span>'))).toEqual({ hrefs: ['/preturi'], frunze: ['Titlu', cale], caiVizibile: [cale] })
    expect(cardContact(card('/preturi', '<span class="c_cardAdresa" aria-hidden="true"><svg><path d="M0"></path></svg></span>')).caiVizibile).toEqual([])
    expect(cardContact(card('/preturi', '<span class="c_cardAdresa">Pachete</span>')).frunze).toEqual(['Titlu', 'Pachete'])
  })

  it('ro-RO (/contact): cele 7 carduri au legatura si niciunul nu afiseaza o cale', () => {
    const m = cardContact(randeaza(ContactRo))
    expect(m.hrefs).toHaveLength(7)
    expect(m.hrefs.every((h) => h.startsWith('/'))).toBe(true)
    expect(m.frunze.length).toBeGreaterThan(7)
    expect(m.caiVizibile).toEqual([])
  })

  it('3s.md (asezarea md): pe /contact si /ro/contact legatura e calea din date, iar textul nu e o cale', async () => {
    const p = await cuProfil('3s-md')
    const en = cardContact(randeaza(p.ContactEn))
    const ro = cardContact(randeaza(p.ContactRoMd))
    expect([en.hrefs, en.caiVizibile]).toEqual([SURSA_EN, []])
    expect([ro.hrefs, ro.caiVizibile]).toEqual([SURSA_RO, []])
  })

  it('3s.com.ro (asezarea ro): pe /contact si /en/contact legatura e calea servita, iar textul nu e o cale', async () => {
    const p = await cuProfil('3s-com-ro')
    expect(profil('3s-com-ro').SITE_ASEZARE).toBe('ro')
    const ro = cardContact(randeaza(p.ContactRoMd))
    const en = cardContact(randeaza(p.ContactEn))
    expect([ro.hrefs, ro.caiVizibile]).toEqual([SERVITE_RO, []])
    expect([en.hrefs, en.caiVizibile]).toEqual([SERVITE_EN, []])
    // Martorul pe randarea reala: un card al carui text NU e o cale il pastreaza vizibil, deci masura vede randul de jos.
    const carduri = p.CONTACT_RO_MD.subiecte.carduri.map((c, i) => (i === 0 ? { ...c, legatura: { ...c.legatura, text: 'Pachete' + ' EUR' } } : c))
    const html = renderToStaticMarkup(createElement(p.PaginaContact, { continut: { ...p.CONTACT_RO_MD, subiecte: { ...p.CONTACT_RO_MD.subiecte, carduri } } }))
    const m = cardContact(html)
    expect(m.frunze).toContain('Pachete EUR')
    expect(m.caiVizibile).toEqual([])
  })

  it('textCaleCard: identitatea pe md, traducerea pe ro numai cand textul numeste tinta cardului', async () => {
    const { textCaleCard } = await import('../src/components/conversie/PaginaContact')
    const rute = [
      { cale: '/ro/preturi', editie: 'ro-MD' as const },
      { cale: '/pricing', editie: 'en' as const },
    ]
    const leg = (t: string, h: string | null) => ({ text: t, href: h, ruta: h })
    expect(textCaleCard(leg('/ro/preturi', '/ro/preturi'), rute, 'md')).toBe('/ro/preturi')
    expect(textCaleCard(leg('/ro/preturi', '/ro/preturi'), rute, 'ro')).toBe('/preturi')
    expect(textCaleCard(leg('/pricing', '/pricing'), rute, 'ro')).toBe('/en/pricing')
    expect(textCaleCard(leg('Prețuri', '/ro/preturi'), rute, 'ro')).toBe('Prețuri')
    expect(textCaleCard(leg('/ro/preturi', null), rute, 'ro')).toBe('/ro/preturi')
  })
})

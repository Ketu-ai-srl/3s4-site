import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { formePolitete } from './browser/ajutor/juridic-servit'

/**
 * Felia 148: ce a ramas din testul 3s.com.ro (07.10) dupa feliile 143 si 144.
 *
 * CE SE MASOARA, pe item, fiecare cu martorul lui:
 *  (1) numarul de telefon din fraza de sub H1 de pe /contact (editia ro-MD) si /en/contact (editia EN), pe ambele
 *      domenii: grupele de cifre legate prin U+00A0, deci navigatorul nu rupe numarul la capat de rand; numarul e al
 *      domeniului; in restul paginii (panoul de canale) numarul ramane cu spatii obisnuite. Ruperea pe ecran se masoara
 *      in browser (Range.getClientRects), aici se fixeaza forma textului; comparatia de identitate dintre build-uri o
 *      probeaza `proba-compara-build.py` (9);
 *  (2) descrierile si titlurile scurte din `DOCUMENTE_JURIDICE` (familia SEE, nepublicata pe 3s.md si 3s.com.ro, dar in
 *      pachetul de browser al startului) fara forme de politete (decizia 77); martorul: descrierile bazei, asamblate la
 *      rulare, dau 5 forme cu acelasi detector. Pachetul servit se masoara in `tests/editii.test.ts` (jobul Profil 3s.md);
 *  (3) observatiile criticului de limba: fisierul fictiv al randului "Chitanta" din macheta registrului; "Pagina Despre 3S"
 *      scris uniform; cardul "Locul datelor" fara zeugma; raspunsul despre ghiduri cu subiectul scurt si legaturile la
 *      locul lor; comentariul de la raspunsul gazduirii citeaza fara diacritice.
 *
 * FIXTURILE se asambleaza la rulare: textele vechi cautate de martori se compun din bucati.
 */

const profil = (nume: string) => JSON.parse(readFileSync(join(__dirname, '..', 'config', 'profil-' + nume + '.json'), 'utf8')) as Record<string, unknown>
const text = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v))
const NBSP = ' '

/** Mediul aplicatiei dat (rutele, canalele si asezarea se citesc la import si la randare), apoi modulele proaspete. */
async function cuProfil(nume: '3s-md' | '3s-com-ro') {
  const p = profil(nume)
  for (const k of ['SITE_URL', 'SITE_ENV', 'SITE_EDITII', 'SITE_ASEZARE', 'SITE_ALTERNATE', 'OPERATOR_JSON', 'CANALE_JSON']) vi.stubEnv(k, p[k] === undefined ? '' : text(p[k]))
  for (const k of ['NEXT_PUBLIC_SITE_EDITII', 'NEXT_PUBLIC_SITE_ASEZARE', 'NEXT_PUBLIC_OPERATOR_NUMIT', 'NEXT_PUBLIC_FAMILIE_JURIDICA']) vi.stubEnv(k, '')
  vi.resetModules()
}

afterAll(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

const randeaza = (C: ComponentType) => renderToStaticMarkup(createElement(C))

function decodeaza(t: string): string {
  return t
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, NBSP)
    .replace(/&amp;/g, '&')
}

/** Textul vizibil al unui fragment: fara etichete, cu entitatile decodate, spatiile pastrate. */
const vizibil = (html: string) => decodeaza(html.replace(/<[^>]+>/g, ''))

/** Primul paragraf de dupa H1 (subtitlul eroului) si restul paginii, ca HTML. */
function subtitluSiRest(html: string): { subtitlu: string; rest: string } {
  const i = html.indexOf('</h1>')
  if (i < 0) throw new Error('NEMASURAT: pagina nu are H1')
  const m = /<p\b[^>]*>([\s\S]*?)<\/p>/.exec(html.slice(i))
  if (m === null) throw new Error('NEMASURAT: fara paragraf dupa H1')
  const start = i + m.index
  return { subtitlu: vizibil(m[1]), rest: html.slice(0, start) + html.slice(start + m[0].length) }
}

/** Numerele de telefon cu un spatiu OBISNUIT intre grupe (acolo navigatorul poate rupe randul). */
const numereRupte = (t: string) => [...t.matchAll(/\+\d{1,3}(?:[  ]\d{2,4})+/g)].map((m) => m[0]).filter((n) => n.includes(' '))

// ---------------------------------------------------------------------------------------------------------------------
// (1) numarul de pe /contact
// ---------------------------------------------------------------------------------------------------------------------

describe('(1) numarul de telefon din fraza de sub H1 pe /contact nu se rupe', () => {
  for (const nume of ['3s-com-ro', '3s-md'] as const) {
    it(nume + ': RO si EN, numarul domeniului, cu U+00A0 intre grupe numai in subtitlu', async () => {
      await cuProfil(nume)
      const { numarAfisat } = await import('../src/content/canale')
      const numar = numarAfisat()
      // Controlul: numarul domeniului are grupe despartite prin spatiu (altfel proba n-ar avea ce masura).
      expect(numar).toMatch(/^\+\d{1,3}( \d{2,4})+$/)
      const ContactRo = (await import('../src/app/(romd)/ro/contact/page.romd')).default
      const ContactEn = (await import('../src/app/(en)/contact/page.en')).default
      for (const C of [ContactRo, ContactEn]) {
        const { subtitlu, rest } = subtitluSiRest(randeaza(C))
        expect(subtitlu).toContain(numar.replace(/ /g, NBSP))
        expect(numereRupte(subtitlu), subtitlu).toEqual([])
        // Numarul din alte locuri (panoul de canale) ramane cu spatii obisnuite, iar adresa WhatsApp nu se schimba.
        expect(rest).toContain(numar)
        expect(rest).not.toContain(numar.replace(/ /g, NBSP))
      }
    })
  }

  it('martor: numarul cu spatii obisnuite e prins; subtitlul RO fara numar trece neatins', async () => {
    const { numarNedespartit } = await import('../src/components/conversie/PaginaContact')
    const { CONTACT } = await import('../src/content/conversie')
    // Numerele fictive se asambleaza la rulare (proba nu poarta pe litere un numar de telefon).
    const nr = ['+40', '700', '000', '000'].join(' ')
    expect(numereRupte('la ' + nr + ', ori')).toEqual([nr])
    expect(numereRupte(numarNedespartit('la ' + nr + ', ori'))).toEqual([])
    const md = ['+373', '60', '000', '000']
    expect(numarNedespartit('la ' + md.join(' ') + '.')).toBe('la ' + md.join(NBSP) + '.')
    // Textul fara numar (si o cifra singura, un an) ramane identic.
    expect(numarNedespartit('Din 2026, la 3 zile.')).toBe('Din 2026, la 3 zile.')
    expect(numarNedespartit(CONTACT.erou.subtitlu)).toBe(CONTACT.erou.subtitlu)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (2) DOCUMENTE_JURIDICE la "tu"
// ---------------------------------------------------------------------------------------------------------------------

/** Descrierile familiei SEE de pe baza, cu forme de politete, asamblate din bucati. */
const BAZA_DOCUMENTE_SEE = [
  'Ce date personale prelucrează site-ul, în ce scop, pe ce temei, cui le transmite și ce drepturi av' + 'eți.',
  'Ce se stochează în browser, pentru ce, cât timp și cum ' + 'v' + 'ă d' + 'ați sau ' + 'v' + 'ă retrag' + 'eți acordul.',
]

describe('(2) DOCUMENTE_JURIDICE (familia SEE) fara forme de politete', () => {
  it('martor pe baza: detectorul probei servite prinde 5 forme in descrierile dinainte', () => {
    expect(formePolitete(BAZA_DOCUMENTE_SEE.join(' '))).toHaveLength(5)
  })

  it('titlurile scurte si descrierile celor 7 documente: 0 forme; descrierile bazei nu mai sunt in modul', async () => {
    const { DOCUMENTE_JURIDICE } = await import('../src/content/juridic/publicare')
    // Controlul extragerii: toate cele 7 intrari, fiecare cu descriere.
    expect(DOCUMENTE_JURIDICE).toHaveLength(7)
    for (const d of DOCUMENTE_JURIDICE) {
      expect(d.descriere, d.slug).not.toBe('')
      expect(formePolitete(d.scurt + ' ' + d.descriere), d.slug).toEqual([])
    }
    const descrieri = DOCUMENTE_JURIDICE.map((d) => d.descriere)
    for (const vechi of BAZA_DOCUMENTE_SEE) expect(descrieri).not.toContain(vechi)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (3) observatiile criticului de limba
// ---------------------------------------------------------------------------------------------------------------------

describe('(3) observatiile criticului de limba', () => {
  it('(a) macheta registrului: randul "Chitanta" poarta un fisier de chitanta; nicio editie nu mai are fisierul vechi', async () => {
    const { MACHETA_REGISTRU_RO_MD } = await import('../src/content/ro-md/acasa-componente')
    const { MACHETA_REGISTRU_EN } = await import('../src/content/en/acasa-componente')
    const chitante = MACHETA_REGISTRU_RO_MD.randuri.filter((r) => r.tip.text === 'Chitanță')
    // Controlul: exact un rand cu tipul "Chitanta" (tipul ramane cel din vocabularul platformei).
    expect(chitante).toHaveLength(1)
    expect(chitante[0].fisier).toMatch(/^Chitanta_/)
    // Masurat la 1440 px: un nume de 26 de caractere depasea coloana cu 1 px langa eticheta "Chitanta" (taiat cu "...").
    expect(chitante[0].fisier.length).toBeLessThan(26)
    const vechi = 'Bon_' + 'motorina'
    expect(JSON.stringify(MACHETA_REGISTRU_RO_MD)).not.toContain(vechi)
    expect(JSON.stringify(MACHETA_REGISTRU_EN)).not.toContain(vechi)
    // Perechea EN: fiecare fisier fictiv numeste tipul randului lui (Invoice, Offer, Report), deci n-are nepotrivirea.
    for (const r of MACHETA_REGISTRU_EN.randuri) expect(r.fisier.toLowerCase(), r.fisier).toContain(r.tip.text.toLowerCase())
  })

  it('(b) "Pagina Despre 3S" cu majuscula pe start, ca titlul paginii si ca pe /platforma si /enterprise', async () => {
    const { EROU_RO_MD } = await import('../src/content/ro-md/acasa-componente')
    expect(EROU_RO_MD.popover.legatura?.text).toBe('Pagina Despre 3S')
    expect(JSON.stringify(EROU_RO_MD)).not.toContain('Pagina ' + 'despre 3S')
  })

  it('(c) cardul "Locul datelor" de pe /enterprise: "numește furnizorul și explică efectul", legatura neschimbata', async () => {
    const { LIVRABILE_RO_MD } = await import('../src/content/ro-md/enterprise-componente')
    const carduri = JSON.parse(JSON.stringify(LIVRABILE_RO_MD)) as unknown
    const toate: { titlu?: string; text?: string; legaturaInText?: { text: string; href: string } }[] = []
    const aduna = (x: unknown) => {
      if (Array.isArray(x)) x.forEach(aduna)
      else if (x !== null && typeof x === 'object') {
        const o = x as Record<string, unknown>
        if (o.titlu === 'Locul datelor') toate.push(o as (typeof toate)[number])
        Object.values(o).forEach(aduna)
      }
    }
    aduna(carduri)
    expect(toate).toHaveLength(1)
    const c = toate[0]
    expect(c.text).toBe('Fișierele sunt găzduite în UE, cu regiunea principală Frankfurt. Pagina Despre 3S numește furnizorul și explică efectul legii americane asupra datelor.')
    expect(c.legaturaInText).toEqual({ text: 'Pagina Despre 3S', href: '/ro/securitate#security' })
    expect(c.text).toContain(c.legaturaInText!.text)
  })

  it('(d) raspunsul despre ghiduri de pe /platforma: subiectul scurt, ambele texte de legatura neschimbate si in fraza', async () => {
    const { PLATFORMA_RO_MD } = await import('../src/content/ro-md/platforma-componente')
    const i = PLATFORMA_RO_MD.intrebari!.intrebari.find((x) => x.intrebare === 'Pot stabili cât timp se păstrează documentele?')
    expect(i).toBeDefined()
    expect(i!.raspuns).toBe(
      'Da. Pentru fiecare dosar alegi un termen de păstrare, valabil pentru toate documentele din el. Ghidurile noastre citează sursele: unul despre termenele de păstrare în Moldova, altul despre arhivarea e-facturilor în UE.',
    )
    expect(i!.legaturiInText).toEqual([
      { text: 'termenele de păstrare în Moldova', href: '/ro/ghiduri/termene-pastrare-moldova' },
      { text: 'arhivarea e-facturilor în UE', href: '/ro/ghiduri/arhivare-e-facturi-ue' },
    ])
    for (const l of i!.legaturiInText!) expect(i!.raspuns).toContain(l.text)
  })

  it('(e) comentariul de la raspunsul gazduirii citeaza legatura fara diacritice', () => {
    const sursa = readFileSync(join(__dirname, '..', 'src', 'content', 'ro-md', 'platforma-componente.ts'), 'utf8')
    const comentarii = sursa.split('\n').filter((r) => r.trim().startsWith('//') && r.includes('pagina Despre 3S'))
    // Controlul: comentariul exista (o data) si citeaza textul legaturii.
    expect(comentarii).toHaveLength(1)
    expect(comentarii[0]).toContain('"Citeste pagina Despre 3S"')
    expect(comentarii[0]).not.toMatch(/[ăâîșțĂÂÎȘȚ]/)
  })
})

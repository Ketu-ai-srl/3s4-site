import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PaginaArticol from '../src/components/blog/PaginaArticol'
import PaginaCategorie from '../src/components/blog/PaginaCategorie'
import PaginaListare from '../src/components/blog/PaginaListare'
import { dateCard } from '../src/components/blog/carduri'
import { nodArticol } from '../src/components/blog/date-structurate'
import { filtreaza, numarArticole } from '../src/components/blog/format'
import { metadataArticol } from '../src/components/blog/metadata'
import { abateriMetadata } from '../src/components/seo/metadata'
import { LINIUTE_INTERZISE } from '../src/content/blog/antet'
import { citesteArticolele, type ArticolComplet } from '../src/content/blog/conducta'
import { textDin, type Bloc, type Inline } from '../src/content/blog/markdown'
import { ARTICOLE, CALE_BLOG, caiArticole, caleArticol, caleCategorie, categoriiCuArticole } from '../src/content/blog/registru'
import { ARTICOL, CATEGORII } from '../src/content/blog/texte'
import { CAI_EXISTENTE } from '../src/content/cai'
import { RUTE } from '../src/content/rute'

/**
 * Probele feliei `blog-articole`: primul lot de articole REALE, citit prin conducta feliei 59 din
 * `src/content/blog/*.mdx`. Nicio valoare nu e scrisa de mana: numarul de articole, categoriile,
 * contoarele, legaturile si sursele se DERIVA din registru si din fisierele de pe disc, deci un articol
 * adaugat sau scos intra singur in probe, fara sa le inroseasca pe lucrul corect.
 *
 * Probele sintetice ale conductei raman in `tests/blog-conducta.test.ts`; aici se masoara ce ajunge pe
 * site din registrul real: fiecare articol se randeaza (titlu, caseta de fapte, surse, legaturi interne
 * spre articole existente), categoriile au contorul corect, cautarea fara diacritice gaseste fiecare
 * articol, datele structurate BlogPosting sunt complete, iar listarea si categoriile stau in `RUTE`.
 */

const RADACINA = resolve(__dirname, '..')
const REALE: ArticolComplet[] = citesteArticolele(RADACINA)

/** Textul vizibil al unui HTML randat: fara etichete, cu entitatile uzuale decodate. */
function textVizibil(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
}

function blocuriJsonLd(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]) as Record<string, unknown>)
    .flatMap((b) => (Array.isArray(b['@graph']) ? (b['@graph'] as Record<string, unknown>[]) : [b]))
}

/** Adresele tuturor legaturilor din corpul unui articol (paragrafe, liste, citate, tabele, titluri). */
function legaturi(blocuri: Bloc[]): string[] {
  const din = (copii: Inline[]): string[] =>
    copii.flatMap((c) => (c.tip === 'legatura' ? [c.href, ...din(c.copii)] : c.tip === 'tare' || c.tip === 'accent' ? din(c.copii) : []))
  return blocuri.flatMap((b) => {
    switch (b.tip) {
      case 'titlu':
      case 'paragraf':
        return din(b.copii)
      case 'lista':
        return b.elemente.flatMap(din)
      case 'citat':
        return b.paragrafe.flatMap(din)
      case 'tabel':
        return [...b.antet.flatMap(din), ...b.randuri.flatMap((r) => r.flatMap(din))]
      default:
        return []
    }
  })
}

function faraDiacritice(t: string): string {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ---------------------------------------------------------------------------------------------
// A. Registrul real
// ---------------------------------------------------------------------------------------------

describe('registrul real (primul lot)', () => {
  it('controlul fixturii: conducta citeste cel putin un articol, iar indexul are exact aceleasi articole', () => {
    expect(REALE.length).toBeGreaterThan(0)
    expect(ARTICOLE.map((a) => a.slug)).toEqual(REALE.map((a) => a.slug))
    const mdx = readdirSync(join(RADACINA, 'src', 'content', 'blog')).filter((f) => f.endsWith('.mdx'))
    expect(mdx.length).toBe(REALE.length)
  })

  it('listarea si categoriile cu articole stau in RUTE (harta de site), iar pe disc au pagina statica', () => {
    const cuArticole = categoriiCuArticole(ARTICOLE)
    const asteptate = [CALE_BLOG, ...cuArticole.map(caleCategorie)]
    const dinRute = RUTE.filter((r) => r.cale.startsWith(CALE_BLOG))
    expect(dinRute.map((r) => r.cale)).toEqual(asteptate)
    for (const r of dinRute) {
      expect(r.inHarta, r.cale).toBe(true)
      expect(existsSync(join(RADACINA, 'src', 'app', ...r.cale.split('/').filter(Boolean), 'page.tsx')), r.cale).toBe(true)
    }
    // Martor: o categorie fara articole nu are voie sa fie in RUTE (ar fi o pagina goala in meniu).
    for (const c of Object.keys(CATEGORII)) {
      if (!cuArticole.includes(c as never)) expect(asteptate).not.toContain(caleCategorie(c as never))
    }
  })

  it('caile existente (navigatia, Tinta) contin fiecare articol', () => {
    for (const a of ARTICOLE) expect(CAI_EXISTENTE.has(caleArticol(a)), a.slug).toBe(true)
    expect(caiArticole().filter((c) => !CAI_EXISTENTE.has(c))).toEqual([])
  })

  it('slugurile sunt unice si fiecare fisier poarta numele slugului', () => {
    expect(new Set(REALE.map((a) => a.slug)).size).toBe(REALE.length)
  })
})

// ---------------------------------------------------------------------------------------------
// B. Fiecare articol randat
// ---------------------------------------------------------------------------------------------

describe('fiecare articol real se randeaza complet', () => {
  for (const articol of REALE) {
    describe(articol.slug, () => {
      const html = renderToStaticMarkup(createElement(PaginaArticol, { articol, toate: REALE }))
      const text = textVizibil(html)
      const ld = blocuriJsonLd(html)

      it('un singur h1, cu titlul articolului', () => {
        expect(html.match(/<h1/g)).toHaveLength(1)
        expect(textVizibil(/<h1[\s\S]*?<\/h1>/.exec(html)?.[0] ?? '').trim()).toBe(articol.titlu)
      })

      it('caseta de fapte are fiecare fapt din antet', () => {
        if (articol.casetaFapte.length === 0) {
          expect(text).not.toContain(ARTICOL.fapte)
          return
        }
        expect(text).toContain(ARTICOL.fapte)
        for (const f of articol.casetaFapte) expect(text, f.slice(0, 60)).toContain(f)
      })

      it('sursele: fiecare adresa din antet e o legatura externa sub articol', () => {
        expect(articol.surse.length).toBeGreaterThan(0)
        expect(text).toContain(ARTICOL.surse)
        for (const s of articol.surse) expect(html, s.url).toContain('href="' + s.url.replace(/&/g, '&amp;') + '"')
      })

      it('legaturile interne spre blog duc la articole existente si se randeaza ca legaturi, nu inerte', () => {
        const spreBlog = legaturi(articol.corp.blocuri).filter((h) => h.startsWith(CALE_BLOG + '/'))
        for (const h of spreBlog) {
          const slug = h.slice(CALE_BLOG.length + 1).split('#')[0]
          expect(REALE.some((a) => a.slug === slug), h).toBe(true)
          expect(slug, 'articolul nu trimite la el insusi').not.toBe(articol.slug)
          expect(html).toContain('href="' + h + '"')
        }
        expect(html).not.toMatch(/data-tinta-lipsa="\/blog/)
      })

      it('caseta CTA are textul articolului', () => {
        expect(articol.corp.cta).not.toBeNull()
        for (const p of articol.corp.cta ?? []) expect(text).toContain(textDin(p).trim())
      })

      it('JSON-LD BlogPosting: titlul, datele, wordCount masurat, autorul prin @id, sursele citate', () => {
        const post = ld.find((n) => n['@type'] === 'BlogPosting') as Record<string, unknown>
        expect(post).toBeDefined()
        expect(post.headline).toBe(articol.titlu)
        expect(post.description).toBe(articol.extras)
        expect(post.datePublished).toBe(articol.dataPublicarii)
        expect(post.wordCount).toBe(articol.cuvinte)
        expect(post.inLanguage ?? 'ro').toMatch(/^ro/)
        expect((post.author as { '@id': string })['@id']).toMatch(/#organizatie$/)
        expect((post.publisher as { '@id': string })['@id']).toMatch(/#organizatie$/)
        expect(post.citation).toEqual(articol.surse.map((s) => s.url))
        expect(post['@id']).toBe(nodArticol(articol, CATEGORII[articol.categorie].nume)['@id'])
        expect(ld.filter((n) => n['@type'] === 'BreadcrumbList')).toHaveLength(1)
      })

      it('metadata: titlul si extrasul in pragurile portii de SEO, canonical pe articol', () => {
        expect(abateriMetadata({ titlu: articol.titlu, descriere: articol.extras, cale: caleArticol(articol) })).toEqual([])
        expect(metadataArticol(articol).alternates?.canonical).toBe(caleArticol(articol))
      })
    })
  }

  it('controlul probei de legaturi: lotul chiar are legaturi interne spre alte articole', () => {
    const toate = REALE.flatMap((a) => legaturi(a.corp.blocuri)).filter((h) => h.startsWith(CALE_BLOG + '/'))
    expect(toate.length).toBeGreaterThan(0)
  })

  it('titlurile si extrasele sunt unice pe tot lotul (descrieri unice pe site)', () => {
    expect(new Set(REALE.map((a) => a.titlu.toLowerCase())).size).toBe(REALE.length)
    expect(new Set(REALE.map((a) => a.extras.toLowerCase())).size).toBe(REALE.length)
  })
})

// ---------------------------------------------------------------------------------------------
// C. Listarea, categoriile, cautarea
// ---------------------------------------------------------------------------------------------

describe('listarea si categoriile, pe registrul real', () => {
  it('fiecare categorie cu articole arata contorul si exact articolele ei', () => {
    for (const c of categoriiCuArticole(ARTICOLE)) {
      const aici = REALE.filter((a) => a.categorie === c)
      const html = renderToStaticMarkup(createElement(PaginaCategorie, { categorie: c, articole: REALE }))
      expect(html, c).toContain('>' + numarArticole(aici.length) + '<')
      expect(html.match(/data-card="C"/g) ?? [], c).toHaveLength(aici.length)
      for (const a of aici) expect(html, c + ' / ' + a.slug).toContain('href="' + caleArticol(a) + '"')
    }
  })

  it('contoarele categoriilor insumeaza tot registrul', () => {
    const suma = categoriiCuArticole(ARTICOLE).reduce((s, c) => s + ARTICOLE.filter((a) => a.categorie === c).length, 0)
    expect(suma).toBe(ARTICOLE.length)
  })

  it('listarea are fiecare articol in datele structurate, in ordinea registrului', () => {
    const html = renderToStaticMarkup(createElement(PaginaListare, { articole: REALE }))
    const lista = blocuriJsonLd(html).find((n) => n['@type'] === 'ItemList') as { itemListElement: { url?: string; item?: { url?: string } }[] }
    const adrese = lista.itemListElement.map((e) => e.url ?? e.item?.url ?? '')
    expect(adrese.map((u) => u.replace(/^https?:\/\/[^/]+/, ''))).toEqual(REALE.map(caleArticol))
  })

  it('cautarea fara diacritice si fara majuscule gaseste fiecare articol dupa titlu', () => {
    const carduri = REALE.map(dateCard)
    let cuDiacritice = 0
    for (const a of carduri) {
      const cerere = faraDiacritice(a.titlu).toUpperCase()
      if (cerere !== a.titlu.toUpperCase()) cuDiacritice++
      expect(filtreaza(carduri, cerere, null).map((x) => x.slug), cerere).toContain(a.slug)
    }
    // Controlul: proba chiar a scos diacritice din cel putin un titlu real, deci a masurat potrivirea fara ele.
    expect(cuDiacritice).toBeGreaterThan(0)
    // Martor pozitiv: o cerere fara potrivire nu intoarce nimic.
    expect(filtreaza(carduri, 'zzqqxx', null)).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------
// D. Regulile depozitului pe textul articolelor
// ---------------------------------------------------------------------------------------------

describe('textul articolelor reale', () => {
  const fisiere = readdirSync(join(RADACINA, 'src', 'content', 'blog')).filter((f) => f.endsWith('.mdx'))
  const texte = fisiere.map((f) => readFileSync(join(RADACINA, 'src', 'content', 'blog', f), 'utf8'))

  it('doar cratima: nicio liniuta lunga sau medie', () => {
    for (const [i, t] of texte.entries()) expect(LINIUTE_INTERZISE.test(t), fisiere[i]).toBe(false)
  })

  it('diacritice cu virgula, nu cu sedila', () => {
    for (const [i, t] of texte.entries()) expect(/[şţŞŢ]/.test(t), fisiere[i]).toBe(false)
  })

  it('doar marca 3S: niciun nume de firma-mama, niciun nume de producator de sisteme', () => {
    for (const [i, t] of texte.entries()) {
      const mic = t.toLowerCase()
      expect(mic, fisiere[i]).not.toContain(['ad', 'ria'].join(''))
      for (const n of [['mac', 'os'], ['app', ' store']]) expect(mic, fisiere[i]).not.toContain(n.join(''))
      expect(/\bi\s?os\b/i.test(t), fisiere[i]).toBe(false)
    }
  })

  it('fara date de firma in datele structurate ale articolelor', () => {
    for (const a of REALE) {
      const ld = blocuriJsonLd(renderToStaticMarkup(createElement(PaginaArticol, { articol: a, toate: REALE })))
      for (const n of ld) for (const k of ['address', 'telephone', 'taxID', 'legalName', 'vatID']) expect(n, a.slug).not.toHaveProperty(k)
    }
  })
})

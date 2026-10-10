import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import CorpPagina from '../src/components/continut/CorpPagina'
import CorpDocument from '../src/components/juridic/CorpDocument'
import { numarCuvinte, problemePagina, type PaginaContinut } from '../src/content/model/tipuri'

/**
 * Probele modelului de continut EN (felia 79): ce nu are voie sa intre in `src/content/en` din
 * fisele de continut, forma modulelor paginilor si refolosirea randatorului juridic.
 *
 * Azi `src/content/en` nu exista inca (paginile vin in valurile 4-5), deci verificarile pe modulele
 * reale trec pe zero fisiere. Fiecare are de aceea si un martor POZITIV asamblat aici, la rulare:
 * fara el, un zero ar putea insemna ca proba nu citeste nimic. Marcajele cautate se compun din bucati,
 * ca fisierul asta sa nu fie el insusi o instanta a ce cauta.
 */

const DOSAR_EN = join(process.cwd(), 'src', 'content', 'en')

/** Ce din fisele de continut nu se publica niciodata: sectiunile de note si de resurse, marcajele [N]. */
const NEPUBLICATE: { nume: string; tipar: RegExp }[] = [
  { nume: 'sectiunea de note', tipar: new RegExp('Notes' + ' \\(not published\\)', 'i') },
  { nume: 'sectiunea de resurse', tipar: new RegExp('Page' + ' assets', 'i') },
  { nume: 'marcajul [N -', tipar: new RegExp('\\[N' + ' -') },
]

function nepublicate(text: string): string[] {
  return NEPUBLICATE.filter((n) => n.tipar.test(text)).map((n) => n.nume)
}

/** Fisierele unui dosar, recursiv; lista goala cand dosarul lipseste. */
function fisiereDin(dosar: string): string[] {
  if (!existsSync(dosar)) return []
  return readdirSync(dosar, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile())
    .map((f) => join(f.parentPath, f.name))
    .sort()
}

/** O pagina valida, fabricata: fiecare regula a modelului o respecta la limita ei de jos. */
function paginaBuna(): PaginaContinut {
  const capsula = Array.from({ length: 45 }, (_, i) => (i === 0 ? '3S' : 'word')).join(' ')
  return {
    cheie: 'pricing',
    meta: {
      titlu: '3S Pricing: Starter, Pro and Business',
      descriere: 'x'.repeat(130),
      cale: '/pricing',
    },
    h1: '3S pricing: four plans, in euros',
    capsula,
    sectiuni: [
      {
        cheie: 'plans',
        titlu: 'What are the 3S plans?',
        blocuri: [
          {
            paragrafe: ['Prices are **per company**, in euros. See [Enterprise](/enterprise).'],
            tabel: { forma: 'cu-antet', titlu: 'Plans', antet: ['Plan', 'Accounts'], randuri: [['Starter', '5']] },
          },
        ],
      },
      { cheie: 'vat', titlu: 'Do the prices include VAT?', blocuri: [{ paragrafe: ['No.'], lista: { elemente: ['One', 'Two'] } }] },
    ],
    cta: {
      ref: 'en-price',
      titluBloc: 'Ask for a quote',
      textWhatsapp: 'Hello 3S, I read your pricing page [ref:en-price]. I would like to ask for a quote.',
      subiectEmail: '3S inquiry [ref:en-price]',
    },
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage' }],
    afirmatii: ['en-pret-starter', 'en-pilot-asistat'],
  }
}

describe('src/content/en: nimic nepublicat din fise', () => {
  it('martorii: textul cu sectiunile nepublicate e prins, textul curat nu', () => {
    const rau = ['## ' + 'Notes' + ' (not published)', '## ' + 'Page' + ' assets', 'Pricing [N' + ' - P-57]'].join('\n')
    expect(nepublicate(rau)).toEqual(['sectiunea de note', 'sectiunea de resurse', 'marcajul [N -'])
    expect(nepublicate('Prices exclude VAT; where VAT applies, it is added to the invoice.')).toEqual([])
  })

  it('martorul descoperirii: un dosar fabricat e citit recursiv, un dosar lipsa da zero', () => {
    const d = mkdtempSync(join(tmpdir(), 'continut-en-'))
    try {
      writeFileSync(join(d, 'a.ts'), 'export {}\n')
      mkdirSync(join(d, 'sub'))
      writeFileSync(join(d, 'sub', 'b.ts'), 'export {}\n')
      expect(fisiereDin(d).map((f) => relative(d, f).split(sep).join('/'))).toEqual(['a.ts', 'sub/b.ts'])
      expect(fisiereDin(join(d, 'lipsa'))).toEqual([])
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  })

  it('niciun fisier din src/content/en nu poarta note, resurse sau marcaje [N]', () => {
    const gasite = fisiereDin(DOSAR_EN).flatMap((f) => nepublicate(readFileSync(f, 'utf8')).map((n) => f + ': ' + n))
    expect(gasite).toEqual([])
  })
})

describe('modelul paginilor de continut', () => {
  it('martorul negativ: pagina fabricata valida nu are probleme', () => {
    expect(problemePagina(paginaBuna(), 'pricing')).toEqual([])
  })

  it('martorii pozitivi: fiecare regula prinde incalcarea ei', () => {
    const cazuri: [string, (p: PaginaContinut) => PaginaContinut][] = [
      ['difera de numele modulului', (p) => ({ ...p, cheie: 'pret' })],
      ['titlul are', (p) => ({ ...p, meta: { ...p.meta, titlu: 'x'.repeat(66) } })],
      ['meta-descrierea are', (p) => ({ ...p, meta: { ...p.meta, descriere: 'x'.repeat(119) } })],
      ['calea', (p) => ({ ...p, meta: { ...p.meta, cale: '/pricing/' } })],
      ['H1 gol', (p) => ({ ...p, h1: ' ' })],
      ['capsula are 39 cuvinte', (p) => ({ ...p, capsula: Array(39).fill('word').join(' ') })],
      ['capsula are 61 cuvinte', (p) => ({ ...p, capsula: Array(61).fill('word').join(' ') })],
      ['apare de doua ori', (p) => ({ ...p, sectiuni: [p.sectiuni[0], p.sectiuni[0]] })],
      ['nu are niciun bloc', (p) => ({ ...p, sectiuni: [{ cheie: 'gol', titlu: 'Empty?', blocuri: [] }] })],
      ['textul WhatsApp', (p) => ({ ...p, cta: { ...p.cta, textWhatsapp: 'Hello 3S.' } })],
      ['subiectul e-mailului', (p) => ({ ...p, cta: { ...p.cta, subiectEmail: '3S inquiry [ref:en-price] [ref:en-price]' } })],
      ['ref-ul', (p) => ({ ...p, cta: { ...p.cta, ref: 'EN price' } })],
      ['nu are `@type`', (p) => ({ ...p, jsonLd: [{ '@context': 'https://schema.org' }] })],
      ['afirmatia `en-pilot-asistat` apare de doua ori', (p) => ({ ...p, afirmatii: [...p.afirmatii, 'en-pilot-asistat'] })],
    ]
    for (const [mesaj, strica] of cazuri) {
      const probleme = problemePagina(strica(paginaBuna()), 'pricing')
      expect(probleme.join(' | '), mesaj).toContain(mesaj)
    }
  })

  it('cuvintele capsulei se numara fara marcaj in linie', () => {
    expect(numarCuvinte('See **the plans** and [Enterprise pricing](/enterprise).')).toBe(6)
    expect(numarCuvinte('   ')).toBe(0)
  })

  // Felia 99 (decizia 53): modulele `<pagina>-componente.ts` poarta continutul COMPONENTELOR startului (pagina compune
  // componentele RO cu textul editiei), nu o pagina pe modelul CorpPagina; se numara separat si n-au voie sa exporte
  // `pagina`, ca un modul de pagina sa nu se poata ascunde sub numele lor.
  // Felia 106 (decizia 53): paginile de referinta G1-G3 compun componentele perechilor RO, deci modulele lor poarta
  // contractele componentelor, iar `pagina` lor are numai metadata, CTA-ul, datele structurate si registrul (fara
  // `sectiuni`: nu se randeaza prin CorpPagina); `referinta-comun.ts` tine piesele lor comune si nu exporta `pagina`.
  // Se numara separat, pe nume, ca un modul de pagina CorpPagina sa nu se poata ascunde sub forma lor.
  const MODULE_REFERINTA = ['compare-3s-vs-google-drive.ts', 'guides-e-invoice-archiving-eu.ts', 'guides-records-retention-moldova.ts']
  const COMUN_REFERINTA = 'referinta-comun.ts'

  it('fiecare modul din src/content/en exporta `pagina` valida, cu cheia egala cu numele fisierului', async () => {
    const toate = fisiereDin(DOSAR_EN).filter((f) => f.endsWith('.ts') && !relative(DOSAR_EN, f).includes(sep))
    const componente = toate.filter((f) => f.endsWith('-componente.ts'))
    const referinta = toate.filter((f) => [...MODULE_REFERINTA, COMUN_REFERINTA].includes(relative(DOSAR_EN, f)))
    const moduleEn = toate.filter((f) => !componente.includes(f) && !referinta.includes(f))
    expect(componente.map((f) => relative(DOSAR_EN, f))).toContain('acasa-componente.ts')
    expect(componente.map((f) => relative(DOSAR_EN, f))).toContain('platforma-componente.ts')
    expect(referinta.map((f) => relative(DOSAR_EN, f)).sort()).toEqual([...MODULE_REFERINTA, COMUN_REFERINTA].sort())
    const probleme: string[] = []
    for (const f of componente) {
      const m = (await import(/* @vite-ignore */ pathToFileURL(f).href)) as { pagina?: unknown }
      if (m.pagina !== undefined) probleme.push(relative(DOSAR_EN, f) + ': modul de componente care exporta `pagina`')
    }
    for (const f of referinta) {
      const nume = relative(DOSAR_EN, f)
      const m = (await import(/* @vite-ignore */ pathToFileURL(f).href)) as { pagina?: { cheie?: string; meta?: { cale?: string }; sectiuni?: unknown } }
      if (nume === COMUN_REFERINTA) {
        if (m.pagina !== undefined) probleme.push(nume + ': modulul comun exporta `pagina`')
      } else if (m.pagina === undefined) probleme.push(nume + ': nu exporta `pagina`')
      else {
        if (m.pagina.cheie !== nume.replace(/\.ts$/, '')) probleme.push(nume + ': cheia paginii nu e numele fisierului')
        if (m.pagina.sectiuni !== undefined) probleme.push(nume + ': `pagina` are `sectiuni` (forma CorpPagina) pe o pagina congruenta')
        if (typeof m.pagina.meta?.cale !== 'string') probleme.push(nume + ': `pagina` fara cale')
      }
    }
    for (const f of moduleEn) {
      const m = (await import(/* @vite-ignore */ pathToFileURL(f).href)) as { pagina?: PaginaContinut }
      const cheie = relative(DOSAR_EN, f).replace(/\.ts$/, '')
      if (m.pagina === undefined) probleme.push(cheie + ': nu exporta `pagina`')
      else {
        try {
          probleme.push(...problemePagina(m.pagina, cheie))
        } catch (e) {
          probleme.push(cheie + ': `pagina` nu are forma modelului (' + String(e) + ')')
        }
      }
    }
    expect(probleme).toEqual([])
  })
})

describe('CorpPagina refoloseste randatorul juridic', () => {
  const pagina = paginaBuna()
  const html = renderToStaticMarkup(createElement(CorpPagina, { pagina }))
  const corp = renderToStaticMarkup(createElement(CorpDocument, { document: { introducere: '', sectiuni: pagina.sectiuni } }))

  it('corpul paginii e exact iesirea lui CorpDocument pe aceleasi sectiuni', () => {
    // Id-urile generate de React (`useId`, legenda tabelului) depind de pozitia in arbore: se
    // normalizeaza, restul trebuie sa fie identic la caracter.
    const fara = (s: string) => s.replace(new RegExp(String.fromCharCode(0xab) + '[^' + String.fromCharCode(0xbb) + ']*' + String.fromCharCode(0xbb), 'g'), 'ID')
    expect(corp).toContain('<h2>What are the 3S plans?</h2>')
    expect(fara(corp)).toContain('aria-labelledby="ID-legenda"')
    expect(fara(html)).toContain(fara(corp))
  })

  it('un singur H1, capsula in antet, marcajul in linie randat', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1)
    expect(html).toContain('>' + pagina.h1 + '</h1>')
    expect(html).toContain('data-capsula')
    expect(html).toContain('<strong>per company</strong>')
    expect(html).not.toContain('**')
  })

  it('blocurile fara jurisdictie nu primesc div-ul de jurisdictie; cele cu jurisdictie da', () => {
    expect(html).not.toContain('data-jurisdictie')
    const cuJurisdictie = renderToStaticMarkup(
      createElement(CorpDocument, {
        document: { introducere: '', sectiuni: [{ cheie: 'a', titlu: 'A', blocuri: [{ jurisdictie: 'md', paragrafe: ['x'] }] }] },
      }),
    )
    expect(cuJurisdictie).toContain('data-jurisdictie="md"')
  })

  it('locurile pentru CTA (dupa capsula, la final) primesc continutul paginii', () => {
    const cu = renderToStaticMarkup(
      createElement(CorpPagina, {
        pagina,
        dupaCapsula: createElement('p', { id: 'erou' }, 'erou'),
        final: createElement('p', { id: 'final' }, 'final'),
      }),
    )
    expect(cu.indexOf('id="erou"')).toBeGreaterThan(cu.indexOf('data-capsula'))
    expect(cu.indexOf('id="erou"')).toBeLessThan(cu.indexOf('<h2>'))
    expect(cu.indexOf('id="final"')).toBeGreaterThan(cu.lastIndexOf('</h2>'))
  })
})

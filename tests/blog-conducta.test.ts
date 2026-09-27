import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import Coperta, { COMPOZITII, alegeCompozitia, cuvinteCheie, dispersie } from '../src/components/blog/Coperta'
import PaginaArticol from '../src/components/blog/PaginaArticol'
import PaginaCategorie from '../src/components/blog/PaginaCategorie'
import PaginaListare from '../src/components/blog/PaginaListare'
import { progresLectura } from '../src/components/blog/BaraProgres'
import { nodArticol } from '../src/components/blog/date-structurate'
import { alegeInrudite, contorGasite, dataRo, filtreaza, numarArticole } from '../src/components/blog/format'
import { PE_PAGINA } from '../src/components/blog/ListareBlog'
import { metadataArticol, metadataCategorie, metadataListare } from '../src/components/blog/metadata'
import { abateriMetadata } from '../src/components/seo/metadata'
import { LINIUTE_INTERZISE, dataIso, valideazaAntet } from '../src/content/blog/antet'
import {
  EroareArticol,
  articolDinText,
  citesteArticolele,
  comparaArticole,
  indexRegistru,
  type ArticolComplet,
} from '../src/content/blog/conducta'
import { EroareCorp, minuteDeCitit, numaraCuvinte, parseazaCorp, parseazaInline } from '../src/content/blog/markdown'
import {
  ARTICOLE,
  CATEGORII_BLOG,
  ORDINE_CATEGORII,
  caiArticole,
  categoriiCuArticole,
  citesteIndexul,
  type ArticolBlog,
  type CategorieBlog,
} from '../src/content/blog/registru'
import { ARTICOL, CATEGORII, LISTARE } from '../src/content/blog/texte'
import { CAI_EXISTENTE } from '../src/content/cai'
import { RUTE } from '../src/content/rute'
import { citesteDeclaratiile, formaDeclaratiei } from './browser/ajutor/raspunsuri'

/**
 * Probele feliei `blog` care nu cer navigator: conducta de continut (antetul YAML al lotului, corpul
 * in Markdown, refuzurile), registrul si indexul lui, formatele (data, numarul de articole, cautarea
 * fara diacritice, inrudite), coperta generata, paginile randate pe server cu articole SINTETICE si
 * textele blogului.
 *
 * ARTICOLELE DE PROBA se asambleaza la rulare (`articolSintetic`), in formatul lotului de articole al
 * fabricii; nimic din ele nu ajunge in `src/`. Registrul real (primul lot, felia blog-articole) are
 * probele lui in `tests/blog-articole.test.ts`; o proba de mai jos cere ca indexul `articole.json` sa fie exact indexul fisierelor .mdx
 * de pe disc: cu `-u` il regenereaza.
 */

const RADACINA = resolve(__dirname, '..')
const LINIUTA_LUNGA = String.fromCharCode(0x2014)

// ---------------------------------------------------------------------------------------------
// Articole sintetice, in formatul lotului (antet YAML + corp Markdown + citat `**3S**` la final)
// ---------------------------------------------------------------------------------------------

type Sintetic = {
  slug: string
  titlu: string
  extras: string
  categorie: CategorieBlog
  data: string
  fapte?: string[]
  corp?: string
  extraAntet?: string
}

function antetYaml(a: Sintetic): string {
  const fapte = a.fapte ?? []
  return [
    '---',
    'slug: ' + a.slug,
    'titlu: "' + a.titlu + '"',
    'extras: "' + a.extras + '"',
    'categorie: ' + a.categorie,
    'data_verificarii: ' + a.data,
    fapte.length === 0 ? 'caseta_fapte: []' : 'caseta_fapte:\n' + fapte.map((f) => '  - "' + f + '"').join('\n'),
    'surse:',
    '  - url: https://legislatie.just.ro/Public/DetaliiDocument/' + (1000 + a.slug.length),
    '    ce_sustine: "Textul consolidat al actului normativ citat în articol"',
    '  - url: https://www.exemplu-oficial.test/pagina',
    '    ce_sustine: "Pagina autorității care publică procedura"',
    ...(a.extraAntet ? [a.extraAntet] : []),
    '---',
  ].join('\n')
}

const CORP_IMPLICIT = [
  'Primul paragraf spune pe scurt ce trebuie să știe o firmă și de ce contează **termenul** de păstrare.',
  'Rândul al doilea continuă același paragraf.',
  '',
  '## Ce spune legea',
  '',
  'Un paragraf cu o [legătură internă](/blog/alt-articol-de-proba), una [spre o pagină care nu există încă](/pagina-care-nu-exista-niciodata) și una [externă](https://legislatie.just.ro/Public/DetaliiDocument/1).',
  '',
  '1. Primul pas al procedurii.',
  '2. Al doilea pas, cu *accent* și `cod`.',
  '',
  '## Termenele pe tipuri de acte',
  '',
  '| Tip de document | Termen |',
  '|---|---|',
  '| Registre contabile | 10 ani |',
  '| Documente justificative | 5 ani |',
  '',
  '- un element de listă',
  '- alt element, care continuă',
  '  pe rândul următor',
  '',
  '> **3S** Textul casetei CTA scris de autor, cu răspunsul pe web și pe WhatsApp.',
].join('\n')

function articolSintetic(a: Sintetic): string {
  return antetYaml(a) + '\n\n' + (a.corp ?? CORP_IMPLICIT) + '\n'
}

const DOUASPREZECE: Sintetic[] = [
  { slug: 'pastrarea-facturilor-electronice', titlu: 'Păstrarea facturilor primite electronic', extras: 'Cum țineți facturile primite prin sistemul electronic, ca să le găsiți întregi și după câțiva ani de la primire.', categorie: 'contabilitate', data: '2026-09-12', fapte: ['Primul fapt, cu un termen și cu actul normativ din care vine.', 'Al doilea fapt, scurt.'] },
  { slug: 'registrul-jurnal-pas-cu-pas', titlu: 'Registrul jurnal și cartea mare, pas cu pas', extras: 'Ordinea în care se completează registrele contabile obligatorii și unde le păstrați după închiderea anului.', categorie: 'contabilitate', data: '2026-09-11' },
  { slug: 'extrasele-de-cont-la-inchidere', titlu: 'Extrasele de cont după închiderea exercițiului', extras: 'Ce faceți cu extrasele de cont după închiderea exercițiului financiar și cât timp rămân în arhiva firmei.', categorie: 'contabilitate', data: '2026-09-10' },
  { slug: 'statele-de-salarii-lunare', titlu: 'Statele de salarii și dosarul lunar al firmei', extras: 'Cum se adună statele de salarii într-un dosar lunar și de ce contează ordinea lor la un control al inspectorilor.', categorie: 'contabilitate', data: '2026-09-09' },
  { slug: 'nomenclatorul-arhivistic', titlu: 'Nomenclatorul arhivistic pentru o firmă mică', extras: 'Ce este nomenclatorul arhivistic, cine îl aprobă și cum îl folosiți ca să știți unde stă fiecare dosar al firmei.', categorie: 'juridic', data: '2026-09-08' },
  { slug: 'comisia-de-selectionare', titlu: 'Comisia de selecționare: cine face parte din ea', extras: 'Cine intră în comisia de selecționare a documentelor, ce semnează și ce pași urmează înainte de orice eliminare.', categorie: 'juridic', data: '2026-09-07' },
  { slug: 'predarea-la-arhiva-proprie', titlu: 'Predarea dosarelor la arhiva proprie a firmei', extras: 'Când se predau dosarele la arhiva proprie, cu ce acte de însoțire și cine semnează procesul-verbal de predare.', categorie: 'juridic', data: '2026-09-06' },
  { slug: 'inventarul-fondului-de-arhiva', titlu: 'Inventarul unui fond de arhivă, rând cu rând', extras: 'Coloanele inventarului unui fond de arhivă, cum se completează corect și câte exemplare trebuie să păstrați.', categorie: 'juridic', data: '2026-09-06' },
  { slug: 'actele-la-mutarea-sediului', titlu: 'Ce se întâmplă cu actele la mutarea sediului', extras: 'Pașii pentru arhiva firmei când se mută sediul: ce anunțați, ce mutați și cum păstrați evidența dosarelor mutate.', categorie: 'juridic', data: '2026-09-04' },
  { slug: 'scanarea-cu-text-recunoscut', titlu: 'Scanarea cu text recunoscut, explicată simplu', extras: 'Ce înseamnă scanarea cu text recunoscut, de ce contează la căutare și ce verificați la un document scanat vechi.', categorie: 'it', data: '2026-09-03' },
  { slug: 'denumirea-fisierelor-scanate', titlu: 'Denumirea fișierelor scanate într-o arhivă', extras: 'O regulă simplă de denumire a fișierelor scanate, ca un coleg nou să găsească orice act fără să întrebe pe nimeni.', categorie: 'it', data: '2026-09-02' },
  { slug: 'calendar-anual-pentru-arhiva', titlu: 'Un calendar anual pentru arhiva firmei', extras: 'Termenele care revin în fiecare an pentru arhiva unei firme mici, puse pe luni, ca să nu le aflați de la un control.', categorie: 'management', data: '2026-09-01' },
]

/** Articolele sintetice citite prin conducta reala, dintr-un dosar temporar. */
function citesteSintetice(lista: Sintetic[]): ArticolComplet[] {
  const baza = mkdtempSync(join(tmpdir(), 'blog-conducta-'))
  try {
    const dosar = join(baza, 'src', 'content', 'blog')
    mkdirSync(dosar, { recursive: true })
    for (const a of lista) writeFileSync(join(dosar, a.slug + '.mdx'), articolSintetic(a), 'utf8')
    return citesteArticolele(baza)
  } finally {
    rmSync(baza, { recursive: true, force: true })
  }
}

const SINTETICE = citesteSintetice(DOUASPREZECE)

function eroriArticol(text: string, fisier = 'proba.mdx'): string[] {
  try {
    articolDinText(text, fisier)
    return []
  } catch (e) {
    if (e instanceof EroareArticol) return e.erori
    throw e
  }
}

// ---------------------------------------------------------------------------------------------
// A. Corpul
// ---------------------------------------------------------------------------------------------

describe('corpul articolului (subsetul Markdown al lotului)', () => {
  const corp = parseazaCorp(CORP_IMPLICIT)

  it('citeste titlurile, paragrafele, listele, tabelul si caseta CTA', () => {
    const tipuri = corp.blocuri.map((b) => b.tip)
    expect(tipuri).toEqual(['paragraf', 'titlu', 'paragraf', 'lista', 'titlu', 'tabel', 'lista'])
    const titluri = corp.blocuri.filter((b) => b.tip === 'titlu')
    expect(titluri.map((t) => (t.tip === 'titlu' ? t.id : ''))).toEqual(['ce-spune-legea', 'termenele-pe-tipuri-de-acte'])
    const tabel = corp.blocuri.find((b) => b.tip === 'tabel')
    expect(tabel?.tip === 'tabel' && tabel.randuri.length).toBe(2)
    expect(tabel?.tip === 'tabel' && tabel.antet.length).toBe(2)
    expect(corp.cta).not.toBeNull()
    expect(JSON.stringify(corp.cta)).toContain('Textul casetei CTA')
    expect(JSON.stringify(corp.cta)).not.toContain('**')
  })

  it('lipeste randurile unui paragraf si ale unui element de lista cu un spatiu', () => {
    const p = corp.blocuri[0]
    expect(p.tip === 'paragraf' && JSON.stringify(p.copii)).toContain('contează ')
    const lista = corp.blocuri[6]
    expect(lista.tip === 'lista' && JSON.stringify(lista.elemente[1])).toContain('continuă pe rândul următor')
  })

  it('in linie: tare, accent, cod, legaturi si evadari', () => {
    expect(parseazaInline('a **b** c')).toEqual([
      { tip: 'text', text: 'a ' },
      { tip: 'tare', copii: [{ tip: 'text', text: 'b' }] },
      { tip: 'text', text: ' c' },
    ])
    expect(parseazaInline('*x* si _y_')[0]).toEqual({ tip: 'accent', copii: [{ tip: 'text', text: 'x' }] })
    expect(parseazaInline('`a*b*`')).toEqual([{ tip: 'cod', text: 'a*b*' }])
    expect(parseazaInline('[t](/blog/x)')).toEqual([{ tip: 'legatura', href: '/blog/x', copii: [{ tip: 'text', text: 't' }] }])
    expect(parseazaInline('art. 27^1 si 5 * 3 si nume_de_camp')).toEqual([{ tip: 'text', text: 'art. 27^1 si 5 * 3 si nume_de_camp' }])
    expect(parseazaInline('\\*nu e accent\\*')).toEqual([{ tip: 'text', text: '*nu e accent*' }])
    expect(parseazaInline('A &amp; B &#259;')).toEqual([{ tip: 'text', text: 'A & B ă' }])
    expect(parseazaInline('[a](https://x.test/p_(1))')[0]).toEqual({
      tip: 'legatura',
      href: 'https://x.test/p_(1)',
      copii: [{ tip: 'text', text: 'a' }],
    })
  })

  it('titlurile cu acelasi text primesc identificatori distincti', () => {
    const c = parseazaCorp('## Pași\n\ntext\n\n## Pași\n\nalt text')
    expect(c.blocuri.filter((b) => b.tip === 'titlu').map((b) => (b.tip === 'titlu' ? b.id : ''))).toEqual(['pasi', 'pasi-2'])
  })

  it('un citat care nu incepe cu **3S** ramane in corp, iar caseta CTA lipseste', () => {
    const c = parseazaCorp('Paragraf.\n\n> Un citat obișnuit.')
    expect(c.cta).toBeNull()
    expect(c.blocuri.map((b) => b.tip)).toEqual(['paragraf', 'citat'])
  })

  it('numara cuvintele corpului fara caseta CTA, iar minutele la 200 pe minut', () => {
    const scurt = parseazaCorp('Unu doi trei.\n\n> **3S** patru cinci')
    expect(numaraCuvinte(scurt)).toBe(3)
    expect(minuteDeCitit(0)).toBe(1)
    expect(minuteDeCitit(699)).toBe(3)
    expect(minuteDeCitit(700)).toBe(4)
  })

  const refuzuri: [string, string, RegExp][] = [
    ['h1', '# Titlu', /nivel 1/],
    ['titlu de nivel 5', '##### Mic', /nivel 5/],
    ['titlu subliniat', 'Titlu\n===', /subliniat/],
    ['JSX', '<Macheta varianta="a" />', /JSX sau HTML/],
    ['import', 'import X from "y"', /import/],
    ['expresie MDX', 'Suma este {2 + 2}.', /acolada/],
    ['eticheta in text', 'Scrieți <b>tare</b> aici.', /eticheta JSX/],
    ['lista imbricata', '- a\n  - b', /imbricata/],
    ['adresa javascript', '[x](javascript:alert(1))', /nepermisa/],
    ['adresa relativa', '[x](pagina.html)', /nepermisa/],
    ['cod neinchis', '```\ncod', /neinchis/],
  ]
  for (const [nume, text, motiv] of refuzuri) {
    it('refuza: ' + nume, () => {
      expect(() => parseazaCorp(text)).toThrow(EroareCorp)
      expect(() => parseazaCorp(text)).toThrow(motiv)
    })
  }
})

// ---------------------------------------------------------------------------------------------
// B. Antetul
// ---------------------------------------------------------------------------------------------

describe('antetul YAML al lotului', () => {
  const bun = DOUASPREZECE[0]

  it('martor NEGATIV: un articol in formatul lotului trece, cu data YAML citita ca zi', () => {
    const a = articolDinText(articolSintetic(bun), bun.slug + '.mdx')
    expect(a.slug).toBe(bun.slug)
    expect(a.dataVerificarii).toBe('2026-09-12')
    expect(a.dataPublicarii).toBe('2026-09-12')
    expect(a.casetaFapte).toHaveLength(2)
    expect(a.surse).toHaveLength(2)
    expect(a.cuvinte).toBe(numaraCuvinte(a.corp))
  })

  it('data_publicarii optionala muta publicarea, nu verificarea', () => {
    const a = articolDinText(articolSintetic({ ...bun, extraAntet: 'data_publicarii: 2026-08-30' }), bun.slug + '.mdx')
    expect(a.dataPublicarii).toBe('2026-08-30')
    expect(a.dataVerificarii).toBe('2026-09-12')
  })

  it('martor POZITIV: o liniuta lunga in titlu e refuzata (construita din cod, nu scrisa)', () => {
    const erori = eroriArticol(articolSintetic({ ...bun, titlu: 'Păstrarea facturilor ' + LINIUTA_LUNGA + ' ce spune legea' }), bun.slug + '.mdx')
    expect(erori.join(' ')).toContain('liniuta lunga')
    expect(LINIUTE_INTERZISE.test(LINIUTA_LUNGA)).toBe(true)
    expect(LINIUTE_INTERZISE.test('-')).toBe(false)
  })

  const cazuri: [string, Partial<Sintetic> & { text?: (t: string) => string }, RegExp][] = [
    ['slug diferit de fisier', { slug: 'alt-slug' }, /difera de numele fisierului/],
    ['titlu scurt', { titlu: 'Prea scurt' }, /`titlu` are 10 caractere/],
    ['extras scurt', { extras: 'Scurt.' }, /`extras` are 6 caractere/],
    ['categorie necunoscuta', { categorie: 'fiscal' as CategorieBlog }, /`categorie` trebuie/],
    ['camp necunoscut', { extraAntet: 'autor: Cineva' }, /camp necunoscut `autor`/],
    ['data invalida', { data: '2026-02-30' }, /data_verificarii/],
    ['fara surse', { text: (t) => t.replace(/surse:\n(?: {2}- url: .*\n {4}ce_sustine: .*\n)+/, 'surse: []\n') }, /cel putin o sursa/],
    ['antet executabil', { text: (t) => t.replace(/^---\n/, '---js\n') }, /antetul YAML lipseste/],
  ]
  for (const [nume, schimbare, motiv] of cazuri) {
    it('refuza: ' + nume, () => {
      const { text, ...camp } = schimbare
      const brut = articolSintetic({ ...bun, ...camp })
      const erori = eroriArticol(text ? text(brut) : brut, bun.slug + '.mdx')
      expect(erori.join(' | ')).toMatch(motiv)
    })
  }

  it('dataIso accepta obiecte Date si siruri, refuza zilele inexistente', () => {
    expect(dataIso(new Date(Date.UTC(2026, 8, 25)))).toBe('2026-09-25')
    expect(dataIso('2026-09-25')).toBe('2026-09-25')
    expect(dataIso('2026-13-01')).toBeNull()
    expect(dataIso(20260925)).toBeNull()
  })

  it('toate erorile se raporteaza deodata', () => {
    const r = valideazaAntet({ slug: 'X', titlu: 1, necunoscut: true }, 'y.mdx')
    expect(r.antet).toBeNull()
    expect(r.erori.length).toBeGreaterThanOrEqual(5)
  })
})

// ---------------------------------------------------------------------------------------------
// C. Conducta pe un dosar
// ---------------------------------------------------------------------------------------------

describe('conducta pe un dosar de articole', () => {
  it('citeste, valideaza si ordoneaza: cele mai noi primele, la aceeasi data dupa slug', () => {
    expect(SINTETICE).toHaveLength(12)
    expect(SINTETICE[0].slug).toBe('pastrarea-facturilor-electronice')
    const aceeasiZi = SINTETICE.filter((a) => a.dataPublicarii === '2026-09-06').map((a) => a.slug)
    expect(aceeasiZi).toEqual(['inventarul-fondului-de-arhiva', 'predarea-la-arhiva-proprie'])
    expect(comparaArticole({ data: '2026-01-01', slug: 'a' }, { data: '2026-01-02', slug: 'b' })).toBeGreaterThan(0)
  })

  it('refuza un .md pus in locul unui .mdx si doua articole cu acelasi titlu', () => {
    expect(() => citesteSintetice([{ ...DOUASPREZECE[1], titlu: DOUASPREZECE[0].titlu }, DOUASPREZECE[0]])).toThrow(/identic/)
    const baza = mkdtempSync(join(tmpdir(), 'blog-md-'))
    try {
      mkdirSync(join(baza, 'src', 'content', 'blog'), { recursive: true })
      writeFileSync(join(baza, 'src', 'content', 'blog', 'x.md'), articolSintetic(DOUASPREZECE[0]), 'utf8')
      expect(() => citesteArticolele(baza)).toThrow(/\.mdx, nu ca \.md/)
    } finally {
      rmSync(baza, { recursive: true, force: true })
    }
  })

  it('accepta fisiere cu CRLF si cu BOM', () => {
    const text = '﻿' + articolSintetic(DOUASPREZECE[2]).replace(/\n/g, '\r\n')
    expect(articolDinText(text, DOUASPREZECE[2].slug + '.mdx').titlu).toBe(DOUASPREZECE[2].titlu)
  })
})

// ---------------------------------------------------------------------------------------------
// D. Registrul si indexul lui
// ---------------------------------------------------------------------------------------------

describe('registrul blogului', () => {
  it('articole.json e indexul exact al fisierelor .mdx din src/content/blog (regenerat cu -u)', async () => {
    const index = indexRegistru(citesteArticolele(RADACINA))
    await expect(JSON.stringify(index, null, 2) + '\n').toMatchFileSnapshot('../src/content/blog/articole.json')
    expect(ARTICOLE).toEqual(index)
  })

  // Starea se deriva din registru, nu se scrie. De la primul lot (felia blog-articole) listarea si
  // categoriile sunt pagini statice in RUTE; articolele raman numai in registru.
  it('caile blogului: in RUTE exact listarea si categoriile deschise de registru, in caile existente tot ce deschide registrul', () => {
    const deschise = caiArticole()
    const faraArticole = deschise.filter((c) => !ARTICOLE.some((a) => c === '/blog/' + a.slug))
    expect(RUTE.filter((r) => r.cale.startsWith('/blog')).map((r) => r.cale)).toEqual(faraArticole)
    expect([...CAI_EXISTENTE].filter((c) => c.startsWith('/blog')).sort()).toEqual([...deschise].sort())
    expect(deschise.length === 0).toBe(ARTICOLE.length === 0)
  })

  it('cu articole, registrul deschide listarea, categoriile care au articole si articolele', () => {
    const index = indexRegistru(SINTETICE.filter((a) => a.categorie !== 'management'))
    const cai = caiArticole(index)
    expect(cai.slice(0, 4)).toEqual(['/blog', '/blog/categorie/contabilitate', '/blog/categorie/juridic', '/blog/categorie/it'])
    expect(cai).not.toContain('/blog/categorie/management')
    expect(cai.slice(4)).toEqual(index.map((a) => '/blog/' + a.slug))
    // Ordinea de afisare, nu ordinea slugurilor din plan (blog.md 3b: juridic a treia, IT a patra).
    expect(categoriiCuArticole(index)).toEqual(['contabilitate', 'juridic', 'it'])
  })

  it('un index stricat de mana opreste importul, cu intrarea numita', () => {
    expect(() => citesteIndexul([{ slug: 'a', titlu: 't', extras: 'e', categorie: 'fiscal', data: '2026-01-01' }])).toThrow(/intrarea 1/)
    expect(() => citesteIndexul({})).toThrow(/lista/)
  })

  it('categoriile sunt cele din plan', () => {
    expect([...CATEGORII_BLOG]).toEqual(['contabilitate', 'it', 'juridic', 'management'])
  })

  it('ordinea de afisare a pastilelor e cea masurata (blog.md 3b), cu aceleasi categorii', () => {
    expect([...ORDINE_CATEGORII]).toEqual(['contabilitate', 'juridic', 'it', 'management'])
    expect([...ORDINE_CATEGORII].sort()).toEqual([...CATEGORII_BLOG].sort())
  })
})

// ---------------------------------------------------------------------------------------------
// E. Formatele
// ---------------------------------------------------------------------------------------------

describe('formatele blogului', () => {
  it('data: ziua fara zero, luna cu litera mica', () => {
    expect(dataRo('2026-09-05')).toBe('5 septembrie 2026')
    expect(dataRo('2026-01-31')).toBe('31 ianuarie 2026')
  })

  it('numarul de articole, acordat', () => {
    const asteptat: [number, string][] = [
      [1, '1 articol'],
      [2, '2 articole'],
      [19, '19 articole'],
      [20, '20 de articole'],
      [21, '21 de articole'],
      [100, '100 de articole'],
      [101, '101 articole'],
      [119, '119 articole'],
      [120, '120 de articole'],
    ]
    for (const [n, text] of asteptat) expect(numarArticole(n)).toBe(text)
    expect(contorGasite(0)).toBe('Niciun articol găsit')
    expect(contorGasite(1)).toBe('1 articol găsit')
    expect(contorGasite(24)).toBe('24 de articole găsite')
  })

  const carduri = indexRegistru(SINTETICE)

  it('cautarea potriveste si fara diacritice, fara majuscule, pe titlu si extras', () => {
    expect(filtreaza(carduri, 'pastrarea', null).map((a) => a.slug)).toEqual(['pastrarea-facturilor-electronice'])
    expect(filtreaza(carduri, 'PĂSTRAREA', null)).toHaveLength(1)
    expect(filtreaza(carduri, 'selectionare', null).map((a) => a.slug)).toEqual(['comisia-de-selectionare'])
    expect(filtreaza(carduri, 'inspectorilor', null).map((a) => a.slug)).toEqual(['statele-de-salarii-lunare'])
    expect(filtreaza(carduri, '', null)).toHaveLength(12)
    expect(filtreaza(carduri, 'zzqq', null)).toEqual([])
  })

  it('filtrul de categorie se combina cu cautarea', () => {
    expect(filtreaza(carduri, '', 'it')).toHaveLength(2)
    expect(filtreaza(carduri, 'arhiva', 'juridic').every((a) => a.categorie === 'juridic')).toBe(true)
    expect(filtreaza(carduri, 'arhiva', 'juridic').length).toBeGreaterThan(0)
  })

  it('inrudite: intai aceeasi categorie, apoi celelalte, fiecare de la cel mai nou; niciodata articolul insusi', () => {
    const curent = carduri.find((a) => a.slug === 'nomenclatorul-arhivistic') as ArticolBlog
    expect(alegeInrudite(carduri, curent).map((a) => a.slug)).toEqual([
      'comisia-de-selectionare',
      'inventarul-fondului-de-arhiva',
      'predarea-la-arhiva-proprie',
    ])
    const singur = carduri.find((a) => a.categorie === 'management') as ArticolBlog
    expect(alegeInrudite(carduri, singur).map((a) => a.categorie)).toEqual(['contabilitate', 'contabilitate', 'contabilitate'])
    expect(alegeInrudite(carduri.slice(0, 2), carduri[0])).toHaveLength(1)
  })

  it('bara de progres: 0 inainte de corp, 1 la capatul lui, proportional intre', () => {
    expect(progresLectura(0, 1000, 3000, 900)).toBe(0)
    expect(progresLectura(1000 + 2100 / 2, 1000, 3000, 900)).toBeCloseTo(0.5, 5)
    expect(progresLectura(99999, 1000, 3000, 900)).toBe(1)
    expect(progresLectura(1200, 1000, 500, 900)).toBe(1)
  })
})

// ---------------------------------------------------------------------------------------------
// F. Coperta
// ---------------------------------------------------------------------------------------------

describe('coperta generata din titlu si categorie', () => {
  it('aceeasi intrare da aceeasi coperta; e decorativa', () => {
    const p = { titlu: DOUASPREZECE[4].titlu, categorie: DOUASPREZECE[4].categorie, slug: DOUASPREZECE[4].slug, data: '2026-09-08' }
    const a = renderToStaticMarkup(createElement(Coperta, p))
    expect(renderToStaticMarkup(createElement(Coperta, p))).toBe(a)
    expect(a).toContain('aria-hidden="true"')
    expect(a).toContain('viewBox="0 0 1200 630"')
    expect(dispersie('abc')).toBe(dispersie('abc'))
  })

  it('fiecare categorie are compozitiile ei, alese dupa slug', () => {
    for (const c of CATEGORII_BLOG) {
      const alese = new Set(Array.from({ length: 40 }, (_, i) => alegeCompozitia(c, 'slug-' + i)))
      expect([...alese].sort()).toEqual([...COMPOZITII[c]].sort())
    }
  })

  it('cuvintele-cheie: din titlu, fara cuvinte de legatura, cel mult 14 litere, completate din categorie', () => {
    const cuv = cuvinteCheie('Registrul de evidență al arhivei: ce cere legea', 'juridic')
    expect(cuv.map((c) => c.afisat)).toEqual(['registrul', 'evidență', 'arhivei', 'legea'])
    expect(cuv[1].ascii).toBe('evidenta')
    expect(cuvinteCheie('Un titlu', 'it', 4)).toHaveLength(4)
    expect(cuvinteCheie('Supercalifragilisticexpialidocious', 'it')[0].afisat.length).toBeLessThanOrEqual(14)
  })

  it('toate cele sase compozitii se randeaza fara erori', () => {
    const vazute = new Set<string>()
    for (const a of SINTETICE) {
      const html = renderToStaticMarkup(
        createElement(Coperta, { titlu: a.titlu, categorie: a.categorie, slug: a.slug, data: a.dataPublicarii }),
      )
      vazute.add(/data-compozitie="([a-z]+)"/.exec(html)?.[1] ?? '')
    }
    for (let i = 0; vazute.size < 6 && i < 200; i++) {
      for (const c of CATEGORII_BLOG) {
        const html = renderToStaticMarkup(createElement(Coperta, { titlu: 'Titlu de proba ' + i, categorie: c, slug: 'p-' + i, data: '2026-09-01' }))
        vazute.add(/data-compozitie="([a-z]+)"/.exec(html)?.[1] ?? '')
      }
    }
    expect([...vazute].sort()).toEqual(['cronologie', 'fisiere', 'flux', 'pictograma', 'tabel', 'tipografica'])
  })
})

// ---------------------------------------------------------------------------------------------
// G. Paginile, randate pe server cu cele 12 articole sintetice
// ---------------------------------------------------------------------------------------------

function blocuriJsonLd(html: string): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]))
}

function noduri(blocuri: Record<string, unknown>[]): Record<string, unknown>[] {
  return blocuri.flatMap((b) => (Array.isArray(b['@graph']) ? (b['@graph'] as Record<string, unknown>[]) : [b]))
}

describe('pagina /blog (sablonul L), cu 12 articole sintetice', () => {
  const html = renderToStaticMarkup(createElement(PaginaListare, { articole: SINTETICE }))

  it('un singur h1, firul centrat pe 2 niveluri, subtitlul', () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toContain(LISTARE.titlu)
    expect(html).toContain(LISTARE.subtitlu)
    const fir = noduri(blocuriJsonLd(html)).filter((n) => n['@type'] === 'BreadcrumbList')
    expect(fir).toHaveLength(1)
    expect((fir[0].itemListElement as unknown[]).length).toBe(2)
  })

  it('HTML-ul servit are primele 9 carduri si butonul pentru restul', () => {
    expect(PE_PAGINA).toBe(9)
    expect(html.match(/data-card="L"/g)).toHaveLength(9)
    expect(html).toContain(LISTARE.maiMulte)
    expect(html).toContain('Păstrarea facturilor primite electronic')
    expect(html).not.toContain('>Un calendar anual pentru arhiva firmei</a>')
  })

  it('cautarea are eticheta si pastilele sunt legaturi reale spre categoriile cu articole', () => {
    expect(html).toContain('<label for="cautare-blog" class="doar-cititor">' + LISTARE.etichetaCautare + '</label>')
    // Pastilele raman pe listare (`?categorie=`): o legatura spre alt pathname ar fi preluata de tranzitia
    // de vedere a site-ului si ar duce pe pagina categoriei in loc sa filtreze.
    for (const c of CATEGORII_BLOG) expect(html).toContain('href="/blog?categorie=' + c + '"')
    expect(html).not.toContain('href="/blog/categorie/')
    expect(html).toContain('aria-current="true"')
  })

  it('JSON-LD: lista cu TOATE cele 12 articole, in ordinea listarii', () => {
    const lista = noduri(blocuriJsonLd(html)).find((n) => n['@type'] === 'ItemList') as Record<string, unknown>
    expect(lista.numberOfItems).toBe(12)
    expect((lista.itemListElement as { url: string }[])[0].url).toMatch(/\/blog\/pastrarea-facturilor-electronice$/)
  })
})

describe('pagina unei categorii (sablonul C), cu 12 articole sintetice', () => {
  const html = renderToStaticMarkup(createElement(PaginaCategorie, { categorie: 'juridic', articole: SINTETICE }))

  it('eticheta, h1 = numele categoriei, fir pe 3 niveluri', () => {
    expect(html.match(/<h1[^>]*>([^<]*)<\/h1>/)?.[1]).toBe(CATEGORII.juridic.nume)
    expect(html).toContain('>Categorie</span>')
    const fir = noduri(blocuriJsonLd(html)).filter((n) => n['@type'] === 'BreadcrumbList')
    expect(fir).toHaveLength(1)
    expect((fir[0].itemListElement as unknown[]).length).toBe(3)
  })

  it('toate articolele categoriei, cu contorul si pastila activa', () => {
    expect(html.match(/data-card="C"/g)).toHaveLength(5)
    expect(html).toContain('>5 articole<')
    expect(html).toMatch(/<a(?=[^>]*href="\/blog\/categorie\/juridic")(?=[^>]*aria-current="page")[^>]*>/)
    expect(html).not.toContain(LISTARE.maiMulte)
    expect(html).not.toContain('cautare-blog')
  })
})

describe('pagina unui articol, cu 12 articole sintetice', () => {
  const articol = SINTETICE.find((a) => a.slug === 'pastrarea-facturilor-electronice') as ArticolComplet
  const html = renderToStaticMarkup(createElement(PaginaArticol, { articol, toate: SINTETICE }))
  const ld = noduri(blocuriJsonLd(html))

  it('un h1, firul pe 3 niveluri cu titlul intreg, randul meta, coperta', () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    const fir = ld.filter((n) => n['@type'] === 'BreadcrumbList')
    expect(fir).toHaveLength(1)
    const niveluri = fir[0].itemListElement as { name: string }[]
    expect(niveluri.map((n) => n.name)).toEqual(['Acasă', 'Blog', articol.titlu])
    expect(html).toMatch(/<time [^>]*2026-09-12[^>]*>12 septembrie 2026<\/time>/i)
    expect(html).toContain(ARTICOL.autor)
    expect(html).toContain('min de citit')
    expect(html).toContain('viewBox="0 0 1200 630"')
  })

  it('caseta de fapte, corpul cu tabel si liste, sursele sub articol', () => {
    expect(html).toContain(ARTICOL.fapte)
    expect(html.match(/<table/g)).toHaveLength(1)
    expect(html).toContain('<ol>')
    expect(html).toContain(ARTICOL.surse)
    expect(html.match(/rel="noopener"/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('legaturile interne trec prin Tinta: o ruta care nu exista ramane inerta', () => {
    // Ruta fabricata, care nu va exista niciodata (26.09): /solutii/avocatura, folosita inainte, exista pe lotul S4-4a,
    // deci proba cerea ca o felie vecina sa lipseasca (rularea CI 36250013439).
    expect(CAI_EXISTENTE.has('/pagina-care-nu-exista-niciodata')).toBe(false)
    expect(html).toContain('data-tinta-lipsa="/pagina-care-nu-exista-niciodata"')
    expect(html).not.toContain('href="/pagina-care-nu-exista-niciodata"')
    expect(html).toContain('data-tinta-lipsa="/blog/alt-articol-de-proba"')
  })

  it('caseta CTA ia textul autorului; butonul spre /inregistrare e inert cat timp pagina lipseste, legatura cand exista', () => {
    expect(html).toContain('Textul casetei CTA scris de autor')
    expect(html).toContain(ARTICOL.cta.titlu)
    // Ramura dupa CAI_EXISTENTE (26.09): felia conversie adauga /inregistrare, iar forma veche picea pe lotul S4-4a.
    expect(html).toContain(CAI_EXISTENTE.has('/inregistrare') ? 'href="/inregistrare"' : 'data-tinta-lipsa="/inregistrare"')
  })

  it('trei articole inrudite, cu titlul pe h3 sub h2', () => {
    expect(html.match(/data-card="inrudit"/g)).toHaveLength(3)
    expect(html).toContain(ARTICOL.inrudite)
  })

  it('JSON-LD BlogPosting: wordCount numarat pe corp, autor si editor prin @id, sursele citate', () => {
    const post = ld.find((n) => n['@type'] === 'BlogPosting') as Record<string, unknown>
    expect(post.wordCount).toBe(articol.cuvinte)
    expect(post.headline).toBe(articol.titlu)
    expect(post.datePublished).toBe('2026-09-12')
    expect((post.author as { '@id': string })['@id']).toMatch(/#organizatie$/)
    expect(post.citation).toEqual(articol.surse.map((s) => s.url))
    expect(nodArticol(articol, 'X', 'https://exemplu.test')['@id']).toBe('https://exemplu.test/blog/pastrarea-facturilor-electronice#articol')
  })

  it('fara date de firma, fara liniute lungi, fara numele firmei-mame in paginile randate', () => {
    const toate = html + renderToStaticMarkup(createElement(PaginaListare, { articole: SINTETICE }))
    for (const n of ld) for (const k of ['address', 'telephone', 'taxID', 'legalName']) expect(n).not.toHaveProperty(k)
    expect(LINIUTE_INTERZISE.test(toate)).toBe(false)
    expect(toate.toLowerCase()).not.toContain(['ad', 'ria'].join(''))
  })
})

describe('metadata paginilor', () => {
  it('listarea, categoriile si articolul au titluri si descrieri in pragurile portii, unice', () => {
    const date = [
      { titlu: LISTARE.titluPagina, descriere: LISTARE.descriere, cale: '/blog' },
      ...CATEGORII_BLOG.map((c) => ({ titlu: CATEGORII[c].titluPagina, descriere: CATEGORII[c].descriere, cale: '/blog/categorie/' + c })),
    ]
    for (const d of date) expect(abateriMetadata(d), d.cale).toEqual([])
    expect(new Set(date.map((d) => d.titlu)).size).toBe(date.length)
    expect(new Set(date.map((d) => d.descriere)).size).toBe(date.length)
    expect(metadataListare().alternates?.canonical).toBe('/blog')
    expect(metadataCategorie('it').alternates?.canonical).toBe('/blog/categorie/it')
  })

  it('articolul: titlul fara marca, descrierea = extrasul, Open Graph de articol', () => {
    const a = SINTETICE[0]
    const m = metadataArticol(a)
    expect(m.title).toEqual({ absolute: a.titlu })
    expect(m.description).toBe(a.extras)
    expect(m.alternates?.canonical).toBe('/blog/' + a.slug)
    expect(m.openGraph).toMatchObject({ type: 'article', publishedTime: a.dataPublicarii, url: '/blog/' + a.slug })
    expect((m.openGraph as { images?: unknown[] }).images?.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------------------------
// H. Textele blogului
// ---------------------------------------------------------------------------------------------

describe('textele blogului', () => {
  const toate = JSON.stringify({ LISTARE, CATEGORII, ARTICOL })

  // Adresarea e "tu" pe blog (decizia D15, 26.09): "dumneavoastra" ramane doar in documentele juridice.
  it('doar cratima, diacritice cu virgula, adresare cu tu', () => {
    expect(LINIUTE_INTERZISE.test(toate)).toBe(false)
    expect(/[şţŞŢ]/.test(toate)).toBe(false)
    const cuvinte = new Set(toate.toLowerCase().split(/[^\p{L}]+/u))
    for (const formal of ['dumneavoastră', 'vă', 'vi']) expect(cuvinte.has(formal), formal).toBe(false)
  })

  it('butonul casetei CTA incape pe un rand in 302 px la 390 (la referinta se rupe)', () => {
    // 16/600: ~9,6 px pe litera masurat pe fontul site-ului in capturile S4-1; 302 - 2 x 32 padding = 238 px.
    expect(ARTICOL.cta.buton.text.length * 9.6).toBeLessThanOrEqual(238)
  })

  it('legaturile secundare din caseta CTA au textul din navigatia site-ului', () => {
    for (const c of CATEGORII_BLOG) {
      expect(CATEGORII[c].legaturaCta.href).toBe(CATEGORII[c].legaturaCta.ruta)
      expect(CATEGORII[c].legaturaCta.text.length).toBeGreaterThan(3)
    }
  })

  it('niciun nume al firmei-mame si niciun nume de producator de sisteme in textele blogului', () => {
    const mic = toate.toLowerCase()
    expect(mic).not.toContain(['ad', 'ria'].join(''))
    for (const n of [['mac', 'os'], ['i', 'os'], ['app', ' store']]) expect(mic).not.toContain(n.join(''))
  })
})

// ---------------------------------------------------------------------------------------------
// I. Declaratia GEO pregatita (config/seo/blog.json)
// ---------------------------------------------------------------------------------------------

describe('declaratia GEO a blogului', () => {
  const cale = join(RADACINA, 'config', 'seo', 'blog.json')
  const fisier = JSON.parse(readFileSync(cale, 'utf8')) as { raspuns_autonom: Record<string, unknown> }

  it('fisierul declara exact rutele blogului din RUTE, iar cititorul nu gaseste abateri', () => {
    expect(existsSync(cale)).toBe(true)
    const declarate = Object.keys(fisier.raspuns_autonom).filter((k) => !k.startsWith('_'))
    expect(declarate.sort()).toEqual(RUTE.filter((r) => r.cale.startsWith('/blog')).map((r) => r.cale).sort())
    const r = citesteDeclaratiile(RADACINA, RUTE.map((x) => x.cale))
    expect(r.abateri).toEqual([])
  })

  it('fiecare declaratie are forma ceruta de proba G-AI-02', () => {
    for (const d of Object.values(fisier.raspuns_autonom)) expect(formaDeclaratiei(d)).toBe(true)
  })
})

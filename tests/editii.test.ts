import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RadacinaEn, { metadata as metadataEn } from '../src/app/(en)/layout.en'
import RadacinaRoMd, { metadata as metadataRoMd } from '../src/app/(romd)/layout.romd'
import NegasitGlobalEn from '../src/app/global-not-found.en'
import { ECHIVALENTE } from '../src/content/echivalente'
import { familieJuridica } from '../src/content/juridic/familie'
import { RUTE_EN } from '../src/content/rute-en'
import { RUTE_EN_JURIDIC, ruteJuridiceEn } from '../src/content/rute-en-juridic'
import { RUTE_EN_NUCLEU } from '../src/content/rute-en-nucleu'
import { RUTE_EN_PRODUS } from '../src/content/rute-en-produs'
import { RUTE_EN_REFERINTA } from '../src/content/rute-en-referinta'
import { RUTE_EN_SEGMENTE } from '../src/content/rute-en-segmente'
import { RUTE_RO_MD, ruteJuridiceRoMd } from '../src/content/rute-ro-md'
import { ruteleEditiilor } from '../src/content/rute'
import {
  EDITII,
  cuNegasitGlobal,
  editiiDinText,
  extensiiPagini,
  origineSite,
  perechiAlternate,
  problemeCoerenta,
} from '../src/lib/editii'
import { surseleRutei } from '../src/lib/istoric-git'
import { citesteOperator, operatorComplet } from '../src/lib/operator'
import { alternateSite } from '../src/lib/site'
import { citesteDeclaratiile } from './browser/ajutor/raspunsuri'

/**
 * FUNDATIA EDITIILOR (`src/lib/editii.ts`): profilul din `SITE_EDITII`, catalogul, coerenta cu `SITE_ALTERNATE`,
 * manifestul pe editie, layout-urile radacina EN si RO-MD, pagina de negasit EN, profilul aplicatiei 3s.md si
 * cititorul declaratiilor G-AI-02 pe mai multe manifeste.
 *
 * Invarianta build-ului romanesc e in `tests/invarianta-ro.test.ts`. Comportamentul SERVIT al build-ului 3s.md
 * (404 peste tot, limba, antetul de neindexare, harta fara blog, calendarul RO stins) e masurat de ultimul bloc,
 * care ruleaza numai in jobul CI "Profil 3s.md", pe serverul build-ului facut cu `config/profil-3s-md.json`
 * (adresa in `EDITII_ADRESA`).
 *
 * Fisierul ruleaza si in jobul obisnuit (fara `SITE_EDITII`), si in jobul 3s.md (cu `SITE_EDITII=en,ro-MD`):
 * de aceea nicio asteptare de mai jos nu depinde de profilul din mediu, in afara de blocul serverului.
 *
 * FONTURILE. Layout-urile editiilor si pagina de negasit EN importa `src/lib/fonturi.ts`, iar `next/font` ruleaza
 * numai in compilatorul Next: in vitest functiile lui nu exista si importul ar pica inainte de orice caz. Proba le
 * inlocuieste cu forma minima pe care o citesc layout-urile (`variable`); aspectul fonturilor nu e masurat aici.
 */
vi.mock('next/font/google', () => {
  const font = (optiuni: { variable: string }) => ({ variable: optiuni.variable, className: '', style: { fontFamily: '' } })
  return { Plus_Jakarta_Sans: font, JetBrains_Mono: font, Marck_Script: font }
})

const RADACINA = join(__dirname, '..')
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as Record<string, unknown>
const textProfil = (cheie: string): string => {
  const v = PROFIL[cheie]
  return typeof v === 'string' ? v : JSON.stringify(v)
}

describe('catalogul editiilor', () => {
  it('ro-RO, en si ro-MD cu prefixul, sufixul, limba, og:locale si inLanguage cerute', () => {
    expect(EDITII['ro-RO']).toMatchObject({ prefix: '', sufix: 'tsx', lang: 'ro', ogLocale: 'ro_RO', inLanguage: 'ro-RO' })
    expect(EDITII.en).toMatchObject({ prefix: '', sufix: 'en.tsx', lang: 'en', ogLocale: 'en_US', inLanguage: 'en' })
    expect(EDITII['ro-MD']).toMatchObject({ prefix: '/ro', sufix: 'romd.tsx', lang: 'ro', ogLocale: 'ro_MD', inLanguage: 'ro-MD' })
  })
})

describe('profilul din SITE_EDITII', () => {
  it('lipsa sau gol = ro-RO, ca inainte de editii', () => {
    expect(editiiDinText(undefined)).toEqual(['ro-RO'])
    expect(editiiDinText('')).toEqual(['ro-RO'])
    expect(editiiDinText('  ,  ')).toEqual(['ro-RO'])
  })

  it('profilurile admise, in ordinea canonica, cu registrul normalizat', () => {
    expect(editiiDinText('ro-RO')).toEqual(['ro-RO'])
    expect(editiiDinText('en')).toEqual(['en'])
    expect(editiiDinText('ro-md, EN')).toEqual(['en', 'ro-MD'])
  })

  it('martor POZITIV: cod necunoscut, cod repetat, doua radacini, ro-RO cu ro-MD si ro-MD fara en opresc construirea', () => {
    expect(() => editiiDinText('fr')).toThrow(/editia "fr" nu exista/)
    expect(() => editiiDinText('en,en')).toThrow(/apare de doua ori/)
    expect(() => editiiDinText('ro-RO,en')).toThrow(/amandoua sunt la radacina/)
    expect(() => editiiDinText('ro-RO,ro-MD')).toThrow(/se construieste singur/)
    expect(() => editiiDinText('ro-MD')).toThrow(/numai impreuna cu en/)
  })

  it('pageExtensions: lista de dinainte de editii pe ro-RO; pe 3s.md fara tsx simplu', () => {
    expect(extensiiPagini(['ro-RO'])).toEqual(['ts', 'tsx', 'md', 'mdx'])
    expect(extensiiPagini(['en', 'ro-MD'])).toEqual(['en.tsx', 'romd.tsx', 'ts', 'md', 'mdx'])
    expect(extensiiPagini(['en', 'ro-MD'])).not.toContain('tsx')
    expect(cuNegasitGlobal(['ro-RO'])).toBe(false)
    expect(cuNegasitGlobal(['en', 'ro-MD'])).toBe(true)
  })
})

describe('next.config.ts pe profil', () => {
  const salvat = { ...process.env }
  afterEach(() => {
    for (const k of Object.keys(process.env)) if (!(k in salvat)) delete process.env[k]
    Object.assign(process.env, salvat)
    vi.resetModules()
  })

  const configurare = async (mediu: Record<string, string | undefined>) => {
    for (const k of ['SITE_EDITII', 'NEXT_PUBLIC_SITE_EDITII', 'SITE_URL', 'SITE_ALTERNATE', 'OPERATOR_JSON']) delete process.env[k]
    for (const [k, v] of Object.entries(mediu)) if (v !== undefined) process.env[k] = v
    vi.resetModules()
    return (await import('../next.config')).default as { pageExtensions?: string[]; experimental?: Record<string, unknown>; env?: Record<string, string> }
  }

  it('fara SITE_EDITII: extensiile de azi, nicio cheie experimental, nicio cheie de editii in env (browserul cade pe ro-RO)', async () => {
    const c = await configurare({})
    expect(c.pageExtensions).toEqual(['ts', 'tsx', 'md', 'mdx'])
    expect(c.experimental).toBeUndefined()
    expect(c.env !== undefined && 'NEXT_PUBLIC_SITE_EDITII' in c.env).toBe(false)
  })

  it('martor POZITIV: NEXT_PUBLIC_SITE_EDITII pusa de mana, diferita de profil, opreste construirea; egala, trece', async () => {
    await expect(configurare({ NEXT_PUBLIC_SITE_EDITII: 'en,ro-MD' })).rejects.toThrow(/nu se seteaza de mana/)
    expect((await configurare({ NEXT_PUBLIC_SITE_EDITII: 'en,ro-MD', SITE_EDITII: 'en,ro-MD' })).env?.NEXT_PUBLIC_SITE_EDITII).toBe('en,ro-MD')
  })

  it('cu profilul 3s.md: extensiile editiilor, globalNotFound pornit, NEXT_PUBLIC_SITE_EDITII=en,ro-MD', async () => {
    const c = await configurare({ SITE_EDITII: textProfil('SITE_EDITII'), SITE_URL: textProfil('SITE_URL'), SITE_ALTERNATE: textProfil('SITE_ALTERNATE') })
    expect(c.pageExtensions).toEqual(['en.tsx', 'romd.tsx', 'ts', 'md', 'mdx'])
    expect(c.experimental).toEqual({ globalNotFound: true })
    expect(c.env?.NEXT_PUBLIC_SITE_EDITII).toBe('en,ro-MD')
  })

  it('martor POZITIV: SITE_EDITII uitata pe 3s.md, cu alternatele domeniului, opreste construirea', async () => {
    await expect(configurare({ SITE_URL: textProfil('SITE_URL'), SITE_ALTERNATE: textProfil('SITE_ALTERNATE') })).rejects.toThrow(
      /SITE_ALTERNATE numeste acest site \(https:\/\/3s\.md\) pentru limba en/,
    )
  })
})

describe('coerenta cu SITE_ALTERNATE (cand SITE_EDITII lipseste)', () => {
  const LISTA = perechiAlternate('ro-RO=https://3s.com.ro,en=https://3s.md,ro-MD=https://3s.md/ro,x-default=https://3s.md')

  it('pe domeniul romanesc, profilul implicit e coerent', () => {
    expect(problemeCoerenta(['ro-RO'], LISTA, 'https://3s.com.ro', false)).toEqual([])
  })

  it('martor POZITIV: pe 3s.md, profilul implicit (romanesc) iese cu cate o problema pentru en si pentru ro-MD', () => {
    const p = problemeCoerenta(['ro-RO'], LISTA, 'https://3s.md', false)
    expect(p).toHaveLength(2)
    expect(p[0]).toContain('pentru limba en')
    expect(p[1]).toContain('https://3s.md/ro')
  })

  it('martor NEGATIV: pe 3s.md, cu editiile domeniului, nimic; un profil scris explicit nu se compara', () => {
    expect(problemeCoerenta(['en', 'ro-MD'], LISTA, 'https://3s.md', false)).toEqual([])
    expect(problemeCoerenta(['ro-RO'], LISTA, 'https://3s.md', true)).toEqual([])
  })

  it('prefixul conteaza: ro-MD la radacina lui 3s.md nu e editia ro-MD', () => {
    const gresit = perechiAlternate('en=https://3s.md,ro-MD=https://3s.md')
    expect(problemeCoerenta(['en', 'ro-MD'], gresit, 'https://3s.md', false)).toHaveLength(1)
  })

  it('citirea listei si a originii: perechi cu prefix fara bara finala, intrarile fara forma sarite', () => {
    expect(perechiAlternate('en=https://3s.md/, ro-MD = https://3s.md/ro/ ,gunoi,x=nu-e-adresa')).toEqual([
      { hreflang: 'en', adresa: 'https://3s.md' },
      { hreflang: 'ro-MD', adresa: 'https://3s.md/ro' },
    ])
    expect(origineSite(undefined)).toBeNull()
    expect(origineSite('https://3s.md/')).toBe('https://3s.md')
  })
})

describe('manifestul de rute pe editie', () => {
  it('pe ro-RO, rutele romanesti de dinainte de editii (element cu element: tests/invarianta-ro.test.ts); pe 3s.md, niciuna', () => {
    const ro = ruteleEditiilor(['ro-RO'])
    const asteptat = JSON.parse(readFileSync(join(RADACINA, 'tests', 'fixturi', 'invarianta-ro', 'rute-ro.json'), 'utf8')) as unknown[]
    expect(JSON.parse(JSON.stringify(ro))).toEqual(asteptat)
    expect(ruteleEditiilor(['en', 'ro-MD'])).toEqual([...RUTE_EN, ...RUTE_RO_MD])
    expect(ruteleEditiilor(['en', 'ro-MD']).some((r) => ro.includes(r))).toBe(false)
  })

  it('rutele EN intra numai prin grupuri, fiecare fisier cu marcajul feliei care il umple; echivalentele leaga numai rute ale editiilor', () => {
    // La fundatie (felia 75) cazul cerea fisierele EN si RO-MD si echivalentele GOALE: o constatare de stare, care
    // s-a inrosit corect la prima felie care a umplut un grup (80, paginile juridice 3s.md). Ce apara cazul, si
    // ramane: agregatorul EN nu scrie rute, fiecare fisier de grup isi pastreaza marcajul, iar o pereche din
    // echivalente nu trimite spre o cale pe care editia ei n-o are. Un grup inca gol nu se mai cere gol aici: o
    // lista scrisa de mana s-ar inrosi la fiecare felie care isi umple grupul, iar o ruta fara pagina o opreste
    // poarta de rute. Exactitatea grupului juridic e in `tests/juridic-3s-md.test.ts`.
    expect(RUTE_EN).toEqual([...RUTE_EN_NUCLEU, ...RUTE_EN_PRODUS, ...RUTE_EN_SEGMENTE, ...RUTE_EN_REFERINTA, ...RUTE_EN_JURIDIC])
    // Manifestele editiilor cu familia md publicata, oricare ar fi profilul din mediu (jobul obisnuit nu o are).
    const caiPeEditie: Record<string, string[]> = {
      'ro-RO': ruteleEditiilor(['ro-RO']).map((r) => r.cale),
      en: [...RUTE_EN, ...ruteJuridiceEn(true, 'md')].map((r) => r.cale),
      'ro-MD': [...RUTE_RO_MD, ...ruteJuridiceRoMd(true, 'md')].map((r) => r.cale),
    }
    const orfane = (tabel: Readonly<Record<string, Record<string, string | undefined>>>): string[] => {
      const iesire: string[] = []
      for (const [cheie, cai] of Object.entries(tabel)) {
        const editii = Object.entries(cai).filter(([, cale]) => cale !== undefined)
        if (editii.length < 2) iesire.push(cheie + ': o singura editie')
        for (const [editie, cale] of editii) {
          if (!(caiPeEditie[editie] ?? []).includes(cale as string)) iesire.push(cheie + ': ' + editie + ' ' + cale)
        }
      }
      return iesire
    }
    // martor POZITIV: o pereche spre cai inexistente si una cu o singura editie sunt prinse
    expect(orfane({ x: { en: '/nu-exista', 'ro-MD': '/ro/nu-exista' }, y: { en: ruteJuridiceEn(true, 'md')[0].cale } })).toEqual([
      'x: en /nu-exista',
      'x: ro-MD /ro/nu-exista',
      'y: o singura editie',
    ])
    expect(orfane(ECHIVALENTE)).toEqual([])
    const marcaj = (felie: string) => '// <<' + 'felie:' + felie + '>>'
    const grupuri: Record<string, string> = { nucleu: 'en-nucleu', produs: 'en-produs', segmente: 'en-segmente', referinta: 'en-referinta', juridic: 'juridic-pagini-3s-md' }
    for (const [grup, felie] of Object.entries(grupuri)) {
      expect(readFileSync(join(RADACINA, 'src', 'content', 'rute-en-' + grup + '.ts'), 'utf8'), grup).toContain(marcaj(felie))
    }
    expect(readFileSync(join(RADACINA, 'src', 'content', 'rute-ro-md.ts'), 'utf8')).toContain(marcaj('juridic-pagini-3s-md'))
  })

  it('istoricul git gaseste pagina EN sub (en) si pagina RO-MD sub (romd), cu modulul de continut (lastmod)', () => {
    const d = mkdtempSync(join(tmpdir(), 'editii-surse-'))
    const scrie = (rel: string, text: string) => {
      mkdirSync(dirname(join(d, rel)), { recursive: true })
      writeFileSync(join(d, rel), text, 'utf8')
    }
    try {
      scrie('src/app/(en)/pricing/page.en.tsx', 'import { X } from "@/content/en/pricing";\n')
      scrie('src/content/en/pricing.ts', 'export const X = 1\n')
      scrie('src/app/(romd)/ro/juridic/page.romd.tsx', 'x')
      scrie('src/app/preturi/page.tsx', 'x')
      expect(surseleRutei('/pricing', d, 'en')).toEqual(['src/app/(en)/pricing/page.en.tsx', 'src/content/en/pricing.ts'])
      expect(surseleRutei('/ro/juridic', d, 'ro-MD')).toEqual(['src/app/(romd)/ro/juridic/page.romd.tsx'])
      expect(surseleRutei('/preturi', d)).toEqual(['src/app/preturi/page.tsx'])
      // martor NEGATIV: o ruta EN nu ia pagina romaneasca, iar una romaneasca nu ia pagina EN
      expect(surseleRutei('/preturi', d, 'en')).toEqual([])
      expect(surseleRutei('/pricing', d)).toEqual([])
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  })
})

describe('layout-urile radacina si pagina de negasit (proba-sora a celei din tests/juridic.test.ts pe layout-ul RO)', () => {
  it('layout.en.tsx randeaza <html lang="en">, cu og:locale en_US din catalog', () => {
    const html = renderToStaticMarkup(createElement(RadacinaEn, null, createElement('p', null, 'x')))
    // Layout-ul monteaza antetul si subsolul editiei in jurul copiilor, deci se masoara limba si prezenta copiilor,
    // nu un corp care contine numai copiii.
    expect(html).toMatch(/^<html lang="en"[^>]*>/)
    expect(html).toContain('<p>x</p>')
    expect(metadataEn.openGraph).toMatchObject({ locale: 'en_US' })
  })

  it('layout.romd.tsx randeaza <html lang="ro">, cu og:locale ro_MD', () => {
    expect(renderToStaticMarkup(createElement(RadacinaRoMd, null, 'x'))).toMatch(/^<html lang="ro"[^>]*>/)
    expect(metadataRoMd.openGraph).toMatchObject({ locale: 'ro_MD' })
  })

  it('global-not-found.en.tsx: <html lang="en">, titlul in engleza, fara diacritice (in afara listei albe)', () => {
    const html = renderToStaticMarkup(createElement(NegasitGlobalEn))
    expect(html).toMatch(/^<html lang="en"[^>]*>/)
    expect(html).toContain('<h1>Page not found</h1>')
    // Lista alba explicita, pe TOATA pagina (antetul si subsolul inclusiv, nu numai <main>): semnul dreptului de
    // autor din subsol si textul legaturii in romana spre informatiile legale (legatura e in limba operatorului, pe
    // fiecare pagina EN, si apare cand ruta exista). Orice alt caracter in afara ASCII e text romanesc scapat in
    // piesele EN - de pilda o eticheta de buton ramasa in romana.
    const PERMISE = ['©', 'Informații legale']
    const ramas = PERMISE.reduce((text, permis) => text.split(permis).join(''), html)
    expect(/[^\x20-\x7e]/.test(ramas)).toBe(false)
    // martor: subsolul chiar e pe pagina (randul drepturilor de autor), deci lista alba are pe ce sa lucreze
    expect(html).toContain('©')
  })
})

describe('profilul aplicatiei 3s.md (config/profil-3s-md.json)', () => {
  it('editiile en si ro-MD, adresa 3s.md, mediul de proba', () => {
    expect(editiiDinText(textProfil('SITE_EDITII'))).toEqual(['en', 'ro-MD'])
    expect(textProfil('SITE_URL')).toBe('https://3s.md')
    expect(textProfil('SITE_ENV')).toBe('staging')
  })

  it('OPERATOR_JSON: "model":"D2" la radacina, langa operator; operatorul se citeste, e complet si e din familia md', () => {
    const brut = JSON.parse(textProfil('OPERATOR_JSON')) as Record<string, unknown>
    expect(brut.model).toBe('D2')
    expect(Object.keys(brut.operator as object)).not.toContain('model')
    const operator = citesteOperator(brut, 'OPERATOR_JSON')
    expect(operatorComplet(operator)).toBe(true)
    expect(familieJuridica(operator!)).toBe('md')
  })

  it('SITE_ALTERNATE: valida pentru baza 3s.md si coerenta cu editiile, chiar si citita ca profil implicit', () => {
    expect(() => alternateSite(textProfil('SITE_ALTERNATE'), 'https://3s.md')).not.toThrow()
    expect(problemeCoerenta(['en', 'ro-MD'], perechiAlternate(textProfil('SITE_ALTERNATE')), 'https://3s.md', false)).toEqual([])
  })
})

describe('declaratiile G-AI-02 pe mai multe manifeste (tests/browser/ajutor/raspunsuri.ts)', () => {
  const marcaj = (felie: string) => '  // <<' + 'felie:' + felie + '>>'
  const DECL = { intrebare: 'How much does 3S cost?', entitati: ['EUR'] }

  /** Copia depozitului: manifestele si declaratiile reale, plus fisierele fixturii. */
  function cuCopie<T>(extra: Record<string, string>, f: (radacina: string) => T): T {
    const d = mkdtempSync(join(tmpdir(), 'declaratii-editii-'))
    try {
      const content = join(RADACINA, 'src', 'content')
      mkdirSync(join(d, 'src', 'content'), { recursive: true })
      mkdirSync(join(d, 'config', 'seo'), { recursive: true })
      for (const nume of ['rute.ts', 'rute-en.ts', 'rute-en-nucleu.ts', 'rute-en-produs.ts', 'rute-en-segmente.ts', 'rute-en-referinta.ts', 'rute-en-juridic.ts', 'rute-ro-md.ts']) {
        writeFileSync(join(d, 'src', 'content', nume), readFileSync(join(content, nume), 'utf8'), 'utf8')
      }
      for (const nume of ['fundatie.json', 'preturi.json', 'blog.json']) {
        try {
          writeFileSync(join(d, 'config', 'seo', nume), readFileSync(join(RADACINA, 'config', 'seo', nume), 'utf8'), 'utf8')
        } catch {
          // fisierul lipseste din depozit: copia ramane fara el
        }
      }
      for (const [rel, text] of Object.entries(extra)) {
        mkdirSync(dirname(join(d, rel)), { recursive: true })
        writeFileSync(join(d, rel), text, 'utf8')
      }
      return f(d)
    } finally {
      rmSync(d, { recursive: true, force: true })
    }
  }

  const caiRo = ruteleEditiilor(['ro-RO']).map((r) => r.cale)

  it('pe arborele RO real: nicio abatere', () => {
    expect(citesteDeclaratiile(RADACINA, caiRo, ['ro-RO']).abateri).toEqual([])
  })

  it('martor POZITIV: config/seo/en-proba.json fara marcaj in vreun manifest iese o abatere, cu numele fisierului', () => {
    const r = cuCopie({ 'config/seo/en-proba.json': JSON.stringify({ raspuns_autonom: { '/pricing': DECL } }) }, (d) => citesteDeclaratiile(d, caiRo, ['ro-RO']))
    expect(r.abateri).toEqual(['config/seo/en-proba.json: nu exista felia "en-proba" printre marcajele din src/content/rute.ts'])
  })

  it('martor NEGATIV: cu marcajul si ruta intr-un rute-en-*.ts de fixtura, nicio abatere; ruta editiei absente nu intra in declaratii', () => {
    const manifest = ['import type { RutaEditie } from "./rute";', 'export const RUTE_EN_PROBA: RutaEditie<"en">[] = [', marcaj('en-proba'), '  { cale: "/pricing", scurt: "Pricing", descriere: "x", inHarta: true, editie: "en", cheie: "preturi" },', '];', ''].join('\n')
    const r = cuCopie(
      { 'src/content/rute-en-proba.ts': manifest, 'config/seo/en-proba.json': JSON.stringify({ raspuns_autonom: { '/pricing': DECL } }) },
      (d) => citesteDeclaratiile(d, caiRo, ['ro-RO']),
    )
    expect(r.abateri).toEqual([])
    expect(r.declaratii.has('/pricing')).toBe(false)
    // Controlul: pe un build cu en, aceeasi declaratie intra (deci absenta de mai sus vine din editie, nu din citire)
    const cuEn = cuCopie(
      { 'src/content/rute-en-proba.ts': manifest, 'config/seo/en-proba.json': JSON.stringify({ raspuns_autonom: { '/pricing': DECL } }) },
      // Rutele EN ale build-ului sunt cele scrise literal in grupuri plus ruta fixturii: cazul cerea numai `/pricing`,
      // adica grupuri EN fara rute scrise, o constatare de stare inrosita corect de felia paginilor EN nucleu. Grupul
      // juridic nu intra: rutele lui nu sunt scrise literal (segment dinamic), deci textul manifestului nu le are.
      (d) =>
        citesteDeclaratiile(d, [...RUTE_EN_NUCLEU, ...RUTE_EN_PRODUS, ...RUTE_EN_SEGMENTE, ...RUTE_EN_REFERINTA].map((x) => x.cale).concat('/pricing'), ['en', 'ro-MD']),
    )
    expect(cuEn.abateri).toEqual([])
    expect(cuEn.declaratii.get('/pricing')).toEqual(DECL)
  })

  it('martor POZITIV: declaratia unei editii absente cu forma gresita tot iese abatere (se verifica numai ca forma, dar se verifica)', () => {
    const manifest = ['export const RUTE_EN_PROBA = [', marcaj('en-proba'), '  { cale: "/pricing" },', '];', ''].join('\n')
    const r = cuCopie(
      { 'src/content/rute-en-proba.ts': manifest, 'config/seo/en-proba.json': JSON.stringify({ raspuns_autonom: { '/pricing': { intrebare: 'x' } } }) },
      (d) => citesteDeclaratiile(d, caiRo, ['ro-RO']),
    )
    expect(r.abateri).toEqual(['config/seo/en-proba.json: declaratia rutei /pricing nu are forma { intrebare, entitati, fara_regula_paragrafului? }'])
  })
})

// ---------------------------------------------------------------------------------------------
// Build-ul 3s.md, SERVIT (numai in jobul CI "Profil 3s.md")
// ---------------------------------------------------------------------------------------------

const ADRESA = (process.env.EDITII_ADRESA ?? '').trim()
const PROFIL_CU_EN = editiiDinText(process.env.SITE_EDITII).includes('en')

describe('build-ul 3s.md, servit', () => {
  it('preconditia: in jobul 3s.md (SITE_EDITII cu en) adresa serverului e data, altfel blocul de mai jos n-ar masura nimic', () => {
    if (PROFIL_CU_EN) expect(ADRESA, 'EDITII_ADRESA lipseste in jobul cu profilul 3s.md').not.toBe('')
  })

  const cere = async (cale: string) => {
    const r = await fetch(ADRESA + cale, { redirect: 'manual' })
    return { status: r.status, robots: r.headers.get('x-robots-tag') ?? '', text: await r.text() }
  }
  // `/` si `/pricing` erau aici cat editia EN n-avea nicio pagina (segmentul `[negasit]` al fundatiei): o constatare
  // de stare, inrosita corect de felia paginilor EN nucleu, care le aduce si scoate segmentul. Ce apara cazul, si
  // ramane: caile romanesti, cele fara pagina si o cale inventata dau 404 in engleza, cu antetul de neindexare.
  // Paginile EN (200, `lang="en"`) le masoara `tests/browser/en-nucleu.spec.ts`, pe copia 3s.md.
  const CAI = ['/preturi', '/ro', '/ro/juridic', '/juridic', '/blog', '/o-cale-' + 'care-nu-exista']

  it.runIf(ADRESA !== '')('caile fara pagina EN raspund 404, cu X-Robots-Tag noindex', async () => {
    for (const cale of CAI) {
      const r = await cere(cale)
      expect(r.status, cale).toBe(404)
      expect(r.robots, cale).toContain('noindex')
    }
  })

  it.runIf(ADRESA !== '')('pagina de negasit e in engleza: <html lang="en"> si "Page not found" (global-not-found.en.tsx)', async () => {
    for (const cale of CAI) {
      const r = await cere(cale)
      expect(/<html[^>]*\blang="en"/.test(r.text), cale + ': ' + (/<html[^>]*>/.exec(r.text)?.[0] ?? 'fara <html>')).toBe(true)
      expect(r.text, cale).toContain('Page not found')
    }
  })

  it.runIf(ADRESA !== '')('harta de site fara nicio adresa /blog; /instrumente/termene.ics raspunde 404', async () => {
    const harta = await cere('/sitemap.xml')
    expect(harta.status).toBe(200)
    expect(harta.text).toContain('<urlset')
    expect([...harta.text.matchAll(/<loc>([^<]+)<\/loc>/g)].filter((m) => new URL(m[1]).pathname.startsWith('/blog'))).toEqual([])
    expect((await cere('/instrumente/termene.ics')).status).toBe(404)
  })

  it.runIf(ADRESA !== '')('martor POZITIV al serverului: robots.txt raspunde 200 (deci 404-urile de mai sus nu vin dintr-un server mort)', async () => {
    expect((await cere('/robots.txt')).status).toBe(200)
  })
})

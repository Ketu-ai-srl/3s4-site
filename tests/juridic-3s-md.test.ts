import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { abateriMetadata, alternatePagina, type ContextAlternate } from '../src/components/seo/metadata'
import { ECHIVALENTE, type CaiPeEditie } from '../src/content/echivalente'
import { META_DOCUMENTE_MD } from '../src/content/juridic/pagini'
import { indexJuridicEn, ruteJuridiceEn } from '../src/content/rute-en-juridic'
import { indexJuridicRoMd, ruteJuridiceRoMd } from '../src/content/rute-ro-md'
import { alternateSite } from '../src/lib/site'

/**
 * Paginile juridice ale lui 3s.md (felia juridic-pagini-3s-md): rutele EN sub `/legal`, rutele RO-MD sub
 * `/ro/juridic` si perechile de echivalente sunt EXACT documentele cu poarta B din `config/juridic-rute.json`,
 * cu adresele de acolo; DPA-ul si subimputernicitii (poarta C) nu au nici ruta, nici pereche. Alternatele
 * hreflang ale fiecarei pagini sunt reciproce, cu `x-default` pe pagina EN.
 *
 * Asteptarea se citeste din fisierul de configurare la RULARE, nu se scrie aici: o lista copiata ar trece si
 * cand fisierul s-ar schimba. Comparatia are martori pe copii in memorie (o ruta C adaugata, una B scoasa, o
 * adresa schimbata), ca sa nu poata iesi verde fiindca nu compara nimic.
 *
 * Pagina in sine (200, `lang`, 404 pe `/legal/dpa`, 200 pe indexul `/legal`) o masoara proba de browser pe copia 3s.md,
 * `tests/browser/juridic-3s-md.spec.ts`.
 */

const RADACINA = join(__dirname, '..')

type Document = { en: string; ro: string; poarta: string }
const CONFIG = JSON.parse(readFileSync(join(RADACINA, 'config', 'juridic-rute.json'), 'utf8')) as {
  poarta_curenta: string
  documente: Record<string, Document>
}
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as { SITE_URL: string; SITE_ALTERNATE: string }

const documenteLaPoarta = (poarta: string) => Object.entries(CONFIG.documente).filter(([, d]) => d.poarta === poarta)
const CHEI_B = documenteLaPoarta('B').map(([c]) => c)
const CHEI_C = documenteLaPoarta('C').map(([c]) => c)

/** Asteptarea pe limba: cheie -> cale, din configurare. */
function asteptat(limba: 'en' | 'ro'): Record<string, string> {
  return Object.fromEntries(documenteLaPoarta('B').map(([c, d]) => [c, d[limba]]))
}

/** Diferentele dintre doua tabele cheie -> cale (lista goala = identice, fara sa conteze ordinea). */
function diferente(astept: Record<string, string>, real: Record<string, string>): string[] {
  const d: string[] = []
  for (const [c, cale] of Object.entries(astept)) {
    if (!(c in real)) d.push('lipseste ' + c)
    else if (real[c] !== cale) d.push(c + ': ' + real[c] + ' in loc de ' + cale)
  }
  for (const c of Object.keys(real)) if (!(c in astept)) d.push('in plus ' + c)
  return d
}

const tabelRute = (rute: { cheie: string; cale: string }[]) => Object.fromEntries(rute.map((r) => [r.cheie, r.cale]))
const tabelEchivalente = (e: Readonly<Record<string, CaiPeEditie>>, editie: 'en' | 'ro-MD') =>
  Object.fromEntries(Object.entries(e).map(([c, cai]) => [c, cai[editie] ?? '']))

describe('preconditiile asteptarii', () => {
  it('configurarea are poarta curenta B, 6 documente B si 2 C (dpa, subimputerniciti)', () => {
    expect(CONFIG.poarta_curenta).toBe('B')
    expect(CHEI_B).toHaveLength(6)
    expect([...CHEI_C].sort()).toEqual(['dpa', 'subimputerniciti'])
  })
})

describe('martorii comparatiei', () => {
  const en = asteptat('en')
  it('martor NEGATIV: asteptarea fata de ea insasi, in alta ordine, nu da diferente', () => {
    expect(diferente(en, Object.fromEntries(Object.entries(en).reverse()))).toEqual([])
  })
  it('martor POZITIV: o ruta C adaugata (pe o copie) e prinsa', () => {
    const c = CHEI_C[0]
    expect(diferente(en, { ...en, [c]: CONFIG.documente[c].en })).toEqual(['in plus ' + c])
  })
  it('martor POZITIV: o ruta B scoasa (pe o copie) e prinsa', () => {
    const [prima, ...rest] = Object.keys(en)
    expect(diferente(en, Object.fromEntries(rest.map((c) => [c, en[c]])))).toEqual(['lipseste ' + prima])
  })
  it('martor POZITIV: o adresa schimbata (pe o copie) e prinsa', () => {
    const prima = Object.keys(en)[0]
    expect(diferente(en, { ...en, [prima]: en[prima] + '-x' })).toHaveLength(1)
  })
})

describe('rutele juridice pe editie', () => {
  // Documentele: rutele grupului fara index (indexul are cazul lui, mai jos).
  const documente = <T extends { cale: string }>(rute: T[]) => rute.filter((r) => r.cale !== '/legal' && r.cale !== '/ro/juridic')

  it('cu familia md publicata: EN = documentele B cu adresa EN, editie en, cheia din registru', () => {
    const rute = documente(ruteJuridiceEn(true, 'md'))
    expect(diferente(asteptat('en'), tabelRute(rute))).toEqual([])
    expect(rute.every((r) => r.editie === 'en' && r.inHarta && r.cale.startsWith('/legal/'))).toBe(true)
  })

  it('cu familia md publicata: RO-MD = documentele B cu adresa romaneasca, sub /ro/juridic', () => {
    const rute = documente(ruteJuridiceRoMd(true, 'md'))
    expect(diferente(asteptat('ro'), tabelRute(rute))).toEqual([])
    expect(rute.every((r) => r.editie === 'ro-MD' && r.inHarta && r.cale.startsWith('/ro/juridic/'))).toBe(true)
  })

  // Indexul (`/legal`, `/ro/juridic`, felia editie-juridic) exista exact cand familia md e publicata: e ultima ruta a
  // grupului (ca indexul din `ruteJuridice` pe RO), un singur rand, si nu intra (inca) in harta.
  it('indexul exista exact cand familia md e publicata: /legal si /ro/juridic, ultimul in grup, nu in harta; altfel nicio ruta', () => {
    const en = ruteJuridiceEn(true, 'md')
    const ro = ruteJuridiceRoMd(true, 'md')
    expect([en[en.length - 1], ro[ro.length - 1]].map((r) => [r.cale, r.editie, r.inHarta])).toEqual([['/legal', 'en', false], ['/ro/juridic', 'ro-MD', false]])
    expect([en.length, ro.length]).toEqual([CHEI_B.length + 1, CHEI_B.length + 1])
    expect([...indexJuridicEn(true, 'md'), ...indexJuridicRoMd(true, 'md')].map((r) => r.cale)).toEqual(['/legal', '/ro/juridic'])
    for (const [publicat, familie] of [[false, 'md'], [true, 'see'], [true, null]] as const) expect([...indexJuridicEn(publicat, familie), ...indexJuridicRoMd(publicat, familie)]).toEqual([])
  })

  it('fara operator sau cu familia SEE: nicio ruta (pagina exista exact cand exista ruta)', () => {
    expect(ruteJuridiceEn(false, 'md')).toEqual([])
    expect(ruteJuridiceRoMd(false, 'md')).toEqual([])
    expect(ruteJuridiceEn(true, 'see')).toEqual([])
    expect(ruteJuridiceRoMd(true, null)).toEqual([])
  })

  it('titlurile si descrierile celor 12 pagini sunt in pragurile portii de SEO', () => {
    const abateri = CHEI_B.flatMap((c) =>
      (['en', 'ro'] as const).flatMap((l) => {
        const meta = META_DOCUMENTE_MD[c as keyof typeof META_DOCUMENTE_MD][l]
        return abateriMetadata({ ...meta, cale: CONFIG.documente[c][l] }).map((a) => c + '.' + l + ': ' + a)
      }),
    )
    expect(abateri).toEqual([])
  })
})

describe('echivalentele', () => {
  // Tabelul are si perechile paginilor de prezentare (startul si contactul, felia ro-md-acasa-contact), pe care le
  // masoara proba lor. Aici se compara numai perechile cu cheie JURIDICA, adica cheile din `config/juridic-rute.json`;
  // un document al familiei ramas in tabel peste poarta lui ramane prins, fiindca filtrul e pe cheile din
  // configurare, nu pe poarta (martorul de mai jos).
  const CHEI_JURIDICE = new Set(Object.keys(CONFIG.documente))
  const juridice = (e: Readonly<Record<string, CaiPeEditie>>) => Object.fromEntries(Object.entries(e).filter(([c]) => CHEI_JURIDICE.has(c)))

  it('perechile juridice sunt exact documentele B: en si ro-MD cu adresele din configurare', () => {
    expect(diferente(asteptat('en'), tabelEchivalente(juridice(ECHIVALENTE), 'en'))).toEqual([])
    expect(diferente(asteptat('ro'), tabelEchivalente(juridice(ECHIVALENTE), 'ro-MD'))).toEqual([])
  })

  it('martorii filtrului: tabelul real are si chei nejuridice (deci filtrul lucreaza), iar o pereche juridica C adaugata pe o copie e prinsa', () => {
    expect(Object.keys(ECHIVALENTE).filter((c) => !CHEI_JURIDICE.has(c)).length).toBeGreaterThan(0)
    const c = CHEI_C[0]
    const copie = { ...ECHIVALENTE, [c]: { en: CONFIG.documente[c].en, 'ro-MD': CONFIG.documente[c].ro } }
    expect(diferente(asteptat('en'), tabelEchivalente(juridice(copie), 'en'))).toEqual(['in plus ' + c])
    expect(diferente(asteptat('ro'), tabelEchivalente(juridice(copie), 'ro-MD'))).toEqual(['in plus ' + c])
  })

  it('fara ro-RO in tabel (gazda romaneasca nu serveste azi aceste pagini)', () => {
    expect(Object.values(ECHIVALENTE).filter((c) => c['ro-RO'] !== undefined)).toEqual([])
  })

  it('fiecare pereche juridica are ruta pe ambele editii, cu aceeasi cheie', () => {
    const en = tabelRute(ruteJuridiceEn(true, 'md'))
    const ro = tabelRute(ruteJuridiceRoMd(true, 'md'))
    for (const [cheie, cai] of Object.entries(juridice(ECHIVALENTE))) {
      expect(en[cheie], cheie).toBe(cai.en)
      expect(ro[cheie], cheie).toBe(cai['ro-MD'])
    }
  })
})

describe('alternatele hreflang pe profilul 3s.md', () => {
  const context: ContextAlternate = {
    alternate: alternateSite(PROFIL.SITE_ALTERNATE, PROFIL.SITE_URL),
    baza: PROFIL.SITE_URL,
    editii: ['en', 'ro-MD'],
    echivalente: ECHIVALENTE,
  }

  it('controlul: lista de variante a profilului e citita (en, ro-MD, x-default)', () => {
    expect(context.alternate.map((a) => a.hreflang).sort()).toEqual(['en', 'ro-MD', 'x-default'])
  })

  for (const cheie of CHEI_B) {
    it(cheie + ': EN si RO-MD emit aceeasi multime, cu x-default pe pagina EN', () => {
      const d = CONFIG.documente[cheie]
      const en = alternatePagina({ cale: d.en, editie: 'en', cheie }, context)
      const ro = alternatePagina({ cale: d.ro, editie: 'ro-MD', cheie }, context)
      const asteptate = { en: PROFIL.SITE_URL + d.en, 'ro-MD': PROFIL.SITE_URL + d.ro, 'x-default': PROFIL.SITE_URL + d.en }
      expect(en.languages).toEqual(asteptate)
      expect(ro.languages).toEqual(asteptate)
      expect(en.canonical).toBe(d.en)
      expect(ro.canonical).toBe(d.ro)
    })
  }
})

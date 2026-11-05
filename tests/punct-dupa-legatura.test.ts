import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EFACTURARE_RO, TabelPiete, punctDupaLegatura, type ContinutEfacturare } from '../src/components/efacturare/SectiuniEfacturare'
import { EFACTURARE_EN } from '../src/content/en/guides-e-invoice-archiving-eu'

// Punctul de dupa legatura din nota tabelului de piete (ghidul e-facturare). Regula: cand nota se termina in
// mijlocul propozitiei (litera sau cifra), legatura incheie fraza si primeste punctul ei; cand nota se termina deja
// cu punctuatie, legatura sta singura si nu primeste nimic. Proba citeste si functia, si nota RANDATA pe editiile
// care monteaza tabelul: pagina RO (in punct) si ghidul EN (in doua puncte), din continut, ca proba sa urmeze nota
// daca se schimba. Cazul notei terminate in litera il dadea ghidul RO-MD, iesit in felia 166 (decizia lui Adrian Mihai,
// 03.11.2026); il tine acum o nota asamblata la rulare pe continutul RO, cu aceeasi forma ca a fostului ghid.

/** Textul paragrafului de nota din HTML-ul tabelului: paragraful care incepe cu nota continutului, fara etichete. */
function notaRandata(continut: ContinutEfacturare): string {
  const html = renderToStaticMarkup(createElement(TabelPiete, { continut }))
  const paragrafe = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) =>
    m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim(),
  )
  const gasite = paragrafe.filter((p) => p.startsWith(continut.tabel.nota))
  expect(gasite, 'un singur paragraf de nota in tabel').toHaveLength(1)
  return gasite[0]
}

describe('punctDupaLegatura: functia', () => {
  it('litera sau cifra la final -> punct', () => {
    expect(punctDupaLegatura('Pentru firmele din Republica Moldova, consultă')).toBe('.')
    expect(punctDupaLegatura('vezi anexa 2')).toBe('.')
    // Litera cu diacritic (clasa Unicode, nu [a-z]) si spatiul de la coada, care nu conteaza.
    expect(punctDupaLegatura('ghidul din ' + 'Ș')).toBe('.')
    expect(punctDupaLegatura('consultă   ')).toBe('.')
  })

  it('punct sau doua puncte la final -> nimic (legatura sta singura)', () => {
    expect(punctDupaLegatura('Ghidurile pe țări apar pe blog.')).toBe('')
    expect(punctDupaLegatura('Company records in Moldova have their own guide:')).toBe('')
    expect(punctDupaLegatura('Detalii:  ')).toBe('')
  })
})

describe('punctDupaLegatura: nota randata pe editii', () => {
  it('nota terminata in litera (forma fostului ghid RO-MD): fraza se incheie cu legatura si punct', () => {
    const continut: ContinutEfacturare = {
      ...EFACTURARE_RO,
      tabel: { ...EFACTURARE_RO.tabel, nota: 'Pentru firmele din Republica Moldova, ' + 'consultă' },
    }
    // Controlul premisei: nota chiar se termina in litera; altfel cazul n-ar masura regula.
    expect(continut.tabel.nota.trimEnd()).toMatch(/\p{L}$/u)
    const text = notaRandata(continut)
    expect(text).toBe(continut.tabel.nota + ' ' + continut.tabel.notaLegatura.text + '.')
  })

  it('pagina RO: nota se termina in punct, legatura ramane fara punct dupa ea', () => {
    expect(EFACTURARE_RO.tabel.nota.trimEnd().endsWith('.')).toBe(true)
    const text = notaRandata(EFACTURARE_RO)
    expect(text).toBe(EFACTURARE_RO.tabel.nota + ' ' + EFACTURARE_RO.tabel.notaLegatura.text)
  })

  it('ghidul EN: nota se termina in doua puncte, legatura ramane fara punct dupa ea', () => {
    expect(EFACTURARE_EN.tabel.nota.trimEnd().endsWith(':')).toBe(true)
    const text = notaRandata(EFACTURARE_EN)
    expect(text).toBe(EFACTURARE_EN.tabel.nota + ' ' + EFACTURARE_EN.tabel.notaLegatura.text)
  })
})

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pilot14, pilot30, textDinHtml } from './browser/ajutor/pilot'

/**
 * Durata pilotului gratuit (decizia owner-ului din 05.10.2026: 14 zile, pe toate editiile). Proba pe SURSA, cu
 * detectorul din `tests/browser/ajutor/pilot.ts`; pe caile servite masoara `tests/browser/pilot-14-zile.spec.ts`.
 *
 * Martorii se asambleaza la rulare (fisierul nu poarta literal forma vanata). Controlul pozitiv al scanarii:
 * pilotul de 14 zile apare in continutul ambelor editii 3s.md (en si ro-md), deci detectorul citeste fisierele.
 */

const RADACINA = join(__dirname, '..')
const TREI_ZECI = '3' + '0'
const EXTENSII = /\.(ts|tsx|json|mdx|md|txt)$/

function fisiere(director: string): string[] {
  const rezultat: string[] = []
  for (const nume of readdirSync(director)) {
    const cale = join(director, nume)
    if (statSync(cale).isDirectory()) rezultat.push(...fisiere(cale))
    else if (EXTENSII.test(nume)) rezultat.push(cale)
  }
  return rezultat
}

describe('detectorul pilotului de 30 de zile: martori asamblati la rulare', () => {
  it('martor POZITIV: fiecare forma a pilotului de 30 de zile e prinsa', () => {
    const forme = [
      'Every start is a free ' + TREI_ZECI + '-day pilot.',
      'The assisted pilot is free for ' + TREI_ZECI + ' days, on your own documents.',
      'An assisted pilot runs 3S for ' + TREI_ZECI + ' days, free of charge.',
      'Free ' + 'thir' + 'ty-day pilot.',
      'Pilot gratuit de ' + TREI_ZECI + ' de zile, asistat.',
      'Pilotul este gratuit, durează ' + TREI_ZECI + ' de zile.',
      textDinHtml('<p>' + TREI_ZECI + '&nbsp;de zile</p><p>de pilot gratuit</p>'),
      textDinHtml('<span>EUR 0</span><span>for the ' + TREI_ZECI + '-day pilot</span>'),
      // Exceptia valabilitatii cere si oferta in propozitie: formula singura nu scuteste pilotul.
      'The free pilot is ' + 'valid for ' + TREI_ZECI + ' days.',
      'Pilotul gratuit este ' + 'valabil ' + TREI_ZECI + ' de zile.',
      // Oferta in propozitie fara formula de valabilitate in fata duratei nu scuteste pilotul.
      'Every start is a free ' + TREI_ZECI + '-day pilot; a written ' + 'offer follows.',
    ]
    for (const f of forme) expect(pilot30(f), f).toHaveLength(1)
  })

  it('martor NEGATIV: valabilitatea ofertei, alte termene, datele calendaristice si pilotul de 14 zile nu sunt acuzate', () => {
    const forme = [
      'After the pilot, we confirm the plan and the price in a written offer, valid for ' + TREI_ZECI + ' days.',
      'Oferta după pilot rămâne valabilă ' + TREI_ZECI + ' de zile de la emitere.',
      'We answer data subject requests within ' + TREI_ZECI + ' days. The pilot is free.',
      'Decizia din ' + TREI_ZECI + '.09.2026 despre pilot.',
      'Every start is a free 14-day pilot.',
      'Pilot gratuit de 14 zile, asistat.',
    ]
    for (const f of forme) expect(pilot30(f), f).toEqual([])
    expect(pilot14('Every start is a free 14-day pilot.')).toHaveLength(1)
    expect(pilot14('Pilot gratuit de 14 zile, asistat.')).toHaveLength(1)
  })
})

describe('sursa: zero pilot de 30 de zile in src/ si config/', () => {
  const toate = [...fisiere(join(RADACINA, 'src')), ...fisiere(join(RADACINA, 'config'))]

  it('nicio propozitie cu pilotul de 30 de zile; controlul: pilotul de 14 zile apare pe ambele editii 3s.md', () => {
    const gasite: string[] = []
    let cu14En = 0
    let cu14RoMd = 0
    for (const f of toate) {
      const text = readFileSync(f, 'utf8')
      const r = relative(RADACINA, f).replace(/\\/g, '/')
      for (const p of pilot30(text)) gasite.push(r + ': ' + p)
      const n14 = pilot14(text).length
      if (r.startsWith('src/content/en/')) cu14En += n14
      if (r.startsWith('src/content/ro-md/')) cu14RoMd += n14
    }
    console.log('[pilot-14-zile] fisiere citite: ' + toate.length + '; pilot de 14 zile: en ' + cu14En + ', ro-md ' + cu14RoMd)
    expect(toate.length).toBeGreaterThan(100)
    expect(gasite).toEqual([])
    expect(cu14En).toBeGreaterThan(0)
    expect(cu14RoMd).toBeGreaterThan(0)
  })
})

import { describe, expect, it } from 'vitest'
import { cereDe, numarCuDe } from '../src/content/limba'
import { ESTIMARE, completeaza, formatTimp as timpConstructor } from '../src/content/acasa-constructor'
import { cuDe } from '../src/content/preturi'
import { minuteDin, ZIUA } from '../src/content/functionalitati/aplicatie-mobila'
import { formatTimp as timpCautare } from '../src/components/functionalitati/cautare-ai/Frustrare'
import { inchideGhilimele, parseazaInline, textDin } from '../src/content/blog/markdown'

/**
 * Probele felei de limba (decizia D15 din planul valului S4): numeralul cu "de" in sabloanele cu
 * valoare variabila, duratele "1 h 25 min" si ghilimelele romanesti in articolele blogului.
 */

describe('numeralul cu "de" (DOOM3 / GALR)', () => {
  it('cere "de" de la 20 in sus, dar nu la terminatiile 01-19, la zero sau la zecimale', () => {
    const cer = [20, 30, 44, 60, 100, 120, 1000, 25000, 2740]
    const nu = [0, 1, 8, 19, 101, 119, 1001, 1019, 2.5]
    for (const n of cer) expect(cereDe(n), String(n)).toBe(true)
    for (const n of nu) expect(cereDe(n), String(n)).toBe(false)
    expect(numarCuDe(30)).toBe('30 de')
    expect(numarCuDe(8)).toBe('8')
  })

  it('cele doua ajutoare (start si preturi) dau aceeasi regula', () => {
    for (const n of [0, 1, 5, 19, 20, 55, 100, 101, 119, 120]) expect(n + cuDe(n)).toBe(numarCuDe(n))
  })

  it('sabloanele estimarii pun "de" conditionat, dupa valoare', () => {
    // Valorile vin din sablonul real al paginii, nu dintr-o copie a lui.
    const mic = completeaza(ESTIMARE.formula, { docs: 8, k: '4', zile: 22 })
    const mare = completeaza(ESTIMARE.formula, { docs: 30, k: '4', zile: 22 })
    expect(mic.startsWith('8 acte')).toBe(true)
    expect(mare.startsWith('30 de acte')).toBe(true)
    expect(completeaza(ESTIMARE.cifra, { ore: 12 })).not.toMatch(/12 de /)
    expect(completeaza(ESTIMARE.cifra, { ore: 44 })).toMatch(/44 de ore/)
    // Martor: fara marcaj, sablonul scrie valoarea goala, ca inainte.
    expect(completeaza('{n} x', { n: 30 })).toBe('30 x')
  })
})

describe('duratele "1 h 25 min" (SI)', () => {
  it('ambele functii formatTimp scriu simbolurile cu spatiu', () => {
    expect(timpConstructor(85)).toBe('1 h 25 min')
    expect(timpConstructor(120)).toBe('2 h')
    expect(timpConstructor(45)).toBe('45 min')
    expect(timpCautare(85)).toBe('1 h 25 min')
    for (const t of [timpConstructor(85), timpCautare(85)]) expect(t).not.toMatch(/\dh|\dm\b/)
  })

  it('duratele scrise in macheta aplicatiei mobile se citesc inapoi corect', () => {
    for (const s of ZIUA.segmente) expect(s.durata).toMatch(/^(\d+ h)?( ?\d+ min)?$/)
    expect(minuteDin('1 h 5 min')).toBe(65)
    expect(minuteDin('50 min')).toBe(50)
    expect(minuteDin('2 h')).toBe(120)
  })
})

describe('ghilimelele romanesti in articole', () => {
  const Q = '"'
  const jos = '„'
  const sus = '”'
  it('o ghilimea ASCII care inchide un citat deschis jos devine cea de sus', () => {
    expect(inchideGhilimele(jos + 'privind' + Q + ' si ' + jos + 'altceva' + Q)).toBe(jos + 'privind' + sus + ' si ' + jos + 'altceva' + sus)
    expect(textDin(parseazaInline(jos + '**tare**' + Q + ' rest'))).toBe(jos + 'tare' + sus + ' rest')
  })

  it('martori: ghilimeaua fara citat deschis, cea din cod si cea evadata raman neatinse', () => {
    expect(inchideGhilimele('a ' + Q + 'b' + Q)).toBe('a ' + Q + 'b' + Q)
    expect(inchideGhilimele('`' + jos + 'x' + Q + '`')).toBe('`' + jos + 'x' + Q + '`')
    expect(inchideGhilimele(jos + 'x\\' + Q + ' y')).toBe(jos + 'x\\' + Q + ' y')
  })
})

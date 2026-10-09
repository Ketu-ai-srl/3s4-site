import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TextInLinie from '../src/components/juridic/TextInLinie'

/**
 * Adresele de e-mail din textele juridice devin legaturi `mailto:` (felia 151, auditul functional din 09.10: pe baza,
 * 6 adrese pe informatiile legale si 16 pe confidentialitate, toate text simplu, zero `mailto:`).
 *
 * CE SE CERE: pe build-urile cu editii (en, ro-MD) adresa din proza devine legatura cu exact acelasi text, iar textul
 * vizibil al sirului nu se schimba; intr-o celula de tabel numai o celula care e chiar adresa; un numar de telefon nu
 * devine legatura (decizia 56); pe build-ul ro-RO nimic nu se schimba (garda RO a paginilor /juridic).
 *
 * Adresa e asamblata la rulare, cu domeniul rezervat `.invalid`.
 * MARTORI: pozitiv - aceeasi fraza, pe build-ul cu editii, are legatura; negativ - pe ro-RO, si in celula cu adresa in
 * fraza, HTML-ul e exact sirul de intrare.
 */

const ADRESA = ['scrie', ['exemplu', 'invalid'].join('.')].join('@')
const FRAZA = 'Ne găsești la ' + ADRESA + ', iar pe WhatsApp la +373 60 000 000.'

const randeaza = (text: string, posta?: 'oriunde' | 'celula') => renderToStaticMarkup(createElement(TextInLinie, { text, posta }))
const faraEtichete = (html: string) => html.replace(/<[^>]+>/g, '')

function editii(valoare: string) {
  vi.stubEnv('NEXT_PUBLIC_SITE_EDITII', '')
  vi.stubEnv('SITE_EDITII', valoare)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('TextInLinie: adresele de e-mail ca legaturi mailto', () => {
  it('martor POZITIV: pe build-ul cu editii (en, ro-MD), adresa din proza e legatura, cu acelasi text vizibil', () => {
    editii('en,ro-MD')
    const html = randeaza(FRAZA)
    expect(html).toContain('<a href="mailto:' + ADRESA + '">' + ADRESA + '</a>')
    expect(faraEtichete(html)).toBe(FRAZA)
    // punctul de dupa adresa nu intra in ea; numarul de telefon nu devine legatura (decizia 56)
    expect(html).not.toContain('tel:')
    expect((html.match(/<a\b/g) ?? []).length).toBe(1)
  })

  it('in celula: o celula care e chiar adresa devine legatura; adresa din mijlocul unei fraze ramane text', () => {
    editii('en,ro-MD')
    expect(randeaza(ADRESA, 'celula')).toBe('<a href="mailto:' + ADRESA + '">' + ADRESA + '</a>')
    expect(randeaza(FRAZA, 'celula')).toBe(FRAZA)
  })

  it('martor NEGATIV: pe build-ul ro-RO HTML-ul e sirul de intrare, fara nicio legatura', () => {
    editii('ro-RO')
    expect(randeaza(FRAZA)).toBe(FRAZA)
    editii('')
    expect(randeaza(FRAZA)).toBe(FRAZA)
  })

  it('un sir fara adresa ramane exact cel de dinainte, pe orice build', () => {
    editii('en,ro-MD')
    expect(randeaza('Fără adresă aici.')).toBe('Fără adresă aici.')
  })
})

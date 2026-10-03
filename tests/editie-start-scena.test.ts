import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

/**
 * SCENA EROULUI FARA LANSARE (felia 98). Pe server, inainte de montare, centrul e oricum element simplu
 * (`useMontat` intoarce fals), deci o randare statica obisnuita ar arata zero butoane si fara schimbarea
 * din felie: proba n-ar dovedi nimic. De aceea starea de DUPA montare se impune aici: `useMontat` si
 * `useMiscareRedusa` sunt inlocuite (montat, cu miscare), iar componenta se randeaza in starea in care,
 * in navigator, centrul devine buton.
 *
 * Controlul: aceeasi randare fara `lansare` (RO) are exact un buton, centrul. Cu `lansare={false}`, zero.
 * Ce NU se masoara aici: ca bucata machetei nu se descarca (efectele nu ruleaza pe server); asta tine de
 * ramura `cuLansare` din efectul de descarcare si se masoara in navigator, pe pagina editiei.
 */

vi.mock('../src/components/erou/hooks', async (original) => ({
  ...(await original<typeof import('../src/components/erou/hooks')>()),
  useMontat: () => true,
  useMiscareRedusa: () => false,
}))

const { default: ScenaErou } = await import('../src/components/erou/ScenaErou')

function scena(extra: Record<string, unknown>): string {
  const marca = ['Qx', 'centru', String(Date.now() % 97)].join(' ')
  return renderToStaticMarkup(
    createElement(ScenaErou, {
      desen: createElement('svg', { key: 'desen' }),
      suprapuneri: null,
      legenda: null,
      sigla: createElement('i', { key: 'sigla' }),
      sageata: null,
      etichetaCentru: marca,
      pastilaCentru: marca,
      ...extra,
    }),
  )
}

const butoane = (html: string) => (html.match(/<button[\s>]/g) ?? []).length

describe('ScenaErou: lansarea machetei pe editie', () => {
  it('control: montata, fara `lansare` (RO), centrul e singurul buton', () => {
    const html = scena({})
    expect(butoane(html)).toBe(1)
    expect(html).toContain('data-puncte')
  })

  it('cu `lansare={false}`: zero <button> in scena, bucla si punctele raman', () => {
    const html = scena({ lansare: false })
    expect(butoane(html)).toBe(0)
    expect(html).toContain('data-puncte')
  })

  it('cu `lansare={true}` explicit: ca pe RO, un buton', () => {
    expect(butoane(scena({ lansare: true }))).toBe(1)
  })

  it('fara eticheta si pastila centrului, centrul arata numai sigla', () => {
    const html = scena({ lansare: false, etichetaCentru: undefined, pastilaCentru: undefined })
    expect(html).not.toContain('data-pastila-centru')
    expect(html).not.toContain('doar-cititor')
    expect(html).toContain('<i>')
  })
})

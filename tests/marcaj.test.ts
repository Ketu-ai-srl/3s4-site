import { describe, expect, it } from 'vitest'
import { GET } from '../src/app/stamp/route'
import stamp from '../src/content/_stamp.json'

describe('marcajul de livrare', () => {
  it('exista si are forma E0-xxxx sau E<n>-xxxx', () => {
    expect(stamp.marcaj).toMatch(/^E\d+-\d{4}$/)
  })

  it('ruta /stamp raspunde exact cu marcajul din commit, ca text simplu', async () => {
    const r = GET()
    expect(r.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(await r.text()).toBe(stamp.marcaj)
  })

  it('martor POZITIV: forma cere litera, cifre, cratima si exact patru cifre', () => {
    for (const rau of ['E5-001', 'e5-0001', 'E5_0001', 'E5-0001 ', 'X5-0001']) expect(rau).not.toMatch(/^E\d+-\d{4}$/)
  })

  it('martor NEGATIV: marcajele livrate pana acum au forma acceptata', () => {
    for (const bun of ['E0-0000', 'E4-0004', 'E5-0001', 'E8-0014']) expect(bun).toMatch(/^E\d+-\d{4}$/)
  })
})

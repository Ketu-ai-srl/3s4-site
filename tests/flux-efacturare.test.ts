import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import EFacturare from '../src/app/e-facturare/page'
import FluxDocumente from '../src/app/flux-documente/page'
import { GET } from '../src/app/instrumente/termene.ics/route'
import { FAZA_DOI, PASI, SOSIRI, SX, TAIERE, distantaPeScara, stareScena } from '../src/components/flux/cronologie'
import { abateriMetadata } from '../src/components/seo/metadata'
import { evadeaza, fisierIcs, pliaza, termene } from '../src/content/efacturare/calendar'
import { META_EFACTURARE, TABEL } from '../src/content/efacturare/pagina'
import { JURNAL, MODIFICARI_RECENTE, PIETE } from '../src/content/efacturare/piete'
import { DATA_VERIFICARII, SURSE, TARI_NEVERIFICATE } from '../src/content/efacturare/surse'
import { DOMENII, FERESTRE, META_FLUX, SCENA } from '../src/content/flux'
import { RUTE } from '../src/content/rute'

// Probele feliei flux-efacturare: calendarul .ics (RFC 5545, alarma pe fiecare eveniment),
// datele cu sursa lor oficiala, cronologia scenei lipite si HTML-ul servit al celor doua pagini.

/** Despleteste randurile pliate (RFC 5545, 3.1) si le imparte in proprietati. */
function randuriIcs(text: string): string[] {
  return text.replace(/\r\n[ \t]/g, '').split('\r\n').filter((r) => r !== '')
}

describe('calendarul /instrumente/termene.ics', () => {
  const text = fisierIcs()
  const randuri = randuriIcs(text)

  it('are forma RFC 5545: CRLF, randuri de cel mult 75 de octeti, blocuri echilibrate', () => {
    expect(text.endsWith('\r\n')).toBe(true)
    expect(text.replace(/\r\n/g, '').includes('\n')).toBe(false)
    for (const rand of text.split('\r\n')) expect(Buffer.byteLength(rand, 'utf8')).toBeLessThanOrEqual(75)
    expect(randuri[0]).toBe('BEGIN:VCALENDAR')
    expect(randuri.at(-1)).toBe('END:VCALENDAR')
    expect(randuri).toContain('VERSION:2.0')
    expect(randuri.some((r) => r.startsWith('PRODID:'))).toBe(true)
    let adancime = 0
    for (const r of randuri) {
      if (r.startsWith('BEGIN:')) adancime++
      if (r.startsWith('END:')) adancime--
      expect(adancime).toBeGreaterThanOrEqual(0)
    }
    expect(adancime).toBe(0)
  })

  it('fiecare eveniment are UID unic, DTSTAMP, zi intreaga, sursa si O ALARMA', () => {
    const evenimente = text.replace(/\r\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1)
    expect(evenimente.length).toBe(termene().length)
    const uiduri = new Set<string>()
    for (const e of evenimente) {
      const uid = /\r\nUID:([^\r]+)/.exec('\r\n' + e)?.[1]
      expect(uid).toBeTruthy()
      uiduri.add(uid as string)
      expect(e).toMatch(/\r\nDTSTAMP:\d{8}T\d{6}Z\r\n/)
      expect(e).toMatch(/\r\nDTSTART;VALUE=DATE:\d{8}\r\n/)
      expect(e).toMatch(/\r\nDTEND;VALUE=DATE:\d{8}\r\n/)
      expect(e).toMatch(/\r\nURL:https:\/\//)
      expect(e).toContain('BEGIN:VALARM')
      expect(e).toMatch(/TRIGGER:-P\d+D/)
      expect(e).toContain('ACTION:DISPLAY')
    }
    expect(uiduri.size).toBe(evenimente.length)
  })

  it('are termene romanesti SI europene, toate dupa ziua verificarii', () => {
    const lista = termene()
    expect(lista.filter((t) => t.titlu.startsWith('România:')).length).toBeGreaterThanOrEqual(12)
    expect(lista.filter((t) => !t.titlu.startsWith('România:')).length).toBeGreaterThanOrEqual(5)
    for (const t of lista) expect(t.data > DATA_VERIFICARII).toBe(true)
    // D406 lunar: ultima zi calendaristica a lunii urmatoare (septembrie 2026 -> 31 octombrie 2026).
    expect(lista[0].data).toBe('2026-10-31')
    expect(lista.find((t) => t.titlu.includes('februarie 2027'))?.data).toBe('2027-03-31')
  })

  it('cutia calendarului spune cifrele fisierului: numarul de termene si zilele de alarma', () => {
    const lista = termene()
    const ro = lista.filter((t) => t.titlu.startsWith('România:'))
    const ue = lista.filter((t) => !t.titlu.startsWith('România:'))
    const text = TABEL.calendar.text
    expect(text).toContain(lista.length + ' termene')
    expect(text).toContain(ro.length + ' depuneri lunare D406')
    expect(text).toContain(ue.length + ' date europene')
    expect(new Set(ro.map((t) => t.alarmaZile))).toEqual(new Set([7]))
    expect(new Set(ue.map((t) => t.alarmaZile))).toEqual(new Set([30]))
    expect(text).toContain('alarmă la 7 zile')
    expect(text).toContain('alarmă la 30')
  })

  it('termenul de transmitere in RO e-Factura nu apare cat forma lui din 2026 nu e verificata', () => {
    const efacturare = renderToStaticMarkup(createElement(EFacturare))
    expect(efacturare).not.toMatch(/zile (calendaristice|lucrătoare) de la emitere/)
    expect(efacturare).not.toContain('5 zile')
    // Control: aceeasi cautare prinde forma interzisa intr-un sir fabricat la rulare.
    expect('în ' + String(5) + ' zile').toContain('5 zile')
  })

  it('evadeaza textul si nu taie un caracter UTF-8 la pliere (control cu diacritice)', () => {
    expect(evadeaza('a;b,c\\d\ne')).toBe('a\\;b\\,c\\\\d\\ne')
    const lung = 'SUMMARY:' + 'ățș'.repeat(40)
    const pliat = pliaza(lung)
    for (const r of pliat.split('\r\n')) expect(Buffer.byteLength(r, 'utf8')).toBeLessThanOrEqual(75)
    expect(pliat.replace(/\r\n /g, '')).toBe(lung)
  })

  it('ruta serveste text/calendar in UTF-8, cu acelasi continut', async () => {
    const r = GET()
    expect(r.headers.get('content-type')).toBe('text/calendar; charset=utf-8')
    expect(await r.text()).toBe(text)
  })
})

describe('datele e-facturarii au sursa oficiala alaturi', () => {
  it('fiecare rand, fiecare intrare din jurnal si fiecare modificare numeste o sursa existenta, pe https', () => {
    const chei = [...PIETE.flatMap((p) => p.surse), ...JURNAL.map((j) => j.sursa), ...MODIFICARI_RECENTE.map((m) => m.sursa)]
    for (const c of chei) {
      expect(SURSE[c], 'sursa ' + c).toBeDefined()
      expect(SURSE[c].url.startsWith('https://')).toBe(true)
    }
  })

  it('tarile neverificate nu apar in tabel, iar Romania da', () => {
    const tari = PIETE.map((p) => p.tara)
    for (const n of TARI_NEVERIFICATE) expect(tari).not.toContain(n.tara)
    expect(tari).toContain('România')
  })

  it('ancorele tabelului sunt unice si fiecare eticheta din jurnal duce la una', () => {
    const ancore = PIETE.map((p) => p.ancora)
    expect(new Set(ancore).size).toBe(ancore.length)
    for (const j of JURNAL) expect(ancore).toContain(j.ancora)
  })
})

describe('cronologia scenei lipite', () => {
  const centre = FERESTRE.map((f) => ({ x: f.lat[0], y: f.lat[1] }))
  const centreIngust = FERESTRE.map((f) => ({ x: f.ingust[0], y: f.ingust[1] }))

  it('la inceput nu se vede nimic, dupa aparitii toate ferestrele sunt intregi', () => {
    const start = stareScena(0, centre, false)
    expect(start.ferestre.every((f) => f.opacitate === 0)).toBe(true)
    expect(start.doc.opacitate).toBe(0)
    const plin = stareScena(600, centre, false)
    expect(plin.ferestre.every((f) => f.opacitate === 1 && f.dy === 0)).toBe(true)
    expect(plin.faza).toBe(1)
    expect(plin.locuri).toBe(5)
  })

  it('contorul creste la fiecare sosire, iar documentul se opreste peste ultima fereastra', () => {
    expect(stareScena(SOSIRI[0] - 1, centre, false).locuri).toBe(1)
    expect(stareScena(SOSIRI[0], centre, false).locuri).toBe(2)
    const dupa = stareScena(SOSIRI[3] + 10, centre, false)
    expect(dupa.doc.x).toBeCloseTo(centre[4].x, 5)
    expect(dupa.doc.y).toBeCloseTo(centre[4].y + 34, 5)
  })

  it('in faza a doua pasii devin curenti pe rand si documentul ramane in panou (taiat la +-284)', () => {
    expect(stareScena(FAZA_DOI, centre, false).faza).toBe(2)
    PASI.forEach((p, i) => expect(stareScena(p + 1, centre, false).pas).toBe(i))
    for (let u = FAZA_DOI; u <= 1800; u += 25) {
      const st = stareScena(u, centre, false)
      expect(Math.abs(st.doc.x)).toBeLessThanOrEqual(TAIERE + 1e-9)
      expect(st.doc.scara).toBeCloseTo(0.9, 5)
    }
    expect(stareScena(PASI[2], centre, false).doc.x).toBeCloseTo(SX[2], 5)
  })

  it('sub 600 documentul nu urmeaza pasii: sta la (0, -168)', () => {
    const st = stareScena(1700, centreIngust, true)
    expect(st.doc.x).toBeCloseTo(0, 5)
    expect(st.doc.y).toBeCloseTo(-168, 5)
  })

  it('distanta pe scara e legata de derulare, marginita la 0-1800', () => {
    expect(distantaPeScara(100, 2700, 900)).toBe(0)
    expect(distantaPeScara(-900, 2700, 900)).toBe(900)
    expect(distantaPeScara(-5000, 2700, 900)).toBe(1800)
  })
})

describe('HTML-ul servit al paginilor', () => {
  const flux = renderToStaticMarkup(createElement(FluxDocumente))
  const efacturare = renderToStaticMarkup(createElement(EFacturare))

  it('rutele sunt in RUTE si metadata e in praguri', () => {
    const cai = RUTE.map((r) => r.cale)
    expect(cai).toContain('/flux-documente')
    expect(cai).toContain('/e-facturare')
    expect(abateriMetadata({ ...META_FLUX, cale: '/flux-documente' })).toEqual([])
    expect(abateriMetadata({ ...META_EFACTURARE, cale: '/e-facturare' })).toEqual([])
  })

  it('/flux-documente: toate cele 7 panouri de domeniu si toate descrierile scenei sunt in HTML', () => {
    for (const d of DOMENII) {
      expect(flux).toContain('id="flux-panou-' + d.cheie + '"')
      expect(flux).toContain(d.titlu)
    }
    expect((flux.match(/role="tab"/g) ?? []).length).toBe(DOMENII.length)
    expect((flux.match(/role="tabpanel"/g) ?? []).length).toBe(DOMENII.length)
    // Un singur tab e in ordinea de tabulare (tabindex itinerant).
    expect((flux.match(/tabindex="0"/g) ?? []).length).toBe(1)
    for (const p of SCENA.pasi) expect(flux).toContain(p.descriere)
    // Fara JavaScript scena e statica: pinul nu poarta atributul de pregatire.
    expect(flux).not.toContain('data-gata')
  })

  it('/e-facturare: tabelul cu ancorele lui, legatura calendarului, FAQ-ul si datele lui structurate', () => {
    for (const p of PIETE) expect(efacturare).toContain('id="' + p.ancora + '"')
    expect(efacturare).toContain('href="/instrumente/termene.ics"')
    expect(efacturare).toContain('"@type":"FAQPage"')
    expect((efacturare.match(/<details/g) ?? []).length).toBe(5)
    // Rigla e in starea finala in HTML (fara clasa de asteptare).
    expect(efacturare).not.toContain('data-stare="asteapta"')
  })
})

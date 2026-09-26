import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { citesteCorp, valideaza } from '@/components/formular/validare'
import type { StareFormular } from '@/components/formular/stare'
import {
  coduriDinAdresa,
  corpCerere,
  GOL_INREGISTRARE,
  octeti,
  primaEroare,
  rezumatConstructor,
  valideazaInregistrare,
  type DateInregistrare,
} from '@/components/conversie/inregistrare'
import { ETICHETE_CONSTRUCTOR } from '@/components/conversie/PaginaInregistrare'
import { randuriCanale, tintaCaseta } from '@/components/conversie/PaginaContact'
import { ordineGrupuri } from '@/components/conversie/PlatformeDescarca'
import { ceas, DURATA_TOTALA, scenaLa } from '@/components/conversie/DemoInterfata'
import { abateriMetadata } from '@/components/seo/metadata'
import { citesteParametriInregistrare } from '@/content/acasa'
import {
  CALE_CONTACT,
  CALE_DESCARCA,
  CALE_INCEPE,
  CALE_INREGISTRARE,
  CONTACT,
  INCEPE,
  INREGISTRARE,
  META_CONTACT,
  META_DESCARCA,
  META_INCEPE,
  META_INREGISTRARE,
} from '@/content/conversie'
import { PANOU_DESCARCA } from '@/content/navigatie'
import { RUTE } from '@/content/rute'

/**
 * Felia conversie, fara browser: validarea contului nou, corpul cererii (fara parola), citirea
 * parametrilor constructorului (aceeasi cu cea din contractul startului), starile panoului de pe
 * /contact dupa comutator, ordinea platformelor, ceasul demonstratiei, metadata si rutele.
 */

const RADACINA = join(__dirname, '..')

const VALID: DateInregistrare = {
  ...GOL_INREGISTRARE,
  prenume: 'Ion',
  nume: 'Exemplu',
  email: ['ion', ['exemplu', 'test'].join('.')].join('@'),
  utilizator: 'ion.exemplu',
  parola: ['proba', 'lunga'].join('-'),
  termeni: true,
}

const TEXTE = {
  mesajCerere: INREGISTRARE.mesajCerere,
  mesajUtilizator: INREGISTRARE.mesajUtilizator,
  domeniu: INREGISTRARE.rezumat.domeniu,
  canale: INREGISTRARE.rezumat.canale,
  volum: INREGISTRARE.rezumat.volum,
  cine: INREGISTRARE.rezumat.cine,
}

describe('validarea contului nou', () => {
  it('formularul gol: toate obligatoriile, telefonul nu', () => {
    const e = valideazaInregistrare(GOL_INREGISTRARE)
    expect(Object.keys(e).sort()).toEqual(['email', 'nume', 'parola', 'prenume', 'termeni', 'utilizator'])
    expect(primaEroare(e)).toBe('prenume')
  })

  it('datele valide trec; bifa de noutati nu schimba nimic', () => {
    expect(valideazaInregistrare(VALID)).toEqual({})
    expect(valideazaInregistrare({ ...VALID, marketing: true })).toEqual({})
  })

  it('parola: minim 8 caractere, maxim 72 de OCTETI', () => {
    expect(valideazaInregistrare({ ...VALID, parola: 'a'.repeat(7) }).parola).toBe('parola')
    expect(valideazaInregistrare({ ...VALID, parola: 'a'.repeat(72) }).parola).toBeUndefined()
    // 37 de caractere cu diacritice = 74 de octeti: prea lunga, desi are sub 72 de caractere.
    const lunga = 'ă'.repeat(37)
    expect(octeti(lunga)).toBe(74)
    expect(valideazaInregistrare({ ...VALID, parola: lunga }).parola).toBe('parola')
  })

  it('e-mail, telefon, utilizator: forma', () => {
    expect(valideazaInregistrare({ ...VALID, email: 'fara-arond' }).email).toBe('emailForma')
    expect(valideazaInregistrare({ ...VALID, telefon: 'abc' }).telefon).toBe('telefon')
    expect(valideazaInregistrare({ ...VALID, telefon: '07xx' }).telefon).toBe('telefon')
    expect(valideazaInregistrare({ ...VALID, telefon: '+40 7' + '1' + '0 000 000' }).telefon).toBeUndefined()
    expect(valideazaInregistrare({ ...VALID, utilizator: 'ăă' }).utilizator).toBe('utilizatorForma')
    expect(valideazaInregistrare({ ...VALID, termeni: false }).termeni).toBe('termeni')
  })

  it('fiecare cod de eroare are mesaj', () => {
    for (const cod of ['prenume', 'nume', 'emailLipsa', 'emailForma', 'telefon', 'utilizatorLipsa', 'utilizatorForma', 'parola', 'termeni', 'lung'] as const) {
      expect(INREGISTRARE.erori[cod].length).toBeGreaterThan(5)
    }
  })
})

describe('corpul cererii de cont', () => {
  it('e pe contractul punctului de trimitere, trece validarea serverului si NU are parola', () => {
    const rezumat = rezumatConstructor(new URLSearchParams('ind=notariat&src=hartie&vol=v10&who=eu'), ETICHETE_CONSTRUCTOR)
    const corp = corpCerere({ ...VALID, marketing: true }, rezumat, TEXTE)
    const citit = citesteCorp(JSON.parse(JSON.stringify(corp)))
    expect(citit).not.toBeNull()
    expect(citit!.formular).toBe('inregistrare')
    expect(valideaza(citit!.date)).toEqual({})
    expect(JSON.stringify(corp)).not.toContain(VALID.parola)
    expect(corp.nume).toBe('Ion Exemplu')
    expect(corp.marketing).toBe(true)
    expect(corp.mesaj).toContain(VALID.utilizator)
    expect(corp.mesaj).toContain('Notariat')
  })

  it('martor POZITIV: o cheie de parola in corp e respinsa de server', () => {
    const corp = { ...corpCerere(VALID, null, TEXTE), parola: VALID.parola }
    expect(citesteCorp(corp)).toBeNull()
  })
})

describe('parametrii constructorului', () => {
  const ADRESE = [
    'ind=avocatura&src=email,hartie&vol=v50&who=eu',
    'ind=it&src=hartie,email,email,mesaj&vol=v99&who=nimeni',
    'ind=inexistent&src=necunoscut&vol=v0&who=altcineva',
    'src=mesaj',
    '',
    'ind=consultanta&who=coleg',
  ]

  it('citirea feliei da aceleasi coduri ca a contractului startului', () => {
    for (const a of ADRESE) {
      const p = new URLSearchParams(a)
      expect(coduriDinAdresa(p, ETICHETE_CONSTRUCTOR), a).toEqual(citesteParametriInregistrare(p))
    }
  })

  it('rezumatul: etichetele in cuvinte; nimic cand nu e niciun cod valid', () => {
    const r = rezumatConstructor(new URLSearchParams(ADRESE[0]), ETICHETE_CONSTRUCTOR)
    expect(r).toEqual({
      industrie: 'Avocatură',
      canale: ['e-mailul firmei', 'originale pe hârtie'],
      volum: 'între 10 și 50 de acte pe zi',
      cine: 'chiar eu',
    })
    expect(rezumatConstructor(new URLSearchParams(ADRESE[2]), ETICHETE_CONSTRUCTOR)).toBeNull()
  })
})

describe('/contact: comutatorul si adresa marcii', () => {
  const inchis: StareFormular = { activ: false, adresa: null, operator: null, pastrare: '', analitica: false }
  const deschis: StareFormular = { ...inchis, activ: true, operator: 'Operator Sintetic' }
  const adresa = ['contact', ['exemplu', 'test'].join('.')].join('@')

  it('operator null si fara adresa: formularul si contul inchise, fara posta', () => {
    const r = randuriCanale(inchis, null)
    expect(r).toHaveLength(4)
    expect(r[0].stare).toBe(CONTACT.canale.stareFormularInchis)
    expect(r[1].stare).toBe(CONTACT.canale.stareFormularInchis)
    expect(r[2].legatura).toBeNull()
    expect(tintaCaseta(null).href).toBe('#contact-form')
  })

  it('operator complet si adresa confirmata: toate deschise, posta cu mailto', () => {
    const r = randuriCanale(deschis, adresa)
    expect(r.slice(0, 3).every((x) => x.stare === CONTACT.canale.stareDeschis)).toBe(true)
    expect(r[2].legatura?.href).toBe('mailto:' + adresa)
    expect(tintaCaseta(adresa).href).toBe('mailto:' + adresa)
  })

  it('cardurile de subiect duc numai la rute care exista', () => {
    const cai = new Set(RUTE.map((r) => r.cale))
    for (const c of CONTACT.subiecte.carduri) expect(cai.has(c.legatura.ruta!), c.legatura.ruta!).toBe(true)
    expect(CONTACT.subiecte.carduri).toHaveLength(7)
  })
})

describe('/descarca: ordinea grupurilor', () => {
  const grupuri = PANOU_DESCARCA.grupuri

  it('platforma detectata aduce grupul ei primul, restul in ordine', () => {
    expect(ordineGrupuri(grupuri, null).map((g) => g.titlu)).toEqual(grupuri.map((g) => g.titlu))
    const android = ordineGrupuri(grupuri, 'android').map((g) => g.titlu)
    expect(android[0]).toBe('Mobil')
    expect(android.slice(1)).toEqual(grupuri.map((g) => g.titlu).filter((t) => t !== 'Mobil'))
    expect(ordineGrupuri(grupuri, 'windows')[0].titlu).toBe('Windows')
  })

  it('toate elementele duc la contul gratuit (plan §6.9)', () => {
    for (const g of grupuri) for (const e of g.elemente) expect(e.href).toBe(CALE_INREGISTRARE)
  })
})

describe('/incepe: ceasul demonstratiei', () => {
  it('scenele se succed dupa durate si ceasul are forma m:ss', () => {
    expect(DURATA_TOTALA).toBe(INCEPE.demo.scene.reduce((t, x) => t + x.durata, 0))
    expect(scenaLa(0).index).toBe(0)
    expect(scenaLa(INCEPE.demo.scene[0].durata).index).toBe(1)
    expect(scenaLa(DURATA_TOTALA + 5000).index).toBe(INCEPE.demo.scene.length - 1)
    expect(ceas(0)).toBe('0:00')
    expect(ceas(21_400)).toBe('0:21')
    expect(ceas(65_000)).toBe('1:05')
  })

  it('datele machetei sunt evident fictive (D11)', () => {
    const a = INCEPE.demo.aplicatie
    for (const t of [a.spatiu, a.dosar.cale[1], a.intrare.fisier]) expect(t.toLowerCase()).toContain('exemplu')
  })
})

describe('metadata si rutele feliei', () => {
  it('titlu 15-65, descriere 50-160, canonical pe cale', () => {
    const pagini = [
      [META_CONTACT, CALE_CONTACT],
      [META_INREGISTRARE, CALE_INREGISTRARE],
      [META_DESCARCA, CALE_DESCARCA],
      [META_INCEPE, CALE_INCEPE],
    ] as const
    for (const [m, cale] of pagini) expect(abateriMetadata({ ...m, cale }), cale).toEqual([])
  })

  it('cele 4 rute sunt in RUTE, sub marcajul feliei, o singura data', () => {
    const text = readFileSync(join(RADACINA, 'src/content/rute.ts'), 'utf8')
    const start = text.indexOf('// <<felie:conversie>>')
    const stop = text.indexOf('// <<felie:', start + 5)
    expect(start).toBeGreaterThan(0)
    const bucata = text.slice(start, stop)
    for (const cale of [CALE_CONTACT, CALE_INREGISTRARE, CALE_DESCARCA, CALE_INCEPE]) {
      expect(bucata).toContain('cale: "' + cale + '"')
      expect(RUTE.filter((r) => r.cale === cale)).toHaveLength(1)
    }
  })

  it('niciun fisier al feliei nu numeste firma-mama (D10)', () => {
    const nume = ['AD', 'RIA'].join('')
    const fisiere: string[] = []
    const aduna = (d: string) => {
      for (const f of readdirSync(d)) {
        const c = join(d, f)
        if (statSync(c).isDirectory()) aduna(c)
        else fisiere.push(c)
      }
    }
    for (const d of ['src/app/contact', 'src/app/inregistrare', 'src/app/descarca', 'src/app/incepe', 'src/components/conversie']) {
      aduna(join(RADACINA, d))
    }
    fisiere.push(join(RADACINA, 'src/content/conversie.ts'), join(RADACINA, 'src/content/afirmatii/conversie.json'))
    expect(fisiere.length).toBeGreaterThan(10)
    for (const f of fisiere) expect(readFileSync(f, 'utf8').toUpperCase().includes(nume), f).toBe(false)
  })
})

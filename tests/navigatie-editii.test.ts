import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// Analitica pornita in tot fisierul: butonul de setari cookie din subsol apare numai atunci, iar eticheta lui
// pe editie e unul dintre lucrurile masurate aici. Stub-ul nu schimba nimic altceva din subsol.
vi.mock('@/lib/analitica', async (original) => ({
  ...(await original<typeof import('../src/lib/analitica')>()),
  stareAnalitica: () => ({ activa: true, idGa4: 'G-PROBA' }),
}))

import Antet from '../src/components/global/Antet'
import Subsol, { esteExterna } from '../src/components/global/Subsol'
import BaraMobil from '../src/components/canale/BaraMobil'
import SetariCookie from '../src/components/consimtamant/SetariCookie'
import { TEXT_LEGATURA_SUBSOL } from '../src/components/consimtamant/semnal'
import { CAI_EXISTENTE } from '../src/content/cai'
import { codifica, type Canale } from '../src/content/canale'
import { CHEI_MD, caleMd } from '../src/content/juridic/md/registru'
import {
  ANTET,
  LIMBI,
  NAVIGATIE_RO,
  PALETA,
  SELECTOR_LIMBA,
  SERTAR,
  SUBSOL,
  alegePeCale,
  ctaPeCale,
  limbiPentruCale,
  multimeaCailor,
  type ContractNavigatie,
  type Legatura,
} from '../src/content/navigatie'
import { ETICHETA_WHATSAPP_EN, TEXTE_WHATSAPP_EN, navigatieEn } from '../src/content/navigatie-en'
import { TEXTE_WHATSAPP_RO_MD, coloanaJuridic, navigatieRoMd } from '../src/content/navigatie-ro-md'
import { ECHIVALENTE } from '../src/content/echivalente'
import { configurareCanale } from '../src/lib/canale-mediu'
import { citesteOperator } from '../src/lib/operator'
import { continutPaletaContract } from '../src/components/global/PaletaCautare'
import { continutPaleta } from '../src/components/global/paleta'
import { RUTE, type Ruta } from '../src/content/rute'
import { ARTICOLE } from '../src/content/blog/registru'

/**
 * Navigatia pe editie (felia navigatie-pe-editie): piesele globale primesc contractul si multimea cailor ca
 * proprietati, cu implicitul romanesc de azi; contractele EN si RO-MD aduc canalele domeniului.
 *
 * CANALELE se iau din profilul aplicatiei 3s.md (`config/profil-3s-md.json`, `CANALE_JSON`), nu se scriu aici:
 * proba masoara ce va servi domeniul. Adresa de e-mail, goala in profil, e una SINTETICA pe domeniul rezervat
 * `.test` (RFC 2606), asamblata la rulare, pentru cazurile care cer un e-mail.
 */

const RADACINA = join(__dirname, '..')
const PROFIL = JSON.parse(readFileSync(join(RADACINA, 'config', 'profil-3s-md.json'), 'utf8')) as Record<string, unknown>
const CANALE_3S_MD: Canale = configurareCanale(JSON.stringify(PROFIL.CANALE_JSON), '')
const POSTA_SINTETICA = ['posta', 'canale-3s.test'].join('@')
const CU_EMAIL: Canale = { ...CANALE_3S_MD, email: POSTA_SINTETICA }
const FARA_CANALE: Canale = { ...CANALE_3S_MD, whatsapp: '', telefon: '', email: '' }
const OPERATOR_MD = citesteOperator({ operator: (PROFIL.OPERATOR_JSON as { operator: unknown }).operator }, 'profil-3s-md')

/** Toate caile de care depinde un contract: starea in care nimic nu mai e filtrat (martorul pozitiv). */
function toateCaile(c: ContractNavigatie): Set<string> {
  const legaturi: Legatura[] = [
    c.antet.sigla,
    ...c.antet.legaturi,
    ...c.antet.legaturi.flatMap((l) => (l.foaie === null ? [] : l.foaie.elemente)),
    ...c.paleta.grupuri.flatMap((g) => g.elemente),
    ...c.subsol.coloane.flatMap((col) => col.legaturi),
    ...(c.subsol.legaturaLocala ? [c.subsol.legaturaLocala] : []),
  ]
  return multimeaCailor(legaturi.flatMap((l) => (l.ruta === null ? [] : [{ cale: l.ruta }])))
}

function hrefuri(html: string): string[] {
  return [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1].split('&amp;').join('&'))
}

describe('implicitul: contractul romanesc de azi, neschimbat', () => {
  it('NAVIGATIE_RO e facut din exact aceleasi obiecte ca exporturile de azi', () => {
    expect(NAVIGATIE_RO.antet).toBe(ANTET)
    expect(NAVIGATIE_RO.limbi).toBe(LIMBI)
    expect(NAVIGATIE_RO.selector).toBe(SELECTOR_LIMBA)
    expect(NAVIGATIE_RO.paleta).toBe(PALETA)
    expect(NAVIGATIE_RO.sertar).toBe(SERTAR)
    expect(NAVIGATIE_RO.subsol).toBe(SUBSOL)
    expect(NAVIGATIE_RO.bara).toBeNull()
  })

  it('antetul si subsolul fara proprietati randeaza identic cu contractul romanesc dat explicit', () => {
    const antet = renderToStaticMarkup(createElement(Antet))
    const subsol = renderToStaticMarkup(createElement(Subsol))
    // Controlul: randarea chiar a produs piesele (un HTML gol ar fi identic cu el insusi).
    expect(antet).toContain('<header')
    expect(subsol).toContain('<footer')
    expect(renderToStaticMarkup(createElement(Antet, { navigatie: NAVIGATIE_RO, cai: CAI_EXISTENTE }))).toBe(antet)
    expect(renderToStaticMarkup(createElement(Subsol, { navigatie: NAVIGATIE_RO, cai: CAI_EXISTENTE }))).toBe(subsol)
  })

  it('subsolul romanesc nu are coloana de canale, legatura locala, stil de grila sau bara', () => {
    const subsol = renderToStaticMarkup(createElement(Subsol))
    expect(subsol).not.toContain('data-subsol-contact')
    expect(subsol).not.toContain('--coloane-subsol')
    expect(subsol).not.toContain('hrefLang')
    expect(renderToStaticMarkup(createElement(BaraMobil, { bara: NAVIGATIE_RO.bara }))).toBe('')
  })

  it('selectorul romanesc: lista fixa, pe orice pagina, ca azi (build cu o singura editie)', () => {
    for (const cale of ['/', '/preturi', '/o-pagina-oarecare']) {
      expect(limbiPentruCale(LIMBI, cale, { x: { 'ro-RO': '/preturi', en: '/pricing' } }, ['ro-RO'])).toEqual(LIMBI)
    }
  })

  it('CTA-ul romanesc nu depinde de pagina', () => {
    expect(ctaPeCale(ANTET.cta, '/preturi')).toEqual(ANTET.cta)
  })
})

describe('filtrul de legaturi externe din subsol (fara legaturi de apel, decizia 56)', () => {
  it('mailto: si http(s) sunt externe; caile interne nu; schema de apel nu mai e recunoscuta', () => {
    expect(esteExterna(['tel', '+10000000000'].join(':'))).toBe(false)
    expect(esteExterna('mailto:' + POSTA_SINTETICA)).toBe(true)
    expect(esteExterna('https://exemplu.test/')).toBe(true)
    expect(esteExterna('/contact')).toBe(false)
    expect(esteExterna('/preturi#pachete')).toBe(false)
  })
})

describe('legaturile pe pagina (alegePeCale)', () => {
  const l = {
    implicit: 'acasa',
    pagini: [
      { cale: '/ro', prefix: false, href: 'start' },
      { cale: '/ro/juridic', prefix: true, href: 'juridic' },
      { cale: '/ro/juridic/special', prefix: true, href: 'special' },
    ],
  }
  it('exacta, apoi prefixul cel mai lung, apoi implicitul', () => {
    expect(alegePeCale(l, '/ro')).toBe('start')
    expect(alegePeCale(l, '/ro/juridic/termeni')).toBe('juridic')
    expect(alegePeCale(l, '/ro/juridic/special/x')).toBe('special')
    expect(alegePeCale(l, '/ro/juridicx')).toBe('acasa')
    expect(alegePeCale(l, '/altceva')).toBe('acasa')
  })
})

describe('contractul EN (navigatie-en.ts)', () => {
  const en = navigatieEn(CANALE_3S_MD, CAI_EXISTENTE)

  it('canalele profilului 3s.md exista (controlul preconditiei: altfel cazurile de mai jos n-ar masura nimic)', () => {
    expect(CANALE_3S_MD.whatsapp).toMatch(/^\d{8,15}$/)
    expect(CANALE_3S_MD.telefon).toMatch(/^\+\d{8,15}$/)
    expect(CANALE_3S_MD.formulare).toBe(false)
  })

  it('CTA-ul antetului e WhatsApp cu textul paginii curente; o pagina fara intrare foloseste en-home', () => {
    const peCale = (cale: string) => ctaPeCale(en.antet.cta, cale).href ?? ''
    const text = (href: string) => decodeURIComponent(new URL(href).searchParams.get('text') ?? '')
    expect(en.antet.cta.text).toBe(ETICHETA_WHATSAPP_EN)
    expect(peCale('/')).toMatch(new RegExp('^https://wa\\.me/' + CANALE_3S_MD.whatsapp + '\\?text='))
    expect(text(peCale('/'))).toContain('[ref:en-home]')
    expect(text(peCale('/pricing'))).toContain('[ref:en-price]')
    expect(text(peCale('/legal/privacy'))).toContain('[ref:en-home]')
    expect(text(peCale('/o-adresa-necunoscuta'))).toContain('[ref:en-home]')
    // Fiecare pagina din tabel are textul ei, cu marcajul ei, o singura data.
    for (const t of TEXTE_WHATSAPP_EN) {
      expect(text(peCale(t.cale)), t.cale).toBe(t.text)
    }
  })

  it('codificarea legaturii WhatsApp e cea din documentul de continut (forma generata cu quote(safe=""))', () => {
    const asteptat =
      'https://wa.me/' +
      CANALE_3S_MD.whatsapp +
      '?text=Hello%203S%2C%20I%20read%20your%20website%20%5Bref%3Aen-home%5D.%20I%20would%20like%20to%20ask%20about%20a%20pilot.'
    expect(ctaPeCale(en.antet.cta, '/').href).toBe(asteptat)
  })

  it('e-mailul: absent fara adresa; cu adresa, subiectul si corpul din §4.5 (forma de referinta, cu paranteze codificate)', () => {
    expect(en.subsol.contact?.email).toBeNull()
    const cu = navigatieEn(CU_EMAIL, CAI_EXISTENTE)
    const mailto = alegePeCale(cu.subsol.contact!.email!.legatura, '/')
    expect(mailto).toBe(
      'mailto:' +
        POSTA_SINTETICA +
        '?subject=3S%20inquiry%20%5Bref%3Aen-home%5D&body=Hello%203S%2C%0D%0A%0D%0AI%20read%20your%20website.%20I%20would%20like%20to%20ask%20about%20a%20pilot.%0D%0A%0D%0AMy%20archive%20%28paper%2C%20scans%20or%20files%29%20and%20country%3A%0D%0A',
    )
    expect(alegePeCale(cu.subsol.contact!.email!.legatura, '/contact')).toContain(codifica('[ref:en-contact]'))
  })

  it('fara formular, cont, descarcare sau "0 RON"; meniurile au toate paginile', () => {
    // Numai VALORILE (cheia `descarca` a contractului nu e o legatura); martorul: contractul romanesc le are.
    const valori = (o: unknown): string[] =>
      typeof o === 'string' ? [o] : o !== null && typeof o === 'object' ? Object.values(o).flatMap(valori) : []
    const interzise = /\/inregistrare|\/descarca|0 RON/
    expect(valori(NAVIGATIE_RO).some((v) => interzise.test(v))).toBe(true)
    expect(valori(en).filter((v) => interzise.test(v))).toEqual([])
    expect(en.antet.autentificare.href).toBeNull()
    expect(en.antet.descarca).toBeNull()
    // Fara "Solutions": paginile de segment au iesit de la lansare (decizia 38); proba grupului e in tests/en-nucleu.test.ts.
    expect(en.antet.legaturi.map((l) => l.text)).toEqual(['Product', 'Guides', 'Pricing', 'About & security'])
  })

  it('coloana Legal: adresele din config/juridic-rute.json (editia en), cele 8 documente, in ordinea registrului', () => {
    const legal = en.subsol.coloane.find((c) => c.titlu === 'Legal')!
    expect(legal.legaturi.map((l) => l.href)).toEqual(CHEI_MD.map((c) => caleMd(c, 'en')))
  })

  it('subsolul pe 3s.md: wa.me in coloana Contact, numarul de WhatsApp ca text, fara legatura de apel, informatiile legale in romana, 0 <form', () => {
    const cai = toateCaile(en)
    const html = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai }))
    const h = hrefuri(html)
    expect(h.some((x) => x.startsWith('https://wa.me/' + CANALE_3S_MD.whatsapp + '?text='))).toBe(true)
    // Decizia 56: numarul ramane, ca numar de WhatsApp, numai ca text; nicio legatura de apel.
    expect(html).toMatch(/<span[^>]*>WhatsApp: \+\d{3} \d{2} \d{3} \d{3}<\/span>/)
    expect(h.filter((x) => /^tel/i.test(x))).toEqual([])
    expect(h).toContain(caleMd('informatii-legale', 'ro'))
    expect(html).toMatch(/<a[^>]*lang="ro"[^>]*>Informații legale<\/a>/)
    expect(html).not.toContain('<form')
    expect(h.filter((x) => /inregistrare|descarca/.test(x))).toEqual([])
    expect(html).not.toContain('mailto:')
  })

  it('martor: fara ruta romaneasca in build, legatura locala nu se randeaza (filtrul pe RUTE)', () => {
    const cai = toateCaile(en)
    cai.delete(caleMd('informatii-legale', 'ro'))
    const html = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai }))
    expect(html).toContain('<footer')
    expect(hrefuri(html)).not.toContain(caleMd('informatii-legale', 'ro'))
  })

  it('eticheta EN a butonului de setari cookie vine din contract; implicitul ramane textul romanesc', () => {
    expect(en.subsol.setariCookie).toBe('Cookie settings')
    expect(renderToStaticMarkup(createElement(SetariCookie, { text: 'Cookie settings' }))).toContain('>Cookie settings</button>')
    expect(renderToStaticMarkup(createElement(SetariCookie))).toContain('>' + TEXT_LEGATURA_SUBSOL + '</button>')
    // Subsolul (cu analitica pornita in acest fisier) da butonului eticheta contractului.
    const htmlEn = renderToStaticMarkup(createElement(Subsol, { navigatie: en, cai: toateCaile(en) }))
    expect(htmlEn).toMatch(/data-cookie-settings="">Cookie settings<\/button>/)
    const htmlRo = renderToStaticMarkup(createElement(Subsol))
    expect(htmlRo).toContain('data-cookie-settings="">' + TEXT_LEGATURA_SUBSOL + '</button>')
  })

  it('antetul EN: CTA-ul WhatsApp, fara autentificare si fara Descarca', () => {
    const html = renderToStaticMarkup(createElement(Antet, { navigatie: en, cai: toateCaile(en) }))
    expect(hrefuri(html).some((x) => x.startsWith('https://wa.me/'))).toBe(true)
    expect(html).toContain(ETICHETA_WHATSAPP_EN)
    expect(html).toContain('aria-label="Main menu"')
    expect(html).not.toContain(ANTET.autentificare.text)
    expect(html).not.toContain(ANTET.descarca.text)
  })

  it('bara de pe mobil: un singur buton, WhatsApp (fara apel, decizia 56); nimic fara canale', () => {
    const html = renderToStaticMarkup(createElement(BaraMobil, { bara: en.bara }))
    expect(hrefuri(html)).toHaveLength(1)
    expect(hrefuri(html).some((x) => x.startsWith('https://wa.me/'))).toBe(true)
    expect(html).toContain('data-bara-distantier')
    const gol = navigatieEn(FARA_CANALE, CAI_EXISTENTE)
    expect(renderToStaticMarkup(createElement(BaraMobil, { bara: gol.bara }))).toBe('')
    expect(gol.antet.cta.href).toBeNull()
    expect(gol.subsol.contact).toEqual({ titlu: 'Contact', whatsapp: null, numar: null, email: null })
  })
})

describe('selectorul pe editii (limbiPentruCale)', () => {
  const en = navigatieEn(CANALE_3S_MD, CAI_EXISTENTE)
  const echivalente = { confidentialitate: { en: '/legal/privacy', 'ro-MD': '/ro/juridic/confidentialitate' } }

  it('cu echivalent: ambele editii, tinta pe echivalent, bifa pe editia paginii', () => {
    const peEn = limbiPentruCale(en.limbi, '/legal/privacy', echivalente, ['en', 'ro-MD'])
    expect(peEn.map((l) => [l.cod, l.href, l.activa])).toEqual([
      ['EN', '/legal/privacy', true],
      ['RO', '/ro/juridic/confidentialitate', false],
    ])
    const peRo = limbiPentruCale(en.limbi, '/ro/juridic/confidentialitate', echivalente, ['en', 'ro-MD'])
    expect(peRo.find((l) => l.activa)?.cod).toBe('RO')
  })

  it('fara echivalent, sau cu o singura editie in build: niciun selector', () => {
    expect(limbiPentruCale(en.limbi, '/pricing', echivalente, ['en', 'ro-MD'])).toEqual([])
    expect(limbiPentruCale(en.limbi, '/legal/privacy', echivalente, ['en'])).toEqual([])
  })
})

describe('contractul RO-MD (navigatie-ro-md.ts, planul valului §11 pct. 2b)', () => {
  it('antetul: sigla spre /ro, meniul oglinda EN, CTA-ul "Scrie-ne pe WhatsApp" cu textul paginii', () => {
    const md = navigatieRoMd(CANALE_3S_MD, null)
    expect(md.antet.sigla.href).toBe('/ro')
    // AUTORIZARE (felia meniu-antet-ro, decizia 59: /ro oglindeste EN): aici se cerea meniul vechi, numai "Contact"
    // (`/ro/contact`), cand EN avea Product, Guides, Pricing si About. Meniul e acum perechea celui EN, masurata
    // intrare cu intrare in cazul urmator; faptul pazit aici ramane: sigla si CTA-ul cu textul paginii.
    expect(md.antet.legaturi.map((l) => [l.text, l.href])).toEqual([
      ['Produs', '/ro/platforma'],
      ['Ghiduri', '/ro/ghiduri/arhivare-e-facturi-ue'],
      ['Prețuri', '/ro/preturi'],
      ['Despre 3S și securitate', '/ro/securitate'],
    ])
    expect(md.antet.cta.text).toBe('Scrie-ne pe WhatsApp')
    const text = (cale: string) => decodeURIComponent(new URL(ctaPeCale(md.antet.cta, cale).href ?? '').searchParams.get('text') ?? '')
    expect(text('/ro')).toBe(TEXTE_WHATSAPP_RO_MD[0].text)
    expect(text('/ro/contact')).toContain('[ref:ro-md-contact]')
    expect(text('/ro/juridic/termeni')).toContain('[ref:ro-md-juridic]')
    expect(text('/ro/o-pagina-fara-intrare')).toContain('[ref:ro-md-acasa]')
  })

  it('meniul antetului /ro: acelasi numar de intrari si aceeasi ordine ca EN, fiecare tinta e perechea /ro a tintei EN', () => {
    // Perechea asteptata vine din tabelul de echivalente (cheia paginii EN), nu din contractul RO-MD.
    const peRo = new Map(Object.values(ECHIVALENTE).flatMap((p) => (p.en && p['ro-MD'] ? [[p.en, p['ro-MD']] as const] : [])))
    const en = navigatieEn(CANALE_3S_MD).antet.legaturi
    const md = navigatieRoMd(CANALE_3S_MD, null).antet.legaturi
    // Controlul: EN are meniu (nu comparam doua liste goale), iar tabelul cunoaste macar startul.
    expect(en.length).toBeGreaterThan(1)
    expect(peRo.get('/')).toBe('/ro')
    expect(md).toHaveLength(en.length)
    en.forEach((l, i) => {
      expect(md[i].href, 'intrarea ' + i + ' (' + l.text + ')').toBe(peRo.get(l.href ?? '') ?? '(fara pereche: ' + l.href + ')')
      expect(md[i].foaie === null, 'foaia intrarii ' + i).toBe(l.foaie === null)
      if (l.foaie && md[i].foaie) {
        expect(md[i].foaie!.elemente.map((e) => e.href)).toEqual(l.foaie.elemente.map((e) => peRo.get(e.href ?? '') ?? '(fara pereche: ' + e.href + ')'))
        expect(md[i].foaie!.elemente.map((e) => e.iconita)).toEqual(l.foaie.elemente.map((e) => e.iconita))
      }
    })
    // Etichetele meniului sunt cele deja folosite pe /ro (subsol si paleta), nu text nou.
    // Lista e FIXA, copiata din subsolul si paleta /ro de dinaintea meniului (main bf53bc7), nu citita din contract:
    // coloanele Produs si Ghiduri ale subsolului se iau acum din aceleasi foi ca meniul, deci o eticheta noua intr-o
    // foaie ar aparea simultan in meniu si in subsol, iar o multime derivata din contract n-ar putea pica.
    // O eticheta noua in meniu se adauga aici numai cu decizia care o aproba.
    const existente = new Set([
      // titlurile coloanelor de subsol
      'Produs',
      'Ghiduri',
      'Companie',
      // coloana Produs
      'Platforma',
      'Căutare cu sursa citată',
      'Enterprise',
      // coloana Ghiduri
      'Arhivarea e-facturilor în UE',
      'Termene de păstrare în Moldova',
      '3S și Google Drive',
      // coloana Companie
      'Despre 3S și securitate',
      // Legatura spre sectiunea #security: fosta „Securitatea și locul datelor” (al doilea nume al aceleiasi pagini),
      // redenumita dupa eticheta existenta a sectiunii de pe /ro/platforma si a cardului de pe /ro/enterprise
      // (decizia 82, audit de limba 09.10: un singur nume al paginii in meniu, subsol si Termeni 15.11).
      'Locul datelor',
      'Prețuri',
      'Contact',
      // paleta (in plus fata de subsol)
      'Acasă',
    ])
    const etichete = md.flatMap((l) => [l.text, ...(l.foaie ? [l.foaie.eticheta, ...l.foaie.elemente.map((e) => e.text)] : [])])
    // Controlul: meniul are etichete (nu filtram o lista goala): 4 intrari + 2 foi x (eticheta + 3 elemente).
    expect(etichete).toHaveLength(12)
    expect(etichete.filter((t) => !existente.has(t))).toEqual([])
    // Lista fixa nu a ramas in urma contractului: fiecare eticheta de subsol si paleta de azi e tot in ea
    // (coloana Juridic are titlurile documentelor, verificate in alta parte, deci se exclude).
    const full = navigatieRoMd(CANALE_3S_MD, null)
    const azi = [
      ...full.subsol.coloane.filter((c) => c.titlu !== 'Juridic').flatMap((c) => [c.titlu, ...c.legaturi.map((x) => x.text)]),
      ...full.paleta.grupuri.flatMap((g) => g.elemente.map((x) => x.text)),
    ]
    expect(azi.filter((t) => !existente.has(t))).toEqual([])
  })

  it('meniul antetului /ro: declansatorul Ghiduri duce la primul ghid care exista, ca pe EN', () => {
    const ghiduri = (cai: Set<string>) => navigatieRoMd(CANALE_3S_MD, null, cai).antet.legaturi[1]
    expect(ghiduri(new Set(['/ro/ghiduri/termene-pastrare-moldova', '/ro/comparatie-drive'])).href).toBe('/ro/ghiduri/termene-pastrare-moldova')
    // Fara niciun ghid, tinta ramane pe primul (care nu exista), deci declansatorul nu se randeaza.
    expect(ghiduri(new Set()).href).toBe('/ro/ghiduri/arhivare-e-facturi-ue')
  })

  it('coloana Juridic: cele 8 documente, adresele editiei ro, titlurile documentelor (nu scrise de mana)', () => {
    expect(OPERATOR_MD).not.toBeNull()
    const col = coloanaJuridic(OPERATOR_MD)
    expect(col?.titlu).toBe('Juridic')
    expect(col!.legaturi.map((l) => l.href)).toEqual(CHEI_MD.map((c) => caleMd(c, 'ro')))
    expect(col!.legaturi[0].text).toBe('Informații legale')
    // Fara operator nu exista documente, deci nici coloana.
    expect(coloanaJuridic(null)).toBeNull()
  })

  it('subsolul: Juridic si Contact, fara insigne si fara formular', () => {
    const md = navigatieRoMd(CANALE_3S_MD, OPERATOR_MD)
    const html = renderToStaticMarkup(createElement(Subsol, { navigatie: md, cai: toateCaile(md) }))
    expect(html).toContain('>Juridic</h2>')
    expect(html).toContain('>Contact</h2>')
    expect(hrefuri(html).filter((x) => /^tel/i.test(x))).toEqual([])
    expect(html).toContain('>WhatsApp: +373 ')
    expect(html).not.toContain('<form')
    expect(html).not.toContain(SUBSOL.insigne[0].text)
  })
})

describe('paleta de cautare pe contract (continutPaletaContract)', () => {
  const paletaEn = navigatieEn(CANALE_3S_MD).paleta
  // Caile si rutele sunt SINTETICE, ca rezultatul asteptat sa nu depinda de ce pagini EN exista azi in build.
  const cai = new Set(['/', '/pricing', '/contact', '/plans'])
  const ruta = (cale: string, scurt: string, descriere: string): Ruta => ({ cale, scurt, descriere, inHarta: true })
  const rute: Ruta[] = [
    ruta('/', 'Home', 'The first page'),
    ruta('/pricing', 'Pricing', 'What a plan costs'),
    ruta('/contact', 'Contact', 'Write to us'),
    // in cai, in afara contractului: intra la cautare, DUPA paginile contractului
    ruta('/plans', 'Plans', 'Pricing for teams'),
    // martor negativ: potriveste interogarea, dar calea nu exista in build
    ruta('/pricing-old', 'Pricing archive', 'Old pricing'),
  ]

  it('fara interogare: numai grupurile contractului, filtrate pe caile existente', () => {
    expect(continutPaletaContract(paletaEn, '', cai, rute, [])).toEqual([
      {
        titlu: 'Pages',
        elemente: [
          { titlu: 'Home', cale: '/' },
          { titlu: 'Pricing', cale: '/pricing' },
          { titlu: 'Contact', cale: '/contact' },
        ],
      },
      { titlu: 'Actions', elemente: [{ titlu: 'Contact 3S', cale: '/contact' }] },
    ])
  })

  it('o interogare care nu potriveste nimic intoarce o lista goala', () => {
    expect(continutPaletaContract(paletaEn, ['zq', 'xw', 'vk'].join(''), cai, rute, [])).toEqual([])
  })

  it('o interogare potrivita: pagina din contract, apoi ruta existenta din afara lui; nimic in rest', () => {
    expect(continutPaletaContract(paletaEn, 'PRICING', cai, rute, [])).toEqual([
      {
        titlu: 'Pages',
        elemente: [
          { titlu: 'Pricing', cale: '/pricing' },
          { titlu: 'Plans', cale: '/plans' },
        ],
      },
    ])
    expect(continutPaletaContract(paletaEn, 'home', cai, rute, [])).toEqual([
      { titlu: 'Pages', elemente: [{ titlu: 'Home', cale: '/' }] },
    ])
  })

  it('contractul romanesc intoarce exact continutPaleta', () => {
    for (const q of ['', 'pret', 'securitate', ['zq', 'xw'].join('')]) {
      expect(continutPaletaContract(PALETA, q, CAI_EXISTENTE, RUTE, ARTICOLE)).toEqual(
        continutPaleta(q, CAI_EXISTENTE, RUTE, ARTICOLE),
      )
    }
    // controlul preconditiei: altfel egalitatea de mai sus ar compara doua liste goale
    expect(continutPaleta('', CAI_EXISTENTE, RUTE, ARTICOLE).length).toBeGreaterThan(0)
  })
})

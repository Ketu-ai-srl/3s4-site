import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { anteteSecuritate } from '../../next.config'
import { CALE_SECURITY_TXT, ZILE_VALABILITATE } from '../../src/app/.well-known/security.txt/continut'
import { CAMP_CAPCANA } from '../../src/components/formular/validare'
import { EMAIL_SECURITATE } from '../../src/content/produs/securitate'
import { adresaSite } from '../../src/lib/site'
import { RADACINA, nemasurat } from './ajutor/proiect'

/**
 * Felia de securitate, pe build-ul REAL (auditul ISO 27001 al site-ului, 27.09):
 *   - 3S4-F-007: cele sase antete pe /, pe o pagina interioara, pe /api/sanatate si pe un 404;
 *     HSTS numai daca build-ul a fost facut cu SITE_ENV=productie (se citeste din manifestul
 *     build-ului, fiindca antetele intra acolo la construire); consola fara erori CSP pe 5 rute;
 *   - 3S4-F-026: /.well-known/security.txt si butonul blocului de raportare;
 *   - 3S4-F-008: campul-capcana din formular nu se vede si nu se atinge cu tastatura.
 * Garda punctelor de scriere, capcana si durata pe server au probele in `tests/securitate.test.ts`.
 */

const RUTE_ANTETE = ['/', '/securitate', '/api/sanatate', '/nu-exista-' + String(66)]
const RUTE_CONSOLA = ['/', '/securitate', '/enterprise', '/contact', '/preturi']

type Antet = { key: string; value: string }

/** Antetele pe care build-ul le serveste, din manifestul lui (`next build` le scrie acolo). */
function anteteDinManifest(): Antet[] {
  let manifest: { headers?: { source: string; headers: Antet[] }[] }
  try {
    manifest = JSON.parse(readFileSync(join(RADACINA, '.next', 'routes-manifest.json'), 'utf8'))
  } catch (e) {
    nemasurat('manifestul build-ului lipseste sau nu se citeste: ' + String(e))
  }
  const toate = (manifest.headers ?? []).flatMap((h) => h.headers)
  if (toate.length === 0) nemasurat('manifestul build-ului nu are niciun antet')
  return toate
}

function erori(pagina: Page): string[] {
  const gasite: string[] = []
  pagina.on('console', (m) => {
    if (m.type() === 'error') gasite.push(m.text())
  })
  pagina.on('pageerror', (e) => gasite.push(String(e)))
  return gasite
}

const eCsp = (mesaj: string) => /Content Security Policy|frame-ancestors|object-src|base-uri|form-action/i.test(mesaj)

test.describe('antetele de securitate (3S4-F-007)', () => {
  const manifest = anteteDinManifest()
  const productie = manifest.some((a) => a.key === 'Strict-Transport-Security')
  const asteptate = anteteSecuritate(productie ? 'productie' : undefined)

  for (const cale of RUTE_ANTETE) {
    test('fiecare antet pe ' + cale + ', HSTS numai pe productie', async ({ request }) => {
      const r = await request.get(cale, { failOnStatusCode: false, maxRedirects: 0 })
      const primite = r.headers()
      console.log('[antete] ' + cale + ' -> ' + r.status() + ' | HSTS: ' + (primite['strict-transport-security'] ?? 'ABSENT'))
      for (const { key, value } of asteptate) {
        expect(primite[key.toLowerCase()], key + ' pe ' + cale).toBe(value)
      }
      if (!productie) expect(primite['strict-transport-security'], 'HSTS in afara productiei pe ' + cale).toBeUndefined()
    })
  }

  test('manifestul build-ului e cel al mediului rularii (SITE_ENV=productie <=> HSTS)', () => {
    expect(productie).toBe(process.env.SITE_ENV === 'productie')
  })

  test('martor NEGATIV: fara SITE_ENV=productie, lista de antete nu are HSTS', () => {
    expect(anteteSecuritate('local').map((a) => a.key)).not.toContain('Strict-Transport-Security')
    expect(anteteSecuritate('productie').map((a) => a.key)).toContain('Strict-Transport-Security')
  })

  for (const cale of RUTE_CONSOLA) {
    test('consola fara erori CSP pe ' + cale + ' la 1440', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      const gasite = erori(page)
      await page.goto(cale, { waitUntil: 'load' })
      await page.mouse.wheel(0, 4000)
      await page.waitForTimeout(800)
      const latime = await page.evaluate(() => window.innerWidth)
      console.log('[consola] ' + cale + ' innerWidth=' + latime + ' erori=' + gasite.length + ' CSP=' + gasite.filter(eCsp).length)
      expect(latime).toBe(1440)
      expect(gasite.filter(eCsp)).toEqual([])
    })
  }

  test('martor POZITIV: un <object> injectat e refuzat de CSP si eroarea apare in consola', async ({ page }) => {
    const gasite = erori(page)
    await page.goto('/')
    await page.evaluate(() => {
      const o = document.createElement('object')
      o.data = '/icon.svg'
      o.type = 'image/svg+xml'
      document.body.appendChild(o)
    })
    await expect.poll(() => gasite.filter(eCsp).length, { timeout: 5_000 }).toBeGreaterThan(0)
    console.log('[consola martor] ' + gasite.filter(eCsp)[0])
  })
})

test.describe('security.txt si canalul de raportare (3S4-F-026)', () => {
  test('security.txt: text simplu, campurile RFC 9116, Expires la ~180 de zile de la build', async ({ request }) => {
    const r = await request.get(CALE_SECURITY_TXT)
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toContain('text/plain')
    const text = await r.text()
    console.log('[security.txt]\n' + text)
    const site = adresaSite()
    expect(text).toContain('Contact: mailto:' + EMAIL_SECURITATE)
    expect(text).toContain('Preferred-Languages: ro, en')
    expect(text).toContain('Policy: ' + site + '/securitate')
    expect(text).toContain('Canonical: ' + site + CALE_SECURITY_TXT)
    const expira = Date.parse(/^Expires: (.+)$/m.exec(text)?.[1] ?? '')
    const zile = (expira - Date.now()) / 86_400_000
    // Build-ul e din aceeasi rulare; o zi de toleranta acopera un build facut ieri.
    expect(zile).toBeGreaterThan(ZILE_VALABILITATE - 2)
    expect(zile).toBeLessThanOrEqual(ZILE_VALABILITATE)
  })

  test('blocul de raportare de pe /securitate trimite la adresa de securitate', async ({ page }) => {
    await page.goto('/securitate')
    const bloc = page.locator('section[aria-labelledby="securitate-bloc-08"]')
    const legaturi = await bloc.locator('a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
    console.log('[raportare] ' + JSON.stringify(legaturi))
    expect(legaturi).toContain('mailto:' + EMAIL_SECURITATE)
    expect(legaturi).not.toContain('/contact')
  })
})

test.describe('campul-capcana al formularului (3S4-F-008)', () => {
  test('martor NEGATIV: capcana nu se vede, e aria-hidden si Tab nu ajunge la ea', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/enterprise')
    const capcana = page.locator('#contact-form input[name="' + CAMP_CAPCANA + '"]')
    await expect(capcana).toHaveCount(1)
    expect(await capcana.getAttribute('tabindex')).toBe('-1')
    expect(await capcana.evaluate((e) => e.closest('[aria-hidden="true"]') !== null)).toBe(true)
    const cutie = await capcana.boundingBox()
    expect(cutie === null || cutie.x + cutie.width <= 0).toBe(true)
    // Tab prin tot formularul: focusul trece prin campuri si nu atinge capcana.
    await page.locator('#contact-form input[name="nume"]').focus()
    const atinse: string[] = []
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      atinse.push(await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.name ?? ''))
    }
    console.log('[capcana] Tab: ' + atinse.join(', '))
    expect(atinse).toContain('mesaj')
    expect(atinse).not.toContain(CAMP_CAPCANA)
  })
})

#!/usr/bin/env python3
"""Proba lui `compara-build.py`, rulata ca PROCES pe colectii fabricate (formatul scris de `colecteaza-build.mjs`).

Ce masoara, cu martor pe fiecare clasa:
  (1) o colectie comparata cu ea insasi: zero diferente SI numarul de pagini comparate egal cu numarul cailor
      colectiei; aceeasi colectie construita cu ALT id de build si alta data `Expires` in security.txt: tot zero
      (normalizarea chiar ruleaza); doua
      colectii goale: cod 3, nu verde;
  (2) o copie cu un cuvant schimbat intr-o pagina: exact o diferenta, numita pe cale si cu motivul intreg; la fel
      numai pentru status, numai pentru un antet (schimbat si adaugat), un corp binar si o pagina lipsa;
  (3) doua domenii fabricate din acelasi generator (perechea `/ro/contact` <-> `/contact`, numarul +373 inlocuit
      cu +40, originea, caile, limba): ROSU pe `invarianta`, VERDE pe `identitate`;
  (4) aceeasi pereche, cu o legatura `/contact` lasata netradusa pe o pagina `/en/...` a lui B: ROSU pe
      `identitate`, numita pe acea pagina; plus martorii fiecarei reguli din lista inchisa (hreflang tradus,
      `@id` cu calea tradusa, numar netradus, harta cu intrari `/en`, pagina fara pereche, cheie necunoscuta);
  (5) patru MUTANTI pe o COPIE a uneltei (traducerea cailor oprita, comparatia corpului oprita, antetele
      ignorate, statusul ignorat): proba trebuie sa-i prinda pe toti, si se verifica intai ca mutatia a aterizat.

Fixturile se asambleaza la RULARE, din bucati: numerele, domeniile si adresele nu stau scrise intregi aici.
`--compara <cale>` ruleaza proba pe alta copie a uneltei (de pilda un mutant scris de mana).

IESIRE: 0 toate cazurile trec - 1 macar unul pica - 3 preconditie lipsa (unealta, normalizatorul sau node lipsesc)
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

AICI = os.path.dirname(os.path.abspath(__file__))
PORTI = os.path.dirname(AICI)
RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(PORTI)))
NORMALIZATOR = os.path.join(RADACINA, 'tests', 'fixturi', 'invarianta-ro', 'normalizeaza.ts')
CURAT, PICAT, NEMASURAT = 0, 1, 3
BS = chr(92)
T = P = 0
UNEALTA = os.path.join(PORTI, 'compara-build.py')


def ok(mesaj):
    global T
    T += 1
    print('  OK   ' + mesaj)


def nu(mesaj):
    global P
    P += 1
    print('  PICA ' + mesaj)


# ------------------------------------------------------------------ cele doua domenii fabricate

def domeniu(nume, tld, prefix, cifre, afisat, servita, canonical_en_spre=None):
    return {
        'origine': 'https://' + nume + '.' + tld,
        'domeniu': nume + '.' + tld,
        'email': 'contact' + '@' + nume + '.' + tld,
        'telefonAfisat': '+' + prefix + ' ' + afisat,
        'telefonE164': '+' + prefix + cifre,
        'whatsapp': prefix + cifre,
        'limba': 'ro-' + ('MD' if prefix.startswith('37') else 'RO'),
        'ogLocale': 'ro_' + ('MD' if prefix.startswith('37') else 'RO'),
        'servita': servita,
        'canonical_en_spre': canonical_en_spre,
    }


TABEL_B = {'/': '/en', '/pricing': '/en/pricing', '/contact': '/en/contact', '/ro': '/', '/ro/contact': '/contact'}
DA = domeniu('proba-a', 'test', '37' + '3', '60000001', '60 000 001', lambda c: c)
DB = domeniu('proba-b', 'test', '4' + '0', '700000002', '700 000 002',
             lambda c: TABEL_B[c.split('#')[0]] + ('#' + c.split('#')[1] if '#' in c else ''), canonical_en_spre=DA['origine'])
ECHIVALENT = {'/': '/ro', '/ro': '/', '/contact': '/ro/contact', '/ro/contact': '/contact'}
SURSE = ['/', '/pricing', '/contact', '/ro', '/ro/contact']


def rsc(*randuri):
    """Un script al fluxului RSC, cu ghilimelele si separatorul escapate ca in HTML-ul servit."""
    corp = ''.join('%x:%s%sn' % (i, r.replace('"', BS + '"'), BS) for i, r in enumerate(randuri))
    return '<script>self.__next_f.push([1,"' + corp + '"])</script>'


def pagina(src, d, idb, scapari=None):
    """Pagina sursei `src` pe domeniul `d`. `scapari` = {sursa: cale scrisa gresit} (martorul unei legaturi netraduse)."""
    scapari = scapari or {}
    ro = src.startswith('/ro')
    serv = d['servita'](src)
    leg = lambda s: scapari.get(s, d['servita'](s))
    canonical = (d['canonical_en_spre'] + src) if (not ro and d['canonical_en_spre']) else d['origine'] + serv
    alternate = ''
    rsc_alt = []
    if src in ECHIVALENT:
        en, rom = (src, ECHIVALENT[src]) if not ro else (ECHIVALENT[src], src)
        for hl, c in (('en', en), ('ro-' + 'MD', rom)):
            alternate += '<link rel="alternate" hrefLang="%s" href="%s"/>' % (hl, DA['origine'] + c)
            rsc_alt.append('{"rel":"alternate","hrefLang":"%s","href":"%s"}' % (hl, DA['origine'] + c))
    ld = {'@context': 'https://schema.org', '@id': d['origine'] + src + '#webpage', 'url': d['origine'] + serv,
          'inLanguage': d['limba'] if ro else 'en', 'isPartOf': {'@id': d['origine'] + '/#site'}}
    text = ('Scrie-ne pe WhatsApp la %s sau la %s. Site-ul %s.' if ro else 'Write to us at %s or %s. The %s site.') % (
        d['telefonAfisat'], d['email'], d['domeniu'])
    legaturi = ''.join('<a href="%s">%s</a>' % (leg(s), s) for s in SURSE) + '<a href="%s">planuri</a>' % (leg('/pricing') + '#planuri')
    return (
        '<!DOCTYPE html><html lang="%s"><head><meta charSet="utf-8"/><!--%s-->' % ('ro' if ro else 'en', idb)
        + '<link rel="canonical" href="%s"/>' % canonical + alternate
        + '<meta property="og:locale" content="%s"/>' % (d['ogLocale'] if ro else 'en_US')
        + '<meta property="og:url" content="%s"/>' % (d['origine'] + serv)
        + '<script type="application/ld+json">%s</script>' % json.dumps(ld, separators=(',', ':'))
        + '</head><body><main><h1>Pagina %s</h1><p>%s</p>%s' % (src, text, legaturi)
        + '<a href="https://wa.me/%s?text=salut">WhatsApp</a><a href="tel:%s">tel</a></main>' % (d['whatsapp'], d['telefonE164'])
        + '<script src="/_next/static/chunks/main-%s.js"></script>' % idb[-6:]
        + rsc('["$","a",null,{"href":"%s","children":"Contact"}]' % leg('/ro/contact' if ro else '/contact'),
              '{"buildId":"%s"}' % idb, *rsc_alt)
        + '</body></html>'
    )


def colectie_domeniu(d, idb, scapari=None, harta_en=None, extra=None):
    """Colectia completa a unui domeniu: cele 5 pagini, extrasele colectorului, pagina de negasit si o imagine."""
    pe_b = d is DB
    p = {}
    for src in SURSE:
        ro = src.startswith('/ro')
        p[d['servita'](src)] = (200, {'content-type': 'text/html; charset=utf-8', 'content-language': d['limba'] if ro else 'en'},
                                pagina(src, d, idb, scapari))
    harta_en = (not pe_b) if harta_en is None else harta_en
    locuri = [d['servita'](s) for s in SURSE if harta_en or not d['servita'](s).startswith('/en')]
    p['/sitemap.xml'] = (200, {'content-type': 'application/xml'},
                         '<?xml version="1.0"?><urlset>' + ''.join('<url><loc>%s%s</loc></url>' % (d['origine'], c) for c in locuri) + '</urlset>')
    p['/robots.txt'] = (200, {'content-type': 'text/plain'}, 'User-agent: *\nDisallow: /\nSitemap: %s/sitemap.xml\n' % d['origine'])
    p['/llms.txt'] = (200, {'content-type': 'text/plain'}, '# Proba\n- [Pricing](%s%s)\n' % (d['origine'], d['servita']('/pricing')))
    p['/manifest.webmanifest'] = (200, {'content-type': 'application/manifest+json'}, '{"name":"Proba"}')
    # `Expires` se calculeaza la build: fiecare id de build primeste alta marca de timp, ca (1) sa masoare normalizarea.
    secunde = sum(map(ord, idb)) % 60
    p['/.well-known/security.txt'] = (200, {'content-type': 'text/plain'}, 'Contact: mailto:security' + '@exemplu-proba.test\n'
                                      + 'Expires: 2027-04-02T02:40:%02d.465Z\nPreferred-Languages: ro, en\n' % secunde)
    p['/opengraph-image'] = (200, {'content-type': 'image/png'}, b'\x89PNG-proba')
    p['/colectie-cale-inexistenta-404'] = (404, {'content-type': 'text/html'}, '<html><body>%s</body></html>' % ('Negasit' if pe_b else 'Not found'))
    for k, v in (extra or {}).items():
        if v is None:
            p.pop(k, None)
        else:
            p[k] = v
    return p


def scrie_colectie(director, idb, pagini):
    os.makedirs(os.path.join(director, 'corp'), exist_ok=True)
    lista = []
    for i, (cale, (status, antete, corp)) in enumerate(sorted(pagini.items())):
        text = isinstance(corp, str)
        fisier = 'corp/%04d.%s' % (i, 'txt' if text else 'bin')
        octeti = corp.encode('utf-8') if text else corp
        open(os.path.join(director, fisier), 'wb').write(octeti)
        lista.append({'cale': cale, 'status': status, 'antete': antete, 'fisier': fisier, 'text': text,
                      'sha256': hashlib.sha256(octeti).hexdigest()})
    json.dump({'format': 1, 'idBuild': idb, 'caleInexistenta': '/colectie-cale-inexistenta-404', 'pagini': lista},
              open(os.path.join(director, 'colectie.json'), 'w', encoding='utf-8', newline='\n'))
    return director


def perechi(cale, **schimbari):
    va = {k: DA[k] for k in ('origine', 'domeniu', 'email', 'telefonAfisat', 'telefonE164', 'whatsapp', 'limba', 'ogLocale')}
    vb = {k: DB[k] for k in va}
    lista = [{'a': a, 'b': b} for a, b in TABEL_B.items()]
    lista += [{'a': c, 'b': c} for c in ('/sitemap.xml', '/robots.txt', '/llms.txt', '/manifest.webmanifest', '/.well-known/security.txt', '/opengraph-image')]
    d = {'a': va, 'b': vb, 'perechi': lista}
    d.update(schimbari)
    json.dump(d, open(cale, 'w', encoding='utf-8', newline='\n'))
    return cale


# ------------------------------------------------------------------ rularea

def ruleaza(unealta, *argumente):
    r = subprocess.run([sys.executable, unealta, '--arata', '0', '--normalizator', NORMALIZATOR, *argumente], capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, r.stdout + r.stderr


def difuri(iesire):
    return [l for l in iesire.splitlines() if l.startswith('DIF ')]


def comparate(iesire):
    m = re.search(r'pagini comparate (\d+), diferente (\d+)', iesire)
    return (int(m.group(1)), int(m.group(2))) if m else (None, None)


def cazuri(unealta, d):
    """Toate cazurile; intoarce numarul de picate din aceasta rulare."""
    inainte = P
    id_a, id_a2, id_b = 'IDPROBA-a1b2c3', 'IDPROBA-z9y8x7', 'IDPROBA-b4b4b4'
    A = colectie_domeniu(DA, id_a)
    ca = scrie_colectie(os.path.join(d, 'A'), id_a, A)
    ca2 = scrie_colectie(os.path.join(d, 'A2'), id_a2, colectie_domeniu(DA, id_a2))
    n = len(A)

    # (1)
    cod, out = ruleaza(unealta, '--regula', 'invarianta', ca, ca)
    c = comparate(out)
    (ok if cod == 0 and c == (n, 0) else nu)('(1) colectia cu ea insasi: cod %s, comparate/diferente %s, asteptat 0 si (%d, 0)' % (cod, c, n))
    cod, out = ruleaza(unealta, '--regula', 'invarianta', ca, ca2)
    (ok if cod == 0 and comparate(out) == (n, 0) else nu)('(1) aceeasi colectie cu alt id de build: cod %s, %s (normalizarea ruleaza)' % (cod, comparate(out)))
    gol = scrie_colectie(os.path.join(d, 'gol'), id_a, {})
    cod, out = ruleaza(unealta, '--regula', 'invarianta', gol, gol)
    (ok if cod == 3 else nu)('(1) doua colectii goale: cod %s, asteptat 3 (zero pagini nu e verde)' % cod)

    # (2) Pagina schimbata se ia din colectia CU ACELASI id de build in care e pusa (A2), altfel id-ul ei
    # nenormalizat face corpul diferit oricum si cazul trece si fara schimbarea plantata. Fiecare caz cere
    # exact o diferenta, cu motivul ei scris intreg: un motiv in plus (de pilda corpul, langa antet) e un esec.
    A2 = colectie_domeniu(DA, id_a2)

    def o_diferenta(eticheta, extra, cale_asteptata, motiv_asteptat):
        cx = scrie_colectie(os.path.join(d, 'x-' + re.sub(r'[^a-z0-9]+', '-', eticheta)), id_a2, colectie_domeniu(DA, id_a2, extra=extra))
        cod, out = ruleaza(unealta, '--regula', 'invarianta', ca, cx)
        ds = difuri(out)
        bun = cod == 1 and ds == ['DIF %s: %s' % (cale_asteptata, motiv_asteptat)]
        (ok if bun else nu)('(2) %s: cod %s, diferente %r' % (eticheta, cod, ds))

    sch = A2['/pricing']
    o_diferenta('un cuvant schimbat', {'/pricing': (200, sch[1], sch[2].replace('Write to us', 'Write us'))}, '/pricing',
                'corpul HTML difera dupa normalizare')
    o_diferenta('numai statusul schimbat', {'/pricing': (500, sch[1], sch[2])}, '/pricing', 'status 200 fata de 500')
    ro2 = A2['/ro']
    o_diferenta('un antet schimbat', {'/ro': (200, dict(ro2[1], **{'content-language': 'ro'}), ro2[2])}, '/ro',
                "antetul content-language: %r fata de 'ro'" % DA['limba'])
    ct2 = A2['/contact']
    o_diferenta('numai un antet adaugat', {'/contact': (200, dict(ct2[1], **{'x-robots-tag': 'noindex'}), ct2[2])}, '/contact',
                "antetul x-robots-tag: None fata de 'noindex'")
    o_diferenta('un binar schimbat', {'/opengraph-image': (200, {'content-type': 'image/png'}, b'\x89PNG-alta')}, '/opengraph-image',
                'corpul binar difera (sha256)')
    o_diferenta('o pagina lipsa', {'/llms.txt': None}, '/llms.txt', 'lipseste in B')
    sec = A2['/.well-known/security.txt']
    o_diferenta('security.txt fara randul Expires', {'/.well-known/security.txt': (200, sec[1], re.sub('Expires: [^\n]*\n', '', sec[2]))},
                '/.well-known/security.txt', 'corpul difera')
    o_diferenta('security.txt cu alt contact', {'/.well-known/security.txt': (200, sec[1], sec[2].replace('mailto:security', 'mailto:alt'))},
                '/.well-known/security.txt', 'corpul difera')

    # (3)
    B = colectie_domeniu(DB, id_b)
    cb = scrie_colectie(os.path.join(d, 'B'), id_b, B)
    pp = perechi(os.path.join(d, 'perechi.json'))
    cod, out = ruleaza(unealta, '--regula', 'invarianta', ca, cb)
    (ok if cod == 1 else nu)('(3) cele doua domenii pe invarianta: cod %s, asteptat 1 (%d diferente)' % (cod, len(difuri(out))))
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca, cb)
    c = comparate(out)
    (ok if cod == 0 and c == (n, 0) else nu)('(3) cele doua domenii pe identitate: cod %s, %s, asteptat 0 si (%d, 0); %r' % (cod, c, n, difuri(out)[:3]))
    def tot_textul(director):
        return ''.join(open(os.path.join(director, 'corp', f), encoding='utf-8').read()
                       for f in os.listdir(os.path.join(director, 'corp')) if f.endswith('.txt'))
    tb, ta = tot_textul(cb), tot_textul(ca)
    bun = DB['telefonAfisat'] in tb and DA['telefonAfisat'] not in tb and DA['telefonAfisat'] in ta and DB['telefonAfisat'].startswith('+' + '40 ')
    (ok if bun else nu)('(3) controlul fixturii: B poarta numarul +40 si nu pe cel +373, A pe cel +373')

    # (4) si martorii regulilor
    def identitate_rosie(eticheta, colectie_b, cale_asteptata, fisier_perechi=pp, cod_asteptat=1):
        cx = scrie_colectie(os.path.join(d, 'y-' + re.sub(r'[^a-z0-9]+', '-', eticheta)), id_b, colectie_b)
        cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', fisier_perechi, ca, cx)
        ds = difuri(out)
        bun = cod == cod_asteptat and (cale_asteptata is None or (len(ds) == 1 and cale_asteptata in ds[0]))
        (ok if bun else nu)('(4) %s: cod %s, diferente %r' % (eticheta, cod, ds[:3]))

    identitate_rosie('legatura /contact netradusa pe /en/pricing',
                     colectie_domeniu(DB, id_b, extra={'/en/pricing': (200, B['/en/pricing'][1], pagina('/pricing', DB, id_b, {'/contact': '/contact'}))}),
                     '/pricing -> /en/pricing')
    alt = B['/']
    identitate_rosie('hreflang tradus pe B', colectie_domeniu(DB, id_b, extra={'/': (200, alt[1], alt[2].replace(
        'hrefLang="en" href="%s/"' % DA['origine'], 'hrefLang="en" href="%s/en"' % DB['origine']))}), '/ro -> /')
    alt = B['/contact']
    identitate_rosie('@id cu calea tradusa pe B', colectie_domeniu(DB, id_b, extra={'/contact': (200, alt[1], alt[2].replace(
        DB['origine'] + '/ro/contact#webpage', DB['origine'] + '/contact#webpage'))}), '/ro/contact -> /contact')
    identitate_rosie('numarul lui A ramas pe B', colectie_domeniu(DB, id_b, extra={'/contact': (200, alt[1], alt[2].replace(
        DB['telefonAfisat'], DA['telefonAfisat']))}), '/ro/contact -> /contact')
    identitate_rosie('harta lui B cu intrarile /en', colectie_domeniu(DB, id_b, harta_en=True), '/sitemap.xml')
    identitate_rosie('pagina lui B fara pereche', colectie_domeniu(DB, id_b, extra={'/en/about': A['/pricing']}), '/en/about')
    identitate_rosie('perechi cu o cheie necunoscuta', B, None, perechi(os.path.join(d, 'perechi-rea.json'), moneda='EUR'), 3)
    cod, out = ruleaza(unealta, '--regula', 'invarianta', '--perechi', pp, ca, ca)
    (ok if cod == 2 else nu)('(4) --perechi la invarianta: cod %s, asteptat 2' % cod)
    return P - inainte


def mutant(d, ancora, inlocuitor):
    copie = os.path.join(d, 'mutant-compara-build.py')
    text = open(UNEALTA, encoding='utf-8').read()
    if text.count(ancora) != 1:
        return None
    open(copie, 'w', encoding='utf-8', newline='\n').write(text.replace(ancora, inlocuitor))
    return copie if inlocuitor in open(copie, encoding='utf-8').read() else None


def main():
    global UNEALTA, P, T
    ap = argparse.ArgumentParser()
    ap.add_argument('--compara', default=UNEALTA, help='copia uneltei pe care ruleaza proba')
    UNEALTA = os.path.abspath(ap.parse_args().compara)
    for f in (UNEALTA, NORMALIZATOR):
        if not os.path.isfile(f):
            print('NEMASURAT: lipseste ' + f)
            return NEMASURAT
    if shutil.which('node') is None:
        print('NEMASURAT: node nu e in PATH (normalizatorul e TypeScript, rulat de node)')
        return NEMASURAT
    with tempfile.TemporaryDirectory(prefix='proba-compara-build-') as d:
        print('== cazurile, pe ' + UNEALTA)
        cazuri(UNEALTA, d)
        print('== (5) mutantii pe o COPIE: proba trebuie sa-i prinda')
        for eticheta, ancora, inlocuitor in (
            ('traducerea cailor oprita', "return tabel[p] + rest if p in tabel else cale", 'return cale'),
            ('comparatia corpului HTML oprita', "if na != nb:\n                motive = motive + ['corpul HTML difera dupa normalizare']",
             "if False:\n                motive = motive + ['corpul HTML difera dupa normalizare']"),
            ('antete ignorate', 'if ha.get(h) != hb.get(h):', 'if False:'),
            ('status ignorat', "if pa['status'] != pb['status']:", 'if False:'),
        ):
            copie = mutant(d, ancora, inlocuitor)
            if copie is None:
                nu('(5) mutantul "%s" nu a aterizat (ancora lipsa sau dubla): nu masoara nimic' % eticheta)
                continue
            salvat, salvat_t = P, T
            dm = os.path.join(d, 'm-' + str(abs(hash(eticheta))))
            os.makedirs(dm)
            with open(os.devnull, 'w') as nul:
                vechi = sys.stdout
                sys.stdout = nul
                try:
                    picate = cazuri(copie, dm)
                finally:
                    sys.stdout = vechi
            P, T = salvat, salvat_t
            (ok if picate > 0 else nu)('(5) mutantul "%s": %d cazuri picate pe el (asteptat > 0)' % (eticheta, picate))
    print('proba-compara-build: %d trec, %d pica' % (T, P))
    return PICAT if P else CURAT


if __name__ == '__main__':
    sys.exit(main())

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
  (5) MUTANTI pe o COPIE a uneltei (lista in `main`: traducerea cailor oprita, comparatia corpului oprita, antetele
      ignorate, statusul ignorat, martorii normalizarilor neapelati, masca destinatarilor largita la alta sectiune
      sau la tot tabelul, domeniul fara margini, valoarea egala pe ambele domenii tratata ca diferenta etc.): proba
      trebuie sa-i prinda pe toti, si se verifica intai ca mutatia a aterizat;
  (6) normalizarile `LASTMOD` si `STATIC_CU_GRUP`, pe proces: doua colectii care difera numai prin <lastmod> si prin
      amprenta unei bucati de sub un grup de rute ies egale, un cuvant schimbat langa bucata ramane diferenta; o
      copie a uneltei cu una din normalizari stricata iese NEMASURAT (3), cu martorul ei numit;
  (8) ADRESELE PAGINILOR (`url`/`item` din JSON-LD, `og:url`), a doua axa a identitatii: un defect plantat LA FEL pe
      ambele domenii (o pagina inexistenta, startul romanesc pe o pagina engleza, pagina de negasit) trece de comparatie
      si e prins numai de adrese, pe fiecare colectie; og:url-ul copiei engleze egal cu canonical-ul ei (adresa lui A)
      e forma corecta (regula 4c, impreuna cu imaginile pe originea lui A); adresa servita a copiei, imaginile pe B sau
      og:url spre alta pagina a lui A sunt rosii; zero adrese masurate e rosu. Liniile adreselor (`DIF adresa ...`) se
      numara separat de ale comparatiei, ca fiecare caz vechi sa ramana o singura diferenta a comparatiei;
  (9) NUMARUL NEDESPARTIT (felia 148): numarul afisat cu U+00A0 intre grupe pe ambele domenii (langa forma cu spatii
      obisnuite, pe aceeasi pagina) e VERDE pe identitate; numarul lui A, nedespartit, ramas pe B e ROSU si numit ca
      valoare a lui A. Trei mutanti in (5): tiparul fara U+00A0, forma nepastrata la inlocuire, cautarea literala.
  (9b) numarul lui A NUMAI nedespartit in celelalte trei locuri in care unealta il cauta: sectiunile unui document
      (amprenta scoasa, VERDE), un rand al destinatarilor care numeste si e-mailul (ramane comparat, ROSU pe B cu numarul
      lui A) si o pagina fara cifrele de WhatsApp (ramane pagina cu contact, numarul egal cu martorul). Trei mutanti in
      (5), cu potrivirea literala readusa in fiecare cautare.

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
# Data pe linia de comanda, ca o COPIE a uneltei (mutant) asezata in afara depozitului sa citeasca acelasi fisier.
JURIDIC_RUTE = os.path.join(RADACINA, 'config', 'juridic-rute.json')
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

# Documentul de confidentialitate: adresele lui se citesc din acelasi fisier ca unealta (`config/juridic-rute.json`),
# ca regula 11 (tabelul destinatarilor) sa aiba pagini pe care sa se aplice.
_CONF = json.load(open(os.path.join(RADACINA, 'config', 'juridic-rute.json'), encoding='utf-8'))['documente']['confidentialitate']
CONF_EN, CONF_RO = _CONF['en'], _CONF['ro']
PREFIX_RO = '/' + 'ro'


def domeniu(nume, tld, prefix, cifre, afisat, servita, radacina, canonical_en_spre=None):
    md = prefix.startswith('37')
    return {
        'origine': 'https://' + nume + '.' + tld,
        'domeniu': nume + '.' + tld,
        'email': 'contact' + '@' + nume + '.' + tld,
        'telefonAfisat': '+' + prefix + ' ' + afisat,
        'telefonE164': '+' + prefix + cifre,
        'whatsapp': prefix + cifre,
        'limba': 'ro-' + ('MD' if md else 'RO'),
        'ogLocale': 'ro_' + ('MD' if md else 'RO'),
        'servita': servita,
        'radacina': radacina,
        'canonical_en_spre': canonical_en_spre,
    }


TABEL_B = {'/': '/en', '/pricing': '/en/pricing', '/contact': '/en/contact', CONF_EN: '/en' + CONF_EN,
           PREFIX_RO: '/', PREFIX_RO + '/contact': '/contact', CONF_RO: CONF_RO[len(PREFIX_RO):]}
DA = domeniu('proba-a', 'test', '37' + '3', '60000001', '60 000 001', lambda c: c, 'en')
DB = domeniu('proba-b', 'test', '4' + '0', '700000002', '700 000 002',
             lambda c: TABEL_B[c.split('#')[0]] + ('#' + c.split('#')[1] if '#' in c else ''), 'ro-' + 'RO', canonical_en_spre=DA['origine'])
ECHIVALENT = {'/': PREFIX_RO, PREFIX_RO: '/', '/contact': PREFIX_RO + '/contact', PREFIX_RO + '/contact': '/contact', CONF_EN: CONF_RO, CONF_RO: CONF_EN}
SURSE = ['/', '/pricing', '/contact', CONF_EN, PREFIX_RO, PREFIX_RO + '/contact', CONF_RO]
# Imaginea sociala: pe A o singura copie, la radacina; pe B una pe arbore (la radacina si sub /en), aceiasi octeti.
IMAGINE = '/opengraph-image'
# Imaginea cardului, numai ca adresa in `<meta>` (fisierul nu e in colectia de proba).
IMAGINE_CARD = '/twitter-image'
CALE_NEGASIT = '/colectie-cale-inexistenta-404'


def adresa(origine, cale):
    """Adresa paginii, cum o scrie Next in canonical si `og:url`: radacina ca origine goala."""
    return origine + ('' if cale == '/' else cale)


def rsc(*randuri):
    """Un script al fluxului RSC, cu ghilimelele si separatorul escapate ca in HTML-ul servit."""
    corp = ''.join('%x:%s%sn' % (i, r.replace('"', BS + '"'), BS) for i, r in enumerate(randuri))
    return '<script>self.__next_f.push([1,"' + corp + '"])</script>'


def amprenta(text):
    h = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return '<code class="juridic_sigiliuAmprenta__p1" title="%s" data-amprenta="%s">%s…</code>' % (h, h, h[:16])


def pagina(src, d, idb, scapari=None, defect=None):
    """Pagina sursei `src` pe domeniul `d`, in forma pe care o serveste build-ul real al domeniului (masurata pe
    colectiile CI: pe B paginile /en n-au hreflang si au canonical spre A, alternatele isi pun intai varianta proprie,
    nodurile de site au `url`-ul radacinii, `useId` si bucatile JS urmeaza arborele de rute, fluxul RSC poarta ca DATE
    caile sursa). `scapari` = {sursa: cale scrisa gresit} (martorul unei legaturi netraduse); `defect` = numele unui
    defect plantat (vezi `cazuri`)."""
    scapari = scapari or {}
    pe_b = d is DB
    ro = src.startswith(PREFIX_RO)
    serv = d['servita'](src)
    en_pe_b = pe_b and not ro
    leg = lambda s: scapari.get(s, d['servita'](s))
    proprie = adresa(d['origine'], serv)
    canonical = adresa(d['canonical_en_spre'], src) if (not ro and d['canonical_en_spre']) else proprie
    alternate, rsc_alt = '', []
    if src in ECHIVALENT and (not en_pe_b or defect == 'hreflang pe /en'):
        en, rom = (src, ECHIVALENT[src]) if not ro else (ECHIVALENT[src], src)
        variante = [('en', en), ('ro-' + 'MD', rom)]
        if pe_b:
            variante.reverse()
        for i, (hl, c) in enumerate(variante):
            alternate += '<link rel="alternate" hrefLang="%s" href="%s"/>' % (hl, adresa(DA['origine'], c))
            rsc_alt.append('["$","link","%d",{"rel":"alternate","hrefLang":"%s","href":"%s"}]' % (i, hl, adresa(DA['origine'], c)))
    radacina_site = d['origine'] + '/'
    if defect == 'url de site tradus' and pe_b:
        radacina_site = d['origine'] + '/en'
    # Adresele paginilor din JSON-LD (`WebPage.url`, firul): pe copia engleza a lui B urmeaza canonical-ul (regula 4d,
    # felia 141), adica sunt adresele lui A, cu calea sursa; peste tot in rest, originea si calea servita a domeniului.
    # Defectul 'jsonld pe adresa servita' e forma de dinainte (adresa servita a copiei); 'fir spre A pe pagina romaneasca'
    # pune adresa lui A pe o pagina care are canonical-ul propriu.
    if en_pe_b and defect != 'jsonld pe adresa servita':
        ld_origine, ld_cale = DA['origine'], src
    else:
        ld_origine, ld_cale = d['origine'], serv
    item = ld_origine + (src if defect == 'fir pe cale sursa' and pe_b else ld_cale)
    if pe_b and ro and defect == 'fir spre A pe pagina romaneasca':
        item = DA['origine'] + src
    # Defectele de ADRESA (cazurile (8)), plantate la fel pe ambele domenii pe pagina engleza `/pricing`: comparatia le
    # lasa sa treaca (A tradus e B), numai masuratoarea adreselor le vede.
    # O adresa care NU e a unei pagini engleze (o cale care nu e ruta, startul romanesc) ramane pe originea domeniului, cu
    # calea servita: asa o scrie JsonLd.tsx (numai rutele editiei `en` urmeaza canonical-ul).
    if src == '/pricing' and defect == 'fir spre o pagina lipsa':
        item = d['origine'] + '/pagina-' + 'lipsa'
    elif src == '/pricing' and defect == 'fir spre startul romanesc':
        item = d['origine'] + d['servita'](PREFIX_RO)
    elif src == '/pricing' and defect == 'fir spre pagina de negasit':
        item = d['origine'] + CALE_NEGASIT
    # Cardul social urmeaza canonical-ul (regula 4c): pe copia engleza a lui B, `og:url` e canonical-ul (adresa lui A),
    # iar `og:image` si `twitter:image` stau pe originea lui A; pe celelalte pagini, adresa proprie si originea proprie.
    og_url = canonical if en_pe_b else proprie
    origine_social = DA['origine'] if en_pe_b else d['origine']
    if pe_b and src == '/pricing' and defect == 'og:url pe adresa servita':
        og_url = proprie
    elif pe_b and src == '/pricing' and defect == 'og:url spre alt domeniu':
        og_url = adresa(DA['origine'], '/contact')
    elif pe_b and src == '/pricing' and defect == 'imaginile sociale pe B':
        origine_social = d['origine']
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'Organization', '@id': d['origine'] + '/#organizatie', 'name': 'Proba', 'url': radacina_site,
         'logo': {'@type': 'ImageObject', 'url': d['origine'] + '/sigla-' + 'proba.svg'}},
        {'@type': 'WebSite', '@id': d['origine'] + '/#site', 'url': radacina_site, 'inLanguage': d['radacina']},
        {'@type': 'WebPage', '@id': d['origine'] + src + '#webpage', 'url': ld_origine + ld_cale, 'inLanguage': d['limba'] if ro else 'en',
         'isPartOf': {'@id': d['origine'] + '/#site'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'item': item}]},
    ]}
    text = ('Scrie-ne pe WhatsApp la %s sau la %s. Site-ul %s.' if ro else 'Write to us at %s or %s. The %s site.') % (
        d['telefonAfisat'], d['email'], d['domeniu'])
    if src == '/pricing':
        # O pagina cu sigiliu, dar fara e-mail si fara domeniu in text: amprenta ei NU are voie sa difere (regula 10).
        text = 'Write to us at %s.' % d['telefonAfisat']
    # Eticheta legaturii numeste sursa intr-o fraza ("spre /pricing"), nu ca text intreg al elementului: un text intreg care
    # e o cale e calea AFISATA (regula 2c), pe care B o scrie servita.
    legaturi = ''.join('<a href="%s">spre %s</a>' % (leg(s), s) for s in SURSE) + '<a href="%s">planuri</a>' % (leg('/pricing') + '#planuri')
    legaturi += '<a lang="ro" hrefLang="%s" href="%s">contact</a>' % (d['limba'], leg(PREFIX_RO + '/contact'))
    # Calea afisata ca text (cardurile de contact, felia 138): calea servita a domeniului, ca text intreg al elementului
    # (regula 2c); o cale in mijlocul unei fraze ramane neatinsa pe ambele domenii.
    legaturi += '<span data-cale-afisata="">%s</span><p>Vezi /pricing azi</p>' % leg('/pricing')
    # Forma arborelui de rute: id-ul `useId`, separatorul de noduri text si numarul de bucati JS difera intre domenii.
    structura = '<div id="_R_%s_">x</div><p>Unu%s doi</p>' % ('a1b2' if not pe_b else 'z9y8', '<!-- -->' if not pe_b else '')
    bucati = ''.join('<script src="/_next/static/chunks/b%d-%s.js" async=""></script>' % (k, idb[-6:]) for k in range(1 if not pe_b else 2))
    juridic = ''
    if src in (CONF_EN, CONF_RO):
        # Destinatarii (regula 11): pe B, randul DNS si posta poarta azi textul lui A (asteapta juristul); `defect` il
        # schimba de tot. Randul mesageriei poarta numarul domeniului si ramane comparat; la fel tabelul sectiunii 4
        # (asezat INAINTEA sectiunii 5, ca o masca largita la orice sectiune sa-l prinda pe el) cu e-mailul domeniului.
        celula = 'DNS %s, posta %s' % (DA['domeniu'], DA['email']) if defect != 'destinatari proprii' else 'Alt furnizor, alta casuta'
        if defect == 'numar in randul DNS' and pe_b:
            celula += ', tel ' + d['telefonAfisat']
        numar = DA['telefonAfisat'] if defect == 'numarul lui A in destinatari' and pe_b else d['telefonAfisat']
        adresa_s4 = DA['email'] if defect == 'e-mailul lui A in alt tabel' and pe_b else d['email']
        juridic = '<section data-sectiune="s4"><h2>4. Contact</h2><table><tr><td>Scrie la %s</td><td>Tara</td></tr></table></section>' % adresa_s4
        juridic += ('<section data-sectiune="s5"><h2>5. Destinatari</h2><table><tr><td>%s</td><td>Tara</td></tr>'
                    '<tr><td>Mesageria pe %s</td><td>Tara</td></tr></table></section>' % (celula, numar))
        # Un nume vecin care CONTINE domeniul lui A (regula 5c il lasa neatins pe ambele parti, prin margini).
        juridic += '<p>Nume vecin: sub%s</p>' % DA['domeniu']
        juridic += amprenta(text + celula)
    elif src == '/pricing' and defect == 'amprenta fara contact' and pe_b:
        juridic = amprenta('alt text')
    elif src == '/pricing' and defect == 'numar in document':
        # Un document care poarta numarul domeniului in sectiunile lui, fara e-mail si fara domeniu: amprenta difera
        # prin constructie, deci se scoate (regula 10), si pe ambele domenii.
        juridic = '<section data-sectiune="s1"><p>Suna la %s</p></section>' % d['telefonAfisat'] + amprenta('Suna la ' + d['telefonAfisat'])
    elif src == '/pricing':
        juridic = amprenta('acelasi text')
    if defect == 'contactul lui A in flux' and pe_b and src == '/pricing':
        text_rsc_extra = ('"Suna la %s"' % DA['telefonE164'],)
    else:
        text_rsc_extra = ()
    # Fluxul RSC: o legatura emisa de server (cale servita), un text cu o cale SURSA purtata ca data (pe ambele domenii
    # cea a lui A) si un rand text `T` a carui lungime urmeaza numarul.
    sursa_data = scapari.get('flux', src)
    rand_t = 'Contact %s acum' % d['telefonAfisat']
    return (
        '<!DOCTYPE html><html lang="%s"><head><meta charSet="utf-8"/><!--%s-->' % ('ro' if ro else 'en', idb)
        + '<link rel="canonical" href="%s"/>' % canonical + alternate
        + '<meta property="og:locale" content="%s"/>' % (d['ogLocale'] if ro else 'en_US')
        + '<meta property="og:url" content="%s"/>' % og_url
        + '<meta property="og:image" content="%s"/>' % (origine_social + IMAGINE)
        + '<meta name="twitter:image" content="%s"/>' % (origine_social + IMAGINE_CARD)
        + '<script type="application/ld+json">%s</script>' % json.dumps(ld, separators=(',', ':'))
        + '</head><body><main><h1>Pagina %s</h1><p>%s</p>%s%s%s' % (src, text, legaturi, structura, juridic)
        + '<a href="https://wa.me/%s?text=salut">WhatsApp</a></main>' % d['whatsapp']
        + '<script src="/_next/static/chunks/main-%s.js"></script>' % idb[-6:] + bucati
        + rsc('["$","a",null,{"href":"%s","children":"Contact"}]' % leg(PREFIX_RO + '/contact' if ro else '/contact'),
              '["$","p",null,{"children":"Vezi [pagina](%s) pentru detalii"}]' % sursa_data,
              'T%x,%s' % (len(rand_t), rand_t),
              '{"buildId":"%s"}' % idb, '["$","meta","og",{"property":"og:url","content":"%s"}]' % og_url,
              *rsc_alt, *text_rsc_extra)
        + '</body></html>'
    )


def colectie_domeniu(d, idb, scapari=None, harta_en=None, extra=None, defect=None):
    """Colectia completa a unui domeniu: paginile, extrasele colectorului, pagina de negasit si imaginea sociala."""
    pe_b = d is DB
    p = {}
    for src in SURSE:
        ro = src.startswith(PREFIX_RO)
        p[d['servita'](src)] = (200, {'content-type': 'text/html; charset=utf-8', 'content-language': d['limba'] if ro else 'en'},
                                pagina(src, d, idb, scapari, defect))
    harta_en = (not pe_b) if harta_en is None else harta_en
    locuri = [d['servita'](s) for s in SURSE if harta_en or not d['servita'](s).startswith('/en')]
    # Fisierele de domeniu poarta limba radacinii (regula 9).
    rad = {'content-language': d['radacina']}
    p['/sitemap.xml'] = (200, dict(rad, **{'content-type': 'application/xml'}),
                         '<?xml version="1.0"?><urlset>' + ''.join('<url><loc>%s%s</loc></url>' % (d['origine'], c) for c in locuri) + '</urlset>')
    p['/robots.txt'] = (200, dict(rad, **{'content-type': 'text/plain'}), 'User-agent: *\nDisallow: /\nSitemap: %s/sitemap.xml\n' % d['origine'])
    # `llms.txt` e text ENGLEZESC pe ambele domenii (§3, ramura EN): antetul ramane al englezei, nu al radacinii (9b).
    limba_llms = d['radacina'] if defect == 'llms cu limba radacinii' else 'en'
    p['/llms.txt'] = (200, {'content-language': limba_llms, 'content-type': 'text/plain'},
                      '# Proba\n- [Pricing](%s%s)\n' % (d['origine'], d['servita']('/pricing')))
    scurta = d['radacina'].split('-')[0]
    alta = 'ro' if scurta == 'en' else 'en'
    ordine = '%s, %s' % (scurta, alta) if defect != 'limbi neschimbate' or not pe_b else 'en, ro'
    lang_manifest = 'en' if defect == 'manifest in engleza' and pe_b else scurta
    p['/manifest.webmanifest'] = (200, dict(rad, **{'content-type': 'application/manifest+json'}),
                                  '{"name":"Proba","lang":"%s","start_url":"/","scope":"/"}' % lang_manifest)
    # `Expires` se calculeaza la build: fiecare id de build primeste alta marca de timp, ca (1) sa masoare normalizarea.
    secunde = sum(map(ord, idb)) % 60
    p['/.well-known/security.txt'] = (200, dict(rad, **{'content-type': 'text/plain'}), 'Contact: mailto:security' + '@exemplu-proba.test\n'
                                      + 'Expires: 2027-04-02T02:40:%02d.465Z\nPreferred-Languages: %s\n' % (secunde, ordine))
    p[IMAGINE] = (200, {'content-type': 'image/png'}, b'\x89PNG-proba')
    if pe_b:
        p['/en' + IMAGINE] = (200, {'content-type': 'image/png'}, b'\x89PNG-proba')
    # Pagina de negasit poarta limba radacinii, ca pe build-urile reale (engleza pe A, romana pe B): o adresa spre ea dintr-o
    # pagina engleza a lui A are aceeasi limba, deci numai statusul o poate prinde (cazul (8) cu pagina de negasit).
    p[CALE_NEGASIT] = (404, {'content-type': 'text/html'}, '<html lang="%s"><body>%s</body></html>' % (
        'ro' if pe_b else 'en', 'Negasit' if pe_b else 'Not found'))
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
    json.dump({'format': 1, 'idBuild': idb, 'caleInexistenta': CALE_NEGASIT, 'pagini': lista},
              open(os.path.join(director, 'colectie.json'), 'w', encoding='utf-8', newline='\n'))
    return director


def perechi(cale, **schimbari):
    va = {k: DA[k] for k in ('origine', 'domeniu', 'email', 'telefonAfisat', 'telefonE164', 'whatsapp', 'limba', 'ogLocale')}
    vb = {k: DB[k] for k in va}
    lista = [{'a': a, 'b': b} for a, b in TABEL_B.items()]
    lista += [{'a': IMAGINE, 'b': '/en' + IMAGINE}]
    lista += [{'a': c, 'b': c} for c in ('/sitemap.xml', '/robots.txt', '/llms.txt', '/manifest.webmanifest', '/.well-known/security.txt')]
    d = {'a': va, 'b': vb, 'perechi': lista}
    d.update(schimbari)
    json.dump(d, open(cale, 'w', encoding='utf-8', newline='\n'))
    return cale


# ------------------------------------------------------------------ rularea

def ruleaza(unealta, *argumente):
    r = subprocess.run([sys.executable, unealta, '--arata', '0', '--normalizator', NORMALIZATOR, '--juridic-rute', JURIDIC_RUTE, *argumente], capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, r.stdout + r.stderr


def difuri(iesire):
    return [l for l in iesire.splitlines() if l.startswith('DIF ')]


def comparatie_si_adrese(iesire):
    """Liniile de diferenta ale comparatiei si, separat, ale masuratorii adreselor (`DIF adresa ...`, `DIF adrese ...`)."""
    ds = difuri(iesire)
    return [l for l in ds if not l.startswith('DIF adres')], [l for l in ds if l.startswith('DIF adres')]


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
    # B are o pagina in plus fata de A: a doua copie a imaginii sociale (sub /en), comparata cu aceeasi pagina a lui A.
    (ok if cod == 0 and c == (n + 1, 0) else nu)('(3) cele doua domenii pe identitate: cod %s, %s, asteptat 0 si (%d, 0); %r' % (cod, c, n + 1, difuri(out)[:3]))
    # Controlul acoperirii fixturii: fiecare regula din lista inchisa s-a aplicat macar o data (altfel cazul verde de
    # mai sus n-ar masura regula), iar raportul tipareste numarul de perechi.
    m = re.search(r'^substitutii pe regula: (.*)$', out, re.M)
    aplicari = dict((k, int(v)) for k, v in re.findall(r'([\w-]+)=(\d+)', m.group(1))) if m else {}
    zero = sorted(k for k, v in aplicari.items() if v == 0)
    (ok if m and len(aplicari) >= 20 and not zero and re.search(r'^perechi comparate %d;' % (n + 1), out, re.M) else nu)(
        '(3) fiecare regula aplicata pe fixtura: %d reguli, fara aplicari %r' % (len(aplicari), zero))
    # Regulile de pagina se cer pe paginile cu contact, inclusiv antetul de limba al paginii romanesti si amprenta
    # documentelor juridice (mutate din regulile de colectie: cad pe pagini care poarta contactul).
    mc = re.search(r'^substitutii pe paginile cu contact: (.*)$', out, re.M)
    pe_contact = dict((k, int(v)) for k, v in re.findall(r'([\w-]+)=(\d+)', mc.group(1))) if mc else {}
    lipsa_contact = sorted(k for k in ('content-language', 'amprenta-juridica') if pe_contact.get(k, 0) == 0)
    zero_contact = sorted(k for k, v in pe_contact.items() if v == 0)
    (ok if mc and len(pe_contact) >= 17 and not lipsa_contact and not zero_contact else nu)(
        '(3) regulile de pagina pe paginile cu contact: %d reguli, lipsa %r, fara aplicari %r' % (len(pe_contact), lipsa_contact, zero_contact))
    ma = re.search(r'^adresele paginilor .*?: A: (.*?), abateri (\d+); B: (.*?), abateri (\d+)$', out, re.M)

    def masurate(text):
        return sum(int(v) for k, v in re.findall(r'(url|item|og:url)=(\d+)', text))
    (ok if ma and ma.group(2) == '0' and ma.group(4) == '0' and masurate(ma.group(1)) > 0 and masurate(ma.group(3)) > 0 else nu)(
        '(3) adresele paginilor: zero abateri pe A si pe B, macar o adresa masurata pe fiecare: %r' % (ma.group(0) if ma else None))
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca,
                       scrie_colectie(os.path.join(d, 'B-destinatari'), id_b, colectie_domeniu(DB, id_b, defect='destinatari proprii')))
    (ok if cod == 0 else nu)('(3) tabelul destinatarilor cu textul propriu al lui B (diferenta de fond permisa, regula 11): cod %s; %r' % (cod, difuri(out)[:3]))
    def tot_textul(director):
        return ''.join(open(os.path.join(director, 'corp', f), encoding='utf-8').read()
                       for f in os.listdir(os.path.join(director, 'corp')) if f.endswith('.txt'))
    tb, ta = tot_textul(cb), tot_textul(ca)
    bun = DB['telefonAfisat'] in tb and DA['telefonAfisat'] not in tb and DA['telefonAfisat'] in ta and DB['telefonAfisat'].startswith('+' + '40 ')
    (ok if bun else nu)('(3) controlul fixturii: B poarta numarul +40 si nu pe cel +373, A pe cel +373')

    # (4) si martorii regulilor
    def identitate_rosie(eticheta, colectie_b, cale_asteptata, fisier_perechi=pp, cod_asteptat=1, adrese_asteptate=None, colectie_a=None):
        """`cale_asteptata`: None = orice, '' = nicio diferenta a comparatiei, altfel exact una, pe acea cale. Liniile
        adreselor se numara separat: `adrese_asteptate` = subsirurile cerute, fiecare pe exact o linie (None = necitite)."""
        slug = re.sub(r'[^a-z0-9]+', '-', eticheta)
        cx = scrie_colectie(os.path.join(d, 'y-' + slug), id_b, colectie_b)
        cxa = ca if colectie_a is None else scrie_colectie(os.path.join(d, 'ya-' + slug), id_a, colectie_a)
        cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', fisier_perechi, cxa, cx)
        ds, adr = comparatie_si_adrese(out)
        if cale_asteptata == '':
            bun = cod == cod_asteptat and ds == []
        else:
            bun = cod == cod_asteptat and (cale_asteptata is None or (len(ds) == 1 and cale_asteptata in ds[0]))
        if adrese_asteptate is not None:
            bun = bun and len(adr) == len(adrese_asteptate) and all(sum(a in l for l in adr) == 1 for a in adrese_asteptate)
        (ok if bun else nu)('%s: cod %s, diferente %r%s' % (eticheta if eticheta.startswith('(') else '(4) ' + eticheta, cod, ds[:3],
                                                            '' if adrese_asteptate is None else ', adresele %r' % adr[:3]))

    identitate_rosie('legatura /contact netradusa pe /en/pricing',
                     colectie_domeniu(DB, id_b, extra={'/en/pricing': (200, B['/en/pricing'][1], pagina('/pricing', DB, id_b, {'/contact': '/contact'}))}),
                     '/pricing -> /en/pricing')
    alt = B['/']
    vechi = 'hrefLang="en" href="%s"' % DA['origine']
    (ok if alt[2].count(vechi) == 1 else nu)('(4) controlul fixturii: legatura hreflang en a startului romanesc al lui B e acolo o data')
    identitate_rosie('hreflang tradus pe B', colectie_domeniu(DB, id_b, extra={'/': (200, alt[1], alt[2].replace(
        vechi, 'hrefLang="en" href="%s/en"' % DB['origine']))}), PREFIX_RO + ' -> /')
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

    # (7) Martorii regulilor adaugate pentru identitatea 3s.md -> 3s.com.ro: fiecare defect plantat pe O pagina a lui B
    # (sau pe un fisier de domeniu) da exact o diferenta, numita pe acea pagina. Defectele sunt cele pe care regulile le
    # lasa sa treaca in forma corecta si trebuie sa le opreasca in forma gresita.
    def pe_pagina(src, defect=None, scapari=None):
        cale_b = DB['servita'](src)
        return colectie_domeniu(DB, id_b, extra={cale_b: (200, B[cale_b][1], pagina(src, DB, id_b, scapari, defect))})

    ro_contact = PREFIX_RO + '/contact'
    # Firul pe calea SURSA (defectul real al lui `FirPagina` inainte de asezare): il prind ambele axe, comparatia (A tradus nu
    # e B) si adresele (`/ro/contact` nu e o pagina servita a lui B).
    identitate_rosie('(7) firul de navigare (JSON-LD) pe calea sursa', pe_pagina(ro_contact, 'fir pe cale sursa'), ro_contact + ' -> /contact',
                     adrese_asteptate=['DIF adresa B /contact: item ' + DB['origine'] + ro_contact + ': nu e o pagina servita'])
    identitate_rosie('(7) llms.txt al lui B cu limba radacinii (romana), desi textul e englezesc',
                     colectie_domeniu(DB, id_b, defect='llms cu limba radacinii'), '/llms.txt')

    # (8) ADRESELE PAGINILOR (`adrese` in unealta): un defect plantat LA FEL pe ambele domenii trece de comparatie (A tradus
    # e chiar B) si il prinde numai masuratoarea adreselor, pe fiecare colectie, cu motivul lui.
    for eticheta, defect, asteptate in (
        ('o adresa spre o pagina inexistenta', 'fir spre o pagina lipsa',
         ['DIF adresa A /pricing: item ' + DA['origine'] + '/pagina-lipsa: nu e o pagina servita',
          'DIF adresa B /en/pricing: item ' + DB['origine'] + '/pagina-lipsa: nu e o pagina servita']),
        ('firul paginii engleze spre startul romanesc (alta editie)', 'fir spre startul romanesc',
         ['DIF adresa A /pricing: item ' + DA['origine'] + PREFIX_RO + ': pagina tinta are lang=ro, pagina care o poarta lang=en',
          'DIF adresa B /en/pricing: item ' + DB['origine'] + '/: pagina tinta are lang=ro, pagina care o poarta lang=en']),
        ('o adresa spre pagina de negasit (404, aceeasi limba pe A)', 'fir spre pagina de negasit',
         ['DIF adresa A /pricing: item ' + DA['origine'] + CALE_NEGASIT + ': raspunde 404',
          'DIF adresa B /en/pricing: item ' + DB['origine'] + CALE_NEGASIT + ': raspunde 404']),
    ):
        identitate_rosie('(8) ' + eticheta + ', la fel pe ambele domenii', colectie_domeniu(DB, id_b, defect=defect), '',
                         adrese_asteptate=asteptate, colectie_a=colectie_domeniu(DA, id_a, defect=defect))
    # og:url egal cu canonical-ul paginii (adresa lui A, pe copia engleza a lui B) e forma fixturii (cazul (3) verde, cu
    # adresele la zero). Forma de dinainte, og:url pe adresa servita a copiei si imaginile pe originea lui B, e acum o
    # diferenta a comparatiei (regula 4c), pe care adresele o lasa (pagina servita exista, 200, aceeasi limba).
    identitate_rosie('(8) og:url pe B egal cu adresa servita a copiei (nu canonical-ul ei)', pe_pagina('/pricing', 'og:url pe adresa servita'),
                     '/pricing -> /en/pricing', adrese_asteptate=[])
    identitate_rosie('(8) og:image si twitter:image pe originea lui B pe copia engleza', pe_pagina('/pricing', 'imaginile sociale pe B'),
                     '/pricing -> /en/pricing', adrese_asteptate=[])
    identitate_rosie('(8) og:url pe B spre alta pagina a lui A (nu canonical-ul ei)', pe_pagina('/pricing', 'og:url spre alt domeniu'),
                     '/pricing -> /en/pricing',
                     adrese_asteptate=['DIF adresa B /en/pricing: og:url ' + DA['origine'] + '/contact: adresa celuilalt domeniu'])
    # Felia 141 (regula 4d): pe copia engleza a lui B, `WebPage.url` si firul sunt adresele lui A (forma fixturii, cazul (3)
    # verde, cu adresele la zero). Forma de dinainte, adresele servite ale copiei, e acum o diferenta a comparatiei, pe care
    # adresele o lasa (pagina servita exista, 200, aceeasi limba). Iar o adresa a lui A pe o pagina ROMANEASCA a lui B (cu
    # canonical-ul propriu) o prind ambele axe: exceptia adreselor e numai a paginilor cu canonical-ul pe celalalt domeniu.
    identitate_rosie('(8) WebPage.url si firul copiei engleze pe adresa servita (nu canonical-ul)', pe_pagina('/pricing', 'jsonld pe adresa servita'),
                     '/pricing -> /en/pricing', adrese_asteptate=[])
    identitate_rosie('(8) firul unei pagini romanesti a lui B spre adresa lui A', pe_pagina(ro_contact, 'fir spre A pe pagina romaneasca'),
                     ro_contact + ' -> /contact',
                     adrese_asteptate=['DIF adresa B /contact: item ' + DA['origine'] + ro_contact + ': adresa celuilalt domeniu'])

    # Zero adrese masurate (paginile fara JSON-LD si fara og:url, pe ambele): masuratoarea nu dovedeste nimic, deci e rosie pe
    # fiecare colectie. Comparatia are aici rosul ei (regulile care traiau in JSON-LD raman fara aplicari), necitit de caz.
    def fara_adrese(colectie):
        tipar = r'<script type="application/ld' + BS + r'+json">.*?</script>|<meta property="og:url"[^>]*>'
        return dict((k, (st, h, re.sub(tipar, '', c) if isinstance(c, str) else c)) for k, (st, h, c) in colectie.items())
    identitate_rosie('(8) nicio adresa pe nicio pagina (zero masurate)', fara_adrese(B), None,
                     adrese_asteptate=['DIF adrese A: zero adrese masurate', 'DIF adrese B: zero adrese masurate'], colectie_a=fara_adrese(A))
    identitate_rosie('(7) hreflang pe o pagina /en a lui B', pe_pagina('/contact', 'hreflang pe /en'), '/contact -> /en/contact')
    identitate_rosie('(7) url-ul nodurilor de site tradus pe B', pe_pagina(ro_contact, 'url de site tradus'), ro_contact + ' -> /contact')
    identitate_rosie('(7) amprenta schimbata pe o pagina fara contact tradus', pe_pagina('/pricing', 'amprenta fara contact'), '/pricing -> /en/pricing')
    identitate_rosie('(7) contactul lui A (E.164) ramas in fluxul RSC al lui B', pe_pagina('/pricing', 'contactul lui A in flux'), '/pricing -> /en/pricing')
    identitate_rosie('(7) un text al fluxului RSC cu o cale nici sursa, nici servita', pe_pagina(ro_contact, scapari={'flux': '/alta-cale'}),
                     ro_contact + ' -> /contact')
    identitate_rosie('(7) manifestul lui B in limba engleza', colectie_domeniu(DB, id_b, defect='manifest in engleza'), '/manifest.webmanifest')
    identitate_rosie('(7) security.txt al lui B cu ordinea limbilor a lui A', colectie_domeniu(DB, id_b, defect='limbi neschimbate'),
                     '/.well-known/security.txt')
    ctr = B['/contact']
    identitate_rosie('(7) Content-Language al unei pagini romanesti ramas al lui A',
                     colectie_domeniu(DB, id_b, extra={'/contact': (200, dict(ctr[1], **{'content-language': DA['limba']}), ctr[2])}),
                     ro_contact + ' -> /contact')
    # Controlul cazului de mai sus: forma SURSA a textului din flux (pe ambele domenii a lui A) e acceptata, cea servita la fel.
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca,
                       scrie_colectie(os.path.join(d, 'B-flux-servit'), id_b, pe_pagina(ro_contact, scapari={'flux': '/contact'})))
    (ok if cod == 0 else nu)('(7) textul din flux in forma SERVITA pe B e acceptat ca si cel in forma sursa: cod %s; %r' % (cod, difuri(out)[:3]))

    # Regula 11 ingusta: numai randurile DNS si posta ies din comparatie. Numarul lui A in randul mesageriei si e-mailul
    # lui A intr-un tabel din alta sectiune raman diferente, fiecare pe pagina lui.
    identitate_rosie('(7) numarul lui A in randul mesageriei din destinatari', pe_pagina(CONF_RO, 'numarul lui A in destinatari'),
                     CONF_RO + ' -> ')
    identitate_rosie('(7) e-mailul lui A intr-un tabel din alta sectiune decat 5', pe_pagina(CONF_EN, 'e-mailul lui A in alt tabel'),
                     CONF_EN + ' -> ')
    identitate_rosie('(7) un numar de contact in randul DNS si posta al lui B (mascat)', pe_pagina(CONF_RO, 'numar in randul DNS'),
                     CONF_RO + ' -> ')
    tc =tot_textul(cb)
    bun = ('Mesageria pe ' + DB['telefonAfisat']) in tc and ('Scrie la ' + DB['email']) in tc and ('sub' + DA['domeniu']) in tc
    (ok if bun else nu)('(7) controlul fixturii: B poarta randul mesageriei, tabelul sectiunii 4 si numele vecin')

    # Aceeasi adresa de e-mail pe ambele domenii (B foloseste e-mailul lui A): nu e o diferenta, iar regula `email` nu se
    # mai cere aplicata. Martorul: aceeasi colectie, cu perechile in care adresele difera, e rosie.
    vb_egal = {k: DB[k] for k in ('origine', 'domeniu', 'email', 'telefonAfisat', 'telefonE164', 'whatsapp', 'limba', 'ogLocale')}
    vb_egal['email'] = DA['email']
    pp_egal = perechi(os.path.join(d, 'perechi-email-egal.json'), b=vb_egal)
    def cu_text(colectie, vechi, nou):
        return dict((k, (s, h, c.replace(vechi, nou) if isinstance(c, str) else c)) for k, (s, h, c) in colectie.items())
    cb_egal = scrie_colectie(os.path.join(d, 'B-email-egal'), id_b, cu_text(B, DB['email'], DA['email']))
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp_egal, ca, cb_egal)
    (ok if cod == 0 and comparate(out) == (n + 1, 0) else nu)(
        '(7) acelasi e-mail pe ambele domenii: cod %s, %s, asteptat 0 si (%d, 0); %r' % (cod, comparate(out), n + 1, difuri(out)[:3]))
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca, cb_egal)
    (ok if cod == 1 and any('valorile de contact ale lui A raman pe B: email' in x for x in difuri(out)) else nu)(
        '(7) martorul: aceeasi colectie cu adresele diferite in perechi e rosie: cod %s, %r' % (cod, difuri(out)[:2]))

    # Regula 10 cu numarul in sectiunile documentului: amprenta difera si nu e o diferenta (pe A si pe B acelasi defect).
    ca_nd = scrie_colectie(os.path.join(d, 'A-numar-document'), id_a, colectie_domeniu(DA, id_a, defect='numar in document'))
    cb_nd = scrie_colectie(os.path.join(d, 'B-numar-document'), id_b, colectie_domeniu(DB, id_b, defect='numar in document'))
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca_nd, cb_nd)
    (ok if cod == 0 else nu)('(7) amprenta unui document cu numarul in sectiuni, fara e-mail si domeniu: cod %s; %r' % (cod, difuri(out)[:3]))

    # Regula fara aplicari: aceleasi doua colectii, fara nicio adresa de e-mail pe ambele parti. Paginile ies identice,
    # deci singurul rosu e regula `email` care nu s-a aplicat niciodata.
    def fara_text(colectie, vechi, nou):
        return dict((k, (s, h, c.replace(vechi, nou) if isinstance(c, str) else c)) for k, (s, h, c) in colectie.items())
    ca_fe = scrie_colectie(os.path.join(d, 'A-fara-email'), id_a, fara_text(A, DA['email'], 'formularul'))
    cb_fe = scrie_colectie(os.path.join(d, 'B-fara-email'), id_b, fara_text(B, DB['email'], 'formularul'))
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca_fe, cb_fe)
    ds = difuri(out)
    (ok if cod == 1 and ds == ['DIF regula email (pe paginile cu contact): zero aplicari'] else nu)(
        '(7) regula e-mailului fara nicio aplicare: cod %s, diferente %r' % (cod, ds[:3]))

    # (6) Normalizarile adaugate pentru invarianta pe 3s.md (`LASTMOD`, `STATIC_CU_GRUP`), masurate pe PROCES: doua
    # colectii care difera numai prin <lastmod> si prin amprenta unei bucati de sub un grup de rute ies egale; un
    # cuvant schimbat langa bucata ramane o diferenta. Fiecare colectie are id-ul ei de build, ca doar normalizarea
    # sa le poata egala.
    grup = '(' + 'romd)'

    def cu_normalizari(idb, data, amprenta, cuvant):
        p = colectie_domeniu(DA, idb)
        h = p['/sitemap.xml']
        p['/sitemap.xml'] = (200, h[1], h[2].replace('</loc></url>', '</loc><lastmod>' + data + '</lastmod></url>'))
        pr = p['/pricing']
        bucata = '<script src="/_next/static/chunks/app/' + grup + '/layout.romd-' + amprenta + '.js"></script>'
        p['/pricing'] = (200, pr[1], pr[2].replace('</main>', '</main>' + bucata + '<p>' + cuvant + '</p>'))
        return p

    zi1, zi2 = '2026-01-0' + '1T00:00:00Z', '2026-02-0' + '2T10:00:00Z'
    n1 = scrie_colectie(os.path.join(d, 'n1'), id_a, cu_normalizari(id_a, zi1, 'a1b2c3', 'unu'))
    n2 = scrie_colectie(os.path.join(d, 'n2'), id_a2, cu_normalizari(id_a2, zi2, 'd4e5f6', 'unu'))
    n3 = scrie_colectie(os.path.join(d, 'n3'), id_a2, cu_normalizari(id_a2, zi2, 'd4e5f6', 'doi'))
    tn = ''.join(open(os.path.join(n2, 'corp', f), encoding='utf-8').read() for f in os.listdir(os.path.join(n2, 'corp')) if f.endswith('.txt'))
    bun = zi2 in tn and '/' + grup + '/layout.romd-d4e5f6.js' in tn
    (ok if bun else nu)('(6) controlul fixturii: colectia poarta <lastmod> si bucata de sub grupul de rute')
    cod, out = ruleaza(unealta, '--regula', 'invarianta', n1, n2)
    (ok if cod == 0 and comparate(out) == (n, 0) else nu)(
        '(6) numai <lastmod> si amprenta de sub grup difera: cod %s, %s, asteptat 0 si (%d, 0); %r' % (cod, comparate(out), n, difuri(out)[:3]))
    cod, out = ruleaza(unealta, '--regula', 'invarianta', n1, n3)
    ds = difuri(out)
    (ok if cod == 1 and ds == ['DIF /pricing: corpul HTML difera dupa normalizare'] else nu)(
        '(6) un cuvant schimbat langa bucata: cod %s, diferente %r' % (cod, ds))

    # Martorii normalizarilor se apeleaza la FIECARE rulare: o copie a uneltei cu o normalizare stricata trebuie sa
    # iasa NEMASURAT (3), nu verde, chiar pe o colectie comparata cu ea insasi. Copia se face din unealta SUB PROBA,
    # deci un mutant care nu mai apeleaza martorii o produce si pe ea fara apel, si cazul pica.
    sursa = open(unealta, encoding='utf-8').read()
    for eticheta, ancora, inlocuitor in (
        ('LASTMOD', "return LASTMOD.sub(r'" + BS + "1DATA-COMMIT" + BS + "2', text)", 'return text'),
        ('STATIC_CU_GRUP', "return STATIC_CU_GRUP.sub(r'static/" + BS + "1/X', html)", 'return html'),
    ):
        if sursa.count(ancora) != 1:
            nu('(6) normalizarea %s stricata: ancora lipsa sau dubla in unealta, cazul nu masoara nimic' % eticheta)
            continue
        stricata = os.path.join(d, 'stricata-' + eticheta.lower() + '.py')
        open(stricata, 'w', encoding='utf-8', newline='\n').write(sursa.replace(ancora, inlocuitor))
        cod, out = ruleaza(stricata, '--regula', 'invarianta', ca, ca)
        bun = cod == 3 and 'martorul normalizarii ' + eticheta in out
        (ok if bun else nu)('(6) normalizarea %s stricata pe o copie: cod %s, asteptat 3 cu martorul ei numit' % (eticheta, cod))

    # (9) NUMARUL NEDESPARTIT (felia 148): in subtitlul paginii de contact numarul afisat poarta U+00A0 intre grupe, pe
    # ambele domenii, iar in restul paginii spatii obisnuite. Fixtura: fraza "... la <numar>" a fiecarei pagini primeste
    # numarul nedespartit, randul `T` si sectiunile raman cu spatii obisnuite (ambele forme pe aceeasi pagina).
    nbsp = chr(0xa0)

    def nedespartit(colectie, v):
        vechi = 'la ' + v['telefonAfisat']
        nou = 'la ' + v['telefonAfisat'].replace(' ', nbsp)
        return dict((k, (s_, h, c.replace(vechi, nou) if isinstance(c, str) else c)) for k, (s_, h, c) in colectie.items())
    A_nd, B_nd = nedespartit(A, DA), nedespartit(B, DB)
    ca_nd2 = scrie_colectie(os.path.join(d, 'A-nedespartit'), id_a, A_nd)
    cb_nd2 = scrie_colectie(os.path.join(d, 'B-nedespartit'), id_b, B_nd)
    ta_nd, tb_nd = tot_textul(ca_nd2), tot_textul(cb_nd2)
    bun = (('la ' + DA['telefonAfisat'].replace(' ', nbsp)) in ta_nd and DA['telefonAfisat'] in ta_nd
           and ('la ' + DB['telefonAfisat'].replace(' ', nbsp)) in tb_nd and DB['telefonAfisat'] in tb_nd)
    (ok if bun else nu)('(9) controlul fixturii: A si B poarta numarul propriu si nedespartit (U+00A0), si cu spatii obisnuite')
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca_nd2, cb_nd2)
    (ok if cod == 0 and comparate(out) == (n + 1, 0) else nu)(
        '(9) numarul nedespartit pe ambele domenii: cod %s, %s, asteptat 0 si (%d, 0); %r' % (cod, comparate(out), n + 1, difuri(out)[:3]))
    # Martorul negativ: pe B ramane numarul lui A, nedespartit (forma pe care o comparatie literala n-o vede).
    B_ramas = dict(B_nd)
    s_, h, c = B_nd['/contact']
    B_ramas['/contact'] = (s_, h, c.replace(DB['telefonAfisat'].replace(' ', nbsp), DA['telefonAfisat'].replace(' ', nbsp)))
    (ok if B_ramas['/contact'][2] != c else nu)('(9) controlul fixturii: numarul nedespartit al lui B e pe /contact, deci inlocuirea a aterizat')
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca_nd2,
                       scrie_colectie(os.path.join(d, 'B-nedespartit-ramas'), id_b, B_ramas))
    (ok if cod == 1 and any('valorile de contact ale lui A raman pe B: telefonAfisat' in x for x in difuri(out)) else nu)(
        '(9) numarul lui A, nedespartit, ramas pe B: cod %s, numit ca valoare a lui A: %r' % (cod, difuri(out)[:3]))

    # (9b) Numarul lui A care apare NUMAI nedespartit, in fiecare loc in care unealta il cauta pe A (nu il inlocuieste):
    # sectiunile unui document (amprenta, regula 10), un rand al tabelului destinatarilor (regula 11) si o pagina fara
    # cifrele de WhatsApp (paginile lui A cu contact). Fiecare are un mutant in (5), cu potrivirea literala readusa.
    def fara_spatii(v):
        return v['telefonAfisat'].replace(' ', nbsp)

    def schimba(colectie, cale, perechi_text):
        s_, h, c = colectie[cale]
        for vechi, nou in perechi_text:
            c = c.replace(vechi, nou)
        return dict(colectie, **{cale: (s_, h, c)}), c != colectie[cale][2]

    # Sectiunile documentului: numarul din `<section data-sectiune>` al paginii /pricing, nedespartit pe ambele domenii
    # (in restul paginii ramane cu spatii obisnuite). Amprenta difera prin constructie si se scoate: VERDE.
    A_d, a_ok = schimba(colectie_domeniu(DA, id_a, defect='numar in document'), '/pricing',
                        [('<p>Suna la ' + DA['telefonAfisat'], '<p>Suna la ' + fara_spatii(DA))])
    B_d, b_ok = schimba(colectie_domeniu(DB, id_b, defect='numar in document'), DB['servita']('/pricing'),
                        [('<p>Suna la ' + DB['telefonAfisat'], '<p>Suna la ' + fara_spatii(DB))])
    (ok if a_ok and b_ok else nu)('(9b) controlul fixturii: numarul din sectiunile documentului e nedespartit pe A si pe B')
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, scrie_colectie(os.path.join(d, 'A-nd-document'), id_a, A_d),
                       scrie_colectie(os.path.join(d, 'B-nd-document'), id_b, B_d))
    (ok if cod == 0 and comparate(out) == (n + 1, 0) else nu)(
        '(9b) numarul nedespartit numai in sectiunile documentului: cod %s, %s, asteptat 0 si (%d, 0); %r' % (cod, comparate(out), n + 1, difuri(out)[:3]))

    # Tabelul destinatarilor: randul mesageriei al lui A numeste e-mailul lui A si poarta numarul lui A, nedespartit;
    # deci nu e un rand DNS sau posta si ramane comparat. Pe B, acelasi rand pastreaza numarul lui A: ROSU, numit.
    rand_a = '<td>Mesageria pe ' + DA['telefonAfisat'] + '</td>'
    A_t, a_ok = schimba(A, CONF_RO, [(rand_a, '<td>Mesageria pe ' + fara_spatii(DA) + ', posta ' + DA['email'] + '</td>')])
    B_t, b_ok = schimba(B, DB['servita'](CONF_RO), [('<td>Mesageria pe ' + DB['telefonAfisat'] + '</td>',
                                                     '<td>Mesageria pe ' + fara_spatii(DA) + ', posta ' + DB['email'] + '</td>')])
    (ok if a_ok and b_ok else nu)('(9b) controlul fixturii: randul mesageriei poarta numarul lui A nedespartit si e-mailul, pe A si pe B')
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, scrie_colectie(os.path.join(d, 'A-nd-destinatari'), id_a, A_t),
                       scrie_colectie(os.path.join(d, 'B-nd-destinatari'), id_b, B_t))
    bun = cod == 1 and any(x.startswith('DIF ' + CONF_RO + ' -> ') and 'valorile de contact ale lui A raman pe B: telefonAfisat' in x
                           for x in difuri(out))
    (ok if bun else nu)('(9b) numarul lui A nedespartit intr-un rand al destinatarilor care numeste e-mailul: cod %s, %r' % (cod, difuri(out)[:3]))

    # Paginile lui A cu contact: pe /pricing (ambele domenii) numarul apare numai nedespartit si legatura WhatsApp n-are
    # cifre. Pagina ramane una cu contact: numarul de pagini cu contact e acelasi ca pe colectiile de la (3) (martorul).
    def pagini_cu_contact(text):
        m = re.search(r'pagini lui A cu contact: (\d+)', text)
        return int(m.group(1)) if m else None
    _, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, ca, cb)
    martor = pagini_cu_contact(out)
    A_c, a_ok = schimba(A, '/pricing', [(DA['telefonAfisat'], fara_spatii(DA)), ('wa.me/' + DA['whatsapp'], 'wa.me/')])
    B_c, b_ok = schimba(B, DB['servita']('/pricing'), [(DB['telefonAfisat'], fara_spatii(DB)), ('wa.me/' + DB['whatsapp'], 'wa.me/')])
    bun = a_ok and b_ok and DA['telefonAfisat'] not in A_c['/pricing'][2] and DA['whatsapp'] not in A_c['/pricing'][2]
    (ok if bun else nu)('(9b) controlul fixturii: /pricing poarta numarul numai nedespartit si nicio cifra de WhatsApp')
    cod, out = ruleaza(unealta, '--regula', 'identitate', '--perechi', pp, scrie_colectie(os.path.join(d, 'A-nd-contact'), id_a, A_c),
                       scrie_colectie(os.path.join(d, 'B-nd-contact'), id_b, B_c))
    bun = cod == 0 and comparate(out) == (n + 1, 0) and martor and pagini_cu_contact(out) == martor
    (ok if bun else nu)('(9b) pagina cu numarul numai nedespartit ramane cu contact: cod %s, %s, pagini cu contact %s, martorul %s' % (
        cod, comparate(out), pagini_cu_contact(out), martor))
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
        # Martorul mecanismului: o copie NEMUTATA, scrisa la fel ca mutantii, trebuie sa treaca toate cazurile; altfel
        # un mutant ar parea prins de o copie care pica oricum (de pilda o cale citita relativ la locul uneltei).
        copie = mutant(d, 'def main():', 'def main():')
        dm = os.path.join(d, 'm-martor')
        os.makedirs(dm)
        salvat, salvat_t = P, T
        with open(os.devnull, 'w') as nul:
            vechi = sys.stdout
            sys.stdout = nul
            try:
                picate = cazuri(copie, dm) if copie else -1
            finally:
                sys.stdout = vechi
        P, T = salvat, salvat_t
        (ok if picate == 0 else nu)('(5) martorul: copia NEMUTATA, in acelasi loc ca mutantii, pica %d cazuri (asteptat 0)' % picate)
        for eticheta, ancora, inlocuitor in (
            ('traducerea cailor oprita', "return tabel[p] + rest if p in tabel and p not in pastrate else cale", 'return cale'),
            ('comparatia corpului HTML oprita', "if na != nb:\n                motive = motive + ['corpul HTML difera dupa normalizare']",
             "if False:\n                motive = motive + ['corpul HTML difera dupa normalizare']"),
            ('antete ignorate', 'if ha.get(h) != hb.get(h):', 'if False:'),
            ('status ignorat', "if pa['status'] != pb['status']:", 'if False:'),
            ('martorii normalizarilor neapelati', 'picat = control_normalizari()', 'picat = None'),
            ('regula fara aplicari ignorata', 'dif += len(fara_aplicari)', 'dif += 0'),
            ('valorile de contact ale lui A ignorate', 'ramase = valori_contact_a(tb_fara_celule, va, vb)', 'ramase = []'),
            ('masca destinatarilor pe orice sectiune', '<section data-sectiune="s5">', '<section data-sectiune="s' + BS + 'd+">'),
            ('masca pe tot tabelul destinatarilor', 'if e_rand_dns_posta(r.group(0), va))', 'if True)'),
            ('randurile lui B mascate fara controlul numarului', 'if numar:', 'if False:'),
            ('domeniul fara margini', "_sub(r'(?<![" + BS + "w@/." + BS + "-])' + re.escape(va['domeniu']) + r'(?![" + BS + "w" + BS + "-]|"
             + BS + "." + BS + "w)', vb['domeniu']", "_sub(re.escape(va['domeniu']), vb['domeniu']"),
            ('valoarea egala tratata ca valoare a lui A', "if va[k] != vb[k] and contine_valoare(va, k, text)]",
             "if contine_valoare(va, k, text)]"),
            ('numarul din document ignorat la amprenta', 'or contact_in_document(brut_a, va, vb)', 'or False'),
            ('regula e-mailului ceruta si la adrese egale', "if regula == 'email' and va['email'] == vb['email']:", 'if False:'),
            ('fluxul RSC necomparat', 'return [LUNGIME_RAND_T.sub(', 'return [] and [LUNGIME_RAND_T.sub('),
            ('DOM-ul identitatii necomparat', 'na = dom_a + MARCA_RSC', 'na = dom_b + MARCA_RSC'),
            # Felia 121, runda 2: limba lui llms.txt, regulile de pagina numarate pe paginile cu contact, hrefLang-ul unei
            # legaturi obisnuite (cu ancora intreaga a apelului) si masuratoarea adreselor, ramura cu ramura.
            ('limba lui llms.txt dupa radacina', 'and ca not in FISIERE_IN_ENGLEZA:', ':'),
            ('antetul de limba necontorizat pe paginile cu contact',
             "if limba_aplicata:\n                    cont_contact.adauga('content-language')",
             "if False:\n                    cont_contact.adauga('content-language')"),
            ('amprenta necontorizata pe paginile cu contact',
             "if cu_contact:\n                            cont_contact.adauga('amprenta-juridica')",
             "if False:\n                            cont_contact.adauga('amprenta-juridica')"),
            ('hrefLang-ul legaturii obisnuite netradus', "text, cont, 'hrefLang-legatura')", "text, None, 'hrefLang-legatura') if False else text"),
            ('adresele necitite', 'return numar, abateri', 'return numar, []'),
            ('limba tintei necomparata', 'elif not any(t in TIPURI_SITE for t in tipuri) and limba(col, tinta_cale, tinta) != proprie:', 'elif False:'),
            ('statusul tintei ignorat', "elif tinta['status'] != 200:", 'elif False:'),
            ('adresa celuilalt domeniu primita oricum', 'elif canon and valoare == canon.group(1):', 'elif True:'),
            ('canonical-ul celuilalt domeniu respins', 'elif canon and valoare == canon.group(1):', 'elif False:'),
            ('nodurile de site cerute in aceeasi limba', 'elif not any(t in TIPURI_SITE for t in tipuri) and limba(', 'elif True and limba('),
            ('fisierele statice masurate ca pagini', "if 'ImageObject' in tipuri:", 'if False:'),
            ('zero adrese masurate trecut sub tacere', 'if sum(numar.get(k, 0) for k in CHEI_ADRESE) == 0:', 'if False:'),
            # Runda 4: cardul social al copiei engleze urmeaza canonical-ul (4c). Verdictul il da elementul din `<head>`;
            # protectia obiectului `meta` din fluxul RSC n-are mutant: adresele singure ale fluxului (siruri fara spatiu)
            # nu se compara (limita declarata in antetul uneltei), deci un mutant pe ea ar supravietui prin constructie
            # (masurat: 0 cazuri picate), ca si protectia obiectului canonical.
            ('cardul social al copiei engleze tradus', "text = SOCIAL_HTML.sub(protejeaza_si_numara('social-pe-en'), text)", 'pass'),
            # Felia 141: adresele paginilor din JSON-LD pe copia engleza urmeaza canonical-ul (4d), iar masuratoarea adreselor
            # le primeste numai pe paginile al caror canonical e pe celalalt domeniu.
            ('calea afisata netradusa (2c)', "text = re.sub(r'(?<=>)(/[A-Za-z0-9._~%" + BS + "-/]*)(?=<)', afisata, text)", 'pass'),
            ('adresele JSON-LD ale copiei engleze traduse', "return protejeaza_si_numara('jsonld-pe-en')(m)", 'return m.group(0)'),
            ('orice adresa a lui A pastrata pe copia engleza', 'if pa in tabel and sub_en(tabel[pa]):', 'if True:'),
            ('paginile romanesti pastrate ca ale lui A pe copia engleza', 'if pa in tabel and sub_en(tabel[pa]):', 'if pa in tabel:'),
            ('JSON-LD-ul celuilalt domeniu respins si pe copia engleza', "elif cheie in ('url', 'item') and canon and re.match(", 'elif False and re.match('),
            ('JSON-LD-ul celuilalt domeniu primit pe orice pagina', "elif cheie in ('url', 'item') and canon and re.match(re.escape(oy) + r'(?:/|$)', canon.group(1)):",
             "elif cheie in ('url', 'item'):"),
            # Felia 148: U+00A0 tratat ca spatiu numai in numarul afisat (tiparul, forma pastrata la inlocuire, cautarea
            # valorilor lui A ramase pe B).
            ('U+00A0 netratat in numarul afisat', "return re.compile(('[ ' + NBSP + ']').join(", "return re.compile((' ').join("),
            ('numarul lui B scris cu spatii obisnuite si pe aparitia nedespartita',
             "return nou.replace(' ', NBSP) if NBSP in m.group(0) else nou", 'return nou'),
            ('valorile lui A ramase pe B cautate literal', "if va[k] != vb[k] and contine_valoare(va, k, text)]",
             "if va[k] != vb[k] and va[k] in text]"),
            # Runda de reparatii: cele trei cautari ale numarului lui A (9b), fiecare cu potrivirea literala readusa.
            ('numarul din sectiunile documentului cautat literal',
             "if any(va[k] != vb[k] and contine_valoare(va, k, text) for k in ('email', 'telefonAfisat')):",
             "if any(va[k] != vb[k] and va[k] in text for k in ('email', 'telefonAfisat')):"),
            ('numarul din randul destinatarilor cautat literal', "return are_numar_afisat(v['telefonAfisat'], text) or",
             "return v['telefonAfisat'] in text or"),
            ('numarul paginii cu contact cautat literal', "return are_numar_afisat(va['telefonAfisat'], text) or",
             "return va['telefonAfisat'] in text or"),
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

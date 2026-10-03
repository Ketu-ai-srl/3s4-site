#!/usr/bin/env python3
"""Poarta de reciprocitate hreflang: se masoara pe HTML-ul CONSTRUIT (`.next/server/app/**/*.html`).

DE CE EXISTA. Google ignora o pereche hreflang care nu se listeaza reciproc: daca pagina EN spune ca are
varianta `ro-MD` la adresa X, pagina X trebuie sa spuna, la randul ei, ca are varianta `en` la adresa
paginii EN. O jumatate de pereche nu produce nicio eroare vizibila (pagina se randeaza, build-ul trece),
deci fara poarta defectul ar fi tacut.

PROFILUL se citeste din BUILD, nu din mediul shell-ului: `.next/required-server-files.json`, cheia
`config.env.NEXT_PUBLIC_SITE_EDITII` (pusa de `next.config.ts` numai pe un profil diferit de `ro-RO`).
O variabila uitata in shell n-are cum sa schimbe verdictul; un build construit cu alt profil decat crezi
se masoara cu profilul cu care a fost construit. Controlul citirii: `NEXT_PUBLIC_FAMILIE_JURIDICA` e
definita de `next.config.ts` pe ORICE profil; daca lipseste, fisierul nu e cel asteptat si verdictul e 3.

CE VERIFICA, pe fiecare pagina construita (paginile de eroare in afara):
  R-01  fiecare `<link rel="alternate" hreflang>` spre ALTA pagina are perechea inversa: pagina tinta
        listeaza adresa sursei, cu acelasi cod pe care sursa si-l da siesi
  R-02  tinta unui alternate e o pagina a acestui build (acelasi domeniu, HTML construit)
  R-03  o pagina cu alternate are o auto-referinta: un cod (altul decat x-default) spre propria adresa
  R-04  multimea paginilor cu pereche (alternate spre alta pagina) = paginile din `src/content/echivalente.ts`
        ale caror chei au cel putin doua editii ale profilului; o pagina asteptata fara pereche si o
        pagina cu pereche neasteptata pica la fel. Pe `ro-RO` multimea asteptata e goala
  R-05  pe build-ul `ro-RO` nu exista niciun alternate hreflang (site-ul romanesc nu emite perechi pana
        cand gazda romaneasca serveste paginile si emite reciprocele)

Adresa unei pagini e `<origine><ruta>`, cu originea luata din canonical-urile lotului (toate trebuie sa
aiba aceeasi origine; altfel 3). Adresele se compara fara bara finala (`https://3s.md` = `https://3s.md/`).

CONTROALE, la fiecare rulare (fixturile se asambleaza din bucati, la rulare):
  martor NEGATIV  un lot fabricat cu o pereche corecta (en, ro-MD, x-default) nu produce nimic
  martori POZITIVI cate unul pe fiecare cod: o pereche scoasa (R-01), o tinta fara pagina (R-02), o pagina
                  fara auto-referinta (R-03), o pagina asteptata fara pereche (R-04), un alternate pe
                  `ro-RO` (R-05); plus citirea echivalentelor dintr-un text fabricat
Un martor care nu se comporta cum trebuie da 3, nu 0.

CE NU VERIFICA (reziduuri):
  - O tinta pe ALT domeniu (de pilda `ro-RO` spre 3s.com.ro, cand gazda romaneasca va emite reciprocele)
    nu se poate masura din acest build: poarta iese 3 si numeste tinta. Ziua in care apare o astfel de
    pereche, poarta primeste al doilea build (`--alt-build`), nu o scutire.
  - Codurile hreflang nu se valideaza ca forma (BCP 47) si nici contra limbii textului; `<html lang>` si
    `Content-Language` le masoara proba de acceptanta (tests/browser/acceptanta-3s-md.spec.ts).
  - Se masoara HTML-ul STATIC; antetele HTTP `Link` si harta de site cu `xhtml:link` nu se citesc.
  - Echivalentele se citesc ca TEXT din `src/content/echivalente.ts` (obiecte plate `{ en: "...", ... }`);
    o forma noua a fisierului (valori calculate) face citirea sa piarda chei, iar R-04 se inroseste - nu
    tace.

IESIRE
    0 = curat
    1 = defecte R-01 - R-05
    2 = eroare de folosire
    3 = NEMASURAT: control picat, build lipsa sau mai vechi decat src/, profil necitibil, tinta pe alt
        domeniu, echivalente necitibile
"""
import argparse
import glob
import json
import os
import re
import sys
from html.parser import HTMLParser

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA_IMPLICITA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Paginile interne de eroare nu au alternate si nu sunt in harta de site (acelasi motiv ca in poarta-seo).
PAGINI_SARITE = {'_not-found', '404', '500'}

# Catalogul editiilor: codul -> prefixul de cale. Copia celui din `src/lib/editii.ts` (EDITII), verificata
# contra sursei la fiecare rulare (`prefixe_din_sursa`): o editie noua sau un prefix schimbat acolo face
# poarta sa iasa 3, nu sa masoare cu un catalog vechi.
PREFIXE = {'ro-RO': '', 'en': '', 'ro-MD': '/ro'}
PROFIL_IMPLICIT = ['ro-RO']
VARIABILA_PROFIL = 'NEXT_PUBLIC_SITE_EDITII'
VARIABILA_MARTOR = 'NEXT_PUBLIC_FAMILIE_JURIDICA'
X_DEFAULT = 'x-default'


class Culegator(HTMLParser):
    """Alternatele hreflang si canonical-ul unei pagini, din etichetele `<link>`."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.alternate = []   # (hreflang, href)
        self.canonice = []

    def handle_starttag(self, tag, attrs):
        if tag != 'link':
            return
        a = {k.lower(): (v or '') for k, v in attrs}
        rel = a.get('rel', '').lower().split()
        if 'canonical' in rel:
            self.canonice.append(a.get('href', ''))
        if 'alternate' in rel and a.get('hreflang'):
            self.alternate.append((a['hreflang'], a.get('href', '')))

    handle_startendtag = handle_starttag


def culege(html):
    c = Culegator()
    c.feed(html)
    return c


def normalizeaza(url):
    """Adresa fara bara finala si fara parametri; `https://3s.md/` -> `https://3s.md`."""
    url = url.split('#')[0].split('?')[0]
    return url[:-1] if url.endswith('/') else url


def origine(url):
    m = re.match(r'^(https?://[^/]+)', url)
    return m.group(1) if m else None


# ---------------------------------------------------------------- echivalentele

def echivalente_din_text(text):
    """{cheie: {cod: cale}} din textul lui `echivalente.ts`, sau None cand blocul ECHIVALENTE lipseste."""
    m = re.search(r'export\s+const\s+ECHIVALENTE\b[^=]*=\s*\{([\s\S]*?)\n\};', text)
    if not m:
        return None
    corp = re.sub(r'//[^\n]*', '', m.group(1))
    rezultat = {}
    for intrare in re.finditer(r'("([^"]+)"|([A-Za-z_][\w]*))\s*:\s*\{([^{}]*)\}', corp):
        cheie = intrare.group(2) or intrare.group(3)
        cai = {}
        for p in re.finditer(r'(?:"([^"]+)"|([A-Za-z_][\w]*))\s*:\s*"([^"]*)"', intrare.group(4)):
            cai[p.group(1) or p.group(2)] = p.group(3)
        rezultat[cheie] = cai
    return rezultat


def pagini_asteptate(echivalente, editii):
    """Caile paginilor care trebuie sa aiba pereche: cheile cu cel putin doua editii ale profilului."""
    asteptate = set()
    for cai in echivalente.values():
        din_profil = [cai[c] for c in editii if c in cai]
        if len(din_profil) >= 2:
            asteptate.update(normalizeaza_cale(c) for c in din_profil)
    return asteptate


def normalizeaza_cale(cale):
    cale = cale.split('#')[0].split('?')[0]
    if cale != '/' and cale.endswith('/'):
        cale = cale[:-1]
    return cale or '/'


# ---------------------------------------------------------------- analiza

def analizeaza(pagini, editii, echivalente):
    """`pagini` = {ruta: html}. Intoarce (defecte, nemasurate, perechi): liste de (cod, mesaj) si
    multimea rutelor cu pereche."""
    defecte = []
    nemasurate = []
    culese = {r: culege(h) for r, h in pagini.items()}

    if 'ro-RO' in editii:
        for ruta, c in sorted(culese.items()):
            if c.alternate:
                defecte.append(('R-05', ruta + ': build ro-RO cu ' + str(len(c.alternate)) + ' alternate hreflang ('
                                + ', '.join(h + '=' + u for h, u in c.alternate) + ')'))
        asteptate = pagini_asteptate(echivalente, editii)
        if asteptate:
            defecte.append(('R-04', 'echivalentele cer pereche pe build-ul ro-RO: ' + ', '.join(sorted(asteptate))))
        return defecte, nemasurate, set()

    origini = {origine(normalizeaza(u)) for c in culese.values() for u in c.canonice}
    origini.discard(None)
    if len(origini) != 1:
        nemasurate.append(('origine', 'canonical-urile lotului au ' + str(len(origini)) + ' origini ('
                           + ', '.join(sorted(origini)) + '); adresa paginilor nu se poate stabili'))
        return defecte, nemasurate, set()
    baza = origini.pop()

    def adresa(ruta):
        return normalizeaza(baza + ('' if ruta == '/' else ruta))

    def ruta_din(url):
        u = normalizeaza(url)
        if origine(u) != baza:
            return None
        return normalizeaza_cale(u[len(baza):] or '/')

    harta = {}  # ruta -> {hreflang: adresa normalizata}
    for ruta, c in culese.items():
        harta[ruta] = {}
        for h, u in c.alternate:
            harta[ruta][h] = normalizeaza(u)

    perechi = set()
    for ruta in sorted(harta):
        alt = harta[ruta]
        if not alt:
            continue
        proprie = adresa(ruta)
        coduri_proprii = [h for h, u in alt.items() if u == proprie and h != X_DEFAULT]
        straine = {h: u for h, u in alt.items() if u != proprie}
        if not coduri_proprii:
            defecte.append(('R-03', ruta + ': are alternate, dar niciun cod spre propria adresa ' + proprie))
        if straine:
            perechi.add(ruta)
        for h, u in sorted(straine.items()):
            tinta = ruta_din(u)
            if tinta is None:
                nemasurate.append(('alt domeniu', ruta + ': ' + h + ' -> ' + u + ' e pe alt domeniu decat ' + baza
                                   + '; reciproca nu se vede din acest build'))
                continue
            if tinta not in harta:
                defecte.append(('R-02', ruta + ': ' + h + ' -> ' + u + ' nu e o pagina a acestui build'))
                continue
            inverse = harta[tinta]
            for cod in coduri_proprii:
                if inverse.get(cod) != proprie:
                    defecte.append(('R-01', ruta + ': ' + h + ' -> ' + tinta + ', dar ' + tinta + ' nu listeaza '
                                    + cod + ' -> ' + proprie + ' (are ' + (cod + ' -> ' + inverse[cod] if cod in inverse
                                                                            else 'fara ' + cod) + ')'))

    asteptate = pagini_asteptate(echivalente, editii)
    for ruta in sorted(asteptate - perechi):
        defecte.append(('R-04', ruta + ': in echivalente cu pereche, dar pagina construita nu are alternate spre alta '
                        'pagina' + ('' if ruta in harta else ' (pagina lipseste din build)')))
    for ruta in sorted(perechi - asteptate):
        defecte.append(('R-04', ruta + ': are alternate spre alta pagina, dar nu e in echivalente'))
    return defecte, nemasurate, perechi


# ---------------------------------------------------------------- controale

BAZA_PROBA = 'https://' + 'exemplu-' + 'reciproc.test'


def _pagina(alternate, canonical):
    bucati = ['<html><head><link rel="canonical" href="' + canonical + '"/>']
    for h, u in alternate:
        bucati.append('<link rel="alternate" hrefLang="' + h + '" href="' + u + '"/>')
    bucati.append('</head><body><p>x</p></body></html>')
    return ''.join(bucati)


def _lot(fara_inversa=False, tinta_lipsa=False, fara_auto=False):
    en, ro = BAZA_PROBA + '/doc', BAZA_PROBA + '/ro/doc'
    alt_en = [('en', en), ('ro-MD', ro), (X_DEFAULT, en)]
    alt_ro = [('ro-MD', ro), ('en', en), (X_DEFAULT, en)]
    if fara_inversa:
        alt_ro = [p for p in alt_ro if p[0] != 'en']
    if tinta_lipsa:
        alt_en = alt_en + [('fr', BAZA_PROBA + '/fr/doc')]
    if fara_auto:
        alt_en = [p for p in alt_en if p[0] != 'en']
    return {'/doc': _pagina(alt_en, en), '/ro/doc': _pagina(alt_ro, ro), '/altceva': _pagina([], BAZA_PROBA + '/altceva')}


ECHIVALENTE_PROBA = {'doc': {'en': '/doc', 'ro-MD': '/ro/doc'}}
PROFIL_PROBA = ['en', 'ro-MD']


def _coduri(rezultat):
    return {c for c, _ in rezultat[0]}


def controale():
    """None daca toti martorii se comporta cum trebuie, altfel motivul."""
    curat = analizeaza(_lot(), PROFIL_PROBA, ECHIVALENTE_PROBA)
    if curat[0] or curat[1]:
        return 'martorul negativ a fost prins: ' + '; '.join(m for _, m in curat[0] + curat[1])
    if curat[2] != {'/doc', '/ro/doc'}:
        return 'martorul negativ: perechile citite sunt ' + repr(sorted(curat[2])) + ', nu /doc si /ro/doc'
    for eticheta, lot, ech, editii, cod in (
        ('o pereche scoasa', _lot(fara_inversa=True), ECHIVALENTE_PROBA, PROFIL_PROBA, 'R-01'),
        ('o tinta fara pagina', _lot(tinta_lipsa=True), ECHIVALENTE_PROBA, PROFIL_PROBA, 'R-02'),
        ('o pagina fara auto-referinta', _lot(fara_auto=True), ECHIVALENTE_PROBA, PROFIL_PROBA, 'R-03'),
        ('o pagina asteptata fara pereche', _lot(), dict(ECHIVALENTE_PROBA, alta={'en': '/altceva', 'ro-MD': '/ro/altceva'}),
         PROFIL_PROBA, 'R-04'),
        ('un alternate pe ro-RO', _lot(), {}, ['ro-RO'], 'R-05'),
    ):
        if cod not in _coduri(analizeaza(lot, editii, ech)):
            return 'martorul pozitiv (' + eticheta + ') nu a fost prins pe ' + cod
    # Citirea echivalentelor: un text fabricat, cu cheie citata si necitata, comentariu si doua editii.
    text = ('export const ECHIVALENTE: Readonly<Record<string, CaiPeEditie>> = {\n'
            '  // comentariu: { en: "/nu-se-citeste" }\n'
            '  "doc-unu": { en: "/a", "ro-MD": "/ro/a" },\n'
            '  doi: {\n    en: "/b",\n    "ro-MD": "/ro/b",\n  },\n'
            '};\n')
    citite = echivalente_din_text(text)
    if citite != {'doc-unu': {'en': '/a', 'ro-MD': '/ro/a'}, 'doi': {'en': '/b', 'ro-MD': '/ro/b'}}:
        return 'martorul citirii echivalentelor: am citit ' + repr(citite)
    if echivalente_din_text('export const ALTCEVA = {};\n') is not None:
        return 'martorul citirii echivalentelor: un fisier fara ECHIVALENTE a fost citit ca gol, nu ca lipsa'
    return None


# ---------------------------------------------------------------- sursa si build

def prefixe_din_sursa(radacina):
    """{cod: prefix} din `src/lib/editii.ts`, sau None cand nu se poate citi."""
    try:
        text = open(os.path.join(radacina, 'src', 'lib', 'editii.ts'), encoding='utf-8').read()
    except OSError:
        return None
    m = re.search(r'export const EDITII\b[\s\S]*?=\s*\{([\s\S]*?)\n\};', text)
    if not m:
        return None
    return {cod: prefix for cod, prefix in re.findall(r'"?([\w-]+)"?:\s*\{\s*cod:\s*"[^"]+",\s*prefix:\s*"([^"]*)"', m.group(1))}


def profil_din_build(radacina):
    """(editii, motiv): lista editiilor build-ului, sau (None, motivul pentru care nu se poate citi)."""
    cale = os.path.join(radacina, '.next', 'required-server-files.json')
    try:
        with open(cale, encoding='utf-8') as f:
            date = json.load(f)
    except (OSError, ValueError) as e:
        return None, 'nu pot citi ' + os.path.relpath(cale, radacina) + ' (' + str(e) + ')'
    env = date.get('config', {}).get('env') if isinstance(date, dict) else None
    if not isinstance(env, dict) or VARIABILA_MARTOR not in env:
        return None, (os.path.relpath(cale, radacina) + ' nu are config.env.' + VARIABILA_MARTOR
                      + ', pusa de next.config.ts pe orice profil: fisierul nu e cel asteptat')
    brut = (env.get(VARIABILA_PROFIL) or '').strip()
    if not brut:
        return list(PROFIL_IMPLICIT), None
    editii = [b.strip() for b in brut.split(',') if b.strip()]
    necunoscute = [e for e in editii if e not in PREFIXE]
    if necunoscute:
        return None, VARIABILA_PROFIL + ' din build numeste editii necunoscute: ' + ', '.join(necunoscute)
    return editii, None


def cele_mai_noi(dosar):
    if not os.path.isdir(dosar):
        return None
    varf = None
    for radacina, directoare, nume in os.walk(dosar):
        directoare[:] = [d for d in directoare if d not in ('node_modules', '.git', '__pycache__')]
        for n in nume:
            t = os.path.getmtime(os.path.join(radacina, n))
            if varf is None or t > varf:
                varf = t
    return varf


def ruta_din_cale(cale, dosar):
    rel = os.path.relpath(cale, dosar).replace(os.sep, '/')[:-len('.html')]
    if rel == 'index':
        return '/'
    if rel.endswith('/index'):
        rel = rel[:-len('/index')]
    return '/' + rel


def main():
    p = argparse.ArgumentParser(description='Poarta de reciprocitate hreflang pe HTML-ul construit (R-01 - R-05).')
    p.add_argument('--radacina', default=RADACINA_IMPLICITA, help='radacina proiectului')
    a = p.parse_args()
    radacina = os.path.abspath(a.radacina)

    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    din_sursa = prefixe_din_sursa(radacina)
    if din_sursa is None:
        print('poarta-reciprocitate: nu pot citi catalogul EDITII din src/lib/editii.ts - NEMASURAT', file=sys.stderr)
        return 3
    if din_sursa != PREFIXE:
        print('poarta-reciprocitate: catalogul EDITII din src/lib/editii.ts (' + repr(din_sursa) + ') difera de copia '
              'portii (' + repr(PREFIXE) + ') - NEMASURAT; se actualizeaza PREFIXE', file=sys.stderr)
        return 3

    try:
        text_ech = open(os.path.join(radacina, 'src', 'content', 'echivalente.ts'), encoding='utf-8').read()
    except OSError:
        print('poarta-reciprocitate: lipseste src/content/echivalente.ts - NEMASURAT', file=sys.stderr)
        return 3
    echivalente = echivalente_din_text(text_ech)
    if echivalente is None:
        print('poarta-reciprocitate: src/content/echivalente.ts nu are blocul ECHIVALENTE - NEMASURAT', file=sys.stderr)
        return 3
    # Controlul citirii pe fisierul real: fiecare cale scrisa intre ghilimele in bloc a fost citita.
    bloc = re.search(r'export\s+const\s+ECHIVALENTE\b[^=]*=\s*\{([\s\S]*?)\n\};', text_ech).group(1)
    scrise = len(re.findall(r':\s*"/[^"]*"', re.sub(r'//[^\n]*', '', bloc)))
    citite = sum(len(c) for c in echivalente.values())
    if scrise != citite:
        print('poarta-reciprocitate: in ECHIVALENTE sunt ' + str(scrise) + ' cai scrise, am citit ' + str(citite)
              + ' - NEMASURAT (forma fisierului s-a schimbat)', file=sys.stderr)
        return 3

    dosar = os.path.join(radacina, '.next', 'server', 'app')
    cai = sorted(glob.glob(os.path.join(dosar, '**', '*.html'), recursive=True))
    cai = [c for c in cai if os.path.splitext(os.path.basename(c))[0] not in PAGINI_SARITE]
    if not cai:
        print('poarta-reciprocitate: niciun HTML construit in ' + os.path.relpath(dosar, radacina)
              + ' - masuratoarea e invalida, nu curata. Ruleaza pnpm build', file=sys.stderr)
        return 3
    proaspat_sursa = cele_mai_noi(os.path.join(radacina, 'src'))
    vechi_build = min(os.path.getmtime(c) for c in cai)
    if proaspat_sursa is not None and proaspat_sursa > vechi_build:
        print('poarta-reciprocitate: buildul e mai vechi decat src/ - as masura un site care nu mai exista. '
              'Ruleaza pnpm build', file=sys.stderr)
        return 3

    editii, motiv = profil_din_build(radacina)
    if editii is None:
        print('poarta-reciprocitate: profilul build-ului nu se poate citi: ' + motiv + ' - NEMASURAT', file=sys.stderr)
        return 3

    pagini = {}
    for c in cai:
        with open(c, encoding='utf-8') as f:
            pagini[ruta_din_cale(c, dosar)] = f.read()

    defecte, nemasurate, perechi = analizeaza(pagini, editii, echivalente)
    for cod, mesaj in defecte:
        print('OPRESTE  ' + cod + '  ' + mesaj)
    for ce, mesaj in nemasurate:
        print('NEMASURAT  ' + ce + '  ' + mesaj, file=sys.stderr)

    print('CONTROALE: martor negativ OK, martori pozitivi OK (R-01 pereche scoasa, R-02 tinta lipsa, '
          'R-03 fara auto-referinta, R-04 pagina asteptata fara pereche, R-05 alternate pe ro-RO), citirea echivalentelor OK')
    print('PROFIL (din build): ' + ','.join(editii))
    print('SURSA: ' + str(len(pagini)) + ' pagina(i) construita(e); ' + str(len(perechi)) + ' cu pereche hreflang'
          + (': ' + ', '.join(sorted(perechi)) if perechi else ''))
    print('ASTEPTATE (din echivalente): ' + str(len(pagini_asteptate(echivalente, editii))) + ' pagina(i)')
    print('DEFECTE DE RECIPROCITATE: ' + str(len(defecte)))
    if defecte:
        return 1
    if nemasurate:
        return 3
    return 0


if __name__ == '__main__':
    sys.exit(main())

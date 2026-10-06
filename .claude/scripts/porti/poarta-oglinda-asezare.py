#!/usr/bin/env python3
"""Fiecare pagina a site-ului international are geamana ei pe asezarea `ro`, si numai geamana.

DE CE EXISTA. Acelasi continut ruleaza pe doua domenii, cu doua asezari (`src/lib/asezare.ts`): pe 3s.md engleza
sta la radacina si romana sub `/ro` (grupurile `(en)` si `(romd)`, sufixele `en.tsx` si `romd.tsx`); pe 3s.com.ro
romana sta la radacina si engleza sub `/en`. Next ia adresa din locul fisierului, deci asezarea `ro` are arborele ei:
grupurile `(comro)` (romana la radacina) si `(comroen)/en` (engleza sub `/en`), cu sufixul `comro.tsx`, ales de
`pageExtensions` numai pe asezarea `ro` (`src/lib/editii.ts`). Fiecare fisier de acolo e SUBTIRE: reexporta modulul
geaman, ca textul sa ramana unul singur. Fara poarta, o pagina noua pe 3s.md fara geamana ar lipsi tacut de pe
3s.com.ro (404 la o adresa pe care 3s.md o are), iar o geamana care scrie continut propriu ar desparti cele doua
site-uri exact acolo unde trebuie sa fie identice.

CE PRINDE (pe surse, implicit)
  OA-01  un `page|route|layout` din `(en)` sau `(romd)` fara geamana `*.comro.tsx` la locul asezarii `ro`:
         `(en)/X/<f>.en.tsx` -> `(comroen)/en/X/<f>.comro.tsx`; `(romd)/ro/X/<f>.romd.tsx` ->
         `(comro)/X/<f>.comro.tsx`; layout-ul `(romd)/layout.romd.tsx` -> `(comro)/layout.comro.tsx`
  OA-02  un fisier `*.comro.tsx` din `(comro)` / `(comroen)` care nu e geamana niciunei surse (orfan, sau o piesa
         ajutatoare scrisa acolo), in afara listei inchise `PROPRII_RO`: continut propriu asezarii `ro`
  OA-03  o geamana care nu e o reexportare pura a sursei: altceva decat `export { ... } from "<modulul sursei>"`
         plus configurarea segmentului scrisa literal; alte nume exportate decat sursa; o valoare de configurare
         (`dynamicParams`, `dynamic`, `revalidate`, ...) diferita de cea a sursei (Next o citeste din fisierul rutei,
         deci reexportarea ei nu e de ajuns - se scrie literal, cu aceeasi valoare)
  OA-04  un fisier care nu e `*.comro.tsx` in `(comro)` sau `(comroen)`: un `page.tsx` acolo ar deveni pagina
         site-ului romanesc vechi (pe `ro-RO` `tsx` e extensie de pagina), iar pe asezarea `ro` n-ar exista
  OA-05  `global-not-found.en.tsx` fara `global-not-found.comro.tsx` (sau invers): pe asezarea `ro` adresele
         necunoscute n-ar avea pagina
  OA-06  o intrare din `PROPRII_RO` al carei fisier nu exista, sau care nu reexporta sursa numita: o exceptare
         ramasa in urma taie tacut verificarea pentru care exista

CE PRINDE (pe build, cu `--colectie <dir> --perechi <fisier>`)
  OA-10  caile servite de build-ul asezarii `ro` (colectia lui `colecteaza-build.mjs`, fara pagina de negasit si fara
         calea inexistenta) difera de partea `b` a perechilor (`perechi-asezare.mjs`: rutele 3s.md trecute prin
         `caleServita`, rutele grupului, fisierele domeniului) plus caile proprii ale asezarii (`PROPRII_RO`). Zero in
         plus, zero lipsa; numarul se tipareste.
  OA-11  o cale asteptata (partea `b` a perechilor sau `PROPRII_RO`) prezenta in colectie cu alt status decat cel cerut:
         200, sau valoarea din lista inchisa `STATUS_ALTUL` (fisierele domeniului care raspund 404 prin proiectare cand
         variabila lor lipseste, la fel pe ambele asezari). O cale servita cu 404 lipseste de fapt, chiar daca apare
         in colectie.

PROPRII_RO (lista INCHISA, fiecare cu motiv): imaginile sociale de la radacina. Paginile le numesc la
`/opengraph-image` si `/twitter-image` (`metadataPagina`, cai care nu sunt rute, deci nu se traduc), iar pe asezarea `ro`
radacina e a romanei: fara geamana de la radacina, `og:image` ar duce la 404. Geamana de sub `/en` ramane, fiindca
perechile grupului `en` o cer (`RUTE_GRUP` din `src/lib/asezare.ts`).

CONTROALE la fiecare rulare, pe arbori si colectii fabricate in temp, prin aceleasi functii ca arborele real:
martor negativ (arbore oglindit corect: nimic), martori pozitivi OA-01, OA-02, OA-03 (continut propriu, nume lipsa,
configurare diferita), OA-04, OA-05; pe build, martor negativ (cu o cale din `STATUS_ALTUL` pe statusul ei) si pozitivi
pentru o cale in plus, una lipsa, una asteptata servita cu 404 si una din `STATUS_ALTUL` servita cu alt status. Daca
vreunul cade, verdictul e NEMASURAT (3), nu "curat".

CE NU VERIFICA (reziduuri)
  - Daca pagina servita pe `ro` ARATA la fel cu cea de pe 3s.md: reexportarea garanteaza acelasi modul, nu acelasi
    HTML (traducerea cailor, contactele, limba); aceea e proba de identitate a celor doua build-uri.
  - Componentele ajutatoare din grupuri (`_produs`, `_editie`, ...): nu sunt rute, deci nu au geamana; geamana le
    foloseste prin modulul sursei.
  - Pe build, multimea cailor si statusul lor, nu si continutul. Statusul cerut e 200, in afara de `STATUS_ALTUL`;
    acolo se cere valoarea din lista, nu se compara cu statusul aceleiasi cai pe 3s.md (colectia 3s.md nu e in acest
    job).

LA ROSU: geamana lipsa se scrie dupa modelul celorlalte (cateva randuri: comentariul, reexportarea, configurarea
literala); geamana orfana se sterge odata cu sursa ei; `PROPRII_RO` se schimba numai cu motiv scris. Nu se slabesc
controalele si nici regula de reexportare.

IESIRE: 0 curat - 1 nepotriviri - 2 folosire gresita - 3 NEMASURAT (control picat, arbore gol, colectie ilizibila)
"""
import io
import json
import os
import re
import shutil
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA_IMPLICITA = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
NEMASURAT = 3
SUFIX_RO = '.comro.tsx'
# Configurarea segmentului, citita de Next din fisierul rutei: se scrie literal in geamana, cu valoarea sursei.
CONFIGURARE = ('dynamicParams', 'dynamic', 'revalidate', 'runtime', 'fetchCache', 'preferredRegion', 'maxDuration')
GRUPURI_RO = ('(comro)', '(comroen)')
# Geamanele proprii asezarii `ro`, fara sursa la acelasi loc: cale -> (sursa reexportata, calea servita, motiv).
PROPRII_RO = {
    'src/app/(comro)/opengraph-image/route.comro.tsx': (
        'src/app/(en)/opengraph-image/route.en.tsx', '/opengraph-image',
        'paginile numesc imaginea la /opengraph-image (cale netradusa); pe asezarea ro radacina e a romanei'),
    'src/app/(comro)/twitter-image/route.comro.tsx': (
        'src/app/(en)/twitter-image/route.en.tsx', '/twitter-image',
        'paginile numesc cardul la /twitter-image (cale netradusa); pe asezarea ro radacina e a romanei'),
}
NEGASIT = ('src/app/global-not-found.en.tsx', 'src/app/global-not-found.comro.tsx')
# Caile asteptate care raspund cu alt status decat 200 prin proiectare, pe ambele asezari: cale -> (status, motiv).
# Lista INCHISA; o cale care trece pe 200 (variabila pusa in profil) inroseste poarta, ca exceptarea sa nu ramana in urma.
STATUS_ALTUL = {
    '/indexnow.txt': (404, 'fisierul cheii IndexNow raspunde 404 cand cheia lipseste din mediu (src/app/indexnow.txt/cheie.ts)'),
    '/instrumente/termene.ics': (404, 'calendarul termenelor raspunde 404 cand editia nu il construieste (route.ts al lui)'),
}


def citeste(cale):
    with io.open(cale, encoding='utf-8') as f:
        return f.read()


def fisiere_sub(radacina, rel):
    """Fisierele de sub `src/app/<rel>`, ca cai relative la radacina depozitului, cu `/`."""
    baza = os.path.join(radacina, *rel.split('/'))
    gasite = []
    for d, directoare, nume in os.walk(baza):
        directoare[:] = [x for x in directoare if x not in ('node_modules', '__pycache__')]
        for n in nume:
            gasite.append(os.path.relpath(os.path.join(d, n), radacina).replace(os.sep, '/'))
    return sorted(gasite)


def geamana(sursa):
    """Calea geamanei `ro` a unui fisier sursa, sau None cand fisierul nu e o ruta de oglindit."""
    nume = sursa.rsplit('/', 1)[1]
    m = re.match(r'^(page|route|layout)\.(en|romd)\.tsx$', nume)
    if not m:
        return None
    dir_ = sursa.rsplit('/', 1)[0]
    if m.group(2) == 'en' and dir_.startswith('src/app/(en)'):
        rest = dir_[len('src/app/(en)'):]
        return 'src/app/(comroen)/en' + rest + '/' + m.group(1) + SUFIX_RO
    if m.group(2) == 'romd' and dir_.startswith('src/app/(romd)'):
        rest = dir_[len('src/app/(romd)'):]
        if rest == '/ro' or rest.startswith('/ro/'):
            rest = rest[len('/ro'):]
        return 'src/app/(comro)' + rest + '/' + m.group(1) + SUFIX_RO
    return None


def modul(cale):
    """Specificatorul de import al unui fisier din `src/`: `@/` + calea fara `.tsx`."""
    return '@/' + cale[len('src/'):-len('.tsx')]


def exporturi(text):
    """(numele exportate in afara configurarii, {configurare: valoare text}) ale unui fisier sursa."""
    nume = set(re.findall(r'^export\s+(?:async\s+)?(?:const|function|let)\s+(\w+)', text, re.M))
    if re.search(r'^export\s+default\b', text, re.M):
        nume.add('default')
    config = {}
    for n in list(nume):
        if n in CONFIGURARE:
            m = re.search(r'^export\s+const\s+' + n + r'\s*(?::[^=]+)?=\s*(.+?);?\s*$', text, re.M)
            config[n] = m.group(1).strip() if m else None
            nume.discard(n)
    return nume, config


def fara_comentarii(text):
    return [r.strip() for r in text.splitlines() if r.strip() and not r.strip().startswith('//')]


def verifica_reexport(text_geamana, cale_geamana, sursa, text_sursa):
    """Lista de mesaje OA-03 (goala = geamana e o reexportare pura a sursei)."""
    probleme = []
    asteptat_modul = modul(sursa)
    nume_sursa, config_sursa = exporturi(text_sursa)
    reexportate = set()
    config_geamana = {}
    for rand in fara_comentarii(text_geamana):
        m = re.match(r'^export\s*\{([^}]*)\}\s*from\s*"([^"]+)";?$', rand)
        if m:
            if m.group(2) != asteptat_modul:
                probleme.append('`' + cale_geamana + '` reexporta din `' + m.group(2) + '`, nu din sursa `' + asteptat_modul + '`')
            reexportate |= set(x.strip() for x in m.group(1).split(',') if x.strip())
            continue
        m = re.match(r'^export\s+const\s+(\w+)\s*=\s*(.+?);?$', rand)
        if m and m.group(1) in CONFIGURARE:
            config_geamana[m.group(1)] = m.group(2).strip()
            continue
        probleme.append('`' + cale_geamana + '` are un rand care nu e reexportare sau configurare literala: `' + rand[:80] + '`')
    if reexportate != nume_sursa:
        lipsa = sorted(nume_sursa - reexportate)
        plus = sorted(reexportate - nume_sursa)
        probleme.append('`' + cale_geamana + '` reexporta alte nume decat sursa' +
                        (' (lipsa: ' + ', '.join(lipsa) + ')' if lipsa else '') +
                        (' (in plus: ' + ', '.join(plus) + ')' if plus else ''))
    if config_geamana != config_sursa:
        probleme.append('`' + cale_geamana + '` are configurarea segmentului ' + json.dumps(config_geamana, sort_keys=True) +
                        ', sursa `' + sursa + '` are ' + json.dumps(config_sursa, sort_keys=True) +
                        ' (se scrie literal, cu aceeasi valoare)')
    return probleme


def gasiri_surse(radacina):
    """(constatari, numar de surse oglindite, numar de geamane) pe arborele de sub `radacina`."""
    gasiri = []
    surse = [f for f in fisiere_sub(radacina, 'src/app/(en)') + fisiere_sub(radacina, 'src/app/(romd)') if geamana(f)]
    asteptate = {geamana(f): f for f in surse}
    for g, f in sorted(asteptate.items()):
        cale = os.path.join(radacina, *g.split('/'))
        if not os.path.isfile(cale):
            gasiri.append(('OA-01', '`' + f + '` nu are geamana pe asezarea ro: lipseste `' + g + '`'))
            continue
        for mesaj in verifica_reexport(citeste(cale), g, f, citeste(os.path.join(radacina, *f.split('/')))):
            gasiri.append(('OA-03', mesaj))
    din_grupuri = []
    for grup in GRUPURI_RO:
        din_grupuri += fisiere_sub(radacina, 'src/app/' + grup)
    for g in din_grupuri:
        if not g.endswith(SUFIX_RO):
            gasiri.append(('OA-04', '`' + g + '` sta in ' + ' / '.join(GRUPURI_RO) + ' fara sufixul comro.tsx: pe site-ul '
                           'romanesc vechi un fisier .tsx de acolo devine ruta, iar pe asezarea ro nu exista'))
            continue
        if g in asteptate:
            continue
        if g in PROPRII_RO:
            sursa = PROPRII_RO[g][0]
            cale_sursa = os.path.join(radacina, *sursa.split('/'))
            if not os.path.isfile(cale_sursa):
                gasiri.append(('OA-06', '`' + g + '` e in PROPRII_RO cu sursa `' + sursa + '`, care nu exista'))
                continue
            for mesaj in verifica_reexport(citeste(os.path.join(radacina, *g.split('/'))), g, sursa, citeste(cale_sursa)):
                gasiri.append(('OA-06', mesaj))
            continue
        gasiri.append(('OA-02', '`' + g + '` nu e geamana niciunui fisier de ruta din (en) / (romd) si nu e in PROPRII_RO'))
    for p in sorted(PROPRII_RO):
        if p not in din_grupuri:
            gasiri.append(('OA-06', 'PROPRII_RO numeste `' + p + '`, care nu exista: exceptarea a ramas in urma'))
    en, ro = (os.path.isfile(os.path.join(radacina, *n.split('/'))) for n in NEGASIT)
    if en != ro:
        gasiri.append(('OA-05', 'pagina de negasit: `' + NEGASIT[0] + '` ' + ('exista' if en else 'lipseste') + ', `' +
                       NEGASIT[1] + '` ' + ('exista' if ro else 'lipseste') + '; amandoua sau niciuna'))
    return gasiri, len(surse), len(din_grupuri)


def gasiri_build(colectie, perechi):
    """(constatari OA-10, numarul cailor servite comparate). `colectie` si `perechi` sunt JSON-urile citite."""
    inexistenta = colectie.get('caleInexistenta')
    status = {p['cale']: p.get('status') for p in colectie['pagini']}
    servite = set(status) - {'/_not-found', inexistenta}
    asteptate = set(p['b'] for p in perechi['perechi']) | set(v[1] for v in PROPRII_RO.values())
    gasiri = []
    for c in sorted(servite & asteptate):
        cerut = STATUS_ALTUL[c][0] if c in STATUS_ALTUL else 200
        if status[c] != cerut:
            gasiri.append(('OA-11', 'calea `' + c + '` e in colectia asezarii ro cu statusul ' + str(status[c]) + ', cerut ' +
                           str(cerut) + ': o cale care nu raspunde cu statusul ei lipseste de fapt'))
    for c in sorted(servite - asteptate):
        gasiri.append(('OA-10', 'calea `' + c + '` e servita de build-ul asezarii ro, dar nu e geamana niciunei cai 3s.md si nu e in PROPRII_RO'))
    for c in sorted(asteptate - servite):
        gasiri.append(('OA-10', 'calea `' + c + '` (geamana unei cai 3s.md sau proprie asezarii) lipseste din build-ul asezarii ro'))
    return gasiri, len(servite)


# ------------------------------------------------------------------ controale

def _scrie(radacina, rel, continut):
    cale = os.path.join(radacina, *rel.split('/'))
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with io.open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


def _arbore_oglindit(radacina):
    """Un arbore minim oglindit corect: o pagina EN, o pagina RO-MD cu configurare, layout-urile, imaginea, 404-urile."""
    _scrie(radacina, 'src/app/(en)/layout.en.tsx', 'export const metadata = {};\nexport default function L() {}\n')
    _scrie(radacina, 'src/app/(en)/pricing/page.en.tsx', 'export const metadata = {};\nexport default function P() {}\n')
    _scrie(radacina, 'src/app/(en)/opengraph-image/route.en.tsx', 'export const dynamic = "force-static";\nexport function GET() {}\n')
    _scrie(radacina, 'src/app/(en)/twitter-image/route.en.tsx', 'export const dynamic = "force-static";\nexport function GET() {}\n')
    _scrie(radacina, 'src/app/(en)/_ajutor/Piesa.tsx', 'export default function A() {}\n')
    _scrie(radacina, 'src/app/(romd)/layout.romd.tsx', 'export const metadata = {};\nexport default function L() {}\n')
    _scrie(radacina, 'src/app/(romd)/ro/juridic/[[...document]]/page.romd.tsx',
           'export const dynamicParams = false;\nexport function generateStaticParams() {}\nexport default function J() {}\n')
    _scrie(radacina, 'src/app/(comroen)/en/layout.comro.tsx', '// nota\nexport { default, metadata } from "@/app/(en)/layout.en";\n')
    _scrie(radacina, 'src/app/(comroen)/en/pricing/page.comro.tsx', 'export { default, metadata } from "@/app/(en)/pricing/page.en";\n')
    for img in ('opengraph-image', 'twitter-image'):
        rand = 'export { GET } from "@/app/(en)/' + img + '/route.en";\nexport const dynamic = "force-static";\n'
        _scrie(radacina, 'src/app/(comroen)/en/' + img + '/route.comro.tsx', rand)
        _scrie(radacina, 'src/app/(comro)/' + img + '/route.comro.tsx', rand)
    _scrie(radacina, 'src/app/(comro)/layout.comro.tsx', 'export { default, metadata } from "@/app/(romd)/layout.romd";\n')
    _scrie(radacina, 'src/app/(comro)/juridic/[[...document]]/page.comro.tsx',
           'export { default, generateStaticParams } from "@/app/(romd)/ro/juridic/[[...document]]/page.romd";\n'
           'export const dynamicParams = false;\n')
    _scrie(radacina, 'src/app/global-not-found.en.tsx', 'export default function N() {}\n')
    _scrie(radacina, 'src/app/global-not-found.comro.tsx', 'export default function N() {}\n')


def controale():
    lucru = tempfile.mkdtemp(prefix='poarta-oglinda-')
    try:
        def caz(nume, strica, cod_asteptat, fragment):
            r = os.path.join(lucru, nume)
            _arbore_oglindit(r)
            if strica:
                strica(r)
            gasiri, surse, _ = gasiri_surse(r)
            if cod_asteptat is None:
                if gasiri or surse != 6:
                    return 'martorul negativ: arborele oglindit corect a dat ' + repr(gasiri) + ' (' + str(surse) + ' surse, asteptat 6)'
                return None
            potrivite = [m for c, m in gasiri if c == cod_asteptat and fragment in m]
            if len(gasiri) != 1 or not potrivite:
                return 'martorul ' + nume + ': asteptam exact un ' + cod_asteptat + ' care numeste `' + fragment + '`, am primit ' + repr(gasiri)
            return None

        def sterge(rel):
            return lambda r: os.remove(os.path.join(r, *rel.split('/')))

        def scrie(rel, continut):
            return lambda r: _scrie(r, rel, continut)

        cazuri = [
            ('negativ', None, None, ''),
            ('OA-01', sterge('src/app/(comroen)/en/pricing/page.comro.tsx'), 'OA-01', '(comroen)/en/pricing/page.comro.tsx'),
            ('OA-01-layout', sterge('src/app/(comro)/layout.comro.tsx'), 'OA-01', '(comro)/layout.comro.tsx'),
            ('OA-02', scrie('src/app/(comro)/orfana/page.comro.tsx', 'export { default } from "@/app/(romd)/ro/orfana/page.romd";\n'),
             'OA-02', '(comro)/orfana/page.comro.tsx'),
            ('OA-03-continut', scrie('src/app/(comroen)/en/pricing/page.comro.tsx',
                                     'export { default, metadata } from "@/app/(en)/pricing/page.en";\nexport const titlu = "altul";\n'),
             'OA-03', 'nu e reexportare'),
            ('OA-03-nume', scrie('src/app/(comroen)/en/pricing/page.comro.tsx', 'export { default } from "@/app/(en)/pricing/page.en";\n'),
             'OA-03', 'lipsa: metadata'),
            ('OA-03-modul', scrie('src/app/(comroen)/en/pricing/page.comro.tsx', 'export { default, metadata } from "@/app/(en)/alta/page.en";\n'),
             'OA-03', 'nu din sursa'),
            ('OA-03-config', scrie('src/app/(comro)/juridic/[[...document]]/page.comro.tsx',
                                   'export { default, generateStaticParams } from "@/app/(romd)/ro/juridic/[[...document]]/page.romd";\n'
                                   'export const dynamicParams = true;\n'),
             'OA-03', 'configurarea segmentului'),
            ('OA-04', scrie('src/app/(comro)/despre/page.tsx', 'export default function P() {}\n'), 'OA-04', '(comro)/despre/page.tsx'),
            ('OA-05', sterge('src/app/global-not-found.comro.tsx'), 'OA-05', 'global-not-found.comro.tsx'),
            ('OA-06', sterge('src/app/(comro)/twitter-image/route.comro.tsx'), 'OA-06', 'twitter-image/route.comro.tsx'),
        ]
        for nume, strica, cod, fragment in cazuri:
            motiv = caz(nume, strica, cod, fragment)
            if motiv:
                return motiv

        # Pe build: o colectie fabricata egala cu perechile + proprii (negativ), apoi o cale in plus si una lipsa.
        alt = sorted(STATUS_ALTUL)[0]
        perechi = {'perechi': [{'a': '/', 'b': '/en'}, {'a': '/ro', 'b': '/'}, {'a': '/robots.txt', 'b': '/robots.txt'},
                               {'a': alt, 'b': alt}]}
        def colectie(cai, statusuri=None):
            st = dict({alt: STATUS_ALTUL[alt][0], '/_not-found': 404, '/x-404': 404}, **(statusuri or {}))
            return {'caleInexistenta': '/x-404',
                    'pagini': [{'cale': c, 'status': st.get(c, 200)} for c in cai + ['/_not-found', '/x-404']]}
        baza = ['/en', '/', '/robots.txt', '/opengraph-image', '/twitter-image', alt]
        g, n = gasiri_build(colectie(baza), perechi)
        if g or n != 6:
            return 'martorul negativ pe build: ' + repr(g) + ' (' + str(n) + ' cai, asteptat 6)'
        g, _ = gasiri_build(colectie(baza, {'/': 404}), perechi)
        if len(g) != 1 or g[0][0] != 'OA-11' or '`/`' not in g[0][1]:
            return 'martorul pozitiv pe build (cale asteptata servita cu 404): ' + repr(g)
        g, _ = gasiri_build(colectie(baza, {alt: 200}), perechi)
        if len(g) != 1 or g[0][0] != 'OA-11' or alt not in g[0][1]:
            return 'martorul pozitiv pe build (cale din STATUS_ALTUL pe alt status): ' + repr(g)
        g, _ = gasiri_build(colectie(baza + ['/ro/contact']), perechi)
        if len(g) != 1 or '/ro/contact' not in g[0][1]:
            return 'martorul pozitiv pe build (cale in plus): ' + repr(g)
        g, _ = gasiri_build(colectie([c for c in baza if c != '/en']), perechi)
        if len(g) != 1 or '`/en`' not in g[0][1]:
            return 'martorul pozitiv pe build (cale lipsa): ' + repr(g)
    finally:
        shutil.rmtree(lucru, ignore_errors=True)
    return None


def argumente(argv):
    a = {'radacina': RADACINA_IMPLICITA, 'colectie': '', 'perechi': ''}
    chei = {'--radacina': 'radacina', '--colectie': 'colectie', '--perechi': 'perechi'}
    i = 0
    while i < len(argv):
        cheie = chei.get(argv[i])
        if cheie is None or i + 1 >= len(argv):
            return None
        a[cheie] = argv[i + 1]
        i += 2
    if bool(a['colectie']) != bool(a['perechi']):
        return None
    return a


def main(argv):
    a = argumente(argv)
    if a is None:
        print('folosire: poarta-oglinda-asezare.py [--radacina <depozit>] [--colectie <dir> --perechi <fisier.json>]', file=sys.stderr)
        return 2
    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3  # NEMASURAT
    print('CONTROALE: martor negativ OK; pozitivi OA-01 (pagina, layout), OA-02, OA-03 (continut, nume, modul, configurare), '
          'OA-04, OA-05, OA-06 OK; pe build negativ, cale in plus, cale lipsa, status 404, status in afara listei OK')

    if a['colectie']:
        try:
            with io.open(os.path.join(a['colectie'], 'colectie.json'), encoding='utf-8') as f:
                colectie = json.load(f)
            with io.open(a['perechi'], encoding='utf-8') as f:
                perechi = json.load(f)
        except (OSError, ValueError) as e:
            print('poarta-oglinda-asezare: colectia sau perechile nu se pot citi (' + str(e) + ') - NEMASURAT', file=sys.stderr)
            return 3  # NEMASURAT
        if not colectie.get('pagini') or not perechi.get('perechi'):
            print('poarta-oglinda-asezare: colectie sau perechi goale - NEMASURAT, nu curat', file=sys.stderr)
            return 3  # NEMASURAT
        gasiri, numar = gasiri_build(colectie, perechi)
        for cod, mesaj in gasiri:
            print('OPRESTE  ' + cod + '  ' + mesaj)
        print('BUILD: ' + str(numar) + ' cai servite comparate cu ' + str(len(perechi['perechi'])) + ' perechi + ' +
              str(len(PROPRII_RO)) + ' proprii asezarii ro; status cerut 200, in afara de ' + str(len(STATUS_ALTUL)) +
              ' cai din STATUS_ALTUL')
        print('NEPOTRIVIRI: ' + str(len(gasiri)))
        return 1 if gasiri else 0

    gasiri, surse, geamane = gasiri_surse(a['radacina'])
    if surse == 0:
        print('poarta-oglinda-asezare: zero fisiere sursa in (en) / (romd) sub ' + a['radacina'] + ' - NEMASURAT, nu curat', file=sys.stderr)
        return 3  # NEMASURAT
    for cod, mesaj in gasiri:
        print('OPRESTE  ' + cod + '  ' + mesaj)
    print('SURSE: ' + str(surse) + ' fisiere de ruta in (en) / (romd) · GEAMANE: ' + str(geamane) + ' fisiere in (comro) / (comroen)')
    print('NEPOTRIVIRI: ' + str(len(gasiri)))
    return 1 if gasiri else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

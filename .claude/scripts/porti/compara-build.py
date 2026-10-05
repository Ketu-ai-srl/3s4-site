#!/usr/bin/env python3
"""Compara doua colectii de build (scrise de `colecteaza-build.mjs`), pagina cu pagina.

DE CE EXISTA. Cand acelasi cod se construieste pe mai multe profiluri (site-ul RO, 3s.md, un al doilea domeniu),
o schimbare intr-o piesa comuna se poate vedea pe un profil pe care felia nu-l priveste. Proba de invarianta RO
(`tests/invarianta-ro.test.ts`) fotografiaza cateva pagini-martor; unealta asta compara TOT ce serveste build-ul,
build contra build, deci nu are fixturi care imbatranesc.

DOUA REGULI:
  - `invarianta`: aceleasi cai, acelasi status, aceleasi antete, acelasi corp dupa normalizarea identificatorilor
    de build (aceeasi functie ca proba de invarianta RO, `tests/fixturi/invarianta-ro/normalizeaza.ts`). Orice alta
    diferenta e raportata, numita pe cale.
  - `identitate`: doua domenii construite din acelasi cod. Perechile de cai (A -> B) si valorile fiecarui domeniu
    se citesc din `--perechi <json>`; diferentele PERMISE sunt o lista INCHISA, scrisa aici ca transformare a
    textului lui A (functia `transforma`), aplicata pe textul BRUT, inainte de normalizare, fiindca unele reguli
    cer contextul (o adresa dintr-o legatura hreflang ramane, aceeasi adresa dintr-o legatura obisnuita se
    traduce). Dupa transformare, A trebuie sa fie identic cu B. Lista:
      1. originea: `https://<A>` -> `https://<B>`; in `@id` (identificatori JSON-LD) se schimba NUMAI originea,
         calea ramane; originea fara cale ramane origine (nivel de site);
      2. caile perechilor: o cale relativa (dupa `"` sau `(`) sau o adresa absolut a lui A se traduce prin tabelul
         perechilor, cu fragmentul si interogarea pastrate; caile care nu sunt in tabel raman neschimbate;
      3. legaturile hreflang (`<link ... hreflang ...>`, obiectele fluxului RSC cu `hrefLang`, `xhtml:link` din
         harta) raman NEATINSE: grupul hreflang e acelasi pe ambele domenii;
      4. pe paginile lui B de sub `/en`, legatura canonica ramane cea a lui A (canonical spre domeniul A);
      5. numarul afisat, numarul E.164, numarul de WhatsApp (cifrele din `wa.me`), adresa de e-mail de contact si
         numele domeniului scris in text;
      6. limba romanei: valoarea `inLanguage`, `og:locale` si antetul `Content-Language`;
      7. harta (`sitemap.xml`): pe B lipsesc intrarile de sub `/en`;
      8. pagina de negasit (calea inexistenta a colectiei si `/_not-found`): se compara numai statusul.
    O pagina a unei colectii care nu e in nicio pereche (si nu e pagina de negasit) e o diferenta.

CE NU MASOARA (rest declarat, nu scapare):
  - ce face pagina dupa hidratare (selectorul de limba, bara mobila, paleta): asta e treaba probelor de browser;
  - normalizarea scoate structura fluxului RSC si continutul CSS (vezi antetul lui `normalizeaza.ts`): o schimbare
    numai de stil nu se vede aici;
  - in `identitate`, o cale SURSA purtata ca DATA in fluxul RSC (proprietatea unei componente client, nu o
    legatura) e tradusa si ea de regula 2, deci apare ca diferenta daca B o pastreaza sursa. Daca o felie produce
    asa ceva, regula se ingusteaza pe context, in felia care o foloseste, cu martor;
  - antetele masurate sunt numai cele scrise de colector (`Content-Type`, `Content-Language`, `X-Robots-Tag`,
    `Location`);
  - amprenta din numele fisierelor statice (`static/css/...`, `static/chunks/...`), inclusiv sub un grup de rute
    (`app/(romd)/...`): vezi `fara_amprente`;
  - valoarea `<lastmod>` din harta (data ultimului commit pe sursa paginii, deci se muta la orice commit, si fara
    nicio schimbare servita): ramane comparata numai prezenta elementului, vezi `LASTMOD`.
  Ambele normalizari de mai sus au martori la FIECARE rulare (`control_normalizari`): o pereche care trebuie sa
  iasa egala si una care trebuie sa ramana diferita; un martor picat da NEMASURAT (3).

Folosire:
  python compara-build.py --regula invarianta <colectie-A> <colectie-B>
  python compara-build.py --regula identitate --perechi <perechi.json> <colectie-A> <colectie-B>
  [--normalizator <normalizeaza.ts>] [--arata <n linii de diferenta pe pagina>]

IESIRE: 0 zero diferente pe macar o pagina comparata - 1 macar o diferenta - 2 folosire gresita - 3 NEMASURAT
(colectie lipsa sau stricata, zero pagini comparate, perechi invalide, normalizatorul nu ruleaza).
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

CURAT, PICAT, GRESIT, NEMASURAT = 0, 1, 2, 3
AICI = os.path.dirname(os.path.abspath(__file__))
RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(AICI)))
NORMALIZATOR = os.path.join(RADACINA, 'tests', 'fixturi', 'invarianta-ro', 'normalizeaza.ts')

# Valorile unui domeniu in fisierul de perechi: lista INCHISA. O cheie necunoscuta e refuzata (cod 3), ca o diferenta
# noua sa nu poata intra in lista permisa printr-un fisier de date.
CHEI_VALORI = ('origine', 'domeniu', 'email', 'telefonAfisat', 'telefonE164', 'whatsapp', 'limba', 'ogLocale')
CHEI_PERECHI = ('a', 'b', 'perechi', '_nota')
PREFIX_EN_B = '/en'
NEGASIT_MANIFEST = '/_not-found'

# Ce lipeste NORMALIZATORUL (TypeScript) de acest proces: un modul mic, scris la rulare.
NODE_LOT = """
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
const [normalizator, intrare, iesire] = process.argv.slice(2)
const { normalizeaza } = await import(pathToFileURL(normalizator).href)
const lot = JSON.parse(readFileSync(intrare, 'utf8'))
writeFileSync(iesire, JSON.stringify(lot.map((x) => normalizeaza(x.html, x.id))), 'utf8')
"""


class Nemasurat(Exception):
    pass


def incarca(director):
    cale = os.path.join(director, 'colectie.json')
    try:
        col = json.load(open(cale, encoding='utf-8'))
    except (OSError, ValueError) as e:
        raise Nemasurat('colectia %s nu se poate citi: %s' % (director, e))
    if col.get('format') != 1 or not isinstance(col.get('pagini'), list) or not str(col.get('idBuild', '')).strip():
        raise Nemasurat('colectia %s nu are formatul 1 (format, idBuild, pagini)' % director)
    pagini = {}
    for p in col['pagini']:
        if p['cale'] in pagini:
            raise Nemasurat('colectia %s are calea %s de doua ori' % (director, p['cale']))
        pagini[p['cale']] = p
    return {'dir': director, 'id': col['idBuild'].strip(), 'pagini': pagini, 'inexistenta': col.get('caleInexistenta', '')}


def corp(col, p):
    octeti = open(os.path.join(col['dir'], p['fisier']), 'rb').read()
    if not p.get('text'):
        return None
    return octeti.decode('utf-8', errors='replace')


def e_html(p):
    return (p.get('antete', {}).get('content-type') or '').startswith('text/html')


def normalizeaza_lot(elemente, normalizator):
    """Normalizeaza HTML-urile printr-un singur proces node; `elemente` = [(html, idBuild)]."""
    if not elemente:
        return []
    if not os.path.isfile(normalizator):
        raise Nemasurat('normalizatorul lipseste: ' + normalizator)
    with tempfile.TemporaryDirectory(prefix='compara-build-') as d:
        modul, intrare, iesire = (os.path.join(d, n) for n in ('lot.mjs', 'intrare.json', 'iesire.json'))
        open(modul, 'w', encoding='utf-8', newline='\n').write(NODE_LOT)
        json.dump([{'html': h, 'id': i} for h, i in elemente], open(intrare, 'w', encoding='utf-8', newline='\n'))
        r = subprocess.run(['node', modul, normalizator, intrare, iesire], capture_output=True, text=True, encoding='utf-8', errors='replace')
        if r.returncode != 0 or not os.path.isfile(iesire):
            raise Nemasurat('normalizatorul a iesit %s: %s' % (r.returncode, (r.stderr or r.stdout)[-2000:]))
        rez = json.load(open(iesire, encoding='utf-8'))
    if len(rez) != len(elemente):
        raise Nemasurat('normalizatorul a intors %d texte pentru %d' % (len(rez), len(elemente)))
    return rez


# `Expires` din security.txt se calculeaza la BUILD (RFC 9116 cere o data de expirare, cel mult un an inainte), deci
# difera intre doua build-uri ale aceluiasi arbore: masurat in CI, singura diferenta din 65 de rute (ro-RO) si din 39
# (3s.md), intre doua build-uri facute la 48 s distanta. Iese numai marca de timp ISO de pe randul `Expires:`;
# prezenta randului si restul fisierului raman comparate. Aceeasi clasa ca anul din subsol in `normalizeaza.ts`.
EXPIRES = re.compile(r'^(Expires: )\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$', re.M)


# `<lastmod>` din harta vine din istoricul git al sursei paginii (data ultimului commit pe modulul ei), deci se muta la
# ORICE commit pe acel modul, si cand pagina servita ramane octet cu octet aceeasi: in CI instantaneul feliei e un singur
# commit nou, deci fiecare modul atins de felie ii da paginii data instantaneului. Iese numai valoarea; elementul si
# restul intrarii (`<loc>`, alternatele) raman comparate.
LASTMOD = re.compile(r'(<lastmod>)[^<]*(</lastmod>)')


def fara_id(text, idb):
    """Textul unei rute care nu e HTML (harta, llms, manifest, security.txt): id-ul build-ului, data din `Expires` si
    valoarea `<lastmod>`."""
    text = EXPIRES.sub(r'\1DATA-BUILD', text.replace(idb, 'ID-BUILD').replace(idb.replace('-', '_'), 'ID-BUILD'))
    return LASTMOD.sub(r'\1DATA-COMMIT\2', text)


# AMPRENTELE DE SUB UN GRUP DE RUTE. Normalizatorul inlocuieste numele statice cu amprenta pana la primul `)`, deci
# bucata unei rute dintr-un grup (`static/chunks/app/(romd)/layout.romd-<amprenta>.js`) iesea
# `static/chunks/X)/layout.romd-<amprenta>.js`, cu amprenta inca in text. Masurat in CI pe 3s.md (felia 116, rularea
# 37269755837): 28 de pagini diferite numai prin aceste nume, intre doua build-uri. Aici calea intreaga, cu segmentele
# `(grup)` echilibrate, devine `static/<tip>/X` INAINTE de normalizator; o paranteza neinchisa, o ghilimea, un spatiu
# sau o bara inversa opresc potrivirea, ca acolo. Pe numele fara grup rezultatul e acelasi ca al normalizatorului.
STATIC_CU_GRUP = re.compile(r'static/(css|chunks)/(?:[^"\'\s\\()]|\([^"\'\s\\()/]*\))+')


def fara_amprente(html):
    return STATIC_CU_GRUP.sub(r'static/\1/X', html)


def control_normalizari():
    """Martorii celor doua normalizari de mai sus, pe texte asamblate la rulare, la FIECARE rulare.

    Fiecare normalizare scoate o diferenta, deci o normalizare stricata (sau scoasa) nu inroseste nimic: comparatia
    iese doar mai stricta, iar o normalizare prea larga ar inghiti diferente reale. De aceea fiecare are o pereche
    care TREBUIE sa devina egala si una care TREBUIE sa ramana diferita. Intoarce motivul primului martor picat, sau
    None. Un martor picat face verdictul NEMASURAT (3), nu verde.
    """
    # Doua intrari, ca o potrivire prea larga (de la primul `<lastmod>` la ultimul) sa inghita `<loc>` dintre ele.
    def harta(loc, data):
        intrare = '<url><loc>%s</loc><lastmod>%s</lastmod></url>'
        return intrare % ('https://x.test/a', data) + intrare % (loc, data)
    idb = 'id' + '-proba'
    a = harta('https://x.test/b', '2026-01-0' + '1T00:00:00Z')
    if fara_id(a, idb) != fara_id(harta('https://x.test/b', '2026-02-0' + '2T10:00:00Z'), idb):
        return 'LASTMOD: doua harti care difera numai prin <lastmod> au iesit diferite'
    if fara_id(a, idb) == fara_id(harta('https://x.test/c', '2026-01-0' + '1T00:00:00Z'), idb):
        return 'LASTMOD: doua harti cu <loc> diferit au iesit egale'
    if '<lastmod>' not in fara_id(a, idb):
        return 'LASTMOD: elementul <lastmod> a disparut, trebuia sa ramana comparata prezenta lui'

    def bucata(amprenta, cuvant):
        return '<script src="/_next/static/chunks/app/(' + 'romd)/layout.romd-' + amprenta + '.js"></script><p>' + cuvant + '</p>'
    b = bucata('a1b2c3', 'unu')
    if fara_amprente(b) != fara_amprente(bucata('d4e5f6', 'unu')):
        return 'STATIC_CU_GRUP: doua bucati sub un grup de rute care difera numai prin amprenta au iesit diferite'
    if fara_amprente(b) == fara_amprente(bucata('d4e5f6', 'doi')):
        return 'STATIC_CU_GRUP: un cuvant schimbat langa bucata a fost inghitit de normalizare'
    return None


# ------------------------------------------------------------------ regula `identitate`

def citeste_perechi(cale):
    try:
        d = json.load(open(cale, encoding='utf-8'))
    except (OSError, ValueError) as e:
        raise Nemasurat('perechile nu se pot citi: %s' % e)
    if not isinstance(d, dict) or set(d) - set(CHEI_PERECHI):
        raise Nemasurat('perechi: chei necunoscute %s (permise: %s)' % (sorted(set(d) - set(CHEI_PERECHI)) if isinstance(d, dict) else '?', ', '.join(CHEI_PERECHI)))
    for parte in ('a', 'b'):
        v = d.get(parte)
        if not isinstance(v, dict) or set(v) != set(CHEI_VALORI) or not all(isinstance(x, str) and x for x in v.values()):
            raise Nemasurat('perechi.%s trebuie sa aiba exact cheile %s, siruri nevide' % (parte, ', '.join(CHEI_VALORI)))
        if not re.fullmatch(r'https://[a-z0-9.\-]+', v['origine']):
            raise Nemasurat('perechi.%s.origine nu e o origine https fara cale: %s' % (parte, v['origine']))
    tabel, inapoi = {}, {}
    for x in d.get('perechi') or []:
        if not (isinstance(x, dict) and set(x) == {'a', 'b'} and all(isinstance(x[k], str) and x[k].startswith('/') for k in 'ab')):
            raise Nemasurat('perechi: fiecare element e {"a": "/...", "b": "/..."}: %r' % (x,))
        if x['a'] in tabel or x['b'] in inapoi:
            raise Nemasurat('perechi: cale folosita de doua ori (%s -> %s)' % (x['a'], x['b']))
        tabel[x['a']] = x['b']
        inapoi[x['b']] = x['a']
    if not tabel:
        raise Nemasurat('perechi: lista de perechi e goala')
    return d['a'], d['b'], tabel


def sub_en(cale):
    return cale == PREFIX_EN_B or cale.startswith(PREFIX_EN_B + '/')


def tradu_cale(cale, tabel):
    """Calea (cu fragment sau interogare) prin tabelul perechilor; ce nu e in tabel ramane."""
    m = re.match(r'([^#?]*)(.*)$', cale, re.S)
    p, rest = m.group(1), m.group(2)
    return tabel[p] + rest if p in tabel else cale


def transforma(text, va, vb, tabel, cale_b):
    """Lista inchisa de diferente permise, aplicata pe textul BRUT al lui A. Ordinea conteaza si e scrisa aici."""
    protejate = []

    def protejeaza(m):
        protejate.append(m.group(0))
        return '\x00P%d\x00' % (len(protejate) - 1)

    # 3. hreflang: elementul HTML/XML intreg si obiectul RSC intreg raman neatinse.
    text = re.sub(r'<(?:link|xhtml:link)\b[^>]*hreflang[^>]*>', protejeaza, text, flags=re.I)
    text = re.sub(r'\{[^{}]*hrefLang[^{}]*\}', protejeaza, text)
    # 4. canonical pe paginile lui B de sub /en: ramane cel al lui A.
    if sub_en(cale_b):
        text = re.sub(r'<link\b[^>]*rel="canonical"[^>]*>', protejeaza, text)
        text = re.sub(r'\{[^{}]*canonical[^{}]*\}', protejeaza, text)

    oa = re.escape(va['origine'])
    capat_origine = r'(?![\w\-]|\.\w)'
    # 1. `@id`: numai originea (marcata, ca regula 2 sa n-o mai traduca).
    text = re.sub(r'(@id(?:\\)*"\s*:\s*(?:\\)*")' + oa + capat_origine, lambda m: m.group(1) + '\x00ORIGINE\x00', text)
    # 5a. e-mailul inainte de domeniu (adresa contine domeniul).
    text = text.replace(va['email'], vb['email'])
    # 1+2. adresele absolute: originea, plus calea prin tabel; originea fara cale ramane origine.
    def absoluta(m):
        cale = m.group(1)
        return vb['origine'] + (tradu_cale(cale, tabel) if cale else '')
    text = re.sub(oa + capat_origine + r'(/[^\s"\'<>\\),\]]*)?', absoluta, text)
    # 2. caile relative, dupa ghilimea (atribut sau sir din fluxul RSC) sau dupa paranteza (legatura markdown).
    text = re.sub(r'(?<=["(])(/[A-Za-z0-9._~%\-/]*)(?=[#?"\\)])', lambda m: tradu_cale(m.group(1), tabel), text)
    # 5b. numerele: intai formele cu `+`, apoi cifrele de WhatsApp, numai ca numar intreg.
    text = text.replace(va['telefonAfisat'], vb['telefonAfisat']).replace(va['telefonE164'], vb['telefonE164'])
    text = re.sub(r'(?<![\d+])' + re.escape(va['whatsapp']) + r'(?!\d)', vb['whatsapp'], text)
    # 5c. numele domeniului in text (nu parte dintr-o adresa sau dintr-un alt nume).
    text = re.sub(r'(?<![\w@/.\-])' + re.escape(va['domeniu']) + r'(?![\w\-]|\.\w)', vb['domeniu'], text)
    # 6. limba romanei: `inLanguage` si `og:locale` (nu `og:locale:alternate`, nu hreflang).
    text = re.sub(r'(inLanguage(?:\\)*"\s*:\s*(?:\\)*")' + re.escape(va['limba']) + r'(?=\\*")', lambda m: m.group(1) + vb['limba'], text)
    text = re.sub(r'(og:locale(?:\\)*"[^<>{}]{0,40}?content(?:=|(?:\\)*"\s*:\s*)(?:\\)*")' + re.escape(va['ogLocale']) + r'(?=\\*")',
                  lambda m: m.group(1) + vb['ogLocale'], text)

    text = text.replace('\x00ORIGINE\x00', vb['origine'])
    return re.sub('\x00P(\\d+)\x00', lambda m: protejate[int(m.group(1))], text)


def harta_fara_en(text, vb):
    """7. Pe B, harta nu are intrarile de sub /en."""
    ob = re.escape(vb['origine'])
    return re.sub(r'<url>(?:(?!</url>).)*?<loc>' + ob + r'(/[^<]*)</loc>.*?</url>\s*',
                  lambda m: '' if sub_en(m.group(1)) else m.group(0), text, flags=re.S)


# ------------------------------------------------------------------ comparatia

def linii(text):
    """Forma de afisare a unei diferente: DOM-ul rupt dupa fiecare `>`, ca diferenta sa fie scurta."""
    return text.replace('>', '>\n').split('\n')


def compara(A, B, perechi_cai, regula, valori, tabel, normalizator, arata):
    """`perechi_cai` = [(cale A, cale B)]. Intoarce (comparate, diferente) si tipareste fiecare diferenta."""
    va, vb = valori if valori else (None, None)
    diferente = []
    de_normalizat = []  # (index in lista de comparatii, html A, id A, html B, id B)
    comparatii = []
    for ca, cb in perechi_cai:
        pa, pb = A['pagini'].get(ca), B['pagini'].get(cb)
        eticheta = ca if ca == cb else ca + ' -> ' + cb
        if pa is None or pb is None:
            diferente.append((eticheta, 'lipseste in ' + ('A' if pa is None else 'B'), None))
            continue
        negasit = ca in (A['inexistenta'], NEGASIT_MANIFEST) and regula == 'identitate'
        motive = []
        if pa['status'] != pb['status']:
            motive.append('status %s fata de %s' % (pa['status'], pb['status']))
        if negasit:
            comparatii.append(eticheta)
            if motive:
                diferente.append((eticheta, '; '.join(motive), None))
            continue
        ha, hb = dict(pa.get('antete', {})), dict(pb.get('antete', {}))
        if regula == 'identitate':
            if ha.get('content-language') == va['limba']:
                ha['content-language'] = vb['limba']
            if 'location' in ha:
                ha['location'] = transforma(ha['location'], va, vb, tabel, cb)
        for h in sorted(set(ha) | set(hb)):
            if ha.get(h) != hb.get(h):
                motive.append('antetul %s: %r fata de %r' % (h, ha.get(h), hb.get(h)))
        ta, tb = corp(A, pa), corp(B, pb)
        comparatii.append(eticheta)
        if ta is None or tb is None:
            if (ta is None) != (tb is None) or pa['sha256'] != pb['sha256']:
                motive.append('corpul binar difera (sha256)')
            if motive:
                diferente.append((eticheta, '; '.join(motive), None))
            continue
        if regula == 'identitate':
            ta = transforma(ta, va, vb, tabel, cb)
            if cb.endswith('sitemap.xml'):
                ta = harta_fara_en(ta, vb)
        if e_html(pa) and e_html(pb):
            de_normalizat.append((len(comparatii) - 1, eticheta, motive, fara_amprente(ta), fara_amprente(tb)))
            continue
        na, nb = fara_id(ta, A['id']), fara_id(tb, B['id'])
        if na != nb:
            motive.append('corpul difera')
        if motive:
            diferente.append((eticheta, '; '.join(motive), (na, nb) if na != nb else None))

    if de_normalizat:
        lot = []
        for _, _, _, ta, tb in de_normalizat:
            lot += [(ta, A['id']), (tb, B['id'])]
        norm = normalizeaza_lot(lot, normalizator)
        for k, (_, eticheta, motive, _, _) in enumerate(de_normalizat):
            na, nb = norm[2 * k], norm[2 * k + 1]
            if na != nb:
                motive = motive + ['corpul HTML difera dupa normalizare']
            if motive:
                diferente.append((eticheta, '; '.join(motive), (na, nb) if na != nb else None))

    for eticheta, motiv, corpuri in sorted(diferente, key=lambda x: x[0]):
        print('DIF %s: %s' % (eticheta, motiv))
        if corpuri and arata > 0:
            d = list(difflib.unified_diff(linii(corpuri[0]), linii(corpuri[1]), 'A', 'B', n=1, lineterm=''))
            for rand in d[2:2 + arata]:
                print('    ' + (rand if len(rand) <= 300 else rand[:300] + '...'))
    return len(comparatii), len(diferente)


def main():
    ap = argparse.ArgumentParser(description='Compara doua colectii de build.')
    ap.add_argument('--regula', choices=('invarianta', 'identitate'), required=True)
    ap.add_argument('--perechi', help='fisierul de perechi (numai la identitate)')
    ap.add_argument('--normalizator', default=NORMALIZATOR)
    ap.add_argument('--arata', type=int, default=12, help='cate randuri de diferenta pe pagina (0 = niciunul)')
    ap.add_argument('colectie_a')
    ap.add_argument('colectie_b')
    try:
        args = ap.parse_args()
    except SystemExit:
        return GRESIT
    if (args.regula == 'identitate') != bool(args.perechi):
        print('EROARE: --perechi se da numai si obligatoriu la regula identitate')
        return GRESIT
    picat = control_normalizari()
    if picat is not None:
        print('NEMASURAT: martorul normalizarii ' + picat)
        return NEMASURAT
    try:
        A, B = incarca(args.colectie_a), incarca(args.colectie_b)
        valori, tabel = None, None
        if args.regula == 'invarianta':
            perechi_cai = [(c, c) for c in sorted(set(A['pagini']) | set(B['pagini']))]
        else:
            va, vb, tabel = citeste_perechi(args.perechi)
            valori = (va, vb)
            perechi_cai = sorted(tabel.items())
            fara_a = sorted(set(A['pagini']) - set(tabel) - {A['inexistenta'], NEGASIT_MANIFEST})
            fara_b = sorted(set(B['pagini']) - set(tabel.values()) - {B['inexistenta'], NEGASIT_MANIFEST})
            for c in fara_a:
                print('DIF %s: pagina lui A fara pereche' % c)
            for c in fara_b:
                print('DIF %s: pagina lui B fara pereche' % c)
            for c in (NEGASIT_MANIFEST, A['inexistenta']):
                if c in A['pagini'] and (c in B['pagini'] or c == A['inexistenta']):
                    perechi_cai.append((c, c if c in B['pagini'] else B['inexistenta']))
        comparate, dif = compara(A, B, perechi_cai, args.regula, valori, tabel, args.normalizator, args.arata)
        if args.regula == 'identitate':
            dif += len(fara_a) + len(fara_b)
    except Nemasurat as e:
        print('NEMASURAT: ' + str(e))
        return NEMASURAT
    print('regula %s: pagini comparate %d, diferente %d (A: %d cai, build %s; B: %d cai, build %s)'
          % (args.regula, comparate, dif, len(A['pagini']), A['id'], len(B['pagini']), B['id']))
    if comparate == 0:
        print('NEMASURAT: zero pagini comparate (zero nu e verde)')
        return NEMASURAT
    return PICAT if dif else CURAT


if __name__ == '__main__':
    sys.exit(main())

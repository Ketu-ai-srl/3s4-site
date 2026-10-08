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
    traduce). Dupa transformare, A trebuie sa fie identic cu B. Lista (randurile din §3 al specificatiei 3s.com.ro):
      1. originea: `https://<A>` -> `https://<B>`; in `@id` (identificatori JSON-LD) se schimba NUMAI originea,
         calea ramane; originea fara cale ramane origine (nivel de site); `url`-ul nodurilor `Organization` si
         `WebSite` e radacina domeniului si ramane radacina (1b); `og:url` si legatura canonica, acolo unde regula 4
         nu le pastreaza, sunt adresa paginii insesi (originea lui B plus calea perechii, radacina ca origine goala, 1c);
      2. caile perechilor: o cale relativa (dupa `"` sau `(`) sau o adresa absolut a lui A se traduce prin tabelul
         perechilor, cu fragmentul si interogarea pastrate; caile care nu sunt in tabel raman neschimbate; caile pe
         care B le serveste si la aceeasi cale, si sub /en (imaginile sociale, cate o copie pe arbore) nu se traduc,
         iar fiecare copie a lui B se compara cu pagina lui A (2b); o cale a perechilor scrisa ca TEXT intreg al unui
         element (`>/pricing<`: calea afisata pe cardurile de contact, servita pe domeniu de la felia 138) se traduce
         la fel (2c);
      3. legaturile hreflang (`<link ... hreflang ...>`, obiectele alternate ale fluxului RSC, `xhtml:link` din
         harta) raman NEATINSE: grupul hreflang e acelasi pe ambele domenii; ordinea lor intr-un sir continuu nu conteaza;
      4. pe paginile lui B de sub `/en`, legatura canonica ramane cea a lui A (canonical spre domeniul A), iar
         legaturile alternate ale lui A ies (o pagina necanonica nu intra in grupul hreflang). Cardul social urmeaza
         canonical-ul (regula GEO a proiectului: `og:url` e canonical-ul, `og:image` si `twitter:image` stau pe originea
         lui), deci si `og:url`, `og:image` si `twitter:image` raman cele ale lui A (4c), in `<head>` si in obiectul
         `meta` al fluxului RSC. Tot de aceea, adresele paginilor din JSON-LD (`url` si `item` pe originea lui A, in
         afara nodurilor de site si a `@id`-urilor) raman ale lui A (4d): pe copia engleza, `WebPage.url` si firul
         urmeaza canonical-ul (`src/components/seo/JsonLd.tsx`, felia 141), deci sunt exact adresele lui A;
      5. numarul afisat, numarul de WhatsApp (cifrele din `wa.me`), adresa de e-mail de contact si numele domeniului
         scris in text. Forma E.164 nu se inlocuieste (decizia 56: HTML-ul nu o mai poarta). Separat, pe fiecare
         pagina a lui B: nicio valoare de contact a lui A (e-mail, numar afisat, E.164, cifrele de WhatsApp);
      6. limba romanei: valoarea `inLanguage`, `og:locale`, antetul `Content-Language` si atributul `hrefLang` al unei
         legaturi `<a>` spre o pagina romaneasca;
      7. harta (`sitemap.xml`): pe B lipsesc intrarile de sub `/en`;
      8. pagina de negasit (calea inexistenta a colectiei si `/_not-found`): se compara numai statusul;
      9. limba radacinii (romana pe B, engleza pe A): antetul `Content-Language` al fisierelor de domeniu, ordinea din
         `Preferred-Languages` (security.txt), `lang`/`start_url`/`scope` din manifest, `inLanguage` al nodului `WebSite`.
         In afara de `llms.txt`: e text englezesc pe AMBELE domenii (§3, ramura EN), deci limba lui ramane engleza si
         antetul se compara neschimbat (`FISIERE_IN_ENGLEZA`);
     10. amprenta SHA-256 a unui document juridic afisata in sigiliu, NUMAI pe paginile pe care regula 5 s-a aplicat
         pe e-mail sau pe domeniu, sau ale caror sectiuni de document poarta o valoare de contact care difera intre
         domenii (textul documentului difera prin contact, deci si amprenta);
     11. randurile DNS si posta din tabelul destinatarilor din politica de confidentialitate (sectiunea 5; §3: DNS si
         posta difera pe domeniu, diferenta de fond care asteapta juristul) ies din comparatie pe ambele parti, cu
         celulele lor. Numai ele: un rand e DNS sau posta daca, pe A, numeste domeniul sau e-mailul lui A si nu poarta
         niciun numar de contact; celelalte randuri (mesageria pe numarul de WhatsApp, furnizorii fara domeniu) si
         tabelele celorlalte sectiuni raman comparate.
    Valorile egale pe ambele domenii nu sunt o diferenta: o regula de contact a carei valoare e aceeasi pe A si pe B (de
    pilda e-mailul operatorului, acelasi pe ambele pana cand adresa domeniului B primeste posta) nu se aplica si nu se
    cere aplicata, iar valoarea ei pe B nu e o valoare de contact a lui A ramasa.
    Forma arborelui de rute (romana sub un segment pe A, la radacina pe B) se aduce la o forma fixa pe AMBELE parti:
    identificatorii `useId`, separatorii React intre noduri de text, sirurile de `<script async>` ale bucatilor si
    lungimea randurilor text ale fluxului RSC (`structura`, `LUNGIME_RAND_T`).
    FLUXUL RSC, pe identitate: se compara sirurile de TEXT (cele cu un spatiu), cuplate fiecare cu una din formele lui
    permise: forma servita (toate regulile) sau forma sursa (contactele si originea traduse, caile si codul de limba
    ramase ale lui A), fiindca fluxul poarta ca DATE caile sursa pe care componentele client le traduc la randare.
    Ce se vede pe pagina e DOM-ul, comparat caracter cu caracter.
    O pagina a unei colectii care nu e in nicio pereche (si nu e pagina de negasit) e o diferenta. O regula din lista
    care nu s-a aplicat NICIODATA (pe paginile cu contact, pentru regulile de pagina) e o diferenta: un normalizator
    care nu prinde nimic nu dovedeste identitatea.
    ADRESELE PAGINILOR, pe identitate, pe FIECARE colectie (alta axa decat comparatia: o adresa gresita la fel pe ambele
    domenii trece de comparatie): fiecare `url`/`item` din JSON-LD si fiecare `og:url` e o pagina a aceleiasi colectii,
    cu status 200 (deci fara redirect) si in aceeasi limba (`<html lang>`) ca pagina care o poarta; o adresa a celuilalt
    domeniu trece numai daca e canonical-ul paginii insesi (copia engleza a lui B are canonical-ul pe A, deci si `og:url`,
    regula 4), sau daca e un `url`/`item` din JSON-LD pe o pagina al carei canonical e pe acel domeniu (copia engleza,
    regula 4d), si e acolo o pagina 200 in aceeasi limba. Vezi `adrese`, cu exceptiile ei numite.

CE NU MASOARA (rest declarat, nu scapare):
  - ce face pagina dupa hidratare (selectorul de limba, bara mobila, paleta): asta e treaba probelor de browser;
  - normalizarea scoate structura fluxului RSC si continutul CSS (vezi antetul lui `normalizeaza.ts`): o schimbare
    numai de stil nu se vede aici;
  - in `identitate`, sirurile fluxului RSC fara spatiu (cheile, caile si adresele singure, segmentele si grupurile
    arborelui de rute, identificatorii) nu se compara: forma lor urmeaza arborelui de rute, nu continutul. Ce randeaza
    serverul din ele e in DOM (comparat); ce randeaza clientul dupa hidratare masoara proba de browser
    `tests/browser/acceptanta-3s-com-ro.spec.ts`. In sirurile de text, o cale sursa ramasa pe B e permisa (forma sursa);
    in DOM, nu;
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
  [--normalizator <normalizeaza.ts>] [--juridic-rute <juridic-rute.json>] [--arata <n linii de diferenta pe pagina>]

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
# Regulile listei inchise, cu numele din raport (cheile `Contor`). Pe paginile lui A care poarta contactul operatorului
# se cer aplicate regulile de pagina (REGULI_CONTACT), inclusiv antetul de limba al paginii romanesti si amprenta
# documentelor juridice (ambele cad pe pagini HTML care poarta contactul: paginile romanesti, documentele juridice);
# celelalte (fisierele de domeniu, harta, randurile destinatarilor) au paginile lor, deci se cer macar o data pe
# colectie (REGULI_COLECTIE). Zero aplicari = rosu.
REGULI_CONTACT = ('origine', 'origine-in-id', 'radacina-site', 'adresa-paginii', 'cai', 'hreflang-neatins', 'hreflang-scos-pe-en',
                  'canonical-pe-en', 'social-pe-en', 'jsonld-pe-en', 'email', 'telefonAfisat', 'whatsapp', 'domeniu', 'inLanguage', 'ogLocale',
                  'hrefLang-legatura', 'content-language', 'amprenta-juridica', 'cale-afisata')
REGULI_COLECTIE = ('limba-radacinii', 'harta-fara-en', 'destinatari-confidentialitate')
REGULI_TOATE = REGULI_CONTACT + REGULI_COLECTIE
PREFIX_EN_B = '/en'
NEGASIT_MANIFEST = '/_not-found'
# 9b. Fisierele de domeniu care sunt text ENGLEZESC pe ambele domenii (§3: `llms.txt` e ramura EN, cu originea si caile
# servite): limba lor nu urmeaza radacina, deci antetul `Content-Language` ramane al englezei si se compara neschimbat.
FISIERE_IN_ENGLEZA = ('/llms.txt',)

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


def tradu_cale(cale, tabel, pastrate=frozenset()):
    """Calea (cu fragment sau interogare) prin tabelul perechilor; ce nu e in tabel ramane, la fel ce e in `pastrate`."""
    m = re.match(r'([^#?]*)(.*)$', cale, re.S)
    p, rest = m.group(1), m.group(2)
    return tabel[p] + rest if p in tabel and p not in pastrate else cale


class Contor(dict):
    """Numarul de aplicari ale fiecarei reguli din lista inchisa (raportul il tipareste; zero aplicari = rosu)."""

    def adauga(self, regula, n=1):
        if n:
            self[regula] = self.get(regula, 0) + n


def _sub(tipar, inlocuire, text, cont, regula, flags=0):
    text, n = re.subn(tipar, inlocuire, text, flags=flags)
    if cont is not None:
        cont.adauga(regula, n)
    return text


def _inlocuieste(text, vechi, nou, cont, regula):
    n = text.count(vechi)
    if cont is not None:
        cont.adauga(regula, n)
    return text.replace(vechi, nou)


# 5b'. NUMARUL AFISAT poate purta spatii nedespartitoare (U+00A0) intre grupe: in subtitlul paginii de contact numarul
# nu se rupe la capat de rand (`numarNedespartit` din PaginaContact.tsx), iar in restul paginii ramane cu spatii
# obisnuite. Numai pentru numarul de telefon, U+00A0 se trateaza ca spatiu: tiparul primeste oricare dintre cele doua
# intre grupe, iar inlocuirea pastreaza forma aparitiei (una nedespartita a lui A devine numarul lui B nedespartit).
# Celelalte valori (e-mail, domeniu, cifrele de WhatsApp) se compara literal, ca inainte.
NBSP = chr(0xa0)


def tipar_numar(numar):
    """Tiparul numarului afisat, cu spatiu obisnuit sau U+00A0 intre grupe."""
    return re.compile(('[ ' + NBSP + ']').join(re.escape(g) for g in numar.split(' ')))


def are_numar_afisat(numar, text):
    return tipar_numar(numar).search(text) is not None


def _inlocuieste_numar(text, vechi, nou, cont, regula):
    def inlocuire(m):
        return nou.replace(' ', NBSP) if NBSP in m.group(0) else nou
    return _sub(tipar_numar(vechi), inlocuire, text, cont, regula)


def contine_valoare(v, k, text):
    """Valoarea `k` a domeniului `v` apare in text; numarul afisat, in oricare forma a spatiilor dintre grupe."""
    return are_numar_afisat(v[k], text) if k == 'telefonAfisat' else v[k] in text


# 4c. Cardul social al copiei engleze a lui B (vezi `transforma`): elementul `<meta>` si obiectul `meta` al fluxului RSC
# (`{"property":"og:url","content":...}`, cu ghilimelele escapate in HTML), NUMAI pentru `og:url`, `og:image` si
# `twitter:image`, cu numele intreg: `og:image:width` si celelalte atribute ale imaginii nu poarta adrese.
SOCIAL_HTML = re.compile(r'<meta (?:property="(?:og:url|og:image)"|name="twitter:image") content="[^"]*"/?>')
SOCIAL_RSC = re.compile(r'\{[^{}]*?(?:\\)*"(?:og:url|og:image|twitter:image)(?:\\)*"[^{}]*\}')


def transforma(text, va, vb, tabel, cale_b, cont=None, cai=True, limba=True, duble=frozenset(), radacini=None):
    """Lista inchisa de diferente permise, aplicata pe textul BRUT al lui A. Ordinea conteaza si e scrisa aici.

    `cont` (un `Contor`) numara aplicarile, pe regula. `cai=False` si `limba=False` dau forma SURSA a unui sir din
    fluxul RSC (vezi `candidati_rsc`): caile raman cele ale lui A, iar codul de limba ramane `va['limba']`.
    `duble` = caile lui A pe care B le serveste la aceeasi cale SI sub /en (imaginile sociale, cate o copie pe arbore,
    octet cu octet aceleasi, comparate fiecare cu a lui A): nu se traduc (regula 2b). `radacini` = (limba radacinii
    lui A, limba radacinii lui B), pentru `inLanguage` al nodului `WebSite` (regula 9).
    """
    protejate = []
    pastrate = duble

    def protejeaza(m):
        protejate.append(m.group(0))
        return '\x00P%d\x00' % (len(protejate) - 1)

    def protejeaza_si_numara(regula):
        def f(m):
            if cont is not None:
                cont.adauga(regula)
            return protejeaza(m)
        return f

    if sub_en(cale_b):
        # 4b. pe paginile lui B de sub /en nu exista hreflang (o pagina necanonica nu intra in grup, §3): legaturile
        # alternate ale lui A ies, si in DOM, si ca element al fluxului RSC (`["$","link","<n>",{...hrefLang...}]`).
        text = _sub(r'<link\b[^>]*rel="alternate"[^>]*hreflang[^>]*>', '', text, cont, 'hreflang-scos-pe-en', re.I)
        text = _sub(r',?\[(?:\\)*"\$(?:\\)*",(?:\\)*"link(?:\\)*",(?:\\)*"\d+(?:\\)*",\{[^{}]*alternate[^{}]*hrefLang[^{}]*\}\]', '', text,
                    cont, 'hreflang-scos-pe-en')
    # 3. hreflang: elementul HTML/XML intreg si obiectul RSC al legaturii alternate raman neatinse.
    text = re.sub(r'<(?:link|xhtml:link)\b[^>]*hreflang[^>]*>', protejeaza_si_numara('hreflang-neatins'), text, flags=re.I)
    text = re.sub(r'\{[^{}]*alternate[^{}]*hrefLang[^{}]*\}', protejeaza, text)
    # 4. canonical pe paginile lui B de sub /en: ramane cel al lui A.
    if sub_en(cale_b):
        text = re.sub(r'<link\b[^>]*rel="canonical"[^>]*>', protejeaza_si_numara('canonical-pe-en'), text)
        text = re.sub(r'\{[^{}]*canonical[^{}]*\}', protejeaza, text)
        # 4c. cardul social urmeaza canonical-ul: `og:url`, `og:image` si `twitter:image` raman ale lui A, ca element
        # `<meta>` si ca obiect `meta` al fluxului RSC. Sirurile fara spatiu ale fluxului nu se compara (antetul), deci
        # protectia obiectului RSC tine forma textului, ca la canonical; verdictul il da elementul din `<head>`.
        text = SOCIAL_HTML.sub(protejeaza_si_numara('social-pe-en'), text)
        text = SOCIAL_RSC.sub(protejeaza, text)

    oa = re.escape(va['origine'])
    capat_origine = r'(?![\w\-]|\.\w)'
    # 1. `@id`: numai originea (marcata, ca regula 2 sa n-o mai traduca).
    text = _sub(r'(@id(?:\\)*"\s*:\s*(?:\\)*")' + oa + capat_origine, lambda m: m.group(1) + '\x00ORIGINE\x00', text, cont, 'origine-in-id')
    # 1b. `url`-ul nodurilor de site (`Organization`, `WebSite`) e radacina domeniului, nu pagina de start a editiei de la
    # radacina lui A (asa le emite `src/components/seo/JsonLd.tsx`, `TIPURI_SITE`): ramane radacina.
    text = _sub(r'((?:\\)*"@type(?:\\)*"\s*:\s*(?:\\)*"(?:Organization|WebSite)(?:\\)*"[^{}]*?(?:\\)*"url(?:\\)*"\s*:\s*(?:\\)*")' + oa + r'/(?=\\*")',
                lambda m: m.group(1) + '\x00ORIGINE\x00/', text, cont, 'radacina-site')
    # 4d. Pe paginile lui B de sub /en, adresele paginilor din JSON-LD urmeaza canonical-ul (domeniul A): `url` si `item` pe
    # originea lui A raman neatinse. Vine DUPA 1 si 1b, care au marcat deja `@id`-urile si `url`-ul nodurilor de site (acelea
    # se traduc si aici, ca pe orice pagina). Se pastreaza numai adresele paginilor ENGLEZE (calea, fara fragment si
    # interogare, e in tabelul perechilor si B o serveste sub /en), ca in JsonLd.tsx: o pagina romaneasca, un fisier static
    # (sigla, `ImageObject`) sau o cale care nu e pagina raman pe originea lui B, traduse ca inainte.
    if sub_en(cale_b):
        def pagina_lui_a(m):
            pa = re.match(r'[^#?]*', m.group(1) or '/').group(0)
            if pa in tabel and sub_en(tabel[pa]):
                return protejeaza_si_numara('jsonld-pe-en')(m)
            return m.group(0)
        text = re.sub(r'(?:\\)*"(?:url|item)(?:\\)*"\s*:\s*(?:\\)*"' + oa + capat_origine + r'(/[^"\\]*)?(?=\\*")', pagina_lui_a, text)
    # 1c. `og:url` si legatura canonica (cand nu sunt pastrate de regula 4) sunt adresa paginii insesi: originea lui B plus
    # calea perechii, iar radacina se scrie ca origine goala (asa o scrie Next pe ambele domenii; pe pagina de start a
    # lui A, originea goala inseamna calea `/`).
    def adresa_paginii(m):
        t = tradu_cale(m.group(2) or '/', tabel, pastrate)
        return m.group(1) + '\x00ORIGINE\x00' + ('' if t == '/' else t) + m.group(3)
    text = _sub(r'(<meta property="og:url" content="|<link rel="canonical" href=")' + oa + r'(/[^"]*)?(")', adresa_paginii, text, cont,
                'adresa-paginii')
    # 9b. limba nodului `WebSite` e limba radacinii domeniului (aceeasi forma ca `url`-ul lui, regula 1b).
    if radacini:
        text = _sub(r'((?:\\)*"@type(?:\\)*"\s*:\s*(?:\\)*"WebSite(?:\\)*"[^{}]*?(?:\\)*"inLanguage(?:\\)*"\s*:\s*(?:\\)*")' + re.escape(radacini[0])
                    + r'(?=\\*")', lambda m: m.group(1) + radacini[1], text, cont, 'limba-radacinii')
    # 5a. e-mailul inainte de domeniu (adresa contine domeniul). Aceeasi adresa pe ambele domenii nu e o diferenta.
    if va['email'] != vb['email']:
        text = _inlocuieste(text, va['email'], vb['email'], cont, 'email')
    # 1+2. adresele absolute: originea, plus calea prin tabel; originea fara cale ramane origine.
    def absoluta(m):
        cale = m.group(1)
        return '\x00ORIGINE\x00' + (tradu_cale(cale, tabel, pastrate) if cale and cai else (cale or ''))
    text = _sub(oa + capat_origine + r'(/[^\s"\'<>\\),\]]*)?', absoluta, text, cont, 'origine')
    # 2. caile relative, dupa ghilimea (atribut sau sir din fluxul RSC) sau dupa paranteza (legatura markdown).
    if cai:
        def relativa(m):
            t = tradu_cale(m.group(1), tabel, pastrate)
            if cont is not None and t != m.group(1):
                cont.adauga('cai')
            return t
        text = re.sub(r'(?<=["(])(/[A-Za-z0-9._~%\-/]*)(?=[#?"\\)])', relativa, text)
        # 2c. calea afisata: textul INTREG al unui element e o cale a perechilor (`<span>/pricing</span>`). Numai textul
        # intreg, intre `>` si `<`, si numai o cale din tabel: o cale in mijlocul unei fraze nu e atinsa.
        def afisata(m):
            t = tradu_cale(m.group(1), tabel, pastrate)
            if cont is not None and t != m.group(1):
                cont.adauga('cale-afisata')
            return t
        text = re.sub(r'(?<=>)(/[A-Za-z0-9._~%\-/]*)(?=<)', afisata, text)
    # 5b. numerele: intai forma afisata, apoi cifrele de WhatsApp, numai ca numar intreg. Forma E.164 (`telefonE164`)
    # NU se inlocuieste: dupa decizia 56 (fara apeluri GSM) HTML-ul servit nu o mai poarta, iar o regula fara aplicari
    # ar fi rosie prin constructie. Daca reapare pe A, ramane pe B ca diferenta si `valori_contact_a` o numeste.
    text = _inlocuieste_numar(text, va['telefonAfisat'], vb['telefonAfisat'], cont, 'telefonAfisat')
    text = _sub(r'(?<![\d+])' + re.escape(va['whatsapp']) + r'(?!\d)', vb['whatsapp'], text, cont, 'whatsapp')
    # 5c. numele domeniului in text (nu parte dintr-o adresa sau dintr-un alt nume).
    text = _sub(r'(?<![\w@/.\-])' + re.escape(va['domeniu']) + r'(?![\w\-]|\.\w)', vb['domeniu'], text, cont, 'domeniu')
    # 6. limba romanei: `inLanguage`, `og:locale` (nu `og:locale:alternate`, nu hreflang) si atributul `hrefLang` al unei
    # legaturi obisnuite (`<a>`) spre o pagina romaneasca.
    if limba:
        text = _sub(r'(inLanguage(?:\\)*"\s*:\s*(?:\\)*")' + re.escape(va['limba']) + r'(?=\\*")', lambda m: m.group(1) + vb['limba'], text,
                    cont, 'inLanguage')
        text = _sub(r'(og:locale(?:\\)*"[^<>{}]{0,40}?content(?:=|(?:\\)*"\s*:\s*)(?:\\)*")' + re.escape(va['ogLocale']) + r'(?=\\*")',
                    lambda m: m.group(1) + vb['ogLocale'], text, cont, 'ogLocale')
        text = _sub(r'(<a\b[^>]*\bhrefLang=")' + re.escape(va['limba']) + r'(?=")', lambda m: m.group(1) + vb['limba'], text, cont, 'hrefLang-legatura')

    text = text.replace('\x00ORIGINE\x00', vb['origine'])
    return re.sub('\x00P(\\d+)\x00', lambda m: protejate[int(m.group(1))], text)


def limba_scurta(cod):
    return cod.split('-')[0].lower()


def fisier_de_domeniu(cale, text, limba_a, limba_b, cont):
    """9. Fisierele de domeniu urmeaza limba radacinii (§3: romana la `/` pe B, engleza la `/` pe A): in `security.txt`
    limba radacinii e prima in `Preferred-Languages`; in manifest `lang` e limba radacinii, iar `start_url`/`scope`
    raman radacina (marcate, ca regula 2 sa nu le traduca). `limba_a`/`limba_b` = codul scurt al radacinii fiecaruia."""
    if cale == '/.well-known/security.txt':
        def ordine(m):
            limbi = [x.strip() for x in m.group(2).split(',')]
            if limba_b not in limbi or limbi[0] != limba_a:
                return m.group(0)
            if cont is not None:
                cont.adauga('limba-radacinii')
            return m.group(1) + ', '.join([limba_b] + [x for x in limbi if x != limba_b])
        return re.sub(r'^(Preferred-Languages: )(.*)$', ordine, text, flags=re.M)
    if cale == '/manifest.webmanifest':
        text = _sub(r'("lang"\s*:\s*")' + re.escape(limba_a) + r'(?=")', lambda m: m.group(1) + limba_b, text, cont, 'limba-radacinii')
        return _sub(r'("(?:start_url|scope)"\s*:\s*)"/"', lambda m: m.group(1) + '"\x00RADACINA\x00"', text, cont, 'limba-radacinii')
    return text


# ------------------------------------------------------------------ structura arborelui de rute

# Ce depinde de FORMA arborelui de rute, nu de continut: pe A romana sta sub un segment `/ro` intr-un grup, pe B la
# radacina, iar engleza invers. Aceeasi pagina are deci alt numar de straturi de layout, de unde: identificatorii
# React `useId` (`_R_<pozitie in arbore>_`) difera, iar bucatile JS ale layout-ului suplimentar dau un `<script async>`
# in plus sau in minus. Ambele se aduc la o forma fixa, pe AMBELE parti. Ordinea legaturilor alternate dintr-un sir
# continuu e a doua forma a aceluiasi grup (fiecare domeniu isi pune intai varianta proprie): sirul se sorteaza.
USE_ID = re.compile(r'(?<![0-9A-Za-z])_R_[0-9a-zA-Z]+_')
SIR_SCRIPTURI = re.compile(r'(?:<script src="/_next/static/chunks/X" async=""></script>)+')
SIR_ALTERNATE = re.compile(r'(?:<link rel="alternate" hrefLang="[^"]*" href="[^"]*"/>)+')
# Separatorul React intre doua noduri de text alaturate: apare dupa cum e taiat textul (masurat: dupa o adresa de
# e-mail urmata de punct, pe 3s.md da un nod gol in plus, pe 3s.com.ro nu), nu dupa ce citeste omul.
SEPARATOR_TEXT = '<!-- -->'
# Lungimea unui rand text al fluxului RSC (`T<lungime hex>,`) urmeaza continutul: o adresa sau un numar mai lung o schimba.
LUNGIME_RAND_T = re.compile(r'^T[0-9a-f]+,')


def structura(dom):
    dom = USE_ID.sub('_R_X_', dom).replace(SEPARATOR_TEXT, '')
    dom = SIR_SCRIPTURI.sub('<script src="/_next/static/chunks/X" async=""></script>', dom)
    return SIR_ALTERNATE.sub(lambda m: ''.join(sorted(re.findall(r'<link[^>]*>', m.group(0)))), dom)


# 10. Amprenta unui document juridic (SHA-256 a textului lui, afisata in sigiliu) urmeaza textul: cand documentul
# poarta e-mailul sau domeniul (regula 5), amprenta lui B e alta prin constructie. Se scoate NUMAI pe paginile pe care
# regula 5 s-a aplicat pe e-mail sau pe domeniu; pe celelalte amprenta ramane comparata.
AMPRENTA = re.compile(r'(<code class="[^"]*sigiliuAmprenta[^"]*" title=")[0-9a-f]{64}(" data-amprenta=")[0-9a-f]{64}(">)[0-9a-f]{16}…')
# Numai e-mailul si domeniul: numarul si WhatsApp-ul stau in subsolul FIECAREI pagini, deci n-ar deosebi un document
# care poarta contactul in text de unul care nu-l poarta.
REGULI_TEXT_CONTACT = ('email', 'domeniu')
# Numarul se cauta numai in sectiunile documentului (`<section data-sectiune=...>`), nu in subsol: acolo deosebeste un
# document care poarta numarul in text. Necesar cand e-mailul e acelasi pe ambele domenii (regula 5a nu se aplica).
SECTIUNE_DOCUMENT = re.compile(r'<section data-sectiune="[^"]*">.*?</section>', re.S)


def contact_in_document(html, va, vb):
    text = ''.join(SECTIUNE_DOCUMENT.findall(html))
    if not text:
        return False
    if any(va[k] != vb[k] and contine_valoare(va, k, text) for k in ('email', 'telefonAfisat')):
        return True
    return va['whatsapp'] != vb['whatsapp'] and re.search(r'(?<![\d+])' + re.escape(va['whatsapp']) + r'(?!\d)', text) is not None


def fara_amprenta(dom):
    return AMPRENTA.sub(r'\1AMPRENTA\2AMPRENTA\3AMPRENTA', dom)


# 11. Destinatarii din politica de confidentialitate (§3: DNS si posta difera pe domeniu, diferenta de FOND, textul il
# decide juristul): din tabelul sectiunii 5 a documentului `confidentialitate` ies NUMAI randurile DNS si posta, pe
# ambele parti, cu celulele lor si din fluxul RSC. Randurile se aleg pe A (numesc domeniul sau e-mailul lui A si nu
# poarta niciun numar de contact) si se scot pe B de la aceleasi pozitii (textul lui B pe ele e liber: il decide
# juristul). Restul tabelului ramane comparat. Adresele documentului se citesc din `config/juridic-rute.json`.
JURIDIC_RUTE = os.path.join(RADACINA, 'config', 'juridic-rute.json')
TABEL_DESTINATARI = re.compile(r'(<section data-sectiune="s5">(?:(?!</section>).)*?)<table\b.*?</table>', re.S)


def cai_confidentialitate():
    try:
        d = json.load(open(JURIDIC_RUTE, encoding='utf-8'))['documente']['confidentialitate']
        return {d['en'], d['ro']}
    except (OSError, ValueError, KeyError) as e:
        raise Nemasurat('adresele documentului de confidentialitate nu se pot citi din %s: %s' % (JURIDIC_RUTE, e))


RAND = re.compile(r'<tr\b.*?</tr>', re.S)


def _celule(rand):
    return {re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh]\b[^>]*>(.*?)</t[dh]>', rand, re.S)} - {''}


def are_numar(text, v):
    """Textul poarta numarul afisat sau cifrele de WhatsApp ale domeniului `v`."""
    return are_numar_afisat(v['telefonAfisat'], text) or re.search(r'(?<![\d+])' + re.escape(v['whatsapp']) + r'(?!\d)', text) is not None


def e_rand_dns_posta(rand, va):
    """Un rand al lui A e DNS sau posta: numeste domeniul sau e-mailul lui A si nu poarta niciun numar de contact."""
    text = re.sub(r'<[^>]+>', ' ', rand)
    numeste = va['email'] in text or re.search(r'(?<![\w@/.\-])' + re.escape(va['domeniu']) + r'(?![\w\-]|\.\w)', text)
    return bool(numeste) and not are_numar(text, va)


def fara_destinatari(html, va, pozitii=None):
    """Scoate randurile DNS si posta din tabelul destinatarilor. `pozitii` = None: se aleg aici (pe A); altfel se scot
    randurile de la aceste pozitii (pe B). Intoarce (html, celule scoase, pozitii, numarul de randuri, texte scoase);
    fara tabel: (html, None, None, 0, [])."""
    m = TABEL_DESTINATARI.search(html)
    if not m:
        return html, None, None, 0, []
    inceput = m.start(0) + len(m.group(1))
    tabel = html[inceput:m.end(0)]
    randuri = list(RAND.finditer(tabel))
    if pozitii is None:
        pozitii = tuple(i for i, r in enumerate(randuri) if e_rand_dns_posta(r.group(0), va))
    bucati, poz, scoase, pastrate, texte = [], 0, set(), set(), []
    for i, r in enumerate(randuri):
        if i in pozitii:
            bucati += [tabel[poz:r.start()], '<tr>DESTINATAR</tr>']
            scoase |= _celule(r.group(0))
            texte.append(re.sub(r'<[^>]+>', ' ', r.group(0)))
            poz = r.end()
        else:
            pastrate |= _celule(r.group(0))
    bucati.append(tabel[poz:])
    # O celula care apare si intr-un rand pastrat (de pilda tara) ramane comparata in fluxul RSC.
    return html[:inceput] + ''.join(bucati) + html[m.end(0):], scoase - pastrate, pozitii, len(randuri), texte


# ------------------------------------------------------------------ fluxul RSC, pe identitate

MARCA_RSC = '\n--- fluxul RSC, sirurile sortate ---\n'


def imparte(normalizat):
    """Forma normalizatorului: DOM-ul si sirurile fluxului RSC (cate unul pe linie)."""
    if MARCA_RSC not in normalizat:
        return normalizat, []
    dom, rsc = normalizat.split(MARCA_RSC, 1)
    return dom, [s for s in rsc.split('\n') if s != '']


def e_text(sir):
    """Sirurile de TEXT ale fluxului (texte, liste de clase, JSON-LD): cele cu un spatiu. Restul (chei, caile si
    adresele singure, segmentele si grupurile arborelui de rute, identificatorii) nu se compara aici, vezi antetul."""
    return ' ' in sir


def candidati_rsc(sir, va, vb, tabel, cale_b, duble, radacini):
    """Formele permise pe B ale unui sir de text al lui A: forma SERVITA (toate regulile) si forma SURSA (contactele si
    originea traduse, caile si codul de limba ramase ale lui A). Fluxul RSC poarta ambele: caile emise de server sunt
    servite, cele date componentelor client ca date sunt sursa si se traduc la randare (`useCaleSursa`, `Tinta`)."""
    plin = transforma('"' + sir + '"', va, vb, tabel, cale_b, duble=duble, radacini=radacini)[1:-1]
    sursa = transforma('"' + sir + '"', va, vb, tabel, cale_b, cai=False, limba=False, duble=duble, radacini=radacini)[1:-1]
    return {plin, sursa}


def potriveste(siruri_a, siruri_b, va, vb, tabel, cale_b, duble, radacini):
    """Cuplaj maxim intre sirurile de text ale lui A (fiecare cu formele permise) si cele ale lui B. Intoarce sirurile
    ramase necuplate pe fiecare parte (A in forma servita)."""
    from collections import Counter
    rest_b = Counter(siruri_b)
    sloturi = []  # sirurile lui A cu doua forme, cuplate dupa cele cu o singura forma
    ramase_a = []
    for s in siruri_a:
        c = candidati_rsc(s, va, vb, tabel, cale_b, duble, radacini)
        if len(c) == 1:
            (x,) = c
            if rest_b[x] > 0:
                rest_b[x] -= 1
            else:
                ramase_a.append(x)
        else:
            sloturi.append(sorted(c))
    # Cuplaj cu capacitati (Kuhn): fiecare valoare a lui B are capacitatea numarului ei de aparitii ramase.
    atribuit = {}  # index slot -> valoare
    pe_valoare = {}  # valoare -> lista de sloturi

    def incearca(i, vazute):
        for v in sloturi[i]:
            if v in vazute:
                continue
            vazute.add(v)
            ocupate = pe_valoare.setdefault(v, [])
            if len(ocupate) < rest_b[v]:
                ocupate.append(i)
                atribuit[i] = v
                return True
            for j in list(ocupate):
                if incearca(j, vazute):
                    ocupate.remove(j)
                    ocupate.append(i)
                    atribuit[i] = v
                    return True
        return False

    for i in range(len(sloturi)):
        if not incearca(i, set()):
            ramase_a.append(sloturi[i][0])
    for v, ocupate in pe_valoare.items():
        rest_b[v] -= len(ocupate)
    ramase_b = sorted((+rest_b).elements())
    return sorted(ramase_a), ramase_b


def harta_fara_en(text, vb):
    """7. Pe B, harta nu are intrarile de sub /en."""
    ob = re.escape(vb['origine'])
    return re.sub(r'<url>(?:(?!</url>).)*?<loc>' + ob + r'(/[^<]*)</loc>.*?</url>\s*',
                  lambda m: '' if sub_en(m.group(1)) else m.group(0), text, flags=re.S)


# ------------------------------------------------------------------ adresele paginilor, pe identitate

# Ce se masoara: fiecare adresa pe care o pagina o da drept adresa a unei pagini - `url` si `item` din JSON-LD, `og:url` -
# duce la o pagina SERVITA a aceluiasi domeniu, direct (status 200 in colectie, deci fara redirect), in ACEEASI limba
# (`<html lang>`) ca pagina care o poarta. Comparatia de mai sus nu vede o adresa gresita la fel pe ambele domenii (o
# adresa sursa netradusa pe A si pe B); asta o vede, pe fiecare colectie separat. Exceptiile, fiecare cu motivul:
#   - `@id` nu intra: e identificator, nu adresa de vizitat (`src/components/seo/JsonLd.tsx`, antetul);
#   - `url`-ul nodurilor de site (`Organization`, `WebSite`) e radacina domeniului, prin proiectare (`TIPURI_SITE` in
#     JsonLd.tsx): se cere 200, nu si limba (pe paginile /en ale lui B radacina e startul romanesc);
#   - `url`-ul unui `ImageObject` e un fisier static (sigla), nu o pagina, iar colectia nu are fisierele statice: se
#     numara separat, NEMASURAT aici;
#   - o adresa a CELUILALT domeniu trece numai daca e canonical-ul paginii insesi (copia engleza a lui B are canonical-ul
#     pe A, deci si `og:url`), sau daca e un `url`/`item` din JSON-LD pe o pagina al carei canonical e pe acel domeniu
#     (aceeasi copie: adresele paginilor din graf urmeaza canonical-ul, regula 4d), si duce acolo la o pagina 200 in
#     aceeasi limba; orice alta adresa a celuilalt domeniu e o abatere (o pagina cu canonical-ul propriu nu are voie);
#   - adresele altor origini (wa.me) nu sunt ale site-ului: se numara separat.
# Zero adrese masurate pe o colectie e tot o abatere: o masuratoare care nu gaseste nimic nu dovedeste nimic.
BLOC_JSONLD = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)
OG_URL = re.compile(r'<meta property="og:url" content="([^"]*)"')
CANONICAL = re.compile(r'<link rel="canonical" href="([^"]*)"')
LANG_HTML = re.compile(r'<html\b[^>]*?\blang="([^"]*)"')
TIPURI_SITE = ('Organization', 'WebSite')
CHEI_ADRESE = ('url', 'item', 'og:url')


def _adrese_jsonld(obiect):
    """(cheie, valoare, tipurile nodului) pentru fiecare `url`/`item` care e sir, oriunde in graf."""
    if isinstance(obiect, list):
        for x in obiect:
            yield from _adrese_jsonld(x)
    elif isinstance(obiect, dict):
        tip = obiect.get('@type')
        tipuri = tuple(t for t in (tip if isinstance(tip, list) else [tip]) if isinstance(t, str))
        for k, v in obiect.items():
            if k in ('url', 'item') and isinstance(v, str):
                yield k, v, tipuri
            else:
                yield from _adrese_jsonld(v)


def adrese(X, Y, ox, oy):
    """Adresele paginilor colectiei X (originea `ox`); Y (originea `oy`) e celalalt domeniu. Intoarce (numaratoarea pe
    fel, abaterile [(cale, motiv)])."""
    numar, abateri, limbi = Contor(), [], {}

    def limba(col, cale, p):
        cheie = (col['dir'], cale)
        if cheie not in limbi:
            m = LANG_HTML.search(corp(col, p) or '')
            limbi[cheie] = m.group(1) if m else None
        return limbi[cheie]

    for cale, p in sorted(X['pagini'].items()):
        if p['status'] != 200 or not e_html(p) or cale in (X['inexistenta'], NEGASIT_MANIFEST):
            continue
        html = corp(X, p) or ''
        proprie = limba(X, cale, p)
        canon = CANONICAL.search(html)
        valori = []
        for bloc in BLOC_JSONLD.findall(html):
            try:
                valori += list(_adrese_jsonld(json.loads(bloc)))
            except ValueError:
                abateri.append((cale, 'un bloc JSON-LD nu se poate citi'))
        og = OG_URL.search(html)
        if og:
            valori.append(('og:url', og.group(1), ()))
        for cheie, valoare, tipuri in valori:
            if 'ImageObject' in tipuri:
                numar.adauga('fisier-static-nemasurat')
                continue
            m = re.match(r'(https?://[^/?#]+)(/[^?#]*)?', valoare)
            if not m or m.group(1) not in (ox, oy):
                numar.adauga('alta-origine')
                continue
            numar.adauga(cheie)
            tinta_cale = m.group(2) or '/'
            if m.group(1) == ox:
                col = X
            elif canon and valoare == canon.group(1):
                col = Y
            elif cheie in ('url', 'item') and canon and re.match(re.escape(oy) + r'(?:/|$)', canon.group(1)):
                col = Y
            else:
                abateri.append((cale, '%s %s: adresa celuilalt domeniu, si nu e canonical-ul paginii' % (cheie, valoare)))
                continue
            tinta = col['pagini'].get(tinta_cale)
            if tinta is None:
                abateri.append((cale, '%s %s: nu e o pagina servita a colectiei (adresa sursa, redirect sau 404)' % (cheie, valoare)))
            elif tinta['status'] != 200:
                abateri.append((cale, '%s %s: raspunde %s, nu 200' % (cheie, valoare, tinta['status'])))
            elif not any(t in TIPURI_SITE for t in tipuri) and limba(col, tinta_cale, tinta) != proprie:
                abateri.append((cale, '%s %s: pagina tinta are lang=%s, pagina care o poarta lang=%s (alta editie)'
                                % (cheie, valoare, limba(col, tinta_cale, tinta), proprie)))
    return numar, abateri


# ------------------------------------------------------------------ comparatia

def linii(text):
    """Forma de afisare a unei diferente: DOM-ul rupt dupa fiecare `>`, ca diferenta sa fie scurta."""
    return text.replace('>', '>\n').split('\n')


def valori_contact_a(text, va, vb):
    """Valorile de contact ale lui A (e-mail, numarul afisat si E.164, cifrele de WhatsApp) gasite intr-un text al lui B.
    Domeniul nu intra: adresele lui A raman legitim pe B in grupul hreflang si in canonical-ul paginilor /en. O valoare
    egala pe ambele domenii nu intra (e si a lui B)."""
    gasite = [k for k in ('email', 'telefonAfisat', 'telefonE164') if va[k] != vb[k] and contine_valoare(va, k, text)]
    if va['whatsapp'] != vb['whatsapp'] and re.search(r'(?<![\d+])' + re.escape(va['whatsapp']) + r'(?!\d)', text):
        gasite.append('whatsapp')
    return gasite


def are_contact(text, va):
    """Pagina lui A poarta contactul operatorului (numarul afisat sau cifrele de WhatsApp)."""
    return are_numar_afisat(va['telefonAfisat'], text) or re.search(r'(?<![\d+])' + re.escape(va['whatsapp']) + r'(?!\d)', text) is not None


def compara(A, B, perechi_cai, regula, valori, tabel, normalizator, arata, cont=None, cont_contact=None, duble=frozenset()):
    """`perechi_cai` = [(cale A, cale B)]. Intoarce (comparate, diferente) si tipareste fiecare diferenta.

    La `identitate`, `cont` primeste aplicarile fiecarei reguli pe toate paginile, `cont_contact` numai pe paginile lui
    A care poarta contactul operatorului; `duble` = caile lui A servite pe B si la aceeasi cale, si sub /en."""
    va, vb = valori if valori else (None, None)
    diferente = []
    de_normalizat = []  # (index in lista de comparatii, html A, id A, html B, id B)
    comparatii = []
    if regula == 'identitate':
        # Limba radacinii fiecarui domeniu: antetul paginii de start (`/`), citit din colectie, nu presupus.
        radacina_a = (A['pagini'].get('/', {}).get('antete', {}) or {}).get('content-language')
        radacina_b = (B['pagini'].get('/', {}).get('antete', {}) or {}).get('content-language')
        if not radacina_a or not radacina_b:
            raise Nemasurat('pagina de start `/` lipseste sau nu are Content-Language pe una din colectii')
        confidentialitate = cai_confidentialitate()
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
        limba_aplicata = False
        if regula == 'identitate':
            # 6. Content-Language: pe o pagina romaneasca codul romanei lui B; pe un fisier de domeniu (aceeasi cale pe
            # ambele, deci servit de editia radacinii) limba radacinii lui B (regula 9), in afara celor in engleza (9b).
            la = ha.get('content-language')
            if la == va['limba'] and not sub_en(cb):
                ha['content-language'] = vb['limba']
                cont.adauga('content-language')
                limba_aplicata = True
            elif la == radacina_a and ca == cb and not sub_en(cb) and ca not in FISIERE_IN_ENGLEZA:
                ha['content-language'] = radacina_b
                cont.adauga('limba-radacinii')
            if 'location' in ha:
                ha['location'] = transforma(ha['location'], va, vb, tabel, cb, duble=duble)
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
        brut_a = ta
        celule, amprenta, cu_contact = frozenset(), False, False
        if regula == 'identitate':
            if ca in confidentialitate:
                ta, celule_a, pozitii, n_a, _ = fara_destinatari(ta, va)
                tb, celule_b, _, n_b, texte_b = fara_destinatari(tb, va, pozitii or ())
                brut_a = ta
                if celule_a is None or celule_b is None:
                    motive.append('tabelul destinatarilor (sectiunea 5) lipseste pe ' + ('A' if celule_a is None else 'B'))
                elif not pozitii:
                    motive.append('tabelul destinatarilor (sectiunea 5) n-are pe A niciun rand DNS sau posta')
                elif n_a != n_b:
                    motive.append('tabelul destinatarilor (sectiunea 5) are %d randuri pe A si %d pe B' % (n_a, n_b))
                else:
                    celule = frozenset(celule_a | celule_b)
                    cont.adauga('destinatari-confidentialitate', len(pozitii))
                    numar = [t for t in texte_b if are_numar(t, va) or are_numar(t, vb)]
                    if numar:
                        motive.append('un rand DNS sau posta al lui B poarta un numar de contact: ' + numar[0].strip()[:120])
            tb_fara_celule = tb
            for c in sorted(celule, key=len, reverse=True):
                tb_fara_celule = tb_fara_celule.replace(c, '')
            ramase = valori_contact_a(tb_fara_celule, va, vb)
            if ramase:
                motive.append('valorile de contact ale lui A raman pe B: ' + ', '.join(ramase))
            pagina = Contor()
            ta = fisier_de_domeniu(ca, ta, limba_scurta(radacina_a), limba_scurta(radacina_b), pagina)
            ta = transforma(ta, va, vb, tabel, cb, cont=pagina, duble=duble, radacini=(radacina_a, radacina_b)).replace('\x00RADACINA\x00', '/')
            if cb.endswith('sitemap.xml'):
                n_inainte = ta.count('<url>')
                ta = harta_fara_en(ta, vb)
                pagina.adauga('harta-fara-en', n_inainte - ta.count('<url>'))
            amprenta = any(pagina.get(k, 0) for k in REGULI_TEXT_CONTACT) or contact_in_document(brut_a, va, vb)
            cu_contact = cont_contact is not None and e_html(pa) and are_contact(brut_a, va)
            if cu_contact:
                cont_contact.adauga('_pagini')
                if limba_aplicata:
                    cont_contact.adauga('content-language')
            for k, n in pagina.items():
                cont.adauga(k, n)
                if cu_contact:
                    cont_contact.adauga(k, n)
        if e_html(pa) and e_html(pb):
            de_normalizat.append((len(comparatii) - 1, eticheta, motive, fara_amprente(ta), fara_amprente(tb), fara_amprente(brut_a), cb,
                                  celule, amprenta, cu_contact))
            continue
        na, nb = fara_id(ta, A['id']), fara_id(tb, B['id'])
        if na != nb:
            motive.append('corpul difera')
        if motive:
            diferente.append((eticheta, '; '.join(motive), (na, nb) if na != nb else None))

    if de_normalizat:
        identitate = regula == 'identitate'
        lot = []
        for x in de_normalizat:
            lot += [(x[3], A['id']), (x[4], B['id'])] + ([(x[5], A['id'])] if identitate else [])
        norm = normalizeaza_lot(lot, normalizator)
        pas = 3 if identitate else 2
        for k, (_, eticheta, motive, _, _, _, cb, celule, amprenta, cu_contact) in enumerate(de_normalizat):
            na, nb = norm[pas * k], norm[pas * k + 1]
            if identitate:
                # DOM-ul: caracter cu caracter, dupa regulile de mai sus si dupa forma fixa a arborelui de rute.
                # Fluxul RSC: sirurile de text, cuplate cu formele lor permise (`potriveste`).
                dom_a, _ = imparte(na)
                dom_b, rsc_b = imparte(nb)
                _, rsc_a = imparte(norm[pas * k + 2])
                dom_a, dom_b = structura(dom_a), structura(dom_b)
                if amprenta:
                    fara = fara_amprenta(dom_a)
                    if fara != dom_a:
                        cont.adauga('amprenta-juridica')
                        if cu_contact:
                            cont_contact.adauga('amprenta-juridica')
                    dom_a, dom_b = fara, fara_amprenta(dom_b)

                def text_rsc(siruri):
                    return [LUNGIME_RAND_T.sub('T,', s) for s in siruri if e_text(s) and s not in celule]
                ramase_a, ramase_b = potriveste(text_rsc(rsc_a), text_rsc(rsc_b), va, vb, tabel, cb, duble, (radacina_a, radacina_b))
                na = dom_a + MARCA_RSC + '\n'.join(ramase_a)
                nb = dom_b + MARCA_RSC + '\n'.join(ramase_b)
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
    global JURIDIC_RUTE
    ap = argparse.ArgumentParser(description='Compara doua colectii de build.')
    ap.add_argument('--regula', choices=('invarianta', 'identitate'), required=True)
    ap.add_argument('--perechi', help='fisierul de perechi (numai la identitate)')
    ap.add_argument('--normalizator', default=NORMALIZATOR)
    ap.add_argument('--juridic-rute', default=JURIDIC_RUTE, help='adresele documentelor juridice (implicit config/juridic-rute.json)')
    ap.add_argument('--arata', type=int, default=12, help='cate randuri de diferenta pe pagina (0 = niciunul)')
    ap.add_argument('colectie_a')
    ap.add_argument('colectie_b')
    try:
        args = ap.parse_args()
    except SystemExit:
        return GRESIT
    JURIDIC_RUTE = args.juridic_rute
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
        cont, cont_contact, duble, fara_aplicari = Contor(), Contor(), frozenset(), []
        if args.regula == 'invarianta':
            perechi_cai = [(c, c) for c in sorted(set(A['pagini']) | set(B['pagini']))]
        else:
            va, vb, tabel = citeste_perechi(args.perechi)
            valori = (va, vb)
            perechi_cai = sorted(tabel.items())
            # 2b. Caile lui A pe care B le serveste in arborele englez (sub /en) SI la aceeasi cale, in arborele romanesc
            # (imaginile sociale, cate una pe arbore): a doua copie se compara cu pagina lui A de la aceeasi cale.
            duble = frozenset(a for a, b in tabel.items() if sub_en(b) and a in B['pagini'] and a not in tabel.values())
            perechi_cai += [(c, c) for c in sorted(duble)]
            fara_a = sorted(set(A['pagini']) - set(tabel) - {A['inexistenta'], NEGASIT_MANIFEST})
            fara_b = sorted(set(B['pagini']) - set(tabel.values()) - duble - {B['inexistenta'], NEGASIT_MANIFEST})
            for c in fara_a:
                print('DIF %s: pagina lui A fara pereche' % c)
            for c in fara_b:
                print('DIF %s: pagina lui B fara pereche' % c)
            for c in (NEGASIT_MANIFEST, A['inexistenta']):
                if c in A['pagini'] and (c in B['pagini'] or c == A['inexistenta']):
                    perechi_cai.append((c, c if c in B['pagini'] else B['inexistenta']))
        comparate, dif = compara(A, B, perechi_cai, args.regula, valori, tabel, args.normalizator, args.arata, cont, cont_contact, duble)
        if args.regula == 'identitate':
            dif += len(fara_a) + len(fara_b)
            # O regula din lista inchisa care nu s-a aplicat NICIODATA e un normalizator stricat sau o premisa cazuta,
            # nu o identitate: regulile de contact se cer pe paginile care poarta contactul, celelalte pe toata colectia.
            for regula in REGULI_CONTACT:
                if regula == 'email' and va['email'] == vb['email']:
                    continue  # aceeasi adresa pe ambele domenii: regula nu se aplica (vezi 5a)
                if cont_contact.get(regula, 0) == 0:
                    fara_aplicari.append(regula + ' (pe paginile cu contact)')
            for regula in REGULI_COLECTIE:
                if cont.get(regula, 0) == 0:
                    fara_aplicari.append(regula)
            for regula in fara_aplicari:
                print('DIF regula %s: zero aplicari' % regula)
            dif += len(fara_aplicari)
            # Adresele paginilor, pe fiecare colectie (vezi `adrese`): A e controlul (3s.md), B domeniul asezat.
            raport_adrese = []
            for nume, X, Y, ox, oy in (('A', A, B, va['origine'], vb['origine']), ('B', B, A, vb['origine'], va['origine'])):
                numar, abateri = adrese(X, Y, ox, oy)
                for cale, motiv in abateri:
                    print('DIF adresa %s %s: %s' % (nume, cale, motiv))
                if sum(numar.get(k, 0) for k in CHEI_ADRESE) == 0:
                    print('DIF adrese %s: zero adrese masurate (url, item, og:url)' % nume)
                    dif += 1
                dif += len(abateri)
                raport_adrese.append('%s: %s, abateri %d' % (nume, ', '.join('%s=%d' % (k, numar.get(k, 0)) for k in
                                     CHEI_ADRESE + ('fisier-static-nemasurat', 'alta-origine')), len(abateri)))
    except Nemasurat as e:
        print('NEMASURAT: ' + str(e))
        return NEMASURAT
    if args.regula == 'identitate':
        print('perechi comparate %d; pagini lui A cu contact: %d' % (comparate, cont_contact.get('_pagini', 0)))
        print('substitutii pe regula: ' + ', '.join('%s=%d' % (k, cont.get(k, 0)) for k in REGULI_TOATE))
        print('substitutii pe paginile cu contact: ' + ', '.join('%s=%d' % (k, cont_contact.get(k, 0)) for k in REGULI_CONTACT))
        print('adresele paginilor (url, item din JSON-LD, og:url): ' + '; '.join(raport_adrese))
    print('regula %s: pagini comparate %d, diferente %d (A: %d cai, build %s; B: %d cai, build %s)'
          % (args.regula, comparate, dif, len(A['pagini']), A['id'], len(B['pagini']), B['id']))
    if comparate == 0:
        print('NEMASURAT: zero pagini comparate (zero nu e verde)')
        return NEMASURAT
    return PICAT if dif else CURAT


if __name__ == '__main__':
    sys.exit(main())

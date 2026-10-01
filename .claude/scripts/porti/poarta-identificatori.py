#!/usr/bin/env python3
"""Identificatori unici pe arborele plin: doua felii pot alege acelasi nume fara conflict git.

DE CE EXISTA. Fabrica lucreaza cu felii paralele, in worktree-uri separate, pe multimi de
fisiere DISJUNCTE - exact conditia care face imbinarea sa reuseasca. Tocmai de asta git nu
poate vedea clasa de coliziune de aici: doua felii care ating fisiere diferite pot alege
acelasi identificator GLOBAL (aceeasi cale in `RUTE`, aceeasi ancora `#sectiune` pe pagina
randata, acelasi nume de registru care produce acelasi fisier generat). Fiecare felie e
verde la ea acasa, imbinarea trece fara conflict, si defectul apare abia in productie.
`plieaza.sh` prezice doar suprapunerea de FISIERE SURSA, nu de NUME. Vezi ADR-0004.

CE PRINDE
  ID-01  doua intrari din `RUTE` cu aceeasi `cale` (exact acelasi sir)
  ID-02  doua cai din `RUTE` care difera doar prin litere mari/mici. Nu sunt aceeasi adresa -
         RFC 3986 §6.2.2.1 spune ca segmentele de cale sunt sensibile la registru, spre
         deosebire de schema si de gazda - dar Next.js le mapeaza pe DIRECTOARE, iar pe
         Windows si pe macOS doua directoare care difera doar prin registru nu pot coexista.
         Deci: doua rute legitime ca URL, un singur director pe disc.
  ID-03  doua intrari din `SECTIUNI_ACASA` cu aceeasi `ancora`
  ID-04  acelasi `id="..."` de doua ori in ACEEASI pagina randata - pagina plus layout-urile
         de pe drum plus inchiderea tranzitiva a componentelor importate cu `@/`. Duplicatul
         strica ancorele (`#sectiune` sare la primul), `aria-labelledby` si sarul catre
         continut. Intre pagini DIFERITE nu e defect si nu se raporteaza: `#continut` exista
         intentionat pe fiecare pagina, e ancora de accesibilitate, si o poarta care ar cere
         nume unice global ar cere renumerotarea a 22 de pagini pentru zero castig.
  ID-05  doua registre din `src/content/afirmatii/` ale caror nume difera doar prin registru.
         Git le vede ca doua fisiere; `poarta-evidenta.py` genereaza din amandoua acelasi
         `docs/afirmatii/<nume>.md` si al doilea il suprascrie pe primul, tacut.

CUM DECIDE. Citeste, nu scrie. Cai si ancore din `src/content/rute.ts` prin tipar pe campurile
`cale:` si `ancora:`. Id-urile: numai literalele `id="..."`; pagina randata se compune urmarind
importurile `from "@/..."` pana la punct fix, plus `layout.tsx` din fiecare director de pe drumul
paginii. Nume de registru: `os.path.basename` fara extensie, comparat cu `lower()`, nu cu
`casefold()`: casefold desface ligaturile (U+FB01 devine "fi"), ceea ce niciun sistem de fisiere
nu face, iar o poarta care raporteaza ce nu se intampla e dezarmata in cateva saptamani. Aici un
fals negativ exotic e mai ieftin decat un fals pozitiv.

PE EDITIE (fundatia editiilor, `src/lib/editii.ts`). Arborele tine mai multe site-uri: romanesc
(`page.tsx` sub `layout.tsx`), international (`page.en.tsx` sub `layout.en.tsx`, grupul `(en)`) si
romana pentru Republica Moldova (`page.romd.tsx` sub `layout.romd.tsx`, grupul `(romd)`). O pagina se
randeaza NUMAI cu layout-urile editiei ei (pe build-ul international `layout.tsx` nu exista), deci
radacinile ei sunt fisierul paginii plus layout-urile cu ACELASI sufix de pe drum. Caile se citesc din
toate manifestele (`rute.ts`, `rute-en*.ts`, `rute-ro-md.ts`), iar ID-01/ID-02 se masoara pe editie:
aceeasi cale in doua editii e doua site-uri, nu o coliziune.

CUM SE PAZESTE POARTA PE EA INSASI. Detectoarele se probeaza pe fixturi in memorie, cu
`rezolva`/`citeste` injectate. Peste ele sta un martor CAP LA CAP (`martor_cap_la_cap`) care
scrie un arbore mic in `tempfile.mkdtemp()` si il masoara prin ACEEASI `masoara_arbore` prin
care trece arborele real. Fara el, puntea catre disc nu e atinsa de niciun martor: `rezolva_real`
intors la `None`, sau bucla de layout-uri din `pagini_reale` dezarmata, sterg toata clasa ID-04
si poarta iese 0 tiparind "martori ... OK". Amandoi mutantii au supravietuit primei versiuni,
masurat de un critic pe 2026-09-06 cu un duplicat REAL injectat pe 22 de pagini; azi amandoi mor
pe martorul de mai jos, cu cod 3.

CE NU VERIFICA (reziduuri - un zero de aici nu inseamna acoperire)
  - Id-uri DINAMICE (`id={ceva}`): patru componente le randeaza asa (`Ecran`, `SectiuneRegistru`,
    `JuridicPagina`, `TermeneFisa`). Valorile vin din `src/content/*.ts` la randare si poarta nu
    le evalueaza. Un `sectiune.id` care se ciocneste cu un literal trece nevazut.
  - Un component cu `id` LITERAL randat de DOUA ori pe aceeasi pagina produce doua id-uri
    identice in HTML; poarta il numara o data. Numarul de randari e decizie de rulare.
  - Id-urile din `src/content/afirmatii/*.json` NU se verifica aici: `poarta-evidenta.py`
    concateneaza toate registrele intr-o singura lista si abia apoi cauta duplicate (vezi
    `probleme()` si bucla care face `intrari.extend(bucata)`), deci acopera deja TOT registrul,
    nu doar fisierul. Masurat, nu presupus. Reziduul care ramane e al ei: mesajul `id duplicat`
    nu spune in ce doua fisiere sta duplicatul.
  - Cheile de traducere: nu exista i18n in proiect azi. Cand apare, se adauga o clasa aici.
  - Coliziunile de nume intre registre si LISTELE deja generate din `docs/afirmatii/` nu se
    raporteaza: acolo `poarta-evidenta.py` sterge orfanii si regenereaza, deci ar fi zgomot.
  - ID-05 nu are martor CAP LA CAP pe Windows, si nu din lene: sistemul de fisiere refuza sa
    tina deodata `juridic.json` si `Juridic.json`, adica exact fixtura care ar dovedi drumul de
    la disc pana la constatare. Masurate separat sunt amandoua jumatatile - culegerea de nume
    (linia MASURAT numara registrele gasite) si detectorul (martorii de mai jos, in ambele
    sensuri) - iar detectorul e acelasi obiect care produce ID-02, si ALA e exercitat pana la
    capat. Compunerea celor doua ramane inferenta pe Windows. Pe o banda Linux fixtura se poate
    face; nu exista azi.

LA ROSU: CE AI VOIE SA EDITEZI
  - ID-01/ID-02: `src/content/rute.ts`, DOAR intrarea noua a feliei tale, si `src/app/<cale>/`
    care ii corespunde. Nu redenumesti ruta altei felii: e adresa publica a altcuiva.
  - ID-03: ancora noua din `SECTIUNI_ACASA` plus `id` din `src/app/page.tsx`, impreuna.
  - ID-04: `id="..."` din PAGINA ta. Daca duplicatul vine dintr-un component partajat
    (`PaginaDeSegment`, `JuridicPagina`, `Navigatie`, layout), NU editezi componentul -
    e al altei felii si il schimbi pentru toate paginile deodata; iti redenumesti id-ul tau.
  - ID-05: numele fisierului tau de registru.
  - NU ai voie: corpul portii, tiparele, martorii, lista de coduri. O poarta rosie se
    justifica, nu se slabeste.

IESIRE: 0 curat - 1 coliziuni - 2 folosire gresita - 3 control picat sau preconditie lipsa
"""
import glob
import io
import os
import re
import shutil
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MANIFEST = os.path.join(RADACINA, 'src', 'content', 'rute.ts')
DOSAR_APP = os.path.join(RADACINA, 'src', 'app')
DOSAR_REGISTRU = os.path.join(RADACINA, 'src', 'content', 'afirmatii')

TIPAR_CALE = re.compile(r'\bcale:\s*"([^"]+)"')
TIPAR_ANCORA = re.compile(r'\bancora:\s*"([^"]+)"')
TIPAR_ID = re.compile(r'\bid="([^"]+)"')
TIPAR_IMPORT = re.compile(r'from\s+"(@/[^"]+)"')

EXTENSII_MODUL = ('.tsx', '.ts', '.mdx', '.json', '/index.tsx', '/index.ts')

# Fisierul de pagina al fiecarei editii si layout-ul ei (catalogul din `src/lib/editii.ts`).
PAGINA_LAYOUT = (('page.tsx', 'layout.tsx'), ('page.en.tsx', 'layout.en.tsx'), ('page.romd.tsx', 'layout.romd.tsx'))


def editia_manifestului(nume):
    """Editia unui fisier `src/content/rute*.ts` dupa nume, sau None (acelasi criteriu ca poarta-rute)."""
    if nume == 'rute.ts':
        return 'ro-RO'
    if nume == 'rute-en.ts' or (nume.startswith('rute-en-') and nume.endswith('.ts')):
        return 'en'
    if nume == 'rute-ro-md.ts':
        return 'ro-MD'
    return None


# --- extractoare pure ------------------------------------------------------------------------

def cai_din_manifest(text):
    return TIPAR_CALE.findall(text)


def ancore_din_manifest(text):
    return TIPAR_ANCORA.findall(text)


def id_uri_din_sursa(text):
    return TIPAR_ID.findall(text)


def importuri_din_sursa(text):
    return TIPAR_IMPORT.findall(text)


# --- detectoare pure -------------------------------------------------------------------------

def duplicate_exacte(valori):
    """Valorile care apar de mai multe ori, in ordinea primei aparitii."""
    numarate = {}
    ordine = []
    for v in valori:
        if v not in numarate:
            numarate[v] = 0
            ordine.append(v)
        numarate[v] += 1
    return [(v, numarate[v]) for v in ordine if numarate[v] > 1]


def coliziuni_de_registru(nume):
    """Nume DISTINCTE care se ciocnesc pe un sistem de fisiere insensibil la registru.

    Numele identice nu se raporteaza aici: alea sunt acelasi fisier si le prinde git.
    """
    grupe = {}
    for n in nume:
        cheie = n.lower()
        grupe.setdefault(cheie, [])
        if n not in grupe[cheie]:
            grupe[cheie].append(n)
    return [(cheie, sorted(lista)) for cheie, lista in sorted(grupe.items()) if len(lista) > 1]


def inchidere_pagina(start, rezolva, citeste):
    """Fisierele care compun o pagina randata: radacinile plus importurile `@/`, la punct fix.

    `rezolva(spec) -> cale sau None` si `citeste(cale) -> text sau None` se injecteaza, ca sa
    poata rula pe un arbore fabricat in memorie, fara disc.
    """
    coada = list(start)
    vazute = []
    puse = set()
    while coada:
        cale = coada.pop(0)
        if cale in puse:
            continue
        puse.add(cale)
        vazute.append(cale)
        text = citeste(cale)
        if text is None:
            continue
        for spec in importuri_din_sursa(text):
            tinta = rezolva(spec)
            if tinta and tinta not in puse:
                coada.append(tinta)
    return vazute


def duplicate_de_id(aparitii):
    """`aparitii` = lista de (id, fisier) pentru O pagina randata. Intoarce grupele > 1."""
    grupe = {}
    ordine = []
    for ident, fisier in aparitii:
        if ident not in grupe:
            grupe[ident] = []
            ordine.append(ident)
        grupe[ident].append(fisier)
    return [(i, grupe[i]) for i in ordine if len(grupe[i]) > 1]


# --- controale -------------------------------------------------------------------------------

def controale():
    """Martori pozitivi si negativi pe fixturi asamblate aici, la rulare.

    Ancora externa: RFC 3986 §6.2.2.1 ("Case Normalization") declara schema si gazda
    insensibile la registru si LASA restul URI-ului sensibil - deci `/Solutii` si `/solutii`
    sunt doua adrese diferite. Asteptarea de mai jos vine din standardul ala, nu din codul de
    fata: poarta NU are voie sa le numeasca duplicat exact (ID-01), dar TREBUIE sa le
    raporteze ca doua directoare care nu incap pe acelasi disc (ID-02).
    """
    # ID-01 martor pozitiv
    if not duplicate_exacte(['/', '/solutii', '/solutii']):
        return 'martor pozitiv ID-01: doua cai identice nu au fost prinse'
    # ID-01/ID-02 ancorate in RFC 3986
    if duplicate_exacte(['/solutii', '/Solutii']):
        return ('ancora externa RFC 3986 §6.2.2.1: `/solutii` si `/Solutii` sunt URI-uri '
                'DIFERITE (calea e sensibila la registru) si nu au voie sa fie raportate ca '
                'duplicat exact')
    if len(coliziuni_de_registru(['solutii', 'Solutii'])) != 1:
        return ('ancora externa: `/solutii` si `/Solutii` trebuie raportate ca o coliziune de '
                'nume pe disc (un singur director pe Windows si macOS)')
    # martor negativ pe cai
    if duplicate_exacte(['/', '/solutii', '/solutii/notari', '/contact']):
        return 'martor negativ: patru cai distincte au fost raportate ca duplicat'
    if coliziuni_de_registru(['juridic', 'mecanism', 'securitate']):
        return 'martor negativ: trei nume distincte au fost raportate ca o coliziune de registru'
    if coliziuni_de_registru(['juridic', 'juridic']):
        return ('martor negativ: acelasi nume de doua ori e ACELASI fisier, il prinde git; '
                'poarta nu are voie sa il raporteze ca o coliziune de registru')

    # ID-04 pe un arbore fabricat in memorie, cu import tranzitiv pe doua nivele
    arbore = {
        'src/app/proba/page.tsx': 'import X from "@/components/Invelis";\n<div id="continut">',
        'src/app/layout.tsx': 'import N from "@/components/Bara";\n<main id="zona-continut">',
        'src/components/Invelis.tsx': 'import Y from "@/components/Adanc";\n<section id="dovada">',
        'src/components/Adanc.tsx': '<p id="continut">',
        'src/components/Bara.tsx': '<nav id="meniu">',
    }

    def rezolva(spec):
        baza = 'src/' + spec[2:]
        for ext in ('.tsx', '.ts'):
            if baza + ext in arbore:
                return baza + ext
        return None

    def citeste(cale):
        return arbore.get(cale)

    fisiere = inchidere_pagina(['src/app/proba/page.tsx', 'src/app/layout.tsx'], rezolva, citeste)
    if 'src/components/Adanc.tsx' not in fisiere:
        return ('martorul de inchidere: importul de pe nivelul doi (`Adanc` prin `Invelis`) nu a '
                'fost urmarit, deci pagina randata e citita incomplet')
    aparitii = []
    for f in fisiere:
        for ident in id_uri_din_sursa(arbore[f]):
            aparitii.append((ident, f))
    gasite = duplicate_de_id(aparitii)
    if not any(i == 'continut' for i, _ in gasite):
        return ('martor pozitiv ID-04: `continut` apare si in pagina, si intr-un component '
                'importat tranzitiv, si nu a fost prins')
    if any(i == 'zona-continut' for i, _ in gasite):
        return 'martor negativ ID-04: un id care apare o singura data a fost raportat duplicat'
    if any(i == 'meniu' for i, _ in gasite):
        return 'martor negativ ID-04: id-ul din layout apare o singura data si nu e duplicat'

    # martor negativ intre PAGINI: acelasi id pe doua pagini diferite nu e defect
    a = duplicate_de_id([('continut', 'src/app/a/page.tsx')])
    b = duplicate_de_id([('continut', 'src/app/b/page.tsx')])
    if a or b:
        return ('martor negativ: `#continut` pe doua pagini diferite e ancora de accesibilitate, '
                'nu duplicat - poarta le-a amestecat')

    # extragerea: fara ea, poarta ar putea iesi curata fiindca n-a citit nimic
    fals = ('export const RUTE = [\n  { cale: "/", inMeniu: false },\n'
            '  { cale: "/contact" },\n];\n'
            'export const SECTIUNI_ACASA = [\n  { ancora: "scan" },\n  { ancora: "solve" },\n];\n')
    if cai_din_manifest(fals) != ['/', '/contact']:
        return 'martorul de extragere: cai citite gresit din manifestul de proba'
    if ancore_din_manifest(fals) != ['scan', 'solve']:
        return 'martorul de extragere: ancore citite gresit din manifestul de proba'
    if id_uri_din_sursa('<div id="a" /><span id={dinamic} /><i id="b" />') != ['a', 'b']:
        return 'martorul de extragere: id-urile literale citite gresit (sau cele dinamice inghitite)'
    if importuri_din_sursa('import A from "@/components/A";\nimport b from "./local";') != \
            ['@/components/A']:
        return 'martorul de extragere: importurile `@/` citite gresit'

    return martor_cap_la_cap()


def martor_cap_la_cap():
    """Martor pe un arbore fabricat pe DISC, prin `masoara_arbore` - nu prin dubluri injectate.

    Tot ce e mai sus exercita functii pure cu `rezolva`/`citeste` INJECTATE, deci nu atinge puntea
    catre disc. Masurat de un critic pe 2026-09-06: cu puntea nemartorita, `rezolva_real` intors la
    `None` sau bucla de layout-uri din `pagini_reale` dezarmata sterg toata clasa ID-04, iar poarta
    tipareste "martori ... OK" plus "COLIZIUNI: 0" si iese 0 avand 22 de duplicate reale in arbore
    (`id="continut"` pus pe `<footer>` din Subsol.tsx, care sta in layout). Singurul semn ramanea
    cifra din randul MASURAT, pe care n-o compara nimeni.

    Fixtura pune DOUA duplicate, cate unul pe fiecare drum al puntii, ca niciunul din cei doi
    mutanti sa nu supravietuiasca:
      - `continut` se vede DOAR daca `rezolva_real` rezolva importurile `@/` pe doua nivele;
      - `subsol-ancora` se vede DOAR daca `pagini_reale` pune `layout.tsx` in radacinile paginii.
    Plus o a doua pagina, cu id-uri unice sub acelasi layout, care nu are voie sa produca nimic.
    """
    lucru = tempfile.mkdtemp(prefix='poarta-identificatori-')

    def scrie(rel, continut):
        cale = os.path.join(lucru, rel.replace('/', os.sep))
        dosar = os.path.dirname(cale)
        if not os.path.isdir(dosar):
            os.makedirs(dosar)
        io.open(cale, 'w', encoding='utf-8', newline='\n').write(continut)

    try:
        scrie('src/content/rute.ts',
              'export const RUTE = [\n  { cale: "/proba" },\n  { cale: "/curata" },\n'
              '  { cale: "/proba" },\n];\n'
              'export const SECTIUNI_ACASA = [\n  { ancora: "scan" },\n'
              '  { ancora: "scan" },\n];\n')
        scrie('src/app/layout.tsx', 'import S from "@/components/Subsol";\n<body id="corp">\n')
        scrie('src/components/Subsol.tsx', '<footer id="subsol-ancora">\n')
        scrie('src/app/proba/page.tsx',
              'import I from "@/components/Invelis";\n<div id="continut">\n'
              '<a id="subsol-ancora">\n')
        scrie('src/components/Invelis.tsx',
              'import A from "@/components/Adanc";\n<section id="dovada">\n')
        scrie('src/components/Adanc.tsx', '<p id="continut">\n')
        scrie('src/app/curata/page.tsx', '<div id="doar-aici">\n')
        scrie('src/content/afirmatii/proba.json', '[]\n')
        # Editia en: aceeasi cale ca o ruta romaneasca (doua site-uri, NU ID-01), plus o pagina
        # page.en.tsx al carei id se repeta in layout.en.tsx (ID-04 vazut DOAR daca pagina si layout-ul
        # cu sufix sunt invatate), si un layout.tsx romanesc care nu are voie sa intre in pagina EN.
        scrie('src/content/rute-en-proba.ts', 'export const RUTE_EN_PROBA = [\n  { cale: "/curata" },\n];\n')
        scrie('src/app/(en)/layout.en.tsx', '<body id="corp-en">\n')
        scrie('src/app/(en)/pret/page.en.tsx', '<main id="corp-en">\n<p id="corp">\n')

        try:
            gasiri, cifre = masoara_arbore(lucru)
        except Preconditie as e:
            return ('martorul cap la cap: masuratoarea a refuzat arborele fabricat (' + str(e) +
                    '), deci martorul nu a apucat sa masoare nimic')
        coduri = sorted(c for c, _ in gasiri)
        if coduri != ['ID-01', 'ID-03', 'ID-04', 'ID-04', 'ID-04']:
            return ('martorul cap la cap: pe arborele fabricat asteptam ID-01, ID-03 si TREI '
                    'ID-04, si am primit ' + repr(gasiri))
        id04 = [m for c, m in gasiri if c == 'ID-04']
        if not any('`continut`' in m for m in id04):
            return ('martorul cap la cap: duplicatul adus prin importul `@/` de pe nivelul doi nu '
                    'a fost prins - puntea `rezolva_real` nu ajunge la src/components/ pe disc')
        if not any('`subsol-ancora`' in m for m in id04):
            return ('martorul cap la cap: duplicatul adus din layout nu a fost prins - '
                    '`pagini_reale` nu pune layout.tsx in radacinile paginii')
        if any('/curata/' in m for m in id04):
            return ('martorul cap la cap, negativ: pagina cu id-uri unice sub acelasi layout a '
                    'fost raportata duplicata')
        if not any('`corp-en`' in m and 'page.en.tsx' in m for m in id04):
            return ('martorul cap la cap: duplicatul dintre page.en.tsx si layout.en.tsx nu a fost prins - '
                    'paginile si layout-urile cu sufix de editie nu sunt citite')
        if any('`corp`' in m for m in id04):
            return ('martorul cap la cap, negativ: layout.tsx romanesc a fost pus in pagina EN (id-ul '
                    '`corp` apare o singura data in pagina EN si o data in layout-ul RO)')
        if any(c == 'ID-01' and '/curata' in m for c, m in gasiri):
            return ('martorul cap la cap, negativ: aceeasi cale in doua editii a fost raportata ca '
                    'duplicat (sunt doua site-uri)')
        asteptat = {'cai': 4, 'ancore': 2, 'pagini': 3, 'id_uri': 12, 'registre': 1}
        if cifre != asteptat:
            return ('martorul cap la cap: cifrele masurate pe arborele fabricat nu sunt cele '
                    'scrise in fixtura (asteptat ' + repr(asteptat) + ', primit ' + repr(cifre) +
                    ') - randul MASURAT numara altceva decat crede')
    finally:
        shutil.rmtree(lucru, ignore_errors=True)
    return None


# --- masuratoarea pe arborele real -------------------------------------------------------------

def rezolva_real(spec, radacina=RADACINA):
    """`@/x/y` -> calea pe disc a modulului, sau None. `radacina` e parametru ca martorul cap la
    cap din `controale()` sa poata rula ACEASTA functie pe un arbore fabricat in temp."""
    baza = os.path.join(radacina, 'src', spec[2:].replace('/', os.sep))
    for ext in EXTENSII_MODUL:
        candidat = baza + ext.replace('/', os.sep)
        if os.path.isfile(candidat):
            return candidat
    return None


def citeste_real(cale):
    try:
        return io.open(cale, encoding='utf-8').read()
    except (IOError, OSError, UnicodeDecodeError):
        return None


def pagini_reale(dosar_app=DOSAR_APP, radacina=RADACINA):
    """(cale relativa a paginii, radacinile ei) pentru fiecare fisier de pagina din `src/app`.

    Radacinile unei pagini sunt fisierul ei (`page.tsx`, `page.en.tsx` sau `page.romd.tsx`) PLUS
    fiecare layout al ACELEIASI editii (`layout.tsx`, `layout.en.tsx`, `layout.romd.tsx`) de pe drumul
    catre `src/app`: layout-ul e randat in aceeasi pagina, deci un `id` din el se ciocneste cu unul din
    pagina. Parametrii exista ca martorul cap la cap sa exercite chiar bucla asta pe un arbore fabricat.
    """
    rezultat = []
    for rad, directoare, nume in os.walk(dosar_app):
        directoare[:] = [d for d in directoare if d not in ('node_modules', '__pycache__')]
        for fisier_pagina, fisier_layout in PAGINA_LAYOUT:
            if fisier_pagina not in nume:
                continue
            pagina = os.path.join(rad, fisier_pagina)
            radacini = [pagina]
            drum = rad
            while True:
                candidat = os.path.join(drum, fisier_layout)
                if os.path.isfile(candidat):
                    radacini.append(candidat)
                if os.path.normpath(drum) == os.path.normpath(dosar_app):
                    break
                drum = os.path.dirname(drum)
            rezultat.append((os.path.relpath(pagina, radacina).replace(os.sep, '/'), radacini))
    return sorted(rezultat)


class Preconditie(Exception):
    """Arborele nu indeplineste conditia fara de care masuratoarea nu inseamna nimic (cod 3)."""


def masoara_arbore(radacina):
    """Toate constatarile pe un arbore REAL de pe disc, plus cifrele pentru randul MASURAT.

    Aceeasi functie masoara arborele proiectului SI arborele fabricat de `controale()` in
    `tempfile.mkdtemp()`. De aia e parametrizata pe radacina: fara asta puntea catre disc
    (`rezolva_real`, `citeste_real`, `pagini_reale`) n-ar fi atinsa de niciun martor, iar un
    `rezolva_real` intors la `None` ar sterge tacut toata clasa ID-04 cu poarta iesind 0.
    """
    manifest = os.path.join(radacina, 'src', 'content', 'rute.ts')
    dosar_app = os.path.join(radacina, 'src', 'app')
    dosar_registru = os.path.join(radacina, 'src', 'content', 'afirmatii')

    if not os.path.isfile(manifest):
        raise Preconditie('lipseste src/content/rute.ts')
    if not os.path.isdir(dosar_app):
        raise Preconditie('lipseste src/app')

    text_manifest = io.open(manifest, encoding='utf-8').read()
    ancore = ancore_din_manifest(text_manifest)
    cai_pe_editie = {}
    dosar_continut = os.path.dirname(manifest)
    for nume in sorted(os.listdir(dosar_continut)):
        editie = editia_manifestului(nume)
        if editie is None:
            continue
        text = io.open(os.path.join(dosar_continut, nume), encoding='utf-8').read()
        cai_pe_editie.setdefault(editie, []).extend(cai_din_manifest(text))
    cai = [c for lista in cai_pe_editie.values() for c in lista]
    if not cai_pe_editie.get('ro-RO'):
        raise Preconditie('zero cai citite din rute.ts')

    gasiri = []
    for editie in sorted(cai_pe_editie):
        unde = 'RUTE' if editie == 'ro-RO' else 'manifestul editiei ' + editie
        for cale, cate in duplicate_exacte(cai_pe_editie[editie]):
            gasiri.append(('ID-01', 'calea `' + cale + '` apare de ' + str(cate) + ' ori in ' + unde + ': '
                                    'doua felii au ales aceeasi adresa, si git n-are cum s-o vada'))
        for _, lista in coliziuni_de_registru(cai_pe_editie[editie]):
            gasiri.append(('ID-02', 'caile ' + ', '.join('`' + c + '`' for c in lista) + ' (' + unde + ') difera '
                                    'doar prin litere mari/mici: URI-uri diferite (RFC 3986), dar un singur '
                                    'director in src/app pe Windows si pe macOS'))
    for ancora, cate in duplicate_exacte(ancore):
        gasiri.append(('ID-03', 'ancora `#' + ancora + '` apare de ' + str(cate) +
                       ' ori in SECTIUNI_ACASA: subsolul ar scrie doua randuri catre acelasi loc'))

    pagini = pagini_reale(dosar_app, radacina)
    if not pagini:
        raise Preconditie('zero pagini gasite in src/app')
    total_id = 0
    for ruta, radacini in pagini:
        fisiere = inchidere_pagina(radacini, lambda spec: rezolva_real(spec, radacina),
                                   citeste_real)
        aparitii = []
        for f in fisiere:
            text = citeste_real(f)
            if text is None:
                continue
            rel = os.path.relpath(f, radacina).replace(os.sep, '/')
            for ident in id_uri_din_sursa(text):
                aparitii.append((ident, rel))
        total_id += len(aparitii)
        for ident, unde in duplicate_de_id(aparitii):
            gasiri.append(('ID-04', 'pagina `' + ruta + '`: id-ul `' + ident + '` apare de ' +
                           str(len(unde)) + ' ori in pagina randata (' + ', '.join(unde) + ')'))

    registre = []
    if os.path.isdir(dosar_registru):
        registre = [os.path.splitext(os.path.basename(p))[0]
                    for p in sorted(glob.glob(os.path.join(dosar_registru, '*.json')))]
        for _, lista in coliziuni_de_registru(registre):
            gasiri.append(('ID-05', 'registrele ' + ', '.join('`' + n + '.json`' for n in lista) +
                           ' difera doar prin registru: poarta-evidenta genereaza din amandoua '
                           'acelasi docs/afirmatii/<nume>.md si al doilea il suprascrie tacut'))

    cifre = {'cai': len(cai), 'ancore': len(ancore), 'pagini': len(pagini),
             'id_uri': total_id, 'registre': len(registre)}
    return gasiri, cifre


def main():
    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    try:
        gasiri, cifre = masoara_arbore(RADACINA)
    except Preconditie as e:
        print('poarta-identificatori: ' + str(e) + ' - NEMASURAT, nu curat', file=sys.stderr)
        return 3

    for cod, mesaj in sorted(gasiri):
        print('OPRESTE  ' + cod + '  ' + mesaj)

    print('CONTROALE: martori ID-01 (+ancora RFC 3986), ID-02, ID-03, ID-04, extragere, plus '
          'martorul CAP LA CAP pe arbore fabricat in temp (rezolva_real, citeste_real, '
          'pagini_reale) - toti OK')
    print('MASURAT: ' + str(cifre['cai']) + ' cai, ' + str(cifre['ancore']) + ' ancore, ' +
          str(cifre['pagini']) + ' pagini randate cu ' + str(cifre['id_uri']) +
          ' id-uri literale, ' + str(cifre['registre']) + ' registre')
    print('COLIZIUNI: ' + str(len(gasiri)))
    print('REZIDUURI: id-uri dinamice `id={...}` neevaluate (4 componente) · component cu id '
          'literal randat de doua ori numarat o data · id-urile din registre le acopera '
          'poarta-evidenta pe lista concatenata · chei i18n inexistente azi')
    return 1 if gasiri else 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Fiecare ruta cu pagina de continut are afirmatii inregistrate. Corespondenta nu mai e disciplina.

DE CE EXISTA. Registrul din `src/content/afirmatii/` e mecanismul prin care textul de pe site
ajunge in fata clientului ca lista inchisa de confirmat. `poarta-evidenta.py` verifica registrul
pe DINAUNTRU - campuri, stari, sursa la confirmare - si genereaza listele. Nimic nu verifica
DINAFARA: o ruta noua, cu pagina scrisa, publicata si indexata, fara nicio afirmatie in registru
trece toate portile. Asa se pierde exact lucrul pentru care exista registrul: la runda de
confirmare cu clientul, paginile care lipsesc din liste nu se vad ca lipsa, se vad ca nimic.
Masurat la citirea harness-ului Serenity (2026-09-06): "Nimic nu leaga o ruta noua din `RUTE` de
obligatia unui fisier in `src/content/afirmatii/` - corespondenta e tinuta de disciplina."

CE PRINDE
  RR-01  ruta din `RUTE` cu `page.tsx` pe disc, dar fara nicio afirmatie inregistrata, si
         nedeclarata in lista de exceptii
  RR-02  exceptie declarata degeaba: ruta e de fapt acoperita. Fara clauza asta lista de
         exceptii putrezeste - o scutire ramasa in urma taie tacut tocmai verificarea pentru
         care a fost scrisa exceptia. O exceptie inutila e o poarta oarba, nu o poarta blanda.
  RR-03  camp `unde` care nu se rezolva pe disc: afirmatia trimite la un fisier sters sau
         redenumit, deci lista din `docs/afirmatii/` arata clientului o coloana "Unde" moarta
  RR-04  exceptie declarata pentru o ruta care nu mai e in `RUTE`

CUM DECIDE, si de ce asa. O ruta e ACOPERITA daca cel putin o intrare din registru are, in
campul `unde`, ori chiar fisierul `page.tsx` al rutei, ori un modul de continut `@/content/...`
pe care pagina il importa DIRECT. Amandoua formele apar in registru azi, masurate: intrari
care numesc `src/app/contact/page.tsx` si intrari care numesc `src/content/segmente.ts`.

Componentele importate (`@/components/...`) NU conteaza ca sursa de acoperire, desi apar in
`unde`. Motivul e mecanic: `Subsol.tsx` sta in layout si e importat de fiecare pagina, deci o
singura afirmatie care il numeste ar declara acoperit tot site-ul. Un criteriu care e satisfacut
de orice nu masoara nimic. Nici importurile tranzitive nu conteaza, din aceeasi cauza.

Exceptiile se scriu in `EXCEPTII`, in poarta, cu motiv, si sunt EXPLICITE prin constructie: o
ruta fara afirmatii nu poate trece tacut. Azi lista e GOALA, si asta e o masuratoare, nu o
omisiune - toate cele 22 de rute din `RUTE` sunt acoperite, inclusiv `/harta-site` (doua intrari
in `termene-pagina.json`) si cele trei juridice (prin `src/content/juridic.ts`). O exceptie
scrisa "preventiv" ar fi picat imediat pe RR-02.

PE EDITIE (fundatia editiilor, `src/lib/editii.ts`). Rutele se citesc din toate manifestele
(`rute.ts` pentru ro-RO, `rute-en*.ts` pentru en, `rute-ro-md.ts` pentru ro-MD), iar pagina unei rute
e fisierul editiei ei: `page.tsx` direct sub `src/app/<cale>` pentru ro-RO (ca inainte), `page.en.tsx`
sub grupul `(en)` si `page.romd.tsx` sub `(romd)`, gasite trecand prin grupurile de rute. Criteriul de
acoperire e acelasi: fisierul paginii sau un modul `@/content/...` importat DIRECT de ea.

CE NU VERIFICA (reziduuri - un zero de aici nu inseamna acoperire)
  - CATE afirmatii are o pagina: una singura satisface poarta. O pagina cu treizeci de fraze
    verificabile si o intrare in registru trece.
  - Daca afirmatiile inregistrate corespund TEXTULUI de pe pagina. Registrul e scris de om;
    poarta verifica legatura ruta-registru, nu fidelitatea.
  - O pagina care importa un modul de continut deja acoperit de alta felie (de exemplu o pagina
    noua de segment care importa `src/content/segmente.ts`) trece FARA afirmatii proprii. Asta
    e deliberat - textul chiar sta in modulul acela - dar inseamna ca poarta pazeste modulele de
    continut, nu paginile. O felie care scrie text NOU intr-un modul deja acoperit nu e prinsa.
  - Rutele fara `page.tsx` nu se raporteaza aici: e treaba lui `poarta-rute.py` (RU-02), si doua
    porti care raporteaza acelasi defect il fac de doua ori de reparat.
  - Structura registrului (campuri, stari, sursa, id-uri duplicate) e a lui `poarta-evidenta.py`.

LA ROSU: CE AI VOIE SA EDITEZI
  - RR-01: fisierul TAU din `src/content/afirmatii/` - adaugi acolo afirmatiile paginii tale,
    cu `unde` care numeste fisierul real. Nu adaugi intrari in registrul altei felii.
  - RR-03: campul `unde` al intrarii, in registrul feliei care o detine. Daca fisierul a fost
    sters, intrarea se retrage (`stare: "retras"`) sau se re-tinteste, nu se sterge liniste.
  - `EXCEPTII`: se adauga DOAR cu motiv scris si doar de dispecer, la reconciliere. O exceptie
    e o decizie despre tot site-ul, nu despre o felie.
  - NU ai voie: criteriul de acoperire, martorii, corpul portii. La rosu se justifica, nu se
    slabeste.

IESIRE: 0 curat - 1 rute fara afirmatii sau `unde` mort - 2 folosire gresita - 3 control picat
"""
import glob
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

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MANIFEST = os.path.join(RADACINA, 'src', 'content', 'rute.ts')
DOSAR_APP = os.path.join(RADACINA, 'src', 'app')
DOSAR_REGISTRU = os.path.join(RADACINA, 'src', 'content', 'afirmatii')

TIPAR_CALE = re.compile(r'\bcale:\s*"([^"]+)"')
TIPAR_IMPORT_CONTINUT = re.compile(r'from\s+"(@/content/[^"]+)"')

# Fisierul de pagina al editiilor din afara site-ului romanesc (catalogul din `src/lib/editii.ts`).
PAGINA_EDITIE = {'en': 'page.en.tsx', 'ro-MD': 'page.romd.tsx'}

# Rute fara afirmatii, declarate cu motiv. Goala azi, si asta e masurat: toate rutele din RUTE
# sunt acoperite. O intrare pusa aici pentru o ruta acoperita pica pe RR-02, deliberat.
EXCEPTII = {
    # '/exemplu': 'motivul, in cuvinte, si cine a decis',
}


# --- functii pure ------------------------------------------------------------------------------

def cai_din_manifest(text):
    return TIPAR_CALE.findall(text)


def module_de_continut(text):
    """Modulele `@/content/...` importate DIRECT de o pagina, ca specificatori."""
    return TIPAR_IMPORT_CONTINUT.findall(text)


def surse_din_unde(unde):
    """Campul `unde` e o lista de fisiere separate prin virgula. Intoarce caile, curatate."""
    return [p.strip().replace('\\', '/') for p in (unde or '').split(',') if p.strip()]


def surse_moarte(surse, exista):
    """Caile din `unde` care nu se rezolva. `exista(cale) -> bool` se injecteaza, ca sa poata fi
    incercata si pe un arbore inchipuit, nu doar pe disc."""
    return [s for s in surse if not exista(s)]


def acoperire(pagini, surse_pagina, surse_registru, exceptii):
    """Constatarile RR-01, RR-02 si RR-04.

    pagini         - {ruta: cale page.tsx}, doar rutele care AU pagina pe disc
    surse_pagina   - {ruta: set de cai care ar acoperi ruta} (pagina plus modulele ei de continut)
    surse_registru - set de cai numite in campurile `unde`
    exceptii       - {ruta: motiv}
    """
    gasiri = []
    for ruta in sorted(pagini):
        acoperita = bool(surse_pagina.get(ruta, set()) & surse_registru)
        if ruta in exceptii:
            if acoperita:
                gasiri.append(('RR-02', 'ruta `' + ruta + '` e declarata exceptie ("' +
                               exceptii[ruta] + '") dar ARE afirmatii inregistrate: exceptia '
                               'nu mai are obiect si tine poarta oarba pe ruta asta'))
        elif not acoperita:
            gasiri.append(('RR-01', 'ruta `' + ruta + '` are pagina dar nicio afirmatie in '
                           'src/content/afirmatii/: la runda de confirmare cu clientul pagina '
                           'nu apare ca lipsa, ci deloc. Cai care ar fi acoperit-o: ' +
                           ', '.join('`' + c + '`' for c in sorted(surse_pagina.get(ruta, set())))))
    for ruta in sorted(exceptii):
        if ruta not in pagini:
            gasiri.append(('RR-04', 'exceptia pentru `' + ruta + '` e scrisa pentru o ruta care '
                           'nu are pagina in RUTE: se sterge, altfel ramane o scutire care asteapta '
                           'sa prinda din nou ceva ce nimeni n-a mai revizuit'))
    return gasiri


def editia_manifestului(nume):
    """Editia unui fisier `src/content/rute*.ts` dupa nume, sau None (acelasi criteriu ca poarta-rute)."""
    if nume == 'rute.ts':
        return 'ro-RO'
    if nume == 'rute-en.ts' or (nume.startswith('rute-en-') and nume.endswith('.ts')):
        return 'en'
    if nume == 'rute-ro-md.ts':
        return 'ro-MD'
    return None


def rute_pe_editie(dosar_continut):
    """[(ruta, editie)] din toate manifestele, in ordinea fisierelor si a intrarilor."""
    rute = []
    for nume in sorted(os.listdir(dosar_continut)):
        editie = editia_manifestului(nume)
        if editie is None:
            continue
        text = io.open(os.path.join(dosar_continut, nume), encoding='utf-8').read()
        rute.extend((cale, editie) for cale in cai_din_manifest(text))
    return rute


def pagini_editiilor(dosar_app, radacina):
    """{(ruta, editie): cale relativa a paginii} pentru `page.en.tsx` / `page.romd.tsx`, prin grupuri.
    Segmentele dinamice se sar (n-au o cale fixa in manifest), la fel ca in poarta-rute."""
    gasite = {}
    for rad, directoare, nume in os.walk(dosar_app):
        directoare[:] = [d for d in directoare if d not in ('node_modules', '__pycache__')]
        for editie, fisier in PAGINA_EDITIE.items():
            if fisier not in nume:
                continue
            rel = os.path.relpath(rad, dosar_app).replace(os.sep, '/')
            segmente = [] if rel == '.' else [s for s in rel.split('/') if not (s.startswith('(') and s.endswith(')'))]
            if any(s.startswith('[') for s in segmente):
                continue
            ruta = '/' + '/'.join(segmente) if segmente else '/'
            gasite[(ruta, editie)] = os.path.relpath(os.path.join(rad, fisier), radacina).replace(os.sep, '/')
    return gasite


def cale_pagina(ruta):
    """Ruta -> calea relativa a lui `page.tsx`, in forma cu bare normale."""
    segment = '' if ruta == '/' else ruta.strip('/')
    bucati = segment.split('/') if segment else []
    return '/'.join(['src', 'app'] + bucati + ['page.tsx'])


# --- controale ---------------------------------------------------------------------------------

def controale():
    """Martori pe fixturi asamblate aici.

    Ancora externa: intrarea de proba de mai jos e copiata verbatim din contractul PUBLICAT al
    registrului, docstring-ul lui `.claude/scripts/porti/poarta-evidenta.py` - id
    `depozit-golesti`, `unde` = `src/app/page.tsx`, `stare` = `neconfirmat`. Asteptarea (ruta `/`
    iese ACOPERITA) vine din forma aia, scrisa in alt fisier, nu din codul de fata.
    """
    if cale_pagina('/') != 'src/app/page.tsx':
        return 'martorul de cale: ruta `/` nu s-a tradus in src/app/page.tsx'
    if cale_pagina('/solutii/notari') != 'src/app/solutii/notari/page.tsx':
        return 'martorul de cale: ruta cu doua segmente s-a tradus gresit'

    intrare_publicata = {'id': 'depozit-golesti',
                         'text': 'Depozitul este la Golesti, langa Pitesti',
                         'unde': 'src/app/page.tsx',
                         'stare': 'neconfirmat'}
    surse = set(surse_din_unde(intrare_publicata['unde']))
    pagini = {'/': 'src/app/page.tsx', '/nou': 'src/app/nou/page.tsx'}
    surse_pagina = {'/': {'src/app/page.tsx'}, '/nou': {'src/app/nou/page.tsx'}}

    gasiri = acoperire(pagini, surse_pagina, surse, {})
    coduri = [c for c, _ in gasiri]
    if coduri != ['RR-01']:
        return ('ancora externa: cu intrarea publicata in docstring-ul lui poarta-evidenta, ruta '
                '`/` trebuie sa iasa ACOPERITA si `/nou` neacoperita; am primit ' + repr(gasiri))
    if '/nou' not in gasiri[0][1]:
        return 'martor pozitiv RR-01: constatarea nu numeste ruta neacoperita'

    # martor negativ: cand ambele rute au afirmatii, poarta tace
    if acoperire(pagini, surse_pagina, {'src/app/page.tsx', 'src/app/nou/page.tsx'}, {}):
        return 'martor negativ: doua rute acoperite au produs constatari'

    # acoperire prin modulul de continut, nu prin pagina
    surse_pagina_modul = {'/solutii/notari': {'src/app/solutii/notari/page.tsx',
                                              'src/content/segmente.ts'}}
    if acoperire({'/solutii/notari': 'src/app/solutii/notari/page.tsx'}, surse_pagina_modul,
                 {'src/content/segmente.ts'}, {}):
        return ('martor negativ: o ruta acoperita prin modulul de continut pe care il importa a '
                'fost raportata neacoperita')
    # ...si NU prin orice modul: un modul pe care pagina nu-l importa nu acopera nimic
    if not acoperire({'/solutii/notari': 'src/app/solutii/notari/page.tsx'}, surse_pagina_modul,
                     {'src/content/juridic.ts'}, {}):
        return ('martor pozitiv: o afirmatie despre alt modul de continut nu are voie sa acopere '
                'ruta asta')

    # exceptiile
    if acoperire({'/gol': 'src/app/gol/page.tsx'}, {'/gol': {'src/app/gol/page.tsx'}},
                 set(), {'/gol': 'motiv'}):
        return 'martor negativ: o exceptie declarata pentru o ruta chiar neacoperita a fost raportata'
    inutila = acoperire(pagini, surse_pagina, {'src/app/page.tsx', 'src/app/nou/page.tsx'},
                        {'/nou': 'motiv vechi'})
    if not any(c == 'RR-02' for c, _ in inutila):
        return ('martor pozitiv RR-02: o exceptie ramasa peste o ruta acoperita nu a fost prinsa, '
                'deci lista de exceptii poate putrezi nevazuta')
    fantoma = acoperire(pagini, surse_pagina, {'src/app/page.tsx', 'src/app/nou/page.tsx'},
                        {'/stearsa': 'motiv'})
    if not any(c == 'RR-04' for c, _ in fantoma):
        return 'martor pozitiv RR-04: o exceptie pentru o ruta inexistenta nu a fost prinsa'

    # RR-03: `unde` care nu se rezolva
    moarte = surse_moarte(['src/app/page.tsx', 'src/components/Sters.tsx'],
                          lambda s: s == 'src/app/page.tsx')
    if moarte != ['src/components/Sters.tsx']:
        return ('martor pozitiv RR-03: un `unde` catre un fisier inexistent nu a fost prins '
                '(am primit ' + repr(moarte) + ')')
    if surse_moarte(['src/app/page.tsx', 'src/content/segmente.ts'], lambda s: True):
        return 'martor negativ RR-03: doua cai care exista au fost raportate moarte'

    # extragerea
    if surse_din_unde('src/app/despre/page.tsx, src/content/despre.ts') != \
            ['src/app/despre/page.tsx', 'src/content/despre.ts']:
        return 'martorul de extragere: campul `unde` cu doua fisiere citit gresit'
    if surse_din_unde('') != [] or surse_din_unde(None) != []:
        return 'martorul de extragere: `unde` gol trebuie sa dea zero cai, nu una goala'
    fals = 'export const RUTE = [\n  { cale: "/" },\n  { cale: "/contact" },\n];\n'
    if cai_din_manifest(fals) != ['/', '/contact']:
        return 'martorul de extragere: caile citite gresit din manifestul de proba'
    sursa_fals = ('import A from "@/components/AntetPagina";\n'
                  'import { X } from "@/content/segmente";\n')
    if module_de_continut(sursa_fals) != ['@/content/segmente']:
        return ('martorul de extragere: modulele de continut citite gresit, sau un component a '
                'fost luat drept modul de continut')
    return martor_editii()


def pagini_si_surse(rute_editii, radacina):
    """({ruta: pagina}, {ruta: caile care o acopera}) pentru rutele care AU pagina pe disc.

    Cheia e ruta; pe alta editie decat ro-RO poarta si editia, ca `/contact` pe ro-RO si `/contact`
    pe en sa fie doua pagini, nu una. Lipsa paginii e defectul lui poarta-rute, nu al acesteia.
    """
    pagini_cu_sufix = pagini_editiilor(os.path.join(radacina, 'src', 'app'), radacina)
    pagini = {}
    surse_pagina = {}
    for ruta_simpla, editie in rute_editii:
        ruta = ruta_simpla if editie == 'ro-RO' else ruta_simpla + ' (' + editie + ')'
        rel = cale_pagina(ruta_simpla) if editie == 'ro-RO' else pagini_cu_sufix.get((ruta_simpla, editie))
        if rel is None:
            continue
        absolut = os.path.join(radacina, rel.replace('/', os.sep))
        if not os.path.isfile(absolut):
            continue
        pagini[ruta] = rel
        acceptate = {rel}
        text = io.open(absolut, encoding='utf-8', errors='replace').read()
        for spec in module_de_continut(text):
            for ext in ('.ts', '.tsx'):
                candidat = 'src/' + spec[2:] + ext
                if os.path.isfile(os.path.join(radacina, candidat.replace('/', os.sep))):
                    acceptate.add(candidat)
        surse_pagina[ruta] = acceptate
    return pagini, surse_pagina


def martor_editii():
    """Martor pe un arbore scris in temp, prin aceleasi functii ca arborele real (`rute_pe_editie`,
    `pagini_editiilor`): ruta en din `rute-en-*.ts` trebuie sa-si gaseasca `page.en.tsx` de sub `(en)`,
    iar un `page.tsx` simplu pus acolo NU e pagina editiei. Fara martor, o editie necitita ar face toate
    rutele EN sa lipseasca din masuratoare, cu poarta iesind 0."""
    lucru = tempfile.mkdtemp(prefix='poarta-registru-rute-')

    def scrie(rel, continut):
        cale = os.path.join(lucru, *rel.split('/'))
        if not os.path.isdir(os.path.dirname(cale)):
            os.makedirs(os.path.dirname(cale))
        io.open(cale, 'w', encoding='utf-8', newline='\n').write(continut)

    try:
        scrie('src/content/rute.ts', 'const RUTE_RO_RO = [\n  { cale: "/" },\n];\n')
        scrie('src/content/rute-en-proba.ts', 'export const R = [\n  { cale: "/pricing" },\n];\n')
        scrie('src/content/rute-ro-md.ts', 'export const R = [\n  { cale: "/ro" },\n];\n')
        scrie('src/app/(en)/simplu/page.tsx', 'x')
        scrie('src/app/(romd)/ro/page.romd.tsx', 'x')
        scrie('src/app/page.tsx', 'x')
        scrie('src/app/(en)/pricing/date.ts', 'x')
        scrie('src/content/en/pricing.ts', 'x')
        scrie('src/app/(en)/pricing/page.en.tsx', 'import { P } from "@/content/en/pricing";\n')
        rute = rute_pe_editie(os.path.join(lucru, 'src', 'content'))
        if sorted(rute) != [('/', 'ro-RO'), ('/pricing', 'en'), ('/ro', 'ro-MD')]:
            return 'martorul editiilor: rutele pe editie citite gresit (' + repr(rute) + ')'
        pagini = pagini_editiilor(os.path.join(lucru, 'src', 'app'), lucru)
        asteptat = {('/pricing', 'en'): 'src/app/(en)/pricing/page.en.tsx',
                    ('/ro', 'ro-MD'): 'src/app/(romd)/ro/page.romd.tsx'}
        if pagini != asteptat:
            return 'martorul editiilor: paginile cu sufix citite gresit (' + repr(pagini) + ')'
        legate, surse = pagini_si_surse(rute, lucru)
        if legate != {'/': 'src/app/page.tsx', '/pricing (en)': 'src/app/(en)/pricing/page.en.tsx',
                      '/ro (ro-MD)': 'src/app/(romd)/ro/page.romd.tsx'}:
            return 'martorul editiilor: rutele legate gresit de paginile lor (' + repr(legate) + ')'
        if surse.get('/pricing (en)') != {'src/app/(en)/pricing/page.en.tsx', 'src/content/en/pricing.ts'}:
            return ('martorul editiilor: modulul de continut importat de page.en.tsx nu acopera ruta (' +
                    repr(surse.get('/pricing (en)')) + ')')
    finally:
        shutil.rmtree(lucru, ignore_errors=True)
    return None


# --- masuratoarea --------------------------------------------------------------------------------

def exista_in_arbore(cale):
    return os.path.exists(os.path.join(RADACINA, cale.replace('/', os.sep)))


def controale_disc():
    """Controale pe DISCUL REAL, pe puntea `exista_in_arbore` - nu pe detectoare cu `exista` injectat.

    De ce separat de `controale()`. Martorii de acolo dau lui `surse_moarte` un `exista` INJECTAT,
    deci detectorul e probat pana la capat, iar functia care il leaga de disc nu e atinsa deloc.
    Masurat de un critic pe 2026-09-06: `def exista_in_arbore(cale): return True` sterge complet
    clasa RR-03 pe arborele real - adica singura constatare a portii azi - si poarta trece din 1
    in 0, tiparind linistit `martori RR-01/RR-02/RR-03/RR-04 OK`.

    Control POZITIV: `src/content/rute.ts`. Nu e o constanta plauzibila aleasa de mana - e chiar
    fisierul fara de care poarta iese NEMASURAT cateva randuri mai sus, deci prezenta lui e deja
    preconditie masurata, iar controlul asta ruleaza DUPA ea.
    Control NEGATIV: un nume generat la RULARE cu `os.urandom`. Un nume fix scris in cod devine
    intr-o zi un fisier real si controlul se dezarmeaza singur, tacut.
    """
    if not exista_in_arbore('src/content/rute.ts'):
        return ('control pozitiv pe disc: `exista_in_arbore` nu vede src/content/rute.ts, desi '
                'poarta tocmai l-a citit - puntea catre disc raspunde NU la orice')
    inexistent = 'src/content/nu-exista-' + os.urandom(8).hex() + '.json'
    if exista_in_arbore(inexistent):
        return ('control negativ pe disc: `exista_in_arbore` a raportat existent un nume generat '
                'la rulare (' + inexistent + ') - puntea catre disc raspunde DA la orice, deci '
                'clasa RR-03 e stearsa fara ca vreun martor sa se supere')
    return None


def main():
    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    if not os.path.isfile(MANIFEST):
        print('poarta-registru-rute: lipseste src/content/rute.ts - NEMASURAT', file=sys.stderr)
        return 3
    if not os.path.isdir(DOSAR_REGISTRU):
        print('poarta-registru-rute: lipseste src/content/afirmatii/ - NEMASURAT', file=sys.stderr)
        return 3

    motiv = controale_disc()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    rute_editii = rute_pe_editie(os.path.dirname(MANIFEST))
    rute = [c for c, e in rute_editii]
    if not [c for c, e in rute_editii if e == 'ro-RO']:
        print('poarta-registru-rute: zero rute citite din rute.ts - NEMASURAT', file=sys.stderr)
        return 3
    pagini, surse_pagina = pagini_si_surse(rute_editii, RADACINA)

    if not pagini:
        print('poarta-registru-rute: nicio ruta din RUTE nu are pagina pe disc - NEMASURAT',
              file=sys.stderr)
        return 3

    cai_registru = sorted(glob.glob(os.path.join(DOSAR_REGISTRU, '*.json')))
    if not cai_registru:
        print('poarta-registru-rute: registrul e gol - NEMASURAT, nu curat', file=sys.stderr)
        return 3

    surse_registru = set()
    gasiri = []
    intrari = 0
    for cale in cai_registru:
        rel_registru = os.path.relpath(cale, RADACINA).replace(os.sep, '/')
        try:
            bucata = json.load(io.open(cale, encoding='utf-8'))
        except ValueError as e:
            print('poarta-registru-rute: ' + rel_registru + ' nu e JSON valid: ' + str(e),
                  file=sys.stderr)
            return 3
        if not isinstance(bucata, list):
            print('poarta-registru-rute: ' + rel_registru + ' nu e o lista - NEMASURAT',
                  file=sys.stderr)
            return 3
        for intrare in bucata:
            if not isinstance(intrare, dict):
                continue
            intrari += 1
            eticheta = intrare.get('id') or '(fara id)'
            numite = surse_din_unde(intrare.get('unde'))
            surse_registru.update(numite)
            for sursa in surse_moarte(numite, exista_in_arbore):
                gasiri.append(('RR-03', rel_registru + ' · `' + eticheta + '`: campul `unde` '
                               'trimite la `' + sursa + '`, care nu exista pe disc - coloana '
                               '"Unde" din lista pusa in fata clientului e moarta'))

    gasiri.extend(acoperire(pagini, surse_pagina, surse_registru, EXCEPTII))

    for cod, mesaj in sorted(gasiri):
        print('OPRESTE  ' + cod + '  ' + mesaj)

    print('CONTROALE: ancora externa (intrarea publicata in docstring-ul lui poarta-evidenta) OK, '
          'martori RR-01/RR-02/RR-03/RR-04 OK, martori negativi OK, extragere OK, punte pe disc '
          '(`exista_in_arbore` pozitiv pe rute.ts, negativ pe un nume generat la rulare) OK')
    print('MASURAT: ' + str(len(rute)) + ' rute in manifeste (toate editiile), ' + str(len(pagini)) +
          ' cu pagina pe disc, ' + str(len(cai_registru)) + ' registre cu ' + str(intrari) +
          ' afirmatii care numesc ' + str(len(surse_registru)) + ' fisiere-sursa, ' +
          str(len(EXCEPTII)) + ' exceptii declarate')
    print('PROBLEME: ' + str(len(gasiri)))
    print('REZIDUURI: nu numara CATE afirmatii are o pagina (una ajunge) · nu compara afirmatiile '
          'cu textul paginii · o pagina care importa un modul de continut deja acoperit trece '
          'fara afirmatii proprii · rutele fara page.tsx le raporteaza poarta-rute (RU-02) · '
          'structura registrului o verifica poarta-evidenta')
    return 1 if gasiri else 0


if __name__ == '__main__':
    sys.exit(main())

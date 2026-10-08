#!/usr/bin/env python3
"""Partea B a contractului: fiecare poarta Python rulata ca PROCES, pe arbore fabricat.

DE CE EXISTA, si e o lipsa masurata, nu o preferinta. Martorii de azi traiesc INAUNTRUL
portilor, in `controale()`, si cheama functia interna (`probleme()`, `analizeaza()`,
`compara()`). Adica proba si lucrul probat sunt acelasi proces, acelasi interpretor,
aceleasi variabile de modul. Ce ramane nemasurat e exact stratul care se strica in
practica: argumentele din linia de comanda, citirea de pe disc, si CODUL DE IESIRE -
singurul lucru pe care `poarta.sh` il vede si il scrie in verdict. O poarta care gaseste
defectul, il tipareste frumos si iese 0 trece prin toti martorii ei interni.

Partea A (ce intoarce logica pura) o tin `controale()` din fiecare poarta. Partea B e aici.

ANCORA EXTERNA. Codurile de iesire nu sunt scrise de mana in fisierul asta. Se citesc din
`browser-rulator.mjs`, alt fisier si alta limba, unde contractul casei e publicat pentru
portile de browser. Daca cineva schimba intelesul lui 3 in Python, asteptarea de aici NU
il urmeaza tacut - vine dintr-o sursa pe care codul probat nu o poate atinge. Daca linia
nu se mai poate citi, proba iese NEMASURAT, nu verde.

CUSATURA pentru arborii fabricati. Portile care au `--radacina` se cheama cu el, direct pe
fisierul real. Cele care nu au isi deduc radacina din propria cale (patru directoare mai
sus), deci se COPIAZA in `<temp>/.claude/scripts/porti/` si se ruleaza copia: asa radacina
lor devine arborele fabricat, fara sa le fie schimbat codul. Ce accepta fiecare nu e scris
aici, se citeste din sursa portii la fiecare rulare.

REZIDUURI DECLARATE, ca un zero sa nu fie citit drept acoperire:
  - `poarta-scurgeri.py` nu are caz de cod 3. Ramura ei "niciun fisier de citit" e
    INACCESIBILA prin constructie: poarta scaneaza tot arborele, iar `.py` e in extensiile
    ei, deci propriul fisier copiat in arbore o face mereu nevida. Nu e o scapare, e o
    proprietate a portii; se noteaza ca sa nu fie luata drept caz uitat.
  - `poarta-tipografie.py` are aceeasi proprietate de cand portile intra in scanare. Codul 3
    al ei se probeaza pe cealalta cale reala: detectorul pe care il invaluie iese 3 cand
    controlul lui interior pica, si poarta trebuie sa transmita codul, nu sa-l inghita.
  - Nu se probeaza CONTINUTUL verdictelor, doar codul si textul care numeste defectul.
  - Arborii fabricati sunt minimali: un caz verde de aici nu spune ca poarta e verde pe
    depozitul real, spune ca poarta stie sa iasa 0 cand nu are ce gasi.

IESIRE: 0 toate cazurile trec, 1 macar unul pica, 3 NEMASURAT (ancora sau preconditie lipsa).
"""
import glob
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
RULATOR = os.path.join(PORTI, 'browser-rulator.mjs')
DETECTOR = os.path.join(PORTI, 'tipografie-liniute.py')

# Variabilele de mediu pe care le citeste o poarta (poarta-juridic: OPERATOR_JSON si SITE_ENV), scoase din mediul
# fiecarui subproces: o variabila ramasa in shell-ul care ruleaza proba ar schimba verdictul cazurilor fabricate
# (masurat 01.10.2026, dupa poarta juridica pe familia md: cu OPERATOR_JSON in mediu proba cadea la 44/31; pe baza,
# 75/0). Martorul lui sta in controale().
SCOASE_DIN_MEDIU = ('OPERATOR_JSON', 'SITE_ENV')


def mediu_curat():
    """Mediul procesului, fara variabilele din SCOASE_DIN_MEDIU: mediul cu care pornesc portile in cazuri."""
    return {k: v for k, v in os.environ.items() if k not in SCOASE_DIN_MEDIU}

T = P = 0

# Ce cod a fost CERUT efectiv, per poarta: {'poarta-x.py': {0, 1, 3}}. Se umple la rulare, din
# `caz()`, si se compara la final cu tabelul CAZURI. `controale()` verifica doar ca fiecare
# poarta de pe disc ARE o intrare in CAZURI - nu si ca intrarea ruleaza ceva. Un corp de functie
# golit tiparea antetul portii si lasa verdictul verde, adica poarta ramanea neatinsa in tacere.
ACOPERIRE = {}

# Portile fara caz de cod 3, cu motivul. Cheia e numele fisierului; valoarea e motivul,
# tiparit in rezumat. O intrare fara motiv nu e permisa: o scutire nemotivata se uita.
FARA_CAZ_DE_TREI = {
    'poarta-scurgeri.py': 'isi scaneaza propriul fisier, deci "zero fisiere" e inaccesibil',
    'poarta-tipografie.py': 'la fel; codul 3 se probeaza prin detectorul invaluit (mutant)',
}


def ok(mesaj):
    global T
    T += 1
    print('  OK    ' + mesaj)


def nu(mesaj):
    global P
    P += 1
    print('  PICAT ' + mesaj)


def nemasurat(mesaj):
    print('NEMASURAT: ' + mesaj, file=sys.stderr)
    sys.exit(3)


def scrie(cale, continut):
    parinte = os.path.dirname(cale)
    if parinte:
        os.makedirs(parinte, exist_ok=True)
    with open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


# ------------------------------------------------------------------ ancora externa

def coduri_din_rulator():
    """Contractul de coduri, citit din `browser-rulator.mjs`.

    Nu se presupune nimic: se cere ca fiecare cod sa fie insotit de cuvantul care ii da
    intelesul. Daca fisierul nu mai poarta linia, nu exista ancora, deci nu exista proba.
    """
    if not os.path.isfile(RULATOR):
        nemasurat('lipseste ' + RULATOR + ' - fara el nu am de unde lua codurile de iesire')
    text = open(RULATOR, encoding='utf-8').read()
    rand = None
    for r in text.split('\n'):
        if 'Iesire:' in r and '=' in r:
            rand = r
            break
    if rand is None:
        nemasurat('nu gasesc randul cu contractul de coduri in browser-rulator.mjs')
    perechi = {}
    for cifra, eticheta in re.findall(r'(\d)\s*=\s*([^·\n]+)', rand):
        perechi[int(cifra)] = eticheta.strip().lower()
    asteptate = {0: 'trece', 1: 'pica', 2: 'folosire gresita', 3: 'nemasurat'}
    for cod, cuvant in asteptate.items():
        if cod not in perechi or cuvant not in perechi[cod]:
            nemasurat('contractul din browser-rulator.mjs nu mai spune ca ' + str(cod)
                      + ' inseamna "' + cuvant + '" (citit: ' + repr(perechi.get(cod)) + ')')
    return perechi


CODURI = coduri_din_rulator()
CURAT, PICAT, NEMASURAT = 0, 1, 3
assert (CURAT, PICAT, NEMASURAT) == tuple(sorted(k for k in CODURI if k != 2))


def cifra_incident_u2500():
    """Cate U+2500 avea fisierul din incidentul #988, citita din antetul detectorului.

    E o cifra dintr-un incident notat, nu una aleasa de mine: reteta veche a raportat 39 de
    liniute lungi pe un fisier care avea ZERO, fiindca numara pe octeti si fisierul avea
    sute de U+2500. Martorul negativ al portii de tipografie foloseste exact cifra aceea.
    """
    if not os.path.isfile(DETECTOR):
        nemasurat('lipseste detectorul de liniute - nu pot lua cifra incidentului')
    text = open(DETECTOR, encoding='utf-8').read()
    m = re.search(r'(\d+)\s+de\s+U\+2500', text)
    if not m:
        nemasurat('antetul detectorului nu mai poarta cifra incidentului cu U+2500')
    return int(m.group(1))


# ------------------------------------------------------------------ rularea portilor

def sursa_portii(nume):
    return open(os.path.join(PORTI, nume), encoding='utf-8').read()


def accepta_radacina(nume):
    """Se citeste din sursa portii, nu dintr-o lista scrisa aici: o lista de nume
    imbatraneste in ziua in care cineva adauga argumentul unei porti."""
    return "add_argument('--radacina'" in sursa_portii(nume)


def dependinte(nume):
    """Fisierele `.py` frate pe care poarta le numeste in sursa ei."""
    text = sursa_portii(nume)
    gasite = []
    for candidat in sorted(os.path.basename(c) for c in glob.glob(os.path.join(PORTI, '*.py'))):
        if candidat != nume and candidat in text:
            gasite.append(candidat)
    return gasite


def aseaza_poarta(nume, radacina, mutatie=None):
    """Copiaza poarta si dependintele ei in arborele fabricat. Intoarce calea copiei.

    `mutatie` = (fisier, ancora, inlocuitor) aplicata pe copie. Se verifica separat ca a
    ATERIZAT: o substitutie care nu se aplica da fals verde, si atunci mutantul nu masoara.
    """
    dosar = os.path.join(radacina, '.claude', 'scripts', 'porti')
    os.makedirs(dosar, exist_ok=True)
    for fisier in [nume] + dependinte(nume):
        tinta = os.path.join(dosar, fisier)
        shutil.copy2(os.path.join(PORTI, fisier), tinta)
        if mutatie and mutatie[0] == fisier:
            _, ancora, inlocuitor = mutatie
            text = open(tinta, encoding='utf-8').read()
            if text.count(ancora) != 1:
                return None
            text = text.replace(ancora, inlocuitor)
            scrie(tinta, text)
            if inlocuitor not in open(tinta, encoding='utf-8').read():
                return None
    return os.path.join(dosar, nume)


def ruleaza(nume, radacina, argumente=(), mutatie=None):
    if accepta_radacina(nume) and mutatie is None:
        comanda = [sys.executable, os.path.join(PORTI, nume), '--radacina', radacina]
    else:
        cale = aseaza_poarta(nume, radacina, mutatie)
        if cale is None:
            return None, 'MUTANT NEATERIZAT: substitutia nu s-a aplicat pe copie'
        comanda = [sys.executable, cale]
    r = subprocess.run(comanda + list(argumente), capture_output=True, text=True,
                       encoding='utf-8', errors='replace', env=mediu_curat())
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def inregistreaza(nume, cod_asteptat):
    """Ce cod cere cazul asta. Se noteaza INAINTE de rulare: un caz care pica e oricum rosu,
    dar el a atins poarta - iar acoperirea masoara atingerea, nu rezultatul."""
    ACOPERIRE.setdefault(nume, set()).add(cod_asteptat)


def caz(nume, eticheta, construieste, cod_asteptat, contine=None, argumente=(), mutatie=None):
    inregistreaza(nume, cod_asteptat)
    d = tempfile.mkdtemp(prefix='proba-proces-')
    try:
        construieste(d)
        cod, iesire = ruleaza(nume, d, argumente, mutatie)
        titlu = nume + ' | ' + eticheta
        if cod is None:
            nu(titlu + ': ' + iesire)
            return None
        if cod != cod_asteptat:
            nu(titlu + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
            return None
        if contine and contine not in iesire:
            nu(titlu + ': iesirea nu numeste defectul ("' + contine + '" lipseste)\n' + iesire.strip())
            return None
        ok(titlu)
        return iesire
    finally:
        shutil.rmtree(d, ignore_errors=True)


# ------------------------------------------------------------------ arbori fabricati

def gol(d):
    return None


def html_juridic(date=None, in_plus=()):
    date = date if date is not None else {
        'denumire': 'Trei S Arhivare SRL',
        'sediu': 'Golesti, judetul Arges',
        'email': 'contact@exemplu-3s.test',
        'telefon': '+40 000 000 000',
        'numar_orc': 'J03/1234/2026',
        'cod_fiscal': 'RO12345678',
    }

    def construieste(d):
        scrie(os.path.join(d, 'src', 'app', 'confidentialitate', 'page.tsx'),
              'export default function P() { return <p>Politica</p> }\n')
        scrie(os.path.join(d, 'src', 'app', 'termeni', 'page.tsx'),
              'export default function P() { return <p>Termeni</p> }\n')
        # Comutatorul operatorului (L-01): un operator numit, ale carui date apar in pagina.
        scrie(os.path.join(d, 'config', 'operator.json'),
              json.dumps({'operator': date}, ensure_ascii=False, indent=2) + '\n')
        corp = ['<html><body>']
        for camp in ('denumire', 'sediu', 'email', 'telefon', 'numar_orc', 'cod_fiscal'):
            corp.append('<p>' + str(date.get(camp, '')) + '</p>')
        corp.append('<form><input name="nume"/>'
                    '<p>Prelucram datele pentru demersuri precontractuale.</p></form>')
        corp.extend(in_plus)
        corp.append('</body></html>')
        scrie(os.path.join(d, '.next', 'server', 'app', 'index.html'), ''.join(corp))
    return construieste


def html_seo(canonical='https://exemplu.test/'):
    def construieste(d):
        bucati = ['<html><head>',
                  '<title>Arhiva care raspunde cu pagina exacta</title>',
                  '<meta name="description" content="Arhivare autorizata, digitalizare si cautare '
                  'care citeaza pagina din care vine raspunsul."/>']
        if canonical is not None:
            bucati.append('<link rel="canonical" href="' + canonical + '"/>')
        # Graful de brand pe care S-09 il cere pe start din felia seo-geo-gdpr (decizia owner-ului
        # din 24.09.2026, plan S4 sectiunea 8.2): Organization si WebSite, fiecare cu @id-ul lui.
        # Pagina ramane "construita corect" numai daca poarta o primeste asa.
        baza = 'https://exemplu.test/'
        bucati.append('<script type="application/ld+json">'
                      + json.dumps({'@context': 'https://schema.org', '@graph': [
                          {'@type': 'Organization', '@id': baza + '#organizatie', 'name': 'Trei S'},
                          {'@type': 'WebSite', '@id': baza + '#site', 'url': baza, 'name': 'Trei S',
                           'publisher': {'@id': baza + '#organizatie'}},
                      ]})
                      + '</script>')
        bucati.append('</head><body><h1>Unu</h1><h2>Doi</h2><h3>Trei</h3></body></html>')
        scrie(os.path.join(d, '.next', 'server', 'app', 'index.html'), ''.join(bucati))
    return construieste


def probe_vitest(fisiere, teste, asertiuni, praguri=None):
    """Arbore cu numar CUNOSCUT de teste. Bucatile se lipesc la rulare: un fisier de proba
    lasat pe disc ar fi numarat de poarta insasi la urmatoarea rulare."""
    it, ex = 'it', 'expect'

    def construieste(d):
        ramase_teste, ramase_expect = teste, asertiuni
        for n in range(fisiere):
            t = ramase_teste if n == fisiere - 1 else min(1, ramase_teste)
            e = ramase_expect if n == fisiere - 1 else min(1, ramase_expect)
            ramase_teste -= t
            ramase_expect -= e
            randuri = ["import { " + ex + ", " + it + " } from 'vitest'"]
            for k in range(t):
                corp = (' ' + ex + '(1).toBe(1);') * (e if k == t - 1 else 0)
                randuri.append(it + "('caz" + str(k) + "', () => {" + corp + " })")
            scrie(os.path.join(d, 'tests', 'f' + str(n) + '.test.ts'), '\n'.join(randuri) + '\n')
        if praguri is not None:
            scrie(os.path.join(d, '.claude', 'scripts', 'porti', 'probe', 'praguri-regresie.json'),
                  json.dumps(praguri, indent=2) + '\n')
    return construieste


def registru(intrari):
    def construieste(d):
        scrie(os.path.join(d, 'src', 'content', 'afirmatii', 'pagina.json'),
              json.dumps(intrari, ensure_ascii=False, indent=2) + '\n')
    return construieste


INTRARE_BUNA = {'id': 'depozit', 'text': 'Depozitul este la Golesti', 'unde': 'src/app/page.tsx',
                'stare': 'neconfirmat', 'sursa': '', 'confirmat_de': '', 'data': ''}
INTRARE_REA = {'id': 'depozit', 'text': 'Depozitul este la Golesti', 'unde': 'src/app/page.tsx',
               'stare': 'confirmat', 'sursa': '', 'confirmat_de': ''}


# ------------------------------------------------------------------ cazurile, per poarta

def cazuri_afirmatii():
    # Tiparul se asambleaza aici, la rulare: scris intreg, fisierul asta ar deveni el insusi
    # o instanta a defectului si ar inrosi poarta pe care o probeaza.
    interzis = ' '.join(['avem', '6', 'ani', 'de', 'experienta', 'in', 'arhivare'])
    caz('poarta-afirmatii.py', 'vechime la persoana intai: cod 1, mesajul o numeste',
        lambda d: scrie(os.path.join(d, 'src', 'app', 'page.tsx'),
                        'export default () => <p>' + interzis + '</p>\n'),
        PICAT, 'persoana intai cu vechime')
    caz('poarta-afirmatii.py', 'forma atribuita catre o entitate numita: cod 0',
        lambda d: scrie(os.path.join(d, 'src', 'app', 'page.tsx'),
                        'export default () => <p>Alfa Exemplu SRL, firma care detine depozitul, '
                        'arhiveaza documente din 2019, la Golesti.</p>\n'),
        CURAT)
    caz('poarta-afirmatii.py', 'arbore fara src si docs: cod 3, nu 0',
        gol, NEMASURAT, 'masuratoarea e invalida')


def cazuri_limba():
    fara_diacritice = 'Va ' + 'raspundem' + ' in ' + 'romana' + ' imediat.'
    caz('poarta-limba.py', 'cuvant fara diacritice: cod 1, mesajul il numeste',
        lambda d: scrie(os.path.join(d, 'src', 'continut', 'nota.md'), fara_diacritice + '\n'),
        PICAT, 'cuvant fara diacritice')
    caz('poarta-limba.py', 'aceeasi propozitie cu diacritice: cod 0',
        lambda d: scrie(os.path.join(d, 'src', 'continut', 'nota.md'),
                        'Vă răspundem în română imediat.\n'),
        CURAT)
    caz('poarta-limba.py', 'arbore fara src: cod 3, nu 0', gol, NEMASURAT, 'masuratoarea e invalida')

    # Punctul 4 (decizia 77): adresarea formala SINGURA in modulele juridice romanesti publice. Martorii pornesc de la o
    # COPIE a modulului real (Politica de confidentialitate, la "tu"), cu o fraza formala plantata la rulare; fraza se
    # lipeste din bucati, ca fisierul asta sa nu poarte formele pe care le vaneaza poarta.
    real = os.path.join(PORTI, '..', '..', '..', 'src', 'content', 'juridic', 'md', 'confidentialitate.ro.ts')
    if not os.path.isfile(real):
        nemasurat('lipseste modulul real ' + real + ' - martorii punctului 4 pornesc de la el')
    modul_real = open(real, encoding='utf-8').read()
    formal = 'Dacă ' + 'dumnea' + 'voastră ne scrieți, ' + 'v' + 'ă răspundem în aceeași zi.'
    plantat = modul_real + chr(10) + 'export const PLANTAT = "' + formal + '";' + chr(10)
    juridic_md = ('src', 'content', 'juridic', 'md')

    def cu_modul(nume, continut):
        return lambda d: scrie(os.path.join(d, *juridic_md, nume), continut)

    caz('poarta-limba.py', 'modulul juridic RO real (copie, la "tu"): cod 0',
        cu_modul('confidentialitate.ro.ts', modul_real), CURAT)
    caz('poarta-limba.py', 'aceeasi copie cu o fraza formala plantata: cod 1, punctul 4 o numeste',
        cu_modul('confidentialitate.ro.ts', plantat), PICAT, 'adresare formala intr-un document juridic romanesc')
    # Fraza SINGURA in modul, fara nicio forma cu "tu": amestecul (punctul 2) nu are ce prinde, deci numai punctul 4 o vede.
    caz('poarta-limba.py', 'modul juridic RO cu numai fraza formala (fara amestec): cod 1, punctul 4 o numeste',
        cu_modul('cookie-uri.ro.ts', 'export const PLANTAT = "' + formal + '";' + chr(10)), PICAT,
        'adresare formala intr-un document juridic romanesc')
    # Modulul DPA primeste numai fraza: copia Politicii ar aduce si formele cu "tu", iar amestecul (punctul 2) ramane
    # masurat si in modulele exceptate.
    caz('poarta-limba.py', 'aceeasi fraza in modulul DPA (exceptia numita, felia 145): cod 0',
        cu_modul('dpa.ro.ts', 'export const PLANTAT = "' + formal + '";' + chr(10)), CURAT)
    caz('poarta-limba.py', 'aceeasi fraza in afara modulelor juridice (numai amestecul se masoara acolo): cod 0',
        lambda d: scrie(os.path.join(d, 'src', 'content', 'ro-md', 'nota.ts'),
                        'export const NOTA = "' + formal + '";' + chr(10)), CURAT)
    # Controlul stricat pe o COPIE a portii: punctul 4 nu mai acuza nimic, deci martorul lui pozitiv pica si poarta iese
    # 3, nu 0 (altfel o dezactivare tacuta ar trece drept "curat").
    caz('poarta-limba.py', 'control picat (punctul 4 dezactivat pe copie): cod 3, nu 0',
        cu_modul('confidentialitate.ro.ts', modul_real), NEMASURAT, 'CONTROL PICAT',
        mutatie=('poarta-limba.py', '        if formal_singur:' + chr(10), '        if False:' + chr(10)))

    # Punctul 4 pe META_DOCUMENTE_MD (runda 2 a feliei 144): meta-descrierile romanesti ale documentelor `md` ajung in
    # <head>. Martorii pornesc de la o COPIE a fisierului real `pagini.ts`; forma formala se planteaza la rulare, in
    # descrierea IA (document public) si in descrierea DPA (exceptia numita), din bucati.
    real_meta = os.path.join(PORTI, '..', '..', '..', 'src', 'content', 'juridic', 'pagini.ts')
    if not os.path.isfile(real_meta):
        nemasurat('lipseste fisierul real ' + real_meta + ' - martorii meta ai punctului 4 pornesc de la el')
    meta_real = open(real_meta, encoding='utf-8').read()
    ancora_ia, ancora_dpa = 'cum vorbești oricând cu un om', 'ca persoană împuternicită de operator'
    if meta_real.count(ancora_ia) != 1 or meta_real.count(ancora_dpa) != 1:
        nemasurat('ancorele martorilor meta nu mai sunt, o data fiecare, in ' + real_meta)
    pronume = 'dumnea' + 'voastră'
    meta_ia = meta_real.replace(ancora_ia, 'cum ' + pronume + ' vorbiți oricând cu un om')
    # Pe DPA se planteaza auxiliarul, nu pronumele: pronumele langa formele cu "tu" din restul fisierului ar fi AMESTEC
    # (punctul 2, masurat pe fisier si in exceptii), deci cazul ar masura alt punct decat exceptia.
    meta_dpa = meta_real.replace(ancora_dpa, ancora_dpa + ', care ' + 'v' + 'ă privesc')
    juridic = ('src', 'content', 'juridic')
    # Runda 3: si `publicare.ts` (DESCRIERE_MD) intra in punctul 4. Copia reala insoteste fiecare caz meta, ca sa
    # masoare numai meta; cazurile descrierilor de mai jos variaza numai ea.
    real_descriere = os.path.join(PORTI, '..', '..', '..', 'src', 'content', 'juridic', 'publicare.ts')
    if not os.path.isfile(real_descriere):
        nemasurat('lipseste fisierul real ' + real_descriere + ' - martorii descrierilor ai punctului 4 pornesc de la el')
    descriere_real = open(real_descriere, encoding='utf-8').read()

    def cu_meta(continut, registru=True, descriere=descriere_real):
        def construieste(d):
            if continut is not None:
                scrie(os.path.join(d, *juridic, 'pagini.ts'), continut)
            if descriere is not None:
                scrie(os.path.join(d, *juridic, 'publicare.ts'), descriere)
            if registru:
                scrie(os.path.join(d, *juridic, 'md', 'registru.ts'), 'export const X = 1;' + chr(10))
        return construieste

    caz('poarta-limba.py', 'pagini.ts real (copie), meta romanesti la "tu": cod 0', cu_meta(meta_real), CURAT,
        'META_DOCUMENTE_MD: 8 intrari ro citite')
    caz('poarta-limba.py', 'aceeasi copie cu o forma formala in meta IA: cod 1, numeste documentul', cu_meta(meta_ia), PICAT,
        'meta-descrierea romaneasca a documentului inteligenta-artificiala')
    caz('poarta-limba.py', 'aceeasi forma in meta DPA (exceptia numita, felia 145): cod 0', cu_meta(meta_dpa), CURAT)
    caz('poarta-limba.py', 'familia md in arbore fara pagini.ts: cod 3, nu 0 (meta nemasurat)', cu_meta(None), NEMASURAT,
        'masuratoarea e invalida')
    caz('poarta-limba.py', 'pagini.ts fara blocul META_DOCUMENTE_MD: cod 3, nu 0',
        cu_meta(meta_real.replace('META_DOCUMENTE_MD', 'META_REDENUMIT')), NEMASURAT, 'masuratoarea e invalida')
    # Controlul stricat pe o COPIE a portii: citirea meta nu mai vede siruri, deci martorul meta din `controale()` pica si
    # poarta iese 3, nu 0, chiar pe copia cu forma formala plantata.
    caz('poarta-limba.py', 'control meta picat (citirea sirurilor dezactivata pe copie): cod 3, nu 0', cu_meta(meta_ia),
        NEMASURAT, 'CONTROL PICAT',
        mutatie=('poarta-limba.py', '        for sir in siruri_din_cod(ro.group(1)):' + chr(10),
                 '        for sir in []:' + chr(10)))

    # Punctul 4 pe DESCRIERE_MD (runda 3 a feliei 144): descrierile romanesti din rute ajung in paleta, in /llms.txt si in
    # pachetul de browser. Copia reala a `publicare.ts`, cu forma formala plantata la rulare in descrierea IA (document
    # public) si in descrierea DPA (exceptia numita).
    ancora_d_ia, ancora_d_dpa = 'al 3S și ce limite are', 'ca persoană împuternicită, datele personale'
    if descriere_real.count(ancora_d_ia) != 1 or descriere_real.count(ancora_d_dpa) != 1:
        nemasurat('ancorele martorilor descrierilor nu mai sunt, o data fiecare, in ' + real_descriere)
    descriere_ia = descriere_real.replace(ancora_d_ia, 'al 3S și ce limite ' + 'v' + 'ă privesc')
    descriere_dpa = descriere_real.replace(ancora_d_dpa, 'ca persoană împuternicită, datele ' + 'v' + 'ă privesc')
    caz('poarta-limba.py', 'publicare.ts real (copie), descrierile romanesti la "tu": cod 0', cu_meta(meta_real), CURAT,
        'DESCRIERE_MD: 8 intrari ro citite')
    caz('poarta-limba.py', 'aceeasi copie cu o forma formala in descrierea IA: cod 1, numeste documentul',
        cu_meta(meta_real, descriere=descriere_ia), PICAT, 'descrierea romaneasca din rute a documentului inteligenta-artificiala')
    caz('poarta-limba.py', 'aceeasi forma in descrierea DPA (exceptia numita, felia 145): cod 0',
        cu_meta(meta_real, descriere=descriere_dpa), CURAT)
    caz('poarta-limba.py', 'familia md in arbore fara publicare.ts: cod 3, nu 0 (descrierile nemasurate)',
        cu_meta(meta_real, descriere=None), NEMASURAT, 'DESCRIERE_MD nu a fost gasit')
    caz('poarta-limba.py', 'publicare.ts fara blocul DESCRIERE_MD: cod 3, nu 0',
        cu_meta(meta_real, descriere=descriere_real.replace('DESCRIERE_MD', 'DESCRIERE_REDENUMIT')), NEMASURAT,
        'DESCRIERE_MD nu a fost gasit')
    # Controlul stricat pe o COPIE a portii: citirea descrierilor nu mai gaseste blocul, deci martorul descrierilor din
    # `controale()` pica si poarta iese 3, nu 0, chiar pe copia cu forma formala plantata.
    caz('poarta-limba.py', 'control descrieri picat (tiparul blocului stricat pe copie): cod 3, nu 0',
        cu_meta(meta_real, descriere=descriere_ia), NEMASURAT, 'CONTROL PICAT',
        mutatie=('poarta-limba.py', "re.compile(r'export const DESCRIERE_MD", "re.compile(r'export const DESCRIERE_NIMIC"))


def cazuri_rute():
    def manifest(rute, pagini):
        def construieste(d):
            corp = 'export const RUTE = [\n'
            for r in rute:
                corp += '  { cale: "' + r + '", inMeniu: true },\n'
            corp += '];\n'
            scrie(os.path.join(d, 'src', 'content', 'rute.ts'), corp)
            for p in pagini:
                bucati = [x for x in p.split('/') if x]
                scrie(os.path.join(d, 'src', 'app', *bucati, 'page.tsx'),
                      'export default function P() { return <p>x</p> }\n')
        return construieste

    caz('poarta-rute.py', 'ruta promisa in manifest fara page.tsx: cod 1, mesajul o numeste',
        manifest(['/', '/contact'], ['/']), PICAT, 'RU-02')
    caz('poarta-rute.py', 'pagina servita care nu e in manifest: cod 1, mesajul o numeste',
        manifest(['/'], ['/', '/ascunsa']), PICAT, 'RU-01')
    caz('poarta-rute.py', 'manifest si fisiere care coincid: cod 0',
        manifest(['/', '/contact'], ['/', '/contact']), CURAT)
    caz('poarta-rute.py', 'arbore fara rute.ts: cod 3, nu 0', gol, NEMASURAT, 'lipseste')


def cazuri_scurgeri():
    antet = '-----' + 'BEGIN RSA PRIVATE KEY' + '-----'
    caz('poarta-scurgeri.py', 'antet de cheie privata: cod 1, mesajul il numeste',
        lambda d: scrie(os.path.join(d, 'docs', 'nota.md'), antet + '\n'),
        PICAT, 'cheie privata')
    caz('poarta-scurgeri.py', 'text curat, cu telefon-fixtura si adresa de firma: cod 0',
        lambda d: scrie(os.path.join(d, 'docs', 'nota.md'),
                        'Scrieti la contact@3s.ke2.in; telefon fixtura: '
                        + '+40 0' + '00 000 000' + '\n'),
        CURAT)


def cazuri_tipografie():
    u2500 = cifra_incident_u2500()
    caz('poarta-tipografie.py', 'liniuta lunga sub docs: cod 1, mesajul o numeste',
        lambda d: scrie(os.path.join(d, 'docs', 'nota.md'), 'nota ' + chr(0x2014) + ' aici\n'),
        PICAT, 'EM DASH')
    def poarta_cu_liniuta(d):
        # Martorul e un `.py`, nu un `.md`: asa cazul masoara DOUA schimbari deodata - calea
        # `.claude/scripts/porti` din CAI si extensia `.py` din EXTENSII. Cu un `.md` ar fi
        # fost prins si fara extensii, deci jumatatea aceea ramanea nemasurata.
        # Fratele curat de sub `docs` tine arborele nevid cand una dintre ele e dezarmata:
        # fara el poarta ar iesi 3 pentru "niciun fisier", si rosul ar spune "preconditie
        # lipsa" in loc de "liniuta lunga nevazuta".
        scrie(os.path.join(d, '.claude', 'scripts', 'porti', 'poarta-martor.py'),
              '# nota ' + chr(0x2014) + ' aici\n')
        scrie(os.path.join(d, 'docs', 'nota-curata.md'), 'nota - aici\n')

    caz('poarta-tipografie.py',
        'liniuta lunga intr-un `.py` de sub .claude/scripts/porti: cod 1 (cale SI extensie)',
        poarta_cu_liniuta, PICAT, 'EM DASH')
    caz('poarta-tipografie.py',
        str(u2500) + ' de U+2500 (cifra incidentului #988) NU sunt liniute lungi: cod 0',
        lambda d: scrie(os.path.join(d, 'docs', 'separator.md'),
                        chr(0x2500) * u2500 + '\n'),
        CURAT)
    def peste_linia_de_comanda(d):
        # Pe 25.09 lotul a trecut de plafonul liniei de comanda din Windows (32.767 de caractere:
        # 323 de fisiere, WinError 206) si poarta a picat pe fiecare felie curata. 450 de fisiere
        # cu nume lungi il depasesc pe orice masina; ultimul poarta liniuta lunga, ca o transa
        # sarita sa se vada ca rosu lipsa, nu doar ca un 0 corect din intamplare.
        for i in range(450):
            scrie(os.path.join(d, 'docs', 'transe',
                               'fisier-cu-nume-lung-pentru-linia-de-comanda-%03d.md' % i), 'nota - aici\n')
        scrie(os.path.join(d, 'docs', 'transe', 'zz-ultimul.md'), 'nota ' + chr(0x2014) + ' aici\n')

    caz('poarta-tipografie.py',
        '451 de fisiere peste plafonul liniei de comanda din Windows: rulat pe transe, ultimul prins (cod 1)',
        peste_linia_de_comanda, PICAT, 'zz-ultimul.md')
    # MUTANTUL: se goleste lista de tinte a DETECTORULUI. Controlul lui interior trebuie sa
    # pice, detectorul sa iasa 3, iar poarta sa TRANSMITA codul in loc sa-l inghita.
    caz('poarta-tipografie.py', 'MUTANT: detector cu tinte goale - poarta transmite codul 3',
        lambda d: scrie(os.path.join(d, 'docs', 'nota.md'), 'text curat\n'),
        NEMASURAT, 'CONTROL',
        mutatie=('tipografie-liniute.py', 'TINTE = {', 'TINTE = {}  # mutant\nTINTE_VECHI = {'))


def cazuri_evidenta():
    caz('poarta-evidenta.py', 'confirmare fara sursa: cod 1, mesajul o numeste',
        registru([INTRARE_REA]), PICAT, 'FARA sursa')
    caz('poarta-evidenta.py', 'registru gol (dosar fara json): cod 3, nu 0',
        lambda d: os.makedirs(os.path.join(d, 'src', 'content', 'afirmatii')),
        NEMASURAT, 'NEMASURAT')

    # Cod 0 pe a doua rulare: prima regenereaza lista, a doua nu mai are ce schimba.
    # Cazul asta probeaza si ca `--radacina` chiar tine - lista ajunge in arborele fabricat.
    d = tempfile.mkdtemp(prefix='proba-proces-')
    try:
        registru([INTRARE_BUNA])(d)
        inregistreaza('poarta-evidenta.py', PICAT)
        inregistreaza('poarta-evidenta.py', CURAT)
        cod1, _ = ruleaza('poarta-evidenta.py', d)
        cod2, iesire2 = ruleaza('poarta-evidenta.py', d)
        generat = os.path.join(d, 'docs', 'afirmatii', 'pagina.md')
        if cod1 != PICAT:
            nu('poarta-evidenta.py | prima rulare pe registru nou: cod ' + str(cod1)
               + ', asteptam ' + str(PICAT) + ' (lista lipseste, deci se regenereaza)')
        elif cod2 != CURAT:
            nu('poarta-evidenta.py | a doua rulare: cod ' + str(cod2) + ', asteptam '
               + str(CURAT) + '\n' + iesire2.strip())
        elif not os.path.isfile(generat):
            nu('poarta-evidenta.py | --radacina nu tine: lista nu a aparut in arborele fabricat')
        else:
            ok('poarta-evidenta.py | --radacina scrie in arborele fabricat, a doua rulare iese 0')
    finally:
        shutil.rmtree(d, ignore_errors=True)

    # `--doar-raport`: acelasi arbore invechit, dar arborele NU are voie sa fie atins.
    d = tempfile.mkdtemp(prefix='proba-proces-')
    try:
        registru([INTRARE_BUNA])(d)
        inregistreaza('poarta-evidenta.py', PICAT)
        cod, iesire = ruleaza('poarta-evidenta.py', d, argumente=('--doar-raport',))
        dosar = os.path.join(d, 'docs', 'afirmatii')
        if cod != PICAT:
            nu('poarta-evidenta.py | --doar-raport pe arbore invechit: cod ' + str(cod)
               + ', asteptam ' + str(PICAT) + '\n' + iesire.strip())
        elif 'AR REGENERA' not in iesire:
            nu('poarta-evidenta.py | --doar-raport nu spune ce ar regenera\n' + iesire.strip())
        elif os.path.exists(dosar):
            nu('poarta-evidenta.py | --doar-raport A SCRIS in arbore: ' + dosar)
        else:
            ok('poarta-evidenta.py | --doar-raport: cod 1, spune ce ar regenera, nu scrie nimic')
    finally:
        shutil.rmtree(d, ignore_errors=True)


def cazuri_juridic():
    odr = 'https://ec.europa.eu/' + 'consumers' + '/' + 'odr'
    caz('poarta-juridic.py', 'link catre platforma SOL: cod 1, mesajul il numeste',
        html_juridic(in_plus=['<a href="' + odr + '">SOL</a>']), PICAT, 'L-09')
    caz('poarta-juridic.py', 'proiect complet si curat: cod 0', html_juridic(), CURAT)
    caz('poarta-juridic.py', 'arbore fara nicio sursa: cod 3, nu 0',
        gol, NEMASURAT, 'masuratoarea e invalida')
    cazuri_juridic_l01()


# ------------------------------------------------------------------ L-01, locul gol al operatorului
# Ziua operatorului (plan S4 sectiunea 10): `config/operator.json` primeste datele copiate din
# certificat, iar L-01 nu are voie sa le opreasca drept "substituent". Tiparul de pana la 25.09.2026
# le oprea (Str. Ana Ipatescu, Poiana, Ucraina, Todoran - constatarea criticului feliei 44).

# Operatorul complet, cu valori evident de proba: adresa pe domeniul rezervat `.test`, telefon numai
# cu zerouri, cod fiscal cu cifra de control gresita. Fiecare caz schimba UN camp, deci ce iese vine
# din campul schimbat. Domeniul adresei nu tine niciun cuvant de substituire: scutirea lui "exemplu"
# dupa @ sta in poarta numai pentru martorul din controale() si e ceruta spre scoatere, deci proba
# nu se sprijina pe ea.
OPERATOR_L01 = {
    'denumire': 'Trei S Proba SRL',
    'sediu': 'Str. Proba 1, Bucuresti',
    'email': 'contact@proba-3s.test',
    'telefon': '+40 000 000 000',
    'numar_orc': 'J40/0000/2026',
    'cod_fiscal': 'RO12345678',
}

# La PRODUCTIE: pe staging locul gol e AVERT si poarta iese 0 oricum, deci tiparul vechi si cel nou
# ar da acelasi cod, iar cazul n-ar deosebi nimic.
LA_PRODUCTIE = ('--mediu', 'productie')

# Valori reale, care NU sunt locuri goale; poarta de dinainte de 25.09.2026 le oprea pe toate (masurat
# ca proces, la productie). Tara nu e camp L-01 (CAMPURI_IDENTITATE din poarta), deci Ucraina sta in
# sediu, singurul drum pe care ajunge la tipar. Primele patru sunt ale criticului; restul, aceeasi
# clasa: strada si orasul care tin cuvintele scoase din tipar ("necunoscut", "NA" fara bara), si
# "Metodo", unde "todo" are litere lipite la STANGA - pereche cu "Todoran", unde le are la dreapta;
# la fel "Luxxx" si "XXXL" pentru seria de X (fara ele, niciun caz nu pazea granitele seriei de X).
VALORI_REALE_L01 = [
    {'sediu': 'Str. Ana Ipătescu, București'},
    {'sediu': 'Poiana Brașov, județul Brașov'},
    {'denumire': 'Todoran Arhive SRL'},
    {'sediu': 'Lviv, Ucraina'},
    {'sediu': 'Str. Eroul Necunoscut, Ploiești'},
    {'denumire': 'Metodo Arhive SRL', 'sediu': 'Nové Město na Moravě, Cehia'},
    {'denumire': 'Luxxx Arhive SRL'},
    {'denumire': 'XXXL Arhive SRL'},
]

# "Arhiva Romana" (src/lib/operator.ts) trecea si de poarta veche (masurat: cod 0): aceea nu scotea
# diacriticele, iar a cu caciula nu se potrivea cu "NA". loc_gol() le scoate, deci poarta noua vede
# "Romana", terminat in "na" ca "Poiana" si "Ucraina", si trebuie sa-l lase sa treaca. Nu intra la
# MUTANT: acolo tiparul vechi sta in loc_gol() nou si ar opri o valoare pe care poarta veche n-o
# oprea - un hibrid, nu poarta veche.
VALOARE_REALA_DIACRITICE_L01 = {'denumire': 'Arhiva Română SRL'}

# Substituentii ceruti de dispecer, fiecare singur, pe cate un camp. Campul gol e si martorul POZITIV:
# nu depinde de tipar, deci arata ca drumul pana la L-01 e deschis la productie.
SUBSTITUENTI_L01 = [
    ('telefon', ''),
    ('cod_fiscal', 'de completat'),
    ('sediu', '[...]'),
    ('numar_orc', 'XXX'),
    ('email', 'TODO'),
    ('denumire', 'exemplu'),
    ('sediu', 'Lorem ipsum'),
]

# Doua forme, fiecare singura, cu cate un mutant pe care numai ea il ucide (masurat pe o copie a portii):
#   "contact@TODO"  dupa @ opreste orice cuvant de substituire afara de "exemplu" (scutirea provizorie
#                   din poarta); ucide mutantul cu scutirea @ intinsa pe toate cuvintele
#   "J40/???/2026"  semnele de intrebare langa litere si cifre. "???" singur il prinde si campul fara
#                   nicio litera din loc_gol(), deci numai aici se vede ramura ??? a tiparului
FORME_L01 = [
    ('email', 'contact@TODO'),
    ('numar_orc', 'J40/???/2026'),
]

# Aceleasi reguli in alte forme, mai multe campuri intr-un singur arbore (un proces in loc de sase).
# Mesajul portii numeste campurile in ordinea din CAMPURI_IDENTITATE, deci lista asteptata e exacta.
LOTURI_L01 = [
    ('campul gol ca null, spatii si "-"; notatiile pastrate din tiparul vechi', {
        'denumire': None, 'sediu': '   ', 'email': 'N/A', 'telefon': '-', 'numar_orc': 'TBD',
        'cod_fiscal': '???'}),
    ('cuvant intreg intre cuvinte, langa @, / si prefixul RO; sabloane intre < >', {
        'denumire': 'Alfa Exemplu SRL', 'sediu': '<sediul firmei>', 'email': 'todo@proba-3s.test',
        'telefon': '+40 7XX XXX XXX', 'numar_orc': 'J40/XXXX/2026', 'cod_fiscal': 'ROXXXXXXXX'}),
    ('cifra si _ nu leaga; majuscule si spatii duble; text oarecare intre [ ]', {
        'denumire': '[denumirea firmei]', 'sediu': 'De  Completat', 'telefon': 'TODO_telefon',
        'cod_fiscal': 'RO1234XXXX'}),
]

# MUTANTUL: tiparul de pana la 25.09.2026, pus inapoi in copia portii. Pe fiecare valoare din
# VALORI_REALE_L01 (cele oprite de poarta veche) trebuie sa OPREASCA - altfel cazul real n-ar deosebi
# tiparul vechi de cel nou.
TIPAR_VECHI_L01 = r"re.compile(r'(TODO|TBD|XXX+|\?\?\?|N/?A\b|de\s+completat|necunoscut|<[^>]*>|lorem)', re.I)"
MUTANT_L01 = ('poarta-juridic.py', 'TIPAR_SUBSTITUENT = re.compile(',
              'TIPAR_SUBSTITUENT = ' + TIPAR_VECHI_L01 + '  # mutant: tiparul vechi\nTIPAR_NOU = re.compile(')

# Trei mutanti ai regulii noi SUPRAVIETUIESC cazurilor de aici (masurat pe o copie a portilor, 25.09.2026)
# si se declara, ca un verde sa nu fie citit drept acoperire: granita la stanga si granita la dreapta a
# lui "N/A" cu bara (nicio valoare plauzibila nu lipeste o litera de el), si loc_gol() fara scoaterea
# diacriticelor (ar trebui o litera cu diacritic, scrisa descompus, lipita inaintea unui cuvant de
# substituire).

CAMPURI_L01 = ('denumire', 'sediu', 'email', 'telefon', 'numar_orc', 'cod_fiscal')


def operator_l01(schimbari):
    date = dict(OPERATOR_L01)
    date.update(schimbari)
    return html_juridic(date)


def gol_la(campuri):
    """Randul L-01 exact, pana la temei: o lista de campuri mai lunga nu se potriveste."""
    return ('OPRESTE  L-01  config/operator.json: operatorul e numit, dar are loc gol la '
            + ', '.join(c for c in CAMPURI_L01 if c in campuri) + ' | TEMEI')


def descrie(schimbari):
    return ', '.join(camp + ' "' + str(valoare) + '"' for camp, valoare in schimbari.items())


def cazuri_juridic_l01():
    p = 'poarta-juridic.py'
    curat = 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment'
    caz(p, 'L-01 martor NEGATIV: operator complet, fara niciun substituent: cod 0',
        operator_l01({}), CURAT, curat, argumente=LA_PRODUCTIE)
    for schimbari in VALORI_REALE_L01 + [VALOARE_REALA_DIACRITICE_L01]:
        caz(p, 'L-01 valoare reala, ' + descrie(schimbari) + ': cod 0',
            operator_l01(schimbari), CURAT, curat, argumente=LA_PRODUCTIE)
    for camp, valoare in SUBSTITUENTI_L01 + FORME_L01:
        caz(p, 'L-01 substituent, ' + descrie({camp: valoare}) + ': cod 1',
            operator_l01({camp: valoare}), PICAT, gol_la([camp]), argumente=LA_PRODUCTIE)
    for eticheta, schimbari in LOTURI_L01:
        caz(p, 'L-01 ' + eticheta + ': cod 1', operator_l01(schimbari), PICAT, gol_la(schimbari),
            argumente=LA_PRODUCTIE)
    for schimbari in VALORI_REALE_L01:
        caz(p, 'L-01 MUTANT tiparul vechi, ' + descrie(schimbari) + ': cod 1',
            operator_l01(schimbari), PICAT, gol_la(schimbari), argumente=LA_PRODUCTIE,
            mutatie=MUTANT_L01)


def cazuri_seo():
    caz('poarta-seo.py', 'canonical lipsa: cod 1, mesajul il numeste',
        html_seo(canonical=None), PICAT, 'S-02')
    caz('poarta-seo.py', 'pagina construita corect: cod 0', html_seo(), CURAT)
    caz('poarta-seo.py', 'arbore fara HTML construit: cod 3, nu 0',
        gol, NEMASURAT, 'masuratoarea e invalida')


def cazuri_regresie():
    prag = {'fisiere': 1, 'teste': 2, 'asertiuni': 2, 'sarite_maxim': 0}
    caz('poarta-regresie.py', 'masuratoare sub pragul declarat: cod 1, mesajul il numeste',
        probe_vitest(1, 1, 1, prag), PICAT, 'OPRESTE')
    caz('poarta-regresie.py', 'masuratoare exact pe prag: cod 0',
        probe_vitest(1, 2, 2, prag), CURAT)
    caz('poarta-regresie.py', 'arbore fara fisierul de praguri: cod 3, nu 0',
        probe_vitest(1, 2, 2, None), NEMASURAT, 'lipseste fisierul de referinta')


def _manifest_si_pagini(rute, pagini, ancore=(), id_pagina=None):
    """Arbore minim pentru portile care citesc rute.ts si src/app: manifest cu `cale:` (si
    optional `ancora:`), cate un page.tsx per ruta. `id_pagina` = lista de id-uri literale puse
    in page.tsx-ul rutei `/` (ca sa poata fi fabricat un duplicat in ACEEASI pagina)."""
    def construieste(d):
        corp = 'export const RUTE = [\n'
        for r in rute:
            corp += '  { cale: "' + r + '", inMeniu: true },\n'
        corp += '];\n'
        if ancore:
            corp += 'export const SECTIUNI_ACASA = [\n'
            for a in ancore:
                corp += '  { ancora: "' + a + '" },\n'
            corp += '];\n'
        scrie(os.path.join(d, 'src', 'content', 'rute.ts'), corp)
        for pth in pagini:
            bucati = [x for x in pth.split('/') if x]
            ids = ''.join('<section id="' + i + '">x</section>' for i in (id_pagina or [])) if pth == '/' else ''
            scrie(os.path.join(d, 'src', 'app', *bucati, 'page.tsx'),
                  'export default function P() { return <main>' + ids + '<p>x</p></main> }\n')
    return construieste


def cazuri_identificatori():
    caz('poarta-identificatori.py', 'aceeasi cale de doua ori in RUTE: cod 1, mesajul o numeste',
        _manifest_si_pagini(['/', '/contact', '/contact'], ['/', '/contact']), PICAT, 'ID-01')
    caz('poarta-identificatori.py', 'acelasi id literal de doua ori in aceeasi pagina: cod 1',
        _manifest_si_pagini(['/'], ['/'], id_pagina=['dosar', 'dosar']), PICAT, 'ID-04')
    caz('poarta-identificatori.py', 'cai, ancore si id-uri unice: cod 0',
        _manifest_si_pagini(['/', '/contact'], ['/', '/contact'], ancore=('scan', 'solve'),
                            id_pagina=['scan', 'solve']), CURAT)
    caz('poarta-identificatori.py', 'arbore fara rute.ts: cod 3, nu 0', gol, NEMASURAT, 'lipseste')


def cazuri_legaturi_md():
    def md(readme):
        def construieste(d):
            scrie(os.path.join(d, 'README.md'), readme)
            scrie(os.path.join(d, 'CONTEXT.md'), '# Context\n\nFara legaturi.\n')
        return construieste

    caz('poarta-legaturi-md.py', 'legatura catre un fisier care nu exista: cod 1, mesajul o numeste',
        md('# R\n\nVezi [ghidul](docs/ghid-care-lipseste.md).\n'), PICAT, 'LG-01')
    caz('poarta-legaturi-md.py', 'citare cu numar de linie dincolo de sfarsitul fisierului: cod 1',
        md('# R\n\nDetaliu in CONTEXT.md:40 (linia nu exista)\n'), PICAT, 'LG-03')
    caz('poarta-legaturi-md.py', 'legatura si citare care se rezolva: cod 0',
        md('# R\n\nVezi [contextul](CONTEXT.md) si CONTEXT.md:1 (titlul)\n'), CURAT)
    caz('poarta-legaturi-md.py', 'arbore fara niciun .md: cod 3, nu 0', gol, NEMASURAT, 'NEMASURAT')


def cazuri_registru_rute():
    def cu_registru(rute, pagini, unde_per_intrare):
        baza = _manifest_si_pagini(rute, pagini)
        def construieste(d):
            baza(d)
            intrari = [{'id': 'a' + str(i), 'text': 'afirmatie ' + str(i), 'unde': u,
                        'stare': 'neconfirmat', 'sursa': '', 'confirmat_de': '', 'data': ''}
                       for i, u in enumerate(unde_per_intrare)]
            scrie(os.path.join(d, 'src', 'content', 'afirmatii', 'proba.json'),
                  json.dumps(intrari, ensure_ascii=False, indent=2) + '\n')
        return construieste

    caz('poarta-registru-rute.py', 'ruta cu pagina dar fara nicio afirmatie: cod 1, mesajul o numeste',
        cu_registru(['/', '/contact'], ['/', '/contact'], ['src/app/page.tsx']), PICAT, 'RR-01')
    caz('poarta-registru-rute.py', 'campul unde trimite la un fisier care nu exista: cod 1',
        cu_registru(['/'], ['/'], ['src/app/page.tsx, src/components/Disparut.tsx']), PICAT, 'RR-03')
    caz('poarta-registru-rute.py', 'fiecare ruta acoperita de o intrare: cod 0',
        cu_registru(['/', '/contact'], ['/', '/contact'],
                    ['src/app/page.tsx', 'src/app/contact/page.tsx']), CURAT)
    caz('poarta-registru-rute.py', 'arbore fara rute.ts: cod 3, nu 0', gol, NEMASURAT, 'lipseste')


def cazuri_navigare():
    modul = "'@playwright/" + "test'"

    def arbore(importul):
        def construieste(d):
            b = os.path.join(d, 'tests', 'browser')
            scrie(os.path.join(b, 'ajutor', 'baza.ts'),
                  'import { test as t } from ' + modul + '\n'
                  + 'export const test = t.extend({ x: [async ({}, use) => use(), '
                  + "{ scope: 'worker', auto: " + 'true } ] })\n')
            scrie(os.path.join(b, 'a.spec.ts'), importul + '\n')
        return construieste

    caz('poarta-navigare.py', 'proba importa test direct din Playwright: cod 1, mesajul o numeste',
        arbore('import { expect, ' + 'test } from ' + modul), PICAT, 'N-01')
    caz('poarta-navigare.py', 'proba importa test din ajutor/baza: cod 0',
        arbore("import { expect, test } from './ajutor/baza'"), CURAT)
    caz('poarta-navigare.py', 'arbore fara tests/browser: cod 3, nu 0', gol, NEMASURAT, 'NEMASURAT')


def cazuri_limba_en():
    # Cuvantul britanic se asambleaza la rulare, ca fisierul asta sa nu-l poarte pe litere.
    britanic = 'organis' + 'ation'

    def modul_en(text):
        return lambda d: scrie(os.path.join(d, 'src', 'content', 'en', 'pricing.ts'),
                               'export const pagina = { h1: "' + text + '" };\n')

    caz('poarta-limba-en.py', 'ortografie britanica intr-un modul EN: cod 1, mesajul o numeste',
        modul_en('Your ' + britanic + ' keeps every invoice.'), PICAT, 'ortografie britanica')
    caz('poarta-limba-en.py', 'modul EN in engleza americana: cod 0',
        modul_en('Your organization keeps every invoice.'), CURAT)
    # Controlul stricat pe o COPIE: detectorul de exclamare nu mai prinde nimic, deci martorul lui
    # pozitiv pica si poarta trebuie sa iasa 3, nu 0.
    caz('poarta-limba-en.py', 'control picat (detector dezactivat pe copie): cod 3, nu 0',
        modul_en('Your organization keeps every invoice.'), NEMASURAT, 'CONTROL PICAT',
        mutatie=('poarta-limba-en.py', "TIPAR_EXCLAMARE = re.compile(r'!(?![=\\[])')",
                 "TIPAR_EXCLAMARE = re.compile(r'(?!x)x')"))


def cazuri_reciprocitate():
    # Arbore 3s.md minim: catalogul real al editiilor (poarta il compara cu lista ei), o pereche en - ro-MD in
    # echivalente si in HTML-ul construit, profilul in `required-server-files.json`. Adresele se lipesc la rulare.
    baza = 'https://' + 'exemplu-' + 'reciproc.test'
    en, ro = baza + '/legal/doc', baza + '/ro/juridic/doc'

    def pagina(adresa, alternate):
        return ('<html><head><link rel="canonical" href="' + adresa + '"/>'
                + ''.join('<link rel="alternate" hrefLang="' + h + '" href="' + u + '"/>' for h, u in alternate)
                + '</head><body><h1>x</h1></body></html>')

    def arbore(fara_inversa=False, cu_build=True):
        def construieste(d):
            catalog = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(PORTI))), 'src', 'lib', 'editii.ts')
            scrie(os.path.join(d, 'src', 'lib', 'editii.ts'), open(catalog, encoding='utf-8').read())
            scrie(os.path.join(d, 'src', 'content', 'echivalente.ts'),
                  'export const ECHIVALENTE = {\n  doc: { en: "/legal/doc", "ro-MD": "/ro/juridic/doc" },\n};\n')
            if cu_build:
                scrie(os.path.join(d, '.next', 'required-server-files.json'), json.dumps({'config': {'env': {
                    'NEXT_PUBLIC_FAMILIE_JURIDICA': 'md', 'NEXT_PUBLIC_SITE_EDITII': 'en,ro-MD'}}}))
                app = os.path.join(d, '.next', 'server', 'app')
                alt_ro = [('ro-MD', ro)] + ([] if fara_inversa else [('en', en)])
                scrie(os.path.join(app, 'legal', 'doc.html'), pagina(en, [('en', en), ('ro-MD', ro)]))
                scrie(os.path.join(app, 'ro', 'juridic', 'doc.html'), pagina(ro, alt_ro))
            # Sursa cu un minut inaintea build-ului: ordinea scrierii nu garanteaza o data mai noua.
            for radacina, _, nume in os.walk(os.path.join(d, 'src')):
                for n in nume:
                    t = os.path.getmtime(os.path.join(radacina, n)) - 60
                    os.utime(os.path.join(radacina, n), (t, t))
        return construieste

    caz('poarta-reciprocitate.py', 'pereche fara inversa: cod 1, mesajul o numeste', arbore(fara_inversa=True),
        PICAT, 'R-01')
    caz('poarta-reciprocitate.py', 'pereche reciproca: cod 0', arbore(), CURAT)
    caz('poarta-reciprocitate.py', 'arbore fara HTML construit: cod 3, nu 0', arbore(cu_build=False), NEMASURAT,
        'masuratoarea e invalida')


def cazuri_oglinda_asezare():
    # Arbore minim: o pagina EN la radacina 3s.md si geamana ei pe asezarea ro, cu pagina de negasit pe ambele.
    # Numele grupurilor si sufixul se asambleaza la rulare. Poarta nu are `--radacina` prin argparse, deci se
    # copiaza in arbore si isi ia radacina din propria cale (cusatura de mai sus).
    grup_en = '(' + 'com' + 'roen)'
    sufix = '.' + 'comro' + '.tsx'

    def arbore(cu_geamana=True):
        def construieste(d):
            app = os.path.join(d, 'src', 'app')
            scrie(os.path.join(app, '(en)', 'pricing', 'page.en.tsx'),
                  'export const metadata = {};\nexport default function P() {}\n')
            if cu_geamana:
                scrie(os.path.join(app, grup_en, 'en', 'pricing', 'page' + sufix),
                      'export { default, metadata } from "@/app/(en)/pricing/page.en";\n')
            scrie(os.path.join(app, 'global-not-found.en.tsx'), 'export default function N() {}\n')
            scrie(os.path.join(app, 'global-not-found' + sufix), 'export default function N() {}\n')
            # Imaginile sociale de la radacina: exceptarile din PROPRII_RO, cu sursa lor; fara ele poarta
            # (corect) numeste exceptarea ramasa in urma si arborele n-ar mai fi curat.
            for img in ('opengraph-image', 'twitter-image'):
                scrie(os.path.join(app, '(en)', img, 'route.en.tsx'),
                      'export const dynamic = "force-static";\nexport function GET() {}\n')
                scrie(os.path.join(app, '(' + 'com' + 'ro)', img, 'route' + sufix),
                      'export { GET } from "@/app/(en)/' + img + '/route.en";\n'
                      'export const dynamic = "force-static";\n')
                scrie(os.path.join(app, grup_en, 'en', img, 'route' + sufix),
                      'export { GET } from "@/app/(en)/' + img + '/route.en";\n'
                      'export const dynamic = "force-static";\n')
        return construieste

    caz('poarta-oglinda-asezare.py', 'pagina EN fara geamana pe asezarea ro: cod 1, mesajul o numeste',
        arbore(cu_geamana=False), PICAT, 'OA-01')
    caz('poarta-oglinda-asezare.py', 'pagina EN cu geamana ei: cod 0', arbore(), CURAT)
    caz('poarta-oglinda-asezare.py', 'arbore fara surse in (en) / (romd): cod 3, nu 0',
        gol, NEMASURAT, 'NEMASURAT')


CAZURI = {
    'poarta-afirmatii.py': cazuri_afirmatii,
    'poarta-evidenta.py': cazuri_evidenta,
    'poarta-identificatori.py': cazuri_identificatori,
    'poarta-legaturi-md.py': cazuri_legaturi_md,
    'poarta-juridic.py': cazuri_juridic,
    'poarta-limba-en.py': cazuri_limba_en,
    'poarta-limba.py': cazuri_limba,
    'poarta-navigare.py': cazuri_navigare,
    'poarta-oglinda-asezare.py': cazuri_oglinda_asezare,
    'poarta-reciprocitate.py': cazuri_reciprocitate,
    'poarta-regresie.py': cazuri_regresie,
    'poarta-registru-rute.py': cazuri_registru_rute,
    'poarta-rute.py': cazuri_rute,
    'poarta-scurgeri.py': cazuri_scurgeri,
    'poarta-seo.py': cazuri_seo,
    'poarta-tipografie.py': cazuri_tipografie,
}


def controale():
    """Ce trebuie adevarat INAINTE de a rula cazurile. Altfel proba masoara altceva."""
    pe_disc = sorted(os.path.basename(c) for c in glob.glob(os.path.join(PORTI, 'poarta-*.py')))
    if not pe_disc:
        return 'nu gasesc nicio poarta in ' + PORTI
    lipsa = [p for p in pe_disc if p not in CAZURI]
    if lipsa:
        return ('porti pe disc fara niciun caz aici: ' + ', '.join(lipsa)
                + ' - o proba care sare o poarta raporteaza verde fara s-o atinga')
    moarte = [p for p in CAZURI if p not in pe_disc]
    if moarte:
        return 'cazuri pentru porti care nu mai exista: ' + ', '.join(sorted(moarte))
    # Fiecare poarta cu ramura de cod 3 in sursa trebuie sa aiba un caz de cod 3, sau o
    # scutire cu motiv scris. Lista de scutiri e mica si numita, nu o categorie larga.
    for nume in pe_disc:
        if 'return 3' not in sursa_portii(nume) and nume not in FARA_CAZ_DE_TREI:
            return nume + ' nu mai are ramura de cod 3; cazul de aici ar masura altceva'
    # Martorul mediului: cu variabilele puse in procesul probei, un subproces pornit cu mediul cazurilor nu le vede.
    vechi = {k: os.environ.get(k) for k in SCOASE_DIN_MEDIU}
    try:
        for k in SCOASE_DIN_MEDIU:
            os.environ[k] = 'martor-mediu'
        cod = ('import os, sys; sys.exit(1 if any(os.environ.get(k) for k in '
               + repr(SCOASE_DIN_MEDIU) + ') else 0)')
        r = subprocess.run([sys.executable, '-c', cod], env=mediu_curat())
    finally:
        for k, v in vechi.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v
    if r.returncode != 0:
        return ('mediul cazurilor pastreaza ' + ', '.join(SCOASE_DIN_MEDIU)
                + ': verdictele ar depinde de shell-ul care ruleaza proba')
    return None


def acoperire_lipsa():
    """Ce poarta a ramas fara cazuri reale. Se cere, per poarta, macar un caz care asteapta 1,
    unul care asteapta 0 si - daca poarta nu e in FARA_CAZ_DE_TREI - unul care asteapta 3.

    Cele doua liste se produc altfel si de aceea nu pot drifta impreuna: CAZURI e declarat in
    fisierul asta, ACOPERIRE se umple din apelurile care chiar au rulat. Tabelul de scutiri e
    acelasi FARA_CAZ_DE_TREI care se tipareste in rezumat, nu o a doua copie a lui.
    """
    lipsuri = []
    for nume in sorted(CAZURI):
        avute = ACOPERIRE.get(nume, set())
        ceruta = {PICAT, CURAT}
        if nume not in FARA_CAZ_DE_TREI:
            ceruta.add(NEMASURAT)
        lipsa = sorted(ceruta - avute)
        if lipsa:
            lipsuri.append(nume + ': niciun caz care sa ceara cod '
                           + ', '.join(str(x) for x in lipsa)
                           + ' (cerute: ' + ', '.join(str(x) for x in sorted(ceruta))
                           + '; rulate: ' + (', '.join(str(x) for x in sorted(avute)) or 'niciunul')
                           + ')')
    return lipsuri


def main():
    print('proba-porti-proces: portile din ' + PORTI)
    print('coduri de iesire, citite din browser-rulator.mjs: '
          + ', '.join(str(k) + '=' + CODURI[k] for k in sorted(CODURI)))

    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        print('Verdictul e NEMASURAT, nu "curat".', file=sys.stderr)
        return 3

    for nume in sorted(CAZURI):
        print('\n## ' + nume + (' (--radacina)' if accepta_radacina(nume) else ' (copiata in arbore)'))
        CAZURI[nume]()

    print('\nREZIDUURI DECLARATE (un zero de mai sus nu le acopera):')
    for nume, motiv_scutire in sorted(FARA_CAZ_DE_TREI.items()):
        print('  fara caz de cod 3: ' + nume + ' - ' + motiv_scutire)

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')

    lipsuri = acoperire_lipsa()
    if lipsuri:
        print('CONTROL DE ACOPERIRE PICAT - poarta cu antet tiparit si fara cazuri reale:',
              file=sys.stderr)
        for rand in lipsuri:
            print('  ' + rand, file=sys.stderr)
        print('Verdictul e NEMASURAT, nu "curat".', file=sys.stderr)
        return NEMASURAT
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

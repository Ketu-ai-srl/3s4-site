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
                       encoding='utf-8', errors='replace')
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


CAZURI = {
    'poarta-afirmatii.py': cazuri_afirmatii,
    'poarta-evidenta.py': cazuri_evidenta,
    'poarta-identificatori.py': cazuri_identificatori,
    'poarta-legaturi-md.py': cazuri_legaturi_md,
    'poarta-juridic.py': cazuri_juridic,
    'poarta-limba.py': cazuri_limba,
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

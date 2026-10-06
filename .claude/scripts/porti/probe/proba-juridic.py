#!/usr/bin/env python3
"""Proba portii juridice. Ruleaza poarta ca PROCES, pe arbori de proiect fabricati.

Trei lucruri se probeaza aici, si ultimele doua sunt cele usor de uitat:
  1. fiecare clasa de defect e prinsa (martori pozitivi);
  2. gradarea pe MEDIU chiar functioneaza - acelasi arbore incomplet trebuie sa
     fie AVERT pe staging si sa OPREASCA la productie. Fara cazul asta,
     "blocheaza publicarea in productie" ramane o propozitie din documentatie.
  3. comutatorul operatorului (L-01): datele de identificare se cer numai cand
     `config/operator.json` numeste un operator. Operator numit cu un camp gol =
     rosu la productie; operator null si nicio data de firma = verde pe AMBELE
     medii (decizia owner-ului din 24.09.2026, planul valului S4, sectiunea 7).
  4. politica de cookie-uri (L-15) se cere din clipa in care HTML-ul construit
     poarta bannerul de consimtamant, oricare ar fi operatorul; fara banner, nu.
  5. (felia 72) operatorul din `OPERATOR_JSON`, modelul D2, familia `md` (datele pe pagina de
     informatii legale din fiecare limba, legatura spre ea in romana pe fiecare pagina, paginile
     juridice la adresele din `config/juridic-rute.json`), marcajele din paginile juridice (J-01),
     C-01 dupa `rel`, gazdele proprii si L-10 pe identificatori. Fiecare regula noua are cel putin un
     MUTANT pe o COPIE a portii, care o dezactiveaza: proba cere ca macar un caz sa se inroseasca pe el.
  6. (asezarea) pe un build cu asezarea `ro` (3s.com.ro) documentele familiei `md` se cauta la adresele
     SERVITE (romana la radacina, engleza sub /en), citite din `.next/required-server-files.json`; un fisier
     de profil stricat da 3. PREFIXE_ASEZARE din poarta se compara cu catalogul din src/lib.

MEDIUL SUBPROCESULUI: poarta citeste `OPERATOR_JSON` si `SITE_ENV`. Mediul in care ruleaza proba (o
statie, un job CI cu profilul 3s.md) nu are voie sa schimbe verdictul cazurilor, deci subprocesul le
primeste SCOASE; cazurile care au nevoie de ele le pun explicit.

Tiparele interzise se asambleaza din bucati la rulare: proba sta in depozit, iar
un link ODR scris intreg aici ar deveni chiar defectul pe care poarta il vaneaza,
data viitoare cand cineva largeste zona scanata.

IESIRE: 0 toate cazurile trec, 1 macar unul pica.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

AICI = os.path.dirname(os.path.abspath(__file__))
POARTA = os.path.join(os.path.dirname(AICI), 'poarta-juridic.py')
RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(AICI))))

# Variabilele pe care poarta le citeste din mediu: scoase din mediul fiecarui subproces.
SCOASE_DIN_MEDIU = ('OPERATOR_JSON', 'SITE_ENV')

T = P = 0

DATE_FIRMA = {
    'denumire': 'Trei S Arhivare SRL',
    'sediu': 'Golesti, judetul Arges',
    'email': 'contact@exemplu-3s.test',
    'telefon': '+40 000 000 000',
    'numar_orc': 'J03/1234/2026',
    'cod_fiscal': 'RO12345678',
}


def ok(mesaj):
    global T
    T += 1
    print('  OK    ' + mesaj)


def nu(mesaj):
    global P
    P += 1
    print('  PICAT ' + mesaj)


def scrie(cale, continut):
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


def arbore(corp_in_plus=(), date_firma=DATE_FIRMA, cu_rute=True, cu_config=True, operator_brut=None,
           fisiere_in_plus=None, construite_in_plus=None):
    """`date_firma` = obiectul operatorului din `config/operator.json`; None = operator null (nicio
    firma, nicio data in pagina). `operator_brut` scrie fisierul exact asa, pentru cazurile rupte.
    `fisiere_in_plus` = {cale relativa: continut}, scrise inaintea HTML-ului construit.
    `construite_in_plus` = {cale sub `.next/server/app/`: continut}, pagini construite in plus,
    scrise DUPA sursa: poarta refuza (3) un build mai vechi decat sursa."""
    d = tempfile.mkdtemp(prefix='proba-juridic-')
    for rel, continut in (fisiere_in_plus or {}).items():
        scrie(os.path.join(d, *rel.split('/')), continut)
    if cu_rute:
        scrie(os.path.join(d, 'src', 'app', 'confidentialitate', 'page.tsx'),
              'export default function P() { return <p>Politica</p> }\n')
        scrie(os.path.join(d, 'src', 'app', 'termeni', 'page.tsx'),
              'export default function P() { return <p>Termeni</p> }\n')
    if cu_config:
        continut = operator_brut if operator_brut is not None else (
            json.dumps({'operator': date_firma}, ensure_ascii=False, indent=2) + '\n')
        scrie(os.path.join(d, 'config', 'operator.json'), continut)
    for rel, continut in (construite_in_plus or {}).items():
        scrie(os.path.join(d, '.next', 'server', 'app', *rel.split('/')), continut)
    corp = ['<html><body>']
    if date_firma:
        for camp in ('denumire', 'sediu', 'email', 'telefon', 'numar_orc', 'cod_fiscal'):
            corp.append('<p>' + str(date_firma.get(camp, '')) + '</p>')
    corp.append('<form><input name="nume"/><p>Prelucram datele pentru demersuri precontractuale.</p></form>')
    corp.extend(corp_in_plus)
    corp.append('</body></html>')
    scrie(os.path.join(d, '.next', 'server', 'app', 'index.html'), ''.join(corp))
    return d


def ruleaza(radacina, mediu='staging', poarta=None, env=None):
    """`mediu` None = fara `--mediu` (decide SITE_ENV din `env`). `env` = variabilele puse EXPLICIT de caz,
    peste mediul procesului din care s-au scos SCOASE_DIN_MEDIU."""
    proces = {k: v for k, v in os.environ.items() if k not in SCOASE_DIN_MEDIU}
    proces.update(env or {})
    comanda = [sys.executable, poarta or POARTA, '--radacina', radacina]
    if mediu is not None:
        comanda += ['--mediu', mediu]
    r = subprocess.run(comanda, capture_output=True, text=True, encoding='utf-8', errors='replace', env=proces)
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def judeca(d, cod_asteptat, contine=None, mediu='staging', env=None, absent=None, poarta=None):
    """(None, iesire) daca rularea da ce se asteapta, altfel (motivul, iesire). `contine` = un sir sau o lista
    de siruri care trebuie sa apara; `absent` = la fel, siruri care NU au voie sa apara."""
    try:
        cod, iesire = ruleaza(d, mediu, poarta=poarta, env=env)
    finally:
        shutil.rmtree(d, ignore_errors=True)
    if cod != cod_asteptat:
        return 'cod ' + str(cod) + ', asteptam ' + str(cod_asteptat), iesire
    for sir in ([contine] if isinstance(contine, str) else (contine or [])):
        if sir not in iesire:
            return 'iesirea nu contine "' + sir + '"', iesire
    for sir in ([absent] if isinstance(absent, str) else (absent or [])):
        if sir in iesire:
            return 'iesirea contine "' + sir + '", care nu are voie sa apara', iesire
    return None, iesire


def caz(nume, d, cod_asteptat, contine=None, mediu='staging', env=None, absent=None):
    """`contine` = un sir sau o lista de siruri; fiecare trebuie sa apara in iesire."""
    motiv, iesire = judeca(d, cod_asteptat, contine, mediu, env, absent)
    if motiv:
        nu(nume + ': ' + motiv + '\n' + iesire.strip())
    else:
        ok(nume)


# Cazurile felia 72 se scriu ca DATE (arborele se face la fiecare rulare), ca aceleasi cazuri sa
# ruleze o data pe poarta vie si apoi pe fiecare mutant.
CAZURI = {}


def defineste(cheie, nume, fabrica, cod, contine=None, mediu='staging', env=None, absent=None):
    CAZURI[cheie] = dict(nume=nume, fabrica=fabrica, cod=cod, contine=contine, mediu=mediu, env=env, absent=absent)


def ruleaza_caz(cheie, poarta=None):
    c = CAZURI[cheie]
    return judeca(c['fabrica'](), c['cod'], c['contine'], c['mediu'], c['env'], c['absent'], poarta)


# ---------------------------------------------------------------------------------- felia 72
# Configurarile reale din depozit (modelul D2 si adresele familiei md), citite la RULARE: proba
# urmeaza fisierele pe care le citesc si site-ul si poarta, nu o copie scrisa aici.

def config_real(nume):
    with open(os.path.join(RADACINA, 'config', nume), encoding='utf-8') as f:
        return f.read()


MODEL_D2 = json.loads(config_real('model-d2.json'))
RUTE_MD = json.loads(config_real('juridic-rute.json'))
D2_RO = MODEL_D2['marcaj']['ro']
D2_EN = MODEL_D2['marcaj']['en']
ORDINE = ('B', 'C')
PUBLICATE_B = [c for c, d in RUTE_MD['documente'].items()
               if ORDINE.index(d['poarta']) <= ORDINE.index(RUTE_MD['poarta_curenta'])]
CALE_IL_RO = RUTE_MD['documente']['informatii-legale']['ro']
CALE_IL_EN = RUTE_MD['documente']['informatii-legale']['en']
CAMPURI_ID = ('denumire', 'sediu', 'email', 'telefon', 'numar_orc', 'cod_fiscal')


def operator_md(**schimbari):
    """Operatorul-model al domeniului 3s.md, asamblat din bucati, cu marcajul D2 pe cele trei campuri."""
    o = {
        'denumire': ' '.join(['3S', 'Demerzel', 'SRL']),
        'sediu': D2_RO,
        'email': '@'.join(['contact', '.'.join(['3s', 'md'])]),
        'telefon': ' '.join(['+373', '68', '055', '599']),
        'numar_orc': D2_RO,
        'cod_fiscal': D2_RO,
        'tara': ' '.join(['Republica', 'Moldova']),
        'dpo': '',
    }
    o.update(schimbari)
    return o


def env_operator(operator=None, model='D2', brut=None):
    """`OPERATOR_JSON` pentru caz: `brut` exact asa, altfel JSON-ul cu `model` la radacina (None = fara)."""
    if brut is not None:
        return {'OPERATOR_JSON': brut}
    cfg = {'operator': operator_md() if operator is None else operator}
    if model is not None:
        cfg['model'] = model
    return {'OPERATOR_JSON': json.dumps(cfg, ensure_ascii=False)}


def html_pentru(cale):
    return 'index.html' if cale == '/' else cale.strip('/') + '.html'


# ASEZAREA `ro` (3s.com.ro): romana la radacina, engleza sub /en. Traducerea adreselor din config/juridic-rute.json
# se scrie aici din litere, nu din PREFIXE_ASEZARE din poarta: o proba construita din aceeasi constanta ar trece si
# cu o constanta gresita. Sincronizarea constantei cu src/lib/asezare.ts o masoara prefixe_asezare_sincron().
VAR_ASEZARE = 'NEXT_PUBLIC_SITE_' + 'ASEZARE'
VAR_FAMILIE = 'NEXT_PUBLIC_FAMILIE_' + 'JURIDICA'


def servita_ro(cale, limba):
    """Adresa servita pe asezarea `ro` a unei adrese sursa (asezarea `md`)."""
    if limba == 'ro':
        assert cale == '/ro' or cale.startswith('/ro/'), cale
        return cale[len('/ro'):] or '/'
    return '/en' + ('' if cale == '/' else cale)


def arbore_md(operator=None, limbi=('ro', 'en'), lipsa=(), fara_legatura=(), in_plus=None, marcaj_en=True,
              fisiere_in_plus=None, asezare=None, env_build=None, legatura=None):
    """Un build al domeniului 3s.md: startul, documentele publicate la poarta curenta in fiecare limba si
    datele firmei NUMAI pe pagina de informatii legale; pe fiecare pagina legatura spre informatiile
    legale in romana. `config/operator.json` ramane pe null: operatorul vine din mediu (env_operator).
    `lipsa` = adrese nescrise; `fara_legatura` = adrese fara legatura; `in_plus` = {adresa: html in plus};
    `marcaj_en` False = pagina EN poarta marcajul romanesc (greseala de compunere).
    `asezare` None = fara `.next/required-server-files.json` (arborii de dinainte); `md` sau `ro` = fisierul scris
    ca de next.config.ts, iar pe `ro` paginile stau la adresele SERVITE (3s.com.ro), cu care se numesc si in
    `lipsa`, `fara_legatura`, `in_plus`. `env_build` = cheile `config.env` scrise exact asa (martorii fisierului
    stricat). `legatura` = adresa legaturii din subsol, implicit informatiile legale in romana la adresa servita."""
    operator = operator or operator_md()
    d = tempfile.mkdtemp(prefix='proba-juridic-md-')
    for rel, continut in (fisiere_in_plus or {}).items():
        scrie(os.path.join(d, *rel.split('/')), continut)
    scrie(os.path.join(d, 'config', 'operator.json'), json.dumps({'operator': None}) + '\n')
    scrie(os.path.join(d, 'config', 'model-d2.json'), config_real('model-d2.json'))
    scrie(os.path.join(d, 'config', 'juridic-rute.json'), config_real('juridic-rute.json'))
    if env_build is None and asezare is not None:
        env_build = {VAR_FAMILIE: 'md'}
        if asezare == 'ro':
            env_build[VAR_ASEZARE] = 'ro'
    if env_build is not None:
        scrie(os.path.join(d, '.next', 'required-server-files.json'), json.dumps({'config': {'env': env_build}}))
    adresa = (lambda c, l: servita_ro(c, l)) if asezare == 'ro' else (lambda c, l: c)  # noqa: E731
    il_ro, il_en = adresa(CALE_IL_RO, 'ro'), adresa(CALE_IL_EN, 'en')
    # Startul: pe 3s.md cel EN (sau RO fara editia EN); pe 3s.com.ro cel RO la radacina si cel EN sub /en.
    pagini = {'/': 'en' if 'en' in limbi else 'ro'}
    if asezare == 'ro':
        pagini = {'/': 'ro', **({servita_ro('/', 'en'): 'en'} if 'en' in limbi else {})}
    for cheie in PUBLICATE_B:
        for limba in limbi:
            pagini[adresa(RUTE_MD['documente'][cheie][limba], limba)] = limba
    for cale, limba in pagini.items():
        if cale in lipsa:
            continue
        corp = ['<html lang="' + limba + '"><head><title>3S</title></head><body>']
        if cale not in fara_legatura:
            corp.append('<footer><a href="' + (legatura or il_ro) + '">Informații legale</a></footer>')
        if cale in (il_ro, il_en):
            for camp in CAMPURI_ID:
                valoare = operator.get(camp, '')
                if limba == 'en' and marcaj_en and valoare == D2_RO and camp in MODEL_D2['campuri']:
                    valoare = D2_EN
                corp.append('<p>' + valoare + '</p>')
        corp.append((in_plus or {}).get(cale, ''))
        corp.append('</body></html>')
        scrie(os.path.join(d, '.next', 'server', 'app', *html_pentru(cale).split('/')), ''.join(corp))
    return d


def cazuri_felia72():
    """Cazurile noi, ca date (CAZURI), rulate de main() pe poarta vie si de mutanti pe copii."""
    curat = 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment'
    # --- regula 1: OPERATOR_JSON, citit din mediul primit ---
    incomplet = dict(DATE_FIRMA)
    incomplet['cod_fiscal'] = 'de completat'
    gol_env = 'L-01  OPERATOR_JSON: operatorul e numit, dar are loc gol la cod_fiscal'
    defineste('env-staging', 'OPERATOR_JSON numeste un operator incomplet, fisierul null: AVERT pe staging',
              lambda: arbore(date_firma=None), 0, ['AVERT    ' + gol_env, 'operator: numit, din OPERATOR_JSON'],
              env=env_operator(incomplet, model=None))
    defineste('env-productie', 'OPERATOR_JSON numeste un operator incomplet: OPRESTE la productie',
              lambda: arbore(date_firma=None), 1, 'OPRESTE  ' + gol_env, mediu='productie',
              env=env_operator(incomplet, model=None))
    defineste('env-null', 'OPERATOR_JSON = {"operator": null} bate fisierul care numeste unul: nimic de cerut',
              lambda: arbore(cu_rute=False), 0, ['L-01: NU SE APLICA', curat], mediu='productie',
              env=env_operator(brut='{"operator": null}'))
    defineste('env-gol', 'OPERATOR_JSON goala = nesetata: decide fisierul',
              lambda: arbore(), 0, ['operator: numit, din config/operator.json', curat], mediu='productie',
              env=env_operator(brut='   '))
    defineste('env-stricat', 'OPERATOR_JSON stricat: OPRESTE L-01 si pe staging',
              lambda: arbore(), 1, 'OPRESTE  L-01  OPERATOR_JSON: nu e JSON valid', env=env_operator(brut='{"operator": '))
    defineste('env-site-env', 'SITE_ENV=productie fara --mediu: locul gol din OPERATOR_JSON OPRESTE',
              lambda: arbore(date_firma=None), 1, ['OPRESTE  ' + gol_env, 'MEDIU: productie'], mediu=None,
              env=dict(env_operator(incomplet, model=None), SITE_ENV='productie'))
    # --- regula 2: exceptia D2 ---
    avert_d2 = ['AVERT    L-01  model D2: ' + c + ' poarta marcajul decis' for c in MODEL_D2['campuri']]
    defineste('d2-staging', 'model D2 cu marcajul pe cele trei campuri: AVERT pe staging si linia "model D2"',
              arbore_md, 0, avert_d2 + ['model D2: aprins din OPERATOR_JSON', 'familie juridica: md'], env=env_operator())
    defineste('d2-productie', 'model D2 cu marcajul decis: tot AVERT la productie (riscul acceptat de owner)',
              arbore_md, 0, avert_d2 + ['DEFECTE JURIDICE: 0 care opresc, 3 de avertisment'], mediu='productie',
              env=env_operator())
    defineste('d2-nfd', 'marcajul D2 scris descompus (NFD) e acelasi marcaj: AVERT la productie',
              arbore_md, 0, avert_d2[0], mediu='productie',
              env=env_operator(operator_md(sediu=unicodedata.normalize('NFD', D2_RO))))
    gol_md = 'OPRESTE  L-01  OPERATOR_JSON: operatorul e numit, dar are loc gol la '
    defineste('d2-fara-model', 'marcajul fara "model": OPRESTE la productie, cu temeiul Legii 284/2004',
              arbore_md, 1, [gol_md + 'sediu, numar_orc, cod_fiscal | TEMEI: Legea 284/2004'], mediu='productie',
              env=env_operator(model=None), absent='model D2: aprins')
    defineste('d2-model-in-obiect', '"model" pus in obiectul firmei nu aprinde modelul: OPRESTE la productie',
              arbore_md, 1, gol_md + 'sediu, numar_orc, cod_fiscal', mediu='productie',
              env=env_operator(operator_md(model='D2'), model=None))
    defineste('d2-pe-denumire', 'marcajul D2 pe denumire (camp neadmis): OPRESTE la productie',
              arbore_md, 1, gol_md + 'denumire |', mediu='productie', env=env_operator(operator_md(denumire=D2_RO)))
    defineste('d2-fara-diacritice', 'marcajul D2 fara diacritice: OPRESTE la productie',
              arbore_md, 1, gol_md + 'sediu |', mediu='productie',
              env=env_operator(operator_md(sediu=''.join(ch for ch in unicodedata.normalize('NFD', D2_RO)
                                                         if unicodedata.category(ch) != 'Mn'))))
    defineste('d2-alt-text', 'alt text intre paranteze pe un camp admis: OPRESTE la productie',
              arbore_md, 1, gol_md + 'sediu |', mediu='productie', env=env_operator(operator_md(sediu='[in ' + 'lucru]')))
    defineste('d2-model-necunoscut', 'alta valoare a lui "model": OPRESTE si pe staging',
              arbore_md, 1, 'OPRESTE  L-01  OPERATOR_JSON: model necunoscut "D3"', env=env_operator(model='D3'))
    # --- regula 3: marcajele din paginile juridice (J-01) si acoladele duble ---
    pag_ro = RUTE_MD['documente']['confidentialitate']['ro']
    n23 = '[N23: ' + 'țara gazdei]'
    defineste('j01-staging', 'marcaj fara decizie (N23) pe o pagina juridica: AVERT pe staging',
              lambda: arbore_md(in_plus={pag_ro: '<p>Serverele ' + n23 + '</p>'}), 0, 'AVERT    J-01',
              env=env_operator())
    defineste('j01-productie', 'marcaj fara decizie (N23) pe o pagina juridica: OPRESTE la productie',
              lambda: arbore_md(in_plus={pag_ro: '<p>Serverele ' + n23 + '</p>'}), 1, 'OPRESTE  J-01', mediu='productie',
              env=env_operator())
    rep_ue = '[reprezentant în UE: ' + 'în curs de desemnare]'
    defineste('j01-reprezentant', 'marcajul reprezentantului in UE nu e admis: OPRESTE la productie',
              lambda: arbore_md(in_plus={CALE_IL_RO: '<p>' + rep_ue + '</p>'}), 1, 'OPRESTE  J-01', mediu='productie',
              env=env_operator())
    termeni = RUTE_MD['documente']['termeni']
    admise = {termeni['ro']: '<p>Vezi [de publicat ' + 'înainte de primul client].</p>',
              termeni['en']: '<p>See [to be published ' + 'before the first client].</p>'}
    defineste('j01-admise', 'marcajele admise (cele trei din 04, RO si EN): nicio constatare J-01 la productie',
              lambda: arbore_md(in_plus=admise), 0, 'DEFECTE JURIDICE: 0 care opresc, 3 de avertisment', mediu='productie',
              env=env_operator(), absent='    J-01  ')
    legaturi = {pag_ro: '<p><a href="/legal/privacy">[Privacy policy]</a> si [Termeni](' + termeni['ro'] + ')</p>'
                        '<script>self.__next_f.push([1,"[N23: ' + 'x]"])</script>'}
    defineste('j01-legaturi', 'legaturile si payload-ul din <script> nu sunt marcaje: nicio constatare J-01',
              lambda: arbore_md(in_plus=legaturi), 0, None, mediu='productie', env=env_operator(), absent='    J-01  ')
    # Marcajul D2 e admis in J-01 NUMAI cu modelul aprins: stins, cel ramas pe pagina juridica e J-01.
    il_ro_html = '.next/server/app/' + html_pentru(CALE_IL_RO)
    defineste('j01-d2-fara-model', 'marcajul D2 pe pagina juridica, modelul stins: J-01 OPRESTE la productie',
              arbore_md, 1, 'OPRESTE  J-01  ' + il_ro_html + ': marcaj fara decizie pe pagina juridica ' + D2_RO,
              mediu='productie', env=env_operator(model=None))
    defineste('j01-d2-cu-model', 'control: acelasi build cu modelul aprins nu are J-01 pe marcajul D2',
              arbore_md, 0, None, mediu='productie', env=env_operator(), absent='    J-01  ')
    acolade = '{' * 2 + 'cale:termeni' + '}' * 2
    defineste('j01-acolade', 'acolade duble in HTML-ul construit: OPRESTE si pe staging',
              lambda: arbore_md(in_plus={'/': '<p>Vezi ' + acolade + '</p>'}), 1, 'OPRESTE  J-01', env=env_operator())
    # --- regula 4: familia md ---
    defineste('md-verde', 'familia md completa: date numai pe informatiile legale, legatura pe fiecare pagina: verde',
              arbore_md, 0, 'familie juridica: md', mediu='productie', env=env_operator(), absent=['OPRESTE', 'L-15  '])
    defineste('md-control-see', 'control: acelasi build cu tara din SEE cere datele pe FIECARE pagina (OPRESTE)',
              arbore_md, 1, 'nu apare in pagina livrata | TEMEI: Legea 365/2002', mediu='productie',
              env=env_operator(operator_md(tara='Romania')))
    defineste('md-fara-legatura-staging', 'o pagina fara legatura spre informatiile legale in romana: AVERT pe staging',
              lambda: arbore_md(fara_legatura={'/'}), 0, 'AVERT    L-01  .next/server/app/index.html: familia md: nicio legatura',
              env=env_operator())
    defineste('md-fara-legatura', 'o pagina fara legatura spre informatiile legale in romana: OPRESTE la productie',
              lambda: arbore_md(fara_legatura={'/'}), 1, 'OPRESTE  L-01  .next/server/app/index.html: familia md: nicio legatura',
              mediu='productie', env=env_operator())
    # Legatura pe FIECARE pagina: lipsa pe o pagina care NU e prima la sortare (index.html iese primul).
    term_ro = RUTE_MD['documente']['termeni']['ro']
    term_html = '.next/server/app/' + html_pentru(term_ro)
    defineste('md-fara-legatura-alta-pagina', 'legatura lipsa numai pe ' + term_ro + ': OPRESTE la productie pe pagina aceea',
              lambda: arbore_md(fara_legatura={term_ro}), 1, 'OPRESTE  L-01  ' + term_html + ': familia md: nicio legatura',
              mediu='productie', env=env_operator(), absent='index.html: familia md: nicio legatura')
    defineste('md-fara-il-en', 'editia EN fara pagina de informatii legale EN: OPRESTE la productie',
              lambda: arbore_md(lipsa={CALE_IL_EN}), 1, 'lipseste pagina de informatii legale in limba en',
              mediu='productie', env=env_operator())
    defineste('md-marcaj-ro-pe-en', 'pagina EN cu marcajul romanesc in loc de cel englezesc: OPRESTE',
              lambda: arbore_md(marcaj_en=False), 1, 'campul sediu din OPERATOR_JSON nu apare pe pagina de informatii '
              'legale (en)', mediu='productie', env=env_operator())
    priv_en = RUTE_MD['documente']['confidentialitate']['en']
    defineste('md-fara-pagina-b', 'un document de la poarta B lipsa in EN: OPRESTE L-15 la productie',
              lambda: arbore_md(lipsa={priv_en}), 1, 'OPRESTE  L-15  familia md: lipseste pagina juridica ' + priv_en,
              mediu='productie', env=env_operator())
    sursa_en = {'src/app/(en)' + priv_en + '/page.en.tsx': 'export default function P() { return <p>x</p> }\n'}
    defineste('md-pagina-in-sursa', 'documentul gasit in sursa ca page.en.tsx sub un grup de rute: fara L-15',
              lambda: arbore_md(lipsa={priv_en}, fisiere_in_plus=sursa_en), 0, None, mediu='productie',
              env=env_operator(), absent='L-15  ')
    adresa_gtag = 'https://www.' + 'googletag' + 'manager.com/' + 'gtag' + '/js?id='
    defineste('md-layout-sursa', 'layout.<sufix>.tsx e citit ca sursa: un nume de tert in el e C-01',
              lambda: arbore_md(fisiere_in_plus={'src/app/(en)/layout.en.tsx': 'const A = "' + adresa_gtag + '";\n'}),
              1, 'src/app/(en)/layout.en.tsx: apare furnizorul tert', env=env_operator())
    # --- regula 4, pe asezare (3s.com.ro): documentele se cauta la adresele SERVITE de build ---
    citita_ro = 'asezare: ro (din .next/required-server-files.json)'
    defineste('ro-verde', 'asezarea ro: documentele la /juridic/... si /en/legal/..., legatura spre /juridic/...: verde',
              lambda: arbore_md(asezare='ro'), 0, [citita_ro, 'familie juridica: md'], mediu='productie',
              env=env_operator(), absent=['OPRESTE', 'L-15  ', 'nicio legatura'])
    defineste('md-cu-profil', 'build md cu fisierul de profil (fara cheia asezarii): verde, ca fara fisier',
              lambda: arbore_md(asezare='md'), 0, 'asezare: md (din .next/required-server-files.json)', mediu='productie',
              env=env_operator(), absent=['OPRESTE', 'L-15  '])
    term_ro_servit = servita_ro(term_ro, 'ro')
    defineste('ro-fara-pagina', 'asezarea ro: o pagina juridica scoasa din build e prinsa la adresa servita (L-15)',
              lambda: arbore_md(asezare='ro', lipsa={term_ro_servit}), 1,
              'OPRESTE  L-15  familia md: lipseste pagina juridica ' + term_ro_servit + ' (termeni, ro',
              mediu='productie', env=env_operator())
    priv_en_servit = servita_ro(priv_en, 'en')
    defineste('ro-fara-pagina-en', 'asezarea ro: documentul EN lipsa de sub /en e prins (L-15)',
              lambda: arbore_md(asezare='ro', lipsa={priv_en_servit}), 1,
              'OPRESTE  L-15  familia md: lipseste pagina juridica ' + priv_en_servit + ' (confidentialitate, en',
              mediu='productie', env=env_operator())
    defineste('ro-la-adresele-md', 'profil ro, dar paginile la adresele 3s.md: lipsesc la adresele servite (L-15)',
              lambda: arbore_md(asezare='md', env_build={VAR_FAMILIE: 'md', VAR_ASEZARE: 'ro'}), 1,
              ['OPRESTE  L-15  familia md: lipseste pagina juridica ' + servita_ro(CALE_IL_RO, 'ro') + ' ',
               'OPRESTE  L-15  familia md: lipseste pagina juridica ' + servita_ro(CALE_IL_EN, 'en') + ' '],
              mediu='productie', env=env_operator())
    defineste('ro-legatura-veche', 'asezarea ro: legatura spre adresa 3s.md a informatiilor legale nu tine loc (L-01)',
              lambda: arbore_md(asezare='ro', legatura=CALE_IL_RO), 1,
              'familia md: nicio legatura spre informatiile legale in romana (' + servita_ro(CALE_IL_RO, 'ro') + ')',
              mediu='productie', env=env_operator())
    marcaj_proba = '[' + 'de ' + 'completat' + ']'
    defineste('ro-j01-en', 'asezarea ro: marcajul de pe documentul EN de sub /en e prins (J-01)',
              lambda: arbore_md(asezare='ro', in_plus={priv_en_servit: '<p>' + marcaj_proba + '</p>'}), 1,
              'OPRESTE  J-01  .next/server/app/' + html_pentru(priv_en_servit) + ': marcaj fara decizie',
              mediu='productie', env=env_operator())
    defineste('ro-fara-martor', 'fisierul de profil fara cheia-martor: asezarea nu se poate citi, NEMASURAT (3)',
              lambda: arbore_md(asezare='ro', env_build={VAR_ASEZARE: 'ro'}), 3,
              'nu are config.env.' + VAR_FAMILIE, mediu='productie', env=env_operator())
    defineste('ro-asezare-necunoscuta', 'asezare necunoscuta in build: NEMASURAT (3)',
              lambda: arbore_md(asezare='ro', env_build={VAR_FAMILIE: 'md', VAR_ASEZARE: 'x' + 'y'}), 3,
              'nu e o asezare cunoscuta', mediu='productie', env=env_operator())
    # --- regula 5: C-01 dupa rel, si gazdele proprii ---
    straina = 'https://gazda-' + 'straina.test/x'
    head = lambda el: ['<link ' + el + ' href="' + straina + '"/>']  # noqa: E731
    defineste('c01-canonical', 'canonical si alternate spre o gazda straina: 0 C-01 la productie',
              lambda: arbore(head('rel="canonical"') + head('rel="alternate" hreflang="en"')), 0, curat, mediu='productie')
    defineste('c01-alt-stylesheet', 'rel="alternate stylesheet" spre tert: C-01',
              lambda: arbore(head('rel="alternate stylesheet"')), 1, 'C-01')
    defineste('c01-preconnect', 'rel="preconnect" spre tert: C-01', lambda: arbore(head('rel="preconnect"')), 1, 'C-01')
    defineste('c01-fara-rel', '<link> fara rel spre tert ramane resursa: C-01', lambda: arbore(head('as="style"')), 1, 'C-01')
    defineste('gazda-3s-ro', 'imagine de pe 3s.ro (nu e a noastra): C-01',
              lambda: arbore(['<img src="https://' + '3s' + '.ro/a.png"/>']), 1, 'tertul 3s.ro')
    defineste('gazde-proprii', 'imagini de pe 3s.md si 3s.com.ro: 0 C-01',
              lambda: arbore(['<img src="https://3s' + '.md/a.png"/><img src="https://3s.com' + '.ro/b.png"/>']), 0, curat)
    # --- L-10 pe identificator ---
    cod = 'randuri.push(["IDNO", campFirma(c, "numar' + '_orc")], ["Firma", c.oper' + 'ator.denumire]);\n'
    defineste('l10-identificator', 'L-10: cheia numar_orc langa c.operator, in cod: nu e numar de operator',
              lambda: arbore(fisiere_in_plus={'src/content/juridic/md/x.en.ts': cod}), 0, curat)
    defineste('l10-diacritice', 'L-10: textul vizibil cu diacritice ramane prins',
              lambda: arbore(['<p>Numărul de înregistrare ca ' + 'operator de date: 1.</p>']), 1, 'L-10')


# Mutantii: (nume, [(ancora, inlocuitor)], cazurile care trebuie sa se inroseasca). Ancorele se lipesc din
# bucati unde ar purta literal ce vaneaza poarta.
MUTANTI = [
    ('1: OPERATOR_JSON ignorat', [("brut = (mediu_proces or {}).get(VARIABILA_OPERATOR)", 'brut = None')],
     ['env-staging', 'env-productie', 'env-null']),
    ('1: variabila goala luata drept setata', [("if brut is not None and brut.strip() != '':", 'if brut is not None:')],
     ['env-gol']),
    ('1: mediul citit din os.environ in analizeaza (martori contaminati)',
     [('    mediu_proces = mediu_proces or {}\n', '    mediu_proces = dict(os.environ)\n')], ['d2-staging', 'md-verde']),
    ('1: main() nu transmite mediul', [('analizeaza(radacina, a.mediu, mediu_proces)', 'analizeaza(radacina, a.mediu)')],
     ['env-staging', 'env-site-env']),
    ('2: exceptia D2 scoasa', [('cu_marcaj = [camp for camp in goale if este_marcaj_d2(model, camp, date.get(camp))]',
                                'cu_marcaj = []')], ['d2-productie']),
    ('2: marcajul admis pe orice camp', [("camp in model['campuri'] and isinstance(valoare, str)", 'isinstance(valoare, str)')],
     ['d2-pe-denumire']),
    ('2: marcajul comparat fara diacritice',
     [("nfc(valoare) == nfc(model['marcaj']['ro'])",
       "fara_diacritice(nfc(valoare)) == fara_diacritice(nfc(model['marcaj']['ro']))")], ['d2-fara-diacritice']),
    ('2: modelul aprins si fara "model"',
     [("if not isinstance(cfg, dict) or 'model' not in cfg:", 'if not isinstance(cfg, dict):'),
      ("if cfg['model'] != 'D2':", "if cfg.get('model', 'D2') != 'D2':")], ['d2-fara-model']),
    ('2: orice valoare a lui "model" acceptata', [("if cfg['model'] != 'D2':", 'if False:')], ['d2-model-necunoscut']),
    ('3: registrul de marcaje admite tot', [('if nfc(marcaj) not in admise:', 'if False:')],
     ['j01-staging', 'j01-productie', 'j01-reprezentant']),
    ('3: acoladele duble nu mai opresc', [("if '" + '{' * 2 + "' in html_fara_cod(text):", 'if False:')], ['j01-acolade']),
    ('3: legaturile in stil markdown luate drept marcaje', [(r"\](?!\()', text_vizibil", r"\]', text_vizibil")],
     ['j01-legaturi']),
    ('3: marcajul D2 admis si cu modelul stins',
     [('    admise = dict((nfc(k), v) for k, v in MARCAJE_ADMISE.items())\n',
       '    admise = dict((nfc(k), v) for k, v in MARCAJE_ADMISE.items())\n'
       '    model = model or incarca_json(radacina, CALE_MODEL_D2)[0]\n')],
     ['j01-d2-fara-model']),
    ('4: familia md nerecunoscuta', [("return 'md' if n in TARI_MD else None", 'return None')], ['md-verde']),
    ('4: legatura spre informatiile legale necontrolata', [('if not are_legatura(text, cale_ro):', 'if False:')],
     ['md-fara-legatura-staging', 'md-fara-legatura']),
    ('4: legatura verificata numai pe prima pagina construita',
     [('    for nume, text in construite:\n        if not are_legatura(text, cale_ro):',
       '    for nume, text in construite[:1]:\n        if not are_legatura(text, cale_ro):')],
     ['md-fara-legatura-alta-pagina']),
    ('4: pagina EN cautata cu marcajul romanesc', [("valoare = model['marcaj'][limba] if", "valoare = model['marcaj']['ro'] if")],
     ['md-verde']),
    ('4: L-15 md pe tiparele fixe SEE', [('        return verifica_rute_md(radacina, construite, sever_prezenta, cu_banner)\n',
                                          '        pass\n')], ['md-verde', 'md-fara-pagina-b']),
    ('4: page.<sufix>.tsx nerecunoscut', [(r"page(?:\.[a-z0-9-]+)?\.tsx|page", r"page\.tsx|page")], ['md-pagina-in-sursa']),
    ('5: rel ignorat', [("if m.group(1).lower() == 'link' and link_fara_incarcare(m.group(2)):", 'if False:')],
     ['c01-canonical']),
    ('5: o singura valoare fara incarcare ajunge', [('all(v in REL_FARA_INCARCARE for v in valori)',
                                                     'any(v in REL_FARA_INCARCARE for v in valori)')], ['c01-alt-stylesheet']),
    ('5: orice <link> exclus', [('return bool(valori) and all(', 'return True or all(')], ['c01-preconnect']),
    ('5: <link> fara rel exclus', [('    if m is None:\n        return False\n    valori', '    if m is None:\n        return True\n    valori')],
     ['c01-fara-rel']),
    ('5: 3s.ro pus inapoi in GAZDE_PROPRII', [("GAZDE_PROPRII = {'3s4.ke2.in',", "GAZDE_PROPRII = {'3s" + ".ro', '3s4.ke2.in',")],
     ['gazda-3s-ro']),
    ('5: 3s.md scos din GAZDE_PROPRII', [("'3s.md', '3s.com.ro', 'localhost'", "'3s.com.ro', 'localhost'")],
     ['gazde-proprii']),
    ('6: adresele lasate in forma 3s.md (asezarea ignorata la traducere)',
     [("dict((l, cale_servita(d[l], l, asezare)) for l in ('ro', 'en'))", "dict((l, d[l]) for l in ('ro', 'en'))")],
     ['ro-verde', 'ro-fara-pagina', 'ro-legatura-veche', 'ro-j01-en']),
    ('6: cheia asezarii din build ignorata', [('    brut = env.get(VARIABILA_ASEZARE)\n', '    brut = None\n')],
     ['ro-verde', 'ro-fara-pagina']),
    ('6: fisierul fara cheia-martor citit drept md',
     [('if not isinstance(env, dict) or VARIABILA_MARTOR_BUILD not in env:', 'if not isinstance(env, dict):')],
     ['ro-fara-martor']),
    ('6: asezarea necunoscuta acceptata', [('    if valoare not in PREFIXE_ASEZARE:\n', '    if False:\n')],
     ['ro-asezare-necunoscuta']),
    ('6: main() nu mai refuza asezarea necitibila',
     [('    if asezare is None:\n        print(', '    if False:\n        print(')], ['ro-fara-martor']),
    ('6: engleza servita tot la radacina pe ro',
     [("'ro': {'ro': '', 'en': '/en'}}", "'ro': {'ro': '', 'en': ''}}")], ['ro-verde', 'ro-fara-pagina-en']),
    ('L-10: tiparul vechi, cu identificatori', [(r"r'(?<![\w.])num[ae]r[^\W\d_]*(?!\w).{0,120}?\boperator'",
                                                 r"r'\bnum[ae]r\w*\b.{0,120}?\boperator'")], ['l10-identificator']),
]


def ruleaza_mutanti():
    with open(POARTA, encoding='utf-8') as f:
        sursa = f.read()
    for nume, inlocuiri, cazuri in MUTANTI:
        mutat = sursa
        neaterizat = None
        for ancora, inlocuitor in inlocuiri:
            if mutat.count(ancora) != 1:
                neaterizat = 'ancora apare de ' + str(mutat.count(ancora)) + ' ori: ' + ancora[:70]
                break
            mutat = mutat.replace(ancora, inlocuitor)
        if neaterizat:
            nu('MUTANT ' + nume + ' NEATERIZAT: ' + neaterizat)
            continue
        dosar = tempfile.mkdtemp(prefix='mutant-juridic-')
        try:
            copie = os.path.join(dosar, 'poarta-mutant.py')
            with open(copie, 'w', encoding='utf-8', newline='\n') as f:
                f.write(mutat)
            with open(copie, encoding='utf-8') as f:
                if f.read() == sursa:
                    nu('MUTANT ' + nume + ' NEATERIZAT: copia e identica cu poarta')
                    continue
            rosii = []
            for cheie in cazuri:
                motiv, iesire = ruleaza_caz(cheie, poarta=copie)
                if motiv:
                    cod = re.search(r'^CONTROL PICAT: .*$', iesire, re.M)
                    rosii.append(cheie + ' (' + motiv + ('; ' + cod.group(0)[:90] if cod else '') + ')')
            if rosii:
                ok('MUTANT ' + nume + ': ucis, ' + str(len(rosii)) + '/' + str(len(cazuri)) + ' cazuri rosii: '
                   + '; '.join(rosii))
            else:
                nu('MUTANT ' + nume + ': SUPRAVIETUIESTE pe ' + ', '.join(cazuri))
        finally:
            shutil.rmtree(dosar, ignore_errors=True)


def tari_md_sincron():
    """TARI_MD din poarta = TARI_MD din src/content/juridic/familie.ts (aceeasi lista inchisa)."""
    with open(os.path.join(RADACINA, 'src', 'content', 'juridic', 'familie.ts'), encoding='utf-8') as f:
        ts = re.search(r'export const TARI_MD = \[([^\]]*)\]', f.read())
    with open(POARTA, encoding='utf-8') as f:
        py = re.search(r"^TARI_MD = \(([^)]*)\)", f.read(), re.M)
    if ts is None or py is None:
        nu('TARI_MD: lista nu s-a putut citi (familie.ts ' + str(ts is not None) + ', poarta ' + str(py is not None) + ')')
        return
    lista_ts = re.findall(r'"([^"]+)"', ts.group(1))
    lista_py = re.findall(r"'([^']+)'", py.group(1))
    if lista_ts and lista_ts == lista_py:
        ok('TARI_MD din poarta e aceeasi lista ca in familie.ts: ' + ', '.join(lista_py))
    else:
        nu('TARI_MD difera: familie.ts ' + str(lista_ts) + ', poarta ' + str(lista_py))


def prefixe_asezare_sincron():
    """PREFIXE_ASEZARE din poarta = prefixele din sursa: pe `md` cele ale catalogului editiilor (src/lib/editii.ts,
    din care asezarea `md` se copiaza), pe `ro` cele ale catalogului ASEZARI (src/lib/asezare.ts)."""
    import ast
    with open(os.path.join(RADACINA, 'src', 'lib', 'editii.ts'), encoding='utf-8') as f:
        editii = f.read()
    with open(os.path.join(RADACINA, 'src', 'lib', 'asezare.ts'), encoding='utf-8') as f:
        asezare = f.read()
    with open(POARTA, encoding='utf-8') as f:
        py = re.search(r'^PREFIXE_ASEZARE = (\{.*\})$', f.read(), re.M)
    md_en = re.search(r'\ben: \{ cod: "en", prefix: "([^"]*)"', editii)
    md_ro = re.search(r'"ro-MD": \{ cod: "ro-MD", prefix: "([^"]*)"', editii)
    bloc_ro = re.search(r'\n  ro: \{\n(.*?)\n  \},', asezare, re.S)
    ro_en = re.search(r'\ben: \{ prefix: "([^"]*)"', bloc_ro.group(1)) if bloc_ro else None
    ro_ro = re.search(r'"ro-MD": \{ prefix: "([^"]*)"', bloc_ro.group(1)) if bloc_ro else None
    citite = (py, md_en, md_ro, ro_en, ro_ro)
    if any(m is None for m in citite):
        nu('PREFIXE_ASEZARE: sursa nu s-a putut citi (poarta, editii en, editii ro-MD, asezare ro en, asezare ro ro-MD: '
           + ', '.join(str(m is not None) for m in citite) + ')')
        return
    din_sursa = {'md': {'ro': md_ro.group(1), 'en': md_en.group(1)}, 'ro': {'ro': ro_ro.group(1), 'en': ro_en.group(1)}}
    din_poarta = ast.literal_eval(py.group(1))
    if din_poarta == din_sursa and din_sursa['ro']['en'] != din_sursa['md']['en']:
        ok('PREFIXE_ASEZARE din poarta = catalogul din src/lib/editii.ts si src/lib/asezare.ts: ' + json.dumps(din_sursa))
    else:
        nu('PREFIXE_ASEZARE difera: sursa ' + json.dumps(din_sursa) + ', poarta ' + json.dumps(din_poarta))


def main():
    print('proba-juridic: poarta ' + POARTA)

    # --- martorul negativ: proiectul complet si curat nu are voie sa fie prins ---
    caz('proiect complet si curat trece', arbore(), 0)

    # --- martori negativi pentru tiparele care ar putea fi prea late ---
    caz('un link extern normal nu e tert incarcat',
        arbore(['<a href="https://exemplu-extern.test/x">legatura externa</a>']), 0)
    caz('un script de tert CITAT intr-un comentariu nu produce defect',
        arbore(['<!-- nu punem <script src="https://cdn.tert.test/a.js"></script> aici -->']), 0)
    caz('cuvantul operator singur, fara numar langa el, nu produce defect',
        arbore(['<p>Operatorul de date raspunde la cererile primite.</p>']), 0)

    # --- L-09: platforma SOL / ODR, poarta de absenta, opreste pe orice mediu ---
    odr = 'https://ec.europa.eu/' + 'consumers' + '/' + 'odr'
    caz('link ODR opreste', arbore(['<a href="' + odr + '">SOL</a>']), 1, 'L-09')
    sintagma = 'solutionarea' + ' online a litigiilor'
    caz('sintagma SOL in romana opreste',
        arbore(['<p>Puteti folosi platforma de ' + sintagma + '.</p>']), 1, 'L-09')
    caz('sintagma SOL cu diacritice opreste',
        arbore(['<p>Platforma de ' + 'soluționarea online a litigiilor' + '.</p>']), 1, 'L-09')

    # --- L-10: numar de inregistrare ca operator ---
    caz('numar de operator de date opreste',
        arbore(['<p>Numarul nostru de inregistrare ca operator de date este 12345.</p>']), 1, 'L-10')

    # --- C-01: terti ---
    caz('script de la tert opreste',
        arbore(['<script src="https://cdn.tert.test/urmarire.js"></script>']), 1, 'C-01')
    caz('iframe de la tert opreste',
        arbore(['<iframe src="https://video.tert.test/embed/1"></iframe>']), 1, 'C-01')
    caz('font de la Google opreste',
        arbore(['<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X"/>']), 1, 'C-01')

    # --- L-05: temeiul formularului ---
    caz('formularul care cere consimtamant opreste',
        arbore(['<p>Prin ' + 'trimiterea formularului' + ' va dati ' + 'consimtamantul' + '.</p>']), 1, 'L-05')

    # --- gradarea pe mediu: acelasi arbore, doua verdicte ---
    caz('rute juridice lipsa: AVERT pe staging', arbore(cu_rute=False), 0, 'AVERT    L-15', mediu='staging')
    caz('rute juridice lipsa: OPRESTE la productie', arbore(cu_rute=False), 1, 'OPRESTE  L-15', mediu='productie')

    incomplet = dict(DATE_FIRMA)
    incomplet['cod_fiscal'] = 'de completat'
    # Martorul POZITIV al comutatorului: operator NUMIT, cu un camp gol.
    # Mesajul intreg, nu doar codul: un comutator ilizibil tot L-01 da, iar cazul trebuie sa
    # masoare locul gol al operatorului numit, nu orice L-01.
    gol_numit = 'L-01  config/operator.json: operatorul e numit, dar are loc gol la cod_fiscal'
    caz('operator numit cu loc gol: AVERT pe staging', arbore(date_firma=incomplet), 0, 'AVERT    ' + gol_numit)
    caz('operator numit cu loc gol: OPRESTE la productie',
        arbore(date_firma=incomplet), 1, 'OPRESTE  ' + gol_numit, mediu='productie')
    lipsa = 'L-01  lipseste config/operator.json'
    caz('comutator lipsa: AVERT pe staging', arbore(cu_config=False), 0, 'AVERT    ' + lipsa)
    caz('comutator lipsa: OPRESTE la productie', arbore(cu_config=False), 1, 'OPRESTE  ' + lipsa, mediu='productie')

    # --- comutatorul operatorului: martorul NEGATIV, pe ambele medii ---
    # Operator null si nicio data de firma in pagina: L-01 nu cere nimic, iar iesirea o spune.
    caz('operator null, fara date de firma: verde pe staging',
        arbore(date_firma=None), 0, 'L-01: NU SE APLICA')
    caz('operator null, fara date de firma: verde si la productie',
        arbore(date_firma=None), 0, 'L-01: NU SE APLICA', mediu='productie')
    # Controlul martorului negativ: acelasi arbore fara operator, dar cu comutatorul lipsa, e rosu
    # la productie (cazul de mai sus). Deci verdele vine din null, nu dintr-o regula oarba.
    caz('operator cu forma gresita (text in loc de obiect): OPRESTE',
        arbore(date_firma=None, operator_brut='{"operator": "de completat"}' + chr(10)), 1, 'OPRESTE  L-01')

    # --- L-15 dupa operator (felia seo-geo-gdpr, decizia owner-ului din 24.09.2026) ---
    # Fara operator, paginile juridice nu se publica, deci lipsa lor nu e defect pe niciun mediu.
    # Cazurile de mai sus, cu operator numit, arata ca aceeasi lipsa ramane rosie la productie.
    caz('operator null, fara pagini juridice: nicio constatare pe staging',
        arbore(date_firma=None, cu_rute=False), 0, 'L-15: NU SE APLICA')
    caz('operator null, fara pagini juridice: nicio constatare nici la productie',
        arbore(date_firma=None, cu_rute=False), 0, 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment',
        mediu='productie')

    # --- L-15, politica de cookie-uri ceruta dupa banner (felia seo-geo-gdpr) ---
    # Bannerul exista numai cand exista ceva de consimtit (GA4), iar GA4 e exceptat de C-01 pe sursa,
    # deci regula veche ("cand C-01 gaseste un tert") nu s-ar fi declansat niciodata. Semnul e bannerul.
    banner = '<section data-' + 'consimtamant="" hidden=""><h2>Cookie-uri</h2></section>'
    fara_cookie = 'L-15  lipseste ruta juridica /cookies'
    pagina_cookie = {'src/app/juridic/cookies/page.tsx': 'export default function P() { return <p>Cookie-uri</p> }\n'}
    caz('banner fara politica de cookie-uri: AVERT pe staging', arbore([banner]), 0, 'AVERT    ' + fara_cookie)
    caz('banner fara politica de cookie-uri: OPRESTE la productie',
        arbore([banner]), 1, 'OPRESTE  ' + fara_cookie, mediu='productie')
    caz('banner fara politica de cookie-uri, operator null: tot OPRESTE la productie',
        arbore([banner], date_firma=None, cu_rute=False), 1, 'OPRESTE  ' + fara_cookie, mediu='productie')
    caz('banner cu politica de cookie-uri la locul din navigatie: verde la productie',
        arbore([banner], fisiere_in_plus=pagina_cookie), 0, 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment',
        mediu='productie')
    caz('fara banner, politica de cookie-uri nu se cere nici la productie',
        arbore(), 0, 'L-15 /cookies: NU SE APLICA', mediu='productie')

    # --- L-15 pe calea intreaga a paginii construite (runda 2 a criticului, 25.09.2026) ---
    # Pana atunci pagina se cauta pe subsir in numele fisierelor construite: un articol de blog cu
    # "cookies" in adresa stingea cerinta politicii, unul cu "termeni" si "confidentialitate" pe ale
    # operatorului. Numele articolelor se scriu din litere, ca proba sa nu se mute cu o constanta.
    # Paginile in plus poarta datele firmei: cu operator numit, L-01 le cere pe FIECARE pagina
    # livrata, iar cazurile de aici trebuie sa masoare numai L-15.
    articol = '<html><body>' + ''.join('<p>' + v + '</p>' for v in DATE_FIRMA.values()) + '</body></html>'
    caz('articol "ghid-cookies" in build, banner fara politica: tot OPRESTE la productie',
        arbore([banner], date_firma=None, cu_rute=False, construite_in_plus={'blog/ghid-cookies.html': articol}),
        1, 'OPRESTE  ' + fara_cookie, mediu='productie')
    caz('articol cu "termeni" si "confidentialitate" in adresa, operator numit fara pagini: OPRESTE la productie',
        arbore(cu_rute=False, construite_in_plus={'blog/termeni-si-confidentialitate-explicate.html': articol}),
        1, ['OPRESTE  L-15  lipseste ruta juridica /confidentialitate',
            'OPRESTE  L-15  lipseste ruta juridica /termeni'], mediu='productie')
    caz('paginile construite la locul din navigatie, fara fisier in sursa: verde la productie',
        arbore([banner], cu_rute=False, construite_in_plus={
            'juridic/confidentialitate.html': articol, 'juridic/termeni.html': articol, 'juridic/cookies.html': articol}),
        0, 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment', mediu='productie')

    # --- C-01, exceptia incarcatorului GA4 (felia seo-geo-gdpr) ---
    # Adresa si calea se lipesc la rulare: proba sta in depozit, iar poarta scaneaza depozitul.
    adresa_gtag = 'https://www.' + 'googletag' + 'manager.com/' + 'gtag' + '/js?id='
    exceptat = 'src/components/consimtamant/' + 'incarcator-ga4.ts'
    cu_adresa = 'const A = "' + adresa_gtag + '";\n'
    caz('numele Google in incarcatorul exceptat nu opreste',
        arbore(date_firma=None, fisiere_in_plus={exceptat: cu_adresa}), 0, 'C-01: exceptie pe sursa')
    caz('numele Google in alt fisier din sursa opreste',
        arbore(date_firma=None, fisiere_in_plus={'src/lib/' + 'analitica.ts': cu_adresa}), 1, 'furnizorul tert')
    caz('incarcatorul exceptat fara numele Google opreste: exceptie fara obiect',
        arbore(date_firma=None, fisiere_in_plus={exceptat: 'export const nimic = 1;\n'}), 1, 'fara obiect')
    inline = ('<script>var s=document.createElement("script");s.src="' + adresa_gtag + 'G-' + 'PROBA3S01";'
              'document.head.appendChild(s)</script>')
    caz('incarcator Google inline in HTML opreste, chiar langa fisierul exceptat',
        arbore([inline], date_firma=None, fisiere_in_plus={exceptat: cu_adresa}), 1, 'index.html: apare furnizorul tert')

    # date complete in configurare, dar ABSENTE din pagina livrata: asta opreste
    # pe orice mediu, fiindca nu e un loc gol, e o neconcordanta.
    d = arbore()
    cale = os.path.join(d, '.next', 'server', 'app', 'index.html')
    html = open(cale, encoding='utf-8').read().replace(DATE_FIRMA['cod_fiscal'], '')
    scrie(cale, html)
    caz('date declarate dar absente din pagina livrata opresc si pe staging', d, 1, 'nu apare in pagina livrata')

    # --- MUTANTUL: dovada ca cazul L-09 chiar trece prin tiparele SOL ---
    mutant_dir = tempfile.mkdtemp(prefix='mutant-juridic-')
    try:
        sursa = open(POARTA, encoding='utf-8').read()
        # se goleste lista de tipare SOL, si numai ea. Codul de dupa `return`
        # ramane pe loc: mutatia e minima si nu atinge nimic altceva.
        ancora = 'def tipare_sol():'
        inlocuitor = 'def tipare_sol():\n    return []  # mutant'
        if sursa.count(ancora) != 1:
            nu('MUTANT NEATERIZAT: ancora nu apare exact o data (' + str(sursa.count(ancora)) + ')')
        else:
            copie = os.path.join(mutant_dir, 'poarta-mutant.py')
            with open(copie, 'w', encoding='utf-8', newline='\n') as f:
                f.write(sursa.replace(ancora, inlocuitor))
            continut = open(copie, encoding='utf-8').read()
            if '# mutant' not in continut:
                nu('MUTANT NEATERIZAT: substitutia nu se regaseste in copie')
            else:
                d = arbore(['<a href="' + odr + '">SOL</a>'])
                try:
                    cod, iesire = ruleaza(d, 'staging', poarta=copie)
                    # 3 e deznodamantul bun: martorul din interiorul portii prinde
                    # mutatia si refuza sa dea verdict. 0 ar insemna ca numai proba
                    # asta apara tiparele. 1 ar insemna ca defectul e prins de alta
                    # ramura, deci cazul nu masoara ce pretinde.
                    if cod == 3 and 'L-09' in iesire:
                        ok('mutantul fara tiparele SOL cade la 3: martorul din poarta l-a prins')
                    elif cod == 0:
                        ok('mutantul fara tiparele SOL iese VERDE: cazul L-09 chiar le ataca')
                    else:
                        nu('mutantul a ramas rosu (cod ' + str(cod) + '): cazul L-09 pica pe altceva\n'
                           + iesire.strip())
                finally:
                    shutil.rmtree(d, ignore_errors=True)
    finally:
        shutil.rmtree(mutant_dir, ignore_errors=True)

    # --- felia 72: aceleasi cazuri pe poarta vie, apoi mutantii pe copii ---
    print('\nfelia 72: OPERATOR_JSON, modelul D2, familia md, J-01, C-01 dupa rel, gazdele proprii, L-10')
    cazuri_felia72()
    for cheie, c in CAZURI.items():
        motiv, iesire = ruleaza_caz(cheie)
        if motiv:
            nu(c['nume'] + ': ' + motiv + '\n' + iesire.strip())
        else:
            ok(c['nume'])
    tari_md_sincron()
    prefixe_asezare_sincron()
    print('\nmutanti pe copii ale portii (fiecare trebuie sa inroseasca macar un caz):')
    ruleaza_mutanti()

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

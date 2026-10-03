#!/usr/bin/env python3
"""Proba portii de reciprocitate hreflang (`poarta-reciprocitate.py`), rulata ca PROCES pe arbori fabricati.

Ce masoara, pe langa controalele din poarta (care probeaza logica in acelasi proces):
  - codul de iesire si mesajul pe fiecare clasa: pereche scoasa (R-01), tinta fara pagina (R-02), pagina fara
    auto-referinta (R-03), pagina din echivalente fara pereche (R-04), alternate pe build-ul ro-RO (R-05);
  - ca profilul se citeste din BUILD (`.next/required-server-files.json`), nu din mediu: acelasi HTML cu
    alternate iese 0 cu profilul 3s.md si 1 cu profilul ro-RO, oricare ar fi `SITE_EDITII` din shell;
  - codul 3 pe: build lipsa, build mai vechi decat src/, profil necitibil, tinta pe alt domeniu si un
    control stricat pe o COPIE a portii (mutant).

Catalogul editiilor din arbori e COPIA fisierului real `src/lib/editii.ts`: poarta il compara cu lista ei, deci
proba masoara si citirea lui. Fixturile HTML se asambleaza la RULARE, din bucati.

`--poarta <cale>` ruleaza proba pe alta copie a portii (de exemplu un mutant, ca sa vezi ca proba il respinge).
Implicit: poarta de langa directorul probelor.

IESIRE: 0 toate cazurile trec - 1 macar unul pica - 3 preconditie lipsa (poarta sau catalogul nu exista)
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

AICI = os.path.dirname(os.path.abspath(__file__))
PORTI = os.path.dirname(AICI)
RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(PORTI)))
CATALOG = os.path.join(RADACINA, 'src', 'lib', 'editii.ts')
CURAT, PICAT, NEMASURAT = 0, 1, 3

T = P = 0
POARTA = os.path.join(PORTI, 'poarta-reciprocitate.py')

BAZA = 'https://' + 'proba-' + 'reciproc.test'
ALT_DOMENIU = 'https://' + 'alt-' + 'domeniu.test'
X = 'x-' + 'default'


def ok(mesaj):
    global T
    T += 1
    print('  OK   ' + mesaj)


def nu(mesaj):
    global P
    P += 1
    print('  PICA ' + mesaj)


def scrie(cale, continut):
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


# ------------------------------------------------------------------ fixturi

def pagina(cale, alternate):
    adresa = BAZA + ('' if cale == '/' else cale)
    bucati = ['<html><head><link rel="canonical" href="' + adresa + '"/>']
    for h, u in alternate:
        bucati.append('<link rel="alternate" hrefLang="' + h + '" href="' + u + '"/>')
    bucati.append('</head><body><h1>x</h1></body></html>')
    return ''.join(bucati)


def pereche(fara_inversa=False, alt_domeniu=False, tinta_lipsa=False, fara_auto=False):
    """Doua pagini juridice in pereche (en, ro-MD, x-default) si o pagina EN fara pereche."""
    en, ro = BAZA + '/legal/doc', BAZA + '/ro/juridic/doc'
    alt_en = [('en', en), ('ro-MD', ro), (X, en)]
    alt_ro = [('ro-MD', ro), ('en', en), (X, en)]
    if fara_inversa:
        alt_ro = [p for p in alt_ro if p[0] != 'en']
    if alt_domeniu:
        alt_en.append(('ro-RO', ALT_DOMENIU + '/juridic/doc'))
    if tinta_lipsa:
        alt_en.append(('fr', BAZA + '/fr/doc'))
    if fara_auto:
        alt_en = [p for p in alt_en if p[0] != 'en']
    return {
        'legal/doc.html': pagina('/legal/doc', alt_en),
        'ro/juridic/doc.html': pagina('/ro/juridic/doc', alt_ro),
        'index.html': pagina('/', [('en', BAZA), (X, BAZA)]),
    }


def echivalente(intrari):
    randuri = ['export const ECHIVALENTE: Readonly<Record<string, CaiPeEditie>> = {']
    for cheie, cai in intrari.items():
        randuri.append('  "' + cheie + '": { ' + ', '.join('"' + c + '": "' + v + '"' for c, v in cai.items()) + ' },')
    randuri.append('};')
    return '\n'.join(randuri) + '\n'


ECH_DOC = {'doc': {'en': '/legal/doc', 'ro-MD': '/ro/juridic/doc'}}


def env_build(editii):
    """`config.env` cum il scrie Next din `next.config.ts`: profilul numai pe 3s.md, cheia martor mereu."""
    env = {'NEXT_PUBLIC_OPERATOR_NUMIT': 'true', 'NEXT_PUBLIC_FAMILIE_JURIDICA': 'md'}
    if editii is not None:
        env['NEXT_PUBLIC_SITE_EDITII'] = editii
    return env


def arbore(html, ech=ECH_DOC, env='en,ro-MD', fara_martor=False, build_vechi=False, fara_build=False):
    d = tempfile.mkdtemp(prefix='proba-reciprocitate-')
    os.makedirs(os.path.join(d, 'src', 'lib'))
    shutil.copyfile(CATALOG, os.path.join(d, 'src', 'lib', 'editii.ts'))
    scrie(os.path.join(d, 'src', 'content', 'echivalente.ts'), echivalente(ech))
    if not fara_build:
        e = env_build(env)
        if fara_martor:
            e.pop('NEXT_PUBLIC_FAMILIE_JURIDICA')
        scrie(os.path.join(d, '.next', 'required-server-files.json'), json.dumps({'version': 1, 'config': {'env': e}}))
        for rel, continut in html.items():
            scrie(os.path.join(d, '.next', 'server', 'app', *rel.split('/')), continut)
    # Datele fisierelor se pun explicit, nu se lasa ordinii scrierii: sursa cu o ora inainte de build, sau dupa.
    acum = time.time()
    t_sursa, t_build = (acum, acum - 3600) if build_vechi else (acum - 3600, acum)
    for radacina, _, nume in os.walk(d):
        for n in nume:
            cale = os.path.join(radacina, n)
            t = t_build if os.sep + '.next' + os.sep in cale + os.sep else t_sursa
            os.utime(cale, (t, t))
    return d


def ruleaza_poarta(poarta, radacina):
    # Mediul shell-ului NU trebuie sa conteze (profilul vine din build): proba pune intentionat un profil
    # contrar in mediu, ca un verdict care l-ar citi sa se vada.
    env = dict(os.environ, SITE_EDITII='ro-' + 'RO', NEXT_PUBLIC_SITE_EDITII='')
    r = subprocess.run([sys.executable, poarta, '--radacina', radacina], capture_output=True, text=True,
                       encoding='utf-8', errors='replace', env=env)
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def caz(eticheta, construieste, cod_asteptat, contine=(), poarta=None):
    d = construieste()
    try:
        cod, iesire = ruleaza_poarta(poarta or POARTA, d)
    finally:
        shutil.rmtree(d, ignore_errors=True)
    if cod != cod_asteptat:
        nu(eticheta + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
        return
    for text in contine:
        if text not in iesire:
            nu(eticheta + ': iesirea nu contine "' + text + '"\n' + iesire.strip())
            return
    ok(eticheta)


def mutant(eticheta, ancora, inlocuitor, construieste, cod_asteptat, contine):
    """Ruleaza o COPIE a portii, cu o substitutie verificata ca a aterizat."""
    d = tempfile.mkdtemp(prefix='proba-reciprocitate-mutant-')
    try:
        text = open(POARTA, encoding='utf-8').read()
        if text.count(ancora) != 1:
            nu(eticheta + ': MUTANT NEATERIZAT (ancora apare de ' + str(text.count(ancora)) + ' ori)')
            return
        copie = os.path.join(d, 'poarta-reciprocitate.py')
        scrie(copie, text.replace(ancora, inlocuitor))
        if inlocuitor not in open(copie, encoding='utf-8').read():
            nu(eticheta + ': MUTANT NEATERIZAT (substitutia nu se vede pe copie)')
            return
        caz(eticheta, construieste, cod_asteptat, contine, poarta=copie)
    finally:
        shutil.rmtree(d, ignore_errors=True)


def main():
    global POARTA
    p = argparse.ArgumentParser(description='Proba portii de reciprocitate hreflang, ca proces.')
    p.add_argument('--poarta', default=POARTA, help='calea portii probate (implicit cea de langa probe)')
    a = p.parse_args()
    POARTA = os.path.abspath(a.poarta)
    for cale in (POARTA, CATALOG):
        if not os.path.isfile(cale):
            print('NEMASURAT: lipseste ' + cale, file=sys.stderr)
            return 3

    print('proba-reciprocitate: ' + POARTA)
    print('\n## 3s.md (en, ro-MD), profilul din build')
    caz('pereche reciproca, plus o pagina fara pereche: cod 0', lambda: arbore(pereche()), CURAT,
        ('PROFIL (din build): en,ro-MD', '2 cu pereche hreflang'))
    caz('pereche scoasa (ro-MD fara en): cod 1, R-01 numeste pagina', lambda: arbore(pereche(fara_inversa=True)),
        PICAT, ('R-01', '/ro/juridic/doc nu listeaza en'))
    caz('tinta fara pagina in build: cod 1, R-02', lambda: arbore(pereche(tinta_lipsa=True)), PICAT, ('R-02', '/fr/doc'))
    caz('pagina fara auto-referinta: cod 1, R-03', lambda: arbore(pereche(fara_auto=True)), PICAT, ('R-03', '/legal/doc'))
    caz('pereche in echivalente, fara alternate pe pagini: cod 1, R-04',
        lambda: arbore(pereche(), ech=dict(ECH_DOC, acasa={'en': '/', 'ro-MD': '/ro'})), PICAT, ('R-04', '/ro'))
    caz('tinta pe alt domeniu: cod 3, numita', lambda: arbore(pereche(alt_domeniu=True)), NEMASURAT,
        ('alt domeniu', ALT_DOMENIU))

    print('\n## ro-RO (build fara NEXT_PUBLIC_SITE_EDITII)')
    caz('ro-RO fara alternate: cod 0', lambda: arbore({'index.html': pagina('/', [])}, ech=ECH_DOC, env=None), CURAT,
        ('PROFIL (din build): ro-RO',))
    caz('ro-RO cu alternate: cod 1, R-05', lambda: arbore(pereche(), env=None), PICAT, ('R-05',))

    print('\n## NEMASURAT')
    caz('build lipsa: cod 3', lambda: arbore({}, fara_build=True), NEMASURAT, ('niciun HTML construit',))
    caz('build mai vechi decat src/: cod 3', lambda: arbore(pereche(), build_vechi=True), NEMASURAT, ('mai vechi',))
    caz('profil necitibil (fara cheia martor): cod 3', lambda: arbore(pereche(), fara_martor=True), NEMASURAT,
        ('NEXT_PUBLIC_FAMILIE_JURIDICA',))
    # Controlul stricat pe o COPIE: verificarea inversei nu mai compara nimic, deci martorul R-01 al portii
    # nu mai e prins si poarta trebuie sa iasa 3, nu 0.
    mutant('control picat (verificarea inversei dezarmata pe copie): cod 3, nu 0',
           'if inverse.get(cod) != proprie:', 'if False:', lambda: arbore(pereche()), NEMASURAT, ('CONTROL PICAT',))

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

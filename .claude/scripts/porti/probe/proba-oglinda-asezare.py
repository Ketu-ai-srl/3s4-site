#!/usr/bin/env python3
"""Proba portii oglinzii asezarii (`poarta-oglinda-asezare.py`), rulata ca PROCES pe arbori si colectii fabricate.

Ce masoara, pe langa controalele din poarta (care probeaza logica in acelasi proces):
  - pe arborele REAL al depozitului: cod 0, cu un numar nenul de surse si de geamane citite;
  - pe o COPIE a lui `src/app` (fisierele reale, nu un arbore inventat): o geamana stearsa iese cod 1 cu OA-01 care o
    numeste; o geamana cu un rand de continut propriu iese OA-03; un `page.tsx` pus in grupul asezarii iese OA-04;
    pagina de negasit a asezarii stearsa iese OA-05;
  - pe build (`--colectie` / `--perechi`, fixturi asamblate la rulare): egalitate cod 0 cu numarul cailor; o cale in plus
    si una lipsa cod 1; o cale asteptata prezenta dar servita cu 404 cod 1 (OA-11); colectie ilizibila cod 3; folosire
    gresita cod 2;
  - un arbore fara surse iese 3 (zero nu e curat);
  - trei mutante pe COPII ale portii (verificarea geamanei lipsa dezarmata; comparatia pe build dezarmata; verificarea
    statusului dezarmata): poarta trebuie sa iasa 3 (controlul ei picat), nu 0.

`--poarta <cale>` ruleaza proba pe alta copie a portii (de exemplu un mutant, ca sa se vada ca proba il respinge).
Implicit: poarta de langa directorul probelor.

IESIRE: 0 toate cazurile trec - 1 macar unul pica - 3 preconditie lipsa (poarta sau arborele real nu exista)
"""
import argparse
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

AICI = os.path.dirname(os.path.abspath(__file__))
PORTI = os.path.dirname(AICI)
RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(PORTI)))
CURAT, PICAT, NEMASURAT = 0, 1, 3
# Numele grupurilor asezarii, asamblate la rulare.
RO = '(' + 'com' + 'ro)'
RO_EN = '(' + 'com' + 'roen)'
SUFIX = '.' + 'comro' + '.tsx'

T = P = 0
POARTA = os.path.join(PORTI, 'poarta-oglinda-asezare.py')


def ok(mesaj):
    global T
    T += 1
    print('  OK   ' + mesaj)


def nu(mesaj):
    global P
    P += 1
    print('  PICA ' + mesaj)


def ruleaza(argumente, poarta=None):
    r = subprocess.run([sys.executable, poarta or POARTA] + argumente, capture_output=True, text=True, encoding='utf-8')
    return r.returncode, r.stdout + r.stderr


def caz(nume, argumente, cod, fragmente, poarta=None):
    rc, iesire = ruleaza(argumente, poarta)
    lipsa = [f for f in fragmente if f not in iesire]
    if rc == cod and not lipsa:
        ok(nume)
    else:
        nu(nume + ': cod ' + str(rc) + ' (asteptat ' + str(cod) + ')' + (', lipsesc ' + repr(lipsa) if lipsa else '') +
           '\n' + iesire[-1500:])


def copie_app(lucru):
    """Copia lui `src/app` (numai grupurile editiilor, ale asezarii si paginile de negasit globale)."""
    r = os.path.join(lucru, 'depozit')
    app = os.path.join(RADACINA, 'src', 'app')
    for grup in ('(en)', '(romd)', RO, RO_EN):
        if os.path.isdir(os.path.join(app, grup)):
            shutil.copytree(os.path.join(app, grup), os.path.join(r, 'src', 'app', grup))
    for n in os.listdir(app):
        if n.startswith('global-not-found.'):
            shutil.copy(os.path.join(app, n), os.path.join(r, 'src', 'app', n))
    return r


def scrie(cale, continut):
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with io.open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


def mutant(lucru, nume, vechi, nou):
    """O copie a portii cu `vechi` inlocuit prin `nou` (exact o aparitie, altfel mutantul nu e cel scris)."""
    text = io.open(POARTA, encoding='utf-8').read()
    if text.count(vechi) != 1:
        return None
    cale = os.path.join(lucru, nume + '.py')
    scrie(cale, text.replace(vechi, nou))
    return cale


def main():
    global POARTA
    p = argparse.ArgumentParser()
    p.add_argument('--poarta', default=POARTA)
    POARTA = os.path.abspath(p.parse_args().poarta)
    if not os.path.isfile(POARTA) or not os.path.isdir(os.path.join(RADACINA, 'src', 'app', RO)):
        print('preconditie lipsa: poarta ' + POARTA + ' sau grupul ' + RO + ' din depozit', file=sys.stderr)
        return NEMASURAT

    lucru = tempfile.mkdtemp(prefix='proba-oglinda-')
    try:
        print('## arborele real')
        rc, iesire = ruleaza(['--radacina', RADACINA])
        surse = [r for r in iesire.splitlines() if r.startswith('SURSE: ')]
        if rc == CURAT and 'NEPOTRIVIRI: 0' in iesire and surse and not surse[0].startswith('SURSE: 0 '):
            ok('arborele real: cod 0, ' + surse[0])
        else:
            nu('arborele real: cod ' + str(rc) + '\n' + iesire[-1500:])

        print('\n## copii ale lui src/app')
        pagina = 'src/app/' + RO + '/contact/page' + SUFIX
        r = copie_app(os.path.join(lucru, 'a'))
        os.remove(os.path.join(r, *pagina.split('/')))
        caz('geamana stearsa (' + pagina + '): cod 1, OA-01 o numeste', ['--radacina', r], PICAT, ('OA-01', pagina))

        r = copie_app(os.path.join(lucru, 'b'))
        cale = os.path.join(r, *pagina.split('/'))
        scrie(cale, io.open(cale, encoding='utf-8').read() + 'export const ' + 'titlu = "propriu";\n')
        caz('geamana cu continut propriu: cod 1, OA-03', ['--radacina', r], PICAT, ('OA-03', 'nu e reexportare'))

        r = copie_app(os.path.join(lucru, 'c'))
        straina = 'src/app/' + RO + '/despre/page' + '.tsx'
        scrie(os.path.join(r, *straina.split('/')), 'export default function P() { return null; }\n')
        caz('page.tsx in grupul asezarii: cod 1, OA-04', ['--radacina', r], PICAT, ('OA-04', straina))

        r = copie_app(os.path.join(lucru, 'd'))
        os.remove(os.path.join(r, 'src', 'app', 'global-not-found' + SUFIX))
        caz('pagina de negasit a asezarii stearsa: cod 1, OA-05', ['--radacina', r], PICAT, ('OA-05',))

        gol = os.path.join(lucru, 'gol')
        os.makedirs(os.path.join(gol, 'src', 'app'))
        caz('arbore fara surse: cod 3', ['--radacina', gol], NEMASURAT, ('NEMASURAT',))

        print('\n## build (colectie + perechi)')
        perechi = {'perechi': [{'a': '/', 'b': '/en'}, {'a': '/ro', 'b': '/'}, {'a': '/ro/contact', 'b': '/contact'},
                               {'a': '/sitemap.xml', 'b': '/sitemap.xml'}]}
        fisier_perechi = os.path.join(lucru, 'perechi.json')
        scrie(fisier_perechi, json.dumps(perechi))

        def colectie(nume, cai, statusuri=None):
            d = os.path.join(lucru, nume)
            inexistenta = '/proba-' + 'inexistenta'
            st = dict({'/_not-found': 404, inexistenta: 404}, **(statusuri or {}))
            scrie(os.path.join(d, 'colectie.json'), json.dumps(
                {'format': 1, 'caleInexistenta': inexistenta,
                 'pagini': [{'cale': c, 'status': st.get(c, 200)} for c in cai + ['/_not-found', inexistenta]]}))
            return d

        egale = ['/en', '/', '/contact', '/sitemap.xml', '/opengraph-image', '/twitter-image']
        caz('colectie egala cu perechile + proprii: cod 0, 6 cai',
            ['--colectie', colectie('col-egala', egale), '--perechi', fisier_perechi], CURAT, ('BUILD: 6 cai', 'NEPOTRIVIRI: 0'))
        caz('o cale in plus (romana lasata si sub /ro): cod 1, o numeste',
            ['--colectie', colectie('col-plus', egale + ['/ro/contact']), '--perechi', fisier_perechi], PICAT,
            ('OA-10', '/ro/contact', 'NEPOTRIVIRI: 1'))
        caz('o cale lipsa (/contact): cod 1, o numeste',
            ['--colectie', colectie('col-lipsa', [c for c in egale if c != '/contact']), '--perechi', fisier_perechi], PICAT,
            ('OA-10', '`/contact`', 'NEPOTRIVIRI: 1'))
        caz('o cale asteptata servita cu 404 (/contact): cod 1, OA-11 o numeste',
            ['--colectie', colectie('col-404', egale, {'/contact': 4 * 100 + 4}), '--perechi', fisier_perechi], PICAT,
            ('OA-11', '`/contact`', 'NEPOTRIVIRI: 1'))
        stricata = os.path.join(lucru, 'col-stricata')
        scrie(os.path.join(stricata, 'colectie.json'), '{nu e json')
        caz('colectie ilizibila: cod 3', ['--colectie', stricata, '--perechi', fisier_perechi], NEMASURAT, ('NEMASURAT',))
        caz('--colectie fara --perechi: cod 2', ['--colectie', stricata], 2, ('folosire',))

        print('\n## mutante pe copii ale portii')
        # OA-01 nu mai ajunge in lista (expresia se evalueaza, nu se adauga), iar geamana lipsa se sare tacut.
        m1 = mutant(lucru, 'mutant-oa01', "            gasiri.append(('OA-01', ", "            (('OA-01', ")
        if m1 is None:
            nu('mutantul OA-01 nu s-a putut planta (randul tinta nu apare exact o data)')
        else:
            caz('verificarea geamanei lipsa dezarmata: cod 3 (control picat), nu 0', ['--radacina', RADACINA], NEMASURAT,
                ('CONTROL PICAT',), poarta=m1)
        m2 = mutant(lucru, 'mutant-build', 'for c in sorted(servite - asteptate):', 'for c in []:')
        if m2 is None:
            nu('mutantul pe build nu s-a putut planta (randul tinta nu apare exact o data)')
        else:
            caz('comparatia pe build dezarmata: cod 3 (control picat), nu 0',
                ['--colectie', colectie('col-m2', egale), '--perechi', fisier_perechi], NEMASURAT, ('CONTROL PICAT',), poarta=m2)
        m3 = mutant(lucru, 'mutant-status', '        if status[c] != cerut:', '        if not status:')
        if m3 is None:
            nu('mutantul pe status nu s-a putut planta (randul tinta nu apare exact o data)')
        else:
            caz('verificarea statusului dezarmata: cod 3 (control picat), nu 0',
                ['--colectie', colectie('col-m3', egale), '--perechi', fisier_perechi], NEMASURAT, ('CONTROL PICAT',), poarta=m3)
    finally:
        shutil.rmtree(lucru, ignore_errors=True)

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

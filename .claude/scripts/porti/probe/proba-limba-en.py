#!/usr/bin/env python3
"""Proba portii de limba EN (`poarta-limba-en.py`), rulata ca PROCES pe arbori fabricati.

Ce masoara, pe langa controalele din poarta (care probeaza logica in acelasi proces):
  - codul de iesire pe fiecare clasa de defect, si ca mesajul numeste defectul si fisierul;
  - ca poarta citeste exact cele doua cai (`src/content/en`, `src/app/(en)`) si nimic din jur;
  - ca un arbore fara pagini EN iese 0 (azi), iar un arbore fara `src` iese 3;
  - ca un control stricat pe o COPIE a portii (mutant) da 3, nu 0;
  - ca registrele `src/content/afirmatii/en-*.json` sunt citite de poarta-evidenta si de
    poarta-afirmatii (paginile EN isi pun afirmatiile acolo): martor `en-proba.json` asamblat aici.

Fixturile se asambleaza la RULARE, din bucati: fisierul asta nu poarta pe litere ce vaneaza.

`--poarta <cale>` ruleaza proba pe alta copie a portii (de exemplu un mutant, ca sa vezi ca proba il
respinge). Implicit: poarta de langa directorul probelor.

IESIRE: 0 toate cazurile trec - 1 macar unul pica - 3 preconditie lipsa (poarta nu exista)
"""
import argparse
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
CURAT, PICAT, NEMASURAT = 0, 1, 3

T = P = 0
POARTA = os.path.join(PORTI, 'poarta-limba-en.py')


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


def arbore(fisiere):
    """Un arbore temporar cu fisierele date ({cale relativa: continut})."""
    d = tempfile.mkdtemp(prefix='proba-limba-en-')
    for rel, continut in fisiere.items():
        scrie(os.path.join(d, *rel.split('/')), continut)
    return d


def ruleaza_poarta(poarta, radacina):
    r = subprocess.run([sys.executable, poarta, '--radacina', radacina], capture_output=True, text=True,
                       encoding='utf-8', errors='replace')
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def caz(eticheta, fisiere, cod_asteptat, contine=(), lipseste=(), poarta=None):
    d = arbore(fisiere)
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
    for text in lipseste:
        if text in iesire:
            nu(eticheta + ': iesirea contine "' + text + '", nu trebuia\n' + iesire.strip())
            return
    ok(eticheta)


def mutant(eticheta, ancora, inlocuitor, cod_asteptat, contine):
    """Ruleaza o COPIE a portii, cu o substitutie verificata ca a aterizat."""
    d = tempfile.mkdtemp(prefix='proba-limba-en-mutant-')
    try:
        text = open(POARTA, encoding='utf-8').read()
        if text.count(ancora) != 1:
            nu(eticheta + ': MUTANT NEATERIZAT (ancora apare de ' + str(text.count(ancora)) + ' ori)')
            return
        copie = os.path.join(d, 'poarta-limba-en.py')
        scrie(copie, text.replace(ancora, inlocuitor))
        if inlocuitor not in open(copie, encoding='utf-8').read():
            nu(eticheta + ': MUTANT NEATERIZAT (substitutia nu se vede pe copie)')
            return
    except OSError as e:
        nu(eticheta + ': ' + str(e))
        shutil.rmtree(d, ignore_errors=True)
        return
    try:
        caz(eticheta, {'src/content/en/pricing.ts': MODUL_BUN}, cod_asteptat, contine, poarta=copie)
    finally:
        shutil.rmtree(d, ignore_errors=True)


# ------------------------------------------------------------------ fixturi

def modul(*randuri):
    return 'export const pagina = {\n' + ''.join('  r' + str(i) + ': ' + json.dumps(r) + ',\n'
                                                for i, r in enumerate(randuri)) + '};\n'


MODUL_BUN = modul(
    "3S keeps your company's documents in one archive and answers questions with the source page.",
    'Prices are per company, in euros, excluding VAT.',
    'The analysis of a license, the cancellation of a plan and a labeled folder stay in the catalog.',
    'https://example.org/organisation-centre-colour',
)
PAGINA_BUNA = ('// Pagina EN de proba: o nota cu un cuvant britanic, organis' + 'ation, nu e text de pagina.\n'
               'export default function P() {\n'
               '  const x = 1;\n'
               '  return x !== 2 ? <p>Ask your archive a question and get the page it came from.</p> : null;\n'
               '}\n')


def cu_text(text):
    return {'src/content/en/pricing.ts': modul(text)}


# ------------------------------------------------------------------ cazurile

def cazuri():
    print('## poarta-limba-en.py (proces, --radacina)')
    caz('arbore curat cu un modul si o pagina EN: cod 0, vede ambele',
        {'src/content/en/pricing.ts': MODUL_BUN, 'src/app/(en)/pricing/page.en.tsx': PAGINA_BUNA},
        CURAT, ('VAZUT: src/content/en/pricing.ts', 'VAZUT: src/app/(en)/pricing/page.en.tsx', 'SURSA: 2 fisier(e) EN'))
    caz('arbore cu src si fara pagini EN (starea de azi): cod 0, zero fisiere vazute',
        {'src/content/preturi.ts': 'export const a = 1;\n'}, CURAT, ('SURSA: 0 fisier(e) EN',))
    caz('arbore fara src: cod 3, nu 0', {'docs/nota.md': 'nimic\n'}, NEMASURAT, ('NEMASURAT',))

    caz('liniuta lunga in modul: cod 1, numeste caracterul si fisierul',
        cu_text('Archive ' + chr(0x2014) + ' search'), PICAT, ('liniuta lunga', 'src/content/en/pricing.ts:'))
    caz('liniuta lunga scrisa direct in fisier: cod 1, cu coloana',
        {'src/content/en/pricing.ts': 'export const a = "Archive ' + chr(0x2014) + ' search";\n'},
        PICAT, ('liniuta lunga', 'coloana 27'))
    caz('liniuta lunga ca entitate HTML in textul JSX: cod 1',
        {'src/app/(en)/page.en.tsx': 'export default () => <p>Archive &' + 'mdash; search</p>;\n'},
        PICAT, ('entitate HTML',))
    caz('litera accentuata in modul: cod 1',
        cu_text('Caf' + chr(0xE9) + ' receipts'), PICAT, ('non-ASCII U+00E9',))
    caz('ortografie britanica in modul: cod 1, da tiparul',
        cu_text('Your ' + 'organis' + 'ation keeps every invoice.'), PICAT, ('ortografie britanica (-ise',))
    caz('forma britanica -re in modul: cod 1',
        cu_text('The ' + 'cent' + 're of your archive.'), PICAT, ('ortografie britanica (-re',))
    caz('expresie de evitat in modul: cod 1, o numeste',
        cu_text('A ' + 'seam' + 'less archive.'), PICAT, ('expresie de evitat: seamless',))
    caz('expresie de evitat de doua cuvinte: cod 1',
        cu_text('Trusted' + ' by' + ' teams.'), PICAT, ('expresie de evitat: trusted by',))
    caz('semnul exclamarii in text: cod 1',
        cu_text('Ask your archive' + chr(33)), PICAT, ('semnul exclamarii',))
    caz('liniuta din doua cratime: cod 1',
        cu_text('Invoices ' + '-' * 2 + ' every year.'), PICAT, ('liniuta din doua cratime',))
    caz('defect in textul JSX al unei pagini (en): cod 1, numeste pagina',
        {'src/app/(en)/pricing/page.en.tsx':
         'export default function P() {\n  return <p>Pick a ' + 'colo' + 'ur for each label.</p>;\n}\n'},
        PICAT, ('src/app/(en)/pricing/page.en.tsx:2', 'ortografie britanica (-our'))
    culoare = 'colo' + 'ur'
    for eticheta, element, mesaj in (
            ('paranteze', '<p>Pick a ' + culoare + ' (any) for the label.</p>', 'ortografie britanica (-our'),
            ('punct si virgula', '<p>Pick a ' + culoare + '; then label it.</p>', 'ortografie britanica (-our'),
            ('{expresie}', '<p>Pick a ' + culoare + ' for {name}.</p>', 'ortografie britanica (-our'),
            ('adresa web', '<p>See https://3s.md for a ' + culoare + ' guide.</p>', 'ortografie britanica (-our'),
            ('expresie de evitat cu paranteze', '<p>A ' + 'seam' + 'less archive (for teams).</p>',
             'expresie de evitat: seamless'),
            ('exclamare cu paranteze', '<p>Ask your archive (today)' + chr(33) + '</p>', 'semnul exclamarii'),
    ):
        caz('text JSX cu ' + eticheta + ': cod 1',
            {'src/app/(en)/x/page.en.tsx':
             'export default function P({ name }) {\n  return (\n    ' + element + '\n  );\n}\n'},
            PICAT, ('src/app/(en)/x/page.en.tsx:3', mesaj))
    caz('text JSX cu comparatii, generice si o adresa web britanica: cod 0 (codul nu e text)',
        {'src/app/(en)/x/page.en.tsx':
         'export default function P({ a, b, rows }) {\n'
         '  const [v] = useState<string>(!a ? "labeled" : "");\n'
         '  return a < b && b > 0 && !rows.length && a !== b ? (\n'
         '    <ul>{rows.map((r) => <li key={r.id}>Rows (2 per page); see https://example.org/' + culoare
         + '.</li>)}</ul>\n'
         '  ) : <p>{v}</p>;\n}\n'},
        CURAT)
    caz('defect in layout-ul (en): cod 1',
        {'src/app/(en)/layout.en.tsx':
         'export default function L() {\n  return <footer>Cutting' + '-edge archive</footer>;\n}\n'},
        PICAT, ('src/app/(en)/layout.en.tsx', 'cutting-edge'))
    caz('cuvant britanic numai intr-un comentariu: cod 0 (nu e text)',
        {'src/content/en/pricing.ts': '// nota: ' + 'colo' + 'ur e forma britanica\n' + MODUL_BUN},
        CURAT)
    caz('caracter non-ASCII intr-un comentariu: cod 1 (regula ASCII e pe tot fisierul)',
        {'src/content/en/pricing.ts': '// nota ' + chr(0x2013) + ' scurta\n' + MODUL_BUN},
        PICAT, ('liniuta medie',))
    caz('exceptie de ortografie cu motiv: cod 0',
        {'src/content/en/g1.ts': '// ortografie-sursa: titlul oficial al directivei\n'
         + 'export const t = "Directive on the ' + 'harmon' + 'isation of invoicing";\n'},
        CURAT)
    caz('exceptie de ortografie fara motiv: cod 1',
        {'src/content/en/g1.ts': '// ortografie-sursa:\n'
         + 'export const t = "Directive on the ' + 'harmon' + 'isation of invoicing";\n'},
        PICAT, ('ortografie britanica',))
    caz('momeli in afara cailor EN (romana, editia ro-MD): cod 0, zero fisiere vazute',
        {'src/content/preturi.ts': modul('Pick a ' + 'colo' + 'ur ' + chr(0x2014) + ' now' + chr(33)),
         'src/app/(romd)/ro/page.romd.tsx': 'export default () => <p>A ' + 'seam' + 'less archive</p>;\n',
         'src/content/en-nota.ts': modul('A ' + 'robu' + 'st archive')},
        CURAT, ('SURSA: 0 fisier(e) EN',))

    print('## poarta-limba-en.py, mutanti pe o COPIE (controlul stricat trebuie sa dea 3)')
    mutant('detectorul de exclamare dezactivat: cod 3',
           "TIPAR_EXCLAMARE = re.compile(r'!(?![=\\[])')", "TIPAR_EXCLAMARE = re.compile(r'(?!x)x')",
           NEMASURAT, ('CONTROL PICAT', 'semnul exclamarii'))
    mutant('descoperirea pierde arborele (en): cod 3',
           "os.path.join('src', 'app', '(en)'))", "os.path.join('src', 'app', 'en'))",
           NEMASURAT, ('CONTROL PICAT', 'descoperirii'))
    mutant('extragerea JSX sare iar textul cu paranteze: cod 3',
           '        if bucata.strip():\n', "        if bucata.strip() and '(' not in bucata:\n",
           NEMASURAT, ('CONTROL PICAT', 'extragere JSX'))
    mutant('scanerul ia comparatia drept JSX: cod 3',
           "            return s[inceput:k + 1] in ('return', 'yield')\n", '            return True\n',
           NEMASURAT, ('CONTROL PICAT', 'martorul negativ JSX'))
    mutant('exceptia scuteste si fara motiv: cod 3',
           r"ortografie-sursa:\s*(\S.{2,})", r"ortografie-sursa:\s*(.*)",
           NEMASURAT, ('CONTROL PICAT', 'FARA motiv'))


def cazuri_registre():
    """Punctul 4 al feliei: registrele EN sunt citite de portile de afirmatii si de evidenta."""
    print('## registrele en-*.json (poarta-evidenta.py, poarta-afirmatii.py)')
    nume = 'en-' + 'proba.json'
    reg = 'src/content/afirmatii/' + nume
    intrare = {'id': 'en-proba', 'text': 'Example claim', 'unde': 'src/content/en/pricing.ts',
               'stare': 'confirmat', 'sursa': '', 'confirmat_de': ''}

    evidenta = os.path.join(PORTI, 'poarta-evidenta.py')
    d = arbore({reg: json.dumps([intrare])})
    try:
        r = subprocess.run([sys.executable, evidenta, '--radacina', d, '--doar-raport'], capture_output=True,
                           text=True, encoding='utf-8', errors='replace')
    finally:
        shutil.rmtree(d, ignore_errors=True)
    iesire = (r.stdout or '') + (r.stderr or '')
    if r.returncode == PICAT and 'FARA sursa' in iesire and 'en-proba' in iesire:
        ok('poarta-evidenta citeste ' + nume + ': confirmarea fara sursa e prinsa (cod 1)')
    else:
        nu('poarta-evidenta NU citeste ' + nume + ': cod ' + str(r.returncode) + '\n' + iesire.strip())

    # poarta-afirmatii nu are --radacina: se copiaza in arborele fabricat si se ruleaza copia.
    certificare = 'IS' + 'O 27001'
    d = arbore({reg: json.dumps([dict(intrare, stare='neconfirmat', text='3S holds ' + certificare)]),
                'src/content/en/pricing.ts': MODUL_BUN})
    try:
        copie = os.path.join(d, '.claude', 'scripts', 'porti', 'poarta-afirmatii.py')
        os.makedirs(os.path.dirname(copie))
        shutil.copy2(os.path.join(PORTI, 'poarta-afirmatii.py'), copie)
        r = subprocess.run([sys.executable, copie], capture_output=True, text=True, encoding='utf-8', errors='replace')
    finally:
        shutil.rmtree(d, ignore_errors=True)
    iesire = (r.stdout or '') + (r.stderr or '')
    if r.returncode == PICAT and 'en-proba' in iesire:
        ok('poarta-afirmatii citeste ' + nume + ': certificarea nedetinuta e prinsa (cod 1)')
    else:
        nu('poarta-afirmatii NU citeste ' + nume + ': cod ' + str(r.returncode) + '\n' + iesire.strip())


def main():
    global POARTA
    p = argparse.ArgumentParser(description='Proba portii de limba EN.')
    p.add_argument('--poarta', default=POARTA, help='copia portii pe care ruleaza proba')
    a = p.parse_args()
    POARTA = os.path.abspath(a.poarta)
    if not os.path.isfile(POARTA):
        print('NEMASURAT: poarta nu exista: ' + POARTA, file=sys.stderr)
        return NEMASURAT
    print('proba-limba-en: poarta ' + POARTA)
    cazuri()
    cazuri_registre()
    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return PICAT if P else CURAT


if __name__ == '__main__':
    sys.exit(main())

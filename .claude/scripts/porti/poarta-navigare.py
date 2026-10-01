#!/usr/bin/env python3
"""Poarta de navigare a probelor de browser: toate probele trec prin `tests/browser/ajutor/baza.ts`.

DE CE EXISTA. Pe runner-ul Windows al CI, `page.goto` a cazut pe `net::ERR_NO_BUFFER_SPACE`
inainte ca pagina sa raspunda (rularile 36286812854, 36310864983). Reluarea pe eroarea de
transport sta pe prototipul clasei Page, pusa de o fixtura AUTOMATA de worker din
`ajutor/baza.ts`. Fixtura ruleaza numai in procesele care folosesc `test` de acolo: o proba care
importa `test` direct din Playwright e acoperita numai daca alta proba a instalat deja reluarea
in acelasi proces, adica dupa ordinea fisierelor. Poarta asta inchide acoperirea dependenta de
ordine, si o face inainte de build, unde costa o secunda, nu dupa el.

CE VERIFICA:
  N-01  niciun fisier din `tests/browser`, in afara de `ajutor/baza.ts` si `playwright.config.ts`,
        nu importa VALOAREA `test`, `_baseTest`, `chromium`, `firefox`, `webkit` sau `request` din
        `@playwright/test`, `playwright` sau `playwright-core`. Se prind si importul intreg
        (`import * as`, importul implicit) si `require(...)` al acelor module, fiindca dau acces la
        aceleasi valori. Importurile de tip (`import type { ... }`, `type X` in acolade) sunt permise.
  N-02  `ajutor/baza.ts` exista si are, in cod (nu in comentarii), fixtura cu `scope: 'worker'` si
        `auto: true`. Fara ea, N-01 ar trece pe un `baza.ts` golit, deci dezarmarea prin stergere
        se prinde aici.
  N-03  INFORMATIV, nu blocant: cate apeluri `.goto(` si `.reload(` sunt in cod in `tests/browser`.
        Cifra arata ca nu mai conteaza, nu e un prag.

CONTROALE, la fiecare rulare, pe un arbore fabricat in directorul temporar, cu fixturi asamblate
la rulare (sursa portii nu poarta literal ce vaneaza):
  - import de valoare pe un rand: TREBUIE prins;
  - import pe mai multe randuri, cu `test` pe alt rand decat `import`: TREBUIE prins;
  - import numai de tipuri si import comentat (rand si bloc): NU se prind;
  - `baza.ts` fara `auto: true` (cuvantul ramas doar intr-un comentariu): N-02 TREBUIE sa-l prinda.
Daca un control nu iese exact, verdictul e NEMASURAT (iesire 3), nu "curat".

CE NU VERIFICA (reziduuri)
Intrebarea pe care o pune de fapt: "importa vreun fisier din tests/browser, pe una din formele
de import cunoscute, una din valorile vanate din modulele Playwright?" Nu "trece fiecare
navigare prin reluare".
  - Un import dinamic (`await import(...)`), o reexportare printr-un fisier intermediar sau un
    nume de modul compus la rulare nu se vad.
  - Comentariile se scot cu un cititor simplu de siruri si comentarii; un sablon (`...`) cu
    `${...}` imbricat care contine un apostrof inversat il poate deruta.
  - `frame.goto`, `page.request` si `fetch` din Node nu trec prin reluare; poarta nu le numara.
  - N-02 citeste textul lui `baza.ts`, nu il ruleaza: o fixtura care exista dar nu instaleaza
    nimic trece aici. Martorii POZITIVI din `blog-articole.spec.ts` o prind la rulare.
  - Doar extensiile din EXTENSII si doar sub `tests/browser`.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  randul de import al probei acuzate: `test` si `expect` din `./ajutor/baza` (sau
      `../ajutor/baza`), tipurile raman din `@playwright/test` ca `import type`.
  NU  SCUTITE, VANATE, MODULE prin ingustare, fara_comentarii(), controale().

IESIRE: 0 curat - 1 import vanat sau baza.ts dezarmat - 2 folosire gresita - 3 NEMASURAT
"""
import argparse
import os
import re
import shutil
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
PROBE = os.path.join('tests', 'browser')
BAZA = 'ajutor/baza.ts'
# Caile relative la tests/browser, cu `/`. Configurarea importa `defineConfig` si `devices`,
# iar baza.ts e locul unde `test` se extinde: doar ele au voie.
SCUTITE = {BAZA, 'playwright.config.ts'}
VANATE = {'test', '_baseTest', 'chromium', 'firefox', 'webkit', 'request'}
MODULE = {'@playwright/test', 'playwright', 'playwright-core'}
EXTENSII = ('.ts', '.tsx', '.mts', '.cts', '.js', '.mjs', '.cjs')
SARITE = {'node_modules', '.rezultate', '.next'}

TIPAR_ACOLADE = re.compile(r"\b(import|export)\s+(type\s+)?\{([^}]*)\}\s*from\s*(['\"])([^'\"]+)\4", re.S)
TIPAR_INTREG = re.compile(r"\bimport\s+(?!type\b)(\*\s+as\s+\w+|\w+)(\s*,\s*\{[^}]*\})?\s+from\s*(['\"])([^'\"]+)\3", re.S)
TIPAR_REQUIRE = re.compile(r"\brequire\s*\(\s*(['\"])([^'\"]+)\1\s*\)")
TIPAR_NAVIGARE = re.compile(r"\.(goto|reload)\(")
TIPAR_WORKER = re.compile(r"scope\s*:\s*['\"]worker['\"]")
TIPAR_AUTO = re.compile(r"auto\s*:\s*true\b")


def fara_comentarii(text):
    """Textul cu comentariile inlocuite prin spatii (randurile raman pe loc, ca numerele de
    rand sa ramana adevarate). Sirurile raman intregi: un `//` dintr-o adresa nu e comentariu."""
    iesire = []
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        urm = text[i + 1] if i + 1 < n else ''
        if c == '/' and urm == '/':
            j = text.find('\n', i)
            j = n if j < 0 else j
            iesire.append(' ' * (j - i))
            i = j
        elif c == '/' and urm == '*':
            j = text.find('*/', i + 2)
            j = n if j < 0 else j + 2
            iesire.append(''.join(ch if ch == '\n' else ' ' for ch in text[i:j]))
            i = j
        elif c in ('"', "'", '`'):
            j = i + 1
            while j < n and text[j] != c:
                if text[j] == '\\':
                    j += 1
                elif text[j] == '\n' and c != '`':
                    break
                j += 1
            iesire.append(text[i:j + 1])
            i = j + 1
        else:
            iesire.append(c)
            i += 1
    return ''.join(iesire)


def rand(text, pozitie):
    return text.count('\n', 0, pozitie) + 1


def importuri_vanate(cod):
    """Lista (rand, descriere) a importurilor de valoare vanate dintr-un cod fara comentarii."""
    gasite = []
    for m in TIPAR_ACOLADE.finditer(cod):
        if m.group(5) not in MODULE or m.group(2):
            continue
        for element in m.group(3).split(','):
            element = element.strip()
            if not element or element.startswith('type '):
                continue
            nume = element.split(' as ')[0].strip()
            if nume in VANATE:
                gasite.append((rand(cod, m.start()), m.group(1) + ' ' + nume + " din '" + m.group(5) + "'"))
    for m in TIPAR_INTREG.finditer(cod):
        if m.group(4) in MODULE:
            gasite.append((rand(cod, m.start()), "import intreg '" + m.group(1).strip() + "' din '" + m.group(4) + "'"))
    for m in TIPAR_REQUIRE.finditer(cod):
        if m.group(2) in MODULE:
            gasite.append((rand(cod, m.start()), "require('" + m.group(2) + "')"))
    return gasite


def fisiere_probe(dir_probe):
    gasite = []
    for radacina, directoare, nume in os.walk(dir_probe):
        directoare[:] = sorted(d for d in directoare if d not in SARITE)
        for n in sorted(nume):
            if n.endswith(EXTENSII):
                cale = os.path.join(radacina, n)
                gasite.append(os.path.relpath(cale, dir_probe).replace(os.sep, '/'))
    return gasite


def citeste(cale):
    with open(cale, encoding='utf-8') as f:
        return f.read()


def masoara(dir_probe):
    """(fisiere, gasiri N-01 si N-02, navigari brute N-03)."""
    fisiere = fisiere_probe(dir_probe)
    gasiri, brute = [], 0
    for rel in fisiere:
        cod = fara_comentarii(citeste(os.path.join(dir_probe, rel)))
        brute += len(TIPAR_NAVIGARE.findall(cod))
        if rel in SCUTITE:
            continue
        for r, ce in importuri_vanate(cod):
            gasiri.append('N-01 ' + rel + ':' + str(r) + ': ' + ce + " - importa test si expect din ajutor/baza")
    cale_baza = os.path.join(dir_probe, BAZA)
    if not os.path.isfile(cale_baza):
        gasiri.append('N-02 ' + BAZA + ' lipseste: fara el nicio proba nu mai reia navigarea pe transport')
    else:
        cod = fara_comentarii(citeste(cale_baza))
        if not (TIPAR_WORKER.search(cod) and TIPAR_AUTO.search(cod)):
            gasiri.append('N-02 ' + BAZA + " nu mai are fixtura cu scope 'worker' si auto: true in cod")
    return fisiere, gasiri, brute


def scrie(cale, text):
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def controale():
    """Arbore fabricat cu gasiri cunoscute. Intoarce None daca totul iese exact, altfel motivul."""
    modul = "'@playwright/" + "test'"
    din = ' from ' + modul
    baza_buna = ('import { test as t } ' + 'from ' + modul + '\n'
                 + 'export const test = t.extend({ x: [async ({}, use) => use(), { scope: ' + "'worker'" + ', auto: ' + 'true } ] })\n')
    baza_fara_auto = ('import { test as t } ' + 'from ' + modul + '\n'
                      + '// auto: ' + 'true era aici\n'
                      + 'export const test = t.extend({ x: [async ({}, use) => use(), { scope: ' + "'worker'" + ' } ] })\n')
    cazuri = {
        'a-valoare.spec.ts': 'import { expect, ' + 'test }' + din + '\n',
        'b-multirand.spec.ts': 'import {\n  expect,\n  type Page,\n  ' + 'test,\n}' + din + '\n',
        'c-tipuri.spec.ts': 'import type { ' + 'test, Page }' + din + '\nimport { type Page as P, type ' + 'test as T }' + din + '\n',
        'd-comentat.spec.ts': '// import { ' + 'test }' + din + '\n/*\nimport { ' + 'test }' + din + '\n*/\n'
                              + "const adresa = 'http://127.0.0.1:1/'\n",
        'playwright.config.ts': 'import { defineConfig, devices }' + din + '\n',
    }
    asteptate = {'a-valoare.spec.ts', 'b-multirand.spec.ts'}
    temp = tempfile.mkdtemp(prefix='poarta-navigare-')
    try:
        for nume, text in cazuri.items():
            scrie(os.path.join(temp, 'bun', nume), text)
        scrie(os.path.join(temp, 'bun', BAZA), baza_buna)
        _, gasiri, _ = masoara(os.path.join(temp, 'bun'))
        prinse = {g.split(' ')[1].split(':')[0] for g in gasiri}
        if prinse != asteptate or len(gasiri) != 2:
            return 'N-01 pe arborele fabricat: asteptam exact ' + str(sorted(asteptate)) + ', am primit ' + str(gasiri)
        scrie(os.path.join(temp, 'dezarmat', BAZA), baza_fara_auto)
        _, gasiri, _ = masoara(os.path.join(temp, 'dezarmat'))
        if len(gasiri) != 1 or not gasiri[0].startswith('N-02'):
            return 'N-02 pe baza.ts fara auto: asteptam o gasire N-02, am primit ' + str(gasiri)
        os.makedirs(os.path.join(temp, 'fara-baza'))
        scrie(os.path.join(temp, 'fara-baza', 'e.spec.ts'), '')
        _, gasiri, _ = masoara(os.path.join(temp, 'fara-baza'))
        if len(gasiri) != 1 or 'lipseste' not in gasiri[0]:
            return 'N-02 pe arbore fara baza.ts: asteptam o gasire N-02, am primit ' + str(gasiri)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    return None


def main():
    parser = argparse.ArgumentParser(description='Poarta de navigare a probelor de browser.')
    parser.add_argument('--radacina', default=RADACINA, help='radacina depozitului masurat')
    argumente = parser.parse_args()

    motiv = controale()
    if motiv:
        print('poarta-navigare: CONTROL PICAT: ' + motiv, file=sys.stderr)
        print('Verdictul e NEMASURAT, nu "curat".', file=sys.stderr)
        return 3

    dir_probe = os.path.join(argumente.radacina, PROBE)
    if not os.path.isdir(dir_probe):
        print('poarta-navigare: NEMASURAT: nu exista ' + dir_probe, file=sys.stderr)
        return 3
    fisiere, gasiri, brute = masoara(dir_probe)
    probe = [f for f in fisiere if f.endswith('.spec.ts')]
    if not probe:
        print('poarta-navigare: NEMASURAT: niciun .spec.ts in ' + dir_probe, file=sys.stderr)
        return 3
    print('poarta-navigare: %d fisiere cercetate (%d probe), controale 3/3' % (len(fisiere), len(probe)))
    print('poarta-navigare: N-03 (informativ) apeluri .goto( / .reload( in cod: %d' % brute)
    for g in gasiri:
        print('  ' + g)
    print('poarta-navigare: ' + ('%d gasiri' % len(gasiri) if gasiri else 'curat'))
    return 1 if gasiri else 0


if __name__ == '__main__':
    sys.exit(main())

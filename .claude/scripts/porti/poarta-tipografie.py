#!/usr/bin/env python3
"""Poarta de tipografie: aduna fisierele de text ale proiectului si le da
detectorului de liniute lungi (tipografie-liniute.py, portat din platforma-prp).

Motivul pentru care exista invelisul asta: detectorul primeste fisiere, nu
directoare, iar lista de fisiere trebuie sa fie stabila si sa nu intre in
node_modules sau .next. Verdictul detectorului se transmite ca atare - inclusiv
codul 3, care inseamna NEMASURAT, nu "curat".

PORTILE INSELE INTRA IN SCANARE. Pana pe 6 sep 2026, `.claude` era in SARITE si
nu era in CAI, deci nicio poarta nu trecea prin igiena pe care o impune site-ului.
Scutirea nu avea motiv scris, si o scutire nemotivata se re-examineaza: masurat pe
cele 22 de fisiere din `.claude/scripts/porti/`, zero liniute lungi, deci includerea
nu costa nimic azi si prinde ce ar veni maine. `.py` si `.sh` sunt in extensii din
acelasi motiv - fara ele, un fisier de poarta cu liniuta lunga ar fi ramas nevazut
chiar dupa ce directorul a intrat in lista.

La rosu: nu se scoate o cale din CAI si nu se adauga un nume in SARITE ca sa treaca
poarta. Se repara fisierul acuzat.

CE NU VERIFICA (reziduuri)
Poarta asta nu masoara ea insasi nimic: aduna o lista de fisiere si transmite verdictul
detectorului. Intrebarea pe care o pune de fapt: "are vreunul dintre fisierele pe care le-am
ADUNAT EU vreunul dintre punctele de cod pe care le vaneaza detectorul?" Deci acoperirea ei e
exact lista ei de fisiere, si nimic mai mult.
  - Din `.claude` intra in CAI o singura cale, scrisa intreaga: `.claude/scripts/porti`.
    Restul - memoria de proiect, regulile de sesiune - ramane nescanat fiindca nu e in CAI,
    nu fiindca ar fi in SARITE; acolo `.claude` nu mai apare.
  - Se aduna din src, docs, tests, .github si .claude/scripts/porti, plus README.md din
    radacina. CLAUDE.md, CONTEXT.md, package.json, Dockerfile, config/ si public/ raman
    nemasurate.
  - Doar extensiile din EXTENSII. Un .txt, un .html sau un .svg cu o liniuta lunga trece.
  - Reziduurile DETECTORULUI (alte liniute din Unicode, ghilimele tipografice, puncte de
    suspensie, spatii neintrerupte, codificari non-UTF-8) se aplica intacte si aici; sunt
    scrise in antetul lui tipografie-liniute.py.
  - Lista goala iese 3, nu 0 - singurul lucru pe care poarta asta il verifica singura.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  fisierul raportat, in care liniuta lunga devine cratima.
  NU  CAI, EXTENSII, SARITE prin INGUSTARE. Largirea lor e libera si e chiar imbunatatirea de
      facut; scoaterea unui director sau a unei extensii din multimea masurata ca sa treaca
      lotul e slabire.
"""
import os
import subprocess
import sys

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DETECTOR = os.path.join(RADACINA, '.claude', 'scripts', 'porti', 'tipografie-liniute.py')
EXTENSII = ('.md', '.mdx', '.ts', '.tsx', '.js', '.mjs', '.json', '.yml', '.yaml', '.css',
            '.py', '.sh')
SARITE = {'node_modules', '.next', '.git', 'dist', 'build', '__pycache__'}
# `.claude/scripts/porti` e numit pe cale INTREAGA, nu prin `.claude`: restul lui `.claude`
# (memoria, regulile de sesiune) nu e livrat si nu se scaneaza, dar portile da.
CAI = ('src', 'docs', 'tests', '.github', os.path.join('.claude', 'scripts', 'porti'))


def fisiere():
    gasite = []
    for cale in CAI:
        absolut = os.path.join(RADACINA, cale)
        if not os.path.isdir(absolut):
            continue
        for radacina, directoare, nume in os.walk(absolut):
            directoare[:] = [d for d in directoare if d not in SARITE]
            for n in nume:
                if n.endswith(EXTENSII):
                    gasite.append(os.path.join(radacina, n))
    for n in ('README.md',):
        p = os.path.join(RADACINA, n)
        if os.path.isfile(p):
            gasite.append(p)
    return sorted(gasite)


# LINIA DE COMANDA ARE PLAFON. Pe Windows, CreateProcess primeste cel mult 32.767 de caractere,
# iar lista de fisiere cu cai absolute a trecut de el pe 25.09.2026: 34.048 de caractere pe 323
# de fisiere (lot/s4-3a + felia 53), `WinError 206`, poarta rosie pe fiecare felie care adauga
# fisiere, oricat de curata. Detectorul se cheama deci pe TRANSE sub prag. Pragul are rezerva
# fata de plafon, fiindca lungimea masurata cu list2cmdline nu e garantat cea pe care o vede
# sistemul (ghilimele, calea interpretorului).
PRAG_LINIE = 24000


def transe(lista, lungime_baza):
    transa, lungime = [], lungime_baza
    for cale in lista:
        cost = len(subprocess.list2cmdline([cale])) + 1
        if transa and lungime + cost > PRAG_LINIE:
            yield transa
            transa, lungime = [], lungime_baza
        transa.append(cale)
        lungime += cost
    if transa:
        yield transa


def main():
    lista = fisiere()
    if not lista:
        print('poarta-tipografie: NICIUN fisier de verificat - masuratoarea e invalida, nu curata', file=sys.stderr)
        return 3
    baza = [sys.executable, DETECTOR, '--fisiere']
    coduri = [subprocess.run(baza + t).returncode for t in transe(lista, len(subprocess.list2cmdline(baza)))]
    print('poarta-tipografie: %d fisiere in %d transe, coduri %s' % (len(lista), len(coduri), coduri))
    # Verdictul e cel mai GRAV dintre transe: o transa NEMASURATA (3) sau folosita gresit (2) nu
    # se inghite sub un 0 al celorlalte, iar o liniuta gasita (1) nu dispare intr-o transa curata.
    return max(coduri)


if __name__ == '__main__':
    sys.exit(main())

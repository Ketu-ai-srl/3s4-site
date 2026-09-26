#!/usr/bin/env python3
"""Poarta de adevar: afirmatiile de vechime si autoritate se scriu ATRIBUIT.

Faptul care naste poarta: marca 3S nu e inca o persoana juridica, iar dupa decizia
owner-ului D10 (25.09.2026) site-ul nu numeste nicio alta firma. Deci "avem 6 ani de
experienta" e o afirmatie pe care nu o poate sustine nimeni de pe site; forma permisa
numeste entitatea care ar scoate actul, iar cat timp nu exista una, propozitia nu se scrie.

Poarta cauta in textul VIZIBIL al paginilor si al continutului doua clase de defect:
  1. persoana intai plus vechime sau autoritate ("avem X ani", "suntem autorizati")
  2. certificari pe care nu le detinem (ISO 27001, SOC 2)

CONTROALE, la fiecare rulare (o poarta fara control pozitiv e decorativa):
  - martor pozitiv: un rand fabricat LA RULARE cu tiparul interzis; daca nu e prins,
    verdictul e NEMASURAT (iesire 3), nu "curat";
  - martor negativ: forma corecta, atribuita; daca e prinsa, tiparul e prea lat (iesire 3).

Fixturile se asambleaza la rulare, niciodata scrise pe litere in corpul fisierului:
altfel poarta care scaneaza depozitul se declanseaza pe propria proba.

CE NU VERIFICA (reziduuri)
Intrebarea pe care o pune de fapt: "se potriveste vreunul dintre cele sase tipare, fara sa
existe un cuvant de negare in cele 90 de caractere dinaintea potrivirii?" Nu "e afirmatia
adevarata" si nu "are afirmatia o sursa".
  - O formulare echivalenta, cu alte cuvinte, trece: tiparele sunt o lista, nu o intelegere.
  - Fereastra de negare are 90 de caractere si accepta orice negatie. O negatie fara legatura,
    aflata in fereastra, tace o incalcare reala. E un fals NEGATIV cunoscut, acceptat ca pret
    pentru forma onesta care spune ce NU detinem.
  - Certificarile sunt o lista fixa de trei; a patra trece.
  - Se citeste SURSA, nu HTML-ul livrat. O afirmatie compusa la randare din bucati nu se vede.
  - este_site se decide dupa prefixul de cale. Un fisier din src/ care nu ajunge niciodata la
    vizitator e tratat totusi ca site.
  - Legatura dintre o afirmatie de pe pagina si o intrare in registru NU se verifica aici, si
    nici in alta parte: poarta-evidenta.py masoara forma registrului, nu acoperirea lui.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  textul acuzat, rescris atribuit catre entitatea care ar scoate actul.
      Intrarea din registrul de afirmatii.
  NU  TIPARE, NEGARI, FEREASTRA, regula care decide este_site, controale().

IESIRE
    0 = nicio afirmatie interzisa, si controalele au trecut
    1 = gasite; fiecare cu fisier, rand si tiparul care a prins
    2 = eroare de folosire
    3 = CONTROL PICAT: poarta nu masoara ce spune
"""
import os
import re
import sys

# Consola Windows e cp1252 si crapa pe diacritice; iesirea se forteaza pe UTF-8,
# altfel poarta moare exact cand are ceva de raportat.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CAI = ('src', 'docs')
EXTENSII = ('.tsx', '.ts', '.mdx', '.md', '.json')
SARITE = {'node_modules', '.next', '.git', '__pycache__'}

# Fiecare tipar are un nume, ca mesajul sa spuna ce s-a prins, nu doar ca s-a prins.
TIPARE = [
    ('persoana intai cu vechime',
     re.compile(r'\b(avem|aven|avem deja)\s+(?:peste\s+)?\d+\s+(?:ani|de ani)', re.I), False),
    ('persoana intai cu experienta',
     re.compile(r'\b(experien\w+)\s+(?:noastr\w+)\s+de\s+(?:peste\s+)?\d+', re.I), False),
    ('autoritate nesustinuta la persoana intai',
     re.compile(r'\bsuntem\s+(autoriza\w+|acredita\w+|certifica\w+)', re.I), False),
    ('certificare pe care nu o detinem',
     re.compile(r'\b(ISO\s*27001|SOC\s*2|ISO\s*9001)\b', re.I), False),
    ('numar de clienti fara sursa',
     re.compile(r'\bpeste\s+\d{2,}\s+(?:de\s+)?(?:clien\w+|companii|firme|institu\w+)', re.I), False),
    # Sigiliul de verificare proprie: "Pagina verificata la <data>", "Actualizat la <data>".
    # Adaugat pe 5 sep 2026, dupa ce un asemenea rand a stat in subsol si, odata ce subsolul
    # a trecut in layout, a ajuns tiparit pe pagini scrise in aceeasi zi si citite de nimeni.
    # Nicio poarta nu l-a prins; l-am vazut intr-o captura de ecran.
    #
    # Ce deosebeste forma interzisa de cea permisa e VERBUL, nu data. "Verificata la <data>"
    # nu spune cine a verificat si contra a ce, deci e o afirmatie despre propria noastra
    # rigoare. "Termenele sunt preluate din actele citate, la <data>" spune ce s-a facut si
    # ce nu, deci trece - si e chiar martorul negativ al tiparului asta.
    #
    # Ultimul camp: se aplica DOAR pe fisierele care ajung la vizitator. Intr-o nota tehnica
    # din `docs/` aceeasi formulare e un titlu de sectiune, urmat chiar de raspuns.
    ('sigiliu de verificare proprie, fara cine si contra a ce',
     re.compile(r'\b(?:verificat|verificat[a\u0103]|actualizat|actualizat[a\u0103]|auditat|auditat[a\u0103])'
                r'\s+(?:la|[i\u00ee]n|pe)\s+\d', re.I), True),
]


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
    return sorted(gasite)


# O negare inaintea afirmatiei o rastoarna: "nu detinem certificare ISO 27001" e exact
# forma pe care o VREM pe site. Cautarea se face pe text intreg, nu pe rand, fiindca
# negarea si termenul cad frecvent pe randuri diferite dupa formatare.
NEGARI = re.compile(r'\b(nu|f[aă]r[aă]|nici|zero)\b', re.I)
FEREASTRA = 90


def cauta(text, este_site=True):
    """Intoarce lista de (nume_tipar, numar_rand, fragment).

    Textul se parcurge intreg, cu pozitia tradusa in numar de rand, ca sa nu pierdem
    potrivirile taiate de formatare si ca sa putem citi contextul dinaintea lor.

    `este_site` spune daca fisierul ajunge la vizitator. Unele tipare au inteles NUMAI
    acolo: un sigiliu de verificare e o problema fiindca il citeste cineva care nu poate
    sti cine a verificat. Aceeasi formulare intr-o nota tehnica din `docs/` e un titlu de
    sectiune, urmat chiar de raspunsul la intrebare. Fara distinctia asta, poarta cerea
    sa fie rescrisa o pagina CORECTA - iar cand poarta acuza forma corecta, se repara
    poarta, nu textul.
    """
    gasiri = []
    for nume, tipar, doar_pe_site in TIPARE:
        if doar_pe_site and not este_site:
            continue
        for m in tipar.finditer(text):
            inceput = max(0, m.start() - FEREASTRA)
            context_anterior = text[inceput:m.start()]
            if NEGARI.search(context_anterior):
                continue  # afirmatia e negata, deci e cinstita
            numar = text.count('\n', 0, m.start()) + 1
            fragment = ' '.join(text[max(0, m.start() - 40):m.end() + 40].split())
            gasiri.append((nume, numar, fragment[:120]))
    return gasiri


def controale():
    """Doua controale opuse. Intoarce None daca amandoua trec, altfel motivul."""
    # Martorul pozitiv se asambleaza din bucati, ca fisierul asta sa nu fie el insusi o instanta.
    pozitiv = ' '.join(['avem', '6', 'ani', 'de', 'experienta', 'in', 'arhivare'])
    if not cauta(pozitiv):
        return 'martorul pozitiv nu a fost prins: poarta nu masoara nimic'
    # Forma corecta, atribuita unei entitati numite. Numele e evident fictiv (decizia D11), ca
    # fisierul sa nu poarte numele vreunei firme reale (decizia D10).
    negativ = 'Alfa Exemplu SRL, firma care detine depozitul, arhiveaza documente din 2019, la Golesti.'
    if cauta(negativ):
        return 'martorul negativ a fost prins: tiparele sunt prea late si ar bloca forma corecta'

    # Martorii sigiliului de verificare proprie. Fixtura se asambleaza la rulare, ca fisierul
    # asta sa nu fie el insusi o instanta a tiparului pe care il descrie.
    sigiliu = ' '.join(['Pagina', 'verificata', 'la', '5', 'septembrie', '2026'])
    if not any('sigiliu' in n for n, _, _ in cauta(sigiliu)):
        return 'martorul de sigiliu nu a fost prins: o data fara verb ar trece drept informatie'
    # Forma CORECTA, care spune ce s-a facut si ce nu: nu are voie sa fie prinsa. Fara martorul
    # asta, tiparul ar bloca exact propozitia onesta de pe pagina de start.
    onest = ('Termenele sunt preluate din actele normative citate pe fiecare rand, la 5 septembrie '
             '2026, ca sa le puteti verifica singur la sursa.')
    if any('sigiliu' in n for n, _, _ in cauta(onest)):
        return 'martorul de sigiliu, negativ: forma onesta cu data a fost prinsa - tiparul e prea lat'
    return None


def main():
    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        print('Verdictul e NEMASURAT, nu "curat".', file=sys.stderr)
        return 3

    lista = fisiere()
    if not lista:
        print('poarta-afirmatii: niciun fisier de verificat - masuratoarea e invalida', file=sys.stderr)
        return 3

    total = 0
    for cale in lista:
        try:
            text = open(cale, encoding='utf-8').read()
        except (OSError, UnicodeDecodeError) as e:
            print('NU AM PUTUT CITI ' + cale + ': ' + str(e), file=sys.stderr)
            return 2
        # Fisierele din `src/` ajung la vizitator; `docs/` si `.claude/` nu.
        este_site = os.path.relpath(cale, RADACINA).replace(os.sep, '/').startswith('src/')
        for nume, numar, fragment in cauta(text, este_site):
            rel = os.path.relpath(cale, RADACINA)
            print(rel + ':' + str(numar) + '  ' + nume + '  | ' + fragment)
            total += 1

    print('CONTROALE: martor pozitiv OK, martor negativ OK')
    print('SURSA: ' + str(len(lista)) + ' fisier(e)')
    print('AFIRMATII NEACOPERITE: ' + str(total))
    if total:
        print('')
        print('Regula: vechimea si autorizarea se scriu ATRIBUIT entitatii care ar scoate actul;')
        print('cat timp site-ul nu numeste nicio firma (decizia D10), propozitia nu se scrie.')
        print('Vezi .claude/rules/afirmatii-atribuite.md')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())

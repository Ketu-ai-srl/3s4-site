#!/usr/bin/env python3
"""Poarta de scurgeri: ce nu are voie sa iasa dintr-un depozit PUBLIC.

De ce exista: `Ketu-ai-srl/3s4-site` e public. Regula "nu comite analiza concurentei,
PII sau preturi de cost" era scrisa in proza, in doua fisiere de reguli, si NU a aparat
nimic: pe 5 sep 2026 numele unui concurent ajunsese in doua comentarii de cod si intr-un
`.pyc` din cache. L-am prins citind, cu ochii. A doua oara nu-l mai prind.

CE VERIFICA
  1. NUME INTERZISE. Lista e pastrata ca AMPRENTE (sha256, primele 16 caractere hex),
     nu ca text: un fisier public care ar enumera numele pe care le ascunde ar fi exact
     scurgerea pe care o previne. Textul se sparge in cuvinte, fiecare cuvant se
     amprenteaza, si se compara amprentele. Un domeniu cade pe cuvantul dinaintea
     punctului, iar forma cu majuscula cade la fel (se lucreaza pe minuscule).
     Nota: aici NU se citeaza niciun nume interzis. Prima versiune a acestui antet il
     scria, ca sa explice mecanismul, si poarta s-a gasit pe ea insasi - o explicatie
     care contine exemplul devine o instanta a lui.
  2. TIPARE DE DATE PERSONALE SI SECRETE: telefoane romanesti, adrese de posta pe
     furnizori publici, chei private, jetoane cu forma cunoscuta.

CONTROALE la fiecare rulare:
  - martor POZITIV: un text care contine un nume de control (asamblat la rulare din
    bucati, ca sa NU existe literal nicaieri pe disc) plus un telefon si o cheie privata.
    Daca nu-l prinde, verdictul e NEMASURAT, nu curat.
  - martor NEGATIV: text romanesc obisnuit, cu un numar de lege si o adresa de pe domeniul
    propriu. Daca il prinde, tiparele sunt prea late si poarta ar bloca munca corecta.

CUM SE ADAUGA UN NUME: se ruleaza `python poarta-scurgeri.py --amprenta <cuvant>` si se
pune amprenta in AMPRENTE. Cuvantul insusi nu se scrie in fisier, niciodata.

CE NU VERIFICA (reziduuri, scrise ca un zero sa nu fie citit drept acoperire)
Intrebarea pe care o pune de fapt: "are vreun cuvant din arborele de lucru una dintre
amprentele listei, sau se potriveste vreun RAND cu unul dintre tiparele de forma?"
  - Un nume scris altfel decat amprenta lui trece: despartit in doua cuvinte, cu cratima,
    cu o litera schimbata, cu diacritice. Amprenta e pe cuvantul exact, in minuscule.
  - Lista de amprente e o copie scrisa de mana a unei multimi pe care nu o enumera nimeni;
    nimic nu masoara completitudinea ei.
  - Se deschid doar fisierele cu extensiile din EXTENSII. Un PDF, un document de birou, o
    imagine, un fisier compilat sau unul fara extensie nu se citesc NICIODATA - fisierul
    compilat din incidentul care a nascut poarta nu ar fi prins nici azi.
  - Tiparele se aplica pe RAND: un numar sau o cheie taiata pe doua randuri trece.
  - Adresele de posta se cauta doar pe cativa furnizori publici; una pe un domeniu de firma
    trece.
  - telefon_plauzibil lasa DELIBERAT sa treaca numerele cu toate cifrele identice.
  - Se citeste arborele de LUCRU. Ce e deja in istoricul git nu se vede de aici.
  - Fisierele care nu se decodeaza UTF-8 se sar in tacere.
  - Telefonul romanesc nu se cauta in profilurile de construire (EXCEPTARI_CALE, mai jos):
    un numar scris acolo nu e prins, oricare ar fi el.
  - Materialul intern fara nume propriu (pret de cost, analiza, nota de vanzare) nu are
    nicio forma dupa care sa fie prins: acolo proza e singura garda.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  fisierul raportat, din care se scoate scurgerea.
      AMPRENTE, numai prin ADAUGARE, cu amprenta produsa de --amprenta.
  NU  stergerea unei amprente, SARITE, EXTENSII, TIPARE, telefon_plauzibil, controale(),
      EXCEPTARI_CALE (nici o cale noua, nici un tipar nou in ea).
      O scurgere nu se rezolva scotand fisierul din multimea masurata.

IESIRE: 0 curat - 1 scurgeri gasite - 2 folosire gresita - 3 control picat
"""
import argparse
import hashlib
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SARITE = {'node_modules', '.next', '.git', '__pycache__', '.vercel', 'playwright-report', 'test-results'}
EXTENSII = ('.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.sh', '.md', '.mdx',
            '.json', '.css', '.html', '.txt', '.xml', '.yml', '.yaml', '.svg')

# Amprente de nume care nu au voie in depozitul public: concurenti analizati de noi,
# denumiri din materialele interne. Text: niciunul. Vezi antetul pentru cum se adauga.
AMPRENTE = {
    'ce265da33cb0b8ff': 'nume de concurent analizat',
    '314ca3900d42a676': 'nume de firma a unui concurent',
    '723915ea23291acf': 'nume de control al portii (nu apare in munca reala)',
}

def telefon_plauzibil(m):
    """Un numar cu toate cifrele identice (+40 000 000 000) e fixtura, nu om.

    Fara filtrul asta poarta ar fi cerut sa stric fixturile portii juridice, care are
    NEVOIE de un numar cu forma valida ca sa masoare completitudinea datelor de firma.
    O poarta care cere altei porti sa se strice e o poarta gresita.
    """
    cifre = re.sub(r'\D', '', m.group(0))[2:]
    return len(set(cifre)) > 1


TIPARE = [
    (re.compile(r'\+40[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}'), 'numar de telefon romanesc', telefon_plauzibil),
    (re.compile(r'[\w.+-]+@(?:gmail|yahoo|outlook|hotmail|proton(?:mail)?)\.[a-z]{2,}', re.I), 'adresa personala de posta', None),
    (re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'), 'cheie privata', None),
    (re.compile(r'\bgh[pousr]_[A-Za-z0-9]{16,}'), 'jeton GitHub', None),
    (re.compile(r'\bAKIA[0-9A-Z]{16}\b'), 'cheie AWS', None),
    (re.compile(r'\bsk-[A-Za-z0-9]{20,}'), 'cheie de API', None),
]

# Exceptari pe CALE EXACTA, fiecare numai pentru un fel de gasire. Profilurile de construire
# (config/profil-<site>.json) sunt sursa DECLARATA a valorilor de contact publicate de site:
# numarul operatorului din textele juridice si numarul de WhatsApp sunt publice prin destinatie,
# iar profilul e locul unde se scriu, nu o scurgere. Exceptarea e ingusta: numai telefonul
# romanesc, numai fisierele de forma exacta config/profil-<nume>.json din radacina. Numele
# interzise, cheile si jetoanele se cauta si acolo. Acelasi numar scris intr-un modul din src/
# ramane rosu (martorul din controale()).
EXCEPTARI_CALE = [
    (re.compile(r'^config/profil-[a-z0-9-]+\.json$'), 'numar de telefon romanesc'),
]


def exceptat(rel, fel):
    rel = rel.replace(os.sep, '/')
    return any(cale.match(rel) and fel == f for cale, f in EXCEPTARI_CALE)


TIPAR_CUVANT = re.compile(r'[a-z0-9]{4,}')


def amprenta(cuvant):
    return hashlib.sha256(cuvant.lower().encode('utf-8')).hexdigest()[:16]


def analizeaza(text, rel=''):
    """Intoarce lista de (numar_rand, fel, fragment); `rel` = calea relativa, pentru EXCEPTARI_CALE."""
    gasiri = []
    for numar, rand in enumerate(text.splitlines(), start=1):
        for cuvant in TIPAR_CUVANT.findall(rand.lower()):
            fel = AMPRENTE.get(amprenta(cuvant))
            if fel:
                gasiri.append((numar, fel + ': ' + cuvant, rand.strip()[:110]))
        for tipar, fel, filtru in TIPARE:
            m = tipar.search(rand)
            if m and (filtru is None or filtru(m)) and not exceptat(rel, fel):
                gasiri.append((numar, fel, rand.strip()[:110]))
    return gasiri


def controale():
    # Numele de control se asambleaza AICI, la rulare, ca sa nu existe literal in niciun
    # fisier de pe disc - altfel poarta s-ar gasi pe ea insasi si ar cere o exceptare,
    # iar exceptarea ar fi chiar gaura prin care trece o scurgere adevarata.
    control = 'martor' + 'scurgere' + '3s'
    if amprenta(control) not in AMPRENTE:
        return 'numele de control nu mai e in lista de amprente - poarta nu se poate proba'
    pozitiv = '\n'.join([
        'O nota care pomeneste ' + control + ' in mijlocul unui comentariu.',
        'Sunati la ' + '+40 7' + '12 345 678' + ' pentru detalii.',
        '-----' + 'BEGIN RSA PRIVATE KEY' + '-----',
    ])
    feluri = ' '.join(f for _, f, _ in analizeaza(pozitiv))
    if 'nume de control' not in feluri:
        return 'martorul pozitiv: numele interzis nu a fost prins'
    if 'telefon' not in feluri:
        return 'martorul pozitiv: telefonul nu a fost prins'
    if 'cheie privata' not in feluri:
        return 'martorul pozitiv: cheia privata nu a fost prinsa'
    negativ = '\n'.join([
        'Termenele vin din Legea 16/1996 si din Legea 365/2002, republicata.',
        'Scrieti la contact@3s4.ke2.in sau sunati la numarul din pagina de contact.',
        'Depozitul are 4000 de metri liniari si un plan de arhivare pe 2026.',
        'telefon fixtura: ' + '+40 0' + '00 000 000',
    ])
    g = analizeaza(negativ)
    if g:
        return 'martorul negativ a fost prins: ' + '; '.join(f for _, f, _ in g)
    # Exceptarea pe cale: acelasi numar e liber in profil, rosu in src/ si in alt JSON din config/,
    # iar in profil o cheie privata ramane prinsa (exceptarea nu acopera alt fel de gasire).
    numar = '+40 7' + '12 345 678'
    rand_profil = '"telefon": "' + numar + '",'
    if analizeaza(rand_profil, 'config/profil-martor.json'):
        return 'exceptarea pe cale: numarul din profil e inca prins'
    for alta in ('src/lib/martor.ts', 'config/martor.json', 'src/config/profil-martor.json', 'config/profil-martor.json.bak'):
        if not any('telefon' in f for _, f, _ in analizeaza(rand_profil, alta)):
            return 'exceptarea pe cale: numarul nu mai e prins in ' + alta
    cheie = '-----' + 'BEGIN RSA PRIVATE KEY' + '-----'
    if not any('cheie privata' in f for _, f, _ in analizeaza(cheie, 'config/profil-martor.json')):
        return 'exceptarea pe cale: cheia privata din profil nu mai e prinsa'
    return None


def fisiere():
    gasite = []
    for radacina, directoare, nume in os.walk(RADACINA):
        directoare[:] = [d for d in directoare if d not in SARITE]
        for n in nume:
            if n.endswith(EXTENSII):
                gasite.append(os.path.join(radacina, n))
    return sorted(gasite)


def main():
    p = argparse.ArgumentParser(description='Poarta de scurgeri pentru depozitul public.')
    p.add_argument('--amprenta', metavar='CUVANT',
                   help='tipareste amprenta unui cuvant, ca sa fie adaugata in lista')
    a = p.parse_args()

    if a.amprenta:
        print(amprenta(a.amprenta))
        return 0

    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    lista = fisiere()
    if not lista:
        print('poarta-scurgeri: niciun fisier de citit - masuratoarea e invalida', file=sys.stderr)
        return 3

    total = 0
    for cale in lista:
        try:
            continut = open(cale, encoding='utf-8').read()
        except (UnicodeDecodeError, OSError):
            continue
        rel = os.path.relpath(cale, RADACINA)
        for numar, fel, fragment in analizeaza(continut, rel):
            print(rel + ':' + str(numar) + '  ' + fel + '  | ' + fragment)
            total += 1

    print('CONTROALE: martor pozitiv OK, martor negativ OK')
    print('SURSA: ' + str(len(lista)) + ' fisier(e)')
    print('SCURGERI: ' + str(total))
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())

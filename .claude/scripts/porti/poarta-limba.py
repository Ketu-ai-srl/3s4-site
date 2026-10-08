#!/usr/bin/env python3
"""Poarta de limba romana: diacritice complete si o singura forma de adresare.

De ce exista: un site de arhivare din regiune, masurat de noi, livreaza in ROMANA
titluri fara diacritice, o pagina intreaga netradusa si o cheie de traducere ramasa
in tabelul de preturi. Sunt exact defectele pe care le prinde un om abia dupa ce
le-a vazut clientul. Le prindem mecanic, la fiecare lot.

Verifica patru lucruri, in textul VIZIBIL:
  1. cuvinte romanesti frecvente scrise fara diacritice (lista curata, fara ambiguitati)
  2. amestec de adresare: "dumneavoastra" impreuna cu "tu / tau / tie" in acelasi fisier
  3. chei de traducere scapate in text (forma "ceva.altceva_" ramasa neprocesata)
  4. adresarea formala SINGURA in modulele juridice romanesti publice (`src/content/juridic/md/*.ro.ts`):
     decizia 77 (07.10.2026) a anulat exceptia D15, deci acolo "dumneavoastra", "dvs.", "dumneata",
     "va", "vi", "ati" si "v-" nu mai au loc nici fara amestec. Exceptiile au nume si motiv in EXCEPTII_FORMAL; restul
     site-ului e masurat de punctul 2 si de probele vitest. Aceeasi verificare se face si pe meta-descrierile
     romanesti ale acelorasi documente (`META_DOCUMENTE_MD` din `src/content/juridic/pagini.ts`), care ajung in
     <head>: titlul si descrierea paginii, inclusiv `og:` si `twitter:`. Exceptiile au nume in EXCEPTII_META.
     A treia suprafata: descrierile romanesti ale acelorasi documente din rute (`DESCRIERE_MD` din
     `src/content/juridic/publicare.ts`), care ajung in paleta de cautare, in `/llms.txt` si in pachetul de browser.

CONTROALE la fiecare rulare:
  - martor pozitiv, fabricat la rulare: un text cu toate cele trei defecte; daca nu-l prinde,
    verdictul e NEMASURAT (iesire 3)
  - martor negativ: un text corect; daca il prinde, tiparele sunt prea late (iesire 3)

CE NU VERIFICA (reziduuri)
Intrebarea pe care o pune de fapt: "apare vreunul dintre cuvintele din CUVINTE fara
diacritice, exista o forma de cheie de traducere, si apar in ACELASI fisier si adresarea
formala si cea informala?" Nu "e romana corecta".
  - Orice cuvant din afara listei trece. Lista a fost curatata deliberat de intrarile
    ambigue, deci e o margine de jos prin constructie, nu o acoperire.
  - Gramatica, acordul, topica si tonul nu se masoara deloc.
  - Se citeste doar arborele src/. docs/, .github/ si README raman nemasurate de poarta asta.
  - Din cod se ia doar ce trece de scanerul propriu: sirurile sub LUNGIME_MINIMA_SIR se
    arunca, si pare_cod arunca orice bucata cu semne de sintaxa ori cu mai putin de doua
    cuvinte. Un titlu scurt cu o interpolare nu ajunge sa fie masurat.
  - Fisierele de marcare se citesc BRUT, deci blocurile de cod din ele se analizeaza ca proza.
  - Amestecul de adresare se masoara PE FISIER. Doua fisiere, cate o adresare in fiecare, trec
    amandoua, desi site-ul e inconsecvent.
  - Punctul 4 prinde pronumele si auxiliarul, nu verbele la persoana a II-a plural ("scrieti"):
    finalul lor il au si participiile ("Utilizatori autorizati"), deci o lista de verbe ar acuza
    text corect. Verbele le masoara `tests/juridic-md.test.ts` pe textul compus, cu exceptiile numite.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  textul acuzat.
      Un cuvant se scoate din CUVINTE DOAR cand poarta acuza o forma CORECTA, si scoaterea se
      scrie in nota deja existenta de mai sus, cu motivul. Adaugarea de cuvinte e libera.
  NU  LUNGIME_MINIMA_SIR, pare_cod, siruri_din_cod, CAI, EXTENSII, SARITE, controale().

IESIRE: 0 curat · 1 defecte gasite · 2 eroare de folosire · 3 control picat
"""
import os
import re
import sys

# Iesirea citeaza fragmente cu diacritice; pe o consola Windows (cp1252) `print` ar arunca, iar procesul ar iesi 1
# dintr-o exceptie, nu dintr-un verdict. Iesirea se scrie deci in UTF-8.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CAI = ('src',)
# `.ts` e aici fiindca proza de continut sta in `src/content/*.ts` - liste de segmente,
# tabele de termene. Cat timp lipsea, textul de acolo nu trecea prin nicio poarta de limba.
EXTENSII = ('.tsx', '.ts', '.mdx', '.md')
SARITE = {'node_modules', '.next', '.git', '__pycache__'}

# Cuvinte care in romana corecta NU pot aparea fara diacritice. Lista e scurta si
# curata deliberat: fiecare intrare trebuie sa nu aiba alta lectura valida.
#
# Ce s-a SCOS din lista, si de ce - nota ramane aici ca sa nu le readaug din reflex:
# 'arhivare', 'contabilitate', 'termene', 'facturi', 'documentatie' si 'digitalizare'
# se scriu EXACT asa, fara niciun semn. Cat au stat in lista, poarta se inrosea pe
# text CORECT (ultima, 'digitalizare', pe 5 sep 2026, in JSON-LD, unde restul randului
# chiar era fara diacritice - deci acuza nimerea fisierul si rata cuvantul).
# Regula: cand poarta acuza o forma corecta, se repara POARTA, nu textul.
CUVINTE = [
    'romana', 'romaneasca', 'romanesti', 'pastrare', 'pastram', 'cautare', 'cautati',
    'raspuns', 'raspunde', 'raspundem', 'intrebare', 'intrebati', 'incredere',
    'primarie', 'primarii', 'inregistrare', 'urmarire', 'sanatate', 'siguranta',
]

TIPAR_CUVINTE = re.compile(r'\b(' + '|'.join(CUVINTE) + r')\b', re.I)
TIPAR_CHEIE = re.compile(r'\b[a-z][a-z0-9]{2,}\.[a-z][a-z0-9_]*_\s')
TIPAR_FORMAL = re.compile(r'dumneavoastr', re.I)
TIPAR_INFORMAL = re.compile(r'\b(tu|t[aă]u|t[aă]i|t[aă]|tale|tie|ție)\b', re.I)

# Punctul 4. Fara re.I: "VI" e numeralul roman din "capitolul VI", nu pronumele; formele cu majuscula
# initiala (inceput de propozitie) sunt scrise explicit.
# Abrevierea "dvs." si forma de politete de grad mic ("dumneata", "dumitale") sunt tot pronume formale:
# nu au omonime in textul cu "tu", deci intra fara risc de a acuza text corect.
TIPAR_FORMAL_SINGUR = re.compile(r'(?<!\w)(dumneavoastr\w*|Dumneavoastr\w*|vă|Vă|vi|Vi|ați|Ați|[Dd]umneata|[Dd]umitale)(?!\w)'
                                 r'|(?<!\w)[Dd]vs\.?(?!\w)|(?<!\w)[vV]-(?=\w)')
DOSAR_JURIDIC_MD = 'src/content/juridic/md/'
# Modulele inca la "dumneavoastra", cu motivul. O intrare se scoate cand motivul nu mai tine.
EXCEPTII_FORMAL = {
    'dpa.ro.ts': 'acordul de prelucrare: il rescrie felia 145, in lucru; trece la "tu" dupa aterizarea ei',
    'subimputerniciti.ro.ts': 'lista subimputernicitilor: tot a feliei 145; trece la "tu" dupa aterizarea ei',
}

# Punctul 4, a doua suprafata: meta-descrierile documentelor `md`. Se citesc numai intrarile `ro` din
# `META_DOCUMENTE_MD`; `META_DOCUMENTE` (familia SEE, alta pagina) ramane in afara, ca si intrarile `en`.
FISIER_META_MD = 'src/content/juridic/pagini.ts'
# Ancora care spune ca familia `md` exista in arbore: cu ea prezenta, lipsa blocului meta e masuratoare invalida.
FISIER_REGISTRU_MD = 'src/content/juridic/md/registru.ts'
EXCEPTII_META = {
    'dpa': 'meta acordului de prelucrare: a feliei 145, ca modulul lui',
    'subimputerniciti': 'meta listei subimputernicitilor: a feliei 145, ca modulul ei',
}
TIPAR_BLOC_META_MD = re.compile(r'export const META_DOCUMENTE_MD\b[^=]*=\s*\{(.*?)\n\};', re.S)
TIPAR_CHEIE_META = re.compile(r'(?m)^  "?([a-z][a-z-]*)"?\s*:\s*\{')
TIPAR_RO_META = re.compile(r'\bro\s*:\s*\{(.*?)\}', re.S)

# Punctul 4, a treia suprafata (runda 3 a feliei 144): descrierile documentelor `md` din rute. Intrarile `ro` din
# `DESCRIERE_MD` sunt siruri simple (`ro: "..."`), nu obiecte; aceleasi chei si aceleasi exceptii numite ca la meta.
FISIER_DESCRIERE_MD = 'src/content/juridic/publicare.ts'
TIPAR_BLOC_DESCRIERE_MD = re.compile(r'export const DESCRIERE_MD\b[^=]*=\s*\{(.*?)\n\};', re.S)
TIPAR_RO_DESCRIERE = re.compile(r'\bro\s*:\s*("[^"\n]*"|' + "'[^'\\n]*'" + r'|`[^`]*`)')


def meta_formal(continut):
    """Formele formale din intrarile `ro` ale `META_DOCUMENTE_MD`.

    Intoarce (gasiri, chei_cu_ro) sau None daca blocul lipseste. `gasiri` = (cheie, numar_rand, forma).
    """
    return bloc_formal(continut, TIPAR_BLOC_META_MD, TIPAR_RO_META)


def descriere_formal(continut):
    """Formele formale din intrarile `ro` ale `DESCRIERE_MD`; acelasi fel de rezultat ca `meta_formal`."""
    return bloc_formal(continut, TIPAR_BLOC_DESCRIERE_MD, TIPAR_RO_DESCRIERE)


def bloc_formal(continut, tipar_bloc, tipar_ro):
    """Citirea comuna a unui bloc `{ cheie: { ro: ..., en: ... } }`: formele formale din intrarile `ro`."""
    bloc = tipar_bloc.search(continut)
    if not bloc:
        return None
    interior, deplasare = bloc.group(1), bloc.start(1)
    chei = list(TIPAR_CHEIE_META.finditer(interior))
    gasiri, chei_cu_ro = [], []
    for i, k in enumerate(chei):
        sfarsit = chei[i + 1].start() if i + 1 < len(chei) else len(interior)
        ro = tipar_ro.search(interior, k.end(), sfarsit)
        if not ro:
            continue
        chei_cu_ro.append(k.group(1))
        if k.group(1) in EXCEPTII_META:
            continue
        for sir in siruri_din_cod(ro.group(1)):
            for m in TIPAR_FORMAL_SINGUR.finditer(sir):
                rand = continut.count(chr(10), 0, deplasare + ro.start()) + 1
                gasiri.append((k.group(1), rand, m.group(0)))
    return gasiri, chei_cu_ro


def formal_interzis(rel):
    """Se masoara adresarea formala singura in fisierul dat (cale relativa la radacina)?"""
    cale = rel.replace(os.sep, '/').replace(BSLASH, '/')
    if not cale.startswith(DOSAR_JURIDIC_MD) or not cale.endswith('.ro.ts'):
        return False
    return os.path.basename(cale) not in EXCEPTII_FORMAL

# Textul vizibil dintr-un fisier de cod: ce sta intre > si <, plus continutul sirurilor.
TIPAR_TEXT_JSX = re.compile(r'>([^<>{}]{3,})<')

# Sirurile se extrag INTREGI, fara prag de lungime in tipar; cele scurte se arunca dupa.
#
# De ce conteaza ordinea, masurat pe 5 sep 2026: tiparul vechi cerea cel putin 12
# caractere CHIAR IN TIPAR. Cand primul sir dintr-un fisier era mai scurt - `from "next"` -
# potrivirea esua acolo, motorul avansa un caracter si se resincroniza pe ghilimeaua de
# INCHIDERE. De acolo incolo perechile erau decalate cu unu, deci poarta citea CODUL
# DINTRE siruri in loc de continutul lor. Pe `layout.tsx` a extras 23 de bucati, toate
# cod, si niciun titlu: `Arhiva care raspunde` a stat in `<title>` fara diacritice, desi
# `raspunde` e in lista de cuvinte de cand exista poarta. Verdictul 0 nu insemna curat,
# insemna ca nu se masura nimic.
#
# Extragerea are de acum martorii ei in `controale()`. Martorii vechi probau doar
# `analizeaza()`, adica pasul de DUPA extragere - tocmai pasul care nu era stricat.
#
# A DOUA reparatie, in aceeasi zi: tiparele nu stiau ce e COMENTARIU. Un identificator
# citat cu accente grave intr-o nota - `pagina: PRIMARII`, scris ca sa explice cum se
# adauga un segment - devenea "text romanesc fara diacritice", fiindca sirul sablon se
# potriveste oriunde, si in proza. E acelasi tipar ca peste tot: o explicatie care
# CITEAZA constructia pe litere devine o instanta a ei. Deci extragerea nu mai e o
# colectie de tipare, ci un scaner care stie in ce stare e: cod, sir, comentariu.
LUNGIME_MINIMA_SIR = 12
BSLASH = chr(92)


def siruri_din_cod(continut):
    """Continutul sirurilor dintr-un fisier TypeScript, fara ce e in comentarii.

    Un scaner, nu tipare: numai asa se poate deosebi `//` dintr-o adresa web de `//`
    care incepe o nota, si numai asa un sir citat intr-un comentariu nu ajunge sa fie
    masurat ca text de citit. Nu e un parser de TypeScript si nu trebuie sa fie -
    trebuie doar sa nu confunde cele trei stari.
    """
    siruri = []
    i, n = 0, len(continut)
    while i < n:
        c = continut[i]
        if c == '/' and i + 1 < n and continut[i + 1] == '/':
            j = continut.find('\n', i)
            i = n if j < 0 else j + 1
            continue
        if c == '/' and i + 1 < n and continut[i + 1] == '*':
            j = continut.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c in ('"', "'", '`'):
            inceput = i + 1
            i += 1
            while i < n:
                if continut[i] == BSLASH:
                    i += 2
                    continue
                if continut[i] == c:
                    break
                # Un sir cu ghilimele simple sau duble nu trece de capatul randului:
                # daca vad linie noua inainte de inchidere, nu era un sir, era altceva
                # (o apostrofa in proza, un operator). Ma opresc si reiau de acolo.
                if continut[i] == '\n' and c != '`':
                    break
                i += 1
            if i < n and continut[i] == c:
                siruri.append(continut[inceput:i])
                i += 1
            else:
                i = inceput
            continue
        i += 1
    return siruri


def pare_cod(bucata):
    """Textul citit de om nu poarta sintaxa.

    Fara filtrul asta, poarta raporteaza numele proprietatilor - `intrebare=`,
    `ex.raspuns` - ca text romanesc fara diacritice, adica se inroseste pe cod corect.
    Masurat pe primul continut real: 8 din 9 constatari erau de acest fel.
    """
    b = bucata.strip()
    if any(ch in b for ch in '<>{}=$`'):
        return True
    if len(b.split()) < 2:
        return True
    return False


def text_vizibil(cale, continut):
    """Ce citeste un OM din fisier: textul din JSX plus continutul sirurilor.

    `.ts` intra la fel ca `.tsx`, nu ca text brut: fisierele de continut - liste de
    segmente, tabele de termene - tin proza in siruri, iar restul e cod. Cat timp `.ts`
    lipsea din `EXTENSII`, proza din `src/content/*.ts` nu era masurata deloc.
    """
    if cale.endswith(('.tsx', '.ts')):
        bucati = TIPAR_TEXT_JSX.findall(continut) if cale.endswith('.tsx') else []
        bucati += [s for s in siruri_din_cod(continut) if len(s) >= LUNGIME_MINIMA_SIR]
        return '\n'.join(b for b in bucati if not pare_cod(b))
    return continut


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


def analizeaza(text, formal_singur=False):
    """Intoarce lista de (fel, numar_rand, fragment). `formal_singur`: masoara si punctul 4."""
    gasiri = []
    for numar, rand in enumerate(text.splitlines(), start=1):
        # sarim adresele si caile, unde diacriticele nu au ce cauta
        curat = re.sub(r'https?://\S+', ' ', rand)
        curat = re.sub(r'[\w./-]+\.(?:tsx|ts|mdx|md|png|svg|json)\b', ' ', curat)
        # Se raporteaza TOATE potrivirile de pe rand, nu doar prima: cu `search`, un
        # rand cu trei cuvinte gresite se repara in trei rulari, iar ultimele doua par
        # aparute din senin dupa ce le-am "reparat" pe primele.
        for m in TIPAR_CUVINTE.finditer(curat):
            gasiri.append(('cuvant fara diacritice: ' + m.group(1), numar, rand.strip()[:110]))
        k = TIPAR_CHEIE.search(curat)
        if k:
            gasiri.append(('cheie de traducere scapata: ' + k.group(0).strip(), numar, rand.strip()[:110]))
        if formal_singur:
            for m in TIPAR_FORMAL_SINGUR.finditer(curat):
                gasiri.append(('adresare formala intr-un document juridic romanesc (decizia 77): ' + m.group(0),
                               numar, rand.strip()[:110]))
    if TIPAR_FORMAL.search(text) and TIPAR_INFORMAL.search(text):
        gasiri.append(('adresare amestecata: dumneavoastra impreuna cu tu', 0, ''))
    return gasiri


def controale():
    pozitiv = '\n'.join([
        'Va ' + 'raspunde' + ' in ' + 'romana' + ' imediat.',
        'pricing.f_workspace_ 7',
        'Arhiva dumneavoastra si arhiva ta.',
    ])
    g = analizeaza(pozitiv)
    feluri = ' '.join(x[0] for x in g)
    if 'cuvant fara diacritice' not in feluri:
        return 'martorul pozitiv: cuvintele fara diacritice nu au fost prinse'
    if 'cheie de traducere' not in feluri:
        return 'martorul pozitiv: cheia de traducere nu a fost prinsa'
    if 'adresare amestecata' not in feluri:
        return 'martorul pozitiv: amestecul de adresare nu a fost prins'
    negativ = 'Va răspundem în română, iar arhiva dumneavoastră rămâne a dumneavoastră.'
    if analizeaza(negativ):
        return 'martorul negativ a fost prins: tiparele sunt prea late'

    # Martorii EXTRAGERII, nu ai analizei. Fara ei, poarta poate iesi 0 fiindca nu a
    # citit nimic - si exact asta s-a intamplat luni intregi pe `layout.tsx`.
    # Fixtura se asambleaza aici, la rulare, nu sta scrisa intr-un fisier: un fisier de
    # proba cu un cuvant gresit ar fi el insusi prins de poarta pe care o probeaza.
    g = chr(96)  # accent grav, scris asa ca sa nu deschida o comanda in shell
    sursa = '\n'.join([
        'import type { Metadata } from "next";',   # sirul SCURT care decala perechile
        'export const T = {',
        '  titlu: "3S - arhiva care raspunde repede",',
        "  nota: 'Va pastram documentele in conditii de siguranta.',",
        '  sablon: ' + g + 'Termenul de pastrare a fost stabilit prin lege.' + g + ',',
        # nota care CITEAZA un identificator: nu e text de citit, e explicatie de cod
        '  // se scrie ' + g + 'pagina: PRIMARII' + g + ' in lista de segmente',
        # adresa web cu doua bare INTR-UN SIR: nu incepe un comentariu
        '  adresa: "https://exemplu.test/pagina-de-proba",',
        '  dupa: "Documentele se pastreaza in depozit.",',
        '};',
    ])
    extras = text_vizibil('proba.ts', sursa)
    for asteptat in ('raspunde', 'pastram', 'pastrare'):
        if asteptat not in extras:
            return ('martorul de extragere: sirul cu `' + asteptat + '` nu a fost extras din `.ts` - '
                    'poarta ar iesi 0 fiindca nu citeste, nu fiindca e curat')
    if not analizeaza(extras):
        return 'martorul de extragere: textul extras contine greseli, dar analiza nu le-a gasit'
    if 'PRIMARII' in extras:
        return ('martorul de comentariu: un identificator citat intr-o nota a fost extras ca text - '
                'poarta ar cere sa se strice o explicatie corecta')
    if 'Documentele se pastreaza' not in extras:
        return ('martorul de adresa web: scanerul a luat cele doua bare dintr-o adresa drept inceput '
                'de comentariu si a inghitit restul fisierului')

    # Si controlul opus: un fisier care contine NUMAI cod nu trebuie sa produca text.
    doar_cod = 'import { useState } from "react";\nconst x = a.b_ + 1;\n'
    if analizeaza(text_vizibil('proba.ts', doar_cod)):
        return 'martorul negativ de extragere: cod curat a fost raportat ca text gresit'

    # Punctul 4 (decizia 77). Fraza formala SINGURA, fara niciun "tu" langa ea, deci punctul 2 n-o vede;
    # fixtura se asambleaza aici, ca fisierul portii sa nu poarte formele pe care le vaneaza.
    formal = ('Dacă ' + 'dumnea' + 'voastră ne scrieți, ' + 'v' + 'ă răspundem și ' + 'v' + '-am confirmat ce '
              + 'a' + 'ți cerut pentru datele ' + 'd' + 'vs.')
    prinse = [x for x in analizeaza(formal, formal_singur=True) if x[0].startswith('adresare formala')]
    if len(prinse) != 5:
        return ('martorul pozitiv al adresarii formale: ' + str(len(prinse)) + ' forme prinse din 5 '
                '(pronumele, "v" + "a", "v" urmat de verb cu cratima, auxiliarul, abrevierea "d" + "vs.")')
    if any(x[0].startswith('adresare') for x in analizeaza(formal)):
        return 'martorul de domeniu: adresarea formala singura a fost acuzata in afara modulelor juridice'
    tu = 'Dacă ne scrii, îți răspundem; poți cere datele tale. Capitolul VI se aplică.'
    if analizeaza(tu, formal_singur=True):
        return 'martorul negativ al adresarii formale: textul cu "tu" (si numeralul VI) a fost acuzat'
    modul = 'export default function d(c) {' + chr(10) + '  return { introducere: "' + formal + '" };' + chr(10) + '}' + chr(10)
    if not any(x[0].startswith('adresare formala') for x in analizeaza(text_vizibil('d.ro.ts', modul), formal_singur=True)):
        return 'martorul de extragere al adresarii formale: fraza din sirul unui modul nu a fost citita'
    for rel, asteptat in (
        ('src/content/juridic/md/cookie-uri.ro.ts', True),
        (BSLASH.join(['src', 'content', 'juridic', 'md', 'termeni.ro.ts']), True),
        ('src/content/juridic/md/cookie-uri.en.ts', False),
        ('src/content/juridic/md/dpa.ro.ts', False),
        ('src/content/juridic/cookie-uri.ts', False),
        ('src/content/ro-md/acasa.ts', False),
    ):
        if formal_interzis(rel) is not asteptat:
            return 'martorul de domeniu: formal_interzis(' + rel + ') = ' + str(not asteptat) + ', asteptat ' + str(asteptat)

    # Punctul 4 pe meta (runda 2 a feliei 144). Un bloc fabricat la rulare: o descriere formala pe un document public
    # (prinsa), aceeasi pe DPA (exceptie numita), in `en` si in `META_DOCUMENTE` (in afara suprafetei).
    def intrare(cheie, ro, en):
        return ('  "' + cheie + '": {' + chr(10) + '    ro: { titlu: "T | 3S", descriere: "' + ro + '" },' + chr(10)
                + '    en: { titlu: "T | 3S", descriere: "' + en + '" },' + chr(10) + '  },' + chr(10))
    cu_tu = 'Cum ne contactezi și cum îți exerciți drepturile.'
    bloc = ('export const META_DOCUMENTE: Record<SlugJuridic, MetaPagina> = {' + chr(10)
            + '  cookies: { titlu: "T | 3S", descriere: "' + formal + '" },' + chr(10) + '};' + chr(10)
            + 'export const META_DOCUMENTE_MD: Readonly<Record<CheieMd, Record<LimbaJuridica, MetaPagina>>> = {' + chr(10)
            + intrare('informatii-legale', cu_tu, formal)
            + intrare('cookie-uri', formal, 'How to contact us.')
            + intrare('dpa', formal, 'How to contact us.')
            + '};' + chr(10))
    rezultat = meta_formal(bloc)
    if rezultat is None:
        return 'martorul meta: blocul META_DOCUMENTE_MD fabricat nu a fost gasit'
    gasiri_meta, chei_cu_ro = rezultat
    if chei_cu_ro != ['informatii-legale', 'cookie-uri', 'dpa']:
        return 'martorul meta: intrarile ro citite sunt ' + str(chei_cu_ro) + ', asteptat 3'
    if sorted(set(x[0] for x in gasiri_meta)) != ['cookie-uri'] or len(gasiri_meta) != 5:
        return ('martorul meta: ' + str(len(gasiri_meta)) + ' forme prinse pe ' + str(sorted(set(x[0] for x in gasiri_meta)))
                + ', asteptat 5, numai pe cookie-uri (nu pe DPA, nu in en, nu in META_DOCUMENTE)')
    if meta_formal(bloc.replace('META_DOCUMENTE_MD', 'META_ALTCEVA')) is not None:
        return 'martorul meta negativ: un bloc cu alt nume a fost citit drept META_DOCUMENTE_MD'

    # Punctul 4 pe descrierile din rute (runda 3 a feliei 144). Acelasi tipar de martor, pe forma `ro: "..."`:
    # prinsa pe un document public, ignorata pe DPA (exceptie numita), in `en` si in `DOCUMENTE_JURIDICE` (familia SEE).
    def intrare_d(cheie, ro, en):
        return '  "' + cheie + '": {' + chr(10) + '    ro: "' + ro + '",' + chr(10) + '    en: "' + en + '",' + chr(10) + '  },' + chr(10)
    bloc_d = ('export const DOCUMENTE_JURIDICE: readonly IntrareJuridica[] = [' + chr(10)
              + '  { slug: "cookies", scurt: "Cookie-uri", descriere: "' + formal + '" },' + chr(10) + '];' + chr(10)
              + 'export const DESCRIERE_MD: Readonly<Record<CheieMd, Record<LimbaJuridica, string>>> = {' + chr(10)
              + intrare_d('informatii-legale', cu_tu, formal)
              + intrare_d('cookie-uri', formal, 'How to contact us.')
              + intrare_d('dpa', formal, 'How to contact us.')
              + '};' + chr(10))
    rezultat = descriere_formal(bloc_d)
    if rezultat is None:
        return 'martorul descrierilor: blocul DESCRIERE_MD fabricat nu a fost gasit'
    gasiri_d, chei_d = rezultat
    if chei_d != ['informatii-legale', 'cookie-uri', 'dpa']:
        return 'martorul descrierilor: intrarile ro citite sunt ' + str(chei_d) + ', asteptat 3'
    if sorted(set(x[0] for x in gasiri_d)) != ['cookie-uri'] or len(gasiri_d) != 5:
        return ('martorul descrierilor: ' + str(len(gasiri_d)) + ' forme prinse pe ' + str(sorted(set(x[0] for x in gasiri_d)))
                + ', asteptat 5, numai pe cookie-uri (nu pe DPA, nu in en, nu in DOCUMENTE_JURIDICE)')
    if descriere_formal(bloc_d.replace('DESCRIERE_MD', 'DESCRIERE_ALTCEVA')) is not None:
        return 'martorul descrierilor negativ: un bloc cu alt nume a fost citit drept DESCRIERE_MD'
    return None


def main():
    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    lista = fisiere()
    if not lista:
        print('poarta-limba: niciun fisier de verificat - masuratoarea e invalida', file=sys.stderr)
        return 3

    total = 0
    for cale in lista:
        continut = open(cale, encoding='utf-8').read()
        vizibil = text_vizibil(cale, continut)
        rel = os.path.relpath(cale, RADACINA)
        for fel, numar, fragment in analizeaza(vizibil, formal_singur=formal_interzis(rel)):
            unde = rel + (':' + str(numar) if numar else '')
            print(unde + '  ' + fel + ('  | ' + fragment if fragment else ''))
            total += 1

    # Punctul 4 pe meta: cu familia `md` in arbore, blocul trebuie gasit si citit, altfel masuratoarea e invalida.
    cale_meta = os.path.join(RADACINA, *FISIER_META_MD.split('/'))
    familie_md = os.path.isfile(os.path.join(RADACINA, *FISIER_REGISTRU_MD.split('/')))
    stare_meta = 'nemasurat (familia md lipseste din arbore)'
    if os.path.isfile(cale_meta) or familie_md:
        rezultat = meta_formal(open(cale_meta, encoding='utf-8').read()) if os.path.isfile(cale_meta) else None
        if rezultat is None or not rezultat[1]:
            print('poarta-limba: META_DOCUMENTE_MD nu a fost gasit sau nu are intrari ro in ' + FISIER_META_MD
                  + ' - masuratoarea e invalida', file=sys.stderr)
            return 3
        for cheie, numar, forma in rezultat[0]:
            print(FISIER_META_MD + ':' + str(numar) + '  adresare formala in meta-descrierea romaneasca a documentului '
                  + cheie + ' (decizia 77): ' + forma)
            total += 1
        stare_meta = str(len(rezultat[1])) + ' intrari ro citite'

    # Punctul 4 pe descrierile din rute: aceeasi regula; cu familia `md` in arbore, blocul trebuie gasit si citit.
    cale_descriere = os.path.join(RADACINA, *FISIER_DESCRIERE_MD.split('/'))
    stare_descriere = 'nemasurat (familia md lipseste din arbore)'
    if familie_md:
        rezultat = descriere_formal(open(cale_descriere, encoding='utf-8').read()) if os.path.isfile(cale_descriere) else None
        if rezultat is None or not rezultat[1]:
            print('poarta-limba: DESCRIERE_MD nu a fost gasit sau nu are intrari ro in ' + FISIER_DESCRIERE_MD
                  + ' - masuratoarea e invalida', file=sys.stderr)
            return 3
        for cheie, numar, forma in rezultat[0]:
            print(FISIER_DESCRIERE_MD + ':' + str(numar) + '  adresare formala in descrierea romaneasca din rute a documentului '
                  + cheie + ' (decizia 77): ' + forma)
            total += 1
        stare_descriere = str(len(rezultat[1])) + ' intrari ro citite'

    print('CONTROALE: martor pozitiv OK, martor negativ OK')
    print('META_DOCUMENTE_MD: ' + stare_meta + '; exceptii numite: '
          + '; '.join(k + ' (' + v + ')' for k, v in sorted(EXCEPTII_META.items())))
    print('DESCRIERE_MD: ' + stare_descriere + '; aceleasi exceptii numite')
    print('ADRESARE FORMALA, EXCEPTII NUMITE: ' + '; '.join(k + ' (' + v + ')' for k, v in sorted(EXCEPTII_FORMAL.items())))
    print('SURSA: ' + str(len(lista)) + ' fisier(e)')
    print('DEFECTE DE LIMBA: ' + str(total))
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())

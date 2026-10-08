#!/usr/bin/env python3
"""Poarta de limba engleza: textul paginilor EN e ASCII, in ortografie americana, fara clisee.

De ce exista: paginile EN ale domeniului international se scriu in engleza americana (decizia de
continut 9), cu un vocabular fix si o lista de expresii de evitat (arhitectura continutului EN,
sectiunea "Cum se scrie in engleza", si "Dovada de gata" pct. 3). Poarta de limba romana nu le
vede: ea cauta cuvinte romanesti fara diacritice, deci pe engleza iese mereu verde. O scapare
britanica sau un "seamless" ajunge pe pagina si il vede abia vorbitorul nativ de la revizie.

Unde se uita: `src/content/en/**` (modulele paginilor) si `src/app/(en)/**` (paginile si
layout-ul editiei EN). Nimic altceva: textul romanesc ramane pe poarta de limba romana.

Ce verifica, pe fiecare fisier:
  1. ASCII: zero caractere non-ASCII in TOT fisierul (inclusiv liniuta lunga sau medie,
     ghilimelele tipografice, spatiul neseparabil, emoji). Comentariile se scriu oricum fara
     diacritice in depozitul asta, deci regula pe tot fisierul nu costa nimic si nu lasa gauri.
     Si in TEXT: un caracter non-ASCII scris ca secventa de evadare (bara inversa urmata de
     `u2014`, `u{...}` sau `xE9`) ori ca entitate HTML (`&mdash;`, `&#8212;`) ajunge pe pagina la
     fel, desi fisierul e ASCII (prins de proba la prima rulare: o fixtura scrisa cu `json.dumps`
     trecea verde).
     EXCEPTIA NUMITA (`EVADARI_ADMISE`): exact doua caractere, numai ca secventa de evadare de
     forma bara inversa + `u` + patru cifre hexa, in TEXT: U+00A0 (spatiul nedespartitor) si
     U+2060 (unirea de cuvant). Tin legate pe ecran o suma de moneda ("EUR 90"), un numar de
     telefon sau un nume ca "RO e-Factura", ceea ce un text ASCII nu poate cere. Caracterul scris
     direct ramane prins (invizibil in sursa), la fel celelalte forme (`u{...}`, `x..`, entitatea
     HTML) si orice alt cod, inclusiv cratima nedespartitoare U+2011 (tinta portii de liniute).
  2. ortografie americana: perechi britanic -> american, pe TEXT (sirurile si textul JSX; la
     fisierele de marcare, tot continutul), fara adresele web.
  3. expresiile de evitat din lista de continut, pe acelasi text.
  4. semnul exclamarii in text, si ` -- ` folosit ca liniuta (numai cratima simpla).

EXCEPTIA DE ORTOGRAFIE: titlurile oficiale citate si numele proprii raman ca la sursa (aceeasi
sectiune a arhitecturii). Un rand se scuteste DOAR de regula 2, cu un comentariu pe randul lui sau
pe randul de deasupra, de forma `// ortografie-sursa: <motivul>` (motivul are cel putin trei
caractere). ASCII, expresiile si exclamarea nu au exceptie.

CONTROALE la fiecare rulare, fabricate aici (fixturile se asambleaza din bucati, ca fisierul sa nu
fie o instanta a ce cauta):
  - martor pozitiv pe fiecare regula: daca una nu prinde, verdictul e NEMASURAT (iesire 3);
  - martor negativ: engleza americana corecta, cu cuvintele-capcana (analysis, enterprise, advise,
    license, cancellation, `!==` in cod, o adresa web britanica); daca e acuzata, iesire 3;
  - martorul extragerii: un modul TypeScript fabricat, cu un cuvant britanic intr-un comentariu
    (nu e text) si intr-un sir (e text);
  - martorii extragerii JSX: text JSX cu paranteze, `;`, `{expresie}`, adresa web si apostrof, cu
    un defect fiecare (trebuie prinse); plus un martor negativ cu `a < b && b > 0`, `useState<T>`,
    `!==`, un comentariu `{/* */}` si o adresa web britanica (nu trebuie acuzat nimic);
  - martorul exceptiei: cu motiv scuteste, fara motiv nu;
  - martorul descoperirii: un arbore temporar cu doua fisiere EN si doua momeli (romana, editia
    ro-MD); trebuie gasite exact cele doua EN.

CE NU VERIFICA (reziduuri)
  - Ortografia e o lista de perechi, nu un dictionar: un cuvant britanic din afara listei trece.
  - Expresiile sunt cautate pe cuvinte; o parafraza trece. Tricolonul mecanic si antiteza in serie
    nu se masoara deloc.
  - Textul JSX se ia cu un scaner pe stari (ScanerJsx), nu cu tipar. Ce nu vede: un text compus la
    randare din bucati (o expresie de evitat rupta de `{x}` in doua bucati nu se potriveste); o
    expresie regulata literala care contine o ghilimea (`/'/`) poate deregla scanerul pana la
    capatul randului; o functie generica scrisa `<T,>(x: T) => x` e luata drept element JSX.
    Daca o pagina EN are nevoie de una, o muta intr-un modul `.ts` (citit cu scanerul de siruri).
  - Fisierele EN din afara celor doua cai (de exemplu un `*.en.tsx` direct in `src/app`, sau
    `src/content/navigatie-en.ts`) nu sunt citite.
  - Zero fisiere EN pe un arbore cu `src` inseamna iesire 0: azi paginile EN nu exista inca. Lista
    `VAZUT:` din iesire spune ce s-a citit; o proba care asteapta N pagini o numara de acolo.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  textul acuzat; o pereche noua in BRITANIC sau o expresie noua in EVITATE.
      O pereche se scoate DOAR cand acuza o forma americana corecta, cu motivul scris aici.
  NU  extragerea, CAI, EXTENSII, controale(), regula exceptiei.

IESIRE: 0 curat - 1 defecte gasite - 2 folosire gresita - 3 control picat sau arbore fara `src`
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

RADACINA_IMPLICITA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CAI = (os.path.join('src', 'content', 'en'), os.path.join('src', 'app', '(en)'))
EXTENSII_COD = ('.ts', '.tsx', '.js', '.jsx', '.mjs')
EXTENSII_TEXT = ('.md', '.mdx', '.json', '.txt')
EXTENSII_DOAR_ASCII = ('.css',)
EXTENSII = EXTENSII_COD + EXTENSII_TEXT + EXTENSII_DOAR_ASCII
SARITE = {'node_modules', '.next', '.git', '__pycache__'}
BSLASH = chr(92)
MARCAJ_EXCEPTIE = re.compile(r'//\s*ortografie-sursa:\s*(\S.{2,})')

# Numele caracterelor non-ASCII frecvente, ca mesajul sa spuna ce s-a gasit.
NUME_CARACTERE = {
    0x2012: 'liniuta (numai cratima simpla)',
    0x2013: 'liniuta medie (numai cratima simpla)',
    0x2014: 'liniuta lunga (numai cratima simpla)',
    0x2015: 'bara orizontala (numai cratima simpla)',
    0x2212: 'semnul minus (numai cratima simpla)',
    0x2018: 'ghilimea tipografica (numai ghilimele drepte)',
    0x2019: 'apostrof tipografic (numai apostroful drept)',
    0x201C: 'ghilimea tipografica (numai ghilimele drepte)',
    0x201D: 'ghilimea tipografica (numai ghilimele drepte)',
    0x2026: 'puncte de suspensie intr-un caracter (se scriu trei puncte)',
    0x00A0: 'spatiu neseparabil',
}

# Perechile britanic -> american. Grupate pe tipar, ca lista sa se poata citi; fiecare intrare
# numeste forma americana in mesaj.
BRITANIC = [
    ('-our in loc de -or',
     re.compile(r'\b(colo|favo|hono|labo|behavio|neighbo|flavo|humo|rumo|harbo|vigo|endeavo|savo|armo|odo|rigo'
                r'|cando|vapo|parlo)ur(s|ed|ing|ite|ites|able|ably|ful|fully|less|hood|hoods|al|ally|y)?\b', re.I)),
    ('-ise in loc de -ize',
     re.compile(r'\b(organ|recogn|real|digit|author|optim|priorit|custom|standard|summar|final|minim|maxim'
                r'|central|apolog|categor|emphas|util|special|visual|synchron|normal|local|personal|capital'
                r'|monet|item|memor|critic|harmon|modern|stabil|legal|penal|sanit|anonym|subsid|character)'
                r'is(e|es|ed|ing|ation|ations|er|ers)\b', re.I)),
    ('-yse in loc de -yze',
     re.compile(r'\b(analy|paraly|cataly)s(e|ed|ing)\b', re.I)),
    ('-re in loc de -er',
     re.compile(r'\b(centre|centres|centred|metre|metres|litre|litres|theatre|theatres|fibre|fibres|calibre'
                r'|sombre|spectre|lustre|manoeuvre|manoeuvres)\b', re.I)),
    ('-ce in loc de -se',
     re.compile(r'\b(licence|licences|licenced|defence|defences|offence|offences|pretence)\b', re.I)),
    ('consoana dubla britanica',
     re.compile(r'\b(label|travel|cancel|model|signal|fuel|total|level|counsel|channel|tunnel|marshal|dial'
                r'|equal|rival|initial)l(ed|ing|er|ers)\b', re.I)),
    ('forma britanica',
     re.compile(r'\b(catalogue|catalogues|catalogued|programme|programmes|cheque|cheques|enrol|enrols'
                r'|enrolment|enrolments|fulfil|fulfils|fulfilment|instalment|instalments|skilful|skilfully'
                r'|wilful|wilfully|grey|ageing|whilst|amongst|learnt|spelt|practise|practised|practises'
                r'|practising|tyre|tyres|aluminium|sceptic|sceptical|scepticism|mould|moulds|mouldy'
                r'|jewellery|plough|storey|storeys|kerb|paediatric|encyclopaedia|artefact|artefacts'
                r'|aeroplane|aeroplanes)\b', re.I)),
]

# Expresiile de evitat (arhitectura continutului EN, "Cum se scrie in engleza", Evitat).
EVITATE = [
    ('AI-powered', re.compile(r'\bAI[- ]powered\b', re.I)),
    ('seamless', re.compile(r'\bseamless(?:ly)?\b', re.I)),
    ('unlock', re.compile(r'\bunlock(?:s|ed|ing)?\b', re.I)),
    ('leverage', re.compile(r'\bleverag(?:e|es|ed|ing)\b', re.I)),
    ('empower', re.compile(r'\bempower(?:s|ed|ing|ment)?\b', re.I)),
    ('robust', re.compile(r'\brobust(?:ly|ness)?\b', re.I)),
    ('cutting-edge', re.compile(r'\bcutting[- ]edge\b', re.I)),
    ('game-changer', re.compile(r'\bgame[- ]chang(?:er|ers|ing)\b', re.I)),
    ("in today's fast-paced world", re.compile(r"\bin today'?s fast[- ]paced world\b", re.I)),
    ('instantly', re.compile(r'\binstantly\b', re.I)),
    ('in seconds', re.compile(r'\bin seconds\b', re.I)),
    ('24/7', re.compile(r'(?<![\d/])24/7(?![\d/])')),
    ('guaranteed', re.compile(r'\bguaranteed\b', re.I)),
    ('trusted by', re.compile(r'\btrusted by\b', re.I)),
    ('GDPR compliant', re.compile(r'\bGDPR[- ]compliant\b', re.I)),
    ('enterprise-grade', re.compile(r'\benterprise[- ]grade\b', re.I)),
]

TIPAR_EXCLAMARE = re.compile(r'!(?![=\[])')
# Exceptia numita a regulii 1 (vezi antetul): codul -> numele. Nimic altceva nu intra aici.
EVADARI_ADMISE = {0x00A0: 'spatiul nedespartitor', 0x2060: 'unirea de cuvant'}
TIPAR_EVADARE = re.compile(r'\\u([0-9a-fA-F]{4})|\\u\{([0-9a-fA-F]+)\}|\\x([0-9a-fA-F]{2})')
TIPAR_ENTITATE = re.compile(r'&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));')
ENTITATI_ASCII = {'amp', 'lt', 'gt', 'quot', 'apos'}
TIPAR_LINIUTA_DUBLA =re.compile(r'(?<=\s)--(?=\s)')
TIPAR_ADRESA = re.compile(r'(?:https?://|mailto:|tel:)\S+')


# ------------------------------------------------------------------ extragerea textului

def siruri_din_cod(continut):
    """(pozitie, continut) pentru fiecare sir dintr-un fisier de cod, fara ce e in comentarii.

    Un scaner cu trei stari (cod, sir, comentariu), nu tipare: `//` dintr-o adresa web nu incepe
    o nota, iar un cuvant citat intr-o nota nu e text de pagina.
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
                if continut[i] == '\n' and c != '`':
                    break
                i += 1
            if i < n and continut[i] == c:
                siruri.append((inceput, continut[inceput:i]))
                i += 1
            else:
                i = inceput
            continue
        i += 1
    return siruri


class ScanerJsx:
    """Sirurile si textul JSX dintr-un fisier `.tsx`/`.jsx`, cu un scaner pe stari, nu cu tipare.

    Doua moduri. In COD: comentariile se sar, sirurile (si bucatile literale ale sabloanelor) se
    culeg, iar un `<` deschide un element JSX numai unde gramatica asteapta o expresie (inceput de
    fisier, dupa `( , = ? : { [ & | ;`, dupa `=>`, `return`, `yield`). Un `<` dupa un identificator
    sau dupa `)` e comparatie sau tip generic (`a < b`, `useState<string>`), nu JSX. In ELEMENT:
    atributele `{...}` se scaneaza ca cod, sirurile atributelor se culeg, iar intre `>` si `<` tot ce
    nu e `{...}` e text - cu paranteze, `;`, `!`, apostrofuri sau adrese web; `//` din text nu e
    comentariu. Un `{expresie}` imparte textul in doua bucati, citite amandoua.
    """

    def __init__(self, continut):
        self.s = continut
        self.n = len(continut)
        self.iesire = []

    def culege(self, inceput, sfarsit):
        bucata = self.s[inceput:sfarsit]
        if bucata.strip():
            self.iesire.append((inceput, bucata))

    def sir(self, i):
        """`i` pe ghilimea de deschidere; intoarce indexul de dupa sir."""
        s, n, q = self.s, self.n, self.s[i]
        j = inceput = i + 1
        bucati = []
        while j < n:
            c = s[j]
            if c == BSLASH:
                j += 2
                continue
            if q == '`' and c == '$' and j + 1 < n and s[j + 1] == '{':
                bucati.append((inceput, j))
                j = self.cod(j + 2, pana_la_acolada=True)
                inceput = j
                continue
            if c == q:
                bucati.append((inceput, j))
                for a, b in bucati:
                    self.culege(a, b)
                return j + 1
            if c == '\n' and q != '`':
                break
            j += 1
        return i + 1  # sir neinchis: ghilimea nu deschidea un sir (de exemplu un apostrof)

    def incepe_jsx(self, i):
        s = self.s
        if i + 1 >= self.n or not (s[i + 1].isalpha() or s[i + 1] in '>_$'):
            return False
        k = i - 1
        while k >= 0 and s[k] in ' \t\r\n':
            k -= 1
        if k < 0:
            return True
        c = s[k]
        if c == '>':
            return k > 0 and s[k - 1] == '='
        if c.isalnum() or c in '_$':
            inceput = k
            while inceput > 0 and (s[inceput - 1].isalnum() or s[inceput - 1] in '_$'):
                inceput -= 1
            return s[inceput:k + 1] in ('return', 'yield')
        return c in '(,=?:{[&|;'

    def cod(self, i, pana_la_acolada=False):
        """Cod de la `i`; cu `pana_la_acolada`, se opreste dupa acolada care inchide nivelul."""
        s, n = self.s, self.n
        adancime = 0
        while i < n:
            c = s[i]
            if c == '/' and i + 1 < n and s[i + 1] == '/':
                j = s.find('\n', i)
                i = n if j < 0 else j + 1
            elif c == '/' and i + 1 < n and s[i + 1] == '*':
                j = s.find('*/', i + 2)
                i = n if j < 0 else j + 2
            elif c in ('"', "'", '`'):
                i = self.sir(i)
            elif c == '<' and self.incepe_jsx(i):
                i = self.element(i)
            elif c == '{':
                adancime += 1
                i += 1
            elif c == '}':
                if pana_la_acolada and adancime == 0:
                    return i + 1
                adancime = max(0, adancime - 1)
                i += 1
            else:
                i += 1
        return n

    def element(self, i):
        """`i` pe `<`-ul care deschide; intoarce indexul de dupa eticheta care inchide."""
        s, n = self.s, self.n
        i += 1
        if i < n and s[i] == '>':
            i += 1  # fragment
        else:
            while True:
                if i >= n:
                    return n
                c = s[i]
                if c == '/' and i + 1 < n and s[i + 1] == '>':
                    return i + 2  # element fara copii
                if c == '>':
                    i += 1
                    break
                if c == '{':
                    i = self.cod(i + 1, pana_la_acolada=True)
                elif c in ('"', "'"):
                    i = self.sir(i)
                else:
                    i += 1
        inceput = i
        while i < n:
            c = s[i]
            if c == '{':
                self.culege(inceput, i)
                i = self.cod(i + 1, pana_la_acolada=True)
                inceput = i
            elif c == '<':
                self.culege(inceput, i)
                if i + 1 < n and s[i + 1] == '/':
                    j = s.find('>', i)
                    return n if j < 0 else j + 1
                i = self.element(i)
                inceput = i
            else:
                i += 1
        self.culege(inceput, n)
        return n


def texte(cale, continut):
    """(pozitie, text) din fisier: ce poate ajunge la cititor."""
    if cale.endswith(EXTENSII_DOAR_ASCII):
        return []
    if cale.endswith(EXTENSII_TEXT):
        return [(0, continut)]
    if cale.endswith(('.tsx', '.jsx')):
        scaner = ScanerJsx(continut)
        scaner.cod(0)
        return scaner.iesire
    return list(siruri_din_cod(continut))


# ------------------------------------------------------------------ analiza

def rand_la(continut, pozitie):
    return continut.count('\n', 0, pozitie) + 1


def scutit(randuri, numar):
    """Randul `numar` (de la 1) e scutit de ortografie: marcajul cu motiv pe el sau deasupra."""
    for k in (numar, numar - 1):
        if 1 <= k <= len(randuri) and MARCAJ_EXCEPTIE.search(randuri[k - 1]):
            return True
    return False


def analizeaza(cale, continut):
    """Lista de (rand, fel, fragment)."""
    gasiri = []
    for numar, rand in enumerate(continut.split('\n'), start=1):
        for coloana, ch in enumerate(rand, start=1):
            cod = ord(ch)
            if cod > 126 or (cod < 32 and ch not in '\t\r'):
                nume = NUME_CARACTERE.get(cod, 'caracter non-ASCII')
                gasiri.append((numar, 'non-ASCII U+%04X %s, coloana %d' % (cod, nume, coloana), rand.strip()[:100]))
    randuri = continut.split('\n')
    for pozitie, text in texte(cale, continut):
        curat = TIPAR_ADRESA.sub(lambda m: ' ' * len(m.group(0)), text)
        for m in TIPAR_EVADARE.finditer(curat):
            cod = int(m.group(1) or m.group(2) or m.group(3), 16)
            if m.group(1) is not None and cod in EVADARI_ADMISE:
                continue
            if cod > 126:
                nume = NUME_CARACTERE.get(cod, 'caracter non-ASCII')
                gasiri.append((rand_la(continut, pozitie + m.start()),
                               'non-ASCII U+%04X %s, scris ca secventa de evadare' % (cod, nume), text.strip()[:100]))
        for m in TIPAR_ENTITATE.finditer(curat):
            if m.group(3) is not None and m.group(3).lower() in ENTITATI_ASCII:
                continue
            cod = int(m.group(1)) if m.group(1) else (int(m.group(2), 16) if m.group(2) else None)
            if cod is not None and cod <= 126:
                continue
            gasiri.append((rand_la(continut, pozitie + m.start()),
                           'non-ASCII scris ca entitate HTML ' + m.group(0), text.strip()[:100]))
        for fel, tipar in BRITANIC:
            for m in tipar.finditer(curat):
                numar = rand_la(continut, pozitie + m.start())
                if not scutit(randuri, numar):
                    gasiri.append((numar, 'ortografie britanica (' + fel + '): ' + m.group(0), text.strip()[:100]))
        for nume, tipar in EVITATE:
            for m in tipar.finditer(curat):
                gasiri.append((rand_la(continut, pozitie + m.start()), 'expresie de evitat: ' + nume,
                               text.strip()[:100]))
        for m in TIPAR_EXCLAMARE.finditer(curat):
            gasiri.append((rand_la(continut, pozitie + m.start()), 'semnul exclamarii in text', text.strip()[:100]))
        for m in TIPAR_LINIUTA_DUBLA.finditer(curat):
            gasiri.append((rand_la(continut, pozitie + m.start()), 'liniuta din doua cratime (numai cratima simpla)',
                           text.strip()[:100]))
    return sorted(set(gasiri))


def fisiere(radacina):
    gasite = []
    for rel in CAI:
        absolut = os.path.join(radacina, rel)
        if not os.path.isdir(absolut):
            continue
        for baza, directoare, nume in os.walk(absolut):
            directoare[:] = [d for d in directoare if d not in SARITE]
            for n in nume:
                if n.endswith(EXTENSII):
                    gasite.append(os.path.join(baza, n))
    return sorted(gasite)


# ------------------------------------------------------------------ controalele

def are(gasiri, fel):
    return any(fel in g[1] for g in gasiri)


def controale():
    """None daca toate controalele trec, altfel motivul."""
    pozitive = [
        ('non-ASCII', 'export const a = "Archive ' + chr(0x2014) + ' search";\n'),
        ('non-ASCII', 'export const a = "Caf' + chr(0xE9) + ' receipts";\n'),
        ('secventa de evadare', 'export const a = "Archive ' + BSLASH + 'u2014 search";\n'),
        ('secventa de evadare', 'export const a = "Caf' + BSLASH + 'xE9 receipts";\n'),
        # Exceptia numita nu se intinde: cratima nedespartitoare, alte forme ale lui U+00A0, caracterul scris direct.
        ('secventa de evadare', 'export const a = "RO e-' + BSLASH + 'u2011Factura";\n'),
        ('secventa de evadare', 'export const a = "EUR' + BSLASH + 'xA090";\n'),
        ('secventa de evadare', 'export const a = "EUR' + BSLASH + 'u{a0}90";\n'),
        ('non-ASCII', 'export const a = "EUR' + chr(0xA0) + '90";\n'),
        ('entitate HTML', 'export const a = "EUR&' + 'nbsp;90";\n'),
        ('entitate HTML', 'export const a = "Archive &' + 'mdash; search";\n'),
        ('entitate HTML', 'export const a = "Archive &#' + '8212; search";\n'),
        ('ortografie britanica', 'export const a = "Your ' + 'organis' + 'ation keeps every invoice.";\n'),
        ('ortografie britanica', 'export const a = "Pick a ' + 'colo' + 'ur for the label.";\n'),
        ('ortografie britanica', 'export const a = "The ' + 'cent' + 're of the archive.";\n'),
        ('expresie de evitat', 'export const a = "A ' + 'seam' + 'less archive for your team.";\n'),
        ('expresie de evitat', 'export const a = "Answers ' + 'in sec' + 'onds from your documents.";\n'),
        ('semnul exclamarii', 'export const a = "Ask your archive' + chr(33) + '";\n'),
        ('liniuta din doua cratime', 'export const a = "Invoices ' + '-' * 2 + ' every year.";\n'),
    ]
    for fel, sursa in pozitive:
        if not are(analizeaza('martor.ts', sursa), fel):
            return 'martorul pozitiv pentru "' + fel + '" nu a fost prins: ' + sursa.strip()

    negativ = '\n'.join([
        'export const a = "The analysis of your enterprise archive is ready; we advise a license per company.";',
        'export const b = "Cancellation is free. A specialist reads the emphasis on page 2.";',
        'export const c = "https://example.org/organisation-centre-colour";',
        'export const d = x !== y ? "Labeled, traveled and canceled rows stay in the catalog." : "";',
        'export const e = "Line one' + BSLASH + 'nLine two, Q&amp;A, ' + BSLASH + 'u0041 and &#65;.";',
        # Exceptia numita: U+00A0 si U+2060 ca secventa de evadare, cu cifre mici sau mari.
        'export const f = "EUR' + BSLASH + 'u00a090, EUR' + BSLASH + 'u00A0150 and RO' + BSLASH + 'u00a0e-'
        + BSLASH + 'u2060Factura.";',
        '// a note may say organis' + 'ation in a comment; it is not page text',
    ]) + '\n'
    g = analizeaza('martor.ts', negativ)
    if g:
        return 'martorul negativ a fost acuzat (tiparele sunt prea late): ' + g[0][1]

    jsx = ('export default function P() {\n'
           '  return <p>Every invoice has a ' + 'favo' + 'urite folder.</p>;\n'
           '}\n')
    if not are(analizeaza('martor.tsx', jsx), 'ortografie britanica'):
        return 'martorul de extragere JSX: textul dintre etichete nu a fost citit'

    # Textul JSX obisnuit are paranteze, `;`, `{expresie}`, adrese web si apostrofuri: toate se citesc.
    culoare = 'colo' + 'ur'
    pozitive_jsx = [
        ('ortografie britanica', '<p>Pick a ' + culoare + ' (any) for the label.</p>'),
        ('ortografie britanica', '<p>Pick a ' + culoare + '; then label it.</p>'),
        ('ortografie britanica', '<p>See https://3s.md for a ' + culoare + ' guide.</p>'),
        ('ortografie britanica', '<p>Pick a ' + culoare + ' for {name}.</p>'),
        ('ortografie britanica', "<p>We don't pick a " + culoare + ' for you.</p>'),
        ('expresie de evitat', '<p>A ' + 'seam' + 'less archive (for teams).</p>'),
        ('semnul exclamarii', '<p>Ask your archive (today)' + chr(33) + '</p>'),
    ]
    for fel, element in pozitive_jsx:
        sursa = 'export default function P({ name }) {\n  return (\n    ' + element + '\n  );\n}\n'
        if not are(analizeaza('martor.tsx', sursa), fel):
            return 'martorul de extragere JSX pentru "' + fel + '" nu a fost prins: ' + element

    negativ_jsx = '\n'.join([
        'export default function P({ a, b, rows }) {',
        # Negatiile `!x` din cod: citite gresit ca text, ar fi acuzate ca exclamare.
        '  const [v] = useState<string>(!a ? "labeled" : "");',
        '  const ok = a < b && b > 0 && !rows.length && a !== b;',
        '  return ok ? (',
        '    <ul className="list">',
        "      {/* a note may say organis" + "ation; it is not page text */}",
        '      {rows.map((r) => <li key={r.id}>Labeled rows (2 per page); see https://example.org/'
        + culoare + '.</li>)}',
        "      <li>We don't sort it for you, it's {v}.</li>",
        '    </ul>',
        '  ) : null;',
        '}',
    ]) + '\n'
    g = analizeaza('martor.tsx', negativ_jsx)
    if g:
        return 'martorul negativ JSX a fost acuzat (scanerul citeste cod ca text): ' + g[0][1]

    scutire = ('// ortografie-sursa: titlul oficial al actului, citat\n'
               'export const a = "Directive on the ' + 'harmon' + 'isation of invoicing";\n')
    if analizeaza('martor.ts', scutire):
        return 'martorul exceptiei: marcajul cu motiv nu a scutit randul de sub el'
    fara_motiv = scutire.replace('titlul oficial al actului, citat', '')
    if not are(analizeaza('martor.ts', fara_motiv), 'ortografie britanica'):
        return 'martorul exceptiei: marcajul FARA motiv a scutit randul'
    scutire_evitat = '// ortografie-sursa: citat\nexport const a = "A ' + 'robu' + 'st archive";\n'
    if not are(analizeaza('martor.ts', scutire_evitat), 'expresie de evitat'):
        return 'martorul exceptiei: marcajul a scutit si o expresie de evitat, nu numai ortografia'

    d = tempfile.mkdtemp(prefix='limba-en-descoperire-')
    try:
        fabricate = {
            os.path.join('src', 'content', 'en', 'pricing.ts'): True,
            os.path.join('src', 'app', '(en)', 'pricing', 'page.en.tsx'): True,
            os.path.join('src', 'content', 'preturi.ts'): False,
            os.path.join('src', 'app', '(romd)', 'ro', 'page.romd.tsx'): False,
        }
        for rel in fabricate:
            cale = os.path.join(d, rel)
            os.makedirs(os.path.dirname(cale), exist_ok=True)
            with open(cale, 'w', encoding='utf-8', newline='\n') as f:
                f.write('export {};\n')
        vazute = sorted(os.path.relpath(c, d) for c in fisiere(d))
        asteptate = sorted(rel for rel, en in fabricate.items() if en)
        if vazute != asteptate:
            return ('martorul descoperirii: asteptam ' + ', '.join(asteptate) + '; am gasit '
                    + (', '.join(vazute) or 'nimic'))
    finally:
        shutil.rmtree(d, ignore_errors=True)
    return None


def main():
    p = argparse.ArgumentParser(description='Poarta de limba engleza (paginile EN).')
    p.add_argument('--radacina', default=RADACINA_IMPLICITA,
                   help='arborele pe care lucreaza poarta (implicit: depozitul din care e rulata)')
    a = p.parse_args()

    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        print('Verdictul e NEMASURAT, nu "curat".', file=sys.stderr)
        return 3

    radacina = os.path.abspath(a.radacina)
    if not os.path.isdir(os.path.join(radacina, 'src')):
        print('poarta-limba-en: arborele nu are `src` - masuratoarea e invalida (NEMASURAT)', file=sys.stderr)
        return 3

    lista = fisiere(radacina)
    total = 0
    for cale in lista:
        rel = os.path.relpath(cale, radacina).replace(os.sep, '/')
        print('VAZUT: ' + rel)
        try:
            with open(cale, encoding='utf-8') as f:
                continut = f.read()
        except UnicodeDecodeError as e:
            print(rel + '  nu e UTF-8: ' + str(e))
            total += 1
            continue
        for numar, fel, fragment in analizeaza(cale, continut):
            print(rel + ':' + str(numar) + '  ' + fel + '  | ' + fragment)
            total += 1

    print('CONTROALE: martori pozitivi, negativ, extragere, exceptie si descoperire OK')
    print('CAI: ' + ', '.join(c.replace(os.sep, '/') for c in CAI))
    print('SURSA: ' + str(len(lista)) + ' fisier(e) EN')
    print('DEFECTE DE LIMBA EN: ' + str(total))
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())

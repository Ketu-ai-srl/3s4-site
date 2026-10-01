#!/usr/bin/env python3
"""Poarta juridica: cerintele legale din PORTI-FABRICA.md sectiunea 2 care se pot
verifica in cod, fara browser si fara serviciu extern.

FIECARE MESAJ DE EROARE CITEAZA ACTUL. Un om care vede poarta rosie trebuie sa
stie de ce e obligat, nu doar ca "asa zice scriptul". Un temei nescris se
negociaza; unul scris se respecta.

CE VERIFICA, cu codurile stabile din documentul de porti:
  L-01  NUMAI cand operatorul REZOLVAT (`OPERATOR_JSON` nevida, altfel `config/operator.json`, ca
        src/lib/operator.ts) numeste o firma: datele ei de identificare sunt complete si apar in
        HTML-ul livrat. Familia SEE: pe FIECARE pagina publica. Familia `md` (tara Republica
        Moldova, lista TARI_MD): pe pagina de informatii legale din fiecare limba publicata, iar pe
        fiecare pagina o legatura spre informatiile legale in romana (Legea 284/2004 art. 12).
        Modelul D2 (`"model": "D2"` la radacina configurarii): campurile din config/model-d2.json
        care poarta EXACT marcajul decis ies AVERT pe orice mediu. Cu `"operator": null` regula nu
        cere nimic (vezi mai jos)
  J-01  marcajele `[...]` vizibile pe paginile juridice construite, in afara legaturilor si a
        registrului MARCAJE_ADMISE (AVERT pe staging, OPRESTE la productie); acoladele duble in
        orice HTML construit OPRESC oricand
  L-05  temeiul formularului de contact nu e consimtamantul
  L-09  zero trimiteri catre platforma SOL / ODR (abrogata, deci link mort)
  L-10  site-ul NU afiseaza numar de inregistrare ca operator de date
  L-15  textele juridice exista in romana - NUMAI cand `config/operator.json` numeste un
        operator (decizia owner-ului din 24.09.2026, plan S4 sectiunile 9-10: paginile
        juridice se construiesc, dar nu se publica pana la operator). Si, oricare ar fi
        operatorul, politica de cookie-uri (`cookies`) din clipa in care HTML-ul construit
        poarta bannerul de consimtamant (`data-consimtamant`): banner inseamna un instrument
        ne-esential, iar informarea despre el se cere inaintea acordului
  C-01  zero scripturi si resurse de la terti in sursa si in HTML-ul construit (un `<link>` cu
        `rel` numai din REL_FARA_INCARCARE, ca canonical si alternate, nu e resursa). O singura
        exceptie, in SURSA si numai pe nume (EXCEPTII_TERTI): incarcatorul GA4, pregatit din
        decizia owner-ului din 24.09.2026 (plan S4 sectiunile 8-10). In HTML-ul construit nu
        exista nicio exceptie, iar ca scriptul pleaca numai dupa accept se masoara in browser
        (tests/browser/comutator.spec.ts)

DOUA SEVERITATI, si de ce difera pe mediu:
  Portile de ABSENTA (L-09, L-10, C-01, si tiparul interzis din L-05) OPRESC
  intotdeauna. Sunt gratuite de satisfacut: nu ceri nimanui sa scrie ceva, ceri
  sa nu adauge. Nu au cum sa blocheze munca legitima.
  Portile de PREZENTA (L-01, L-15, textul cerut de L-05) sunt AVERT pe staging si
  OPRESC la productie. Motivul e faptul, nu comoditatea: firma 3S nu e inregistrata
  inca, deci CUI-ul si numarul ORC nu EXISTA, iar o poarta pe care nimeni din
  fabrica nu o poate satisface nu e poarta (sectiunea 1.5 din document). Ce face
  poarta in schimb e sa BLOCHEZE PUBLICAREA IN PRODUCTIE cat timp raman locuri
  goale - exact cerinta, si singura forma in care e onesta.

  Mediul: --mediu productie, sau variabila SITE_ENV. Implicit e staging.

DE UNDE CITESTE. Sursa (`src/`, `public/`) SI HTML-ul construit din
`.next/server/app`, cand exista. Amandoua, fiindca un link catre ODR poate fi
adaugat si intr-o componenta, si intr-un fisier static din public/, iar datele
firmei se dovedesc numai pe ce se LIVREAZA, nu pe ce se scrie.

DATELE FIRMEI NU SE CODEAZA IN JSX. Poarta le citeste din `config/operator.json`,
comutatorul operatorului de date (planul valului S4, sectiunile 9-10), singura
sursa pentru ele:
  "operator": null     nu exista firma; L-01 nu cere nimic, pe niciun mediu.
                       Decizia owner-ului din 24.09.2026 (plan S4, sectiunea 7): pe
                       site apare doar brandul, fara date de firma. Riscul ramas e
                       numit acolo si e al owner-ului: Legea 365/2002 art. 5 cere
                       identificarea furnizorului la lansarea publica.
  "operator": { ... }  firma exista; campurile din CAMPURI_IDENTITATE se cer
                       complete (gradarea pe mediu de mai sus) si prezente pe
                       fiecare pagina livrata (opreste pe orice mediu).
  fisier lipsa         nu se stie daca exista firma: tratat ca loc gol (gradat).

CONTROALE, la fiecare rulare:
  martor POZITIV  un arbore de proiect fabricat la rulare, cu cate un defect din
                  fiecare clasa; daca nu e prins integral, verdictul e 3, nu 0
  martor NEGATIV  acelasi arbore, curat; daca e prins, tiparele sunt prea late
  martorii L-01   operator numit cu un camp gol: AVERT pe staging, OPRESTE la
                  productie; operator null si nicio data de firma in pagina:
                  zero constatari L-01 pe ambele medii
  martorii L-15   dupa operator, dupa banner, si pe calea intreaga a paginii: un
                  articol cu "cookies" sau "termeni" in adresa NU tine loc de politica
                  (OPRESTE la productie), iar paginile construite la locul lor, fara
                  fisier in sursa, sunt recunoscute
  martorii noi    (felia 72) L-10 pe un identificator de cod (negativ); C-01 dupa `rel`
                  (canonical si alternate negativ, `alternate stylesheet` si `preconnect`
                  pozitiv); mediul: operatorul numai in dictionarul primit e vazut, `{"operator":
                  null}` din mediu bate fisierul, o variabila goala nu schimba nimic; J-01 pozitiv,
                  negativ si acoladele duble. Toti ceilalti martori primesc un mediu GOL
DE UNDE VINE MEDIUL. `OPERATOR_JSON` se citeste O SINGURA DATA, in main(), si se transmite ca
parametru (`mediu_proces`). Daca analizeaza() ar citi `os.environ`, pe o rulare cu profilul 3s.md
martorul "fara operator" ar vedea operatorul din mediu si poarta ar iesi 3 pe orice arbore.
Tiparele interzise se asambleaza din bucati la RULARE: un link ODR scris intreg
in corpul acestui fisier ar fi chiar defectul pe care poarta il vaneaza.

CE NU VERIFICA (reziduuri)
Intrebarea pe care o pune de fapt, pe cod:
  L-01  "apare valoarea LITERALA a fiecarui camp undeva in pagina livrata?" Un cod fiscal
        dintr-un comentariu sau dintr-un bloc ascuns satisface verificarea. Nu se masoara ca
        datele sunt PREZENTATE ca identificare a comerciantului, si nici ca sunt corecte.
        "Loc gol" inseamna camp lipsa sau null, fara nicio litera si nicio cifra, ori cu un
        substituent EXPLICIT pe cuvant intreg (TIPAR_SUBSTITUENT). O valoare falsa care nu arata a
        substituent trece; la fel un cuvant de substituire sau o serie de X lipite de o litera
        ("TODOsediu", "de completate", "J40/AXXX/2026") ori declinate ("Exemplului"), si "exemplu"
        pus imediat dupa @ (scutire provizorie, cu motivul langa tipar). "NA" fara bara si
        "necunoscut" trec deliberat, cu motivul scris langa tipar.
        Cat timp operatorul e null, L-01 nu verifica NIMIC: verde nu inseamna ca site-ul
        identifica furnizorul, ci ca owner-ul a decis sa nu numeasca inca unul.
  L-05  "apare undeva sintagma care numeste temeiul, si lipseste tiparul de consimtamant?"
        Ce face formularul in realitate nu se citeste.
  L-01 md  "pagina de informatii legale e in build la adresa din config/juridic-rute.json si are
        valorile?" si "fiecare pagina are un <a href> spre adresa romaneasca?". Engleza se cere numai
        cand o pagina construita are `<html lang="en">`; vizibilitatea legaturii (ascunsa, in subsol)
        nu se masoara. Familia se deduce din tara cu lista TARI_MD; orice alta tara pastreaza regulile
        SEE (o tara fara texte opreste construirea site-ului, nu poarta).
  J-01  "apare in textul vizibil al paginii juridice un [...] cu litere, in afara unui <a> si a formei
        [text](adresa)?" Paginile juridice sunt cele din config/juridic-rute.json si cele de sub
        /juridic. Un marcaj scris altfel (intre acolade, intre paranteze rotunde) trece.
  L-09, L-10  cautare de tipare in text. O trimitere construita din bucati la randare trece. L-10
        nu prinde un "numar" lipit de `_`, de cifra sau precedat de `.` (identificator de cod).
  L-15  "exista rutele juridice?" Nimic despre continutul lor: o pagina goala trece. Cu
        operatorul null nu cere nimic: verde nu inseamna ca site-ul are politici publicate.
        Pagina se recunoaste numai la locurile numite (TIPARE_PAGINA_JURIDICA in sursa,
        TIPARE_HTML_JURIDIC in build), pe calea intreaga: una pusa altundeva nu e vazuta, iar
        poarta ramane rosie pe un site corect (fals pozitiv, nu fals negativ).
        Politica de cookie-uri se cere dupa MARCAJUL bannerului in HTML-ul construit, nu dupa
        cookie-urile reale: un instrument ne-esential pus in pagina fara banner nu o cere de aici
        (acela e C-01, pe nume si pe resurse)
  C-01  resurse SUB-INCARCATE din HTML-ul static, plus o lista de nume de furnizori in sursa.
        Un tert incarcat la RULARE de un script al paginii e invizibil, fiindca nimeni nu
        executa pagina aici. Lista de nume e scrisa de mana; un furnizor nelistat trece.
        Exceptia din EXCEPTII_TERTI e legata de o CALE si de NUME, nu de un comportament: poarta
        nu stie ca fisierul exceptat incarca scriptul numai dupa accept - asta o dovedeste proba
        de browser, nu poarta. O exceptie al carei fisier exista dar nu mai poarta numele ei e
        raportata ca exceptie fara obiect; una al carei fisier lipseste nu are efect si tace.
Si limita cea mai usor de citit gresit: pe STAGING, portile de PREZENTA (L-01, L-15, textul
cerut de L-05) sunt AVERT, nu OPRESTE. Verde pe staging inseamna "nimic din clasa de absenta
nu a iesit", nu "site-ul e in regula juridic". Fara HTML construit, jumatatea livrata a lui
L-01 si a lui C-01 nu ruleaza deloc si se raporteaza ca avertisment.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  obiectul operatorului din `config/operator.json`, care se COMPLETEAZA dintr-un
      certificat. Trecerea lui inapoi pe null NU e o reparatie: e decizia owner-ului.
      Paginile juridice si textul formularului.
      GAZDE_PROPRII si NUME_TERTI prin ADAUGARE, cu motiv scris pe rand.
      EXCEPTII_TERTI numai cu o decizie a owner-ului citata pe rand si cu proba de browser
      care arata ca fisierul exceptat nu contacteaza tertul inainte de accept.
      MARCAJE_ADMISE prin ADAUGARE, numai cu decizia citata pe rand (marcajul reprezentantului
      in UE: numai cu confirmarea scrisa a juristului).
      `"model"` iese din configurare in ziua extrasului; marcajele din config/model-d2.json nu
      se schimba din configurarea unui domeniu.
  NU  RUTE_JURIDICE, RUTA_COOKIE, MARCAJ_BANNER, CAMPURI_IDENTITATE, TIPAR_SUBSTITUENT, temeiurile
      citate, gradarea pe mediu, stergerea unui nume din NUME_TERTI, REL_FARA_INCARCARE prin
      adaugare, TARI_MD (o urmeaza pe cea din familie.ts), controale().

IESIRE
    0 = curat (avertismentele se tiparesc, dar nu opresc)
    1 = defecte din clasa OPRESTE
    2 = eroare de folosire
    3 = NEMASURAT: control picat sau nicio sursa de citit
"""
import argparse
import glob
import json
import os
import re
import sys
import unicodedata

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA_IMPLICITA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

OPRESTE = 'OPRESTE'
AVERT = 'AVERT'

CAI_SURSA = ('src', 'public')
EXTENSII = ('.tsx', '.ts', '.jsx', '.js', '.mdx', '.md', '.json', '.css', '.html', '.txt', '.xml', '.svg')
SARITE = {'node_modules', '.next', '.git', '__pycache__', '.claude'}

# Rutele juridice cerute la V1. Politica de cookie-uri NU e in lista neconditionat: decizia
# de arhitectura (sectiunea 1.6) e zero cookie-uri neesentiale, iar o pagina de
# politica de cookie-uri pe un site fara cookie-uri e o afirmatie despre ceva ce
# nu exista. Devine ceruta in clipa in care site-ul foloseste un instrument ne-esential.
# Regula veche ("cand C-01 gaseste primul tert") nu se mai putea declansa: GA4 e exceptat de
# C-01 pe sursa si nu e in HTML-ul construit. Semnul care ramane e BANNERUL, care exista numai
# cand exista ceva de consimtit (RUTA_COOKIE si MARCAJ_BANNER, mai jos).
RUTE_JURIDICE = ('confidentialitate', 'termeni')

# Politica de cookie-uri, ceruta dupa banner (felia seo-geo-gdpr; decizia owner-ului din 24.09.2026,
# planul S4 sectiunile 8-10: GA4 pregatit, bannerul apare cu operator si ID). Calea e cea din
# contractul de navigatie (`/juridic/cookies`); se cere oricare ar fi starea operatorului, fiindca
# un banner fara politica e un acord cerut fara informarea completa.
RUTA_COOKIE = 'cookies'
MARCAJ_BANNER = 'data-consimtamant'

# Campurile neconditionate din Legea 365/2002 art. 5 alin. (1) lit. a)-e).
# Lit. f)-i) sunt conditionate (regim de autorizare, profesie reglementata,
# afisare de tarife) si se cer prin steaguri din aceeasi configurare.
CAMPURI_IDENTITATE = ('denumire', 'sediu', 'email', 'telefon', 'numar_orc', 'cod_fiscal')

# Ce inseamna "loc gol". Nu doar sirul vid: un substituent lasat in fisier e mai
# periculos, fiindca trece orice verificare de "nevid" si ajunge pe pagina.
#
# Numai substituenti EXPLICITI, cautati pe cuvant intreg (25.09.2026, felia de porti a dispecerului).
# Tiparul de dinainte cauta bucati de cuvant: "N/A" fara bara, in coada cuvantului, prindea "Str. Ana
# Ipatescu", "Poiana" si "Ucraina", iar "TODO" o denumire cu "Todoran" (constatarea criticului feliei
# 44, remasurata pe tiparul vechi); "necunoscut" prindea la fel strada "Eroul Necunoscut". In ziua
# operatorului (plan S4 sectiunea 10) poarta ar fi oprit productia pe datele copiate din certificat.
#   cuvinte   de completat, TODO, TBD, lorem, exemplu (eticheta datelor fictive, decizia owner-ului D11)
#   notatii   XXX si mai lung (si lipit de prefixul RO al codului fiscal), N/A cu bara, ???, orice
#             text intre [ ] sau intre < >
#   granita   cuvantul si seria de X nu sunt lipite de o LITERA. Cifra, _ si semnele nu leaga:
#             "RO1234XXXX", "J40/XXXX/2026" si "TODO_sediu" raman prinse, "XXXL" si "Todoran" nu.
#             Dupa @ opresc la fel: "contact@TODO" si "office@lorem.ro" sunt locuri goale, nu adrese
#   scutire   NUMAI "exemplu" pus imediat dupa @, si numai din cauza martorului negativ din controale(),
#             care are adresa contact@exemplu-3s.test: fara scutire, poarta iese 3 pe orice arbore. Nu
#             e o regula despre domenii. Adresa brandului sta pe domeniul lui (D12), deci "@exemplu" in
#             config/operator.json e aproape sigur un substituent, pe care poarta azi il lasa sa treaca.
#             controale() nu se editeaza din felia de porti: mutarea martorului pe un domeniu fara cuvant
#             de substituire si apoi scoaterea scutirii sunt cerute dispecerului
#   scoase    "necunoscut", cuvant al limbii din nume reale de strazi (Str. Eroul Necunoscut, in
#             Ploiesti si in Arad), si "NA" fara bara, care sta in nume reale de locuri (Nove Mesto na
#             Morave, in Cehia). Amandoua au caz de valoare reala in proba-porti-proces.py
# Campul fara nicio litera si nicio cifra (sir vid, null, "-") il prinde loc_gol(), nu tiparul.
TIPAR_SUBSTITUENT = re.compile(
    r'(?<![^\W\d_])(?:de\s+completat|todo|tbd|lorem|(?<!@)exemplu)(?![^\W\d_])'
    r'|(?<![^\W\d_])(?:(?:ro)?x{3,}|n/a)(?![^\W\d_])'
    r'|\?{3,}|\[[^\]]*\]|<[^>]*>',
    re.I)


def loc_gol(valoare):
    """L-01: campul nu identifica nimic - lipsa sau null, fara nicio litera si nicio cifra, ori cu un
    substituent din TIPAR_SUBSTITUENT.

    Pana la 25.09.2026 un null devenea textul "None", iar "-" era si el valoare: amandoua treceau de
    locul gol, si L-01 ramanea verde daca pagina continea "none" (un `display:none` ajunge) sau "-".
    Masurat pe poarta veche, ca proces, la productie. Se compara fara diacritice, ca in restul
    portii: o litera scrisa descompus (NFD) ar pune altfel o granita in mijlocul cuvantului."""
    if valoare is None:
        return True
    text = fara_diacritice(str(valoare)).strip()
    return re.search(r'[^\W_]', text) is None or TIPAR_SUBSTITUENT.search(text) is not None


# Gazdele proprii. O resursa incarcata de aici nu e "tert". Lista e scurta si
# motivata: doar mediile noastre. O gazda adaugata aici trebuie sa vina cu motiv.
#   3s4.ke2.in          mediul de proba
#   3s.md, 3s.com.ro    domeniile site-ului (adaugate 01.10.2026, felia 72)
#   localhost, 127.0.0.1  serverul local al probelor
# Scoasa pe 01.10.2026: `3s.ro`. Masurat atunci, domeniul nu e al nostru (parcat, al unui tert), deci
# o resursa incarcata de acolo era scutita de C-01 pe nedrept.
GAZDE_PROPRII = {'3s4.ke2.in', '3s.md', '3s.com.ro', 'localhost', '127.0.0.1'}

# C-01 numara elementele care INCARCA ceva. Un `<link>` al carui `rel` are numai valori din lista de mai
# jos nu incarca nimic si nu deschide nicio conexiune: canonical si alternate spre celelalte domenii ale
# site-ului (SITE_ALTERNATE) erau numarate drept resurse de la un tert, pe fiecare pagina. Orice alta
# valoare (stylesheet, preload, modulepreload, prefetch, preconnect, dns-prefetch, icon, manifest)
# pastreaza elementul ca resursa, inclusiv in combinatii ca `alternate stylesheet`.
REL_FARA_INCARCARE = {'canonical', 'alternate', 'author', 'license', 'prev', 'next'}

# Furnizori de urmarire cunoscuti, cautati si in sursa, nu doar in HTML: un
# `import` de SDK nu produce neaparat un `<script src>` absolut in build.
NUME_TERTI = [
    'googletagmanager', 'google-analytics', 'gtag/js', 'doubleclick',
    'connect.facebook.net', 'fbevents', 'hotjar', 'clarity.ms', 'mixpanel',
    'segment.com', 'analytics.js', 'matomo', 'plausible.io', 'fullstory',
    'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'unpkg.com',
]

# Exceptiile de la cautarea de nume in SURSA: cale relativa -> (numele permise acolo, motivul).
# In HTML-ul construit nu exista exceptii. Adaugata de felia seo-geo-gdpr, cu martor pozitiv si
# negativ in controale(): pozitiv - aceleasi nume in alt fisier, sau fisierul exceptat fara ele;
# negativ - numele in fisierul exceptat.
EXCEPTII_TERTI = {
    'src/components/consimtamant/incarcator-ga4.ts': (
        ('googletagmanager', 'gtag/js'),
        'decizia owner-ului din 24.09.2026 (plan S4 sectiunile 8-10): GA4 pregatit. Fisierul e singurul '
        'care numeste scriptul Google; il pune in pagina numai dupa acceptul categoriei statistica, cu '
        'operator numit si ID GA4 in mediu - dovada e la rulare, in tests/browser/comutator.spec.ts',
    ),
}
TEMEI_EXCEPTIE_MOARTA = ('o exceptie care nu mai scuteste nimic ramane o gaura: un fisier nou scris '
                         'la aceeasi cale ar mosteni scutirea fara ca nimeni sa o fi decis')


def fara_diacritice(text):
    """Comparatiile juridice se fac pe text normalizat: legea nu se schimba daca
    cineva scrie `soluţionarea` cu sedila in loc de virgula."""
    d = unicodedata.normalize('NFD', text)
    return ''.join(c for c in d if unicodedata.category(c) != 'Mn')


def normalizeaza(text):
    return re.sub(r'\s+', ' ', fara_diacritice(text)).lower()


# --- tiparele interzise, asamblate la rulare -------------------------------
# Se compun din bucati fiindca poarta scaneaza depozitul: un link ODR scris
# intreg aici ar fi cules ca defect real la prima rulare peste propriul dosar.

def tipare_sol():
    odr = 'consumers' + '/' + 'odr'
    return [
        (re.compile(re.escape(odr)), 'adresa platformei ODR a Comisiei'),
        (re.compile(r'webgate\.ec\.europa\.eu' + r'/' + r'odr'), 'adresa webgate ODR'),
        (re.compile(r'\bsolutionarea\s+online\s+a\s+litigiilor\b'), 'sintagma SOL'),
        (re.compile(r'\bplatforma\s+sol\b'), 'trimitere la platforma SOL'),
        (re.compile(r'\bonline\s+dispute\s+resolution\b'), 'trimitere ODR in engleza'),
    ]


TEMEI_SOL = ('Reg. (UE) 2024/3228 a abrogat Reg. (UE) 524/2013, platforma s-a inchis 20.07.2025. '
             'Un link mort e informatie inexacta, sanctionata de Legea 365/2002 art. 21 lit. a)')

# L-10 cauta CUVANTUL "numar" (numarul, numere...), nu un identificator de cod. Pana la 01.10.2026
# tiparul era `\bnum[ae]r\w*\b`, iar `\w` cuprinde `_`: cheia registrului comertului din configurare,
# urmata la mai putin de 120 de caractere de o proprietate `operator`, il aprindea pe SURSA fara nimic
# vizibil pe pagina (felia 73, ocolit atunci in cod). Acum cuvantul e numai din litere, nu e lipit de
# `_`, de cifra sau de un `.` in fata (acces la o proprietate). Textul vizibil ramane prins: martorul
# pozitiv din controale() si cel negativ pe identificator stau langa martorii de absenta.
TIPAR_OPERATOR = re.compile(r'(?<![\w.])num[ae]r[^\W\d_]*(?!\w).{0,120}?\boperator', re.S)
TEMEI_OPERATOR = ('Registrul operatorilor de date a fost desfiintat. Nu afisam numarul fiindca nu '
                  'putem dovedi ca mai exista, nu fiindca am citit actul de abrogare (L-10)')

TEMEI_IDENTITATE = ('Legea 365/2002 republicata, art. 5 alin. (1) lit. a)-e). Sanctiuni: art. 22 lit. b), '
                    'amenda 1.000-50.000 lei, si art. 21 lit. a), nulitatea relativa a contractului')
# Familia `md` (operator din Republica Moldova): identificarea prestatorului.
TEMEI_IDENTITATE_MD = 'Legea 284/2004 a Republicii Moldova, art. 12 alin. (1) lit. a)-c)'
TEMEI_LEGATURA_MD = ('Legea 284/2004 art. 12: datele prestatorului accesibile direct si permanent; pe 3s.md '
                     'datele stau numai pe pagina de informatii legale (decizia 5 a owner-ului, 30.09.2026), '
                     'deci fiecare pagina publica trimite la ea, in romana')
MESAJ_D2 = ('poarta marcajul decis; riscul Legii 284/2004 art. 12 e acceptat de owner (plan 3s-md §0, D2)')

# Variabila de mediu cu operatorul domeniului, aceeasi schema ca fisierul (src/lib/operator-mediu.ts).
VARIABILA_OPERATOR = 'OPERATOR_JSON'
# Modelul D2: campurile care pot purta marcajul si marcajele pe limba (citit si de site).
CALE_MODEL_D2 = ('config', 'model-d2.json')
# Adresele documentelor familiei `md`, pe limba, si poarta la care se publica fiecare.
CALE_RUTE_MD = ('config', 'juridic-rute.json')
ORDINE_PORTI = ('B', 'C')

# Numele Republicii Moldova in campul `tara`: lista INCHISA, aceeasi ca TARI_MD din
# src/content/juridic/familie.ts (proba-juridic.py le compara). Orice alta tara pastreaza regulile de
# dinainte (familia SEE); o tara fara texte o opreste construirea site-ului, nu poarta.
TARI_MD = ('republica moldova', 'moldova')
TEMEI_FARA_OPERATOR = ('decizia owner-ului din 24.09.2026 (planul valului S4, sectiunile 7 si 9-10): niciun '
                       'operator numit pana la infiintarea firmei, pe site doar brandul; riscul Legii 365/2002 '
                       'art. 5 la lansarea publica e numit acolo si e al owner-ului')

# Comutatorul operatorului: `{"operator": null}` sau `{"operator": {campurile firmei}}`.
CALE_OPERATOR = ('config', 'operator.json')
TEMEI_ART13 = 'GDPR art. 12 alin. (1) si art. 13; pentru MD, Legea 195/2024 art. 13'
TEMEI_FORMULAR = ('GDPR art. 6 alin. (1) lit. b): relatia precontractuala e temeiul, nu consimtamantul. '
                  'Un temei declarat gresit e eroare de fond, nu de redactare')
TEMEI_TERTI = ('Art. 5 alin. (3) ePrivacy / Directiva 2002/58 si GDPR art. 44-49. Zero terti inseamna '
               'zero banner, zero transfer de declarat si zero clasa de risc care a produs amenzile ANSPDCP')


def tipare_formular_interzis():
    a = r'trimiterea\s+(acestui\s+)?formular\w*'
    b = r'consimt'
    return [
        re.compile(a + r'.{0,90}?' + b, re.S),
        re.compile(b + r'.{0,90}?' + a, re.S),
    ]


TEXT_CERUT_FORMULAR = 'demersuri precontractuale'


# --- culegerea fisierelor --------------------------------------------------

def fisiere_sursa(radacina):
    gasite = []
    for cale in CAI_SURSA:
        absolut = os.path.join(radacina, cale)
        if not os.path.isdir(absolut):
            continue
        for r, directoare, nume in os.walk(absolut):
            directoare[:] = [d for d in directoare if d not in SARITE]
            for n in nume:
                if n.endswith(EXTENSII):
                    gasite.append(os.path.join(r, n))
    return sorted(gasite)


def fisiere_construite(radacina):
    dosar = os.path.join(radacina, '.next', 'server', 'app')
    return sorted(glob.glob(os.path.join(dosar, '**', '*.html'), recursive=True))


def build_invechit(radacina):
    """True cand HTML-ul construit e mai vechi decat sursa din care ar trebui sa vina.

    De ce e nevoie: identitatea firmei (L-01) si tertii (C-01) se masoara pe HTML-ul
    LIVRAT. Un HTML vechi citit ca si cum ar fi cel de acum e mai rau decat lipsa lui,
    fiindca poarta iese VERDE pe un site care nu mai exista. Lipsa se trateaza separat,
    ca avertisment; invechirea inseamna NEMASURAT.
    """
    construite = fisiere_construite(radacina)
    if not construite:
        return False
    sursa = fisiere_sursa(radacina)
    cel_mai_nou_din_sursa = max((os.path.getmtime(c) for c in sursa), default=0)
    cel_mai_vechi_din_build = min(os.path.getmtime(c) for c in construite)
    return cel_mai_nou_din_sursa > cel_mai_vechi_din_build


def citeste(cale):
    try:
        return open(cale, encoding='utf-8', errors='replace').read()
    except OSError:
        return ''


# --- verificarile ----------------------------------------------------------

def cauta_absenta(documente, tipare, cod, temei, eticheta):
    """Portile de absenta. `documente` = lista de (nume, text)."""
    g = []
    for nume, text in documente:
        n = normalizeaza(text)
        for tipar, descriere in tipare:
            m = tipar.search(n)
            if m:
                context = n[max(0, m.start() - 30):m.end() + 30]
                g.append((OPRESTE, cod, nume + ': ' + eticheta + ' (' + descriere + ') | ...'
                          + context + '... | TEMEI: ' + temei))
    return g


def link_fara_incarcare(atribute):
    """`<link>` care nu incarca nimic: `rel` exista si TOATE valorile lui sunt in REL_FARA_INCARCARE.
    Fara `rel`, sau cu `rel` gol, elementul ramane resursa: nu stim ce face, deci il numaram."""
    m = re.search(r'\brel\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s"\'>]+))', atribute, re.I)
    if m is None:
        return False
    valori = (m.group(1) or m.group(2) or m.group(3) or '').lower().split()
    return bool(valori) and all(v in REL_FARA_INCARCARE for v in valori)


def verifica_terti(construite, sursa):
    """C-01. In HTML se cauta resursele SUB-INCARCATE (script/link/iframe/img), nu
    orice adresa absoluta: un `<a href>` catre un site extern e link normal, nu
    tert incarcat in echipamentul vizitatorului."""
    g = []
    tipar_element = re.compile(r'<(script|iframe|img|link|source|video|audio)\b([^>]*)>', re.I | re.S)
    tipar_adresa = re.compile(r'\b(?:src|href)\s*=\s*["\'](https?://[^"\']+)["\']', re.I | re.S)
    for nume, text in construite:
        # comentariile HTML se scot inainte: un `<script src="...">` citat intr-un
        # comentariu nu incarca nimic, dar ar produce un defect fantoma
        curat = re.sub(r'<!--.*?-->', ' ', text, flags=re.S)
        for m in tipar_element.finditer(curat):
            gasita = tipar_adresa.search(m.group(2))
            if gasita is None:
                continue
            if m.group(1).lower() == 'link' and link_fara_incarcare(m.group(2)):
                continue
            adresa = gasita.group(1)
            gazda = re.sub(r'^https?://', '', adresa).split('/')[0].split(':')[0].lower()
            if gazda not in GAZDE_PROPRII:
                g.append((OPRESTE, 'C-01', nume + ': resursa <' + m.group(1).lower() + '> incarcata de la tertul '
                          + gazda + ' | TEMEI: ' + TEMEI_TERTI))
    din_sursa = set(nume for nume, _ in sursa)
    for nume, text in sursa + construite:
        n = text.lower()
        scutite = EXCEPTII_TERTI[nume][0] if nume in din_sursa and nume in EXCEPTII_TERTI else ()
        for furnizor in NUME_TERTI:
            if furnizor in n and furnizor not in scutite:
                g.append((OPRESTE, 'C-01', nume + ': apare furnizorul tert "' + furnizor
                          + '" | TEMEI: ' + TEMEI_TERTI))
    # Exceptia fara obiect: fisierul exceptat exista, dar nu mai poarta niciunul dintre numele ei.
    for nume, text in sursa:
        if nume in EXCEPTII_TERTI and not any(f in text.lower() for f in EXCEPTII_TERTI[nume][0]):
            g.append((OPRESTE, 'C-01', nume + ': exceptie fara obiect in EXCEPTII_TERTI (fisierul nu mai numeste '
                      + ', '.join(EXCEPTII_TERTI[nume][0]) + '); scoate exceptia | TEMEI: ' + TEMEI_EXCEPTIE_MOARTA))
    return g


def verifica_formular(documente, sever_prezenta):
    g = []
    are_formular = False
    for nume, text in documente:
        n = normalizeaza(text)
        for tipar in tipare_formular_interzis():
            m = tipar.search(n)
            if m:
                g.append((OPRESTE, 'L-05', nume + ': formularul isi declara temeiul drept consimtamant | ...'
                          + n[max(0, m.start() - 20):m.end() + 20] + '... | TEMEI: ' + TEMEI_FORMULAR))
        if '<form' in n or 'onsubmit' in n:
            are_formular = True
    if are_formular:
        gasit = any(TEXT_CERUT_FORMULAR in normalizeaza(t) for _, t in documente)
        if not gasit:
            g.append((sever_prezenta, 'L-05', 'exista formular, dar nicaieri nu apare sintagma "'
                      + TEXT_CERUT_FORMULAR + '" care numeste temeiul | TEMEI: ' + TEMEI_FORMULAR))
    return g


TEMEI_L15_FARA_OPERATOR = ('decizia owner-ului din 24.09.2026 (plan S4 sectiunile 9-10): paginile juridice se '
                           'construiesc complet, dar nu se publica pana cand exista un operator de numit in ele '
                           '(GDPR art. 13 alin. (1) lit. a))')
TEMEI_L15_COOKIE = ('bannerul de consimtamant e in HTML-ul construit, deci site-ul foloseste un instrument '
                    'ne-esential: Legea 506/2004 art. 4 alin. (5) (informare clara si completa inaintea '
                    'acordului), GDPR art. 13; pentru MD, Legea 284/2004 art. 10 alin. (2) lit. b)-h)')

# Unde poate sta pagina unei rute juridice in sursa. `juridic/` e locul din contractul de navigatie.
TIPARE_PAGINA_JURIDICA = ('src/app/%s/page.tsx', 'src/app/%s/page.mdx', 'src/app/%s/page.ts',
                          'src/app/ro/%s/page.tsx', 'src/app/ro/%s/page.mdx',
                          'src/app/juridic/%s/page.tsx', 'src/app/juridic/%s/page.mdx')


def pagini_cu_banner(construite):
    """Paginile construite care poarta bannerul de consimtamant."""
    return [nume for nume, text in construite if MARCAJ_BANNER in text]


# Unde poate sta pagina CONSTRUITA a unei rute juridice: aceleasi locuri ca in sursa, in forma pe care
# o scrie `next build` (`/juridic/cookies` -> `.next/server/app/juridic/cookies.html`). Asa se
# recunoaste si o pagina fara fisier propriu in sursa (segment dinamic, grup de rute).
TIPARE_HTML_JURIDIC = ('.next/server/app/%s.html', '.next/server/app/ro/%s.html',
                       '.next/server/app/juridic/%s.html')


def cai_pagini_sursa(radacina):
    """Adresele paginilor din `src/app`, cum le serveste Next: segmentele de grup `(nume)` nu intra in
    adresa. O pagina e `page.tsx`, `page.mdx`, `page.ts` sau `page.<sufix>.tsx` (pagina unei editii,
    de pilda `page.en.tsx`, servita numai de build-ul editiei ei)."""
    baza = os.path.join(radacina, 'src', 'app')
    cai = set()
    if not os.path.isdir(baza):
        return cai
    for r, directoare, nume in os.walk(baza):
        directoare[:] = [d for d in directoare if d not in SARITE]
        if not any(re.fullmatch(r'page(?:\.[a-z0-9-]+)?\.tsx|page\.(?:mdx|ts)', n) for n in nume):
            continue
        segmente = os.path.relpath(r, baza).replace(os.sep, '/').split('/')
        cai.add('/' + '/'.join(s for s in segmente if s not in ('.', '') and not re.fullmatch(r'\(.*\)', s)))
    return cai


def ruta_juridica_exista(radacina, construite, ruta):
    """Pagina rutei exista in sursa sau in build, pe CALEA INTREAGA. Pana la 25.09.2026 numele
    fisierelor construite se comparau pe subsir, deci un articol cu "cookies" in adresa tinea loc
    de politica de cookie-uri (constatarea criticului, masurata pe fabrica_arbore)."""
    if any(os.path.isfile(os.path.join(radacina, tipar % ruta)) for tipar in TIPARE_PAGINA_JURIDICA):
        return True
    # Aceleasi locuri, si cu pagina unei editii (`page.<sufix>.tsx`) sau sub un grup de rute.
    surse = cai_pagini_sursa(radacina)
    if any(('/' + tipar % ruta).replace('/src/app', '', 1).rsplit('/', 1)[0] in surse for tipar in TIPARE_PAGINA_JURIDICA):
        return True
    cai = {tipar % ruta for tipar in TIPARE_HTML_JURIDIC}
    return any(nume.replace(os.sep, '/') in cai for nume, _ in construite)


def html_pentru_cale(cale):
    """Fisierul in care `next build` scrie pagina statica a unei adrese (`/legal/x` -> `legal/x.html`)."""
    return '.next/server/app' + ('/index' if cale == '/' else cale.rstrip('/')) + '.html'


def pagina_md_exista(radacina, construite, cale, surse):
    if cale in surse:
        return True
    return any(nume.replace(os.sep, '/') == html_pentru_cale(cale) for nume, _ in construite)


def incarca_json(radacina, cale_rel):
    """Un fisier JSON din depozit, sau (None, motivul)."""
    cale = os.path.join(radacina, *cale_rel)
    if not os.path.isfile(cale):
        return None, 'lipseste ' + '/'.join(cale_rel)
    try:
        return json.loads(citeste(cale)), None
    except ValueError as e:
        return None, '/'.join(cale_rel) + ' nu e JSON valid: ' + str(e)


def rute_md(radacina):
    """`config/juridic-rute.json`, validat cat ii trebuie portii: (documente, poarta curenta) sau (None, motiv)."""
    rute, motiv = incarca_json(radacina, CALE_RUTE_MD)
    if rute is None:
        return None, motiv
    documente = rute.get('documente') if isinstance(rute, dict) else None
    poarta = rute.get('poarta_curenta') if isinstance(rute, dict) else None
    if (not isinstance(documente, dict) or poarta not in ORDINE_PORTI
            or 'informatii-legale' not in documente
            or not all(isinstance(d, dict) and isinstance(d.get('ro'), str) and isinstance(d.get('en'), str)
                       and d.get('poarta') in ORDINE_PORTI for d in documente.values())):
        return None, '/'.join(CALE_RUTE_MD) + ' nu are forma asteptata (poarta_curenta B/C; documente cu en, ro, poarta)'
    return (documente, poarta), None


def publicate_md(documente, poarta):
    """Cheile publicate la poarta curenta (o poarta mai tarzie le include pe cele dinainte)."""
    return [c for c, d in documente.items() if ORDINE_PORTI.index(d['poarta']) <= ORDINE_PORTI.index(poarta)]


def limbi_publicate(construite):
    """Limbile in care se publica documentele familiei `md`: romana mereu (legatura de pe fiecare pagina
    duce la pagina romaneasca), engleza din clipa in care o pagina construita e servita cu
    `<html lang="en...">` (editia engleza a domeniului)."""
    limbi = ['ro']
    if any(re.search(r'<html\b[^>]*\blang\s*=\s*["\']en\b', text, re.I) for _, text in construite):
        limbi.append('en')
    return limbi


def familie_din_tara(tara):
    """'md' pentru Republica Moldova (lista inchisa TARI_MD), altfel None: regulile familiei SEE."""
    if not isinstance(tara, str):
        return None
    n = re.sub(r'\s+', ' ', fara_diacritice(tara)).strip().lower()
    return 'md' if n in TARI_MD else None


def verifica_rute_juridice(radacina, construite, sever_prezenta, mediu_proces=None):
    g = []
    cerute = []
    # Paginile juridice se cer numai de la un site care are operator: fara el, politica n-ar avea
    # cine sa numeasca, iar decizia owner-ului e ca paginile sa nu se publice (TEMEI_L15_FARA_OPERATOR).
    stare, date, _, _ = stare_operator(radacina, mediu_proces)
    cu_banner = pagini_cu_banner(construite)
    if stare == 'numit' and familie_din_tara(date.get('tara')) == 'md':
        return verifica_rute_md(radacina, construite, sever_prezenta, cu_banner)
    if stare != 'null':
        temei = TEMEI_ART13 + '; identificarea comerciantului, Legea 365/2002 art. 5'
        cerute.extend((ruta, temei) for ruta in RUTE_JURIDICE)
    # Politica de cookie-uri se cere dupa banner, oricare ar fi starea operatorului (RUTA_COOKIE).
    if cu_banner:
        cerute.append((RUTA_COOKIE, TEMEI_L15_COOKIE + ' (bannerul e, de pilda, in ' + cu_banner[0] + ')'))
    for ruta, temei in cerute:
        if not ruta_juridica_exista(radacina, construite, ruta):
            g.append((sever_prezenta, 'L-15', 'lipseste ruta juridica /' + ruta + ' | TEMEI: ' + temei))
    return g


def verifica_rute_md(radacina, construite, sever_prezenta, cu_banner):
    """L-15 in familia `md`: documentele publicate la poarta curenta, in fiecare limba publicata, la
    adresele din `config/juridic-rute.json` (nu din tiparele fixe ale familiei SEE)."""
    rute, motiv = rute_md(radacina)
    if rute is None:
        return [(OPRESTE, 'L-15', 'familia md: ' + motiv + ' | TEMEI: ' + TEMEI_ART13)]
    documente, poarta = rute
    chei = publicate_md(documente, poarta)
    if cu_banner and 'cookie-uri' in documente and 'cookie-uri' not in chei:
        chei.append('cookie-uri')
    surse = cai_pagini_sursa(radacina)
    g = []
    for cheie in chei:
        for limba in limbi_publicate(construite):
            cale = documente[cheie][limba]
            if not pagina_md_exista(radacina, construite, cale, surse):
                g.append((sever_prezenta, 'L-15', 'familia md: lipseste pagina juridica ' + cale + ' (' + cheie
                          + ', ' + limba + ', poarta ' + documente[cheie]['poarta'] + ') | TEMEI: ' + TEMEI_ART13
                          + '; ' + TEMEI_IDENTITATE_MD))
    return g


def configurare_operator(radacina, mediu_proces):
    """Configurarea comutatorului si de unde vine: `OPERATOR_JSON` din `mediu_proces` daca e setata si
    nevida, altfel `config/operator.json` (aceeasi precedenta ca src/lib/operator.ts). Intoarce
    (cfg | None, sursa, motiv): None cu motivul 'lipsa' pentru fisierul absent, altfel textul erorii.
    `mediu_proces` e un dictionar PRIMIT, niciodata `os.environ`: martorii din controale() trec unul gol."""
    brut = (mediu_proces or {}).get(VARIABILA_OPERATOR)
    if brut is not None and brut.strip() != '':
        try:
            return json.loads(brut), VARIABILA_OPERATOR, None
        except ValueError as e:
            return None, VARIABILA_OPERATOR, 'nu e JSON valid: ' + str(e)
    rel = '/'.join(CALE_OPERATOR)
    cale = os.path.join(radacina, *CALE_OPERATOR)
    if not os.path.isfile(cale):
        return None, rel, 'lipsa'
    try:
        return json.loads(citeste(cale)), rel, None
    except ValueError as e:
        return None, rel, 'nu e JSON valid: ' + str(e)


def stare_operator(radacina, mediu_proces=None):
    """Ce spune comutatorul: (stare, date sau mesaj, sursa, cfg), cu stare 'lipsa' | 'invalid' | 'null' |
    'numit' si sursa `OPERATOR_JSON` sau `config/operator.json`. Fara `mediu_proces` = dictionar gol."""
    cfg, sursa, motiv = configurare_operator(radacina, mediu_proces)
    if motiv == 'lipsa':
        return 'lipsa', None, sursa, None
    if motiv is not None:
        return 'invalid', motiv, sursa, None
    if not isinstance(cfg, dict) or 'operator' not in cfg:
        return 'invalid', 'lipseste cheia "operator" (null sau obiectul firmei)', sursa, cfg
    if cfg['operator'] is None:
        return 'null', None, sursa, cfg
    if not isinstance(cfg['operator'], dict):
        return ('invalid', '"operator" trebuie sa fie null sau un obiect, nu ' + type(cfg['operator']).__name__,
                sursa, cfg)
    return 'numit', cfg['operator'], sursa, cfg


def model_d2(radacina, cfg, sursa):
    """Modelul D2 din configurare: ("model" la RADACINA, langa "operator"; nu in obiectul firmei, unde
    src/lib/operator.ts il refuza drept camp necunoscut). Intoarce (date_model | None, constatari)."""
    if not isinstance(cfg, dict) or 'model' not in cfg:
        return None, []
    if cfg['model'] != 'D2':
        return None, [(OPRESTE, 'L-01', sursa + ': model necunoscut ' + json.dumps(cfg['model'], ensure_ascii=False)
                       + ' (singura valoare admisa: "D2"; configurarea poate doar aprinde modelul, nu il poate '
                       'schimba) | TEMEI: ' + TEMEI_IDENTITATE_MD)]
    model, motiv = incarca_json(radacina, CALE_MODEL_D2)
    ok_forma = (isinstance(model, dict) and isinstance(model.get('campuri'), list)
                and isinstance(model.get('marcaj'), dict)
                and all(isinstance(model['marcaj'].get(l), str) and model['marcaj'][l].strip() for l in ('ro', 'en')))
    if not ok_forma:
        return None, [(OPRESTE, 'L-01', sursa + ': "model": "D2", dar ' + (motiv or '/'.join(CALE_MODEL_D2)
                       + ' nu are forma asteptata (campuri, marcaj.ro, marcaj.en)') + ' | TEMEI: ' + TEMEI_IDENTITATE_MD)]
    return model, []


def nfc(text):
    return unicodedata.normalize('NFC', str(text)).strip()


def este_marcaj_d2(model, camp, valoare):
    """Campul e unul admis de model si valoarea, NFC si fara spatii la capete, e EXACT marcajul romanesc."""
    return model is not None and camp in model['campuri'] and isinstance(valoare, str) \
        and nfc(valoare) == nfc(model['marcaj']['ro'])


def are_legatura(text, cale):
    """Pagina are un `<a href>` spre `cale`: relativ, sau absolut pe o gazda proprie."""
    for m in re.finditer(r'<a\b[^>]*?\bhref\s*=\s*["\']([^"\']*)["\']', text, re.I | re.S):
        adresa = m.group(1)
        absoluta = re.match(r'^https?://([^/?#]+)(.*)$', adresa, re.I)
        if absoluta:
            if absoluta.group(1).split(':')[0].lower() not in GAZDE_PROPRII:
                continue
            adresa = absoluta.group(2) or '/'
        adresa = re.split(r'[?#]', adresa)[0]
        if adresa.rstrip('/') == cale.rstrip('/'):
            return True
    return False


def verifica_identitate(radacina, construite, sever_prezenta, mediu_proces=None):
    """L-01, conditionat de operator: datele de identificare se cer numai de la o firma care
    exista. Cu operator null nu se cere nimic (decizia owner-ului, TEMEI_FARA_OPERATOR)."""
    g = []
    stare, date, rel, cfg = stare_operator(radacina, mediu_proces)
    model, gm = model_d2(radacina, cfg, rel)
    g.extend(gm)
    if stare == 'null':
        return g
    if stare == 'lipsa':
        g.append((sever_prezenta, 'L-01', 'lipseste ' + rel + ', comutatorul operatorului: {"operator": null} '
                  'cat timp nu exista firma, altfel obiectul cu campurile ' + ', '.join(CAMPURI_IDENTITATE)
                  + ' | TEMEI: ' + TEMEI_IDENTITATE))
        return g
    if stare == 'invalid':
        g.append((OPRESTE, 'L-01', rel + ': ' + date))
        return g

    md = familie_din_tara(date.get('tara')) == 'md'
    temei = TEMEI_IDENTITATE_MD if md else TEMEI_IDENTITATE
    goale = [camp for camp in CAMPURI_IDENTITATE if loc_gol(date.get(camp))]
    # Exceptia D2: campul admis care poarta EXACT marcajul decis e AVERT pe orice mediu. Orice alt loc
    # gol (alt text intre paranteze, marcajul pe alt camp, fara diacritice, fara "model") ramane gradat.
    cu_marcaj = [camp for camp in goale if este_marcaj_d2(model, camp, date.get(camp))]
    for camp in cu_marcaj:
        g.append((AVERT, 'L-01', 'model D2: ' + camp + ' ' + MESAJ_D2))
    goale = [camp for camp in goale if camp not in cu_marcaj]
    if goale:
        g.append((sever_prezenta, 'L-01', rel + ': operatorul e numit, dar are loc gol la ' + ', '.join(goale)
                  + ' | TEMEI: ' + temei))
        return g

    # Configurarea e completa: de aici incolo obligatia e sa APARA pe fiecare
    # pagina publica livrata, iar asta se masoara numai pe HTML-ul construit.
    if not construite:
        g.append((AVERT, 'L-01', 'datele firmei sunt complete, dar nu exista HTML construit '
                  'in care sa verific ca apar pe fiecare pagina. Ruleaza pnpm build'))
        return g
    if md:
        g.extend(verifica_identitate_md(radacina, construite, sever_prezenta, date, rel, model))
        return g
    for nume, text in construite:
        n = normalizeaza(text)
        for camp in CAMPURI_IDENTITATE:
            valoare = normalizeaza(str(date[camp]))
            if valoare not in n:
                g.append((OPRESTE, 'L-01', nume + ': campul ' + camp + ' din ' + rel
                          + ' nu apare in pagina livrata | TEMEI: ' + TEMEI_IDENTITATE))
    return g


def verifica_identitate_md(radacina, construite, sever_prezenta, date, rel, model):
    """L-01 in familia `md`: datele pe pagina de informatii legale din FIECARE limba publicata (campul
    cu marcajul D2 se cauta ca marcajul limbii paginii), iar pe fiecare pagina publica o legatura spre
    informatiile legale in romana. Cererea "pe fiecare pagina" ramane numai familiei SEE."""
    rute, motiv = rute_md(radacina)
    if rute is None:
        return [(OPRESTE, 'L-01', 'familia md: ' + motiv + ' | TEMEI: ' + TEMEI_IDENTITATE_MD)]
    documente, _ = rute
    g = []
    dupa_nume = {nume.replace(os.sep, '/'): text for nume, text in construite}
    for limba in limbi_publicate(construite):
        cale = documente['informatii-legale'][limba]
        text = dupa_nume.get(html_pentru_cale(cale))
        if text is None:
            g.append((sever_prezenta, 'L-01', 'familia md: lipseste pagina de informatii legale in limba ' + limba
                      + ' (' + cale + '), unde se cer datele prestatorului | TEMEI: ' + TEMEI_IDENTITATE_MD))
            continue
        n = normalizeaza(text)
        for camp in CAMPURI_IDENTITATE:
            valoare = model['marcaj'][limba] if este_marcaj_d2(model, camp, date.get(camp)) else date[camp]
            if normalizeaza(str(valoare)) not in n:
                g.append((OPRESTE, 'L-01', html_pentru_cale(cale) + ': campul ' + camp + ' din ' + rel
                          + ' nu apare pe pagina de informatii legale (' + limba + ') | TEMEI: ' + TEMEI_IDENTITATE_MD))
    cale_ro = documente['informatii-legale']['ro']
    for nume, text in construite:
        if not are_legatura(text, cale_ro):
            g.append((sever_prezenta, 'L-01', nume + ': familia md: nicio legatura spre informatiile legale in '
                      'romana (' + cale_ro + ') | TEMEI: ' + TEMEI_LEGATURA_MD))
    return g


# --- J-01: marcajele din corpul paginilor juridice ----------------------------------------------
# Un text intre paranteze drepte pe o pagina juridica publicata e o informatie lipsa scrisa ca text
# (README-ul pachetului juridic, sectiunea 5). Se publica numai marcajele din registrul de mai jos,
# fiecare cu decizia lui pe rand; marcajul D2 (din config/model-d2.json) numai cu "model": "D2".
# NU intra: N23 (tara gazdei, conditie de fapt a portii B), marcajul reprezentantului in UE (P-22 tine
# de poarta B; intra numai cu confirmarea scrisa a juristului), data publicarii (se inlocuieste la
# publicare). Adaugarea se face numai cu decizia citata pe rand.
MARCAJE_ADMISE = {
    '[de publicat înainte de primul client]': 'pachetul juridic, README §2, 04: publicabila la poarta B cu '
                                              'cele trei marcaje, pana la paginile de la poarta C',
    '[to be published before the first client]': 'perechea EN a marcajului de mai sus, aceeasi decizie',
}
TEMEI_MARCAJ = ('un marcaj pe o pagina juridica publicata spune ca informatia lipseste; se publica numai '
                'marcajele cu decizie (MARCAJE_ADMISE si marcajul D2 cu modelul aprins)')
TEMEI_ACOLADE = 'un token de compunere nerezolvat in pagina livrata (acolade duble) e text stricat, nu informare'


def text_vizibil(html_text, fara_legaturi=False):
    """Textul pe care il vede omul: fara comentarii, scripturi (si payload-ul RSC din ele), stiluri si
    etichete; entitatile decodate, NFC. Cu `fara_legaturi`, continutul elementelor `<a>` iese si el."""
    import html as modul_html
    t = re.sub(r'<!--.*?-->', ' ', html_text, flags=re.S)
    t = re.sub(r'<(script|style|template)\b[^>]*>.*?</\1\s*>', ' ', t, flags=re.S | re.I)
    if fara_legaturi:
        t = re.sub(r'<a\b[^>]*>.*?</a\s*>', ' ', t, flags=re.S | re.I)
    t = re.sub(r'<[^>]+>', ' ', t)
    return unicodedata.normalize('NFC', modul_html.unescape(t))


def html_fara_cod(html_text):
    """HTML-ul fara comentarii, scripturi si stiluri: etichetele si atributele raman."""
    t = re.sub(r'<!--.*?-->', ' ', html_text, flags=re.S)
    return re.sub(r'<(script|style)\b[^>]*>.*?</\1\s*>', ' ', t, flags=re.S | re.I)


def pagini_juridice(radacina, construite):
    """Paginile construite care sunt documente juridice: adresele familiei `md` din
    `config/juridic-rute.json` si locurile familiei SEE (`/juridic` si tot ce e sub el)."""
    cai = {tipar % ruta for tipar in TIPARE_HTML_JURIDIC for ruta in RUTE_JURIDICE + (RUTA_COOKIE,)}
    cai.add('.next/server/app/juridic.html')
    rute, _ = rute_md(radacina)
    if rute is not None:
        for d in rute[0].values():
            cai.update(html_pentru_cale(d[l]) for l in ('ro', 'en'))
    return [(nume, text) for nume, text in construite
            if nume.replace(os.sep, '/') in cai or nume.replace(os.sep, '/').startswith('.next/server/app/juridic/')]


def verifica_marcaje(radacina, construite, sever_prezenta, mediu_proces=None):
    g = []
    _, _, rel, cfg = stare_operator(radacina, mediu_proces)
    model, _ = model_d2(radacina, cfg, rel)
    admise = dict((nfc(k), v) for k, v in MARCAJE_ADMISE.items())
    if model is not None:
        for limba in ('ro', 'en'):
            admise[nfc(model['marcaj'][limba])] = 'modelul D2 (plan 3s-md §0, D2)'
    for nume, text in pagini_juridice(radacina, construite):
        vazute = {}
        for m in re.finditer(r'\[([^\[\]]{1,300})\](?!\()', text_vizibil(text, fara_legaturi=True)):
            if not re.search(r'[^\W\d_]', m.group(1)):
                continue
            marcaj = '[' + re.sub(r'\s+', ' ', m.group(1)).strip() + ']'
            if nfc(marcaj) not in admise:
                vazute[marcaj] = vazute.get(marcaj, 0) + 1
        for marcaj, numar in sorted(vazute.items()):
            g.append((sever_prezenta, 'J-01', nume + ': marcaj fara decizie pe pagina juridica ' + marcaj
                      + (' (de ' + str(numar) + ' ori)' if numar > 1 else '') + ' | TEMEI: ' + TEMEI_MARCAJ))
    # Acoladele duble: oricand OPRESTE, pe orice pagina construita (absenta, gratuita de satisfacut).
    for nume, text in construite:
        if '{{' in html_fara_cod(text):
            g.append((OPRESTE, 'J-01', nume + ': acolade duble in HTML-ul construit | TEMEI: ' + TEMEI_ACOLADE))
    return g


def analizeaza(radacina, mediu, mediu_proces=None):
    """Verdictul complet. Aceeasi functie ruleaza pe proiectul real si pe martori. `mediu_proces` =
    variabilele procesului, citite O SINGURA DATA in main(); martorii primesc un dictionar gol."""
    mediu_proces = mediu_proces or {}
    sever_prezenta = OPRESTE if mediu == 'productie' else AVERT

    sursa = [(os.path.relpath(c, radacina).replace(os.sep, '/'), citeste(c)) for c in fisiere_sursa(radacina)]
    construite = [(os.path.relpath(c, radacina).replace(os.sep, '/'), citeste(c))
                  for c in fisiere_construite(radacina)]
    toate = sursa + construite

    g = []
    # Ordinea: portile ieftine de absenta intai. Un pas ieftin pus dupa cel scump
    # nu economiseste nimic, iar aici cel scump e comparatia pe fiecare pagina.
    g.extend(cauta_absenta(toate, tipare_sol(), 'L-09', TEMEI_SOL, 'trimitere catre platforma SOL/ODR'))
    g.extend(cauta_absenta(toate, [(TIPAR_OPERATOR, 'numar langa cuvantul operator')],
                           'L-10', TEMEI_OPERATOR, 'numar de inregistrare ca operator de date'))
    g.extend(verifica_terti(construite, sursa))
    g.extend(verifica_formular(toate, sever_prezenta))
    g.extend(verifica_rute_juridice(radacina, construite, sever_prezenta, mediu_proces))
    g.extend(verifica_identitate(radacina, construite, sever_prezenta, mediu_proces))
    g.extend(verifica_marcaje(radacina, construite, sever_prezenta, mediu_proces))
    return g, len(toate)


# ---------------------------------------------------------------- martorii

def scrie(cale, continut):
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    # newline='\n' explicit: pe Windows, un \r intr-un fisier intermediar face
    # potrivirea sa reuseasca sau sa esueze dupa POZITIA elementului in fisier.
    with open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


def fabrica_arbore(dosar, defect, cu_operator=True, cu_rute=True, cu_banner=False, cu_cookie=False):
    """Construieste un proiect minimal in `dosar`. `defect` False = curat.

    `cu_operator` False = comutatorul pe null si nicio data de firma in pagina: forma de azi a
    site-ului, dupa decizia owner-ului (TEMEI_FARA_OPERATOR). `cu_rute` False = fara paginile
    juridice, ca martorii L-15 sa le poata cere sau nu, dupa operator. `cu_banner` pune bannerul de
    consimtamant in HTML-ul construit, iar `cu_cookie` pagina politicii de cookie-uri in sursa, la
    locul din contractul de navigatie (`src/app/juridic/cookies/`)."""
    if cu_rute:
        scrie(os.path.join(dosar, 'src', 'app', 'confidentialitate', 'page.tsx'),
              'export default function P() { return <p>Politica</p> }\n')
        scrie(os.path.join(dosar, 'src', 'app', 'termeni', 'page.tsx'),
              'export default function P() { return <p>Termeni</p> }\n')
    if cu_cookie:
        scrie(os.path.join(dosar, 'src', 'app', 'juridic', RUTA_COOKIE, 'page.tsx'),
              'export default function P() { return <p>Cookie-uri</p> }\n')
    operator = {
        'denumire': 'Trei S Arhivare SRL',
        'sediu': 'Golesti, judetul Arges',
        'email': 'contact@exemplu-3s.test',
        'telefon': '+40 000 000 000',
        'numar_orc': 'J03/1234/2026',
        'cod_fiscal': 'RO12345678',
    } if cu_operator else None
    scrie(os.path.join(dosar, *CALE_OPERATOR),
          json.dumps({'operator': operator}, ensure_ascii=False, indent=2) + '\n')

    corp = ['<html><body>']
    if cu_operator:
        corp += [
            '<p>Trei S Arhivare SRL, Golesti, judetul Arges</p>',
            '<p>contact@exemplu-3s.test, +40 000 000 000</p>',
            '<p>J03/1234/2026, RO12345678</p>',
        ]
    corp += [
        '<form><input name="nume"/><p>Prelucram datele pentru demersuri precontractuale.</p></form>',
        # control negativ inclus in fixtura: un link EXTERN normal, care NU e tert
        # incarcat, si un comentariu care CITEAZA un script de la un tert.
        '<a href="https://exemplu-extern.test/pagina">un link extern normal</a>',
        '<!-- nota: aici NU punem <script src="https://cdn.exemplu.test/x.js"></script> -->',
    ]
    if cu_banner:
        # Atributul bannerului real, scris aici separat de MARCAJ_BANNER: un martor construit din
        # aceeasi constanta ar trece si cu o constanta gresita (masurat pe mutant, 24.09.2026).
        corp.append('<section data-' + 'consimtamant="" hidden=""><h2>Cookie-uri</h2></section>')
    if defect:
        odr = 'https://ec.europa.eu/' + 'consumers' + '/' + 'odr'
        corp.append('<a href="' + odr + '">Platforma SOL</a>')
        corp.append('<p>Numarul nostru de inregistrare ca operator de date este 12345.</p>')
        corp.append('<script src="' + 'https://cdn.' + 'exemplu-tert.test' + '/urmarire.js"></script>')
        corp.append('<p>Prin ' + 'trimiterea formularului' + ' va dati ' + 'consimtamantul' + ' expres.</p>')
    corp.append('</body></html>')
    scrie(os.path.join(dosar, '.next', 'server', 'app', 'index.html'), ''.join(corp))


def controale():
    import shutil
    import tempfile
    temp = tempfile.mkdtemp(prefix='proba-juridic-')
    try:
        pozitiv = os.path.join(temp, 'defect')
        fabrica_arbore(pozitiv, defect=True)
        g, _ = analizeaza(pozitiv, 'staging')
        coduri = set(c for _, c, _ in g)
        for asteptat in ('L-09', 'L-10', 'C-01', 'L-05'):
            if asteptat not in coduri:
                return 'martorul pozitiv nu a fost prins pe ' + asteptat
        if any(sev != 'OPRESTE' for sev, c, _ in g if c in ('L-09', 'L-10', 'C-01')):
            return 'martorul pozitiv: o poarta de absenta a iesit ca avertisment, nu ca oprire'

        negativ = os.path.join(temp, 'curat')
        fabrica_arbore(negativ, defect=False)
        g2, _ = analizeaza(negativ, 'staging')
        if g2:
            return 'martorul negativ a fost prins: ' + '; '.join(c + ' ' + m[:90] for _, c, m in g2)

        # al treilea martor, cel care apara chiar mecanismul de mediu: acelasi
        # arbore curat, dar cu date de firma incomplete, trebuie sa fie AVERT pe
        # staging si OPRESTE la productie. Fara el, gradarea pe mediu e o intentie.
        # Este si martorul POZITIV al comutatorului: operator NUMIT cu un camp gol.
        pe_jumatate = os.path.join(temp, 'jumatate')
        fabrica_arbore(pe_jumatate, defect=False)
        cale_cfg = os.path.join(pe_jumatate, *CALE_OPERATOR)
        cfg = json.loads(citeste(cale_cfg))
        cfg['operator']['cod_fiscal'] = 'de completat'
        scrie(cale_cfg, json.dumps(cfg, ensure_ascii=False, indent=2) + '\n')
        gs, _ = analizeaza(pe_jumatate, 'staging')
        gp, _ = analizeaza(pe_jumatate, 'productie')
        if not any(c == 'L-01' and sev == AVERT for sev, c, _ in gs):
            return 'martorul de mediu: locul gol nu a iesit ca AVERT pe staging'
        if not any(c == 'L-01' and sev == OPRESTE for sev, c, _ in gp):
            return 'martorul de mediu: locul gol nu a OPRIT la productie'

        # Martorul NEGATIV al comutatorului: operator null si nicio data de firma in pagina.
        # L-01 nu are voie sa ceara nimic, pe niciun mediu; restul arborelui e cel curat.
        fara_operator = os.path.join(temp, 'fara-operator')
        fabrica_arbore(fara_operator, defect=False, cu_operator=False)
        for mediu in ('staging', 'productie'):
            gf, _ = analizeaza(fara_operator, mediu)
            if gf:
                return ('martorul fara operator (' + mediu + ') a fost prins: '
                        + '; '.join(c + ' ' + m[:90] for _, c, m in gf))

        # --- martorii L-15 conditionat de operator (felia seo-geo-gdpr, TEMEI_L15_FARA_OPERATOR) ---
        # NEGATIV: operator null si nicio pagina juridica. Nimic de cerut, pe niciun mediu.
        fara_rute_null = os.path.join(temp, 'fara-rute-null')
        fabrica_arbore(fara_rute_null, defect=False, cu_operator=False, cu_rute=False)
        for mediu in ('staging', 'productie'):
            gf, _ = analizeaza(fara_rute_null, mediu)
            if gf:
                return ('martorul L-15 fara operator (' + mediu + ') a fost prins: '
                        + '; '.join(c + ' ' + m[:90] for _, c, m in gf))
        # POZITIV: operator numit si nicio pagina juridica. L-15 AVERT pe staging, OPRESTE la productie.
        fara_rute_numit = os.path.join(temp, 'fara-rute-numit')
        fabrica_arbore(fara_rute_numit, defect=False, cu_rute=False)
        gs, _ = analizeaza(fara_rute_numit, 'staging')
        gp, _ = analizeaza(fara_rute_numit, 'productie')
        if not any(c == 'L-15' and sev == AVERT for sev, c, _ in gs):
            return 'martorul L-15 cu operator: paginile juridice lipsa nu au iesit AVERT pe staging'
        if not any(c == 'L-15' and sev == OPRESTE for sev, c, _ in gp):
            return 'martorul L-15 cu operator: paginile juridice lipsa nu au OPRIT la productie'

        # --- martorii politicii de cookie-uri ceruta dupa banner (felia seo-geo-gdpr, RUTA_COOKIE) ---
        def l15_cookie(gasiri, sev):
            return any(c == 'L-15' and s == sev and '/' + RUTA_COOKIE + ' ' in m for s, c, m in gasiri)
        # POZITIV: bannerul in HTML, fara pagina de cookie-uri. AVERT pe staging, OPRESTE la productie.
        banner_fara_cookie = os.path.join(temp, 'banner-fara-cookie')
        fabrica_arbore(banner_fara_cookie, defect=False, cu_banner=True)
        gs, _ = analizeaza(banner_fara_cookie, 'staging')
        gp, _ = analizeaza(banner_fara_cookie, 'productie')
        if not l15_cookie(gs, AVERT):
            return 'martorul politicii de cookie-uri: bannerul fara pagina nu a iesit AVERT pe staging'
        if not l15_cookie(gp, OPRESTE):
            return 'martorul politicii de cookie-uri: bannerul fara pagina nu a OPRIT la productie'
        # POZITIV: aceeasi cerinta cu operatorul null - regula tine de banner, nu de operator.
        banner_null = os.path.join(temp, 'banner-null')
        fabrica_arbore(banner_null, defect=False, cu_operator=False, cu_rute=False, cu_banner=True)
        gb, _ = analizeaza(banner_null, 'productie')
        if not l15_cookie(gb, OPRESTE):
            return 'martorul politicii de cookie-uri: cu operatorul null, bannerul fara pagina nu a OPRIT la productie'
        # NEGATIV: bannerul cu pagina de cookie-uri. Nicio constatare, pe niciun mediu.
        banner_cu_cookie = os.path.join(temp, 'banner-cu-cookie')
        fabrica_arbore(banner_cu_cookie, defect=False, cu_banner=True, cu_cookie=True)
        for mediu in ('staging', 'productie'):
            gc, _ = analizeaza(banner_cu_cookie, mediu)
            if gc:
                return ('martorul negativ al politicii de cookie-uri (' + mediu + ') a fost prins: '
                        + '; '.join(c + ' ' + m[:90] for _, c, m in gc))
        # NEGATIV: fara banner, pagina de cookie-uri nu se cere nici la productie (arborele curat).
        gn, _ = analizeaza(negativ, 'productie')
        if any(c == 'L-15' for _, c, _ in gn):
            return 'martorul negativ al politicii de cookie-uri: fara banner, L-15 a cerut ceva la productie'

        # --- martorii potrivirii pe CALEA INTREAGA a paginii construite (TIPARE_HTML_JURIDIC) ---
        # Constatarea criticului din 25.09.2026: pagina se cauta pe subsir in numele fisierului
        # construit, deci un articol de blog cu "cookies" in adresa stingea cerinta politicii de
        # cookie-uri, iar unul cu "termeni" si "confidentialitate" pe ale operatorului. Numele
        # articolelor se scriu din litere, nu din constante: martorul nu are voie sa se mute odata
        # cu o constanta gresita.
        def construita(radacina, rel, text='<html><body><p>Pagina</p></body></html>'):
            scrie(os.path.join(radacina, '.next', 'server', 'app', *rel.split('/')), text)
        # POZITIV: banner, fara politica de cookie-uri, plus un articol cu "cookies" in adresa.
        articol_cookie = os.path.join(temp, 'articol-cookie')
        fabrica_arbore(articol_cookie, defect=False, cu_operator=False, cu_rute=False, cu_banner=True)
        construita(articol_cookie, 'blog/ghid-cookies.html')
        ga, _ = analizeaza(articol_cookie, 'productie')
        if not l15_cookie(ga, OPRESTE):
            return ('martorul potrivirii pe cale: articolul blog/ghid-cookies.html a tinut loc de politica de '
                    'cookie-uri, iar bannerul fara politica nu a OPRIT la productie')
        # POZITIV: operator numit, fara pagini juridice, plus un articol cu ambele nume in adresa.
        articol_juridic = os.path.join(temp, 'articol-juridic')
        fabrica_arbore(articol_juridic, defect=False, cu_rute=False)
        construita(articol_juridic, 'blog/termeni-si-confidentialitate-explicate.html')
        gj, _ = analizeaza(articol_juridic, 'productie')
        for ruta in ('confidentialitate', 'termeni'):
            if not any(c == 'L-15' and s == OPRESTE and '/' + ruta + ' ' in m for s, c, m in gj):
                return ('martorul potrivirii pe cale: un articol cu "' + ruta + '" in adresa a tinut loc de pagina '
                        '/' + ruta + ' la productie')
        # NEGATIV: paginile construite la locul lor, fara fisier in sursa (de pilda dintr-un segment
        # dinamic sau dintr-un grup de rute). Nicio constatare L-15, pe niciun mediu.
        construite_la_loc = os.path.join(temp, 'construite-la-loc')
        fabrica_arbore(construite_la_loc, defect=False, cu_rute=False, cu_banner=True)
        for rel in ('juridic/confidentialitate.html', 'juridic/termeni.html', 'juridic/cookies.html'):
            construita(construite_la_loc, rel)
        for mediu in ('staging', 'productie'):
            gl, _ = analizeaza(construite_la_loc, mediu)
            if any(c == 'L-15' for _, c, _ in gl):
                return ('martorul negativ al potrivirii pe cale (' + mediu + '): paginile construite la locul lor '
                        'nu au fost recunoscute: ' + '; '.join(m[:90] for _, c, m in gl if c == 'L-15'))

        # --- martorii exceptiei C-01 pentru incarcatorul GA4 (felia seo-geo-gdpr) ---
        adresa_gtag = 'https://www.' + 'googletag' + 'manager.com/' + 'gtag' + '/js?id='
        cale_exceptata = next(iter(EXCEPTII_TERTI))
        # NEGATIV: numele stau numai in fisierul exceptat. Nicio constatare.
        exceptat = os.path.join(temp, 'exceptat')
        fabrica_arbore(exceptat, defect=False)
        scrie(os.path.join(exceptat, *cale_exceptata.split('/')), 'const A = "' + adresa_gtag + '";\n')
        ge, _ = analizeaza(exceptat, 'staging')
        if ge:
            return 'martorul negativ al exceptiei C-01 a fost prins: ' + '; '.join(c + ' ' + m[:90] for _, c, m in ge)
        # POZITIV 1: aceleasi nume in alt fisier din sursa. Exceptia nu se muta cu numele.
        alt_fisier = os.path.join(temp, 'alt-fisier')
        fabrica_arbore(alt_fisier, defect=False)
        scrie(os.path.join(alt_fisier, 'src', 'components', 'altundeva', 'analitica.ts'),
              'const A = "' + adresa_gtag + '";\n')
        ga, _ = analizeaza(alt_fisier, 'staging')
        if not any(c == 'C-01' and 'altundeva' in m for _, c, m in ga):
            return 'martorul pozitiv al exceptiei C-01: numele Google intr-un fisier neexceptat nu a fost prins'
        # POZITIV 2: fisierul exceptat exista, dar nu mai numeste nimic. Exceptie fara obiect.
        moarta = os.path.join(temp, 'exceptie-moarta')
        fabrica_arbore(moarta, defect=False)
        scrie(os.path.join(moarta, *cale_exceptata.split('/')), 'export const nimic = 1;\n')
        gm, _ = analizeaza(moarta, 'staging')
        if not any(c == 'C-01' and 'fara obiect' in m for _, c, m in gm):
            return 'martorul pozitiv al exceptiei C-01: exceptia fara obiect nu a fost raportata'
        # POZITIV 3: HTML-ul construit nu are exceptii. Un incarcator INLINE in pagina, care pune
        # scriptul Google fara atribut `src` in HTML, il vede numai cautarea pe nume - deci martorul
        # asta dovedeste ca exceptia nu s-a intins pe HTML. Masurat pe mutant: cu un script static
        # (`<script src=...>`) martorul trecea si cu exceptia intinsa, fiindca il prindea alta ramura.
        inline = os.path.join(temp, 'html-inline')
        fabrica_arbore(inline, defect=False)
        scrie(os.path.join(inline, *cale_exceptata.split('/')), 'const A = "' + adresa_gtag + '";\n')
        cale_html = os.path.join(inline, '.next', 'server', 'app', 'index.html')
        scrie(cale_html, citeste(cale_html).replace(
            '</body>', '<script>var s=document.createElement("script");s.src="' + adresa_gtag
            + 'G-' + 'PROBA3S01";document.head.appendChild(s)</script></body>'))
        gi, _ = analizeaza(inline, 'staging')
        if not any(c == 'C-01' and 'index.html' in m and 'furnizorul tert' in m for _, c, m in gi):
            return 'martorul pozitiv al exceptiei C-01: incarcatorul Google inline din HTML nu a fost prins'
        # POZITIV 4: scriptul Google static in HTML, langa fisierul exceptat: il prinde ramura resurselor.
        static = os.path.join(temp, 'html-static')
        fabrica_arbore(static, defect=False)
        scrie(os.path.join(static, *cale_exceptata.split('/')), 'const A = "' + adresa_gtag + '";\n')
        cale_html = os.path.join(static, '.next', 'server', 'app', 'index.html')
        scrie(cale_html, citeste(cale_html).replace(
            '</body>', '<script async src="' + adresa_gtag + 'G-' + 'PROBA3S01"></script></body>'))
        gh, _ = analizeaza(static, 'staging')
        if not any(c == 'C-01' and 'index.html' in m and 'incarcata de la tertul' in m for _, c, m in gh):
            return 'martorul pozitiv al exceptiei C-01: scriptul Google static din HTML nu a fost prins'

        # --- martorii L-10 pe identificator (felia 72) ---
        # NEGATIV: cheia registrului comertului si o proprietate `operator`, ca in codul unei pagini.
        # Pozitivul (propozitia vizibila) e in martorul pozitiv de la inceput.
        cod_sursa = 'randuri.push(["IDNO", campFirma(c, "numar' + '_orc")], ["Firma", c.oper' + 'ator.denumire]);'
        if cauta_absenta([('martor.ts', normalizeaza(cod_sursa))], [(TIPAR_OPERATOR, 'numar langa operator')],
                         'L-10', TEMEI_OPERATOR, 'martor'):
            return 'martorul negativ L-10: un identificator de cod a fost luat drept numar de operator'

        # --- martorii C-01 dupa `rel` (felia 72): canonical si alternate nu incarca nimic ---
        def cu_head(radacina, element):
            cale = os.path.join(radacina, '.next', 'server', 'app', 'index.html')
            scrie(cale, citeste(cale).replace('<html><body>', '<html><head>' + element + '</head><body>'))
        straina = 'https://gazda-' + 'straina.test/pagina'
        rel_negativ = os.path.join(temp, 'rel-negativ')
        fabrica_arbore(rel_negativ, defect=False)
        cu_head(rel_negativ, '<link rel="canonical" href="' + straina + '"/><link rel="alternate" hreflang="en" '
                'href="' + straina + '"/>')
        gr, _ = analizeaza(rel_negativ, 'productie')
        if any(c == 'C-01' for _, c, _ in gr):
            return 'martorul negativ C-01: canonical sau alternate spre alta gazda a fost numarat drept resursa'
        for rel in ('alternate stylesheet', 'preconnect'):
            rel_pozitiv = os.path.join(temp, 'rel-' + rel.replace(' ', '-'))
            fabrica_arbore(rel_pozitiv, defect=False)
            cu_head(rel_pozitiv, '<link rel="' + rel + '" href="' + straina + '"/>')
            gr, _ = analizeaza(rel_pozitiv, 'staging')
            if not any(c == 'C-01' for _, c, _ in gr):
                return 'martorul pozitiv C-01: <link rel="' + rel + '"> spre un tert nu a fost prins'

        # --- martorii mediului: OPERATOR_JSON vine numai din dictionarul primit (felia 72) ---
        # POZITIV: fisierul pe null, operator incomplet numai in mediu -> L-01 il vede.
        incomplet = {'operator': {'denumire': 'Trei S Arhivare SRL', 'sediu': '', 'email': 'contact@exemplu-3s.test'}}
        gm, _ = analizeaza(fara_operator, 'staging', {VARIABILA_OPERATOR: json.dumps(incomplet)})
        if not any(c == 'L-01' and sev == AVERT and VARIABILA_OPERATOR in m for sev, c, m in gm):
            return 'martorul mediului: operatorul din ' + VARIABILA_OPERATOR + ' nu a fost citit'
        # NEGATIV: fisierul numeste operatorul, mediul spune null -> nimic de cerut, nici la productie.
        gm, _ = analizeaza(negativ, 'productie', {VARIABILA_OPERATOR: '{"operator": null}'})
        if any(c in ('L-01', 'L-15') for _, c, _ in gm):
            return 'martorul mediului: {"operator": null} din mediu nu a avut prioritate fata de fisier'
        # NEGATIV: variabila goala inseamna nesetata (decide fisierul): arborele curat ramane curat.
        gm, _ = analizeaza(negativ, 'productie', {VARIABILA_OPERATOR: '  '})
        if gm:
            return 'martorul mediului: o variabila goala a schimbat verdictul fisierului'

        # --- martorii J-01: marcajele din paginile juridice (felia 72) ---
        marcaje = os.path.join(temp, 'marcaje')
        fabrica_arbore(marcaje, defect=False, cu_rute=False)
        admis = next(iter(MARCAJE_ADMISE))
        construita(marcaje, 'juridic/termeni.html', '<html><body><p>Sediul: [sediul ' + 'firmei, de ' + 'aflat]</p>'
                   '<p>' + admis + '</p><p><a href="/juridic/confidentialitate">[Politica]</a></p></body></html>')
        construita(marcaje, 'juridic/confidentialitate.html', '<html><body><p>' + admis + '</p></body></html>')
        gs, _ = analizeaza(marcaje, 'staging')
        gp, _ = analizeaza(marcaje, 'productie')
        j01 = [m for _, c, m in gp if c == 'J-01']
        if not any(c == 'J-01' and sev == AVERT for sev, c, _ in gs) or len(j01) != 1 or 'termeni' not in j01[0] \
                or not any(c == 'J-01' and sev == OPRESTE for sev, c, _ in gp):
            return ('martorii J-01: un marcaj fara decizie trebuie sa iasa o data, AVERT pe staging si OPRESTE la '
                    'productie, iar cel admis si legatura nu: ' + '; '.join(j01))
        acolade = os.path.join(temp, 'acolade')
        fabrica_arbore(acolade, defect=False)
        construita(acolade, 'despre.html', '<html><body><p>Vezi ' + '{' * 2 + 'cale:termeni' + '}' * 2 + '</p></body></html>')
        ga, _ = analizeaza(acolade, 'staging')
        if not any(c == 'J-01' and sev == OPRESTE for sev, c, _ in ga):
            return 'martorul J-01: acoladele duble din HTML-ul construit nu au OPRIT pe staging'

        # al patrulea martor: prospetimea build-ului. Arborele curat de mai sus are
        # HTML-ul scris ULTIMUL, deci proaspat - nu trebuie raportat invechit. Acelasi
        # arbore cu HTML-ul imbatranit cu o ora trebuie raportat invechit.
        if build_invechit(negativ):
            return 'martorul de prospetime: un build proaspat a fost raportat invechit'
        html = os.path.join(negativ, '.next', 'server', 'app', 'index.html')
        batran = os.path.getmtime(html) - 3600
        os.utime(html, (batran, batran))
        if not build_invechit(negativ):
            return 'martorul de prospetime: un build mai vechi decat sursa a trecut ca proaspat'
        return None
    finally:
        shutil.rmtree(temp, ignore_errors=True)


def main():
    p = argparse.ArgumentParser(description='Poarta juridica (L-01, L-05, L-09, L-10, L-15, C-01).')
    p.add_argument('--radacina', default=RADACINA_IMPLICITA)
    p.add_argument('--mediu', choices=('staging', 'productie'),
                   default=('productie' if os.environ.get('SITE_ENV') == 'productie' else 'staging'),
                   help='la productie, locurile goale OPRESC in loc sa avertizeze')
    a = p.parse_args()
    # Mediul procesului, citit O SINGURA DATA, aici, si transmis ca parametru. Martorii din controale()
    # nu il vad: pe o rulare cu profilul 3s.md (OPERATOR_JSON setata), martorul "fara operator" ar vedea
    # altfel operatorul din mediu, iar poarta ar iesi 3 pe orice arbore.
    mediu_proces = {VARIABILA_OPERATOR: os.environ.get(VARIABILA_OPERATOR)}

    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    radacina = os.path.abspath(a.radacina)
    if build_invechit(radacina):
        print('poarta-juridic: HTML-ul construit e mai vechi decat sursa - as masura un site '
              'care nu mai exista. Ruleaza pnpm build.', file=sys.stderr)
        return 3
    gasiri, numar = analizeaza(radacina, a.mediu, mediu_proces)
    if numar == 0:
        print('poarta-juridic: niciun fisier de citit - masuratoarea e invalida, nu curata', file=sys.stderr)
        return 3

    opreste = [g for g in gasiri if g[0] == OPRESTE]
    avert = [g for g in gasiri if g[0] == AVERT]
    for sev, cod, mesaj in opreste:
        print('OPRESTE  ' + cod + '  ' + mesaj)
    for sev, cod, mesaj in avert:
        print('AVERT    ' + cod + '  ' + mesaj)

    print('CONTROALE: martor pozitiv OK, martor negativ OK, martor de mediu OK, martor fara operator OK, '
          'martori L-15 dupa operator OK, martori L-15 politica de cookie-uri dupa banner OK, '
          'martori L-15 pe calea intreaga a paginii OK, martori exceptie C-01 OK, martor L-10 pe identificator OK, '
          'martori C-01 dupa rel OK, martori OPERATOR_JSON OK, martori J-01 OK')
    print('MEDIU: ' + a.mediu + ' (la productie, avertismentele de mai sus devin opriri)')
    stare, date, sursa, cfg = stare_operator(radacina, mediu_proces)
    print('operator: ' + stare + ', din ' + sursa)
    if stare == 'null':
        # Tiparit la fiecare rulare, ca verdele sa nu fie citit drept "firma e identificata".
        print('L-01: NU SE APLICA - ' + sursa + ' are "operator": null; '
              'datele de identificare se cer din ziua in care operatorul e numit | TEMEI: ' + TEMEI_FARA_OPERATOR)
        # La fel pentru L-15: verde nu inseamna "politicile sunt publicate".
        print('L-15: NU SE APLICA - fara operator paginile juridice nu se publica | TEMEI: ' + TEMEI_L15_FARA_OPERATOR)
    else:
        print('L-01: se aplica - operator: ' + stare)
        print('L-15: se aplica - operator: ' + stare)
    if stare == 'numit':
        if familie_din_tara(date.get('tara')) == 'md':
            print('familie juridica: md (tara ' + str(date.get('tara')) + '); datele se cer pe pagina de informatii '
                  'legale din fiecare limba publicata, pe fiecare pagina o legatura spre ea in romana | TEMEI: '
                  + TEMEI_IDENTITATE_MD)
        else:
            print('familie juridica: SEE sau nedeclarata (tara ' + json.dumps(date.get('tara'), ensure_ascii=False)
                  + '); datele se cer pe fiecare pagina | TEMEI: ' + TEMEI_IDENTITATE)
    if isinstance(cfg, dict) and cfg.get('model') == 'D2':
        # Linie separata la fiecare rulare: verdele nu inseamna "firma e identificata".
        print('model D2: aprins din ' + sursa + '; campurile cu marcajul decis ies AVERT pe orice mediu, '
              'firma NU e identificata din extras; modelul iese din configurare in ziua extrasului')
    cu_banner = pagini_cu_banner([(c, citeste(c)) for c in fisiere_construite(radacina)])
    if cu_banner:
        print('L-15 /' + RUTA_COOKIE + ': se aplica - bannerul de consimtamant e in ' + str(len(cu_banner))
              + ' pagina(i) construita(e)')
    else:
        print('L-15 /' + RUTA_COOKIE + ': NU SE APLICA - bannerul de consimtamant nu e in HTML-ul construit '
              '(nimic de consimtit)')
    for cale, (nume_scutite, _) in sorted(EXCEPTII_TERTI.items()):
        print('C-01: exceptie pe sursa, numai pentru ' + cale + ' (' + ', '.join(nume_scutite)
              + '); HTML-ul construit nu are exceptii')
    print('SURSA: ' + str(numar) + ' fisier(e), sursa plus HTML construit')
    print('DEFECTE JURIDICE: ' + str(len(opreste)) + ' care opresc, ' + str(len(avert)) + ' de avertisment')
    return 1 if opreste else 0


if __name__ == '__main__':
    sys.exit(main())

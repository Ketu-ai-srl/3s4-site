#!/usr/bin/env python3
"""Poarta de rute: manifestul si sistemul de fisiere trebuie sa spuna acelasi lucru.

De ce exista, si de cand. Pe 5 sep 2026 o revizuire a masurat gaura: `src/content/rute.ts`
se declara "singurul loc din care se afla ce pagini exista pe site", dar nimic nu o obliga.
Revizorul a creat `src/app/proba-revizor/page.tsx` cu titlu, descriere si canonical proprii -
adica pasul 1 al instructiunilor din manifest facut corect, pasul 2 omis - si a masurat:

    EXIT POARTA = 0 · POARTA_3S_TOTUL_VERDE
    probe de browser: 22 (de la 17) - deci portile CHIAR au vizitat pagina si au aprobat-o
    aparitii in sitemap.xml: 0

Pagina era servita, testata si declarata buna, iar harta de site, meniul, subsolul si pagina
de 404 nu stiau ca exista. Zero legaturi catre ea din tot site-ul. Directia inversa - o
intrare in manifest fara pagina - producea legatura moarta pe FIECARE pagina, fiindca meniul
sta in layout; aceea era prinsa de poarta de legaturi, dar abia dupa ce ajungea in build.

CE VERIFICA, in ambele directii:
  RU-01  fiecare `page.tsx` din `src/app` are o intrare in `RUTE`
         (altfel pagina exista, e indexabila, si nimic nu duce la ea)
  RU-02  fiecare intrare din `RUTE` are un `page.tsx`
         (altfel meniul din layout produce o legatura moarta pe tot site-ul)

PE EDITIE (fundatia editiilor, `src/lib/editii.ts`). Acelasi arbore `src/app` tine mai multe
site-uri: cel romanesc (`page.tsx`), cel international (`page.en.tsx` sub grupul `(en)`) si romana
pentru Republica Moldova (`page.romd.tsx` sub `(romd)`); fiecare build il construieste numai pe al lui,
dupa `pageExtensions`. Manifestul e si el pe editie: `src/content/rute.ts` (ro-RO),
`src/content/rute-en*.ts` (en), `src/content/rute-ro-md.ts` (ro-MD). RU-01 si RU-02 se masoara pe
fiecare editie, cu fisierele ei. In plus:
  RU-03  un fisier special al rutelor (page, layout, route, not-found, ...) cu extensie SIMPLA
         (`.tsx`, `.ts`, `.md`, ...) sub `(en)` sau `(romd)`. Pe build-ul romanesc `tsx` e extensie de
         pagina, deci un `page.tsx` pus acolo devine pagina ROMANEASCA la adresa grupului (masurat pe
         spike: `(en)/control/page.tsx` a aparut pe build-ul RO ca `/control`); pe build-ul
         international nu exista deloc. Niciuna din cele doua nu e ce a vrut autorul.
  RU-04  un `page.en.tsx` in afara grupului `(en)`, sau un `page.romd.tsx` in afara lui `(romd)`:
         pe build-ul international n-ar avea layout radacina.
  Un fisier `src/content/rute-*.ts` care nu e al niciunei editii iese NEMASURAT (3): rutele lui nu
  le-ar citi nimeni.

CONTROALE la fiecare rulare, pe arbori fabricati in memorie:
  - martor pozitiv A: pagina fara intrare in manifest TREBUIE prinsa;
  - martor pozitiv B: intrare in manifest fara pagina TREBUIE prinsa;
  - martor negativ: multimi identice NU trebuie sa produca nimic.
  - martor pozitiv EN: un `page.en.tsx` fara intrare in manifestul `en` TREBUIE prins (RU-01);
  - martor CAP LA CAP pe un arbore scris in temp: `page.tsx` sub `(en)` TREBUIE prins (RU-03),
    `page.en.tsx` in afara lui `(en)` TREBUIE prins (RU-04), `page.en.tsx` sub `(en)` cu intrare in
    `rute-en-*.ts` NU, iar extragerea pe editie da exact multimile scrise.
Daca vreunul cade, verdictul e NEMASURAT (iesire 3), nu "curat".

CE NU VERIFICA (reziduuri)
Intrebarea pe care o pune de fapt: "coincid doua multimi de siruri - caile citite din
manifest si caile deduse din arborele de fisiere?" Nu "e pagina accesibila".
  - O ruta prezenta in ambele multimi, dar cu inMeniu si inHarta false, e VERDE si totusi nu
    e legata de nicaieri. Asta e deliberat: sunt decizii editoriale.
  - Segmentele dinamice si grupurile de rute se sar; un subarbore dinamic intreg ramane
    nemasurat, in ambele directii.
  - Manifestul se citeste cu un tipar pe campul de cale. O cale compusa din bucati, dintr-o
    variabila sau dintr-o constanta nu se vede.
  - Se numara doar fisierele de pagina. Un manipulator de ruta care serveste o adresa nu e
    ruta pentru poarta asta.
  - Sitemap-ul, meniul si subsolul nu se citesc. Simptomul din incident - zero aparitii in
    sitemap - se DEDUCE din manifest, nu se masoara.

LA ROSU: CE AI VOIE SA EDITEZI
  DA  intrarea din src/content/rute.ts, sau fisierul de pagina care lipseste.
  NU  TIPAR_CALE, sarirea grupurilor si a segmentelor dinamice din rute_din_fisiere,
      compara(), controale().

IESIRE: 0 curat - 1 nepotriviri - 2 folosire gresita - 3 control picat
"""
import io
import os
import re
import shutil
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MANIFEST = os.path.join(RADACINA, 'src', 'content', 'rute.ts')
DOSAR_CONTINUT = os.path.join(RADACINA, 'src', 'content')
DOSAR_APP = os.path.join(RADACINA, 'src', 'app')

# Editiile (catalogul din `src/lib/editii.ts`): extensia paginilor si grupul de rute care le tine.
EDITII = ('ro-RO', 'en', 'ro-MD')
SUFIX_EDITIE = {'en': 'en.tsx', 'ro-MD': 'romd.tsx'}
GRUP_EDITIE = {'en': '(en)', 'ro-MD': '(romd)'}
# Fisierele speciale ale rutelor in App Router: cu o extensie simpla sub un grup de editie, ar fi
# ale site-ului romanesc (RU-03).
SPECIALE = ('page', 'layout', 'route', 'template', 'default', 'loading', 'error', 'not-found')
EXTENSII_SIMPLE = ('tsx', 'ts', 'jsx', 'js', 'md', 'mdx')

# `cale:` prinde numai intrarile din RUTE. Ancorele paginii de start au camp `ancora`,
# iar `ADRESA_BAZA` si `CALE_DISCUTIE` sunt constante, nu campuri - deci raman afara.
TIPAR_CALE = re.compile(r'\bcale:\s*"([^"]+)"')


def rute_din_manifest(text):
    return sorted(set(TIPAR_CALE.findall(text)))


def editia_manifestului(nume):
    """Editia unui fisier de manifest dupa nume, sau None cand numele nu e al niciunei editii."""
    if nume == 'rute.ts':
        return 'ro-RO'
    if nume == 'rute-en.ts' or (nume.startswith('rute-en-') and nume.endswith('.ts')):
        return 'en'
    if nume == 'rute-ro-md.ts':
        return 'ro-MD'
    return None


def manifeste_pe_editie(dosar_continut):
    """({editie: cai sortate}, [fisiere rute-*.ts fara editie]), din toate fisierele `rute*.ts`."""
    pe_editie = {e: set() for e in EDITII}
    straine = []
    for nume in sorted(os.listdir(dosar_continut)):
        if not nume.endswith('.ts') or not (nume == 'rute.ts' or nume.startswith('rute-')):
            continue
        editie = editia_manifestului(nume)
        if editie is None:
            straine.append(nume)
            continue
        text = io.open(os.path.join(dosar_continut, nume), encoding='utf-8').read()
        pe_editie[editie].update(TIPAR_CALE.findall(text))
    return {e: sorted(c) for e, c in pe_editie.items()}, straine


def _cale_publica(rel):
    """Directorul relativ (cu `/`) -> calea publica, sau None pentru un segment dinamic."""
    if rel == '.':
        return '/'
    segmente = [s for s in rel.split('/') if not (s.startswith('(') and s.endswith(')'))]
    if any(s.startswith('[') for s in segmente):
        return None
    return '/' + '/'.join(segmente) if segmente else '/'


def rute_si_refuzuri(dosar):
    """({editie: rutele reale}, [(cod, mesaj)] pentru RU-03 si RU-04).

    Rutele reale ale unei editii sunt fisierele ei de pagina: `page.tsx` / `page.mdx` pentru ro-RO,
    `page.en.tsx` pentru en, `page.romd.tsx` pentru ro-MD. Se sar segmentele care nu produc o
    adresa proprie: grupurile de rute `(nume)`, care exista doar ca sa imparta un layout, si
    segmentele dinamice `[param]`, care n-au o cale fixa de pus in manifest.
    """
    gasite = {e: set() for e in EDITII}
    refuzuri = []
    for radacina, directoare, nume in os.walk(dosar):
        directoare[:] = [d for d in directoare if d not in ('node_modules', '__pycache__')]
        rel = os.path.relpath(radacina, dosar).replace(os.sep, '/')
        grupuri = set(s for s in rel.split('/') if s.startswith('(') and s.endswith(')'))
        sub_editie = sorted(grupuri & set(GRUP_EDITIE.values()))
        for fisier in sorted(nume):
            baza, _, ext = fisier.partition('.')
            if baza not in SPECIALE:
                continue
            unde = ('src/app/' + rel + '/' if rel != '.' else 'src/app/') + fisier
            if ext in EXTENSII_SIMPLE and sub_editie:
                corect = baza + '.' + ('en.tsx' if '(en)' in sub_editie else 'romd.tsx')
                refuzuri.append(('RU-03', '`' + unde + '` are extensie simpla sub ' + ', '.join(sub_editie) +
                                 ': pe build-ul romanesc devine ruta ROMANEASCA la adresa grupului, iar pe '
                                 'cel international nu exista; fisierul editiei se scrie `' + corect + '`'))
                continue
            if baza != 'page':
                continue
            if ext in ('tsx', 'mdx'):
                editie = 'ro-RO'
            else:
                editie = next((e for e, s in SUFIX_EDITIE.items() if ext == s), None)
            if editie is None:
                continue
            if editie != 'ro-RO' and GRUP_EDITIE[editie] not in grupuri:
                refuzuri.append(('RU-04', '`' + unde + '` e pagina editiei ' + editie + ' in afara grupului ' +
                                 GRUP_EDITIE[editie] + ': pe build-ul international n-ar avea layout radacina'))
                continue
            cale = _cale_publica(rel)
            if cale is not None:
                gasite[editie].add(cale)
    return {e: sorted(c) for e, c in gasite.items()}, refuzuri


def rute_din_fisiere(dosar):
    """Rutele reale ale site-ului romanesc (forma de dinainte de editii)."""
    return rute_si_refuzuri(dosar)[0]['ro-RO']


def compara(manifest, fisiere, editie='ro-RO'):
    """Intoarce lista de (cod, mesaj). Goala = cele doua multimi coincid."""
    gasiri = []
    pagina = 'page.tsx' if editie == 'ro-RO' else 'page.' + SUFIX_EDITIE[editie]
    unde = 'RUTE' if editie == 'ro-RO' else 'manifestul editiei ' + editie
    for r in fisiere:
        if r not in manifest:
            gasiri.append(('RU-01', 'pagina `' + r + '` (' + pagina + ') exista in src/app dar NU e in ' + unde +
                                    ': e servita si indexabila, dar nimic din site nu duce la ea '
                                    '(nici meniul, nici subsolul, nici sitemap.xml, nici 404)'))
    for r in manifest:
        if r not in fisiere:
            gasiri.append(('RU-02', 'ruta `' + r + '` e in ' + unde + ' dar nu are ' + pagina + ': meniul sta in '
                                    'layout, deci ar produce o legatura moarta pe FIECARE pagina'))
    return gasiri


def controale():
    a = compara(['/'], ['/', '/proba'])
    if not any(c == 'RU-01' for c, _ in a):
        return 'martorul pozitiv A: o pagina lipsa din manifest nu a fost prinsa'
    b = compara(['/', '/promisa'], ['/'])
    if not any(c == 'RU-02' for c, _ in b):
        return 'martorul pozitiv B: o intrare din manifest fara pagina nu a fost prinsa'
    if compara(['/', '/solutii'], ['/solutii', '/']):
        return 'martorul negativ: doua multimi identice au produs constatari (ordinea nu conteaza)'
    # Si un control peste EXTRAGERE, nu doar peste comparatie: fara el, poarta ar putea
    # iesi curata fiindca nu a citit nicio ruta din manifest.
    fals_manifest = 'export const RUTE = [\n  { cale: "/", inMeniu: false },\n' \
                    '  { cale: "/contact", inMeniu: true },\n];\n' \
                    'export const CALE_DISCUTIE = "/#discutie";\n'
    citite = rute_din_manifest(fals_manifest)
    if citite != ['/', '/contact']:
        return ('martorul de extragere: din manifestul de proba am citit ' + repr(citite) +
                ' in loc de ' + repr(['/', '/contact']))
    en = compara([], ['/pricing'], 'en')
    if not any(c == 'RU-01' for c, _ in en):
        return 'martorul pozitiv EN: o pagina page.en.tsx fara intrare in manifestul en nu a fost prinsa'
    return martor_cap_la_cap()


def gasiri_pe_editii(manifeste, fisiere, refuzuri):
    """Toate constatarile: refuzurile RU-03/RU-04, apoi RU-01/RU-02 pe fiecare editie."""
    gasiri = list(refuzuri)
    for editie in EDITII:
        gasiri.extend(compara(manifeste[editie], fisiere[editie], editie))
    return gasiri


def martor_cap_la_cap():
    """Martor pe un arbore scris pe DISC, prin aceleasi functii prin care trece arborele real.

    Fara el, extragerea pe editie (`rute_si_refuzuri`, `manifeste_pe_editie`) n-ar fi atinsa de niciun
    martor: un `rute_si_refuzuri` care n-ar mai vedea grupurile sau sufixele ar sterge tacut RU-03 si
    toata editia en, cu poarta iesind 0.
    """
    lucru = tempfile.mkdtemp(prefix='poarta-rute-')

    def scrie(rel, continut):
        cale = os.path.join(lucru, *rel.split('/'))
        if not os.path.isdir(os.path.dirname(cale)):
            os.makedirs(os.path.dirname(cale))
        io.open(cale, 'w', encoding='utf-8', newline='\n').write(continut)

    try:
        scrie('src/content/rute.ts', 'const RUTE_RO_RO = [\n  { cale: "/" },\n];\n')
        scrie('src/content/rute-en-proba.ts', 'export const RUTE_EN_PROBA = [\n  { cale: "/pricing" },\n];\n')
        scrie('src/content/rute-ro-md.ts', 'export const RUTE_RO_MD = [];\n')
        scrie('src/app/page.tsx', 'x')
        scrie('src/app/(en)/layout.en.tsx', 'x')
        scrie('src/app/(en)/pricing/page.en.tsx', 'x')
        scrie('src/app/(en)/scapata/page.tsx', 'x')
        scrie('src/app/despre/page.en.tsx', 'x')
        scrie('src/app/(en)/fara-intrare/page.en.tsx', 'x')
        manifeste, straine = manifeste_pe_editie(os.path.join(lucru, 'src', 'content'))
        if manifeste != {'ro-RO': ['/'], 'en': ['/pricing'], 'ro-MD': []} or straine:
            return ('martorul cap la cap: manifestele pe editie citite gresit (' + repr(manifeste) + ', ' +
                    repr(straine) + ')')
        fisiere, refuzuri = rute_si_refuzuri(os.path.join(lucru, 'src', 'app'))
        if fisiere != {'ro-RO': ['/'], 'en': ['/fara-intrare', '/pricing'], 'ro-MD': []}:
            return 'martorul cap la cap: paginile pe editie citite gresit (' + repr(fisiere) + ')'
        coduri = sorted(c for c, _ in refuzuri)
        if coduri != ['RU-03', 'RU-04']:
            return ('martorul cap la cap: asteptam RU-03 (page.tsx sub (en)) si RU-04 (page.en.tsx in afara '
                    'lui (en)), si am primit ' + repr(refuzuri))
        if not any('scapata/page.tsx' in m for c, m in refuzuri if c == 'RU-03'):
            return 'martorul cap la cap: RU-03 nu numeste fisierul de sub (en)'
        gasiri = gasiri_pe_editii(manifeste, fisiere, refuzuri)
        en = [m for c, m in gasiri if c in ('RU-01', 'RU-02')]
        if len(en) != 1 or '/fara-intrare' not in en[0]:
            return ('martorul cap la cap: pe editia en asteptam un singur RU-01, pentru `/fara-intrare` (pagina fara '
                    'intrare), iar `/pricing` (cu intrare in rute-en-*.ts) tacut; am primit ' + repr(en))
    finally:
        shutil.rmtree(lucru, ignore_errors=True)
    return None


def main():
    motiv = controale()
    if motiv:
        print('CONTROL PICAT: ' + motiv, file=sys.stderr)
        return 3

    if not os.path.isfile(MANIFEST):
        print('poarta-rute: lipseste ' + os.path.relpath(MANIFEST, RADACINA), file=sys.stderr)
        return 3
    if not os.path.isdir(DOSAR_APP):
        print('poarta-rute: lipseste src/app - masuratoarea e invalida', file=sys.stderr)
        return 3

    manifeste, straine = manifeste_pe_editie(DOSAR_CONTINUT)
    if straine:
        print('poarta-rute: ' + ', '.join('src/content/' + s for s in straine) + ' nu e manifestul niciunei '
              'editii (rute.ts, rute-en*.ts, rute-ro-md.ts) - rutele lui nu le citeste nimeni; NEMASURAT',
              file=sys.stderr)
        return 3
    fisiere, refuzuri = rute_si_refuzuri(DOSAR_APP)
    manifest = manifeste['ro-RO']
    if not manifest or not fisiere['ro-RO']:
        print('poarta-rute: una dintre multimi e goala (manifest ' + str(len(manifest)) +
              ', fisiere ' + str(len(fisiere['ro-RO'])) + ') - NEMASURAT, nu curat', file=sys.stderr)
        return 3

    gasiri = gasiri_pe_editii(manifeste, fisiere, refuzuri)
    for cod, mesaj in gasiri:
        print('OPRESTE  ' + cod + '  ' + mesaj)

    print('CONTROALE: martor pozitiv A OK, martor pozitiv B OK, martor negativ OK, extragere OK, '
          'martor pozitiv EN OK, martor cap la cap pe editii (RU-03, RU-04, extragere) OK')
    print('MANIFEST: ' + ' · '.join(e + ' ' + str(len(manifeste[e])) for e in EDITII) + ' rute · FISIERE: ' +
          ' · '.join(e + ' ' + str(len(fisiere[e])) for e in EDITII) + ' pagini')
    print('NEPOTRIVIRI: ' + str(len(gasiri)))
    return 1 if gasiri else 0


if __name__ == '__main__':
    sys.exit(main())

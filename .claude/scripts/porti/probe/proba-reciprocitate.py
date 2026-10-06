#!/usr/bin/env python3
"""Proba portii de reciprocitate hreflang (`poarta-reciprocitate.py`), rulata ca PROCES pe arbori fabricati.

Ce masoara, pe langa controalele din poarta (care probeaza logica in acelasi proces):
  - codul de iesire si mesajul pe fiecare clasa: pereche scoasa (R-01), tinta fara pagina (R-02), pagina fara
    auto-referinta (R-03), pagina din echivalente fara pereche (R-04), alternate pe build-ul ro-RO (R-05);
  - ca profilul se citeste din BUILD (`.next/required-server-files.json`), nu din mediu: acelasi HTML cu
    alternate iese 0 cu profilul 3s.md si 1 cu profilul ro-RO, oricare ar fi `SITE_EDITII` din shell;
  - codul 3 pe: build lipsa, build mai vechi decat src/, profil necitibil, tinta pe alt domeniu si un
    control stricat pe o COPIE a portii (mutant);
  - modul `--intre-domenii`, pe doua colectii fabricate (formatul lui `colecteaza-build.mjs`) cu profilurile lor:
    grupul comun reciproc pe trei capete iese 0; profilul unui capat fara `ro-RO` in lista iese 1 (R-01, R-08); copia
    engleza a asezarii `ro` cu hreflang sau cu canonical pe ea insasi iese 1 (R-07); colectie lipsa, profil cu alta
    origine si asezari din sursa diferite de copia portii ies 3; controalele R-06 si R-07 dezarmate pe o COPIE ies 3.
    Copia lui `src/lib/asezare.ts` din arbore e fisierul REAL, deci proba masoara si citirea lui.

Catalogul editiilor din arbori e COPIA fisierului real `src/lib/editii.ts`: poarta il compara cu lista ei, deci
proba masoara si citirea lui. Fixturile HTML se asambleaza la RULARE, din bucati.

`--poarta <cale>` ruleaza proba pe alta copie a portii (de exemplu un mutant, ca sa vezi ca proba il respinge).
Implicit: poarta de langa directorul probelor.

IESIRE: 0 toate cazurile trec - 1 macar unul pica - 3 preconditie lipsa (poarta sau catalogul nu exista)
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

AICI = os.path.dirname(os.path.abspath(__file__))
PORTI = os.path.dirname(AICI)
RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(PORTI)))
CATALOG = os.path.join(RADACINA, 'src', 'lib', 'editii.ts')
CURAT, PICAT, NEMASURAT = 0, 1, 3

T = P = 0
POARTA = os.path.join(PORTI, 'poarta-reciprocitate.py')

BAZA = 'https://' + 'proba-' + 'reciproc.test'
ALT_DOMENIU = 'https://' + 'alt-' + 'domeniu.test'
X = 'x-' + 'default'


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


# ------------------------------------------------------------------ fixturi

def pagina(cale, alternate):
    adresa = BAZA + ('' if cale == '/' else cale)
    bucati = ['<html><head><link rel="canonical" href="' + adresa + '"/>']
    for h, u in alternate:
        bucati.append('<link rel="alternate" hrefLang="' + h + '" href="' + u + '"/>')
    bucati.append('</head><body><h1>x</h1></body></html>')
    return ''.join(bucati)


def pereche(fara_inversa=False, alt_domeniu=False, tinta_lipsa=False, fara_auto=False):
    """Doua pagini juridice in pereche (en, ro-MD, x-default) si o pagina EN fara pereche."""
    en, ro = BAZA + '/legal/doc', BAZA + '/ro/juridic/doc'
    alt_en = [('en', en), ('ro-MD', ro), (X, en)]
    alt_ro = [('ro-MD', ro), ('en', en), (X, en)]
    if fara_inversa:
        alt_ro = [p for p in alt_ro if p[0] != 'en']
    if alt_domeniu:
        alt_en.append(('ro-RO', ALT_DOMENIU + '/juridic/doc'))
    if tinta_lipsa:
        alt_en.append(('fr', BAZA + '/fr/doc'))
    if fara_auto:
        alt_en = [p for p in alt_en if p[0] != 'en']
    return {
        'legal/doc.html': pagina('/legal/doc', alt_en),
        'ro/juridic/doc.html': pagina('/ro/juridic/doc', alt_ro),
        'index.html': pagina('/', [('en', BAZA), (X, BAZA)]),
    }


def echivalente(intrari):
    randuri = ['export const ECHIVALENTE: Readonly<Record<string, CaiPeEditie>> = {']
    for cheie, cai in intrari.items():
        randuri.append('  "' + cheie + '": { ' + ', '.join('"' + c + '": "' + v + '"' for c, v in cai.items()) + ' },')
    randuri.append('};')
    return '\n'.join(randuri) + '\n'


ECH_DOC = {'doc': {'en': '/legal/doc', 'ro-MD': '/ro/juridic/doc'}}


def env_build(editii):
    """`config.env` cum il scrie Next din `next.config.ts`: profilul numai pe 3s.md, cheia martor mereu."""
    env = {'NEXT_PUBLIC_OPERATOR_NUMIT': 'true', 'NEXT_PUBLIC_FAMILIE_JURIDICA': 'md'}
    if editii is not None:
        env['NEXT_PUBLIC_SITE_EDITII'] = editii
    return env


def arbore(html, ech=ECH_DOC, env='en,ro-MD', fara_martor=False, build_vechi=False, fara_build=False):
    d = tempfile.mkdtemp(prefix='proba-reciprocitate-')
    os.makedirs(os.path.join(d, 'src', 'lib'))
    shutil.copyfile(CATALOG, os.path.join(d, 'src', 'lib', 'editii.ts'))
    scrie(os.path.join(d, 'src', 'content', 'echivalente.ts'), echivalente(ech))
    if not fara_build:
        e = env_build(env)
        if fara_martor:
            e.pop('NEXT_PUBLIC_FAMILIE_JURIDICA')
        scrie(os.path.join(d, '.next', 'required-server-files.json'), json.dumps({'version': 1, 'config': {'env': e}}))
        for rel, continut in html.items():
            scrie(os.path.join(d, '.next', 'server', 'app', *rel.split('/')), continut)
    # Datele fisierelor se pun explicit, nu se lasa ordinii scrierii: sursa cu o ora inainte de build, sau dupa.
    acum = time.time()
    t_sursa, t_build = (acum, acum - 3600) if build_vechi else (acum - 3600, acum)
    for radacina, _, nume in os.walk(d):
        for n in nume:
            cale = os.path.join(radacina, n)
            t = t_build if os.sep + '.next' + os.sep in cale + os.sep else t_sursa
            os.utime(cale, (t, t))
    return d


def ruleaza_poarta(poarta, radacina, argumente=()):
    # Mediul shell-ului NU trebuie sa conteze (profilul vine din build): proba pune intentionat un profil
    # contrar in mediu, ca un verdict care l-ar citi sa se vada.
    env = dict(os.environ, SITE_EDITII='ro-' + 'RO', NEXT_PUBLIC_SITE_EDITII='')
    r = subprocess.run([sys.executable, poarta, '--radacina', radacina, *argumente], capture_output=True, text=True,
                       encoding='utf-8', errors='replace', env=env)
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def caz(eticheta, construieste, cod_asteptat, contine=(), poarta=None):
    d = construieste()
    argumente = []
    if isinstance(d, tuple):
        d, argumente = d
    try:
        cod, iesire = ruleaza_poarta(poarta or POARTA, d, argumente)
    finally:
        shutil.rmtree(d, ignore_errors=True)
    if cod != cod_asteptat:
        nu(eticheta + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
        return
    for text in contine:
        if text not in iesire:
            nu(eticheta + ': iesirea nu contine "' + text + '"\n' + iesire.strip())
            return
    ok(eticheta)


def mutant(eticheta, ancora, inlocuitor, construieste, cod_asteptat, contine):
    """Ruleaza o COPIE a portii, cu o substitutie verificata ca a aterizat."""
    d = tempfile.mkdtemp(prefix='proba-reciprocitate-mutant-')
    try:
        text = open(POARTA, encoding='utf-8').read()
        if text.count(ancora) != 1:
            nu(eticheta + ': MUTANT NEATERIZAT (ancora apare de ' + str(text.count(ancora)) + ' ori)')
            return
        copie = os.path.join(d, 'poarta-reciprocitate.py')
        scrie(copie, text.replace(ancora, inlocuitor))
        if inlocuitor not in open(copie, encoding='utf-8').read():
            nu(eticheta + ': MUTANT NEATERIZAT (substitutia nu se vede pe copie)')
            return
        caz(eticheta, construieste, cod_asteptat, contine, poarta=copie)
    finally:
        shutil.rmtree(d, ignore_errors=True)


# ------------------------------------------------------------------ intre domenii (`--intre-domenii`)

ASEZARE = os.path.join(RADACINA, 'src', 'lib', 'asezare.ts')
DOM_A = 'https://' + 'proba-' + 'domeniu-a.test'
DOM_B = 'https://' + 'proba-' + 'domeniu-b.test'
ECH_CONTACT = {'contact': {'en': '/contact', 'ro-MD': '/ro/contact'}}


def pagina_pe(origine, cale, alternate, canonical=None):
    adresa = canonical or (origine + ('' if cale == '/' else cale))
    bucati = ['<html><head><link rel="canonical" href="' + adresa + '"/>']
    for h, u in alternate:
        bucati.append('<link rel="alternate" hrefLang="' + h + '" href="' + u + '"/>')
    bucati.append('</head><body><h1>x</h1></body></html>')
    return ''.join(bucati)


def colectie(director, pagini):
    """O colectie in formatul lui `colecteaza-build.mjs`: colectie.json + corpurile, plus un fisier text si negasitul."""
    intrari = []
    for i, (cale, html) in enumerate(sorted(pagini.items())):
        fisier = 'corp/%04d.txt' % i
        scrie(os.path.join(director, *fisier.split('/')), html)
        intrari.append({'cale': cale, 'status': 200, 'antete': {'content-type': 'text/html; charset=utf-8'},
                        'fisier': fisier, 'text': True})
    scrie(os.path.join(director, 'corp', 'robots.txt'), 'User-agent: *\n')
    intrari.append({'cale': '/robots.txt', 'status': 200, 'antete': {'content-type': 'text/plain'},
                    'fisier': 'corp/robots.txt', 'text': True})
    scrie(os.path.join(director, 'corp', 'negasit.txt'), pagina_pe(DOM_A, '/x', [('en', DOM_A + '/x')]))
    intrari.append({'cale': '/colectie-cale-inexistenta-404', 'status': 404, 'antete': {'content-type': 'text/html'},
                    'fisier': 'corp/negasit.txt', 'text': True})
    scrie(os.path.join(director, 'colectie.json'), json.dumps({'format': 1, 'idBuild': 'proba',
                                                              'caleInexistenta': '/colectie-cale-inexistenta-404',
                                                              'pagini': intrari}))


def doua_domenii(fara_ro_ro_pe_a=False, hreflang_pe_copie=False, copie_canonica_proprie=False, fara_colectie_b=False,
                 url_b_gresit=False, variante_schimbate=False):
    """Doua colectii fabricate cu profilurile lor: A = asezarea md (en la radacina, ro-MD sub /ro), B = asezarea ro
    (romana la radacina, copia engleza sub /en), cu grupul hreflang comun pe contact. Intoarce (radacina, argumente)."""
    d = tempfile.mkdtemp(prefix='proba-reciprocitate-intre-')
    os.makedirs(os.path.join(d, 'src', 'lib'))
    shutil.copyfile(CATALOG, os.path.join(d, 'src', 'lib', 'editii.ts'))
    text_asezare = open(ASEZARE, encoding='utf-8').read()
    if variante_schimbate:
        text_asezare = text_asezare.replace('"ro-RO": { editie: "ro-MD", asezare: "ro" },',
                                            '"ro-RO": { editie: "ro-MD", asezare: "ro" },\n  "ro-XX": { editie: "ro-MD", asezare: "ro" },')
    scrie(os.path.join(d, 'src', 'lib', 'asezare.ts'), text_asezare)
    scrie(os.path.join(d, 'src', 'content', 'echivalente.ts'), echivalente(ECH_CONTACT))
    lista = ['en=' + DOM_A, 'ro-MD=' + DOM_A + '/ro', 'ro-RO=' + DOM_B, X + '=' + DOM_A]
    lista_a = [x for x in lista if not (fara_ro_ro_pe_a and x.startswith('ro-RO='))]
    grup = [('en', DOM_A + '/contact'), ('ro-MD', DOM_A + '/ro/contact'), ('ro-RO', DOM_B + '/contact'), (X, DOM_A + '/contact')]
    grup_a = [p for p in grup if not (fara_ro_ro_pe_a and p[0] == 'ro-RO')]
    colectie(os.path.join(d, 'col-a'), {
        '/contact': pagina_pe(DOM_A, '/contact', grup_a),
        '/ro/contact': pagina_pe(DOM_A, '/ro/contact', grup_a),
        '/about': pagina_pe(DOM_A, '/about', [('en', DOM_A + '/about'), (X, DOM_A + '/about')]),
    })
    if not fara_colectie_b:
        copie = DOM_B + '/en/contact' if copie_canonica_proprie else DOM_A + '/contact'
        colectie(os.path.join(d, 'col-b'), {
            '/contact': pagina_pe(DOM_B, '/contact', grup),
            '/en/contact': pagina_pe(DOM_B, '/en/contact', grup if hreflang_pe_copie else [], canonical=copie),
        })
    profil = {'SITE_EDITII': 'en,ro-MD', 'SITE_ENV': 'staging'}
    scrie(os.path.join(d, 'profil-a.json'), json.dumps(dict(profil, SITE_URL=DOM_A, SITE_ALTERNATE=','.join(lista_a))))
    scrie(os.path.join(d, 'profil-b.json'), json.dumps(dict(profil, SITE_URL=DOM_A if url_b_gresit else DOM_B,
                                                            SITE_ASEZARE='ro', SITE_ALTERNATE=','.join(lista))))
    return d, ['--intre-domenii', '--colectie-a', os.path.join(d, 'col-a'), '--profil-a', os.path.join(d, 'profil-a.json'),
               '--colectie-b', os.path.join(d, 'col-b'), '--profil-b', os.path.join(d, 'profil-b.json')]


def cazuri_intre():
    print('\n## intre domenii (3s.md pe asezarea md, 3s.com.ro pe asezarea ro), doua colectii cu profilurile lor')
    caz('grupul comun, reciproc pe trei capete, copia engleza fara hreflang si cu canonical spre A: cod 0',
        lambda: doua_domenii(), CURAT, ('2 cu pereche', 'legaturi pe cod: en 2, ro-MD 2, ro-RO 2, x-default 2',
                                         'ASTEPTATE (din echivalente, pe toate domeniile): 3', 'DEFECTE DE RECIPROCITATE INTRE DOMENII: 0'))
    caz('profilul A fara ro-RO in lista (martorul specificatiei): cod 1, R-01 si R-08',
        lambda: doua_domenii(fara_ro_ro_pe_a=True), PICAT, ('R-01', 'nu listeaza ro-RO', 'R-08'))
    caz('copia engleza cu hreflang: cod 1, R-07', lambda: doua_domenii(hreflang_pe_copie=True), PICAT, ('R-07', '/en/contact'))
    caz('copia engleza cu canonical pe ea insasi: cod 1, R-07', lambda: doua_domenii(copie_canonica_proprie=True), PICAT,
        ('R-07', 'asteptat ' + DOM_A + '/contact'))
    caz('colectia B lipsa: cod 3, nu 0', lambda: doua_domenii(fara_colectie_b=True), NEMASURAT, ('nu se poate citi',))
    caz('profilul B cu alta origine decat colectia lui: cod 3', lambda: doua_domenii(url_b_gresit=True), NEMASURAT,
        ('aceeasi origine',))
    caz('asezarile din sursa diferite de copia portii: cod 3', lambda: doua_domenii(variante_schimbate=True), NEMASURAT,
        ('difera de copia portii',))
    # Controalele intre domenii, stricate pe o COPIE: fara R-06 si fara R-07, martorii lor nu mai sunt prinsi -> 3, nu 0.
    mutant('control picat (R-06 dezarmat pe copie): cod 3, nu 0', 'if inverse != alt:', 'if False:',
           lambda: doua_domenii(), NEMASURAT, ('CONTROL PICAT', 'R-06'))
    mutant('control picat (R-07 dezarmat pe copie): cod 3, nu 0', 'if alt:\n                defecte.append((\'R-07\'',
           'if False:\n                defecte.append((\'R-07\'', lambda: doua_domenii(), NEMASURAT, ('CONTROL PICAT', 'R-07'))


def main():
    global POARTA
    p = argparse.ArgumentParser(description='Proba portii de reciprocitate hreflang, ca proces.')
    p.add_argument('--poarta', default=POARTA, help='calea portii probate (implicit cea de langa probe)')
    a = p.parse_args()
    POARTA = os.path.abspath(a.poarta)
    for cale in (POARTA, CATALOG):
        if not os.path.isfile(cale):
            print('NEMASURAT: lipseste ' + cale, file=sys.stderr)
            return 3

    print('proba-reciprocitate: ' + POARTA)
    print('\n## 3s.md (en, ro-MD), profilul din build')
    caz('pereche reciproca, plus o pagina fara pereche: cod 0', lambda: arbore(pereche()), CURAT,
        ('PROFIL (din build): en,ro-MD', '2 cu pereche hreflang'))
    caz('pereche scoasa (ro-MD fara en): cod 1, R-01 numeste pagina', lambda: arbore(pereche(fara_inversa=True)),
        PICAT, ('R-01', '/ro/juridic/doc nu listeaza en'))
    caz('tinta fara pagina in build: cod 1, R-02', lambda: arbore(pereche(tinta_lipsa=True)), PICAT, ('R-02', '/fr/doc'))
    caz('pagina fara auto-referinta: cod 1, R-03', lambda: arbore(pereche(fara_auto=True)), PICAT, ('R-03', '/legal/doc'))
    caz('pereche in echivalente, fara alternate pe pagini: cod 1, R-04',
        lambda: arbore(pereche(), ech=dict(ECH_DOC, acasa={'en': '/', 'ro-MD': '/ro'})), PICAT, ('R-04', '/ro'))
    caz('tinta pe alt domeniu: cod 3, numita', lambda: arbore(pereche(alt_domeniu=True)), NEMASURAT,
        ('alt domeniu', ALT_DOMENIU))

    print('\n## ro-RO (build fara NEXT_PUBLIC_SITE_EDITII)')
    caz('ro-RO fara alternate: cod 0', lambda: arbore({'index.html': pagina('/', [])}, ech=ECH_DOC, env=None), CURAT,
        ('PROFIL (din build): ro-RO',))
    caz('ro-RO cu alternate: cod 1, R-05', lambda: arbore(pereche(), env=None), PICAT, ('R-05',))

    cazuri_intre()

    print('\n## NEMASURAT')
    caz('build lipsa: cod 3', lambda: arbore({}, fara_build=True), NEMASURAT, ('niciun HTML construit',))
    caz('build mai vechi decat src/: cod 3', lambda: arbore(pereche(), build_vechi=True), NEMASURAT, ('mai vechi',))
    caz('profil necitibil (fara cheia martor): cod 3', lambda: arbore(pereche(), fara_martor=True), NEMASURAT,
        ('NEXT_PUBLIC_FAMILIE_JURIDICA',))
    # Controlul stricat pe o COPIE: verificarea inversei nu mai compara nimic, deci martorul R-01 al portii
    # nu mai e prins si poarta trebuie sa iasa 3, nu 0.
    mutant('control picat (verificarea inversei dezarmata pe copie): cod 3, nu 0',
           'if inverse.get(cod) != proprie:', 'if False:', lambda: arbore(pereche()), NEMASURAT, ('CONTROL PICAT',))

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

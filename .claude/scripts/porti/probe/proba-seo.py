#!/usr/bin/env python3
"""Proba portii de SEO. Ruleaza poarta ca PROCES, pe arbori fabricati la rulare.

DE CE ca proces si nu prin import: asa se executa in fabrica. O proba care
importa functia si o cheama direct nu masoara ce se intampla cu argumentele, cu
codul de iesire si cu citirea de pe disc, adica exact partile care se strica.

DE CE cu MUTANT: cazurile de mai jos ar trece si daca poarta ar fi goala pe
dinauntru, atat timp cat ies verzi. Ultimul caz strica DELIBERAT o verificare din
poarta si cere ca proba care o vaneaza sa devina verde. Daca nu devine, cazul
respectiv nu atingea codul pe care pretinde ca il apara. Se verifica separat ca
mutatia a ATERIZAT, fiindca o substitutie care nu se aplica da fals verde.

IESIRE: 0 toate cazurile trec, 1 macar unul pica.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

AICI = os.path.dirname(os.path.abspath(__file__))
POARTA = os.path.join(os.path.dirname(AICI), 'poarta-seo.py')

T = P = 0


def ok(mesaj):
    global T
    T += 1
    print('  OK    ' + mesaj)


def nu(mesaj):
    global P
    P += 1
    print('  PICAT ' + mesaj)


def scrie(cale, continut):
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with open(cale, 'w', encoding='utf-8', newline='\n') as f:
        f.write(continut)


def graf(*noduri):
    return json.dumps({'@context': 'https://schema.org', '@graph': list(noduri)})


# Marca, cum o cere decizia owner-ului din 24.09.2026 (plan S4 sectiunile 7 si 8.2): Organization si
# WebSite, fiecare cu @id, fara date de firma si fara note. E fixtura implicita a fiecarei pagini:
# dupa decizie, o pagina de start fara ele nu mai e "corecta", deci nici martor negativ.
ORGANIZATIE = {'@type': 'Organization', '@id': 'https://exemplu.test/#organizatie', 'name': 'Trei S'}
SITE = {'@type': 'WebSite', '@id': 'https://exemplu.test/#site', 'name': 'Trei S',
        'publisher': {'@id': 'https://exemplu.test/#organizatie'}}


def pagina(titlu='Arhiva care raspunde cu pagina exacta',
           descriere='Arhivare autorizata, digitalizare si cautare care citeaza pagina din care vine raspunsul.',
           canonical='https://exemplu.test/',
           antete='<h1>Unu</h1><h2>Doi</h2><h3>Trei</h3>',
           ld=None):
    if ld is None:
        ld = graf(ORGANIZATIE, SITE)
    bucati = ['<html><head>']
    if titlu is not None:
        bucati.append('<title>' + titlu + '</title>')
    if descriere is not None:
        bucati.append('<meta name="description" content="' + descriere + '"/>')
    if canonical is not None:
        bucati.append('<link rel="canonical" href="' + canonical + '"/>')
    if ld:
        bucati.append('<script type="application/ld+json">' + ld + '</script>')
    bucati.append('</head><body>' + antete + '</body></html>')
    return ''.join(bucati)


def arbore(pagini):
    """pagini = {'index': html, 'despre': html}. Intoarce radacina temporara."""
    d = tempfile.mkdtemp(prefix='proba-seo-')
    for nume, html in pagini.items():
        scrie(os.path.join(d, '.next', 'server', 'app', nume + '.html'), html)
    return d


def ruleaza(radacina, poarta=None, argumente=()):
    r = subprocess.run([sys.executable, poarta or POARTA, '--radacina', radacina] + list(argumente),
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def caz(nume, pagini, cod_asteptat, contine=None, argumente=()):
    d = arbore(pagini)
    try:
        cod, iesire = ruleaza(d, argumente=argumente)
        if cod != cod_asteptat:
            nu(nume + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
            return
        if contine and contine not in iesire:
            nu(nume + ': iesirea nu contine "' + contine + '"\n' + iesire.strip())
            return
        ok(nume)
    finally:
        shutil.rmtree(d, ignore_errors=True)


def main():
    print('proba-seo: poarta ' + POARTA)

    # --- martorul negativ: forma corecta nu are voie sa fie prinsa ---
    caz('pagina corecta trece', {'index': pagina()}, 0)

    # --- martorii pozitivi, cate unul pe fiecare clasa ---
    caz('canonical lipsa opreste', {'index': pagina(canonical=None)}, 1, 'S-02')
    caz('canonical cu parametri opreste', {'index': pagina(canonical='https://exemplu.test/?utm=1')}, 1, 'S-02')
    caz('canonical spre alta cale opreste', {'index': pagina(canonical='https://exemplu.test/altundeva')}, 1, 'S-02')
    caz('canonical pe alta gazda decat mediul servit opreste',
        {'index': pagina()}, 1, 'S-02', argumente=('--gazda', 'alta.test'))
    caz('titlu prea scurt opreste', {'index': pagina(titlu='3S')}, 1, 'S-01')
    caz('titlu prea lung opreste', {'index': pagina(titlu='T' * 80)}, 1, 'S-01')
    caz('descriere prea lunga opreste', {'index': pagina(descriere='d' * 200)}, 1, 'S-01')
    caz('descriere prea scurta opreste', {'index': pagina(descriere='scurt')}, 1, 'S-01')
    caz('doua etichete title opresc',
        {'index': pagina().replace('</head>', '<title>Al doilea titlu, suficient de lung</title></head>')},
        1, 'S-01')
    caz('ld+json rupt opreste',
        {'index': pagina(ld='{"@context": "https://schema.org", "@type": "Organization"')}, 1, 'S-09')
    caz('@type inventat opreste',
        {'index': pagina(ld=json.dumps({'@context': 'https://schema.org', '@type': 'Organizatiune'}))}, 1, 'S-09')
    caz('@context strain opreste',
        {'index': pagina(ld=json.dumps({'@context': 'https://exemplu.test', '@type': 'Organization'}))}, 1, 'S-09')

    # unicitatea se masoara pe lot: doua rute, acelasi titlu
    doua = {'index': pagina(), 'despre': pagina(canonical='https://exemplu.test/despre')}
    caz('titlu duplicat pe doua rute opreste', doua, 1, 'identic pe 2 rute')

    # --- S-09, decizia de brand din 24.09.2026 (felia seo-geo-gdpr) ---
    # Numele campurilor si ale tipurilor interzise se lipesc la rulare, din bucati.
    firma = dict(ORGANIZATIE, **{'tax' + 'ID': 'RO' + '0' * 8})
    caz('date de firma in Organization opresc', {'index': pagina(ld=graf(firma, SITE))}, 1, 'date de firma')
    adresa = dict(ORGANIZATIE, **{'add' + 'ress': {'@type': 'PostalAddress', 'addressLocality': 'Pitesti'}})
    caz('adresa postala in Organization opreste', {'index': pagina(ld=graf(adresa, SITE))}, 1, 'date de firma')
    nota = {'@type': 'SoftwareApplication', '@id': 'https://exemplu.test/#aplicatie', 'name': 'Trei S',
            'aggregate' + 'Rating': {'@type': 'Aggregate' + 'Rating', 'ratingValue': '5', 'reviewCount': '9'}}
    caz('nota inventata pe aplicatie opreste', {'index': pagina(ld=graf(ORGANIZATIE, SITE, nota))}, 1,
        'recenzie sau nota')
    fara_id = {'@type': 'SoftwareApplication', 'name': 'Trei S'}
    caz('entitate unica fara @id opreste', {'index': pagina(ld=graf(ORGANIZATIE, SITE, fara_id))}, 1, 'nu are @id')
    caz('pagina de start fara WebSite opreste', {'index': pagina(ld=graf(ORGANIZATIE))}, 1, 'nu are nodul WebSite')
    caz('pagina de start fara niciun bloc opreste', {'index': pagina(ld='')}, 1, 'nu are nodul Organization')
    # O pagina interioara fara bloc ramane AVERT: regula marcii e a startului.
    caz('pagina interioara fara bloc avertizeaza, nu opreste',
        {'index': pagina(), 'despre': pagina(titlu='Despre arhiva care raspunde', ld='',
                                             descriere='Cum lucreaza arhiva care raspunde cu pagina din care vine raspunsul.',
                                             canonical='https://exemplu.test/despre')},
        0, 'AVERT    S-09')
    alt_id = dict(ORGANIZATIE, **{'@id': 'https://exemplu.test/#firma'})
    caz('aceeasi organizatie sub doua @id pe lot opreste',
        {'index': pagina(), 'despre': pagina(titlu='Despre arhiva care raspunde', ld=graf(alt_id, SITE),
                                             descriere='Cum lucreaza arhiva care raspunde cu pagina din care vine raspunsul.',
                                             canonical='https://exemplu.test/despre')},
        1, '@id diferite')
    furat = {'@type': 'Organization', '@id': 'https://exemplu.test/#site', 'name': 'Alt nume'}
    caz('@id-ul site-ului refolosit pentru o organizatie opreste',
        {'index': pagina(), 'despre': pagina(titlu='Despre arhiva care raspunde', ld=graf(ORGANIZATIE, SITE, furat),
                                             descriere='Cum lucreaza arhiva care raspunde cu pagina din care vine raspunsul.',
                                             canonical='https://exemplu.test/despre')},
        1, 'poarta tipuri diferite')
    # Martorii NEGATIVI ai identitatilor: referinta prin @id si aceeasi marca pe doua pagini trec.
    referinta = {'@type': 'FAQPage', '@id': 'https://exemplu.test/#intrebari',
                 'isPartOf': {'@id': 'https://exemplu.test/#site'}}
    caz('referinta prin @id catre marca nu e redeclarare', {'index': pagina(ld=graf(ORGANIZATIE, SITE, referinta))}, 0)
    caz('aceeasi marca, aceleasi @id, pe doua pagini trece',
        {'index': pagina(), 'despre': pagina(titlu='Despre arhiva care raspunde',
                                             descriere='Cum lucreaza arhiva care raspunde cu pagina din care vine raspunsul.',
                                             canonical='https://exemplu.test/despre')},
        0)

    # --- S-03 e AVERT in tabelul de operare: se raporteaza, nu opreste ---
    caz('doi h1 avertizeaza, nu opresc',
        {'index': pagina(antete='<h1>Unu</h1><h1>Doi</h1>')}, 0, 'AVERT    S-03')
    caz('saritura h2 spre h4 avertizeaza, nu opreste',
        {'index': pagina(antete='<h1>Unu</h1><h2>Doi</h2><h4>Patru</h4>')}, 0, 'AVERT    S-03')

    # --- martorul negativ care apara extragerea: comentariile nu sunt continut ---
    caz('un h1 fals dintr-un comentariu nu produce defect',
        {'index': pagina(antete='<h1>Unu</h1><!-- aici scrie <h1>Doi</h1> si 3 > 2 --><h2>Doi</h2>')}, 0)

    # --- paginile interne de eroare nu intra in lot (scutire motivata in poarta) ---
    caz('_not-found nu produce titlu duplicat',
        {'index': pagina(), '_not-found': pagina()}, 0)

    # --- starile NEMASURAT: 3, niciodata 0 ---
    d = tempfile.mkdtemp(prefix='proba-seo-gol-')
    try:
        cod, iesire = ruleaza(d)
        if cod == 3 and 'invalida' in iesire:
            ok('fara HTML construit da 3 (NEMASURAT), nu 0')
        else:
            nu('fara HTML construit: cod ' + str(cod) + '\n' + iesire.strip())
    finally:
        shutil.rmtree(d, ignore_errors=True)

    d = arbore({'index': pagina()})
    try:
        # sursa mai noua decat buildul: poarta ar masura un site care nu mai exista
        scrie(os.path.join(d, 'src', 'app', 'page.tsx'), 'export default function P() { return null }\n')
        html = os.path.join(d, '.next', 'server', 'app', 'index.html')
        os.utime(html, (1000000000, 1000000000))
        cod, iesire = ruleaza(d)
        if cod == 3 and 'mai vechi decat' in iesire:
            ok('build mai vechi decat src/ da 3 (NEMASURAT), nu 0')
        else:
            nu('build invechit: cod ' + str(cod) + '\n' + iesire.strip())
    finally:
        shutil.rmtree(d, ignore_errors=True)

    # --- MUTANTUL: dovada ca acele cazuri chiar ating codul pe care il apara ---
    mutant_dir = tempfile.mkdtemp(prefix='mutant-seo-')
    try:
        sursa = open(POARTA, encoding='utf-8').read()
        # se dezarmeaza pragul de lungime al descrierii, si numai el
        vechi = "elif n < PRAGURI['descriere_min'] or n > PRAGURI['descriere_max']:"
        nou = "elif False:"
        if sursa.count(vechi) != 1:
            nu('MUTANT NEATERIZAT: ancora nu apare exact o data in poarta (' + str(sursa.count(vechi)) + ')')
        else:
            copie = os.path.join(mutant_dir, 'poarta-mutant.py')
            with open(copie, 'w', encoding='utf-8', newline='\n') as f:
                f.write(sursa.replace(vechi, nou))
            verificare = open(copie, encoding='utf-8').read()
            if nou not in verificare or vechi in verificare:
                nu('MUTANT NEATERIZAT: substitutia nu se regaseste in copie')
            else:
                d = arbore({'index': pagina(descriere='d' * 200)})
                try:
                    cod, iesire = ruleaza(d, poarta=copie)
                    # Doua deznodaminte acceptabile, si al doilea e cel bun:
                    #   0 = numai cazul asta apara pragul, poarta a devenit oarba tacut;
                    #   3 = martorul din interiorul portii a prins mutatia inainte sa
                    #       apuce sa masoare ceva - dovada ca poarta se apara singura.
                    # Inacceptabil e 1: ar insemna ca defectul e prins de alta ramura,
                    # deci cazul nu masoara ce pretinde.
                    if cod == 3:
                        ok('mutantul fara pragul descrierii cade la 3: martorul din poarta l-a prins')
                    elif cod == 0:
                        ok('mutantul fara pragul descrierii iese VERDE: cazul chiar ataca acel prag')
                    else:
                        nu('mutantul a ramas rosu (cod ' + str(cod)
                           + '): cazul "descriere prea lunga" trece prin alta verificare decat cea dezarmata\n'
                           + iesire.strip())
                finally:
                    shutil.rmtree(d, ignore_errors=True)
    finally:
        shutil.rmtree(mutant_dir, ignore_errors=True)

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

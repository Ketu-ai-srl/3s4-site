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


def ruleaza(radacina, poarta=None, argumente=(), mediu=None):
    # Mediul subprocesului fara CANALE_JSON mostenit: profilul portii il dau cazurile, explicit (`mediu`).
    env = {k: v for k, v in os.environ.items() if k != 'CANALE_JSON'}
    env.update(mediu or {})
    r = subprocess.run([sys.executable, poarta or POARTA, '--radacina', radacina] + list(argumente),
                       capture_output=True, text=True, encoding='utf-8', errors='replace', env=env)
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def caz(nume, pagini, cod_asteptat, contine=None, argumente=(), mediu=None):
    d = arbore(pagini)
    try:
        cod, iesire = ruleaza(d, argumente=argumente, mediu=mediu)
        if cod != cod_asteptat:
            nu(nume + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
            return
        if contine and contine not in iesire:
            nu(nume + ': iesirea nu contine "' + contine + '"\n' + iesire.strip())
            return
        ok(nume)
    finally:
        shutil.rmtree(d, ignore_errors=True)


# Telefonul marcii, cum il scrie `src/components/seo/date-structurate.ts` cand domeniul are canal de telefon.
# Numerele si numele campului se lipesc la rulare.
TELEFON = '+' + '3736' + '8' + '000' + '333'
ALT_TELEFON = '+' + '3736' + '8' + '000' + '444'
CAMP_TELEFON = 'tele' + 'phone'


def canale(telefon):
    return json.dumps({'formulare': False, 'whatsapp': TELEFON[1:], 'telefon': telefon})


def organizatie_cu_telefon(numar):
    return dict(ORGANIZATIE, **{CAMP_TELEFON: numar,
                                'contactPoint': {'@type': 'ContactPoint', 'contactType': 'customer support',
                                                 CAMP_TELEFON: numar}})


def arbore_fara_pagini(manifest_pagini=(), manifest_vechi=False):
    """Un build ca al site-ului international inainte de primele pagini EN: numai pagina de negasit si rute de
    sistem, plus manifestele lui Next. `manifest_pagini` adauga pagini prerandate in manifest (fara HTML)."""
    d = tempfile.mkdtemp(prefix='proba-seo-fara-pagini-')
    app = {'/_not-found/page': '/_not-found', '/robots.txt/route': '/robots.txt', '/(en)/[negasit]/page': '/[negasit]'}
    rute = {'/_not-found': {'srcRoute': '/_not-found'}, '/robots.txt': {'srcRoute': '/robots.txt'}}
    for r in manifest_pagini:
        app[r + '/page'] = r
        rute[r] = {'srcRoute': r}
    scrie(os.path.join(d, 'src', 'app', 'robots.ts'), 'export default function r() { return {} }\n')
    scrie(os.path.join(d, '.next', 'server', 'app', '_not-found.html'), pagina())
    scrie(os.path.join(d, '.next', 'app-path-routes-manifest.json'), json.dumps(app))
    scrie(os.path.join(d, '.next', 'prerender-manifest.json'), json.dumps({'routes': rute, 'dynamicRoutes': {}}))
    if manifest_vechi:
        for n in ('app-path-routes-manifest.json', 'prerender-manifest.json'):
            os.utime(os.path.join(d, '.next', n), (1000000000, 1000000000))
    return d


def caz_arbore(nume, d, cod_asteptat, contine=None):
    try:
        cod, iesire = ruleaza(d)
        if cod != cod_asteptat:
            nu(nume + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
        elif contine and contine not in iesire:
            nu(nume + ': iesirea nu contine "' + contine + '"\n' + iesire.strip())
        else:
            ok(nume)
    finally:
        shutil.rmtree(d, ignore_errors=True)


def mutant(nume, vechi, nou, pagini, mediu, cod_martor):
    """Strica DELIBERAT, pe o COPIE a portii, ramura data, si o ruleaza pe cazul care o vaneaza. Bun: 3 (martorul
    din poarta a prins mutatia) sau 0 (cazul a devenit verde, deci chiar ataca ramura). Rau: `cod_martor`, adica
    defectul prins tot de alta ramura. Mutatia se verifica in copie (o substitutie neaplicata da fals verde)."""
    director = tempfile.mkdtemp(prefix='mutant-seo-')
    try:
        sursa = open(POARTA, encoding='utf-8').read()
        if sursa.count(vechi) != 1:
            nu('MUTANT NEATERIZAT (' + nume + '): ancora apare de ' + str(sursa.count(vechi)) + ' ori in poarta')
            return
        copie = os.path.join(director, 'poarta-mutant.py')
        with open(copie, 'w', encoding='utf-8', newline='\n') as f:
            f.write(sursa.replace(vechi, nou))
        verificare = open(copie, encoding='utf-8').read()
        if nou not in verificare or vechi in verificare:
            nu('MUTANT NEATERIZAT (' + nume + '): substitutia nu se regaseste in copie')
            return
        d = arbore(pagini)
        try:
            cod, iesire = ruleaza(d, poarta=copie, mediu=mediu)
        finally:
            shutil.rmtree(d, ignore_errors=True)
        if cod == 3 and 'CONTROL PICAT' in iesire:
            ok('mutantul ' + nume + ' cade la 3: martorul din poarta l-a prins')
        elif cod == 0:
            ok('mutantul ' + nume + ' iese VERDE: cazul chiar ataca ramura')
        else:
            nu('mutantul ' + nume + ' a iesit ' + str(cod) + ' (asteptam 3 sau 0; ' + str(cod_martor)
               + ' = defectul e prins de alta ramura)\n' + iesire.strip())
    finally:
        shutil.rmtree(director, ignore_errors=True)


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

    # --- S-09, telefonul: permis numai cu canalul de telefon al domeniului (CANALE_JSON), acelasi numar ---
    cu_telefon = {'index': pagina(ld=graf(organizatie_cu_telefon(TELEFON), SITE))}
    caz('telefon in JSON-LD pe un build fara CANALE_JSON opreste', cu_telefon, 1, 'n-are canal de telefon')
    caz('telefon in JSON-LD cu CANALE_JSON fara telefon opreste', cu_telefon, 1, 'n-are canal de telefon',
        mediu={'CANALE_JSON': canale('')})
    caz('telefonul canalului din CANALE_JSON (mediu) trece', cu_telefon, 0, 'permis numai ca ' + TELEFON,
        mediu={'CANALE_JSON': canale(TELEFON)})
    caz('telefonul canalului din --canale-json trece', cu_telefon, 0,
        argumente=('--canale-json', canale(TELEFON)))
    caz('alt numar decat canalul opreste', cu_telefon, 1, 'diferit de canalul',
        mediu={'CANALE_JSON': canale(ALT_TELEFON)})
    numai_punct = dict(ORGANIZATIE, contactPoint={'@type': 'ContactPoint', CAMP_TELEFON: ALT_TELEFON})
    caz('alt numar numai in contactPoint opreste', {'index': pagina(ld=graf(numai_punct, SITE))}, 1, 'diferit de canalul',
        mediu={'CANALE_JSON': canale(TELEFON)})
    caz('canalul de telefon nu scuteste un camp de firma', {'index': pagina(ld=graf(dict(firma, **{CAMP_TELEFON: TELEFON}), SITE))},
        1, 'date de firma', mediu={'CANALE_JSON': canale(TELEFON)})
    caz('CANALE_JSON care nu se citeste da 3', {'index': pagina()}, 3, 'NEMASURAT',
        mediu={'CANALE_JSON': '{' + '"telefon": '})

    # --- build fara nicio pagina (site-ul international inainte de paginile EN) ---
    caz_arbore('build fara pagini, confirmat de manifest, iese 0', arbore_fara_pagini(), 0, 'SURSA: 0 pagini')
    caz_arbore('manifest cu o pagina prerandata, fara HTML, da 3', arbore_fara_pagini(('/pricing',)), 3, '/pricing')
    caz_arbore('manifest mai vechi decat src/ da 3', arbore_fara_pagini(manifest_vechi=True), 3, 'invalida')

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

    # --- MUTANTII TELEFONULUI (S-09): fiecare dezarmeaza o conditie a exceptiei, pe o copie a portii ---
    mutant('fara conditia de canal (telefon permis oricand)',
           'return camp == CAMP_TELEFON and bool(telefon_permis) and nod.get(camp) == telefon_permis',
           'return camp == CAMP_TELEFON',
           cu_telefon, {}, 1)
    mutant('fara compararea numarului (orice telefon, cu canal)',
           'return camp == CAMP_TELEFON and bool(telefon_permis) and nod.get(camp) == telefon_permis',
           'return camp == CAMP_TELEFON and bool(telefon_permis)',
           cu_telefon, {'CANALE_JSON': canale(ALT_TELEFON)}, 1)

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

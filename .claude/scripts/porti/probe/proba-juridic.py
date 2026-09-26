#!/usr/bin/env python3
"""Proba portii juridice. Ruleaza poarta ca PROCES, pe arbori de proiect fabricati.

Trei lucruri se probeaza aici, si ultimele doua sunt cele usor de uitat:
  1. fiecare clasa de defect e prinsa (martori pozitivi);
  2. gradarea pe MEDIU chiar functioneaza - acelasi arbore incomplet trebuie sa
     fie AVERT pe staging si sa OPREASCA la productie. Fara cazul asta,
     "blocheaza publicarea in productie" ramane o propozitie din documentatie.
  3. comutatorul operatorului (L-01): datele de identificare se cer numai cand
     `config/operator.json` numeste un operator. Operator numit cu un camp gol =
     rosu la productie; operator null si nicio data de firma = verde pe AMBELE
     medii (decizia owner-ului din 24.09.2026, planul valului S4, sectiunea 7).
  4. politica de cookie-uri (L-15) se cere din clipa in care HTML-ul construit
     poarta bannerul de consimtamant, oricare ar fi operatorul; fara banner, nu.

Tiparele interzise se asambleaza din bucati la rulare: proba sta in depozit, iar
un link ODR scris intreg aici ar deveni chiar defectul pe care poarta il vaneaza,
data viitoare cand cineva largeste zona scanata.

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
POARTA = os.path.join(os.path.dirname(AICI), 'poarta-juridic.py')

T = P = 0

DATE_FIRMA = {
    'denumire': 'Trei S Arhivare SRL',
    'sediu': 'Golesti, judetul Arges',
    'email': 'contact@exemplu-3s.test',
    'telefon': '+40 000 000 000',
    'numar_orc': 'J03/1234/2026',
    'cod_fiscal': 'RO12345678',
}


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


def arbore(corp_in_plus=(), date_firma=DATE_FIRMA, cu_rute=True, cu_config=True, operator_brut=None,
           fisiere_in_plus=None, construite_in_plus=None):
    """`date_firma` = obiectul operatorului din `config/operator.json`; None = operator null (nicio
    firma, nicio data in pagina). `operator_brut` scrie fisierul exact asa, pentru cazurile rupte.
    `fisiere_in_plus` = {cale relativa: continut}, scrise inaintea HTML-ului construit.
    `construite_in_plus` = {cale sub `.next/server/app/`: continut}, pagini construite in plus,
    scrise DUPA sursa: poarta refuza (3) un build mai vechi decat sursa."""
    d = tempfile.mkdtemp(prefix='proba-juridic-')
    for rel, continut in (fisiere_in_plus or {}).items():
        scrie(os.path.join(d, *rel.split('/')), continut)
    if cu_rute:
        scrie(os.path.join(d, 'src', 'app', 'confidentialitate', 'page.tsx'),
              'export default function P() { return <p>Politica</p> }\n')
        scrie(os.path.join(d, 'src', 'app', 'termeni', 'page.tsx'),
              'export default function P() { return <p>Termeni</p> }\n')
    if cu_config:
        continut = operator_brut if operator_brut is not None else (
            json.dumps({'operator': date_firma}, ensure_ascii=False, indent=2) + '\n')
        scrie(os.path.join(d, 'config', 'operator.json'), continut)
    for rel, continut in (construite_in_plus or {}).items():
        scrie(os.path.join(d, '.next', 'server', 'app', *rel.split('/')), continut)
    corp = ['<html><body>']
    if date_firma:
        for camp in ('denumire', 'sediu', 'email', 'telefon', 'numar_orc', 'cod_fiscal'):
            corp.append('<p>' + str(date_firma.get(camp, '')) + '</p>')
    corp.append('<form><input name="nume"/><p>Prelucram datele pentru demersuri precontractuale.</p></form>')
    corp.extend(corp_in_plus)
    corp.append('</body></html>')
    scrie(os.path.join(d, '.next', 'server', 'app', 'index.html'), ''.join(corp))
    return d


def ruleaza(radacina, mediu='staging', poarta=None):
    r = subprocess.run([sys.executable, poarta or POARTA, '--radacina', radacina, '--mediu', mediu],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def caz(nume, d, cod_asteptat, contine=None, mediu='staging'):
    """`contine` = un sir sau o lista de siruri; fiecare trebuie sa apara in iesire."""
    try:
        cod, iesire = ruleaza(d, mediu)
        if cod != cod_asteptat:
            nu(nume + ': cod ' + str(cod) + ', asteptam ' + str(cod_asteptat) + '\n' + iesire.strip())
            return
        for sir in ([contine] if isinstance(contine, str) else (contine or [])):
            if sir not in iesire:
                nu(nume + ': iesirea nu contine "' + sir + '"\n' + iesire.strip())
                return
        ok(nume)
    finally:
        shutil.rmtree(d, ignore_errors=True)


def main():
    print('proba-juridic: poarta ' + POARTA)

    # --- martorul negativ: proiectul complet si curat nu are voie sa fie prins ---
    caz('proiect complet si curat trece', arbore(), 0)

    # --- martori negativi pentru tiparele care ar putea fi prea late ---
    caz('un link extern normal nu e tert incarcat',
        arbore(['<a href="https://exemplu-extern.test/x">legatura externa</a>']), 0)
    caz('un script de tert CITAT intr-un comentariu nu produce defect',
        arbore(['<!-- nu punem <script src="https://cdn.tert.test/a.js"></script> aici -->']), 0)
    caz('cuvantul operator singur, fara numar langa el, nu produce defect',
        arbore(['<p>Operatorul de date raspunde la cererile primite.</p>']), 0)

    # --- L-09: platforma SOL / ODR, poarta de absenta, opreste pe orice mediu ---
    odr = 'https://ec.europa.eu/' + 'consumers' + '/' + 'odr'
    caz('link ODR opreste', arbore(['<a href="' + odr + '">SOL</a>']), 1, 'L-09')
    sintagma = 'solutionarea' + ' online a litigiilor'
    caz('sintagma SOL in romana opreste',
        arbore(['<p>Puteti folosi platforma de ' + sintagma + '.</p>']), 1, 'L-09')
    caz('sintagma SOL cu diacritice opreste',
        arbore(['<p>Platforma de ' + 'soluționarea online a litigiilor' + '.</p>']), 1, 'L-09')

    # --- L-10: numar de inregistrare ca operator ---
    caz('numar de operator de date opreste',
        arbore(['<p>Numarul nostru de inregistrare ca operator de date este 12345.</p>']), 1, 'L-10')

    # --- C-01: terti ---
    caz('script de la tert opreste',
        arbore(['<script src="https://cdn.tert.test/urmarire.js"></script>']), 1, 'C-01')
    caz('iframe de la tert opreste',
        arbore(['<iframe src="https://video.tert.test/embed/1"></iframe>']), 1, 'C-01')
    caz('font de la Google opreste',
        arbore(['<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X"/>']), 1, 'C-01')

    # --- L-05: temeiul formularului ---
    caz('formularul care cere consimtamant opreste',
        arbore(['<p>Prin ' + 'trimiterea formularului' + ' va dati ' + 'consimtamantul' + '.</p>']), 1, 'L-05')

    # --- gradarea pe mediu: acelasi arbore, doua verdicte ---
    caz('rute juridice lipsa: AVERT pe staging', arbore(cu_rute=False), 0, 'AVERT    L-15', mediu='staging')
    caz('rute juridice lipsa: OPRESTE la productie', arbore(cu_rute=False), 1, 'OPRESTE  L-15', mediu='productie')

    incomplet = dict(DATE_FIRMA)
    incomplet['cod_fiscal'] = 'de completat'
    # Martorul POZITIV al comutatorului: operator NUMIT, cu un camp gol.
    # Mesajul intreg, nu doar codul: un comutator ilizibil tot L-01 da, iar cazul trebuie sa
    # masoare locul gol al operatorului numit, nu orice L-01.
    gol_numit = 'L-01  config/operator.json: operatorul e numit, dar are loc gol la cod_fiscal'
    caz('operator numit cu loc gol: AVERT pe staging', arbore(date_firma=incomplet), 0, 'AVERT    ' + gol_numit)
    caz('operator numit cu loc gol: OPRESTE la productie',
        arbore(date_firma=incomplet), 1, 'OPRESTE  ' + gol_numit, mediu='productie')
    lipsa = 'L-01  lipseste config/operator.json'
    caz('comutator lipsa: AVERT pe staging', arbore(cu_config=False), 0, 'AVERT    ' + lipsa)
    caz('comutator lipsa: OPRESTE la productie', arbore(cu_config=False), 1, 'OPRESTE  ' + lipsa, mediu='productie')

    # --- comutatorul operatorului: martorul NEGATIV, pe ambele medii ---
    # Operator null si nicio data de firma in pagina: L-01 nu cere nimic, iar iesirea o spune.
    caz('operator null, fara date de firma: verde pe staging',
        arbore(date_firma=None), 0, 'L-01: NU SE APLICA')
    caz('operator null, fara date de firma: verde si la productie',
        arbore(date_firma=None), 0, 'L-01: NU SE APLICA', mediu='productie')
    # Controlul martorului negativ: acelasi arbore fara operator, dar cu comutatorul lipsa, e rosu
    # la productie (cazul de mai sus). Deci verdele vine din null, nu dintr-o regula oarba.
    caz('operator cu forma gresita (text in loc de obiect): OPRESTE',
        arbore(date_firma=None, operator_brut='{"operator": "de completat"}' + chr(10)), 1, 'OPRESTE  L-01')

    # --- L-15 dupa operator (felia seo-geo-gdpr, decizia owner-ului din 24.09.2026) ---
    # Fara operator, paginile juridice nu se publica, deci lipsa lor nu e defect pe niciun mediu.
    # Cazurile de mai sus, cu operator numit, arata ca aceeasi lipsa ramane rosie la productie.
    caz('operator null, fara pagini juridice: nicio constatare pe staging',
        arbore(date_firma=None, cu_rute=False), 0, 'L-15: NU SE APLICA')
    caz('operator null, fara pagini juridice: nicio constatare nici la productie',
        arbore(date_firma=None, cu_rute=False), 0, 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment',
        mediu='productie')

    # --- L-15, politica de cookie-uri ceruta dupa banner (felia seo-geo-gdpr) ---
    # Bannerul exista numai cand exista ceva de consimtit (GA4), iar GA4 e exceptat de C-01 pe sursa,
    # deci regula veche ("cand C-01 gaseste un tert") nu s-ar fi declansat niciodata. Semnul e bannerul.
    banner = '<section data-' + 'consimtamant="" hidden=""><h2>Cookie-uri</h2></section>'
    fara_cookie = 'L-15  lipseste ruta juridica /cookies'
    pagina_cookie = {'src/app/juridic/cookies/page.tsx': 'export default function P() { return <p>Cookie-uri</p> }\n'}
    caz('banner fara politica de cookie-uri: AVERT pe staging', arbore([banner]), 0, 'AVERT    ' + fara_cookie)
    caz('banner fara politica de cookie-uri: OPRESTE la productie',
        arbore([banner]), 1, 'OPRESTE  ' + fara_cookie, mediu='productie')
    caz('banner fara politica de cookie-uri, operator null: tot OPRESTE la productie',
        arbore([banner], date_firma=None, cu_rute=False), 1, 'OPRESTE  ' + fara_cookie, mediu='productie')
    caz('banner cu politica de cookie-uri la locul din navigatie: verde la productie',
        arbore([banner], fisiere_in_plus=pagina_cookie), 0, 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment',
        mediu='productie')
    caz('fara banner, politica de cookie-uri nu se cere nici la productie',
        arbore(), 0, 'L-15 /cookies: NU SE APLICA', mediu='productie')

    # --- L-15 pe calea intreaga a paginii construite (runda 2 a criticului, 25.09.2026) ---
    # Pana atunci pagina se cauta pe subsir in numele fisierelor construite: un articol de blog cu
    # "cookies" in adresa stingea cerinta politicii, unul cu "termeni" si "confidentialitate" pe ale
    # operatorului. Numele articolelor se scriu din litere, ca proba sa nu se mute cu o constanta.
    # Paginile in plus poarta datele firmei: cu operator numit, L-01 le cere pe FIECARE pagina
    # livrata, iar cazurile de aici trebuie sa masoare numai L-15.
    articol = '<html><body>' + ''.join('<p>' + v + '</p>' for v in DATE_FIRMA.values()) + '</body></html>'
    caz('articol "ghid-cookies" in build, banner fara politica: tot OPRESTE la productie',
        arbore([banner], date_firma=None, cu_rute=False, construite_in_plus={'blog/ghid-cookies.html': articol}),
        1, 'OPRESTE  ' + fara_cookie, mediu='productie')
    caz('articol cu "termeni" si "confidentialitate" in adresa, operator numit fara pagini: OPRESTE la productie',
        arbore(cu_rute=False, construite_in_plus={'blog/termeni-si-confidentialitate-explicate.html': articol}),
        1, ['OPRESTE  L-15  lipseste ruta juridica /confidentialitate',
            'OPRESTE  L-15  lipseste ruta juridica /termeni'], mediu='productie')
    caz('paginile construite la locul din navigatie, fara fisier in sursa: verde la productie',
        arbore([banner], cu_rute=False, construite_in_plus={
            'juridic/confidentialitate.html': articol, 'juridic/termeni.html': articol, 'juridic/cookies.html': articol}),
        0, 'DEFECTE JURIDICE: 0 care opresc, 0 de avertisment', mediu='productie')

    # --- C-01, exceptia incarcatorului GA4 (felia seo-geo-gdpr) ---
    # Adresa si calea se lipesc la rulare: proba sta in depozit, iar poarta scaneaza depozitul.
    adresa_gtag = 'https://www.' + 'googletag' + 'manager.com/' + 'gtag' + '/js?id='
    exceptat = 'src/components/consimtamant/' + 'incarcator-ga4.ts'
    cu_adresa = 'const A = "' + adresa_gtag + '";\n'
    caz('numele Google in incarcatorul exceptat nu opreste',
        arbore(date_firma=None, fisiere_in_plus={exceptat: cu_adresa}), 0, 'C-01: exceptie pe sursa')
    caz('numele Google in alt fisier din sursa opreste',
        arbore(date_firma=None, fisiere_in_plus={'src/lib/' + 'analitica.ts': cu_adresa}), 1, 'furnizorul tert')
    caz('incarcatorul exceptat fara numele Google opreste: exceptie fara obiect',
        arbore(date_firma=None, fisiere_in_plus={exceptat: 'export const nimic = 1;\n'}), 1, 'fara obiect')
    inline = ('<script>var s=document.createElement("script");s.src="' + adresa_gtag + 'G-' + 'PROBA3S01";'
              'document.head.appendChild(s)</script>')
    caz('incarcator Google inline in HTML opreste, chiar langa fisierul exceptat',
        arbore([inline], date_firma=None, fisiere_in_plus={exceptat: cu_adresa}), 1, 'index.html: apare furnizorul tert')

    # date complete in configurare, dar ABSENTE din pagina livrata: asta opreste
    # pe orice mediu, fiindca nu e un loc gol, e o neconcordanta.
    d = arbore()
    cale = os.path.join(d, '.next', 'server', 'app', 'index.html')
    html = open(cale, encoding='utf-8').read().replace(DATE_FIRMA['cod_fiscal'], '')
    scrie(cale, html)
    caz('date declarate dar absente din pagina livrata opresc si pe staging', d, 1, 'nu apare in pagina livrata')

    # --- MUTANTUL: dovada ca cazul L-09 chiar trece prin tiparele SOL ---
    mutant_dir = tempfile.mkdtemp(prefix='mutant-juridic-')
    try:
        sursa = open(POARTA, encoding='utf-8').read()
        # se goleste lista de tipare SOL, si numai ea. Codul de dupa `return`
        # ramane pe loc: mutatia e minima si nu atinge nimic altceva.
        ancora = 'def tipare_sol():'
        inlocuitor = 'def tipare_sol():\n    return []  # mutant'
        if sursa.count(ancora) != 1:
            nu('MUTANT NEATERIZAT: ancora nu apare exact o data (' + str(sursa.count(ancora)) + ')')
        else:
            copie = os.path.join(mutant_dir, 'poarta-mutant.py')
            with open(copie, 'w', encoding='utf-8', newline='\n') as f:
                f.write(sursa.replace(ancora, inlocuitor))
            continut = open(copie, encoding='utf-8').read()
            if '# mutant' not in continut:
                nu('MUTANT NEATERIZAT: substitutia nu se regaseste in copie')
            else:
                d = arbore(['<a href="' + odr + '">SOL</a>'])
                try:
                    cod, iesire = ruleaza(d, 'staging', poarta=copie)
                    # 3 e deznodamantul bun: martorul din interiorul portii prinde
                    # mutatia si refuza sa dea verdict. 0 ar insemna ca numai proba
                    # asta apara tiparele. 1 ar insemna ca defectul e prins de alta
                    # ramura, deci cazul nu masoara ce pretinde.
                    if cod == 3 and 'L-09' in iesire:
                        ok('mutantul fara tiparele SOL cade la 3: martorul din poarta l-a prins')
                    elif cod == 0:
                        ok('mutantul fara tiparele SOL iese VERDE: cazul L-09 chiar le ataca')
                    else:
                        nu('mutantul a ramas rosu (cod ' + str(cod) + '): cazul L-09 pica pe altceva\n'
                           + iesire.strip())
                finally:
                    shutil.rmtree(d, ignore_errors=True)
    finally:
        shutil.rmtree(mutant_dir, ignore_errors=True)

    print('\nREZULTAT: ' + str(T) + ' trecute, ' + str(P) + ' picate')
    return 1 if P else 0


if __name__ == '__main__':
    sys.exit(main())

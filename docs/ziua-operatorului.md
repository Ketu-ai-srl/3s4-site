# Ziua operatorului

**Data:** 2026-09-24 · **Felia:** seo-geo-gdpr (planul valului S4, sectiunile 8-10)

Pasii prin care site-ul trece de la `"operator": null` (azi, decizia owner-ului din 24.09.2026:
"Nimeni deocamdata") la un operator de date numit, cu politicile publicate si GA4 pornit. Tot ce
depinde de operator e deja construit si sta in spatele unui comutator; ziua operatorului inseamna
completarea unui fisier, cateva variabile de mediu si verificari, nu constructie.

**Regula de mers:** pasii se fac in ordine. Fiecare are o comanda de verificare si rezultatul
asteptat. Un pas a carui verificare nu iese cum scrie aici opreste pasii de dupa el: nu se trece
mai departe "urmand sa revenim".

**Doua drumuri, dupa tara operatorului** (familia textelor juridice, `src/content/juridic/familie.ts`):

| | Operator din SEE (de pilda `3s.com.ro`) | `3s.md`, operator din Republica Moldova, pe modelul D2 |
|---|---|---|
| Unde sta operatorul | `config/operator.json` sau `OPERATOR_JSON` | `OPERATOR_JSON` in aplicatia domeniului; `config/operator.json` ramane `null` |
| Textele juridice | familia `see` (`/juridic` si cele 7 documente) | familia `md`: 8 documente in romana si engleza, adresele din `config/juridic-rute.json`, 6 publicate la poarta B |
| Datele firmei (L-01) | pe fiecare pagina livrata (Legea 365/2002 art. 5) | pe pagina de informatii legale din fiecare limba publicata, iar pe fiecare pagina o legatura spre ea in romana (Legea 284/2004 art. 12; decizia owner-ului: datele numai in paginile juridice) |
| Campuri inca inexistente | nu se admit: locul gol OPRESTE la productie | `sediu`, `numar_orc`, `cod_fiscal` cu marcajul din `config/model-d2.json`, plus `"model": "D2"` la radacina JSON-ului: AVERT pe orice mediu, pana in ziua extrasului |

Pasii de mai jos spun, unde difera, ce face fiecare drum.

## Ce se schimba, dintr-o privire

| Piesa | Azi (operator `null`) | Dupa pasii de mai jos |
|---|---|---|
| `config/operator.json` | `"operator": null` | obiectul firmei, din certificat |
| Bannerul de consimtamant | nu exista in pagina | apare, daca exista si ID-ul GA4 |
| Legatura "Setari cookie-uri" din subsol | nu exista | pe fiecare pagina |
| GA4 | nu se incarca niciodata | se incarca numai dupa acceptul categoriei Statistica |
| Analitica proprie, fara cookie (`UMAMI_URL` + `UMAMI_WEBSITE_ID`) | nu porneste, chiar cu variabilele date: niciun script, nicio rescriere `/a/`; jurnalul build-ului spune de ce | porneste NUMAI DUPA ACORD (masurarea S-B, decizia 13): de la urmatorul build bannerul exista si numai cu ea, iar scriptul se incarca abia dupa acceptul categoriei Statistica si se opreste pe loc la retragere; pe site-ul romanesc cere intai randul ei in `FURNIZORI` (`src/content/juridic/furnizori.ts`), cu tara gazdei instantei |
| Evidenta consimtamantului (`/api/consimtamant`) | calea raspunde 404 | un rand JSON in jurnalul serverului la fiecare alegere |
| Textele juridice (`src/content/juridic/`) | construite, nepublicate (`texteJuridice()` intoarce `null`) | randate de paginile feliei `juridic` |
| Paginile juridice (`/juridic` si cele 7 documente) | in cod, dar neconstruite: 404, absente din `RUTE`, din harta XML si din subsol | construite si publicate singure, prin `ruteJuridice()` (`src/content/juridic/publicare.ts`) |
| Harta site-ului si declaratia de accesibilitate | publicate | publicate, iar harta primeste singura cele 8 pagini |
| Poarta juridica L-01, L-15 | nu cer nimic | cer datele firmei (pe fiecare pagina la SEE, pe informatiile legale plus legatura la `md`) si paginile juridice; politica de cookie-uri o cere din clipa in care bannerul e in HTML-ul construit. Judeca operatorul REZOLVAT: `OPERATOR_JSON` inaintea lui `config/operator.json`, ca site-ul (vezi "`OPERATOR_JSON`: ce trebuie stiut") |

Conditia de aparitie a bannerului si a GA4 e una singura, in `src/lib/analitica.ts`: operator
numit **si complet** (denumire, sediu, adresa de contact, tara) **si** `NEXT_PUBLIC_GA4_ID` in
mediu la construire. Fara operator, GA4 ramane oprit chiar daca ID-ul exista.

Analitica proprie (`UMAMI_*`) are aceeasi conditie de operator, calculata pe acelasi operator
rezolvat (`OPERATOR_JSON` inaintea lui `config/operator.json`; `src/components/analitica/config.ts`),
dar nu cere ID-ul GA4 si nu asteapta bannerul. Oprirea e tacuta pentru vizitator si nu opreste
construirea: cu variabilele date si fara operator, `next build` scrie in jurnal un avertisment
(`[analitica] UMAMI_URL si UMAMI_WEBSITE_ID sunt setate, dar ...`) si nu pune nici scriptul, nici
rescrierile `/a/`. Variabilele se pot deci pune inaintea operatorului; porneste singura la primul
build in care operatorul exista.

## Pasul 0. Ce trebuie sa existe inainte

1. Firma inregistrata, cu certificatul de inregistrare la indemana (denumire, sediu, cod fiscal,
   numar de ordine in registrul comertului).
2. O adresa de e-mail pentru cererile privind datele personale, care primeste posta.
3. Decizia daca se numeste un responsabil cu protectia datelor (campul `dpo`, optional).
4. Revizuirea textelor din `src/content/juridic/` de catre un jurist. Textele sunt redactate de
   noi, pe cercetarea `gdpr-romania.md` si `gdpr-moldova.md`, si **nu sunt validate juridic**.

**Verificare:** se trimite un mesaj de proba la adresa de la punctul 2 si se citeste in cutia ei.
Pentru punctul 4 nu exista comanda: acordul juristului se noteaza in scris, cu data.

## Pasul 1. Completeaza comutatorul

In `config/operator.json` (sau in `OPERATOR_JSON`, pentru un domeniu anume), cheia `operator`
devine un obiect cu exact campurile din `_forma` (`denumire`, `sediu`, `email`, `telefon`,
`numar_orc`, `cod_fiscal`, `tara`, `dpo`), copiate din certificat, nu din memorie. `email` e adresa
de la pasul 0. `tara` e tara sediului si alege familia textelor: un stat din SEE -> familia `see`;
`Republica Moldova` (sau `Moldova`) -> familia `md`. Pentru orice alta tara nu exista texte, iar
construirea se opreste cu mesajul care numeste tara (Legea 195/2024 art. 27 ar cere un reprezentant
in Republica Moldova).

**Pe modelul D2 (`3s.md`, pana la extras):** `sediu`, `numar_orc` si `cod_fiscal` poarta EXACT
marcajul romanesc din `config/model-d2.json`, iar JSON-ul are `"model": "D2"` la RADACINA, langa
`"operator"`, nu in obiectul firmei (acolo `src/lib/operator.ts` il refuza drept camp necunoscut si
construirea se opreste). Configurarea poate doar aprinde modelul: marcajele si campurile admise stau in
`config/model-d2.json`, iar alta valoare decat `"D2"` la `model` opreste poarta (L-01).

Un camp gol sau un substituent (`TODO`, `de completat`, `<...>`) lasa analitica OPRITA si textele
neconstruite: informarea din politica ar avea locuri goale. Mai mult, `next build` se OPRESTE cu
lista campurilor care lipsesc (`verificaComutator` din `src/content/juridic/comutator.ts`): pachetul
de browser afla numai daca exista un operator numit, nu si daca e complet, deci un operator numit
pe jumatate ar pune in paleta de cautare legaturi spre pagini neconstruite.

**Verificare:**

```
pnpm exec vitest run tests/seo-geo-gdpr.test.ts
pnpm typecheck
python .claude/scripts/porti/poarta-juridic.py --mediu productie
```

Asteptat: probele trec; poarta juridica tipareste "operator: numit, din config/operator.json" (sau
"din OPERATOR_JSON", cand variabila e setata in mediul comenzii), "L-01: se aplica - operator: numit"
si "L-15: se aplica - operator: numit" (in loc de "NU SE APLICA") si cere datele firmei (L-01) si
paginile juridice (L-15). Pana la pasii 2 si 3 poarta e rosie la productie. E comportamentul voit.

Pentru un domeniu cu `OPERATOR_JSON`, comanda se ruleaza cu aceeasi valoare in mediu:
`OPERATOR_JSON='<valoarea din aplicatie>' python .claude/scripts/porti/poarta-juridic.py --mediu productie`.
Cu modelul D2, iesirea are in plus linia "model D2: aprins din OPERATOR_JSON" si cate un AVERT L-01
"model D2: <camp> poarta marcajul decis" pentru fiecare dintre cele trei campuri, si la productie: verdele
NU inseamna ca firma e identificata din extras.

## Pasul 2. Datele firmei (L-01)

**Familia `see`.** Legea 365/2002 art. 5 alin. (1) lit. a)-e) cere identificarea furnizorului pe
site: denumire, sediu, e-mail, telefon, numar de ordine in registrul comertului, cod fiscal. Poarta le
cere prezente in HTML-ul livrat al fiecarei pagini publice. Piesa care le afiseaza (subsolul, pagina
de informatii legale) e a feliilor `fundatie` si `juridic`; datele vin numai din operatorul rezolvat al
domeniului (`OPERATOR_JSON` inaintea lui `config/operator.json`, `src/lib/operator.ts`), nu se scriu
in pagini. Poarta judeca acelasi operator rezolvat.

**Familia `md` (`3s.md`).** Datele firmei stau numai pe pagina de informatii legale (decizia
owner-ului), deci poarta NU le cere pe fiecare pagina. Cere, in schimb (Legea 284/2004 art. 12 alin. (1)
lit. a)-c)):

1. fiecare camp pe pagina de informatii legale din FIECARE limba publicata (adresele din
   `config/juridic-rute.json`: `informatii-legale`, `ro` si `en`). Engleza conteaza din clipa in care o
   pagina construita e servita cu `<html lang="en">`. Un camp cu marcajul D2 se cauta pe pagina engleza ca
   marcajul englezesc din `config/model-d2.json`, nu ca valoarea romaneasca din operator;
2. pe fiecare pagina publica, o legatura (`<a href>`) spre pagina de informatii legale IN ROMANA.

Lipsa paginii sau a legaturii e AVERT pe staging si OPRESTE la productie; un camp absent de pe o pagina
de informatii legale care exista OPRESTE pe orice mediu (e o neconcordanta, nu un loc gol).

**Verificare:**

```
pnpm build
python .claude/scripts/porti/poarta-juridic.py --mediu productie
```

Asteptat: zero constatari L-01 care opresc. Pe modelul D2 raman cele trei AVERT "model D2", pana in ziua
extrasului.

## Pasul 3. Publica paginile juridice (L-15)

Nu se editeaza nicio lista de rute. Paginile feliei `juridic` (`/juridic` si cele 7 documente) sunt
deja in cod (`src/app/juridic/[[...document]]/page.tsx`) si intra singure in `RUTE`, sub marcajul
`<<felie:juridic>>` din `src/content/rute.ts`, prin `ruteJuridice()` din
`src/content/juridic/publicare.ts`, din clipa in care operatorul e numit si complet (pasul 1). De
acolo ajung singure in harta XML, in harta site-ului, in coloana Juridic din subsol (sase dintre
ele; subimputernicitii si indexul se leaga din pagini) si in legaturile bannerului. Cu operatorul
`null`, aceeasi pagina nu construieste nimic (`generateStaticParams` intoarce lista goala, iar
`dynamicParams = false` da 404 pe orice cale de sub `/juridic`).

**Familia `md` (`3s.md`): 8 chei, 6 publicate la poarta B.** Paginile de mai sus sunt ale familiei
`see`; un operator din Republica Moldova nu le publica. Documentele lui sunt cele 8 chei din
`config/juridic-rute.json` (`informatii-legale`, `confidentialitate`, `cookie-uri`, `termeni`, `dpa`,
`subimputerniciti`, `notificare-si-actiune`, `inteligenta-artificiala`), fiecare cu adresa engleza si
cea romaneasca si cu poarta la care se publica. La poarta B (`"poarta_curenta": "B"`) se publica 6;
`dpa` si `subimputerniciti` asteapta poarta C, iar legaturile spre ele devin text fara legatura. Poarta
juridica le cere (L-15) la adresele din acelasi fisier, in fiecare limba publicata, nu pe tiparele fixe
ale familiei `see`; o pagina se recunoaste in build (`.next/server/app/<adresa>.html`) sau in sursa,
inclusiv ca `page.<sufix>.tsx` sub un grup de rute (`src/app/(en)/legal/privacy/page.en.tsx`).

**Marcajele din paginile juridice (J-01).** Un text intre paranteze drepte, vizibil pe o pagina juridica
construita si care nu e o legatura, e AVERT pe staging si OPRESTE la productie, cu exceptia marcajelor
din registrul portii (`MARCAJE_ADMISE`, fiecare cu decizia lui pe rand): cele trei
`[de publicat înainte de primul client]` din termeni, cu perechea engleza, si marcajul D2 cat timp
modelul e aprins. Marcajul reprezentantului in UE, N23 si data publicarii NU sunt admise: se rezolva
inainte de publicare. Acoladele duble (un token de compunere nerezolvat) OPRESC pe orice pagina
construita, pe orice mediu.

Politica de cookie-uri (`/juridic/cookies`) se publica acum, odata cu celelalte, nu dupa GA4: din
clipa in care bannerul apare in HTML-ul construit (pasul 6), poarta juridica o cere (L-15) si
OPRESTE productia fara ea, oricare ar fi starea operatorului.

**Inainte de publicare, pe continut** (nimic din lista nu se poate masura din fabrica):

1. **Juristul** revizuieste cele 7 documente, cu prioritate Anexa A din `termeni.ts` (acordul de
   prelucrare, GDPR art. 28), licenta (`licenta.ts`) si lista subimputernicitilor
   (`subimputerniciti.ts`). Acordul se noteaza in scris, cu data.
2. **Owner-ul decide**, iar textele se completeaza dupa decizie:
   - subimputernicitii reali: azi lista numeste numai gazduirea (Amazon, decizia D4c); furnizorul
     modelelor AI care primesc continutul documentelor, cel de e-mail si canalul WhatsApp se adauga
     in `src/content/juridic/furnizori.ts`, cu tara si temeiul transferului, INAINTE de publicare;
   - termenele de anunt: cu cat timp inainte se anunta un pret nou, o schimbare a termenilor si un
     subimputernicit nou (textele spun regula, fara cifra, pana la decizie);
   - titularul drepturilor asupra codului (licenta spune "ale titularilor lor", fara nume);
   - daca fluxul de inregistrare al platformei cere acceptarea termenilor si a Anexei A (termenii
     afirma ca da);
   - afirmatiile ramase neconfirmate din `docs/afirmatii/juridic.md`.
3. **Textele de lege se recitesc la sursa oficiala.** Pe 25.09.2026 portalul legislativ
   (legislatie.just.ro) a inchis conexiunea la fiecare incercare, iar legis.md a cerut o verificare
   anti-robot. Legile nr. 190/2018, 506/2004 si 365/2002 au fost citite in textele publicate de
   ANSPDCP, iar pentru Legea nr. 195/2024 a Republicii Moldova numai titlul si prezentarea
   autoritatii, nu textul articolelor (`src/content/juridic/acte.ts`). Trimiterile la articolele
   ei din politica de confidentialitate (felia 44) se verifica pe textul oficial.
4. Datele de contact ale autoritatilor din `src/content/juridic/autoritati.ts` se reiau de pe
   dataprotection.ro si datepersonale.md (citite pe 24.09.2026).

**In depozit, odata cu operatorul** (piese care nu sunt ale feliei `juridic`; le schimba
dispecerul, la reconciliere):

1. Cititorul declaratiilor de raspuns (`tests/browser/ajutor/raspunsuri.ts`) citeste `rute.ts` ca
   text si cere ca rutele gasite acolo (`cale: "..."` sub marcaj) sa fie exact cele din modulul
   `RUTE`. Cele 8 rute juridice vin din apelul `...ruteJuridice()`, nu sunt scrise pe litere, deci
   din ziua operatorului `geo.spec.ts` iese rosu pana cand cititorul recunoaste apelul (sau
   rutele se scriu pe litere sub marcaj).
2. In `config/seo/juridic.json`, declaratiile din `raspuns_autonom_cu_operator` se muta in
   `raspuns_autonom` (azi cititorul ar refuza o ruta care nu e in `RUTE`).
3. `poarta-rute.py` si `poarta-registru-rute.py` citesc tot `cale: "..."` din text: nu vad cele 8
   rute. Nu iese niciun rosu fals; iese o pata oarba (pagina juridica nu e ceruta de ele).
4. `lastmod` din harta XML: `surseleRutei` (`src/lib/istoric-git.ts`) cauta pagina la
   `src/app/<cale>/page.tsx`, iar pagina celor 8 rute sta sub segmentul optional
   `[[...document]]`, deci pentru ele campul lipseste (nu apare o data falsa). Verificarea de la
   pasul 8 ("cele doua numere egale") iese atunci cu 8 diferenta, pana cand `surseleRutei`
   recunoaste segmentul optional.

**Verificare:**

```
python .claude/scripts/porti/poarta-juridic.py --mediu productie
for p in "" /informatii-legale /confidentialitate /termeni /cookies /politici-publice /licenta-software /subimputerniciti; do curl -s -o /dev/null -w "%{http_code} /juridic$p\n" https://<domeniu>/juridic$p; done
curl -s https://<domeniu>/juridic/confidentialitate | grep -o 'data-art13="[^"]*"' | sort -u | wc -l
curl -s https://<domeniu>/juridic/cookies | grep -o 'data-l284="[^"]*"' | sort -u | wc -l
PORT_3S=3907 pnpm exec playwright test --config tests/browser/playwright.config.ts tests/browser/juridic.spec.ts
```

Asteptat: zero constatari L-15; 8 randuri `200`; 12 chei `data-art13` distincte (G-MD-01) si 8
chei `data-l284` distincte (G-MD-08: `2b`-`2h` si `masuri`); proba `juridic.spec.ts` verde, care
cu operator numit cere invers fata de azi: 200 pe cele 8 pagini, prezenta in harta XML si in subsol,
si bugetul de la 390 si pe `/juridic/termeni`. Forma paginilor, sigiliul SHA-256, portile G-MD si
poarta juridica pe paginile construite le masoara deja azi `juridic-comutator.spec.ts`, pe copia cu
operator sintetic.

## Pasul 4. Furnizorii, cum sunt in realitate

`src/content/juridic/furnizori.ts` e sursa unica pentru destinatarii din politica, pentru politica
de cookie-uri si pentru panoul bannerului. Doua lucruri raman de confirmat, fiindca azi nu se pot
sti:

1. **Gazda site-ului public.** Serverul care serveste site-ul vede adresele IP ale vizitatorilor,
   deci e destinatar. Se adauga ca furnizor, cu tara si mecanismul de transfer.
2. **Entitatea Google cu care se incheie contractul GA4**, din termenii de prelucrare acceptati in
   cont (Admin, Account settings, Data processing terms). Daca difera de ce scrie in `destinatar`,
   se corecteaza.

Tot aici se bifeaza lista de verificare a acordurilor de prelucrare (Amazon, Google, furnizorul de
e-mail), tinuta in depozitul fabricii, nu in acest depozit public.

**Verificare:**

```
pnpm exec vitest run tests/seo-geo-gdpr.test.ts -t "G-MD-11"
```

Asteptat: fiecare furnizor are tara si un mecanism din lista inchisa; cei din afara SEE au si
temeiul pentru vizitatorii din Republica Moldova.

## Pasul 5. Contul GA4

1. Se creeaza proprietatea GA4, cu un flux web pe domeniul de productie.
2. **Pastrarea datelor: 2 luni**, si fara resetare la activitate noua (Admin, Data collection and
   modification, Data retention). Politica de confidentialitate spune 2 luni; setarea trebuie sa
   spuna la fel.
3. Semnalele Google si personalizarea reclamelor, oprite. Codul le trimite oricum oprite
   (`src/components/consimtamant/incarcator-ga4.ts`); setarea din cont e a doua plasa.
4. Se accepta termenii de prelucrare a datelor (pasul 4, punctul 2).
5. **Masurarea imbunatatita: numai paginile citite** (Admin, Data collection and modification,
   Data streams, fluxul web, Enhanced measurement). Raman pornite comutatorul general si paginile
   citite, cu schimbarile de pagina din istoria browserului: navigarea in site nu reincarca
   pagina, deci fara ele s-ar numara numai prima pagina a vizitei. Se opresc derularea, clicurile
   spre alte site-uri, cautarea pe site, video, descarcarile de fisiere si interactiunile cu
   formulare. Pornite, ele ar trimite singure evenimente din afara listei inchise
   (`src/components/consimtamant/evenimente.ts`), pe care politicile nu le descriu; codul site-ului
   nu le poate opri, se opresc numai din flux.
6. Se noteaza ID-ul de masurare (`G-...`).

**Verificare** (API-ul de administrare GA4, cu un jeton al contului):

```
curl -s -H "Authorization: Bearer <jeton>" \
  https://analyticsadmin.googleapis.com/v1beta/properties/<ID_PROPRIETATE>/dataRetentionSettings
curl -s -H "Authorization: Bearer <jeton>" \
  https://analyticsadmin.googleapis.com/v1alpha/properties/<ID_PROPRIETATE>/dataStreams/<ID_FLUX>/enhancedMeasurementSettings \
  | python -c "import json,sys; d=json.load(sys.stdin); oprite=('scrollsEnabled','outboundClicksEnabled','siteSearchEnabled','videoEngagementEnabled','fileDownloadsEnabled','formInteractionsEnabled'); rele=[k for k in oprite if d.get(k)]+[k for k in ('streamEnabled','pageChangesEnabled') if not d.get(k)]; print('ABATERE: '+', '.join(rele) if rele else 'OK')"
```

Asteptat: `"eventDataRetention": "TWO_MONTHS"`, `"userDataRetention": "TWO_MONTHS"` si
`resetUserDataOnNewActivity` fals; apoi `OK` pentru masurarea imbunatatita: `streamEnabled` si
`pageChangesEnabled` adevarate, iar cele sase de mai sus false. Scriptul citeste un camp lipsa drept
fals, fiindca raspunsurile JSON ale API-urilor Google pot omite campurile booleene false (forma
exacta a raspunsului NEMASURATA: nu am avut un jeton). Numele campurilor sunt din referintele
v1beta (`dataRetentionSettings`, citita pe 24.09.2026) si v1alpha (`EnhancedMeasurementSettings`,
citita pe 25.09.2026); aceeasi referinta v1alpha are si metoda de scriere,
`updateEnhancedMeasurementSettings` (PATCH, cu `updateMask` in snake_case), daca setarea se face
din API in locul interfetei. Pastrarea datelor nu atinge rapoartele agregate din cont, fara
identificatori; politica spune asta explicit.

## Pasul 6. Variabilele de mediu, citite la CONSTRUIRE

Toate se citesc cand se construieste site-ul (paginile sunt statice), deci fiecare schimbare cere
un build nou. In Coolify se marcheaza ca variabile de build.

| Variabila | Valoare | Ce face |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | ID-ul de la pasul 5 | porneste bannerul, legatura din subsol, evidenta si incarcatorul GA4. O valoare care nu are forma `G-...` opreste construirea |
| `SITE_URL` | `https://www.3s.com.ro`, la lansarea pe domeniul real | canonical-urile, harta de site, `robots.txt`, `/llms.txt`, imaginea sociala, datele structurate. Numai originea, pe https; altfel construirea se opreste |
| `GOOGLE_SITE_VERIFICATION` | codul din Search Console (metoda eticheta HTML) | eticheta de verificare din `<head>` |
| `SITE_ENV` | `productie`, numai pe productie | deschide indexarea: `robots.txt` cu semnalul de continut, fara `X-Robots-Tag`; adauga antetul HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`), care intra in manifestul build-ului, deci cere si el variabila la construire |

**Variabilele formularului, citite la RULARE** (nu cer build nou, dar cer repornirea containerului).
Formularul trimite numai cu operator complet (pasul 1) si cu destinatie; fara ele raspunde "inactiv".

| Variabila | Valoare | Ce face |
|---|---|---|
| `FORMULARE_DESTINATIE` | adresa HTTPS a canalului de lead-uri (webhook CRM sau serviciu de e-mail) | fiecare trimitere valida pleaca aici, o data, ca JSON: campurile formularului, `marketing`, `versiune_informare` (amprenta notei de informare pe care a vazut-o omul, aceeasi metoda ca la cookie-uri) si `primit` |
| `FORMULARE_SECRET` | un sir aleator lung (de pilda `openssl rand -hex 32`), pastrat si in destinatie | fiecare cerere spre destinatie poarta antetul `X-Formular-Secret` cu valoarea lui; destinatia respinge cererile fara el. Fara variabila, antetul lipseste si oricine afla adresa destinatiei poate scrie direct in ea |

**Verificare:** destinatia primeste o trimitere de proba de pe site cu `X-Formular-Secret` egal cu
valoarea setata si cu `versiune_informare` de forma `ro-` + 8 caractere hexazecimale; aceeasi cerere
trimisa direct la destinatie, fara antet, e respinsa de ea.

**Verificare, dupa deploy:**

```
curl -s https://<domeniu>/ | grep -c 'data-consimtamant'
curl -s https://<domeniu>/ | grep -c 'data-cookie-settings'
curl -s https://<domeniu>/ | grep -o '<link rel="canonical"[^>]*>'
curl -s https://<domeniu>/ | grep -o 'google-site-verification" content="[^"]*"'
curl -s https://<domeniu>/robots.txt
curl -sI https://<domeniu>/ | grep -i x-robots-tag
curl -s https://<domeniu>/llms.txt | head -5
```

Asteptat: bannerul si legatura sunt in HTML-ul servit (cel putin 1 fiecare); canonical-ul e pe
domeniu; eticheta de verificare are codul; `robots.txt` are `Content-Signal: search=yes,
ai-input=yes, ai-train=yes`, grupul `Bytespider` cu `Disallow: /` si `Sitemap:` pe domeniu; niciun
`X-Robots-Tag`; `/llms.txt` incepe cu numele marcii.

**Daca bannerul sau canonical-ul lipsesc**, variabilele n-au ajuns la `pnpm build`. `Dockerfile`
nu declara azi niciun `ARG` pentru ele (NEMASURAT daca Coolify le injecteaza singur); atunci se
adauga in etapa `builder`, inaintea lui `RUN pnpm build`.

## Variabile pe domeniu (tabel de referinta)

Acelasi cod ruleaza ca aplicatii separate in Coolify, cate una pe domeniu: mediul de proba
(`3s4.ke2.in`), site-ul pentru clientii internationali (`3s.md`, in engleza si romana) si, mai
tarziu, `3s.com.ro`. Ce difera de la un domeniu la altul sta in variabilele de mai jos, nu in cod.
In tabel, valorile dintre ghilimele (`"..."`) sunt de forma; sunt reale numai numele domeniilor
(`3s4.ke2.in`, `3s.md`, `3s.com.ro`) si adresa implicita a raportarilor de securitate
(`security@3s.com.ro`). Ce e de forma si ce e real in blocul de exemple e spus chiar deasupra lui.

**Toate se citesc la CONSTRUIRE**, deci orice schimbare cere un build nou; exceptiile sunt scrise
in coloana "Citita la". In Coolify se pun ca variabile obisnuite (build si rulare), nu "numai build".

| Variabila | Ce face | Fara ea | Citita la | Cand se seteaza |
|---|---|---|---|---|
| `SITE_URL` | Originea domeniului, numai `https://gazda`, fara cale sau parametri. Din ea se compun canonical-urile, harta de site, `robots.txt`, `/llms.txt`, `security.txt`, imaginea sociala, datele structurate (JSON-LD) si originea pe care o accepta formularele. O valoare cu cale, parametri sau pe `http` opreste construirea | `https://3s4.ke2.in` (mediul de proba) | construire | la crearea aplicatiei fiecarui domeniu |
| `SITE_ENV` | `productie` deschide indexarea (`robots.txt` cu semnalul de continut si harta, fara `X-Robots-Tag`) si adauga HSTS. Orice alta valoare lasa domeniul neindexat | neindexat | construire; antetul `X-Robots-Tag` din middleware, si la rulare | `productie` numai pe domeniul lansat |
| `NEXT_PUBLIC_GA4_ID` | Porneste GA4 cu bannerul de consimtamant, numai daca exista si un operator complet (fara operator, GA4 ramane oprit chiar cu ID). Analitica proprie (`UMAMI_*`) nu depinde de el si nu asteapta bannerul, dar are aceeasi conditie de operator | fara GA4 | construire (inlocuita in pachetul de browser) | dupa Pasul 5, cu proprietatea GA4 a domeniului |
| `OPERATOR_JSON` | Operatorul de date al domeniului, ca JSON cu schema din `config/operator.json`: `{"operator": null}` sau `{"operator": {"denumire": "...", "sediu": "...", "email": "...", "telefon": "", "numar_orc": "", "cod_fiscal": "", "tara": "...", "dpo": ""}}`. Are PRIORITATE fata de fisier si e validat cu aceeasi functie: un JSON stricat, o forma gresita (fara cheia `operator`, camp necunoscut, camp care nu e text) sau un operator numit dar incomplet opresc construirea, cu un mesaj care numeste variabila si campurile care lipsesc (de pilda `lipsesc: sediu, email, tara`). `{"operator": null}` inseamna "acest domeniu nu are operator", chiar daca fisierul numeste unul. Numit si complet, pornesc paginile juridice, subsolul, formularele, bannerul (cu `NEXT_PUBLIC_GA4_ID`) si analitica proprie (cu `UMAMI_*`), ca pentru fisier. Pachetul de browser nu vede variabila, ci valoarea derivata `NEXT_PUBLIC_OPERATOR_NUMIT` (mai jos), deci si cautarea Ctrl+K gaseste paginile juridice | decide `config/operator.json` (azi `null`) | construire SI rulare, aceeasi valoare in ambele: `/api/formular` si middleware o citesc la rulare | cand exista firma care opereaza domeniul (Pasii 0-1) |
| `SITE_ALTERNATE` | Variantele site-ului pentru motoarele de cautare, ca perechi `cod=adresa` separate prin virgula; regulile mai jos. Fiecare pagina emite `<link rel="alternate" hreflang>` spre aceeasi cale pe fiecare varianta, inclusiv spre ea insasi | nimic (nicio legatura) | construire | cand exista cel putin doua domenii publicate; aceeasi valoare pe TOATE |
| `SITE_EDITII` | Editiile pe care le construieste aplicatia, separate prin virgula: `ro-RO` (site-ul romanesc, la radacina), `en` (site-ul international, in engleza americana, la radacina), `ro-MD` (romana pentru Republica Moldova, sub `/ro`). Combinatiile admise: `ro-RO` singur, `en`, `en,ro-MD`; un cod necunoscut, un cod repetat sau alta combinatie opresc construirea, cu motivul. Coerenta cu `SITE_ALTERNATE`: cand `SITE_EDITII` NU e setata, iar `SITE_ALTERNATE` numeste domeniul acestui site (`SITE_URL`, cu sau fara prefix) pentru o limba pe care site-ul romanesc nu o are (de pilda `en=https://3s.md`), construirea se opreste, altfel site-ul romanesc ar iesi tacut pe domeniul international; o valoare scrisa explicit nu se mai compara. `NEXT_PUBLIC_SITE_EDITII` o calculeaza construirea: nu se seteaza de mana (o valoare diferita opreste construirea). Pe build-ul international, raspunsurile poarta `Content-Language: en`, iar cele de sub `/ro` `Content-Language: ro-MD` | `ro-RO`: site-ul romanesc, exact ca inainte de editii | construire | pe `3s.md`: `en,ro-MD`, pusa odata cu paginile EN de baza (start, platforma, preturi, Enterprise, contact, despre noi), nu inainte: pana atunci `3s.md` serveste site-ul romanesc, neindexat, iar fara `SITE_ALTERNATE` setata acolo verificarea de coerenta n-are ce opri. `3s4.ke2.in` si `3s.com.ro` raman fara ea |
| `UMAMI_URL` | Originea instantei de statistica proprie (fara cookie), numai `https://gazda`; `http` doar pe masina locala. Scriptul se incarca prin calea proprie a site-ului, `/a/script.js`, iar evenimentele pleaca la `/a/api/send`: serverul site-ului le transmite instantei, browserul vorbeste numai cu domeniul (poarta C-01 ramane adevarata). Se seteaza impreuna cu `UMAMI_WEBSITE_ID`: una fara cealalta opreste construirea. **Porneste numai cu un operator numit si complet**, ca GA4 (planul S4, sectiunea 9: analitica prelucreaza date personale, deci cere operator): fara operator ramane oprita chiar cu variabilele date, fara script si fara rescrieri, iar `next build` scrie un avertisment in jurnal | nicio analitica proprie, nicio rescriere | construire (rescrierile intra in manifest) | cand instanta si site-ul ei din aplicatie exista; se pot pune si inaintea operatorului, porneste singura la primul build in care el exista |
| `UMAMI_WEBSITE_ID` | Identificatorul site-ului din aplicatia de statistica (UUID), unul pe domeniu, ca vizitele sa nu se amestece. Nu e secret: se vede in pagina | vezi `UMAMI_URL` | construire | odata cu `UMAMI_URL` |
| `INDEXNOW_KEY` | Cheia IndexNow a domeniului (8-128 de caractere: a-z, A-Z, 0-9, cratima). `/indexnow.txt` o intoarce ca text simplu, iar motoarele o citesc ca sa verifice ca domeniul e al celui care trimite adresele. O cheie de alta forma opreste construirea (mesajul nu repeta valoarea). Nu trimite nimic singura: trimiterea e `scripts/indexnow.mjs`, la comanda | `/indexnow.txt` raspunde 404 | construire | la lansarea publica a domeniului |
| `CANALE_JSON` | Canalele de contact ale domeniului, ca JSON: `{"formulare": false, "whatsapp": "...", "telefon": "...", "email": "...", "emailSecuritate": "..."}`. `formulare` porneste sau opreste formularele de pe /contact si /enterprise si punctul `/api/formular`: cu `false`, formularul nu trimite oricare ar fi operatorul, iar `/api/formular` raspunde 404 inaintea oricarei alte verificari. `whatsapp` = 8-15 cifre fara plus (forma legaturii wa.me), `telefon` = forma E.164 cu plus, `email` = adresa de contact (o cheie prezenta si goala inseamna fara adresa pe domeniu), `emailSecuritate` = adresa raportarilor de securitate. `formulare` e `true` sau `false`. Fiecare cheie e optionala si ia implicitul din coloana alaturata. Un JSON stricat, o cheie necunoscuta, un tip gresit sau un numar ori o adresa de alta forma opresc construirea, cu un mesaj care numeste variabila si campul; la fel `formulare: false` fara niciun canal nevid (whatsapp, telefon sau email). Legaturile catre canale le face `src/content/canale.ts`, cu codul `ref` al paginii in text | formulare pornite (decide operatorul), fara WhatsApp si fara telefon, adresa din `config/brand.json`, `emailSecuritate` = `security@3s.com.ro` | construire SI rulare, aceeasi valoare in ambele: `/api/formular` o citeste la rulare | la crearea aplicatiei unui domeniu care nu primeste formulare (`3s.md`); adresa de contact se adauga cand e confirmata |

Pentru un domeniu ca `3s.md`. De FORMA, nu reale: `OPERATOR_JSON` (firma, strada si adresa pe domeniul
rezervat `.test`; operatorul real al lui `3s.md` e pe modelul D2, Pasul 1), `UMAMI_URL`, `UMAMI_WEBSITE_ID`
si `INDEXNOW_KEY`. REALE: domeniile din `SITE_URL` si `SITE_ALTERNATE`, valoarea `productie` a lui
`SITE_ENV` (cea care se pune la lansare, nu inainte) si tot `CANALE_JSON` (numarul publicat pe site si
adresa de securitate):

```
SITE_URL=https://3s.md
SITE_ENV=productie
SITE_ALTERNATE=ro-RO=https://3s.com.ro,en=https://3s.md,ro-MD=https://3s.md/ro,x-default=https://3s.md
OPERATOR_JSON={"operator": {"denumire": "Exemplu Operator SRL", "sediu": "Strada Exemplului 1, Orasul", "email": "date@exemplu.test", "telefon": "", "numar_orc": "", "cod_fiscal": "", "tara": "Romania", "dpo": ""}}
UMAMI_URL=https://statistica.exemplu.test
UMAMI_WEBSITE_ID=00000000-0000-4000-8000-000000000000
INDEXNOW_KEY=cheie-de-exemplu-indexnow-1234
# CANALE_JSON are valori reale: numarul e cel publicat pe site; adresa ramane goala pana e confirmata
CANALE_JSON={"formulare":false,"whatsapp":"37360055599","telefon":"+37360055599","email":"","emailSecuritate":"security@3s.com.ro"}
```

In Coolify valoarea lui `OPERATOR_JSON` se lipeste ca text, fara ghilimele in plus; intr-un fisier
`.env` local se pune intre apostrofuri.

**Variabila derivata `NEXT_PUBLIC_OPERATOR_NUMIT` nu se seteaza de mana.** O defineste
`next.config.ts` la construire din `OPERATOR_JSON` (`true`, `false`, sau `null` cand `OPERATOR_JSON`
nu e setata), o inlocuieste Next in toate pachetele, iar `src/content/juridic/publicare.ts` o citeste
inaintea variabilei si a fisierului. Pachetul de browser nu vede `OPERATOR_JSON`, deci fara ea lista de
rute din browser ar decide dupa fisier. O valoare pusa de mana in mediul build-ului este ignorata:
cheia din `next.config.ts` are prioritate, fiindca `define-env.js` din Next 15.5.25 aplica intai
variabilele `NEXT_PUBLIC_*` din mediu, apoi `env` din configurare (citit in cod si masurat pe
30.09.2026: pe o copie cu `OPERATOR_JSON` complet si `NEXT_PUBLIC_OPERATOR_NUMIT=false` pusa de mana in
mediul build-ului, cautarea Ctrl+K a gasit cele trei pagini juridice la 1440 si la 390 - `innerWidth`
citit 1440 si 390 - iar `/juridic` si `/juridic/confidentialitate` au raspuns 200, deci valoarea pusa
de mana n-a schimbat nimic).

### `SITE_ALTERNATE`: regulile listei

Regulile lui Google, citite pe 30.09.2026 in documentatia oficiala
(https://developers.google.com/search/docs/specialty/international/localized-versions): "Each
language version must list itself as well as all other language versions", "If two pages don't both
point to each other, the tags will be ignored", adresele sunt complete (`https://...`), codurile sunt
limba (ISO 639-1) cu regiune optionala (ISO 3166-1 alfa-2), iar `x-default` e recomandat. O lista
care le incalca opreste construirea, cu variabila si motivul in mesaj:

- lista contine domeniul curent, fara prefix de cale: fiecare pagina se refera si la ea insasi. Pe
  fiecare domeniu, valoarea e aceeasi, deci variantele se confirma reciproc din constructie;
- o adresa e o origine `https` cu un prefix de cale optional, pentru versiunea unei limbi care sta pe
  acelasi domeniu (`ro-MD=https://3s.md/ro`); prefixul se lipeste fara `//`, iar bara finala se ignora;
- un cod apare o singura data; forma se verifica (`ro`, `ro-MD`), nu si apartenenta la listele ISO: un
  cod inexistent trece de build si Google il ignora, deci codurile se citesc o data cu ochii;
- `x-default` se poate da explicit ca pereche si trebuie sa fie una dintre variantele listate; fara el
  se emite spre PRIMA varianta din lista, deci prima pozitie conteaza (pentru `3s.md`, varianta engleza
  e cea spre care vrem sa cada vizitatorii fara varianta potrivita: se scrie explicit);
- metoda e cea cu elemente `<link>` in `<head>`; harta de site NU poarta alternate. Google spune ca cele trei
  metode sunt echivalente ("The three methods are equivalent from Google's perspective") si ca folosirea
  mai multor nu aduce nimic in cautare ("there's no benefit in Search");
- pagina de negasit nu primeste alternate;
- versiunea romaneasca a lui `3s.md` (sub `/ro`) nu exista inca: felia de limbi care urmeaza trebuie sa
  scoata prefixul din calea curenta inainte de a compune adresele, altfel pagina `/ro/preturi` ar
  indica `https://3s.md/ro/ro/preturi`.

**Verificare** (dupa deploy, pe fiecare domeniu):

```
curl -s https://<domeniu>/preturi | grep -io '<link[^>]*hreflang[^>]*>'
curl -s https://<domeniu>/preturi | grep -o '<link rel="canonical"[^>]*>'
```

Asteptat: patru elemente (cate unul pe varianta si `x-default`), fiecare cu calea `/preturi`;
varianta domeniului curent are exact adresa din `canonical`; pe radacina, adresele nu au bara finala.

### Analitica proprie: ce se hotaraste inainte de a o porni pe un domeniu

Analitica proprie nu scrie cookie-uri si nimic in stocarea locala si respecta "Do Not Track"; nu
asteapta bannerul (fapte si surse: `src/components/analitica/config.ts`). **Porneste numai cu un
operator numit si complet** (planul S4, sectiunea 9, ca GA4): pe un domeniu fara operator, cu
variabilele `UMAMI_*` date, nu exista script, nu exista rescrierile `/a/` (`GET /a/script.js` si
`POST /a/api/send` raspund 404), nimic nu ajunge la instanta, iar `next build` scrie in jurnal
avertismentul care spune de ce (masurat pe o copie fara operator: proba `martor NEGATIV: domeniu FARA
operator` din `tests/browser/multi-domeniu.spec.ts`). Cand porneste, politica de
confidentialitate si cea de cookie-uri primesc singure paragraful despre ea, cu data 30 septembrie
2026 (`src/content/juridic/analitica.ts`); fara variabile, documentele raman cele de dinainte. Trei
lucruri raman de hotarat, iar textele NU sunt validate juridic:

1. **Cine administreaza instanta.** Textul spune "instalata pe un server administrat de noi". E adevarat
   numai daca cel care administreaza instanta e operatorul domeniului; pentru un operator care foloseste
   instanta altcuiva, acela e imputernicit si intra in lista destinatarilor
   (`src/content/juridic/furnizori.ts`), cu tara si mecanismul de transfer. Tara si furnizorul serverului
   nu se afirma in text, fiindca nu se cunosc din depozit.
2. **Cat timp se pastreaza datele.** Aplicatia le tine nelimitat pana le sterge cineva (FAQ-ul oficial,
   intrebarea 8: https://docs.umami.is/docs/faq), iar textul spune "cat timp ne ajuta, apoi le stergem".
   Se fixeaza o perioada, se scrie in `PASTRARE` (`confidentialitate.ts`) si se ruleaza stergerea in
   aplicatie; pana atunci promisiunea din text nu are cine s-o tina.
3. **Daca masurarea are nevoie de acord.** Textul afirma ce face masurarea, nu ca "nu cere acord": ghidurile
   EDPB 2/2023 (octombrie 2024) trateaza ca acces la echipamentul terminal (art. 5 alin. (3) ePrivacy) si
   colectarea de informatii generate local prin API-urile browserului, de felul dimensiunii ecranului sau a
   limbii. Juristul decide; daca cere acord, pornirea dupa banner e o schimbare mica de cod.
   Un fapt masurat pe 30.09.2026 (mai intai de critic, apoi reverificat pe o copie proprie, cu operator, GA4,
   banner si o instanta falsa): dupa "Refuz tot" din banner (alegerea se scrie ca `statistica: false`,
   `metoda: refuz-tot`), masurarea proprie continua, doua trimiteri spre `/a/api/send` la doua navigari
   pe client, fiindca politica spune deschis ca ea nu asteapta alegerea din banner. Bannerul spune "Cu
   acordul tau, masuram vizitele cu Google Analytics": nu contrazice (analitica proprie nu e Google
   Analytics), dar un vizitator care refuza se poate astepta sa nu fie masurat deloc. Trei iesiri, de
   ales cu juristul:
   (a) ramane asa, cu textul juridic actual; (b) masurarea proprie se opreste la "Refuz tot" (schimba
   textele juridice, care spun azi ca ea nu asteapta alegerea din banner, si lista stocarii declarate:
   trackerul isi opreste singur trimiterea numai prin marcajul `umami.disabled` din stocarea locala, deci
   fie se scrie acel marcaj la refuz, fie scriptul nu se mai incarca dupa refuz); (c) porneste numai dupa
   acceptul categoriei Statistica (schimba textele juridice si pe cele ale bannerului). Bannerul e piesa
   inghetata (`src/components/consimtamant`): orice schimbare de text sau de comportament al lui trece prin
   dispecer, iar analitica proprie nu se atinge pana la decizia juristului.

   **Pentru `3s.md`, intrebarea 3 e inchisa de decizia 13 a owner-ului (30.09.2026): masurarea B,
   analitica proprie numai dupa acord**, adica iesirea (c), cu textele juridice ale familiei `md` compuse in
   starea S-B. Schimbarea de cod (pornirea dupa acceptul din banner) e a unei felii urmatoare; pana atunci
   `UMAMI_URL` si `UMAMI_WEBSITE_ID` nu se pun pe aplicatia `3s.md`, fiindca, cu operator numit, masurarea
   ar porni fara acord, contra deciziei. Pentru celelalte domenii intrebarea ramane la jurist.

**Verificare** (dupa deploy):

```
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://<domeniu>/a/script.js
curl -s https://<domeniu>/ | grep -o '<link rel="preload" href="/a/script.js"[^>]*>'
```

Asteptat: `200` si un tip JavaScript (scriptul vine de la instanta, prin serverul site-ului); un rand de
preincarcare pe calea proprie, niciunul spre alta gazda. In browser, la fila Network, cererile merg numai
spre domeniu (`/a/script.js`, `/a/api/send`), iar dupa o vizita apare un rand in Realtime-ul aplicatiei.
Pe un domeniu FARA operator, cu aceleasi variabile, cele doua comenzi dau `404` si zero randuri: e starea
corecta, nu o defectiune (jurnalul build-ului are avertismentul care o explica).
**Nemasurat, se verifica aici:** adresa IP a vizitatorului trece prin trei proxy-uri (cel al site-ului,
serverul Next, cel al instantei) si instanta citeste primul element din `X-Forwarded-For`; o vizita
de pe un telefon pe date mobile trebuie sa apara cu tara corecta, nu cu cea a serverului.

### `OPERATOR_JSON`: ce trebuie stiut

- **Build si rulare, aceeasi valoare.** Paginile (juridice, formulare, banner) se decid la build; ruta
  `/api/formular` si middleware-ul citesc valoarea la rulare. O valoare doar la build lasa formularul
  aratat ca activ si raspunzand "inactiv".
- **Operator din afara SEE.** Familia textelor se alege dupa `tara` (`familieJuridica`,
  `src/content/juridic/familie.ts`): un operator din Republica Moldova primeste familia `md` (cele 8
  documente, Pasul 3), nu mai opreste construirea. Numai o tara din afara SEE si a Moldovei o opreste.
- **Cautarea Ctrl+K.** Pachetul de browser nu primeste variabilele care nu incep cu `NEXT_PUBLIC_`, deci
  fara o valoare calculata lista de rute din browser ar decide dupa `config/operator.json`, nu dupa
  `OPERATOR_JSON`. Masurat pe 30.09.2026, INAINTE de reparatie, pe o copie cu fisierul pe `null` si
  operatorul numai in mediu: cele opt pagini, harta, subsolul (sase legaturi), formularul si consola
  browserului erau in regula, dar "confiden", "cookie" si "termeni" dadeau zero rezultate in cautare.
  Reparat: `next.config.ts` defineste `NEXT_PUBLIC_OPERATOR_NUMIT` din `OPERATOR_JSON` (tabelul de mai
  sus), iar `publicare.ts` o citeste inaintea variabilei si a fisierului; acopera si cazul invers (operator
  in fisier si `{"operator": null}` in mediu: paleta nu arata pagini pe care serverul nu le construieste).
  Probele: `tests/multi-domeniu-operator.test.ts` (valoarea din `next.config.ts` in cele trei stari, lista
  de rute pe simulacrul pachetului de browser, expresia literala din `publicare.ts`) si
  `tests/browser/multi-domeniu.spec.ts` (Ctrl+K pe o copie cu operatorul numai in mediu).
- **Poarta juridica judeca operatorul rezolvat (REPARAT, 01.10.2026).** Pana atunci
  `.claude/scripts/porti/poarta-juridic.py` citea numai `config/operator.json`: masurat pe 30.09.2026, pe o
  copie cu operatorul numai in `OPERATOR_JSON`, tiparea "L-01: NU SE APLICA" peste cele opt pagini juridice
  publicate. Acum `stare_operator` primeste mediul ca parametru, citit o singura data la pornire, cu aceeasi
  precedenta ca site-ul (`OPERATOR_JSON` nevida inaintea fisierului; goala = nesetata; `{"operator": null}`
  e o valoare); un JSON stricat in variabila OPRESTE L-01. Iesirea spune de unde vine operatorul
  ("operator: numit, din OPERATOR_JSON"). Martorii interni ai portii nu vad mediul (altfel, pe un build cu
  `OPERATOR_JSON`, martorul "fara operator" ar vedea operatorul si poarta ar iesi 3 pe orice arbore), iar
  proba `proba-juridic.py` ruleaza poarta cu `OPERATOR_JSON` si `SITE_ENV` scoase din mediu, cu cazuri care
  le pun explicit. Deci comanda de verificare a unui domeniu se ruleaza cu valoarea lui in mediu (Pasul 1).
  Pe un build de domeniu, canonical si alternate nu mai sunt numarate drept terti (Pasul 7).

### Trimiterea la IndexNow

Nu e automata: nimic din site, din build sau din CI nu o porneste. Dupa ce domeniul e publicat, cu
`INDEXNOW_KEY` din aplicatia lui in mediul de unde se ruleaza:

```
node scripts/indexnow.mjs https://<domeniu> --dry-run
node scripts/indexnow.mjs https://<domeniu>
```

Scriptul verifica, inainte de orice trimitere: forma cheii, ca `<domeniu>/indexnow.txt` contine exact
cheia, ca `robots.txt` nu interzice tot (pe mediul de proba interzice, deci se opreste) si ca harta
de site are adrese de pe domeniu. Trimite JSON cu `host`, `key`, `keyLocation` (adresa fisierului-cheie) si
`urlList`, cel mult 10.000 de adrese pe cerere, la `https://api.indexnow.org/indexnow`. Iesire: `0` trimis,
`1` oprit de o verificare sau refuzat de motor, `2` folosire gresita, `3` nemasurat (reteaua nu a raspuns).
Protocolul, citit pe 30.09.2026: https://www.indexnow.org/documentation si https://www.indexnow.org/faq
(cheia poate sta si in alt loc public al aceleiasi gazde, daca `keyLocation` il numeste; aceeasi adresa nu
se retrimite de mai multe ori pe zi fara o schimbare de continut). Un raspuns `200` sau `202` spune numai
ca cererea a fost primita, nu ca paginile s-au indexat.

## Pasul 7. Domeniul nou in portile si piesele care il stiu

1. **C-01 pe canonical si alternate: REPARAT in poarta (01.10.2026).** Masurat pe 30.09.2026, pe un build
   cu `SITE_URL` si `SITE_ALTERNATE`: poarta raporta C-01 pentru canonical si pentru fiecare alternata, pe
   fiecare pagina, fiindca un `<link href>` absolut spre alt domeniu era numarat drept resursa de la un tert.
   Acum un `<link>` al carui `rel` are NUMAI valori care nu incarca nimic (`canonical`, `alternate`,
   `author`, `license`, `prev`, `next`) nu mai e resursa; `stylesheet`, `preload`, `modulepreload`,
   `prefetch`, `preconnect`, `dns-prefetch`, `icon`, `manifest` raman resurse, inclusiv in combinatii ca
   `alternate stylesheet`. In `GAZDE_PROPRII` (pentru `img` sau `script` absolute pe domeniul propriu) sunt
   acum `3s.md` si `3s.com.ro`, iar `3s.ro` a iesit: masurat pe 01.10.2026, domeniul nu e al nostru, deci o
   resursa de acolo era scutita de C-01 pe nedrept. `www.3s.com.ro` NU e in lista: se adauga, cu motivul pe
   rand, in ziua in care `SITE_URL` il foloseste si o pagina incarca de acolo o resursa absoluta.
2. **Facut in felia 67** (commitul `ee7563c`, "SEO tehnic: ... adresa de baza"): `FirPagina` si
   `FoaieTipar` compun acum adresele din `adresaSite()` (`src/lib/site.ts`), deci `BreadcrumbList`
   urmeaza `SITE_URL` si nu mai arata spre mediul de proba. Nu mai ramane nimic de facut la acest
   punct. Comanda de verificare de mai jos mai da pentru `src/components` un singur rand: comentariul
   din antetul lui `FirPagina.tsx`, care numeste `ADRESA_BAZA` ca sa explice de ce s-a schimbat, nu o
   folosire.
   Masurat si in felia 69 (30.09.2026): un build cu `SITE_URL=https://3s.md` nu are nicio aparitie a
   mediului de proba in datele structurate ale paginilor cu fir, in `.next/server/app`, in harta, in
   `robots.txt`, in `/llms.txt` si in `security.txt`.

**Verificare:**

```
grep -rn "ADRESA_BAZA" src/components | grep -v ":[0-9]*: *//"
pnpm build && python .claude/scripts/porti/poarta-juridic.py --mediu productie
```

Asteptat: pentru `src/components`, cel mult randul-comentariu din `FirPagina.tsx` (punctul 2, deja
facut), nicio folosire; zero constatari C-01.

## Pasul 8. `lastmod` in harta de site

`lastmod` vine din istoria git (`src/lib/istoric-git.ts`). Imaginea Docker nu o are: `.dockerignore`
exclude `.git`, iar imaginea de baza nu are binarul git. Fara istorie, campul lipseste (corect, nu
inventat). Ca sa apara si in productie: se scoate `.git` din `.dockerignore`, se instaleaza git in
etapa `builder` (`apk add --no-cache git`) si se construieste dintr-o clona completa, nu
superficiala. Adancimea clonei facute de Coolify e NEMASURATA.

**Verificare:**

```
curl -s https://<domeniu>/sitemap.xml | grep -c '<url>'
curl -s https://<domeniu>/sitemap.xml | grep -c '<lastmod>'
```

Asteptat: cele doua numere egale. Daca al doilea e 0, istoria n-a ajuns la construire.

## Pasul 9. Pastrarea jurnalelor, cum o promite politica

Politica de confidentialitate promite doua termene care tin de infrastructura, nu de cod:

- **jurnalele serverului: cel mult 30 de zile** (jurnalele de acces ale proxy-ului din fata
  site-ului);
- **evidenta consimtamantului: 36 de luni de la alegere.** Randurile sunt scrise de
  `src/middleware.ts` pe iesirea standard a containerului, cu eticheta `"tip":"3s-consimtamant"`, si
  poarta prefixul de retea, niciodata adresa IP completa.

Jurnalele unui container se rotesc si se pierd la fiecare redeploy, deci randurile de evidenta
trebuie copiate intr-un loc care le pastreaza 36 de luni, iar jurnalele de acces trebuie limitate
la 30 de zile.

**Verificare:** se face o alegere in banner pe productie, apoi:

```
docker logs <container> 2>&1 | grep '"tip":"3s-consimtamant"' | tail -1
```

Asteptat: un rand cu alegerea facuta, `versiune` de forma `ro-xxxxxxxx` si `retea` fara ultimul
octet. Apoi se verifica, in configurarea colectorului de jurnale, termenele de 36 de luni si de 30
de zile.

## Pasul 10. Portile locale si proba comutatorului

Poarta locala a fabricii (`scripturi/poarta.sh` din depozitul fabricii), rulata in radacina acestui
depozit; ea ruleaza, pas cu pas, scriptul `verifica` din `package.json`:

```
bash <depozitul fabricii>/scripturi/poarta.sh
```

Asteptat: iesire 0. Proba comutatorului (`tests/browser/comutator.spec.ts`) nu scrie starea de
mana: citeste `stareAnalitica()` cu configurarea si mediul build-ului. Fara ID GA4 in mediul local,
build-ul real ramane cu analitica oprita (motivul devine "fara-id") si se masoara ca azi; cu ID in
mediu, build-ul real trebuie sa arate bannerul si legatura, fara nicio cerere catre Google inainte de
accept. Copia cu operator sintetic ruleaza in ambele cazuri.

## Pasul 11. Scanarea gdprscan.md

Ultimul pas, pe adresa publicata: scanarea de pe https://gdprscan.md/ (cele 16 verificari, extrase
in depozitul fabricii, `docs/gdpr/gdprscan-verificari.md`). Criteriul de iesire al valului S4-5:
zero constatari rosii.

**Verificare:** raportul scanarii, salvat cu data, cu zero constatari rosii. Legatura cu fiecare
verificare si cu proba care o acopera azi: `docs/gdpr/acoperire.md`.

## Ziua extrasului (`3s.md`, iesirea din modelul D2)

Dupa inregistrarea firmei din Republica Moldova, in ziua lucratoare in care apare in Registrul de stat.
Poarta nu are o data de expirare a modelului: o constanta de timp scrisa de mana devine falsa singura.
Modelul se stinge numai cand `"model"` iese din configurare, adica la pasii de mai jos.

1. **Valorile din extras**, de pe pagina publica a Registrului de stat, nu din memorie: `sediu` = adresa
   juridica; `numar_orc` = IDNO; `cod_fiscal` = acelasi numar; `denumire` = litera cu litera, daca
   extrasul difera. `email`, `telefon` si `tara` raman.
2. **Se scoate `"model": "D2"`** din `OPERATOR_JSON` (aplicatia `3s.md`), iar cele trei valori inlocuiesc
   marcajul. Daca operatorul sta si in `config/operator.json`, se actualizeaza in acelasi commit: altfel
   poarta si site-ul vad valori diferite.
3. **Marcajele scrise in textul paginilor** (cele care nu vin din campuri: administratorul, codul TVA si
   explicatia de sub tabelul firmei de pe pagina de informatii legale, plus blocurile temporare) se
   inlocuiesc in aceeasi zi. Cu modelul stins, marcajul D2 nu mai e admis: unul ramas pe o pagina juridica
   e J-01 si OPRESTE productia.

**Verificare** (dupa un build cu valoarea noua):

```
OPERATOR_JSON='<valoarea noua>' python .claude/scripts/porti/poarta-juridic.py --mediu productie
```

Asteptat: nicio linie "model D2", niciun AVERT L-01 "model D2", zero constatari J-01 si zero OPRESTE pe
L-01. Un camp care inca poarta marcajul, fara model, OPRESTE la productie: e locul gol al unei firme
care exista.

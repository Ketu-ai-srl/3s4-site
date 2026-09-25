# Ziua operatorului

**Data:** 2026-09-24 · **Felia:** seo-geo-gdpr (planul valului S4, sectiunile 8-10)

Pasii prin care site-ul trece de la `"operator": null` (azi, decizia owner-ului din 24.09.2026:
"Nimeni deocamdata") la un operator de date numit, cu politicile publicate si GA4 pornit. Tot ce
depinde de operator e deja construit si sta in spatele unui comutator; ziua operatorului inseamna
completarea unui fisier, cateva variabile de mediu si verificari, nu constructie.

**Regula de mers:** pasii se fac in ordine. Fiecare are o comanda de verificare si rezultatul
asteptat. Un pas a carui verificare nu iese cum scrie aici opreste pasii de dupa el: nu se trece
mai departe "urmand sa revenim".

## Ce se schimba, dintr-o privire

| Piesa | Azi (operator `null`) | Dupa pasii de mai jos |
|---|---|---|
| `config/operator.json` | `"operator": null` | obiectul firmei, din certificat |
| Bannerul de consimtamant | nu exista in pagina | apare, daca exista si ID-ul GA4 |
| Legatura "Setari cookie-uri" din subsol | nu exista | pe fiecare pagina |
| GA4 | nu se incarca niciodata | se incarca numai dupa acceptul categoriei Statistica |
| Evidenta consimtamantului (`/api/consimtamant`) | calea raspunde 404 | un rand JSON in jurnalul serverului la fiecare alegere |
| Textele juridice (`src/content/juridic/`) | construite, nepublicate (`texteJuridice()` intoarce `null`) | randate de paginile feliei `juridic` |
| Paginile juridice (`/juridic` si cele 7 documente) | in cod, dar neconstruite: 404, absente din `RUTE`, din harta XML si din subsol | construite si publicate singure, prin `ruteJuridice()` (`src/content/juridic/publicare.ts`) |
| Harta site-ului si declaratia de accesibilitate | publicate | publicate, iar harta primeste singura cele 8 pagini |
| Poarta juridica L-01, L-15 | nu cer nimic | cer datele firmei pe fiecare pagina si paginile juridice; politica de cookie-uri o cere din clipa in care bannerul e in HTML-ul construit |

Conditia de aparitie a bannerului si a GA4 e una singura, in `src/lib/analitica.ts`: operator
numit **si complet** (denumire, sediu, adresa de contact, tara) **si** `NEXT_PUBLIC_GA4_ID` in
mediu la construire. Fara operator, GA4 ramane oprit chiar daca ID-ul exista.

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

In `config/operator.json`, cheia `operator` devine un obiect cu exact campurile din `_forma`
(`denumire`, `sediu`, `email`, `telefon`, `numar_orc`, `cod_fiscal`, `tara`, `dpo`), copiate din
certificat, nu din memorie. `email` e adresa de la pasul 0. `tara` e tara sediului: textele
pornesc de la un operator din Spatiul Economic European; unul din afara lui are nevoie de un
reprezentant in Republica Moldova (Legea 195/2024 art. 27, poarta G-MD-02), iar textele refuza sa
se construiasca pana atunci.

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

Asteptat: probele trec; poarta juridica tipareste "L-01: se aplica - operator: numit" si
"L-15: se aplica - operator: numit" (in loc de "NU SE APLICA") si cere datele firmei pe fiecare
pagina (L-01) si paginile juridice (L-15). Pana la pasii 2 si 3 poarta e rosie la productie. E
comportamentul voit.

## Pasul 2. Datele firmei pe fiecare pagina (L-01)

Legea 365/2002 art. 5 alin. (1) lit. a)-e) cere identificarea furnizorului pe site: denumire,
sediu, e-mail, telefon, numar de ordine in registrul comertului, cod fiscal. Poarta le cere
prezente in HTML-ul livrat al fiecarei pagini publice. Piesa care le afiseaza (subsolul, pagina de
informatii legale) e a feliilor `fundatie` si `juridic`; datele vin numai din `config/operator.json`
(`src/lib/operator.ts`), nu se scriu in pagini.

**Verificare:**

```
pnpm build
python .claude/scripts/porti/poarta-juridic.py --mediu productie
```

Asteptat: zero constatari L-01.

## Pasul 3. Publica paginile juridice (L-15)

Nu se editeaza nicio lista de rute. Paginile feliei `juridic` (`/juridic` si cele 7 documente) sunt
deja in cod (`src/app/juridic/[[...document]]/page.tsx`) si intra singure in `RUTE`, sub marcajul
`<<felie:juridic>>` din `src/content/rute.ts`, prin `ruteJuridice()` din
`src/content/juridic/publicare.ts`, din clipa in care operatorul e numit si complet (pasul 1). De
acolo ajung singure in harta XML, in harta site-ului, in coloana Juridic din subsol (sase dintre
ele; subimputernicitii si indexul se leaga din pagini) si in legaturile bannerului. Cu operatorul
`null`, aceeasi pagina nu construieste nimic (`generateStaticParams` intoarce lista goala, iar
`dynamicParams = false` da 404 pe orice cale de sub `/juridic`).

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
| `SITE_ENV` | `productie`, numai pe productie | deschide indexarea: `robots.txt` cu semnalul de continut, fara `X-Robots-Tag` |

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

## Pasul 7. Domeniul nou in portile si piesele care il stiu

1. `.claude/scripts/porti/poarta-juridic.py`, `GAZDE_PROPRII`: se ADAUGA gazdele de productie
   (`www.3s.com.ro`, `3s.com.ro`), cu motivul pe rand, cum cere antetul portii. Altfel C-01 citeste
   canonical-ul de pe domeniul nou (`<link href>` absolut) drept resursa de la un tert.
2. `FirPagina` (piesa inghetata a fundatiei) compune adresele firului direct din `ADRESA_BAZA`;
   trebuie trecuta pe `adresaSite()` din `src/lib/site.ts`, altfel `BreadcrumbList` arata spre
   mediul de proba.

**Verificare:**

```
grep -rn "ADRESA_BAZA" src/components
pnpm build && python .claude/scripts/porti/poarta-juridic.py --mediu productie
```

Asteptat: niciun rand pentru `src/components`; zero constatari C-01.

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

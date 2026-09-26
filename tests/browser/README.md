# Portile de browser

Portile care cer un browser adevarat. Ruleaza pe serverul LOCAL, construit din arborele
curent (`pnpm build` plus `next start` pe un port liber), niciodata pe staging: o poarta care
depinde de reteaua publica se inroseste din motive straine de cod si se invata a fi ignorata
exact pana in ziua in care avea dreptate.

**Cate sunt nu se scrie aici.** Fisierul asta a purtat luni de zile cifra „cinci" in timp ce
pe disc erau sase spec-uri; nimeni nu minte, doar ca o cifra scrisa de mana intr-un document
imbatraneste in tacere, iar cine o citeste crede ca a numarat cineva. Lista adevarata e
`ls tests/browser/*.spec.ts`, si e verificata mecanic de
`.claude/scripts/porti/probe/proba-completitudine.py`.

## Comenzi

| Comanda | Ce ruleaza |
|---|---|
| `node .claude/scripts/porti/browser-toate.mjs` | **tot directorul** `tests/browser`, cu un build, un server, o rulare |
| `node .claude/scripts/porti/browser-<poarta>.mjs` | doar poarta aceea, cand repari o singura problema |

Lansatoarele individuale sunt o comoditate pentru rulari tintite, nu calea prin care un spec
intra in verificare. `browser-toate.mjs` da lui Playwright DIRECTORUL, deci **un spec fara
lansator propriu nu e un gol** - ruleaza si el. Lansatoarele existente se vad cu
`ls .claude/scripts/porti/browser-*.mjs`.

`SARI_BUILD=1` sare peste build cand arborele e deja construit. Probele se pot rula si direct:
`pnpm exec playwright test --config tests/browser/playwright.config.ts`, dar atunci se pierde
traducerea codurilor de iesire, deci si distinctia dintre "pica" si "NEMASURAT".

## Coduri de iesire

`0` trece. `1` a picat o proba. `2` folosire gresita. `3` NEMASURAT: build picat, raport JSON
necitit, zero probe rulate, un detector care a refuzat sa masoare, sau martori care nu au rulat
amandoi. Ultimul caz e regula din PORTI-FABRICA.md §1.2: o poarta fara control pozitiv nu e
poarta, e o decoratiune, iar verdictul ei nu are voie sa fie "curat".

Contractul asta e publicat in antetul lui `browser-rulator.mjs` si e citit de acolo, ca valoare,
si de probele portilor Python - ca unealta si asteptarea sa nu poata drifta impreuna.

## Ce masoara fiecare, si pragul

| Poarta | Prag | Sursa pragului |
|---|---|---|
| Accesibilitate | zero incalcari `serious` sau `critical`; `minor` si `moderate` se raporteaza | `PA-03`, `PA-05` |
| Raspuns in HTML brut | titlul si primele doua paragrafe ale paginii randate exista in HTML-ul livrat fara JavaScript | `S-17`, spiritul lui `S-08` |
| Derapaj orizontal | `scrollWidth <= innerWidth` la 390 px | `<<din cercetare>>`, catalogul nu are poarta de derapaj |
| Consimtamant | zero gazde straine, zero cookie-uri si zero stocare fara interactiune; dupa refuz, aceleasi, cu o singura exceptie: alegerea insasi, sub cheia declarata in politica de cookie-uri (decizia owner-ului din 24.09, plan S4 §8-§10) | `C-01` |
| Comutatorul (`comutator`) | build-ul real in starea din `config/operator.json` si din mediu (azi: zero banner, zero legatura "Setari cookie-uri", zero terti, zero urmarire, evidenta 404); copia cu operator si ID GA4 sintetice (`ajutor/copie-operator.ts`): bannerul si legatura in HTML-ul servit, zero cereri Google inainte de accept, exact una dupa, refuz simetric si fara nimic plecat nici dupa reincarcare, nicio caseta bifata, retragere din subsol pe fiecare pagina, evidenta in jurnal; C-01 pe drumul cu GA4; zero cereri catre serverele de fonturi Google. Cererile straine se blocheaza la retea | plan S4 §8-§10, `G-CONS-01..03` (E5), cu abaterea declarata in antetul probei |
| GEO (`geo`) | paritatea HTML servit / randat, cel putin 95% din propozitii (`G-AI-01`); entitatile declarate in fisierul feliei care detine ruta (`config/seo/<felia>.json`, un fisier pe felie, fiecare ruta numai in fisierul feliei ei) si titlul in primele 400 de cuvinte din `<main>`, primul paragraf autonom (`G-AI-02`); `og:url` = canonical si `og:title` = titlul pe fiecare ruta | cercetarea `cautare-agenti-ai` P1-P2, E5 pasii 25-26 |
| Legaturi si imagini | zero legaturi interne moarte, zero ancore fara tinta, zero imagini fara `alt` | `PA-04`, `S-07`, `S-15` |
| Globalele (`fundatie-antet`) | antetul plat / pastila la 20 px, zero legaturi moarte in antet, subsol si sertar, paleta Ctrl K, sertarul la 390 (focus si Escape), limba, meniul principal servit in HTML | directia REF-N, `docs/design/DIRECTIA.md`; inlocuieste proba meniului pliabil al directiei anterioare |
| Antetul intreg (`fundatie-antet-intreg`) | pe o copie cu toate caile navigatiei declarate existente (`ajutor/copie-navigatie-completa.ts`): Descarca se deschide la hover / focus, clicul si Enter il lasa deschis, al doilea il inchide; Escape inchide meniul mare si Descarca la prima apasare, cu focusul pe declansator; iesirea focusului inchide; in sertarul de la 390 focusul nu paraseste dialogul. Si posta marcii: build-ul real arata exact ce cere `config/brand.json` (fara adresa: zero adrese si zero `mailto:`; cu adresa: numai ea, in intrebari si in subsol), adresa sintetica a copiei in intrebari si in subsol | `componente-globale.md` §2.4, §3.1, §5; WCAG 1.4.13, 2.4.3 |
| Startul (`fundatie-start`) | inaltimile cioturilor in starea statica (+/- 2%), si aceeasi inaltime a ciotului functionalitatilor cu textul lui scurtat in pagina; intre 401 si 900 px (401, 768, 900) cutiile ciotului fara gol sub continut, cu textul scurtat, fiindca minimele de la 390 se aplica numai pana la 400 px; ordinea sectiunilor fara goluri, acordeonul, aparitia la derulare cu si fara miscare redusa | fisele de masurare ale startului, sinteza in `docs/design/DIRECTIA.md` |
| Sigla (`fundatie-sigla`) | pe pixeli: in antet si in subsol (1440, 390) si in sertar (390) sta doar iconita marcii (decizia D10), patrata, cu desenul pe toata latimea, iar "3S" din ea are cel putin cat majusculele unui text de 11 px masurat in aceeasi pagina; martorul pozitiv e aceeasi iconita la 24 px, prinsa ca ilizibila | `docs/design/DIRECTIA.md`, "Sigla" |
| Doar marca (`doar-3s`) | pe fiecare ruta din `RUTE`: HTML-ul servit si textul randat (cu atributele din DOM) nu contin numele altei firme (decizia D10); numele se asambleaza la rulare; martor pozitiv = fragment injectat in copia HTML-ului si in DOM, prins; martor negativ = fragment fara nume, neprins | plan S4 §0, D10 |

Randurile de mai sus descriu, nu constituie lista. Cand apare un spec nou, aici se adauga un
rand; daca cineva uita, poarta nu scade - se pierde doar explicatia. Ce nu are voie sa lipseasca
sunt martorii din titluri, si aia se verifica mecanic.

## Doua lucruri care nu sunt de comoditate

**Asteptarile se deriva, nu se scriu.** Rutele publice vin din `src/app`, nu dintr-o lista.
Titlul si paragrafele cerute in HTML-ul brut vin din randarea cu JavaScript a aceleiasi pagini.
O constanta scrisa de mana se inroseste in ziua in care cineva face lucrul corect.

**`innerWidth` se citeste, nu se presupune.** Raportul de pixeli al masinii nu e constant intre
rulari, deci nu exista factor de inmultit. Dupa fiecare redimensionare, poarta citeste
`innerWidth` din pagina si il scrie in raport, langa `scrollWidth` si `devicePixelRatio`.

## Fixturile

Paginile-martor se asambleaza la RULARE, intr-un server pe `127.0.0.1` cu port ales de sistem
(`ajutor/fixturi.ts`). Nu stau ca fisiere `.html` in arbore fiindca o proba care poarta literal
ce vaneaza devine ea insasi o instanta a defectului si inroseste alte porti pe cod corect.
Gazdele straine folosite de martorii pozitivi sunt sub TLD-ul rezervat `.invalid`, deci
controlul nu produce trafic real catre nimeni; browserul inregistreaza cererea inainte de DNS,
si exact asta se masoara.

## Fiecare spec isi poarta amandoi martorii

`browser-rulator.mjs` refuza sa dea verdict "curat" daca printre probele rulate nu exista si un
titlu cu marcajul de martor pozitiv, si unul cu cel negativ. Cerinta lui e pe REUNIUNEA rularii;
`proba-completitudine.py` o ridica la fiecare fisier in parte, fiindca un spec ai carui martori
traiesc in alt fisier nu e el insusi masurat. Un spec nou care nu-i poarta pe amandoi inroseste
`pnpm porti:probe`, adica inainte sa apuce sa porneasca vreun browser.

# Acoperirea GDPR: verificare, piesa, proba

**Data:** 2026-09-24, actualizat 2026-09-25 · **Felia:** seo-geo-gdpr (planul valului S4, sectiunile 8-10)

Pentru fiecare verificare pe care o cer planul valului S4 (sectiunea 9) si reperul extern ales de
owner (cele 16 verificari ale gdprscan.md, extrase in depozitul fabricii), unde sta in cod, ce
proba o masoara si ce ramane. Coloana "azi" descrie build-ul cu `"operator": null` (decizia
owner-ului din 24.09.2026); coloana "cu operator" descrie copia cu operator si ID GA4 sintetice pe
care o construieste proba comutatorului.

Probele numite aici:

- `pnpm test`: `tests/seo-geo-gdpr.test.ts` (textele juridice, evenimentele, evidenta, comutatorul
  pe componente);
- `pnpm porti:browser`: `tests/browser/comutator.spec.ts` (build-ul real si copia cu operator),
  `tests/browser/consimtamant.spec.ts` (C-01), `tests/browser/geo.spec.ts`;
- `pnpm porti:build`: `.claude/scripts/porti/poarta-juridic.py` (L-01, L-05, L-09, L-10, L-15,
  C-01) si `poarta-seo.py` (S-01..S-09).

"NEMASURAT" inseamna ca nimic din depozit nu verifica randul; nu inseamna ca e in regula.

## Portile de consimtamant (planul E5)

| Poarta | Ce cere | Azi | Cu operator | Proba |
|---|---|---|---|---|
| G-CONS-01 | zero cereri, cookie-uri si stocare (inclusiv IndexedDB) inainte de accept; exact o cerere de masurare dupa | zero banner, zero cereri straine, zero cookie-uri, zero stocare | zero inainte de accept; exact o cerere catre scriptul gtag dupa (blocata la retea in proba) | `comutator.spec.ts` |
| G-CONS-02 | refuzul in primul strat, `<button>`, aceeasi arie (+/- 10%), acelasi font si nivel DOM, contrast 4,5:1, opacitate 1 | nu exista banner | aceeasi cutie (+/- 1 px) la 1280 si 390; acelasi tratament: amandoua pline, acelasi fundal si acelasi chenar, marginea fata de banner 5,17:1 si textul 5,17:1 pe fiecare (masurat 25.09); in panou la fel, la 1440 si 390 | `comutator.spec.ts`, cu martori pe fixturi: plin langa deschis si doua deschise fara chenar sunt prinse; doua pline, sau doua deschise cu chenar de peste 3:1, nu |
| G-CONS-03 | nicio caseta bifata; retragere vizibila pe fiecare pagina | nu exista banner | o singura caseta, nebifata; legatura din subsol pe fiecare pagina, in HTML-ul servit, redeschide panoul | `comutator.spec.ts` |

**Abatere declarata de la litera lui G-CONS-02.** E5 cere refuzul "atins in acelasi numar de
tabulari sau mai putine" decat acceptul, adica refuzul INAINTEA acceptului in ordinea tastaturii.
Forma masurata a bannerului pune acceptul primul, iar ordinea tastaturii trebuie sa urmeze ordinea
vizuala (WCAG 2.4.3). Proba cere refuzul imediat dupa accept, la o tabulare. Pragul E5 e ales de
noi, nu de lege.

**Abatere declarata de la forma sursei (SITE-04).** La sursa numai acceptul e plin; refuzul sta pe
ceata albastra, la 1,10:1 fata de bannerul alb, cand acceptul are 5,17:1. Cutia, fontul si nivelul
DOM erau egale, deci G-CONS-02 si G-MD-04 treceau asa cum sunt scrise, dar nivelul vizual nu era
acelasi (runda a doua a criticului, 25.09.2026). La 3S acceptul si refuzul sunt amandoua pline, in
banner si in panou; "Setari cookie-uri" si "Salvati setarile" raman secundare. Proba cere acelasi
fundal, acelasi chenar si o margine de cel putin 3:1 fata de banner (WCAG 1.4.11) pe fiecare dintre
cele doua. Limita: EDPB nu impune o culoare; e o judecata de nivel vizual, facuta in favoarea
refuzului, nu litera unei legi.

## Verificarile gdprscan.md

| Cod | Ce verifica | Azi | Cu operator | Proba, sau ce ramane |
|---|---|---|---|---|
| SITE-01 | HTTPS si redirectionarea HTTP | infrastructura, nu cod | la fel | NEMASURAT aici; `curl -sI http://<domeniu>/` in ziua lansarii |
| SITE-02 | politica de confidentialitate legata din pagina principala | lipseste (risc numit si acceptat de owner, plan §9) | textele exista (`src/content/juridic/`); paginile sunt ale feliei `juridic` | L-15 in `poarta-juridic.py`, la productie; politica de cookie-uri, ceruta din clipa in care bannerul e in HTML-ul construit, oricare ar fi operatorul |
| SITE-03 | banner de consimtamant | nu exista: nimic de consimtit | bannerul apare pe fiecare pagina | `comutator.spec.ts`. Daca scanerul recunoaste un banner propriu (fara semnatura de furnizor CMP) e NEMASURAT |
| SITE-04 | refuz la acelasi nivel cu acceptul | nu exista banner | G-CONS-02: acelasi tratament vizual ca acceptul (plin, acelasi fundal si chenar, margine de cel putin 3:1 fata de banner), in banner si in panou; abaterea de la sursa e declarata mai sus | `comutator.spec.ts` |
| SITE-05 | cookie-uri si terti, cu categorie si jurisdictie | zero | GA4 (Google, SUA), declarat cu tara si mecanism | `seo-geo-gdpr.test.ts` (G-MD-11); lista reala a gazdei site-ului: `docs/ziua-operatorului.md`, pasul 4 |
| FORM-01..07 | formularele | ale feliilor `enterprise-formular` si `conversie` | idem | NEMASURAT in felia asta |
| SCRIPT-01 | tracker incarcat inainte de consimtamant | zero; nici codul bannerului si al incarcatorului nu e in JavaScript-ul paginii | zero inainte de accept; bucata incarcatorului se cere abia la accept | `comutator.spec.ts` (inclusiv JavaScript-ul incarcat, citit intreg), `consimtamant.spec.ts` (C-01) |
| SCRIPT-02 | transfer catre o jurisdictie fara adecvare | niciun transfer | GA4, numai dupa accept: DPF pentru UE, clauzele standard 2021/914 pentru Republica Moldova | `seo-geo-gdpr.test.ts` (G-MD-11) |
| SCRIPT-03 | cookie de urmarire fara interactiune | zero | zero | `comutator.spec.ts` |
| SCRIPT-04 | inventarul scripturilor terte | zero | zero inainte de accept; unul dupa (gtag) | `comutator.spec.ts` |

Fonturile: `next/font` le descarca la construire si le serveste de pe origine. Proba cere zero
cereri catre serverele de fonturi Google pe fiecare pagina, cu martor pozitiv (o pagina care le
cere e prinsa) si negativ.

Lista inchisa de evenimente: codul trimite numai evenimentele din `evenimente.ts`, verificate la
rulare (`seo-geo-gdpr.test.ts`). Masurarea imbunatatita a fluxului GA4 (derulare, clicuri spre alte
site-uri, cautare, video, descarcari, formulare) nu se poate opri din cod: se opreste in proprietate,
cu verificarea din `docs/ziua-operatorului.md`, pasul 5. NEMASURAT pana exista proprietatea.

## Portile G-MD (cercetarea gdpr-moldova, sectiunea 8)

| Poarta | Unde | Proba | Ramane |
|---|---|---|---|
| G-MD-01 | 12 sectiuni, chei `1a`-`2f` (`confidentialitate.ts`); la `1f`, copia garantiilor de transfer intr-un bloc comun, vazut si din RO si din MD | `seo-geo-gdpr.test.ts` pe texte, cu textul vazut pe jurisdictie | atributul `data-art13` in pagina: felia `juridic` |
| G-MD-02 | `verificaOperatorPentruTexte`: operator din afara SEE fara reprezentant = texte neconstruite | `seo-geo-gdpr.test.ts` | reprezentantul in RM, daca operatorul ar fi din afara SEE |
| G-MD-03 | = G-CONS-01 | `comutator.spec.ts` | - |
| G-MD-04 | = G-CONS-02 | `comutator.spec.ts` | - |
| G-MD-05 | legatura "Setari cookie-uri" din subsol | `comutator.spec.ts`, pe fiecare ruta si pe pagina de negasit | - |
| G-MD-06, G-MD-07 | formularele | - | feliile formularelor |
| G-MD-08 | chei `2b`-`2h` plus masurile (`cookie-uri.ts`) | `seo-geo-gdpr.test.ts` | atributul `data-l284` in pagina: felia `juridic` |
| G-MD-09 | niciun cod de operator in texte | `seo-geo-gdpr.test.ts`; L-10 in `poarta-juridic.py` pe sursa si pe HTML | - |
| G-MD-10 | ANSPDCP si CNPDCP, in blocuri separate pe jurisdictie (`autoritati.ts`) | `seo-geo-gdpr.test.ts` | datele de contact se reiau inainte de publicare |
| G-MD-11 | tara si mecanismul pe fiecare furnizor (`furnizori.ts`) | `seo-geo-gdpr.test.ts` | gazda site-ului public, ca furnizor |
| G-MD-12 | destinatarii din politica = gazdele care incarca efectiv | - | NEMASURAT: cere paginile publicate si o lista de gazde pe furnizor |
| G-MD-13 | registrul activitatilor de prelucrare | - | in depozitul fabricii (plan §10), nu aici |
| G-MD-14 | drepturile, "o luna", "doua luni", adresa pentru cereri | `seo-geo-gdpr.test.ts` | - |
| G-MD-18 | nicio atestare nedovedita, nicio adecvare pusa langa Moldova | `seo-geo-gdpr.test.ts` | - |

## Evidenta consimtamantului

Fiecare alegere (accept, refuz, setari) trimite o cerere pe origine proprie (`/api/consimtamant`),
validata strict de `src/middleware.ts` si scrisa ca un rand JSON in jurnalul serverului:
identificatorul aleator al dispozitivului, momentul (ceasul serverului), versiunea informarii,
alegerea, butonul, pagina si prefixul de retea (IPv4 fara ultimul octet, IPv6 cu primii 48 de
biti). Adresa IP completa nu se scrie. Proba: `comutator.spec.ts` citeste randul din jurnalul copiei
dupa fiecare alegere si verifica raspunsurile la cereri gresite (400, 405, 413). Cat se pastreaza
jurnalul e un pas de infrastructura: `docs/ziua-operatorului.md`, pasul 9.

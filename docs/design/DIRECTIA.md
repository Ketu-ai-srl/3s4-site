# Direcția vizuală 3s4: REF-N

3s4 reproduce vizual o referință externă cu nume de cod **REF-N**: aceeași așezare, aceeași ordine a secțiunilor, aceeași paletă, aceleași fonturi, mărimi, spațieri, raze, umbre, animații și interacțiuni, același arbore de pagini și aceleași meniuri. Numele și domeniul referinței nu se scriu nicăieri în depozit. Textele, imaginile, sigla, iconițele desenate de referință și codul ei **nu** se preiau: forma se reproduce din măsurători, iar textul se scrie pentru 3S, frază cu frază, pe același rol și aceeași lungime. Decizia și limitele ei: [ADR-0007](../adr/ADR-0007-directie-ref-n.md).

Măsurătorile (capturi, stiluri calculate, fișe pe pagină) stau în depozitul privat al fabricii. Aici stă sinteza care se folosește în cod: tokenii, rolurile tipografice, ritmul, primitivele, variantele și abaterile.

## Tokenii

Sursa unică: `src/app/globals.css`, blocul `@theme` (piesă înghețată a feliei `fundatie`; o valoare nouă se cere dispecerului). Lângă fiecare culoare de text e scris contrastul **calculat** cu formula WCAG 2.x din hex, pe alb dacă nu scrie alt fundal. Proba `tests/fundatie-tokeni.test.ts` recalculează fiecare cifră și cere potrivire la două zecimale.

| Rol | Valoare | Contrast pe alb | Unde |
|---|---|---|---|
| `cerneala` | #1a1a1a | 17,40:1 | text principal, titlurile de pe start |
| `cerneala-2` | #666666 | 5,74:1 | subtitluri, legăturile antetului, subsolul |
| `cerneala-3` | #737373 | 4,74:1 | drepturile din subsol, text-exemplu |
| `ardezie-9` | #0f172a | 17,85:1 | titluri interioare; fundalul cardurilor închise |
| `ardezie-6` | #475569 | 7,58:1 | proză, răspunsuri FAQ |
| `ardezie-5` | #64748b | 4,76:1 | text secundar; nu pe `gri-card` sau `ardezie-1` |
| `ardezie-4` | #94a3b8 | 2,56:1 | **doar decorativ**: chevroane, marcatori |
| `ardezie-2` | #e2e8f0 | - | chenarul standard |
| `albastru` | #2563eb | 5,17:1 | acțiunea principală, legături, accente |
| `albastru-apasat` | #1d4ed8 | 6,70:1 | hover; textul pe `albastru-pal` |
| `albastru-clar` | #60a5fa | 2,54:1 | **doar pe închis** (7,02:1 pe `ardezie-9`) |
| `violet` | #7c3aed | 5,70:1 | pastila de categorie |
| `verde` | #16a34a | 3,30:1 | bife și puncte; text doar de la 18,66 px la 600 |
| `gri-meta` | #6b7280 | 4,83:1 | numele din banda de integrări, etichetele lobilor |

Restul rolurilor (stări, griurile machetelor, nuanțele de albastru ale chenarelor, cele 20 de umbre numite, razele 4-24 și pastila, containerele 1200 și 1320, curbele de mișcare) sunt în același bloc, cu rolul scris lângă fiecare.

## Tipografie

Fonturile sunt găzduite de site prin `next/font` (nicio cerere către un terț, poarta C-01): **Plus Jakarta Sans** variabil 200-800 pentru tot textul, cu varianta italică fără preîncărcare; **JetBrains Mono** pentru taste, rute, ore și nume de fișiere; **Marck Script**, fără preîncărcare, numai pentru rândul scris de mână din duelul constructorului. Toate sub licența OFL.

Rolurile tipografice sunt clase globale; o pagină alege rolul, iar treapta de sub 768 px vine cu el.

| Clasă | 1440 | 390 |
|---|---|---|
| `t-h1-erou` | `clamp(2rem, 3.1vw, 3.3rem)` = 44,64 / 600 / 1,12, -0,03 em | `clamp(1.7rem, 6vw, 2.2rem)` = 27,2 (sub 1180 px) |
| `t-h2-sectiune` | 40 / 600 / 46, -0,8 | 30 / 600 / 34,5, -0,6 |
| `t-h2-cta` | 32 / 600 / 38,4, -0,64 | 24 / 600 / 28,8 |
| `t-h2-industrii` | `clamp(1.35rem, 2.4vw, 1.7rem)` = 27,2 / 600 / 1,25 | 21,6 |
| `t-h2-pret` | 20 / 600 / 32, -0,4 | la fel |
| `t-h3-pas` | `clamp(1.5rem, 2.4vw, 1.85rem)` = 29,6 / 600 / 1,2 | 24 |
| `t-h3-card` | 16 / 600 / 25,6, -0,16, `ardezie-9` | la fel |
| `t-subtitlu-sectiune` | 18 / 400 / 28,8, `cerneala-2`, max 600 | la fel |
| `t-eticheta-sectiune` | 12 / 600 / 19,2, `albastru` | la fel |
| `t-corp` | 16 / 400 / 25,6 | la fel |

Tot în `globals.css`: rolurile paginilor interioare, cinema, promo, blog și ale verificatorului de termene, folosite de feliile următoare.

## Lățimi și ritm

- `container-site`: maximum 1200, padding lateral 24 (16 de la 768 în jos). `container-erou`: 1320, pentru erou.
- `sectiune-standard`: padding 80 sus și jos (48 sub 768). `sectiune-bloc`: 64 sus (40).
- Pragurile măsurate: **1200** (antetul trece pe siglă, lupă și hamburger), **1180** (eroul trece pe o coloană), **1100** (industriile pe 2 coloane), **900** (testimonialul pe o coloană, funcționalitățile pe pista de mobil), **768/767** (containerul la 16, CTA-ul final pe o coloană fără vizual, cardurile de securitate și enterprise pe coloană), **640** (banda de integrări pe coloană, industriile compacte pe o coloană), **480** (subsolul pe o coloană).
- Antetul fix are 64 (bara) și 68 în starea de pastilă (56 + 12). Ancorele aterizează sub el prin `scroll-margin-top` (88; 80 sub 768).

## Mișcare

- Aparițiile la derulare (`Reveal`): opacitate 0 și 10 px, apoi vizibil în 0,45 s ease-out, o singură dată, când marginea de sus urcă la 90% din fereastră. Fără JavaScript elementul e vizibil; un element aflat deja în fereastră la hidratare nu se ascunde.
- Antetul: 0,2 s pentru trecerea în pastilă; 0,28 s pentru plecare.
- Acordeonul startului: rândul grilei de la 0fr la 1fr în 0,35 s, `cubic-bezier(0.4, 0, 0.2, 1)`.
- Tranziția de vedere la navigarea client: 160 ms pe rădăcină, grupul 250 ms.
- `prefers-reduced-motion: reduce` aduce **toate** duratele la zero, pe tot site-ul, inclusiv acordeonul startului (la referință rămânea animat) și derularea lină.

## Antetul și navigația filtrată

Stările antetului: **plat** pe start până la 20 px de derulare, **pastilă** de la 21 px (și permanent pe celelalte pagini), **plecat** cât timp o piesă o cere prin `src/components/global/antet-stare.ts` (pe start o cere constructorul, în tema închisă). Paleta (Ctrl K) și sertarul mobil se randează în afara elementului `header`.

Meniurile, sertarul, paleta și subsolul se generează din contractul `src/content/navigatie.ts` și arată **numai** legăturile spre rute care există deja în `RUTE` (plus articolele din registrul blogului). O foaie fără niciun element vizibil dispare, iar declanșatorul ei rămâne legătură simplă; o coloană de subsol fără legături nu se randează. În valurile intermediare antetul arată deci mai puțin decât referința; la livrare (S4-5) nimic nu mai e filtrat.

Interacțiunea meniurilor: hover sau focus deschid foaia și panoul Descărcați; clicul (sau Enter) pe Descărcați fixează panoul deschis, iar al doilea clic îl închide; Escape închide la prima apăsare și lasă focusul pe declanșator; ieșirea mouse-ului, ieșirea focusului din zonă și clicul în afară închid. În sertarul mobil focusul nu părăsește dialogul: sub-vederea Descărcați îl mută pe „Înapoi la meniu”, iar întoarcerea, pe „Descărcați”. Piesele filtrate la S4-1 se măsoară pe o copie a site-ului cu toate căile declarate existente (`tests/browser/fundatie-antet-intreg.spec.ts`).

În corpul paginilor, legăturile trec prin `Tinta`: dacă ruta lipsește, elementul rămâne cu același aspect, dar inert (un `span` marcat `data-tinta-lipsa`), ca secțiunea să-și păstreze forma și înălțimea.

## Tabelul primitivelor

| Primitivă | Forma | Variante |
|---|---|---|
| `Buton` | inline-flex, gap 8, 14/600, 12 x 24, rază 9999, 0,3 s | `plin`, `contur`, `fantoma`, `fantoma-sector`, `alb-pe-inchis`, `contur-pe-inchis`, `contur-albastru`; mărimi `baza`, `mare` (16 x 32, 57,6), `antet` (8 x 14, 38,4), `plat` (13 x 32, hover doar culoarea) |
| `LegaturaSageata` | 14/600/22,4, `albastru`, săgeată 15 | fără rupere peste 768, cu rupere sub |
| `LegaturaInText` | 16/500 `albastru`, săgeată 14 | 16,8 / 14,08 / 14 |
| `Pastila` | rază 9999 | `categorie`, `erou` (minimum 11 px sub 768), `insigna`, `stare` |
| `FirPagina` | 14/400 `cerneala-2`, chevron 16; JSON-LD `BreadcrumbList` | 2-3 niveluri; la stânga sau centrat |
| `CapSectiune` | etichetă 12/600 + h2 40 (30) + subtitlu 18/28,8 | cu sau fără etichetă |
| `CapBloc` | h2 28 (21,6) `ardezie-9` + paragraf 16 sau 18 | - |
| `Card` | alb, chenar `ardezie-2`, rază 16, umbră de fir, padding 24 | evidențiat, gri, cu hover |
| `CasetaGri` | `ardezie-0`, chenar `ardezie-2`, rază 16 | cu linie stângă `albastru` |
| `CutieIconita` | 32-56, rază 8-12 | ceață, pal, ardezie, cerc numerotat |
| `CtaFinalInchis` | card `ardezie-9`, rază 24, grilă 1,2fr / 0,8fr | conținutul se dă prin proprietăți; implicit cel al startului |
| `CutieCta880` | cutie 880 `ardezie-9`, rază 16 | - |
| `Proza`, `TabelDate` | proza juridică și a articolelor; tabel cheie-valoare sau cu antet | - |
| `Iconita` | setul Lucide (ISC), hartă explicită de nume | - |
| `Sigla`, `SiglaTert` | sigla 3S oficială; siglele terților monocrome | vezi `ACTIVE.md`; în antet, sertar și subsol sigla vine din `SiglaMarca` (secțiunea „Sigla”) |
| `Scena3D` | three.js încărcat leneș, pornit la 260 px de fereastră, raport de pixeli plafonat la 2, samanță fixă, un cadru static la mișcare redusă, gazda dispare fără WebGL | cameră 1 u = 1 px sau cameră proprie |

## Variantele acordeonului

| Variantă | Forma | Comportament | Pagini |
|---|---|---|---|
| `start` | card 780, linii interne de 1 px cu margini 28 (20); întrebare 16/600 (14,4), 21,6 x 28; răspuns 14/24,5 `ardezie-6` | prima deschisă, una singură; 0,35 s | `/` |
| `sector` | rânduri 880 x 55, rază 12, chevron 14 | una singură; chenar `albastru` în 0,15 s | sectoare, hub |
| `preturi` | rânduri pe linii, buton 56, 14/600 | exclusiv, instant; chevron 20 în 0,3 s | `/preturi` |
| `platforma` | `details`, max 760, rază 12 | toate închise, independente | `/platforma` |
| `securitate` | `details` în card tăiat, max 820, chevron 20 | primul deschis, independente | `/securitate` |
| `e-facturare` | `details`, rază 12 | independente; chevron 0,15 s | `/e-facturare` |

## EroulInterior

Blocul de 880 cu fir de pagină, h1 interior și subtitlu 18/28,8 `ardezie-5`. Cinci variante: `standard` (padding 120 / 0 / 40), `sector` (fir pe trei niveluri, două butoane, notă), `hub` (rând de dovadă, fără notă), `cu-intoarcere` (legătură „înapoi", acțiuni proprii) și `centrat` (înveliș 600, pentru înregistrare).

## Cioturile startului

Trei piese mari ale paginii de start sunt, la valul S4-1, **cioturi** în starea lor statică (cea fără JavaScript și cu mișcare redusă), la căi fixe; fiecare e înlocuită numai de felia ei din S4-2, fără ca `src/app/page.tsx` să se schimbe:

- `src/components/erou/Erou.tsx`: coloana de text, butoanele, bucla desenată cu cometa oprită la 30% din drum, podeaua și umbra peste 1180 px, legenda cu două coloane desenate de noi. 900 la 1440, circa 930 la 390.
- `src/components/constructor/Constructor.tsx`: poarta cu grila de 9 industrii, pe tema deschisă. 1008 la 1440, 928 la 390.
- `src/components/functionalitati-acasa/FunctionalitatiAcasa.tsx`: cei trei pași cu cardul lipit peste 900 px; sub 900, varianta de mișcare redusă, cu cardurile unul sub altul. 2677,6 la 1440 x 900, 2265,6 la 390. Fiecare cutie cu text (capul, blocul de text al fiecărui card, fraza de ieșire) are ca minim înălțimea din fișă, așa că un text mai scurt nu scade ciotul: la 390 textul scurtat îl coborâse la 2214,8.

Inălțimile sunt apărate de `tests/browser/fundatie-start.spec.ts`, cu toleranță de 2%; aceeași probă scurtează textul ciotului în pagină și cere aceeași înălțime.

## Sigla

Marca 3S e înregistrată la OSIM. Pe site apare **numai iconița mărcii** (decizia owner-ului D10, 25.09: „doar 3S”): chenarul de scanare, dosarul și „3S”, decupate din fișierul vectorial oficial. Rândurile de text ale siglei oficiale nu apar nicăieri pe site: nici în antet, nici în sertar, nici în subsol, nici în imaginile sociale sau în datele structurate. Nu se retipărește niciun cuvânt, nu se redesenează și nu se recolorează nimic. Proveniența: `docs/design/ACTIVE.md`. Calea fișierului, în `config/brand.json`; componenta, `src/components/global/SiglaMarca.tsx`.

**Regula de folosire**: un singur fișier, `sigla-3s-iconita.svg`, pătrat, pe fundal deschis și pe fundal închis (are numai culori explicite). Nu se pune lângă el niciun nume de firmă, nici ca text, nici ca imagine.

**Regula de lizibilitate**: iconița se pune numai la o latură la care „3S” din ea are cel puțin cât majusculele unui text de 11 px al site-ului, minimul de text de mai jos (abaterea 4). Măsurat pe pixeli, pe 26.09, la 1440 și la 390: pragul e 8 px. Proba: `tests/browser/fundatie-sigla.spec.ts`, care desenează iconița randată pe o pânză și măsoară golurile literelor în forma albastru-închis.

| Unde | Latură | „3S”, măsurat |
|---|---|---|
| antet (1440 și 390), în același slot de 106,5 px | 40 px | 9 px |
| sertarul mobil | 40 px | 9 px |
| subsol (1440 și 390), și pe paginile închise | 56 px | 12 px |
| centrul buclei din erou, rama promo | 40-52 px, 18 px | la 18 px „3S” nu se citește; acolo iconița e decor, cu `alt` sau lângă nume |
| sub prag (martorul probei) | 24 px | 5 px |

- Sigla stă mereu într-o legătură cu nume accesibil, deci imaginea e decorativă (`alt` gol).
- Imaginea socială (Open Graph, cardul social) are iconița centrată în cutia de 840 x 440 px, pe alb, cu banda albastră a mărcii jos.

## Marca, fără firmă

Pe site apare numai brandul (decizia owner-ului, 24.09): nume, siglă și, când există una confirmată, adresa de e-mail, toate din `config/brand.json`. Nicio dată de firmă (denumire, sediu, registru, cod fiscal, telefon), niciun bloc de identificare; drepturile din subsol sunt în numele mărcii. Adresa de e-mail e goală până o confirmă owner-ul: fără ea, rândul de sub întrebările startului închide lista fără să trimită spre un canal, iar în subsol rândul de poștă, „Ajutor prin e-mail” și iconița de poștă nu se randează. Datele unei firme țin de operatorul de date, `config/operator.json`, `null` azi; poarta juridică le cere (L-01) numai din ziua în care operatorul e numit.

## Abateri de la referință

„Identic" se oprește acolo unde referința are un defect măsurat sau unde o poartă (axe, afirmații, limbă) ar pica pe drept.

1. **Contrast pe text**: numele din banda de integrări (la referință 2,61:1) trec pe `gri-meta` (4,83:1), iar etichetele de grup (3,09:1) pe `ardezie-5` (4,76:1); etichetele lobilor din buclă (1,89:1) pe `gri-meta`; etichetele de grup, rutele, textul-exemplu și subsolul paletei (2,56:1) pe `ardezie-5`, iar ruta rândului selectat pe `ardezie-6`; textul `albastru` pe `albastru-pal` (4,24:1) trece pe `albastru-apasat` (5,49:1); pe închis, textul de citit nu coboară sub alb 0,5.
2. **Insigna de economie**: la referință `verde-economie` (#059669) pe fundalul ei are 3,43:1; la 3S textul insignei e `verde-text` (5,02:1), iar `verde-economie` rămâne pentru puncte și bare.
3. **Pașii inactivi ai funcționalităților**: la referință coboară la opacitate 0,45 (paragraful ajunge la circa 1,8:1); la 3S se folosesc culori pline mai deschise, iar ciotul îi arată pe toți la opacitate plină.
4. **Text sub pragul de lizibilitate**: pastilele eroului au minimum 11 px sub 768 (la referință 9,6).
5. **Mișcarea redusă**: oprește tot, inclusiv intrarea coloanei din erou, acordeonul și derularea lină.
6. **Fără JavaScript**: coloana de text a eroului și elementele cu apariție la derulare sunt vizibile (la referință rămâneau la opacitate 0).
7. **Focusul de tastatură**: contur propriu de 2 px `albastru` pe toate elementele (la referință o parte rămân pe inelul implicit).
8. **Rândul de credit** al dezvoltatorului, din CTA-ul final și din subsol, nu se reproduce: cardul CTA are circa 58 px mai puțin la 1440.
9. **Bannerul de consimțământ** nu se construiește: site-ul nu are cookie-uri neesențiale, iar un banner fără obiect ar fi o afirmație falsă.
10. **Ancorele** aterizează sub antetul fix; ancora funcționalităților nu mai e deviată spre constructor.
11. **Cardul enterprise** duce, identic, la `/securitate`.
12. **Sigla**: la referință, sigla din antet are 26 px și un singur rând de text. La 3S pe site stă doar iconița mărcii (decizia D10), pătrată: 40 px în antet, în același slot de 106,5 px, și 56 px în subsol, nu 28, ca „3S” din ea să se citească (secțiunea „Sigla”).

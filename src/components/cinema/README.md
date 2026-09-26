# Cadrul cinema

Piesele comune ale paginilor "cinema" (fundal inchis, sectiuni legate de derulare): cele trei pagini de
functionalitate ale feliei `cinema-1` (textele lor in `src/content/functionalitati/cautare-ai.ts`,
`automatizari-ai.ts` si `portal-clienti.ts`), apoi `cinema-2` si promo. Masurile vin din fisa sablonului
(`functionalitati__sablon.md`) si din fisele paginilor; fiecare fisier isi scrie in antet ce a masurat,
ce s-a abatut de la referinta si de ce.

**API-ul e INGHETAT dupa pliere.** O felie care are nevoie de altceva adauga o proprietate NOUA, cu
implicitul de azi, sau cere dispecerului o schimbare; nu schimba sensul unei proprietati existente
(trei pagini depind deja de el). Machetele unice ale unei pagini nu stau aici, ci in
`src/components/functionalitati/<pagina>/`.

## Compunerea unei pagini

```tsx
<InvelisCinema pagina="portal-clienti">      // `main`: fundal, grila, overflow: clip
  <TemaPagina tema="inchisa" />              // antetul si subsolul pe varianta inchisa (decizia paginii)
  <DateFirAriadnei niveluri={[...]} />       // JSON-LD BreadcrumbList
  <EroulCinema forma="persoane" samanta={31}> // primul ecran, forma din hartii (three.js, incarcat la cerere)
    <EtichetaErou>...</EtichetaErou>
    <TitluErou>...</TitluErou>               // singurul h1 al paginii
    <TerminalErou text="..." />
    <SubtitluErou dupaScriere>...</SubtitluErou>
    <IndiciuDerulare text="derulați" />
  </EroulCinema>
  <SectiuneScena ...>macheta paginii</SectiuneScena>
  <Pivot ... />
  <ContrastInainteAcum ... />
  <CtaCinema ... />                          // singura legatura din corp, spre crearea contului (prin Tinta)
</InvelisCinema>
```

Titlul CTA-ului final e `h2` cu forma titlului mare: o pagina are un singur `h1`, cel din erou (la
referinta CTA-ul era al doilea `h1`).

## Progresul p

Fiecare `SectiuneScena` isi calculeaza progresul la fiecare cadru in care pagina se misca:
`p = limiteaza((0,5 vh - top) / inaltime, 0, 1)` (`progres.ts`, `progresSectiune`), cu un singur
ceas `requestAnimationFrame` pentru toata pagina (`ceas-derulare.ts`).

- **CSS**: variabila `--p` pe elementul `section`. Efectele proportionale se scriu direct in CSS, cu
  tranzitia lor scurta: `opacity: clamp(0, calc(2 * var(--p)), 1)`. Un prag se scrie ca treapta:
  `clamp(0, calc((var(--p) - 0.36) * 1000), 1)`. Nimic nu se re-randeaza din React la derulare.
- **React**: `useDinProgres(f)` intoarce o valoare simpla derivata din p (contor, numar de caractere,
  stare la prag) si re-randeaza numai cand ea se schimba; `useProgres()` da p insusi (de folosit rar).
- **Starea statica**: p = 1 pe server si la `prefers-reduced-motion: reduce`. HTML-ul servit arata
  fiecare piesa in forma ei finala (paritatea G-AI-01, pagina completa fara JavaScript).

## Piesele

| Piesa | Fisier | Proprietati |
|---|---|---|
| `InvelisCinema` | `InvelisCinema.tsx` | `children`, `factorParalaxa` (0,18; promo 0,2), `pagina` (`data-pagina-cinema`), `className` |
| `FundalCinema` | `FundalCinema.tsx` | `factor`. Lumina radiala si grila de 72 px pe TOATA pagina (periodica, paralaxa 18%), lipita in invelis, deci nu trece peste subsol. O pune `InvelisCinema`. |
| `SectiuneScena` | `SectiuneScena.tsx` | `inaltime` (vh, 100), `inaltimeMobil`, `spatiere` (`baza` 64/32, `scena` 80/32, `scena-sus` 96 32 64, `mica`, `fara`; la 390: 48/20, `scena-sus` 64 20 32), `latime` (px, 720; `null` = fara bloc interior), `interiorLaContinut`, `className`, `interiorClassName`, `eticheta` (aria-label), `nume` (`data-sectiune`), `style` |
| `EroulCinema` | `EroulCinema.tsx` | `forma` (`lupa`, `fulger`, `persoane`, `document`, `telefon`, `semnatura` sau o `FormaIconita`), `samanta`, `cuScriere` (true), `className`, `blocClassName` |
| `EtichetaErou` | idem | `titlu` (eticheta devine `h1`, pe pagina fara titlu mare) |
| `TitluErou` | idem | `spatiere` (`normala` -0,03 em, `stransa` -0,02 em) |
| `TerminalErou` | idem | `text`, `pas` (32 ms), `latime` (600 / 660), `marime` (`normala` / `mare`), `marca` ("3S"). Latimea e FIXA (600 sau 660, `max-width: 100%`, deci 350 la 390), niciodata latimea textului: o cerere scurta nu strange cardul (proba din `cinema-1.spec.ts` cere 600 +- 2 pe portal-clienti, unde textul are ~340 px) |
| `SubtitluErou` | idem | `varianta` (`italic`, `rand-1`, `rand-2`, `liniste`), `dupaScriere`, `intarziere`, `durata` |
| `SubtitluScris` | idem | `text`, `pas`: subtitlul scris litera cu litera, fara terminal (automatizari-ai) |
| `IndiciuDerulare` | idem | `text` (fara el, numai chevronul), `spatiere` |
| `useFazaErou()` | idem | `static` / `scrie` / `scris`: o macheta din erou asteapta sfarsitul scrierii (caderea actului pe automatizari-ai) |
| `FormaHartii` | `FormaHartii.tsx` | `forma`, `samanta`, `className`. Pune scena 3D inghetata (`@/components/scena3d`) cu ~110 foi care fac vartej si se aseaza in forma; la miscare redusa, un singur cadru, asezat. Material luminat si adancimea scrisa, in ordinea instantelor: luminozitatea formei e masurata pe pixeli contra referintei (antetul fisierului); o forma noua se potriveste pe cutia masurata prin `unitate` (`forme.ts`), nu prin material. |
| `TextScris` | `TextScris.tsx` | `text`, `stare`, `scrise`, `inainte`, `ca`, `rezervaLoc` (true). Doua straturi: baza intreaga (cititori, roboti, loc rezervat) si copia scrisa, `aria-hidden`. Cu `rezervaLoc={false}` elementul creste odata cu scrierea (copia in flux, baza ascunsa vizual), iar locul final il rezerva cine il foloseste, in afara lui (bara din S5, `Lumina.tsx`). |
| `Anxietate` | `Anxietate.tsx` | `randuri` (2), `emfaza`, `varianta` (`sablon` / `portal`), `inaltime` (70), `latime` (640), `straturi` (pe toata sectiunea), `fantome` + `latimeFantome` (920) |
| `Pivot` | `Pivot.tsx` | `deschidere` (randul intai, intrebarea ipotetica), `emfaza`, `linie`, `varianta` (`sablon` sau varianta masurata a unei pagini; lista si masurile in antetul fisierului), `inaltime` (80), `latime` |
| `ContrastInainteAcum` | `ContrastInainteAcum.tsx` | `titlu`, `paragraf`, `latimeParagraf` (580; `null` = toata latimea), `inainte` / `acum` (`titlu`, `subtitlu`, `vizual`, `metrici`), `punte` (`eticheta`, `mono`), `varianta` (`svg` 439/70/439 pe 980 sau `machete` 412/24/412 pe 880), `fundal` (`transparent`, `plin`, `stins`), `pastile` (`colorate` / `neutre`), `marimeCheie` (9,92), `inaltime` |
| `CtaCinema` | `CtaCinema.tsx` | `titlu`, `paragraf`, `buton`, `nota`, `spatiereTitlu`, `titluMobil` (`normal` 38,4 / `mare` 40), `latimeParagraf` (580; `null` = 680) |
| `CardCitat` | `CardCitat.tsx` | `text`, `varianta` (`citat` / `fantoma`), `inclinare`, `plutire`, `intarziere`, `ordine` (decalajul opacitatii), `opacitate` (fantome), `className`, `style` |
| `Fereastra` | `Fereastra.tsx` | `titlu`, `dreapta`, `punct` (`albastru`, `chihlimbar`, `rosu`, `verde`, `neutru`, `patrat-email`, `niciunul`), `mare`, `compactMobil`, `declaratie` (obligatorie: machetele au date fictive, plan D9), `className`, `baraClassName`, `corpClassName`, `nume` (`data-macheta`) |
| `RandFisier`, `PatratTip`, `Cip`, `PastilaStare`, `CutieIconitaCinema`, `Nod` | `Fereastra.tsx` | piesele machetelor (sablon §5.1) |
| bucle | `bucle.module.css` | `clipire12`, `clipire14`, `clipire16`, `treiPuncte`, `cursor` (sablon §5.3) |

Functii pure (`progres.ts`, `forme.ts`, `forma-hartii.ts`, `scriere.ts`) sunt probate in
`tests/cinema-1.test.ts`; comportamentul in browser (stare statica, grila pe toata pagina, puntea in banda
ei la 390, comutatorul de rol) in `tests/browser/cinema-1.spec.ts`.

## Reguli pentru o pagina noua

- Textele stau in `src/content/functionalitati/<pagina>.ts` si se scriu din faptele 3S, cele din registrul
  de afirmatii al feliei (`src/content/afirmatii/<felia>.json`): fisa paginii da doar rolul fiecarui bloc
  si lungimea lui tinta. Comentariile `Rol:` numesc rolul abstract si lungimea; nu citeaza si nu rezuma
  texte din afara depozitului.
- Datele din machete sunt fictive si se declara ca exemplu (`declaratie` pe `Fereastra`, `figcaption`
  ascuns vederii pe machetele proprii); codurile fiscale au cifra de control gresita, adresele de e-mail
  sunt pe domeniul rezervat `.example`.
- Textul de citit nu coboara sub alb .5 pe `negru-cinema` sau pe `ardezie-9` (contrast 4,5:1); ce e decor
  (puncte, randuri stinse, ghilimele) se deseneaza din CSS si nu poarta informatie. In erou textul sta
  peste forma din hartii, unde .5 nu ajunge: acolo textele secundare au .6 si blocul are un halou inchis
  (`EroulCinema.module.css`). axe nu masoara peste panza 3D (raporteaza "incomplet"), deci contrastul de
  acolo se verifica pe pixeli, langa litere.
- Starea finala (p = 1) e starea de citit: niciun text nu ramane stins in ea. Un prag care la referinta
  nu ajunge la opacitate 1 pana la p = 1 se coboara (ultimul rand din arborele de pe portal-clienti).
- Cu miscare permisa, sectiunea CENTRATA (p = 0,5) e locul unde se citeste: listele in trepte si
  aparitiile care poarta text se incheie pana la p ~0,45 (aceeasi scara, stransa), altfel textul de la
  capatul listei sta sub 4,5:1 exact acolo (asa sunt si `Pivot` si `CardCitat`). Exceptii, cu motiv:
  scenele care se dezvaluie pe toata lungimea lor (avalansa lipita, arborele cu voal), unde randurile
  inca neaprinse sunt ilustratia, nu text de citit; zonele inactive ale unei machete cu roluri. Probe in
  `cinema-1.spec.ts`: axe pe fiecare sectiune la p 0,5, cu miscare (poarta site-ului masoara doar la
  miscare redusa), si contrastul CALCULAT pe fiecare text, fiindca axe lasa "incomplet" textul de peste
  fundaluri cu imagine (toata cronologia de pe automatizari-ai).
- Orice miscare are starea finala in HTML-ul servit si la miscare redusa. Ceasurile din JavaScript
  (pulsul avalansei, ciclul de roluri din portal) merg numai cat piesa e in fereastra si numai cu
  miscare permisa; animatiile CSS fara capat (plutiri, clipiri) le opreste regula globala de miscare
  redusa.

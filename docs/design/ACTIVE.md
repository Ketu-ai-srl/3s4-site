# Activele vizuale ale site-ului și proveniența lor

Fiecare activ vizual din depozit, de unde vine și sub ce licență. Nimic din desenele, imaginile, sigla sau codul referinței vizuale (REF-N, [ADR-0007](../adr/ADR-0007-directie-ref-n.md)) nu se află aici. Direcția nu folosește fotografii.

## Sigla 3S

Marca 3S e înregistrată la OSIM. Fișierul oficial (vectorial, pentru web) vine din dosarul de brand al proiectului și e servit **neschimbat la octet**; celelalte trei fișiere sunt derivate din el, cu schimbarea scrisă pe rândul fiecăruia:

| Fișier | Ce e | Cum s-a obținut |
|---|---|---|
| `public/brand/sigla-3s.svg` | sigla oficială: iconița și textul mărcii | copiat neschimbat; sha256 `af5de81be4f706be42199046b2ff71cf634c05efcc77dddc67e2e7154492fe33`, identic cu fișierul oficial |
| `public/brand/sigla-3s-inchis.svg` | același desen, pentru fundal închis | grupul rădăcină al desenului primește `fill="#ffffff"`: textul, desenat implicit în negru, devine alb; culorile iconiței rămân |
| `public/brand/sigla-3s-marca.svg` | numai iconița pătrată | același desen, cu fereastra de vizualizare tăiată pe iconiță (`viewBox="9 34.8 219.1 219.1"`) |
| `public/brand/sigla-3s-compacta.svg` | forma compactă: iconița și cuvântul ADRIA, pentru locurile înguste | decupată din `sigla-3s.svg` (amprenta de pe primul rând): cele 7 trasee ale iconiței și cele 5 ale cuvântului ADRIA, 12 în total, copiate neschimbate, caracter cu caracter; ADRIA e mutat pe verticală cu `translate(0 44.32)`, ca să stea centrat pe iconiță; fără linia despărțitoare gri și fără rândurile DOC MANAGEMENT și scan-store-solve; `viewBox="9 34.8 522.4 219.1"`. Proba `tests/fundatie-brand.test.ts` caută fiecare traseu în fișierul oficial |

Componentele care o folosesc: `src/components/global/SiglaMarca.tsx` în antet, în sertarul mobil și în subsol (căile fișierelor vin din `config/brand.json`), și `src/components/primitive/Sigla.tsx` pentru iconița din erou. Mărimile: forma compactă de 40 px (95,4 px lățime) în antet și în sertar, iar sub 768 px cadrul antetului o taie după iconiță (40 x 40); sigla completă de 96 px (227,8 px lățime) în subsol, cu varianta pentru fundal închis pe paginile închise; iconița de 40 px în centrul buclei din erou. De ce aceste mărimi și cât au literele pe pixeli: `DIRECTIA.md`, secțiunea „Sigla”.

Forma compactă a fost cerută de dispecer în sarcina feliei 43, ca sigla să se citească în slotul îngust al antetului. Acordul owner-ului pe așezarea ei (ADRIA mutat pe verticală, fără linia despărțitoare) e în așteptare.

## Siglele terților (banda de integrări, rețelele din subsol)

Mărcile rămân ale deținătorilor; se arată monocrom, numai ca să numească integrarea. Regulile de marcă ale fiecărui deținător se aplică peste licența pachetului; verificarea lor e un pas deschis, nu o măsurătoare făcută.

| Cheie | Sursa desenului | Licență |
|---|---|---|
| `google-workspace`, `gmail`, `whatsapp`, `sap`, `claude`, `youtube`, `x` | traseele din pachetul Simple Icons 16.32, copiate neschimbat | CC0 |
| `microsoft-365` | patru pătrate desenate aici, fără culorile mărcii | desen propriu |
| `outlook`, `peppol`, `storecove`, `chatgpt`, `email` | iconițe generice din setul Lucide (plic, noduri, cutie, scântei) | ISC |
| `linkedin` | iconiță generică (oameni) din Lucide: marca rețelei nu are o sursă cu licență deschisă, iar un desen care o imită ar fi o imitație de marcă; provizoriu, până la decizie | ISC |

Componenta: `src/components/primitive/SiglaTert.tsx`. Platformele din panoul Descarcă (Windows, macOS, Linux, iOS, Android, web) au iconițe generice Lucide, nu siglele sistemelor.

## Iconițele de interfață

Setul Lucide (pachetul `lucide-react`, licența ISC), pe grila de 24, cu contur 1,3-2,5 și capete rotunde. Numai iconițele numite intră în pachetul paginii: harta explicită din `src/components/primitive/Iconita.tsx`. Proba `tests/fundatie-start.test.ts` cere ca fiecare nume din contractele de conținut să existe în hartă.

## Desene proprii

- **Bucla din erou** (ciotul static): un „8" culcat din patru curbe Bezier, cu straturile de drum, nodurile și centrul; geometria e o formă de bază, desenată în `src/components/erou/Erou.tsx`.
- **Coloanele din legenda eroului**: o coloană mică (capitel, fus cu trei caneluri, bază în două trepte), desenată aici, în aceleași proporții și culori ca ornamentul măsurat, nu copiată.
- **Vizualul CTA-ului final**: pași și rezultat construiți în HTML, cu date fictive declarate ca exemplu.

## Fonturile

Plus Jakarta Sans, JetBrains Mono și Marck Script, sub licența SIL Open Font License, descărcate la construire de `next/font` și servite de pe domeniul site-ului (fără cereri către terți la vizitare).

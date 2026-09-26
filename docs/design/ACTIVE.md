# Activele vizuale ale site-ului și proveniența lor

Fiecare activ vizual din depozit, de unde vine și sub ce licență. Nimic din desenele, imaginile, sigla sau codul referinței vizuale (REF-N, [ADR-0007](../adr/ADR-0007-directie-ref-n.md)) nu se află aici. Direcția nu folosește fotografii.

## Sigla 3S

Marca 3S e înregistrată la OSIM. Pe site se servește **numai iconița** mărcii (decizia owner-ului D10, 25.09), decupată din fișierul oficial; fișierul oficial întreg nu se mai servește și stă în depozit doar ca referință a decupajului:

| Fișier | Ce e | Cum s-a obținut |
|---|---|---|
| `docs/design/brand/sigla-3s-oficiala.svg` | sigla oficială, vectorială, pentru web; NU se servește | copiată neschimbat din dosarul de brand al proiectului; sha256 `af5de81be4f706be42199046b2ff71cf634c05efcc77dddc67e2e7154492fe33` |
| `public/brand/sigla-3s-iconita.svg` | iconița: chenarul de scanare, dosarul și „3S” | decupată din fișierul oficial: cele 7 trasee ale iconiței, copiate neschimbate, caracter cu caracter, în ordinea din original; fereastra tăiată pe iconiță (`viewBox="9 34.8 219.1 219.1"`, cutia măsurată a traseelor: x 9,00-228,06, y 34,81-253,88); fără linia despărțitoare, fără rândurile de text și fără glife de font. Proba `tests/fundatie-brand.test.ts` caută fiecare traseu în fișierul oficial și cere ca niciunul să nu înceapă la dreapta iconiței |

Componentele care o folosesc: `src/components/global/SiglaMarca.tsx` în antet (40 px), în sertarul mobil (40 px) și în subsol (56 px), cu calea din `config/brand.json`; `src/components/primitive/Sigla.tsx` pentru iconița din erou și din rama promo; `src/components/seo/imagine-sociala.tsx` pentru imaginile Open Graph și ale cardului social. Aceeași imagine pe fundal deschis și închis: are numai culori explicite. De ce aceste mărimi și cât are „3S” pe pixeli: `DIRECTIA.md`, secțiunea „Sigla”.

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

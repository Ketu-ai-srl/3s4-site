# Formularul de contact: piesa comuna si punctul de trimitere

Construit de felia `enterprise-formular` (valul S4-3) si **inghetat** dupa pliere. Felia `conversie`
il foloseste pe `/contact` si pe pagina contului nou; o schimbare aici se cere dispecerului.

## Cum se pune intr-o pagina

```tsx
import SectiuneFormular from "@/components/formular/SectiuneFormular";

<SectiuneFormular
  formular="contact"            // unul din FORMULARE (src/components/consimtamant/evenimente.ts)
  id="contact-form"             // ancora sectiunii
  eticheta="..."                // eticheta 12/600 albastru
  titlu="..."                   // h2 40 (30 sub 768)
  subtitlu="..."                // un rand, 18 cerneala-2
  exempluMesaj="..."            // textul-exemplu al mesajului, propriu paginii
  subiect="..."                 // inceputul subiectului din previzualizarea de rezerva
/>
```

`SectiuneFormular` e componenta de server: decide starea (`stare.ts`) si randeaza nota de
informare cu legatura spre politica prin `Tinta`. `FormularContact` e insula de browser.

## Piesele

| Fisier | Rol |
|---|---|
| `SectiuneFormular.tsx` | sectiunea `#<id>`, invelisul 640 cu aparitie, capul centrat, nota de informare |
| `FormularContact.tsx` | campurile, validarea, corectorul, trimiterea, starile de succes si de rezerva |
| `CampFormular.tsx` | campul comun: eticheta, `name`, `autocomplete`, eroarea legata prin `aria-describedby` |
| `CorectorEmail.tsx` | blocul `role=status` cu avertismentul si adresa propusa |
| `validare.ts` | validarea, aceeasi in browser si pe server; citirea stricta a corpului |
| `corector.ts` | propunerea de domeniu (distanta de editare cel mult 2 fata de domeniile mari) |
| `stare.ts` | `activ`, adresa de rezerva, denumirea operatorului, termenul de stocare din politica |

## Comutatorul (planul valului S4, §9-§10)

| | `config/operator.json` cu `"operator": null` (azi) | operator complet |
|---|---|---|
| formularul | identic vizual, validare completa, **nicio cerere**: langa buton apare mesajul ca nimic nu a plecat si nimic nu s-a salvat | trimite la `/api/formular` |
| `/api/formular` | `503 {"stare":"inactiv","motiv":"fara-operator"}`, **fara sa citeasca corpul** si fara jurnal | vezi mai jos |
| nota de informare | scopul, temeiul, pastrarea, legatura spre politica (inerta cat timp politica nu e publicata) | la fel, plus denumirea operatorului |

## Punctul de trimitere `POST /api/formular`

Logica: `src/app/api/formular/logica.ts` (`route.ts` doar o cheama cu configurarea reala).

Corpul, JSON, exact cheile acestea (orice alta cheie inseamna respingere):

```json
{ "formular": "enterprise", "nume": "", "email": "", "telefon": "", "companie": "", "mesaj": "", "marketing": false }
```

Raspunsuri:

| Cod | Corp | Cand |
|---|---|---|
| 503 | `{"stare":"inactiv","motiv":"fara-operator"}` | operatorul lipseste sau e incomplet; corpul nu se citeste |
| 503 | `{"stare":"inactiv","motiv":"fara-destinatie"}` | `FORMULARE_DESTINATIE` lipseste sau nu e HTTPS (HTTP doar pe 127.0.0.1 / localhost, pentru proba) |
| 403 | `{"stare":"respins","motiv":"origine" \| "tip"}` | `Origin` lipsa sau alta decat a site-ului; corp care nu e `application/json`. Corpul nu se citeste |
| 429 | `{"stare":"respins","motiv":"prea-multe"}` + `Retry-After` | peste 10 cereri pe minut de la aceeasi adresa (prima din `X-Forwarded-For`). Corpul nu se citeste |
| 413 | `{"stare":"respins","motiv":"prea-mare"}` | peste 16.000 de octeti, numarati in flux (nu dupa `Content-Length`) |
| 400 | `{"stare":"respins","motiv":"forma" \| "validare" \| "corp-necitit"}` | JSON invalid, chei straine, campuri obligatorii lipsa |
| 502 | `{"stare":"eroare"}` | destinatia nu intoarce 2xx in 8 s |
| 200 | `{"stare":"trimis"}` | destinatia a primit cererea; SAU capcana e completata ori durata DECLARATA e sub 3 s (`DURATA_MINIMA_MS`), caz in care nimic nu pleaca (un robot nu afla ca a fost oprit) |

Anti-abuz (constatarea de audit 3S4-F-008, `src/app/api/formular/garda.ts`): pe langa campurile de
mai sus, corpul poate avea `adresa_site` (campul-capcana, ascuns, gol la om) si `durata`
(milisecunde de la afisarea formularului la trimitere). Amandoua sunt optionale pe server: formularul
de cont (felia conversie) nu le trimite inca.

Pragul duratei (`DURATA_MINIMA_MS`, 3 s, in `validare.ts`) si ce vede omul: `FormularContact` nu
trimite niciodata sub prag. Daca omul apasa mai repede (de pilda cu completarea automata a
navigatorului), butonul ramane pe "Se trimite..." pana se implinesc cele 3 s de la afisare, apoi cererea
pleaca normal si ajunge la destinatie. Raspunsul 200 fara trimitere il primesc deci numai cererile care
declara singure o durata sub prag, adica nu vin din formularul paginii. O cerere FARA durata trece de
prag (cheia e optionala), deci pragul nu opreste un robot care o omite: acela ramane la capcana, la
garda (origine, tip, rata, marime) si la validare.

Catre destinatie pleaca un singur `POST` JSON: `formular`, `nume`, `email`, `telefon`, `companie`,
`mesaj`, `marketing`, `versiune_informare` (amprenta notei de informare a formularului, aceeasi metoda
ca la cookie-uri, 3S4-F-045), `primit` (ISO 8601); cu `FORMULARE_SECRET` setat, cererea poarta si
antetul `X-Formular-Secret`. Nimic din corp nu se scrie in jurnalul serverului; la
eroare se scrie doar motivul.

In ziua operatorului: se completeaza `config/operator.json` si se seteaza `FORMULARE_DESTINATIE`
si `FORMULARE_SECRET` in mediul aplicatiei (canalul de lead-uri si secretul lui). Pasul e in
`docs/ziua-operatorului.md`.

## Probe

- `tests/enterprise-formular.test.ts`: validarea, corectorul, punctul de trimitere cu operator
  `null` (corpul necitit), cu operator sintetic si destinatie de proba, respingerile.
- `tests/securitate.test.ts`: garda (originea, tipul, rata, marimea in octeti), capcana, durata,
  versiunea notei si secretul destinatiei.
- `tests/browser/enterprise-formular.spec.ts`: build-ul real (zero cereri de trimitere, mesajul
  cinstit, erorile, corectorul) si o copie cu operator SINTETIC, in care trimiterea ajunge la un
  server de proba local si starea de rezerva apare cand destinatia intoarce 500. Trimiterea din proba
  completeaza si apasa imediat dupa afisare (martorul ca omul rapid nu pierde mesajul), iar perechea de martori a
  pragului: o durata declarata sub prag nu ajunge la destinatie, peste prag ajunge.

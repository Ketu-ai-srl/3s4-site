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
| 413 | `{"stare":"respins","motiv":"prea-mare"}` | peste 16.000 de octeti |
| 400 | `{"stare":"respins","motiv":"forma" \| "validare" \| "corp-necitit"}` | JSON invalid, chei straine, campuri obligatorii lipsa |
| 502 | `{"stare":"eroare"}` | destinatia nu intoarce 2xx in 8 s |
| 200 | `{"stare":"trimis"}` | destinatia a primit cererea |

Catre destinatie pleaca un singur `POST` JSON: `formular`, `nume`, `email`, `telefon`, `companie`,
`mesaj`, `marketing`, `primit` (ISO 8601). Nimic din corp nu se scrie in jurnalul serverului; la
eroare se scrie doar motivul.

In ziua operatorului: se completeaza `config/operator.json` si se seteaza `FORMULARE_DESTINATIE`
in mediul aplicatiei (canalul de lead-uri). Nimic altceva.

## Probe

- `tests/enterprise-formular.test.ts`: validarea, corectorul, punctul de trimitere cu operator
  `null` (corpul necitit), cu operator sintetic si destinatie de proba, respingerile.
- `tests/browser/enterprise-formular.spec.ts`: build-ul real (zero cereri de trimitere, mesajul
  cinstit, erorile, corectorul) si o copie cu operator SINTETIC, in care trimiterea ajunge la un
  server de proba local si starea de rezerva apare cand destinatia intoarce 500.

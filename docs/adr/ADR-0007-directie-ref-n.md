# ADR-0007: direcția REF-N pentru 3s4

Data: 2026-09-24. Stare: acceptată, implementată începând cu valul S4-1 (felia `fundatie`). Înlocuiește [ADR-0006](ADR-0006-directie-ref-s.md).

## Context

Owner-ul a cerut ca 3s4 să reproducă identic o referință vizuală externă, cu nume de cod **REF-N**. Referința a fost măsurată în faza S4-0 (capturi de fereastră la 1440 și 390, stiluri calculate, cronologii de animație, fișe pe fiecare pagină), în depozitul privat al fabricii. Direcția anterioară, REF-S, nu mai descrie produsul cerut.

## Decizie

1. **Se reproduce forma**: așezarea, ordinea secțiunilor, paleta, fonturile, mărimile, spațierile, razele, umbrele, animațiile, interacțiunile, arborele de pagini și meniurile, toate din măsurători. Sinteza folosită în cod: [DIRECTIA.md](../design/DIRECTIA.md).
2. **Nu se preia nimic protejat** (limita D1b din planul valului): nici textele, nici imaginile, nici sigla, nici iconițele desenate de referință, nici codul ei. Textele se scriu pentru 3S, pe același rol și aceeași lungime. Iconițele vin din setul Lucide (ISC), siglele terților din Simple Icons (CC0) sau din iconițe generice, fonturile (Plus Jakarta Sans, JetBrains Mono, Marck Script) sunt sub OFL. Proveniența fiecărui activ: [ACTIVE.md](../design/ACTIVE.md).
3. **Numele și domeniul referinței nu se scriu nicăieri** în depozit: nici în cod, nici în comentarii, nici în mesajele de commit. I se spune REF-N sau „sursa". Verificarea e mecanică, în fabrică, pe arbore și pe mesajele de commit, înainte de orice împingere.
4. **Faptele** de pe site sunt numai cele din registrul de afirmații și din deciziile owner-ului consemnate în plan: prețurile sunt publice și toate pachetele costă 0 RON astăzi (D3); găzduirea e la Amazon, în Germania, într-o singură regiune UE, cu criptare AES-256 la stocare și TLS 1.2+ în tranzit (D4c); nicio cifră de tracțiune și niciun testimonial inventat (D5); datele din machete sunt fictive și declarate ca exemplu (D9).
5. **Acțiunea principală** devine contul gratuit (`/inregistrare`). Toate țintele externe ale referinței (aplicația web, instalatorii, magazinele de aplicații, autentificarea) duc acolo până când 3S are adrese publice pentru ele.
6. **Accesibilitatea bate identicul**: unde referința pică WCAG sau are un defect măsurat, 3S se abate, iar abaterea e scrisă în DIRECTIA.md.

## Consecințe

- REF-S se retrage într-un singur commit cu noua pagină de start: rutele, componentele, conținutul, registrele de afirmații, imaginile și probele ei. Pragul de regresie al probelor se coboară declarat, în același commit, cu motivul scris.
- Construcția merge pe valuri (S4-1 ... S4-5). În valurile intermediare navigația arată numai rutele care există deja, iar legăturile din corpul paginilor spre rute lipsă rămân inerte, cu același aspect; la livrare nimic nu mai e filtrat.
- Trei piese mari ale startului (eroul, constructorul, funcționalitățile) încep ca cioturi statice, la căi fixe, și sunt înlocuite fiecare de felia ei.
- Asemănarea vizuală cu referința e intenționată și vizibilă. Site-ul de probă e `noindex`; expunerea crește la lansarea publică, iar decizia aceea rămâne a owner-ului.

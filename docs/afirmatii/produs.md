# Afirmatii de confirmat

> Generat automat din `src/content/afirmatii/produs.json`. NU se editeaza de mana:
> se schimba registrul, iar poarta regenereaza fisierul si pica daca difera.

Lista de mai jos e ce trebuie sa bifeze cineva care stie afacerea, inainte de publicare.
Pana atunci, afirmatiile stau pe site ca text redactional, nu ca fapt verificat.

**De confirmat: 14 din 22**

| # | Afirmatia, asa cum apare pe site | Unde |
|---|---|---|
| 1 | Fișierele păstrate de 3S sunt criptate AES-256 la stocare, pe serverele din Germania, și circulă doar prin conexiuni TLS 1.2 sau mai noi între dispozitivul clientului și serverele 3S, deci pe o rețea Wi-Fi publică cine ascultă rețeaua vede doar date criptate | `src/content/produs/platforma.ts, src/content/produs/securitate.ts` |
| 2 | Pe stocarea proprie, fișierele stau în contul firmei și nu trebuie copiate în altă parte, iar colegii lucrează pe web și pe WhatsApp ca până atunci: întrebările cu pagina citată, accesul pe persoană și pe dosar și jurnalul deschiderilor rămân în 3S | `src/content/produs/securitate.ts, src/content/produs/platforma.ts, src/content/produs/integrari.ts` |
| 3 | 3S scoate textul din paginile scanate, trece fiecare act în registrul arhivei cu o categorie și îi scoate datele în câmpuri, pe care programele firmei le citesc prin API | `src/content/produs/platforma.ts` |
| 4 | Actele intră în 3S ca hârtie scanată la 3S, fișiere încărcate, e-mailuri, poze de pe telefon, mesaje pe WhatsApp și cereri prin API | `src/content/produs/platforma.ts` |
| 5 | Fiecare răspuns al 3S vine cu documentul și cu pagina din care e luat | `src/content/produs/platforma.ts, src/content/produs/integrari.ts` |
| 6 | 3S arată din timp ce contract expiră și ce act lipsește dintr-un dosar | `src/content/produs/platforma.ts` |
| 7 | Fiecare act e trecut în registrul arhivei și primește termenul de păstrare după categoria lui; ce poate ieși din arhivă apare din timp, iar hotărârea de a scoate un act rămâne a firmei | `src/content/produs/platforma.ts, src/content/produs/securitate.ts` |
| 8 | Fiecare căutare și fiecare document deschis se trec în jurnal, cu numele și ora, iar jurnalul e pus la dispoziția firmei | `src/content/produs/platforma.ts, src/content/produs/securitate.ts, src/content/produs/integrari.ts` |
| 9 | Accesul se dă nominal, pe persoană și pe dosar; prin portal, fiecare client intră doar în categoriile pe care i le deschide firma, iar o categorie deschisă primește singură actele noi | `src/content/produs/platforma.ts, src/content/produs/securitate.ts, src/content/produs/integrari.ts` |
| 10 | După legătura cu Microsoft Entra ID, colegii și grupurile din director apar în 3S fără invitații și fără liste încărcate de mână, fiecare coleg intră cu contul de la serviciu (SAML 2.0 sau OIDC), fără o parolă separată pentru 3S, iar administratorul 3S le deschide apoi dosarele, pe persoană | `src/content/produs/integrari.ts` |
| 11 | 3S preia și scanează actele pe hârtie pe care i le predă clientul; originalele se preiau pe bază de proces-verbal și stau pe rafturi, în depozitul 3S, până când clientul le cere înapoi | `src/content/produs/platforma.ts, src/content/produs/securitate.ts` |
| 12 | Un original din depozitul 3S iese numai la cererea cuiva trecut în scris pe lista clientului | `src/content/produs/securitate.ts, src/content/produs/platforma.ts` |
| 13 | Cazurile de folosire de pe pagina de platformă descriu fluxuri pe care 3S le face azi: CMR-urile și dovezile de livrare legate de cursă, actele unui șantier strânse în același dosar și găsite după adresă, actele fiecărui client de contabilitate strânse pe lună și văzute de client prin portal, cataloagele și dosarele absolvenților găsite după nume și an, întrebările inspectorului de daune pe WhatsApp, cu pagina din poliță, și dosarul de daună urmărit de client prin portal | `src/content/produs/platforma.ts` |
| 14 | Problemele de securitate găsite în 3S se raportează pe pagina de contact, cu „securitate” în subiectul mesajului, iar detaliile nu se publică până la reparare | `src/content/produs/securitate.ts` |


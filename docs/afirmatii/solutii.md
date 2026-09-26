# Afirmatii de confirmat

> Generat automat din `src/content/afirmatii/solutii.json`. NU se editeaza de mana:
> se schimba registrul, iar poarta regenereaza fisierul si pica daca difera.

Lista de mai jos e ce trebuie sa bifeze cineva care stie afacerea, inainte de publicare.
Pana atunci, afirmatiile stau pe site ca text redactional, nu ca fapt verificat.

**De confirmat: 22 din 30**

| # | Afirmatia, asa cum apare pe site | Unde |
|---|---|---|
| 1 | Fișierele sunt criptate AES-256 pe disc și circulă numai prin TLS, versiunea 1.2 sau una mai nouă | `src/content/solutii/comun.ts, src/content/solutii/hub.ts` |
| 2 | Contul se deschide fără card de plată | `src/content/solutii/comun.ts, src/content/solutii/hub.ts` |
| 3 | Fiecare răspuns vine cu documentul și cu pagina din care e luat | `src/content/solutii/comun.ts, src/content/solutii/hub.ts, src/content/solutii/constructii.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/avocatura.ts, src/content/solutii/logistica.ts, src/content/solutii/notariate.ts, src/content/solutii/asigurari.ts, src/content/rute.ts` |
| 4 | La fiecare act încărcat, AI-ul scoate textul, chiar și dintr-o poză sau dintr-o scanare veche, și îl pune în index | `src/content/solutii/comun.ts, src/content/solutii/hub.ts, src/content/solutii/constructii.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/avocatura.ts, src/content/solutii/logistica.ts, src/content/solutii/notariate.ts, src/content/solutii/asigurari.ts` |
| 5 | Fiecare act nou e recunoscut după tip și așezat singur în dosarul lui (proiectul, clientul pe lună, clădirea și unitatea, cauza, cursa sau dauna), cu etichete | `src/content/solutii/comun.ts, src/content/solutii/hub.ts, src/content/solutii/constructii.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/avocatura.ts, src/content/solutii/logistica.ts, src/content/solutii/asigurari.ts` |
| 6 | Actele pe hârtie se predau la scanat și intră în arhiva 3S scanate | `src/content/solutii/hub.ts, src/content/solutii/constructii.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/avocatura.ts, src/content/solutii/logistica.ts, src/content/solutii/asigurari.ts` |
| 7 | 3S arată din timp ce act lipsește dintr-un dosar și ce contract expiră | `src/content/solutii/hub.ts, src/content/solutii/constructii.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/asigurari.ts, src/content/rute.ts` |
| 8 | În aplicație, accesul se dă pe persoană și pe dosar | `src/content/solutii/comun.ts, src/content/solutii/hub.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/avocatura.ts, src/content/solutii/notariate.ts, src/content/solutii/asigurari.ts` |
| 9 | Fiecare căutare și fiecare document deschis se trec în jurnal, cu numele și ora, iar jurnalul e la dispoziția clientului | `src/content/solutii/hub.ts, src/content/solutii/contabilitate.ts, src/content/solutii/imobiliare.ts, src/content/solutii/avocatura.ts, src/content/solutii/asigurari.ts` |
| 10 | Aplicația de telefon face din fotografia unui act o scanare curată și o trimite în dosarul lui | `src/content/solutii/constructii.ts, src/content/solutii/logistica.ts` |
| 11 | CMR-urile, avizele și dovezile de livrare stau legate de cursa lor și se găsesc după cursă sau după client | `src/content/solutii/logistica.ts, src/content/solutii/hub.ts, src/content/rute.ts` |
| 12 | Actele unei clădiri se găsesc după adresa ei | `src/content/solutii/imobiliare.ts, src/content/rute.ts` |
| 13 | Fiecare act al unei cauze stă în dosarul ei cu data la care a sosit | `src/content/solutii/avocatura.ts, src/content/solutii/hub.ts, src/content/rute.ts` |
| 14 | Volumele și registrele unui birou notarial se scanează, textul fiecărei pagini intră în index, iar un act se găsește după numele părților sau după o frază din el, cu volumul și pagina lui | `src/content/solutii/notariate.ts, src/content/solutii/hub.ts, src/content/rute.ts` |
| 15 | Consola 3S arată fiecare firmă a contabilului ca un card, cu actele de verificat, termenele expirate și actele sosite de curând, iar arhiva altei firme se deschide din listă, cu același cont | `src/content/solutii/contabilitate.ts` |
| 16 | Fiecare client al contabilului are portalul lui, vede numai actele firmei lui și are o adresă proprie de e-mail, iar atașamentele trimise acolo ajung în dosarul firmei lui | `src/content/solutii/contabilitate.ts` |
| 17 | O firmă nouă se adaugă în consolă după CUI și poate primi acte în aceeași zi | `src/content/solutii/contabilitate.ts` |
| 18 | O singură întrebare caută în arhivele tuturor firmelor unui contabil | `src/content/solutii/contabilitate.ts, src/content/solutii/hub.ts` |
| 19 | Termenele tuturor firmelor unui contabil apar pe o singură listă, în ordinea în care expiră | `src/content/solutii/contabilitate.ts` |
| 20 | În 3S se pot încărca documente PDF, fișiere Word și Excel, poze, scanări și e-mailuri cu atașamente | `src/content/solutii/hub.ts` |
| 21 | Primele acte electronice se încarcă din browser în ziua în care se deschide contul, fără să aștepte scanarea hârtiei | `src/content/solutii/hub.ts` |
| 22 | 3S calculează termenul de păstrare al fiecărui act din arhivă | `src/content/solutii/hub.ts` |


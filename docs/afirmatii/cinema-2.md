# Afirmatii de confirmat

> Generat automat din `src/content/afirmatii/cinema-2.json`. NU se editeaza de mana:
> se schimba registrul, iar poarta regenereaza fisierul si pica daca difera.

Lista de mai jos e ce trebuie sa bifeze cineva care stie afacerea, inainte de publicare.
Pana atunci, afirmatiile stau pe site ca text redactional, nu ca fapt verificat.

**De confirmat: 4 din 10**

| # | Afirmatia, asa cum apare pe site | Unde |
|---|---|---|
| 1 | Factura se generează din avizul deja încărcat, cu clientul și prețurile dintr-un șablon salvat, rămâne legată de aviz în registrul arhivei, se pune în dosarul clientului, pe luna ei, și se găsește prin căutare după client sau după numărul avizului | `src/content/functionalitati/e-facturi-si-avize.ts` |
| 2 | Factura pleacă prin integrarea de e-facturare a 3S, cu Peppol și Storecove | `src/content/functionalitati/e-facturi-si-avize.ts` |
| 3 | Aplicația de telefon face din fotografia unui act o scanare curată, îi pune etichete (client, stare, loc, oră, agent) și îl trimite în dosarul clientului, unde biroul îl vede imediat | `src/content/functionalitati/aplicatie-mobila.ts` |
| 4 | Contul se deschide fără card de plată | `src/content/functionalitati/e-facturi-si-avize.ts, src/content/functionalitati/semnatura-calificata.ts` |


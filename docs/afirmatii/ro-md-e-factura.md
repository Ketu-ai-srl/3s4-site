# Afirmatii de confirmat

> Generat automat din `src/content/afirmatii/ro-md-e-factura.json`. NU se editeaza de mana:
> se schimba registrul, iar poarta regenereaza fisierul si pica daca difera.

Lista de mai jos e ce trebuie sa bifeze cineva care stie afacerea, inainte de publicare.
Pana atunci, afirmatiile stau pe site ca text redactional, nu ca fapt verificat.

**De confirmat: 13 din 16**

| # | Afirmatia, asa cum apare pe site | Unde |
|---|---|---|
| 1 | În RO e-Factura, fișierul unei facturi se poate descărca direct 60 de zile de la publicarea lui în sistem; după aceea ANAF îl arhivează și îl eliberează doar la cerere (facturile nu dispar) | `src/content/ro-md/e-factura-componente.ts, src/content/ro-md/e-factura.ts` |
| 2 | Facturile se păstrează 5 ani, socotiți de la 1 iulie a anului care urmează încheierii exercițiului financiar | `src/content/ro-md/e-factura-componente.ts` |
| 3 | Pentru bunurile cu durată de folosință mai lungă și pentru situațiile financiare anuale (10 ani), termenul de păstrare e mai lung | `src/content/ro-md/e-factura-componente.ts` |
| 4 | Exemplarul original al e-facturii e XML-ul însoțit de sigiliul electronic al Ministerului Finanțelor, cum îl livrează ANAF; PDF-ul e doar copia pentru citit | `src/content/ro-md/e-factura-componente.ts, src/content/ro-md/e-factura.ts` |
| 5 | Pentru facturi nu e nevoie de o arhivă electronică acreditată: Codul fiscal permite stocarea electronică fără acreditare, cu condiția ca facturile să rămână autentice, întregi și lizibile | `src/content/ro-md/e-factura-componente.ts` |
| 6 | Autorizarea se face pe pagina oficială ANAF, cu certificatul digital calificat al tău, al reprezentantului legal sau al împuternicitului; parola și PIN-ul certificatului nu ajung la 3S, iar certificatul rămâne la client | `src/content/ro-md/e-factura-componente.ts` |
| 7 | Autorizarea ANAF se reînnoiește periodic, iar 3S anunță din timp când e cazul | `src/content/ro-md/e-factura-componente.ts` |
| 8 | Ca împuternicit în SPV, contabilul poate autoriza 3S o dată, cu certificatul lui, pentru toate firmele pe care le reprezintă; clientul care își păstrează certificatul autorizează singur, pe site-ul ANAF, dintr-un link primit de la contabil | `src/content/ro-md/e-factura-componente.ts` |
| 9 | Serviciul (în pregătire) va descărca zilnic facturile emise, cele primite și mesajele de eroare ANAF, le va păstra în arhiva firmei cu o copie PDF, va permite căutarea în cuvintele tale cu documentul-sursă, exportul CSV și pachetul lunar ZIP, facturile separate pe CUI în contul contabilului, încărcarea facturilor mai vechi de 60 de zile din calculator și păstrarea lor lângă restul documentelor firmei | `src/content/ro-md/e-factura-componente.ts, src/content/ro-md/e-factura.ts` |
| 10 | Cheia de acces primită de la ANAF se păstrează criptat | `src/content/ro-md/e-factura-componente.ts` |
| 11 | Autorizarea se poate retrage oricând, din 3S sau din ANAF; arhiva se exportă oricând, inclusiv după încheierea abonamentului | `src/content/ro-md/e-factura-componente.ts` |
| 12 | Prețuri pe firmă (CUI), în euro, fără TVA, pe an: Gratuit 0 EUR (o firmă, până la 100 de facturi pe an), Firmă 8,49 EUR (până la 100 de facturi pe lună), Firmă plus 17,76 EUR (până la 1.000), Firmă max 34,75 EUR (până la 10.000), Cabinet 61,69 EUR (firme nelimitate, până la 3.000 pe lună în total), Cabinet max 181,33 EUR (firme nelimitate, până la 30.000 pe lună în total) | `src/content/ro-md/e-factura-componente.ts, src/app/(romd)/ro/preturi/page.romd.tsx` |
| 13 | Clienții înscriși la acces timpuriu își păstrează locul și prețul de lansare 24 de luni | `src/content/ro-md/e-factura-componente.ts` |


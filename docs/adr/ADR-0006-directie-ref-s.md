# ADR-0006: direcția REF-S pentru 3s4

Data: 2026-09-18. Stare: înlocuită de [ADR-0007](ADR-0007-directie-ref-n.md) pe 2026-09-24 (direcția REF-N); REF-S s-a retras din cod în valul S4-1. Textul de mai jos rămâne ca istoric.

3s4 folosește o referință vizuală nouă. Specificațiile REF-A moștenite din 3s2 (pastile, container de 980 px, titluri 600, interdicția gradientelor și fotografii înaintea titlului) nu mai descriu produsul cerut. Le înlocuim cu REF-S: alb, cerneală marină, violet, antet editorial, artă abstractă și secțiuni modulare.

`tests/directia.test.ts` înlocuiește 38 de cazuri despre vechea gramatică cu 19 cazuri privind contrastul calculat, tipografia, mișcarea redusă, randarea antetului, datele structurate și demonstrația ilustrativă. Testele browser ale tuturor celor 22 de rute și porțile de conținut, juridic, SEO, imagini și legături rămân active. Pragul de regresie se actualizează explicit în același commit cu această migrare; reducerea este declarată.

Fotografiile sunt generate original pentru acest site, la cererea utilizatorului. Verificarea adreselor Pexels este înlocuită cu verificarea registrului de generare și a identificatorilor unici. Dimensiunile, fișierele orfane, descrierile ilustrative și identitatea imaginilor între site-uri continuă să fie verificate. Imaginile nu sunt prezentate ca fotografii ale unui depozit deținut.

Exemplele din demonstrația Solve sunt fictive și etichetate explicit. Nu există încărcare de documente, interogare externă sau afirmație că demonstrația este conectată la un serviciu live. Cele trei verificări browser noi au și martori pozitiv/negativ pentru detectorul acțiunilor ieșite din fereastră.

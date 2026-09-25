# Afirmatii de confirmat

> Generat automat din `src/content/afirmatii/juridic.json`. NU se editeaza de mana:
> se schimba registrul, iar poarta regenereaza fisierul si pica daca difera.

Lista de mai jos e ce trebuie sa bifeze cineva care stie afacerea, inainte de publicare.
Pana atunci, afirmatiile stau pe site ca text redactional, nu ca fapt verificat.

**De confirmat: 7 din 16**

| # | Afirmatia, asa cum apare pe site | Unde |
|---|---|---|
| 1 | Ținta declarației de accesibilitate este nivelul AA din WCAG 2.2, iar site-ul nu declară încă o conformitate deplină | `src/app/accesibilitate/page.tsx, src/content/juridic/pagini.ts` |
| 2 | Fișierele sunt criptate AES-256 pe disc și circulă numai prin conexiuni TLS 1.2 sau mai noi | `src/content/juridic/termeni.ts` |
| 3 | Fiecare client își vede numai arhiva lui, iar fiecare utilizator are în cont rolul dat de client | `src/content/juridic/termeni.ts` |
| 4 | Cei care lucrează cu datele clientului s-au obligat să le păstreze secrete | `src/content/juridic/termeni.ts` |
| 5 | Subîmputernicitul numit azi al platformei este Amazon Web Services, pentru găzduire; furnizorul unui model de inteligență artificială care primește documente intră în listă înainte să primească vreun document | `src/content/juridic/subimputerniciti.ts` |
| 6 | Licența aplicației este de folosire, neexclusivă și netransmisibilă, cât timp contul e activ, fără codul sursă, iar drepturile asupra codului rămân ale titularilor lor | `src/content/juridic/licenta.ts` |
| 7 | Contul se deschide numai cu acceptarea termenilor și a Anexei A | `src/content/juridic/termeni.ts` |


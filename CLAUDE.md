# 3S Site - reguli de lucru

Site de vanzare pentru marca **3S - Scan Store Solve**.

Ce se comite aici pleaca din controlul nostru in momentul commit-ului: ramane in obiectele git,
in clonele existente si in orice copie de la distanta. Vizibilitatea depozitului se schimba
dintr-un buton si nu schimba nimic din ce e deja in istoric, deci nu e o aparare si nu se
invoca niciodata ca motiv.

## Inainte de orice modificare

1. Citeste `CONTEXT.md`. Este glosarul: fiecare termen care apare in cod, in sarcini si in
   discutie, cu locul unde ii traieste detaliul.
2. Fiecare regula din `.claude/rules/` isi declara suprafata in frontmatter-ul `paths`, pe
   calea fisierului atins. `paths` e o DECLARATIE, nu un mecanism al depozitului: nimic din
   `pnpm verifica` nu o citeste, iar daca unealta cu care lucrezi nu o onoreaza, nimic nu
   incarca regula. Atunci `.claude/rules/INDEX.md` e harta pe care o deschizi de mana.
3. Ruleaza poarta locala: `pnpm verifica`. Nimic nu pleaca spre depozitul de la distanta fara
   ea verde. Un pas care iese 3 inseamna NEMASURAT, nu curat.

## Deciziile care nu se renegociaza in cod

- **Doar cratima**, niciodata liniuta lunga. Se aplica la tot ce se comite.
- **Diacritice complete** in textul vizibil, si o singura forma de adresare pe tot site-ul.
- **Preturile sunt publice**: toate pachetele costa 0 RON astazi (decizia D3 din planul valului
  S4). O suma noua intra pe site numai cu intrare in registrul de afirmatii.
- **Doar brandul, fara date de firma** (decizia owner-ului, 24.09): pe site nu apar denumire,
  sediu, numar de registru, cod fiscal sau telefon. Numele, sigla si adresa de e-mail vin din
  `config/brand.json`; adresa se arata numai confirmata, iar pana atunci nu se arata deloc.
  Datele unei firme tin de operatorul de date, `config/operator.json`, `null` azi.
- **Sigla** se pune numai la o marime la care se citeste fiecare rand al ei; formele si marimile
  sunt in `docs/design/DIRECTIA.md`, sectiunea "Sigla".
- **Vechimea, autorizarea si certificarile se scriu atribuit** entitatii care ar scoate actul
  daca un cititor cere dovada. Regula are fisierul ei: `.claude/rules/afirmatii-atribuite.md`.
- **Actiunea principala e contul gratuit** (`/inregistrare`), iar butonul plin al fiecarei pagini
  duce la el. Tintele externe ale referintei vizuale (aplicatia web, instalatorii, magazinele,
  autentificarea) duc tot acolo pana cand 3S are adrese publice; forma sta in glosar.
- **Directia vizuala e REF-N** (`docs/adr/ADR-0007-directie-ref-n.md`): se reproduce forma masurata,
  nu se preia nimic protejat (texte, imagini, sigla, iconite, cod). **Numele si domeniul referintei
  nu se scriu nicaieri** in depozit, nici in mesajele de commit: i se spune REF-N sau "sursa".
- **Navigatia arata numai rutele care exista** in `src/content/rute.ts`. O pagina noua intra acolo
  sub marcajul feliei ei; legaturile spre ea apar singure.
- **Portile nu se slabesc ca sa treaca lotul.** Cand una e rosie, editarea legitima e ingusta si
  numita; regula si zona editabila a fiecarei porti sunt scrise, poarta cu poarta.

## Dovada, nu declaratia

Un deploy se dovedeste comparand marcajul servit de mediu cu cel din commit. "Serviciul raspunde
200", "containerul e sus" si "build success" nu sunt dovezi: un endpoint de sanatate raspunde
200 cu dependintele cazute.

Aceeasi regula se aplica muncii proprii. Se separa mereu, explicit: **ce am rulat si am vazut** ·
**ce presupun** · **ce ramane nemasurat**. Al doilea si al treilea nu se prezinta ca primul.

# Glosar 3S

Termenii care apar in cod, in sarcini si in discutie. Fiecare rand spune ce e termenul si unde
traieste detaliul lui. Randul e definitia; nu tine inventarul fisierelor si nu poarta cifre care
imbatranesc - alea traiesc in fisierul catre care trimite.

| Termen | Ce inseamna | Unde e detaliul |
|---|---|---|
| **3S** | Marca "Scan Store Solve": arhivare fizica autorizata, digitalizare si cautare AI in documente. Firma din spate e in curs de infiintare. | `docs/adr/ADR-0001-stiva-si-medii.md` |
| **doar marca** | Decizia owner-ului D10: site-ul numeste numai marca 3S, nicio alta firma (text, date structurate, afirmatii, sigla). Vechimea si autorizarile altei firme nu se scriu. | `.claude/rules/afirmatii-atribuite.md` |
| **SerenityFlow** | Platforma care exista deja si face munca. Site-ul nu o contine: doar vinde si trimite spre ea. | - |
| **staging** | `3s4.ke2.in` - mediul de proba: public si marcat `noindex`. Pe el, portile de prezenta avertizeaza in loc sa opreasca. | `src/middleware.ts` |
| **productie** | Mediul pe care portile de prezenta OPRESC in loc sa avertizeze. Se creeaza cand owner-ul comunica domeniul real. | `docs/adr/ADR-0001-stiva-si-medii.md` |
| **marcaj de livrare** | Valoarea servita la `/stamp`, produsa din marcajul comis in arbore. Dovedeste ca deploy-ul a schimbat CONTINUTUL livrat, nu doar ca serviciul raspunde. | `src/app/stamp/route.ts` |
| **poarta** | O comanda care opreste munca printr-un cod de iesire: `0` curat, `1` probleme, `2` folosire gresita, `3` NEMASURAT. Trei nu e curat. Nu e o intentie, e un cod. | `package.json`, scriptul `verifica` |
| **reziduu** | Ce o poarta NU verifica, scris in antetul ei. Exista ca zeroul portii sa nu fie citit drept acoperire: verde inseamna "nimic din ce stie sa caute nu a iesit". | antetul fiecarei porti din `.claude/scripts/porti/` |
| **martor** | Fixtura fabricata la rulare care TREBUIE prinsa (pozitiv) sau care NU trebuie prinsa (negativ). O poarta care nu si-a rulat martorii nu are voie sa spuna "curat". | `.claude/rules/masoara-adevarul-nu-surogatul.md` |
| **val** (lot) | Un grup de felii duse impreuna: agenti in worktree separat, poarta locala, un singur push, o singura rulare de integrare, promovare prin API. Masinaria sta in depozitul privat al fabricii; aici raman doar portile site-ului. | `.claude/scripts/porti/` (portile), depozitul fabricii (masinaria) |
| **cont gratuit** | Actiunea principala a site-ului: deschiderea unui cont la `/inregistrare`, la 0 RON astazi. Tot acolo duc, pana la adrese publice, aplicatia web, instalatorii, magazinele si autentificarea. | `src/content/navigatie.ts` (`CALE_INREGISTRARE`) |
| **REF-N** | Numele de cod al referintei vizuale reproduse de 3s4. Numele si domeniul ei nu se scriu in depozit. | `docs/adr/ADR-0007-directie-ref-n.md`, `docs/design/DIRECTIA.md` |
| **ruta existenta** | O cale din `RUTE` (plus articolele din registrul blogului). Numai spre ea se arata legaturi in navigatie; in corpul paginii, o legatura spre o ruta lipsa ramane inerta, cu acelasi aspect. | `src/content/rute.ts`, `src/content/cai.ts`, `src/components/primitive/Tinta.tsx` |
| **marcaj de felie** | Randul `// <<felie:nume>>` din `rute.ts`: fiecare felie scrie rute numai sub marcajul ei, ca imbinarile sa nu se ciocneasca. | `src/content/rute.ts` |
| **marca** (configurarea marcii) | Ce arata site-ul despre 3S: numele, sigla si adresa de e-mail confirmata (goala pana o confirma owner-ul). Nicio data de firma. | `config/brand.json`, `src/content/entitate.ts` |
| **operator** (comutatorul) | Operatorul de date: `null` pana la infiintarea firmei. De el depind paginile juridice, formularele, analitica si regula L-01 a portii juridice. | `config/operator.json`, `.claude/scripts/porti/poarta-juridic.py` |
| **iconita marcii** | Singura forma a siglei pe site: chenarul de scanare, dosarul si „3S", decupate din fisierul oficial al marcii, fara randurile de text. | `docs/design/DIRECTIA.md`, "Sigla" |
| **ciot** | O piesa mare a paginii de start (eroul, constructorul, functionalitatile) in starea ei statica, la cale fixa, pana o inlocuieste felia ei. | `docs/design/DIRECTIA.md`, "Cioturile startului" |
| **contract de continut** | Modulele cu textele si tintele unei pagini sau ale navigatiei, scrise de dispecer si rescrise de felia de text; componentele le importa, nu le modifica. | `src/content/acasa.ts`, `src/content/navigatie.ts` |

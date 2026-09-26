---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.mdx"
  - "src/content/afirmatii/*.json"
  - "docs/afirmatii/*.md"
  - "!node_modules/**"
  - "!.next/**"
  - "!dist/**"
---
# Fiecare afirmatie de vechime sau de autoritate numeste entitatea care ar raspunde pentru ea

## Ce e o afirmatie de vechime sau de autoritate

Testul, aplicabil fara judecata: acopera subiectul propozitiei si intreaba **cine ar trebui sa
scoata un act daca un cititor cere dovada acum**.

- Daca raspunsul e o entitate inregistrata, cu un dosar pe care il poate deschide cineva -
  registrul comertului, o autorizatie, un bilant - propozitia e de vechime sau de autoritate,
  si numele acelei entitati trebuie sa fie IN propozitie.
- Daca nu exista nicio entitate care sa poata scoate actul, propozitia nu se scrie deloc.
- Daca raspunsul e "nimeni, fiindca nu se cere niciun act", propozitia e o descriere a muncii si
  nu intra sub regula asta. "Primim documentele, le inventariem si le indexam" nu cere niciun act.

Vecinul de care se desparte greu e descrierea muncii. Diferenta e actul, nu tonul.

## Entitatea care raspunde, azi

Marca sub care se vinde nu e inca o persoana juridica. Decizia owner-ului **D10** (25.09.2026,
„nu, doar 3s"): site-ul nu numeste nicio alta firma - nici in text, nici in date structurate, nici
in afirmatii. Deci azi nu exista pe site nicio entitate care sa poata fi numita ca subiect al unei
vechimi sau al unei autorizari, iar asemenea propozitii **nu se scriu deloc**. Faptele care sunt
adevarate doar pentru alta firma (vechimea, istoricul) se scot, nu se muta pe marca.

Granita ramane adevarata si cand marca se inregistreaza: din ziua in care 3S are dosarul lui
(registru, autorizatie, bilant), numele ei devine entitatea care raspunde.

## Testul persoanei

Subiectul "noi" mosteneste automat dosarul entitatii pe care cititorul si-l inchipuie in spate.
Cat timp entitatea care raspunde e alta decat cea care vinde, orice "avem", "suntem", "detinem"
lipit de o vechime, o autorizare sau o certificare e o afirmatie fara act. Se scrie cu numele
entitatii ca subiect, nu cu pronumele.

Certificarile se trateaza la fel, dar mai strans: se scriu numai daca certificatul exista si e la
dosar. O certificare afisata fara certificat e cea mai ieftina afirmatie de verificat de catre un
concurent, si cea mai scumpa la corectat.

## Registrul

Fiecare afirmatie verificabila din textul vizibil are o intrare in registrul de afirmatii, cu
textul asa cum apare, locul, starea, si - cand starea e `confirmat` - sursa si cine a confirmat.
O confirmare fara sursa e o parere. O intrare cu starea `neconfirmat` e permisa si e forma
onesta a lui "inca nu am intrebat clientul".

## Corect si gresit

```
gresit:  Avem 6 ani de experienta in arhivare.
corect:  (nimic - pe site nu exista azi entitatea care ar scoate actul)

gresit:  Suntem autorizati de Arhivele Nationale.
corect:  (nimic, pana cand entitatea autorizata poate fi numita pe site)

corect:  Primim documentele, le inventariem si le indexam.   (descriere a muncii, nu cere act)
```

Perechile de mai sus sunt scrise pe litere aici fiindca fisierul asta nu intra in multimea pe care
o citeste `poarta-afirmatii.py` (ea citeste `src/` si `docs/`). Daca vreodata multimea se largeste
peste `.claude/`, exemplele devin instante ale tiparului si trebuie asamblate din bucati.

## Why

Ce se strica: site-ul afirma o vechime pe care nu o poate dovedi. In momentul in care se strica
arata banal - un titlu de sectiune scris la persoana intai, corect gramatical, scris de cineva
care stia ca depozitul chiar exista din 2019 si a scurtat propozitia.

De ce nu-l vede masinaria: intre "avem 6 ani" si "firma X are 6 ani" nu e nicio diferenta de
sintaxa, de ortografie sau de randare. Diferenta e cine tine actul, si asta nu e in fisier.

Poarta care il prinde: **`poarta-afirmatii.py`**, pe o lista de tipare, cu o fereastra de negare
inaintea potrivirii. Ce nu prinde ea - o formulare care spune acelasi lucru cu alte
cuvinte, sau un "nu" fara legatura aflat in fereastra - ramane pe seama omului care scrie. Pentru
acoperirea unei afirmatii cu o sursa, **`poarta-evidenta.py`** verifica forma registrului, nu
faptul ca fiecare afirmatie de pe pagina are intrare: legatura pagina-registru e proza si atat.

// Termenele de pastrare pentru Romania, citite la sursa primara pe 25.09.2026.
//
// SURSELE, si de ce acestea. Portalul legislativ al Ministerului Justitiei nu a raspuns in sesiunea
// de lucru (conexiunea se inchidea fara raspuns, si din masina locala, si din unealta de preluare),
// deci textele s-au citit la autoritatea care le publica sau le aplica:
//   - ANAF (autoritatea fiscala): OUG nr. 13/2021 si forma republicata in 2008 a Legii
//     contabilitatii, ca PDF; Codul fiscal si Codul de procedura fiscala in forma actualizata de ANAF
//     (ultima actualizare: OUG nr. 38/2026);
//   - Ministerul Finantelor: OMFP nr. 2.634/2015 cu Normele generale (Monitorul Oficial nr. 910/2015)
//     si OMF nr. 1.447/2023 (Monitorul Oficial nr. 453/2023), ca imagini ale Monitorului Oficial;
//   - Arhivele Nationale: Instructiunile privind activitatea de arhiva la creatori si detinatori;
//   - Camera Deputatilor: formele pentru promulgare ale Legilor nr. 36/2023 si nr. 26/2023, plus
//     fisa Legii nr. 82/1991, din care reiese ca art. 25 a fost modificat ultima data de Legea
//     nr. 36/2023 si art. 35 alin. (3) de OUG nr. 13/2021 (actele de dupa ating alte articole).
// Nimic de aici nu vine de pe bloguri de consultanta sau din pagina referintei vizuale.
//
// arhivelenationale.ro raspunde cu o verificare de browser (503) la cererile facute fara browser;
// un om deschide PDF-ul normal. O unealta automata de legaturi il poate raporta, gresit, ca mort.
//
// CE NU SE AFIRMA. La dosarele de personal si la contracte nu exista un termen in ani pe care
// sa-l fi gasit in lege: randurile raman neconfirmate si spun de ce, cu textele pe care se sprijina.

import type { SursaPrimara, Tara } from "./tipuri";

const LEGEA_36_2023: SursaPrimara = {
  eticheta: "Legea nr. 36/2023, forma pentru promulgare, publicată de Camera Deputaților",
  url: "https://www.cdep.ro/ords/pls/proiecte/docs?2022/pr739_22.pdf",
};

const OUG_13_2021: SursaPrimara = {
  eticheta: "OUG nr. 13/2021, textul publicat de ANAF",
  url: "https://static.anaf.ro/static/10/Anaf/legislatie/OUG_13_2021.pdf",
};

// PCT. 40 DIN NORME, citit pe 25.09.2026 in imaginea Monitorului Oficial nr. 910/2015, p. 8: actele
// financiar-contabile care atesta provenienta unui bun cu durata de viata de peste 5 ani se pastreaza
// cat tine viata lui utila. OMF nr. 1.447/2023, art. I pct. 4 (p. 1 a PDF-ului), abroga art. 5 al
// ordinului, pct. 38 si 39 din anexa 1 si anexa 4, deci pct. 40 ramane; fisa Ordinului nr. 2.634/2015
// de pe cdep.ro (legis_pck.htp_act?ida=133847, citita in aceeasi zi) numeste un singur act care l-a
// modificat, chiar OMF nr. 1.447/2023. FORMA CONSOLIDATA de pe portalul legislativ nu s-a putut
// deschide (serverul inchide conexiunea); se reconfirma acolo cand portalul raspunde.
const NORME_2634: SursaPrimara = {
  eticheta: "Ordinul nr. 2.634/2015 cu Normele generale, în Monitorul Oficial nr. 910/2015, publicat de Ministerul Finanțelor",
  url: "https://mfinante.gov.ro/documents/35673/219198/OMFP2634_MO910.pdf",
};

const OMF_1447_2023: SursaPrimara = {
  eticheta: "Ordinul nr. 1.447/2023, în Monitorul Oficial nr. 453/2023, publicat de Ministerul Finanțelor",
  url: "https://mfinante.gov.ro/static/10/Mfp/acte-normative-aprobate/OMF1447_MO453_24052023.pdf",
};

const LEGEA_82_REPUBLICATA: SursaPrimara = {
  eticheta: "Legea contabilității, forma republicată în 2008, textul publicat de ANAF",
  url: "https://static.anaf.ro/static/10/Anaf/legislatie/Legea_82_1991.pdf",
};

const CODUL_FISCAL: SursaPrimara = {
  eticheta: "Codul fiscal, forma actualizată de ANAF",
  url: "https://static.anaf.ro/static/10/Anaf/legislatie/Cod_fiscal_norme_2023.htm",
};

const CODUL_PROCEDURA_FISCALA: SursaPrimara = {
  eticheta: "Codul de procedură fiscală, forma actualizată de ANAF",
  url: "https://static.anaf.ro/static/10/Anaf/cod_procedura/Cod_Procedura_Fiscala_2023.htm",
};

const INSTRUCTIUNI_ARHIVE: SursaPrimara = {
  eticheta: "Instrucțiunile privind activitatea de arhivă, publicate de Arhivele Naționale",
  url: "https://arhivelenationale.ro/site/wp-content/uploads/2017/06/Instructiuni-pentru-creatorii-de-arhiva.pdf",
};

const LEGEA_26_2023: SursaPrimara = {
  eticheta: "Legea nr. 26/2023, forma pentru promulgare, publicată de Camera Deputaților",
  url: "https://www.cdep.ro/ords/pls/proiecte/docs?2021/pr604_21.pdf",
};

const INCEPUT_ART_25 =
  "1 iulie a anului următor celui în care s-a încheiat exercițiul financiar în care au fost întocmite.";

export const ROMANIA: Tara = {
  cod: "ro",
  nume: "România",
  randuri: [
    {
      tip: "facturi",
      valoare: "5 ani",
      inceput: INCEPUT_ART_25,
      temei:
        "Legea contabilității nr. 82/1991, art. 25, în forma dată de Legea nr. 36/2023 (Monitorul Oficial nr. 36 din 12 ianuarie 2023, în vigoare din 15 ianuarie 2023): documentele justificative și registrele contabile obligatorii se țin în arhivă 5 ani. Normele aprobate prin OMFP nr. 2.634/2015 (anexa 1, pct. 25) trec factura printre documentele justificative. Pentru actele de dinainte de 15 ianuarie 2023, când termenul era de 10 ani, legea nouă nu spune dacă se aplică vechiul termen sau cel nou. Două excepții țin actele mai mult. Documentele financiar-contabile care atestă proveniența unui bun cu durată de viață de peste 5 ani, printre ele factura de cumpărare, se păstrează pe toată durata de viață utilă a bunului (aceleași Norme, pct. 40, neatins de OMF nr. 1.447/2023, care a abrogat pct. 38 și 39). Actele privind bunurile de capital se păstrează până la 5 ani după încheierea perioadei de ajustare a TVA, de 5 ani pentru bunurile mobile și de 20 de ani pentru imobile (Codul fiscal, art. 305 alin. (2) și (8)).",
      surse: [LEGEA_36_2023, NORME_2634, OMF_1447_2023, CODUL_FISCAL],
    },
    {
      tip: "registre",
      valoare: "5-10 ani",
      inceput:
        "Registrele: 1 iulie a anului următor celui în care s-a încheiat exercițiul financiar. Pentru situațiile financiare anuale, legea nu spune de când curge termenul.",
      temei:
        "Legea contabilității nr. 82/1991: registrele contabile obligatorii se păstrează 5 ani (art. 25, în forma dată de Legea nr. 36/2023), iar situațiile financiare anuale, cele anuale consolidate și cele interimare se păstrează 10 ani (art. 35 alin. (3), în forma dată de OUG nr. 13/2021). Normele OMFP nr. 2.634/2015 repetă termenul de 5 ani la pct. 37^1, introdus prin OMF nr. 1.447/2023.",
      surse: [LEGEA_36_2023, OUG_13_2021, OMF_1447_2023],
    },
    {
      tip: "state",
      valoare: "5 ani",
      inceput: INCEPUT_ART_25,
      // Art. 29 alin. (1) din Legea nr. 16/1996 obliga la eliberare de pe documentele pe care firma
      // le creeaza ori le DETINE; trimiterea lui la art. 13 priveste termenul de depunere la
      // Arhive, nu pe cel de pastrare. Deci obligatia tine cat firma mai are statele. Eliminarea
      // trece prin comisia de selectionare si prin confirmarea Arhivelor (Instructiunile, art.
      // 29-33), care pot hotari pastrarea permanenta (art. 34): statele stau primele in ordinea
      // riscului, deci randul spune procedura, ca randul dosarelor de personal.
      temei:
        "Legea contabilității nr. 82/1991, art. 25, în forma dată de Legea nr. 36/2023: termenul de 5 ani se aplică „inclusiv pentru statele de salarii”. Până la 15 ianuarie 2023, același articol cerea 50 de ani pentru statele de salarii, iar legea nouă nu spune ce termen se aplică statelor mai vechi de această dată. Cât timp firma mai are statele, e obligată să elibereze la cerere, în cel mult 60 de zile, adeverințe, copii și extrase despre drepturile solicitantului (Legea Arhivelor Naționale nr. 16/1996, art. 29 alin. (1), în forma dată de Legea nr. 26/2023). După cei 5 ani, statele nu se distrug direct: comisia de selecționare a firmei le propune pentru eliminare, iar Arhivele Naționale confirmă eliminarea și pot hotărî păstrarea permanentă a unor dosare (Instrucțiunile privind activitatea de arhivă, art. 29-34).",
      surse: [LEGEA_36_2023, LEGEA_82_REPUBLICATA, LEGEA_26_2023, INSTRUCTIUNI_ARHIVE],
    },
    {
      tip: "personal",
      valoare: null,
      motiv:
        "Nu am găsit în lege un termen în ani pentru dosarul de personal. Legea contabilității fixează termene pentru registre, documente justificative și state de salarii, nu pentru dosarele salariaților. Termenul se trece în nomenclatorul arhivistic al firmei, stabilit după legi și după folosul practic al actelor, iar un dosar se elimină numai prin comisia de selecționare a firmei, cu confirmarea Arhivelor Naționale, care pot hotărî și păstrarea lui permanentă (Instrucțiunile privind activitatea de arhivă, art. 11 și art. 29-34). Cât timp firma are dosarul, e obligată să elibereze fostului salariat, la cerere, în cel mult 60 de zile, adeverințe și copii despre drepturile lui (Legea nr. 16/1996, art. 29 alin. (1), în forma dată de Legea nr. 26/2023).",
      surse: [INSTRUCTIUNI_ARHIVE, LEGEA_26_2023],
    },
    {
      tip: "declaratii",
      valoare: "5 ani",
      inceput:
        "Pentru arhivă, de la 1 iulie a anului de după încheierea exercițiului financiar. Pentru fisc, de la 1 iulie a anului care urmează celui pentru care se datorează impozitul.",
      temei:
        "Evidențele fiscale urmează regulile de păstrare ale evidențelor contabile (Codul de procedură fiscală, art. 109 alin. (3)), deci 5 ani, după art. 25 din Legea contabilității. Fiscul poate stabili impozite și contribuții suplimentare timp de 5 ani (art. 110 alin. (1) și (2)), iar când obligația vine dintr-o faptă prevăzută de legea penală, timp de 10 ani (art. 110 alin. (3)). Termenul se întrerupe sau se suspendă în situațiile din art. 111, de pildă cât durează o inspecție fiscală. Justificativele care atestă proveniența unui bun cu durată de viață de peste 5 ani se păstrează pe toată durata de viață utilă a bunului (Normele OMFP nr. 2.634/2015, anexa 1, pct. 40, neatins de OMF nr. 1.447/2023), iar cele privind bunurile de capital, până la 5 ani după încheierea perioadei de ajustare a TVA (Codul fiscal, art. 305 alin. (8)).",
      surse: [CODUL_PROCEDURA_FISCALA, LEGEA_36_2023, NORME_2634, OMF_1447_2023, CODUL_FISCAL],
    },
    {
      tip: "contracte",
      valoare: null,
      motiv:
        "Legea nu dă un termen de păstrare pentru contracte ca atare. Contractul ține loc de document justificativ, cu termenul de 5 ani, pentru operațiunile la care nu se emite factură (Normele OMFP nr. 2.634/2015, anexa 1, pct. 25). Când ține loc de justificativ și atestă proveniența unui bun cu durată de viață de peste 5 ani, contractul se păstrează pe toată durata de viață utilă a bunului (aceleași Norme, pct. 40, neatins de OMF nr. 1.447/2023). Contractele privind bunurile de capital se păstrează până la 5 ani după încheierea perioadei de ajustare a TVA, de 5 sau de 20 de ani (Codul fiscal, art. 305 alin. (8)). În rest, un contract se păstrează cât timp drepturile din el mai pot fi cerute; termenele de prescripție din Codul civil nu le rezumăm aici.",
      surse: [NORME_2634, OMF_1447_2023, CODUL_FISCAL],
    },
    {
      tip: "extrase",
      valoare: "5 ani",
      inceput: INCEPUT_ART_25,
      temei:
        "Normele OMFP nr. 2.634/2015 (anexa 1, pct. 25) numesc extrasul de cont bancar, dispoziția de plată sau de încasare și chitanța printre documentele pe baza cărora se înregistrează operațiunile la care nu se emite factură. Ca documente justificative, se păstrează 5 ani (Legea contabilității nr. 82/1991, art. 25, în forma dată de Legea nr. 36/2023). Pentru bunurile de capital, Codul fiscal cere ca orice alte documente privind bunul să fie păstrate până la 5 ani după încheierea perioadei de ajustare a TVA, de 5 sau de 20 de ani (art. 305 alin. (8)).",
      surse: [NORME_2634, LEGEA_36_2023, CODUL_FISCAL],
    },
  ],
};

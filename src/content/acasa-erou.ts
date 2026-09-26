// Continutul machetei din erou (felia `erou`, valul S4-2): turul cu trei scene si aplicatia
// demonstrativa cu patru ecrane care se deschid la clic pe centrul buclei (acasa-erou.md §1.6.3-
// §1.6.5, §1.7). Textele eroului propriu-zis (pastile, titlu, butoane, bucla, popover) sunt in
// contractul `acasa.ts`, pe care felia asta il citeste si nu il modifica.
//
// DATELE SUNT FICTIVE si se declara ca exemplu (planul valului, D9): firmele, oamenii, fisierele,
// adresa de primire si cererea din cautare nu apartin nimanui. Declaratia sta vizibil in bara de
// adresa a machetei (in rama de telefon, in bara de stare) si, pentru cititoarele de ecran, in
// eticheta machetei. Adresa de primire foloseste un domeniu care nu exista (`.exemplu`), ca sa nu
// trimita nimeni nimic nicaieri.
//
// AFIRMATIILE. Scenele descriu functionalitati pe care registrul startului le acopera deja
// (`src/content/afirmatii/acasa.json`: functiile prezentate pe start exista azi, decizia D4b;
// integrarile si WhatsApp, D4c). Semnatura calificata NU apare: integrarea e in curs (D4c).
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol, scrise in fisa de masurare
// (`[fisa]`) sau numarate de noi pe capturi (`[numarat]`), niciodata pentru cuvinte. Adresarea e
// "dumneavoastra", diacriticele complete, doar cratima.

export type IlustratieTur = "posta" | "scanare" | "flux";

export type ScenaTur = {
  titlu: string;
  paragraf: string;
  ilustratie: IlustratieTur;
};

export type Tur = {
  /** Randul de bun-venit de sub sigla (32,8/800). */
  bunVenit: string;
  scene: readonly [ScenaTur, ScenaTur, ScenaTur];
  /** Etichetele accesibile ale navigarii dintre scene. */
  anterioara: string;
  urmatoarea: string;
  /** Eticheta unui punct: "Scena 2 din 3". */
  punct: (pozitie: number, total: number) => string;
};

export const TUR: Tur = {
  // Rol: salutul din produs. Lungime: 26 [fisa].
  bunVenit: "Bine ați venit în arhiva 3S!",
  scene: [
    {
      // Rol: legarea casutei de e-mail. Lungime: 20 [fisa].
      titlu: "Legați e-mailul firmei",
      // Rol: actele se sorteaza singure, echipa lucreaza pe ele, iar cu arhiva se vorbeste prin
      // asistenti AI. Lungime: 185, 4 randuri [fisa].
      paragraf:
        "Facturile și contractele primite pe e-mail intră singure în arhivă, fiecare în dosarul lui. Echipa lucrează pe ele în aplicație, iar arhiva vă răspunde pe WhatsApp, în Claude sau în ChatGPT.",
      ilustratie: "posta",
    },
    {
      // Rol: al doilea pas, pe doua randuri. Lungime: 54 [fisa]. La 3S: digitizarea hartiei,
      // cu semnatura si stampila originalului (nu semnatura electronica, care e in curs).
      titlu: "Hârtia scanată își păstrează semnătura și ștampila",
      // Rol: explicatia pasului. Lungime: 122, 3 randuri [fisa].
      paragraf:
        "Scanăm dosarele pagină cu pagină. Fiecare act intră în arhivă cu imaginea originalului și cu un text în care se poate căuta.",
      ilustratie: "scanare",
    },
    {
      // Rol: fluxul ordonat cu clientii, partenerii si contabilul. Lungime: 29 [fisa].
      titlu: "Fiecare act, la omul potrivit",
      // Rol: regulile si AI-ul trimit singure actele; proprietarul primeste doar o notificare
      // cand documentul e deschis. Lungime: 192, 4 randuri [fisa].
      paragraf:
        "Clienții, colaboratorii și contabilul primesc singuri actele care îi privesc, prin regulile automate și prin portal. Dumneavoastră aflați doar momentul în care cineva a deschis documentul.",
      ilustratie: "flux",
    },
  ],
  anterioara: "Scena anterioară",
  urmatoarea: "Scena următoare",
  punct: (pozitie, total) => "Scena " + pozitie + " din " + total,
};

// ---------------------------------------------------------------------------------------------
// Cadrul machetei si aplicatia demonstrativa
// ---------------------------------------------------------------------------------------------

export type CheieEcran = "primite" | "documente" | "cautare" | "portal";

export type ElementMeniuAplicatie = {
  cheie: CheieEcran;
  /** Numele din bara laterala (14,4/600). */
  text: string;
  /** Numele scurt din bara de jos a telefonului (min. 11 px la 3S; la referinta 9,6). */
  scurt: string;
};

/** Tipurile de act din lista de primite si culorile lor (avatarul si eticheta de dosar). */
export type TipAct = "factura" | "contract" | "aviz" | "raport";

export type ActPrimit = {
  tip: TipAct;
  /** Expeditorul fictiv (15,2/700). */
  expeditor: string;
  /** Subiectul mesajului (13,44/600). */
  subiect: string;
  /** Atasamentul, in JetBrains Mono. */
  fisier: string;
  /** Tipul recunoscut, in eticheta albastra. */
  recunoscut: string;
  /** Dosarul in care intra; e si textul etichetei "arhivat". */
  dosar: string;
  /** Cine e anuntat dupa arhivare, si rolul lui. */
  anuntat: { nume: string; rol: string };
};

export type DosarDocumente = {
  nume: string;
  fisiere: number;
  /** Cine are acces (eticheta de permisiune). */
  acces: string;
  /** Cate reguli automate are dosarul. */
  reguli: number;
  /** Regula aratata cand dosarul e ales: actul care intra si cei doi destinatari. */
  regula: {
    fisier: string;
    destinatari: readonly [Destinatar, Destinatar];
  };
};

export type Destinatar = {
  /** Canalul: e-mail (placa albastra) sau notificare (placa de chihlimbar). */
  canal: "email" | "notificare";
  initiale: string;
  nume: string;
  rol: string;
};

export type Macheta = {
  /** Declaratia datelor fictive (plan D9): eticheta accesibila a machetei. */
  declaratie: string;
  /** Textul din bara de adresa: aplicatia, declarata ca exemplu. Lungime: 15 [fisa]. */
  adresa: string;
  /** Eticheta scurta din bara de stare a telefonului (acolo nu exista bara de adresa). */
  exempluTelefon: string;
  /** Ora din bara de stare a telefonului. */
  ora: string;
  /** Butonul de sub cadru, inapoi la bucla. Lungime: 16 [fisa]. */
  inapoi: string;
  meniu: readonly ElementMeniuAplicatie[];
  etichetaMeniu: string;
  primite: {
    titlu: string;
    /** Adresa de primire a firmei, fictiva (domeniu inexistent). */
    adresaPrimire: string;
    eticheta: string;
    acte: readonly ActPrimit[];
    /** Momentul sosirii, pe randuri: cel nou, apoi cele vechi. */
    momente: readonly [string, string, string];
    seCiteste: string;
    anuntat: string;
    arhivateIn: string;
    dosare: readonly { nume: string; numar: number }[];
  };
  documente: {
    spatiu: string;
    acasa: string;
    dosare: readonly DosarDocumente[];
    regulaTitlu: string;
    regulaNoua: string;
    cand: string;
    atunci: string;
    stari: { asteptare: string; trimite: string; livrat: string };
    recente: string;
    acteRecente: readonly { fisier: string; fel: "PDF" | "XLS"; meta: string }[];
    unitateFisiere: (numar: number) => string;
  };
  cautare: {
    titlu: string;
    cerere: string;
    gasite: string;
    rezultate: readonly { fisier: string; loc: string }[];
    inca: string;
    trimite: string;
    descarca: string;
    regula: { titlu: string; cand: string; candValoare: string; actiune: string; actiuneValoare: string; buton: string };
  };
  portal: {
    titlu: string;
    vizitator: { initiale: string; nume: string; rol: string };
    firma: { initiala: string; nume: string; subtitlu: string };
    dosar: string;
    numar: string;
    acte: readonly { fisier: string; data: string; nou: boolean }[];
    nou: string;
    inca: string;
    descarca: string;
    note: readonly [string, string];
  };
};

export const MACHETA: Macheta = {
  declaratie: "Demonstrație a aplicației 3S, cu date fictive, date doar ca exemplu",
  // Rol: la referinta, domeniul aplicatiei. La 3S adresa publica a aplicatiei nu exista inca
  // (tintele externe duc la /inregistrare), deci bara spune ce e: aplicatia, ca exemplu.
  adresa: "aplicația 3S · exemplu",
  exempluTelefon: "Exemplu",
  ora: "08:30",
  // Rol: inapoi la proces. Lungime: 16 [fisa].
  inapoi: "Înapoi la buclă",
  etichetaMeniu: "Ecranele aplicației",
  meniu: [
    // Lungimi la referinta: 11 / 9 / 10 / 13 [numarat]; pe telefon 5 / 7 / 2 / 13.
    { cheie: "primite", text: "Acte primite", scurt: "Primite" },
    { cheie: "documente", text: "Documente", scurt: "Dosare" },
    { cheie: "cautare", text: "Căutare AI", scurt: "Caută" },
    { cheie: "portal", text: "Portal clienți", scurt: "Clienți" },
  ],
  primite: {
    titlu: "Acte primite",
    adresaPrimire: "acte@firma.exemplu",
    // Rol: eticheta listei (majuscule prin CSS). Lungime: 7 [numarat].
    eticheta: "Sosite",
    acte: [
      {
        tip: "factura",
        expeditor: "Alfa Exemplu S.R.L.",
        subiect: "Factura pe septembrie, scadentă la 15.10",
        fisier: "Factura_2026_0917.pdf",
        recunoscut: "Factură",
        dosar: "Facturi",
        anuntat: { nume: "Ioana", rol: "Contabilitate" },
      },
      {
        tip: "contract",
        expeditor: "Beta Exemplu Imobiliare",
        subiect: "Contractul de închiriere semnat, pentru dosar",
        fisier: "Contract_chirie_B12.pdf",
        recunoscut: "Contract",
        dosar: "Contracte",
        anuntat: { nume: "Andrei", rol: "Administrator" },
      },
      {
        tip: "aviz",
        expeditor: "Gama Exemplu S.R.L.",
        subiect: "Avizul de însoțire pentru marfa de azi",
        fisier: "Aviz_0588.pdf",
        recunoscut: "Aviz",
        dosar: "Avize",
        anuntat: { nume: "Mihai", rol: "Depozit" },
      },
      {
        tip: "raport",
        expeditor: "Cabinet contabil Exemplu",
        subiect: "Balanța pe august, de verificat",
        fisier: "Balanta_08_2026.xlsx",
        recunoscut: "Raport",
        dosar: "Rapoarte",
        anuntat: { nume: "Ioana", rol: "Contabilitate" },
      },
    ],
    momente: ["acum", "acum 3 min", "acum 7 min"],
    seCiteste: "Se citește",
    anuntat: "Anunțat:",
    arhivateIn: "Arhivate în",
    dosare: [
      { nume: "Facturi", numar: 31 },
      { nume: "Contracte", numar: 9 },
      { nume: "Avize", numar: 14 },
      { nume: "Rapoarte", numar: 4 },
    ],
  },
  documente: {
    spatiu: "Firma dumneavoastră",
    acasa: "Toate dosarele",
    dosare: [
      {
        nume: "Facturi",
        fisiere: 31,
        acces: "Echipa",
        reguli: 2,
        regula: {
          fisier: "Factura_2026_0917.pdf",
          destinatari: [
            { canal: "email", initiale: "IS", nume: "Ioana", rol: "Contabilitate" },
            { canal: "notificare", initiale: "AP", nume: "Andrei", rol: "Administrator" },
          ],
        },
      },
      {
        nume: "Contracte",
        fisiere: 9,
        acces: "Conducere",
        reguli: 2,
        regula: {
          fisier: "Contract_chirie_B12.pdf",
          destinatari: [
            { canal: "email", initiale: "AP", nume: "Andrei", rol: "Administrator" },
            { canal: "notificare", initiale: "IS", nume: "Ioana", rol: "Contabilitate" },
          ],
        },
      },
      {
        nume: "Personal",
        fisiere: 6,
        acces: "Conducere",
        reguli: 1,
        regula: {
          fisier: "Fisa_post_depozit.pdf",
          destinatari: [
            { canal: "email", initiale: "AP", nume: "Andrei", rol: "Administrator" },
            { canal: "notificare", initiale: "MV", nume: "Mihai", rol: "Depozit" },
          ],
        },
      },
      {
        nume: "Rapoarte",
        fisiere: 4,
        acces: "Toți",
        reguli: 2,
        regula: {
          fisier: "Balanta_08_2026.xlsx",
          destinatari: [
            { canal: "email", initiale: "IS", nume: "Ioana", rol: "Contabilitate" },
            { canal: "notificare", initiale: "AP", nume: "Andrei", rol: "Administrator" },
          ],
        },
      },
    ],
    regulaTitlu: "Regulă automată",
    regulaNoua: "Regulă",
    cand: "Când",
    atunci: "Atunci",
    stari: { asteptare: "În așteptare", trimite: "Se trimite", livrat: "Livrat" },
    recente: "Adăugate recent",
    acteRecente: [
      { fisier: "Factura_2026_0917.pdf", fel: "PDF", meta: "Factură · azi" },
      { fisier: "Contract_chirie_B12.pdf", fel: "PDF", meta: "Contract · ieri" },
      { fisier: "Balanta_08_2026.xlsx", fel: "XLS", meta: "Raport · 12 sept." },
    ],
    unitateFisiere: (numar) => (numar === 1 ? "1 fișier" : numar + " fișiere"),
  },
  cautare: {
    titlu: "Întrebați arhiva",
    // Rol: cererea scrisa litera cu litera. Lungime: 57 [fisa].
    cerere: "Care contracte au preaviz de 30 de zile la reziliere?",
    // Rol: randul cu numarul de rezultate. Lungime: 26 [numarat].
    gasite: "7 contracte, cu pagina citată",
    rezultate: [
      { fisier: "Contract_chirie_B12.pdf", loc: "pag. 4 · art. 9" },
      { fisier: "Contract_service_2025.pdf", loc: "pag. 2 · art. 6" },
    ],
    inca: "și încă 5 contracte",
    trimite: "Trimite pe WhatsApp",
    descarca: "Descarcă tot",
    regula: {
      titlu: "Faceți din asta o regulă",
      cand: "Când:",
      candValoare: "Contract nou în „Contracte”",
      actiune: "Acțiune:",
      actiuneValoare: "Anunță administratorul",
      buton: "Creează",
    },
  },
  portal: {
    titlu: "Portal clienți",
    vizitator: { initiale: "DE", nume: "Dana Exemplu", rol: "Client" },
    firma: { initiala: "D", nume: "Delta Exemplu S.R.L.", subtitlu: "Actele pe care vi le-am pus la dispoziție" },
    dosar: "Facturi 2026",
    numar: "12 acte",
    acte: [
      { fisier: "Factura_2026_0917.pdf", data: "17.09.2026", nou: true },
      { fisier: "Factura_2026_0831.pdf", data: "31.08.2026", nou: false },
      { fisier: "Factura_2026_0729.pdf", data: "29.07.2026", nou: false },
    ],
    nou: "Nou",
    inca: "și încă 9 acte",
    descarca: "Descarcă",
    note: ["Facturile noi apar aici fără să le trimită nimeni.", "Clientul întreabă arhiva direct din portal."],
  },
};

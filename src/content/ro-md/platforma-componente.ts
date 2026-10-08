// Continutul componentelor paginii platformei pe editia `ro-MD` (P02, `/ro/platforma` pe 3s.md): aceleasi componente
// si aceeasi compunere ca pagina RO `/platforma` si ca perechea EN `/platform` (decizia 53), cu textul in romana de
// business, la "tu". Constanta e tipata pe contractul structural al lui `PaginaPlatforma`, deci un camp lipsa sau in
// plus pica typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa paginii (ro-md/platforma.md), sectiunea "Textele componentelor (decizia 53)", cu cheia
// campului RO (de pilda `platforma.ts:40`) in comentariu. Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
// Abateri de la fisa, ca sa se vada: tintele /ro exista acum (felia 108), deci legaturile duc la paginile /ro, fara
// "(în engleză)"; pagina despre 3S e `/ro/securitate`; ghidul e-facturilor are pereche /ro, deci nota comparatiei nu
// mai spune ca ghidul e in engleza.
//
// CE NU INTRA, ca pe EN: Problema si BlocDate (poarta juridica a deciziilor 40-41), Apeluri (d43); din Cazuri, scolile
// si asigurarile, plus legatura spre paginile de segment (d38); intrebarile despre programul de contabilitate si
// despre blocurile de cod (d43); butonul secundar al blocului de final (pagina lui nu exista pe 3s.md).
// `platforma.ts` ramane sursa pentru metadata, nodul WebPage si registrul de afirmatii. Modulul e numai date.

import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";
import type { ContinutPaginaPlatforma, SectiunePlatforma } from "@/components/produs/PaginaPlatforma";

/** Sectiunile montate pe 3s.md, in ordinea componentei; Problema, BlocDate si Apeluri ies (ca pe EN). */
export const SECTIUNI_PLATFORMA_RO_MD: readonly SectiunePlatforma[] = [
  "erou",
  "piloni",
  "model",
  "blocArhiva",
  "blocIntrebari",
  "comparatie",
  "suveranitate",
  "cazuri",
  "conformitate",
  "intrebari",
];

/** Butonul de canal al eroului si al finalului (`platforma.ts:41`, `acasa.ts:807`): eticheta deciziei 35. */
export const ETICHETA_BUTON_CANAL_PLATFORMA_RO_MD = "Scrie-ne pe WhatsApp";

/** Butonul secundar al eroului (`platforma.ts:42`): pagina de contact exista pe 3s.md; nu se promite o demonstratie. */
export const EROU_SECUNDAR_PLATFORMA_RO_MD = { text: "Contactează-ne", href: "/ro/contact", ruta: "/ro/contact" } as const;

export const PLATFORMA_RO_MD: ContinutPaginaPlatforma = {
  // platforma.ts:28-29.
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Platforma", cale: "/ro/platforma" },
  ],
  erou: {
    // platforma.ts:36, :40.
    titlu: "Platforma 3S: documente încărcate, răspunsuri cu sursa",
    subtitlu:
      "3S preia documentele pe care le încarci din browser, inclusiv fișierele pe care le ai deja scanate. Recunoaște fiecare document și consemnează cine îl deschide. Termenul de păstrare îl alegi pe dosar. Apoi pui întrebări, iar fiecare răspuns indică documentul din care provine.",
  },
  macheta: {
    // platforma.ts:52-57.
    declaratie: "Exemplu cu date fictive: fișiere TIFF, PDF, PNG și JPG intră în 3S, care le citește textul și le marchează tipul.",
    eticheta: "Exemplu, date fictive",
    fisiere: ["TIFF", "PDF", "PNG", "JPG"],
    miez: "3S",
    campuri: ['"tip": "contract"', '"dosar": "Logistică"', '"text": "indexat"'],
    insigne: ["Frankfurt", "Termene", "Jurnal", "Export"],
  },
  piloni: {
    // platforma.ts:64-82.
    fraza: "Încarci o dată, întrebi de câte ori ai nevoie.",
    piloni: [
      {
        numar: "01",
        iconita: "straturi",
        titlu: "Toate fișierele, într-o arhivă",
        text: "PDF-urile, scanările și fotografiile încărcate de echipă ajung în aceeași arhivă, unde 3S le citește textul și le marchează tipul.",
      },
      {
        numar: "02",
        iconita: "scut-bifa",
        titlu: "Păstrate în UE",
        text: "Fișierele încărcate sunt păstrate în UE, cu regiunea principală la Frankfurt, și le poți exporta oricând ai nevoie de ele.",
      },
      {
        numar: "03",
        iconita: "scantei",
        titlu: "Răspuns cu sursa indicată",
        text: "Întrebarea pusă în browser primește un răspuns din documentele firmei, împreună cu documentul din care provine, ca să-l poți verifica.",
      },
    ],
  },
  model: {
    // platforma.ts:104-115.
    titlu: "Cum ajunge întrebarea echipei la documentul potrivit",
    metafora: "Un singur punct de acces la documentele firmei.",
    subtitlu: "Echipa pune întrebările din browser. Documentele intră în 3S prin încărcare, iar răspunsurile se întorc împreună cu sursa lor.",
    noduri: [
      { eticheta: "Echipa firmei", descriere: "Colegii și contabilul, care lucrează din browser." },
      { eticheta: "Arhiva 3S", descriere: "Fiecare document citit, păstrat în UE, gata de întrebări." },
      { eticheta: "Documentele", descriere: "Foldere comune, atașamente de e-mail, scanări, fotografii." },
    ],
    conectori: ["Întrebări și căutări", "Documente încărcate"],
  },
  blocArhiva: {
    // platforma.ts:146-174; randurile despre originalul pe hartie ies (poarta juridica 40-41).
    numar: "01",
    titlu: "Unde stă fiecare document, cât timp și cine l-a deschis",
    subtitlu: "Pentru orice fișier din 3S, fie că a pornit ca scanare, fie ca document electronic, știi trei lucruri.",
    randuri: [
      { eticheta: "Fișierele", valoare: "Se află în UE, cu regiunea principală la Frankfurt." },
      { eticheta: "Termen de păstrare", valoare: "Îl stabilești pe fiecare dosar, iar termenul ales acoperă toate documentele din acel dosar." },
      { eticheta: "Jurnal de acces", valoare: "3S consemnează cine deschide fiecare document." },
    ],
    legatura: { text: "Unde sunt păstrate documentele", href: "/ro/securitate#security", ruta: "/ro/securitate" },
  },
  blocIntrebari: {
    // platforma.ts:178-201.
    numar: "02",
    titlu: "O singură întrebare, iar răspunsul vine din documentele tale",
    subtitlu: "Formulezi întrebarea în cuvintele tale, iar 3S îți arată răspunsul împreună cu documentul din care provine.",
    carduri: [
      {
        iconita: "balon",
        titlu: "Sursa răspunsului, la vedere",
        text: "Formulezi întrebarea ca pentru un coleg, de exemplu „Până când e valabil contractul de închiriere al depozitului?”, și verifici răspunsul pe loc, în documentul-sursă.",
      },
      {
        iconita: "lupa",
        titlu: "Întrebări în română",
        text: "Poți întreba în română. Pentru documentele în română, întrebările formulate în engleză sunt deocamdată în regim de testare.",
      },
      {
        // Iconita ceasului in locul clopotului: alertele nu sunt in cod (d43), ca pe EN.
        iconita: "ceas",
        titlu: "Termen pe dosar",
        text: "Alegi o singură dată termenul de păstrare al dosarului, iar el acoperă fiecare document adăugat, fără să depindă de memoria cuiva.",
      },
      {
        iconita: "randuri",
        titlu: "Tipul documentului",
        text: "3S marchează tipul fiecărui document, de exemplu contract sau factură, ca să știi ce este înainte de a-l deschide.",
      },
    ],
  },
  comparatie: {
    // platforma.ts:211-223 si `PaginaPlatforma.tsx:260`.
    titlu: "Câteva foldere cu PDF-uri scanate nu formează o arhivă",
    subtitlu: "Cinci nevoi zilnice ale unei firme, comparate: ce obții dintr-o scanare simplă și ce face 3S.",
    coloane: ["Doar scanare", "Arhiva 3S"],
    randuri: [
      { dimensiune: "Textul din scanări", alternativa: "Blocat în imagine", noi: "Citit și indexat" },
      { dimensiune: "Tipul documentelor", alternativa: "Sortat manual", noi: "Marcat automat" },
      { dimensiune: "Locul fișierelor", alternativa: "Pe un calculator din birou", noi: "În UE, la Frankfurt" },
      { dimensiune: "Găsirea unei informații", alternativa: "Fișier după fișier", noi: "O întrebare, cu sursa" },
      { dimensiune: "Termenul de păstrare", alternativa: "Ținut minte de cineva", noi: "Stabilit pe dosar" },
    ],
    nota: "Regulile de păstrare a facturilor electronice diferă de la o țară la alta; ghidul nostru indică sursa primară și data verificării.",
    legatura: { text: "E-facturare", href: "/ro/ghiduri/arhivare-e-facturi-ue", ruta: "/ro/ghiduri/arhivare-e-facturi-ue" },
    etichetaCriteriu: "Criteriu",
  },
  suveranitate: {
    // platforma.ts:229-250.
    eticheta: "Locul datelor",
    titlu: "Fișierele tale, în UE. Regiunea principală: Frankfurt.",
    subtitlu: "Fiecare fișier încărcat are un loc cunoscut, pe care îl poți indica oricui te întreabă.",
    proza: [
      "Fișierele încărcate în 3S sunt păstrate în UE, cu regiunea principală la Frankfurt. 3S citește o singură dată textul fiecărui fișier, îi marchează tipul și îl pregătește pentru căutare.",
      "Furnizorul de găzduire are sediul în Statele Unite. În temeiul legii americane numite CLOUD Act, unui asemenea furnizor i se poate cere să păstreze și să divulge datele pe care le administrează, inclusiv atunci când serverele se află în afara SUA. Pagina Despre 3S îl numește.",
    ],
    evidentiat:
      "Fiecare dosar are termenul său de păstrare, iar 3S consemnează cine deschide fiecare document. Oricine ți-ar cere locul unui document, fie un client, fie un auditor sau un inspector, primește mereu același răspuns: în UE, cu regiunea principală la Frankfurt.",
    legatura: { text: "Citește pagina Despre 3S", href: "/ro/securitate#security", ruta: "/ro/securitate" },
    carduri: [
      {
        titlu: "Text citit o singură dată",
        text: "3S citește o singură dată textul fiecărei scanări sau fotografii, iar apoi îl poți căuta fără să deschizi fișierul.",
      },
      {
        titlu: "Jurnalul deschiderilor",
        text: "3S consemnează cine deschide fiecare document. Dacă ai reguli despre cine din firmă vede anumite documente, spune-ne de ce ai nevoie.",
      },
      {
        titlu: "Termenul, pe dosar",
        text: "Termenul de păstrare îl alegi pe dosar și se aplică documentelor din el. Ghidurile citează surse primare pentru Moldova și facturile electronice din UE.",
      },
    ],
  },
  cazuri: {
    // platforma.ts:324-338; fara legatura spre paginile de segment (d38).
    titlu: "Exemple din activitatea zilnică",
    subtitlu: "Domenii date ca exemplu, în care o zi de lucru aduce multe documente și multe întrebări despre ele.",
    cazuri: [
      {
        titlu: "Logistică",
        text: "Pentru fiecare cursă, comanda, CMR-ul semnat și dovada de livrare stau în același dosar, iar facturarea nu mai depinde de un document rămas la șofer.",
      },
      {
        titlu: "Construcții",
        text: "Dosarul unui șantier reunește autorizația de construire, actele de recepție și situațiile de lucrări, iar o căutare după adresa obiectivului le găsește.",
      },
      {
        titlu: "Contabilitate",
        text: "Documentele fiecărui client stau în dosarele lui, pe luni, iar factura se găsește printr-o întrebare, fără să-i mai ceri clientului s-o retrimită.",
      },
    ],
  },
  conformitate: {
    // platforma.ts:355-357 si `PaginaPlatforma.tsx:402`.
    titlu: "Ce cere un auditor, 3S îți arată pe loc",
    text: "Termenele de păstrare și jurnalul deschiderilor se pot consulta oricând în 3S, fără pregătiri înaintea unui audit.",
    insigne: ["Export", "Termene", "UE", "Frankfurt", "AWS", "Jurnal"],
    etichetaInsigne: "Ce poate arăta 3S",
  },
  intrebari: {
    // platforma.ts:363-388: titlurile H2 ale fisei, cu raspunsurile lor (text simplu, fara marcaj).
    titlu: "Întrebări frecvente",
    intrebari: [
      {
        intrebare: "Cum ajung documentele în 3S?",
        raspuns: "Documentele se încarcă din browser. Fișierele pe care le ai deja scanate intră direct în platformă.",
      },
      {
        intrebare: "Cine are acces la documente?",
        raspuns: "Dacă ai reguli despre cine din firmă vede anumite documente, spune-ne de ce ai nevoie, iar noi îți spunem ce face 3S astăzi.",
      },
      {
        intrebare: "Unde rulează 3S?",
        raspuns:
          "3S rulează în UE, cu regiunea principală Frankfurt. Pagina Despre 3S numește furnizorul de găzduire și explică ce prevede legea americană pentru datele unei companii din SUA.",
        // Tinta aprobata a paginii pentru gazduire, ca legatura "Citeste pagina Despre 3S" de mai sus (calea SURSA).
        legaturiInText: [{ text: "Pagina Despre 3S", href: "/ro/securitate#security" }],
      },
      {
        intrebare: "Cum găsesc o informație?",
        raspuns:
          "Formulezi întrebarea liber, iar 3S indică sursa fiecărui răspuns. Întrebările în engleză despre documente în română sunt în regim de testare.",
      },
      {
        intrebare: "Pot stabili cât timp se păstrează documentele?",
        // Site-ul nu are o pagina-index a ghidurilor, deci fraza numeste cele doua ghiduri si le leaga pe fiecare.
        raspuns:
          "Da. Pentru fiecare dosar alegi un termen de păstrare, valabil pentru toate documentele din el. Ghidurile noastre citează sursele: unul despre termenele de păstrare în Moldova, altul despre arhivarea e-facturilor în UE.",
        legaturiInText: [
          { text: "termenele de păstrare în Moldova", href: "/ro/ghiduri/termene-pastrare-moldova" },
          { text: "arhivarea e-facturilor în UE", href: "/ro/ghiduri/arhivare-e-facturi-ue" },
        ],
      },
    ],
  },
};

/** Blocul de final (`acasa.ts:800-828`): textul fisei paginii, macheta ca pe /ro. */
export const CTA_FINAL_PLATFORMA_RO_MD: ContinutCtaFinal = {
  titlu: "Cum ar funcționa 3S pe documentele firmei tale?",
  subtitlu: "Îți arătăm cum răspunde 3S la o întrebare, pe câteva documente ale firmei tale.",
  // Folosit numai daca pagina nu da `butoane`; pagina pune butonul WhatsApp.
  butonPrincipal: { text: ETICHETA_BUTON_CANAL_PLATFORMA_RO_MD, href: null, ruta: null },
  microtext: "Îți răspunde o persoană din echipa 3S.",
  vizual: {
    declaratie: "Exemplu cu date fictive",
    pasi: [
      { iconita: "laptop", text: "Încărcat pe web", ora: "09:41" },
      { iconita: "tag", text: "Etichetat ca factură", ora: "09:41" },
    ],
    rezultat: { fisier: "Factura_0415_exemplu.pdf", stare: "Indexat pentru căutare", ora: "09:42" },
  },
};

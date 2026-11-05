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
export const EROU_SECUNDAR_PLATFORMA_RO_MD = { text: "Scrie-ne", href: "/ro/contact", ruta: "/ro/contact" } as const;

export const PLATFORMA_RO_MD: ContinutPaginaPlatforma = {
  // platforma.ts:28-29.
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Platforma", cale: "/ro/platforma" },
  ],
  erou: {
    // platforma.ts:36, :40.
    titlu: "Platforma 3S: încarci documentele, primești răspunsuri cu sursa lor",
    // Pasul zero (decizia Marian 04.11.2026, „baga adria”; documentul lui Adrian Mihai, 04.11): hartia o preia si o
    // scaneaza partenerul, grupul Adria Arhivare din Romania, nu platforma (`ro-md-partener-adria-hartie`).
    subtitlu:
      "Încarci documentele din browser, inclusiv scanările pe care le ai deja. Arhiva pe hârtie o preia și o scanează partenerul nostru, grupul Adria Arhivare din România. 3S recunoaște ce fel de document este fiecare și înregistrează cine îl deschide. Termenul de păstrare îl alegi o singură dată, pe dosar. Apoi pui întrebări, iar fiecare răspuns vine cu documentul din care provine.",
  },
  macheta: {
    // platforma.ts:52-57.
    declaratie: "Exemplu cu date fictive: scanări și poze (TIFF, PDF, PNG, JPG) intră în 3S, care le citește textul și recunoaște ce fel de document este fiecare.",
    eticheta: "Exemplu cu date fictive",
    fisiere: ["TIFF", "PDF", "PNG", "JPG"],
    miez: "3S",
    campuri: ["Tip: contract", "Dosar: Logistică", "Text: citit"],
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
        text: "PDF-urile, scanările și pozele încărcate de echipă ajung în aceeași arhivă, unde 3S le citește textul și recunoaște ce fel de documente sunt.",
      },
      {
        numar: "02",
        iconita: "scut-bifa",
        titlu: "Păstrate în UE",
        text: "Fișierele încărcate sunt păstrate în UE și le poți descărca oricând.",
      },
      {
        numar: "03",
        iconita: "scantei",
        titlu: "Răspuns cu sursa la vedere",
        text: "Pui întrebarea în browser și primești răspunsul din documentele companiei, împreună cu documentul din care provine, ca să-l poți verifica.",
      },
    ],
  },
  model: {
    // platforma.ts:104-115.
    titlu: "Cum ajunge întrebarea echipei la documentul potrivit",
    metafora: "Un singur loc pentru toate documentele companiei.",
    subtitlu: "Angajații pun întrebări din browser. Documentele intră în 3S prin încărcare, iar răspunsurile vin împreună cu documentul-sursă.",
    noduri: [
      { eticheta: "Echipa companiei", descriere: "Angajații și contabilul, care lucrează din browser." },
      { eticheta: "Arhiva 3S", descriere: "Fiecare document este citit, păstrat în UE și gata să răspundă." },
      { eticheta: "Documentele", descriere: "Foldere comune, atașamente de e-mail, scanări, fotografii." },
    ],
    conectori: ["Întrebări și căutări", "Documente încărcate"],
  },
  blocArhiva: {
    // platforma.ts:146-174; randurile despre originalul pe hartie ies (poarta juridica 40-41).
    numar: "01",
    titlu: "Unde stă fiecare document, cât timp și cine l-a deschis",
    subtitlu: "Despre orice fișier din 3S, scanat sau primit direct electronic, știi trei lucruri.",
    randuri: [
      { eticheta: "Unde sunt", valoare: "În Uniunea Europeană." },
      { eticheta: "Termen de păstrare", valoare: "Îl stabilești pe fiecare dosar, iar termenul ales acoperă toate documentele din acel dosar." },
      { eticheta: "Cine le-a deschis", valoare: "3S înregistrează cine deschide fiecare document." },
    ],
    legatura: { text: "Unde sunt păstrate documentele", href: "/ro/securitate#security", ruta: "/ro/securitate" },
  },
  blocIntrebari: {
    // platforma.ts:178-201.
    numar: "02",
    titlu: "Pui o întrebare, iar răspunsul vine din documentele tale",
    subtitlu: "Pui întrebarea cu cuvintele tale, iar 3S îți arată răspunsul și documentul din care provine.",
    carduri: [
      {
        iconita: "balon",
        titlu: "Sursa răspunsului, la vedere",
        text: "Întrebi ca pe un coleg, de exemplu „Până când este valabil contractul de închiriere al depozitului?”, și verifici răspunsul pe loc, în document.",
      },
      {
        iconita: "lupa",
        titlu: "Întrebări în română",
        text: "Întrebi în română. Întrebările în engleză pe documente în română sunt deocamdată în teste.",
      },
      {
        // Iconita ceasului in locul clopotului: alertele nu sunt in cod (d43), ca pe EN.
        iconita: "ceas",
        titlu: "Termen pe dosar",
        text: "Alegi o singură dată cât timp se păstrează dosarul, iar regula se aplică fiecărui document pe care îl adaugi. Nu mai depinde de memoria nimănui.",
      },
      {
        iconita: "randuri",
        titlu: "Tipul documentului",
        text: "3S recunoaște ce fel de document este fiecare, contract sau factură, ca să știi ce este înainte să-l deschizi.",
      },
    ],
  },
  comparatie: {
    // platforma.ts:211-223 si `PaginaPlatforma.tsx:260`.
    titlu: "Câteva foldere cu PDF-uri scanate nu sunt o arhivă",
    subtitlu: "Cinci lucruri de care o companie are nevoie zilnic: ce îți dă o simplă scanare și ce îți dă 3S.",
    coloane: ["Doar scanare", "Arhiva 3S"],
    randuri: [
      { dimensiune: "Textul din scanări", alternativa: "Blocat în imagine", noi: "Citit, gata de căutare" },
      { dimensiune: "Tipul documentelor", alternativa: "Sortat manual", noi: "Recunoscut automat" },
      { dimensiune: "Locul fișierelor", alternativa: "Pe un calculator din birou", noi: "În UE" },
      { dimensiune: "Găsirea unei informații", alternativa: "Fișier după fișier", noi: "O întrebare, cu sursa" },
      { dimensiune: "Termenul de păstrare", alternativa: "Ținut minte de cineva", noi: "Stabilit pe dosar" },
    ],
    // Felia 166: fara trimiterea la ghidul e-facturilor (ghidurile au iesit din editia romana, decizia lui Adrian Mihai).
    nota: "Termenul de păstrare îl stabilești tu, pe fiecare dosar, după regulile care se aplică în țara ta.",
    etichetaCriteriu: "Criteriu",
  },
  suveranitate: {
    // platforma.ts:229-250.
    eticheta: "Unde sunt datele",
    titlu: "Fișierele tale, în Uniunea Europeană",
    subtitlu: "Știi exact unde este fiecare fișier și poți spune oricui te întreabă.",
    proza: [
      "Fișierele încărcate în 3S sunt păstrate în UE, cu regiunea principală la Frankfurt. 3S le citește textul o singură dată, recunoaște ce fel de document este fiecare și îl ține gata de căutare.",
      "Serverele sunt ale Amazon, companie americană, care semnează cu clienții un acord de prelucrare a datelor conform GDPR. O lege americană, CLOUD Act, îi poate cere însă Amazon datele pe care le administrează, chiar dacă serverele sunt în Europa.",
    ],
    evidentiat:
      "Fiecare dosar are termenul lui de păstrare, iar 3S înregistrează cine deschide fiecare document. Când un client, un auditor sau un inspector te întreabă unde sunt documentele, răspunsul este același de fiecare dată: în Uniunea Europeană.",
    legatura: { text: "Citește pagina Despre 3S și securitate", href: "/ro/securitate#security", ruta: "/ro/securitate" },
    carduri: [
      {
        titlu: "Text citit o singură dată",
        text: "3S citește o singură dată textul fiecărei scanări sau fotografii, iar apoi îl poți căuta fără să deschizi fișierul.",
      },
      {
        titlu: "Jurnalul deschiderilor",
        text: "3S înregistrează cine deschide fiecare document. Dacă în compania ta anumite documente trebuie văzute doar de anumiți oameni, spune-ne ce îți trebuie.",
      },
      {
        titlu: "Termenul, pe dosar",
        text: "Termenul de păstrare îl alegi pe dosar și se aplică tuturor documentelor din el.",
      },
    ],
  },
  cazuri: {
    // platforma.ts:324-338; fara legatura spre paginile de segment (d38).
    titlu: "Exemple din viața de zi cu zi",
    subtitlu: "Trei domenii în care o zi de lucru aduce multe documente și la fel de multe întrebări despre ele.",
    cazuri: [
      {
        titlu: "Logistică",
        text: "Pentru fiecare cursă, comanda, CMR-ul semnat și dovada de livrare stau în același dosar, iar facturarea nu mai depinde de un document rămas la șofer.",
      },
      {
        titlu: "Construcții",
        text: "Dosarul unui șantier reunește autorizația de construire, procesele-verbale de recepție și situațiile de lucrări, iar o căutare după adresa obiectivului le găsește.",
      },
      {
        titlu: "Contabilitate",
        text: "Documentele fiecărui client stau în dosarele lui, pe luni, iar factura se găsește printr-o întrebare, fără să-i mai ceri clientului s-o retrimită.",
      },
    ],
  },
  conformitate: {
    // platforma.ts:355-357 si `PaginaPlatforma.tsx:402`.
    titlu: "3S îți arată pe loc ce cere un auditor",
    text: "Termenele de păstrare și jurnalul deschiderilor sunt oricând la vedere în 3S, așa că nu mai pregătești nimic înainte de un audit.",
    insigne: ["Export", "Termene", "UE", "Frankfurt", "AWS", "Jurnal"],
    etichetaInsigne: "Ce poate arăta 3S",
  },
  intrebari: {
    // platforma.ts:363-388: titlurile H2 ale fisei, cu raspunsurile lor (text simplu, fara marcaj).
    titlu: "Întrebări frecvente",
    intrebari: [
      {
        intrebare: "Cum ajung documentele în 3S?",
        raspuns: "Le încarci din browser. Scanările pe care le ai deja intră direct.",
      },
      {
        intrebare: "Cine are acces la documente?",
        raspuns: "Dacă ai reguli despre cine din companie vede anumite documente, spune-ne ce îți trebuie și îți spunem exact ce poate 3S astăzi.",
      },
      {
        intrebare: "Unde rulează 3S?",
        raspuns:
          "În Uniunea Europeană. Pagina Despre 3S și securitate spune cine este furnizorul și ce înseamnă legea americană pentru date.",
        // Tinta aprobata a paginii pentru gazduire, ca legatura "Citeste pagina Despre 3S" de mai sus (calea SURSA).
        legaturiInText: [{ text: "Pagina Despre 3S și securitate", href: "/ro/securitate#security" }],
      },
      {
        intrebare: "Cum găsesc o informație?",
        raspuns:
          "Scrii întrebarea cu cuvintele tale, iar 3S îți dă răspunsul și documentul din care provine. Întrebările în engleză pe documente în română sunt deocamdată în teste.",
      },
      {
        intrebare: "Pot stabili cât timp se păstrează documentele?",
        raspuns: "Da. Pentru fiecare dosar alegi cât timp se păstrează, iar termenul este valabil pentru toate documentele din el.",
      },
    ],
  },
};

/** Blocul de final (`acasa.ts:800-828`): textul fisei paginii, macheta ca pe /ro. */
export const CTA_FINAL_PLATFORMA_RO_MD: ContinutCtaFinal = {
  titlu: "Cum ar funcționa 3S pe documentele companiei tale?",
  subtitlu: "Îți arătăm cum răspunde 3S la o întrebare, pe câteva documente ale companiei tale.",
  // Folosit numai daca pagina nu da `butoane`; pagina pune butonul WhatsApp.
  butonPrincipal: { text: ETICHETA_BUTON_CANAL_PLATFORMA_RO_MD, href: null, ruta: null },
  microtext: "Îți răspunde un consultant din echipa 3S.",
  vizual: {
    declaratie: "Exemplu cu date fictive",
    pasi: [
      { iconita: "laptop", text: "Încărcat", ora: "09:41" },
      { iconita: "tag", text: "Recunoscut ca factură", ora: "09:41" },
    ],
    rezultat: { fisier: "Factura_0415_exemplu.pdf", stare: "Gata de căutare", ora: "09:42" },
  },
};

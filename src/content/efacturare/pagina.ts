// Textele paginii /e-facturare (e-facturare.md, sablonul "subiect lung").
//
// Scrise din faptele verificate la sursa oficiala (`surse.ts`) si din faptele 3S ale registrului
// (`src/content/afirmatii/flux-efacturare.json`). Comentariile `Rol:` numesc functia blocului;
// lungimea tinta e cea din fisa (randuri la latimea masurata).

import type { Legatura } from "@/content/navigatie";
import { CALE_INREGISTRARE } from "@/content/navigatie";

export const CALE_EFACTURARE = "/e-facturare";
export const CALE_CALENDAR = "/instrumente/termene.ics";

export const META_EFACTURARE = {
  titlu: "e-Factura și arhiva facturilor, în România și în UE | 3S",
  descriere:
    "RO e-Factura, SAF-T și calendarul e-facturării în UE, verificate la sursa oficială. 3S păstrează facturile emise și primite, căutabile, în Germania.",
};

export const FIR_EFACTURARE = [
  { text: "Acasă", cale: "/" },
  { text: "e-Factura", cale: CALE_EFACTURARE },
];

export const EROU_EFACTURARE = {
  // Rol: titlul-teza, 3 randuri pe coloana de 580.
  titlu: "În RO e-Factura, XML-ul se descarcă 60 de zile. În 3S rămâne cât hotărâți.",
  // Rol: contextul legal si ce face produsul, 5 randuri.
  subtitlu:
    "Firmele stabilite în România raportează în RO e-Factura facturile dintre ele din ianuarie 2024, iar din 1 iulie 2024 contează ca factură doar XML-ul trecut prin sistem. După 60 de zile, fișierul nu se mai descarcă direct, ci se cere la ANAF. 3S adună facturile emise și primite și le ține în arhiva firmei, gata de căutat.",
  butonPlin: { text: "Deschideți un cont", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } satisfies Legatura,
  butonContur: { text: "Cereți o demonstrație", href: "/contact", ruta: "/contact" } satisfies Legatura,
};

export const MACHETA_DRUM = {
  declaratie: "Exemplu cu date fictive: drumul unei facturi până în arhiva 3S",
  factura: "F-2026-0412",
  etichete: ["XML", "EN 16931"],
  // Canalele prin care 3S primeste facturi: numai integrarile numite in decizia D4c, plus
  // incarcarea de fisiere (inclusiv XML-ul descarcat din RO e-Factura).
  canale: ["Peppol", "Storecove", "E-mail", "WhatsApp", "Încărcare"],
  arhiva: "Arhiva 3S",
  ani: "2026 → 2034",
  insigne: ["AES-256", "Germania", "Jurnal"],
};

// Rol: fraza-ancora, o idee, 3 randuri centrate.
export const FRAZA_ANCORA =
  "RO e-Factura vă ține XML-ul 60 de zile. Arhiva firmei o deschideți ani la rând, ori de câte ori cereți o factură.";

export const MANDATE = {
  // Rol: titlul cutiei despre diversitatea mandatelor, 1 rand.
  titlu: "Șase piețe, șase calendare diferite.",
  text: "Fiecare stat își alege sistemul, formatul și datele de start. O firmă care vinde în trei țări urmărește trei calendare, fiecare cu regulile lui tehnice. Tabelul de mai jos le pune alături, cu documentul oficial al fiecăreia.",
  batai: [
    "Polonia trimite facturile prin KSeF, Belgia prin rețeaua Peppol, România prin RO e-Factura, iar Franța prin platforme agreate de fisc. Germania cere din 2025 ca firmele să poată primi e-facturi în XRechnung sau ZUGFeRD. Directiva (UE) 2025/516 adaugă din 1 iulie 2030 reguli comune pentru livrările dintre statele membre.",
    "Oricare ar fi canalul, facturile ajung la final în același loc: în arhiva firmei. În 3S, o factură sosită prin Peppol stă lângă una descărcată din RO e-Factura, fiecare cu data, canalul și regula ei de păstrare. Contabilul le caută pe amândouă cu aceeași întrebare, termenul de păstrare se stabilește o dată pe categorie, iar jurnalul arată cine le-a deschis și când.",
  ],
};

export const TABEL = {
  titlu: "Ce se aplică între firme, în fiecare țară",
  text: "Rândurile descriu facturile dintre firme. Lângă fiecare stă documentul oficial din care am luat datele, iar sub tabel, ziua în care l-am citit.",
  capete: ["Țara", "Ce se aplică", "De când", "Format și canal"],
  titluModificari: "Schimbări recente",
  calendar: {
    titlu: "Termenele, în calendarul dumneavoastră",
    text: "17 termene: 12 depuneri lunare D406, cu alarmă la 7 zile, și 5 date europene, cu alarmă la 30.",
    buton: "Descărcați calendarul (.ics)",
  },
  verificare: "Date verificate la sursa oficială pe",
  nota: "Facturile către persoane fizice nu apar în tabel. Italia și Spania lipsesc până le putem verifica la sursa oficială. Ghidurile pe țări apar pe blog.",
  notaLegatura: { text: "Blogul 3S", href: "/blog", ruta: "/blog" } satisfies Legatura,
  eticheteSursa: "Sursa",
};

export const JURNAL_CAP = {
  eticheta: "Istoric verificat",
  titlu: "Anul 2026, țară cu țară",
  text: "Schimbările de mai jos au fost citite în documentul autorității care le-a publicat. Fiecare intrare are legătura spre el și eticheta țării, care duce la rândul din tabel.",
  legatura: "Documentul oficial",
};

export const TREI_REGULI = {
  titlu: "Trei repere din regula românească",
  text: "Ce spune ghidul ANAF din 2023 despre RO e-Factura, rezumat în trei carduri.",
  carduri: [
    {
      iconita: "timer",
      titlu: "Două etape în 2024",
      text: "Din 1 ianuarie 2024, facturile dintre firmele stabilite în România se raportează în RO e-Factura. Din 1 iulie 2024, emitentul le transmite destinatarului prin sistem, iar între aceste firme sunt considerate facturi numai cele care respectă OUG 120/2021.",
    },
    {
      iconita: "file-code",
      titlu: "Un singur format",
      text: "Factura este un fișier XML pe standardul european EN 16931, cu regulile naționale RO_CIUS. Programul destinatarului o citește direct, iar 3S păstrează XML-ul așa cum a sosit. PDF-ul rămâne o vedere a ei, bună de citit, dar documentul este XML-ul.",
    },
    {
      iconita: "archive",
      titlu: "60 de zile în sistem",
      text: "Cât poate fi descărcat fișierul direct din RO e-Factura, potrivit ghidului ANAF din 2023. După aceea, ANAF îl arhivează și îl eliberează doar la cerere. Firma are nevoie de propria copie, pe care s-o poată arăta oricând în anii de păstrare.",
    },
  ],
};

export const EMITEREA = {
  titlu: "Anii de după transmitere: unde stă factura când o cer contabilul, auditorul sau un partener",
  text: "Termenul de păstrare depinde de categoria actului și se întinde pe ani. În tot acest timp, factura trebuie să poată fi găsită, citită și arătată în forma în care a intrat în firmă.",
  paragrafe: [
    "O verificare fiscală, un litigiu cu un furnizor sau o întrebare de la bancă pot readuce în discuție o factură de acum câțiva ani. Atunci contează dacă o găsiți în câteva secunde, cu XML-ul original și cu data la care a sosit. O copie tipărită sau un PDF redenumit nu mai spune de unde vine și dacă a fost schimbat între timp.",
    "RO e-Factura nu ține loc de arhivă: potrivit ghidului ANAF din 2023, fișierele se descarcă direct 60 de zile, apoi se cer la ANAF. În multe firme, copiile ajung pe mai multe calculatoare, în atașamente trimise mai departe și în foldere cu nume diferite. Unele se pierd, altele se dublează, iar la control nimeni nu mai știe care e originalul. Iar când omul care le-a descărcat pleacă din firmă, dosarul lui poate pleca odată cu el, rămas pe un laptop pe care nu-l mai deschide nimeni.",
  ],
  rezolvare:
    "În 3S, fiecare factură intră în arhiva firmei cu originalul neschimbat, criptată AES-256 pe servere Amazon din Germania și transmisă doar prin TLS 1.2 sau mai nou. Regula de păstrare se aplică pe categorie, ștergerea de la final lasă evidență, iar fiecare deschidere rămâne în jurnal, cu numele și ora.",
  legatura: { text: "Cum păstrează 3S fișierele", href: "/securitate", ruta: "/securitate" } satisfies Legatura,
};

export const RIGLA = {
  titlu: "O factură, păstrată cât cere regula firmei",
  subtitlu: "Exemplu: o factură primită în 2026 și o regulă de păstrare de 8 ani.",
  fisier: "F-2026-0412.xml",
  eticheta: "primită în octombrie 2026",
  banda: "după 8 ani: ștergere, cu evidența ei în jurnal",
  nota: "Termenul pentru fiecare categorie îl stabiliți cu contabilul. 3S îl aplică tuturor documentelor din categoria respectivă.",
  /** Anul emiterii si numarul de ani ai scalei (gradatii anuale). */
  anStart: 2026,
  aniScala: 11,
  aniPastrare: 8,
};

export const CASA = {
  titlu: "Ce face 3S cu facturile firmei",
  text: "Trei lucruri pe care le faceți cu facturile în 3S, oricare ar fi programul care le emite.",
  pasi: [
    {
      titlu: "Întrebați în cuvintele dumneavoastră",
      text: "Scrieți „facturile de energie din martie” și primiți lista, fiecare rezultat cu sursa citată. Răspunsul e același dacă factura a venit pe e-mail, prin Peppol sau ca XML din RO e-Factura.",
    },
    {
      titlu: "Deschideți accesul contabilului",
      text: "Contabilul intră prin portalul clienților doar în categoriile pe care i le deschideți. Fiecare căutare și fiecare document deschis de el apar în jurnal, cu numele și ora.",
    },
    {
      titlu: "Lăsați regulile să le așeze",
      text: "Facturile sosite pe e-mail, pe WhatsApp, prin Peppol sau Storecove își primesc categoria după regulile firmei, iar termenul de păstrare vine din categorie.",
    },
  ],
  legatura: { text: "Vedeți platforma 3S", href: "/platforma", ruta: "/platforma" } satisfies Legatura,
};

export const STANDARDE = {
  titlu: "Formatele pe care arhiva le primește ca atare",
  text: "Arhiva nu convertește nimic: XML-ul rămâne XML, PDF-ul rămâne PDF.",
  insigne: ["EN 16931", "RO_CIUS", "Peppol", "XRechnung", "ZUGFeRD", "FA(3)", "XML", "PDF"],
};

export const INTREBARI_EFACTURARE = {
  titlu: "Întrebări frecvente",
  intrebari: [
    {
      intrebare: "Un PDF trimis pe e-mail mai contează ca factură?",
      raspuns:
        "În România, între firmele stabilite aici, din 1 iulie 2024 sunt considerate facturi doar cele transmise ca e-facturi prin RO e-Factura. În Germania, un PDF simplu nu mai este e-factură din 2025. PDF-ul rămâne util ca vizualizare, dar documentul este XML-ul.",
    },
    {
      intrebare: "Cât timp pot descărca o e-factură din RO e-Factura?",
      raspuns:
        "60 de zile de la publicarea în sistem, potrivit ghidului ANAF. După aceea, fișierul este arhivat de ANAF și eliberat la cerere. De aceea firmele își țin propria copie.",
    },
    {
      intrebare: "Ce este Peppol?",
      raspuns:
        "O rețea descentralizată prin care programele de facturare schimbă facturi structurate. În Belgia, din 2026, e-facturile dintre firme circulă prin ea. 3S primește facturi prin Peppol și prin Storecove.",
    },
    {
      intrebare: "Pot urca în 3S XML-urile descărcate din SPV?",
      raspuns:
        "Da. Le încărcați din browser ca fișiere XML, iar regulile firmei le așază în categoria lor. Originalul rămâne neschimbat și se caută alături de facturile primite pe e-mail sau prin Peppol.",
    },
    {
      intrebare: "Cine vede facturile firmei în 3S?",
      raspuns:
        "Doar persoanele cărora le dați acces, nominal, pe persoană și pe dosar. Contabilul extern intră prin portal numai în categoriile deschise lui, iar fiecare document deschis se trece în jurnal, cu numele și ora.",
    },
  ],
};

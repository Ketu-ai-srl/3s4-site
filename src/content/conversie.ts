// Textele feliei `conversie`: `/contact`, `/inregistrare`, `/descarca`, `/incepe` (planul valului S4,
// §5.3, §6.9, §9, §10; fisele contact.md, inregistrare.md, descarca.md, incepe.md).
//
// CE E ADEVARAT AICI. Singurele fapte: registrul de afirmatii al feliei
// (`src/content/afirmatii/conversie.json`), `config/brand.json` si deciziile D3, D4b, D4c din plan.
// Nu promitem termene de raspuns (3S nu are o tinta asumata), nu aratam o adresa de e-mail pana nu
// e confirmata, nu numim o firma (decizia owner-ului din 24.09, doar brandul) si nu descriem un
// clip care nu exista: `/incepe` arata o demonstratie in HTML, declarata ca demonstratie.
//
// Adresarea e "dumneavoastra", ca pe tot site-ul. Lungimile din comentarii sunt ale rolului masurat
// in fise (numar de randuri la latimea masurata), nu ale unui text anume.

import type { Legatura } from "./navigatie";
import { CALE_INREGISTRARE } from "./navigatie";

export const CALE_CONTACT = "/contact";
export const CALE_DESCARCA = "/descarca";
export const CALE_INCEPE = "/incepe";
export { CALE_INREGISTRARE };

/** Ancora formularului de contact (la referinta `contact-form`, pastrata pentru legaturile existente). */
export const ANCORA_FORMULAR_CONTACT = "contact-form";

export type MetaPagina = { titlu: string; descriere: string };

// ---------------------------------------------------------------------------------------------
// /contact
// ---------------------------------------------------------------------------------------------

export const META_CONTACT: MetaPagina = {
  titlu: "Contact 3S: întrebări despre arhiva firmei",
  descriere:
    "Scrieți echipei 3S despre actele firmei, găsiți pagina care vă răspunde deja sau vedeți ce canale sunt deschise astăzi.",
};

export type CardSubiect = {
  /** Numele iconitei Lucide, contur 1,5. */
  iconita: "building-2" | "wallet" | "shield-check" | "plug" | "layers" | "calendar-clock" | "compass";
  titlu: string;
  descriere: string;
  legatura: Legatura;
};

export type RandCanal = {
  nume: string;
  legatura: Legatura;
  /** Starea canalului, in dreapta (14/500 cu ceas). */
  stare: string;
};

export const CONTACT = {
  fir: { acasa: "Acasă", pagina: "Contact" },
  erou: {
    // Rol: titlul paginii, doua randuri la 1440.
    titlu: "Spuneți-ne ce acte are firma și unde se pierd ele azi",
    // Rol: ce se intampla cu mesajul, doua randuri la 1440.
    subtitlu:
      "Întrebările despre arhiva firmei ajung la echipa 3S prin formularul de mai jos, după ce e pornit. Multe au deja răspuns pe site.",
  },
  caseta: {
    // Rol: casuta pentru orice intrebare, h2 bloc.
    titlu: "Orice întrebare despre 3S",
    // Rol: ce fel de intrebari intra aici, doua randuri.
    text: "Contul gratuit, digitizarea dosarelor de hârtie, căutarea cu sursa citată sau legătura cu programele pe care le folosiți deja.",
    // Rol: butonul, cand exista o adresa confirmata a marcii (se pune adresa insasi).
    butonFormular: "Scrieți-ne prin formular",
    // Rol: nota de langa buton.
    nota: "Toate pachetele 3S costă 0 RON astăzi.",
  },
  subiecte: {
    titlu: "Răspunsuri care există deja pe site",
    text: "Unele întrebări nu au nevoie de un mesaj. Fiecare card deschide pagina care tratează subiectul pe larg.",
    carduri: [
      {
        iconita: "building-2",
        titlu: "Arhive mari și digitizare",
        descriere: "Dosare de hârtie de scanat, mutarea arhivei vechi și contract cu nivel de serviciu.",
        legatura: { text: "/enterprise", href: "/enterprise", ruta: "/enterprise" },
      },
      {
        iconita: "wallet",
        titlu: "Pachete și prețuri",
        descriere: "Ce cuprinde fiecare pachet și cât timp pierde azi firma căutând acte.",
        legatura: { text: "/preturi", href: "/preturi", ruta: "/preturi" },
      },
      {
        iconita: "shield-check",
        titlu: "Securitate și găzduire",
        descriere: "Serverele Amazon din Germania, criptarea actelor și cine are voie să le deschidă.",
        legatura: { text: "/securitate", href: "/securitate", ruta: "/securitate" },
      },
      {
        iconita: "plug",
        titlu: "Legături cu alte programe",
        descriere: "Microsoft 365, Google Workspace, programe de contabilitate, stocare și WhatsApp.",
        legatura: { text: "/integrari", href: "/integrari", ruta: "/integrari" },
      },
      {
        iconita: "layers",
        titlu: "Cum lucrează platforma",
        descriere: "De la actul pe hârtie la răspunsul care arată documentul și pagina din care vine.",
        legatura: { text: "/platforma", href: "/platforma", ruta: "/platforma" },
      },
      {
        iconita: "calendar-clock",
        titlu: "Cât se păstrează actele",
        descriere: "Facturi, state de salarii și contracte: termenele din România și din Republica Moldova.",
        legatura: {
          text: "/instrumente/termene-pastrare",
          href: "/instrumente/termene-pastrare",
          ruta: "/instrumente/termene-pastrare",
        },
      },
      {
        iconita: "compass",
        titlu: "3S pe domeniul dumneavoastră",
        descriere: "Construcții, contabilitate, avocatură, notariate, logistică, imobiliare și asigurări.",
        legatura: { text: "/solutii", href: "/solutii", ruta: "/solutii" },
      },
    ] satisfies CardSubiect[],
  },
  canale: {
    titlu: "Pe unde ajungeți la noi astăzi",
    text: "Canalele mărcii 3S și starea fiecăruia în ziua de azi, fără promisiuni de termen pe care nu le-am asumat.",
    formular: {
      nume: "Formularul de pe această pagină",
      legatura: { text: "Mergeți la formular", href: "#contact-form", ruta: "/contact" },
    },
    cont: {
      nume: "Contul gratuit 3S",
      legatura: { text: CALE_INREGISTRARE, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE },
    },
    posta: {
      nume: "E-mailul mărcii",
    },
    tur: {
      nume: "Demonstrația interfeței",
      legatura: { text: "/incepe", href: "/incepe", ruta: "/incepe" },
      stare: "Oricând, fără cont",
    },
    // Starile care depind de comutatorul operatorului si de adresa marcii.
    stareDeschis: "Deschis",
    stareFormularInchis: "Pornește odată cu politica de confidențialitate",
    starePostaInchisa: "Adresa se publică după confirmare",
    postaFaraAdresa: "încă nepublicată",
    notaEticheta: "De reținut:",
    notaInchis:
      "cât timp formularul nu e pornit, nimic din ce scrieți în el nu pleacă de pe pagină și nu se salvează nicăieri.",
    notaDeschis: "ce trimiteți prin formular ajunge la echipa 3S și se păstrează cât scrie în politica de confidențialitate.",
  },
  marca: {
    titlu: "Ce se află în spatele numelui 3S",
    text: "Pe site apar doar datele mărcii. Firma care prelucrează ce trimiteți se numește în politica de confidențialitate, odată cu publicarea ei.",
    carduri: [
      {
        titlu: "Marca 3S",
        rol: "Scan, Store, Solve",
        fapte: [
          { eticheta: "Numele complet", valoare: "3S Scan Store Solve", mono: false },
          { eticheta: "Ce face", valoare: "Scanare, păstrare și căutare cu sursa citată", mono: false },
          { eticheta: "Canale", valoare: "Interfața web și WhatsApp", mono: false },
        ],
      },
      {
        titlu: "Platforma 3S",
        rol: "Unde stau actele și cum sunt apărate",
        fapte: [
          { eticheta: "Găzduire", valoare: "Amazon, Germania, o singură regiune UE", mono: false },
          { eticheta: "Criptare la stocare", valoare: "AES-256", mono: true },
          { eticheta: "Criptare în tranzit", valoare: "TLS 1.2+", mono: true },
        ],
      },
    ],
  },
  formular: {
    // Rol: eticheta sectiunii formularului.
    eticheta: "Formular",
    // Rol: titlul sectiunii formularului, h2 40, un rand.
    titlu: "Câteva rânduri ajung",
    // Rol: ce sa scrie vizitatorul, doua randuri.
    subtitlu: "Spuneți-ne cum arată arhiva firmei și ce ați vrea să găsiți mai repede în ea.",
    // Rol: textul-exemplu din mesaj; o intrebare posibila, nu una a unui client.
    exempluMesaj: "De exemplu: avem dosare de hârtie din ultimii ani și vrem să le căutăm după client.",
    subiect: "Mesaj de pe pagina de contact 3S",
  },
} as const;

// ---------------------------------------------------------------------------------------------
// /inregistrare
// ---------------------------------------------------------------------------------------------

export const META_INREGISTRARE: MetaPagina = {
  titlu: "Cont gratuit 3S: deschideți arhiva firmei",
  descriere:
    "Deschideți contul 3S: toate pachetele costă 0 RON astăzi, fără card. Alegeți utilizatorul și parola, apoi aduceți actele firmei.",
};

export const INREGISTRARE = {
  fir: { acasa: "Acasă", pagina: "Cont gratuit" },
  // Rol: titlul, doua randuri centrate la 1440 (cinci cuvinte).
  titlu: "Deschideți contul 3S, gratuit astăzi",
  // Rol: sub titlu, un rand la 1440.
  subtitlu: "Toate pachetele costă 0 RON astăzi și nu vă cerem cardul.",
  campuri: {
    prenume: { eticheta: "Prenume", exemplu: "Ion", autocomplete: "given-name" },
    nume: { eticheta: "Nume", exemplu: "Exemplu", autocomplete: "family-name" },
    email: { eticheta: "E-mail", exemplu: "nume@firma.ro", autocomplete: "email" },
    telefon: { eticheta: "Telefon (opțional)", exemplu: "07xx xxx xxx", autocomplete: "tel" },
    utilizator: { eticheta: "Utilizator", exemplu: "de pildă ion.exemplu", autocomplete: "username" },
    parola: { eticheta: "Parolă", exemplu: "", autocomplete: "new-password" },
  },
  // Rol: indiciul de sub parola; devine eroare cand parola nu trece.
  indiciuParola: "Între 8 și 72 de caractere.",
  arataParola: "Arătați parola",
  ascundeParola: "Ascundeți parola",
  // Bifa obligatorie: termenii contului. Legatura trece prin Tinta (termenii nu sunt publicati azi).
  termeniInainte: "Sunt de acord cu",
  termeni: { text: "termenii de utilizare 3S", href: "/juridic/termeni", ruta: "/juridic/termeni" } satisfies Legatura,
  // Bifa separata, neobligatorie, nebifata: noutatile (FORM-01..03).
  marketing: "Vreau să primesc pe e-mail noutăți despre 3S. Opțional, mă pot dezabona oricând.",
  // Rol: butonul de trimitere.
  buton: "Deschideți contul",
  trimitere: "Se trimite...",
  // Rol: nota de sub buton.
  nota: "0 RON astăzi pentru toate pachetele. Nu vă cerem cardul.",
  // Rol: legatura de sub nota (parola uitata la referinta). Pe pagina asta ar fi o legatura spre ea
  // insasi, deci duce la formularul de contact.
  ajutor: { text: "Nu mai aveți acces la cont? Scrieți-ne", href: "/contact#contact-form", ruta: "/contact" } satisfies Legatura,
  erori: {
    prenume: "Scrieți prenumele.",
    nume: "Scrieți numele de familie.",
    emailLipsa: "Scrieți adresa de e-mail a contului.",
    emailForma: "Adresa nu are forma nume@domeniu.",
    telefon: "Numărul poate avea doar cifre, spații și semnul plus.",
    utilizatorLipsa: "Alegeți un nume de utilizator.",
    utilizatorForma: "Între 3 și 40 de caractere: litere fără diacritice, cifre, punct, cratimă sau linie jos.",
    parola: "Parola trebuie să aibă între 8 și 72 de caractere.",
    termeni: "Bifați acordul cu termenii ca să deschidem contul.",
    lung: "Textul e prea lung.",
  },
  // Rol: mesajul cinstit de langa buton cat timp operatorul e null (plan §9).
  inactiv:
    "Deschiderea conturilor din această pagină nu e pornită încă: ce ați scris nu a plecat nicăieri și nu a fost salvat. O pornim odată cu publicarea politicii de confidențialitate.",
  succes: {
    titlu: "Cererea de cont a ajuns",
    text: "Un om din echipa 3S vă scrie la adresa lăsată, cu pașii de intrare în cont.",
  },
  eroareTrimitere: "Cererea nu a putut fi trimisă. Încercați din nou peste câteva minute sau scrieți-ne din pagina de contact.",
  informare: {
    scop: "Folosim datele ca să vă deschidem contul 3S și să vă scriem despre el.",
    temei:
      "Temeiul îl constituie contractul pe care îl cereți (GDPR, art. 6 alin. (1) lit. b)); bifa de noutăți e separată și are temei consimțământul.",
    politicaInainte: "Detalii în",
    politica: { text: "politica de confidențialitate", href: "/juridic/confidentialitate", ruta: "/juridic/confidentialitate" } satisfies Legatura,
    operatorInainte: "Operatorul datelor:",
  },
  // Rezumatul raspunsurilor venite din constructorul de pe start (parametrii `ind`, `src`, `vol`, `who`).
  rezumat: {
    titlu: "Din răspunsurile de pe pagina de start",
    domeniu: "Domeniu",
    canale: "Actele vin prin",
    volum: "Volum",
    cine: "Le sortează",
    nota: "Le trimitem odată cu cererea de cont, ca să pregătim dosarele potrivite.",
  },
  // Randul de mesaj compus pentru punctul de trimitere (contractul lui nu are camp de utilizator).
  mesajCerere: "Cerere de cont nou 3S.",
  mesajUtilizator: "Utilizator ales:",
} as const;

// ---------------------------------------------------------------------------------------------
// /descarca
// ---------------------------------------------------------------------------------------------

export const META_DESCARCA: MetaPagina = {
  titlu: "Aplicația 3S pentru calculator, telefon și browser",
  descriere:
    "Aplicația 3S pe Windows, macOS, Linux, iOS, Android și în browser. Totul începe cu contul gratuit, la 0 RON astăzi.",
};

export const DESCARCA = {
  fir: { acasa: "Acasă", pagina: "Aplicația" },
  erou: {
    // Rol: titlul, un rand si la 1440 si la 390.
    titlu: "Un singur cont 3S",
    // Rol: doua randuri la 1440, cel mult trei la 390.
    subtitlu:
      "Calculatorul, telefonul, browserul și WhatsApp deschid aceeași arhivă, cu același cont gratuit.",
  },
  recomandat: {
    // Rol: randul cu steaua, deasupra platformei detectate.
    eticheta: "Estimat după browser",
    // Rol: titlul cardului inainte de detectie (si fara JavaScript).
    generic: "Aplicația 3S",
    // Rol: butonul mare, acelasi text pe orice platforma (inaltime stabila la hidratare).
    buton: "Începeți cu contul gratuit",
    // Rol: randul ajutator de sub buton.
    ajutor: "Primul pas e contul 3S, la 0 RON astăzi.",
    detectie: "Se recunoaște dispozitivul",
  },
  // Numele platformei detectate, sub randul cu steaua si in butonul mare.
  numePlatforma: {
    windows: "Windows",
    "macos-arm": "macOS",
    "macos-intel": "macOS",
    linux: "Linux",
    ios: "iPhone și iPad",
    android: "Android",
    web: "browser",
  },
  platforme: {
    titlu: "Alegeți sistemul pe care lucrați",
    text: "Fiecare variantă pornește de la același cont gratuit și vede aceeași arhivă.",
    pastila: "estimat",
  },
  // Rol: nota de sub grila.
  nota: "Recunoașterea după browser e o estimare; puteți alege oricare variantă.",
  banda: {
    titlu: "Contul gratuit e primul pas, oriunde lucrați.",
    buton: "Deschideți contul",
  },
} as const;

// ---------------------------------------------------------------------------------------------
// /incepe
// ---------------------------------------------------------------------------------------------

export const META_INCEPE: MetaPagina = {
  titlu: "Primii pași în 3S: demonstrația interfeței",
  descriere:
    "O demonstrație animată a interfeței 3S: actul intră, se așază în dosarul potrivit și se găsește cu o întrebare, cu pagina citată.",
};

export type ScenaDemo = {
  /** Eticheta scenei din bara de progres a ramei. */
  eticheta: string;
  /** Durata scenei, in milisecunde. */
  durata: number;
};

export const INCEPE = {
  inapoi: { text: "Înapoi", href: "/", ruta: "/" } satisfies Legatura,
  // Rol: titlul, un rand.
  titlu: "Primii pași în 3S",
  // Rol: un rand la 1440.
  paragraf: "Vedeți pe scurt cum ajunge un act de la scanare la răspuns.",
  demo: {
    // Rol: declaratia vizibila si pentru cititorul de ecran: e o demonstratie, nu un clip.
    eticheta: "Demonstrație",
    declaratie:
      "Demonstrație animată a interfeței 3S, cu date fictive date ca exemplu: un act intră, primește dosarul și e găsit cu o întrebare.",
    exemplu: "exemplu",
    porneste: "Porniți demonstrația",
    pauza: "Pauză",
    continua: "Continuați",
    reia: "Reluați de la început",
    repetare: "Repetare continuă",
    progres: "Progresul demonstrației",
    scene: [
      { eticheta: "Actul intră", durata: 5000 },
      { eticheta: "Se așază în dosar", durata: 5000 },
      { eticheta: "Întrebarea", durata: 5000 },
      { eticheta: "Răspunsul cu sursa", durata: 6000 },
    ] satisfies ScenaDemo[],
    // Interfata din rama: date fictive, declarate ca exemplu (D9, D11).
    aplicatie: {
      spatiu: "Alfa Exemplu SRL",
      meniu: ["Intrări", "Dosare", "Căutare", "Reguli"],
      intrare: {
        titlu: "Intrări noi",
        canal: "WhatsApp",
        fisier: "aviz_0147_exemplu.jpg",
        stare: "Citit: aviz de însoțire",
      },
      dosar: {
        titlu: "Dosarul primit",
        cale: ["Clienți", "Beta Exemplu SRL", "Avize 2026"],
        regula: "Regula: avizele merg în dosarul clientului",
        eticheta: "aviz",
      },
      intrebare: {
        camp: "Întrebați arhiva",
        text: "Ce a livrat Beta Exemplu în martie?",
      },
      raspuns: {
        text: "În martie s-au livrat 40 de paleți, pe avizul 0147 din 12 martie.",
        sursa: "aviz_0147_exemplu.jpg",
        pagina: "pagina 1",
      },
    },
  },
  final: {
    // Rol: titlul blocului de la final.
    titlu: "Acesta a fost drumul unui act. Îl încercați pe actele firmei?",
    buton: "Deschideți contul",
    legatura: { text: "Vedeți aplicația pe dispozitive", href: "/descarca", ruta: "/descarca" } satisfies Legatura,
  },
} as const;

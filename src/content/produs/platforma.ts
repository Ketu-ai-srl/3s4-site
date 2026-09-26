// Contractul de continut al paginii `/platforma` (felia `produs`, sablonul "platforma" din
// COMPONENTE §3; fisa de masurare `platforma.md`, sectiunile 1-14).
//
// Textul e scris pentru 3S, pe rolul si lungimea masurate pe referinta; nu preia fraze si nici
// structura frazelor de acolo. Afirmatiile verificabile stau in registrul feliei
// (`src/content/afirmatii/produs.json`), fiecare cu locul ei. Machetele poarta date fictive,
// declarate ca exemplu (decizia D9 din planul valului); blocurile de cod folosesc gazda rezervata
// `api.3s.example` (RFC 2606) si nu descriu un API real.
//
// LUNGIMILE din comentarii sunt ale referintei, pe acelasi rol (numarate pe capturi, nu copiate).

import type { Legatura } from "@/content/navigatie";
import { CALE_INREGISTRARE } from "@/content/navigatie";
import type { IconitaProdus } from "./iconite";
import type { BlocIntrebari } from "./intrebari";

export const CALE_PLATFORMA = "/platforma";

export const META_PLATFORMA = {
  titlu: "Platforma 3S: actele firmei citite, păstrate și întrebate",
  descriere:
    "Cum lucrează 3S: preia actele pe hârtie și fișierele, le citește, le păstrează criptat în Germania și răspunde cu sursa citată, pe web, WhatsApp și API.",
};

/** Firul de pagina, cu numele din meniul site-ului. */
export const FIR_PLATFORMA = [
  { text: "Acasă", cale: "/" },
  { text: "Platforma", cale: CALE_PLATFORMA },
];

// --- 1. Eroul cu macheta -------------------------------------------------------------------------

export const EROU_PLATFORMA = {
  // Rol: ce este produsul, intr-o fraza (2 randuri la 1440). Lungime: ~57.
  titlu: "Actele firmei, scanate, păstrate și gata să răspundă.",
  // Rol: unde stau actele azi si ce face 3S cu ele (4 randuri la 1440, 7 la 390). Primul paragraf
  // din <main>: 30-80 de cuvinte (poarta G-AI-02).
  subtitlu:
    "Actele unei firme stau de obicei împrăștiate: bibliorafturi, un folder comun, e-mailuri și poze de pe telefon. 3S le adună într-o singură arhivă, le citește, le păstrează criptat în Germania și răspunde la întrebări cu pagina citată, pe web, pe WhatsApp și prin API.",
  butonPrincipal: { text: "Deschideți un cont gratuit", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } as Legatura,
  butonSecundar: { text: "Cereți o demonstrație", href: "/contact", ruta: "/contact" } as Legatura,
};

/**
 * Macheta stratului: fisierele care intra, miezul 3S, campurile care ies. Date fictive (D9).
 * Jetoanele numesc canalele 3S (scanarea, documentul, poza, e-mailul), iar insignele numesc
 * fapte 3S (Germania, registrul, jurnalul, WhatsApp), nu setul de etichete al referintei.
 */
export const MACHETA_STRAT = {
  declaratie:
    "Exemplu cu date fictive: scanări TIFF, documente PDF, poze PNG și e-mailuri EML intră în 3S, iar din ele ies câmpuri structurate.",
  eticheta: "Exemplu, date fictive",
  fisiere: ["TIFF", "PDF", "PNG", "EML"],
  miez: "3S",
  campuri: ['"tip": "proces-verbal"', '"data": "2026-09-14"', '"pagina": "2 din 3"'],
  insigne: ["Germania", "Registru", "Jurnal", "WhatsApp"],
};

// --- 2. Fraza-ancora si pilonii ------------------------------------------------------------------

export const PILONI_PLATFORMA = {
  // Rol: fraza-ancora de deasupra pilonilor (un rand la 1440). Lungime: 48.
  fraza: "Scanați o dată, întrebați ori de câte ori vreți.",
  piloni: [
    {
      numar: "01",
      iconita: "straturi" as IconitaProdus,
      titlu: "Hârtia și fișierele, la un loc",
      text: "Dosarele pe hârtie le scanează 3S, iar PDF-urile, e-mailurile și pozele trimise de echipă ajung în aceeași arhivă, citite și clasate.",
    },
    {
      numar: "02",
      iconita: "scut-bifa" as IconitaProdus,
      titlu: "Copia și originalul",
      text: "Copia digitală stă criptată AES-256 pe servere Amazon din Germania, iar originalul pe hârtie rămâne în depozitul 3S, cu proces-verbal.",
    },
    {
      numar: "03",
      iconita: "scantei" as IconitaProdus,
      titlu: "Răspuns cu pagina citată",
      text: "O întrebare pusă pe web, pe WhatsApp sau prin API primește răspuns din acte, cu documentul și pagina de unde vine, ca să îl verificați.",
    },
  ],
};

// --- 3. Cardul "problema" ------------------------------------------------------------------------

export const PROBLEMA_PLATFORMA = {
  // Rol: titlul cardului cu antet lipit (3 randuri la 1440). Lungime: 51.
  titlu: "Jumătate din acte pe hârtie, jumătate prin e-mailuri.",
  // Rol: fraza-cheie de sub titlu. Lungime: 47.
  cheie: "Două arhive paralele, și niciuna nu e completă.",
  batai: [
    "Originalele stau în bibliorafturi și în cutii, uneori în alt oraș decât biroul, iar termenul de păstrare al fiecărui dosar îl știe, de obicei, un singur om. Nimeni nu are o listă la zi cu ce e în fiecare cutie. Când omul acela lipsește, o cerere de la un client sau de la un inspector așteaptă până se întoarce, iar uneori nici atunci dosarul nu mai e întreg.",
    "În paralel, aceleași acte circulă în format digital: o factură primită pe e-mail, trimisă mai departe, salvată în două foldere și fotografiată de pe telefon. Circulă mai multe copii ale aceluiași act, iar nimeni nu mai poate spune care e cea bună. Când cineva are nevoie de el, îl caută în trei locuri.",
    "3S le leagă: originalul intră în depozitul 3S, iar copia scanată și fișierele digitale ajung în aceeași arhivă, cu un singur termen de păstrare și cu răspunsuri care citează pagina, pe web și pe WhatsApp.",
  ],
};

// --- 4. Modelul: diagrama cu trei noduri ---------------------------------------------------------

export const MODEL_PLATFORMA = {
  titlu: "Cum ajunge o întrebare a echipei la actul potrivit.",
  metafora: "Un singur ghișeu pentru toate actele firmei.",
  subtitlu:
    "Oamenii lucrează mai departe cum sunt obișnuiți, pe web, pe WhatsApp sau în programele lor. Actele intră în 3S pe orice cale, iar înapoi pleacă răspunsuri cu sursa citată și termene anunțate din timp.",
  noduri: [
    { eticheta: "Oamenii firmei", descriere: "Colegii, contabilul, clienții, pe web și pe WhatsApp." },
    { eticheta: "Arhiva 3S", descriere: "Fiecare act citit, păstrat criptat și gata de întrebat." },
    { eticheta: "Actele firmei", descriere: "Dulapuri, foldere comune, e-mailuri și poze de telefon." },
  ],
  // Primul conector: eticheta deasupra, sageata gri spre dreapta. Al doilea: sageata albastra spre
  // stanga, eticheta dedesubt (forma masurata; sensul, pe continutul 3S).
  conectori: ["Întrebări și căutări", "Acte de pe orice canal"],
};

// --- 5-7. Blocurile numerotate -------------------------------------------------------------------

export const BLOC_DATE = {
  numar: "01",
  titlu: "Drumul unui dosar pe hârtie.",
  subtitlu:
    "Un lot de acte pe hârtie, predat cu proces-verbal, trece prin patru etape până devine o arhivă în care puteți pune întrebări.",
  pasi: [
    {
      titlu: "Predarea, cu proces-verbal",
      text: "Lotul se predă pe bază de proces-verbal, iar originalele rămân apoi pe rafturi, în depozitul 3S, până în ziua în care le cereți înapoi.",
    },
    {
      titlu: "Scanarea, filă cu filă",
      text: "Fiecare filă din lot se scanează, iar din imagine 3S scoate textul, pagină cu pagină, ca să poată fi citat mai târziu.",
    },
    {
      titlu: "Un rând în registru",
      text: "Actul primește o categorie și un rând în registrul arhivei, lângă celelalte acte ale aceluiași dosar, ca să fie găsit ușor.",
    },
    {
      titlu: "Termenul de păstrare",
      text: "Din categorie rezultă cât stă actul în arhivă; ce ajunge la termen apare din timp, iar hotărârea de a-l scoate rămâne a firmei.",
    },
  ],
};

export const BLOC_ARHIVA = {
  numar: "02",
  titlu: "Unde stă fiecare act, cât stă acolo și cine l-a văzut.",
  subtitlu:
    "Copia scanată și originalul din depozit au aceeași evidență, oricare ar fi drumul pe care a intrat actul în 3S.",
  // Randurile pornesc de la hartie (originalul, cine il poate cere) si abia apoi trec la copia
  // digitala, la termen si la jurnal: ordinea si continutul arhivei 3S, nu lista referintei.
  randuri: [
    {
      eticheta: "Originalul pe hârtie",
      valoare: "Actele predate spre arhivare stau în depozitul 3S, pe bază de proces-verbal, până le cereți înapoi; în arhiva digitală lucrați cu copia lor.",
    },
    {
      eticheta: "Cine îl poate cere",
      valoare: "Un original iese din depozit numai la cererea cuiva trecut în scris pe lista firmei, nu la orice telefon.",
    },
    {
      eticheta: "Copia scanată",
      valoare: "Stă pe serverele Amazon din Germania, într-o singură regiune a UE, criptată AES-256, și vă ajunge pe ecran doar prin TLS 1.2 sau mai nou.",
    },
    {
      eticheta: "Termen de păstrare",
      valoare: "Fiecare act primește termenul după categoria lui, iar ce poate ieși din arhivă apare din timp; hotărârea de a-l scoate rămâne a firmei.",
    },
    {
      eticheta: "Jurnal de acces",
      valoare: "Fiecare căutare și fiecare document deschis se trec în jurnal, cu numele și ora, iar jurnalul vă stă la dispoziție oricând îl cereți.",
    },
  ],
  legatura: { text: "Totul despre securitatea arhivei", href: "/securitate", ruta: "/securitate" } as Legatura,
};

export const BLOC_INTREBARI = {
  numar: "03",
  titlu: "Tot ce scrie în actele firmei, la o întrebare distanță.",
  subtitlu:
    "Arhiva citită nu se mai răsfoiește: întrebați, iar 3S vă arată răspunsul împreună cu actul și pagina lui.",
  carduri: [
    {
      iconita: "balon" as IconitaProdus,
      titlu: "Răspuns cu sursa la vedere",
      text: "Întrebați ca pe un coleg, de pildă „cât am plătit chiria în martie?”, și vedeți răspunsul lângă pagina din care l-a luat 3S, ca să îl puteți verifica pe loc.",
    },
    {
      iconita: "lupa" as IconitaProdus,
      titlu: "Întrebări și de pe teren",
      text: "Cine e plecat din birou întreabă de pe telefon, pe WhatsApp, și primește răspunsul tot cu actul și pagina lui, fără să sune un coleg rămas la birou.",
    },
    {
      iconita: "clopot" as IconitaProdus,
      titlu: "Termene și alerte",
      text: "3S arată din timp ce contract expiră și ce act lipsește dintr-un dosar, înainte să devină o problemă, așa că termenele nu mai depind de memoria cuiva.",
    },
    {
      iconita: "randuri" as IconitaProdus,
      titlu: "Registrul arhivei",
      text: "Fiecare act are un rând în registru, cu categoria și termenul lui, așa că știți ce conține arhiva fără s-o deschideți.",
    },
  ],
};

// --- 8. Comparatia -------------------------------------------------------------------------------

// Randurile sunt lucrurile de zi cu zi ale unei arhive 3S (hartia, evidenta, locul copiei,
// WhatsApp, portalul), puse fata in fata cu o scanare simpla.
export const COMPARATIE_PLATFORMA = {
  titlu: "Un teanc de PDF-uri scanate nu e încă o arhivă a firmei.",
  subtitlu:
    "Cinci lucruri de care o firmă are nevoie zi de zi, puse alături: ce rămâne după o scanare simplă și ce face 3S.",
  coloane: ["Doar scanare", "Arhiva 3S"],
  randuri: [
    { dimensiune: "Originalul pe hârtie", alternativa: "Se întoarce în bibliorafturi", noi: "Păstrat în depozitul 3S" },
    { dimensiune: "Evidența actelor", alternativa: "Un tabel completat de mână", noi: "Registrul arhivei, la zi" },
    { dimensiune: "Locul fișierelor", alternativa: "Pe un calculator din birou", noi: "Criptate, în Germania" },
    { dimensiune: "O întrebare de pe teren", alternativa: "Un telefon dat la birou", noi: "Pe WhatsApp, cu pagina citată" },
    { dimensiune: "Actele unui client", alternativa: "Trimise din nou pe e-mail", noi: "Văzute de el în portal" },
  ],
  nota: "Și facturile electronice primite de firmă intră în aceeași arhivă, cu termenul lor de păstrare și cu jurnalul lor de acces.",
  legatura: { text: "E-facturare", href: "/e-facturare", ruta: "/e-facturare" } as Legatura,
};

// --- 9. Locul datelor ----------------------------------------------------------------------------

export const SUVERANITATE_PLATFORMA = {
  eticheta: "Locul datelor",
  titlu: "Copia, în Germania. Originalul, în depozitul 3S.",
  subtitlu: "Un act predat spre arhivare are două locuri, iar pe amândouă le puteți numi oricui vă întreabă.",
  proza: [
    "Hârtia predată spre arhivare se preia pe bază de proces-verbal și stă în depozitul 3S până o cereți înapoi. Copia ei scanată intră în arhiva digitală, unde textul și datele actului se citesc o singură dată, apoi stă pe serverele Amazon din Germania, într-o singură regiune a Uniunii Europene, criptată AES-256.",
    "Între dispozitivul dumneavoastră și server, fișierul circulă numai prin conexiuni TLS 1.2 sau mai noi. Serverele sunt ale Amazon, o firmă cu sediul în Statele Unite. Legea americană cunoscută drept CLOUD Act poate obliga un astfel de furnizor să păstreze și să predea datele pe care le are în grijă, chiar dacă serverele lui sunt în afara SUA. Originalul pe hârtie nu trece prin niciun server: rămâne pe raft, în depozitul 3S, până când îl cereți.",
  ],
  evidentiat:
    "Fiecare act are un rând în registrul arhivei, cu categoria și termenul lui de păstrare, iar jurnalul arată cine a deschis copia digitală și la ce oră. Dacă un client, un auditor sau un inspector întreabă unde se află un act, răspunsul e același de fiecare dată: copia în Germania, originalul, dacă l-ați predat, în depozitul 3S.",
  legatura: { text: "Citiți pagina de securitate", href: "/securitate", ruta: "/securitate" } as Legatura,
  carduri: [
    {
      titlu: "Hârtia, cu proces-verbal",
      text: "Fiecare lot predat spre arhivare are propriul proces-verbal, așa că știți oricând ce anume ați lăsat în depozitul 3S și în ce zi.",
    },
    {
      titlu: "Acces pe persoană, cu jurnal",
      text: "Accesul se dă nominal, pe persoană și pe dosar, iar fiecare act deschis rămâne trecut în jurnal, cu numele celui care l-a deschis și ora.",
    },
    {
      titlu: "Termenul, după categorie",
      text: "Termenul de păstrare se calculează după categoria actului; ce poate ieși din arhivă apare din timp, iar hotărârea de a-l scoate e a firmei.",
    },
  ],
};

// --- 10. Trei apeluri ----------------------------------------------------------------------------

/** Gazda rezervata pentru exemple (RFC 2606): blocurile de cod nu descriu un API real. */
export const GAZDA_EXEMPLU = "api.3s.example";

export const APELURI_PLATFORMA = {
  titlu: "Un API pentru programele firmei",
  subtitlu:
    "Programul de facturare, ERP-ul sau o aplicație internă trimit acte în 3S și primesc înapoi datele lor, prin API-ul REST.",
  pasi: [
    {
      titlu: "Încărcarea",
      text: "Programul trimite fișierul și, opțional, dosarul în care intră. 3S confirmă primirea și începe citirea.",
    },
    {
      titlu: "Semnalul de gata",
      text: "Un webhook anunță programul când actul a fost citit. Cine nu folosește webhook-uri poate verifica starea actului printr-o cerere.",
    },
    {
      titlu: "Datele și răspunsul",
      text: "Programul cere câmpurile de care are nevoie sau pune o întrebare și primește JSON, cu actul și pagina de unde vine fiecare valoare.",
    },
  ],
  blocuri: [
    {
      eticheta: "Exemplu de cerere care trimite un act",
      cod: [
        "POST https://" + GAZDA_EXEMPLU + "/v1/acte",
        "Authorization: Bearer <cheia dumneavoastră>",
        "Content-Type: multipart/form-data",
        "",
        "fisier: proces-verbal-0914.pdf",
        "dosar: Logistică",
        "",
        "202 Accepted",
        "{",
        '  "act": "act_exemplu_42",',
        '  "citire": "în curs"',
        "}",
      ].join("\n"),
    },
    {
      eticheta: "Exemplu de cerere care citește câmpurile unui act",
      cod: [
        "GET https://" + GAZDA_EXEMPLU + "/v1/acte/act_exemplu_42?campuri=toate",
        "Authorization: Bearer <cheia dumneavoastră>",
        "",
        "200 OK",
        "{",
        '  "tip": "proces-verbal de predare",',
        '  "data": "2026-09-14",',
        '  "suma": "1.250,00 RON",',
        '  "furnizor": "Furnizor de exemplu",',
        '  "pagina": 2',
        "}",
      ].join("\n"),
    },
  ],
  legenda:
    "Exemplu ilustrativ, cu date fictive. Adresa " + GAZDA_EXEMPLU + " e rezervată pentru exemple și nu răspunde.",
  // Eticheta vizibila din coltul fiecarui bloc (decizia D11): codul are o suma si un furnizor.
  etichetaExemplu: "exemplu",
  nota: "Zapier, Make și n8n pot porni fluxuri din aceleași evenimente ale arhivei, fără să scrieți cod.",
  legatura: { text: "Vedeți cu ce se leagă", href: "/integrari", ruta: "/integrari" } as Legatura,
};

// --- 11. Cazurile --------------------------------------------------------------------------------

export const CAZURI_PLATFORMA = {
  titlu: "Unde lucrează 3S în fiecare zi",
  subtitlu:
    "Câteva exemple din domenii în care o zi de lucru înseamnă multe acte și multe întrebări despre ele.",
  cazuri: [
    {
      titlu: "Logistică",
      text: "Comenzile, CMR-urile semnate și dovezile de livrare stau legate de cursa lor, ca facturarea să nu mai aștepte după o hârtie rămasă în cabina șoferului.",
    },
    {
      titlu: "Construcții",
      text: "Pentru fiecare șantier, autorizațiile, procesele-verbale de recepție și situațiile de lucrări stau în același dosar și se găsesc după adresa lucrării.",
    },
    {
      titlu: "Contabilitate",
      text: "Actele fiecărui client se strâng pe lună, fără e-mailuri de tipul „mai trimiteți o dată factura”, iar clientul își vede prin portal doar dosarele care sunt ale lui.",
    },
    {
      titlu: "Școli și universități",
      text: "Cataloagele și dosarele absolvenților, predate pe hârtie, se găsesc după nume și an, fără un drum până în depozit pentru fiecare adeverință cerută.",
    },
    {
      titlu: "Asigurări",
      text: "Inspectorul ajuns la locul daunei întreabă pe WhatsApp ce acoperă polița și primește răspunsul cu pagina din poliță, fără să sune la birou. Dosarul de daună arată ce acte mai lipsesc, iar clientul își urmărește dosarul prin portal, doar pe al lui, fără un drum la ghișeu și fără un șir lung de e-mailuri.",
    },
  ],
  legatura: { text: "Vedeți soluțiile pe domenii", href: "/solutii", ruta: "/solutii" } as Legatura,
};

// --- 12. Cardul de conformitate ------------------------------------------------------------------

export const CONFORMITATE_PLATFORMA = {
  titlu: "Ce întreabă un auditor, 3S poate arăta pe loc.",
  text: "Registrul actelor și termenul fiecăruia se văd din 3S oricând, la zi, fără pregătiri înaintea unui control.",
  insigne: ["AES-256", "TLS 1.2+", "UE", "Germania", "Amazon", "Jurnal"],
};

// --- 13. Intrebari frecvente ---------------------------------------------------------------------

export const INTREBARI_PLATFORMA: BlocIntrebari = {
  titlu: "Întrebări frecvente",
  intrebari: [
    {
      intrebare: "Putem începe doar cu actele pe hârtie?",
      raspuns:
        "Da. 3S preia dosarele pe hârtie, le scanează și le citește, iar originalele stau în depozitul 3S, pe bază de proces-verbal, până le cereți înapoi. În arhivă lucrați cu copia scanată.",
    },
    {
      intrebare: "Putem pune întrebări și pe WhatsApp, de pe telefon?",
      raspuns:
        "Da. Pe WhatsApp, ca și pe web, întrebați în cuvintele dumneavoastră și primiți răspunsul din acte, cu documentul și pagina din care vine.",
    },
    {
      intrebare: "În ce țară și la ce furnizor stau fișierele noastre?",
      raspuns:
        "În Germania, pe serverele Amazon, într-o singură regiune a Uniunii Europene. Pe disc sunt criptate AES-256, iar pe drum circulă doar prin conexiuni TLS 1.2 sau mai noi. Originalele pe hârtie, dacă le predați, stau în depozitul 3S.",
    },
    {
      intrebare: "De unde știm că un răspuns e corect?",
      raspuns:
        "Fiecare răspuns vine cu documentul și pagina din care e luat, așa că îl puteți deschide și verifica pe loc, înainte să vă bazați pe el.",
    },
    {
      intrebare: "Cum aflăm din timp că un act ajunge la termen?",
      raspuns:
        "3S arată din timp ce contract expiră și ce act lipsește dintr-un dosar, iar termenul de păstrare al fiecărui act se calculează după categoria lui. Hotărârea de a scoate un act din arhivă rămâne a firmei.",
    },
    {
      intrebare: "Se leagă 3S de programul nostru de contabilitate?",
      raspuns:
        "Da: SAP Business One, Sage, QuickBooks, Zoho Books, Xero și NetSuite, plus orice program care poate folosi API-ul REST. Integrările sunt descrise pe pagina de integrări.",
    },
    {
      intrebare: "Blocurile de cod de pe pagină arată API-ul real?",
      raspuns:
        "Nu. Sunt exemple ilustrative, cu date fictive și cu o adresă rezervată pentru exemple. API-ul real al 3S este un API REST cu webhook-uri.",
    },
  ],
};

/** Toate legaturile din corpul paginii, pentru probe (fiecare trece prin `Tinta`). */
export function toateLegaturilePlatforma(): Legatura[] {
  return [
    EROU_PLATFORMA.butonPrincipal,
    EROU_PLATFORMA.butonSecundar,
    BLOC_ARHIVA.legatura,
    COMPARATIE_PLATFORMA.legatura,
    SUVERANITATE_PLATFORMA.legatura,
    APELURI_PLATFORMA.legatura,
    CAZURI_PLATFORMA.legatura,
  ];
}

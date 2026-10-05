// Continutul componentelor startului pe editia `ro-MD` (`/ro` pe 3s.md): aceleasi componente si aceeasi compunere ca
// pagina de start RO si ca startul EN (decizia 53), cu textul in romana de business, la "tu" (deciziile 35, 39).
// Fiecare constanta e tipata pe contractul structural al componentei ei (proprietati optionale cu implicitul RO), deci
// un camp lipsa sau in plus pica typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa de continut a paginii, sectiunea "Textele componentelor (decizia 53)" si randurile
// deciziei 59 (GrilaIndustrii, CardEnterprise), cu cheia campului RO (de pilda `acasa.ts:138`) in comentariu.
// Campurile fara rand in fisa iau textul aprobat al paginii (`ro-md/acasa.ts`) sau, unde nici acela nu exista, o
// eticheta de legatura scrisa dupa forma legaturilor aprobate; sunt numite in comentariu. Legaturile duc la perechile
// /ro ale paginilor (decizia 59), fara marcajul "in engleza". Textul e PROPUS, pana la aprobarea owner-ului pe capturi (poarta 2).
//
// CE NU INTRA, cu decizia: pastila-legatura a eroului si randurile 1 si 3 ale popover-ului (d31, d43, d49); centrul
// buclei si legenda (lansarea machetei, d43 si d49; hartia, poarta juridica a deciziilor 40-41); insigna "scanat"
// a machetei cautarii (aceeasi poarta); macheta portalului (d43); cifra AES-256 (d31); butonul secundar al blocului
// de final (pagina lui nu exista pe 3s.md); legaturile cardurilor de situatii spre paginile de segment (d38).
//
// BUCLA EROULUI nu e aici: pagina ia bucla editiei RO (`src/content/acasa.ts`), ca /ro sa primeasca figura scenei
// odata cu site-ul RO. Modulul ramane numai date si nu importa nimic din continutul RO, fiindca il importa si
// invelitoarea client a pasilor: continutul RO nu intra in pachetul paginilor 3s.md.
//
// `ro-md/acasa.ts` ramane sursa pentru metadata, JSON-LD-ul paginii si registrul de afirmatii.

import type { ContinutBandaPret } from "@/components/acasa/BandaPret";
import type { ContinutCardEnterprise } from "@/components/acasa/CardEnterprise";
import type { ContinutCardSecuritate } from "@/components/acasa/CardSecuritate";
import type { ContinutCifra } from "@/components/acasa/BandaCifre";
import type { ContinutFaqAcasa } from "@/components/acasa/FaqAcasa";
import type { ContinutGrilaIndustrii } from "@/components/acasa/GrilaIndustrii";
import type { ContinutTestimonial } from "@/components/acasa/Testimonial";
import type { ContinutErou } from "@/components/erou/Erou";
import type { ContinutFunctionalitatiAcasa } from "@/components/functionalitati-acasa/FunctionalitatiAcasa";
import type { ContinutMachetaCautare } from "@/components/functionalitati-acasa/MachetaCautareVedere";
import type { ContinutMachetaRegistru } from "@/components/functionalitati-acasa/MachetaRegistruVedere";
import type { ContinutCtaFinal } from "@/components/primitive/CtaFinalInchis";

/** Ancora blocului de final: aceeasi ca pe RO si pe EN (`ANCORE_ACASA.contact`), deci aceeasi semnatura de forma. */
export const ANCORA_FINAL_RO_MD = "contact";

/**
 * Butonul secundar al eroului: eticheta aprobata a paginii (`ro-md/acasa.ts`, `eroSecundar`); tinta e blocul de
 * final, al carui titlu e invitatia la pilot, ca pe EN.
 */
export const EROU_SECUNDAR_RO_MD = { text: "Cum începe un pilot", href: "#" + ANCORA_FINAL_RO_MD } as const;

/** Eroul fara bucla (o pune pagina, din editia RO). */
export const EROU_RO_MD: Omit<ContinutErou, "bucla"> = {
  pastile: {
    // acasa.ts:103.
    intrebare: { text: "Unde sunt păstrate fișierele?", iconita: "check" },
  },
  popover: {
    // acasa.ts:119; numai randul gazduirii ramane (d42).
    randuri: [{ iconita: "globe", text: "În UE, cu regiunea principală la Frankfurt." }],
    // Fara rand in fisa (acasa.ts:123): tinta aprobata a paginii pentru gazduire, pe perechea /ro a paginii despre 3S.
    legatura: { text: "Pagina despre 3S", href: "/ro/securitate#security", ruta: "/ro/securitate" },
  },
  // H1 aprobat, impartit ca pe RO: prima propozitie (A), apoi a doua cu accentul (acasa.ts:132, :134).
  titlu: {
    primaPropozitie: "Întreabă documentele firmei.",
    aDouaInainteDeAccent: "Primești",
    accent: "răspunsul și sursa lui.",
  },
  // acasa.ts:138.
  subtitlu: "3S organizează documentele firmei tale într-o arhivă digitală și oferă răspunsuri cu documentul-sursă.",
  // acasa.ts:151.
  nota: "Îți răspunde o persoană",
};

export const FUNCTIONALITATI_RO_MD: ContinutFunctionalitatiAcasa = {
  // acasa.ts:435, :440. Subtitlul fisei incepe cu numele pasilor ("Scan. Store. Solve."); aici le spune ca nume al
  // marcii, "3S Scan Store Solve:", ca entitatea declarata a paginii (G-AI-02, `config/seo/ro-md-acasa-contact.json`)
  // sa stea in primele 400 de cuvinte, ca pe startul EN ("What is 3S Scan Store Solve?"). Aceleasi cuvinte, plus "3S".
  titlu: "Arhiva firmei, organizată și pregătită pentru întrebările tale.",
  subtitlu: "3S Scan Store Solve: în trei pași ajungi de la fișierele încărcate la răspunsul cu documentul-sursă.",
  final: {
    // acasa.ts:479, :481; tinta e ghidul G3 (comparatia cu Google si Box AI), pe perechea lui /ro.
    fraza: "Lucrezi deja cu Google Drive sau cu Box?",
    buton: { text: "Vezi comparația cu 3S", href: "/ro/comparatie-drive", ruta: "/ro/comparatie-drive" },
  },
};

/** Pasii sectiunii (invelitoarea RO-MD a partii vii). */
export const PASI_RO_MD: { numar: "01" | "02" | "03"; eticheta: string; titlu: string; paragraf: string }[] = [
  {
    numar: "01",
    // acasa.ts:448, :450, :453.
    eticheta: "Scan: încărcare și OCR",
    titlu: "Fișierele pe care le ai deja în format electronic se încarcă direct în arhiva digitală.",
    paragraf:
      "Încarci fișierele din browser: PDF-uri, documente Office sau imagini. Pe paginile scanate, fără text selectabil, 3S citește textul prin OCR, iar fiecare document primește automat o etichetă de tip, de pildă contract, factură sau bon. Apoi cauți direct în conținutul documentelor.",
  },
  {
    numar: "02",
    // acasa.ts:458 (A, neschimbat), :460, :463.
    eticheta: "Store: păstrare în ordine",
    titlu: "Fiecare document este păstrat în spațiul de lucru al firmei",
    paragraf:
      "Documentele încărcate sunt indexate automat pentru căutare. Toți colegii care au cont lucrează în aceeași arhivă, în structura de dosare stabilită de firmă, și găsesc aceleași documente.",
  },
  {
    numar: "03",
    // acasa.ts:468 (A, neschimbat), :470, :473.
    eticheta: "Solve: răspuns cu sursa",
    titlu: "Formulezi întrebarea în română și primești răspunsul cu sursa lui.",
    paragraf:
      "Scrii întrebarea liber, fără cuvinte-cheie sau operatori de căutare. Pentru fiecare dosar poți stabili termenul de păstrare, iar deschiderile și descărcările documentelor sunt consemnate în jurnal.",
  },
];

/** Eticheta vizibila "exemplu" din capul machetelor (acelasi cuvant ca pe RO). */
export const ETICHETA_EXEMPLU_RO_MD = "exemplu";

/** Macheta pasului 1, fara insigna de scanare (poarta juridica a deciziilor 40-41). */
export const MACHETA_CAUTARE_RO_MD: Omit<ContinutMachetaCautare, "exemplu" | "bifa"> = {
  // acasa-functionalitati.ts:79-121.
  declaratie: "Exemplu cu date fictive: trei dintre documentele găsite printr-o întrebare",
  eticheta: "Căutare în arhivă",
  intrebare: "Documentele despre depozit din 2025",
  gasite: "9 documente găsite, cu sursa",
  insigne: { etichetat: "Etichetă automată" },
  randuri: [
    {
      placuta: "PDF",
      fisier: "Factura_chirie_martie.pdf",
      tip: { cod: "factura", text: "Factură" },
      data: "mar. 2025",
      scanat: false,
      rezumat: {
        titlu: "Fragment din document",
        text: "Chiria depozitului pentru martie: 650,00 EUR plus TVA, cu plata până la 10 aprilie 2025.",
      },
    },
    {
      placuta: "PDF",
      fisier: "Contract_inchiriere_depozit.pdf",
      tip: { cod: "albastru", text: "Contract" },
      data: "ian. 2025",
      scanat: false,
      rezumat: {
        titlu: "Fragment din document",
        text: "Spațiul se închiriază pentru 12 luni, de la 1 ianuarie la 31 decembrie 2025.",
      },
    },
    {
      placuta: "PDF",
      fisier: "Factura_energie_T1_2025.pdf",
      tip: { cod: "factura", text: "Factură" },
      data: "apr. 2025",
      scanat: false,
      rezumat: {
        titlu: "Fragment din document",
        text: "În primele trei luni, depozitul a consumat 18.450 kWh, cu 6% mai puțin decât în trimestrul I din 2024.",
      },
    },
  ],
};

/** Macheta pasului 3: un dosar, cu acelasi termen de pastrare pe fiecare rand (termenul e pe dosar). */
export const MACHETA_REGISTRU_RO_MD: Omit<ContinutMachetaRegistru, "exemplu"> = {
  // acasa-functionalitati.ts:261-278; codul de culoare al randului 2 ramane cel RO (fisa nu il schimba).
  declaratie: "Exemplu cu date fictive: documentele unui dosar, cu termenul de păstrare stabilit pentru dosar",
  eticheta: "Dosarul Depozit",
  insigna: "Același termen",
  coloane: ["Nr.", "Document", "Tip", "Termen", "Stare"],
  stare: "păstrat",
  randuri: [
    { nr: "001", fisier: "Factura_chirie_martie.pdf", tip: { cod: "factura", text: "Factură" }, termen: "2035" },
    { nr: "002", fisier: "Bon_motorina_martie.pdf", tip: { cod: "albastru", text: "Bon" }, termen: "2035" },
    { nr: "003", fisier: "Contract_paza.pdf", tip: { cod: "albastru", text: "Contract" }, termen: "2035" },
  ],
  verificari: [
    { iconita: "tag", text: "Tip de document recunoscut" },
    { iconita: "clock", text: "Termenul dosarului aplicat" },
    { iconita: "book-open", text: "Text indexat pentru căutare" },
    { iconita: "shield", text: "Deschiderile consemnate în jurnal" },
  ],
};

/** Etichetele punctelor pistei de mobil (acasa-functionalitati.ts:290, :292). */
export const PUNCTE_PISTA_RO_MD = {
  grup: "Etapele de lucru în 3S",
  punct: (numar: number, total: number, eticheta: string) => "Etapa " + numar + " din " + total + ": " + eticheta,
};

/**
 * Banda de cifre (acasa.ts:502, :508): doua perechi, ca pe startul EN al aceluiasi domeniu. Perechea AES-256 iese
 * (d31); fisa propune in locul ei "2 limbi ale interfeței: română și engleză" (acasa.ts:505), dar lista declarata a
 * perechii P01 (`config/congruenta/p01.json`) numara doua celule pe ambele pagini 3s.md, `/` si `/ro`. Abatere de
 * la fisa, numita in raportul feliei, de decis la poarta 2.
 */
export const CIFRE_RO_MD: ContinutCifra[] = [
  { cifra: "14 zile", eticheta: "de pilot gratuit" },
  { cifra: "Frankfurt", eticheta: "regiunea principală, în UE" },
];

/** Situatiile de lucru (decizia 59; acasa.ts:530-588): fara legaturi spre segmente (d38). */
export const INDUSTRII_RO_MD: ContinutGrilaIndustrii = {
  titlu: "Pentru cine este potrivit 3S?",
  carduri: [
    {
      text: "Documente solicitate repetat",
      descriere: "Le regăsești printr-o întrebare, iar răspunsul indică documentul din care provine.",
      iconita: "file-text",
    },
    { text: "Documente dispersate", descriere: "După încărcare, sunt reunite într-o singură arhivă.", iconita: "archive" },
    {
      text: "Un singur coleg știe cum este organizată arhiva",
      descriere: "Toți colegii care au cont lucrează în aceeași arhivă și găsesc aceleași documente.",
      iconita: "users",
    },
    {
      text: "Colegi noi sau un birou nou",
      descriere: "Un coleg nou se autentifică și lucrează în aceeași arhivă, din browser.",
      iconita: "building",
    },
    {
      text: "Scanări fără text selectabil",
      descriere: "3S recunoaște textul documentelor scanate, astfel încât le poți căuta și pe ele.",
      iconita: "scan-line",
    },
    {
      text: "Documente cu termen de păstrare",
      descriere: "Termenul de păstrare îl stabilești pe dosar, pentru toate documentele din el.",
      iconita: "file-check",
    },
    {
      text: "Cerințe stricte de acces sau export",
      descriere: "Comunică-ni-le de la început, iar noi verificăm dacă 3S le poate respecta.",
      iconita: "shield-check",
    },
  ],
  toate: { text: "Altă situație?", href: "/ro/contact", ruta: "/ro/contact" },
};

/** acasa.ts:612-618: deviza aprobata, fara citat si fara persoana. */
function testimonial(continuare: string): ContinutTestimonial {
  return {
    esteCitat: false,
    fraza: "Documentele care îți răspund.",
    continuare,
    // Rolul: acasa.ts:618. Firma: marca, ca pe EN (fara rand in fisa).
    atribuire: { rol: "Cum poți evalua 3S", firma: "3S Scan Store Solve" },
  };
}

/** acasa.ts:615, forma cu ghidurile publicate. */
export const TESTIMONIAL_RO_MD: ContinutTestimonial = testimonial(
  "Nu publicăm numele clienților, rezultate cifrate sau recenzii. De aceea îți propunem să verifici singur, prin ghidurile cu surse și printr-un pilot pe documentele firmei.",
);

/** acasa.ts:615, varianta fisei de dinainte de ghiduri (fara trimiterea la ele). */
export const TESTIMONIAL_RO_MD_FARA_GHIDURI: ContinutTestimonial = testimonial(
  "Nu publicăm numele clienților, rezultate cifrate sau recenzii. De aceea îți propunem să verifici singur, printr-un pilot pe documentele firmei.",
);

/** acasa.ts:647-655. */
export const CARD_SECURITATE_RO_MD: ContinutCardSecuritate = {
  titlu: "Unde sunt găzduite fișierele firmei?",
  text: "Găzduirea este pe AWS, în Uniunea Europeană, cu regiunea principală la Frankfurt.",
  // Fara rand in fisa (acasa.ts:655): tinta aprobata a paginii pentru gazduire, pe perechea /ro a paginii despre 3S.
  legatura: { text: "Detalii despre găzduire", href: "/ro/securitate#security", ruta: "/ro/securitate" },
};

/** acasa.ts:663-671 (decizia 59): pachetul Enterprise, spre /ro/enterprise. */
export const CARD_ENTERPRISE_RO_MD: ContinutCardEnterprise = {
  titlu: "Peste 20 de conturi?",
  pastila: "Enterprise",
  descriere:
    "Enterprise este pachetul pentru firmele cu peste 20 de conturi, cu contract anual. 3S recunoaște textul documentelor scanate, identifică tipul documentului și indică sursa fiecărui răspuns.",
  tinta: { text: "Detalii despre Enterprise", href: "/ro/enterprise", ruta: "/ro/enterprise" },
};

/** acasa.ts:689-693. */
export const BANDA_PRET_RO_MD: ContinutBandaPret = {
  titlu: "Cât costă 3S?",
  fraza: "3S are patru pachete, de la 75 EUR pe lună la plata anuală, pentru întreaga firmă, fără TVA.",
  // Fara rand in fisa (acasa.ts:693): eticheta aprobata a paginii ("Vezi pachetele"), spre /ro/preturi.
  legatura: { text: "Vezi pachetele", href: "/ro/preturi", ruta: "/ro/preturi" },
};

/** Fraza de sub intrebari inainte de P-40 (acasa.ts:767): fara adresa, numai WhatsApp. */
export const SUBSOL_FAQ_FARA_EMAIL = "Ai altă întrebare? Scrie-ne pe WhatsApp.";

/** Inceputul frazei de sub intrebari dupa P-40, urmat de adresa domeniului (fisa, "Ne poți scrie și la"). */
export const SUBSOL_FAQ_CU_EMAIL = "Ne poți scrie și la";

/** acasa.ts:718-767. Raspunsurile sunt text simplu: FAQPage din JSON-LD le oglindeste exact. */
// Raspunsul 4 (acasa.ts:759) are in fata frazei fisei inceputul pasului 1 aprobat ("descrie pe scurt arhiva firmei"),
// ca WhatsApp si stabilirea intrebarilor de testat sa stea in propozitii diferite: in aceeasi propozitie, proba
// paginilor RO-MD (asistentul pe WhatsApp, decizia 49) o citeste ca pe o promisiune de raspuns pe WhatsApp.
export const INTREBARI_RO_MD: ContinutFaqAcasa = {
  titlu: "Înainte să ne scrii",
  intrebari: [
    {
      intrebare: "Unde sunt păstrate documentele?",
      raspuns:
        "În Uniunea Europeană, cu regiunea principală la Frankfurt, pe serverele Amazon Web Services (AWS). Amazon are sediul în Statele Unite, iar legislația americană (CLOUD Act) poate obliga compania să păstreze și să predea datele aflate în posesia sau sub controlul ei, indiferent unde se află serverele.",
    },
    {
      intrebare: "Pot pune întrebările în engleză?",
      raspuns:
        "Deocamdată, numai în regim de testare. Putem verifica funcția pe documentele tale înainte să iei o decizie. Tot în testare se află indicarea paginii exacte din document.",
    },
    {
      intrebare: "Cum găsește 3S documentul de care ai nevoie?",
      raspuns:
        "3S citește textul fiecărui document încărcat, inclusiv prin OCR pe paginile scanate, și îl indexează pentru căutare. Scrii apoi întrebarea în română, ca unui coleg, iar răspunsul vine cu documentul-sursă, ca să verifici informația.",
    },
    {
      intrebare: "Cum încep să folosesc 3S?",
      raspuns:
        "Ne scrii pe WhatsApp și descrii pe scurt arhiva firmei. Stabilim apoi în scris documentele și întrebările de testat. Pilotul gratuit de 14 zile începe după ce accepți Termenii și condițiile, precum și Acordul de prelucrare a datelor, iar la final decizi dacă alegi un pachet.",
    },
  ],
  // Forma de dinainte de P-40; dupa P-40 pagina pune `SUBSOL_FAQ_CU_EMAIL` si adresa.
  subsol: { inainte: SUBSOL_FAQ_FARA_EMAIL, posta: { text: "", href: null, ruta: null } },
};

/** acasa.ts:800-828. Butonul secundar iese (`/incepe` nu exista pe 3s.md); butoanele le pune pagina. */
export const CTA_FINAL_RO_MD: ContinutCtaFinal = {
  // Fara rand in fisa (acasa.ts:800): titlul aprobat al blocului de final al paginii.
  titlu: "Vrei să vezi cum funcționează 3S pe documentele tale?",
  // acasa.ts:804.
  subtitlu: "Descrie-ne pe scurt arhiva firmei și țara în care se află documentele.",
  // Folosit numai daca pagina nu da `butoane`; pagina pune butonul WhatsApp (eticheta deciziei 35).
  butonPrincipal: { text: "Scrie-ne pe WhatsApp", href: null, ruta: null },
  // acasa.ts:815.
  microtext: "Îți răspunde o persoană din echipa 3S.",
  vizual: {
    declaratie: "Exemplu cu date fictive",
    pasi: [
      // acasa.ts:820 (iconita se schimba odata cu textul: incarcarea din browser), :822.
      { iconita: "laptop", text: "Încărcat pe web", ora: "09:41" },
      { iconita: "tag", text: "Etichetat ca factură", ora: "09:41" },
    ],
    // acasa.ts:826, :828.
    rezultat: { fisier: "Factura_0415_exemplu.pdf", stare: "Indexat pentru căutare", ora: "09:42" },
  },
};

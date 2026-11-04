// Continutul componentelor paginii Enterprise pe editia `ro-MD` (P09, `/ro/enterprise` pe 3s.md): aceleasi componente
// si aceeasi compunere ca pagina Enterprise RO si ca perechea EN (decizia 53), cu textul in romana de business, la "tu".
// Fiecare constanta e tipata pe contractul structural al componentei ei, deci un camp lipsa sau in plus pica typecheck-ul.
//
// SURSA TEXTULUI, pe camp: fisa paginii (ro-md/enterprise.md), sectiunea "Textele componentelor (decizia 53)", cu cheia
// campului RO (de pilda `enterprise.ts:36`) in comentariu. Textul e PROPUS, pana la aprobarea owner-ului pe capturi.
// Abateri de la fisa, scrise aici ca sa se vada: pilotul are 14 zile (decizia 65, dupa redactarea fisei), iar legatura
// spre pagina despre 3S e `/ro/securitate` (slug-ul fisei acelei pagini).
//
// CE NU INTRA, cu decizia (aceleasi ca pe EN): hartia scanata de 3S si originalele (poarta juridica a deciziilor
// 40-41), integrarile cu nume, portalul, programul de contabilitate, API-ul si regulile automate (d43), WhatsApp ca
// intrare sau iesire de documente (d49), campurile citite din act si clasarea in dosar (faptele confirmate ale valului
// RO), AES-256 (d31), faptul "semnat". Formularul (d3) e inlocuit de blocul de canal WhatsApp, in aceeasi sectiune.
//
// Modulul e numai date: il importa si invelitoarea client a benzii, deci nu aduce nimic din continutul RO.

import type { ContinutDrumDocument } from "@/components/enterprise/BandaDrumDocumentVedere";
import type { ContinutEroulEnterprise } from "@/components/enterprise/EroulEnterprise";
import type { ContinutListaLivrabile } from "@/components/enterprise/ListaLivrabile";
import { CONTURI_MINIME_ENTERPRISE, LIMITE_PLANURI } from "@/content/limite-planuri";
import { CONECTARE_RO_MD, cuDeRoMd, limiteRoMd } from "./preturi-componente";

/**
 * Limitele de baza ale pachetului Enterprise (deciziile 66-68; coloana Enterprise a tabelului final), din
 * `src/content/limite-planuri.ts`, oglinda lui `LIMITE_DE_BAZA_EN`: "500 GB de stocare, 600 de raspunsuri AI pe luna,
 * ...". Intra in randul despre conturi si contract al listei, ca lista sa ramana la sase elemente.
 */
const LIMITE_ENTERPRISE_RO_MD = limiteRoMd("enterprise").map((l) => l.cifra + " " + l.text);
const LIMITE_DE_BAZA_RO_MD =
  LIMITE_ENTERPRISE_RO_MD.slice(0, -1).join(", ") + " și " + LIMITE_ENTERPRISE_RO_MD[LIMITE_ENTERPRISE_RO_MD.length - 1];

/** Ancora blocului de canal: aceeasi ca a formularului RO (`ANCORA_FORMULAR`), deci aceeasi semnatura de forma. */
export const ANCORA_CANAL = "contact-form";

/**
 * `enterprise.ts:27-42`. Butonul spre formular iese (d3): eroul primeste butonul WhatsApp de la pagina. Subtitlul
 * pastreaza "de utilizator" din capsula fisei (fisa il scotea pentru cutie): fara el primul paragraf din <main> are 29
 * de cuvinte, sub pragul G-AI-02 de 30; cu el, 31 de cuvinte si 213 caractere (RO 190, +12%).
 */
export const EROU_ENTERPRISE_RO_MD: ContinutEroulEnterprise = {
  fir: [
    { text: "Acasă", cale: "/ro" },
    { text: "Enterprise", cale: "/ro/enterprise" },
  ],
  inapoi: { text: "Înapoi la pachete", href: "/ro/preturi", ruta: "/ro/preturi" },
  titlu: "3S pentru organizațiile cu arhive mari și cerințe IT",
  // Felia 164: a doua propozitie e cea propusa in documentul lui Adrian Mihai (03.11.2026, „Enterprise, caseta”). Forma
  // de o singura propozitie avea 26 de cuvinte, sub paragraful de raspuns de 30-80 (G-AI-02, CI 41802934979), iar
  // „cerintele voastre” iesea din adresarea cu „tu” (decizia 35).
  subtitlu:
    "3S Enterprise este pachetul pentru organizațiile cu peste 20 de conturi de utilizator, cu contract anual, limite mai mari și o ofertă scrisă. Spune-ne ce cerințe are departamentul IT și îți răspundem punct cu punct.",
  secundara: { text: "Cum funcționează platforma", href: "/ro/platforma", ruta: "/ro/platforma" },
  incredere: ["Găzduire în UE", "Regiunea principală: Frankfurt", "Peste 20 de conturi", "Contract anual"],
};

/** Butonul de canal al eroului si al blocului de canal: eticheta deciziei 35 (front matter `cta.button`). */
export const BUTON_WHATSAPP_ENTERPRISE_RO_MD = "Scrie-ne pe WhatsApp";

/** Microtextul de sub butonul blocului de canal (front matter `cta.microtext`). */
export const MICROTEXT_ENTERPRISE_RO_MD = "Îți răspunde un consultant din echipa 3S, în română sau în engleză. Fără formular, fără cont.";

/**
 * `enterprise.ts:49-89`: banda cu drumul unui document. Listele sunt mai scurte decat pe RO (elementele scoase de
 * decizii), ca pe EN; faptele raman patru din cinci.
 */
export const DRUM_DOCUMENT_RO_MD: ContinutDrumDocument = {
  titlu: "De la fișier la răspuns",
  intrare: { eticheta: "Primire", elemente: ["Scanări existente", "Din browser"] },
  intelegere: { eticheta: "Citire", elemente: ["Recunoașterea textului", "Tipul documentului", "Căutare cu sursa citată"] },
  stocare: { eticheta: "Păstrare", pastile: ["UE (Frankfurt)", "Gata de căutare"] },
  iesire: { eticheta: "Răspuns", elemente: ["Răspuns în browser", "Export"] },
  fapte: [
    { text: "factura_0147.pdf", mono: true },
    { text: "Factură", mono: false },
    { text: "Indexat", mono: false },
    { text: "până în 2036", mono: false },
  ],
  anStart: "2026",
  anFinal: "2036",
  nota: "Exemplu cu date fictive. Compania stabilește termenul de păstrare pentru fiecare dosar.",
  etichetaExemplu: "exemplu",
};

/** `enterprise.ts:96-125`: lista ia rolul tabelului pentru IT si achizitii (specificatia, sectiunea 3). */
export const LIVRABILE_RO_MD: ContinutListaLivrabile = {
  titlu: "Ce verifică întâi IT-ul și achizițiile?",
  text: "Iată ce verifică de obicei IT-ul și achizițiile și ce putem spune astăzi despre fiecare punct.",
  // Caseta „Certificari si niveluri de serviciu” a iesit (felia 164, decizia lui Adrian Mihai din 03.11.2026, GO owner
  // 04.11): la cerintele unui departament IT se raspunde la cerere, nu printr-o declaratie pe site.
  elemente: [
    {
      titlu: "Conturi, limite și contract",
      text:
        "De la " +
        CONTURI_MINIME_ENTERPRISE +
        " la " +
        LIMITE_PLANURI.enterprise.conturi +
        cuDeRoMd(LIMITE_PLANURI.enterprise.conturi) +
        " conturi de utilizator în pachetul de bază, cu contract anual și facturare lunară, de la 800\u00a0EUR pe lună, fără TVA. Limitele de bază, comune pentru întreaga organizație: " +
        LIMITE_DE_BAZA_RO_MD +
        ". Conectare: " +
        CONECTARE_RO_MD +
        ".",
    },
    {
      titlu: "Test gratuit pe documentele companiei",
      text: "Începi cu un test gratuit de 14 zile, cu limitele pachetului Starter. Pachetul și prețul le confirmăm apoi într-o ofertă scrisă.",
    },
    {
      titlu: "Unde sunt datele",
      text: "Fișierele stau pe servere din UE. Pagina Despre 3S și securitate spune cine este furnizorul și ce înseamnă legea americană pentru date.",
      // Tinta aprobata a paginii pentru gazduire (calea SURSA; adresa servita o scrie componenta).
      legaturaInText: { text: "Pagina Despre 3S și securitate", href: "/ro/securitate#security" },
    },
    {
      titlu: "Răspunsuri cu sursa lor",
      text: "Pui întrebarea în browser, iar răspunsul vine cu documentul din care provine, ca să îl poți verifica înainte să te bazezi pe el.",
    },
    {
      titlu: "Documentele rămân ale tale",
      text: "Le poți descărca oricând din 3S. Dacă ai nevoie de o procedură anume de predare a datelor la încheierea contractului, spune-ne înainte să decizi.",
    },
  ],
};

/** `enterprise.ts:132-136`: capul blocului de canal care tine locul formularului (d3). */
export const CANAL_ENTERPRISE_RO_MD = {
  eticheta: "Enterprise",
  titlu: "Spune-ne ce cerințe are compania ta",
  subtitlu: "Spune-ne ce conține arhiva și unde se află acum.",
};

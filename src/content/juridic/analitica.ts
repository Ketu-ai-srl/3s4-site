// Textele juridice despre analitica proprie, fara cookie (felia multi-domeniu). Politica de
// confidentialitate si cea de cookie-uri (`./confidentialitate.ts`, `./cookie-uri.ts`) le insereaza NUMAI cand statistica
// e pornita (`analiticaProprie().activa`, adica variabilele date): un text despre o masurare care nu ruleaza ar fi o
// afirmatie falsa, iar una care ruleaza fara text ar lasa informarea (GDPR art. 13) incompleta. Fara
// `UMAMI_URL` si `UMAMI_WEBSITE_ID`, documentele juridice raman cele de pana acum, cuvant cu cuvant. Masurarea
// ruleaza numai cu un operator numit si complet (`src/components/analitica/config.ts`), iar documentele juridice
// exista numai cu operator: textul si masurarea apar impreuna, niciuna fara cealalta.
//
// FARA DATE DE FIRMA (decizia D10 si planul §7): textele spun "noi" si numesc adresa de contact numai
// prin parametrul `contact`, luat de apelant din operator.
//
// FAPTELE, cu sursa lor (citite pe 2026-09-30; detaliul si linkurile in `src/components/analitica/config.ts`): (1) codul
// trackerului servit de instanta noastra, (2) documentatia oficiala docs.umami.is (FAQ 1, 2, 5, 8),
// (3) sursa rutei de primire si a scrierii evenimentelor din depozitul umami-software/umami.
//   - nu scrie cookie-uri si nu urmareste vizitatorii de pe un site pe altul: (1), (2);
//   - primeste de la browser adresa paginii (cu parametrii din adresa, fiindca `data-exclude-search`
//     nu e setat), referrerul, titlul, limba si dimensiunea ecranului: (1); evenimentul salvat are si
//     parametrii de campanie din adresa (`utm_*` si identificatorii de clic): (3);
//   - browserul, sistemul, dispozitivul si locul (tara, regiunea, orasul) le deduce serverul din user
//     agent si din adresa IP; locul vine din antetele unui CDN sau dintr-o baza geografica si ramane gol
//     cand nu exista niciuna: (3);
//   - adresa IP nu se salveaza: nici sesiunea, nici evenimentul nu au un camp pentru ea; intra numai in
//     calculul identificatorului sesiunii: (3), iar documentatia sesiunilor spune ca identificatorul e
//     "a unique hash generated from the visitor's IP address, user agent, and website ID": (2);
//   - `data-do-not-track` opreste masurarea la "Do Not Track": (1), (2);
//   - din stocarea locala trackerul citeste numai `umami.disabled`: (1).
// CE NU AFIRMA, deliberat:
//   - tara sau furnizorul serverului (nu se cunosc din depozit; se completeaza in ziua operatorului,
//     `docs/ziua-operatorului.md`);
//   - un termen de stergere in cifre: aplicatia pastreaza datele nelimitat pana le sterge cineva (FAQ 8),
//     iar termenul il fixeaza operatorul;
//   - ca masurarea "nu cere acord". Ghidurile EDPB 2/2023 (octombrie 2024) trateaza ca acces la
//     echipamentul terminal (art. 5 alin. (3) ePrivacy) si colectarea de informatii generate local prin
//     API-urile browserului, de felul dimensiunii ecranului sau al limbii; daca o astfel de masurare
//     scutita de acord se poate sprijini pe legislatia nationala a fiecarui stat e o intrebare pentru
//     jurist (ziua-operatorului, pasul 0), nu o concluzie pe care textul s-o traga. Textul spune ce face
//     masurarea, iar pornirea ei dupa banner ramane o schimbare mica de cod, cerand-o juristul.
//   - "anonim": identificatorul vizitei e calculat din IP, user agent si id-ul site-ului, deci e
//     pseudonim, nu anonim.
//
// Adresarea e cea a documentelor juridice: "dumneavoastra" (decizia D15). De aceea modulul sta aici, printre
// documentele juridice, si nu langa componenta analiticii: proba de limba (`tests/limba.test.ts`) accepta
// aceasta adresare numai in `src/content/juridic/`.

import { analiticaProprie } from "@/components/analitica/config";

/** Data versiunii documentelor juridice care poarta paragrafele de aici (ISO). Schimbata de oricine schimba textele. */
export const VERSIUNE_ANALITICA = "2026-09-30";

export type TexteAnalitica = {
  /** Paragraful din politica de confidentialitate, sectiunea "Ce date prelucram" (art. 13 alin. (1) lit. c)). */
  prelucrare: string;
  /** Prima propozitie din sectiunea interesului legitim, cand analitica e pornita: aceeasi ca fara ea, fara "numai". */
  jurnale: string;
  /** Paragraful despre interesul legitim al masurarii, in aceeasi sectiune (lit. d)). */
  interes: string;
  /** Propozitia despre durata, in sectiunea "Cat timp pastram datele" (art. 13 alin. (2) lit. a)). */
  pastrare: string;
  /** Paragraful din politica de cookie-uri, dupa tabelul informatiilor pastrate in browser. */
  cookie: string;
};

/**
 * Textele, sau `null` cand statistica proprie nu e pornita. `contact` e adresa de e-mail a operatorului,
 * pentru opozitie (art. 21). `activa` se poate da din afara numai pentru probe.
 */
export function texteAnalitica(contact: string, activa: boolean = analiticaProprie().activa): TexteAnalitica | null {
  if (!activa) {
    return null;
  }
  return {
    prelucrare:
      "Măsurarea vizitelor, fără cookie. Site-ul are o aplicație proprie de statistică, instalată pe un server administrat de noi; datele nu pleacă la un furnizor de analiză din afară. Ea primește de la browser adresa paginii, cu parametrii din adresă (de pildă cei ai campaniilor), pagina de pe care ați venit, titlul paginii, limba și dimensiunea ecranului, iar din datele browserului și din adresa IP deduce tipul de browser, de sistem și de dispozitiv și locul aproximativ (țara și, dacă serverul le poate deduce, regiunea și orașul). Adresa IP nu se salvează în datele măsurării: intră doar în calculul unui cod al vizitei. Măsurarea nu scrie niciun cookie și nimic în stocarea locală a browserului, nu vă urmărește de pe un site pe altul și nu pornește dacă browserul trimite semnalul „Do Not Track”. Pornește fără să aștepte alegerea din bannerul de cookie-uri și nu se schimbă după ea. Datele nu se folosesc pentru publicitate și nu se combină cu alte surse. Temeiul este interesul nostru legitim de a afla ce pagini se citesc, ca să le îmbunătățim (GDPR art. 6 alin. (1) lit. f)).",
    jurnale:
      "Invocăm interesul legitim pentru jurnalele serverului: ca site-ul să funcționeze, să poată fi depanat și să fie apărat de atacuri. Datele din jurnale nu se folosesc pentru publicitate și nu se combină cu alte surse.",
    interes:
      "Invocăm interesul legitim și pentru măsurarea vizitelor fără cookie, ca să aflăm ce pagini se citesc și să le îmbunătățim. Interesul dumneavoastră este protejat prin faptul că măsurarea nu scrie nimic în browser, nu salvează adresa IP și nu vă urmărește de pe un site pe altul. Vă puteți opune oricând: trimiteți semnalul „Do Not Track” din browser sau scrieți-ne la " +
      contact +
      ".",
    pastrare:
      "Datele măsurării fără cookie: cât timp ne ajută să comparăm perioadele între ele, apoi le ștergem. Adresa IP nu se salvează în ele.",
    cookie:
      "Măsurarea vizitelor, fără cookie. În afara celor din tabel, site-ul are o aplicație proprie de statistică, instalată pe un server administrat de noi. Ea nu scrie niciun cookie și nimic în stocarea locală a browserului, de aceea nu apare în tabel; din stocarea locală citește doar un marcaj prin care vă puteți exclude singur de la măsurare, dacă l-ați pus dumneavoastră. Nu pornește dacă browserul trimite semnalul „Do Not Track”, iar alegerea din banner nu o schimbă. Măsoară paginile citite, pagina de pe care ați venit, limba, dimensiunea ecranului, tipul de browser, de sistem și de dispozitiv și locul aproximativ, fără nume sau adresă de e-mail; adresa IP nu se salvează în datele măsurării. Datele rămân pe serverul nostru, nu se transmit unui furnizor de analiză și nu se folosesc pentru publicitate.",
  };
}

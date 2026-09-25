// Actele normative si standardele citate de documentele scrise de felia `juridic`, fiecare cu
// adresa de la care a fost CITIT si cu data citirii. Regula planului (§8, "date factuale"): o
// valoare juridica se publica numai verificata la sursa primara, cu legatura langa ea, in date.
//
// CE S-A CITIT, 25.09.2026, si de unde:
//   - Regulamentul (UE) 2016/679, pe EUR-Lex, textul in romana: art. 4 pct. 1, 2, 7, 8 si 12,
//     art. 28 alin. (2)-(4), art. 32 alin. (1), art. 33 alin. (2)-(3), art. 77 alin. (1) si art. 82;
//   - Legea nr. 365/2002 (republicata), Legea nr. 190/2018 si Legea nr. 506/2004, in textele
//     publicate de ANSPDCP pe dataprotection.ro. Portalul legislativ al Ministerului Justitiei
//     (legislatie.just.ro) a inchis conexiunea la fiecare incercare din statia de lucru si din
//     unealta de citire, deci forma consolidata de acolo e NEMASURATA; se reia in ziua operatorului
//     (docs/ziua-operatorului.md);
//   - Legea nr. 195/2024 a Republicii Moldova: titlul, din pagina legii de pe justice.gov.md, si
//     data intrarii in vigoare, din prezentarea publicata de CNPDCP pe datepersonale.md (la adresa
//     de mai jos sta prezentarea, nu textul legii); portalul legis.md cere o verificare anti-robot,
//     deci textul articolelor nu a fost citit de aici. De aceea nicio pagina nu trimite la ea ca la
//     textul legii, iar regulile publice spun ce se afla la adresa;
//   - WCAG 2.2, recomandarea W3C din 12 decembrie 2024: criteriile 1.4.3, 1.4.4, 1.4.10, 2.4.1, 2.4.7.
//
// Textele juridice ale feliei 44 (confidentialitate, cookie-uri) isi au sursele in comentariile
// lor; nu sunt re-citite aici.

export type ActCitat = {
  /** Denumirea oficiala, cum apare in sursa. */
  titlu: string;
  /** Forma scurta, pentru citare in text. */
  scurt: string;
  /** Adresa de la care a fost citit. */
  adresa: string;
  /** Cine publica textul la adresa de mai sus. */
  publicat: string;
  /** Data citirii, ISO. */
  citit: string;
  /**
   * Ce s-a citit la adresa, spus cititorului, inaintea datei: "text citit pe" cand acolo e textul
   * actului; altfel ce se afla de fapt acolo. O legatura nu promite mai mult decat a fost citit.
   */
  citire: string;
};

export const ACTE = {
  gdpr: {
    titlu:
      "Regulamentul (UE) 2016/679 al Parlamentului European și al Consiliului din 27 aprilie 2016 privind protecția persoanelor fizice în ceea ce privește prelucrarea datelor cu caracter personal și privind libera circulație a acestor date",
    scurt: "Regulamentul (UE) 2016/679 (GDPR)",
    adresa: "https://eur-lex.europa.eu/legal-content/RO/TXT/HTML/?uri=CELEX:32016R0679",
    publicat: "EUR-Lex, Oficiul pentru Publicații al Uniunii Europene",
    citit: "2026-09-25",
    citire: "text citit pe",
  },
  legea190: {
    titlu:
      "Legea nr. 190/2018 privind măsuri de punere în aplicare a Regulamentului (UE) 2016/679 (Regulamentul general privind protecția datelor)",
    scurt: "Legea nr. 190/2018",
    adresa: "https://www.dataprotection.ro/servlet/ViewDocument?id=1520",
    publicat: "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal",
    citit: "2026-09-25",
    citire: "text citit pe",
  },
  legea506: {
    titlu:
      "Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal și protecția vieții private în sectorul comunicațiilor electronice",
    scurt: "Legea nr. 506/2004",
    adresa: "https://www.dataprotection.ro/servlet/ViewDocument?id=859",
    publicat: "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal",
    citit: "2026-09-25",
    citire: "text citit pe",
  },
  legea365: {
    titlu: "Legea nr. 365/2002 privind comerțul electronic, republicată",
    scurt: "Legea nr. 365/2002",
    adresa: "https://www.dataprotection.ro/servlet/ViewDocument?id=453",
    publicat: "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal",
    citit: "2026-09-25",
    citire: "text citit pe",
  },
  legea195md: {
    titlu: "Legea nr. 195/2024 privind protecția datelor cu caracter personal (Republica Moldova), în vigoare din 23 august 2026",
    scurt: "Legea nr. 195/2024 a Republicii Moldova",
    adresa: "https://datepersonale.md/wp-content/uploads/2026/03/Legea-nr.1952024.pdf",
    publicat: "Centrul Național pentru Protecția Datelor cu Caracter Personal",
    citit: "2026-09-25",
    // La adresa sta o prezentare a legii facuta de autoritate, nu textul ei; pagina spune asta.
    citire: "prezentarea legii făcută de autoritatea moldoveană, citită pe",
  },
  wcag22: {
    titlu: "Web Content Accessibility Guidelines (WCAG) 2.2, recomandarea W3C din 12 decembrie 2024",
    scurt: "WCAG 2.2",
    adresa: "https://www.w3.org/TR/WCAG22/",
    publicat: "World Wide Web Consortium (W3C)",
    citit: "2026-09-25",
    citire: "text citit pe",
  },
} as const satisfies Record<string, ActCitat>;

export type CheieAct = keyof typeof ACTE;

/** Legatura in marcajul textelor juridice: `[forma scurta](adresa)`. */
export function legaturaAct(cheie: CheieAct, text: string = ACTE[cheie].scurt): string {
  return "[" + text + "](" + ACTE[cheie].adresa + ")";
}

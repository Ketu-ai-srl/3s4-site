// Sursele PRIMARE ale datelor de pe /e-facturare si din calendarul `/instrumente/termene.ics`.
//
// Regula feliei: fiecare valoare factuala (termen, obligatie, format) sta langa sursa ei oficiala,
// deschisa si citita la data din `DATA_VERIFICARII`. O tara sau o valoare pe care nu am putut-o
// deschide la sursa oficiala NU se publica (Italia si Spania lipsesc din tabel din motivul asta;
// motivul e scris in `TARI_NEVERIFICATE`). Tot din motivul asta pagina nu da cifra termenului de
// transmitere in RO e-Factura: textul actului (OUG 120/2021 art. 10 alin. (7), modificat prin
// OUG 89/2025) nu s-a putut deschide pe portalul legislativ, iar materialul informativ ANAF din
// ianuarie 2026 nu spune daca forma lui e si azi in vigoare. Pagina scrie "termenul legal de
// transmitere" si trimite la materialul ANAF (`roTermen`); afirmatia ramane neconfirmata.
//
// Ce s-a citit din fiecare sursa e trecut in campul `ce`, ca un cititor sa poata reface verificarea
// fara sa ghiceasca pagina sau capitolul.

export type Sursa = {
  id: string;
  /** Numele scurt de langa valoare, in tabel. */
  eticheta: string;
  /** Autoritatea care publica documentul. */
  autoritate: string;
  /** Numele documentului, asa cum il publica autoritatea. */
  titlu: string;
  url: string;
  /** Ce anume s-a verificat in document (capitol, intrebare, articol). */
  ce: string;
};

/** Ziua in care datele au fost deschise si citite la sursa. */
export const DATA_VERIFICARII = "2026-09-25";

export const SURSE = {
  roGhid: {
    id: "ro-ghid-efactura",
    eticheta: "ANAF, e-Factura",
    autoritate: "ANAF",
    titlu: "Ghid privind utilizarea sistemului național RO e-Factura",
    url: "https://static.anaf.ro/static/10/Anaf/AsistentaContribuabili_r/Ghid_RO_eFactura.pdf",
    ce: "ghid publicat în decembrie 2023: cap. I (etapele din 1 ianuarie și 1 iulie 2024), cap. III pct. 5 (60 de zile de descărcare), cap. IV (EN 16931 și RO_CIUS).",
  },
  roTermen: {
    id: "ro-anaf-oug-89-2025",
    eticheta: "ANAF, termenul",
    autoritate: "ANAF (DGRFP Brașov, material informativ)",
    titlu: "Modificări aduse OUG nr. 120/2021 de OUG 89/2025",
    url: "https://static.anaf.ro/static/10/Brasov/Brasov/facturare_electronica_89.pdf",
    ce: "pct. 2: art. 10 alin. (7) din OUG 120/2021, forma de dinainte și de după OUG 89/2025 (Monitorul Oficial nr. 1203 din 24.12.2025) și ziua de la care se aplică; material redactat pe 8 ianuarie 2026.",
  },
  roSaft: {
    id: "ro-ghid-d406",
    eticheta: "ANAF, ghidul D406",
    autoritate: "ANAF",
    titlu: "Ghidul declarației informative D406 (SAF-T)",
    url: "https://static.anaf.ro/static/10/Anaf/Informatii_R/SAF_T_Ghidul_D406_1712021.pdf",
    ce: "datele de referință pe categorii de contribuabili (1 ianuarie 2022, 2023, 2025) și termenul de depunere: ultima zi calendaristică a lunii următoare perioadei de raportare",
  },
  ueVida: {
    id: "ue-directiva-2025-516",
    eticheta: "EUR-Lex",
    autoritate: "EUR-Lex, Jurnalul Oficial al UE",
    titlu: "Directiva (UE) 2025/516 a Consiliului din 11 martie 2025 (TVA în era digitală)",
    url: "https://eur-lex.europa.eu/legal-content/RO/TXT/?uri=CELEX:32025L0516",
    ce: "art. 6 alin. (5): dispozițiile art. 5 (modificările Directivei 2006/112/CE privind facturarea electronică și raportarea digitală) se aplică de la 1 iulie 2030; standardul european EN 16931",
  },
  de: {
    id: "de-bmf-e-rechnung",
    eticheta: "BMF",
    autoritate: "Bundesministerium der Finanzen",
    titlu: "Fragen und Antworten zur Einführung der obligatorischen E-Rechnung (stand martie 2026)",
    url: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
    ce: "definiția e-facturii, formatele admise și întrebarea 11 (tranziția): primirea din 1 ianuarie 2025, tranziția până la 31 decembrie 2026, respectiv finalul lui 2027 la cel mult 800.000 EUR cifră de afaceri; XRechnung și ZUGFeRD de la 2.0.1",
  },
  fr: {
    id: "fr-dgfip-guide-pratique",
    eticheta: "DGFiP",
    autoritate: "Direction générale des Finances publiques (impots.gouv.fr)",
    titlu: "Guide pratique pour accompagner la mise en œuvre de la réforme de la facturation électronique",
    url: "https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/guide_pratique_facturation_electronique.pdf",
    ce: "primirea pentru toate firmele vizate și emiterea pentru firmele mari și intermediare de la 1 septembrie 2026; emiterea pentru IMM-uri și microîntreprinderi de la 1 septembrie 2027; platformele agreate",
  },
  pl: {
    id: "pl-ksef-terminy",
    eticheta: "Ministerstwo Finansów",
    autoritate: "Ministerstwo Finansów (podatki.gov.pl)",
    titlu: "Podstawy prawne oraz kluczowe terminy KSeF",
    url: "https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy",
    ce: "1 februarie 2026 pentru vânzări de peste 200 mil. PLN în 2024; 1 aprilie 2026 pentru ceilalți; facilitățile valabile până la finalul lui 2026; structura FA(3)",
  },
  be: {
    id: "be-efacture-obligation",
    eticheta: "SPF BOSA",
    autoritate: "SPF Stratégie et Appui (efacture.belgium.be)",
    titlu: "Les factures électroniques structurées entre entreprises sont obligatoires depuis 2026",
    url: "https://efacture.belgium.be/fr/article/les-factures-electroniques-structurees-entre-entreprises-sont-obligatoires-depuis-2026",
    ce: "obligația din 1 ianuarie 2026 pentru firmele belgiene plătitoare de TVA; transmiterea prin rețeaua Peppol; PDF-ul pe e-mail nu mai este suficient",
  },
  beToleranta: {
    id: "be-efacture-tolerance",
    eticheta: "SPF BOSA, toleranța",
    autoritate: "SPF Stratégie et Appui (efacture.belgium.be)",
    titlu: "Fin de la période de tolérance pour l’e-facturation (7 aprilie 2026)",
    url: "https://efacture.belgium.be/fr/news/fin-de-la-periode-de-tolerance-pour-le-facturation",
    ce: "toleranța generală din primele trei luni ale lui 2026 s-a încheiat; toleranța pentru autofacturare rămâne până la 30 iunie 2026 inclusiv",
  },
} satisfies Record<string, Sursa>;

export type CheieSursa = keyof typeof SURSE;

/**
 * Tarile din tabelul referintei vizuale pe care NU le publicam, cu motivul. Intra si in raportul
 * feliei, ca `nemasurat`.
 */
export const TARI_NEVERIFICATE: { tara: string; motiv: string }[] = [
  {
    tara: "Italia",
    motiv: "sursa oficială (Agenzia delle Entrate) nu a putut fi citită în sesiunea de verificare pe capitolul obligației B2B",
  },
  {
    tara: "Spania",
    motiv: "calendarul oficial (Agencia Tributaria) nu a putut fi citit în sesiunea de verificare",
  },
];

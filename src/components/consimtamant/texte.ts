// Textele bannerului de consimtamant si ale panoului de setari (forma masurata a sursei:
// `componente-globale.md` §7, in depozitul fabricii). Rolul si lungimea fiecarui rand sunt ale
// sursei; cuvintele sunt ale noastre. Doua lucruri NU se copiaza: textele in engleza de pe pagina
// romaneasca si categoriile ne-esentiale bifate implicit (la sursa, risc GDPR).
//
// Ce spune primul strat, si de ce (Legea 506/2004 art. 4 alin. (5) lit. b): informarea vine
// INAINTEA acordului, deci titlul si descrierea numesc scopul (statistica) si furnizorul (Google
// Analytics), iar descrierea spune si ca acordul se retrage oricand, si de unde (GDPR art. 7
// alin. (3), ultima teza: despre retragere omul afla INAINTE sa accepte, nu din politica). Refuzul e
// un buton pe acelasi rand cu acceptul, de aceeasi marime (GDPR art. 7 alin. (3); raportul EDPB al
// grupului pentru bannere, 17.01.2023, pct. 8 si 14).
//
// Adresarea e cea a site-ului: persoana a II-a singular (decizia D15). Butoanele vorbesc cu vocea
// vizitatorului ("Accept tot"), ca in fixtura portii C-01.

export const TEXTE_BANNER = {
  // Rol: titlul bannerului (16,8/600). Lungime la sursa: 14.
  titlu: "Cookie-uri de statistică",
  // Rol: descrierea (14,4/400, doua randuri la 1440). Lungime la sursa: 79. A noastra e mai lunga cu
  // fraza despre retragere, ceruta de lege in primul strat: la 1440 ramane pe doua randuri, la 390
  // trece pe trei (sursa: doua), deci bannerul de telefon e cu un rand mai inalt (masurat 25.09.2026).
  descriere:
    "Cu acordul tău, măsurăm vizitele cu Google Analytics. Îl poți retrage oricând, din subsolul oricărei pagini.",
  accept: "Accept tot",
  refuz: "Refuz tot",
  setari: "Setări cookie-uri",
  // Piciorul bannerului: cele doua politici (12,8/600).
  politicaConfidentialitate: "Politica de confidențialitate",
  politicaCookie: "Politica de cookie-uri",
} as const;

export const TEXTE_PANOU = {
  titlu: "Setări cookie-uri",
  inchide: "Închide setările",
  // Rol: sectiunea de introducere (titlu 15/600 + paragraf).
  optiuniTitlu: "Opțiunile tale",
  optiuniText:
    "Alege ce cookie-uri permiți pe acest site. Alegerea se poate schimba oricând, din subsolul oricărei pagini.",
  necesareTitlu: "Strict necesare",
  necesareInsigna: "Mereu active",
  necesareText:
    "Țin minte alegerea făcută aici. Fără ele, bannerul ar apărea din nou pe fiecare pagină. Nu se trimit nicăieri.",
  statisticaTitlu: "Statistică",
  statisticaText:
    "Google Analytics 4 măsoară vizitele și paginile citite. Se încarcă numai dacă permiți, iar datele pot ajunge în Statele Unite.",
  // Capetele tabelului de cookie-uri din fiecare categorie.
  coloanaNume: "Nume",
  coloanaDurata: "Durată",
  coloanaScop: "Scop",
  // Rol: blocul de la final (titlu + o fraza cu legaturile).
  informatiiTitlu: "Mai multe informații",
  informatiiText: "Furnizorii, țara fiecăruia și drepturile tale sunt descrise în",
  informatiiLegatura: "politica de cookie-uri",
  informatiiSi: "și în",
  informatiiLegatura2: "politica de confidențialitate",
  salveaza: "Salvează setările",
} as const;

/** Insigna categoriei cu servicii: "1 serviciu", "2 servicii" (acordul in romana). */
export function insignaServicii(cate: number): string {
  return cate === 1 ? "1 serviciu" : cate + " servicii";
}

// Textul legaturii din subsol ("Setari cookie-uri") sta in `semnal.ts`, nu aici: modulul asta e al
// bannerului si nu trebuie sa ajunga in bucata comuna a layout-ului.

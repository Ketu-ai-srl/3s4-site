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

import { ALEGERE_PANOU, serviciiStatistica, type RandPanou, type ServiciuPanou } from "@/content/juridic/furnizori";

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

/** Insigna categoriei cu servicii: "1 serviciu", "2 servicii" (acordul in romana); in engleza "1 service". */
export function insignaServicii(cate: number, limba: LimbaBanner = "ro"): string {
  if (limba === "en") return cate === 1 ? "1 service" : cate + " services";
  return cate === 1 ? "1 serviciu" : cate + " servicii";
}

// ---------------------------------------------------------------------------------------------
// SETURILE DE TEXTE, pe uneltele active si pe limba (masurarea S-B, decizia 13)
// ---------------------------------------------------------------------------------------------
//
// Sursa: politica de cookie-uri a lui 3s.md, documentul 03, sectiunea 6 (textele bannerului si ale panoului
// pentru varianta B), in romana si in engleza. Se schimba numai ce schimba sectiunea 6: titlul, descrierea si
// textul categoriei "Statistica". Etichetele butoanelor raman cele de azi ("Etichetele butoanelor raman"), ca
// politica sa le poata numi.
//
//   romana:  numai GA4 (setul de pana acum, neschimbat) | numai Umami | Umami si GA4
//   engleza: numai Umami | Umami si GA4
//
// Engleza cu GA4 FARA Umami nu are set: GA4 nu ruleaza pe 3s.md (decizia 26), iar site-ul romanesc e numai in
// romana, deci combinatia nu are pagina; un text juridic nevalidat nu se traduce. Ceruta, opreste construirea
// (`texteConsimtamant`), cu un mesaj care o numeste. Restul textelor din engleza (panoul, legaturile) sunt
// traducerea celor romanesti de mai sus; adresarea e "you", ca pe site-ul EN.

export type LimbaBanner = "ro" | "en";

export type TexteBanner = { [K in keyof typeof TEXTE_BANNER]: string };
export type TextePanou = { [K in keyof typeof TEXTE_PANOU]: string };

/** Uneltele care ruleaza pe domeniu (aceeasi forma ca `UnelteActive` din furnizori). */
export type UnelteBanner = { ga4: boolean; umami: boolean };

const BANNER_RO_UMAMI: TexteBanner = {
  ...TEXTE_BANNER,
  titlu: "Măsurarea vizitelor",
  // A doua propozitie numeste acordul: pronumele singur trimitea la un complement din propozitia dinainte.
  descriere:
    "Cu acordul tău, măsurăm vizitele cu o aplicație proprie de statistică, fără cookie-uri. Acordul îl poți retrage oricând, din subsolul oricărei pagini.",
};

const BANNER_RO_UMAMI_GA4: TexteBanner = {
  ...TEXTE_BANNER,
  titlu: "Statistică",
  descriere:
    "Cu acordul tău, măsurăm vizitele cu o aplicație proprie de statistică și cu Google Analytics, care pune cookie-uri. Îl poți retrage oricând, din subsolul oricărei pagini.",
};

const STATISTICA_RO_UMAMI =
  "Aplicația noastră de statistică măsoară vizitele și paginile citite, fără cookie-uri. Se încarcă numai dacă permiți.";

// Fara GA4 nicio categorie nu pune cookie-uri (alegerea sta in stocarea locala, statistica proprie e fara cookie-uri),
// deci introducerea nu cere sa alegi "cookie-uri". Setul romanesc cu GA4 pastreaza textul de baza: acolo GA4 pune cookie-uri.
const OPTIUNI_RO_FARA_COOKIEURI = "Alege ce permiți pe acest site. Alegerea se poate schimba oricând, din subsolul oricărei pagini.";

const PANOU_RO_UMAMI: TextePanou = { ...TEXTE_PANOU, optiuniText: OPTIUNI_RO_FARA_COOKIEURI, statisticaText: STATISTICA_RO_UMAMI };

const PANOU_RO_UMAMI_GA4: TextePanou = {
  ...TEXTE_PANOU,
  statisticaText: STATISTICA_RO_UMAMI + " Google Analytics 4 pune cookie-uri, iar datele pot ajunge în Statele Unite.",
};

const BANNER_EN_BAZA: TexteBanner = {
  titlu: "Measuring visits",
  descriere:
    "With your consent, we measure visits with our own analytics tool, which uses no cookies. You can withdraw consent at any time from the footer of any page.",
  accept: "Accept all",
  refuz: "Reject all",
  setari: "Cookie settings",
  politicaConfidentialitate: "Privacy policy",
  politicaCookie: "Cookie policy",
};

const BANNER_EN_UMAMI_GA4: TexteBanner = {
  ...BANNER_EN_BAZA,
  titlu: "Statistics",
  descriere:
    "With your consent, we measure visits with our own analytics tool and with Google Analytics, which sets cookies. You can withdraw consent at any time from the footer of any page.",
};

const STATISTICA_EN_UMAMI = "Our own analytics tool measures visits and the pages read, without cookies. It loads only if you allow it.";

const PANOU_EN_UMAMI: TextePanou = {
  titlu: "Cookie settings",
  inchide: "Close settings",
  optiuniTitlu: "Your options",
  optiuniText: "Choose what you allow on this site. You can change your mind later, from the footer of any page.",
  necesareTitlu: "Strictly necessary",
  necesareInsigna: "Always active",
  necesareText: "They remember the choice you make here. Without them, the banner would appear again on every page. They are not sent anywhere.",
  statisticaTitlu: "Statistics",
  statisticaText: STATISTICA_EN_UMAMI,
  coloanaNume: "Name",
  coloanaDurata: "Duration",
  coloanaScop: "Purpose",
  informatiiTitlu: "More information",
  // Numele documentelor, ca in subsol si in titluri: "Cookie policy", "Privacy policy".
  informatiiText: "Each provider, its country and your rights are described in the",
  informatiiLegatura: "Cookie policy",
  informatiiSi: "and in the",
  informatiiLegatura2: "Privacy policy",
  salveaza: "Save settings",
};

const PANOU_EN_UMAMI_GA4: TextePanou = {
  ...PANOU_EN_UMAMI,
  statisticaText: STATISTICA_EN_UMAMI + " Google Analytics 4 sets cookies, and data may reach the United States.",
};

/** Eticheta unei chei pe care site-ul numai o citeste (randul `umami.disabled` din panou). */
export const ETICHETA_NUMAI_CITIT: Readonly<Record<LimbaBanner, string>> = { ro: "numai citit", en: "read only" };

/** Mesajul opririi pe combinatia fara set: engleza cu GA4 si fara Umami. */
export const MESAJ_EN_FARA_UMAMI =
  "bannerul de consimtamant in engleza are texte numai pentru Umami si pentru Umami cu GA4: combinatia engleza + GA4 fara Umami " +
  "nu are pagina (GA4 nu ruleaza pe 3s.md, decizia 26; site-ul RO are o singura limba, RO) si nu se traduce un text juridic nevalidat. " +
  "Domeniul se construieste fara NEXT_PUBLIC_GA4_ID sau cu UMAMI_URL si UMAMI_WEBSITE_ID";

/**
 * Textele bannerului si ale panoului pentru uneltele care ruleaza si pentru limba paginii. Opreste construirea
 * pe engleza cu GA4 fara Umami (fara set) si pe "nicio unealta" (fara banner nu se cer texte).
 */
export function texteConsimtamant(limba: LimbaBanner, unelte: UnelteBanner): { banner: TexteBanner; panou: TextePanou } {
  if (!unelte.ga4 && !unelte.umami) {
    throw new Error("texteConsimtamant: nicio unealta de masurare activa, deci niciun banner de scris");
  }
  if (limba === "ro") {
    if (!unelte.umami) return { banner: TEXTE_BANNER, panou: TEXTE_PANOU };
    return unelte.ga4 ? { banner: BANNER_RO_UMAMI_GA4, panou: PANOU_RO_UMAMI_GA4 } : { banner: BANNER_RO_UMAMI, panou: PANOU_RO_UMAMI };
  }
  if (!unelte.umami) {
    throw new Error(MESAJ_EN_FARA_UMAMI);
  }
  return unelte.ga4 ? { banner: BANNER_EN_UMAMI_GA4, panou: PANOU_EN_UMAMI_GA4 } : { banner: BANNER_EN_BAZA, panou: PANOU_EN_UMAMI };
}

// Textul legaturii din subsol ("Setari cookie-uri") sta in `semnal.ts`, nu aici: modulul asta e al
// bannerului si nu trebuie sa ajunga in bucata comuna a layout-ului.

/**
 * Tot ce arata bannerul si panoul, rezolvat pe server pentru uneltele care ruleaza si pentru limba paginii:
 * textele, randul alegerii (strict necesare), serviciile de statistica active cu randurile lor, insigna si
 * eticheta "numai citit". Componenta de browser primeste rezultatul, nu seturile: in bucata bannerului nu ajung
 * textele altei limbi sau ale altei stari.
 */
export type InformareConsimtamant = {
  limba: LimbaBanner;
  banner: TexteBanner;
  panou: TextePanou;
  alegere: RandPanou;
  statistica: ServiciuPanou[];
  insigna: string;
  numaiCitit: string;
};

export function informareConsimtamant(limba: LimbaBanner, unelte: UnelteBanner): InformareConsimtamant {
  const { banner, panou } = texteConsimtamant(limba, unelte);
  const statistica = serviciiStatistica(unelte, limba);
  return {
    limba,
    banner,
    panou,
    alegere: ALEGERE_PANOU[limba],
    statistica,
    insigna: insignaServicii(statistica.length, limba),
    numaiCitit: ETICHETA_NUMAI_CITIT[limba],
  };
}

// ---------------------------------------------------------------------------------------------
// ADRESAREA "TU" IN CELULELE PANOULUI (romana de pe 3s.md, decizia 35)
// ---------------------------------------------------------------------------------------------
//
// Textele panoului sunt la "tu", dar celulele "Scop" ale tabelelor vin din catalogul furnizorilor
// (`src/content/juridic/furnizori.ts`), scris la persoana a II-a plural de politete, ca documentele juridice din care e citit. In acelasi
// dialog se amestecau doua registre. Catalogul ramane neatins (il citesc si documentele juridice); dialogul primeste
// formularile lui numai acolo unde registrul difera. Restul celulelor (fara adresare) raman cele din catalog.
//
// O formulare la "tu" e scrisa pentru UN text al catalogului si se aplica numai pe el: perechea poarta numele cheii si
// amprenta textului-sursa EXACT, iar inlocuirea cere ambele. Daca scopul se schimba in catalog, versiunea de catalog se
// schimba (`versiune.ts`) si bannerul intreaba din nou; formularea veche nu mai acopera textul nou, deci dialogul arata
// scopul declarat, din catalog, nu parafraza celui vechi. Atunci proba (tests/pagini-globale.test.ts) se inroseste pe
// registru si pe perechea ramasa fara sursa, pana se scrie formularea noua. Perechea poarta amprenta, nu textul-sursa:
// sursa e la registrul de politete, iar fisierele din afara juridicului nu il poarta deloc (tests/limba.test.ts).
//
// Se aplica pe domeniul cu mai multe limbi (`PunctConsimtamant`), unde versiunea textului se calculeaza din informarea
// randata. Site-ul romanesc pastreaza informarea de azi: versiunea lui (dovada textului din evidenta,
// `src/lib/analitica.ts`) se calculeaza din celulele catalogului, deci o celula schimbata numai in dialog ar lasa
// evidenta sa numeasca alt text decat cel aratat.

/**
 * Amprenta textului-sursa al unei celule (FNV-1a pe 32 de biti, 8 cifre hexazecimale, ca amprentele din
 * `src/lib/analitica.ts`). E scrisa aici, nu importata de acolo: analitica importa modulul asta, iar un import invers
 * ar face un ciclu. Nu e criptografie: o eticheta care se schimba cand se schimba textul.
 */
export function amprentaScop(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** O formulare la "tu" a celulei "Scop": cheia, amprenta textului din catalog pentru care e scrisa si formularea. */
export type ScopLaTu = { readonly nume: string; readonly amprentaSursa: string; readonly laTu: string };

/** Formularile la "tu": alegerea din banner si cheia de excludere a analiticii proprii. */
export const SCOP_LA_TU: readonly ScopLaTu[] = [
  {
    nume: ALEGERE_PANOU.ro.nume,
    amprentaSursa: "414fde7e",
    laTu: "Ține minte ce ai ales în bannerul de cookie-uri, ca să nu te întrebăm la fiecare pagină.",
  },
  {
    nume: "umami.disabled",
    amprentaSursa: "40d23d88",
    laTu: "Dacă l-ai pus tu în browser, măsurarea te exclude.",
  },
];

/** Formularea la "tu" pentru o celula, numai daca a fost scrisa pentru exact textul ei din catalog. */
export function formulareLaTu(r: RandPanou): ScopLaTu | undefined {
  const sursa = amprentaScop(r.scop);
  return SCOP_LA_TU.find((p) => p.nume === r.nume && p.amprentaSursa === sursa);
}

const laTu = (r: RandPanou): RandPanou => {
  const p = formulareLaTu(r);
  return p === undefined ? r : { ...r, scop: p.laTu };
};

/** Informarea in romana cu celulele panoului la "tu"; in engleza (si in afara tabelului) neschimbata. */
export function informareLaTu(informare: InformareConsimtamant): InformareConsimtamant {
  if (informare.limba !== "ro") return informare;
  return {
    ...informare,
    alegere: laTu(informare.alegere),
    statistica: informare.statistica.map((f) => ({ ...f, randuri: f.randuri.map(laTu) })),
  };
}

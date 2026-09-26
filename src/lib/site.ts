// Adresa publica a site-ului, din mediu: `SITE_URL`, cu implicitul de azi (`ADRESA_BAZA` din
// `src/content/rute.ts`, adica mediul de proba). Din ea se compun canonical-urile (prin
// `metadataBase` din layout), harta de site, `robots.txt`, `/llms.txt`, imaginea sociala si
// datele structurate. La lansare, `SITE_URL` devine domeniul real (planul valului S4, §8.1) si
// toate acestea se muta impreuna, fara nicio alta modificare de cod.
//
// Se citeste la CONSTRUIRE: paginile sunt statice, deci o variabila schimbata fara build nou nu
// schimba nimic. Pasul e scris in `docs/ziua-operatorului.md`.
//
// O VALOARE GRESITA OPRESTE CONSTRUIREA. O adresa cu cale, cu parametri sau pe `http` ar produce
// canonical-uri care arata in alta parte decat pagina, iar asta scoate site-ul din index fara ca
// vreun ecran sa se schimbe. Mai bine un build rosu decat un index gol.
//
// RAMANE IN AFARA (de stiut): `FirPagina` (piesa inghetata a fundatiei) compune adresele firului
// direct din `ADRESA_BAZA`. Cat timp `SITE_URL` lipseste, cele doua coincid; la lansare,
// `FirPagina` trebuie trecuta pe `adresaSite()` - pas scris in `docs/ziua-operatorului.md`.

import { ADRESA_BAZA } from "@/content/rute";

/** Originea site-ului (`https://gazda`, fara bara la final). Arunca pe o valoare nevalida. */
export function adresaSite(valoare: string | undefined = process.env.SITE_URL): string {
  const brut = (valoare ?? "").trim();
  if (brut === "") {
    return new URL(ADRESA_BAZA).origin;
  }
  let adresa: URL;
  try {
    adresa = new URL(brut);
  } catch {
    throw new Error('SITE_URL nu e o adresa web: "' + brut + '"');
  }
  if (adresa.protocol !== "https:") {
    throw new Error('SITE_URL trebuie sa inceapa cu https:// , nu "' + brut + '"');
  }
  const doarOrigine =
    (adresa.pathname === "/" || adresa.pathname === "") &&
    adresa.search === "" &&
    adresa.hash === "" &&
    adresa.username === "" &&
    adresa.password === "";
  if (!doarOrigine) {
    throw new Error('SITE_URL trebuie sa fie doar originea (https://gazda), fara cale sau parametri: "' + brut + '"');
  }
  return adresa.origin;
}

/** Adresa absoluta a unei cai de pe site. `cale` incepe cu `/`. */
export function urlAbsolut(cale: string, baza: string = adresaSite()): string {
  return new URL(cale, baza + "/").toString();
}

// Textul lui `robots.txt`, generat din `config/seo.json` (planul valului S4, §8.3; E5 D4 si pasul 24).
//
// PE STAGING (orice mediu care nu e productia) se interzice tot, exact ca pana acum: mediul de proba
// ar concura cu productia pe aceleasi cuvinte, iar o variabila uitata trebuie sa lase site-ul IN
// AFARA indexului. Fara semnal de continut si fara harta: un fisier care interzice tot si anunta
// totusi lista paginilor se contrazice singur.
//
// IN PRODUCTIE: toti robotii sunt primiti (grupul `*`), cu linia `Content-Signal` in acelasi grup,
// cum o scrie politica Content Signals; robotii din `roboti_blocati` primesc un grup propriu cu
// `Disallow: /`. Robotii permisi nu se mai enumera: un robot care isi gaseste grupul propriu nu mai
// citeste grupul `*` (RFC 9309, §2.2.1), deci un grup propriu i-ar scoate de sub semnalul de
// continut. Lista lor din configurare e pentru proba, care verifica fiecare robot cu un parser.

import configurare from "../../config/seo.json";

export type ConfigurareRoboti = {
  semnal_continut: Record<string, string>;
  roboti_permisi: string[];
  roboti_blocati: string[];
};

/** Linia `Content-Signal`, cu semnalele in ordinea din configurare. */
export function linieSemnal(semnal: Record<string, string>): string {
  return "Content-Signal: " + Object.entries(semnal).map(([k, v]) => k + "=" + v).join(", ");
}

export type IntrareRobots = {
  /** Productia deschide indexarea; orice alt mediu o inchide. */
  indexare: boolean;
  /** Originea site-ului, pentru adresa hartii. */
  adresa: string;
  configurare?: ConfigurareRoboti;
};

export function textRobots({ indexare, adresa, configurare: cfg = configurare }: IntrareRobots): string {
  if (!indexare) {
    return "User-Agent: *\nDisallow: /\n";
  }
  const linii = ["User-Agent: *", linieSemnal(cfg.semnal_continut), "Allow: /", ""];
  if (cfg.roboti_blocati.length > 0) {
    linii.push(...cfg.roboti_blocati.map((r) => "User-Agent: " + r), "Disallow: /", "");
  }
  linii.push("Sitemap: " + adresa + "/sitemap.xml");
  return linii.join("\n") + "\n";
}

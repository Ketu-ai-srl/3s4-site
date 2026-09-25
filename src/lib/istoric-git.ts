// Data ultimei modificari a unei pagini, citita din istoria git la CONSTRUIRE: sursa campului
// `lastmod` din harta de site (planul valului S4, §8.1; cercetarea seo-2026, §3.3 si G-21).
//
// DE CE DIN GIT SI NU `new Date()`. Google foloseste `lastmod` numai daca e "consecvent si verificabil
// exact"; o data pusa la fiecare build declara ca TOATE paginile s-au schimbat la fiecare livrare, iar
// atunci campul e ignorat oricum. Data commitului care a atins ultima oara sursele paginii e singura
// data reala pe care o avem.
//
// CE SUNT "SURSELE PAGINII": fisierul paginii plus modulele de continut (`@/content/...`) importate
// DIRECT de el - acelasi criteriu ca poarta de registru a rutelor. Componentele comune si layout-ul
// nu intra: o schimbare in subsol ar muta data TUTUROR paginilor, adica exact semnalul fals de mai sus.
//
// CAND NU SE POATE MASURA, CAMPUL LIPSESTE. Fara depozit git (imaginea Docker: `.dockerignore`
// exclude `.git`), fara binarul git, sau cu o clona superficiala (CI cu `fetch-depth: 1`, unde
// fiecare fisier ar primi data ultimului commit) nu se inventeaza nimic: `lastmod` pur si simplu
// nu se scrie. Pasul care il aduce si in productie e scris in `docs/ziua-operatorului.md`.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PAGINI = ["page.tsx", "page.ts", "page.mdx", "page.jsx", "page.js"];
const EXTENSII_CONTINUT = [".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];

function git(argumente: string[], radacina: string): string {
  return execFileSync("git", argumente, {
    cwd: radacina,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

const stareIstoric = new Map<string, boolean>();

/** Istoria e disponibila si completa: depozit git, clona nesuperficiala. */
export function istoricComplet(radacina: string = process.cwd()): boolean {
  const memorat = stareIstoric.get(radacina);
  if (memorat !== undefined) return memorat;
  let complet = false;
  try {
    complet =
      git(["rev-parse", "--is-inside-work-tree"], radacina) === "true" &&
      git(["rev-parse", "--is-shallow-repository"], radacina) === "false";
  } catch {
    complet = false;
  }
  stareIstoric.set(radacina, complet);
  return complet;
}

/** Fisierul paginii unei rute si modulele de continut importate direct de el (cai relative, cu `/`). */
export function surseleRutei(cale: string, radacina: string = process.cwd()): string[] {
  const director = cale === "/" ? "src/app" : "src/app" + cale;
  const pagina = PAGINI.map((p) => director + "/" + p).find((p) => existsSync(join(radacina, p)));
  if (pagina === undefined) return [];
  const text = readFileSync(join(radacina, pagina), "utf8");
  const surse = [pagina];
  for (const m of text.matchAll(/from\s+["']@\/content\/([^"']+)["']/g)) {
    const gasit = EXTENSII_CONTINUT.map((e) => "src/content/" + m[1] + e).find((f) => existsSync(join(radacina, f)));
    if (gasit !== undefined && !surse.includes(gasit)) surse.push(gasit);
  }
  return surse;
}

/** Momentul (ISO 8601) ultimului commit care a atins unul dintre fisiere, sau `null` cand nu se stie. */
export function dataUltimuluiCommit(fisiere: string[], radacina: string = process.cwd()): string | null {
  if (fisiere.length === 0 || !istoricComplet(radacina)) return null;
  try {
    const data = git(["log", "-1", "--format=%cI", "--", ...fisiere], radacina);
    return data === "" ? null : data;
  } catch {
    return null;
  }
}

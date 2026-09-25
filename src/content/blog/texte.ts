// Textele blogului (sablonele blog-L, blog-C si blog-articol): antete, cautare, pastile, carduri,
// caseta de fapte, sursele, caseta CTA si articolele inrudite. Scrise pentru 3S, pe rolul si lungimea
// masurate in fisele `blog.md` si `blog__articol-sablon.md`; nimic din textul referintei.
//
// Afirmatiile verificabile (sursele citate, raspunsul pe web si pe WhatsApp, pretul de 0 RON) au
// intrari in `src/content/afirmatii/blog.json`.

import { SUBSOL, CALE_INREGISTRARE, type Legatura } from "@/content/navigatie";
import type { CategorieBlog } from "./registru";

/** Legatura de navigatie cu ruta data, luata din subsol: acelasi text ca in restul site-ului. */
function dinSubsol(ruta: string): Legatura {
  for (const coloana of SUBSOL.coloane) {
    const gasita = coloana.legaturi.find((l) => l.ruta === ruta && l.href === ruta);
    if (gasita) return { text: gasita.text, href: gasita.href, ruta: gasita.ruta };
  }
  throw new Error("blog: ruta " + ruta + " nu e in subsol; textul legaturii se ia de acolo");
}

export type InfoCategorie = {
  /** Numele din pastile, din fir si din h1-ul paginii categoriei. */
  nume: string;
  /** Titlul paginii categoriei (15-65). */
  titluPagina: string;
  /** Descrierea paginii categoriei (50-160), si subtitlul ei. */
  descriere: string;
  /** Legatura secundara din caseta CTA a articolelor din categorie: pagina 3S cea mai apropiata. */
  legaturaCta: Legatura;
};

export const CATEGORII: Record<CategorieBlog, InfoCategorie> = {
  contabilitate: {
    // Rol: numele categoriei, 1-3 cuvinte.
    nume: "Contabilitate și fisc",
    titluPagina: "Contabilitate și fisc: articole pe blogul 3S",
    descriere:
      "Actele contabile și fiscale ale firmei: ce se păstrează, cât timp și cum le găsiți repede când le cere cineva.",
    legaturaCta: dinSubsol("/solutii/contabilitate"),
  },
  it: {
    nume: "Tehnologie",
    titluPagina: "Tehnologie: articole pe blogul 3S",
    descriere:
      "Scanarea cu text recunoscut, căutarea în documente după sens și păstrarea digitală a actelor, explicate pentru firme.",
    legaturaCta: dinSubsol("/platforma"),
  },
  juridic: {
    nume: "Legi și obligații",
    titluPagina: "Legi și obligații: articole pe blogul 3S",
    descriere:
      "Ce cer legile despre arhiva unei firme: registre, termene, predarea și distrugerea actelor, cu trimitere la textul oficial.",
    legaturaCta: dinSubsol("/solutii/avocatura"),
  },
  management: {
    nume: "Organizarea firmei",
    titluPagina: "Organizarea firmei: articole pe blogul 3S",
    descriere:
      "Cum puneți ordine în actele firmei: digitizarea hârtiei, arhivarea la un prestator și rutina care ține dosarele la zi.",
    legaturaCta: dinSubsol("/solutii"),
  },
};

export const LISTARE = {
  // Rol: titlul paginii (15-65).
  titluPagina: "Blog 3S: ghiduri practice pentru arhiva firmei",
  // Rol: descrierea paginii (50-160).
  descriere:
    "Articole despre termenele de păstrare, registrul arhivei, digitizare și căutarea în documente, fiecare cu sursele oficiale la final.",
  // Rol: nivelul curent din fir.
  fir: "Blog",
  // Rol: h1, ~36 de caractere [fisa].
  titlu: "Ghiduri practice pentru arhiva firmei",
  // Rol: subtitlul, ~87 de caractere [fisa].
  subtitlu: "Termene de păstrare, registre, digitizare și căutare, cu trimitere la sursele oficiale.",
  // Rol: eticheta accesibila a campului de cautare (la referinta lipseste).
  etichetaCautare: "Căutați în articolele blogului",
  // Rol: textul-exemplu din camp, 2-3 cuvinte [fisa].
  campExemplu: "Scrieți un subiect...",
  // Rol: eticheta listei de pastile, pentru cititoarele de ecran.
  etichetaPastile: "Categoriile blogului",
  // Rol: pastila care arata toate articolele.
  toate: "Toate articolele",
  // Rol: butonul care aduce inca 9 carduri.
  maiMulte: "Mai multe articole",
  // Rol: starea goala, ~9 cuvinte [fisa].
  gol: "Încercați alt cuvânt sau alegeți toate articolele.",
} as const;

export const CATEGORIE = {
  // Rol: eticheta mica de deasupra h1, un cuvant [fisa].
  eticheta: "Categorie",
} as const;

export const CARD = {
  // Rol: indemnul de la baza cardului.
  citeste: "Citiți articolul",
} as const;

export const ARTICOL = {
  // Rol: autorul din randul meta; mereu echipa, niciodata o persoana [fisa].
  autor: "Echipa 3S",
  // Rol: titlul casetei de fapte, 2 cuvinte, cu majuscule din stil [fisa].
  fapte: "De reținut",
  // Rol: titlul listei de surse de sub articol (adaos 3S: sursele din antet se arata).
  surse: "Sursele articolului",
  // Rol: titlul articolelor inrudite, 3 cuvinte [fisa].
  inrudite: "Alte articole utile",
  cta: {
    // Rol: supratitlul casetei, 3 cuvinte [fisa].
    supratitlu: "Arhiva cu 3S",
    // Rol: titlul casetei, ~5 cuvinte [fisa].
    titlu: "Găsiți actele firmei cu o întrebare",
    // Rol: textul casetei cand articolul nu-l da pe al lui (ultimul citat `**3S**` din corp).
    text:
      "Încărcați actele, iar 3S vă răspunde pe web sau pe WhatsApp cu documentul din care vine răspunsul. Contul costă 0 RON astăzi.",
    // Rol: butonul plin, scurt: incape pe un rand in 302 px la 390 (la referinta se rupe) [fisa].
    buton: { text: "Deschideți un cont", href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE } satisfies Legatura,
  },
} as const;

/** Numele lunilor, pentru date ca „25 septembrie 2026" (ziua fara zero, luna cu litera mica). */
export const LUNI = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
] as const;

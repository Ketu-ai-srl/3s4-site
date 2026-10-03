// Rutele editiei `ro-MD` (romana pentru Republica Moldova, sub `/ro`).
//
// Fisier GOL la fundatia editiilor: il umple felia al carei marcaj sta mai jos, NUMAI sub marcajul ei (aceeasi
// regula ca in `rute.ts`). Fiecare intrare are `editie: "ro-MD"`, `cheie` (`src/content/echivalente.ts`) si o
// cale care incepe cu `/ro`; pagina ei e un `page.romd.tsx` sub `src/app/(romd)/ro`. Portile de rute citesc
// fisierul ca text, pe editia `ro-MD`.
//
// GRUPUL JURIDIC (felia juridic-pagini-3s-md): documentele familiei `md` publicate la poarta curenta, cu adresa
// romaneasca din `config/juridic-rute.json`, numai cu operator numit din familia `md` (aceeasi regula ca
// `rute-en-juridic.ts`). Pagina e segmentul `src/app/(romd)/ro/juridic/[[...document]]/page.romd.tsx`; caile nu
// se scriu literal, din acelasi motiv ca acolo.
//
// GRUPUL ACASA SI CONTACT (felia ro-md-acasa-contact): pagina de start `/ro` si pagina de contact `/ro/contact`,
// cu textul in `src/content/ro-md/<modul>.ts`; `cheie` e cheia paginii peste editii (perechea ei EN e `/`,
// respectiv `/contact`). Titlul scurt e eticheta din meniu, descrierea e randul paginii din harta, cu Contact pe
// varianta de dinainte de P-40 (fara e-mail), ca la grupul nucleu EN.
import { caleMd, cheiPublicate } from "./juridic/md/registru";
import { DESCRIERE_MD, FAMILIE_JURIDICA, OPERATOR_NUMIT, SCURT_MD } from "./juridic/publicare";
import type { FamilieJuridica } from "./juridic/familie";
import type { RutaEditie } from "./rute";

/** Rutele juridice RO-MD: documentele `md` publicate la poarta curenta, numai cand familia publicata e `md`. */
export function ruteJuridiceRoMd(publicat: boolean = OPERATOR_NUMIT, familie: FamilieJuridica | null = FAMILIE_JURIDICA): RutaEditie<"ro-MD">[] {
  if (!publicat || familie !== "md") return [];
  return cheiPublicate().map((cheie) => ({
    cale: caleMd(cheie, "ro"),
    scurt: SCURT_MD[cheie].ro,
    descriere: DESCRIERE_MD[cheie].ro,
    inHarta: true,
    editie: "ro-MD",
    cheie,
  }));
}

export const RUTE_RO_MD: RutaEditie<"ro-MD">[] = [
  // <<felie:juridic-pagini-3s-md>>
  ...ruteJuridiceRoMd(),
  // <<felie:ro-md-acasa-contact>>
  {
    cale: "/ro",
    scurt: "Acasă",
    descriere: "Ce este 3S, pentru cine este potrivit și cum începe un pilot.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "home",
  },
  {
    cale: "/ro/contact",
    scurt: "Contact",
    descriere: "WhatsApp, mesaje și apeluri.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "contact",
  },
];

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
//
// GRUPUL OGLINDA (felia ro-md-oglinda, decizia 59: /ro oglindeste toate paginile EN): perechile /ro ale paginilor EN
// P02, P03, P08, P09, P11, G1, G2 si G3, cu `cheie` = cheia paginii EN pereche (`echivalente.ts`). Caile sunt slug-urile
// fiselor ro-md; pagina despre 3S e `/ro/securitate`, iar comparatia `/ro/comparatie-drive` (caile paginilor RO, ca
// adresele sa ramana aceleasi pe 3s.com.ro, decizia 55). Titlul scurt e eticheta din meniu, descrierea e randul
// paginii din harta.
import { caleMd, cheiPublicate } from "./juridic/md/registru";
import { CALE_JURIDIC_RO_MD, DESCRIERE_MD, FAMILIE_JURIDICA, INDEX_JURIDIC, OPERATOR_NUMIT, SCURT_MD } from "./juridic/publicare";
import type { FamilieJuridica } from "./juridic/familie";
import type { RutaEditie } from "./rute";

/** Rutele juridice RO-MD: documentele `md` publicate la poarta curenta si, la urma, indexul `/ro/juridic`, numai cu familia `md`. */
export function ruteJuridiceRoMd(publicat: boolean = OPERATOR_NUMIT, familie: FamilieJuridica | null = FAMILIE_JURIDICA): RutaEditie<"ro-MD">[] {
  if (!publicat || familie !== "md") return [];
  return [...documenteJuridiceRoMd(), ...indexJuridicRoMd(publicat, familie)];
}

/** Numai documentele `md` publicate la poarta curenta (fara index). */
function documenteJuridiceRoMd(): RutaEditie<"ro-MD">[] {
  return cheiPublicate().map((cheie) => ({
    cale: caleMd(cheie, "ro"),
    scurt: SCURT_MD[cheie].ro,
    descriere: DESCRIERE_MD[cheie].ro,
    inHarta: true,
    editie: "ro-MD",
    cheie,
  }));
}

/**
 * INDEXUL `/ro/juridic` (felia editie-juridic): aceeasi regula ca `indexJuridicEn` din `rute-en-juridic.ts` (numai cu
 * familia `md`, `inHarta: false` din acelasi motiv), cu titlul si descrierea indexului romanesc (`INDEX_JURIDIC`).
 */
export function indexJuridicRoMd(publicat: boolean = OPERATOR_NUMIT, familie: FamilieJuridica | null = FAMILIE_JURIDICA): RutaEditie<"ro-MD">[] {
  if (!publicat || familie !== "md") return [];
  return [
    {
      cale: CALE_JURIDIC_RO_MD,
      scurt: INDEX_JURIDIC.scurt,
      descriere: INDEX_JURIDIC.descriere,
      inHarta: false,
      editie: "ro-MD",
      cheie: "juridic",
    },
  ];
}

export const RUTE_RO_MD: RutaEditie<"ro-MD">[] = [
  // <<felie:juridic-pagini-3s-md>>
  ...ruteJuridiceRoMd(),
  // Blocul feliei ro-md-oglinda sta INAINTEA marcajului ro-md-acasa-contact: probele acelei felii citesc rutele de la
  // marcajul lor pana la sfarsitul listei, deci un bloc pus dupa el ar intra in asteptarile lor.
  // <<felie:ro-md-oglinda>>
  {
    cale: "/ro/platforma",
    scurt: "Platforma",
    descriere: "Cum ajung documentele în arhivă, cât timp sunt păstrate și cum primești răspunsuri cu sursa.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "platform",
  },
  {
    cale: "/ro/functionalitati/cautare-ai",
    scurt: "Căutare cu sursa citată",
    descriere: "Pui o întrebare despre documentele firmei și verifici sursa fiecărui răspuns.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "features-search",
  },
  {
    cale: "/ro/preturi",
    scurt: "Prețuri",
    descriere: "Pachetele Starter, Pro, Business și Enterprise, cu prețuri în euro, fără TVA.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "pricing",
  },
  {
    cale: "/ro/enterprise",
    scurt: "Enterprise",
    descriere: "Pachetul pentru organizațiile cu peste 20 de conturi de utilizator.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "enterprise",
  },
  {
    cale: "/ro/securitate",
    scurt: "Despre 3S și securitate",
    descriere: "Ce este 3S, unde sunt păstrate fișierele și ce prevăd legea SUA și GDPR.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "about",
  },
  {
    cale: "/ro/ghiduri/arhivare-e-facturi-ue",
    scurt: "Arhivarea e-facturilor în UE",
    descriere: "Termenul de păstrare și formatul e-facturilor, pe țări, cu surse primare și data verificării.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "guides-e-invoice-archiving-eu",
  },
  {
    cale: "/ro/ghiduri/termene-pastrare-moldova",
    scurt: "Termene de păstrare în Moldova",
    descriere: "Cât timp păstrezi facturile, registrele, statele de salarii, contractele și declarațiile în Moldova.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "guides-records-retention-moldova",
  },
  {
    cale: "/ro/comparatie-drive",
    scurt: "3S și Google Drive",
    descriere: "Comparația cu Google Drive, cu situațiile în care 3S nu este prima alegere.",
    inHarta: true,
    editie: "ro-MD",
    cheie: "compare-3s-vs-google-and-box",
  },
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

// Firul de pagina (breadcrumb): juridic__sablon.md §3, solutii__sablon.md S1.
// Legaturile 14/400 cerneala-2 (hover albastru, 0,15 s), chevron 16 cu contur 1,5 cerneala-3,
// nivelul curent 14/500 cerneala, fara legatura, cu `aria-current`. Se rupe pe randuri cand nu
// incape. Date structurate `BreadcrumbList` o singura data, aici, pe fiecare pagina care il are.
//
// Adresele din `BreadcrumbList` vin din `adresaSite()`, adica din `SITE_URL`, ca toate celelalte
// adrese absolute ale site-ului (felia seo-tehnic, auditul SEO D2). Pana atunci veneau direct din
// `ADRESA_BAZA`, deci la lansare firul ar fi ramas pe domeniul de proba.
//
// ASEZAREA (`src/lib/asezare.ts`): nivelurile poarta cai SURSA (ca legaturile lor, pe care `Tinta` le traduce), deci
// `item`-urile se traduc la emitere prin `adreseServite` (`src/components/seo/JsonLd.tsx`), aceeasi functie ca restul
// JSON-LD-ului. Fara ea, pe 3s.com.ro firul arata spre adresele sursa: `/ro/...` (redirect) pe paginile romanesti, iar
// pe cele englezesti `/pricing` (inexistenta) si startul romanesc in locul lui `/en`. Pe asezarea `md` graful iese
// exact cel de dinainte (acelasi obiect, deci acelasi text).
//
// SERIALIZAREA trece prin `serializeaza` (`src/components/seo/date-structurate.ts`), ca in `JsonLd.tsx`: `<` devine
// secventa de evadare unicode, deci un nume de nivel care contine `</script>` nu poate inchide eticheta. Pe datele de azi niciun nume nu
// are `<`, deci textul scris e acelasi ca al lui `JSON.stringify`.

import { adreseServite } from "@/components/seo/JsonLd";
import { serializeaza } from "@/components/seo/date-structurate";
import { adresaSite } from "@/lib/site";
import Tinta from "./Tinta";
import s from "./primitive.module.css";

export type NivelFir = {
  text: string;
  /** Calea nivelului. Ultimul nivel e pagina curenta si nu devine legatura. */
  cale: string;
};

export type FirPaginaProps = {
  niveluri: NivelFir[];
  aliniere?: "stanga" | "centru";
  /** Ascuns sub 600 px (pagina de inregistrare). */
  ascunsSub600?: boolean;
  className?: string;
  /** Eticheta accesibila a firului, in limba editiei (implicit cea romaneasca). */
  eticheta?: string;
};

function Chevron() {
  return (
    <svg className={s.firSeparator} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M6 4 L10 8 L6 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function dateFir(niveluri: NivelFir[], baza: string = adresaSite()) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: niveluri.map((n, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: n.text,
      item: new URL(n.cale, baza + "/").toString(),
    })),
  };
}

/**
 * `BreadcrumbList` cu adresele SERVITE (vezi antetul). `adreseServite` primeste un graf: firul intra ca singurul nod al
 * unui graf si iese de acolo, deci obiectul scris in pagina e acelasi ca al lui `dateFir` (pe `md`, chiar el).
 */
export function dateFirServite(niveluri: NivelFir[]) {
  return adreseServite({ "@context": "https://schema.org", "@graph": [dateFir(niveluri)] })["@graph"][0];
}

export default function FirPagina({
  niveluri,
  aliniere = "stanga",
  ascunsSub600 = false,
  className,
  eticheta = "Fir de navigare",
}: FirPaginaProps) {
  const clase = [s.fir, aliniere === "centru" ? s.firCentru : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <nav aria-label={eticheta} className={ascunsSub600 ? s.firAscunsMic : undefined}>
      <ol className={clase}>
        {niveluri.map((n, i) => {
          const ultim = i === niveluri.length - 1;
          return (
            <li key={n.cale + i} className={s.firElement}>
              {ultim ? (
                <span className={s.firCurent} aria-current="page">
                  {n.text}
                </span>
              ) : (
                <>
                  <Tinta legatura={{ text: n.text, href: n.cale, ruta: n.cale }} className={s.firLegatura}>
                    {n.text}
                  </Tinta>
                  <Chevron />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeaza(dateFirServite(niveluri)) }} />
    </nav>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/content/entitate";
import { RUTE, editiaRutei } from "@/content/rute";
import { EDITII } from "@/lib/editii";

// PAGINA DE NEGASIT a site-ului international (fundatia editiilor, `src/lib/editii.ts`). Pe build-ul cu `en`
// exista doua layout-uri radacina (`(en)` si `(romd)`) si niciunul la `src/app`, deci o adresa care nu se
// potriveste cu nicio ruta nu are layout: Next o serveste din fisierul asta (`experimental.globalNotFound`,
// pornit in `next.config.ts` numai pe profilul cu `en`). Pe build-ul romanesc fisierul nu e compilat.
//
// Drumurile propuse vin din `RUTE` (rutele `en` din harta), deci apar singure cand feliile de pagini le adauga;
// legatura spre romana apare numai cand editia `ro-MD` are index (`/ro`).

export const metadata: Metadata = {
  title: "Page not found | " + BRAND.nume,
  robots: { index: false, follow: false },
};

export default function NegasitGlobalEn() {
  const drumuri = RUTE.filter((r) => editiaRutei(r) === "en" && r.inHarta);
  const indexRoMd = RUTE.find((r) => editiaRutei(r) === "ro-MD" && r.cale === EDITII["ro-MD"].prefix);
  return (
    <html lang={EDITII.en.lang}>
      <body>
        <main>
          <h1>Page not found</h1>
          <p>The address you followed does not exist on this site.</p>
          {drumuri.length > 0 ? (
            <ul>
              {drumuri.map((r) => (
                <li key={r.cale}>
                  <Link href={r.cale}>{r.scurt}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          {indexRoMd !== undefined ? (
            <p>
              <Link href={indexRoMd.cale} hrefLang="ro-MD">
                {indexRoMd.scurt}
              </Link>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}

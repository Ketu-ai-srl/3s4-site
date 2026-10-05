import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Antet from "@/components/global/Antet";
import Subsol from "@/components/global/Subsol";
import { BRAND } from "@/content/entitate";
import { navigatieEn } from "@/content/navigatie-en";
import { RUTE, editiaRutei } from "@/content/rute";
import { atributeLimba } from "@/lib/asezare";
import { EDITII } from "@/lib/editii";
import { CLASE_FONTURI } from "@/lib/fonturi";

// PAGINA DE NEGASIT a site-ului international (fundatia editiilor, `src/lib/editii.ts`). Pe build-ul cu `en`
// exista doua layout-uri radacina (`(en)` si `(romd)`) si niciunul la `src/app`, deci o adresa care nu se
// potriveste cu nicio ruta nu are layout: Next o serveste din fisierul asta (`experimental.globalNotFound`,
// pornit in `next.config.ts` numai pe profilul cu `en`). Pe build-ul romanesc fisierul nu e compilat.
//
// Drumurile propuse vin din `RUTE` (rutele `en` din harta), deci apar singure cand feliile de pagini le adauga;
// legatura spre romana apare numai cand editia `ro-MD` are index (`/ro`).
//
// Antetul si subsolul EN (felia navigatie-pe-editie) se monteaza aici, nu prin layout-ul `(en)`: pagina are
// propriul `<html>`. Tot de aceea isi importa singura stilurile globale si fonturile. CTA-ul antetului foloseste
// textul paginii de start (`en-home`): o adresa necunoscuta nu are intrare in tabelul de canale.
//
// ASEZAREA (`src/lib/asezare.ts`): rutele se aleg dupa calea SURSA, iar legaturile duc la adresa SERVITA a fiecareia
// (`servita`), cu codul de limba al romanei pe asezarea build-ului. Pe asezarea `md` totul e ca inainte.

export const metadata: Metadata = {
  title: "Page not found | " + BRAND.nume,
  robots: { index: false, follow: false },
};

export default function NegasitGlobalEn() {
  const drumuri = RUTE.filter((r) => editiaRutei(r) === "en" && r.inHarta);
  const indexRoMd = RUTE.find((r) => editiaRutei(r) === "ro-MD" && r.cale === EDITII["ro-MD"].prefix);
  const navigatie = navigatieEn();
  return (
    <html lang={EDITII.en.lang} className={CLASE_FONTURI}>
      <body>
        <Antet navigatie={navigatie} />
        <main>
          <h1>Page not found</h1>
          <p>The address you followed does not exist on this site.</p>
          {drumuri.length > 0 ? (
            <ul>
              {drumuri.map((r) => (
                <li key={r.cale}>
                  <Link href={r.servita}>{r.scurt}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          {indexRoMd !== undefined ? (
            <p>
              <Link href={indexRoMd.servita} hrefLang={atributeLimba("ro-MD").inLanguage}>
                {indexRoMd.scurt}
              </Link>
            </p>
          ) : null}
        </main>
        <Subsol navigatie={navigatie} />
      </body>
    </html>
  );
}

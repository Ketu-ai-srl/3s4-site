import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Antet from "@/components/global/Antet";
import Subsol from "@/components/global/Subsol";
import { BRAND } from "@/content/entitate";
import { navigatieRoMd } from "@/content/navigatie-ro-md";
import { RUTE, editiaRutei } from "@/content/rute";
import { atributeLimba } from "@/lib/asezare";
import { EDITII } from "@/lib/editii";
import { CLASE_FONTURI } from "@/lib/fonturi";

// PAGINA DE NEGASIT a asezarii `ro` (3s.com.ro: romana la radacina, engleza sub `/en`; `src/lib/asezare.ts`). Pe
// build-ul acesta exista doua layout-uri radacina (`(comro)` si `(comroen)/en`) si niciunul la `src/app`, deci o adresa
// care nu se potriveste cu nicio ruta e servita din fisierul asta (`experimental.globalNotFound`, ales de
// `pageExtensions` dupa sufixul `comro.tsx`). Pe 3s.md si pe site-ul romanesc fisierul nu e compilat.
//
// Geamana lui `global-not-found.en.tsx`, cu limba domeniului: romana, si textul EXISTENT al paginii de negasit
// romanesti (`src/app/not-found.tsx`), fara text nou. Drumurile propuse vin din `RUTE` (rutele `ro-MD` din harta) si
// duc la adresa SERVITA a fiecareia (`servita`); legatura spre engleza apare numai cand editia `en` are index.

export const metadata: Metadata = {
  title: "Pagina nu există | " + BRAND.nume,
  robots: { index: false, follow: false },
};

export default function NegasitGlobalRo() {
  const indexRo = EDITII["ro-MD"].prefix;
  const drumuri = RUTE.filter((r) => editiaRutei(r) === "ro-MD" && r.inHarta && r.cale !== indexRo);
  const start = RUTE.find((r) => editiaRutei(r) === "ro-MD" && r.cale === indexRo);
  const indexEn = RUTE.find((r) => editiaRutei(r) === "en" && r.cale === EDITII.en.prefix + "/");
  const navigatie = navigatieRoMd();
  return (
    <html lang={atributeLimba("ro-MD").lang} className={CLASE_FONTURI}>
      <body>
        <Antet navigatie={navigatie} />
        <main>
          <h1>Pagina nu există</h1>
          <p>Adresa poate fi greșită sau pagina a fost mutată. De pe pagina de start ajungi la tot ce face 3S.</p>
          {start !== undefined ? (
            <p>
              <Link href={start.servita}>Mergi la pagina de start</Link>
            </p>
          ) : null}
          {drumuri.length > 0 ? (
            <ul>
              {drumuri.map((r) => (
                <li key={r.cale}>
                  <Link href={r.servita}>{r.scurt}</Link>
                </li>
              ))}
            </ul>
          ) : null}
          {indexEn !== undefined ? (
            <p>
              <Link href={indexEn.servita} hrefLang={atributeLimba("en").inLanguage}>
                {indexEn.scurt}
              </Link>
            </p>
          ) : null}
        </main>
        <Subsol navigatie={navigatie} />
      </body>
    </html>
  );
}

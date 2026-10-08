import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import BaraMobil from "@/components/canale/BaraMobil";
import PunctConsimtamant from "@/components/consimtamant/PunctConsimtamant";
import Antet from "@/components/global/Antet";
import Subsol from "@/components/global/Subsol";
import { BRAND } from "@/content/entitate";
import { navigatieRoMd } from "@/content/navigatie-ro-md";
import { RUTE, editiaRutei } from "@/content/rute";
import { atributeLimba } from "@/lib/asezare";
import { EDITII } from "@/lib/editii";
import { PaginaNegasitEn, editiaCererii, metadataEn } from "./global-not-found.en";
import Buton from "@/components/primitive/Buton";
import { CLASE_FONTURI } from "@/lib/fonturi";
import s from "./negasita.module.css";

// PAGINA DE NEGASIT a asezarii `ro` (3s.com.ro: romana la radacina, engleza sub `/en`; `src/lib/asezare.ts`). Pe
// build-ul acesta exista doua layout-uri radacina (`(comro)` si `(comroen)/en`) si niciunul la `src/app`, deci o adresa
// care nu se potriveste cu nicio ruta e servita din fisierul asta (`experimental.globalNotFound`, ales de
// `pageExtensions` dupa sufixul `comro.tsx`). Pe 3s.md si pe site-ul romanesc fisierul nu e compilat.
//
// Geamana lui `global-not-found.en.tsx`, cu limba domeniului: romana, si textul EXISTENT al paginii de negasit
// romanesti (`src/app/not-found.tsx`), fara text nou. Drumurile propuse vin din `RUTE` (rutele `ro-MD` din harta) si
// duc la adresa SERVITA a fiecareia (`servita`); legatura spre engleza apare numai cand editia `en` are index.
//
// Ca geamana ei EN si ca pagina de negasit romaneasca: acelasi stil (`negasita.module.css`), eticheta, butonul spre
// start (cu calea SURSA, pe care `Buton` o serveste), legatura de sarit la continut, bannerul de consimtamant (ca
// "Setari cookie-uri" din subsol sa deschida panoul) si bara de canale de pe telefon. Textele raman cele existente.
//
// PE EDITIA CAII CERUTE (regula e scrisa o singura data, in `global-not-found.en.tsx`): pe 3s.com.ro o adresa
// inexistenta de sub `/en` primeste pagina de negasit englezeasca, cu legaturile asezarii, iar restul pe cea de mai jos.
// Pe 3s.md pagina romaneasca de aici e cea pe care o primesc adresele inexistente de sub `/ro`.

export const metadataRo: Metadata = {
  title: "Pagina nu există | " + BRAND.nume,
  robots: { index: false, follow: false },
  // Ca pe restul paginilor editiilor (layout-urile `(en)` si `(romd)`): fara layout, pagina de negasit nu mostenea
  // `<meta name="format-detection" content="telephone=no">`, deci pe iOS numarul din subsol devenea legatura de apel.
  formatDetection: { telephone: false },
};

export async function generateMetadata(): Promise<Metadata> {
  return (await editiaCererii()) === "en" ? metadataEn : metadataRo;
}

export default async function NegasitGlobalRo() {
  return (await editiaCererii()) === "en" ? <PaginaNegasitEn /> : <PaginaNegasitRo />;
}

/** Pagina de negasit romaneasca (fara alegerea editiei). */
export function PaginaNegasitRo() {
  const indexRo = EDITII["ro-MD"].prefix;
  const drumuri = RUTE.filter((r) => editiaRutei(r) === "ro-MD" && r.inHarta && r.cale !== indexRo);
  const start = RUTE.find((r) => editiaRutei(r) === "ro-MD" && r.cale === indexRo);
  const indexEn = RUTE.find((r) => editiaRutei(r) === "en" && r.cale === EDITII.en.prefix + "/");
  const navigatie = navigatieRoMd();
  return (
    <html lang={atributeLimba("ro-MD").lang} className={CLASE_FONTURI}>
      <body>
        <a className="sari-la-continut" href="#zona-continut">
          Sari la conținut
        </a>
        <Antet navigatie={navigatie} />
        <div id="zona-continut" tabIndex={-1}>
          <main className={s.pagina}>
            <div className="container-site">
              <div className={s.bloc}>
                <p className={"t-eticheta-sectiune " + s.eticheta}>Eroare 404</p>
                <h1 className={"t-h1-interior " + s.titlu}>Pagina nu există</h1>
                <p className={"t-subtitlu-interior " + s.text}>
                  Adresa poate fi greșită sau pagina a fost mutată. De pe pagina de start ajungi la tot ce face 3S.
                </p>
                {start !== undefined ? (
                  <Buton marime="mare" sageata legatura={{ text: "Pagina de start", href: start.cale, ruta: start.cale }}>
                    Mergi la pagina de start
                  </Buton>
                ) : null}
                {drumuri.length > 0 ? (
                  <ul className={s.drumuri}>
                    {drumuri.map((r) => (
                      <li key={r.cale}>
                        <Link href={r.servita} className={s.drum}>
                          {r.scurt}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {indexEn !== undefined ? (
                  <p className={s.altaLimba}>
                    <Link href={indexEn.servita} hrefLang={atributeLimba("en").inLanguage} className={s.drum}>
                      {indexEn.scurt}
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          </main>
        </div>
        <Subsol navigatie={navigatie} />
        <PunctConsimtamant limba="ro" />
        <BaraMobil bara={navigatie.bara} />
      </body>
    </html>
  );
}

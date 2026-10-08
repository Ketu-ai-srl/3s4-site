import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";
import BaraMobil from "@/components/canale/BaraMobil";
import PunctConsimtamant from "@/components/consimtamant/PunctConsimtamant";
import Antet from "@/components/global/Antet";
import Subsol from "@/components/global/Subsol";
import { BRAND } from "@/content/entitate";
import { navigatieEn } from "@/content/navigatie-en";
import { RUTE, editiaRutei } from "@/content/rute";
import { atributeLimba, prefixServit, type EditieAsezata } from "@/lib/asezare";
import { EDITII, editiaInBuild, editiiBuild, type CodEditie } from "@/lib/editii";
import { CLASE_FONTURI } from "@/lib/fonturi";
import { PaginaNegasitRo, metadataRo } from "./global-not-found.comro";
import s from "./negasita.module.css";

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
//
// CA O PAGINA A SITE-ULUI (ca layout-ul `(en)`, pe care pagina nu il are): stilul paginii de negasit romanesti
// (`negasita.module.css`: bloc centrat sub antetul fix, titlul si subtitlul interior), legatura de sarit la continut,
// bannerul de consimtamant (fara el, "Cookie settings" din subsol n-avea ce panou sa deschida) si bara de canale de
// pe telefon. Textele sunt cele de dinainte; nu se adauga text nou.
//
// PE EDITIA CAII CERUTE. Next are o singura pagina de negasit globala pe build, dar un build poarta doua editii: pe
// 3s.md romana sta sub `/ro`, pe 3s.com.ro engleza sta sub `/en`. O adresa inexistenta primeste pagina editiei careia
// ii apartine calea (`editiaPaginiiNegasite`): pe `md`, `/ro/...` primeste pagina romaneasca (`PaginaNegasitRo`, aceeasi
// ca pe 3s.com.ro, cu legaturile asezarii build-ului), orice alta adresa pe cea englezeasca; pe `ro` invers, prin
// geamana (`global-not-found.comro.tsx`). Calea vine din antetul `x-3s-cale`, pus pe CERERE de `src/middleware.ts`.
// Citirea antetului face pagina DINAMICA: se randeaza la fiecare cerere, cu mediul de RULARE al aplicatiei (canalele,
// operatorul, analitica), care trebuie sa fie egal cu cel de la build.

/** Numele antetului de cerere cu calea ceruta (scris de middleware, citit aici). */
export const ANTET_CALE = "x-3s-cale";

/**
 * Editia careia ii apartine o cale inexistenta, pe o asezare: editia cu prefix nevid, cand calea e prefixul ei sau sub
 * el (cu bara: `/rox-...` si `/robots-...` nu sunt sub `/ro`, `/english` nu e sub `/en`) si editia e in profilul
 * construit; altfel editia de la radacina. Fara cale (antet lipsa) tot editia de la radacina, adica pagina de dinainte.
 */
export function editiaPaginiiNegasite(
  cale: string | null,
  asezare?: "md" | "ro",
  editiiProfil: readonly CodEditie[] = editiiBuild(),
): EditieAsezata {
  const editii: EditieAsezata[] = ["en", "ro-MD"];
  const sub = editii.find((e) => {
    const prefix = prefixServit(e, asezare);
    return prefix !== "" && cale !== null && (cale === prefix || cale.startsWith(prefix + "/")) && editiaInBuild(e, editiiProfil);
  });
  return sub ?? editii.find((e) => prefixServit(e, asezare) === "") ?? "en";
}

/** Editia paginii de negasit pentru cererea curenta. */
export async function editiaCererii(): Promise<EditieAsezata> {
  return editiaPaginiiNegasite((await headers()).get(ANTET_CALE));
}

export const metadataEn: Metadata = {
  title: "Page not found | " + BRAND.nume,
  robots: { index: false, follow: false },
  // Ca pe restul paginilor editiilor (layout-urile `(en)` si `(romd)`; geamana are aceeasi regula).
  formatDetection: { telephone: false },
};

export async function generateMetadata(): Promise<Metadata> {
  return (await editiaCererii()) === "ro-MD" ? metadataRo : metadataEn;
}

export default async function NegasitGlobalEn() {
  return (await editiaCererii()) === "ro-MD" ? <PaginaNegasitRo /> : <PaginaNegasitEn />;
}

/** Pagina de negasit englezeasca (fara alegerea editiei). */
export function PaginaNegasitEn() {
  const drumuri = RUTE.filter((r) => editiaRutei(r) === "en" && r.inHarta);
  const indexRoMd = RUTE.find((r) => editiaRutei(r) === "ro-MD" && r.cale === EDITII["ro-MD"].prefix);
  const navigatie = navigatieEn();
  return (
    <html lang={EDITII.en.lang} className={CLASE_FONTURI}>
      <body>
        <a className="sari-la-continut" href="#zona-continut">
          Skip to content
        </a>
        <Antet navigatie={navigatie} />
        <div id="zona-continut" tabIndex={-1}>
          <main className={s.pagina}>
            <div className="container-site">
              <div className={s.bloc}>
                <h1 className={"t-h1-interior " + s.titlu}>Page not found</h1>
                <p className={"t-subtitlu-interior " + s.text}>The address you followed does not exist on this site.</p>
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
                {indexRoMd !== undefined ? (
                  <p className={s.altaLimba}>
                    <Link href={indexRoMd.servita} hrefLang={atributeLimba("ro-MD").inLanguage} className={s.drum}>
                      {indexRoMd.scurt}
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
          </main>
        </div>
        <Subsol navigatie={navigatie} />
        <PunctConsimtamant limba="en" />
        <BaraMobil bara={navigatie.bara} />
      </body>
    </html>
  );
}

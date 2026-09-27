// Legaturile de paginare ale listarii (felia seo-tehnic, auditul SEO m1): „anterioara" si „urmatoare",
// ca `<a>` reale, in HTML-ul servit. Butoanele au forma butonului contur al site-ului, la marimea
// butonului care aduce inca 9 carduri, ca randul sa nu fie o forma noua.
//
// Paginile 2..n nu sunt in `RUTE`, deci legatura nu trece prin `Tinta` (care ar randa-o inerta):
// adresele vin din `vecini()`, calculate din acelasi registru din care se construiesc paginile.
//
// Fara hooks: se randeaza pe server si in insula listarii.

import Link from "next/link";
import { claseButon } from "@/components/primitive/Buton";
import Iconita from "@/components/primitive/Iconita";
import { PAGINARE, type LegaturiPaginare } from "./paginare";
import s from "./blog.module.css";

export default function NavPaginare({ anterioara, urmatoare }: LegaturiPaginare) {
  if (anterioara === null && urmatoare === null) return null;
  const clasa = claseButon("contur", "baza", false, false, s.butonPaginare);
  return (
    <nav aria-label={PAGINARE.eticheta} className={s.paginare} data-paginare="">
      {anterioara !== null ? (
        <Link href={anterioara} prefetch={false} className={clasa} rel="prev">
          <Iconita nume="arrow-left" marime={16} contur={2} />
          {PAGINARE.anterioara}
        </Link>
      ) : null}
      {urmatoare !== null ? (
        <Link href={urmatoare} prefetch={false} className={clasa} rel="next">
          {PAGINARE.urmatoare}
          <Iconita nume="arrow-right" marime={16} contur={2} />
        </Link>
      ) : null}
    </nav>
  );
}

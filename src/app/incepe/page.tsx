import DemoInterfata from "@/components/conversie/DemoInterfata";
import TemaPagina from "@/components/global/TemaPagina";
import Tinta from "@/components/primitive/Tinta";
import DateFirAriadnei from "@/components/seo/DateFirAriadnei";
import { metadataPagina } from "@/components/seo/metadata";
import { CALE_INCEPE, CALE_INREGISTRARE, INCEPE, META_INCEPE } from "@/content/conversie";
import { ChevronLeft } from "lucide-react";
import s from "@/components/conversie/incepe.module.css";

// Pagina /incepe (felia conversie; incepe.md, sablonul imersiva): o singura scena de 100lvh pe
// ardezie-9, butonul "inapoi", titlul, un rand de text si rama playerului. In locul clipului (care nu
// exista) rama arata o demonstratie animata in HTML a interfetei 3S, declarata ca demonstratie, cu
// date fictive (plan §6.9, D9). Dupa final apar cele doua iesiri: contul gratuit si descarcarea.
//
// ANTETUL SI SUBSOLUL raman, pana la comutatorul cerut dispecerului: layout-ul e inghetat, iar a le
// ascunde de aici ar insemna sa restilizez piese inghetate. Pagina pune tema inchisa (varianta lor
// inchisa, ca pe paginile cinema) si marcajul `data-pagina-imersiva`, pe care comutatorul il poate
// citi. Pagina nu are fir de pagina vizibil (la referinta nu are), deci `BreadcrumbList` il pune
// `DateFirAriadnei`.

export const metadata = metadataPagina({
  titlu: META_INCEPE.titlu,
  descriere: META_INCEPE.descriere,
  cale: CALE_INCEPE,
});

export default function Incepe() {
  const t = INCEPE;
  return (
    <main>
      <TemaPagina tema="inchisa" />
      <span hidden data-pagina-imersiva="" />
      <DateFirAriadnei
        niveluri={[
          { nume: "Acasă", cale: "/" },
          { nume: t.titlu, cale: CALE_INCEPE },
        ]}
      />
      <section className={s.scena} aria-labelledby="incepe-titlu">
        <Tinta legatura={t.inapoi} className={s.inapoi}>
          <ChevronLeft size={18} strokeWidth={1.8} aria-hidden />
          <span>{t.inapoi.text}</span>
        </Tinta>
        <div className={s.invelis}>
          <h1 id="incepe-titlu" className={"t-h1-interior " + s.titlu}>
            {t.titlu}
          </h1>
          <p className={s.paragraf}>{t.paragraf}</p>
          <DemoInterfata
            final={
              <>
                <p className={s.finalTitlu}>{t.final.titlu}</p>
                <div className={s.finalActiuni}>
                  <Tinta
                    legatura={{ text: t.final.buton, href: CALE_INREGISTRARE, ruta: CALE_INREGISTRARE }}
                    className={s.finalButon}
                  >
                    {t.final.buton}
                  </Tinta>
                  <Tinta legatura={t.final.legatura} className={s.finalLegatura}>
                    {t.final.legatura.text}
                  </Tinta>
                </div>
              </>
            }
          />
        </div>
      </section>
    </main>
  );
}

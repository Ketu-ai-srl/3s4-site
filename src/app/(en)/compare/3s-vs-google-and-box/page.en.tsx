// Pagina G3 a editiei `en`: `/compare/3s-vs-google-and-box` (grupul referinta). Aceleasi componente si aceeasi
// compunere ca pagina RO `/comparatie-drive` (decizia 53), cu textul in engleza din modulul
// `src/content/en/compare-3s-vs-google-and-box.ts`, importat DIRECT (conditia portii de registru: afirmatiile paginii
// numesc modulul).
//
// Ordinea RO, cu ce lipseste si de ce (lista declarata a perechii: `config/congruenta/g3.json`):
//   EroulInterior, CardDivizat, [DiagramaConectori: iese, decizia 43], [SinaPasi: iese, actul pe hartie],
//   TabelMarcaje (doua randuri din 13), CutieCta880.
//   Tabelul primeste legenda, eticheta ei si sufixul pentru ferestre noi in engleza, plus grupul de surse al
//   afirmatiilor despre Google din cardul divizat (decizia 11). Butonul cutiei de final duce la WhatsApp, cu textul
//   precompletat al paginii (fara formular, decizia 3).
//   Cardul divizat pune bifele pe "When does 3S fit?" si avertizarile pe "When should you not choose 3S?"
//   (`bifeLaDreapta`): pe RO coloanele spun altceva (ce face bine un drive / unde incepe o arhiva).
//
// Datele structurate: nodurile Article si WebPage din modul (`_referinta/date-structurate.ts`); organizatia si site-ul le pune layout-ul. Firul pune
// singur `BreadcrumbList`, ca pe RO.

import type { Metadata } from "next";
import CardDivizat from "@/components/comparatii/CardDivizat";
import TabelMarcaje from "@/components/comparatii/TabelMarcaje";
import s from "@/components/comparatii/comparatii.module.css";
import CapBloc from "@/components/primitive/CapBloc";
import CutieCta880 from "@/components/primitive/CutieCta880";
import EroulInterior from "@/components/primitive/EroulInterior";
import JsonLd from "@/components/seo/JsonLd";
import { metadataPagina } from "@/components/seo/metadata";
import { legaturaWhatsApp } from "@/content/canale";
import {
  CUTIE_CTA_EN,
  DIVIZAT_EN,
  EROU_EN,
  ETICHETA_LEGENDA_EN,
  FEREASTRA_NOUA_EN,
  LEGENDA_EN,
  SURSE_CARD_EN,
  TABEL_EN,
  pagina,
} from "@/content/en/compare-3s-vs-google-and-box";
import { grafReferinta } from "../../guides/_referinta/date-structurate";

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "en",
  cheie: pagina.cheie,
});

export default function Pagina() {
  // Fara WhatsApp pe domeniu, butonul ramane inert (`Tinta`), cu acelasi aspect.
  const wa = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  return (
    <main>
      <JsonLd date={grafReferinta(pagina)} />
      <EroulInterior
        fir={EROU_EN.fir}
        etichetaFir={EROU_EN.etichetaFir}
        titlu={EROU_EN.titlu}
        subtitlu={EROU_EN.subtitlu}
      />

      <section className={s.sectiuneLipita}>
        <div className="container-site">
          <div className={s.bloc}>
            <CardDivizat
              stanga={DIVIZAT_EN.stanga}
              dreapta={DIVIZAT_EN.dreapta}
              bifeLaDreapta
            />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="tabel-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="tabel-titlu" titlu={TABEL_EN.titlu} margineJos={0} />
            <TabelMarcaje
              tabel={TABEL_EN}
              surseSuplimentare={SURSE_CARD_EN}
              legenda={LEGENDA_EN}
              etichetaLegenda={ETICHETA_LEGENDA_EN}
              fereastraNoua={FEREASTRA_NOUA_EN}
            />
          </div>
        </div>
      </section>

      <CutieCta880
        titlu={CUTIE_CTA_EN.titlu}
        text={CUTIE_CTA_EN.text}
        buton={{ text: CUTIE_CTA_EN.butonText, href: wa, ruta: null }}
      />
    </main>
  );
}

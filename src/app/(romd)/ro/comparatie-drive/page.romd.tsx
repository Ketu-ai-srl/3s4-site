// Pagina G3 a editiei `ro-MD`: `/ro/comparatie-drive` pe 3s.md. Aceleasi componente si aceeasi compunere ca pagina RO
// `/comparatie-drive` si ca perechea EN `/compare/3s-vs-google-drive` (decizia 53), cu textul editiei din
// `src/content/ro-md/comparatie-componente.ts`.
//
// Ordinea RO (lista declarata a perechii: `config/congruenta/g3.json`): EroulInterior, CardDivizat, [DiagramaConectori:
// d43], [SinaPasi: poarta juridica 40-41, d31, d43], TabelMarcaje, CutieCta880. Butonul cutiei duce la WhatsApp, cu
// `[ref:ro-md-comparatie]`; fara WhatsApp pe domeniu ramane inert (`Tinta`), cu acelasi aspect, ca pe EN.
// Cardul divizat pune bifele pe "Cand se potriveste 3S" si avertizarile pe "Cand 3S nu este prima alegere"
// (`bifeLaDreapta`), ca pe EN.

import type { Metadata } from "next";
import { grafReferinta } from "@/app/(en)/guides/_referinta/date-structurate";
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
  CUTIE_CTA_COMPARATIE_RO_MD,
  DIVIZAT_COMPARATIE_RO_MD,
  EROU_COMPARATIE_RO_MD,
  ETICHETA_LEGENDA_RO_MD,
  FEREASTRA_NOUA_RO_MD,
  LEGENDA_COMPARATIE_RO_MD,
  PAGINA_COMPARATIE_RO_MD,
  SURSE_CARD_COMPARATIE_RO_MD,
  TABEL_COMPARATIE_RO_MD,
} from "@/content/ro-md/comparatie-componente";

const pagina = PAGINA_COMPARATIE_RO_MD;

export const metadata: Metadata = metadataPagina({
  titlu: pagina.meta.titlu,
  descriere: pagina.meta.descriere,
  cale: pagina.meta.cale,
  editie: "ro-MD",
  cheie: pagina.cheie,
});

export default function Pagina() {
  const wa = legaturaWhatsApp(pagina.cta.ref, pagina.cta.textWhatsapp);
  return (
    <main>
      <JsonLd date={grafReferinta(pagina)} />
      <EroulInterior fir={EROU_COMPARATIE_RO_MD.fir} titlu={EROU_COMPARATIE_RO_MD.titlu} subtitlu={EROU_COMPARATIE_RO_MD.subtitlu} />

      <section className={s.sectiuneLipita}>
        <div className="container-site">
          <div className={s.bloc}>
            <CardDivizat stanga={DIVIZAT_COMPARATIE_RO_MD.stanga} dreapta={DIVIZAT_COMPARATIE_RO_MD.dreapta} bifeLaDreapta />
          </div>
        </div>
      </section>

      <section className="sectiune-bloc" aria-labelledby="tabel-titlu">
        <div className="container-site">
          <div className={s.bloc}>
            <CapBloc id="tabel-titlu" titlu={TABEL_COMPARATIE_RO_MD.titlu} margineJos={0} />
            <TabelMarcaje
              tabel={TABEL_COMPARATIE_RO_MD}
              surseSuplimentare={SURSE_CARD_COMPARATIE_RO_MD}
              legenda={LEGENDA_COMPARATIE_RO_MD}
              etichetaLegenda={ETICHETA_LEGENDA_RO_MD}
              fereastraNoua={FEREASTRA_NOUA_RO_MD}
            />
          </div>
        </div>
      </section>

      <CutieCta880
        titlu={CUTIE_CTA_COMPARATIE_RO_MD.titlu}
        text={CUTIE_CTA_COMPARATIE_RO_MD.text}
        buton={{ text: CUTIE_CTA_COMPARATIE_RO_MD.butonText, href: wa, ruta: null }}
      />
    </main>
  );
}

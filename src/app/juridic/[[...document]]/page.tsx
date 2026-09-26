// /juridic si cele 7 documente juridice (sabloanele A' si A; fisele juridic__sablon.md, juridic.md si
// cele sase fise de document, plus lista subimputernicitilor, sablon §13).
//
// COMUTATORUL (plan §9-§10, "Nimeni deocamdata"): paginile exista numai cu operator de date numit si
// complet. `generateStaticParams` intoarce lista goala cat timp `config/operator.json` are
// `"operator": null`, iar `dynamicParams = false` face ca orice adresa din grup sa raspunda 404: nu se
// construieste nimic, deci nu exista nici HTML, nici intrare in `RUTE`, in harta, in subsol sau in
// paleta. Cu operator, aceleasi opt pagini se construiesc static si intra singure in `RUTE`
// (`src/content/juridic/publicare.ts`). Proba: tests/browser/juridic-comutator.spec.ts.
//
// De ce un singur segment optional `[[...document]]` si nu opt directoare: o pagina statica se
// construieste si se serveste oricare ar fi operatorul. Aici pagina exista exact cand exista ruta.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarduriDocumente from "@/components/juridic/CarduriDocumente";
import CorpDocument, { type MarcajSectiuni } from "@/components/juridic/CorpDocument";
import SigiliuSha256, { amprentaSha256 } from "@/components/juridic/SigiliuSha256";
import ZonaJuridica from "@/components/juridic/ZonaJuridica";
import s from "@/components/juridic/juridic.module.css";
import FirPagina from "@/components/primitive/FirPagina";
import { metadataPagina } from "@/components/seo/metadata";
import { juridicPublicat, verificaComutator } from "@/content/juridic/comutator";
import { CHEI_ART13 } from "@/content/juridic/confidentialitate";
import { CHEI_L284 } from "@/content/juridic/cookie-uri";
import { documentPentruSlug, texteJuridice } from "@/content/juridic/index";
import { INDEX_PAGINA, META_DOCUMENTE, META_INDEX_JURIDIC, linieVersiune } from "@/content/juridic/pagini";
import {
  CALE_JURIDIC,
  DOCUMENTE_JURIDICE,
  INDEX_JURIDIC,
  caleDocument,
  documentJuridic,
  type IntrareJuridica,
  type SlugJuridic,
} from "@/content/juridic/publicare";
import { textPentruAmprenta } from "@/content/juridic/tipuri";

export const dynamicParams = false;

type Parametri = { params: Promise<{ document?: string[] }> };

/** Paginile grupului: indexul si cele 7 documente, numai cu operator; altfel niciuna. */
export function generateStaticParams(): { document: string[] }[] {
  // Operator numit dar incomplet: construirea se opreste aici (src/content/juridic/comutator.ts).
  verificaComutator();
  if (!juridicPublicat()) {
    return [];
  }
  return [{ document: [] }, ...DOCUMENTE_JURIDICE.map((d) => ({ document: [d.slug] }))];
}

/** Ce pagina e ceruta: indexul (`null`), un document, sau nimic (404). */
function paginaCeruta(document: string[] | undefined): IntrareJuridica | null | undefined {
  if (document === undefined || document.length === 0) return null;
  if (document.length > 1) return undefined;
  return documentJuridic(document[0]);
}

/** Atributul portilor pe sectiunile unui document (G-MD-01, G-MD-08). */
const MARCAJE: Partial<Record<SlugJuridic, MarcajSectiuni>> = {
  confidentialitate: { atribut: "data-art13", chei: CHEI_ART13 },
  cookies: { atribut: "data-l284", chei: CHEI_L284 },
};

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const pagina = paginaCeruta((await params).document);
  if (pagina === undefined || !juridicPublicat()) notFound();
  if (pagina === null) return metadataPagina({ ...META_INDEX_JURIDIC, cale: CALE_JURIDIC });
  return metadataPagina({ ...META_DOCUMENTE[pagina.slug], cale: caleDocument(pagina.slug) });
}

export default async function PaginaJuridica({ params }: Parametri) {
  const pagina = paginaCeruta((await params).document);
  const texte = texteJuridice();
  if (pagina === undefined || texte === null) notFound();

  if (pagina === null) {
    return (
      <ZonaJuridica activ={null}>
        <FirPagina
          niveluri={[
            { text: "Acasă", cale: "/" },
            { text: INDEX_JURIDIC.scurt, cale: CALE_JURIDIC },
          ]}
        />
        <header className={s.antetIndex}>
          <h1 className={"t-h1-interior " + s.titluIndex}>{INDEX_PAGINA.titlu}</h1>
          <p className={s.subtitlu}>{INDEX_PAGINA.subtitlu}</p>
        </header>
        <CarduriDocumente />
      </ZonaJuridica>
    );
  }

  const document = documentPentruSlug(texte, pagina.slug);
  if (document.versiune === undefined) {
    throw new Error("documentul " + pagina.slug + " nu are data versiunii");
  }
  const linie = linieVersiune(document.versiune);
  const amprenta = amprentaSha256(textPentruAmprenta(document, linie));

  return (
    <ZonaJuridica activ={pagina.slug}>
      <FirPagina
        niveluri={[
          { text: "Acasă", cale: "/" },
          { text: INDEX_JURIDIC.scurt, cale: CALE_JURIDIC },
          { text: document.titlu, cale: caleDocument(pagina.slug) },
        ]}
      />
      <article data-document={pagina.slug}>
        <header className={s.antetDocument}>
          <h1 className={"t-h1-interior " + s.titluDocument}>{document.titlu}</h1>
          <div className={s.versiune}>
            <time dateTime={document.versiune}>{linie}</time>
          </div>
        </header>
        <CorpDocument document={document} marcaj={MARCAJE[pagina.slug]} />
      </article>
      <SigiliuSha256 amprenta={amprenta} />
    </ZonaJuridica>
  );
}

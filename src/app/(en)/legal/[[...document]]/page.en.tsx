// Paginile juridice ale editiei `en` (site-ul international 3s.md): documentele familiei `md` publicate la poarta
// curenta, in engleza, la adresele din `config/juridic-rute.json` (`/legal/<slug>`). Textele vin din modulele
// `src/content/juridic/md/*.en.ts`, compuse de `texteJuridice` pe operatorul si pe starea masurarii. Pereche cu
// `src/app/(romd)/ro/juridic/[[...document]]/page.romd.tsx`.
//
// COMUTATORUL, ca la paginile `/juridic` ale familiei SEE: `generateStaticParams` da documentele numai cand
// familia publicata e `md`, iar `dynamicParams = false` face ca orice alta adresa sa raspunda 404 (un document
// cu poarta C, `/legal/dpa` si `/legal/subprocessors`, nu e in lista). Rutele din `RUTE` (`rute-en-juridic.ts`)
// urmeaza aceeasi regula, deci pagina exista exact cand exista ruta.
//
// FARA INDEX: `/legal` nu e pagina (slugul gol nu e in lista, deci 404, ca in proba editiilor). Firul de pagina
// incepe la grupul juridic, ca text fara legatura, nu la `/` (pagina de start EN nu exista inca), si se termina
// la document.
//
// Bara laterala, firul si corpul sunt scrise aici, nu luate din `ZonaJuridica` si `FirPagina`: piesele acelea
// au textele si documentele familiei SEE (in romana), iar firul lor face legatura din fiecare nivel. Clasele
// vizuale sunt aceleasi.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CorpDocument from "@/components/juridic/CorpDocument";
import s from "@/components/juridic/juridic.module.css";
import Tinta from "@/components/primitive/Tinta";
import f from "@/components/primitive/primitive.module.css";
import { metadataPagina } from "@/components/seo/metadata";
import { familiePublicata, verificaComutator } from "@/content/juridic/comutator";
import { texteJuridice } from "@/content/juridic/index";
import { caleMd, cheiPublicate, cheiePentruSlug, slugMd, type CheieMd } from "@/content/juridic/md/registru";
import { META_DOCUMENTE_MD, linieVersiuneMd } from "@/content/juridic/pagini";
import { SCURT_MD } from "@/content/juridic/publicare";

export const dynamicParams = false;

const LIMBA = "en";

type Parametri = { params: Promise<{ document?: string[] }> };

/** Documentele publicate la poarta curenta, numai cu familia `md`; altfel niciunul. */
export function generateStaticParams(): { document: string[] }[] {
  verificaComutator();
  if (familiePublicata() !== "md") return [];
  return cheiPublicate().map((cheie) => ({ document: [slugMd(cheie, LIMBA)] }));
}

/** Cheia documentului cerut, sau `undefined` (404). */
function documentCerut(document: string[] | undefined): CheieMd | undefined {
  if (document === undefined || document.length !== 1 || familiePublicata() !== "md") return undefined;
  const cheie = cheiePentruSlug(document[0], LIMBA);
  return cheie !== undefined && cheiPublicate().includes(cheie) ? cheie : undefined;
}

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const cheie = documentCerut((await params).document);
  if (cheie === undefined) notFound();
  return metadataPagina({ ...META_DOCUMENTE_MD[cheie][LIMBA], cale: caleMd(cheie, LIMBA), editie: "en", cheie });
}

function Chevron() {
  return (
    <svg className={f.firSeparator} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M6 4 L10 8 L6 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function PaginaLegala({ params }: Parametri) {
  const cheie = documentCerut((await params).document);
  const texte = texteJuridice(undefined, { limba: LIMBA });
  if (cheie === undefined || texte === null) notFound();
  const document = texte.get(cheie);
  if (document === undefined || document.versiune === undefined) {
    throw new Error("documentul " + cheie + " nu e construit sau nu are data versiunii");
  }

  return (
    <main className={s.zona}>
      <div className="container-site">
        <div className={s.grila}>
          <nav className={s.bara} aria-label="Legal documents">
            <div className={s.baraTitlu}>Legal</div>
            <ul className={s.baraLista}>
              {cheiPublicate().map((c) => {
                const cale = caleMd(c, LIMBA);
                return (
                  <li key={c}>
                    <Tinta
                      legatura={{ text: SCURT_MD[c][LIMBA], href: cale, ruta: cale }}
                      className={s.baraLegatura}
                      aria-current={c === cheie ? "page" : undefined}
                    >
                      {SCURT_MD[c][LIMBA]}
                    </Tinta>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className={s.coloana}>
            <nav aria-label="Breadcrumb">
              <ol className={f.fir}>
                <li className={f.firElement}>
                  <span className={f.firLegatura}>Legal</span>
                  <Chevron />
                </li>
                <li className={f.firElement}>
                  <span className={f.firCurent} aria-current="page">
                    {document.titlu}
                  </span>
                </li>
              </ol>
            </nav>
            <article data-document={cheie}>
              <header className={s.antetDocument}>
                <h1 className={"t-h1-interior " + s.titluDocument}>{document.titlu}</h1>
                <div className={s.versiune}>
                  <time dateTime={document.versiune}>{linieVersiuneMd(document.versiune, LIMBA)}</time>
                </div>
              </header>
              <CorpDocument document={document} />
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}

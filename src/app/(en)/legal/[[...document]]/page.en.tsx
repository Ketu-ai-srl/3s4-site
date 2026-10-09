// Paginile juridice ale editiei `en` (site-ul international 3s.md): documentele familiei `md` publicate la poarta
// curenta, in engleza, la adresele din `config/juridic-rute.json` (`/legal/<slug>`). Textele vin din modulele
// `src/content/juridic/md/*.en.ts`, compuse de `texteJuridice` pe operatorul si pe starea masurarii. Pereche cu
// `src/app/(romd)/ro/juridic/[[...document]]/page.romd.tsx`.
//
// COMUTATORUL, ca la paginile `/juridic` ale familiei SEE: `generateStaticParams` da documentele numai cand
// familia publicata e `md`, iar `dynamicParams = false` face ca orice alta adresa sa raspunda 404 (un document
// cu poarta C, `/legal/dpa` si `/legal/subprocessors`, nu e in lista). Rutele documentelor din `RUTE`
// (`rute-en-juridic.ts`) urmeaza aceeasi regula.
//
// INDEXUL (decizia 53, identitate cu `/juridic`): `/legal` e pagina de index, ca `/juridic` pe site-ul romanesc:
// bara fara element activ, firul pe doua niveluri, titlul colectiei si cardurile documentelor (`CarduriDocumente`).
// Firul unui document are trei niveluri: startul EN, indexul, documentul. Ruta indexului (`indexJuridic*` din
// manifestul editiei) face vie legatura din fir; nu intra inca in harta de site si nu are pereche hreflang, din
// motivul scris langa ea.
//
// CONGRUENTA (felia editie-juridic, decizia 53): pagina compune ACELEASI piese ca documentele `/juridic/*` ale
// site-ului romanesc, in aceeasi ordine: `ZonaJuridica` (bara documentelor), `FirPagina`, articolul cu
// `CorpDocument` si `SigiliuSha256` (amprenta textului randat). Piesele primesc documentele familiei `md` si textele
// EN prin proprietati optionale (mai jos); pagina RO nu le pasaza, deci randeaza ca inainte.
// Diferentele fata de `/juridic/*`, fiecare cu motivul: bara si cardurile au documentele publicate la poarta
// curenta (6, nu 7: setul juridic `md` e altul, codul `juridic-md` din `config/congruenta/temeiuri.json`), iar
// sectiunile poarta, ca inainte, `data-sectiune`: maparea lor pe atributele portilor (`MARCAJ_SECTIUNI_MD`) e o
// propunere la jurist, neaplicata pe pagina nici inainte de felie.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarduriDocumente from "@/components/juridic/CarduriDocumente";
import CorpDocument from "@/components/juridic/CorpDocument";
import SigiliuSha256, { amprentaSha256, type TexteSigiliu } from "@/components/juridic/SigiliuSha256";
import ZonaJuridica, { type TexteBara } from "@/components/juridic/ZonaJuridica";
import s from "@/components/juridic/juridic.module.css";
import FirPagina, { type NivelFir } from "@/components/primitive/FirPagina";
import { metadataPagina } from "@/components/seo/metadata";
import { familiePublicata, verificaComutator } from "@/content/juridic/comutator";
import { texteJuridice } from "@/content/juridic/index";
import { caleMd, cheiPublicate, cheiePentruSlug, slugMd, type CheieMd } from "@/content/juridic/md/registru";
import { META_DOCUMENTE_MD, linieVersiuneMd } from "@/content/juridic/pagini";
import { CALE_JURIDIC_EN, SCURT_MD } from "@/content/juridic/publicare";
import { textPentruAmprenta } from "@/content/juridic/tipuri";

export const dynamicParams = false;

const LIMBA = "en";

// Textele de interfata ale pieselor comune, in engleza. Stau aici, nu in `src/content/en/`: acolo fiecare modul e o
// pagina de continut (`pagina`, probele modelului comun). Titlul si eticheta barei, eticheta firului si nivelul
// "Home" sunt cele de pe paginile EN de azi; eticheta si explicatia sigiliului sunt text NOU, propus pe modelul
// celui romanesc (`SIGILIU`, `src/content/juridic/pagini.ts`), de aprobat pe capturi odata cu pagina.
const BARA: TexteBara = { titlu: "Legal", eticheta: "Legal documents" };
const ETICHETA_FIR = "Breadcrumb";
const START_FIR: NivelFir = { text: "Home", cale: "/" };
/** Nivelul intermediar al firului: indexul `/legal` (pe RO, "Documente juridice" spre `/juridic`). Text NOU, propus. */
const INDEX_FIR: NivelFir = { text: "Legal documents", cale: CALE_JURIDIC_EN };
/** Antetul indexului, pe modelul celui romanesc (`INDEX_PAGINA`). Text NOU, propus, de aprobat pe capturi. */
const INDEX_EN = {
  titlu: "3S legal documents",
  subtitlu: "The legal notice, privacy, cookies, terms, notice and action, and the use of AI, in six documents.",
};
/** Metadata indexului, pe modelul `META_INDEX_JURIDIC`. Text NOU, propus. */
const META_INDEX_EN = {
  titlu: "Legal documents of the 3S platform",
  descriere: "The 3S legal documents: Legal notice, Privacy policy, Cookie policy, Terms and conditions, Notice and action, and Artificial intelligence in 3S services.",
};
const SIGILIU_EN: TexteSigiliu = {
  eticheta: "Text fingerprint (SHA-256)",
  explicatie: "The SHA-256 fingerprint of this document's text, computed when the page was built. Any change to the text changes it.",
};

type Parametri = { params: Promise<{ document?: string[] }> };

/** Indexul si documentele publicate la poarta curenta, numai cu familia `md`; altfel niciunul. */
export function generateStaticParams(): { document: string[] }[] {
  verificaComutator();
  if (familiePublicata() !== "md") return [];
  return [{ document: [] }, ...cheiPublicate().map((cheie) => ({ document: [slugMd(cheie, LIMBA)] }))];
}

/** Pagina ceruta: indexul (`null`), cheia unui document, sau `undefined` (404). */
function paginaCeruta(document: string[] | undefined): CheieMd | null | undefined {
  if (familiePublicata() !== "md") return undefined;
  if (document === undefined || document.length === 0) return null;
  if (document.length !== 1) return undefined;
  const cheie = cheiePentruSlug(document[0], LIMBA);
  return cheie !== undefined && cheiPublicate().includes(cheie) ? cheie : undefined;
}

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const cheie = paginaCeruta((await params).document);
  if (cheie === undefined) notFound();
  if (cheie === null) return metadataPagina({ ...META_INDEX_EN, cale: CALE_JURIDIC_EN, editie: "en", cheie: "juridic" });
  return metadataPagina({ ...META_DOCUMENTE_MD[cheie][LIMBA], cale: caleMd(cheie, LIMBA), editie: "en", cheie });
}

/** Documentele barei, in ordinea registrului: cele publicate la poarta curenta, cu adresa din limba paginii. */
function documenteBara() {
  return cheiPublicate().map((c) => ({ cheie: c, scurt: SCURT_MD[c][LIMBA], cale: caleMd(c, LIMBA) }));
}

export default async function PaginaLegala({ params }: Parametri) {
  const cheie = paginaCeruta((await params).document);
  const texte = texteJuridice(undefined, { limba: LIMBA });
  if (cheie === undefined || texte === null) notFound();

  if (cheie === null) {
    return (
      <ZonaJuridica activ={null} documente={documenteBara()} texte={BARA}>
        <FirPagina niveluri={[START_FIR, INDEX_FIR]} eticheta={ETICHETA_FIR} />
        <header className={s.antetIndex}>
          <h1 className={"t-h1-interior " + s.titluIndex}>{INDEX_EN.titlu}</h1>
          <p className={s.subtitlu}>{INDEX_EN.subtitlu}</p>
        </header>
        <CarduriDocumente documente={documenteBara()} />
      </ZonaJuridica>
    );
  }

  const document = texte.get(cheie);
  if (document === undefined || document.versiune === undefined) {
    throw new Error("documentul " + cheie + " nu e construit sau nu are data versiunii");
  }

  const linie = linieVersiuneMd(document.versiune, LIMBA);
  const amprenta = amprentaSha256(textPentruAmprenta(document, linie));

  return (
    <ZonaJuridica activ={cheie} documente={documenteBara()} texte={BARA}>
      <FirPagina niveluri={[START_FIR, INDEX_FIR, { text: document.titlu, cale: caleMd(cheie, LIMBA) }]} eticheta={ETICHETA_FIR} />
      <article data-document={cheie}>
        <header className={s.antetDocument}>
          <h1 className={"t-h1-interior " + s.titluDocument}>{document.titlu}</h1>
          <div className={s.versiune}>
            <time dateTime={document.versiune}>{linie}</time>
          </div>
        </header>
        <CorpDocument document={document} />
      </article>
      <SigiliuSha256 amprenta={amprenta} texte={SIGILIU_EN} />
    </ZonaJuridica>
  );
}

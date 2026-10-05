// Paginile juridice ale editiei `ro-MD` (romana pentru Republica Moldova, sub `/ro` pe 3s.md): documentele
// familiei `md` publicate la poarta curenta, in romana, la adresele din `config/juridic-rute.json`
// (`/ro/juridic/<slug>`). Textele vin din modulele `src/content/juridic/md/*.ro.ts`, compuse de `texteJuridice`
// pe operatorul si pe starea masurarii. Pereche cu `src/app/(en)/legal/[[...document]]/page.en.tsx`.
//
// COMUTATORUL, ca la paginile `/juridic` ale familiei SEE: `generateStaticParams` da documentele numai cand
// familia publicata e `md`, iar `dynamicParams = false` face ca orice alta adresa sa raspunda 404 (un document
// cu poarta C, `/ro/juridic/dpa` si `/ro/juridic/subimputerniciti`, nu e in lista). Rutele documentelor din
// `RUTE` (`rute-ro-md.ts`) urmeaza aceeasi regula.
//
// INDEXUL (decizia 53, identitate cu `/juridic`): `/ro/juridic` e pagina de index, ca `/juridic` pe site-ul
// romanesc: bara fara element activ, firul pe doua niveluri, titlul colectiei si cardurile documentelor. Firul unui
// document are trei niveluri: startul editiei (`/ro`), indexul, documentul. Ruta indexului (`indexJuridic*` din
// manifestul editiei) face vie legatura din fir; nu intra inca in harta de site si nu are pereche hreflang, din
// motivul scris langa ea.
//
// CONGRUENTA (felia editie-juridic, decizia 53): pagina compune ACELEASI piese ca documentele `/juridic/*` ale
// site-ului romanesc, in aceeasi ordine: `ZonaJuridica` (bara documentelor), `FirPagina`, articolul cu
// `CorpDocument` si `SigiliuSha256` (amprenta textului randat). Piesele primesc documentele familiei `md` prin
// proprietati optionale; textele barei, ale firului si ale sigiliului raman cele romanesti ale pieselor, iar
// startul firului e `/ro`. Pagina RO nu pasaza nimic, deci randeaza ca inainte.
// Diferentele fata de `/juridic/*`, fiecare cu motivul: firul incepe la `/ro`, nu la `/`; bara si cardurile au
// documentele publicate la poarta curenta (6, nu 7: setul juridic `md` e altul, codul `juridic-md` din
// `config/congruenta/temeiuri.json`); subtitlul indexului numara documentele editiei; iar sectiunile poarta, ca
// inainte, `data-sectiune`: maparea lor pe atributele portilor (`MARCAJ_SECTIUNI_MD`) e o propunere la jurist,
// neaplicata pe pagina nici inainte de felie.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarduriDocumente from "@/components/juridic/CarduriDocumente";
import CorpDocument from "@/components/juridic/CorpDocument";
import SigiliuSha256, { amprentaSha256 } from "@/components/juridic/SigiliuSha256";
import ZonaJuridica from "@/components/juridic/ZonaJuridica";
import s from "@/components/juridic/juridic.module.css";
import FirPagina, { type NivelFir } from "@/components/primitive/FirPagina";
import { metadataPagina } from "@/components/seo/metadata";
import { familiePublicata, verificaComutator } from "@/content/juridic/comutator";
import { texteJuridice } from "@/content/juridic/index";
import { caleMd, cheiPublicate, cheiePentruSlug, slugMd, type CheieMd } from "@/content/juridic/md/registru";
import { INDEX_PAGINA, META_DOCUMENTE_MD, linieVersiuneMd } from "@/content/juridic/pagini";
import { CALE_JURIDIC_RO_MD, INDEX_JURIDIC, SCURT_MD } from "@/content/juridic/publicare";
import { textPentruAmprenta } from "@/content/juridic/tipuri";

export const dynamicParams = false;

const LIMBA = "ro";

/** Primul nivel al firului: startul editiei RO-MD (`/ro`), nu `/`, care e startul EN. */
const START_FIR: NivelFir = { text: "Acasă", cale: "/ro" };
/** Nivelul intermediar al firului: indexul editiei, cu numele din `/juridic` ("Documente juridice"). */
const INDEX_FIR: NivelFir = { text: INDEX_JURIDIC.scurt, cale: CALE_JURIDIC_RO_MD };
/**
 * Antetul indexului: titlul colectiei e cel romanesc (`INDEX_PAGINA.titlu`); subtitlul romanesc numara cele 7
 * documente SEE si licenta, pe care setul `md` nu le are, deci aici e text NOU, propus, pe documentele editiei.
 */
const INDEX_RO_MD = {
  titlu: INDEX_PAGINA.titlu,
  subtitlu: "Informațiile legale, datele personale, cookie-urile, termenii, regulile de notificare și inteligența artificială, în șase documente.",
};
/** Metadata indexului, pe modelul `META_INDEX_JURIDIC`. Text NOU, propus. */
const META_INDEX_RO_MD = {
  titlu: "Documentele juridice ale platformei 3S",
  descriere: "Informațiile legale, politica de confidențialitate, politica de cookie-uri, termenii, notificarea și acțiunea și inteligența artificială în 3S.",
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
  if (cheie === null) return metadataPagina({ ...META_INDEX_RO_MD, cale: CALE_JURIDIC_RO_MD, editie: "ro-MD", cheie: "juridic" });
  return metadataPagina({ ...META_DOCUMENTE_MD[cheie][LIMBA], cale: caleMd(cheie, LIMBA), editie: "ro-MD", cheie });
}

/** Documentele barei, in ordinea registrului: cele publicate la poarta curenta, cu adresa din limba paginii. */
function documenteBara() {
  return cheiPublicate().map((c) => ({ cheie: c, scurt: SCURT_MD[c][LIMBA], cale: caleMd(c, LIMBA) }));
}

export default async function PaginaJuridicaRoMd({ params }: Parametri) {
  const cheie = paginaCeruta((await params).document);
  const texte = texteJuridice(undefined, { limba: LIMBA });
  if (cheie === undefined || texte === null) notFound();

  if (cheie === null) {
    return (
      <ZonaJuridica activ={null} documente={documenteBara()}>
        <FirPagina niveluri={[START_FIR, INDEX_FIR]} />
        <header className={s.antetIndex}>
          <h1 className={"t-h1-interior " + s.titluIndex}>{INDEX_RO_MD.titlu}</h1>
          <p className={s.subtitlu}>{INDEX_RO_MD.subtitlu}</p>
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
    <ZonaJuridica activ={cheie} documente={documenteBara()}>
      <FirPagina niveluri={[START_FIR, INDEX_FIR, { text: document.titlu, cale: caleMd(cheie, LIMBA) }]} />
      <article data-document={cheie}>
        <header className={s.antetDocument}>
          <h1 className={"t-h1-interior " + s.titluDocument}>{document.titlu}</h1>
          <div className={s.versiune}>
            <time dateTime={document.versiune}>{linie}</time>
          </div>
        </header>
        <CorpDocument document={document} />
      </article>
      <SigiliuSha256 amprenta={amprenta} />
    </ZonaJuridica>
  );
}

// Subsolul global: brandul, cele 5 coloane de legaturi (filtrate pe caile existente; o coloana fara
// nicio legatura vizibila nu se randeaza), banda de insigne si randul de jos cu drepturile, limba si
// retelele. Insignele sunt fapte din registrul de afirmatii (plan D4c, D5), nu legaturi.
//
// DOAR BRANDUL (owner, 24.09, plan S4 §7): sigla oficiala intreaga, la o marime la care se citeste
// fiecare rand (DIRECTIA.md, "Sigla"), si drepturile in numele marcii. Nicio data de firma - nici
// denumire, nici sediu, registru, cod fiscal sau telefon - si niciun bloc de identificare. Adresa
// de e-mail apare numai daca `config/brand.json` are una confirmata; altfel randul lipseste.
//
// PE EDITIE (felia navigatie-pe-editie): contractul si multimea cailor vin ca proprietati, cu IMPLICITUL de
// azi (`NAVIGATIE_RO`, `CAI_EXISTENTE`), deci layout-ul romanesc randeaza ca inainte. Contractul unei
// editii poate aduce coloana de canale (WhatsApp cu textul paginii, numarul de WhatsApp numai ca text - fara
// legatura de apel, decizia 56 -, e-mailul numai cu adresa domeniului), o legatura in limba tarii firmei, in randul de jos si
// eticheta butonului de setari cookie. Campurile goale (slogan, descriere, insigne) nu lasa elemente goale.
//
// ASEZAREA (`src/lib/asezare.ts`): contractul poarta cai SURSA; existenta se verifica pe ele (`vizibile`, `seVede`),
// iar fiecare adresa interna scrisa in `href` (sigla, coloanele, legatura locala) e SERVITA (`hrefTinta`,
// `legaturaLocalaServita`, care scrie si `hrefLang` pe limba servita). Posta si retelele sunt adrese externe, pe care
// asezarea nu le alege. Pe asezarea `md` toate sunt identitatea.

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import LegaturaCanal from "@/components/canale/LegaturaCanal";
import SetariCookie from "@/components/consimtamant/SetariCookie";
import { CAI_EXISTENTE } from "@/content/cai";
import { RUTE } from "@/content/rute";
import { stareAnalitica } from "@/lib/analitica";
import {
  NAVIGATIE_RO,
  legaturaLocalaServita,
  seVede,
  vizibile,
  type CaiExistente,
  type ContractNavigatie,
  type Legatura,
} from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import SiglaTert from "@/components/primitive/SiglaTert";
import { hrefTinta } from "@/components/primitive/Tinta";
import SelectorLimba from "./SelectorLimba";
import SiglaMarca from "./SiglaMarca";
import s from "./Subsol.module.css";

/**
 * Tinta e in afara routerului site-ului (posta, alt domeniu)? Atunci legatura e un `<a>` simplu, nu `Link`:
 * routerul ar trata `mailto:...` ca pe o cale interna. Legaturile de apel au iesit odata cu decizia 56.
 */
export function esteExterna(href: string): boolean {
  return /^(mailto:|https?:)/.test(href);
}

/**
 * Textul unei legaturi din coloane, cu fiecare cuvant care contine o cratima tinut pe un singur rand: in coloana
 * ingusta a subsolului navigatorul rupea dupa cratima din cuvant ("cookie-" / "uri"). Spatiile raman puncte de
 * rupere, deci legatura lunga trece tot pe doua randuri, dar intre cuvinte. Textul (si `textContent`) e acelasi.
 */
export function cuvinteNerupte(text: string, clasa: string): ReactNode {
  const bucati = text.split(/(\S*\p{L}-\p{L}\S*)/u);
  if (bucati.length === 1) return text;
  return bucati.map((b, i) =>
    i % 2 === 1 ? (
      <span key={i} className={clasa}>
        {b}
      </span>
    ) : (
      b
    ),
  );
}

/** Legatura scurta (cel mult trei cuvinte): de la 1200 px nu se rupe deloc (Subsol.module.css, `.scurta`). */
export function esteScurta(text: string): boolean {
  return text.trim().split(/\s+/).length <= 3;
}

function Legaturi({ legatura, className, text }: { legatura: Legatura; className: string; text?: ReactNode }) {
  const href = legatura.href ?? "/";
  const continut = text ?? legatura.text;
  if (esteExterna(href)) {
    return (
      <a href={href} className={className}>
        {continut}
      </a>
    );
  }
  return (
    <Link href={hrefTinta(href)} className={className}>
      {continut}
    </Link>
  );
}

/**
 * Latura iconitei marcii in subsol (decizia D10: doar iconita, fara randurile de text ale siglei
 * oficiale). 56 px: "3S" din iconita iese mai mare decat in antet (40 px), iar blocul brandului
 * ramane mai scund decat cu sigla completa de 96 px. Masuratoarea, in docs/design/DIRECTIA.md.
 */
export const INALTIME_SIGLA_SUBSOL = 56;

/**
 * Primul rand al drepturilor, mereu in numele marcii (plan §7): anul, marca si, daca exista,
 * mentiunea. Mentiunea goala nu lasa separatorul in urma.
 */
export function randDrepturi(
  an: number,
  copyright: ContractNavigatie["subsol"]["copyright"] = NAVIGATIE_RO.subsol.copyright,
): string {
  const { detinator, mentiune } = copyright;
  return "© " + an + " " + detinator + (mentiune.trim() === "" ? "" : " · " + mentiune);
}

export type SubsolProps = {
  /** Contractul de navigatie al editiei; implicit cel romanesc. */
  navigatie?: ContractNavigatie;
  /** Caile care exista; implicit cele ale build-ului. */
  cai?: CaiExistente;
};

export default function Subsol({ navigatie = NAVIGATIE_RO, cai = CAI_EXISTENTE }: SubsolProps) {
  const SUBSOL = navigatie.subsol;
  const ANTET = navigatie.antet;
  const coloane = SUBSOL.coloane
    .map((c) => ({ ...c, legaturi: vizibile(c.legaturi, cai) }))
    .filter((c) => c.legaturi.length > 0);
  const retele = vizibile(SUBSOL.retele, cai);
  const posta = seVede(SUBSOL.brand.posta, cai) ? SUBSOL.brand.posta : null;
  const an = new Date().getFullYear();
  const contact = SUBSOL.contact ?? null;
  const areContact = contact !== null && (contact.whatsapp !== null || contact.numar !== null || contact.email !== null);
  const locala = SUBSOL.legaturaLocala && seVede(SUBSOL.legaturaLocala, cai) ? legaturaLocalaServita(SUBSOL.legaturaLocala, RUTE) : null;
  // Glosa legaturii locale (pe 3s.md: "in Romanian" langa eticheta romaneasca a informatiilor legale), in limba
  // PAGINII, deci in afara elementului cu `lang` al legaturii. Campul e optional si lipseste din contractul romanesc:
  // acolo nu se scrie nimic.
  const glosa = locala !== null && "glosa" in locala && typeof locala.glosa === "string" && locala.glosa !== "" ? locala.glosa : null;
  // Grila are 5 coloane de legaturi pe contractul romanesc (fara coloana de canale si fara atribut de stil);
  // pe un contract cu canale, numarul de coloane trece prin variabila CSS. Atributul lipseste cu totul pe contractul
  // romanesc: un `style` nedefinit ar intra totusi in datele paginii (masurat pe proba de invarianta RO).
  const nrColoane = coloane.length + (areContact ? 1 : 0);
  // Cuvintele cu cratima din legaturi (`cuvinteNerupte`) se tin intregi numai pe contractele editiilor: pe contractul
  // romanesc coloanele sunt mai late (fara coloana de canale), iar HTML-ul lui ramane cel fixat de proba de invarianta.
  // Selectorul si butonul de setari sunt piese de browser: tot ce primesc ajunge in datele paginii. Pe contractul
  // romanesc nu primesc nimic in plus (implicitele lor sunt aceleasi valori), deci HTML-ul servit ramane identic.
  const peContractRo = navigatie === NAVIGATIE_RO;
  const limbaContract = peContractRo ? {} : { limbi: navigatie.limbi, eticheta: navigatie.selector.eticheta };
  const textSetari = SUBSOL.setariCookie === undefined ? {} : { text: SUBSOL.setariCookie };
  // `--coloane-legaturi`: coloanele de legaturi fara cea de canale; de la 1200 px coloana de canale ia latimea
  // continutului ei, ca numarul de WhatsApp sa stea pe un rand (Subsol.module.css).
  const stilGrila: CSSProperties | undefined =
    SUBSOL.contact === undefined
      ? undefined
      : ({ "--coloane-subsol": Math.max(nrColoane, 1), "--coloane-legaturi": Math.max(coloane.length, 1) } as CSSProperties);

  return (
    <footer className={s.subsol}>
      <div className="container-site">
        <div className={s.grila} {...(stilGrila === undefined ? {} : { style: stilGrila })}>
          <div className={s.brand}>
            <Link href={hrefTinta(ANTET.sigla.href ?? "/")} className={s.brandSigla} aria-label={ANTET.sigla.text}>
              <SiglaMarca inaltime={INALTIME_SIGLA_SUBSOL} />
            </Link>
            {SUBSOL.brand.slogan === "" ? null : <p className={s.slogan}>{SUBSOL.brand.slogan}</p>}
            {SUBSOL.brand.descriere === "" ? null : <p className={s.descriere}>{SUBSOL.brand.descriere}</p>}
            {posta ? (
              <a href={posta.href ?? undefined} className={s.posta}>
                <Iconita nume="mail" marime={14} contur={2} />
                <span>{posta.text}</span>
              </a>
            ) : null}
          </div>

          {coloane.map((c) => (
            <nav key={c.titlu} aria-label={c.titlu}>
              <h2 className={s.coloanaTitlu}>{c.titlu}</h2>
              <ul className={s.lista}>
                {c.legaturi.map((l) => (
                  <li key={l.text}>
                    <Legaturi
                      legatura={l}
                      className={peContractRo || !esteScurta(l.text) ? s.legatura : s.legatura + " " + s.scurta}
                      {...(peContractRo ? {} : { text: cuvinteNerupte(l.text, s.nerupt) })}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {areContact && contact !== null ? (
            <nav aria-label={contact.titlu} data-subsol-contact="">
              <h2 className={s.coloanaTitlu}>{contact.titlu}</h2>
              <ul className={s.lista}>
                {contact.whatsapp !== null ? (
                  <li>
                    <LegaturaCanal legatura={contact.whatsapp.legatura} canal="whatsapp" className={s.legatura}>
                      {contact.whatsapp.text}
                    </LegaturaCanal>
                  </li>
                ) : null}
                {contact.numar !== null ? (
                  <li>
                    <span className={s.legatura} data-numar-whatsapp="">
                      {contact.numar}
                    </span>
                  </li>
                ) : null}
                {contact.email !== null ? (
                  <li>
                    <LegaturaCanal legatura={contact.email.legatura} canal="email" className={s.legatura}>
                      {contact.email.text}
                    </LegaturaCanal>
                  </li>
                ) : null}
              </ul>
            </nav>
          ) : null}
        </div>

        {SUBSOL.insigne.length === 0 ? null : (
          <ul className={s.insigne}>
            {SUBSOL.insigne.map((i) => (
              <li key={i.text} className={s.insigna}>
                <Iconita nume={i.iconita} marime={14} contur={2} className={s.insignaIconita} />
                <span>{i.text}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={s.jos}>
          <div className={s.drepturi}>
            <p>{randDrepturi(an, SUBSOL.copyright)}</p>
            <p>{SUBSOL.copyright.drepturi}</p>
            {locala !== null ? (
              <p>
                <Link href={locala.href ?? "/"} className={s.legatura} lang={locala.lang} hrefLang={locala.hrefLang}>
                  {locala.text}
                </Link>
                {glosa === null ? null : <span data-glosa-locala="">{" (" + glosa + ")"}</span>}
              </p>
            ) : null}
            {/* Retragerea consimtamantului, pe orice pagina (felia seo-geo-gdpr, plan S4 §9): numai
                cand analitica e pornita, fiindca altfel n-ar avea ce setari sa deschida. */}
            {stareAnalitica().activa ? <SetariCookie className={s.setariCookie} {...textSetari} /> : null}
          </div>
          <div className={s.dreapta}>
            <SelectorLimba cai={cai} directie="sus" {...limbaContract} />
            {retele.length > 0 ? (
              <>
                <span className={s.urmariti}>{SUBSOL.urmariti}</span>
                <ul className={s.retele}>
                  {retele.map((r) => (
                    <li key={r.retea}>
                      <a href={r.href ?? undefined} className={s.retea} aria-label={r.text}>
                        <SiglaTert cheie={r.retea} marime={16} contur={2} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Subsolul global: brandul, cele 5 coloane de legaturi (filtrate pe caile existente; o coloana fara
// nicio legatura vizibila nu se randeaza), banda de insigne si randul de jos cu drepturile, limba si
// retelele. Insignele sunt fapte din registrul de afirmatii (plan D4c, D5), nu legaturi.
//
// DOAR BRANDUL (owner, 24.09, plan S4 §7): sigla oficiala intreaga, la o marime la care se citeste
// fiecare rand (DIRECTIA.md, "Sigla"), si drepturile in numele marcii. Nicio data de firma - nici
// denumire, nici sediu, registru, cod fiscal sau telefon - si niciun bloc de identificare. Adresa
// de e-mail apare numai daca `config/brand.json` are una confirmata; altfel randul lipseste.

import Link from "next/link";
import SetariCookie from "@/components/consimtamant/SetariCookie";
import { CAI_EXISTENTE } from "@/content/cai";
import { stareAnalitica } from "@/lib/analitica";
import { ANTET, SUBSOL, seVede, vizibile, type Legatura } from "@/content/navigatie";
import Iconita from "@/components/primitive/Iconita";
import SiglaTert from "@/components/primitive/SiglaTert";
import SelectorLimba from "./SelectorLimba";
import SiglaMarca from "./SiglaMarca";
import s from "./Subsol.module.css";

function Legaturi({ legatura, className }: { legatura: Legatura; className: string }) {
  const href = legatura.href ?? "/";
  if (/^(mailto:|https?:)/.test(href)) {
    return (
      <a href={href} className={className}>
        {legatura.text}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {legatura.text}
    </Link>
  );
}

/**
 * Inaltimea siglei complete in subsol (227,8 x 96). Masurat pe pixeli, la 1440 si la 390: ADRIA are
 * literele de 17 px, DOC MANAGEMENT de 9, scan-store-solve de 9 - fiecare rand trece de majusculele
 * unui text de 11 px al site-ului (8 px). La 88 px randul de jos cobora la 8, adica fara nicio marja.
 */
export const INALTIME_SIGLA_SUBSOL = 96;

/** Primul rand al drepturilor, mereu in numele marcii (plan §7): anul, marca si numele din sigla. */
export function randDrepturi(an: number): string {
  return "© " + an + " " + SUBSOL.copyright.detinator + " · " + SUBSOL.copyright.mentiune;
}

export default function Subsol() {
  const cai = CAI_EXISTENTE;
  const coloane = SUBSOL.coloane
    .map((c) => ({ ...c, legaturi: vizibile(c.legaturi, cai) }))
    .filter((c) => c.legaturi.length > 0);
  const retele = vizibile(SUBSOL.retele, cai);
  const posta = seVede(SUBSOL.brand.posta, cai) ? SUBSOL.brand.posta : null;
  const an = new Date().getFullYear();

  return (
    <footer className={s.subsol}>
      <div className="container-site">
        <div className={s.grila}>
          <div className={s.brand}>
            <Link href="/" className={s.brandSigla} aria-label={ANTET.sigla.text}>
              <span className={s.siglaDeschisa}>
                <SiglaMarca forma="completa" inaltime={INALTIME_SIGLA_SUBSOL} />
              </span>
              <span className={s.siglaInchisa}>
                <SiglaMarca forma="completa" tema="inchis" inaltime={INALTIME_SIGLA_SUBSOL} />
              </span>
            </Link>
            <p className={s.slogan}>{SUBSOL.brand.slogan}</p>
            <p className={s.descriere}>{SUBSOL.brand.descriere}</p>
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
                    <Legaturi legatura={l} className={s.legatura} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <ul className={s.insigne}>
          {SUBSOL.insigne.map((i) => (
            <li key={i.text} className={s.insigna}>
              <Iconita nume={i.iconita} marime={14} contur={2} className={s.insignaIconita} />
              <span>{i.text}</span>
            </li>
          ))}
        </ul>

        <div className={s.jos}>
          <div className={s.drepturi}>
            <p>{randDrepturi(an)}</p>
            <p>{SUBSOL.copyright.drepturi}</p>
            {/* Retragerea consimtamantului, pe orice pagina (felia seo-geo-gdpr, plan S4 §9): numai
                cand analitica e pornita, fiindca altfel n-ar avea ce setari sa deschida. */}
            {stareAnalitica().activa ? <SetariCookie className={s.setariCookie} /> : null}
          </div>
          <div className={s.dreapta}>
            <SelectorLimba cai={cai} directie="sus" />
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

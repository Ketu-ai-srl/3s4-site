// Intrebarile de pe start (acasa.md §12), ancora `#intrebari`: titlul si cardul, fiecare cu
// aparitie la derulare, acordeonul in varianta `start` (prima intrebare deschisa, una singura),
// apoi fraza cu adresa de posta.
//
// LEGATURA DIN RASPUNS (optionala, pe intrebare): `legaturaInText` pune o legatura pe numele unei pagini din
// raspuns ("... pe pagina Legal information."), la randare. Raspunsul ramane sir in continut, fiindca acelasi sir
// ajunge in nodul FAQPage din datele structurate; fara proprietate (implicitul RO) raspunsul trece neatins, deci
// HTML-ul ramane acelasi. Adresa scrisa e cea SERVITA pe domeniu (`cuLegatura`, prin `hrefTinta`).
//
// TEXTUL DE DUPA LEGATURA FRAZEI DE SUB INTREBARI (optional, `dupaSubsol`): punctul final sta in afara legaturii, ca
// textul legaturii sa fie numai numele tintei. Proprietatea sta la nivelul continutului, nu in `subsol`: pagina care
// schimba fraza dupa canalele domeniului (adresa de posta) inlocuieste `subsol` intreg, iar punctul trebuie sa ramana
// pe ambele forme. Fara proprietate (implicitul RO) paragraful are exact copiii de dinainte: o expresie `undefined` in
// plus ar ajunge in fluxul RSC ca `$undefined` (masurat: invarianta RO a startului a picat cu 11 caractere), deci
// ramura fara text dupa legatura e scrisa separat.

import { ANCORE_ACASA, INTREBARI } from "@/content/acasa";
import type { Legatura } from "@/content/navigatie";
import Acordeon from "@/components/primitive/Acordeon";
import Reveal from "@/components/primitive/Reveal";
import Tinta from "@/components/primitive/Tinta";
import { cuLegatura, type LegaturaInText } from "@/components/produs/legaturaInText";
import s from "./acasa.module.css";

/** Continutul intrebarilor, pe editie; tip structural, constanta RO (`INTREBARI`) il satisface. */
export type ContinutFaqAcasa = {
  titlu: string;
  /** `legaturaInText`: numele unei pagini din raspuns, facut legatura la randare (lipsa = raspunsul ca text). */
  intrebari: { intrebare: string; raspuns: string; legaturaInText?: LegaturaInText }[];
  /** Fraza de sub card: `inainte` + adresa de posta ca legatura. */
  subsol: { inainte: string; posta: Legatura };
  /** Textul lipit dupa legatura frazei de sub card (de pilda punctul final); lipsa = nimic. */
  dupaSubsol?: string;
};

export type FaqAcasaProps = {
  continut?: ContinutFaqAcasa;
  /** Ancora sectiunii (pe RO: `intrebari`). */
  ancora?: string;
};

export default function FaqAcasa({ continut = INTREBARI, ancora = ANCORE_ACASA.intrebari }: FaqAcasaProps) {
  const c = continut;
  const posta = (
    <Tinta legatura={c.subsol.posta} className={s.intrebariPosta}>
      {c.subsol.posta.text}
    </Tinta>
  );
  return (
    <section id={ancora} className="sectiune-standard" aria-labelledby="intrebari-titlu">
      <div className="container-site">
        <Reveal>
          <h2 id="intrebari-titlu" className={"t-h2-sectiune " + s.intrebariTitlu}>
            {c.titlu}
          </h2>
        </Reveal>
        <Reveal>
          <Acordeon
            varianta="start"
            elemente={c.intrebari.map((i) => ({
              intrebare: i.intrebare,
              raspuns: i.legaturaInText === undefined ? i.raspuns : cuLegatura(i.raspuns, i.legaturaInText),
            }))}
          />
        </Reveal>
        {c.dupaSubsol === undefined ? (
          <p className={s.intrebariSubsol}>
            {c.subsol.inainte}{" "}
            {posta}
          </p>
        ) : (
          <p className={s.intrebariSubsol}>
            {c.subsol.inainte}{" "}
            {posta}
            {c.dupaSubsol}
          </p>
        )}
      </div>
    </section>
  );
}

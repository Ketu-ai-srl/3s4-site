// Eroul paginilor interioare, pe blocul de 880 (DIRECTIA.md, "EroulInterior"): fir de pagina,
// h1 interior 44 (30,4 la 390), subtitlu 18/28,8 ardezie-5 max 640. Cinci variante masurate:
//
//   standard      padding 120 / 0 / 40 (88 / 0 / 24)                      integrari, securitate, preturi...
//   sector        fir pe 3 niveluri, 2 butoane (plin-plat + fantoma), nota; padding 120 / 24
//   hub           rand de dovada 14/500, fara nota; subtitlul cu margine 12; padding jos 40
//   cu-intoarcere legatura "inapoi", h1 max 20ch, actiuni proprii, rand de incredere; padding jos 0
//   centrat       invelis 600, fir centrat ascuns sub 600, h1 de inregistrare
//
// Butoanele si actiunile se dau ca noduri: fiecare pagina isi alege textele si tintele, forma ramane.

import type { ReactNode } from "react";
import type { Legatura } from "@/content/navigatie";
import FirPagina, { type NivelFir } from "./FirPagina";
import Iconita from "./Iconita";
import Tinta from "./Tinta";
import s from "./bloc.module.css";

export type VariantaErouInterior = "standard" | "sector" | "hub" | "cu-intoarcere" | "centrat";

export type EroulInteriorProps = {
  varianta?: VariantaErouInterior;
  fir: NivelFir[];
  titlu: ReactNode;
  subtitlu?: ReactNode;
  /** `sector`, `hub`, `cu-intoarcere`: randul de actiuni (butoane, legatura secundara). */
  actiuni?: ReactNode;
  /** `sector`: nota de sub butoane. */
  nota?: ReactNode;
  /** `hub`: randul de dovada de sub subtitlu. */
  dovada?: ReactNode;
  /** `cu-intoarcere`: legatura inapoi, deasupra titlului. */
  inapoi?: Legatura;
  /** `cu-intoarcere`: elementele randului de incredere, despartite prin puncte. */
  incredere?: string[];
  idTitlu?: string;
};

export default function EroulInterior({
  varianta = "standard",
  fir,
  titlu,
  subtitlu,
  actiuni,
  nota,
  dovada,
  inapoi,
  incredere,
  idTitlu,
}: EroulInteriorProps) {
  const clasaSectiune =
    varianta === "sector" ? s.erouSector : varianta === "cu-intoarcere" ? s.erouFaraJos : s.erou;
  const centrat = varianta === "centrat";
  const clasaTitlu = centrat
    ? "t-h1-inregistrare " + s.erouTitlu
    : varianta === "cu-intoarcere"
      ? "t-h1-interior " + s.erouTitluEnterprise
      : "t-h1-interior " + s.erouTitlu;
  const clasaSubtitlu = [
    s.erouSubtitlu,
    varianta === "sector" ? s.erouSubtitluSector : "",
    varianta === "hub" ? s.erouSubtitluHub : "",
    varianta === "hub" && !dovada ? s.erouSubtitluSector : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={clasaSectiune}>
      <div className="container-site">
        <div className={centrat ? s.erouCentrat : s.erouBloc}>
          <FirPagina niveluri={fir} aliniere={centrat ? "centru" : "stanga"} ascunsSub600={centrat} />
          {inapoi ? (
            <Tinta legatura={inapoi} className={s.erouInapoi}>
              <Iconita nume="arrow-left" marime={14} contur={2} />
              <span>{inapoi.text}</span>
            </Tinta>
          ) : null}
          <h1 id={idTitlu} className={clasaTitlu}>
            {titlu}
          </h1>
          {subtitlu ? <p className={clasaSubtitlu}>{subtitlu}</p> : null}
          {varianta === "hub" && dovada ? <p className={s.erouDovada}>{dovada}</p> : null}
          {actiuni ? (
            <div className={[s.erouActiuni, varianta === "cu-intoarcere" ? s.erouActiuniEnterprise : ""].join(" ")}>
              {actiuni}
            </div>
          ) : null}
          {varianta === "sector" && nota ? <p className={s.erouNota}>{nota}</p> : null}
          {varianta === "cu-intoarcere" && incredere && incredere.length > 0 ? (
            <ul className={s.erouIncredere}>
              {incredere.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

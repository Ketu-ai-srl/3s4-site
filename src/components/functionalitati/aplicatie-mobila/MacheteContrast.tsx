// S6 - machetele contrastului (functionalitati__aplicatie-mobila.md, S6), varianta cu machete a cadrului:
//
//   Inainte  foaia de hartie a avizului (366 x 150, rotita -1,5 grade): antet mono cu numarul, 4 bare de
//            text, o semnatura desenata de noi, locul si un avertisment rosu.
//   Acum     telefonul in miniatura (fundal `negru-cinema`) cu un card: bara aplicatiei, actul, 3 pasi (ultimul
//            gata, verde), locul si confirmarea verde.
//
// ABATERE CERUTA DISPECERULUI (nu facuta aici, cadrul e inghetat): la referinta pe coloana dintre carduri
// coboara un punct `albastru` in 2,6 s; `ContrastInainteAcum` are numai linia. Pagina ramane cu linia.

import { CONTRAST_MOBILA } from "@/content/functionalitati/aplicatie-mobila";
import s from "./mobila.module.css";

export function FoaieAviz() {
  const d = CONTRAST_MOBILA.inainte;
  return (
    <figure className={s.foaieAviz} data-macheta="aviz-hartie">
      <p className={s.antetAviz}>
        {d.antet} <span className={s.exemplu}>{d.exemplu}</span>
      </p>
      <span className={s.bareAviz} aria-hidden="true">
        <span style={{ width: "92%" }} />
        <span style={{ width: "64%" }} />
        <span style={{ width: "86%" }} />
        <span style={{ width: "48%" }} />
      </span>
      <svg className={s.semnaturaAviz} viewBox="0 0 200 40" aria-hidden="true" focusable="false">
        <path
          d="M8 30 C 24 8, 34 34, 48 22 S 70 6, 82 24 S 104 36, 118 18 S 146 10, 160 26 S 184 30, 194 14"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <p className={s.josAviz}>
        <span className={s.locAviz}>{d.loc}</span>
        <span className={s.avertismentAviz}>{d.avertisment}</span>
      </p>
      <figcaption className="doar-cititor">{d.declaratie}</figcaption>
    </figure>
  );
}

export function TelefonMini() {
  const d = CONTRAST_MOBILA.acum;
  return (
    <figure className={s.telefonMini} data-macheta="telefon-mini">
      <div className={s.cardMini}>
        <div className={s.baraMini}>
          <span className={s.punctAlbastru} aria-hidden="true" />
          <span className={s.aplicatieMini}>{d.aplicatie}</span>
          <span className={s.oraMini}>{d.ora}</span>
        </div>
        <span className={s.cipMini}>
          <span className={s.etPdfMini}>PDF</span>
          <span className={s.numeMini}>{d.document}</span>
        </span>
        <ol className={s.pasiMini}>
          {d.pasi.map((p, i) => (
            <li key={p} className={[s.pasMini, i === d.pasi.length - 1 ? s.pasGata : ""].filter(Boolean).join(" ")}>
              <span className={s.punctPasMini} aria-hidden="true" />
              {p}
            </li>
          ))}
        </ol>
      </div>
      <p className={s.josMini}>
        <span className={s.locMini}>{d.loc}</span>
        <span className={s.confirmareMini}>{d.confirmare}</span>
      </p>
      <figcaption className="doar-cititor">{d.declaratie}</figcaption>
    </figure>
  );
}

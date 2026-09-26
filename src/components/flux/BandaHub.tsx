"use client";

// Banda "hub" de pe /flux-documente (flux-documente.md §3): fraza si textul la stanga, la dreapta
// hub-ul de 560x300 cu 3 documente, 7 linii SVG, nucleul si 3 grupuri de iesiri.
//
// Paralaxa legata de derulare: documentele +22 -> -22 px, iesirile -14 -> +14, nucleul -6 -> +6. La
// referinta miscarea se termina inainte ca banda sa intre in ecran (masurat la 1440), deci la vedere
// hub-ul pare static; aici paralaxa se desfasoara cat banda traverseaza fereastra, ca sa se si
// vada. La miscare redusa nu porneste (elementele raman in pozitia de repaus, 0).
// Sub 600 px liniile se ascund si totul trece pe o coloana (CSS).

import { Bot, Building, Check, FileSignature, FileText, Landmark, Mail, Network } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { HUB } from "@/content/flux";
import s from "./flux.module.css";

const ICONITE: Record<string, (m: number) => ReactNode> = {
  "file-text": (m) => <FileText width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  "file-signature": (m) => <FileSignature width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  landmark: (m) => <Landmark width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  mail: (m) => <Mail width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  building: (m) => <Building width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  network: (m) => <Network width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
  bot: (m) => <Bot width={m} height={m} strokeWidth={1.5} aria-hidden="true" />,
};

// Traseele masurate (viewBox 560x300): 3 intrari si 4 iesiri.
const TRASEE = [
  "M186 64 C 222 64, 224 150, 256 150",
  "M186 150 L 256 150",
  "M186 236 C 222 236, 224 150, 256 150",
  "M304 150 C 350 150, 350 52, 396 52",
  "M304 150 C 350 150, 350 110, 396 110",
  "M304 150 C 350 150, 350 168, 396 168",
  "M304 150 C 350 150, 350 246, 396 246",
];

export default function BandaHub() {
  const banda = useRef<HTMLElement | null>(null);
  const documente = useRef<HTMLDivElement | null>(null);
  const iesiri = useRef<HTMLDivElement | null>(null);
  const nucleu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = banda.current;
    if (!b) return;
    let cadru = 0;
    const aplica = () => {
      cadru = 0;
      const r = b.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 cand banda intra pe jos, 1 cand iese pe sus.
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      const t = p * 2 - 1;
      if (documente.current) documente.current.style.transform = "translateY(" + (-22 * t).toFixed(1) + "px)";
      if (iesiri.current) iesiri.current.style.transform = "translateY(" + (14 * t).toFixed(1) + "px)";
      if (nucleu.current) nucleu.current.style.translate = "0 " + (6 * t).toFixed(1) + "px";
    };
    const programeaza = () => {
      if (cadru === 0) cadru = requestAnimationFrame(aplica);
    };
    aplica();
    window.addEventListener("scroll", programeaza, { passive: true });
    window.addEventListener("resize", programeaza);
    return () => {
      window.removeEventListener("scroll", programeaza);
      window.removeEventListener("resize", programeaza);
      if (cadru) cancelAnimationFrame(cadru);
    };
  }, []);

  return (
    <section ref={banda} className={s.hubBanda} aria-labelledby="flux-hub-titlu">
      <div className="container-site">
        <div className={s.hubGrila}>
          <div>
            <h2 id="flux-hub-titlu" className={"t-h2-hub " + s.hubTitlu}>
              {HUB.titlu}
            </h2>
            <p className={s.hubText}>{HUB.text}</p>
          </div>
          <figure className={s.hubFigura}>
            <div className={s.hub}>
              <svg className={s.hubLinii} viewBox="0 0 560 300" preserveAspectRatio="none" focusable="false" aria-hidden="true">
                {TRASEE.map((d) => (
                  <path key={d} d={d} />
                ))}
              </svg>
              <div ref={documente} className={s.hubDocumente}>
                {HUB.documente.map((d) => (
                  <span key={d.titlu} className={s.hubDoc}>
                    <span className={s.hubDocIconita}>{ICONITE[d.iconita](14)}</span>
                    <span className={s.hubDocText}>
                      <span className={s.hubDocTitlu}>{d.titlu}</span>
                      <span className={s.hubDocMeta}>{d.meta}</span>
                    </span>
                  </span>
                ))}
              </div>
              <div ref={nucleu} className={s.hubNucleu}>
                <span className={s.hubMarca}>3S</span>
                <span className={s.hubIndiciu}>
                  <Check width={12} height={12} strokeWidth={2.5} aria-hidden="true" />
                  {HUB.nucleu}
                </span>
              </div>
              <div ref={iesiri} className={s.hubIesiri}>
                {HUB.grupuri.map((g) => (
                  <div key={g.eticheta} className={s.hubGrup}>
                    <span className={s.hubGrupEticheta}>{g.eticheta}</span>
                    {g.elemente.map((e) => (
                      <span key={e.text} className={[s.hubCip, "mono" in e && e.mono ? s.hubCipMono : ""].join(" ")}>
                        <span className={s.hubCipIconita}>{ICONITE[e.iconita](13)}</span>
                        {e.text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <figcaption className={s.hubLegenda}>{HUB.legenda}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

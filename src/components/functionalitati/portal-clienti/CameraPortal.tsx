"use client";

// S6 - portalul (functionalitati__portal-clienti.md, S6): comutatorul de rol, acelasi contract pe trei
// zone si grila de drepturi. Singurul element interactiv real din corpul paginilor cinema.
//
// COMUTAREA: o schimbare muta impreuna butonul apasat, zona evidentiata din document si coloana din grila.
//   - singura, la 2,5 s, in ordinea client -> contabil -> echipa -> client; la referinta ciclul merge si
//     cand sectiunea nu se vede, aici NUMAI cat sectiunea e in fereastra;
//   - un clic (sau Enter / Spatiu pe buton) alege rolul si opreste ciclul 10 s;
//   - cat indicatorul sau focusul stau pe comutator, pe document sau pe grila, ciclul asteapta;
//   - la miscare redusa ciclul nu porneste (rolul ramane "client", ca la referinta); in HTML-ul servit tot
//     "client".
//
// MISCAREA LA DERULARE (fisa S6), in CSS din `--p`: comutatorul min(1, 2p); documentul min(1, 2p - 0,1)
// cu max(0, 22 - 45 p) px; grila, la referinta min(1, 2 (p - 0,1)), la 3S intreaga la p 0,45 (abaterea de
// contrast, cu motivul, in `portal.module.css`).

import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import Fereastra from "@/components/cinema/Fereastra";
import { useMiscarePermisa } from "@/components/cinema/miscare";
import SectiuneScena from "@/components/cinema/SectiuneScena";
import { ACT_PORTAL, areDrept, PORTAL, ROLURI_PORTAL, type RolPortal } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

/** Intervalul ciclului si pauza dupa o alegere (fisa S6: 2,38-2,65 s; urmatoarea schimbare la ~12,4 s). */
export const CICLU_MS = 2500;
export const PAUZA_MS = 10000;

/** Rolul care urmeaza in ciclu. */
export function rolUrmator(rol: RolPortal): RolPortal {
  const i = ROLURI_PORTAL.indexOf(rol);
  return ROLURI_PORTAL[(i + 1) % ROLURI_PORTAL.length];
}

function useCiclu(radacina: RefObject<HTMLElement | null>) {
  const miscare = useMiscarePermisa();
  const [rol, setRol] = useState<RolPortal>("client");
  const [vizibil, setVizibil] = useState(false);
  const [atins, setAtins] = useState(false);
  const pauzaPana = useRef(0);

  useEffect(() => {
    const el = radacina.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observator = new IntersectionObserver((intrari) => setVizibil(intrari.some((i) => i.isIntersecting)), { threshold: 0.2 });
    observator.observe(el);
    return () => observator.disconnect();
  }, [radacina]);

  useEffect(() => {
    if (!miscare || !vizibil || atins) return;
    const ceas = window.setInterval(() => {
      if (Date.now() < pauzaPana.current) return;
      setRol((r) => rolUrmator(r));
    }, CICLU_MS);
    return () => window.clearInterval(ceas);
  }, [miscare, vizibil, atins]);

  const alege = useCallback((r: RolPortal) => {
    pauzaPana.current = Date.now() + PAUZA_MS;
    setRol(r);
  }, []);

  return { rol, alege, setAtins };
}

export default function CameraPortal() {
  const radacina = useRef<HTMLDivElement>(null);
  const { rol, alege, setAtins } = useCiclu(radacina);
  const p = PORTAL;
  const opreste = () => setAtins(true);
  const porneste = () => setAtins(false);

  return (
    <SectiuneScena inaltime={110} spatiere="scena" latime={820} nume="portal">
      <h2 className={["t-h2-cinema", s.titluSectiune].join(" ")}>{p.titlu}</h2>
      <p className={["t-paragraf-cinema", s.paragrafPortal].join(" ")}>{p.paragraf}</p>
      <div
        ref={radacina}
        onPointerEnter={opreste}
        onPointerLeave={porneste}
        onFocus={opreste}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) porneste();
        }}
      >
        <div className={s.comutator} role="group" aria-label={p.eticheteRol}>
          <span className={s.etichetaComutator}>{p.priviti}</span>
          {ROLURI_PORTAL.map((r) => (
            <button key={r} type="button" className={s.butonRol} aria-pressed={rol === r} onClick={() => alege(r)}>
              <span className={s.punctRol} aria-hidden="true" />
              {p.roluri[r].buton}
            </button>
          ))}
        </div>

        <Fereastra titlu={ACT_PORTAL} declaratie={p.declaratieDocument} className={s.document} corpClassName={s.corpDocument} nume="document-zone">
          <div className={s.zona} data-activa={rol === "client" ? "da" : "nu"}>
            <p className={s.etichetaZona}>{p.roluri.client.eticheta}</p>
            <p className={s.titluZona}>{ACT_PORTAL}</p>
            <p className={s.metaZona}>{p.meta}</p>
          </div>
          <div className={s.zona} data-activa={rol === "contabil" ? "da" : "nu"}>
            <p className={s.etichetaZona}>{p.roluri.contabil.eticheta}</p>
            <dl className={s.randuriZona}>
              {p.randuri.map((r) => (
                <div key={r.cheie} className={s.randZona}>
                  <dt className={s.cheieZona}>{r.cheie}</dt>
                  <dd className={s.valoareZona}>{r.cip ? <span className={s.cipVerde}>{r.valoare}</span> : r.valoare}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={s.zona} data-activa={rol === "echipa" ? "da" : "nu"}>
            <p className={s.etichetaZona}>{p.roluri.echipa.eticheta}</p>
            <p className={s.aprobari}>
              {p.aprobari}
              <span className={s.linieAprobare} aria-hidden="true" />
              <span className={s.linieAprobare} aria-hidden="true" />
            </p>
            <p className={s.notaInterna}>
              <span className={s.etichetaInterna}>{p.etichetaInterna}</span>
              <span className={s.textIntern}>{p.notaInterna}</span>
            </p>
          </div>
        </Fereastra>

        <Fereastra titlu={p.grila} declaratie={p.declaratieGrila} className={s.grila} corpClassName={s.corpGrila} nume="grila-drepturi">
          <table className={s.tabel}>
            <thead>
              <tr>
                <td className={[s.capColoana, s.capGol].join(" ")} />
                {ROLURI_PORTAL.map((r) => (
                  <th key={r} scope="col" className={s.capColoana} data-activa={rol === r ? "da" : "nu"}>
                    <span className={s.numeColoana}>{p.roluri[r].coloana}</span>
                    <span className={s.firmaColoana}>{p.roluri[r].firma}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.drepturi.map((drept, d) => (
                <tr key={drept} className={s.randGrila}>
                  <th scope="row" className={s.cheieGrila}>
                    {drept}
                  </th>
                  {ROLURI_PORTAL.map((r) => (
                    <td key={r} className={s.celula} data-activa={rol === r ? "da" : "nu"}>
                      {areDrept(d, r) ? (
                        <span className={s.da}>
                          <Check width={13} height={13} strokeWidth={2.75} aria-hidden="true" focusable="false" />
                          <span className="doar-cititor">{p.da}</span>
                        </span>
                      ) : (
                        <span className={s.nu}>
                          <span className="doar-cititor">{p.nu}</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Fereastra>
      </div>
    </SectiuneScena>
  );
}

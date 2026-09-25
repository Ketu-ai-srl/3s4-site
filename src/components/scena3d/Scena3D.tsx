"use client";

// Scena3D: gazda comuna a scenelor WebGL (COMPONENTE.md §4.2; acasa-functionalitati.md §8,
// acasa-constructor.md §8, functionalitati__sablon.md §4.1, solutii__sablon.md S3, preturi.md §7).
// PIESA INGHETATA a feliei `fundatie`; o folosesc constructorul, functionalitatile de pe start,
// paginile cinema, sectoarele si preturile. O schimbare aici se cere dispecerului.
//
// CE FACE GAZDA, ca fiecare scena sa nu le refaca:
//   - incarca `three` LENES (import dinamic): biblioteca nu intra in pachetul paginii si nu se
//     descarca deloc pe o pagina unde gazda nu ajunge langa fereastra;
//   - porneste cand gazda e la cel mult 260 px de fereastra si opreste bucla cand iese;
//   - raportul de pixeli e plafonat la 2;
//   - lumina: ambientala 2,4 si directionala 1,45 (masurat pe referinta: 1,4-1,5);
//   - mouse-ul roteste scena cu apropiere de 4% pe cadru (valoarea `mouse` data scenei);
//   - la `prefers-reduced-motion: reduce` deseneaza UN cadru static, in starea finala, fara bucla;
//   - daca WebGL lipseste sau crapa, gazda dispare (`hidden`), iar pagina ramane intreaga.
//
// CE FACE SCENA (functia `construieste`, data de felia care o foloseste): pune obiectele in
// `scena`, isi alege camera daca nu-i ajunge cea implicita si intoarce `cadru` (miscarea) si
// `stareFinala` (cadrul static de la miscare redusa). Numerele aleatoare vin din `aleator`, cu
// samanta fixa, ca scena sa arate la fel la fiecare incarcare.
//
// CAMERA IMPLICITA: perspectiva cu 1 unitate = 1 pixel CSS pe planul z = 0 (panzele laterale ale
// referintei). O scena cu camera proprie (hartiile, biroul) o inlocuieste in `construieste`.

import { useEffect, useRef, useState } from "react";
import type * as TreiTipuri from "three";
import { creeazaAleator } from "./aleator";

export type ContextScena = {
  THREE: typeof TreiTipuri;
  scena: TreiTipuri.Scene;
  /** Camera implicita; o scena o poate inlocui prin `seteazaCamera`. */
  camera: TreiTipuri.PerspectiveCamera;
  seteazaCamera: (camera: TreiTipuri.Camera) => void;
  latime: number;
  inaltime: number;
  /** Generatorul cu samanta fixa (vezi `aleator.ts`). */
  aleator: () => number;
};

export type MouseNetezit = { x: number; y: number };

export type DesenScena = {
  /** Un cadru al buclei: `t` in secunde de la pornire, `mouse` in [-1, 1], netezit. */
  cadru?: (t: number, mouse: MouseNetezit) => void;
  /** Starea finala, desenata o singura data la miscare redusa. */
  stareFinala?: () => void;
  redimensioneaza?: (latime: number, inaltime: number) => void;
  elibereaza?: () => void;
};

export type Scena3DProps = {
  construieste: (context: ContextScena) => DesenScena;
  /** Samanta generatorului aleator; aceeasi samanta, aceeasi scena. */
  samanta?: number;
  className?: string;
  /** Eticheta accesibila, cand scena spune ceva; fara ea gazda e decorativa. */
  eticheta?: string;
};

/** Distanta de fereastra la care porneste scena (masurat pe referinta: 260 px). */
export const MARGINE_PORNIRE = 260;

/** Plafonul raportului de pixeli. */
export const PLAFON_PIXELI = 2;

/** Apropierea mouse-ului pe cadru. */
export const APROPIERE_MOUSE = 0.04;

/** Camera la care 1 unitate = 1 pixel CSS pe planul z = 0, pentru un unghi vertical dat. */
export function distantaPixelLaPixel(inaltime: number, unghiGrade: number): number {
  return inaltime / 2 / Math.tan((unghiGrade * Math.PI) / 360);
}

const UNGHI_CAMERA = 45;

export default function Scena3D({ construieste, samanta = 1, className, eticheta }: Scena3DProps) {
  const gazda = useRef<HTMLDivElement>(null);
  const construiesteRef = useRef(construieste);
  const [esec, setEsec] = useState(false);

  useEffect(() => {
    construiesteRef.current = construieste;
  }, [construieste]);

  useEffect(() => {
    const el = gazda.current;
    if (!el || !("IntersectionObserver" in window)) return;

    const miscareRedusa = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let anulat = false;
    let pornit = false;
    let vizibil = false;
    let cadruCerut = 0;
    let stingeri: Array<() => void> = [];
    let pornesteBucla: () => void = () => {};

    const porneste = async () => {
      pornit = true;
      let THREE: typeof TreiTipuri;
      try {
        THREE = await import("three");
      } catch {
        if (!anulat) setEsec(true);
        return;
      }
      if (anulat) return;

      let randator: TreiTipuri.WebGLRenderer;
      try {
        randator = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setEsec(true);
        return;
      }

      const latime = Math.max(1, el.clientWidth);
      const inaltime = Math.max(1, el.clientHeight);
      randator.setPixelRatio(Math.min(window.devicePixelRatio || 1, PLAFON_PIXELI));
      randator.setSize(latime, inaltime, false);
      randator.domElement.style.width = "100%";
      randator.domElement.style.height = "100%";
      randator.domElement.style.display = "block";
      el.appendChild(randator.domElement);

      const scena = new THREE.Scene();
      scena.add(new THREE.AmbientLight(0xffffff, 2.4));
      const directionala = new THREE.DirectionalLight(0xffffff, 1.45);
      directionala.position.set(0.4, 1, 0.8);
      scena.add(directionala);

      const perspectiva = new THREE.PerspectiveCamera(UNGHI_CAMERA, latime / inaltime, 1, 10000);
      perspectiva.position.set(0, 0, distantaPixelLaPixel(inaltime, UNGHI_CAMERA));
      let camera: TreiTipuri.Camera = perspectiva;

      const desen = construiesteRef.current({
        THREE,
        scena,
        camera: perspectiva,
        seteazaCamera: (c) => {
          camera = c;
        },
        latime,
        inaltime,
        aleator: creeazaAleator(samanta),
      });

      const redimensionare = new ResizeObserver(() => {
        const l = Math.max(1, el.clientWidth);
        const h = Math.max(1, el.clientHeight);
        randator.setSize(l, h, false);
        perspectiva.aspect = l / h;
        perspectiva.position.z = distantaPixelLaPixel(h, UNGHI_CAMERA);
        perspectiva.updateProjectionMatrix();
        desen.redimensioneaza?.(l, h);
        if (miscareRedusa) randator.render(scena, camera);
      });
      redimensionare.observe(el);

      stingeri.push(() => {
        redimensionare.disconnect();
        desen.elibereaza?.();
        randator.dispose();
        randator.domElement.remove();
      });

      if (miscareRedusa) {
        desen.stareFinala?.();
        randator.render(scena, camera);
        return;
      }

      const mouse: MouseNetezit = { x: 0, y: 0 };
      const tinta: MouseNetezit = { x: 0, y: 0 };
      const laMouse = (e: PointerEvent) => {
        tinta.x = (e.clientX / window.innerWidth) * 2 - 1;
        tinta.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", laMouse, { passive: true });
      stingeri.push(() => window.removeEventListener("pointermove", laMouse));

      const start = performance.now();
      const bucla = () => {
        cadruCerut = 0;
        if (!vizibil || anulat) return;
        mouse.x += (tinta.x - mouse.x) * APROPIERE_MOUSE;
        mouse.y += (tinta.y - mouse.y) * APROPIERE_MOUSE;
        desen.cadru?.((performance.now() - start) / 1000, mouse);
        randator.render(scena, camera);
        cadruCerut = requestAnimationFrame(bucla);
      };
      pornesteBucla = () => {
        if (!cadruCerut) cadruCerut = requestAnimationFrame(bucla);
      };
      pornesteBucla();
    };

    const observator = new IntersectionObserver(
      (intrari) => {
        for (const intrare of intrari) {
          vizibil = intrare.isIntersecting;
          if (vizibil && !pornit) {
            void porneste();
          } else if (vizibil) {
            pornesteBucla();
          }
        }
      },
      { rootMargin: MARGINE_PORNIRE + "px 0px" },
    );
    observator.observe(el);

    return () => {
      anulat = true;
      observator.disconnect();
      if (cadruCerut) cancelAnimationFrame(cadruCerut);
      for (const stinge of stingeri) stinge();
      stingeri = [];
    };
  }, [samanta]);

  return (
    <div
      ref={gazda}
      className={className}
      hidden={esec}
      role={eticheta ? "img" : undefined}
      aria-label={eticheta}
      aria-hidden={eticheta ? undefined : true}
      data-scena3d={esec ? "esec" : ""}
    />
  );
}

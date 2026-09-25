"use client";

// FormaHartii: fundalul 3D al eroului cinema (functionalitati__sablon.md §4.1). Foile de hartie fac un
// vartej de 2,6 s, apoi zboara pe rand pe conturul iconitei paginii si raman acolo, cu o rotatie mica
// dupa mouse. Matematica e in `forma-hartii.ts`; gazda (incarcarea lenesa a lui `three`, pornirea la
// 260 px de fereastra, plafonul de pixeli, cadrul unic la miscare redusa, disparitia la esec WebGL) e
// piesa inghetata `Scena3D`.
//
// O SINGURA PLASA INSTANTIATA: 110 foi, un singur apel de desen. Foile colorate isi au culoarea pe
// instanta; opacitatea e comuna (masurat la referinta: 0,26 in vartej, 0,15 dupa asezare, pe toata
// forma deodata). Ordinea instantelor e ordinea de desen si, cu adancimea scrisa, decide care
// suprapuneri se amesteca (vezi materialul, mai jos): de aceea nu se sorteaza.
//
// Canvasul e decorativ (`aria-hidden` pus de gazda) si nu e pe drumul LCP: `three` se descarca abia
// dupa hidratare, iar textul eroului se picteaza fara el.

import { useCallback } from "react";
import type * as Trei from "three";
import Scena3D, { type ContextScena, type DesenScena } from "@/components/scena3d/Scena3D";
import {
  CAMERA_FORMA,
  coborareForma,
  CULOARE_COLORATA,
  finalAsezare,
  FOAIE_FORMA,
  FOI_FORMA,
  opacitateFoi,
  pozaFoaie,
  ROTATIE_MOUSE,
  scaraGrup,
  TEXTURA_FOAIE,
  tinteFoi,
  vartejFoi,
} from "./forma-hartii";
import { FORME, type FormaIconita, type NumeForma } from "./forme";
import s from "./EroulCinema.module.css";

/** Textura foii: alba, cu chenar `ardezie-4` si 5 randuri `ardezie-3` (fisa §4.1). */
function deseneazaFoaie(): HTMLCanvasElement {
  const panza = document.createElement("canvas");
  panza.width = TEXTURA_FOAIE.latime;
  panza.height = TEXTURA_FOAIE.inaltime;
  const c = panza.getContext("2d");
  if (c) {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, panza.width, panza.height);
    c.strokeStyle = "#94a3b8";
    c.lineWidth = 4;
    c.strokeRect(2, 2, panza.width - 4, panza.height - 4);
    c.fillStyle = "#cbd5e1";
    const randuri = [92, 80, 88, 70, 54];
    randuri.forEach((l, i) => c.fillRect(18, 34 + i * 24, l, 8));
  }
  return panza;
}

export function construiesteForma(forma: FormaIconita, n = FOI_FORMA) {
  return function construieste({ THREE, scena, latime, inaltime, seteazaCamera, aleator }: ContextScena): DesenScena {
    const camera = new THREE.PerspectiveCamera(CAMERA_FORMA.unghi, latime / inaltime, 0.1, 100);
    camera.position.set(0, 0, CAMERA_FORMA.distanta);
    camera.lookAt(0, 0, 0);
    seteazaCamera(camera);

    const grup = new THREE.Group();
    scena.add(grup);

    const textura = new THREE.CanvasTexture(deseneazaFoaie());
    textura.colorSpace = THREE.SRGBColorSpace;
    const geometrie = new THREE.PlaneGeometry(FOAIE_FORMA.latime, FOAIE_FORMA.inaltime);
    // MATERIALUL si ADANCIMEA, masurate pe pixeli contra referintei (critic 25.09; 8,5 s, textul eroului
    // ascuns, prag max(R,G,B) >= 40, media pe pixelii formei si cati trec de 90):
    //   - material luminat (Lambert), ca luminile gazdei (ambientala 2,4 + directionala 1,45, masurate la
    //     referinta) sa aiba efect: fata spre lumina iese alba, spatele foii mai stins (in vartej);
    //   - `depthWrite` lasat pornit (implicitul). Foile se deseneaza in ordinea instantelor, deci unde o
    //     foaie din spate vine dupa una din fata, partea acoperita NU se mai amesteca peste ea. Cu el
    //     oprit, fiecare suprapunere se aduna: media iesea 68,9-72,4 si 10.383-16.237 de pixeli peste 90
    //     (referinta: 57,2-58,6 si 1.599-2.652). Cu el pornit: 56,2-58,6 si 1.910-2.323.
    //   Masurat si separat: materialul singur nu schimba aproape nimic (71,4 -> 71,7); suprapunerea da tot.
    const material = new THREE.MeshLambertMaterial({
      map: textura,
      transparent: true,
      opacity: opacitateFoi(0, n),
      side: THREE.DoubleSide,
    });
    const plasa = new THREE.InstancedMesh(geometrie, material, n);
    plasa.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    plasa.frustumCulled = false;

    // Ordinea apelurilor la generator e fixa (tintele, apoi vartejul), deci forma iese la fel la
    // fiecare incarcare, ca la referinta (3 incarcari, aceeasi cutie la pixel).
    const tinte = tinteFoi(forma, n, aleator);
    const vartej = vartejFoi(n, aleator);
    const alba = new THREE.Color(0xffffff);
    const colorata = new THREE.Color(CULOARE_COLORATA);
    tinte.forEach((tinta, i) => plasa.setColorAt(i, tinta.colorata ? colorata : alba));
    if (plasa.instanceColor) plasa.instanceColor.needsUpdate = true;
    grup.add(plasa);

    const obiect: Trei.Object3D = new THREE.Object3D();
    const final = finalAsezare(n);

    const aseaza = (t: number) => {
      for (let i = 0; i < n; i++) {
        const p = pozaFoaie(i, t, vartej[i], tinte[i]);
        obiect.position.set(p.x, p.y, p.z);
        obiect.rotation.set(p.rx, p.ry, p.rz);
        obiect.updateMatrix();
        plasa.setMatrixAt(i, obiect.matrix);
      }
      plasa.instanceMatrix.needsUpdate = true;
      material.opacity = opacitateFoi(t, n);
    };

    const potriveste = (l: number, h: number) => {
      const raport = l / Math.max(1, h);
      camera.aspect = raport;
      camera.updateProjectionMatrix();
      grup.scale.setScalar(scaraGrup(raport));
      grup.position.y = coborareForma(raport);
    };

    potriveste(latime, inaltime);
    aseaza(0);
    let asezat = false;

    return {
      cadru: (t, mouse) => {
        // Dupa asezare foile nu se mai misca; ramane doar rotatia grupului dupa mouse.
        if (!asezat) {
          aseaza(t);
          asezat = t >= final;
        }
        grup.rotation.y = mouse.x * ROTATIE_MOUSE;
      },
      stareFinala: () => {
        aseaza(final);
        asezat = true;
        grup.rotation.y = 0;
      },
      redimensioneaza: potriveste,
      elibereaza: () => {
        grup.remove(plasa);
        plasa.dispose();
        geometrie.dispose();
        material.dispose();
        textura.dispose();
      },
    };
  };
}

export type FormaHartiiProps = {
  /** Iconita paginii: numele unei forme din `forme.ts` sau o forma data direct. */
  forma: NumeForma | FormaIconita;
  /** Samanta generatorului: aceeasi samanta, aceeasi asezare la fiecare incarcare. */
  samanta?: number;
  className?: string;
};

export default function FormaHartii({ forma, samanta = 7, className }: FormaHartiiProps) {
  const iconita = typeof forma === "string" ? FORME[forma] : forma;
  const construieste = useCallback((context: ContextScena) => construiesteForma(iconita)(context), [iconita]);
  return <Scena3D construieste={construieste} samanta={samanta} className={[s.forma, className].filter(Boolean).join(" ")} />;
}

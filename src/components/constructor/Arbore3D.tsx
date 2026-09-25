"use client";

// Arborele decorativ de langa panou (acasa-constructor.md §8): 5 ramuri (3 stanga, 2 dreapta) care
// pornesc din spatele cardului, cu cate un dosar albastru in varf si puncte care apar la final.
// Geometria e desenata de noi (tuburi pe curbe line, dosarul extrudat dintr-un contur), cu
// dimensiunile si timpii referintei; nu se ia nimic din codul ei.
//
// Gazda e Scena3D (piesa inghetata a feliei `fundatie`): ea incarca `three` lenes, porneste la
// 260 px de fereastra, plafoneaza raportul de pixeli, aduce lumina si mouse-ul netezit, iar la
// miscare redusa deseneaza un singur cadru, cel final. Sub 1341 px gazda e ascunsa din CSS, deci
// observatorul ei nu porneste si `three` nu se descarca deloc.
//
// Ramura i creste cand programul panoului atinge pasul X(i+1) (scara 0 -> 1 in 700 ms), dosarul
// rasare dupa 300 ms (460 ms, ease-out cubic), iar la final punctele urca la opacitate 0,4.

import { useCallback, type MutableRefObject } from "react";
import type * as TreiTipuri from "three";
import Scena3D, { type ContextScena, type DesenScena } from "@/components/scena3d/Scena3D";
import type { SemnalArbore } from "./Panou";
import s from "./Panou.module.css";

/** Culorile desenului: ramurile `ardezie-3`, dosarele si punctele `albastru-clar-2` (§8). */
const CULOARE_RAMURA = "#cbd5e1";
const CULOARE_DOSAR = "#5b8def";

type Ramura = { parte: -1 | 1; y: number; urcare: number; puncte: number };

/** Inaltimile fata de centrul cardului (in sus pozitiv) si cate puncte are fiecare varf. */
const RAMURI: Ramura[] = [
  { parte: -1, y: 64, urcare: 44, puncte: 2 },
  { parte: -1, y: -26, urcare: 20, puncte: 1 },
  { parte: -1, y: -96, urcare: -48, puncte: 1 },
  { parte: 1, y: 46, urcare: 52, puncte: 2 },
  { parte: 1, y: -64, urcare: -56, puncte: 2 },
];

function iesireCubica(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3);
}

/** Conturul dosarului: 26 x 20, cu clapeta si colturi de 2 px, centrat. */
function conturDosar(THREE: typeof TreiTipuri): TreiTipuri.Shape {
  const f = new THREE.Shape();
  f.moveTo(-11, -10);
  f.lineTo(11, -10);
  f.quadraticCurveTo(13, -10, 13, -8);
  f.lineTo(13, 5);
  f.quadraticCurveTo(13, 7, 11, 7);
  f.lineTo(-1, 7);
  f.lineTo(-3, 10);
  f.lineTo(-11, 10);
  f.quadraticCurveTo(-13, 10, -13, 8);
  f.lineTo(-13, -8);
  f.quadraticCurveTo(-13, -10, -11, -10);
  return f;
}

export default function Arbore3D({ semnal }: { semnal: MutableRefObject<SemnalArbore> }) {
  const construieste = useCallback(
    ({ THREE, scena, aleator }: ContextScena): DesenScena => {
      const grup = new THREE.Group();
      scena.add(grup);
      const deEliberat: { dispose: () => void }[] = [];

      const matRamura = new THREE.MeshBasicMaterial({ color: CULOARE_RAMURA });
      const matRamurica = new THREE.MeshBasicMaterial({ color: CULOARE_RAMURA, transparent: true, opacity: 0.8 });
      const matDosar = new THREE.MeshLambertMaterial({ color: CULOARE_DOSAR });
      const geomDosar = new THREE.ExtrudeGeometry(conturDosar(THREE), {
        depth: 5,
        bevelEnabled: true,
        bevelThickness: 0.6,
        bevelSize: 0.6,
        bevelSegments: 1,
      });
      geomDosar.center();
      const geomPunct = new THREE.SphereGeometry(2.4, 10, 8);
      deEliberat.push(matRamura, matRamurica, matDosar, geomDosar, geomPunct);

      const ramuri: { grupRamura: TreiTipuri.Group; dosar: TreiTipuri.Mesh; varfY: number }[] = [];
      const puncte: TreiTipuri.Mesh[] = [];

      RAMURI.forEach((r) => {
        const grupRamura = new THREE.Group();
        const bazaX = r.parte * 420;
        grupRamura.position.set(bazaX, r.y, 0);
        const lungime = 150 + aleator() * 16;
        const capat = new THREE.Vector3(r.parte * lungime, r.urcare, 0);
        const drum = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(r.parte * lungime * 0.35, r.urcare * 0.12, 3),
          new THREE.Vector3(r.parte * lungime * 0.7, r.urcare * 0.62, 4),
          capat,
        ]);
        const geomTub = new THREE.TubeGeometry(drum, 40, 1, 6, false);
        grupRamura.add(new THREE.Mesh(geomTub, matRamura));
        deEliberat.push(geomTub);

        // Ramurica: pleaca de la 55-62% din lungime, 26-30 px lateral, curbata in sus.
        const start = drum.getPoint(0.55 + aleator() * 0.07);
        const lateral = 26 + aleator() * 4;
        const ramurica = new THREE.CatmullRomCurve3([
          start,
          start.clone().add(new THREE.Vector3(r.parte * lateral * 0.45, 6, 1)),
          start.clone().add(new THREE.Vector3(r.parte * lateral, 16 + aleator() * 6, 1)),
        ]);
        const geomRamurica = new THREE.TubeGeometry(ramurica, 16, 0.7, 5, false);
        grupRamura.add(new THREE.Mesh(geomRamurica, matRamurica));
        deEliberat.push(geomRamurica);

        const dosar = new THREE.Mesh(geomDosar, matDosar);
        dosar.position.copy(capat);
        dosar.rotation.y = -r.parte * (0.14 + aleator() * 0.04);
        dosar.rotation.z = r.parte * (0.03 + aleator() * 0.02);
        grupRamura.add(dosar);

        for (let k = 0; k < r.puncte; k++) {
          const punct = new THREE.Mesh(geomPunct, new THREE.MeshBasicMaterial({ color: CULOARE_DOSAR, transparent: true, opacity: 0 }));
          deEliberat.push(punct.material as TreiTipuri.Material);
          punct.position.set(
            capat.x + r.parte * (8 + aleator() * 14),
            capat.y + (aleator() < 0.5 ? -1 : 1) * (12 + aleator() * 10),
            0,
          );
          grupRamura.add(punct);
          puncte.push(punct);
        }

        grupRamura.scale.setScalar(0.0001);
        dosar.scale.setScalar(0.0001);
        grup.add(grupRamura);
        ramuri.push({ grupRamura, dosar, varfY: capat.y });
      });

      const aseaza = (acum: number, t: number, legana: boolean, mouse: { x: number; y: number }) => {
        const semn = semnal.current;
        ramuri.forEach((r, i) => {
          const tx = semn.x[i];
          const crestere = semn.static ? 1 : tx === null ? 0 : iesireCubica((acum - tx) / 700);
          const rasarire = semn.static ? 1 : tx === null ? 0 : iesireCubica((acum - tx - 300) / 460);
          r.grupRamura.scale.setScalar(Math.max(0.0001, crestere));
          r.dosar.scale.setScalar(Math.max(0.0001, rasarire));
          r.dosar.position.y = r.varfY + (legana ? Math.sin(t * 0.8 + i * 1.7) * 1.6 : 0);
        });
        puncte.forEach((p, j) => {
          const tf = semn.final;
          const u = semn.static ? 1 : tf === null ? 0 : Math.min(1, Math.max(0, (acum - tf - (250 + j * 90)) / 420));
          (p.material as TreiTipuri.MeshBasicMaterial).opacity = 0.4 * u;
        });
        grup.rotation.z = legana ? Math.sin(t * 0.35) * 0.006 : 0;
        grup.rotation.y = (legana ? Math.sin(t * 0.21) * 0.015 : 0) + mouse.x * 0.05;
        grup.rotation.x = mouse.y * 0.03;
      };

      return {
        cadru: (t, mouse) => aseaza(performance.now(), t, true, mouse),
        stareFinala: () => {
          semnal.current = { ...semnal.current, static: true };
          aseaza(performance.now(), 0, false, { x: 0, y: 0 });
        },
        elibereaza: () => {
          for (const d of deEliberat) d.dispose();
        },
      };
    },
    [semnal],
  );

  return <Scena3D construieste={construieste} samanta={46} className={s.arbore} />;
}

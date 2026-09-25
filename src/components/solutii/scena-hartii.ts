// Scena hartiilor din banda „ce se schimba” a paginilor de sector (solutii__sablon.md S3), construita
// pe gazda inghetata `Scena3D`: gazda incarca `three` lenes, porneste la 260 px de fereastra, opreste
// bucla in afara ei, plafoneaza pixelii, netezeste mouse-ul (4% pe cadru), deseneaza un singur cadru
// la miscare redusa si dispare daca WebGL lipseste. Aici sta numai scena.
//
// CE FACE, pe fisa:
//   - „haos”: 3 documente-erou si 46-78 de foi orbiteaza verticala pe elipse (raza 2-5,4, adancimea
//     x0,62, 0,10-0,26 rad/s, ~15% in sens invers), la 0,5-3,4 cu leganare si rostogolire pe 3 axe;
//     eroii mai aproape (raze 1,4 / 1,9 / 2,4, inaltimi 1,4 / 2,1 / 2,8), de 0,55 ori mai incet, cu
//     rostogolire de 0,3 ori. Totul din generatorul cu samanta: aceeasi coregrafie la fiecare vizita;
//   - declansarea: clic pe buton SAU automat dupa 4,6 s de bucla activa. O pauza a buclei (cardul iese
//     din zona si gazda nu mai cere cadre) reporneste temporizatorul, ca la referinta;
//   - asamblarea: fiecare foaie zboara din pozitia curenta in locul ei in 1400 ms, `1 - (1 - t)^3`,
//     esalonat 14 ms pe foaie, rotatia pe drumul cel mai scurt (slerp); ultima foaie ajunge dupa
//     1400 + 14 x numarul foilor (la constructii, 62 de foi: 2268 ms), cum da fisa;
//   - „ordine”: formatia sta, iar grupul se roteste dupa mouse: tinta 0,05 rad x pozitia orizontala;
//   - sub raportul 1,6 (la 390: 356 / 300) toata scena e scalata la 0,72;
//   - camera: perspectiva 34 grade, din (0; 2,6; 11,5) spre (0; 2; 0); lumina directionala 1,4 din
//     (4; 9; 7) (gazda o aprinde din alta directie, iar lumina e a scenei, deci se intoarce aici).
//
// TEXTURILE sunt desenate aici, in canvas, dupa fisa: foaia 128 x 176 cu chenar si 5 bare, documentul
// -erou 256 x 352 cu lamela albastra, numele fisierului in JetBrains Mono si 6 bare. Nimic nu vine de
// la referinta: sunt forme geometrice simple, redesenate din masuratoare.
//
// Nimic de aici nu importa `three` la rulare: biblioteca vine prin context, dupa ce gazda a incarcat-o.

import type * as Trei from "three";
import type { ContextScena, DesenScena, MouseNetezit } from "@/components/scena3d/Scena3D";
import { creeazaAleator } from "@/components/scena3d/aleator";
import type { Formatie } from "@/content/solutii/tipuri";
import { ASAMBLARE, EROU, FOAIE, tinteFormatie, type Tinta } from "./formatii";

export const CAMERA = { unghi: 34, pozitie: [0, 2.6, 11.5], tinta: [0, 2, 0] } as const;
export const LUMINA = { intensitate: 1.4, pozitie: [4, 9, 7] } as const;
/** Declansarea automata, in secunde de bucla activa. */
export const AUTOMAT_DUPA = 4.6;
/** Un gol intre cadre mai mare de atat inseamna ca bucla a stat: temporizatorul o ia de la capat. */
const PAUZA_BUCLA = 0.5;
export const RAPORT_INGUST = 1.6;
export const SCARA_INGUSTA = 0.72;
export const ROTATIE_MOUSE = 0.05;

/** Comenzile dintre card (React) si scena: cererea venita de la buton si cele doua anunturi. */
export type ComenziScena = {
  ceruta: { valoare: boolean };
  /** Asamblarea a pornit (clic sau automat): butonul dispare. */
  laPornire: () => void;
  /** Ultima foaie a ajuns la locul ei: cipul trece in „ordine”. */
  laOrdine: () => void;
};

export type DateScena = {
  formatie: Formatie;
  /** Cele 3 nume de fisier ale momentelor, scrise pe documentele-erou. */
  fisiere: [string, string, string];
  samanta: number;
};

export type Orbita = {
  raza: number;
  unghi: number;
  viteza: number;
  inaltime: number;
  amplitudine: number;
  frecventa: number;
  faza: number;
  rotatie: [number, number, number];
  rostogolire: [number, number, number];
};

function intre(aleator: () => number, min: number, max: number): number {
  return min + (max - min) * aleator();
}

/** Orbita unei foi obisnuite, din generatorul cu samanta (intervalele fisei). */
export function orbitaFoaie(aleator: () => number): Orbita {
  const sens = aleator() < 0.15 ? -1 : 1;
  return {
    raza: intre(aleator, 2, 5.4),
    unghi: intre(aleator, 0, Math.PI * 2),
    viteza: sens * intre(aleator, 0.1, 0.26),
    inaltime: intre(aleator, 0.5, 3.4),
    amplitudine: intre(aleator, 0.25, 0.75),
    frecventa: intre(aleator, 0.4, 0.9),
    faza: intre(aleator, 0, Math.PI * 2),
    rotatie: [intre(aleator, 0, Math.PI * 2), intre(aleator, 0, Math.PI * 2), intre(aleator, 0, Math.PI * 2)],
    rostogolire: [intre(aleator, -0.45, 0.45), intre(aleator, -0.55, 0.55), intre(aleator, -0.35, 0.35)],
  };
}

/** Orbita documentului-erou `i` (0-2): mai aproape, mai sus pe rand, de 0,55 ori mai incet. */
export function orbitaErou(aleator: () => number, i: number): Orbita {
  const baza = orbitaFoaie(aleator);
  return {
    ...baza,
    raza: [1.4, 1.9, 2.4][i],
    inaltime: [1.4, 2.1, 2.8][i],
    viteza: baza.viteza * 0.55,
    rostogolire: [baza.rostogolire[0] * 0.3, baza.rostogolire[1] * 0.3, baza.rostogolire[2] * 0.3],
  };
}

/** Pozitia si rotatia unei foi pe orbita ei, la timpul `t` (secunde). */
export function pozaOrbita(o: Orbita, t: number): Tinta {
  const a = o.unghi + o.viteza * t;
  return {
    pozitie: {
      x: o.raza * Math.cos(a),
      y: o.inaltime + o.amplitudine * Math.sin(o.frecventa * t + o.faza),
      z: o.raza * Math.sin(a) * 0.62,
    },
    rotatie: {
      x: o.rotatie[0] + o.rostogolire[0] * t,
      y: o.rotatie[1] + o.rostogolire[1] * t,
      z: o.rotatie[2] + o.rostogolire[2] * t,
    },
  };
}

/** Curba asamblarii: iesire cubica. */
export function iesireCubica(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

/** Familia fontului mono al site-ului (variabila pusa de `next/font` pe `<html>`). */
function familieMono(): string {
  const valoare = getComputedStyle(document.documentElement).getPropertyValue("--fnt-mono").trim();
  return valoare === "" ? "ui-monospace, monospace" : valoare;
}

function texturaFoaie(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 176;
  const g = c.getContext("2d");
  if (!g) return c;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 128, 176);
  g.strokeStyle = "#94a3b8";
  g.lineWidth = 4;
  g.strokeRect(2, 2, 124, 172);
  g.fillStyle = "#cbd5e1";
  for (let k = 0; k < 5; k++) g.fillRect(16, 30 + 26 * k, k % 2 === 0 ? 96 : 76, 9);
  return c;
}

function deseneazaErou(c: HTMLCanvasElement, fisier: string, familie: string): void {
  const g = c.getContext("2d");
  if (!g) return;
  g.clearRect(0, 0, 256, 352);
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 352);
  g.strokeStyle = "#e2e8f0";
  g.lineWidth = 4;
  g.strokeRect(2, 2, 252, 348);
  g.fillStyle = "#2563eb";
  g.fillRect(24, 30, 26, 6);
  g.fillStyle = "#1e293b";
  g.font = "500 19px " + familie;
  g.textBaseline = "alphabetic";
  g.fillText(fisier.slice(0, 18), 24, 74);
  if (fisier.length > 18) g.fillText(fisier.slice(18, 36), 24, 100);
  g.fillStyle = "#f1f5f9";
  for (let k = 0; k < 6; k++) g.fillRect(24, 150 + 28 * k, k % 2 === 0 ? 208 : 160, 10);
}

export function construiesteScenaHartii(ctx: ContextScena, date: DateScena, comenzi: ComenziScena): DesenScena {
  const { THREE, scena } = ctx;

  // Camera scenei, in locul celei 1:1 a gazdei.
  const camera = new THREE.PerspectiveCamera(CAMERA.unghi, ctx.latime / ctx.inaltime, 0.1, 100);
  camera.position.set(CAMERA.pozitie[0], CAMERA.pozitie[1], CAMERA.pozitie[2]);
  camera.lookAt(CAMERA.tinta[0], CAMERA.tinta[1], CAMERA.tinta[2]);
  ctx.seteazaCamera(camera);

  // Lumina directionala a scenei, din directia fisei.
  scena.traverse((o) => {
    const lumina = o as Trei.DirectionalLight;
    if (lumina.isDirectionalLight) {
      lumina.intensity = LUMINA.intensitate;
      lumina.position.set(LUMINA.pozitie[0], LUMINA.pozitie[1], LUMINA.pozitie[2]);
    }
  });

  const grup = new THREE.Group();
  scena.add(grup);

  const tinte = tinteFormatie(date.formatie, creeazaAleator(date.samanta * 7 + 3));
  const nFoi = tinte.foi.length;

  const panzaFoaie = texturaFoaie();
  // Texturile raman fara spatiu de culoare declarat (three.js le trateaza ca liniare), deliberat:
  // asa iese foaia foarte deschisa pe care o cere fisa. Masurat pe constructii la 1440, pixeli cu
  // luminanta sub 243 in cardul de 880 x 383: fisa 13.489, y 32 - 294; fara spatiu 15.167, y 33 - 294;
  // cu sRGB 21.035, y 33 - 302 (foile ies vizibil mai inchise si mai grele).
  const texturaF = new THREE.CanvasTexture(panzaFoaie);
  const materialFoaie = new THREE.MeshLambertMaterial({ map: texturaF, side: THREE.DoubleSide });
  const geometrieFoaie = new THREE.PlaneGeometry(FOAIE.latime, FOAIE.inaltime);
  const geometrieErou = new THREE.PlaneGeometry(EROU.latime, EROU.inaltime);

  const familie = familieMono();
  const panzeErou = date.fisiere.map((fisier) => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 352;
    deseneazaErou(c, fisier, familie);
    return c;
  });
  const texturiErou = panzeErou.map((c) => new THREE.CanvasTexture(c));
  const materialeErou = texturiErou.map((tx) => new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }));

  // Numele fisierelor se scriu in fontul site-ului; pana se incarca, un mono de rezerva. Cand fontul
  // soseste, texturile se redeseneaza o data.
  let eliberat = false;
  if (document.fonts && typeof document.fonts.load === "function") {
    document.fonts
      .load("500 19px " + familie)
      .then(() => {
        if (eliberat) return;
        panzeErou.forEach((c, i) => deseneazaErou(c, date.fisiere[i], familie));
        texturiErou.forEach((tx) => {
          tx.needsUpdate = true;
        });
      })
      .catch(() => {});
  }

  // Foile obisnuite intai, eroii la urma: pleaca ultimii si ajung in fata formatiei.
  const aleator = ctx.aleator;
  const orbite: Orbita[] = [];
  const tinteToate: Tinta[] = [];
  const plase: Trei.Mesh[] = [];
  for (let i = 0; i < nFoi; i++) {
    orbite.push(orbitaFoaie(aleator));
    tinteToate.push(tinte.foi[i]);
    plase.push(new THREE.Mesh(geometrieFoaie, materialFoaie));
  }
  for (let i = 0; i < 3; i++) {
    orbite.push(orbitaErou(aleator, i));
    tinteToate.push(tinte.eroi[i]);
    plase.push(new THREE.Mesh(geometrieErou, materialeErou[i]));
  }
  for (const p of plase) grup.add(p);
  const total = plase.length;

  const eulerTinta = new THREE.Euler();
  const eulerOrbita = new THREE.Euler();
  const qTinta = tinteToate.map((tn) => new THREE.Quaternion().setFromEuler(eulerTinta.set(tn.rotatie.x, tn.rotatie.y, tn.rotatie.z)));
  const qDe = new THREE.Quaternion();
  const vDe = new THREE.Vector3();
  const vSpre = new THREE.Vector3();

  const aplicaOrbita = (i: number, t: number) => {
    const poza = pozaOrbita(orbite[i], t);
    plase[i].position.set(poza.pozitie.x, poza.pozitie.y, poza.pozitie.z);
    plase[i].rotation.set(poza.rotatie.x, poza.rotatie.y, poza.rotatie.z);
  };
  const aplicaTinta = (i: number) => {
    const tn = tinteToate[i];
    plase[i].position.set(tn.pozitie.x, tn.pozitie.y, tn.pozitie.z);
    plase[i].quaternion.copy(qTinta[i]);
  };

  const scalaPentru = (latime: number, inaltime: number) => (latime / Math.max(1, inaltime) < RAPORT_INGUST ? SCARA_INGUSTA : 1);
  grup.scale.setScalar(scalaPentru(ctx.latime, ctx.inaltime));

  let stare: "haos" | "zbor" | "ordine" = "haos";
  let tAnterior = -1;
  let activ = 0;
  let tPornire = 0;
  const secEsalonare = ASAMBLARE.esalonare / 1000;
  const secDurata = ASAMBLARE.durata / 1000;

  // Primul cadru, inainte de bucla: foile pe orbita la t = 0.
  for (let i = 0; i < total; i++) aplicaOrbita(i, 0);

  const cadru = (t: number, mouse: MouseNetezit) => {
    const dt = tAnterior < 0 ? 0 : t - tAnterior;
    tAnterior = t;
    activ = dt > PAUZA_BUCLA ? 0 : activ + dt;

    if (stare === "haos" && (comenzi.ceruta.valoare || activ >= AUTOMAT_DUPA)) {
      stare = "zbor";
      tPornire = t;
      comenzi.laPornire();
    }

    if (stare === "haos") {
      for (let i = 0; i < total; i++) aplicaOrbita(i, t);
      grup.rotation.y = 0;
      return;
    }

    if (stare === "zbor") {
      for (let i = 0; i < total; i++) {
        const start = tPornire + (i + 1) * secEsalonare;
        if (t < start) {
          aplicaOrbita(i, t);
          continue;
        }
        const p = iesireCubica((t - start) / secDurata);
        const de = pozaOrbita(orbite[i], start);
        const tn = tinteToate[i];
        vDe.set(de.pozitie.x, de.pozitie.y, de.pozitie.z);
        vSpre.set(tn.pozitie.x, tn.pozitie.y, tn.pozitie.z);
        plase[i].position.lerpVectors(vDe, vSpre, p);
        qDe.setFromEuler(eulerOrbita.set(de.rotatie.x, de.rotatie.y, de.rotatie.z));
        plase[i].quaternion.slerpQuaternions(qDe, qTinta[i], p);
      }
      const trecut = t - tPornire;
      const pondere = Math.min(1, trecut / (secDurata + secEsalonare * total));
      grup.rotation.y = pondere * ROTATIE_MOUSE * mouse.x;
      if (trecut >= secDurata + secEsalonare * total) {
        for (let i = 0; i < total; i++) aplicaTinta(i);
        stare = "ordine";
        comenzi.laOrdine();
      }
      return;
    }

    grup.rotation.y = ROTATIE_MOUSE * mouse.x;
  };

  const stareFinala = () => {
    stare = "ordine";
    for (let i = 0; i < total; i++) aplicaTinta(i);
    grup.rotation.y = 0;
  };

  const redimensioneaza = (latime: number, inaltime: number) => {
    camera.aspect = latime / Math.max(1, inaltime);
    camera.updateProjectionMatrix();
    grup.scale.setScalar(scalaPentru(latime, inaltime));
  };

  const elibereaza = () => {
    eliberat = true;
    geometrieFoaie.dispose();
    geometrieErou.dispose();
    materialFoaie.dispose();
    texturaF.dispose();
    materialeErou.forEach((m) => m.dispose());
    texturiErou.forEach((tx) => tx.dispose());
    scena.remove(grup);
  };

  return { cadru, stareFinala, redimensioneaza, elibereaza };
}

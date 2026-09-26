// Scena biroului din primul pliu (preturi.md §7): o vedere izometrica a unui birou, cu podea
// alba si grila fina, mese albe pe picioare gri si dispozitive cu ecran albastru (laptopuri,
// monitoare, telefoane). Desenata de noi, din forme simple cu fete colorate plat; nu se ia nimic din
// codul referintei.
//
// CE S-A MASURAT pe capturile referintei (fisa §7; cadrul de 878 x 321 cu 6 dispozitive, PNG fara
// compresie, si captura cu 36, la 1440; verificat apoi la 390):
//   - proiectia: liniile grilei au pantele +0,5097 si -0,4938, iar pe o linie orizontala a ecranului se
//     repeta la 101,5 si la 103,05 px. De aici o camera ortografica rotita la 45,43 de grade si ridicata
//     la 30,11, cu celula grilei de 72,3 unitati;
//   - mesele: 18 picioare vizibile la 36 de dispozitive, potrivite cu un model de 3 x 3 mese la 217 pe
//     coloana si 175,5 pe rand, picioarele la +-74,5 / +-29 de mijlocul mesei: abatere medie 0,53 px;
//   - podeaua e un dreptunghi finit, cu toate cele patru margini in cadru: x de la -169 la 605,5 si z
//     de la -361 la 363,8 fata de prima masa (margini citite pe 10-17 randuri fiecare, dupa ce aceeasi
//     masuratoare a fost calibrata pe randarea noastra);
//   - camera NU se muta cand cresc mesele: la 36 de dispozitive cele doua mese de la pornire stau in
//     acelasi loc pe ecran (sub un pixel), iar marimea scenei urmeaza latimea (la 390, 0,40 din 1440);
//   - dupa un clic imaginea se misca putin si se linisteste in ~1,2 s (pixeli diferiti fata de cadrul
//     final: 11105 / 4896 / 1611 / 469 / 128 / 16 / 0 la 0 / 80 / 160 / 300 / 500 / 800 / 1200 ms).
//     Aici: dispozitivul nou creste din 0,55 in 120 ms, iar camera face o mica ORBITA in jurul
//     verticalei (azimut deplasat cu 0,7 grade) care se stinge exponential (180 ms). Curba exacta a
//     referintei ramane nemasurata (fisa, NEMASURAT).
//   - FORMA miscarii (runda 2 a criticului, campul de deplasare pe 3 x 4 petice, cadru fata de
//     cadrul final): la referinta partea de sus a imaginii aluneca spre dreapta si cea de jos spre
//     stanga, marginea stanga urca si cea dreapta coboara, iar mijlocul sta aproape pe loc - forma
//     unei rotatii a camerei in jurul verticalei, nu a unei apropieri (o apropiere impinge toate
//     marginile spre exterior). Prima varianta de aici era o apropiere; acum e orbita.
//   - CRESTEREA: pe cadrele referintei telefonul nou are 0,85 din aria finala in primul cadru si e
//     intreg din al doilea ("80 ms"). Cu 450 ms ajungea la 0,83 la 80 ms si la 0,90 la 160 ms; cu
//     120 ms: 0,87 la 30 ms, 0,98 la 80, 1,0 la 160 (cadre cu timpul paginii fixat).
//   - CONSTANTA de 180 ms ramane (amplitudinea s-a mutat de pe apropiere pe azimut), desi un profil masurat pe pagina, la momente exacte, iese mai
//     lent decat cel al referintei. Cadrele referintei sunt capturi `canvas.screenshot()` luate DUPA
//     pauzele nominale, deci fiecare cade mai tarziu cu durata capturilor dinainte (masurat pe
//     aceasta masina: 105-130 ms pe captura). Randata la momentele unei asemenea capturi, cu 45-80 ms
//     pe captura, curba de aici are cea mai mica abatere maxima fata de referinta dintre curbele
//     incercate; una potrivita pe momentele nominale arata acolo de 1,6 pana la 33 de ori mai putina
//     miscare decat referinta.
//
// Culorile, citite pe cadrul PNG (fisa le avea din JPEG, aproximative): podea #fafcfe, grila #e2e8f0
// (cu netezire), blat alb cu fata #f6f6f6 si capatul #eeeeee, picioare #c4ced9 / #bdc6d2, ecrane
// ~#2563eb. Bazele laptopurilor si talpile monitoarelor ies ~#314155 (ardezie inchisa, nu
// bleumarin), ramele din jurul ecranelor mai inchise.
//
// Dispozitivele, masurate pe capturile de la 1440 (cutiile lor pe ecran): laptopul are capacul lasat
// mult pe spate (~63 de grade fata de verticala, ecranul se vede aproape de sus), baza ~27 x 18,5;
// monitorul ~26,5 x 21,5; telefonul sta spre spatele mesei, nu pe marginea din fata; locurile de pe
// masa sunt la ~36 de unitati unul de altul, decalate cu ~6 spre stanga fata de mijlocul mesei.
// Masurat pe cadrul de 878 x 321 al referintei cu 6 dispozitive: dupa corectie, cutiile cad la
// 1-2 px de cele ale referintei.
//
// Gazda e Scena3D (piesa inghetata): ea incarca `three` lenes, porneste la 260 px de fereastra, pune
// lumina si, la miscare redusa, deseneaza un singur cadru, cel final. Numarul de dispozitive vine
// dintr-o functie citita la fiecare cadru, ca scena sa nu se reconstruiasca la fiecare clic.

import type * as TreiTipuri from "three";
import type { ContextScena, DesenScena } from "@/components/scena3d/Scena3D";
import { GRILA_MESE, asezare, numarMese, type TipDispozitiv } from "./birou-asezare";

const CULORI = {
  podea: "#fafcfe",
  grila: "#e2e8f0",
  blatSus: "#ffffff",
  blatFata: "#f6f6f6",
  blatLatura: "#eeeeee",
  piciorFata: "#c4ced9",
  piciorLatura: "#bdc6d2",
  piciorSus: "#d9dfe7",
  bazaSus: "#334155",
  bazaFata: "#2b3a4f",
  bazaLatura: "#1e293b",
  ramaFata: "#1e293b",
  ramaLatura: "#0f172a",
  ramaSus: "#1e293b",
  ecran: "#2563eb",
};

/** Dimensiunile, in unitati de scena (la 1440, o unitate e un pixel). */
const MASA = { lungime: 161, adancime: 62, grosime: 5.5, inaltime: 43.5, picior: 4, margineX: 6, margineZ: 2 };
const PAS = { coloana: 217, rand: 175.5 };
const CELULA = 72.3;
/** Unde cade o linie a grilei pe fiecare axa (liniile nu trec exact prin mijlocul primei mese). */
const FAZA_GRILA = { x: 1.4, z: 2.05 };

/** Latimea scenei la care o unitate e un pixel (panoul de 878 de la 1440). */
const LATIME_REFERINTA = 878;

/**
 * Punctul privit de camera, pe podea, fata de centrul primei mese: asa picioarele celor noua mese cad
 * pe cele ale referintei (vezi sus).
 */
const TINTA: [number, number, number] = [190.59, 0, -24.92];

/** Directia camerei: 45,43 de grade in jurul verticalei, 30,11 deasupra podelei (masurate, vezi sus). */
const AZIMUT = (45.43 * Math.PI) / 180;
const ELEVATIE = (30.11 * Math.PI) / 180;
const DISTANTA = 1500;

/**
 * Directia unitara dinspre tinta spre camera, cu azimutul deplasat cu `abatere` radiani. Elevatia si
 * distanta nu depind de abatere: o orbita pura, fara apropiere (proba: tests/preturi.test.ts).
 */
export function directieCamera(abatere: number): [number, number, number] {
  const a = AZIMUT + abatere;
  return [Math.sin(a) * Math.cos(ELEVATIE), Math.sin(ELEVATIE), Math.cos(a) * Math.cos(ELEVATIE)];
}

/** Podeaua: un dreptunghi finit, cu marginile masurate pe referinta (vezi sus). */
const PODEA = { xMin: -169, xMax: 605.5, zMin: -361, zMax: 363.8 };

const CRESTERE_S = 0.12;
/** Orbita de dupa +1: abaterea azimutului la pornire (radiani, ~0,7 grade) si constanta de stingere (s). */
export const ORBITA = { amplitudine: 0.012, constanta: 0.18 };

export type SursaBirou = () => number;

function iesireCubica(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - t, 3);
}

export function construiesteBirou(context: ContextScena, dispozitive: SursaBirou): DesenScena {
  const { THREE, scena, seteazaCamera } = context;
  let latime = context.latime;
  let inaltime = context.inaltime;
  const deEliberat: { dispose: () => void }[] = [];
  const pastreaza = <T extends { dispose: () => void }>(x: T): T => {
    deEliberat.push(x);
    return x;
  };

  const plat = (culoare: string) => pastreaza(new THREE.MeshBasicMaterial({ color: culoare }));
  /** Materialele unei cutii, pe fete: +x, -x, +y, -y, +z, -z. Camera vede doar +x, +y si +z. */
  const fete = (latura: string, sus: string, fata: string) => {
    const l = plat(latura);
    const s = plat(sus);
    const f = plat(fata);
    return [l, l, s, s, f, f];
  };

  // --- podeaua si grila ------------------------------------------------------------------------
  const latPodea = PODEA.xMax - PODEA.xMin;
  const adPodea = PODEA.zMax - PODEA.zMin;
  const podea = new THREE.Mesh(pastreaza(new THREE.PlaneGeometry(latPodea, adPodea)), plat(CULORI.podea));
  podea.rotation.x = -Math.PI / 2;
  podea.position.set((PODEA.xMin + PODEA.xMax) / 2, 0, (PODEA.zMin + PODEA.zMax) / 2);
  scena.add(podea);

  const puncte: number[] = [];
  const primaLinie = (min: number, faza: number) => faza + Math.ceil((min - faza) / CELULA) * CELULA;
  for (let z = primaLinie(PODEA.zMin, FAZA_GRILA.z); z <= PODEA.zMax; z += CELULA) {
    puncte.push(PODEA.xMin, 0.3, z, PODEA.xMax, 0.3, z);
  }
  for (let x = primaLinie(PODEA.xMin, FAZA_GRILA.x); x <= PODEA.xMax; x += CELULA) {
    puncte.push(x, 0.3, PODEA.zMin, x, 0.3, PODEA.zMax);
  }
  const geomGrila = pastreaza(new THREE.BufferGeometry());
  geomGrila.setAttribute("position", new THREE.Float32BufferAttribute(puncte, 3));
  const grila = new THREE.LineSegments(geomGrila, pastreaza(new THREE.LineBasicMaterial({ color: CULORI.grila })));
  scena.add(grila);

  // --- materialele si formele, comune --------------------------------------------------------
  const matBlat = fete(CULORI.blatLatura, CULORI.blatSus, CULORI.blatFata);
  const matPicior = fete(CULORI.piciorLatura, CULORI.piciorSus, CULORI.piciorFata);
  const matBaza = fete(CULORI.bazaLatura, CULORI.bazaSus, CULORI.bazaFata);
  const matRama = fete(CULORI.ramaLatura, CULORI.ramaSus, CULORI.ramaFata);
  const matEcran = plat(CULORI.ecran);

  const cutie = (x: number, y: number, z: number) => pastreaza(new THREE.BoxGeometry(x, y, z));
  const plan = (x: number, y: number) => pastreaza(new THREE.PlaneGeometry(x, y));

  const geomBlat = cutie(MASA.lungime, MASA.grosime, MASA.adancime);
  const geomPicior = cutie(MASA.picior, MASA.inaltime, MASA.picior);
  const geom = {
    laptopBaza: cutie(27, 1.4, 18.5),
    laptopCapac: cutie(25, 15.5, 0.9),
    laptopEcran: plan(23.4, 13.9),
    monitorTalpa: cutie(12, 1, 8.5),
    monitorGat: cutie(2.4, 13, 2.4),
    monitorCorp: cutie(26.5, 21.5, 2),
    monitorEcran: plan(24.5, 19.5),
    telefonCorp: cutie(9, 1.2, 16),
    telefonEcran: plan(8, 14.4),
  };

  const ySus = MASA.inaltime + MASA.grosime;

  function dispozitiv(tip: TipDispozitiv): TreiTipuri.Group {
    const g = new THREE.Group();
    if (tip === "laptop") {
      const baza = new THREE.Mesh(geom.laptopBaza, matBaza);
      baza.position.set(0, 0.7, -5.3);
      g.add(baza);
      // Balamaua pe muchia din spate a bazei; capacul se lasa pe spate cu ~63 de grade.
      const capac = new THREE.Group();
      capac.position.set(0, 1.4, -14.55);
      capac.rotation.x = -1.1;
      const corp = new THREE.Mesh(geom.laptopCapac, matRama);
      corp.position.y = 7.75;
      capac.add(corp);
      const ecran = new THREE.Mesh(geom.laptopEcran, matEcran);
      ecran.position.set(0, 7.75, 0.55);
      capac.add(ecran);
      g.add(capac);
    } else if (tip === "monitor") {
      const talpa = new THREE.Mesh(geom.monitorTalpa, matBaza);
      talpa.position.set(0, 0.5, -4.6);
      g.add(talpa);
      const gat = new THREE.Mesh(geom.monitorGat, matBaza);
      gat.position.set(0, 7.5, -6);
      g.add(gat);
      const corp = new THREE.Mesh(geom.monitorCorp, matRama);
      corp.position.set(0, 23, -4.6);
      g.add(corp);
      const ecran = new THREE.Mesh(geom.monitorEcran, matEcran);
      ecran.position.set(0, 23, -3.4);
      g.add(ecran);
    } else {
      const corp = new THREE.Mesh(geom.telefonCorp, matRama);
      corp.position.set(1, 0.6, -4.1);
      corp.rotation.y = 0.35;
      g.add(corp);
      const ecran = new THREE.Mesh(geom.telefonEcran, matEcran);
      ecran.rotation.x = -Math.PI / 2;
      ecran.position.set(0, 0.75, 0);
      corp.add(ecran);
    }
    return g;
  }

  function masa(): TreiTipuri.Group {
    const g = new THREE.Group();
    const blat = new THREE.Mesh(geomBlat, matBlat);
    blat.position.y = MASA.inaltime + MASA.grosime / 2;
    g.add(blat);
    const dx = MASA.lungime / 2 - MASA.margineX;
    const dz = MASA.adancime / 2 - MASA.margineZ;
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const p = new THREE.Mesh(geomPicior, matPicior);
      p.position.set(sx * dx, MASA.inaltime / 2, sz * dz);
      g.add(p);
    }
    return g;
  }

  const pozitieMasa = (i: number) => {
    const c = GRILA_MESE[i];
    return new THREE.Vector3(c.coloana * PAS.coloana, 0, (c.rand - 1) * PAS.rand);
  };

  const pozitieLoc = (loc: number) => (loc - 1.5) * 36 - 7.4;

  // --- mesele si dispozitivele, puse pe masura ce cresc ----------------------------------------
  const mese: TreiTipuri.Group[] = [];
  const obiecte: { grup: TreiTipuri.Group; aparut: number }[] = [];
  let ultimaAdaugare = -Infinity;

  function sincronizeaza(n: number, t: number) {
    const locuri = asezare(n);
    while (mese.length < numarMese(n)) {
      const m = masa();
      m.position.copy(pozitieMasa(mese.length));
      scena.add(m);
      mese.push(m);
    }
    for (let i = obiecte.length; i < locuri.length; i++) {
      const l = locuri[i];
      const d = dispozitiv(l.tip);
      const baza = pozitieMasa(l.masa);
      d.position.set(baza.x + pozitieLoc(l.loc), ySus, baza.z);
      scena.add(d);
      obiecte.push({ grup: d, aparut: t });
      ultimaAdaugare = t;
    }
  }

  // --- camera, cu orbita-------------------------------------------------------------------------
  const camera = new THREE.OrthographicCamera(-latime / 2, latime / 2, inaltime / 2, -inaltime / 2, -5000, 5000);
  const tinta = new THREE.Vector3(...TINTA);
  const directie = new THREE.Vector3();
  camera.up.set(0, 1, 0);
  seteazaCamera(camera);

  const aplicaCamera = (abatere: number) => {
    directie.set(...directieCamera(abatere));
    camera.position.copy(tinta).addScaledVector(directie, DISTANTA);
    camera.lookAt(tinta);
    camera.left = -latime / 2;
    camera.right = latime / 2;
    camera.top = inaltime / 2;
    camera.bottom = -inaltime / 2;
    camera.zoom = latime / LATIME_REFERINTA;
    camera.updateProjectionMatrix();
  };

  const creste = (t: number, instant: boolean) => {
    for (const o of obiecte) {
      const f = instant ? 1 : iesireCubica((t - o.aparut) / CRESTERE_S);
      o.grup.scale.setScalar(0.55 + 0.45 * f);
    }
  };

  // Dispozitivele de la pornire stau deja pe mese: nu cresc.
  sincronizeaza(dispozitive(), -Infinity);
  ultimaAdaugare = -Infinity;
  creste(0, true);
  aplicaCamera(0);

  return {
    cadru: (t) => {
      const n = dispozitive();
      if (n > obiecte.length) sincronizeaza(n, t);
      creste(t, false);
      const trecut = t - ultimaAdaugare;
      aplicaCamera(Number.isFinite(trecut) ? ORBITA.amplitudine * Math.exp(-trecut / ORBITA.constanta) : 0);
    },
    stareFinala: () => {
      sincronizeaza(dispozitive(), 0);
      creste(0, true);
      aplicaCamera(0);
    },
    redimensioneaza: (l, h) => {
      latime = l;
      inaltime = h;
      aplicaCamera(0);
    },
    elibereaza: () => {
      for (const x of deEliberat) x.dispose();
      for (const m of mese) scena.remove(m);
      for (const o of obiecte) scena.remove(o.grup);
    },
  };
}

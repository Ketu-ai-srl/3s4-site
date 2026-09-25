// Panza 3D din spatele cardului lipit (acasa-functionalitati.md §8): 12 foi care trec din dezordine
// intr-un teanc pe masura ce avansezi prin cei 3 pasi, plus o bara albastra de progres. Doar de la
// 1341 px in sus; gazda, incarcarea lenesa a lui `three`, plafonul de pixeli, mouse-ul si cadrul
// static de la miscare redusa sunt ale piesei inghetate `Scena3D`.
//
// Scena e compusa de noi (fisa, "Active de produs"): geometrie procedurala, nicio imagine, asezarea
// foilor aleasa in intervalele masurate, cu generatorul cu samanta al gazdei. Coordonatele: planul
// z = 0 are 1 unitate = 1 pixel CSS, cu originea in centrul cardului (gazda e cardul largit cu 150
// px in stanga si in dreapta si cu 56 sus si jos, deci centrele coincid).
//
// LUMINA. Gazda aprinde aceeasi lumina pentru toate scenele: ambientala 2,4 si directionala 1,45 din
// dreapta-sus-fata (0,4; 1; 0,8). Fisa §8 cere pentru panza directionala 1,5 din STANGA-sus-fata;
// cu lumina din dreapta, foile ieseau mai inchise decat la referinta (luminanta mediana 227 fata de
// 237 la pasul 1, pe capturi) si cele inclinate spre dreapta-jos cadeau in gri. Fiecare gazda are
// scena ei, deci panza isi intoarce lumina in scena ei; gazda si celelalte scene raman neatinse.
// Masurat dupa: mediana 240 / 245 / 245 la pasii 1-3, fata de 237 / 240 / 245 la referinta.
//
// MISCAREA REDUSA (COMPONENTE.md §2.5): un singur cadru, in starea FINALA - teancul de 12 foi si bara
// plina -, oricare ar fi pasul. Gazda nu mai deseneaza dupa primul cadru, deci o stare legata de pas
// ar fi ramas pe pasul de la incarcare, cu bara aratand alt pas decat cardul.
//
// Nimic de aici nu importa `three` la rulare: tipurile vin cu `import type`, iar biblioteca vine
// prin context, dupa ce gazda a incarcat-o lenes. Asa panza nu intra in pachetul paginii.

import type * as Trei from "three";
import { distantaPixelLaPixel, type ContextScena, type DesenScena } from "@/components/scena3d/Scena3D";

/** Cate foi are scena. */
export const FOI = 12;
/** Foaia: 24 x 32 x 1 (fisa §8). */
export const FOAIE = { latime: 24, inaltime: 32, grosime: 1 } as const;
/** Randurile de "text" de pe foaie: latimea si pozitia pe verticala (fisa §8), groase de 1,7. */
export const RANDURI_FOAIE: readonly (readonly [number, number])[] = [
  [15, 9],
  [10.5, 3],
  [12.75, -3],
  [8.25, -9],
];
const GROSIME_RAND = 1.7;

/** Cat se intinde gazda dincolo de card (inset -56px -150px). */
export const MARGINE_GAZDA = { x: 150, y: 56 } as const;

/** Cardul lipit (fisa §4). Peste 1340 px, singurul loc cu panza, grila are mereu 1100 px. */
export const CARD = { latime: 518, inaltime: 414.4 } as const;

/**
 * Dezordinea: CENTRELE foilor, intre 30 si 118 px dincolo de marginea dreapta a cardului (pe
 * capturile referintei, marginile foilor ajung de la ~8 la ~140 px); adancimi -50 ... +60, inclinari
 * pana la 0,5 rad pe fiecare axa.
 */
export const DEZORDINE = { de: 30, pana: 118, zMin: -50, zMax: 60, rotatie: 0.5 } as const;

/** Teancul: coloana la 52 px de margine, de la 66 px sub centru in sus, cu 9,5 px intre foi. */
export const TEANC = { x: 52, baza: -66, pas: 9.5, z: -12, zPas: 1.4, rotY: -0.08, rotZ: -0.04, leganat: 0.8 } as const;

/** Bara de progres: 3 x 118, la 20 px de margine, cu baza la 74 px sub centru; creste in sus. */
export const BARA = { x: 20, baza: -74, inaltime: 118, grosime: 3 } as const;

/** Duratele tranzitiei (fisa §8): foile 620 ms decalate cu 70 ms, bara 600 ms dupa 150 ms. */
export const TRANZITIE = { foaie: 620, decalaj: 70, bara: 600, intarziereBara: 150 } as const;

/** Camera: perspectiva de 30 de grade, cu planul z = 0 la 1:1 cu pixelii (fisa §8). */
export const UNGHI_CAMERA = 30;

/**
 * Planurile de taiere ale camerei. Camera sta la ~982 de planul z = 0, iar scena ocupa z -60 ... +70,
 * deci 100 / 3000 o cuprind cu mult. Planul apropiat NU sta la 1: acolo adancimea (24 de biti) are
 * la distanta scenei rezolutia ~0,06, mai mare decat distanta dintre randuri si fata foii, iar
 * randurile se rupeau in puncte pe capturi; la 100 rezolutia e ~0,0006 (calculat).
 */
export const CAMERA_TAIERE = { aproape: 100, departe: 3000 } as const;

/** Cat stau randurile de "text" in fata fetei foii. */
const RAND_IN_FATA = 0.05;

/** Rotatia dupa mouse: tinta +/-0,04 rad, plus o deriva lenta de +/-0,012 rad. */
export const MOUSE = { tinta: 0.04, deriva: 0.012 } as const;

/** Lumina directionala a panzei (fisa §8): 1,5, din stanga-sus-fata; pozitia, din logica referintei. */
export const LUMINA = { x: -150, y: 250, z: 350, intensitate: 1.5 } as const;

/** Locul liber, pe ecran, dintre o foaie in dezordine si teanc sau bara. */
export const LOC_LIBER = 6;

/** Micro-rotatia foilor in dezordine (rad), in jurul inclinarii lor pe Z. */
const MICRO_ROTATIE = 0.03;

/** Cate incercari are o foaie sa-si gaseasca un loc liber, inainte de capatul din dreapta al benzii. */
const INCERCARI = 64;

const CULORI = { foaie: 0xe2e8f0, rand: 0xcbd5e1, bara: 0x5b8def } as const;

/** Foi in teanc la pasul dat (0..2): rotunjit((pas + 1) / 3 x 12) = 4 / 8 / 12. */
export function foiInTeanc(pas: number): number {
  return Math.round(((pas + 1) / 3) * FOI);
}

/** Inaltimea barei la pasul dat: 1/3, 2/3, 3/3 din 118. */
export function inaltimeBara(pas: number): number {
  return (BARA.inaltime * (pas + 1)) / 3;
}

/** Curba ease-out cubic, 1 - (1 - t)^3. */
export function iesireCubica(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return 1 - (1 - u) ** 3;
}

/** Parametrii unei foi in dezordine; pozitiile sunt fractii, ca sa urmeze marimea gazdei. */
export type FoaieDezordine = {
  /** 0..1 in banda orizontala a dezordinii (centrul foii). */
  fx: number;
  /** 0..1 pe inaltimea cardului, de sus in jos. */
  fy: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  /** Leganatul pe verticala: 4-6 px, 0,5-0,74 rad/s, cu faza proprie. */
  amplitudine: number;
  viteza: number;
  faza: number;
};

/** O cutie pe ecran, fata de centrul gazdei, cu y in sus. */
export type Cutie = { stanga: number; dreapta: number; jos: number; sus: number };

/** Distanta camerei panzei, pentru gazda cardului de referinta. */
export function distantaCamera(): number {
  return distantaPixelLaPixel(CARD.inaltime + 2 * MARGINE_GAZDA.y, UNGHI_CAMERA);
}

/**
 * Zona pe care o ocupa teancul complet si bara, pe ecran, largita cu `LOC_LIBER`. Foile teancului
 * stau la adancimi de -12 ... +3,4, deci perspectiva le mareste cel mult cu factorul foii de sus.
 */
export function zonaOcupata(d = distantaCamera()): Cutie {
  const margine = CARD.latime / 2;
  const scara = d / (d - (TEANC.z + (FOI - 1) * TEANC.zPas));
  const jumatate = (FOAIE.latime / 2) * Math.cos(TEANC.rotZ) + (FOAIE.inaltime / 2) * Math.abs(Math.sin(TEANC.rotZ));
  return {
    stanga: margine + BARA.x - BARA.grosime / 2 - LOC_LIBER,
    dreapta: (margine + TEANC.x + jumatate) * scara + LOC_LIBER,
    jos: (TEANC.baza - FOAIE.inaltime / 2 - TEANC.leganat) * scara - LOC_LIBER,
    sus: (TEANC.baza + (FOI - 1) * TEANC.pas + FOAIE.inaltime / 2 + TEANC.leganat) * scara + LOC_LIBER,
  };
}

/**
 * Cutia de pe ecran a unei foi in dezordine, pe tot drumul leganatului, cu micro-rotatia inclusa.
 * Marginea foii rotite pe Z e cea mai lata la inclinarea maxima (monoton pana la 0,64 rad).
 */
export function cutieFoaie(f: FoaieDezordine, d = distantaCamera()): Cutie {
  const margine = CARD.latime / 2;
  const x = margine + DEZORDINE.de + f.fx * (DEZORDINE.pana - DEZORDINE.de);
  const y = (0.5 - f.fy) * (CARD.inaltime - FOAIE.inaltime);
  const scara = d / (d - f.z);
  const u = Math.abs(f.rz) + MICRO_ROTATIE;
  const hx = (FOAIE.latime / 2) * Math.cos(u) + (FOAIE.inaltime / 2) * Math.sin(u);
  const hy = (FOAIE.latime / 2) * Math.sin(u) + (FOAIE.inaltime / 2) * Math.cos(u);
  return {
    stanga: (x - hx) * scara,
    dreapta: (x + hx) * scara,
    jos: (y - f.amplitudine - hy) * scara,
    sus: (y + f.amplitudine + hy) * scara,
  };
}

export function seSuprapun(a: Cutie, b: Cutie): boolean {
  return a.stanga < b.dreapta && b.stanga < a.dreapta && a.jos < b.sus && b.jos < a.sus;
}

function amestecat(n: number, aleator: () => number): number[] {
  const v = Array.from({ length: n }, (_, k) => k);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(aleator() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
}

/**
 * Asezarea dezordinii, din generatorul cu samanta.
 *
 * Nicio foaie nu cade peste teanc sau peste bara (pe ecran, cu perspectiva): o foaie aflata la
 * inaltimea teancului sta la dreapta lui, una de deasupra sau de dedesubt poate sta oriunde in banda.
 * Asa teancul se citeste ca teanc la fiecare pas, ca pe capturile referintei.
 *
 * Inaltimile: la pasul 1 stau in teanc foile 0-3, deci in dezordine se vad foile 4-11. Cardul se
 * imparte in 8 benzi, in perechi; din fiecare pereche, o banda e a unei foi din 8-11 (care se vede si
 * la pasul 2) si cealalta a unei foi din 4-7. Asa foile acopera toata inaltimea si la pasul 1 (8 foi),
 * si la pasul 2 (4 foi). Foile 0-3 nu ies niciodata din teanc; primesc o banda oarecare.
 */
export function dezordine(aleator: () => number): FoaieDezordine[] {
  const d = distantaCamera();
  const zona = zonaOcupata(d);
  const benzi = 8;
  const jumatateA = Array.from({ length: benzi / 2 }, () => (aleator() < 0.5 ? 0 : 1));
  const perechiA = amestecat(benzi / 2, aleator);
  const perechiB = amestecat(benzi / 2, aleator);
  const banda: number[] = [];
  for (let i = 0; i < FOI; i++) {
    if (i >= 8) banda.push(2 * perechiA[i - 8] + jumatateA[perechiA[i - 8]]);
    else if (i >= 4) banda.push(2 * perechiB[i - 4] + 1 - jumatateA[perechiB[i - 4]]);
    else banda.push(Math.floor(aleator() * benzi));
  }
  const unghi = () => (aleator() * 2 - 1) * DEZORDINE.rotatie;
  return banda.map((b) => {
    const fy = (b + 0.2 + aleator() * 0.6) / benzi;
    const amplitudine = 4 + aleator() * 2;
    let foaie: FoaieDezordine = { fx: 1, fy, z: 0, rx: 0, ry: 0, rz: 0, amplitudine, viteza: 0, faza: 0 };
    for (let k = 0; k < INCERCARI; k++) {
      const incercare = { ...foaie, fx: aleator(), z: DEZORDINE.zMin + aleator() * (DEZORDINE.zMax - DEZORDINE.zMin), rx: unghi(), ry: unghi(), rz: unghi() };
      foaie = incercare;
      if (!seSuprapun(cutieFoaie(incercare, d), zona)) break;
      // Dupa ultima incercare, capatul din dreapta al benzii e liber prin constructie.
      if (k === INCERCARI - 1) foaie = { ...incercare, fx: 1 };
    }
    return { ...foaie, viteza: 0.5 + aleator() * 0.24, faza: aleator() * Math.PI * 2 };
  });
}

export type Poza = { x: number; y: number; z: number; rx: number; ry: number; rz: number };

/** Poza unei foi in dezordine la momentul `t` (s). `margine`: marginea dreapta a cardului. */
export function pozaDezordine(f: FoaieDezordine, t: number, margine: number, inaltimeCard: number): Poza {
  const x = margine + DEZORDINE.de + f.fx * (DEZORDINE.pana - DEZORDINE.de);
  const y = (0.5 - f.fy) * Math.max(0, inaltimeCard - FOAIE.inaltime);
  return {
    x,
    y: y + Math.sin(t * f.viteza + f.faza) * f.amplitudine,
    z: f.z,
    rx: f.rx,
    ry: f.ry,
    // micro-rotatia din fisa: o oscilatie mica, cu faza foii
    rz: f.rz + Math.sin(t * f.viteza * 0.7 + f.faza) * MICRO_ROTATIE,
  };
}

/** Poza foii `k` in teanc la momentul `t` (s). */
export function pozaTeanc(k: number, t: number, margine: number): Poza {
  return {
    x: margine + TEANC.x,
    y: TEANC.baza + TEANC.pas * k + Math.sin(t * 0.9 + k * 0.6) * TEANC.leganat,
    z: TEANC.z + TEANC.zPas * k,
    rx: 0,
    ry: TEANC.rotY,
    rz: TEANC.rotZ,
  };
}

/** Amestecul dintre doua poze, cu `s` intre 0 (prima) si 1 (a doua). */
export function amesteca(a: Poza, b: Poza, s: number): Poza {
  const m = (u: number, v: number) => u + (v - u) * s;
  return { x: m(a.x, b.x), y: m(a.y, b.y), z: m(a.z, b.z), rx: m(a.rx, b.rx), ry: m(a.ry, b.ry), rz: m(a.rz, b.rz) };
}

/** O valoare animata: de unde pleaca, unde ajunge, cand porneste (ms, ceasul scenei). */
export type Animatie = { de: number; spre: number; start: number };

export function valoareLa(a: Animatie, acum: number, durata: number): number {
  const u = (acum - a.start) / durata;
  if (u <= 0) return a.de;
  if (u >= 1) return a.spre;
  return a.de + (a.spre - a.de) * iesireCubica(u);
}

/**
 * Animatiile noi ale foilor la schimbarea numarului de foi din teanc: pleaca numai foile care isi
 * schimba starea, in ordinea indexului, la 70 ms una dupa alta; fiecare pleaca din valoarea la care
 * se afla (o schimbare venita in mijlocul zborului nu sare).
 */
export function replanificaFoi(anim: Animatie[], vechi: number, nou: number, acum: number): Animatie[] {
  const rezultat = anim.slice();
  const jos = Math.min(vechi, nou);
  const sus = Math.max(vechi, nou);
  for (let i = jos; i < sus; i++) {
    rezultat[i] = {
      de: valoareLa(anim[i], acum, TRANZITIE.foaie),
      spre: i < nou ? 1 : 0,
      start: acum + (i - jos) * TRANZITIE.decalaj,
    };
  }
  return rezultat;
}

/** Starea pe care o citeste scena la fiecare cadru: pasul activ, scris de componenta. */
export type StarePanza = { pas: number };

/** Starea finala a panzei (miscare redusa): toate foile in teanc, bara plina. */
export const STARE_FINALA = { foi: FOI, bara: BARA.inaltime } as const;

/** Functia `construieste` a gazdei `Scena3D`, legata de starea data. */
export function construiestePanza(stare: StarePanza) {
  return function construieste({ THREE, scena, latime, inaltime, seteazaCamera, aleator }: ContextScena): DesenScena {
    const camera = new THREE.PerspectiveCamera(UNGHI_CAMERA, latime / inaltime, CAMERA_TAIERE.aproape, CAMERA_TAIERE.departe);
    camera.position.set(0, 0, distantaPixelLaPixel(inaltime, UNGHI_CAMERA));
    seteazaCamera(camera);

    // Lumina panzei (vezi antetul): directionala gazdei, intoarsa in stanga-sus-fata. Fara una in
    // scena, panza o aduce pe a ei.
    const directionale = scena.children.filter((o): o is Trei.DirectionalLight => (o as Trei.DirectionalLight).isDirectionalLight === true);
    if (directionale.length === 0) {
      const proprie = new THREE.DirectionalLight(0xffffff, LUMINA.intensitate);
      scena.add(proprie);
      directionale.push(proprie);
    }
    for (const lumina of directionale) {
      lumina.position.set(LUMINA.x, LUMINA.y, LUMINA.z);
      lumina.intensity = LUMINA.intensitate;
    }

    let margine = (latime - 2 * MARGINE_GAZDA.x) / 2;
    let inaltimeCard = inaltime - 2 * MARGINE_GAZDA.y;

    const grup = new THREE.Group();
    scena.add(grup);

    const deEliberat: Array<{ dispose: () => void }> = [];
    const pastreaza = <T extends { dispose: () => void }>(x: T): T => {
      deEliberat.push(x);
      return x;
    };

    // Foaia e luminata (Lambert); randurile de "text" au culoarea lor plina, fara lumina (ca pe
    // referinta), deci se citesc la fel pe orice foaie, oricat ar fi de inclinata.
    const matFoaie = pastreaza(new THREE.MeshLambertMaterial({ color: CULORI.foaie }));
    const matRand = pastreaza(new THREE.MeshBasicMaterial({ color: CULORI.rand }));
    const matBara = pastreaza(new THREE.MeshBasicMaterial({ color: CULORI.bara }));
    const geoFoaie = pastreaza(new THREE.BoxGeometry(FOAIE.latime, FOAIE.inaltime, FOAIE.grosime));
    const geoRanduri = RANDURI_FOAIE.map(([l]) => pastreaza(new THREE.PlaneGeometry(l, GROSIME_RAND)));
    const geoBara = pastreaza(new THREE.BoxGeometry(BARA.grosime, 1, 1));
    // Baza barei la 0, ca scalarea pe verticala s-o creasca in sus.
    geoBara.translate(0, 0.5, 0);

    const parametri = dezordine(aleator);
    const foi: Trei.Group[] = parametri.map(() => {
      const foaie = new THREE.Group();
      foaie.add(new THREE.Mesh(geoFoaie, matFoaie));
      RANDURI_FOAIE.forEach(([, y], k) => {
        const rand = new THREE.Mesh(geoRanduri[k], matRand);
        // randurile sunt centrate pe foaie, ca pe referinta
        rand.position.set(0, y, FOAIE.grosime / 2 + RAND_IN_FATA);
        foaie.add(rand);
      });
      grup.add(foaie);
      return foaie;
    });

    const bara = new THREE.Mesh(geoBara, matBara);
    grup.add(bara);

    // Starea animatiilor: fiecare foaie are s (0 dezordine, 1 teanc); bara are inaltimea ei.
    let pasCunoscut = stare.pas;
    let inTeanc = foiInTeanc(pasCunoscut);
    let anim: Animatie[] = parametri.map((_, i) => {
      const s = i < inTeanc ? 1 : 0;
      return { de: s, spre: s, start: 0 };
    });
    const hInitial = inaltimeBara(pasCunoscut);
    let animBara: Animatie = { de: hInitial, spre: hInitial, start: 0 };
    // Starea finala (miscare redusa) nu mai urmeaza pasul, nici dupa o redimensionare.
    let final = false;

    // Ultimul cadru asezat: o redimensionare il reaseaza cu aceleasi valori (la miscare redusa nu
    // mai vine alt cadru, iar marginea cardului s-a mutat).
    let ultim = { t: 0, acum: 0, mouseX: 0 };

    const aseaza = (t: number, acum: number, mouseX: number) => {
      ultim = { t, acum, mouseX };
      if (!final && stare.pas !== pasCunoscut) {
        const nou = foiInTeanc(stare.pas);
        anim = replanificaFoi(anim, inTeanc, nou, acum);
        animBara = {
          de: valoareLa(animBara, acum, TRANZITIE.bara),
          spre: inaltimeBara(stare.pas),
          start: acum + TRANZITIE.intarziereBara,
        };
        inTeanc = nou;
        pasCunoscut = stare.pas;
      }
      foi.forEach((foaie, i) => {
        const s = valoareLa(anim[i], acum, TRANZITIE.foaie);
        const p = amesteca(pozaDezordine(parametri[i], t, margine, inaltimeCard), pozaTeanc(i, t, margine), s);
        foaie.position.set(p.x, p.y, p.z);
        foaie.rotation.set(p.rx, p.ry, p.rz);
      });
      bara.position.set(margine + BARA.x, BARA.baza, 0);
      bara.scale.set(1, Math.max(0.001, valoareLa(animBara, acum, TRANZITIE.bara)), 1);
      grup.rotation.y = mouseX * MOUSE.tinta + Math.sin(t * 0.25) * MOUSE.deriva;
    };

    aseaza(0, 0, 0);

    return {
      cadru: (t, mouse) => aseaza(t, t * 1000, mouse.x),
      // Miscare redusa: un singur cadru, in starea finala, fara leganat si fara zbor.
      stareFinala: () => {
        final = true;
        inTeanc = STARE_FINALA.foi;
        anim = parametri.map(() => ({ de: 1, spre: 1, start: 0 }));
        animBara = { de: STARE_FINALA.bara, spre: STARE_FINALA.bara, start: 0 };
        aseaza(0, 0, 0);
      },
      redimensioneaza: (l, h) => {
        camera.aspect = l / h;
        camera.position.z = distantaPixelLaPixel(h, UNGHI_CAMERA);
        camera.updateProjectionMatrix();
        margine = (l - 2 * MARGINE_GAZDA.x) / 2;
        inaltimeCard = h - 2 * MARGINE_GAZDA.y;
        aseaza(ultim.t, ultim.acum, ultim.mouseX);
      },
      elibereaza: () => {
        for (const x of deEliberat) x.dispose();
        scena.remove(grup);
      },
    };
  };
}

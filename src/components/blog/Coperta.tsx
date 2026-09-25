// Coperta unui articol, generata din titlu si categorie (blog__articol-sablon.md, "Copertile"): o
// ilustratie SVG de 1200 x 630 pe `ardezie-0`, in gramatica de compozitii masurata pe referinta
// (tipografica, pictograma pe linie de baza, tabel, lista de fisiere, flux, cronologie). Nicio
// fotografie si nicio imagine a referintei: continutul vine din cuvintele titlului, din categorie si
// din data articolului, deci nu inventeaza cifre sau acte.
//
// Aceeasi coperta pe card, pe articol si printre inrudite; containerul da proportia (16:9 cu
// decupare pe L si pe articol, 1200 x 630 pe C), iar SVG-ul o umple ca `object-fit: cover`.
// E decorativa (`aria-hidden`): titlul articolului e langa ea, in text.
//
// Fara hooks si fara date de pe server: se randeaza la fel pe server si in insula listarii.

import { Archive, Building2, Calculator, FileText, Scale, Search, Server, Stamp, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { CategorieBlog } from "@/content/blog/registru";
import s from "./blog.module.css";

export type Compozitie = "tipografica" | "pictograma" | "tabel" | "fisiere" | "flux" | "cronologie";

/** Doua compozitii pe categorie; titlul alege intre ele, deci doua articole vecine difera des. */
export const COMPOZITII: Record<CategorieBlog, readonly [Compozitie, Compozitie]> = {
  contabilitate: ["tabel", "cronologie"],
  it: ["flux", "fisiere"],
  juridic: ["pictograma", "tipografica"],
  management: ["fisiere", "tipografica"],
};

const ICONITE: Record<CategorieBlog, readonly [LucideIcon, LucideIcon]> = {
  contabilitate: [Calculator, FileText],
  it: [Search, Server],
  juridic: [Scale, Stamp],
  management: [Archive, Building2],
};

/** Cuvinte de rezerva, cand titlul are prea putine cuvinte lungi. */
const REZERVA: Record<CategorieBlog, readonly string[]> = {
  contabilitate: ["facturi", "registre", "bilanț", "extrase"],
  it: ["căutare", "index", "scanare", "arhivă"],
  juridic: ["registru", "termen", "dosar", "arhivă"],
  management: ["dosare", "ordine", "arhivă", "rutină"],
};

// Cuvinte fara greutate in titluri (forma fara diacritice).
const OPRITE = new Set([
  "care",
  "cand",
  "unde",
  "este",
  "sunt",
  "pentru",
  "despre",
  "dupa",
  "prin",
  "intre",
  "fara",
  "catre",
  "cele",
  "sau",
  "unei",
  "unui",
  "unor",
  "cata",
  "cate",
  "cine",
  "cere",
  "cum",
]);

/** Dispersie FNV-1a pe 32 de biti: aceeasi intrare, aceeasi coperta, pe server si in browser. */
export function dispersie(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function faraDiacritice(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export type Cuvant = { afisat: string; ascii: string };

/** Cuvintele cu greutate din titlu (cel putin 4 litere, fara cuvintele de legatura), in ordine. */
export function cuvinteCheie(titlu: string, categorie: CategorieBlog, cate = 4): Cuvant[] {
  const rezultat: Cuvant[] = [];
  const vazute = new Set<string>();
  const adauga = (afisat: string) => {
    const ascii = faraDiacritice(afisat).toLowerCase();
    if (vazute.has(ascii) || rezultat.length >= cate) return;
    vazute.add(ascii);
    rezultat.push({ afisat: afisat.toLowerCase().slice(0, 14), ascii: ascii.slice(0, 14) });
  };
  for (const bucata of titlu.split(/[^\p{L}\p{N}]+/u)) {
    const ascii = faraDiacritice(bucata).toLowerCase();
    if (ascii.length < 4 || OPRITE.has(ascii) || /^\d+$/.test(ascii)) continue;
    adauga(bucata);
  }
  for (const r of REZERVA[categorie]) adauga(r);
  return rezultat;
}

export function alegeCompozitia(categorie: CategorieBlog, cheie: string): Compozitie {
  return COMPOZITII[categorie][dispersie(cheie) % 2];
}

export type CopertaProps = {
  titlu: string;
  categorie: CategorieBlog;
  /** Cheia de alegere (slugul articolului). */
  slug: string;
  /** Data articolului, ISO, pentru cronologie. */
  data: string;
  className?: string;
};

const LATIME = 1200;
const INALTIME = 630;
const MIJLOC = LATIME / 2;

function Card({ y = 96, h = 438 }: { y?: number; h?: number }) {
  return (
    <>
      <rect x={85} y={y + 8} width={1038} height={h} rx={18} className={s.copUmbra} />
      <rect x={81} y={y} width={1038} height={h} rx={18} className={s.copCard} />
    </>
  );
}

function Bifa({ x, y, marime = 1 }: { x: number; y: number; marime?: number }) {
  const d = "M" + x + " " + (y + 4 * marime) + " l" + 16 * marime + " " + 16 * marime + " l" + 34 * marime + " -" + 36 * marime;
  return <path d={d} className={s.copBifa} />;
}

function Tipografica({ cuvinte, eticheta }: { cuvinte: Cuvant[]; eticheta: string }) {
  const cuvant = cuvinte[0].afisat;
  const mare = cuvant.charAt(0).toUpperCase() + cuvant.slice(1);
  const marime = Math.min(170, Math.floor(1000 / (Math.max(4, mare.length) * 0.62)));
  return (
    <>
      <text x={MIJLOC} y={330} textAnchor="middle" fontSize={marime} className={s.copTitlu}>
        {mare}
      </text>
      <rect x={MIJLOC - 36} y={372} width={72} height={6} rx={3} className={s.copAccent} />
      <text x={MIJLOC} y={452} textAnchor="middle" fontSize={34} className={s.copMonoStins}>
        {eticheta}
      </text>
    </>
  );
}

function Pictograma({ Iconita, cuvant }: { Iconita: LucideIcon; cuvant: Cuvant }) {
  return (
    <>
      <Iconita x={515} y={200} width={170} height={170} strokeWidth={1.4} className={s.copIconita} aria-hidden="true" />
      <line x1={296} y1={391} x2={904} y2={391} className={s.copLinieAxa} />
      <text x={MIJLOC} y={464} textAnchor="middle" fontSize={40} className={s.copMono}>
        {cuvant.afisat}
      </text>
    </>
  );
}

function Tabel({ cuvinte, evidentiat }: { cuvinte: Cuvant[]; evidentiat: number }) {
  const randuri = cuvinte.slice(0, 4);
  return (
    <>
      <Card />
      {[140, 470, 800].map((x) => (
        <rect key={x} x={x} y={146} width={96} height={10} rx={5} className={s.copBara} />
      ))}
      <line x1={120} y1={182} x2={1080} y2={182} className={s.copLinie} />
      {randuri.map((c, i) => {
        const y = 240 + i * 72;
        const acum = i === evidentiat;
        return (
          <g key={c.ascii}>
            <text x={140} y={y} fontSize={34} className={s.copMonoStins}>
              {"0" + (i + 1)}
            </text>
            <text x={470} y={y} fontSize={34} className={acum ? s.copMonoAccent : s.copMono}>
              {c.afisat}
            </text>
            <rect x={800} y={y - 14} width={120 + ((c.ascii.length * 23) % 140)} height={10} rx={5} className={s.copBara} />
            {i < randuri.length - 1 ? <line x1={120} y1={y + 32} x2={1080} y2={y + 32} className={s.copLinieFina} /> : null}
          </g>
        );
      })}
    </>
  );
}

function Fisiere({ cuvinte }: { cuvinte: Cuvant[] }) {
  const randuri = cuvinte.slice(0, 3);
  return (
    <>
      <Card />
      {randuri.map((c, i) => {
        const y = 190 + i * 130;
        return (
          <g key={c.ascii}>
            <FileText x={140} y={y - 44} width={64} height={64} strokeWidth={1.3} className={s.copIconitaStinsa} aria-hidden="true" />
            <text x={230} y={y} fontSize={42} className={s.copMono}>
              {c.ascii + ".pdf"}
            </text>
            <rect x={230} y={y + 20} width={170 + ((c.ascii.length * 37) % 180)} height={10} rx={5} className={s.copBara} />
            {i === randuri.length - 1 ? <Bifa x={1000} y={y - 30} /> : null}
            {i < randuri.length - 1 ? <line x1={120} y1={y + 62} x2={1080} y2={y + 62} className={s.copLinieFina} /> : null}
          </g>
        );
      })}
    </>
  );
}

function Sageata({ x }: { x: number }) {
  return (
    <path
      d={"M" + x + " 315 h36 m-10 -9 l10 9 l-10 9"}
      className={s.copSageata}
    />
  );
}

function Flux({ cuvinte }: { cuvinte: Cuvant[] }) {
  const etichete = cuvinte.slice(0, 2).map((c) => c.afisat.slice(0, 10));
  const LATIME_LITERA = 19.2;
  const elemente: ReactNode[] = [];
  let x = 150;
  elemente.push(<FileText key="doc" x={x} y={255} width={110} height={120} strokeWidth={1.2} className={s.copIconitaStinsa} aria-hidden="true" />);
  x += 130;
  etichete.forEach((e, i) => {
    elemente.push(<Sageata key={"s" + i} x={x} />);
    x += 60;
    const w = Math.round(e.length * LATIME_LITERA + 44);
    elemente.push(
      <g key={"e" + i}>
        <rect x={x} y={285} width={w} height={60} rx={12} className={s.copEticheta} />
        <text x={x + w / 2} y={326} textAnchor="middle" fontSize={32} className={s.copMono}>
          {e}
        </text>
      </g>,
    );
    x += w + 20;
  });
  elemente.push(<Sageata key="sf" x={x} />);
  x += 66;
  elemente.push(<Bifa key="b" x={x} y={288} marime={1.1} />);
  return (
    <>
      <Card y={166} h={298} />
      {elemente}
    </>
  );
}

function Cronologie({ data }: { data: string }) {
  const [an, luna, zi] = data.split("-");
  return (
    <>
      <text x={646} y={286} textAnchor="middle" fontSize={92} className={s.copMono}>
        {zi + "." + luna + "." + an}
      </text>
      <path d="M647 329 V367 H733 V404" className={s.copLinieAxa} />
      <line x1={186} y1={442} x2={733} y2={442} className={s.copLinieAxa} />
      <line x1={733} y1={442} x2={1015} y2={442} className={s.copLinie} />
      <circle cx={200} cy={442} r={14} className={s.copPunct} />
      <circle cx={466} cy={442} r={14} className={s.copPunct} />
      <circle cx={733} cy={442} r={21.5} className={s.copAccent} />
      <circle cx={1000} cy={442} r={16} className={s.copPunctGol} />
    </>
  );
}

export default function Coperta({ titlu, categorie, slug, data, className }: CopertaProps) {
  const compozitie = alegeCompozitia(categorie, slug);
  const cuvinte = cuvinteCheie(titlu, categorie);
  const h = dispersie(slug + titlu);
  const Iconita = ICONITE[categorie][h % 2];
  return (
    <svg
      viewBox={"0 0 " + LATIME + " " + INALTIME}
      preserveAspectRatio="xMidYMid slice"
      className={[s.copertaSvg, className ?? ""].filter(Boolean).join(" ")}
      aria-hidden="true"
      focusable="false"
      data-compozitie={compozitie}
    >
      <rect width={LATIME} height={INALTIME} className={s.copFundal} />
      {compozitie === "tipografica" ? <Tipografica cuvinte={cuvinte} eticheta={categorie + " · " + data.slice(0, 4)} /> : null}
      {compozitie === "pictograma" ? <Pictograma Iconita={Iconita} cuvant={cuvinte[0]} /> : null}
      {compozitie === "tabel" ? <Tabel cuvinte={cuvinte} evidentiat={h % Math.min(4, cuvinte.length)} /> : null}
      {compozitie === "fisiere" ? <Fisiere cuvinte={cuvinte} /> : null}
      {compozitie === "flux" ? <Flux cuvinte={cuvinte} /> : null}
      {compozitie === "cronologie" ? <Cronologie data={data} /> : null}
    </svg>
  );
}

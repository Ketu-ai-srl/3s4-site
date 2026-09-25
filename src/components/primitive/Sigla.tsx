// Sigla 3S: fisierul vectorial oficial al marcii (inregistrata OSIM), servit din `public/brand/`.
//
// Trei fisiere pe care le alege componenta, un singur desen (provenienta si derivarea lor, ca si a
// formei compacte din `sigla-3s-compacta.svg`, in `docs/design/ACTIVE.md`):
//   - `sigla-3s.svg`        fisierul oficial, neschimbat la octet;
//   - `sigla-3s-inchis.svg` acelasi desen, cu textul negru implicit trecut pe alb, pentru fundal inchis;
//   - `sigla-3s-marca.svg`  acelasi desen, cu fereastra taiata pe iconita patrata (fara text).
//
// De ce imagine si nu SVG in pagina: fisierul are 29 KB (textul e desenat ca trasee). Pus in
// pagina, ar ingrosa cu atat HTML-ul fiecarei pagini care il foloseste; ca imagine se descarca o
// data si ramane in memoria navigatorului.
//
// Marimile vin de la cine o foloseste. Aici: iconita de 40 px din centrul buclei eroului
// (`forma="marca"`, src/components/erou/Erou.tsx). In antet, in sertarul mobil si in subsol sigla
// vine din `src/components/global/SiglaMarca.tsx`: forma compacta (iconita si ADRIA) de 40 px in
// antet si in sertar, sigla completa de 96 px in subsol; regula si masuratorile, in
// `docs/design/DIRECTIA.md`, sectiunea "Sigla". Forma compacta a fost ceruta de dispecer in
// sarcina feliei 43; acordul owner-ului pe asezarea ei e in asteptare.

import Image from "next/image";

const RAPORT_BLOC = 685.0901 / 288.69996;

export type SiglaProps = {
  /** `bloc` = marca intreaga (iconita + text); `marca` = doar iconita patrata. */
  forma?: "bloc" | "marca";
  /** `inchis` = varianta pentru fundal inchis (textul marcii alb). */
  tema?: "deschis" | "inchis";
  /** Inaltimea, in px. Latimea urmeaza raportul desenului. */
  inaltime: number;
  /** Textul alternativ. Gol doar cand sigla sta intr-o legatura care are deja nume accesibil. */
  alt?: string;
  className?: string;
  prioritar?: boolean;
};

export default function Sigla({
  forma = "bloc",
  tema = "deschis",
  inaltime,
  alt = "3S Scan Store Solve",
  className,
  prioritar = false,
}: SiglaProps) {
  const fisier =
    forma === "marca"
      ? "/brand/sigla-3s-marca.svg"
      : tema === "inchis"
        ? "/brand/sigla-3s-inchis.svg"
        : "/brand/sigla-3s.svg";
  const latime = forma === "marca" ? inaltime : Math.round(inaltime * RAPORT_BLOC * 10) / 10;
  return (
    <Image
      src={fisier}
      alt={alt}
      width={latime}
      height={inaltime}
      unoptimized
      priority={prioritar}
      className={className}
      style={{ width: latime + "px", height: inaltime + "px" }}
      role={alt === "" ? "presentation" : undefined}
    />
  );
}

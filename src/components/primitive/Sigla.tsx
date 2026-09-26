// Sigla 3S in piesele de continut: ICONITA marcii (chenarul de scanare, dosarul si "3S"),
// decupata din fisierul vectorial oficial (marca inregistrata OSIM), servita din `public/brand/`.
//
// Un singur fisier, `sigla-3s-iconita.svg`: decizia owner-ului D10 (25.09) - pe site sta doar
// iconita 3S, fara randurile de text ale siglei oficiale. Provenienta, in `docs/design/ACTIVE.md`.
// Iconita are numai elemente colorate explicit, deci e aceeasi pe fundal deschis si inchis.
//
// De ce imagine si nu SVG in pagina: fisierul are 12,7 KB de trasee. Pus in pagina, ar ingrosa cu
// atat HTML-ul fiecarei pagini care il foloseste; ca imagine se descarca o data.
//
// Marimile vin de la cine o foloseste (iconita din centrul buclei eroului, rama promo). In antet,
// in sertarul mobil si in subsol sigla vine din `src/components/global/SiglaMarca.tsx`; regula si
// masuratorile, in `docs/design/DIRECTIA.md`, sectiunea "Sigla".

import Image from "next/image";

export type SiglaProps = {
  /** Pastrat pentru apelantii existenti: singura forma e iconita patrata. */
  forma?: "marca";
  /** Latura, in px. */
  inaltime: number;
  /** Textul alternativ. Gol doar cand sigla sta intr-o legatura care are deja nume accesibil. */
  alt?: string;
  className?: string;
  prioritar?: boolean;
};

export default function Sigla({ inaltime, alt = "3S Scan Store Solve", className, prioritar = false }: SiglaProps) {
  return (
    <Image
      src="/brand/sigla-3s-iconita.svg"
      alt={alt}
      width={inaltime}
      height={inaltime}
      unoptimized
      priority={prioritar}
      className={className}
      style={{ width: inaltime + "px", height: inaltime + "px" }}
      role={alt === "" ? "presentation" : undefined}
    />
  );
}

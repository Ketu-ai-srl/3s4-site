// Sigiliul de la capatul unui document juridic (juridic__sablon.md §7): eticheta cu explicatia in
// bula nativa si amprenta SHA-256 a textului, primele 16 caractere hexazecimale si semnul de
// suspensie, cu toate cele 64 in `title`. Amprenta se calculeaza la CONSTRUIRE (pagina e statica),
// pe `textPentruAmprenta`, adica pe textul randat al documentului: proba de browser o recalculeaza
// din pagina si cere aceeasi valoare.

import { createHash } from "node:crypto";
import { SIGILIU } from "@/content/juridic/pagini";
import s from "./juridic.module.css";

/** SHA-256, in hexazecimal, al unui text UTF-8. */
export function amprentaSha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export default function SigiliuSha256({ amprenta }: { amprenta: string }) {
  if (!/^[0-9a-f]{64}$/.test(amprenta)) {
    throw new Error("sigiliul primeste o amprenta SHA-256 de 64 de caractere hexazecimale");
  }
  return (
    <div className={s.sigiliu} data-sigiliu="">
      <span className={s.sigiliuEticheta} title={SIGILIU.explicatie}>
        {SIGILIU.eticheta}
      </span>
      <code className={s.sigiliuAmprenta} title={amprenta} data-amprenta={amprenta}>
        {amprenta.slice(0, 16) + "…"}
      </code>
    </div>
  );
}

// Butonul de canal (WhatsApp) al paginilor EN de referinta (G1, G2, G3), cu FORMA butonului pe care il
// inlocuieste in componenta RO (decizia 53: aceleasi componente; decizia 3: pe 3s.md contactul e pe canale, nu pe
// formular). Aceleasi clase ca `Buton` (`claseButon`) si aceeasi structura: textul in `span`, apoi sageata cu clasa
// ei. Fara sigla canalului: pe perechile RO butoanele n-au iconita inainte, iar clasa ei ar fi o clasa de modul pe
// care pagina RO n-o are (proba de congruenta o numara).
//
// Tinta e conversatia WhatsApp cu textul precompletat al paginii (`[ref:<ref>]`), rezolvata pe server din
// `CANALE_JSON`; fara WhatsApp pe domeniu nu se randeaza nimic (`legaturaWhatsApp` intoarce null).
//
// Dosarul `_referinta` e privat (prefixul `_`): Next nu face rute din el.

import LegaturaCanal from "@/components/canale/LegaturaCanal";
import {
  claseButon,
  type MarimeButon,
  type VariantaButon,
} from "@/components/primitive/Buton";
import s from "@/components/primitive/Buton.module.css";
import Iconita from "@/components/primitive/Iconita";
import { CANALE, legaturaWhatsApp, type Canale } from "@/content/canale";

export type ButonCanalProps = {
  /** Codul paginii si textul precompletat al conversatiei. */
  cta: { ref: string; textWhatsapp: string };
  text: string;
  varianta: VariantaButon;
  marime: MarimeButon;
  /** Sageata de dupa text, cand butonul RO inlocuit o are. */
  sageata: boolean;
  canale?: Canale;
};

/** Marimea si conturul sagetii, ca in `Buton` (tabelul SAGEATA de acolo), pentru marimile folosite aici. */
const SAGEATA: Partial<
  Record<MarimeButon, { marime: number; contur: number }>
> = {
  plat: { marime: 15, contur: 2 },
  mare: { marime: 18, contur: 1.5 },
};

export default function ButonCanal({
  cta,
  text,
  varianta,
  marime,
  sageata,
  canale = CANALE,
}: ButonCanalProps) {
  const href = legaturaWhatsApp(cta.ref, cta.textWhatsapp, canale);
  if (href === null) {
    return null;
  }
  const dim = SAGEATA[marime] ?? { marime: 16, contur: 2 };
  return (
    <LegaturaCanal
      legatura={{ implicit: href, pagini: [] }}
      canal="whatsapp"
      className={claseButon(varianta, marime)}
    >
      <span>{text}</span>
      {sageata ? (
        <Iconita
          nume="arrow-right"
          marime={dim.marime}
          contur={dim.contur}
          className={s.sageata}
        />
      ) : null}
    </LegaturaCanal>
  );
}

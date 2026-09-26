// Cardurile statice ale paginii de scanare (promo__scanare-cu-telefonul.md §3-§4): datele extrase ale unui
// bon care asteapta aprobarea (3 randuri cheie / valoare) si cardul de cifre (3 valori `albastru-promo`, statice, cu
// etichete de 4 / 3 / 2 randuri, aliniate la centru, deci valorile coboara in trepte ca la referinta).
// Cifrele sunt fapte din registru (plan §6.3): pretul de azi si criptarea (`src/content/promo.ts`).

import { CARD_CIFRE, CARD_OCR } from "@/content/promo";
import { CardMacheta } from "./Piese";
import s from "./scanare.module.css";

export function CardOcr() {
  return (
    <CardMacheta
      nume="ocr"
      scanare
      declaratie="Exemplu cu date fictive: furnizorul, totalul și data unui bon care așteaptă aprobarea."
    >
      <dl className={s.ocr}>
        {CARD_OCR.randuri.map((r) => (
          <div key={r.cheie} className={s.ocrRand}>
            <dt className={s.ocrCheie}>{r.cheie}</dt>
            <dd className={s.ocrValoare}>{r.valoare}</dd>
          </div>
        ))}
      </dl>
    </CardMacheta>
  );
}

export function CardCifre() {
  return (
    <CardMacheta nume="cifre" scanare centrat exemplu={false} declaratie="Trei fapte despre 3S: prețul de azi, criptarea fișierelor la stocare și cea la transfer.">
      <ul className={s.cifre}>
        {CARD_CIFRE.cifre.flatMap((c, i) => {
          const el = (
            <li key={c.valoare} className={s.cifra}>
              <span className={s.cifraValoare}>{c.valoare}</span>
              <span className={s.cifraEticheta}>{c.eticheta}</span>
            </li>
          );
          return i === 0 ? [el] : [<li key={"sep" + i} className={s.separatorCifra} aria-hidden="true" />, el];
        })}
      </ul>
    </CardMacheta>
  );
}

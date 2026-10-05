// S2 - recunoasterea (functionalitati__cautare-ai.md, S2): sectiunea urca 35vh peste finalul avalansei,
// cu titlul de trei cuvinte si ecoul lui uriasi in spate (176 px, `ardezie-3` la opacitate .056 -> .07,
// estompat). Blocul porneste de la opacitate .8 si scara 1,012 si se asaza (1 / 1) cand sectiunea a
// pornit (p > 0,08, adica avalansa a trecut de ~0,85).
//
// ECOUL e desenat din CSS (`content: attr(...)`), nu ca text in pagina: e acelasi titlu, pur decorativ.
// Asa nu se citeste de doua ori si nu intra in masuratorile de contrast ca un text de citit.
// La 390 ecoul dispare, iar titlul creste la 66,3 px, pe trei randuri (fisa S2).
//
// CONTINUTUL pe editie (`continut`), cu implicitul RO: pagina RO nu paseaza nimic, deci randeaza ce randa.

import SectiuneScena from "@/components/cinema/SectiuneScena";
import { RECUNOASTERE } from "@/content/functionalitati/cautare-ai";
import s from "./cautare.module.css";

/** Textele recunoasterii, pe editie; tip structural, constanta RO (`RECUNOASTERE`) il satisface. */
export type ContinutRecunoastere = { titlu: string; paragraf: string };

export default function Recunoastere({ continut = RECUNOASTERE }: { continut?: ContinutRecunoastere }) {
  return (
    <SectiuneScena inaltime={55} inaltimeMobil={60} spatiere="mica" latime={null} className={s.recunoastere} nume="recunoastere">
      <div className={s.ecou} data-ecou={continut.titlu} aria-hidden="true" />
      <div className={s.recunoastereBloc}>
        <h2 className={["t-h2-cinema", s.recunoastereTitlu].join(" ")}>{continut.titlu}</h2>
        <p className={s.recunoastereParagraf}>{continut.paragraf}</p>
        <div className={s.linieAlbastra} aria-hidden="true" />
      </div>
    </SectiuneScena>
  );
}

// Corpul unui document juridic (sablonul A, juridic__sablon.md §5-§6): proza primitivei `Proza`, cu
// titluri h2 sau h3, liste, tabele `TabelDate` si separatorul cu ancora. Fiecare sectiune e un
// `section`; cheia ei merge in atributul cerut de porti: `data-art13` pe politica de
// confidentialitate (G-MD-01), `data-l284` pe cea de cookie-uri (G-MD-08), numai pentru cheile
// din lista portii; celelalte sectiuni poarta `data-sectiune`. Blocurile legate de o jurisdictie
// stau intr-un `div` cu `data-jurisdictie` (G-MD-10), cu eticheta lor deasupra.
//
// Textul randat aici e EXACT textul din model (`textIntreg` si amprenta din `tipuri.ts` il citesc in
// aceeasi ordine): componenta nu adauga niciun cuvant, ca amprenta sa fie a textului de pe pagina.

import Proza from "@/components/primitive/Proza";
import TabelDate from "@/components/primitive/TabelDate";
import type { BlocJuridic, CelulaJuridica, DocumentJuridic, SectiuneJuridica } from "@/content/juridic/tipuri";
import TextInLinie from "./TextInLinie";
import s from "./juridic.module.css";

export type MarcajSectiuni = {
  /** Atributul in care intra cheia sectiunii. */
  atribut: "data-art13" | "data-l284";
  /** Cheile care primesc atributul: exact lista portii. */
  chei: readonly string[];
};

function Celula({ celula }: { celula: CelulaJuridica }) {
  if (typeof celula === "string") return <TextInLinie text={celula} />;
  return (
    <>
      <strong>
        <TextInLinie text={celula.text} />
      </strong>
      <small>
        <TextInLinie text={celula.detaliu} />
      </small>
    </>
  );
}

function Bloc({ bloc }: { bloc: BlocJuridic }) {
  const continut = (
    <>
      {bloc.eticheta ? (
        <p className={s.eticheta}>
          <TextInLinie text={bloc.eticheta} />
        </p>
      ) : null}
      {bloc.paragrafe.map((p, i) => (
        <p key={"p" + i}>
          <TextInLinie text={p} />
        </p>
      ))}
      {bloc.lista ? (
        bloc.lista.numerotata ? (
          <ol>
            {bloc.lista.elemente.map((e, i) => (
              <li key={i}>
                <TextInLinie text={e} />
              </li>
            ))}
          </ol>
        ) : (
          <ul>
            {bloc.lista.elemente.map((e, i) => (
              <li key={i}>
                <TextInLinie text={e} />
              </li>
            ))}
          </ul>
        )
      ) : null}
      {bloc.tabel ? (
        <TabelDate
          forma={bloc.tabel.forma}
          titlu={bloc.tabel.titlu}
          antet={bloc.tabel.antet?.map((a, i) => <TextInLinie key={i} text={a} />)}
          randuri={bloc.tabel.randuri.map((rand) => rand.map((c, j) => <Celula key={j} celula={c} />))}
        />
      ) : null}
      {(bloc.dupa ?? []).map((p, i) => (
        <p key={"d" + i}>
          <TextInLinie text={p} />
        </p>
      ))}
    </>
  );
  return bloc.jurisdictie === null ? continut : <div data-jurisdictie={bloc.jurisdictie}>{continut}</div>;
}

function Sectiune({ sectiune, marcaj }: { sectiune: SectiuneJuridica; marcaj?: MarcajSectiuni }) {
  const Titlu = sectiune.nivel === 3 ? "h3" : "h2";
  const atribute: Record<string, string> =
    marcaj && marcaj.chei.includes(sectiune.cheie)
      ? { [marcaj.atribut]: sectiune.cheie }
      : { "data-sectiune": sectiune.cheie };
  return (
    <>
      {sectiune.ancoraInainte ? <hr id={sectiune.ancoraInainte} /> : null}
      <section {...atribute}>
        <Titlu>
          <TextInLinie text={sectiune.titlu} />
        </Titlu>
        {sectiune.blocuri.map((b, i) => (
          <Bloc key={i} bloc={b} />
        ))}
      </section>
    </>
  );
}

export default function CorpDocument({ document, marcaj }: { document: DocumentJuridic; marcaj?: MarcajSectiuni }) {
  return (
    <Proza>
      {document.introducere === "" ? null : (
        <p>
          <TextInLinie text={document.introducere} />
        </p>
      )}
      {document.sectiuni.map((sectiune) => (
        <Sectiune key={sectiune.cheie} sectiune={sectiune} marcaj={marcaj} />
      ))}
    </Proza>
  );
}

// Corpul unui document juridic (sablonul A, juridic__sablon.md §5-§6): proza primitivei `Proza`, cu
// titluri h2 sau h3, liste, tabele `TabelDate` si separatorul cu ancora. Fiecare sectiune e un
// `section`; cheia ei merge in atributul cerut de porti: `data-art13` pe politica de
// confidentialitate (G-MD-01), `data-l284` pe cea de cookie-uri (G-MD-08), numai pentru cheile
// din lista portii; celelalte sectiuni poarta `data-sectiune`. Blocurile legate de o jurisdictie
// stau intr-un `div` cu `data-jurisdictie` (G-MD-10), cu eticheta lor deasupra.
//
// Textul randat aici e EXACT textul din model (`textIntreg` si amprenta din `tipuri.ts` il citesc in
// aceeasi ordine): componenta nu adauga niciun cuvant, ca amprenta sa fie a textului de pe pagina.
//
// TIPUL COMUN (felia 79): componenta primeste corpul din modelul comun (`src/content/model/tipuri.ts`),
// nu `DocumentJuridic`. Orice document juridic e atribuibil acelui corp (garantie verificata de
// compilator acolo), deci paginile juridice raman neschimbate, iar paginile de continut EN folosesc
// acelasi randator prin `CorpPagina`. Un bloc fara jurisdictie (`null` sau lipsa) nu primeste `div`.
//
// PREAMBULUL SI SUBELEMENTELE (felia 95): documentele familiei `md` au blocuri intre introducere si
// prima sectiune (`preambul`: blocul temporar despre inregistrarea firmei, rezumatul "pe scurt") si
// subpuncte sub unele elemente de lista (`lista.subelemente`). Modelul comun le lasa deoparte (antetul
// lui `model/tipuri.ts`), deci componenta isi declara mai jos tipul de intrare: corpul comun, largit pe
// toata adancimea cu exact aceste doua campuri, optionale. Ordinea e cea din `textIntreg` si din
// `textPentruAmprenta`: introducerea, preambulul, sectiunile; subpunctele imediat dupa elementul lor
// (`textBloc`), ca lista cu buline in interiorul lui. Un document fara ele randeaza ca inainte, fara
// niciun element gol.

import Proza from "@/components/primitive/Proza";
import TabelDate from "@/components/primitive/TabelDate";
import type { BlocComun, CelulaComuna, CorpComun, ListaComuna, SectiuneComuna } from "@/content/model/tipuri";
import TextInLinie from "./TextInLinie";
import s from "./juridic.module.css";

export type MarcajSectiuni = {
  /** Atributul in care intra cheia sectiunii. */
  atribut: "data-art13" | "data-l284";
  /** Cheile care primesc atributul: exact lista portii. */
  chei: readonly string[];
};

/** Lista modelului comun, cu subpunctele de sub elementul cu indexul dat (familia `md`). */
type ListaDocument = ListaComuna & { subelemente?: Readonly<Record<number, readonly string[]>> };
type BlocDocument = Omit<BlocComun, "lista"> & { lista?: ListaDocument };
type SectiuneDocument = Omit<SectiuneComuna, "blocuri"> & { blocuri: readonly BlocDocument[] };

/**
 * Intrarea componentei: corpul comun plus preambulul si subelementele. Atat `DocumentJuridic`, cat si
 * corpul paginilor de continut sunt atribuibile ei (asertiune de tip in `tests/juridic-md.test.ts`).
 */
export type CorpDocumentIntrare = Omit<CorpComun, "sectiuni"> & {
  sectiuni: readonly SectiuneDocument[];
  /** Blocurile dintre introducere si prima sectiune; lipsa sau goala = nimic randat. */
  preambul?: readonly BlocDocument[];
};

function Element({ text, subelemente }: { text: string; subelemente: readonly string[] | undefined }) {
  return (
    <li>
      <TextInLinie text={text} />
      {subelemente && subelemente.length > 0 ? (
        <ul className={s.subelemente}>
          {subelemente.map((r, j) => (
            <li key={j}>
              <TextInLinie text={r} />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Celula({ celula }: { celula: CelulaComuna }) {
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

function Bloc({ bloc }: { bloc: BlocDocument }) {
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
              <Element key={i} text={e} subelemente={bloc.lista?.subelemente?.[i]} />
            ))}
          </ol>
        ) : (
          <ul>
            {bloc.lista.elemente.map((e, i) => (
              <Element key={i} text={e} subelemente={bloc.lista?.subelemente?.[i]} />
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
  return bloc.jurisdictie == null ? continut : <div data-jurisdictie={bloc.jurisdictie}>{continut}</div>;
}

function Sectiune({ sectiune, marcaj }: { sectiune: SectiuneDocument; marcaj?: MarcajSectiuni }) {
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

export default function CorpDocument({ document, marcaj }: { document: CorpDocumentIntrare; marcaj?: MarcajSectiuni }) {
  const preambul = document.preambul ?? [];
  return (
    <Proza>
      {document.introducere === "" ? null : (
        <p>
          <TextInLinie text={document.introducere} />
        </p>
      )}
      {preambul.length === 0 ? null : (
        <div className={s.preambul} data-preambul="">
          {preambul.map((b, i) => (
            <Bloc key={i} bloc={b} />
          ))}
        </div>
      )}
      {document.sectiuni.map((sectiune) => (
        <Sectiune key={sectiune.cheie} sectiune={sectiune} marcaj={marcaj} />
      ))}
    </Proza>
  );
}

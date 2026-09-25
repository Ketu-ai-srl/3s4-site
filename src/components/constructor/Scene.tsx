// Cele 9 scene ale panoului (acasa-constructor.md §7): obiectul principal al fiecarei industrii si
// liniile de sub el, ca functie de pasii atinsi de program (`a("X2")`, `a("T4")` ...). Forma si
// momentele sunt ale referintei; datele sunt ale noastre, fictive (plan D9), din
// `src/content/acasa-constructor.ts`.
//
// Un element care inca nu a intrat e in pagina, ascuns prin opacitate: panoul are de la primul
// cadru inaltimea finala. Ce la referinta se "estompeaza" prin opacitate (verigile inactive,
// randurile de registru nepotrivite, revizia retrasa) trece la 3S pe culoarea `--sc-faint`, fara
// opacitate pe text: altfel textul coboara sub 4,5:1 (COMPONENTE.md §5.1).

import type { CodIndustrie } from "@/content/acasa";
import {
  SCENARII,
  completeaza,
  type ObiectAsigurari,
  type ObiectAvocatura,
  type ObiectConstructii,
  type ObiectConsultanta,
  type ObiectContabilitate,
  type ObiectImobiliare,
  type ObiectIt,
  type ObiectLogistica,
  type ObiectNotariat,
  type StareActImobil,
} from "@/content/acasa-constructor";
import type { NumePas } from "./program";
import s from "./Scene.module.css";

type Ajuns = (p: NumePas) => boolean;

function cls(...clase: (string | false | null | undefined)[]): string {
  return clase.filter(Boolean).join(" ");
}

function Pastila({ text, vizibila, className }: { text: string; vizibila: boolean; className?: string }) {
  return <span className={cls(s.pastila, vizibila && s.in, className)}>{text}</span>;
}

// --- 7.1 Constructii -------------------------------------------------------------------------

function Constructii({ o, a }: { o: ObiectConstructii; a: Ajuns }) {
  const retrasa = a("T2");
  const aprinse = a("T3") ? o.bara.total : a("X5") ? o.bara.total - 1 : a("X4") ? o.bara.total - 2 : 0;
  return (
    <>
      <div className={cls(s.obiect, s.plansa, a("X2") && s.in)}>
        <div className={cls(s.capObiect, s.capColoana)}>
          <span className={cls(s.mono, s.cod)}>{o.cod}</span>
          <span className={s.numeObiect}>{o.nume}</span>
        </div>
        <div className={s.revizii}>
          <div className={cls(s.revizie, retrasa && s.retrasa)}>
            <span className={cls(s.mono, s.numarRevizie)}>{o.veche.numar}</span>
            <span className={cls(s.mono, s.dataRevizie)}>{o.veche.data}</span>
            <span className={cls(s.stareRevizie, !retrasa && s.actuala)}>{retrasa ? o.veche.retrasa : o.veche.stare}</span>
          </div>
          <div className={cls(s.revizie, s.noua, retrasa && s.in)}>
            <span className={cls(s.mono, s.numarRevizie)}>{o.noua.numar}</span>
            <span className={cls(s.mono, s.dataRevizie)}>{o.noua.data}</span>
            <span className={cls(s.stareRevizie, s.actuala)}>{o.noua.stare}</span>
            <span className={s.notaRevizie}>{o.noua.propunere}</span>
          </div>
        </div>
      </div>
      <div className={cls(s.bara, a("X4") && s.in)}>
        <span className={s.numeBara}>{o.bara.nume}</span>
        <span className={s.segmente} aria-hidden="true">
          {Array.from({ length: o.bara.total }, (_, i) => (
            <span key={i} className={cls(s.segment, i < aprinse && s.aprins)} />
          ))}
        </span>
        <span className={cls(s.contor, a("T3") && s.ok)}>
          {a("T3") ? o.bara.complet : completeaza(o.bara.contor, { n: aprinse, total: o.bara.total })}
        </span>
      </div>
    </>
  );
}

// --- 7.2 Contabilitate -----------------------------------------------------------------------

function Contabilitate({ o, a }: { o: ObiectContabilitate; a: Ajuns }) {
  const intrare: NumePas[] = ["X2", "X2", "X3", "X4", "X5"];
  const valoare: NumePas[] = ["T1", "T2", "T3", "T4", "T5"];
  return (
    <>
      <div className={cls(s.obiect, s.dosarLunar, a("X2") && s.in)}>
        <div className={s.capObiect}>
          <span className={s.numeClient}>{o.client}</span>
          <span className={cls(s.mono, s.perioada)}>{o.perioada}</span>
        </div>
        <div className={s.celule}>
          {o.celule.map((c, i) => (
            <div key={c.eticheta} className={cls(s.celula, c.scurta && s.scurta, a(intrare[i]) && s.in)}>
              <span className={s.etichetaCelula}>{c.eticheta}</span>
              <span className={s.valoareLoc}>
                <span className={s.pastilaGoala} aria-hidden="true" />
                <span className={cls(s.valoare, a(valoare[i]) && s.in)}>{c.valoare}</span>
              </span>
            </div>
          ))}
          <div className={cls(s.lipsa, a("T3") && s.in)}>
            <span className={s.lipsaText}>{o.lipsa}</span>
            <span className={s.propunereText}>{o.propunere}</span>
          </div>
        </div>
      </div>
      <p className={cls(s.linieStare, s.avertisment, a("X4") && s.in)}>{o.termen}</p>
    </>
  );
}

// --- 7.3 Logistica ---------------------------------------------------------------------------

type StareVeriga = "inactiva" | "activa" | "fierbinte" | "rezolvata";

function Logistica({ o, a }: { o: ObiectLogistica; a: Ajuns }) {
  const stari: StareVeriga[] = [
    a("T1") ? "activa" : "inactiva",
    a("T4") ? "activa" : a("T2") ? "fierbinte" : "inactiva",
    a("T3") ? "activa" : "inactiva",
    a("T4") ? "activa" : "inactiva",
    a("T4") ? "rezolvata" : "inactiva",
  ];
  return (
    <>
      <div className={cls(s.obiect, s.cursa, a("X2") && s.in)}>
        <p className={s.capCursa}>{o.cap}</p>
        <ol className={s.lant}>
          {o.verigi.map((v, i) => (
            <li key={v} className={cls(s.veriga, s[stari[i]])} data-veriga={stari[i]}>
              <span className={s.numeVeriga}>{v}</span>
              {i === 1 && stari[1] === "fierbinte" ? (
                <span className={cls(s.notaVeriga, s.notaFierbinte)}>{o.notaFierbinte}</span>
              ) : null}
              {i === 4 ? (
                <span className={cls(s.notaVeriga, s.in, stari[4] === "rezolvata" && s.ok)}>
                  {stari[4] === "rezolvata" ? o.notaDeblocata : o.notaBlocata}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <div className={cls(s.coada, a("X3") && s.in)}>
        {a("T4") ? (
          <>
            <span className={cls(s.mono, s.fisierCoada)}>{o.fisier}</span>
            <Pastila text={o.propunere} vizibila />
          </>
        ) : (
          <span className={s.asteptareCoada}>{o.coada}</span>
        )}
      </div>
    </>
  );
}

// --- 7.4 IT ----------------------------------------------------------------------------------

function It({ o, a }: { o: ObiectIt; a: Ajuns }) {
  const schimbat = a("T2");
  const final = a("final");
  return (
    <>
      <div className={cls(s.obiect, s.contract, a("X2") && s.in)}>
        <div className={cls(s.capObiect, s.capColoana)}>
          <span className={s.numeClient}>{o.client}</span>
          <span className={cls(s.mono, s.dataContract)}>{schimbat ? o.dataNoua : o.dataInitiala}</span>
          <Pastila text={o.propunere} vizibila={schimbat} className={s.pastilaIt} />
        </div>
        <div className={s.axa}>
          <span className={cls(s.azi, a("T4") && s.in)}>{o.azi}</span>
          <div className={s.pistaAxa}>
            <span className={cls(s.segmentVechi, schimbat && s.gol)} />
            <span className={cls(s.segmentNou, schimbat && s.in)} />
            <span className={cls(s.linieAzi, a("T4") && s.in)} />
          </div>
          <div className={s.legenda}>
            <span className={cls(s.etichetaVeche, schimbat && s.inlocuit)}>
              {schimbat ? o.vechiInlocuit : o.vechiInVigoare}
            </span>
            <span className={cls(s.etichetaNoua, schimbat && s.in)}>{o.nou}</span>
          </div>
        </div>
        <p className={s.set}>
          {o.set.map((cuvant, i) => (
            <span key={cuvant} className={cls(s.cuvant, i === o.lipsa && s.cuvantLipsa, i === o.lipsa && final && s.ok)}>
              {cuvant}
            </span>
          ))}
        </p>
      </div>
      <p className={cls(s.linieStare, final && s.ok, a("X3") && s.in)}>{final ? o.notaFinala : o.nota}</p>
    </>
  );
}

// --- 7.5 Avocatura ---------------------------------------------------------------------------

function Avocatura({ o, a }: { o: ObiectAvocatura; a: Ajuns }) {
  const corectat = a("T4");
  return (
    <>
      <div className={cls(s.obiect, s.cauza, a("X2") && s.in)}>
        <div className={cls(s.capObiect, s.capSpatiat)}>
          <span className={cls(s.mono, s.idCauza)}>{o.dosar}</span>
          <span className={cls(s.stampila, corectat && s.in)}>{o.stampila}</span>
        </div>
        <div className={cls(s.pistaTermen, corectat && s.plina)} aria-hidden="true">
          <span className={s.umplereTermen} />
          <span className={s.zid} />
        </div>
        <div className={s.numaratoare}>
          <span className={cls(s.zile, corectat && s.corect)}>{corectat ? o.zileCorect : o.zileInitial}</span>
          <span className={s.dreaptaNumaratoare}>
            <span className={s.dataLimita}>{corectat ? o.dataCorecta : o.dataInitiala}</span>
            <span className={cls(s.notaLimita, corectat && s.in)}>{o.nota}</span>
          </span>
        </div>
        <ul className={s.acte}>
          <li className={cls(s.act, a("T2") && s.in)}>{o.acte[0]}</li>
          <li className={cls(s.act, a("T3") && s.in)}>{o.acte[1]}</li>
          <li className={cls(s.act, s.in, corectat && s.ancora)}>{corectat ? o.acte[2] : o.asteptare}</li>
        </ul>
      </div>
      <p className={cls(s.notaAncora, corectat && s.in)}>{o.ancora}</p>
    </>
  );
}

// --- 7.6 Imobiliare --------------------------------------------------------------------------

function Imobiliare({ o, a }: { o: ObiectImobiliare; a: Ajuns }) {
  const stare = (i: number): StareActImobil => {
    const initiala = o.acte[i].stare;
    if (initiala === "complet") return "complet";
    if (i === 2) return a("T2") ? "complet" : initiala;
    if (i === 3) return a("T4") ? "complet" : initiala;
    return a("final") ? "complet" : initiala;
  };
  const primaLipsa = o.acte.findIndex((_, i) => stare(i) !== "complet");
  const complet = a("final");
  return (
    <>
      <div className={cls(s.obiect, s.proprietate, complet && s.chenarOk, a("X2") && s.in)}>
        <div className={cls(s.capObiect, s.capColoana)}>
          <span className={s.programare}>{o.programare}</span>
          <Pastila text={o.propunere} vizibila className={s.pastilaImobiliare} />
        </div>
        <p className={s.adresa}>{o.adresa}</p>
        <ul className={s.listaActe}>
          {o.acte.map((act, i) => {
            const st = stare(i);
            return (
              <li key={act.nume} className={cls(s.randAct, s[st])}>
                <span className={s.numeAct}>{act.nume}</span>
                <span className={s.stareAct}>{o.stari[st]}</span>
                {st === "invechit" ? <span className={s.notaInvechit}>{o.notaInvechit}</span> : null}
              </li>
            );
          })}
        </ul>
      </div>
      <p className={cls(s.linieStare, complet && s.ok, a("X3") && s.in)}>
        {complet || primaLipsa < 0 ? o.complet : completeaza(o.lipseste, { act: o.acte[primaLipsa].nume })}
      </p>
    </>
  );
}

// --- 7.7 Asigurari ---------------------------------------------------------------------------

function Asigurari({ o, a }: { o: ObiectAsigurari; a: Ajuns }) {
  const stare = (i: number): "asteptare" | "complet" | "lipsa" => {
    if (i === 2 && a("T4")) return "lipsa";
    const cand: NumePas[] = ["T1", "T2", "T3", "T4", "T5"];
    return a(cand[i]) ? "complet" : "asteptare";
  };
  return (
    <>
      <div className={cls(s.obiect, s.dauna, a("X2") && s.in)}>
        <div className={cls(s.capObiect, s.capColoana)}>
          <span className={cls(s.mono, s.idDauna)}>{o.dosar}</span>
          <span className={cls(s.returnat, a("T4") && s.in)}>{o.returnat}</span>
          <span className={cls(s.propunereDreapta, a("T1") && s.in)}>{o.propunere}</span>
        </div>
        <div className={s.sloturi}>
          {o.sloturi.map((nume, i) => {
            const st = stare(i);
            return (
              <div key={nume} className={cls(s.slot, s["slot-" + st])} data-slot={st}>
                <span className={s.baraSlot} aria-hidden="true" />
                <span className={s.numeSlot}>{nume}</span>
                <span className={s.stareSlot}>{o.stari[st]}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={cls(s.subsolDauna, a("X3") && s.in)}>
        <span className={s.zileDeschis}>{o.zile}</span>
        <span className={cls(s.fotografii, a("T5") && s.in)}>{o.fotografii}</span>
      </div>
    </>
  );
}

// --- 7.8 Notariat ----------------------------------------------------------------------------

const LITERE_TASTATE: [NumePas, number][] = [
  ["T5", 14],
  ["T4", 11],
  ["T3", 8],
  ["T2", 6],
  ["T1", 3],
];

function Notariat({ o, a }: { o: ObiectNotariat; a: Ajuns }) {
  const litere = LITERE_TASTATE.find(([p]) => a(p))?.[1] ?? 0;
  const text = o.cautare.slice(0, litere);
  const gasit = a("T5");
  const cursor = a("T1") && !gasit;
  const intrare: NumePas[] = ["X3", "X4", "X5"];
  return (
    <>
      <div className={cls(s.obiect, s.registru, a("X2") && s.in)}>
        <div className={cls(s.caseta, litere > 0 && s.cautare)}>
          {text ? <span className={s.textCautare}>{text}</span> : <span className={s.substituent}>{o.substituent}</span>}
          <span className={cls(s.cursor, cursor && s.in)} aria-hidden="true" />
        </div>
        <div className={s.randuri}>
          {o.randuri.map((r, i) => (
            <div
              key={r.numar}
              className={cls(
                s.randRegistru,
                a(intrare[i]) && s.in,
                gasit && i === o.potrivit && s.potrivit,
                gasit && i !== o.potrivit && s.estompat,
              )}
            >
              <span className={cls(s.mono, s.numarRegistru)}>{r.numar}</span>
              <span className={s.parti}>{r.parti}</span>
              <span className={s.pastrare}>{r.pastrare}</span>
            </div>
          ))}
        </div>
      </div>
      <p className={cls(s.linieStare, s.ok, gasit && s.in)}>{o.gasit}</p>
    </>
  );
}

// --- 7.9 Consultanta -------------------------------------------------------------------------

function Consultanta({ o, a }: { o: ObiectConsultanta; a: Ajuns }) {
  const trimis = a("T1");
  const fierbinte = a("T2") && !a("T4");
  const intors = a("T4");
  return (
    <>
      <div className={cls(s.obiect, s.fir, a("X2") && s.in)}>
        <p className={s.numeObiect}>{o.nume}</p>
        <div className={s.firInterior}>
          <span className={cls(s.coloanaFir, a("X3") && s.in)} aria-hidden="true" />
          <div className={s.pereche}>
            <div className={cls(s.nod, s.nodIntors, intors && s.in)}>
              <span className={s.linieIntors}>{o.intors.linie}</span>
              <Pastila text={o.intors.propunere} vizibila className={s.pastilaConsultanta} />
            </div>
            <span className={s.axaNod} aria-hidden="true">
              <span className={cls(s.bratStanga, intors && s.in)} />
              <span className={cls(s.punctFir, trimis && s.trimis, fierbinte && s.fierbinte, intors && s.inchis)} />
              <span className={cls(s.bratDreapta, trimis && s.in)} />
            </span>
            <div className={cls(s.nod, s.nodTrimis, trimis && s.in, intors && s.chenarOk)}>
              <span className={s.numeNod}>{o.trimis.nume}</span>
              <span className={s.metaNod}>{o.trimis.meta}</span>
              <span className={cls(s.mono, s.fisierNod)}>{o.trimis.fisier}</span>
              {!intors ? (
                <span className={cls(s.asteptareNod, fierbinte && s.fierbinte)}>{o.trimis.asteptare}</span>
              ) : null}
            </div>
          </div>
          <div className={s.randFactura}>
            <div className={cls(s.factura, a("X3") && s.in, intors && s.activa)}>
              <span className={s.numeFactura}>{o.factura.nume}</span>
              <span className={s.subFactura}>{intors ? o.factura.activa : o.factura.asteapta}</span>
            </div>
          </div>
        </div>
      </div>
      <p className={cls(s.linieStare, s.stareFir, a("X4") && s.in)}>
        <span className={s.numeStare}>{o.stare.nume}</span>
        <span className={cls(s.etichetaStare, intors && s.ok)}>{intors ? o.stare.complet : o.stare.asteptare}</span>
      </p>
    </>
  );
}

/** Scena industriei, cu obiectul ei din continut. */
export function ScenaIndustriei({ industrie, a }: { industrie: CodIndustrie; a: Ajuns }) {
  switch (industrie) {
    case "constructii":
      return <Constructii o={SCENARII.constructii.obiect} a={a} />;
    case "contabilitate":
      return <Contabilitate o={SCENARII.contabilitate.obiect} a={a} />;
    case "logistica":
      return <Logistica o={SCENARII.logistica.obiect} a={a} />;
    case "it":
      return <It o={SCENARII.it.obiect} a={a} />;
    case "avocatura":
      return <Avocatura o={SCENARII.avocatura.obiect} a={a} />;
    case "imobiliare":
      return <Imobiliare o={SCENARII.imobiliare.obiect} a={a} />;
    case "asigurari":
      return <Asigurari o={SCENARII.asigurari.obiect} a={a} />;
    case "notariat":
      return <Notariat o={SCENARII.notariat.obiect} a={a} />;
    case "consultanta":
      return <Consultanta o={SCENARII.consultanta.obiect} a={a} />;
  }
}

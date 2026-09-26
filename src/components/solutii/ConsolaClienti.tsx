// S3b al paginii de contabilitate (solutii__contabilitate.md): consola cu toti clientii. h2 si
// subtitlu, macheta consolei (bara de 44, 4 tigle, randul de cautare static, 6 carduri de client),
// lista de 6 capabilitati, nota si legatura spre contact.
//
// Macheta e STATICA, ca la referinta: fara hover, fara animatie, fara filtrare; campul de cautare e
// text, nu primeste focus. E decorativa pentru cititoarele de ecran (`aria-hidden`), iar descrierea
// ei, cu declaratia datelor fictive, sta in `figcaption` (plan D9). Firmele si codurile fiscale sunt
// fictive; fiecare cod fiscal are cifra de control gresita, deci nu apartine niciunei firme reale.
//
// Contrastul, peste referinta (COMPONENTE.md §5.1): textul pastilei trece pe `albastru-apasat`
// (5,49:1 pe `albastru-pal`), textul-indemn si valorile zero trec de pe `ardezie-4` (2,56:1) pe
// `ardezie-5` (4,76:1).

import CapBloc from "@/components/primitive/CapBloc";
import Tinta from "@/components/primitive/Tinta";
import { formaNumar, type Consola } from "@/content/solutii/tipuri";
import IconitaSolutii from "./IconitaSolutii";
import s from "./consola.module.css";
import sol from "./solutii.module.css";

export default function ConsolaClienti({ consola }: { consola: Consola }) {
  const c = consola;
  return (
    <section className={sol.sectiune}>
      <div className="container-site">
        <div className={sol.coloana}>
          <CapBloc titlu={c.titlu} text={c.subtitlu} marimeText={16} margineJos={32} />
          <figure className={s.macheta}>
            <figcaption className="doar-cititor">{c.declaratie}</figcaption>
            <div aria-hidden="true">
              <div className={s.bara}>
                <IconitaSolutii nume="building" marime={15} contur={1.75} className={s.baraIconita} />
                <span className={s.baraEticheta}>{c.bara.eticheta}</span>
                <span className={s.pastila}>{c.bara.pastila}</span>
              </div>
              <div className={s.zona}>
                <div className={s.tigle}>
                  {c.tigle.map((t) => (
                    <div key={t.eticheta} className={s.tigla}>
                      <span className={t.ton === "actiune" ? s.tiglaCutieActiune : s.tiglaCutie}>
                        <IconitaSolutii nume={t.iconita} marime={18} contur={1.5} />
                      </span>
                      <span className={s.tiglaText}>
                        <span className={s.tiglaValoare}>{t.valoare}</span>
                        <span className={s.tiglaEticheta}>{t.eticheta}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className={s.randCautare}>
                  <span className={s.camp}>
                    <IconitaSolutii nume="search" marime={14} contur={2} className={s.campLupa} />
                    <span className={s.campText}>{c.cautare.indemn}</span>
                  </span>
                  <span className={s.contor}>{c.cautare.contor}</span>
                </div>
                <div className={s.clienti}>
                  {c.clienti.map((cl) => (
                    <div key={cl.cui} className={s.client}>
                      <div className={s.clientCap}>
                        <span className={cl.deFacut ? s.punctActiv : s.punctLaZi} />
                        <span className={s.clientNume}>
                          <span className={s.numeFirma}>{cl.nume}</span>
                          <span className={s.cui}>{"CUI " + cl.cui}</span>
                        </span>
                      </div>
                      <div className={s.indicatori}>
                        <Indicator
                          iconita="clock"
                          valoare={cl.asteptare}
                          eticheta={formaNumar(cl.asteptare, c.indicatori.asteptare)}
                        />
                        <Indicator
                          iconita="calendar-x"
                          valoare={cl.depasite}
                          eticheta={formaNumar(cl.depasite, c.indicatori.depasite)}
                        />
                        <Indicator iconita="file-plus" valoare={cl.noi} eticheta={formaNumar(cl.noi, c.indicatori.noi)} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className={s.maiMulti}>{c.maiMulti}</p>
              </div>
            </div>
          </figure>
          <ul className={s.capabilitati}>
            {c.capabilitati.map((cap) => (
              <li key={cap.titlu} className={s.capabilitate}>
                <IconitaSolutii nume={cap.iconita} marime={18} contur={1.75} className={s.capIconita} />
                <div>
                  <h3 className={"t-h3-card " + s.capTitlu}>{cap.titlu}</h3>
                  <p className={s.capText}>{cap.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={s.nota}>{c.nota}</p>
          <Tinta legatura={c.legatura} className={s.legatura}>
            <span>{c.legatura.text}</span>
            <IconitaSolutii nume="arrow-right" marime={14} contur={2} />
          </Tinta>
        </div>
      </div>
    </section>
  );
}

function Indicator({ iconita, valoare, eticheta }: { iconita: string; valoare: number; eticheta: string }) {
  return (
    <span className={s.indicator}>
      <IconitaSolutii nume={iconita} marime={13} contur={1.75} className={s.indicatorIconita} />
      <span className={valoare === 0 ? s.valoareZero : s.valoare}>{valoare}</span>
      <span className={s.indicatorEticheta}>{eticheta}</span>
    </span>
  );
}

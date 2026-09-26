// Cele 7 machete ale panoului de domenii (flux-documente.md §6), in HTML, cu date fictive declarate
// ca exemplu (plan D9). Starea FINALA e cea din HTML; animatiile de o singura data le pornesc
// clasele din `flux.module.css`, sub atributul `data-stare` pus de `Domenii` (la vedere, nu la
// incarcare - defectul referintei din COMPONENTE §5, punctul 7, nu se mosteneste).

import { ArrowRight, Check, FileText, Folder, FolderOpen, Search } from "lucide-react";
import type { CSSProperties } from "react";
import { MACHETE } from "@/content/flux";
import s from "./flux.module.css";

function Cip({ nume, clasa }: { nume: string; clasa?: string }) {
  return (
    <span className={[s.cip, clasa ?? ""].join(" ")}>
      <FileText width={14} height={14} strokeWidth={1.5} aria-hidden="true" />
      <span className={s.cipNume}>{nume}</span>
    </span>
  );
}

export function MachetaImobiliare() {
  const m = MACHETE.imobiliare;
  return (
    <div className={s.mCard}>
      <div className={s.mCautare}>
        <Search width={15} height={15} strokeWidth={2} className={s.mLupa} aria-hidden="true" />
        <span className={[s.mInterogare, s.aTastare].join(" ")}>{m.interogare}</span>
      </div>
      <div className={[s.mRezultat, s.aUrca].join(" ")}>
        <div className={s.mRezultatRand}>
          <span className={s.mFisier}>{m.fisier}</span>
          <span className={s.mLoc}>{m.loc}</span>
          <span className={[s.mRisc, s.aApare21].join(" ")}>{m.risc}</span>
        </div>
        <p className={s.mFragment}>
          {m.fragment.map((b, i) =>
            i % 2 === 1 ? (
              <mark key={i} className={[s.mMarcaj, s.aMarcaj].join(" ")}>
                {b}
              </mark>
            ) : (
              <span key={i}>{b}</span>
            ),
          )}
        </p>
      </div>
    </div>
  );
}

export function MachetaContabilitate() {
  const m = MACHETE.contabilitate;
  return (
    <div className={s.mCanale}>
      <div className={s.mCanaleSursa}>
        {m.canale.map((c, i) => (
          <span key={c} className={[s.mCanal, s.aAbsorbit].join(" ")} style={{ animationDelay: 0.3 + i * 0.25 + "s" }}>
            {c}
          </span>
        ))}
        <span className={[s.mCanal, s.mCanalDoc, s.aAbsorbit].join(" ")} style={{ animationDelay: "1.3s" }}>
          <span className={s.mNotaRosie}>{m.lipsa}</span>
        </span>
      </div>
      <ArrowRight width={19} height={19} strokeWidth={2} className={s.mSageata} aria-hidden="true" />
      <div className={s.mPanouMic}>
        <span className={s.mPanouMarca}>3S</span>
        {m.randuri.map((r, i) => (
          <span key={r} className={[s.mPanouRand, s.aIntraStanga].join(" ")} style={{ animationDelay: 0.7 + i * 0.35 + "s" }}>
            <Check width={14} height={14} strokeWidth={2.5} className={s.mBifa} aria-hidden="true" />
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MachetaConstructii() {
  const m = MACHETE.constructii;
  return (
    <div className={s.mCronologie}>
      <span className={[s.mCronLinie, s.aLinie].join(" ")} aria-hidden="true" />
      <span className={[s.mCronDoc, s.aCalatoreste].join(" ")}>
        <Cip nume={m.fisier} />
      </span>
      {m.etape.map((e, i) => (
        <div key={e.titlu} className={s.mCronEtapa}>
          <span className={[s.mCronPunct, s.aPunct].join(" ")} style={{ animationDelay: [0.3, 0.75, 1.2][i] + "s" }} />
          <span className={s.mCronTitlu}>{e.titlu}</span>
          <span className={s.mCronData}>{e.data}</span>
        </div>
      ))}
    </div>
  );
}

export function MachetaAvocatura() {
  const m = MACHETE.avocatura;
  return (
    <div className={s.mTeanc}>
      <div className={s.mTeancFoi}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={[s.mFoaie, s.aAseaza].join(" ")} style={{ animationDelay: 0.3 + i * 0.15 + "s" }} />
        ))}
        <span className={s.mTeancCip}>
          <Cip nume={m.fisier} />
          <span className={[s.mNotaRosie, s.aDispare15].join(" ")}>{m.lipsa}</span>
          <span className={[s.mLocAlbastru, s.aApare17].join(" ")}>{m.loc}</span>
        </span>
      </div>
      <div className={[s.mCard, s.mCardMic, s.aUrca16].join(" ")}>
        <p className={s.mFragment}>
          {m.rezultat.map((b, i) =>
            i % 2 === 1 ? (
              <mark key={i} className={[s.mMarcaj, s.aMarcaj].join(" ")}>
                {b}
              </mark>
            ) : (
              <span key={i}>{b}</span>
            ),
          )}
        </p>
      </div>
    </div>
  );
}

export function MachetaAsigurari() {
  const m = MACHETE.asigurari;
  const curbe = ["M150 40 C 230 40, 260 130, 330 130", "M150 130 L 330 130", "M150 220 C 230 220, 260 130, 330 130"];
  return (
    <div className={s.mEvantai}>
      <svg className={s.mEvantaiLinii} viewBox="0 0 520 260" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {curbe.map((d, i) => (
          <path key={d} d={d} className={s.aDeseneaza} style={{ animationDelay: 0.3 + i * 0.25 + "s" }} />
        ))}
      </svg>
      <div className={s.mEvantaiFisiere}>
        {m.fisiere.map((f, i) => (
          <span key={f} className={[s.mFisierPunctat, s.aApare].join(" ")} style={{ animationDelay: 0.1 + i * 0.25 + "s" }}>
            {f}
          </span>
        ))}
      </div>
      <div className={[s.mDosar, s.aDeschide].join(" ")}>
        <FolderOpen width={22} height={22} strokeWidth={1.5} className={s.mDosarIconita} aria-hidden="true" />
        <span className={s.mDosarNume}>{m.dosar}</span>
        <span className={s.mDosarStari}>
          <span className={[s.mStareRosie, s.aIese16].join(" ")}>{m.incomplet}</span>
          <span className={[s.mStareVerde, s.aIntra19].join(" ")}>
            <Check width={12} height={12} strokeWidth={2.5} aria-hidden="true" />
            {m.complet}
          </span>
        </span>
      </div>
    </div>
  );
}

export function MachetaLogistica() {
  const m = MACHETE.logistica;
  const rot = [-2, 1.5, -1];
  return (
    <div className={s.mContopire}>
      <div className={s.mContopireSursa}>
        {m.fisiere.map((f, i) => (
          <span
            key={f}
            className={[s.mContopireFisier, s.aContopeste].join(" ")}
            style={
              {
                left: i * 22 + "px",
                top: i * 28 + "px",
                rotate: rot[i] + "deg",
                animationDelay: 0.4 + i * 0.3 + "s",
                ["--dx" as string]: -i * 22 + "px",
                ["--dy" as string]: -i * 28 + "px",
              } as CSSProperties
            }
          >
            <Cip nume={f} />
          </span>
        ))}
      </div>
      <ArrowRight width={19} height={19} strokeWidth={2} className={s.mSageata} aria-hidden="true" />
      <div className={[s.mContopireRezultat, s.aIntra13].join(" ")}>
        <Folder width={18} height={18} strokeWidth={1.5} className={s.mDosarIconita} aria-hidden="true" />
        <span className={s.mDosarNume}>{m.rezultat}</span>
        <span className={[s.mStareVerde, s.aIntra19].join(" ")}>
          <Check width={12} height={12} strokeWidth={2.5} aria-hidden="true" />
          {m.stare}
        </span>
      </div>
    </div>
  );
}

export function MachetaNotariat() {
  const m = MACHETE.notariat;
  return (
    <div className={s.mPastrare}>
      <div className={s.mPastrareCap}>
        <Cip nume={m.fisier} />
        <span className={s.mNotaAlbastra}>{m.nota}</span>
      </div>
      <div className={s.mPastrarePista}>
        <span className={[s.mPastrareLinie, s.aLinie16].join(" ")} aria-hidden="true" />
        {m.ani.map((a, i) => (
          <span key={a} className={[s.mAn, s.aApare].join(" ")} style={{ left: (i / (m.ani.length - 1)) * 100 + "%", animationDelay: 0.4 + i * 0.4 + "s" }}>
            <span className={s.mAnPunct} aria-hidden="true" />
            {a}
          </span>
        ))}
      </div>
      <span className={[s.mStareVerde, s.aApare20].join(" ")}>
        <Check width={12} height={12} strokeWidth={2.5} aria-hidden="true" />
        {m.confirmare}
      </span>
    </div>
  );
}

export const MACHETA_PE_DOMENIU = {
  imobiliare: MachetaImobiliare,
  contabilitate: MachetaContabilitate,
  constructii: MachetaConstructii,
  avocatura: MachetaAvocatura,
  asigurari: MachetaAsigurari,
  logistica: MachetaLogistica,
  notariat: MachetaNotariat,
} as const;

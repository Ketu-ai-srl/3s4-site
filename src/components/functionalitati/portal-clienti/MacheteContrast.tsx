// S8 - machetele contrastului (functionalitati__portal-clienti.md, S8): in locul desenelor SVG, cate o
// fereastra in miniatura.
//
//   Inainte  inbox: pastila rosie cu necititele, doua mesaje (unul urgent), doua randuri stinse si un rand
//            de puncte. Randurile stinse si punctele sunt decor (textura unui inbox plin): se deseneaza din
//            CSS si nu poarta informatie.
//   Acum     portal: pastila verde "in timp real", patru randuri rol -> drept, cu bifa.

import { Check } from "lucide-react";
import { CONTRAST_PORTAL } from "@/content/functionalitati/portal-clienti";
import s from "./portal.module.css";

export function InboxMini() {
  const d = CONTRAST_PORTAL.inainte;
  return (
    <figure className={s.figura} data-macheta="inbox-mini">
      <div className={s.barMini}>
        <span className={[s.pastilaMini, s.pastilaRea].join(" ")}>
          <span className={s.punctMini} aria-hidden="true" />
          {d.necitite}
        </span>
        <span className={s.caleMini}>{d.cale}</span>
      </div>
      <ul className={s.randuriMini}>
        {d.mesaje.map((m) => (
          <li key={m.subiect} className={s.randMini}>
            <span className={s.patratEmail} aria-hidden="true" />
            <span className={s.textMini}>
              <span className={[s.subiectMini, "urgent" in m && m.urgent ? s.subiectUrgentMini : ""].filter(Boolean).join(" ")}>{m.subiect}</span>
              <span className={s.delaMini}>{m.dela}</span>
            </span>
            <span className={s.numarMini}>{m.numar}</span>
          </li>
        ))}
        {d.stinse.map((text, i) => (
          <li key={text} className={[s.randMini, i === 0 ? s.randStins : s.randStins2].join(" ")} aria-hidden="true">
            <span className={s.patratEmail} />
            <span className={s.textMini}>
              <span className={s.subiectMini} data-text={text} />
            </span>
          </li>
        ))}
        <li className={[s.randMini, s.puncteMini].join(" ")} aria-hidden="true" />
      </ul>
      <figcaption className="doar-cititor">{d.declaratie}</figcaption>
    </figure>
  );
}

export function PortalMini() {
  const d = CONTRAST_PORTAL.acum;
  return (
    <figure className={s.figura} data-macheta="portal-mini">
      <div className={s.barMini}>
        <span className={[s.pastilaMini, s.pastilaBuna].join(" ")}>
          <span className={s.punctMini} aria-hidden="true" />
          {d.inDirect}
        </span>
        <span className={s.caleMini}>{d.cale}</span>
      </div>
      <ul className={s.randuriMini}>
        {d.randuri.map((r) => (
          <li key={r.rol + r.actiune} className={s.randPortalMini}>
            <span className={s.punctRolMini} aria-hidden="true" />
            <span className={s.rolMini}>{r.rol}</span>
            <span className={s.actiuneMini}>{r.actiune}</span>
            <span className={s.bifaMini} aria-hidden="true">
              <Check width={10} height={10} strokeWidth={3} focusable="false" />
            </span>
          </li>
        ))}
      </ul>
      <figcaption className="doar-cititor">{d.declaratie}</figcaption>
    </figure>
  );
}

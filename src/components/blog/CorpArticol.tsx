// Corpul articolului: arborele din `src/content/blog/markdown.ts`, randat in primitiva `Proza`
// (blog__articol-sablon.md §6: paragraf 16/28 ardezie-6, h2 24, h3 20, liste, legaturi subliniate).
// Tabelele trec prin `TabelDate` (chenar ardezie-2, raza 12, derulare sub 768 px), legaturile spre
// alte pagini ale site-ului prin `Tinta` (inerte cat timp ruta lipseste: nicio legatura moarta).

import { Fragment, type ReactNode } from "react";
import Proza from "@/components/primitive/Proza";
import TabelDate from "@/components/primitive/TabelDate";
import Tinta from "@/components/primitive/Tinta";
import { textDin, type Bloc, type CorpArticol as Corp, type Inline } from "@/content/blog/markdown";
import s from "./blog.module.css";

/** Calea unei legaturi interne, fara ancora si fara parametri: ruta de care depinde `Tinta`. */
function rutaDin(href: string): string {
  const fara = href.split("#")[0].split("?")[0];
  return fara.length > 1 && fara.endsWith("/") ? fara.slice(0, -1) : fara || "/";
}

export function InlineArticol({ copii }: { copii: Inline[] }) {
  return (
    <>
      {copii.map((c, i) => {
        switch (c.tip) {
          case "text":
            return <Fragment key={i}>{c.text}</Fragment>;
          case "tare":
            return (
              <strong key={i}>
                <InlineArticol copii={c.copii} />
              </strong>
            );
          case "accent":
            return (
              <em key={i}>
                <InlineArticol copii={c.copii} />
              </em>
            );
          case "cod":
            return (
              <code key={i} className={s.codInline}>
                {c.text}
              </code>
            );
          case "legatura": {
            const continut = <InlineArticol copii={c.copii} />;
            if (c.href.startsWith("/")) {
              return (
                <Tinta key={i} legatura={{ text: textDin(c.copii), href: c.href, ruta: rutaDin(c.href) }}>
                  {continut}
                </Tinta>
              );
            }
            if (c.href.startsWith("#")) {
              return (
                <a key={i} href={c.href}>
                  {continut}
                </a>
              );
            }
            return (
              <a key={i} href={c.href} rel="noopener">
                {continut}
              </a>
            );
          }
        }
      })}
    </>
  );
}

function BlocArticol({ bloc }: { bloc: Bloc }): ReactNode {
  switch (bloc.tip) {
    case "titlu": {
      const Titlu = ("h" + bloc.nivel) as "h2" | "h3" | "h4";
      return (
        <Titlu id={bloc.id}>
          <InlineArticol copii={bloc.copii} />
        </Titlu>
      );
    }
    case "paragraf":
      return (
        <p>
          <InlineArticol copii={bloc.copii} />
        </p>
      );
    case "lista": {
      const elemente = bloc.elemente.map((e, i) => (
        <li key={i}>
          <InlineArticol copii={e} />
        </li>
      ));
      return bloc.ordonata ? <ol start={bloc.start === 1 ? undefined : bloc.start}>{elemente}</ol> : <ul>{elemente}</ul>;
    }
    case "citat":
      return (
        <blockquote>
          {bloc.paragrafe.map((p, i) => (
            <p key={i}>
              <InlineArticol copii={p} />
            </p>
          ))}
        </blockquote>
      );
    case "tabel":
      return (
        <TabelDate
          forma="cu-antet"
          antet={bloc.antet.map((c, i) => (
            <InlineArticol key={i} copii={c} />
          ))}
          randuri={bloc.randuri.map((r) => r.map((c, j) => <InlineArticol key={j} copii={c} />))}
        />
      );
    case "linie":
      return <hr />;
    case "cod":
      return (
        <pre className={s.cod}>
          <code>{bloc.text}</code>
        </pre>
      );
  }
}

export default function CorpArticol({ corp }: { corp: Corp }) {
  return (
    <Proza>
      {corp.blocuri.map((b, i) => (
        <BlocArticol key={i} bloc={b} />
      ))}
    </Proza>
  );
}

// Cele 16 module ale familiei `md` (8 documente x romana si engleza), pe cheia din registru. Numai pe
// server: le citeste `../index.ts`.

import confidentialitateEn from "./confidentialitate.en";
import confidentialitateRo from "./confidentialitate.ro";
import type { ContextMd } from "./context";
import cookieUriEn from "./cookie-uri.en";
import cookieUriRo from "./cookie-uri.ro";
import dpaEn from "./dpa.en";
import dpaRo from "./dpa.ro";
import informatiiLegaleEn from "./informatii-legale.en";
import informatiiLegaleRo from "./informatii-legale.ro";
import inteligentaArtificialaEn from "./inteligenta-artificiala.en";
import inteligentaArtificialaRo from "./inteligenta-artificiala.ro";
import notificareSiActiuneEn from "./notificare-si-actiune.en";
import notificareSiActiuneRo from "./notificare-si-actiune.ro";
import type { CheieMd } from "./registru";
import subimputernicitiEn from "./subimputerniciti.en";
import subimputernicitiRo from "./subimputerniciti.ro";
import termeniEn from "./termeni.en";
import termeniRo from "./termeni.ro";
import type { DocumentJuridic, LimbaJuridica } from "../tipuri";

export type ModulMd = (c: ContextMd) => DocumentJuridic;

export const DOCUMENTE_MD: Readonly<Record<CheieMd, Record<LimbaJuridica, ModulMd>>> = {
  "informatii-legale": { ro: informatiiLegaleRo, en: informatiiLegaleEn },
  confidentialitate: { ro: confidentialitateRo, en: confidentialitateEn },
  "cookie-uri": { ro: cookieUriRo, en: cookieUriEn },
  termeni: { ro: termeniRo, en: termeniEn },
  dpa: { ro: dpaRo, en: dpaEn },
  subimputerniciti: { ro: subimputernicitiRo, en: subimputernicitiEn },
  "notificare-si-actiune": { ro: notificareSiActiuneRo, en: notificareSiActiuneEn },
  "inteligenta-artificiala": { ro: inteligentaArtificialaRo, en: inteligentaArtificialaEn },
};

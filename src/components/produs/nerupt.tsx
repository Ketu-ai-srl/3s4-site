// Grupurile care nu se rup la capat de rand: termenii tehnici ("AES-256", "API-ul", "TLS 1.2") si
// cuvintele legate prin cratima cu o parte scurta ("l-a", "intr-o", "e-mail").
//
// Navigatorul poate rupe dupa orice cratima si la orice spatiu. Masurat pe capturile de dinainte, la
// 1440: "AES-" la capat de rand si "256" pe urmatorul (securitate, blocul 01), "cine l-" / "a deschis"
// (platforma), "API-" / "ul" (integrari); la 390: "e-" / "mailurile". Grupul intra intr-un <span> cu
// white-space: nowrap, iar textul ramane acelasi caracter cu caracter (textContent neschimbat; un
// <span> e in linie, deci si citirea HTML-ului servit il lipeste de vecini). Compusele lungi
// ("proces-verbal", "firma-mama") se pot rupe mai departe la cratima, ca in tiparul obisnuit.
import type { ReactNode } from "react";
import s from "./produs.module.css";

const GRUP =
  /((?<![\p{L}\d])(?:[\p{Lu}\d]{2,}|\p{L}{1,3})-[\p{L}\d]+|(?<![\p{L}\d])\p{L}+-(?:\p{L}{1,3}|urile|urilor|ului|ilor)(?![\p{L}\d])|TLS 1\.2\+?|SAML 2\.0|Microsoft 365|Entra ID)/u;

/** Bucatile unui text: grupurile nerupte pe pozitiile impare, restul pe cele pare. */
export function bucatiNerupte(text: string): string[] {
  return text.split(GRUP);
}

/** Textul, cu grupurile de mai sus in cate un <span> nerupt. Orice nu e sir trece neatins. */
export function nerupt(continut: ReactNode): ReactNode {
  if (typeof continut !== "string") return continut;
  const parti = bucatiNerupte(continut);
  if (parti.length === 1) return continut;
  return parti
    .map((p, i) =>
      i % 2 === 1 ? (
        <span key={i} className={s.nerupt}>
          {p}
        </span>
      ) : (
        p
      ),
    )
    .filter((p) => p !== "");
}

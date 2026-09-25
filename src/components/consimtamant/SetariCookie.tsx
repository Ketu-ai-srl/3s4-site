"use client";

// Legatura permanenta de retragere a consimtamantului, in subsolul fiecarei pagini (GDPR art. 7
// alin. (3): retragerea e la fel de simpla ca acordul; planul E5, pasul 2, si G-MD-05). E buton,
// nu legatura: nu duce nicaieri, redeschide panoul de setari pe pagina curenta.
//
// Se randeaza pe server, deci exista in HTML-ul brut al paginii (`data-cookie-settings`), si numai
// cand analitica e pornita - fara ea n-ar avea ce sa deschida.

import { TEXT_LEGATURA_SUBSOL, deschideSetarile } from "./semnal";

export default function SetariCookie({ className }: { className?: string }) {
  return (
    <button type="button" className={className} data-cookie-settings="" onClick={deschideSetarile}>
      {TEXT_LEGATURA_SUBSOL}
    </button>
  );
}

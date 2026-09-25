"use client";

// Butonul inchis de tiparire al subpaginii (instrumente__termene-pastrare.md, subpagina): deschide
// dialogul de tiparire al navigatorului; foaia de tipar e in `tipar.module.css`.

import { Printer } from "lucide-react";
import s from "./tipar.module.css";

export default function ButonTiparire({ text }: { text: string }) {
  return (
    <button type="button" className={s.butonTipar} onClick={() => window.print()}>
      <Printer size={15} strokeWidth={2} aria-hidden="true" focusable="false" />
      <span>{text}</span>
    </button>
  );
}

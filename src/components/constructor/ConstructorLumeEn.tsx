"use client";

// Lumea constructorului, INVELITOAREA editiei `en`: modulul adus lenes de `ConstructorEn`. Construieste
// continutul editiei (`src/content/en/acasa-constructor-componente.ts`, cu tinta butoanelor pe legatura WhatsApp a
// paginii) si randeaza `LumeVedere`. Sta intr-o bucata JS separata, ca lumea RO.

import { useMemo } from "react";
import { continutLumeEn } from "@/content/en/acasa-constructor-componente";
import LumeVedere, { type PropsLume } from "./LumeVedere";

export default function ConstructorLumeEn(props: PropsLume) {
  const tinta = props.tinta ?? null;
  const continut = useMemo(() => continutLumeEn(tinta), [tinta]);
  return <LumeVedere {...props} continut={continut} />;
}

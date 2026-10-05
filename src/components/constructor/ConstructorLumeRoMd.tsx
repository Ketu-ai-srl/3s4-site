"use client";

// Lumea constructorului, INVELITOAREA editiei `ro-MD`: modulul adus lenes de `ConstructorRoMd`. Construieste
// continutul editiei (`src/content/ro-md/acasa-constructor-componente.ts`, cu tinta butoanelor pe legatura WhatsApp a
// paginii) si randeaza `LumeVedere`. Sta intr-o bucata JS separata, ca lumea RO.

import { useMemo } from "react";
import { continutLumeRoMd } from "@/content/ro-md/acasa-constructor-componente";
import LumeVedere, { type PropsLume } from "./LumeVedere";

export default function ConstructorLumeRoMd(props: PropsLume) {
  const tinta = props.tinta ?? null;
  const continut = useMemo(() => continutLumeRoMd(tinta), [tinta]);
  return <LumeVedere {...props} continut={continut} />;
}

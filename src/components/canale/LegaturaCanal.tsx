"use client";

// O legatura de canal (WhatsApp, e-mail) a carei tinta depinde de pagina curenta: textul precompletat poarta
// codul `ref` al paginii (`src/content/canale.ts`). Tintele vin rezolvate de pe server, ca date
// (`LegaturaPeCale`); aici se alege numai cea a caii curente. Fara tinta, nu se randeaza nimic.
//
// `data-canal` numeste canalul pentru ascultatorul delegat al masurarii (feliile urmatoare); legatura nu
// are `target`, `preventDefault` sau parametri de urmarire.

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { alegePeCale, type LegaturaPeCale } from "@/content/navigatie";

export type LegaturaCanalProps = {
  legatura: LegaturaPeCale;
  canal: "whatsapp" | "email";
  className?: string;
  children: ReactNode;
};

export default function LegaturaCanal({ legatura, canal, className, children }: LegaturaCanalProps) {
  const href = alegePeCale(legatura, usePathname() ?? "/");
  if (href === null) {
    return null;
  }
  return (
    <a href={href} className={className} data-canal={canal}>
      {children}
    </a>
  );
}

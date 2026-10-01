// Butonul WhatsApp (arhitectura EN §4.3): eticheta e canalul, tinta e conversatia cu textul precompletat
// al paginii curente. Aspectul e cel al butonului site-ului (`claseButon`), deci sta langa celelalte butoane
// fara stil propriu. Fara WhatsApp pe domeniu (`legatura` null, sau fara tinta pe pagina), nu se randeaza.

import { claseButon, type MarimeButon, type VariantaButon } from "@/components/primitive/Buton";
import type { LegaturaPeCale } from "@/content/navigatie";
import LegaturaCanal from "./LegaturaCanal";

export type ButonWhatsAppProps = {
  legatura: LegaturaPeCale | null;
  text: string;
  varianta?: VariantaButon;
  marime?: MarimeButon;
  latimePlina?: boolean;
  className?: string;
};

export default function ButonWhatsApp({
  legatura,
  text,
  varianta = "plin",
  marime = "baza",
  latimePlina = false,
  className,
}: ButonWhatsAppProps) {
  if (legatura === null) {
    return null;
  }
  return (
    <LegaturaCanal legatura={legatura} canal="whatsapp" className={claseButon(varianta, marime, latimePlina, false, className)}>
      {text}
    </LegaturaCanal>
  );
}

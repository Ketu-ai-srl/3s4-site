import type { Metadata } from "next";
import BandaCifre from "@/components/acasa/BandaCifre";
import BandaIntegrari from "@/components/acasa/BandaIntegrari";
import BandaPret from "@/components/acasa/BandaPret";
import CardEnterprise from "@/components/acasa/CardEnterprise";
import CardSecuritate from "@/components/acasa/CardSecuritate";
import FaqAcasa from "@/components/acasa/FaqAcasa";
import GrilaIndustrii from "@/components/acasa/GrilaIndustrii";
import Testimonial from "@/components/acasa/Testimonial";
import Constructor from "@/components/constructor/Constructor";
import Erou from "@/components/erou/Erou";
import FunctionalitatiAcasa from "@/components/functionalitati-acasa/FunctionalitatiAcasa";
import CtaFinalInchis from "@/components/primitive/CtaFinalInchis";
import { ANCORE_ACASA, META_ACASA } from "@/content/acasa";

// Pagina de start (acasa.md, ordinea masurata a celor 13 sectiuni de sub antet).
//
// Trei piese sunt CIOTURI la cai fixe, in starea lor statica: `erou/Erou`, `constructor/Constructor`
// si `functionalitati-acasa/FunctionalitatiAcasa`. Fiecare e inlocuita de felia ei din S4-2 fara ca
// fisierul de fata sa se schimbe (planul valului, §5.1 regula 6). Celelalte sectiuni sunt complete.
// Textele vin toate din contractul `src/content/acasa.ts`.

export const metadata: Metadata = {
  title: { absolute: META_ACASA.titlu },
  description: META_ACASA.descriere,
  alternates: { canonical: "/" },
};

export default function Acasa() {
  return (
    <main>
      <Erou />
      <BandaIntegrari />
      <Constructor />
      <FunctionalitatiAcasa />
      <BandaCifre />
      <GrilaIndustrii />
      <Testimonial />
      <CardSecuritate />
      <CardEnterprise />
      <BandaPret />
      <FaqAcasa />
      <CtaFinalInchis id={ANCORE_ACASA.contact} />
    </main>
  );
}

// Numarul de telefon al domeniului: TEXT pe desktop, legatura `tel:` pe mobil (arhitectura EN §4.3,
// regula 1). Doua elemente in acelasi HTML, unul ascuns pe latime prin CSS. Nu se face prin detectia
// agentului: detectia ar schimba HTML-ul dupa hidratare, iar numarul trebuie sa ramana text crawlabil.

import s from "./Canale.module.css";

export type TelefonProps = {
  /** Numarul asa cum se citeste (prefixul tarii si grupele de cifre, cu spatii). */
  text: string;
  /** Legatura `tel:` in forma E.164. */
  href: string;
  className?: string;
};

export default function Telefon({ text, href, className }: TelefonProps) {
  return (
    <>
      <a href={href} className={[s.doarMobil, className ?? ""].filter(Boolean).join(" ")} data-canal="telefon">
        {text}
      </a>
      <span className={[s.doarDesktop, className ?? ""].filter(Boolean).join(" ")}>{text}</span>
    </>
  );
}

"use client";

// Adresa de e-mail cu buton de copiere (arhitectura EN §4.5): butonul pune adresa in clipboard fara sa
// deschida aplicatia de e-mail. Adresa ramane text selectabil; confirmarea copierii se anunta cititoarelor de
// ecran printr-o regiune `status`. Fara clipboard (context nesigur, permisiune refuzata), butonul nu promite
// nimic: confirmarea apare numai dupa o copiere reusita.

import { useEffect, useState } from "react";
import s from "./Canale.module.css";

export type AdresaCopiereProps = {
  adresa: string;
  /** Eticheta butonului. */
  copiaza: string;
  /** Textul de dupa o copiere reusita. */
  copiat: string;
  className?: string;
};

export default function AdresaCopiere({ adresa, copiaza, copiat, className }: AdresaCopiereProps) {
  const [gata, setGata] = useState(false);

  useEffect(() => {
    if (!gata) return;
    const t = setTimeout(() => setGata(false), 2000);
    return () => clearTimeout(t);
  }, [gata]);

  const copiazaAdresa = async () => {
    try {
      await navigator.clipboard.writeText(adresa);
      setGata(true);
    } catch {
      setGata(false);
    }
  };

  return (
    <span className={[s.adresa, className ?? ""].filter(Boolean).join(" ")}>
      <span className={s.adresaText}>{adresa}</span>
      <button type="button" className={s.copiaza} onClick={copiazaAdresa} data-copiaza="">
        {gata ? copiat : copiaza}
      </button>
      <span className="doar-cititor" role="status">
        {gata ? copiat : ""}
      </span>
    </span>
  );
}

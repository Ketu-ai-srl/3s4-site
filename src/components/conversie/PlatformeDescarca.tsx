"use client";

// Cardul recomandat si grila de platforme de pe /descarca (COMPONENTE §4.11 "CardRecomandat +
// GrilaPlatforme"; descarca.md §3a-§3c). Insula de browser: platforma se afla numai dupa hidratare,
// din sirul agentului (`detecteazaPlatforma`, piesa globala), deci HTML-ul servit e acelasi pentru
// toti - starea generica, fara platforma, care e si starea fara JavaScript.
//
// TINTELE: aplicatia exista pe toate platformele (plan D4c), dar nu are inca instalatori publici;
// fiecare element duce la contul gratuit (plan §6.9). Grupurile vin de pe server, deja filtrate pe
// rutele existente.
//
// ABATERI DE LA REFERINTA: grila e `repeat(2, minmax(0, 1fr))` (la referinta `1fr` iesea inegal si
// depasea ecranul cu 117 px la 390; descarca.md §3c); indicatorul rotativ al detectiei nu se
// reproduce, fiindca detectia e sincrona aici (nu asteapta un manifest de versiuni).
//
// STABILITATE (CLS): randul cu steaua sta in HTML-ul servit si e doar ascuns cu visibility, iar
// textul butonului mare nu depinde de platforma (toate tintele duc oricum la contul gratuit). Asa
// hidratarea schimba doar continutul unor randuri de inaltime fixa, nu inaltimea cardului.
// Grila se reordoneaza (grupul detectat primul) DOAR peste 720 px. Pe telefon grila e o coloana si
// grupul mobil sta sub linia ecranului: mutat in sus dupa hidratare, intra in fereastra si da un CLS
// de 0,117 (masurat la 390, CPU x4), peste bugetul de 0,1. Acolo cardul recomandat numeste deja
// platforma, iar elementul ei ramane marcat in grila; ordinea fixa e abaterea asumata.

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { Download, Globe, Laptop, Monitor, Smartphone, Star, TabletSmartphone, Terminal } from "lucide-react";
import { detecteazaPlatforma } from "@/components/global/descarcare";
import type { GrupDescarca, PlatformaDescarca } from "@/content/navigatie";
import { CALE_INREGISTRARE, DESCARCA } from "@/content/conversie";
import s from "./descarca.module.css";

type Ic = ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>;

const ICONITE: Record<PlatformaDescarca, Ic> = {
  windows: Monitor,
  "macos-arm": Laptop,
  "macos-intel": Laptop,
  linux: Terminal,
  ios: Smartphone,
  android: TabletSmartphone,
  web: Globe,
};

/** Grupurile in ordinea de afisare: cel cu platforma detectata primul, restul in ordinea lor. */
export function ordineGrupuri(grupuri: GrupDescarca[], detectata: PlatformaDescarca | null): GrupDescarca[] {
  if (detectata === null) return grupuri;
  const primul = grupuri.findIndex((g) => g.elemente.some((e) => e.platforma === detectata));
  if (primul <= 0) return grupuri;
  return [grupuri[primul], ...grupuri.filter((_, i) => i !== primul)];
}

export default function PlatformeDescarca({ grupuri }: { grupuri: GrupDescarca[] }) {
  const d = DESCARCA;
  const [detectata, setDetectata] = useState<PlatformaDescarca | null>(null);
  const [lat, setLat] = useState(false);

  useEffect(() => {
    setDetectata(detecteazaPlatforma(navigator.userAgent));
    setLat(window.matchMedia("(min-width: 721px)").matches);
  }, []);

  const nume = detectata ? d.numePlatforma[detectata] : null;
  const ordonate = lat ? ordineGrupuri(grupuri, detectata) : grupuri;

  return (
    <>
      <div className={s.recomandat} data-platforma={detectata ?? "necunoscuta"}>
        <p className={s.recomandatEticheta} data-ascuns={detectata === null ? "" : undefined}>
          <Star size={14} strokeWidth={2} aria-hidden />
          <span>{d.recomandat.eticheta}</span>
        </p>
        <p className={s.recomandatNume}>{nume ?? d.recomandat.generic}</p>
        <Link href={CALE_INREGISTRARE} className={s.recomandatButon}>
          <Download size={20} strokeWidth={2} aria-hidden />
          <span>{d.recomandat.buton}</span>
        </Link>
        <p className={s.recomandatAjutor}>{d.recomandat.ajutor}</p>
      </div>

      <div className={s.capGrila}>
        <h2 id="descarca-platforme" className={"t-h2-bloc " + s.capGrilaTitlu}>
          {d.platforme.titlu}
        </h2>
        <p className={s.capGrilaText}>{d.platforme.text}</p>
      </div>

      <ul className={s.grila} role="list" aria-labelledby="descarca-platforme">
        {ordonate.map((g) => (
          <li key={g.titlu} className={s.cardGrup}>
            <h3 className={s.cardGrupTitlu}>{g.titlu}</h3>
            <ul className={s.elemente} role="list">
              {g.elemente.map((e) => {
                const Iconita = ICONITE[e.platforma];
                const aici = e.platforma === detectata;
                return (
                  <li key={e.platforma}>
                    <Link
                      href={e.href ?? CALE_INREGISTRARE}
                      className={[s.element, aici ? s.elementDetectat : ""].filter(Boolean).join(" ")}
                      aria-current={aici ? "true" : undefined}
                    >
                      <span className={s.placa} aria-hidden="true">
                        <Iconita size={20} strokeWidth={1.75} />
                      </span>
                      <span className={s.elementText}>
                        <span className={s.elementTitlu}>
                          {e.text}
                          {aici ? <span className={s.pastila}>{d.platforme.pastila}</span> : null}
                        </span>
                        <span className={s.elementAjutor}>{e.descriere}</span>
                      </span>
                      <Download size={16} strokeWidth={2} className={s.elementDescarca} aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

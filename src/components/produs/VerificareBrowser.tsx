"use client";

// Verificarea din browser (securitate.md §4; COMPONENTE §4.6). Cand cardul intra in fereastra,
// browserul trimite TREI cereri GET succesive catre `/api/sanatate`, pe serverul care a servit chiar
// pagina, masoara timpul fiecareia (cerere + raspuns citit, cu `performance.now()`) si afiseaza
// mediana, rotunjita la milisecunda. Gazda si protocolul se citesc din adresa paginii
// (`location.host`, `location.protocol`): cardul spune daca legatura curenta e HTTPS, nu ce versiune
// de TLS negociaza, fiindca browserul nu o expune paginii.
//
// HTML-ul servit are doar starea de asteptare; gazda, protocolul si timpul apar abia dupa
// masurare. Daca o cerere pica, timpul ramane "indisponibil" si punctul nu se face verde.
// "Masurati din nou" reia cele trei cereri. Cat masoara, butonul e `aria-disabled` si ignora clicul
// (garda `inLucru`), dar NU primeste atributul `disabled`: un buton dezactivat pierde focusul, care
// cadea pe <body> dupa Enter si ramanea acolo dupa masurare, iar Tab-ul il sarea cand chiar Tab-ul
// aducea cardul in fereastra si pornea masurarea. Asa, focusul ramane pe buton.

import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CALE_SANATATE, VERIFICARE_BROWSER } from "@/content/produs/securitate";
import { mediana } from "./mediana";
import s from "./VerificareBrowser.module.css";

type Stare = "asteptare" | "masoara" | "gata" | "eroare";

const CERERI = 3;

async function oCerere(): Promise<number> {
  const inceput = performance.now();
  const raspuns = await fetch(CALE_SANATATE, { cache: "no-store", credentials: "same-origin" });
  await raspuns.text();
  if (!raspuns.ok) throw new Error("raspuns " + raspuns.status);
  return performance.now() - inceput;
}

export default function VerificareBrowser() {
  const v = VERIFICARE_BROWSER;
  const card = useRef<HTMLDivElement>(null);
  const inLucru = useRef(false);
  const [stare, setStare] = useState<Stare>("asteptare");
  const [gazda, setGazda] = useState<string | null>(null);
  const [criptat, setCriptat] = useState<boolean | null>(null);
  const [milisecunde, setMilisecunde] = useState<number | null>(null);

  const masoara = useCallback(async () => {
    if (inLucru.current) return;
    inLucru.current = true;
    setStare("masoara");
    setGazda(window.location.host);
    setCriptat(window.location.protocol === "https:");
    try {
      const timpi: number[] = [];
      for (let i = 0; i < CERERI; i++) timpi.push(await oCerere());
      const m = mediana(timpi);
      if (m === null) throw new Error("fara timpi");
      setMilisecunde(Math.round(m));
      setStare("gata");
    } catch {
      setMilisecunde(null);
      setStare("eroare");
    } finally {
      inLucru.current = false;
    }
  }, []);

  useEffect(() => {
    const el = card.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observator = new IntersectionObserver(
      (intrari) => {
        if (intrari.some((i) => i.isIntersecting)) {
          observator.disconnect();
          void masoara();
        }
      },
      { threshold: 0.4 },
    );
    observator.observe(el);
    return () => observator.disconnect();
  }, [masoara]);

  const timp =
    stare === "gata" && milisecunde !== null
      ? milisecunde + " ms"
      : stare === "eroare"
        ? v.indisponibil
        : v.asteptare.timp;

  return (
    <div ref={card} className={s.card} data-stare={stare}>
      <div className={s.cap}>
        <span className={s.punct + (stare === "gata" ? " " + s.punctGata : "")} aria-hidden="true" />
        <h3 className={s.titlu}>{v.titlu}</h3>
        <button
          type="button"
          className={s.reia}
          onClick={() => void masoara()}
          aria-disabled={stare === "masoara" ? true : undefined}
        >
          {v.reia}
        </button>
      </div>
      <dl className={s.randuri} aria-live="polite" aria-busy={stare === "masoara"}>
        <div className={s.rand}>
          <dt className={s.cheie}>{v.chei.server}</dt>
          <dd className={s.valoare + " " + s.valoareMono} data-camp="server">
            {gazda ?? v.asteptare.server}
          </dd>
        </div>
        <div className={s.rand}>
          <dt className={s.cheie}>{v.chei.criptare}</dt>
          <dd className={s.valoare} data-camp="criptare">
            {criptat === null ? (
              v.asteptare.criptare
            ) : criptat ? (
              <>
                <Check className={s.bifa} width={12} height={12} strokeWidth={2.5} aria-hidden="true" focusable="false" />
                {v.criptareDa}
              </>
            ) : (
              v.criptareNu
            )}
          </dd>
        </div>
        <div className={s.rand}>
          <dt className={s.cheie}>{v.chei.timp}</dt>
          <dd className={s.valoare + (stare === "gata" ? " " + s.valoareMono : "")} data-camp="timp">
            {timp}
          </dd>
        </div>
      </dl>
      <p className={s.nota}>{v.nota}</p>
    </div>
  );
}

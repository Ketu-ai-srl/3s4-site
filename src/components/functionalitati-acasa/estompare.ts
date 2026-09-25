// Estomparea de jos a machetelor (acasa-functionalitati.md §14.7): inmoaie randul TAIAT de rama si nu
// atinge niciodata ceva intreg.
//
// DE CE NU E O INALTIME FIXA. Rama are raportul 5:4, deci inaltimea ei urmeaza latimea, iar randurile
// machetei cad la alte distante de margine la fiecare latime. Masurat pe pixeli (captura cu si fara
// estompare, DPR 2): cu 40 px, data si eticheta randului 2 al cautarii, intregi la 390, ieseau la
// 1,1-1,3:1; cu 5 px fixi, la 360 x 800 primul rand al registrului, intreg la 0,58 px de margine,
// iesea la 1,08:1 pe randul lui cel mai de jos de cerneala. Referinta arata ambele randuri lizibile.
// Aici inaltimea se calculeaza din asezarea de acum a machetei: zero cand niciun rand de text nu e
// taiat (n-are ce inmuia), altfel cel mult spatiul liber de sub cel mai de jos rand de text intreg si
// de sub cel mai de jos buton intreg, cu tot cu conturul lui de focus.
//
// Fara JavaScript estomparea lipseste (`var(--estompare, 0px)` in `Machete.module.css`): taietura
// ramane cea a referintei, dar nu spala nimic.

import { useEffect, type RefObject } from "react";

/** Cea mai inalta estompare: capatul de jos al celor 12-16 px ceruti de critica rundei 2 peste randul
 *  taiat (fisa §14.7 cere estomparea, fara cifra). Masurat intre 360 si 1440: din randul taiat se
 *  vad intre 2 si 14 px. */
export const ESTOMPARE_MAXIMA = 12;
/** Loc pentru conturul de focus al unui buton (decalaj 2 + grosime 2). */
const CONTUR_FOCUS = 4;

/**
 * Decizia, fara DOM: `josRama` = marginea de jos a ramei; `intregi` = marginile de jos ale lucrurilor
 * intregi care nu au voie sub estompare (randuri de text; butoane, cu conturul lor); `taiate` = cate
 * randuri de text taie marginea. In px, pe aceeasi axa.
 */
export function inaltimeEstompare(josRama: number, intregi: number[], taiate: number, maxim = ESTOMPARE_MAXIMA): number {
  if (taiate === 0) return 0;
  const cel = intregi.length ? Math.max(...intregi) : -Infinity;
  return Math.max(0, Math.min(maxim, Math.floor(josRama - cel)));
}

/** Asezarea de acum a figurii: ce e intreg in rama si cate randuri de text taie marginea de jos. */
function asezare(fig: HTMLElement) {
  const cs = getComputedStyle(fig);
  const r = fig.getBoundingClientRect();
  const sus = r.top + parseFloat(cs.borderTopWidth);
  const jos = r.bottom - parseFloat(cs.borderBottomWidth);
  const intregi: number[] = [];
  let taiate = 0;
  const umblator = document.createTreeWalker(fig, NodeFilter.SHOW_TEXT);
  const interval = document.createRange();
  for (let n = umblator.nextNode(); n; n = umblator.nextNode()) {
    const el = n.parentElement;
    if (!el || !n.textContent?.trim() || el.closest(".doar-cititor")) continue;
    // Taietura stramosilor pana la figura: un rezumat inchis e taiat la inaltimea 0.
    let t = sus;
    let b = jos;
    for (let x: HTMLElement | null = el; x && x !== fig; x = x.parentElement) {
      const c = getComputedStyle(x);
      if (c.overflowY !== "visible") {
        const d = x.getBoundingClientRect();
        t = Math.max(t, d.top);
        b = Math.min(b, d.bottom);
      }
    }
    interval.selectNodeContents(n);
    for (const d of interval.getClientRects()) {
      // Nevazut (taiat de un stramos sau in afara ramei): nu conteaza.
      if (d.width < 1 || Math.min(d.bottom, b) - Math.max(d.top, t) < 0.5) continue;
      // Vazut pana jos: intreg, deci ocrotit. Trece de marginea ramei: randul taiat pe care il inmoaie
      // estomparea. Altfel l-a taiat un stramos (un rezumat in mijlocul deschiderii): nu se numara.
      if (d.bottom <= b + 0.5) intregi.push(d.bottom);
      else if (d.bottom > jos + 0.5) taiate++;
    }
  }
  for (const buton of fig.querySelectorAll("button")) {
    const d = buton.getBoundingClientRect();
    if (d.height > 0 && d.top >= sus && d.bottom <= jos + 0.5) intregi.push(d.bottom + CONTUR_FOCUS);
  }
  return { jos, intregi, taiate };
}

/**
 * Tine `--estompare` pe figura la zi: la montare, la fiecare schimbare de `stare` (randul deschis,
 * persoana, verificarile), la capatul tranzitiilor si animatiilor din macheta (rezumatul se deschide
 * in 200 ms, verificarea apare in 250 ms), la redimensionare si dupa incarcarea fonturilor.
 */
export function useEstompare(ref: RefObject<HTMLElement | null>, estompat: boolean, stare: unknown): void {
  useEffect(() => {
    const fig = ref.current;
    if (!fig || !estompat) return;
    let cadru = 0;
    const masoara = () => {
      cadru = 0;
      const a = asezare(fig);
      fig.style.setProperty("--estompare", inaltimeEstompare(a.jos, a.intregi, a.taiate) + "px");
    };
    const programeaza = () => {
      if (!cadru) cadru = requestAnimationFrame(masoara);
    };
    programeaza();
    fig.addEventListener("transitionend", programeaza);
    fig.addEventListener("animationend", programeaza);
    const observator = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(programeaza);
    observator?.observe(fig);
    let viu = true;
    void document.fonts?.ready.then(() => {
      if (viu) programeaza();
    });
    return () => {
      viu = false;
      if (cadru) cancelAnimationFrame(cadru);
      fig.removeEventListener("transitionend", programeaza);
      fig.removeEventListener("animationend", programeaza);
      observator?.disconnect();
    };
  }, [ref, estompat, stare]);
}

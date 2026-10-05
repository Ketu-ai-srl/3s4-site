import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "./ajutor/baza";
import { mediuProfil3sMd, pornesteCopia3sMd, type Copie3sMd } from "./ajutor/copie-3s-md";
import { CONSTRUCTOR } from "../../src/content/acasa";
import { CHESTIONAR, COMUN, DUEL, ESTIMARE, NUME_CANAL, SCENARII } from "../../src/content/acasa-constructor";
import { CAP_CONSTRUCTOR_EN } from "../../src/content/en/acasa-constructor-cap-componente";
import {
  CHESTIONAR_EN,
  COMUN_EN,
  DUEL_EN,
  ESTIMARE_EN,
  NUME_CANAL_EN,
  SCENARII_EN,
} from "../../src/content/en/acasa-constructor-componente";

/**
 * Felia 122 (`constructor-editie`), pe COPIA 3s.md (`ajutor/copie-3s-md.ts`): constructorul de pe startul EN, in forma
 * (a) a deciziei 59. Forma capului (radacina, clasele, stilurile) o masoara `congruenta.spec.ts` contra listei
 * `config/congruenta/p01.json`; continutul si ramurile, fara browser, `tests/constructor-editie.test.ts`. Aici, lumea
 * de dupa clic, care nu e in HTML-ul servit:
 *  1. sectiunea e intre erou si functionalitati, cu capul in engleza si cele 9 industrii;
 *  2. pe fiecare industrie (1440) si pe doua (390): panoul ajunge gata fara lista de reguli, randul de integrari si
 *     benzi; butonul final duce la WhatsApp-ul domeniului (`data-canal`); textul sectiunii n-are niciun sir al
 *     constructorului RO, nicio diacritica si niciun pret in lei; scena Avocatura n-are pista termenului;
 *  3. chestionarul confirmat: duelul se termina fara toast, estimarea si CTA-ul ei duc la WhatsApp;
 *  4. bucatile JS cerute de pagina, cu lumea deschisa, nu poarta textele scenelor RO, dar poarta pe cele EN (martorul:
 *     cautarea vede bucata lumii).
 *
 * MARTORUL detectorului de text RO: un sir RO pus la rulare in sectiune e prins (POZITIV), si in forma lui fara
 * diacritice, impreuna cu un pret in lei (POZITIV); textul EN al sectiunii nu e acuzat (NEGATIV, chiar cazurile de
 * mai sus).
 *
 * CAPTURILE (numai la cerere): cu `CAPTURI_CONSTRUCTOR=<director>`, proba scrie acolo capturile startului la 1440 si la
 * 390, cu constructorul pe ecran si un scenariu deschis. In CI variabila lipseste, deci nu se scrie nimic.
 */

const PROFIL = mediuProfil3sMd();
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string };
const WA = "https://wa.me/" + CANALE.whatsapp + "?text=";
/** Pretul in moneda RO, in ambele forme (codul si numele scris); pe 3s.md pretul e numai in EUR (decizia 54). */
const RON = new RegExp("\\b(" + "R" + "ON|lei)\\b", "i");
const DIACRITICE = /[ăâîșțşţĂÂÎȘȚŞŢ]/;
const CAPTURI = process.env.CAPTURI_CONSTRUCTOR ?? "";

/** Frunzele de text ale unui obiect (fara chei de cod). */
function frunze(o: unknown, acc: string[] = []): string[] {
  if (typeof o === "string") acc.push(o);
  else if (Array.isArray(o)) for (const v of o) frunze(v, acc);
  else if (o && typeof o === "object")
    for (const [k, v] of Object.entries(o)) if (k !== "iconita" && k !== "cod" && k !== "stare") frunze(v, acc);
  return acc;
}

/**
 * Dictionarul RO al constructorului: textele de cel putin doua cuvinte sau cu diacritice, fara cele scrise identic in
 * continutul EN (simbolurile: numere de dosar, revizii, perioade).
 */
function dictionarRo(): string[] {
  const en = new Set(frunze([CAP_CONSTRUCTOR_EN, COMUN_EN, NUME_CANAL_EN, CHESTIONAR_EN, DUEL_EN, ESTIMARE_EN, SCENARII_EN]));
  return [
    ...new Set(
      frunze([CONSTRUCTOR, COMUN, NUME_CANAL, CHESTIONAR, DUEL, ESTIMARE, SCENARII])
        .map((s) => s.trim())
        .filter((s) => !en.has(s))
        .filter((s) => s.split(/\s+/).length >= 2 || DIACRITICE.test(s)),
    ),
  ];
}

const DICTIONAR = dictionarRo();
const spatii = (t: string) => t.replace(/\s+/g, " ");

/**
 * Forma fara diacritice (NFD, semnele combinate scoase). Textul EN e obligat sa fie ASCII, deci un sir RO scurs acolo
 * ar arata exact asa.
 */
const faraDiacritice = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "");

/** Identic, sau (numai sirurile de cel putin doua cuvinte) dupa scoaterea diacriticelor din ambele. */
function siruriRo(text: string): string[] {
  const t = spatii(text);
  const tf = faraDiacritice(t);
  return DICTIONAR.filter((s) => t.includes(spatii(s)) || (s.split(/\s+/).length >= 2 && tf.includes(faraDiacritice(spatii(s)))));
}

let copie: Copie3sMd;

test.beforeAll(async () => {
  test.setTimeout(600_000);
  copie = await pornesteCopia3sMd();
});

test.afterAll(async () => {
  await copie?.opreste();
});

async function deschide(page: Page): Promise<number> {
  await page.goto(copie.baza + "/", { waitUntil: "networkidle" });
  return page.evaluate(() => window.innerWidth);
}

async function alege(page: Page, cod: string) {
  await page.locator('#constructor [data-industrie="' + cod + '"]').click();
  await expect(page.locator("#constructor [data-panou]")).toHaveAttribute("data-panou", "gata");
}

async function inapoi(page: Page) {
  await page.locator("#constructor [data-industrie-aleasa] button").first().click();
  await expect(page.locator('#constructor [data-industrie="constructii"]')).toBeVisible();
}

/** Ce trebuie sa lipseasca si ce trebuie sa fie in sectiune, cu lumea deschisa. */
async function verificaLumea(page: Page, cod: string): Promise<string[]> {
  const abateri: string[] = [];
  const s = page.locator("#constructor");
  for (const sel of ['[class*="Panou_automatizari__"]', '[class*="Panou_integrari__"]', "[data-banda]"]) {
    const n = await s.locator(sel).count();
    if (n !== 0) abateri.push(cod + ": " + sel + " x" + n);
  }
  const final = s.locator('[data-panou] a[data-canal="whatsapp"]');
  if ((await final.count()) !== 1) abateri.push(cod + ": butonul final pe WhatsApp lipseste");
  else if (!((await final.getAttribute("href")) ?? "").startsWith(WA)) abateri.push(cod + ": butonul final nu duce la " + WA);
  if ((await s.locator('[href^="/inregistrare"], [data-tinta-lipsa^="/inregistrare"]').count()) !== 0)
    abateri.push(cod + ": tinta /inregistrare in sectiune");
  const text = await s.evaluate((el) => (el as HTMLElement).innerText + " " + el.textContent);
  for (const r of siruriRo(text)) abateri.push(cod + ": text RO " + JSON.stringify(r));
  if (DIACRITICE.test(text)) abateri.push(cod + ": diacritice in sectiune");
  if (RON.test(text)) abateri.push(cod + ": pret in lei in sectiune");
  return abateri;
}

async function capteaza(page: Page, nume: string, pagina = false) {
  if (!CAPTURI) return;
  mkdirSync(CAPTURI, { recursive: true });
  await page.screenshot({ path: join(CAPTURI, nume + ".png"), fullPage: pagina });
}

test("sectiunea constructorului e intre erou si functionalitati, cu capul EN si 9 industrii", async ({ page }) => {
  await deschide(page);
  const ordine = await page.locator("main [data-ciot]").evaluateAll((el) => el.map((e) => (e as HTMLElement).dataset.ciot));
  expect(ordine.slice(0, 3)).toEqual(["erou", "constructor", "functionalitati"]);
  await expect(page.locator("#constructor h2")).toHaveText(CAP_CONSTRUCTOR_EN.titlu);
  await expect(page.locator("#constructor [data-industrie]")).toHaveCount(9);
});

for (const latime of [1440, 390] as const) {
  test.describe("lumea pe editia EN, la " + latime, () => {
    test.use({ viewport: { width: latime, height: latime === 1440 ? 900 : 844 } });

    test("fiecare industrie: panoul fara reguli, integrari si benzi, butonul pe WhatsApp, fara text RO", async ({ page }) => {
      test.setTimeout(180_000);
      const masurat = await deschide(page);
      expect(masurat).toBe(latime);
      if (CAPTURI) {
        await page.locator("#constructor").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
        await page.waitForTimeout(300);
        await capteaza(page, "start-" + latime + "-poarta");
        await capteaza(page, "start-" + latime + "-pagina", true);
      }
      const coduri = latime === 1440 ? CONSTRUCTOR.industrii.map((i) => i.cod) : ["constructii", "avocatura"];
      const abateri: string[] = [];
      for (const cod of coduri) {
        await alege(page, cod);
        abateri.push(...(await verificaLumea(page, cod)));
        if (cod === "avocatura") {
          const pista = await page.locator('#constructor [class*="Scene_pistaTermen__"]').count();
          if (pista !== 0) abateri.push("avocatura: pista termenului x" + pista);
        }
        if (cod === "contabilitate" || (latime === 390 && cod === "constructii")) {
          await page.locator("#constructor [data-panou]").scrollIntoViewIfNeeded();
          await capteaza(page, "start-" + latime + "-scenariu-" + cod);
        }
        await inapoi(page);
      }
      console.log("[constructor-editie] " + latime + ": " + coduri.length + " industrii, abateri " + abateri.length);
      expect(abateri).toEqual([]);
    });

    test("chestionarul confirmat: duelul fara toast, estimarea si CTA-ul ei pe WhatsApp", async ({ page }) => {
      await deschide(page);
      await alege(page, "constructii");
      const cap = page.locator("#constructor [data-chestionar] > button").first();
      await cap.click();
      await expect(cap).toHaveAttribute("aria-expanded", "true");
      for (const c of ["email", "mesaj"]) {
        const j = page.locator('#constructor [data-chestionar] [data-canal="' + c + '"]');
        if ((await j.getAttribute("aria-pressed")) !== "true") await j.click();
      }
      await page.locator('#constructor [data-volum="v50"]').click();
      await page.locator('#constructor [data-cine="coleg"]').click();
      await page.locator("#constructor [data-confirma]").click();
      await expect(page.locator("#constructor [data-duel]")).toHaveAttribute("data-duel", "gata");
      await expect(page.locator("#constructor [data-estimare]")).toBeVisible();
      expect(await page.locator('#constructor [class*="Chestionar_toast__"]').count()).toBe(0);
      const cta = page.locator('#constructor [data-cta-constructor] a[data-canal="whatsapp"]');
      await expect(cta).toHaveCount(1);
      expect((await cta.getAttribute("href")) ?? "").toMatch(new RegExp("^" + WA.replace(/[.?]/g, "\\$&")));
      await expect(page.locator("#constructor [data-cta-constructor]")).toContainText(ESTIMARE_EN.nota);
      expect(await verificaLumea(page, "constructii, chestionar")).toEqual([]);
      await page.locator("#constructor [data-estimare]").scrollIntoViewIfNeeded();
      await capteaza(page, "start-" + latime + "-estimare");
    });
  });
}

test("bucatile JS cerute, cu lumea si chestionarul deschise: fara textele scenelor RO, cu cele EN", async ({ page }) => {
  const corpuri: string[] = [];
  page.on("response", async (r) => {
    if (r.url().endsWith(".js") && r.ok()) {
      try {
        corpuri.push(await r.text());
      } catch {
        // raspuns fara corp (redirect, anulare)
      }
    }
  });
  await deschide(page);
  await alege(page, "logistica");
  await page.locator("#constructor [data-chestionar] > button").first().click();
  await page.waitForLoadState("networkidle");
  const js = corpuri.join("\n");
  /** Sirul cautat si forma lui cu secvente \u: minificatorul poate scrie diacriticele asa. */
  const forme = (s: string) => [s, s.replace(/[^\x00-\x7f]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"))];
  const are = (s: string) => forme(s).some((f) => js.includes(f));
  const ro = Object.values(SCENARII).map((sc) => sc.durere);
  const en = Object.values(SCENARII_EN).map((sc) => sc.durere);
  console.log("[constructor-editie] bucati JS: " + corpuri.length + ", durerile EN gasite " + en.filter(are).length + "/9, RO " + ro.filter(are).length + "/9");
  expect(en.filter(are), "martorul: cautarea vede bucata lumii EN").toHaveLength(9);
  expect(ro.filter(are)).toEqual([]);
});

test("martor POZITIV: un sir RO pus in sectiune e prins de detector", async ({ page }) => {
  await deschide(page);
  await alege(page, "it");
  const sir = SCENARII.it.concluzie;
  await page.locator("#constructor [data-panou]").evaluate((el, t) => {
    const p = document.createElement("p");
    p.textContent = t;
    el.appendChild(p);
  }, sir);
  const abateri = await verificaLumea(page, "it");
  expect(abateri).toContain("it: text RO " + JSON.stringify(sir));
  expect(abateri).toContain("it: diacritice in sectiune");
});

test("martor POZITIV: un sir RO FARA diacritice si un pret in lei, puse in sectiune, sunt prinse", async ({ page }) => {
  await deschide(page);
  await alege(page, "it");
  const sir = COMUN.schimba;
  const fara = faraDiacritice(sir);
  expect(DIACRITICE.test(sir) && !DIACRITICE.test(fara)).toBe(true);
  const pret = "250 " + "lei";
  await page.locator("#constructor [data-panou]").evaluate((el, texte) => {
    for (const t of texte) {
      const p = document.createElement("p");
      p.textContent = t;
      el.appendChild(p);
    }
  }, [fara, pret]);
  const abateri = await verificaLumea(page, "it");
  expect(abateri).toContain("it: text RO " + JSON.stringify(sir));
  expect(abateri).toContain("it: pret in lei in sectiune");
  expect(abateri).not.toContain("it: diacritice in sectiune");
});

test("martor NEGATIV: textul EN al sectiunii, cu lumea deschisa, nu e acuzat de detector", async ({ page }) => {
  await deschide(page);
  await alege(page, "it");
  expect(await verificaLumea(page, "it")).toEqual([]);
});

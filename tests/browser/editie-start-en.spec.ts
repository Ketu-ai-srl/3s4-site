import type { Page } from "@playwright/test";
import { expect, test } from "./ajutor/baza";
import {
  mediuProfil3sMd,
  pornesteCopia3sMd,
  type Copie3sMd,
} from "./ajutor/copie-3s-md";
import { IMPACTURI_BLOCANTE, masoaraAccesibilitatea } from "./ajutor/detectori";
import * as en from "../../src/content/en/acasa-componente";

/**
 * Felia 99 (`editie-start-en`), pe COPIA 3s.md (`ajutor/copie-3s-md.ts`): pagina de start EN compune componentele
 * startului RO (decizia 53), cu textul din `src/content/en/acasa-componente.ts`. Forma (radacinile, clasele,
 * numaratorile, stilurile) o masoara `congruenta.spec.ts` contra listei `config/congruenta/p01.json`; aici, criteriul
 * de gata al feliei:
 *  1. HTML-ul servit: un singur H1, zero `<form`, zero RON; legatura WhatsApp cu `[ref:en-home]` o data in erou si o
 *     data in blocul de final; butonul secundar al eroului duce la blocul de final, iar ancora exista;
 *  2. scena eroului, dupa hidratare, cu si fara miscare redusa: zero `<button>`, 4 noduri cu etichetele modulului,
 *     fara pastila centrului; un clic pe centru nu deschide macheta (decizia 43 si 49 pe 3s.md);
 *  3. FAQPage din JSON-LD = intrebarile si raspunsurile vizibile ale acordeonului, in ordine;
 *  4. `textContent`-ul lui `<main>` contine fiecare sir al modulului care se randeaza (numarat, raportat);
 *  5. fara defilare orizontala la 1440 si 390, iar la 390 ultimul rand al subsolului ramane deasupra barei fixe;
 *  6. axe (`ajutor/detectori.ts`, aceleasi impacturi blocante ca PA-03) pe `/` al copiei, la 1440 si 390, cu si fara
 *     miscare redusa; plus contrastul WCAG calculat (>= 4,5:1) pe microtextul celor doua sectiuni inchise la culoare
 *     care poarta text mic: blocul de final (subtitlul si microtextul de sub buton) si testimonialul (continuarea si
 *     atribuirea). Masurarea e cea din `contrast-microtext-en.spec.ts`: culoarea calculata, compusa cu opacitatea
 *     elementului si a stramosilor, pe fundalul efectiv (straturile compuse pana la primul opac).
 *
 * MARTORII: detectorul de siruri lipsa prinde un sir fabricat la rulare (POZITIV) si nu acuza textul complet al
 * paginii (NEGATIV). Pentru 6: pe copia servita, microtextului finalului i se pune la rulare culoarea unui token al
 * paginii apropiat de fundalul inchis (`--color-ardezie-7`, citit din pagina, nu scris aici); atat axe
 * (`color-contrast`), cat si masurarea calculata trebuie sa-l acuze. Fara asta, un "trece" ar putea veni dintr-o
 * masurare care nu vede culoarea.
 *
 * LIMITA DECLARATA (6). Antetul global, in starea de pastila (dupa 20 px de derulare), are legaturile #666666 pe un
 * fundal alb de 85% opacitate; cand sub el trece o sectiune inchisa la culoare (testimonialul, blocul de final), axe
 * masoara 4,18:1 (#666666 pe #dbdcdf). Masurat si pe startul RO, cu aceeasi piesa, deci nu vine din pagina de fata;
 * antetul e o piesa inghetata, in afara acestei probe. Axe ruleaza aici dupa ce pagina a fost parcursa si readusa sus,
 * cu antetul plat peste erou.
 */

const PROFIL = mediuProfil3sMd();
const CANALE = JSON.parse(PROFIL.CANALE_JSON) as { whatsapp: string };
const WA = "https://wa.me/" + CANALE.whatsapp + "?text=";
const RON = new RegExp("\\b" + "R" + "ON\\b");
const REF = "[ref:en-home]";

/** Cheile care nu poarta text vizibil (iconite, coduri, pozitii, tinte). */
const FARA_TEXT = new Set(["iconita", "cod", "pozitie", "href", "ruta"]);

function frunze(valoare: unknown, acc: string[] = []): string[] {
  if (typeof valoare === "string") {
    const t = valoare.trim();
    if (t !== "" && !/^(\/|#|https?:|mailto:)/.test(t)) acc.push(t);
  } else if (Array.isArray(valoare)) {
    for (const v of valoare) frunze(v, acc);
  } else if (valoare && typeof valoare === "object") {
    for (const [k, v] of Object.entries(valoare))
      if (!FARA_TEXT.has(k)) frunze(v, acc);
  }
  return acc;
}

/**
 * Sirurile modulului care se randeaza in textul paginii. Nu intra: butonul principal din continutul blocului de final
 * (pagina pune butonul WhatsApp in locul lui), eticheta grupului de puncte al pistei (exista numai pe pista de mobil, cu
 * miscare) si numele tintei cardului Enterprise (e numele accesibil al legaturii, `aria-label`, masurat separat);
 * eticheta butonului de canal intra, fiindca butoanele o poarta.
 */
function asteptate(): string[] {
  const { butonPrincipal: _b, ...cta } = en.CTA_FINAL_EN;
  void _b;
  return [
    ...new Set(
      frunze([
        en.EROU_EN,
        en.EROU_SECUNDAR.text,
        en.ETICHETA_BUTON_CANAL,
        en.FUNCTIONALITATI_EN,
        en.PASI_EN,
        en.MACHETA_CAUTARE_EN,
        en.MACHETA_REGISTRU_EN,
        en.ETICHETA_EXEMPLU_EN,
        en.CIFRE_EN,
        en.INDUSTRII_EN,
        en.TESTIMONIAL_EN,
        en.CARD_SECURITATE_EN,
        { ...en.CARD_ENTERPRISE_EN, tinta: null },
        en.BANDA_PRET_EN,
        en.INTREBARI_EN,
        cta,
      ]),
    ),
  ];
}

const spatii = (t: string) => t.replace(/\s+/g, " ");

/** Sirurile care lipsesc din text, comparate cu spatiile normalizate. */
function lipsa(text: string, siruri: string[]): string[] {
  const t = spatii(text);
  return siruri.filter((s) => !t.includes(spatii(s)));
}

let copie: Copie3sMd;

test.beforeAll(async () => {
  test.setTimeout(600_000);
  copie = await pornesteCopia3sMd();
});

test.afterAll(async () => {
  await copie?.opreste();
});

async function servit(): Promise<string> {
  const r = await fetch(copie.baza + "/");
  expect(r.status).toBe(200);
  return r.text();
}

function bucata(html: string, deschidere: RegExp, inchidere: string): string {
  const m = deschidere.exec(html);
  if (m === null) return "";
  const sfarsit = html.indexOf(inchidere, m.index);
  return sfarsit < 0 ? "" : html.slice(m.index, sfarsit + inchidere.length);
}

function whatsapp(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)]
    .map((m) => m[1].split("&amp;").join("&"))
    .filter((h) => h.startsWith(WA));
}

test("HTML-ul servit: un H1, zero <form, zero RON; WhatsApp cu ref-ul paginii in erou si in final; butonul secundar duce la final", async () => {
  const html = await servit();
  expect(html.match(/<h1\b/g) ?? []).toHaveLength(1);
  expect(html).not.toContain("<form");
  expect(RON.test(html)).toBe(false);
  const erou = bucata(
    html,
    /<section\b[^>]*aria-labelledby="erou-titlu"/,
    "</section>",
  );
  const final = bucata(
    html,
    new RegExp('<section\\b[^>]*id="' + en.ANCORA_FINAL + '"'),
    "</section>",
  );
  // Controlul extragerii: ambele sectiuni au fost gasite.
  expect(erou).not.toBe("");
  expect(final).not.toBe("");
  for (const [nume, bloc] of [
    ["erou", erou],
    ["final", final],
  ] as const) {
    const wa = whatsapp(bloc);
    expect(wa, nume).toHaveLength(1);
    expect(decodeURIComponent(wa[0].slice(WA.length)), nume).toContain(REF);
  }
  expect(erou).toContain('href="' + en.EROU_SECUNDAR.href + '"');
});

for (const miscare of ["reduce", "no-preference"] as const) {
  test(
    "scena eroului dupa hidratare (miscare " +
      miscare +
      "): zero <button>, 4 noduri cu etichetele modulului, fara centru de lansare",
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion: miscare });
      await page.goto(copie.baza + "/");
      await page.waitForLoadState("networkidle");
      const scena = page.locator('[class*="Erou_scenaGazda__"]');
      await expect(scena).toHaveCount(1);
      // Controlul: scena are centrul (sigla) randat, deci zeroul de butoane nu vine dintr-o scena goala.
      await expect(scena.locator('[class*="Erou_centru__"]')).toHaveCount(1);
      await expect(scena.locator("button")).toHaveCount(0);
      await expect(scena.locator("[data-pastila-centru]")).toHaveCount(0);
      const etichete = await scena
        .locator("[data-eticheta-nod]")
        .allTextContents();
      expect(etichete.map((e) => e.trim())).toEqual(
        en.EROU_EN.bucla.noduri.map((n) => n.eticheta),
      );
      // Clicul pe centru: faza scenei ramane "bucla" si nicio piesa a machetei (modulul ei CSS) nu apare in scena.
      const spatiu = scena.locator("[data-faza]");
      await expect(spatiu).toHaveAttribute("data-faza", "bucla");
      await scena.locator('[class*="Erou_centru__"]').click({ force: true });
      await page.waitForTimeout(600);
      await expect(spatiu).toHaveAttribute("data-faza", "bucla");
      expect(
        await scena
          .locator('[class^="Macheta_"], [class*=" Macheta_"]')
          .count(),
      ).toBe(0);
    },
  );
}

test("FAQPage din JSON-LD = intrebarile si raspunsurile vizibile, in ordine", async ({
  page,
}) => {
  await page.goto(copie.baza + "/");
  const blocuri = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const noduri = blocuri.flatMap((b) => {
    const j = JSON.parse(b) as {
      "@graph"?: Record<string, unknown>[];
    } & Record<string, unknown>;
    return j["@graph"] ?? [j];
  });
  const faq = noduri.filter((n) => n["@type"] === "FAQPage") as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  }[];
  expect(faq).toHaveLength(1);
  const sectiune = page.locator('section[aria-labelledby="intrebari-titlu"]');
  const text = spatii((await sectiune.textContent()) ?? "");
  // Intrebarile vizibile, in ordinea acordeonului: fiecare apare in text, in ordinea din JSON-LD.
  let poz = -1;
  for (const q of faq[0].mainEntity) {
    const i = text.indexOf(q.name);
    expect(i, q.name).toBeGreaterThan(poz);
    poz = i;
    expect(text, q.name).toContain(q.acceptedAnswer.text);
  }
  expect(faq[0].mainEntity.map((q) => q.name)).toEqual(
    en.INTREBARI_EN.intrebari.map((i) => i.intrebare),
  );
  // Controlul: acordeonul are atatea elemente cate intrebari are FAQPage.
  await expect(
    sectiune.locator('[class*="Acordeon_startElement__"]'),
  ).toHaveCount(faq[0].mainEntity.length);
});

test("textContent-ul lui <main> contine fiecare sir randat al modulului EN", async ({
  page,
}) => {
  await page.goto(copie.baza + "/");
  const text = (await page.locator("main").textContent()) ?? "";
  const siruri = asteptate();
  console.log(
    "[editie-start-en] siruri asteptate: " +
      siruri.length +
      ", cuvinte: " +
      siruri.join(" ").split(/\s+/).length,
  );
  expect(siruri.length).toBeGreaterThan(80);
  expect(lipsa(text, siruri)).toEqual([]);
  await expect(
    page.locator(
      'main a[aria-label="' + en.CARD_ENTERPRISE_EN.tinta.text + '"]',
    ),
  ).toHaveAttribute("href", en.CARD_ENTERPRISE_EN.tinta.href ?? "");
});

test("martor POZITIV: detectorul prinde un sir fabricat la rulare, absent din pagina", async ({
  page,
}) => {
  await page.goto(copie.baza + "/");
  const text = (await page.locator("main").textContent()) ?? "";
  const fabricat = ["Qx", "absent", String(Date.now())].join(" ");
  expect(lipsa(text, [...asteptate(), fabricat])).toEqual([fabricat]);
});

test("martor NEGATIV: textul complet al paginii nu e acuzat (acelasi detector, aceleasi siruri, plus titlul H1)", async ({
  page,
}) => {
  await page.goto(copie.baza + "/");
  const text = (await page.locator("main").textContent()) ?? "";
  const h1 = (await page.locator("h1").textContent()) ?? "";
  expect(h1).toContain(en.EROU_EN.titlu.primaPropozitie);
  expect(lipsa(text, [h1.trim()])).toEqual([]);
});

async function faraDefilareOrizontala(
  page: Page,
): Promise<{ latime: number; defilare: number }> {
  return page.evaluate(() => ({
    latime: window.innerWidth,
    defilare: document.documentElement.scrollWidth,
  }));
}

for (const latime of [1440, 390] as const) {
  test.describe("la " + latime, () => {
    test.use({
      viewport: { width: latime, height: latime === 390 ? 844 : 900 },
    });

    test("fara defilare orizontala; la 390, ultimul rand al subsolului deasupra barei fixe", async ({
      page,
    }) => {
      await page.goto(copie.baza + "/");
      const m = await faraDefilareOrizontala(page);
      expect(m.latime).toBe(latime);
      expect(m.defilare).toBe(m.latime);
      if (latime === 390) {
        await page.evaluate(() =>
          window.scrollTo(0, document.documentElement.scrollHeight),
        );
        await page.waitForTimeout(300);
        const r = await page.evaluate(() => {
          const bara = document.querySelector("[data-bara-mobil]");
          const subsol = document.querySelector("footer");
          const ultim = subsol
            ? [...subsol.querySelectorAll("*")]
                .filter(
                  (e) =>
                    e.getBoundingClientRect().height > 0 &&
                    e.children.length === 0,
                )
                .pop()
            : null;
          return {
            bara: bara ? bara.getBoundingClientRect().top : null,
            ultim: ultim ? ultim.getBoundingClientRect().bottom : null,
          };
        });
        // Controlul: bara si subsolul exista pe pagina.
        expect(r.bara).not.toBeNull();
        expect(r.ultim).not.toBeNull();
        expect(r.ultim!).toBeLessThanOrEqual(r.bara! + 0.5);
      }
    });
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// 6. Axe si contrastul microtextului pe sectiunile inchise la culoare
// ---------------------------------------------------------------------------------------------------------------------

const PRAG_CONTRAST = 4.5;

/** Microtextul masurat: selectorul (modulul CSS al componentei) si textul asteptat din modulul EN. */
const MICROTEXT_INCHIS = [
  {
    nume: "final, subtitlu",
    selector: '[class*="CtaFinalInchis_subtitlu__"]',
    text: en.CTA_FINAL_EN.subtitlu,
  },
  {
    nume: "final, microtext",
    selector: '[class*="CtaFinalInchis_microtext__"]',
    text: en.CTA_FINAL_EN.microtext,
  },
  {
    nume: "testimonial, continuare",
    selector: '[class*="acasa_testimonialContinuare__"]',
    text: en.TESTIMONIAL_EN.continuare,
  },
  {
    nume: "testimonial, rol",
    selector: '[class*="acasa_testimonialRol__"]',
    text: en.TESTIMONIAL_EN.atribuire.rol,
  },
  {
    nume: "testimonial, firma",
    selector: '[class*="acasa_testimonialFirma__"]',
    text: en.TESTIMONIAL_EN.atribuire.firma,
  },
] as const;

type MasurareContrast = {
  text: string;
  culoare: string;
  fundal: string;
  raport: number;
  eroare: string | null;
};

/** Contrastul WCAG 2.x al elementelor date de selector (aceeasi masurare ca in `contrast-microtext-en.spec.ts`). */
async function contrast(
  page: Page,
  selector: string,
): Promise<MasurareContrast[]> {
  return page.evaluate((selector) => {
    const panza = document.createElement("canvas");
    panza.width = 1;
    panza.height = 1;
    const ctx = panza.getContext("2d", { willReadFrequently: true });
    if (ctx === null) throw new Error("panza 2D indisponibila");
    const rgba = (c: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const peste = (
      sus: [number, number, number, number],
      jos: [number, number, number],
    ): [number, number, number] => [
      sus[0] * sus[3] + jos[0] * (1 - sus[3]),
      sus[1] * sus[3] + jos[1] * (1 - sus[3]),
      sus[2] * sus[3] + jos[2] * (1 - sus[3]),
    ];
    const lum = (c: [number, number, number]) => {
      const l = c.map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
    };
    return [...document.querySelectorAll<HTMLElement>(selector)].map((el) => {
      const straturi: [number, number, number, number][] = [];
      let opacitate = 1;
      let eroare: string | null = null;
      for (let n: HTMLElement | null = el; n !== null; n = n.parentElement) {
        const st = getComputedStyle(n);
        opacitate *= Number(st.opacity);
        if (
          st.backgroundImage !== "none" &&
          eroare === null &&
          straturi.every((s) => s[3] < 1)
        ) {
          eroare = "fundal cu imagine pe " + n.tagName.toLowerCase();
        }
        const f = rgba(st.backgroundColor);
        if (f[3] > 0 && straturi.every((s) => s[3] < 1)) straturi.push(f);
      }
      let fundal: [number, number, number] = [255, 255, 255];
      for (let i = straturi.length - 1; i >= 0; i--)
        fundal = peste(straturi[i], fundal);
      const t = rgba(getComputedStyle(el).color);
      const culoare = peste([t[0], t[1], t[2], t[3] * opacitate], fundal);
      const a = lum(culoare);
      const b = lum(fundal);
      const raport = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const hex = (c: number[]) =>
        "#" +
        c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
      const r = el.getBoundingClientRect();
      if (eroare === null && (r.width === 0 || r.height === 0))
        eroare = "element fara cutie";
      return {
        text: (el.textContent ?? "").trim(),
        culoare: hex(culoare),
        fundal: hex(fundal),
        raport: Math.round(raport * 100) / 100,
        eroare,
      };
    });
  }, selector);
}

/**
 * Aduce elementul in vedere si asteapta ca aparitia lui (Reveal, fara miscare redusa) sa se fi terminat: opacitatea
 * compusa a STRAMOSILOR e 1. Opacitatea elementului insusi ramane (e parte din design si intra in masurare).
 */
async function inVedere(page: Page, selector: string): Promise<void> {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await expect
    .poll(
      () =>
        el.evaluate((e) => {
          let o = 1;
          for (let n = e.parentElement; n !== null; n = n.parentElement)
            o *= Number(getComputedStyle(n).opacity);
          return o;
        }),
      { timeout: 10_000 },
    )
    .toBe(1);
}

/**
 * Parcurge pagina pana jos, ca toate aparitiile (Reveal) sa se fi declansat inainte de axe, apoi revine sus: antetul
 * se masoara in starea lui de pe start (plat, peste erou), nu suprapus peste o sectiune aleasa de pozitia de derulare
 * (limita declarata in antetul fisierului).
 */
async function parcurge(page: Page): Promise<void> {
  const inaltime = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const pas = await page.evaluate(() => Math.round(window.innerHeight * 0.6));
  for (let y = 0; y <= inaltime; y += pas) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

function jurnalAxe(
  eticheta: string,
  masura: Awaited<ReturnType<typeof masoaraAccesibilitatea>>,
): void {
  console.log(
    "[editie-start-en axe] " +
      eticheta +
      " | axe " +
      masura.versiuneAxe +
      " | reguli evaluate: " +
      masura.reguliRulate +
      " | blocante: " +
      masura.grave.length +
      " | de raportat: " +
      masura.usoare.length,
  );
  for (const u of masura.usoare)
    console.log(
      "    raportat, nu blocheaza: " +
        u.regula +
        " (" +
        u.impact +
        ") x" +
        u.noduri,
    );
  for (const g of masura.grave) {
    console.log(
      "    BLOCANT: " +
        g.regula +
        " (" +
        g.impact +
        ") x" +
        g.noduri +
        " - " +
        g.descriere,
    );
    for (const t of g.tinte) console.log("        " + t);
  }
}

for (const latime of [1440, 390] as const) {
  for (const miscare of ["reduce", "no-preference"] as const) {
    test.describe(
      "axe si contrast la " + latime + ", miscare " + miscare,
      () => {
        test.use({
          viewport: { width: latime, height: latime === 390 ? 844 : 900 },
        });

        test(
          "axe: zero incalcari " +
            IMPACTURI_BLOCANTE.join("/") +
            " pe / al copiei 3s.md",
          async ({ page }) => {
            await page.emulateMedia({ reducedMotion: miscare });
            await page.goto(copie.baza + "/", { waitUntil: "networkidle" });
            await parcurge(page);
            const masura = await masoaraAccesibilitatea(page);
            jurnalAxe(latime + " " + miscare, masura);
            // Controlul: axe a evaluat reguli pe pagina (zero incalcari dintr-o rulare goala nu inseamna curat).
            expect(masura.reguliRulate).toBeGreaterThan(0);
            expect(masura.grave.map((g) => g.regula)).toEqual([]);
          },
        );

        test(
          "contrastul calculat >= " +
            PRAG_CONTRAST +
            ":1 pe microtextul finalului si al testimonialului",
          async ({ page }) => {
            await page.emulateMedia({ reducedMotion: miscare });
            await page.goto(copie.baza + "/", { waitUntil: "networkidle" });
            for (const m of MICROTEXT_INCHIS) {
              // Controlul extragerii: exact un element, cu textul modulului EN.
              await expect(page.locator(m.selector), m.nume).toHaveCount(1);
              await inVedere(page, m.selector);
              const [r] = await contrast(page, m.selector);
              console.log(
                "[editie-start-en contrast] " +
                  latime +
                  " " +
                  miscare +
                  " | " +
                  m.nume +
                  " | " +
                  r.culoare +
                  " pe " +
                  r.fundal +
                  " = " +
                  r.raport +
                  ":1",
              );
              expect(r.text, m.nume).toBe(m.text);
              expect(r.eroare, m.nume).toBeNull();
              // Controlul fundalului: sectiunile masurate sunt cele inchise la culoare (fundalul nu e albul implicit).
              expect(r.fundal, m.nume).not.toBe("#ffffff");
              expect(r.raport, m.nume).toBeGreaterThanOrEqual(PRAG_CONTRAST);
            }
          },
        );
      },
    );
  }
}

test("martor POZITIV: o culoare slaba pusa pe microtextul finalului e acuzata de axe si de masurarea calculata", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(copie.baza + "/", { waitUntil: "networkidle" });
  const selector = MICROTEXT_INCHIS[1].selector;
  const token = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-ardezie-7")
      .trim(),
  );
  // Controlul: tokenul exista in pagina (altfel culoarea injectata ar fi invalida si n-ar schimba nimic).
  expect(token).not.toBe("");
  await inVedere(page, selector);
  const inainte = (await contrast(page, selector))[0].raport;
  await page
    .locator(selector)
    .evaluate(
      (e) => ((e as HTMLElement).style.color = "var(--color-ardezie-7)"),
    );
  const [r] = await contrast(page, selector);
  console.log(
    "[editie-start-en martor] microtextul finalului: " +
      inainte +
      ":1 -> " +
      r.raport +
      ":1 (" +
      r.culoare +
      " pe " +
      r.fundal +
      ")",
  );
  expect(inainte).toBeGreaterThanOrEqual(PRAG_CONTRAST);
  expect(r.raport).toBeLessThan(PRAG_CONTRAST);
  const masura = await masoaraAccesibilitatea(page);
  jurnalAxe("martor", masura);
  expect(masura.grave.map((g) => g.regula)).toContain("color-contrast");
});

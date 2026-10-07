import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// Trei puncte ale identitatii 3s.md - 3s.com.ro care aveau ca plasa numai comparatia din CI (jobul „Profil 3s.com.ro”):
//   (1) firul de navigare (JSON-LD `BreadcrumbList` din `FirPagina`) poarta adresele SERVITE ale asezarii;
//   (2) randul mesageriei din tabelul destinatarilor (Confidentialitate, sectiunea 5) poarta numarul operatorului din
//       context, nu numarul altui domeniu;
//   (3) `llms.txt` (text englezesc) are `Content-Language` al englezei si pe asezarea ro, unde radacina e romana.
// Fiecare caz are martorul 3s.md (asezarea md, neschimbata). Valorile vin din profilurile celor doua aplicatii
// (`config/profil-*.json`), citite la rulare: domeniile si numerele nu stau scrise aici.

vi.mock("next/navigation", async (original) => ({
  ...(await original<typeof import("next/navigation")>()),
  usePathname: () => "/",
  useRouter: () => ({ push: () => undefined, replace: () => undefined, prefetch: () => undefined, back: () => undefined, forward: () => undefined, refresh: () => undefined }),
}));

type Profil = Record<string, unknown>;
const profil = (nume: string) => JSON.parse(readFileSync(join(__dirname, "..", "config", nume), "utf8")) as Profil;
const MD = profil("profil-3s-md.json");
const RO = profil("profil-3s-com-ro.json");
const text = (p: Profil, k: string) => (typeof p[k] === "string" ? (p[k] as string) : JSON.stringify(p[k]));
const operator = (p: Profil) => (p.OPERATOR_JSON as { operator: { telefon: string } }).operator;
const CHEI = ["SITE_URL", "SITE_ENV", "SITE_EDITII", "SITE_ALTERNATE", "OPERATOR_JSON", "CANALE_JSON"];

/** Modulele, incarcate cu mediul aplicatiei date (asezarea ro numai pe profilul 3s.com.ro). */
async function incarca(p: Profil) {
  for (const k of CHEI) vi.stubEnv(k, text(p, k));
  vi.stubEnv("SITE_ASEZARE", typeof p.SITE_ASEZARE === "string" ? p.SITE_ASEZARE : "");
  for (const k of ["NEXT_PUBLIC_SITE_EDITII", "NEXT_PUBLIC_SITE_ASEZARE", "NEXT_PUBLIC_OPERATOR_NUMIT", "NEXT_PUBLIC_FAMILIE_JURIDICA"]) vi.stubEnv(k, "");
  vi.resetModules();
  return {
    FirPagina: (await import("../src/components/primitive/FirPagina")).default,
    juridic: await import("../src/content/juridic"),
    masurare: await import("../src/content/juridic/masurare"),
    operator: await import("../src/lib/operator"),
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

/** Adresele `item` din blocul JSON-LD randat de `FirPagina`. */
function itemiFir(html: string): string[] {
  const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
  expect(m, "FirPagina randeaza un bloc JSON-LD").not.toBeNull();
  const graf = JSON.parse((m as RegExpExecArray)[1]) as { itemListElement: { item: string }[] };
  return graf.itemListElement.map((x) => x.item);
}

describe("(1) firul de navigare: adresele servite ale asezarii", () => {
  it("asezarea ro (3s.com.ro): paginile romanesti la radacina, cele englezesti sub /en", async () => {
    const m = await incarca(RO);
    const baza = text(RO, "SITE_URL");
    const ro = itemiFir(renderToStaticMarkup(createElement(m.FirPagina, { niveluri: [{ text: "Acasă", cale: "/ro" }, { text: "Prețuri", cale: "/ro/preturi" }] })));
    expect(ro).toEqual([baza + "/", baza + "/preturi"]);
    const en = itemiFir(renderToStaticMarkup(createElement(m.FirPagina, { niveluri: [{ text: "Home", cale: "/" }, { text: "Pricing", cale: "/pricing" }] })));
    // Felia 141: firul paginilor ENGLEZE urmeaza canonical-ul, adica domeniul englezei din SITE_ALTERNATE (3s.md), cu
    // calea sursa: exact firul pe care il scrie 3s.md. Inainte: baza + "/en" si baza + "/en/pricing" (copia de pe 3s.com.ro,
    // al carei canonical arata spre 3s.md). Startul ramane cel ENGLEZ, nu startul romanesc de la radacina.
    const englezei = new URL(text(RO, "SITE_ALTERNATE").split(",").find((v) => v.startsWith("en="))!.slice(3)).origin;
    expect(englezei).not.toBe(baza);
    expect(en).toEqual([englezei + "/", englezei + "/pricing"]);
  });

  it("martorul 3s.md (asezarea md): caile raman cele sursa", async () => {
    const m = await incarca(MD);
    const baza = text(MD, "SITE_URL");
    const ro = itemiFir(renderToStaticMarkup(createElement(m.FirPagina, { niveluri: [{ text: "Acasă", cale: "/ro" }, { text: "Prețuri", cale: "/ro/preturi" }] })));
    expect(ro).toEqual([baza + "/ro", baza + "/ro/preturi"]);
    const en = itemiFir(renderToStaticMarkup(createElement(m.FirPagina, { niveluri: [{ text: "Home", cale: "/" }, { text: "Pricing", cale: "/pricing" }] })));
    expect(en).toEqual([baza + "/", baza + "/pricing"]);
  });
});

describe("(2) Confidentialitate, sectiunea 5: randul mesageriei poarta numarul operatorului din context", () => {
  /** Celula „ce face pentru noi” a randului WhatsApp, pe limba data, cu operatorul profilului. */
  async function randWhatsApp(p: Profil, limba: "ro" | "en") {
    const m = await incarca(p);
    const op = m.operator.citesteOperator(p.OPERATOR_JSON);
    if (op === null) throw new Error("profilul nu are operator");
    const masurare = m.masurare.masurareDin(m.masurare.intrariMasurare(op));
    const doc = m.juridic.documentMdBrut("confidentialitate", op, limba, masurare, false, text(p, "SITE_URL"));
    const s5 = doc.sectiuni.find((s) => s.cheie === "s5");
    const randuri = (s5?.blocuri ?? []).flatMap((b) => (b.tabel ? b.tabel.randuri : []));
    // O celula e un sir sau un obiect cu text si detaliu; se citeste ca text intreg.
    const celula = (c: string | { text: string; detaliu: string }) => (typeof c === "string" ? c : c.text + " " + c.detaliu);
    const rand = randuri.map((r) => r.map(celula)).filter((r) => r[0].startsWith("WhatsApp"));
    expect(rand, "exact un rand WhatsApp in sectiunea 5 (" + limba + ")").toHaveLength(1);
    return rand[0].join(" | ");
  }

  for (const limba of ["ro", "en"] as const) {
    it("asezarea ro (3s.com.ro), " + limba + ": numarul profilului 3s.com.ro, nu cel al 3s.md", async () => {
      const numarRo = operator(RO).telefon;
      const numarMd = operator(MD).telefon;
      // Controlul fixturii: profilurile au numere diferite, altfel cazul n-ar deosebi nimic.
      expect(numarRo).not.toBe(numarMd);
      const rand = await randWhatsApp(RO, limba);
      expect(rand).toContain(numarRo);
      expect(rand).not.toContain(numarMd);
    });

    it("martorul 3s.md, " + limba + ": numarul profilului 3s.md", async () => {
      const rand = await randWhatsApp(MD, limba);
      expect(rand).toContain(operator(MD).telefon);
      expect(rand).not.toContain(operator(RO).telefon);
    });
  }
});

describe("(3) Content-Language pentru /llms.txt", () => {
  type Regula = { source: string; headers: { key: string; value: string }[] };
  /** Valoarea efectiva a antetului pe o cale: Next aplica toate regulile potrivite, iar pentru aceeasi cheie castiga ultima. */
  function limbaPe(reguli: Regula[], cale: string): string | undefined {
    let valoare: string | undefined;
    for (const r of reguli) {
      const tipar = r.source.endsWith("/:path*")
        ? new RegExp("^" + r.source.slice(0, -"/:path*".length) + "(/.*)?$")
        : r.source.endsWith("/:cale*")
          ? new RegExp("^" + r.source.slice(0, -"/:cale*".length) + "(/.*)?$")
          : new RegExp("^" + r.source.replace(/\./g, "\\.") + "$");
      if (!tipar.test(cale)) continue;
      for (const h of r.headers) if (h.key === "Content-Language") valoare = h.value;
    }
    return valoare;
  }
  const editii = (p: Profil) => text(p, "SITE_EDITII").split(",").map((e) => e.trim()) as ("en" | "ro-MD")[];

  it("asezarea ro (3s.com.ro): /llms.txt in engleza, radacina romana, /en in engleza", async () => {
    vi.resetModules();
    const { anteteLimba } = await import("../next.config");
    const reguli = anteteLimba(editii(RO), "ro");
    expect(limbaPe(reguli, "/llms.txt")).toBe("en");
    // Martorii aceleiasi asezari: regula nu se intinde peste celelalte cai.
    expect(limbaPe(reguli, "/")).toBe("ro-RO");
    expect(limbaPe(reguli, "/preturi")).toBe("ro-RO");
    expect(limbaPe(reguli, "/en/pricing")).toBe("en");
  });

  it("martorul 3s.md: /llms.txt in engleza prin radacina, fara regula proprie; /ro ramane ro-MD", async () => {
    vi.resetModules();
    const { anteteLimba } = await import("../next.config");
    const reguli = anteteLimba(editii(MD), "md");
    expect(limbaPe(reguli, "/llms.txt")).toBe("en");
    expect(limbaPe(reguli, "/ro/preturi")).toBe("ro-MD");
    expect(reguli.some((r) => r.source === "/llms.txt")).toBe(false);
  });
});

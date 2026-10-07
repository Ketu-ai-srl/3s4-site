import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { LegaturaCanalProps } from "../src/components/canale/LegaturaCanal";
import type { TintaProps } from "../src/components/primitive/Tinta";
import type { GrafJsonLd } from "../src/components/seo/date-structurate";
import type { LegaturaPeCale } from "../src/content/navigatie";

// CAILE ASEZATE (`src/lib/asezare.ts`, regula "sursa in date, servita la emitere"): datele poarta cai SURSA (forma
// 3s.md), traducerea se face o singura data, in punctele care scriu o adresa (legatura din corp, canonical si
// `og:url`, JSON-LD `url`/`item`, harta, `llms.txt`, paleta, pagina de negasit, antetul, selectorul), iar
// componentele de browser care citesc bara de adrese o aduc inapoi la sursa (`useCaleSursa`).
//
// Modulele se incarca cu mediul aplicatiei 3s.md (`config/profil-3s-md.json`) si cu `SITE_ASEZARE` dat, deci rutele,
// contractele si canalele sunt cele ale build-ului, nu o lista scrisa aici. Valorile ASTEPTATE pe asezarea `ro` sunt
// scrise de mana, din tabelul domeniilor (romana la radacina, engleza sub `/en`), nu calculate cu regula masurata.
// Calea curenta din browser e simulata (`usePathname`), ca sa se poata masura fiecare punct de citire.

const STARE = vi.hoisted(() => ({
  cale: "/" as string | null,
  impinse: [] as string[],
}));

vi.mock("next/navigation", async (original) => ({
  ...(await original<typeof import("next/navigation")>()),
  usePathname: () => STARE.cale,
  useRouter: () => ({
    push: (c: string) => {
      STARE.impinse.push(c);
    },
    replace: () => undefined,
    prefetch: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
  }),
}));

vi.mock("next/font/google", () => {
  const font = (optiuni: { variable: string }) => ({
    variable: optiuni.variable,
    className: "",
    style: { fontFamily: "" },
  });
  return { Plus_Jakarta_Sans: font, JetBrains_Mono: font, Marck_Script: font };
});

const PROFIL = JSON.parse(
  readFileSync(join(__dirname, "..", "config", "profil-3s-md.json"), "utf8"),
) as Record<string, unknown>;
const textProfil = (k: string) =>
  typeof PROFIL[k] === "string"
    ? (PROFIL[k] as string)
    : JSON.stringify(PROFIL[k]);
const BAZA = textProfil("SITE_URL");
/** Originea aplicatiei 3s.com.ro (asezarea ro), din profilul ei: baza `ro-RO` din lista hreflang comuna. */
const BAZA_RO = (
  JSON.parse(
    readFileSync(join(__dirname, "..", "config", "profil-3s-com-ro.json"), "utf8"),
  ) as { SITE_URL: string }
).SITE_URL;

/** Modulele masurate, incarcate pe asezarea data (mediul ramane setat cat ruleaza blocul). */
async function incarca(asezare: "md" | "ro") {
  for (const k of [
    "SITE_URL",
    "SITE_ENV",
    "SITE_EDITII",
    "SITE_ALTERNATE",
    "OPERATOR_JSON",
    "CANALE_JSON",
  ])
    vi.stubEnv(k, textProfil(k));
  vi.stubEnv("SITE_ASEZARE", asezare === "md" ? "" : asezare);
  for (const k of [
    "NEXT_PUBLIC_SITE_EDITII",
    "NEXT_PUBLIC_SITE_ASEZARE",
    "NEXT_PUBLIC_OPERATOR_NUMIT",
    "NEXT_PUBLIC_FAMILIE_JURIDICA",
  ])
    vi.stubEnv(k, "");
  vi.resetModules();
  return {
    asezare: await import("../src/lib/asezare"),
    rute: await import("../src/content/rute"),
    cai: await import("../src/content/cai"),
    Tinta: await import("../src/components/primitive/Tinta"),
    metadata: await import("../src/components/seo/metadata"),
    JsonLd: await import("../src/components/seo/JsonLd"),
    JsonLdPeCale: (await import("../src/components/seo/JsonLdPeCale")).default,
    dateStructurate: await import("../src/components/seo/date-structurate"),
    sitemap: (await import("../src/app/sitemap")).default,
    llms: await import("../src/lib/llms"),
    paleta: await import("../src/components/global/paleta"),
    PaletaCautare: await import("../src/components/global/PaletaCautare"),
    SelectorLimba: await import("../src/components/global/SelectorLimba"),
    Antet: (await import("../src/components/global/Antet")).default,
    LegaturaCanal: (await import("../src/components/canale/LegaturaCanal"))
      .default,
    BaraMobil: (await import("../src/components/canale/BaraMobil")).default,
    Subsol: (await import("../src/components/global/Subsol")).default,
    MeniuMare: (await import("../src/components/global/MeniuMare")).default,
    PanouDescarca: (await import("../src/components/global/PanouDescarca"))
      .default,
    SertarMobil: (await import("../src/components/global/SertarMobil")).default,
    Consimtamant: (await import("../src/components/consimtamant/Consimtamant"))
      .default,
    texteConsimtamant: await import("../src/components/consimtamant/texte"),
    navigatie: await import("../src/content/navigatie"),
    NegasitGlobalEn: (await import("../src/app/global-not-found.en")).default,
    navigatieEn: (await import("../src/content/navigatie-en")).navigatieEn,
    navigatieRoMd: (await import("../src/content/navigatie-ro-md"))
      .navigatieRoMd,
    acasaRoMd: await import("../src/content/ro-md/acasa"),
    contactEn: await import("../src/content/en/contact"),
    contactRoMd: await import("../src/content/ro-md/contact"),
    istoric: await import("../src/lib/istoric-git"),
  };
}
type Module = Awaited<ReturnType<typeof incarca>>;

function randeaza(e: ReactElement, cale: string | null): string {
  STARE.cale = cale;
  return renderToStaticMarkup(e);
}

/**
 * Arborele de elemente intors de o componenta (cu manipulatorii de evenimente), fara DOM: componenta e chemata ca
 * functie in timpul randarii unui invelis, deci hook-urile au dispecerul React; efectele nu ruleaza pe server.
 */
function arbore<P extends object>(
  componenta: (p: P) => ReactElement,
  props: P,
  cale: string | null,
): { html: string; radacina: ReactElement } {
  let radacina: ReactElement | null = null;
  const Invelis = () => {
    radacina = componenta(props);
    return radacina;
  };
  const html = randeaza(createElement(Invelis), cale);
  if (radacina === null) throw new Error("componenta nu a fost randata");
  return { html, radacina };
}

/** Toate elementele din arbore (copiii din `props.children`, inclusiv listele), in ordinea documentului. */
function elemente(
  nod: unknown,
  acc: ReactElement<Record<string, unknown>>[] = [],
): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(nod)) {
    for (const n of nod) elemente(n, acc);
    return acc;
  }
  if (nod === null || typeof nod !== "object" || !("props" in nod)) return acc;
  const e = nod as ReactElement<Record<string, unknown>>;
  acc.push(e);
  elemente(e.props.children, acc);
  return acc;
}

/** Textul literal al unui element (copiii sir, concatenati). */
function textElement(e: ReactElement<Record<string, unknown>>): string {
  return elemente(e)
    .flatMap((x) =>
      Array.isArray(x.props.children) ? x.props.children : [x.props.children],
    )
    .filter((c): c is string => typeof c === "string")
    .join("");
}

/** Legatura cu adresa data are `aria-current="page"` (ordinea atributelor nu conteaza). */
function legaturaActiva(html: string, href: string): boolean {
  return [...html.matchAll(/<a\s[^>]*>/g)].some(
    (m) =>
      m[0].includes(' href="' + href + '"') &&
      m[0].includes('aria-current="page"'),
  );
}

function hrefuri(html: string): string[] {
  return [...html.matchAll(/\shref="([^"]*)"/g)].map((m) =>
    m[1].split("&amp;").join("&"),
  );
}

/** Proprietatile legaturii de canal (textul e fix; proba masoara numai tinta aleasa). */
function propsCanal(legatura: LegaturaPeCale): LegaturaCanalProps {
  return { legatura, canal: "whatsapp", children: "WhatsApp" };
}

const LEGATURA_CANAL = (): LegaturaPeCale => ({
  implicit: "https://wa.me/1?implicit",
  pagini: [
    { cale: "/ro/contact", prefix: false, href: "https://wa.me/1?pagina-ro" },
    { cale: "/contact", prefix: false, href: "https://wa.me/1?pagina-en" },
  ],
});

/** Adresele interne (care incep cu `/`) dintr-un HTML randat. */
function interne(html: string): string[] {
  return hrefuri(html).filter((a) => a.startsWith("/"));
}

/** Un element de meniu pe calea sursa data (fixtura; textul si iconita nu conteaza). */
function elementMeniu(href: string) {
  return {
    text: "E" + href,
    href,
    ruta: href,
    iconita: "file",
    descriere: "",
    marcajAi: false,
  };
}

/** Referintele `{"@id": x}` (obiect cu o singura cheie) si identificatorii definiti de noduri, din tot graful. */
function referinteSiNoduri(
  valoare: unknown,
  ref: Set<string>,
  def: Set<string>,
): void {
  if (Array.isArray(valoare)) {
    for (const v of valoare) referinteSiNoduri(v, ref, def);
    return;
  }
  if (valoare === null || typeof valoare !== "object") return;
  const o = valoare as Record<string, unknown>;
  const chei = Object.keys(o);
  if (chei.length === 1 && typeof o["@id"] === "string") {
    ref.add(o["@id"]);
    return;
  }
  if (typeof o["@id"] === "string") def.add(o["@id"]);
  for (const v of Object.values(o)) referinteSiNoduri(v, ref, def);
}

describe("asezarea ro (3s.com.ro): emiterea si citirea caii", () => {
  let M: Module;
  beforeAll(async () => {
    M = await incarca("ro");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("controlul incarcarii: build-ul e pe asezarea ro, cu rutele 3s.md (EN + RO-MD, cu paginile juridice)", () => {
    expect(M.asezare.asezareBuild()).toBe("ro");
    const cai = M.rute.RUTE.map((r) => r.cale);
    expect(cai).toContain("/ro/contact");
    expect(cai).toContain("/pricing");
    expect(cai).toContain("/ro/juridic/cookies");
    console.info("cai-asezate: " + M.rute.RUTE.length + " rute pe asezarea ro");
  });

  it("RUTE: `cale` ramane SURSA, `servita` e adresa domeniului; campul nu intra in serializare", () => {
    const dupaCale = new Map(
      M.rute.RUTE.map((r) => [r.cale, r.servita as string]),
    );
    expect(dupaCale.get("/")).toBe("/en");
    expect(dupaCale.get("/ro")).toBe("/");
    expect(dupaCale.get("/contact")).toBe("/en/contact");
    expect(dupaCale.get("/ro/contact")).toBe("/contact");
    expect(dupaCale.get("/pricing")).toBe("/en/pricing");
    expect(dupaCale.get("/ro/juridic/cookies")).toBe("/juridic/cookies");
    // Pe TOATE rutele (enumerate la rulare): engleza sub /en, romana fara /ro, nicio adresa servita de doua ori.
    let n = 0;
    for (const r of M.rute.RUTE) {
      const s = r.servita as string;
      if (r.editie === "en")
        expect(s === "/en" || s.startsWith("/en/"), r.cale + " -> " + s).toBe(
          true,
        );
      else
        expect(s === "/ro" || s.startsWith("/ro/"), r.cale + " -> " + s).toBe(
          false,
        );
      n++;
    }
    expect(n).toBe(M.rute.RUTE.length);
    expect(new Set(M.rute.RUTE.map((r) => r.servita)).size).toBe(
      M.rute.RUTE.length,
    );
    expect(JSON.stringify(M.rute.RUTE)).not.toContain("servita");
  });

  it("ghiduriPublicate ramane true: RUTE.cale e sursa (martor: fara rute e false)", () => {
    expect(M.acasaRoMd.ghiduriPublicate()).toBe(true);
    expect(M.acasaRoMd.ghiduriPublicate([])).toBe(false);
  });

  it("Tinta: href servit, existenta verificata pe sursa; externele si tintele lipsa neatinse", () => {
    const cai = M.cai.CAI_EXISTENTE;
    const t = (href: string, ruta: string | null = href) =>
      randeaza(
        createElement(
          M.Tinta.default,
          { legatura: { text: "x", href, ruta } } as TintaProps,
          "x",
        ),
        "/",
      );
    expect(hrefuri(t("/contact"))).toEqual(["/en/contact"]);
    expect(hrefuri(t("/ro/contact"))).toEqual(["/contact"]);
    expect(hrefuri(t("/about#limits", "/about"))).toEqual(["/en/about#limits"]);
    expect(hrefuri(t("/ro"))).toEqual(["/"]);
    expect(hrefuri(t("https://wa.me/1?x", null))).toEqual([
      "https://wa.me/1?x",
    ]);
    expect(hrefuri(t("mailto:a@b.test", null))).toEqual(["mailto:a@b.test"]);
    // O ruta inexistenta ramane inerta (nu se traduce nimic): existenta se judeca pe calea SURSA.
    const lipsa = t("/nu-exista-inca");
    expect(lipsa).toContain('data-tinta-lipsa="/nu-exista-inca"');
    expect(hrefuri(lipsa)).toEqual([]);
    expect(cai.has("/ro/contact")).toBe(true);
    // Martor pe md (acelasi modul, asezarea data explicit): identitatea.
    expect(
      hrefuri(
        renderToStaticMarkup(
          createElement(
            M.Tinta.default,
            {
              legatura: { text: "x", href: "/ro/contact", ruta: "/ro/contact" },
              asezare: "md",
            } as TintaProps,
            "x",
          ),
        ),
      ),
    ).toEqual(["/ro/contact"]);
  });

  it("martor de dubla traducere: o cale emisa de Tinta nu mai intra in caleServita (tipul, apoi garda /en)", () => {
    const { caleServita } = M.asezare;
    const emisa = M.Tinta.hrefTinta("/contact");
    expect(emisa).toBe("/en/contact");
    // @ts-expect-error - o cale SERVITA nu se traduce a doua oara (daca tipul n-o mai refuza, tsc cade pe directiva nefolosita)
    expect(() => caleServita(emisa, M.rute.RUTE)).toThrow(
      /deja o cale servita/,
    );
    // Pe `/contact` (servita a romanei), rularea nu poate deosebi: numai tipul apara.
    const emisaRo = M.Tinta.hrefTinta("/ro/contact");
    expect(emisaRo).toBe("/contact");
    // @ts-expect-error - acelasi refuz de tip, pe cazul pe care garda de rulare nu-l vede
    expect(caleServita(emisaRo, M.rute.RUTE)).toBe("/en/contact");
  });

  it("metadataPagina: canonical si og:url servite; comparatia cu tabelul de echivalente ramane pe sursa", () => {
    // Dupa felia hreflang-doua-domenii, `SITE_ALTERNATE` pe asezarea ro cere ca adresa site-ului sa fie baza `ro-RO`
    // din lista (`problemeAlternateAsezare`): cu originea 3s.md pe ro, build-ul s-ar opri. Cazul ruleaza deci cu
    // originea profilului 3s.com.ro, ca aplicatia reala; restul blocului ramane pe originea 3s.md.
    vi.stubEnv("SITE_URL", BAZA_RO);
    try {
      const date = {
        titlu: "Contact 3S pentru o arhivă digitală",
        descriere:
          "Pagina de contact a echipei 3S, cu legăturile de mesagerie și datele de contact ale domeniului.",
      };
      const ro = M.metadata.metadataPagina({
        ...date,
        cale: "/ro/contact",
        editie: "ro-MD",
        cheie: "contact",
      });
      expect(ro.alternates?.canonical).toBe("/contact");
      expect((ro.openGraph as { url?: string }).url).toBe("/contact");
      // Grupul pe variantele servite (specificatia 3s.com.ro §3): pagina insasi e `ro-RO` pe 3s.com.ro, iar `ro-MD`
      // e acelasi continut pe 3s.md, sub /ro (inainte de felie, `ro-MD` era chiar adresa de aici).
      expect(ro.alternates?.languages).toEqual({
        en: BAZA + "/contact",
        "ro-MD": BAZA + "/ro/contact",
        "ro-RO": BAZA_RO + "/contact",
        "x-default": BAZA + "/contact",
      });
      const en = M.metadata.metadataPagina({
        ...date,
        cale: "/pricing",
        editie: "en",
      });
      // I1: copia engleza de sub /en are canonical-ul spre aceeasi pagina de pe 3s.md si nicio legatura hreflang. Open
      // Graph cere in og:url adresa canonica a paginii, deci cardul social urmeaza canonical-ul: og:url e adresa de pe
      // 3s.md (nu adresa servita aici), iar imaginile stau pe originea ei (regula GEO, tests/browser/ajutor/geo.ts).
      expect(en.alternates?.canonical).toBe(BAZA + "/pricing");
      expect(en.alternates?.languages).toBeUndefined();
      expect((en.openGraph as { url?: string }).url).toBe(BAZA + "/pricing");
      expect((en.openGraph as { images?: { url: string }[] }).images?.[0]?.url).toBe(BAZA + "/opengraph-image");
      expect((en.twitter as { images?: { url: string }[] }).images?.[0]?.url).toBe(BAZA + "/twitter-image");
      // Calea servita data drept cale a paginii e refuzata de tabel: comparatia se face pe sursa.
      expect(() =>
        M.metadata.metadataPagina({
          ...date,
          cale: "/contact",
          editie: "ro-MD",
          cheie: "contact",
        }),
      ).toThrow(/tabelul de echivalente/);
      // Martorul coerentei: originea 3s.md pe asezarea ro opreste construirea (nu e baza ro-RO din lista).
      vi.stubEnv("SITE_URL", BAZA);
      expect(() =>
        M.metadata.metadataPagina({
          ...date,
          cale: "/ro/contact",
          editie: "ro-MD",
          cheie: "contact",
        }),
      ).toThrow(/SITE_ALTERNATE pe asezarea ro/);
      // Martor pe md: identitatea.
      const md = M.metadata.metadataPagina(
        { ...date, cale: "/ro/contact", editie: "ro-MD", cheie: "contact" },
        { asezare: "md" },
      );
      expect(md.alternates?.canonical).toBe("/ro/contact");
      expect((md.openGraph as { url?: string }).url).toBe("/ro/contact");
    } finally {
      vi.stubEnv("SITE_URL", BAZA);
    }
  });

  it("JsonLd: url si item servite, @id neatinse, url-ul site-ului (Organization, WebSite) neatins", () => {
    const graf = {
      "@context": "https://schema.org" as const,
      "@graph": [
        {
          "@type": "WebPage",
          "@id": BAZA + "/ro/contact#webpage",
          url: BAZA + "/ro/contact",
          isPartOf: { "@id": BAZA + "/#site" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, item: BAZA + "/" },
            { "@type": "ListItem", position: 2, item: BAZA + "/contact" },
          ],
        },
        {
          "@type": "Organization",
          "@id": BAZA + "/#organizatie",
          url: BAZA + "/",
          logo: { "@type": "ImageObject", url: BAZA + "/sigla.png" },
        },
        { "@type": "WebSite", "@id": BAZA + "/#site", url: BAZA + "/" },
        { "@type": "Thing", url: "https://exemplu.test/ro/contact" },
      ],
    };
    const iesire = M.JsonLd.adreseServite(graf)["@graph"] as Record<
      string,
      unknown
    >[];
    expect(iesire[0].url).toBe(BAZA + "/contact");
    expect(iesire[0]["@id"]).toBe(BAZA + "/ro/contact#webpage");
    // Felia 141 (observatia criticilor lui 121): adresele paginilor ENGLEZE urmeaza canonical-ul, adica domeniul englezei
    // din SITE_ALTERNATE (baza `en`, aici 3s.md) cu calea sursa, nu copia de sub `/en`. Inainte: BAZA + "/en" si
    // BAZA + "/en/contact". Pagina romaneasca de mai sus ramane la adresa servita.
    const englezei = new URL(
      textProfil("SITE_ALTERNATE")
        .split(",")
        .find((v) => v.startsWith("en="))!
        .slice(3),
    ).origin;
    expect(
      (iesire[1].itemListElement as { item: string }[]).map((i) => i.item),
    ).toEqual([englezei + "/", englezei + "/contact"]);
    expect(iesire[2].url).toBe(BAZA + "/");
    expect((iesire[2].logo as { url: string }).url).toBe(BAZA + "/sigla.png");
    expect(iesire[3].url).toBe(BAZA + "/");
    expect(iesire[4].url).toBe("https://exemplu.test/ro/contact");
    // Componenta scrie graful tradus.
    const html = renderToStaticMarkup(
      createElement(M.JsonLd.default, { date: graf }),
    );
    expect(html).toContain('"url":"' + BAZA + '/contact"');
    expect(html).not.toContain('"url":"' + BAZA + '/ro/contact"');
    // Martor pe md: acelasi obiect, neatins.
    expect(M.JsonLd.adreseServite(graf, { asezare: "md" })).toBe(graf);
  });

  it('graful JSON-LD ramane legat: fiecare {"@id": x} are nodul lui, pe ambele asezari (paginile de contact + graful site-ului)', () => {
    const graf = {
      "@context": "https://schema.org" as const,
      "@graph": [
        ...M.dateStructurate.grafSite(BAZA, "en")["@graph"],
        ...M.contactEn.pagina.jsonLd,
        ...M.contactRoMd.pagina.jsonLd,
      ],
    } as GrafJsonLd;
    for (const asezare of ["md", "ro"] as const) {
      const ref = new Set<string>();
      const def = new Set<string>();
      referinteSiNoduri(M.JsonLd.adreseServite(graf, { asezare }), ref, def);
      expect(ref.size, "controlul: graful are referinte").toBeGreaterThan(2);
      for (const id of ref) expect(def.has(id), asezare + ": " + id).toBe(true);
    }
  });

  it("harta: adresele servite, lastmod cautat dupa calea sursa; fara engleza (I1)", () => {
    const intrari = M.sitemap();
    const url = intrari.map((i) => i.url);
    expect(url).toContain(BAZA + "/contact");
    // I1 (felia hreflang-doua-domenii): paginile de sub /en au canonical-ul spre 3s.md, deci nu intra in harta asezarii
    // ro; inainte de felie harta le lista (17 din 34 pe 3s.com.ro). Controlul: rutele EN exista in manifest.
    expect(
      url.filter((u) => u === BAZA + "/en" || u.startsWith(BAZA + "/en/")),
    ).toEqual([]);
    expect(
      url.filter((u) => u === BAZA + "/ro" || u.startsWith(BAZA + "/ro/")),
    ).toEqual([]);
    const toate = M.rute.rutePentruHarta();
    const harta = toate.filter((r) => M.rute.editiaRutei(r) !== "en");
    expect(
      toate.length - harta.length,
      "controlul: harta manifestului are rute EN",
    ).toBeGreaterThan(5);
    expect(intrari).toHaveLength(harta.length);
    let cuData = 0;
    for (const r of harta) {
      const asteptat = M.istoric.dataUltimuluiCommit(
        M.istoric.surseleRutei(r.cale, undefined, M.rute.editiaRutei(r)),
      );
      const intrare = intrari.find(
        (i) => i.url === new URL(r.servita, BAZA + "/").toString(),
      );
      expect(intrare, r.cale).toBeDefined();
      expect(intrare?.lastModified ?? null, r.cale).toBe(asteptat);
      if (asteptat !== null) cuData++;
    }
    console.info(
      "cai-asezate: harta " +
        intrari.length +
        " intrari, " +
        cuData +
        " cu lastmod",
    );
  });

  it("harta, fara istorie git: lastmod se cere pentru sursele caii SURSA (istoria simulata, deci si in CI)", async () => {
    // In CI clona e superficiala si `dataUltimuluiCommit` da null peste tot: cazul de mai sus ar trece pe gol. Aici
    // istoria e simulata (o data derivata din primul fisier cerut), iar sursele raman cele reale, deci o cautare dupa
    // adresa SERVITA (care nu are fisier in arbore) lasa intrarea fara lastmod si cazul se inroseste.
    const DATA = (fisiere: string[]) =>
      fisiere.length === 0 ? null : "2026-01-01T00:00:00Z|" + fisiere[0];
    vi.doMock("../src/lib/istoric-git", async (original) => ({
      ...(await original<typeof import("../src/lib/istoric-git")>()),
      dataUltimuluiCommit: (fisiere: string[]) => DATA(fisiere),
    }));
    try {
      vi.resetModules();
      const sitemap = (await import("../src/app/sitemap")).default;
      const rute = await import("../src/content/rute");
      const { surseleRutei } = await import("../src/lib/istoric-git");
      const intrari = sitemap();
      // Pe asezarea ro harta n-are engleza (I1): se masoara rutele romanesti, iar cele EN trebuie sa lipseasca.
      const harta = rute
        .rutePentruHarta()
        .filter((r) => rute.editiaRutei(r) !== "en");
      expect(harta.length, "controlul: harta are rute").toBeGreaterThan(5);
      expect(intrari).toHaveLength(harta.length);
      let cuSursa = 0;
      for (const r of harta) {
        const surse = surseleRutei(r.cale, undefined, rute.editiaRutei(r));
        const intrare = intrari.find(
          (i) => i.url === new URL(r.servita, BAZA + "/").toString(),
        );
        expect(intrare?.lastModified ?? null, r.cale).toBe(DATA(surse));
        if (surse.length > 0) cuSursa++;
      }
      // Controlul: rutele cu fisierul paginii gasit dupa calea sursa exista (paginile juridice au o ruta dinamica,
      // pe care `surseleRutei` nu o rezolva pe nicio asezare: limita a istoriei, nu a asezarii). Pe ele, o cautare
      // dupa adresa servita ar da null si cazul de mai sus s-ar inrosi.
      expect(cuSursa, "controlul: exista rute cu sursa gasita").toBeGreaterThan(
        5,
      );
      console.info(
        "cai-asezate: harta simulata " +
          harta.length +
          " rute, " +
          cuSursa +
          " cu sursa gasita",
      );
      expect(
        harta.some((r) => r.servita !== r.cale),
        "controlul: asezarea muta adrese",
      ).toBe(true);
    } finally {
      vi.doUnmock("../src/lib/istoric-git");
      vi.resetModules();
    }
  });

  it("llms.txt (ramura EN): adresele servite, sub /en", () => {
    const text = M.llms.textLlms(BAZA, "en");
    const adrese = [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    expect(adrese.length, "controlul: textul are legaturi").toBeGreaterThan(3);
    for (const a of adrese)
      expect(a === BAZA + "/en" || a.startsWith(BAZA + "/en/"), a).toBe(true);
    expect(adrese).toContain(BAZA + "/en/pricing");
  });

  it("paleta: rezultatele pastreaza calea sursa, adresa de navigare e servita", () => {
    const { RUTE } = M.rute;
    const cai = M.cai.CAI_EXISTENTE;
    const en = M.paleta.cuCaiServite(
      M.PaletaCautare.continutPaletaContract(
        M.navigatieEn().paleta,
        "",
        cai,
        RUTE,
        [],
      ),
      RUTE,
    );
    const elementeEn = en.flatMap((g) => g.elemente);
    expect(elementeEn.length).toBeGreaterThan(0);
    for (const e of elementeEn)
      expect(
        e.servita === "/en" || e.servita.startsWith("/en/"),
        e.cale + " -> " + e.servita,
      ).toBe(true);
    const contact = M.paleta
      .cuCaiServite(
        M.PaletaCautare.continutPaletaContract(
          M.navigatieEn().paleta,
          "contact",
          cai,
          RUTE,
          [],
        ),
        RUTE,
      )
      .flatMap((g) => g.elemente)
      .find((e) => e.cale === "/contact");
    expect(contact?.servita).toBe("/en/contact");
    const ro = M.paleta
      .cuCaiServite(
        M.PaletaCautare.continutPaletaContract(
          M.navigatieRoMd().paleta,
          "",
          cai,
          RUTE,
          [],
        ),
        RUTE,
      )
      .flatMap((g) => g.elemente);
    expect(ro.length).toBeGreaterThan(0);
    for (const e of ro)
      expect(e.servita.startsWith("/ro"), e.cale + " -> " + e.servita).toBe(
        false,
      );
    expect(ro.some((e) => e.cale.startsWith("/ro"))).toBe(true);
  });

  it("PaletaCautare randata: Enter si clicul navigheaza la adresa SERVITA, calea afisata e cea servita", () => {
    const cai = M.cai.CAI_EXISTENTE;
    let inchideri = 0;
    const props = {
      cai,
      paleta: M.navigatieEn().paleta,
      onInchide: () => void inchideri++,
    };
    const { html, radacina } = arbore(M.PaletaCautare.default, props, "/en");
    const toate = elemente(radacina);
    const optiuni = toate.filter((e) => e.props.role === "option");
    expect(optiuni.length, "controlul: paleta are rezultate").toBeGreaterThan(
      1,
    );
    // Calea afisata langa fiecare rezultat: servita (engleza sub /en), niciodata calea sursa a contractului.
    const caiAfisate = optiuni.map((o) =>
      textElement(o).replace(/^.*?(\/[^\s]*)$/, "$1"),
    );
    for (const c of caiAfisate)
      expect(c === "/en" || c.startsWith("/en/"), c).toBe(true);
    expect(html).toContain(">/en/contact</span>");
    // Clic pe rezultatul "Contact" din contractul EN (sursa `/contact`).
    const contact = optiuni.find((o) => textElement(o).startsWith("Contact"));
    expect(contact, "controlul: rezultatul Contact exista").toBeDefined();
    STARE.impinse = [];
    (contact?.props.onClick as () => void)();
    expect(STARE.impinse).toEqual(["/en/contact"]);
    // Enter pe campul de cautare: deschide primul rezultat, la adresa lui servita (diferita de sursa, deci masurabil).
    const camp = toate.find((e) => e.props.role === "combobox");
    const primul = M.paleta
      .cuCaiServite(
        M.PaletaCautare.continutPaletaContract(
          props.paleta,
          "",
          cai,
          M.rute.RUTE,
          [],
        ),
        M.rute.RUTE,
      )
      .flatMap((g) => g.elemente)[0];
    expect(primul.servita).not.toBe(primul.cale);
    STARE.impinse = [];
    (
      camp?.props.onKeyDown as (e: {
        key: string;
        preventDefault: () => void;
      }) => void
    )({ key: "Enter", preventDefault: () => undefined });
    expect(STARE.impinse).toEqual([primul.servita]);
    expect(inchideri).toBe(2);
  });

  it("pagina de negasit: legaturile EN sub /en, legatura spre romana la radacina, cu hreflang ro-RO", async () => {
    // Exportul implicit alege editia dupa calea ceruta (antetul pus de middleware, citit cu `headers()`, care in afara
    // unei cereri Next arunca), deci se randeaza direct pagina englezeasca; pe asezarea `ro` alegerea da engleza numai
    // sub `/en` (simetricul lui `/ro` de pe 3s.md).
    const P = await import("../src/app/global-not-found.en");
    expect(
      ["/en", "/en/x", "/en/legal/x", "/english", "/x", "/x/en/y", "/ro/x", null].map((c) => P.editiaPaginiiNegasite(c, "ro", ["en", "ro-MD"])),
    ).toEqual(["en", "en", "en", "ro-MD", "ro-MD", "ro-MD", "ro-MD", "ro-MD"]);
    expect(typeof M.NegasitGlobalEn).toBe("function");
    const html = randeaza(createElement(P.PaginaNegasitEn), "/nu-exista");
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    const adrese = hrefuri(main);
    expect(adrese.length).toBeGreaterThan(1);
    expect(adrese).toContain("/");
    expect(
      adrese
        .filter((a) => a !== "/")
        .every((a) => a === "/en" || a.startsWith("/en/")),
    ).toBe(true);
    expect(main).toContain('hrefLang="ro-RO"');
  });

  it("useCaleSursa: /contact -> /ro/contact, /en/contact -> /contact; null ramane null", () => {
    const { useCaleSursa } = M.asezare;
    const { RUTE } = M.rute;
    expect(useCaleSursa(RUTE, () => "/contact")).toBe("/ro/contact");
    expect(useCaleSursa(RUTE, () => "/en/contact")).toBe("/contact");
    expect(useCaleSursa(RUTE, () => "/")).toBe("/ro");
    expect(useCaleSursa(RUTE, () => "/en")).toBe("/");
    expect(useCaleSursa(RUTE, () => null)).toBeNull();
    expect(useCaleSursa(RUTE, () => "/contact", "md")).toBe("/contact");
  });

  it("SelectorLimba: bifa dupa calea sursa, optiunile spre adresele servite (niciodata /ro)", () => {
    const limbi = M.navigatieEn().limbi;
    const cai = M.cai.CAI_EXISTENTE;
    const peContact = M.SelectorLimba.optiuniSelector(
      limbi,
      "/ro/contact",
      cai,
    );
    expect(peContact.activa?.cod).toBe("RO");
    expect(peContact.limbi.map((l) => [l.cod, l.href])).toEqual([
      ["EN", "/en/contact"],
      ["RO", "/contact"],
    ]);
    // Randat: pe /contact (romana, servita) butonul arata RO; pe /en/contact arata EN.
    const sel = (cale: string) =>
      randeaza(
        createElement(M.SelectorLimba.default, {
          cai,
          limbi,
          eticheta: "Limba",
        }),
        cale,
      );
    expect(sel("/contact")).toContain('aria-label="Limba: Română"');
    expect(sel("/en/contact")).toContain('aria-label="Limba: English"');
  });

  it("LegaturaCanal si BaraMobil: tinta paginii alese dupa calea sursa", () => {
    const legatura = LEGATURA_CANAL();
    const canal = (cale: string) =>
      hrefuri(
        randeaza(createElement(M.LegaturaCanal, propsCanal(legatura)), cale),
      );
    expect(canal("/contact")).toEqual(["https://wa.me/1?pagina-ro"]);
    expect(canal("/en/contact")).toEqual(["https://wa.me/1?pagina-en"]);
    const bara = (cale: string) =>
      hrefuri(
        randeaza(
          createElement(M.BaraMobil, {
            bara: {
              eticheta: "Contact",
              whatsapp: { text: "WhatsApp", legatura },
            },
          }),
          cale,
        ),
      );
    expect(bara("/contact")).toEqual(["https://wa.me/1?pagina-ro"]);
    expect(bara("/en/contact")).toEqual(["https://wa.me/1?pagina-en"]);
  });

  it("Antet: starea activa pe /en/pricing si adresele scrise de antet servite", () => {
    const html = randeaza(
      createElement(M.Antet, {
        navigatie: M.navigatieEn(),
        cai: M.cai.CAI_EXISTENTE,
      }),
      "/en/pricing",
    );
    const header = html.slice(
      html.indexOf("<header"),
      html.indexOf("</header>"),
    );
    expect(legaturaActiva(header, "/en/pricing")).toBe(true);
    expect(legaturaActiva(header, "/pricing")).toBe(false);
    const adrese = hrefuri(header).filter((a) => a.startsWith("/"));
    expect(adrese.length).toBeGreaterThan(1);
    for (const a of adrese)
      expect(a === "/en" || a.startsWith("/en/"), a).toBe(true);
  });

  it("Subsol: coloanele si sigla servite sub /en, legatura locala spre romana servita, cu hrefLang ro-RO", () => {
    const navigatie = M.navigatieEn();
    const html = randeaza(
      createElement(M.Subsol, { navigatie, cai: M.cai.CAI_EXISTENTE }),
      "/en/pricing",
    );
    expect(navigatie.subsol.legaturaLocala?.href).toBe(
      "/ro/juridic/informatii-legale",
    );
    const adrese = interne(html);
    console.info(
      "cai-asezate: subsolul EN pe ro are " + adrese.length + " adrese interne",
    );
    expect(adrese.length).toBeGreaterThan(10);
    expect(adrese).toContain("/juridic/informatii-legale");
    expect(adrese).not.toContain("/ro/juridic/informatii-legale");
    for (const a of adrese.filter((x) => x !== "/juridic/informatii-legale"))
      expect(a === "/en" || a.startsWith("/en/"), a).toBe(true);
    expect(html).toContain('hrefLang="ro-RO"');
    expect(html).not.toContain('hrefLang="ro-MD"');
  });

  it("legaturaLocalaServita: href servit, hrefLang pe limba servita, lang neatins; codurile neasezate raman", () => {
    const l = {
      text: "x",
      href: "/ro/contact",
      ruta: "/ro/contact",
      lang: "ro",
      hrefLang: "ro-MD",
    };
    expect(M.navigatie.legaturaLocalaServita(l, M.rute.RUTE)).toEqual({
      ...l,
      href: "/contact",
      hrefLang: "ro-RO",
    });
    expect(
      M.navigatie.legaturaLocalaServita(
        { ...l, href: "/pricing", hrefLang: "en" },
        M.rute.RUTE,
      ),
    ).toEqual({ ...l, href: "/en/pricing", hrefLang: "en" });
    expect(M.asezare.hrefLangServit("ro-RO")).toBe("ro-RO");
    expect(M.asezare.hrefLangServit("de")).toBe("de");
    expect(
      M.navigatie.legaturaLocalaServita({ ...l, href: null }, M.rute.RUTE).href,
    ).toBeNull();
  });

  it("MeniuMare: elementul curent ales pe sursa, adresele (lider, elemente, subsolul foii) servite", () => {
    const html = randeaza(
      createElement(M.MeniuMare, {
        id: "m",
        foi: [
          {
            cheie: "F",
            foaie: {
              eticheta: "F",
              lider: elementMeniu("/ro/contact"),
              elemente: [elementMeniu("/pricing"), elementMeniu("/")],
              subsol: { text: "Tot", href: "/ro", ruta: "/ro" },
            },
          },
        ],
        activa: "F",
        cale: "/pricing",
      }),
      "/en/pricing",
    );
    expect(interne(html)).toEqual(["/contact", "/en/pricing", "/en", "/"]);
    expect(legaturaActiva(html, "/en/pricing")).toBe(true);
  });

  it("PanouDescarca: adresele interne servite, cele externe neatinse", () => {
    const html = randeaza(
      createElement(M.PanouDescarca, {
        id: "d",
        grupuri: [
          {
            titlu: "G",
            elemente: [
              { ...elementMeniu("/ro/contact"), platforma: "web" },
              { ...elementMeniu("https://exemplu.test/x"), platforma: "web" },
            ],
          },
        ],
        detectata: null,
      }),
      "/en",
    );
    expect(hrefuri(html)).toEqual(["/contact", "https://exemplu.test/x"]);
  });

  it("SertarMobil: sigla, legaturile, starea curenta pe sursa si Autentificare servite", () => {
    const html = randeaza(
      createElement(M.SertarMobil, {
        cai: M.cai.CAI_EXISTENTE,
        cale: "/pricing",
        foi: {},
        grupuriDescarca: [],
        navigatie: M.navigatieEn(),
        onInchide: () => undefined,
      }),
      "/en/pricing",
    );
    const adrese = interne(html);
    expect(adrese.length).toBeGreaterThan(1);
    for (const a of adrese)
      expect(a === "/en" || a.startsWith("/en/"), a).toBe(true);
    expect(legaturaActiva(html, "/en/pricing")).toBe(true);
  });

  it("Consimtamant: legaturile spre politici servite (romana la radacina, engleza sub /en)", () => {
    const banner = (cookie: string, confidentialitate: string) =>
      hrefuri(
        randeaza(
          createElement(M.Consimtamant, {
            idGa4: null,
            umami: { idSite: "u" },
            versiune: "v",
            legaturi: { cookie, confidentialitate },
            informare: M.texteConsimtamant.informareConsimtamant("ro", {
              ga4: false,
              umami: true,
            }),
          }),
          "/",
        ),
      );
    const ro = banner("/ro/juridic/cookies", "/ro/juridic/informatii-legale");
    expect(ro).toContain("/juridic/cookies");
    expect(ro).toContain("/juridic/informatii-legale");
    expect(ro.filter((a) => a.startsWith("/ro"))).toEqual([]);
    const en = banner("/legal/legal-information", "/legal/legal-information");
    expect(en).toContain("/en/legal/legal-information");
  });

  it("emiterile din piesele globale: fiecare href={...} trece prin traducere sau e o exceptie numita", () => {
    const rezultat = emiteri();
    console.info(
      "cai-asezate: emiteri gasite " +
        rezultat.gasite +
        ", acoperite " +
        rezultat.acoperite +
        ", exceptii numite " +
        rezultat.exceptii,
    );
    expect(rezultat.neacoperite).toEqual([]);
    expect(rezultat.gasite).toBe(rezultat.acoperite + rezultat.exceptii);
    // Martorul scanerului: o emitere fabricata pe calea sursa e prinsa.
    const fabricata = "<Link " + "href={l." + "href} />";
    expect(emiteriDinText("F.tsx", fabricata).neacoperite).toEqual([
      "F.tsx: <Link> l.href",
    ]);
  });

  it("JsonLdPeCale: blocul apare pe calea sursa ceruta, servita la alta adresa", () => {
    const bloc = (cale: string | null) =>
      randeaza(
        createElement(M.JsonLdPeCale, { cale: "/ro", json: "{}" }),
        cale,
      );
    expect(bloc("/")).toContain("application/ld+json");
    expect(bloc("/en")).toBe("");
    expect(bloc(null)).toBe("");
  });
});

describe("asezarea md (3s.md): identitatea in fiecare punct", () => {
  let M: Module;
  beforeAll(async () => {
    M = await incarca("md");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("RUTE.servita = RUTE.cale pe toate rutele; harta, llms si antetul au caile manifestului", () => {
    expect(M.asezare.asezareBuild()).toBe("md");
    for (const r of M.rute.RUTE) expect(r.servita, r.cale).toBe(r.cale);
    const url = M.sitemap().map((i) => i.url);
    expect(url).toContain(BAZA + "/ro/contact");
    expect(url).toContain(BAZA + "/contact");
    expect(M.llms.textLlms(BAZA, "en")).toContain("](" + BAZA + "/pricing)");
    const header = randeaza(
      createElement(M.Antet, {
        navigatie: M.navigatieEn(),
        cai: M.cai.CAI_EXISTENTE,
      }),
      "/pricing",
    );
    expect(legaturaActiva(header, "/pricing")).toBe(true);
  });

  it("piesele globale pe md: subsolul si meniul scriu caile sursa, hrefLang ro-MD", () => {
    const subsol = randeaza(
      createElement(M.Subsol, {
        navigatie: M.navigatieEn(),
        cai: M.cai.CAI_EXISTENTE,
      }),
      "/pricing",
    );
    expect(interne(subsol)).toContain("/ro/juridic/informatii-legale");
    expect(subsol).toContain('hrefLang="ro-MD"');
    expect(
      interne(subsol).some((a) => a === "/en" || a.startsWith("/en/")),
    ).toBe(false);
    const meniu = randeaza(
      createElement(M.MeniuMare, {
        id: "m",
        foi: [
          {
            cheie: "F",
            foaie: {
              eticheta: "F",
              lider: elementMeniu("/ro/contact"),
              elemente: [elementMeniu("/pricing")],
              subsol: { text: "Tot", href: "/ro", ruta: "/ro" },
            },
          },
        ],
        activa: "F",
        cale: "/pricing",
      }),
      "/pricing",
    );
    expect(interne(meniu)).toEqual(["/ro/contact", "/pricing", "/ro"]);
    expect(M.asezare.hrefLangServit("ro-MD")).toBe("ro-MD");
    expect(M.asezare.hrefLangServit("en")).toBe("en");
  });

  it("cititorii: calea din bara e chiar sursa", () => {
    const legatura = LEGATURA_CANAL();
    expect(
      hrefuri(
        randeaza(
          createElement(M.LegaturaCanal, propsCanal(legatura)),
          "/contact",
        ),
      ),
    ).toEqual(["https://wa.me/1?pagina-en"]);
    expect(
      hrefuri(
        randeaza(
          createElement(M.LegaturaCanal, propsCanal(legatura)),
          "/ro/contact",
        ),
      ),
    ).toEqual(["https://wa.me/1?pagina-ro"]);
    const sel = M.SelectorLimba.optiuniSelector(
      M.navigatieEn().limbi,
      "/ro/contact",
      M.cai.CAI_EXISTENTE,
    );
    expect(sel.limbi.map((l) => l.href)).toEqual(["/contact", "/ro/contact"]);
    expect(
      randeaza(
        createElement(M.JsonLdPeCale, { cale: "/ro", json: "{}" }),
        "/ro",
      ),
    ).toContain("application/ld+json");
  });
});

// ------------------------------------------------------------------ scanerul emiterilor

/** Fisierele pieselor globale care scriu legaturi (citite din director), plus bannerul de consimtamant. */
const RADACINA_SRC = join(__dirname, "..", "src", "components");
function fisiereEmitere(): string[] {
  const globale = readdirSync(join(RADACINA_SRC, "global"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join("global", f));
  return [...globale, join("consimtamant", "Consimtamant.tsx")];
}

/** Expresiile care traduc la emitere. */
const TRADUSE = [/^hrefTinta\(/, /^hrefAntet\(/];
/**
 * Exceptiile, fiecare cu motivul: adresa e deja SERVITA (calculata de `optiuniSelector` sau de
 * `legaturaLocalaServita`), sau e EXTERNA (posta, retele, ramura `esteExterna`), pe care asezarea nu o alege.
 */
const EXCEPTII: Readonly<Record<string, string>> = {
  ["SelectorLimba.tsx: <Link> l.href ?? " + '"/"']: "servita de optiuniSelector",
  ["Subsol.tsx: <Link> locala.href ?? " + '"/"']:
    "servita de legaturaLocalaServita",
  "Subsol.tsx: <a> href": "ramura esteExterna (mailto, https)",
  "Subsol.tsx: <a> posta.href ?? undefined": "posta (mailto)",
  "Subsol.tsx: <a> r.href ?? undefined": "retele sociale (https)",
  "Consimtamant.tsx: <Politica> legaturi.cookie":
    "proprietate a lui Politica, care traduce",
  "Consimtamant.tsx: <Politica> legaturi.confidentialitate":
    "proprietate a lui Politica, care traduce",
};

function emiteriDinText(
  nume: string,
  text: string,
): {
  gasite: number;
  acoperite: number;
  exceptii: number;
  neacoperite: string[];
} {
  let gasite = 0;
  let acoperite = 0;
  let exceptii = 0;
  const neacoperite: string[] = [];
  for (const m of text.matchAll(/\bhref=\{/g)) {
    // Expresia dintre acolade, cu acoladele imbricate numarate.
    let adancime = 1;
    let i = (m.index ?? 0) + m[0].length;
    const start = i;
    while (i < text.length && adancime > 0) {
      if (text[i] === "{") adancime++;
      if (text[i] === "}") adancime--;
      i++;
    }
    const expresie = text.slice(start, i - 1).trim();
    gasite++;
    // Eticheta elementului (`a`, `Link`, `Politica`): aceeasi expresie poate fi legitima pe `<a>` (externa) si
    // gresita pe `Link`, deci cheia le deosebeste.
    const deschidere = text.lastIndexOf("<", m.index ?? 0);
    const eticheta = /^<([A-Za-z]+)/.exec(text.slice(deschidere))?.[1] ?? "?";
    const cheie = nume + ": <" + eticheta + "> " + expresie;
    if (TRADUSE.some((t) => t.test(expresie))) acoperite++;
    else if (cheie in EXCEPTII) exceptii++;
    else neacoperite.push(cheie);
  }
  return { gasite, acoperite, exceptii, neacoperite };
}

function emiteri() {
  const total = {
    gasite: 0,
    acoperite: 0,
    exceptii: 0,
    neacoperite: [] as string[],
  };
  for (const f of fisiereEmitere()) {
    const nume = f.split(/[\\/]/).pop() ?? f;
    const r = emiteriDinText(nume, readFileSync(join(RADACINA_SRC, f), "utf8"));
    total.gasite += r.gasite;
    total.acoperite += r.acoperite;
    total.exceptii += r.exceptii;
    total.neacoperite.push(...r.neacoperite);
  }
  return total;
}

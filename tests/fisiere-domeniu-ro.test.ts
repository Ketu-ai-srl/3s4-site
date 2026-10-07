import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  Children,
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// FISIERELE DOMENIULUI PE ASEZARE (`src/lib/asezare.ts`): fisierele care sunt unul singur pe domeniu (`llms.txt`,
// manifestul, `security.txt`, graful comun de date structurate) urmeaza editia de la radacina, iar pe asezarea `ro`
// (3s.com.ro) la radacina sta continutul `ro-MD`, cu limba `ro-RO` pe domeniu. Fiecare fisier se masoara pe ambele
// profiluri reale (`config/profil-3s-md.json`, `config/profil-3s-com-ro.json`): pe `ro` valoarea asteptata, pe `md`
// valoarea de dinainte (martorul ca 3s.md nu se schimba). Valorile asteptate sunt scrise de mana, din tabelul
// domeniilor (romana la radacina, engleza sub `/en`), nu calculate cu regula masurata.

vi.mock("next/navigation", async (original) => ({
  ...(await original<typeof import("next/navigation")>()),
  usePathname: () => "/",
}));

const ORIGINE_MD = "https://3s.md";
const ORIGINE_RO = "https://3s.com.ro";

type Profil = Record<string, unknown>;
const profil = (nume: string) =>
  JSON.parse(
    readFileSync(join(__dirname, "..", "config", nume), "utf8"),
  ) as Profil;
const PROFILE = {
  md: profil("profil-3s-md.json"),
  ro: profil("profil-3s-com-ro.json"),
};
const text = (p: Profil, k: string) =>
  p[k] === undefined
    ? ""
    : typeof p[k] === "string"
      ? (p[k] as string)
      : JSON.stringify(p[k]);

async function incarca(
  asezare: "md" | "ro",
  mediu: Record<string, string> = {},
) {
  const p = PROFILE[asezare];
  for (const k of [
    "SITE_URL",
    "SITE_ENV",
    "SITE_EDITII",
    "SITE_ALTERNATE",
    "SITE_ASEZARE",
    "OPERATOR_JSON",
    "CANALE_JSON",
  ])
    vi.stubEnv(k, text(p, k));
  for (const k of [
    "NEXT_PUBLIC_SITE_EDITII",
    "NEXT_PUBLIC_SITE_ASEZARE",
    "NEXT_PUBLIC_OPERATOR_NUMIT",
    "NEXT_PUBLIC_FAMILIE_JURIDICA",
  ])
    vi.stubEnv(k, "");
  for (const [k, v] of Object.entries(mediu)) vi.stubEnv(k, v);
  vi.resetModules();
  return {
    site: await import("../src/lib/site"),
    llms: await import("../src/lib/llms"),
    manifest: (await import("../src/app/manifest")).default,
    securitate: await import("../src/app/.well-known/security.txt/continut"),
    dateStructurate: await import("../src/components/seo/date-structurate"),
    DateStructurateSite: (
      await import("../src/components/seo/DateStructurateSite")
    ).default,
    JsonLdPeCale: (await import("../src/components/seo/JsonLdPeCale")).default,
    robots: await import("../src/app/robots.txt/route"),
    acasaRoMd: await import("../src/content/ro-md/acasa"),
    contactRoMd: await import("../src/content/ro-md/contact"),
  };
}
type Module = Awaited<ReturnType<typeof incarca>>;

/** Legaturile din `llms.txt`, in ordine. */
const legaturi = (t: string) =>
  [...t.matchAll(/^- \[[^\]]*\]\(([^)]+)\)/gm)].map((m) => m[1]);
/** JSON-LD-ul randat in HTML (toate blocurile). */
const blocuriJsonLd = (html: string) =>
  [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map((m) => m[1]);
/** Nodurile WebPage ale paginilor de start si de contact romanesti. */
function paginiRoMd(M: Module) {
  return [M.acasaRoMd.paginaAcasa(), M.contactRoMd.paginaContact()].map(
    (p) =>
      (p.jsonLd as Record<string, unknown>[]).find(
        (n) => n["@type"] === "WebPage",
      ) as Record<string, unknown>,
  );
}

/** Radacina depozitului si directorul paginilor editiei ro-MD. */
const RADACINA = join(__dirname, "..");
const DIR_ROMD = join(RADACINA, "src", "app", "(romd)");
/** Fisierele din `dir`, recursiv, care se termina in `sufix`. */
const fisiere = (dir: string, sufix: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? fisiere(join(dir, e.name), sufix)
      : e.name.endsWith(sufix)
        ? [join(dir, e.name)]
        : [],
  );
/** Paginile editiei ro-MD, cu calea servita pe 3s.md (fara segmentele dinamice: juridicul se masoara separat). */
const PAGINI_ROMD = fisiere(DIR_ROMD, "page.romd.tsx")
  .filter((p) => !p.includes("["))
  .map((p) => ({
    fisier: p,
    cale: "/" + relative(DIR_ROMD, p).split(sep).slice(0, -1).join("/"),
  }))
  .sort((a, b) => a.cale.localeCompare(b.cale));
/** Codul de limba al editiei, asamblat la rulare (proba nu poarta literal ce vaneaza). */
const COD_ROMD = ["ro", "MD"].join("-");
/**
 * Bugetul de timp al cazurilor care randeaza cele 10 pagini: prima randare transforma modulele paginilor (~4 s pe
 * statie, singura), iar sub suita intreaga, in paralel, trece de implicitul de 5 s. Timpul nu e ce se masoara.
 */
const TIMP_RANDARE = 60_000;

/**
 * TOT JSON-LD-ul servit de paginile editiei ro-MD: fiecare `page.romd.tsx` (in afara juridicului dinamic) randat pe
 * server cu profilul dat, blocurile `application/ld+json` din HTML, pe cale. Profilul se incarca INAINTEA importului,
 * ca asezarea sa fie cea a build-ului.
 */
async function jsonLdPaginiRoMd(asezare: "md" | "ro") {
  await incarca(asezare);
  const pe: Record<string, string[]> = {};
  for (const { fisier, cale } of PAGINI_ROMD) {
    const modul = (await import(
      /* @vite-ignore */ "../" + relative(RADACINA, fisier).split(sep).join("/")
    )) as {
      default: (p: unknown) => unknown;
    };
    const element = await modul.default({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({}),
    });
    pe[cale] = blocuriJsonLd(
      renderToStaticMarkup(element as Parameters<typeof renderToStaticMarkup>[0]),
    );
  }
  return pe;
}
/** Aparitiile unui sir JSON (cu ghilimele) in blocurile unei pagini. */
const aparitii = (blocuri: string[], sir: string) =>
  blocuri.join(" ").split('"' + sir + '"').length - 1;

/**
 * Puntile `JsonLdPeCale` din arborele lui `DateStructurateSite`, cu proprietatea `json` primita de fiecare.
 * `JsonLdPeCale` e o componenta de BROWSER: proprietatile ei intra in datele de hidratare ale FIECAREI pagini, oricare
 * ar fi calea, si cand pe server nu randeaza nimic. De aceea se masoara proprietatea, nu HTML-ul randat: pe asezarea
 * `ro` calea sursa a lui `/` e `/ro`, deci randarea cu `usePathname` = `/` iese goala ORICE ar primi puntea (proba pe
 * HTML era oarba la mutantul conditiei, `editie !== "en"`: trecea cu el, 17 din 17).
 */
function puntiPeCale(M: Module): string[] {
  const arbore = M.DateStructurateSite() as ReactElement<{
    children?: ReactNode;
  }>;
  return Children.toArray(arbore.props.children)
    .filter(
      (e): e is ReactElement<{ json: string }> =>
        isValidElement(e) && e.type === M.JsonLdPeCale,
    )
    .map((e) => e.props.json);
}

/** Profilul site-ului romanesc vechi (`ro-RO`, asezarea md): fara variabilele de domeniu, ca build-ul implicit. */
const PROFIL_RO_RO: Record<string, string> = {
  SITE_URL: "",
  SITE_EDITII: "",
  SITE_ALTERNATE: "",
  SITE_ASEZARE: "",
  OPERATOR_JSON: "",
  CANALE_JSON: "",
};

describe("profilurile masurate", () => {
  it("3s.md si 3s.com.ro au originile din tabelul domeniilor si asezarile md / ro", () => {
    expect([
      text(PROFILE.md, "SITE_URL"),
      text(PROFILE.md, "SITE_ASEZARE"),
    ]).toEqual([ORIGINE_MD, ""]);
    expect([
      text(PROFILE.ro, "SITE_URL"),
      text(PROFILE.ro, "SITE_ASEZARE"),
    ]).toEqual([ORIGINE_RO, "ro"]);
  });
});

describe("asezarea md (3s.md): fisierele domeniului, neschimbate", () => {
  let M: Module;
  beforeAll(async () => {
    M = await incarca("md");
  });
  afterAll(() => vi.unstubAllEnvs());

  it("radacina e editia en: manifest en, security.txt en, ro, graful comun en", () => {
    expect(M.site.editiaRadacinii().cod).toBe("en");
    expect(M.manifest().lang).toBe("en");
    const sec = M.securitate.textSecurity(
      ORIGINE_MD,
      new Date("2026-10-06T00:00:00Z"),
    );
    expect(sec).toContain("Preferred-Languages: en, ro\n");
    const graf = M.dateStructurate.grafSite();
    const site = graf["@graph"].find((n) => n["@type"] === "WebSite");
    expect(site?.inLanguage).toBe("en");
  });

  it("graful startului vechi nu ajunge nici in datele de hidratare: nicio punte JsonLdPeCale pe 3s.md", () => {
    expect(puntiPeCale(M)).toEqual([]);
  });

  it("martorul literalilor: exact doua `ro-MD` in nodurile WebPage ale startului si contactului", () => {
    const noduri = paginiRoMd(M);
    expect(noduri.map((n) => n.inLanguage)).toEqual(["ro-MD", "ro-MD"]);
    expect(JSON.stringify(noduri).split('"ro-MD"').length - 1).toBe(2);
  });

  it("martorul JSON-LD-ului servit: pe 3s.md fiecare pagina ro-MD poarta `ro-MD` ca inainte (17 pe 10 pagini)", async () => {
    const pe = await jsonLdPaginiRoMd("md");
    // Numaratoarea de dinainte, scrisa de mana (masurata pe arborele de baza): limba editiei ramane `ro-MD` pe 3s.md.
    const asteptat: Record<string, number> = {
      "/ro": 2,
      "/ro/comparatie-drive": 2,
      "/ro/contact": 1,
      "/ro/enterprise": 1,
      "/ro/functionalitati/cautare-ai": 0,
      "/ro/ghiduri/arhivare-e-facturi-ue": 3,
      "/ro/ghiduri/termene-pastrare-moldova": 2,
      "/ro/platforma": 2,
      "/ro/preturi": 2,
      "/ro/securitate": 2,
    };
    expect(
      Object.fromEntries(
        Object.entries(pe).map(([c, b]) => [c, aparitii(b, COD_ROMD)]),
      ),
    ).toEqual(asteptat);
    for (const b of Object.values(pe)) expect(aparitii(b, "ro-RO")).toBe(0);
  }, TIMP_RANDARE);
});

describe("asezarea ro (3s.com.ro): fisierele domeniului", () => {
  let M: Module;
  let md: string;
  beforeAll(async () => {
    md = (await incarca("md")).llms.textLlms(ORIGINE_MD);
    vi.unstubAllEnvs();
    M = await incarca("ro");
  });
  afterAll(() => vi.unstubAllEnvs());

  it("radacina e continutul ro-MD, cu limba ro pe domeniu", () => {
    expect(M.site.editiaRadacinii().cod).toBe("ro-MD");
    // Martor: acelasi profil cu asezarea md da radacina en (alegerea vine din asezare, nu din profil).
    expect(M.site.editiaRadacinii(["en", "ro-MD"], "md").cod).toBe("en");
  });

  it("manifestul: lang ro", () => {
    expect(M.manifest().lang).toBe("ro");
  });

  it("security.txt: Preferred-Languages ro, en si Canonical pe domeniu", () => {
    const sec = M.securitate.textSecurity(
      ORIGINE_RO,
      new Date("2026-10-06T00:00:00Z"),
    );
    expect(sec).toContain("Preferred-Languages: ro, en\n");
    expect(sec).toContain(
      "Canonical: " + ORIGINE_RO + "/.well-known/security.txt\n",
    );
    expect(sec).not.toContain("Policy:");
  });

  it("llms.txt: ramura EN de pe 3s.md, cu originea si adresele servite (engleza sub /en), fara text nou", () => {
    const ro = M.llms.textLlms(ORIGINE_RO);
    expect(ro).toContain("> " + M.llms.REZUMAT_EN);
    expect(ro).toContain("## Pages");
    for (const interzis of [
      "RON",
      "/blog",
      "## Pagini",
      "## Articole",
      ORIGINE_MD + "/",
    ])
      expect(ro).not.toContain(interzis);
    const peMd = legaturi(md);
    const peRo = legaturi(ro);
    expect(peMd.length).toBeGreaterThan(0);
    // Fiecare legatura 3s.md, mutata de mana: originea 3s.com.ro si calea sub /en.
    const asteptate = peMd.map((u) => {
      const cale = u.slice(ORIGINE_MD.length);
      return ORIGINE_RO + "/en" + (cale === "/" ? "" : cale);
    });
    expect(peRo).toEqual(asteptate);
    // Restul textului e acelasi, rand cu rand, dupa scoaterea adreselor.
    const faraAdrese = (t: string) => t.replace(/\]\([^)]+\)/g, "]()");
    expect(faraAdrese(ro)).toBe(faraAdrese(md));
  });

  it("robots.txt in productie: Sitemap pe domeniu", async () => {
    const M2 = await incarca("ro", { SITE_ENV: "productie" });
    const t = await M2.robots.GET().text();
    expect(t).toContain("Sitemap: " + ORIGINE_RO + "/sitemap.xml");
    expect(t).not.toContain(ORIGINE_MD);
    M = await incarca("ro");
  });

  it("graful comun: WebSite cu inLanguage ro-RO, organizatia cu textele site-ului international, fara graful startului vechi", () => {
    const graf = M.dateStructurate.grafSite();
    const site = graf["@graph"].find((n) => n["@type"] === "WebSite");
    const org = graf["@graph"].find((n) => n["@type"] === "Organization");
    expect(site?.inLanguage).toBe("ro-RO");
    expect(org?.description).toBe(M.dateStructurate.DESCRIERE_EN);
    expect(org).not.toHaveProperty("slogan");
    const html = renderToStaticMarkup(createElement(M.DateStructurateSite));
    const blocuri = blocuriJsonLd(html);
    expect(blocuri).toHaveLength(1);
    expect(blocuri[0]).toContain('"inLanguage":"ro-RO"');
    for (const interzis of ['"ro-MD"', "RON", "SoftwareApplication", "FAQPage"])
      expect(html).not.toContain(interzis);
  });

  it("graful startului vechi (RON, SoftwareApplication) nu ajunge in datele de hidratare: nicio punte JsonLdPeCale pe 3s.com.ro", () => {
    // Masurat pe proprietatea `json` a puntii (vezi `puntiPeCale`), nu pe HTML: asta ar fi trimis-o, pe fiecare pagina.
    expect(puntiPeCale(M)).toEqual([]);
  });

  it("graful comun e acelasi ca pe 3s.md, in afara originii, a limbii si a numarului de WhatsApp", async () => {
    const ro = JSON.stringify(M.dateStructurate.grafSite());
    const Mmd = await incarca("md");
    const md = JSON.stringify(Mmd.dateStructurate.grafSite());
    M = await incarca("ro");
    // Diferentele permise intre domenii (tabelul domeniilor): originea, limba romanei si numarul de WhatsApp, citit
    // din profilul fiecarui domeniu. Fiecare substitutie trebuie sa se fi aplicat (o regula fara aplicari = normalizare
    // stricata, nu identitate).
    const whatsapp = (p: Profil) =>
      (p.CANALE_JSON as { whatsapp: string }).whatsapp;
    const normalizat = (
      s: string,
      origine: string,
      limba: string,
      wa: string,
    ) => {
      for (const v of [origine, '"inLanguage":"' + limba + '"', "wa.me/" + wa])
        expect(s).toContain(v);
      return s
        .split(origine)
        .join("<ORIGINE>")
        .split('"inLanguage":"' + limba + '"')
        .join('"inLanguage":"<LIMBA>"')
        .split("wa.me/" + wa)
        .join("wa.me/<WHATSAPP>");
    };
    expect(whatsapp(PROFILE.ro)).not.toBe(whatsapp(PROFILE.md));
    expect(normalizat(ro, ORIGINE_RO, "ro-RO", whatsapp(PROFILE.ro))).toBe(
      normalizat(md, ORIGINE_MD, "en", whatsapp(PROFILE.md)),
    );
  });

  it("startul si contactul romanesc: inLanguage ro-RO, zero `ro-MD` (martorul literalilor)", () => {
    const noduri = paginiRoMd(M);
    expect(noduri.map((n) => n.inLanguage)).toEqual(["ro-RO", "ro-RO"]);
    expect(JSON.stringify(noduri)).not.toContain('"ro-MD"');
  });

  it("tot JSON-LD-ul paginilor ro-MD: zero `ro-MD`, limba ro-RO in locul fiecarei aparitii de pe 3s.md", async () => {
    const peMd = await jsonLdPaginiRoMd("md");
    const peRo = await jsonLdPaginiRoMd("ro");
    M = await incarca("ro");
    expect(Object.keys(peRo)).toEqual(Object.keys(peMd));
    expect(Object.keys(peRo).length).toBe(10);
    for (const cale of Object.keys(peRo)) {
      expect([cale, aparitii(peRo[cale], COD_ROMD)]).toEqual([cale, 0]);
      // Aceleasi blocuri, iar fiecare `ro-MD` de pe 3s.md e un `ro-RO` pe 3s.com.ro (nimic scos, nimic adaugat).
      expect([cale, peRo[cale].length]).toEqual([cale, peMd[cale].length]);
      expect([cale, aparitii(peRo[cale], "ro-RO")]).toEqual([
        cale,
        aparitii(peMd[cale], COD_ROMD),
      ]);
    }
  }, TIMP_RANDARE);

  it("sursa: niciun `inLanguage` scris literal cu codul editiei in paginile si continutul ro-MD (inclusiv juridicul)", () => {
    const literal = new RegExp("inLanguage[ ]*:[ ]*[\"']" + COD_ROMD + "[\"']");
    const surse = [
      ...fisiere(DIR_ROMD, ".tsx"),
      ...fisiere(join(RADACINA, "src", "content", "ro-md"), ".ts"),
    ];
    expect(surse.length).toBeGreaterThan(20);
    const cuLiteral = surse
      .filter((p) => literal.test(readFileSync(p, "utf8")))
      .map((p) => relative(RADACINA, p));
    expect(cuLiteral).toEqual([]);
    // Martorul regexului: prinde forma literala, asamblata aici.
    expect(literal.test("inLanguage: " + JSON.stringify(COD_ROMD) + ",")).toBe(true);
  });
});

// MARTORUL POZITIV al puntii: pe profilul `ro-RO` (site-ul romanesc vechi, radacina `ro-RO`) graful startului e chiar
// al lui, deci aceeasi masuratoare GASESTE puntea, cu RON si SoftwareApplication in `json`. Fara el, zeroul de pe 3s.md si
// de pe 3s.com.ro ar putea veni dintr-o masuratoare care nu vede nimic.
describe("martorul pozitiv: profilul ro-RO trimite graful startului prin punte", () => {
  let M: Module;
  beforeAll(async () => {
    M = await incarca("md", PROFIL_RO_RO);
  });
  afterAll(() => vi.unstubAllEnvs());

  it("puntea exista o data, cu SoftwareApplication si RON in `json`, iar pe `/` blocul ajunge si in HTML", () => {
    expect(M.site.editiaRadacinii().cod).toBe("ro-RO");
    const punti = puntiPeCale(M);
    expect(punti).toHaveLength(1);
    expect(punti[0]).toContain('"SoftwareApplication"');
    expect(punti[0]).toContain('"RON"');
    // Pe asezarea md calea sursa a lui `/` e chiar `/`: randarea o arata (deci si proba pe HTML vede puntea aici).
    const html = renderToStaticMarkup(createElement(M.DateStructurateSite));
    expect(blocuriJsonLd(html)).toHaveLength(2);
    expect(html).toContain("SoftwareApplication");
  });
});

// RUTELE `.ts` COMUNE (`/api/sanatate`, `/api/formular`, `/stamp`, `/instrumente/termene.ics`, `/indexnow.txt`): sunt
// fisiere `route.ts`, deci exista in ambele arbori si nu au geaman pe asezare. Contractul domeniului: pe 3s.com.ro
// raspund la fel ca pe 3s.md (status, antetele care descriu corpul, corpul), iar originea ar fi singura diferenta
// permisa, unde o poarta. Raspunsurile se masoara chemand rutele reale pe fiecare profil; valorile asteptate sunt
// scrise de mana, iar comparatia md / ro e separata de ele.
describe("rutele .ts comune: acelasi raspuns pe 3s.md si pe 3s.com.ro", () => {
  type Raspuns = {
    status: number;
    antete: Record<string, string | null>;
    corp: string;
  };
  const ANTETE = ["content-type", "cache-control", "content-disposition"];
  async function citeste(r: Response): Promise<Raspuns> {
    return {
      status: r.status,
      antete: Object.fromEntries(ANTETE.map((a) => [a, r.headers.get(a)])),
      corp: await r.text(),
    };
  }
  async function rute(
    asezare: "md" | "ro",
    mediu: Record<string, string> = {},
  ) {
    await incarca(asezare, { INDEXNOW_KEY: "", ...mediu });
    const sanatate = await import("../src/app/api/sanatate/route");
    const formular = await import("../src/app/api/formular/route");
    const stamp = await import("../src/app/stamp/route");
    const termene = await import("../src/app/instrumente/termene.ics/route");
    const indexnow = await import("../src/app/indexnow.txt/route");
    const origine = text(PROFILE[asezare], "SITE_URL");
    const cerereFormular = new Request(origine + "/api/formular", {
      method: "POST",
      headers: { "content-type": "application/json", origin: origine },
      body: JSON.stringify({ nume: "x" }),
    });
    const r: Record<string, Raspuns> = {
      "/api/sanatate": await citeste(sanatate.GET()),
      "/api/formular": await citeste(await formular.POST(cerereFormular)),
      "/stamp": await citeste(stamp.GET()),
      "/instrumente/termene.ics": await citeste(termene.GET()),
      "/indexnow.txt": await citeste(indexnow.GET()),
    };
    vi.unstubAllEnvs();
    return { r, origine };
  }
  const faraOrigine = (r: Record<string, Raspuns>, origine: string) =>
    JSON.parse(JSON.stringify(r).split(origine).join("<ORIGINE>")) as Record<
      string,
      Raspuns
    >;

  let md: Awaited<ReturnType<typeof rute>>;
  let ro: Awaited<ReturnType<typeof rute>>;
  beforeAll(async () => {
    md = await rute("md");
    ro = await rute("ro");
  });
  afterAll(() => vi.unstubAllEnvs());

  it("raspunsurile asteptate pe 3s.com.ro (valori scrise de mana)", () => {
    const marcaj = (
      JSON.parse(
        readFileSync(
          join(__dirname, "..", "src", "content", "_stamp.json"),
          "utf8",
        ),
      ) as { marcaj: string }
    ).marcaj;
    expect(marcaj.length).toBeGreaterThan(0);
    const r = ro.r;
    expect([
      r["/api/sanatate"].status,
      JSON.parse(r["/api/sanatate"].corp),
    ]).toEqual([200, { stare: "ok" }]);
    expect(r["/api/sanatate"].antete["cache-control"]).toBe(
      "no-store, max-age=0",
    );
    // Decizia 3: fara formulare pe site-ul international, deci nici pe 3s.com.ro.
    expect([
      r["/api/formular"].status,
      JSON.parse(r["/api/formular"].corp),
    ]).toEqual([404, { stare: "inexistent" }]);
    expect([r["/stamp"].status, r["/stamp"].corp]).toEqual([200, marcaj]);
    expect(r["/stamp"].antete["content-type"]).toBe(
      "text/plain; charset=utf-8",
    );
    // Calendarul e al editiei ro-RO, care nu e in build-ul 3s.com.ro (editiile en si ro-MD).
    expect([
      r["/instrumente/termene.ics"].status,
      r["/instrumente/termene.ics"].corp,
    ]).toEqual([404, "Not Found"]);
    expect([r["/indexnow.txt"].status, r["/indexnow.txt"].corp]).toEqual([
      404,
      "Not Found",
    ]);
  });

  it("acelasi raspuns ca pe 3s.md, ruta cu ruta, dupa scoaterea originii", () => {
    expect(Object.keys(ro.r)).toEqual(Object.keys(md.r));
    for (const cale of Object.keys(md.r))
      expect([cale, faraOrigine(ro.r, ro.origine)[cale]]).toEqual([
        cale,
        faraOrigine(md.r, md.origine)[cale],
      ]);
  });

  it("martorii: rutele citesc mediul la chemare (un 404 egal pe ambele domenii nu e un raspuns fix)", async () => {
    // Calendarul: chemat singur (asezarea ro refuza editia ro-RO la incarcarea rutelor), cu ro-RO in build.
    vi.stubEnv("SITE_EDITII", "ro-RO");
    vi.stubEnv("NEXT_PUBLIC_SITE_EDITII", "");
    vi.resetModules();
    const cal = await citeste(
      (await import("../src/app/instrumente/termene.ics/route")).GET(),
    );
    vi.unstubAllEnvs();
    expect([cal.status, cal.antete["content-type"]]).toEqual([
      200,
      "text/calendar; charset=utf-8",
    ]);
    const cuCheie = await rute("ro", {
      INDEXNOW_KEY: ["cheie", "martor", "120"].join("-"),
    });
    expect([
      cuCheie.r["/indexnow.txt"].status,
      cuCheie.r["/indexnow.txt"].corp,
    ]).toEqual([200, "cheie-martor-120"]);
    const cuFormulare = await rute("ro", {
      CANALE_JSON: JSON.stringify({
        ...(PROFILE.ro.CANALE_JSON as object),
        formulare: true,
      }),
    });
    expect(cuFormulare.r["/api/formular"].status).not.toBe(404);
  });
});

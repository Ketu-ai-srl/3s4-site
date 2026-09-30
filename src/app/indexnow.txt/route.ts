import { cheieIndexNow } from "./cheie";

// `/indexnow.txt`: fisierul-cheie al protocolului IndexNow (https://www.indexnow.org/documentation),
// prin care Bing, Yandex si celelalte motoare care il folosesc verifica ca domeniul e al celui care
// trimite adresele. Intoarce cheia din `INDEXNOW_KEY` ca text simplu, fara nimic altceva; fara cheie,
// 404, ca orice adresa fara pagina. Regula cheii si motivele: `./cheie.ts`. Trimiterea adreselor o face
// `scripts/indexnow.mjs`, numai la comanda: nimic din site nu trimite singur.
//
// Static, ca `robots.txt` si `/llms.txt`: cheia se citeste la CONSTRUIRE, deci o cheie noua cere build nou.

export const dynamic = "force-static";

export function GET() {
  const cheie = cheieIndexNow();
  if (cheie === null) {
    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new Response(cheie, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

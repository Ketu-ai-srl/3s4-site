import { indexareaEstePermisa } from "@/content/rute";
import { textRobots } from "@/lib/roboti";
import { adresaSite } from "@/lib/site";

// `robots.txt`, scris ca manipulator de ruta si nu cu `MetadataRoute.Robots`: forma aceea nu stie
// de linia `Content-Signal` (planul valului S4, §8.3), iar a o strecura printr-un camp al ei ar fi
// un artificiu care se rupe la prima schimbare de format. Textul il compune `src/lib/roboti.ts`.
//
// Implicitul e NEINDEXAREA, si se deschide numai in productie (`indexareaEstePermisa`): o variabila
// uitata lasa site-ul in afara indexului, nu in el. Nu inlocuieste antetul `X-Robots-Tag: noindex`
// pus de `src/middleware.ts` pe staging, il dubleaza: fisierul asta se genereaza la construire,
// antetul la fiecare cerere, deci al doilea prinde si mediul schimbat fara build nou.

export const dynamic = "force-static";

export function GET() {
  const text = textRobots({ indexare: indexareaEstePermisa(), adresa: adresaSite() });
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

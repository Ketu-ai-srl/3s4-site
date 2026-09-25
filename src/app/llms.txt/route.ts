import { textLlms } from "@/lib/llms";
import { adresaSite } from "@/lib/site";

// `/llms.txt`: rezumatul site-ului pentru agenti, generat la construire din harta de site
// (`src/lib/llms.ts`). Pe staging e servit la fel; antetul `X-Robots-Tag: noindex` din middleware
// il tine in afara indexului, ca pe restul mediului de proba.

export const dynamic = "force-static";

export function GET() {
  return new Response(textLlms(adresaSite()), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}

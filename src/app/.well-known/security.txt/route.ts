import { adresaSite } from "@/lib/site";
import { textSecurity } from "./continut";

// `/.well-known/security.txt`, static: data de expirare se fixeaza la construire. Regula: `continut.ts`.

export const dynamic = "force-static";

export function GET() {
  return new Response(textSecurity(adresaSite(), new Date()), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

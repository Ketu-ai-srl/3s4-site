// Un bloc JSON-LD in HTML-ul SERVIT (componenta de server): crawlerele care nu executa JavaScript
// il citesc la fel ca Google. Textul trece prin `serializeaza`, deci nu poate inchide eticheta.

import { serializeaza, type GrafJsonLd } from "./date-structurate";

export default function JsonLd({ date }: { date: GrafJsonLd }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeaza(date) }} />;
}

// Iconitele paginilor de produs, din setul Lucide (licenta ISC), pe grila de 24.
//
// Harta proprie feliei, nu cea din `primitive/Iconita.tsx` (piesa inghetata a fundatiei): aici
// intra numai desenele pe care le cer platforma, integrarile si securitatea, importate pe nume,
// deci numai ele ajung in paginile care le folosesc. Numele vin din `src/content/produs/iconite.ts`.
// Desenele referintei vizuale nu se folosesc.

import {
  Archive,
  Bell,
  Clock,
  Database,
  FileOutput,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Link,
  Lock,
  MessageSquare,
  Monitor,
  PanelLeft,
  ScrollText,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TextAlignStart,
  Upload,
  type LucideIcon,
} from "lucide-react";
import type { IconitaProdus as NumeIconita } from "@/content/produs/iconite";

export const DESENE_PRODUS: Record<NumeIconita, LucideIcon> = {
  straturi: Layers,
  "scut-bifa": ShieldCheck,
  scantei: Sparkles,
  randuri: TextAlignStart,
  lupa: Search,
  balon: MessageSquare,
  clopot: Bell,
  document: FileText,
  "document-randuri": ScrollText,
  panou: PanelLeft,
  cilindru: Database,
  rotita: Settings,
  lacat: Lock,
  glob: Globe,
  scut: Shield,
  cheie: KeyRound,
  ecran: Monitor,
  server: Server,
  lant: Link,
  incarcare: Upload,
  arhiva: Archive,
  ceas: Clock,
  iesire: FileOutput,
};

export type IconitaProdusProps = {
  nume: NumeIconita;
  marime?: number;
  contur?: number;
  className?: string;
};

export default function IconitaProdus({ nume, marime = 20, contur = 2, className }: IconitaProdusProps) {
  const Desen = DESENE_PRODUS[nume];
  return (
    <Desen
      width={marime}
      height={marime}
      strokeWidth={contur}
      className={className}
      aria-hidden="true"
      focusable="false"
    />
  );
}

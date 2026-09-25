// Iconitele de linie ale site-ului: setul Lucide (licenta ISC), pe grila de 24.
//
// De ce o harta explicita si nu `icons` din pachet: harta intreaga a pachetului are peste 4000
// de iconite si ar intra in pachetul de browser al oricarei componente client care o importa.
// Aici intra numai cele numite, deci numai ele se livreaza.
//
// Numele sunt cele din contractele de continut (`src/content/navigatie.ts`, `src/content/acasa.ts`),
// in forma kebab-case a setului. Un nume necunoscut nu randeaza nimic si e prins de proba
// `tests/fundatie-start.test.ts`, care cere ca fiecare nume din contracte sa fie in harta.
//
// Desenele referintei vizuale NU se folosesc: ea isi deseneaza singura iconitele, iar setul
// deschis de aici are acelasi stil (contur 1,3-2,5, capete rotunde).

import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Bot,
  Box,
  Building,
  Building2,
  Calculator,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  CirclePlay,
  Cloud,
  Code,
  CodeXml,
  CornerDownLeft,
  Download,
  FileBadge,
  FileCheck,
  FileText,
  Globe,
  House,
  Laptop,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  MessageSquareText,
  Monitor,
  RefreshCw,
  Scale,
  ScanLine,
  Search,
  Server,
  Share2,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stamp,
  TabletSmartphone,
  Tag,
  Terminal,
  Truck,
  Users,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const HARTA_ICONITE: Record<string, LucideIcon> = {
  archive: Archive,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  bot: Bot,
  box: Box,
  building: Building,
  "building-2": Building2,
  calculator: Calculator,
  "chart-column": ChartColumn,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "circle-check": CircleCheck,
  "circle-play": CirclePlay,
  cloud: Cloud,
  code: Code,
  "code-xml": CodeXml,
  "corner-down-left": CornerDownLeft,
  download: Download,
  "file-badge": FileBadge,
  "file-check": FileCheck,
  "file-text": FileText,
  globe: Globe,
  house: House,
  laptop: Laptop,
  lock: Lock,
  mail: Mail,
  menu: Menu,
  "message-circle": MessageCircle,
  "message-square-text": MessageSquareText,
  monitor: Monitor,
  "refresh-cw": RefreshCw,
  scale: Scale,
  "scan-line": ScanLine,
  search: Search,
  server: Server,
  "share-2": Share2,
  shield: Shield,
  "shield-check": ShieldCheck,
  smartphone: Smartphone,
  sparkles: Sparkles,
  stamp: Stamp,
  "tablet-smartphone": TabletSmartphone,
  tag: Tag,
  terminal: Terminal,
  truck: Truck,
  users: Users,
  workflow: Workflow,
  x: X,
  zap: Zap,
};

export type IconitaProps = {
  nume: string;
  /** Latura, in px. */
  marime?: number;
  /** Grosimea conturului, in unitati de grila (24). */
  contur?: number;
  className?: string;
  /** Eticheta accesibila. Fara ea iconita e decorativa (`aria-hidden`). */
  eticheta?: string;
};

export default function Iconita({ nume, marime = 16, contur = 1.75, className, eticheta }: IconitaProps) {
  const Componenta = HARTA_ICONITE[nume];
  if (!Componenta) {
    return null;
  }
  return (
    <Componenta
      width={marime}
      height={marime}
      strokeWidth={contur}
      className={className}
      aria-hidden={eticheta ? undefined : true}
      aria-label={eticheta}
      role={eticheta ? "img" : undefined}
      focusable="false"
    />
  );
}

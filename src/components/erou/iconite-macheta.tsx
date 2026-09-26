// Iconitele machetei din erou: setul Lucide (licenta ISC), importate nominal, ca pachetul lenes al
// machetei sa le duca numai pe ele. Harta comuna a site-ului (`primitive/Iconita.tsx`) nu se atinge
// din felia asta, iar macheta nu se incarca decat la clic, deci nu ingroasa pachetul paginii.

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Download,
  FilePenLine,
  Folder,
  House,
  Inbox,
  Lock,
  Mail,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Truck,
  Users,
  Zap,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";

export const ICONITE_MACHETA = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  bell: Bell,
  "building-2": Building2,
  calculator: Calculator,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "circle-check": CircleCheck,
  download: Download,
  "file-pen-line": FilePenLine,
  folder: Folder,
  house: House,
  inbox: Inbox,
  lock: Lock,
  mail: Mail,
  "message-circle": MessageCircle,
  paperclip: Paperclip,
  plus: Plus,
  search: Search,
  truck: Truck,
  users: Users,
  zap: Zap,
  "zoom-in": ZoomIn,
} satisfies Record<string, LucideIcon>;

export type NumeIconitaMacheta = keyof typeof ICONITE_MACHETA;

export function Ic({
  n,
  m = 16,
  c = 1.8,
  className,
}: {
  n: NumeIconitaMacheta;
  /** Latura, in px. */
  m?: number;
  /** Grosimea conturului, in unitati de grila (24). */
  c?: number;
  className?: string;
}) {
  const Componenta = ICONITE_MACHETA[n];
  return <Componenta width={m} height={m} strokeWidth={c} className={className} aria-hidden="true" focusable="false" />;
}

// Iconitele constructorului, din setul Lucide (licenta ISC), importate pe nume: numai ele intra in
// pachetul lumii. Desenele referintei nu se folosesc (acasa-constructor.md, "Active de produs").
// Toate sunt decorative (`aria-hidden`): textul de langa ele spune acelasi lucru.

import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  Code,
  File,
  FileText,
  Folder,
  Link2,
  Mail,
  MessageCircle,
  RotateCw,
  Server,
  User,
  type LucideIcon,
} from "lucide-react";
import type { CodCanal } from "@/content/acasa";
import type { IconitaActiune } from "@/content/acasa-constructor";

type Props = { marime?: number; contur?: number; className?: string };

function fa(C: LucideIcon) {
  return function IconitaDecorativa({ marime = 16, contur = 1.5, className }: Props) {
    return (
      <C
        width={marime}
        height={marime}
        strokeWidth={contur}
        className={className}
        aria-hidden="true"
        focusable="false"
      />
    );
  };
}

export const IcSageata = fa(ArrowRight);
export const IcMarca = fa(Building2);
export const IcBifa = fa(Check);
export const IcChevronJos = fa(ChevronDown);
export const IcChevron = fa(ChevronRight);
export const IcBifaCerc = fa(CircleCheck);
export const IcCod = fa(Code);
export const IcFisier = fa(File);
export const IcDosar = fa(Folder);
export const IcReluare = fa(RotateCw);
export const IcServer = fa(Server);
export const IcPosta = fa(Mail);

const ACTIUNI: Record<IconitaActiune, LucideIcon> = {
  persoana: User,
  lant: Link2,
  ceas: Clock,
  dosar: Folder,
  bifa: Check,
};

function Desen({ C, marime = 16, contur = 1.5, className }: Props & { C: LucideIcon }) {
  return (
    <C width={marime} height={marime} strokeWidth={contur} className={className} aria-hidden="true" focusable="false" />
  );
}

export function IconitaActiuneBanda({ fel, ...p }: Props & { fel: IconitaActiune }) {
  return <Desen C={ACTIUNI[fel]} {...p} />;
}

const CANALE: Record<CodCanal, LucideIcon> = {
  email: Mail,
  mesaj: MessageCircle,
  hartie: FileText,
};

/** Iconita canalului: pe jetonul din chestionar si pe insigna sursei din duel. */
export function IconitaCanal({ canal, ...p }: Props & { canal: CodCanal }) {
  return <Desen C={CANALE[canal]} {...p} />;
}

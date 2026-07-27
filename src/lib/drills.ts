import { PhoneCall, Flame, Search, Target, Handshake, MessageCircleQuestion, Ear, Gauge, ShieldAlert, Swords, type LucideIcon } from "lucide-react";
import type { ChannelCategory } from "@/lib/categories";

export interface DrillDefinition {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  channel: ChannelCategory;
  /** Grouping used on the Practice & Games page. */
  group?: "product" | "skills";
  /** Only shown when the dealership has product questions of this game type. */
  requiresProductGame?: "quiz" | "wrong_claim" | "comparison";
  /** Roleplay-derived drills only make sense when the dealership has modules. */
  requiresModules?: boolean;
  matchModule?: RegExp;

}

export const drillRegistry: DrillDefinition[] = [
  {
    id: "phone-opener",
    title: "Phone Opener Streak Drill",
    description: "First 30 seconds of an inbound call. Build your streak.",
    href: "/drills/phone-opener",
    icon: PhoneCall,
    channel: "phone",
    requiresModules: true,
  },
  {
    id: "bypass",
    title: "Bypass Streak Drill",
    description: "10 quick objections. Pick the best bypass.",
    href: "/drills/bypass",
    icon: Flame,
    channel: "showroom",
    requiresModules: true,
    matchModule: /bypass/i,
  },
  {
    id: "spot-the-mistake",
    title: "Spot the Mistake",
    description: "Read the scenario. Find what the salesperson did wrong.",
    href: "/drills/spot-the-mistake",
    icon: Search,
    channel: "showroom",
    requiresModules: true,
  },
  {
    id: "spaced-match",
    title: "S.P.A.C.E.D. Match",
    description: "Match F.A.B. statements to the right customer need.",
    href: "/drills/spaced-match",
    icon: Target,
    channel: "showroom",
    requiresModules: true,
    matchModule: /presentation|demonstration/i,
  },
  {
    id: "either-or-close",
    title: "Either/Or Close Match",
    description: "Pick the strongest either/or close for each moment.",
    href: "/drills/either-or-close",
    icon: Handshake,
    channel: "showroom",
    requiresModules: true,
    matchModule: /closing/i,
  },
  {
    id: "cric-match",
    title: "C.R.I.C. Category Match",
    description: "Budget, Decision, or Deal? Categorize the objection fast.",
    href: "/drills/cric-match",
    icon: MessageCircleQuestion,
    channel: "showroom",
    requiresModules: true,
    matchModule: /objection/i,
  },
  {
    id: "hot-button",
    title: "Hot Button Detector",
    description: "Listen to the customer. Tag the S.P.A.C.E.D. hot button.",
    href: "/drills/hot-button",
    icon: Ear,
    channel: "showroom",
    requiresModules: true,
    matchModule: /presentation|demonstration|rapport|investigate/i,
  },
  {
    id: "product-quiz",
    title: "Timed Product Quiz",
    description: "15 seconds a question. Know your product cold.",
    href: "/drills/product-quiz",
    icon: Gauge,
    channel: "showroom",
    requiresProductGame: "quiz",
  },
  {
    id: "wrong-claim",
    title: "Spot the Wrong Claim",
    description: "Three claims are true, one isn't. Find the false one fast.",
    href: "/drills/wrong-claim",
    icon: ShieldAlert,
    channel: "showroom",
    requiresProductGame: "wrong_claim",
  },
  {
    id: "comparison",
    title: "Us vs Them",
    description: "Cross-shopping customer. Pick the honest, winning answer.",
    href: "/drills/comparison",
    icon: Swords,
    channel: "showroom",
    requiresProductGame: "comparison",
  },
];

export const getDrillById = (id: string) => drillRegistry.find((d) => d.id === id);

export interface DrillConfigRow {
  drill_key: string;
  is_enabled: boolean;
  title_override: string | null;
  description_override: string | null;
  sort_order: number;
}

/** Merge the code registry with per-dealership admin config. */
export function resolveDrills(
  config: DrillConfigRow[],
  opts: { hasModules: boolean; productGames: { quiz: boolean; wrong_claim: boolean; comparison: boolean } }
): DrillDefinition[] {
  const byKey = new Map(config.map((c) => [c.drill_key, c]));
  return drillRegistry
    .filter((d) => {
      const cfg = byKey.get(d.id);
      if (cfg && !cfg.is_enabled) return false;
      if (d.requiresProductGame && !opts.productGames[d.requiresProductGame]) return false;
      if (d.requiresModules && !opts.hasModules) return false;
      return true;
    })
    .map((d) => {
      const cfg = byKey.get(d.id);
      return {
        ...d,
        title: cfg?.title_override?.trim() || d.title,
        description: cfg?.description_override?.trim() || d.description,
        sortOrder: cfg?.sort_order ?? 0,
      } as DrillDefinition & { sortOrder: number };
    })
    .sort((a, b) => ((a as any).sortOrder ?? 0) - ((b as any).sortOrder ?? 0));
}

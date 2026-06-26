import { Phone, Globe, Building2, RotateCcw, LucideIcon } from "lucide-react";

export type ChannelCategory = "phone" | "internet" | "showroom" | "followup";

export interface ChannelCategoryInfo {
  id: ChannelCategory;
  slug: ChannelCategory;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  // Tailwind tone classes for the card accent
  accent: string;
  iconBg: string;
  iconColor: string;
}

export const channelCategories: ChannelCategoryInfo[] = [
  {
    id: "phone",
    slug: "phone",
    name: "Phone",
    shortName: "Phone",
    description: "Inbound and outbound call handling — first impression, CARE framework, setting firm appointments.",
    icon: Phone,
    accent: "border-blue-500/30 hover:border-blue-500/60",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "internet",
    slug: "internet",
    name: "Internet / BDC",
    shortName: "Internet",
    description: "Email, text, and lead response — speed-to-lead, CRM templates, converting clicks into appointments.",
    icon: Globe,
    accent: "border-emerald-500/30 hover:border-emerald-500/60",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "showroom",
    slug: "showroom",
    name: "Showroom",
    shortName: "Showroom",
    description: "Meet & greet, needs analysis, demo drive, write-up and desk — the in-person sales process.",
    icon: Building2,
    accent: "border-amber-500/30 hover:border-amber-500/60",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "followup",
    slug: "followup",
    name: "Follow-up",
    shortName: "Follow-up",
    description: "Unsold, sold, service-to-sales, and long-term nurture — turning conversations into repeat business.",
    icon: RotateCcw,
    accent: "border-purple-500/30 hover:border-purple-500/60",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export const getCategoryBySlug = (slug: string | null | undefined): ChannelCategoryInfo | undefined =>
  channelCategories.find((c) => c.slug === slug);

export const isValidChannelCategory = (value: string | null | undefined): value is ChannelCategory =>
  !!value && channelCategories.some((c) => c.id === value);

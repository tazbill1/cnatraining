// Types for the Sales Performance Tracker

export interface Lead {
  id: number;
  name: string;
  source: "internet" | "phone" | "walk-in";
  status: "lead" | "appt-set" | "showed" | "sold" | "lost";
}

export interface Goals {
  sales: number;
  showRate: number;
  closeRate: number;
  internetLeads: number;
  phoneLeads: number;
  walkIns: number;
}

export interface WalkInData {
  visits: number;
  sales: number;
}

export interface UserPerformanceData {
  name: string;
  walkIn: WalkInData;
  goals: Goals;
}

export interface TeamMemberData {
  name: string;
  internet: { leads: number; apptsSet: number; shows: number; sales: number };
  phone: { leads: number; apptsSet: number; shows: number; sales: number };
  walkIn: WalkInData;
}

export interface Metrics {
  totalSales: number;
  showRate: string | number;
  closeRate: string | number;
  conversion: string | number;
  internetLeads?: number;
  phoneLeads?: number;
}

export interface PaceData {
  current: number;
  expected: number;
  projected: number;
  gap: number;
  status: "on-track" | "warning" | "behind";
}

export type TimePeriod = "mtd" | "rolling90" | "ytd";
export type LeaderboardView = "sales" | "showRate" | "closeRate" | "conversion";
export type ActiveTab = "entry" | "pipeline" | "dashboard" | "leaderboard";

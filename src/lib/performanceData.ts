// Mock data for the Sales Performance Tracker

import type { Lead, UserPerformanceData, TeamMemberData, Goals, Metrics } from "./performanceTypes";

export const initialLeads: Lead[] = [
  { id: 1, name: "Sarah Martinez", source: "internet", status: "sold" },
  { id: 2, name: "Mike Johnson", source: "phone", status: "showed" },
  { id: 3, name: "Jessica Chen", source: "internet", status: "appt-set" },
  { id: 4, name: "David Wilson", source: "phone", status: "sold" },
  { id: 5, name: "Amanda Rodriguez", source: "internet", status: "showed" },
  { id: 6, name: "Tom Anderson", source: "internet", status: "lead" },
  { id: 7, name: "Lisa Brown", source: "phone", status: "lead" },
  { id: 8, name: "Chris Taylor", source: "internet", status: "appt-set" },
  { id: 9, name: "Maria Garcia", source: "phone", status: "appt-set" },
  { id: 10, name: "Kevin White", source: "internet", status: "showed" },
];

export const initialUserData: UserPerformanceData = {
  name: "You",
  walkIn: { visits: 12, sales: 3 },
  goals: {
    sales: 15,
    showRate: 75,
    closeRate: 35,
    internetLeads: 50,
    phoneLeads: 30,
    walkIns: 25,
  },
};

export const teamData: TeamMemberData[] = [
  {
    name: "Mike Stevens",
    internet: { leads: 22, apptsSet: 18, shows: 14, sales: 7 },
    phone: { leads: 12, apptsSet: 10, shows: 8, sales: 4 },
    walkIn: { visits: 15, sales: 5 },
  },
  {
    name: "Sarah Johnson",
    internet: { leads: 18, apptsSet: 15, shows: 12, sales: 6 },
    phone: { leads: 10, apptsSet: 8, shows: 7, sales: 3 },
    walkIn: { visits: 10, sales: 4 },
  },
  {
    name: "Chris Martinez",
    internet: { leads: 12, apptsSet: 10, shows: 7, sales: 3 },
    phone: { leads: 6, apptsSet: 5, shows: 4, sales: 2 },
    walkIn: { visits: 8, sales: 2 },
  },
  {
    name: "Jessica Park",
    internet: { leads: 20, apptsSet: 16, shows: 11, sales: 5 },
    phone: { leads: 9, apptsSet: 7, shows: 6, sales: 3 },
    walkIn: { visits: 14, sales: 4 },
  },
];

export function calculateMetricsFromLeads(
  leads: Lead[],
  walkIn: { visits: number; sales: number }
): Metrics {
  const internetLeads = leads.filter((l) => l.source === "internet");
  const phoneLeads = leads.filter((l) => l.source === "phone");

  const internetApptsSet = internetLeads.filter((l) =>
    ["appt-set", "showed", "sold"].includes(l.status)
  ).length;
  const phoneApptsSet = phoneLeads.filter((l) =>
    ["appt-set", "showed", "sold"].includes(l.status)
  ).length;

  const internetShows = internetLeads.filter((l) =>
    ["showed", "sold"].includes(l.status)
  ).length;
  const phoneShows = phoneLeads.filter((l) =>
    ["showed", "sold"].includes(l.status)
  ).length;

  const internetSales = internetLeads.filter((l) => l.status === "sold").length;
  const phoneSales = phoneLeads.filter((l) => l.status === "sold").length;
  const walkInSales = walkIn.sales;

  const totalAppts = internetApptsSet + phoneApptsSet;
  const totalShows = internetShows + phoneShows;
  const totalSales = internetSales + phoneSales + walkInSales;
  const totalOpportunities =
    internetLeads.length + phoneLeads.length + walkIn.visits;
  const showableOpportunities = totalShows + walkIn.visits;

  return {
    totalSales,
    showRate:
      totalAppts > 0 ? ((totalShows / totalAppts) * 100).toFixed(1) : "0",
    closeRate:
      showableOpportunities > 0
        ? ((totalSales / showableOpportunities) * 100).toFixed(1)
        : "0",
    conversion:
      totalOpportunities > 0
        ? ((totalSales / totalOpportunities) * 100).toFixed(1)
        : "0",
    internetLeads: internetLeads.length,
    phoneLeads: phoneLeads.length,
  };
}

export function calculateTeamMemberMetrics(person: TeamMemberData): Metrics {
  const totalAppts = person.internet.apptsSet + person.phone.apptsSet;
  const totalShows = person.internet.shows + person.phone.shows;
  const totalSales =
    person.internet.sales + person.phone.sales + person.walkIn.sales;
  const totalOpportunities =
    person.internet.leads + person.phone.leads + person.walkIn.visits;
  const showableOpportunities =
    person.internet.shows + person.phone.shows + person.walkIn.visits;

  return {
    totalSales,
    showRate:
      totalAppts > 0 ? ((totalShows / totalAppts) * 100).toFixed(1) : "0",
    closeRate:
      showableOpportunities > 0
        ? ((totalSales / showableOpportunities) * 100).toFixed(1)
        : "0",
    conversion:
      totalOpportunities > 0
        ? ((totalSales / totalOpportunities) * 100).toFixed(1)
        : "0",
  };
}

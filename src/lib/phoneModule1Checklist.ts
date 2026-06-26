// Module 1 ("Stop Winging It") — beginner phone checklist.
// Intentionally minimal: focuses only on the fundamentals taught in Module 1.
// The full 18-item 6-step process is introduced in later modules.

import type { PhoneChecklistItem } from "./phoneChecklist";

export const phoneModule1Checklist: PhoneChecklistItem[] = [
  {
    id: "phone-greeting",
    label: "Professional greeting",
    description: "Greeted the caller and introduced yourself",
    keywords: ["thanks for calling", "thank you for calling", "this is", "my name is", "how can i help", "how may i help"],
    category: "opening",
  },
  {
    id: "phone-get-name",
    label: "Got customer's name",
    description: "Asked for the customer's name",
    keywords: ["who am i speaking", "your name", "may i ask your name", "what's your name", "and you are"],
    category: "opening",
  },
  {
    id: "phone-vehicle-interest",
    label: "Confirmed vehicle interest",
    description: "Identified which vehicle they're calling about",
    keywords: ["which vehicle", "what vehicle", "looking at", "interested in", "calling about", "inquiring about", "outback"],
    category: "qualify",
  },
  {
    id: "phone-one-discovery",
    label: "Asked a discovery question",
    description: "Asked at least one question about needs or usage",
    keywords: ["use it for", "primarily for", "commute", "family", "what drew you", "what attracted", "looking for", "most important", "daily driver"],
    category: "needs",
  },
  {
    id: "phone-callback-number",
    label: "Got callback number",
    description: "Confirmed the best number to reach them",
    keywords: ["best number", "reach you", "call you back", "this number", "contact you", "cell", "phone number"],
    category: "contact",
  },
  {
    id: "phone-specific-time",
    label: "Set a specific appointment",
    description: "Offered or set a specific date/time to come in",
    keywords: ["tomorrow at", "today at", "this afternoon", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "o'clock", "pm", "am", "come in at", "see you at"],
    category: "appointment",
  },
];

export const phoneModule1CategoryLabels: Record<string, string> = {
  opening: "Opening",
  qualify: "Qualify",
  needs: "Discovery",
  contact: "Contact",
  appointment: "Appointment",
};

export function analyzePhoneModule1Checklist(
  conversation: Array<{ role: string; content: string }>,
  currentState: Record<string, boolean>,
): Record<string, boolean> {
  const newState = { ...currentState };
  const allText = conversation
    .map((m) => m.content.toLowerCase())
    .join(" ");

  phoneModule1Checklist.forEach((item) => {
    if (newState[item.id]) return;
    if (item.keywords.some((k) => allText.includes(k.toLowerCase()))) {
      newState[item.id] = true;
    }
  });

  return newState;
}

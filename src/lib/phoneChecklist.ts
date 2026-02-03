// Phone Skills Checklist - Based on 6-Step Consultative Call Process

export interface PhoneChecklistItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: "opening" | "qualify" | "alternatives" | "needs" | "contact" | "availability" | "appointment";
}

// 6-Step Consultative Call Process Checklist
export const phoneChecklist: PhoneChecklistItem[] = [
  // Step 1: Opening - Get Their Name
  {
    id: "phone-greeting",
    label: "Professional greeting",
    description: "Greeted caller and introduced yourself",
    keywords: ["thanks for calling", "thank you for calling", "this is", "my name is", "how can i help", "how may i help"],
    category: "opening",
  },
  {
    id: "phone-get-name",
    label: "Got customer's name",
    description: "Asked for and used the customer's name",
    keywords: ["who am i speaking", "your name", "may i ask your name", "what's your name", "and you are"],
    category: "opening",
  },
  {
    id: "phone-use-name",
    label: "Used their name",
    description: "Addressed the customer by name during the call",
    keywords: [], // Checked dynamically based on customer name usage
    category: "opening",
  },

  // Step 2: Qualify the Lead
  {
    id: "phone-source",
    label: "Asked lead source",
    description: "Found out where they saw the vehicle (website, etc.)",
    keywords: ["see that on", "find us", "website", "where did you", "how did you hear", "online", "ad", "advertisement"],
    category: "qualify",
  },
  {
    id: "phone-location",
    label: "Asked their location",
    description: "Found out where they're calling from",
    keywords: ["where are you", "calling from", "located", "how far", "local", "area", "drive from", "distance"],
    category: "qualify",
  },
  {
    id: "phone-vehicle-interest",
    label: "Confirmed vehicle interest",
    description: "Identified which vehicle they're interested in",
    keywords: ["which vehicle", "what vehicle", "looking at", "interested in", "calling about", "inquiring about"],
    category: "qualify",
  },

  // Step 3: Set Stage for Alternatives
  {
    id: "phone-alternative-permission",
    label: "Got permission for alternatives",
    description: "Asked if they'd want to know about similar vehicles",
    keywords: ["similar vehicle", "alternative", "if we have", "comparable", "something similar", "other options", "also check", "as well"],
    category: "alternatives",
  },

  // Step 4: Ask Questions to Understand Needs
  {
    id: "phone-why-vehicle",
    label: "Asked what drew them to vehicle",
    description: "Understood why they're interested in this specific vehicle",
    keywords: ["what drew you", "what attracted", "why the", "what interests you", "what made you", "looking for in"],
    category: "needs",
  },
  {
    id: "phone-usage",
    label: "Asked about usage",
    description: "Understood how they'll use the vehicle",
    keywords: ["use it for", "primarily for", "commute", "family", "work", "daily driver", "weekend", "road trips"],
    category: "needs",
  },
  {
    id: "phone-priorities",
    label: "Identified priorities",
    description: "Understood what's most important to them",
    keywords: ["most important", "priority", "looking for", "must have", "need", "matters to you", "important to"],
    category: "needs",
  },
  {
    id: "phone-trade",
    label: "Asked about trade-in",
    description: "Inquired if they have a vehicle to trade",
    keywords: ["trade", "current vehicle", "trading in", "have a car", "driving now", "your vehicle"],
    category: "needs",
  },

  // Step 5: Get Contact Info (Tied to Value)
  {
    id: "phone-callback-number",
    label: "Confirmed callback number",
    description: "Verified best number to reach them",
    keywords: ["best number", "reach you", "call you back", "this number", "calling from", "contact you", "cell"],
    category: "contact",
  },
  {
    id: "phone-text-permission",
    label: "Asked to text",
    description: "Got permission to send text confirmation",
    keywords: ["text you", "send you a text", "text confirmation", "okay if i text", "message you"],
    category: "contact",
  },

  // Step 6: Check Availability & Deliver News
  {
    id: "phone-check-availability",
    label: "Checked availability",
    description: "Put them on brief hold to check inventory",
    keywords: ["let me check", "give me a second", "one moment", "check on that", "look that up", "in stock"],
    category: "availability",
  },
  {
    id: "phone-delivered-news",
    label: "Delivered news positively",
    description: "Shared availability with enthusiasm",
    keywords: ["great news", "good news", "we do have", "it is available", "still here", "got it"],
    category: "availability",
  },
  {
    id: "phone-offered-choice",
    label: "Offered choice (not push)",
    description: "Asked what THEY want to do next",
    keywords: ["would you like", "want to come", "prefer to", "like to", "what would you", "other information"],
    category: "availability",
  },

  // Appointment Setting
  {
    id: "phone-specific-time",
    label: "Set specific time",
    description: "Scheduled appointment with specific date/time",
    keywords: ["2:00", "3:00", "tomorrow at", "today at", "this afternoon", "saturday", "specific time", "o'clock", "pm", "am"],
    category: "appointment",
  },
  {
    id: "phone-text-confirmation",
    label: "Sent text confirmation",
    description: "Texted address and confirmation while on phone",
    keywords: ["text you", "send you", "confirmation", "address", "while we're", "on the phone", "get it"],
    category: "appointment",
  },
  {
    id: "phone-confirmed-receipt",
    label: "Confirmed they received it",
    description: "Verified they got the text confirmation",
    keywords: ["did you get", "receive", "see it", "got it", "come through"],
    category: "appointment",
  },
];

// Category labels for display
export const phoneCategoryLabels: Record<PhoneChecklistItem["category"], string> = {
  opening: "Step 1: Opening",
  qualify: "Step 2: Qualify",
  alternatives: "Step 3: Alternatives",
  needs: "Step 4: Needs Discovery",
  contact: "Step 5: Contact Info",
  availability: "Step 6: Availability",
  appointment: "Appointment Setting",
};

export function analyzePhoneChecklistFromConversation(
  conversation: Array<{ role: string; content: string }>,
  currentState: Record<string, boolean>
): Record<string, boolean> {
  const newState = { ...currentState };
  
  // Combine all salesperson messages
  const salesMessages = conversation
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  // Combine all customer responses
  const customerMessages = conversation
    .filter((msg) => msg.role === "assistant")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  const allText = salesMessages + " " + customerMessages;

  // Check each item
  phoneChecklist.forEach((item) => {
    if (!newState[item.id] && item.keywords.length > 0) {
      const hasKeyword = item.keywords.some((keyword) =>
        allText.includes(keyword.toLowerCase())
      );
      if (hasKeyword) {
        newState[item.id] = true;
      }
    }
  });

  return newState;
}

export function calculatePhoneChecklistProgress(state: Record<string, boolean>): number {
  const total = phoneChecklist.length;
  const completed = phoneChecklist.filter((item) => state[item.id]).length;
  return Math.round((completed / total) * 100);
}

export function getPhoneChecklistByCategory(category?: PhoneChecklistItem["category"]): PhoneChecklistItem[] {
  if (!category) return phoneChecklist;
  return phoneChecklist.filter((item) => item.category === category);
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category?: "rapport" | "discovery" | "vehicle" | "purchase";
}

export const cnaChecklist: ChecklistItem[] = [
  // Rapport Building
  {
    id: "customer-name",
    label: "Got customer name",
    description: "Introduced yourself and learned the customer's name",
    keywords: ["name", "call you", "who am i speaking", "my name is", "i'm", "nice to meet"],
    category: "rapport",
  },
  {
    id: "referral-source",
    label: "How did you hear about us?",
    description: "Asked how they found the dealership",
    keywords: ["hear about", "find us", "referred", "advertisement", "online", "recommendation", "friend told", "google", "website"],
    category: "rapport",
  },
  {
    id: "why-today",
    label: "What made today the day?",
    description: "Discovered the trigger that brought them in today",
    keywords: ["today", "now", "what brings you", "why now", "timing", "decided to come in", "what happened", "pushed you"],
    category: "rapport",
  },

  // Discovery - Use & Utility
  {
    id: "primary-driver",
    label: "Primary driver identified",
    description: "Determined who will be the main driver",
    keywords: ["who will", "driving", "primary driver", "mainly drive", "for yourself", "for you", "spouse", "partner", "behind the wheel"],
    category: "discovery",
  },
  {
    id: "goals-today",
    label: "Goals for today",
    description: "Product Info, Demo, Purchase Info, or Trade Appraisal",
    keywords: ["accomplish", "goal", "hoping", "looking to", "want to", "plan to", "objective", "information", "test drive", "numbers"],
    category: "discovery",
  },
  {
    id: "use-utility",
    label: "Use & utility (day-to-day)",
    description: "How they'll use the vehicle daily",
    keywords: ["use", "commute", "highway", "city", "road trip", "haul", "cargo", "passengers", "kids", "family", "work", "drive to", "miles"],
    category: "discovery",
  },
  {
    id: "fun-adventure",
    label: "Fun & adventure use",
    description: "Recreational or lifestyle uses",
    keywords: ["weekend", "vacation", "camping", "boat", "trailer", "golf", "hobbies", "fun", "adventure", "recreation", "towing"],
    category: "discovery",
  },

  // Vehicle Information
  {
    id: "current-vehicle",
    label: "Current vehicle details",
    description: "Year, make, model, mileage of current vehicle",
    keywords: ["current", "driving now", "own", "trade", "lease", "present vehicle", "what do you drive", "year", "make", "model"],
    category: "vehicle",
  },
  {
    id: "title-clear",
    label: "Title clear / payoff",
    description: "Do they own it outright or have a payoff?",
    keywords: ["title", "payoff", "owe", "paid off", "own it", "loan", "finance", "balance", "lien"],
    category: "vehicle",
  },
  {
    id: "love-dont-love",
    label: "What they love / don't love",
    description: "Likes and dislikes about current vehicle",
    keywords: ["like", "love", "hate", "dislike", "frustrat", "enjoy", "appreciate", "problem with", "issue with", "annoying"],
    category: "vehicle",
  },
  {
    id: "vehicle-type",
    label: "Vehicle type preference",
    description: "Sedan, SUV, truck, or other body style",
    keywords: ["sedan", "suv", "truck", "crossover", "van", "coupe", "convertible", "hatchback", "body style", "type of vehicle"],
    category: "vehicle",
  },
  {
    id: "new-preowned",
    label: "New vs pre-owned",
    description: "Preference for new, certified, or pre-owned",
    keywords: ["new", "used", "pre-owned", "preowned", "certified", "cpo", "brand new", "previously owned"],
    category: "vehicle",
  },

  // Priority Categories (Most Important To You)
  {
    id: "priority-safety",
    label: "Priority: Safety",
    description: "Safety features and ratings importance",
    keywords: ["safety", "safe", "airbag", "crash", "rating", "protect", "accident", "collision", "blind spot", "backup camera"],
    category: "vehicle",
  },
  {
    id: "priority-performance",
    label: "Priority: Performance",
    description: "Power, handling, acceleration importance",
    keywords: ["performance", "power", "fast", "acceleration", "handling", "horsepower", "turbo", "sport", "speed", "engine"],
    category: "vehicle",
  },
  {
    id: "priority-appearance",
    label: "Priority: Appearance",
    description: "Looks, style, color importance",
    keywords: ["appearance", "look", "style", "color", "design", "beautiful", "sharp", "sleek", "attractive", "aesthetic"],
    category: "vehicle",
  },
  {
    id: "priority-comfort",
    label: "Priority: Comfort & Convenience",
    description: "Comfort features, tech, ease of use",
    keywords: ["comfort", "convenient", "tech", "bluetooth", "carplay", "android", "seats", "heated", "cooled", "navigation", "screen"],
    category: "vehicle",
  },
  {
    id: "priority-economy",
    label: "Priority: Economy",
    description: "Fuel efficiency, cost of ownership",
    keywords: ["economy", "fuel", "gas", "mpg", "mileage", "efficient", "hybrid", "electric", "ev", "cost to run", "cheap to"],
    category: "vehicle",
  },
  {
    id: "priority-reliability",
    label: "Priority: Reliability",
    description: "Dependability and long-term ownership",
    keywords: ["reliab", "depend", "last", "durable", "warranty", "maintenance", "repairs", "break down", "trust", "long term"],
    category: "vehicle",
  },

  // Purchase Readiness
  {
    id: "must-have-nice-have",
    label: "Must-haves vs nice-to-haves",
    description: "Distinguished deal breakers from preferences",
    keywords: ["must have", "nice to have", "necessary", "optional", "deal breaker", "non-negotiable", "flexible on", "absolutely need", "can live without"],
    category: "purchase",
  },
];

export function analyzeChecklistFromConversation(
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
  cnaChecklist.forEach((item) => {
    if (!newState[item.id]) {
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

export function calculateChecklistProgress(state: Record<string, boolean>): number {
  const total = cnaChecklist.length;
  const completed = Object.values(state).filter(Boolean).length;
  return Math.round((completed / total) * 100);
}

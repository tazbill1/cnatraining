export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category?: "rapport" | "discovery" | "vehicle" | "purchase" | "contact";
}

export const cnaChecklist: ChecklistItem[] = [
  // Meet & Greet / Base Statement
  {
    id: "greeting-intro",
    label: "Greeting & name exchange",
    description: "Greeted the customer, introduced yourself, and learned their name",
    keywords: ["name", "call you", "who am i speaking", "my name is", "i'm", "nice to meet", "welcome", "hello", "hi there", "good morning", "good afternoon"],
    category: "rapport",
  },
  {
    id: "base-community",
    label: "Community connection",
    description: "Mentioned the dealership's roots in the community",
    keywords: ["community", "years", "family", "locally", "hometown", "neighborhood", "been here since", "serving", "part of"],
    category: "rapport",
  },
  {
    id: "base-mission",
    label: "Core mission",
    description: "Shared the dealership's mission or what sets you apart",
    keywords: ["mission", "believe", "philosophy", "goal", "committed", "dedicated", "pride ourselves", "what we do", "different", "about us"],
    category: "rapport",
  },
  {
    id: "base-pillars",
    label: "Pillars of ownership",
    description: "Mentioned the buying and ownership experience pillars",
    keywords: ["buying experience", "ownership experience", "pillar", "two things", "purchase experience", "after the sale", "service", "maintain", "take care of"],
    category: "rapport",
  },
  {
    id: "base-transition",
    label: "Transition to CNA",
    description: "Smoothly transitioned from intro to needs discovery",
    keywords: ["learn about", "tell me", "what brings you", "looking for", "help you find", "how can i help", "start by", "few questions"],
    category: "rapport",
  },
  {
    id: "first-visit",
    label: "First visit?",
    description: "Asked if this is their first visit to the dealership",
    keywords: ["first time", "first visit", "been here before", "visited before", "new to us", "come in before"],
    category: "rapport",
  },
  {
    id: "referral-source",
    label: "How did you hear about us?",
    description: "Asked how they found the dealership",
    keywords: ["hear about", "find us", "referred", "advertisement", "online", "recommendation", "friend told", "google", "website"],
    category: "rapport",
  },

  // Discovery - Use & Utility
  {
    id: "goals-today",
    label: "Goals for today",
    description: "Product Info, Demo, Purchase Info, or Live Market Appraisal",
    keywords: ["accomplish", "goal", "hoping", "looking to", "want to", "plan to", "objective", "information", "test drive", "numbers", "appraisal"],
    category: "discovery",
  },
  {
    id: "use-utility",
    label: "Use and utility",
    description: "How they'll use the vehicle daily",
    keywords: ["use", "commute", "highway", "city", "road trip", "haul", "cargo", "passengers", "kids", "family", "work", "drive to", "miles"],
    category: "discovery",
  },
  {
    id: "fun-adventure",
    label: "Fun & adventure",
    description: "Recreational or lifestyle uses",
    keywords: ["weekend", "vacation", "camping", "boat", "trailer", "golf", "hobbies", "fun", "adventure", "recreation", "towing"],
    category: "discovery",
  },

  // Current Vehicle
  {
    id: "current-vehicle",
    label: "Current vehicle details",
    description: "Year, make, model, trim, color, odometer",
    keywords: ["current", "driving now", "own", "trade", "lease", "present vehicle", "what do you drive", "year", "make", "model", "trim", "odometer"],
    category: "vehicle",
  },
  {
    id: "miles-per-year",
    label: "Miles per year",
    description: "How many miles they drive annually",
    keywords: ["miles per year", "annual mileage", "drive per year", "yearly miles", "how many miles", "average miles"],
    category: "vehicle",
  },
  {
    id: "title-clear",
    label: "Title clear?",
    description: "Do they own it outright or have a payoff?",
    keywords: ["title", "payoff", "owe", "paid off", "own it", "loan", "finance", "balance", "lien", "clear"],
    category: "vehicle",
  },
  {
    id: "replacing-adding",
    label: "Replacing or adding?",
    description: "Are they replacing their current vehicle or adding to the household?",
    keywords: ["replacing", "adding", "additional", "second car", "another vehicle", "keep", "trade in", "get rid of"],
    category: "vehicle",
  },

  // New Vehicle Preferences
  {
    id: "specific-research",
    label: "Specific vehicle / research",
    description: "Have they researched a specific vehicle already?",
    keywords: ["research", "looking at", "specific", "particular", "online", "read about", "reviews", "comparison", "narrowed down"],
    category: "vehicle",
  },
  {
    id: "new-preowned",
    label: "New or pre-owned/certified?",
    description: "Preference for new, certified, or pre-owned",
    keywords: ["new", "used", "pre-owned", "preowned", "certified", "cpo", "brand new", "previously owned"],
    category: "vehicle",
  },
  {
    id: "vehicle-type",
    label: "Vehicle type",
    description: "Sedan, SUV, truck, convertible, or other",
    keywords: ["sedan", "suv", "truck", "crossover", "van", "coupe", "convertible", "hatchback", "body style", "type of vehicle"],
    category: "vehicle",
  },
  {
    id: "color-preference",
    label: "Color preference",
    description: "Lighter, darker, or no preference",
    keywords: ["color", "lighter", "darker", "white", "black", "silver", "red", "blue", "gray", "grey", "neutral"],
    category: "vehicle",
  },

  // Most Important To You (Priorities)
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
    keywords: ["appearance", "look", "style", "design", "beautiful", "sharp", "sleek", "attractive", "aesthetic"],
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

  // Vehicle Recommendations
  {
    id: "vehicle-recommendations",
    label: "Vehicle recommendations (Rule of 2)",
    description: "Recommended at least 2 vehicle options based on needs",
    keywords: ["recommend", "suggest", "option", "alternative", "consider", "show you", "let me show", "two options", "few options"],
    category: "purchase",
  },

];

// Extract customer name from AI messages (the AI introduces itself with a name)
function extractCustomerName(conversation: Array<{ role: string; content: string }>): string | null {
  const namePatterns = [
    /(?:i'?m|my name is|this is|it'?s|i am|hey,?\s*i'?m|hi,?\s*i'?m)\s+([A-Z][a-z]+)/i,
    /(?:^|\.\s+)([A-Z][a-z]+)\s+here\b/i,
    /\bname'?s\s+([A-Z][a-z]+)/i,
  ];

  for (const msg of conversation) {
    if (msg.role === "assistant") {
      for (const pattern of namePatterns) {
        const match = msg.content.match(pattern);
        if (match && match[1]) {
          const name = match[1];
          const falsePositives = ["I", "The", "This", "That", "What", "How", "Hey", "Hi", "Yes", "No", "Well", "So", "Thanks", "Sure", "Great", "Good"];
          if (!falsePositives.includes(name)) {
            return name;
          }
        }
      }
    }
  }
  return null;
}

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

  // Extract the customer's actual name for enhanced name detection
  const customerName = extractCustomerName(conversation);

  // Check each item
  cnaChecklist.forEach((item) => {
    if (!newState[item.id]) {
      // Enhanced check for "customer-name": also check if they used the actual name
      if (item.id === "customer-name" && customerName && salesMessages.includes(customerName.toLowerCase())) {
        newState[item.id] = true;
        return;
      }

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

// Get checklist items by category
export function getChecklistByCategory(category: ChecklistItem["category"]): ChecklistItem[] {
  return cnaChecklist.filter((item) => item.category === category);
}

// Category labels for display
export const categoryLabels: Record<NonNullable<ChecklistItem["category"]>, string> = {
  rapport: "Rapport Building",
  discovery: "Discovery",
  vehicle: "Vehicle Information",
  purchase: "Purchase Readiness",
  contact: "Contact Information",
};

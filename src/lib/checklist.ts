export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
}

export const cnaChecklist: ChecklistItem[] = [
  {
    id: "customer-name",
    label: "Got customer name",
    description: "Introduced yourself and learned the customer's name",
    keywords: ["name", "call you", "who am i speaking", "my name is", "i'm", "nice to meet"],
  },
  {
    id: "referral-source",
    label: "Referral source",
    description: "Asked how they heard about the dealership",
    keywords: ["hear about", "find us", "referred", "advertisement", "online", "recommendation", "friend told"],
  },
  {
    id: "why-today",
    label: "What made today the day?",
    description: "Discovered why they're shopping today specifically",
    keywords: ["today", "now", "what brings you", "why now", "timing", "decided to come in"],
  },
  {
    id: "primary-driver",
    label: "Primary driver identified",
    description: "Determined who will be the main driver",
    keywords: ["who will", "driving", "primary driver", "mainly drive", "for yourself", "for you", "spouse", "partner"],
  },
  {
    id: "goals-today",
    label: "Goals for today discussed",
    description: "Understood what they hope to accomplish today",
    keywords: ["accomplish", "goal", "hoping", "looking to", "want to", "plan to", "objective"],
  },
  {
    id: "use-utility",
    label: "Use & utility uncovered",
    description: "Learned how they'll use the vehicle",
    keywords: ["use", "commute", "highway", "city", "road trip", "haul", "cargo", "passengers", "kids", "family", "work"],
  },
  {
    id: "current-vehicle",
    label: "Current vehicle details",
    description: "Asked about their current vehicle situation",
    keywords: ["current", "driving now", "own", "trade", "lease", "present vehicle", "what do you drive"],
  },
  {
    id: "love-dont-love",
    label: "What they loved/don't love",
    description: "Discovered likes and dislikes about current/past vehicles",
    keywords: ["like", "love", "hate", "dislike", "frustrat", "enjoy", "appreciate", "problem with", "issue with"],
  },
  {
    id: "new-criteria",
    label: "New vehicle criteria",
    description: "Established what they're looking for in a new vehicle",
    keywords: ["looking for", "want", "need", "important", "must have", "feature", "requirement", "criteria"],
  },
  {
    id: "top-priorities",
    label: "Top 3 priorities found",
    description: "Identified their most important factors",
    keywords: ["priority", "priorities", "most important", "top", "main concern", "crucial", "essential"],
  },
  {
    id: "must-have-nice-have",
    label: "Must-haves vs nice-to-haves",
    description: "Distinguished between needs and wants",
    keywords: ["must have", "nice to have", "necessary", "optional", "deal breaker", "non-negotiable", "flexible on"],
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

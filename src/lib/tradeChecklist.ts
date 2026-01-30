// Trade Appraisal & Vehicle Selection Checklists

export interface TradeChecklistItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: "framing" | "evaluation" | "disclosure" | "objection" | "vehicle-selection";
}

// 3-Step Trade Appraisal Process Checklist
export const tradeAppraisalChecklist: TradeChecklistItem[] = [
  // Step 1: Framing
  {
    id: "trade-intro",
    label: "Introduced trade process",
    description: "Explained the trade evaluation steps before touching the vehicle",
    keywords: ["walk around", "take photos", "evaluate", "appraisal process", "how this works", "let me explain", "what we do"],
    category: "framing",
  },
  {
    id: "avoid-expectation-question",
    label: "Avoided 'What do you expect?'",
    description: "Did not ask what they think their car is worth upfront",
    keywords: [], // This is a negative check - handled separately
    category: "framing",
  },
  {
    id: "set-expectations",
    label: "Set realistic expectations",
    description: "Explained that you'll give them the best honest value",
    keywords: ["honest", "fair", "best we can", "market value", "accurate", "transparent", "actual cash value", "acv"],
    category: "framing",
  },
  {
    id: "title-status",
    label: "Asked about title/payoff",
    description: "Confirmed ownership status and any remaining balance",
    keywords: ["title", "payoff", "owe", "loan", "lien", "paid off", "own it", "balance", "financed"],
    category: "framing",
  },

  // Step 2: Evaluation
  {
    id: "exterior-photos",
    label: "Took exterior photos",
    description: "Photographed front, passenger, rear, driver sides",
    keywords: ["photo", "picture", "walk around", "exterior", "outside", "front", "rear", "sides"],
    category: "evaluation",
  },
  {
    id: "interior-check",
    label: "Checked interior condition",
    description: "Inspected seats, dashboard, and interior features",
    keywords: ["interior", "inside", "seats", "dashboard", "upholstery", "carpet", "cabin", "condition"],
    category: "evaluation",
  },
  {
    id: "mileage-recorded",
    label: "Recorded mileage",
    description: "Noted the odometer reading",
    keywords: ["mileage", "miles", "odometer", "how many miles", "reading"],
    category: "evaluation",
  },
  {
    id: "damage-documented",
    label: "Documented damage (no commentary)",
    description: "Took photos of any damage without judging or explaining",
    keywords: ["damage", "dent", "scratch", "ding", "wear", "noted", "documented"],
    category: "evaluation",
  },
  {
    id: "mechanical-check",
    label: "Checked mechanical basics",
    description: "Verified engine starts, basic operation",
    keywords: ["engine", "start", "runs", "mechanical", "transmission", "brakes", "ac", "heat"],
    category: "evaluation",
  },

  // Step 3: Disclosure
  {
    id: "value-stated-cleanly",
    label: "Stated value without pause",
    description: "Delivered the trade value as a fact with no hesitation",
    keywords: ["trade value", "worth", "offer", "give you", "actual cash value", "your vehicle"],
    category: "disclosure",
  },
  {
    id: "continued-immediately",
    label: "Continued to next step",
    description: "Moved forward immediately without waiting for reaction",
    keywords: ["moving on", "next", "now let's", "so with that", "combining", "total", "payment"],
    category: "disclosure",
  },
  {
    id: "asked-for-decision",
    label: "Asked for a decision",
    description: "Requested commitment after presenting full picture",
    keywords: ["does that work", "sound good", "move forward", "ready to", "shall we", "decision", "thoughts"],
    category: "disclosure",
  },

  // Objection Handling (AEAIR)
  {
    id: "acknowledged-concern",
    label: "Acknowledged their concern",
    description: "Showed understanding before explaining (A in AEAIR)",
    keywords: ["understand", "hear you", "appreciate", "makes sense", "get that", "see where", "valid point"],
    category: "objection",
  },
  {
    id: "explained-value",
    label: "Explained value factors",
    description: "Gave context on how values are determined (E in AEAIR)",
    keywords: ["market", "wholesale", "retail", "condition", "factors", "why", "because", "reason", "auction"],
    category: "objection",
  },
  {
    id: "anchored-benefits",
    label: "Anchored to benefits",
    description: "Redirected to overall value proposition (A in AEAIR)",
    keywords: ["overall", "big picture", "combined", "total savings", "consider", "new vehicle", "warranty"],
    category: "objection",
  },
  {
    id: "invited-questions",
    label: "Invited questions",
    description: "Asked if they need more clarity (I in AEAIR)",
    keywords: ["questions", "clarify", "explain more", "help you understand", "anything else"],
    category: "objection",
  },
  {
    id: "reality-check",
    label: "Offered reality check",
    description: "Provided comparison or evidence if needed (R in AEAIR)",
    keywords: ["compare", "show you", "proof", "similar vehicles", "here's what", "evidence", "data"],
    category: "objection",
  },
];

// Vehicle Selection Checklist (Rule of Alternatives)
export const vehicleSelectionChecklist: TradeChecklistItem[] = [
  // Needs Discovery
  {
    id: "vs-primary-needs",
    label: "Identified primary needs",
    description: "Understood what problem the vehicle needs to solve",
    keywords: ["need", "looking for", "important", "priority", "must have", "require"],
    category: "vehicle-selection",
  },
  {
    id: "vs-usage-pattern",
    label: "Determined usage patterns",
    description: "Understood daily use, commute, family needs",
    keywords: ["commute", "drive", "daily", "family", "kids", "highway", "city", "miles"],
    category: "vehicle-selection",
  },
  {
    id: "vs-budget-discussed",
    label: "Discussed budget range",
    description: "Established comfortable payment or price range",
    keywords: ["budget", "afford", "payment", "price range", "spend", "monthly", "down payment"],
    category: "vehicle-selection",
  },
  {
    id: "vs-timeline",
    label: "Established timeline",
    description: "Understood when they need to make a decision",
    keywords: ["timeline", "when", "soon", "today", "urgency", "lease ending", "need by"],
    category: "vehicle-selection",
  },

  // Rule of Alternatives
  {
    id: "vs-two-options",
    label: "Prepared two alternatives",
    description: "Selected two vehicle options before showing (Rule of Alternatives)",
    keywords: ["two options", "couple choices", "alternatives", "both", "compare", "first option", "second option"],
    category: "vehicle-selection",
  },
  {
    id: "vs-explained-differences",
    label: "Explained key differences",
    description: "Highlighted what makes each option unique",
    keywords: ["difference", "this one has", "compared to", "while this", "on the other hand", "versus"],
    category: "vehicle-selection",
  },
  {
    id: "vs-matched-to-needs",
    label: "Matched options to needs",
    description: "Connected vehicle features to stated customer needs",
    keywords: ["perfect for", "fits your", "based on what you said", "since you mentioned", "addresses your"],
    category: "vehicle-selection",
  },
  {
    id: "vs-visual-presentation",
    label: "Prioritized visual presentation",
    description: "Showed vehicles before diving into specs",
    keywords: ["take a look", "let me show you", "come see", "walk over", "right here", "as you can see"],
    category: "vehicle-selection",
  },

  // Decision Support
  {
    id: "vs-addressed-concerns",
    label: "Addressed concerns",
    description: "Handled objections about options presented",
    keywords: ["concern", "worry", "hesitation", "but what about", "issue", "problem"],
    category: "vehicle-selection",
  },
  {
    id: "vs-asked-preference",
    label: "Asked which they prefer",
    description: "Guided toward a decision between options",
    keywords: ["which", "prefer", "leaning toward", "like better", "stands out", "favorite"],
    category: "vehicle-selection",
  },
  {
    id: "vs-confirmed-choice",
    label: "Confirmed final choice",
    description: "Got commitment on selected vehicle",
    keywords: ["the one", "go with", "decided", "this is it", "that's the one", "let's do"],
    category: "vehicle-selection",
  },
];

export function analyzeTradeChecklistFromConversation(
  conversation: Array<{ role: string; content: string }>,
  currentState: Record<string, boolean>,
  checklistType: "trade" | "vehicle-selection"
): Record<string, boolean> {
  const newState = { ...currentState };
  const checklist = checklistType === "trade" ? tradeAppraisalChecklist : vehicleSelectionChecklist;
  
  // Combine all messages
  const salesMessages = conversation
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  const customerMessages = conversation
    .filter((msg) => msg.role === "assistant")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  const allText = salesMessages + " " + customerMessages;

  // Check each item
  checklist.forEach((item) => {
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

export function calculateTradeChecklistProgress(
  state: Record<string, boolean>,
  checklistType: "trade" | "vehicle-selection"
): number {
  const checklist = checklistType === "trade" ? tradeAppraisalChecklist : vehicleSelectionChecklist;
  const total = checklist.length;
  const completed = checklist.filter((item) => state[item.id]).length;
  return Math.round((completed / total) * 100);
}

export function getChecklistByCategory(
  checklistType: "trade" | "vehicle-selection",
  category?: TradeChecklistItem["category"]
): TradeChecklistItem[] {
  const checklist = checklistType === "trade" ? tradeAppraisalChecklist : vehicleSelectionChecklist;
  if (!category) return checklist;
  return checklist.filter((item) => item.category === category);
}

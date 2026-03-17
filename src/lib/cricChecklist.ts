// C.R.I.C. Objection Handling Checklist
// Clarify → Rephrase → Isolate → Close

export interface CricChecklistItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  category: "setup" | "clarify" | "rephrase" | "isolate" | "close";
}

export const cricChecklist: CricChecklistItem[] = [
  // Setup — Establish rapport before handling the objection
  {
    id: "acknowledge-feeling",
    label: "Acknowledged the concern",
    description: "Validated the customer's feeling before diving into the objection",
    keywords: [
      "i understand", "i hear you", "that makes sense", "i appreciate",
      "totally get it", "completely understand", "fair concern", "valid point",
      "i can see", "that's understandable", "i respect that",
    ],
    category: "setup",
  },
  {
    id: "no-pressure",
    label: "Kept it pressure-free",
    description: "Maintained a consultative, non-pushy tone throughout",
    keywords: [
      "no pressure", "take your time", "i want to help", "let's figure this out",
      "work together", "let me help", "let's see", "happy to",
      "comfortable", "no rush",
    ],
    category: "setup",
  },

  // Step 1: CLARIFY — Understand what the real objection is
  {
    id: "clarify-ask-why",
    label: "Asked what specifically concerns them",
    description: "Dug into the specifics of the objection rather than assuming",
    keywords: [
      "what specifically", "tell me more", "help me understand",
      "what about it", "what part", "what exactly", "which aspect",
      "can you walk me through", "what's your biggest concern",
      "what do you mean by", "is it the",
    ],
    category: "clarify",
  },
  {
    id: "clarify-identify-type",
    label: "Identified the objection type",
    description: "Determined if it's Budget, Decision, or Deal",
    keywords: [
      "monthly payment", "budget", "afford", "price", "cost",
      "think about it", "decision", "sure", "right choice", "compare",
      "other dealer", "better deal", "quote", "match", "beat",
    ],
    category: "clarify",
  },

  // Step 2: REPHRASE — Mirror back in your own words
  {
    id: "rephrase-mirror",
    label: "Rephrased the objection back",
    description: "Restated the concern in your own words to confirm understanding",
    keywords: [
      "so what you're saying", "sounds like", "if i'm hearing you right",
      "so really it's about", "in other words", "so the main thing is",
      "what i'm hearing is", "so for you it comes down to",
      "so it's really about", "let me make sure i understand",
    ],
    category: "rephrase",
  },
  {
    id: "rephrase-confirm",
    label: "Got confirmation from customer",
    description: "Customer confirmed your rephrase was accurate",
    keywords: [
      "exactly", "that's right", "yes", "yeah", "correct", "right",
      "that's it", "you got it", "pretty much", "spot on", "bingo",
    ],
    category: "rephrase",
  },

  // Step 3: ISOLATE — "Other than that..."
  {
    id: "isolate-other-than",
    label: 'Used "other than" to isolate',
    description: "Asked if there's anything else holding them back besides this concern",
    keywords: [
      "other than", "besides that", "apart from", "aside from",
      "if we could", "setting that aside", "outside of",
      "is there anything else", "everything else",
      "if that wasn't a concern", "if we solve",
    ],
    category: "isolate",
  },
  {
    id: "isolate-confirmed-single",
    label: "Confirmed it's the only concern",
    description: "Verified this is the single remaining barrier to moving forward",
    keywords: [
      "so if we", "then we're good", "that's the only thing",
      "nothing else", "just this one", "only thing",
      "if i can address", "if we can figure out", "would you be ready",
    ],
    category: "isolate",
  },

  // Step 4: CLOSE — Present a solution and ask for the business
  {
    id: "close-offer-solution",
    label: "Presented a specific solution",
    description: "Offered a concrete way to address the objection",
    keywords: [
      "what if", "how about", "here's what i can do", "one option",
      "we could", "let me show you", "i can offer", "would it help if",
      "here's an idea", "let me see what", "i think we can",
      "there's actually", "what we do here",
    ],
    category: "close",
  },
  {
    id: "close-either-or",
    label: "Used an either/or close",
    description: "Gave the customer two positive options to choose from",
    keywords: [
      "would you prefer", "option a or option b", "either",
      "which works better", "we can do this or", "two ways",
      "first option", "second option", "or would you rather",
      "which would you", "does that work or would",
    ],
    category: "close",
  },
  {
    id: "close-ask-commitment",
    label: "Asked for the commitment",
    description: "Directly asked the customer to move forward",
    keywords: [
      "let's get started", "ready to move forward", "shall we",
      "let's do it", "get the paperwork", "let's make it happen",
      "go ahead and", "lock this in", "pull the trigger",
      "get you into", "take the next step", "wrap this up",
    ],
    category: "close",
  },
];

export const cricCategoryLabels: Record<CricChecklistItem["category"], string> = {
  setup: "Setup & Rapport",
  clarify: "1. Clarify",
  rephrase: "2. Rephrase",
  isolate: "3. Isolate",
  close: "4. Close",
};

export function analyzeCricChecklistFromConversation(
  conversation: Array<{ role: string; content: string }>,
  currentState: Record<string, boolean>
): Record<string, boolean> {
  const newState = { ...currentState };

  const salesMessages = conversation
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  const customerMessages = conversation
    .filter((msg) => msg.role === "assistant")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  cricChecklist.forEach((item) => {
    if (newState[item.id]) return;

    // "rephrase-confirm" should check customer messages only
    const textToSearch =
      item.id === "rephrase-confirm" ? customerMessages : salesMessages;

    // "clarify-identify-type" checks all text (both sides reveal it)
    const searchText =
      item.id === "clarify-identify-type"
        ? salesMessages + " " + customerMessages
        : textToSearch;

    const hasKeyword = item.keywords.some((kw) =>
      searchText.includes(kw.toLowerCase())
    );
    if (hasKeyword) {
      newState[item.id] = true;
    }
  });

  return newState;
}

export function calculateCricChecklistProgress(
  state: Record<string, boolean>
): number {
  const total = cricChecklist.length;
  const completed = Object.values(state).filter(Boolean).length;
  return Math.round((completed / total) * 100);
}

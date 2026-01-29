import { LearningObjective, KnowledgeCheck, QuizQuestion } from "./moduleContent";

export const module3Overview = `The AEAIR framework is your go-to method for handling any customer objection professionally and effectively. Instead of arguing or dismissing concerns, you'll learn to acknowledge, educate, and guide customers toward confident decisions.`;

export const module3Objectives: LearningObjective[] = [
  { id: "obj1", text: "Master the 5-step AEAIR objection handling framework" },
  { id: "obj2", text: "Apply each step to real-world customer objections" },
  { id: "obj3", text: "Practice responses to common price, trade, and timing objections" },
  { id: "obj4", text: "Build confidence in turning objections into opportunities" },
];

// AEAIR Framework Content
export const aeairSteps = [
  {
    letter: "A",
    title: "Acknowledge",
    description: "Validate the customer's concern without agreeing or disagreeing. Show them you heard and understand their perspective.",
    example: "\"I completely understand why you'd feel that way about the price. Many customers share that same concern initially.\"",
    keyPoints: [
      "Never dismiss or minimize the objection",
      "Use empathetic language: 'I understand', 'That makes sense', 'I hear you'",
      "Pause briefly to let them know you're taking their concern seriously",
    ],
  },
  {
    letter: "E",
    title: "Explain",
    description: "Provide context and education about the situation. Help the customer understand the 'why' behind pricing, processes, or policies.",
    example: "\"The reason this vehicle is priced where it is reflects its low mileage, clean history, and the certified pre-owned warranty that comes with it.\"",
    keyPoints: [
      "Focus on value, not just features",
      "Use facts and specifics, not vague claims",
      "Keep explanations concise—don't over-explain",
    ],
  },
  {
    letter: "A",
    title: "Anchor",
    description: "Connect back to what the customer told you they wanted. Anchor your response to their stated needs, priorities, or pain points.",
    example: "\"You mentioned reliability was your top priority because of your long commute. This vehicle's track record and warranty directly address that need.\"",
    keyPoints: [
      "Reference their earlier statements from the CNA",
      "Show how your solution matches their priorities",
      "Make it personal to their situation",
    ],
  },
  {
    letter: "I",
    title: "Invite",
    description: "Ask for their thoughts or invite them to take the next step. Keep the conversation moving forward collaboratively.",
    example: "\"Does that help address your concern about the price? What other questions do you have before we move forward?\"",
    keyPoints: [
      "Use open-ended questions when possible",
      "Don't be pushy—invite, don't demand",
      "Give them space to process and respond",
    ],
  },
  {
    letter: "R",
    title: "Reality",
    description: "If needed, gently introduce market realities or logical considerations that support your position. Use this step sparingly and tactfully.",
    example: "\"I want to be upfront with you—vehicles like this typically don't stay on the lot long. If this is the right fit, I'd hate for you to miss out.\"",
    keyPoints: [
      "Use facts, not pressure tactics",
      "Be honest about market conditions, inventory, or timing",
      "Only use when genuinely applicable—never fabricate urgency",
    ],
  },
];

// Common Objections with AEAIR Responses
export const commonObjections = [
  {
    id: "price-too-high",
    category: "Price",
    objection: "\"This is more than I wanted to spend.\"",
    aeairResponse: {
      acknowledge: "I completely understand—budget is important, and you want to make sure you're getting real value for your investment.",
      explain: "This price reflects the vehicle's condition, mileage, and the fact that it comes with our certified warranty. We also price competitively against the market.",
      anchor: "You mentioned you need something reliable for your family that won't nickel-and-dime you with repairs. This vehicle's history and warranty give you that peace of mind.",
      invite: "Would it help if we looked at the total cost of ownership, including what you'd save on repairs and fuel?",
      reality: "Honestly, vehicles in this condition at this price point move quickly. If this checks your boxes, I'd recommend we lock it in.",
    },
  },
  {
    id: "trade-value-low",
    category: "Trade",
    objection: "\"I thought my trade would be worth more.\"",
    aeairResponse: {
      acknowledge: "I hear you—it's never easy to hear a number that's different from what you expected.",
      explain: "The value we arrived at is based on current market data, the vehicle's condition, and what similar vehicles are actually selling for right now. We use the same tools dealers across the country use.",
      anchor: "You mentioned wanting a straightforward, no-games experience. That's exactly why we show you the real market data—so you can see exactly how we got to this number.",
      invite: "Would you like me to walk you through the appraisal details so you can see how we calculated it?",
      reality: "I want to be transparent—this is genuinely what the market supports right now. If you've seen higher offers, I'd encourage you to explore them, but be sure they're actual purchase offers, not just online estimates.",
    },
  },
  {
    id: "need-to-think",
    category: "Timing",
    objection: "\"I need to think about it.\"",
    aeairResponse: {
      acknowledge: "Absolutely—this is a big decision, and you should feel completely confident before moving forward.",
      explain: "What I've found is that 'thinking about it' usually means there's a specific question or concern that hasn't been fully addressed yet.",
      anchor: "You came in today because you needed a solution for [their stated need]. Is there something specific about this vehicle or the numbers that's giving you pause?",
      invite: "What would you need to know or see to feel 100% confident in your decision today?",
      reality: "I just want to mention—I can't guarantee this vehicle will still be available if you come back later. If it's the right fit, I'd hate for you to miss out.",
    },
  },
  {
    id: "competitor-price",
    category: "Price",
    objection: "\"I saw a similar one cheaper at another dealer.\"",
    aeairResponse: {
      acknowledge: "That's great that you're doing your research—it shows you're serious about finding the right deal.",
      explain: "Not all 'similar' vehicles are truly equal. Differences in mileage, condition, accident history, and what's included can significantly affect both price and long-term value.",
      anchor: "You mentioned wanting something you could trust for years without surprises. This vehicle's clean history and our certification process give you that confidence.",
      invite: "Would it be helpful if we compared the two vehicles side-by-side so you can see exactly what you're getting for the price?",
      reality: "I'd just encourage you to make sure you're comparing apples to apples. Sometimes a lower price means less warranty, hidden fees, or undisclosed issues.",
    },
  },
  {
    id: "monthly-payment",
    category: "Payment",
    objection: "\"The monthly payment is too high.\"",
    aeairResponse: {
      acknowledge: "I understand—you need a payment that works comfortably within your budget.",
      explain: "The payment is a function of the price, your trade value, down payment, and the term length. There are a few levers we can adjust to get to a number that works better for you.",
      anchor: "You mentioned wanting to keep your monthly expenses manageable while still getting a reliable vehicle. Let's see what options we have.",
      invite: "If we could get the payment closer to where you need it, would you be ready to move forward today?",
      reality: "I want to find a solution that works, but I also want to make sure we're not stretching the term so long that you end up paying more in the long run.",
    },
  },
];

// Knowledge Checks
export const module3KnowledgeChecks: Record<string, KnowledgeCheck> = {
  section1: {
    id: "kc1",
    question: "What does the 'A' in 'Anchor' refer to in the AEAIR framework?",
    type: "single",
    options: [
      { id: "a", text: "Agreeing with the customer's objection", isCorrect: false },
      { id: "b", text: "Connecting back to the customer's stated needs and priorities", isCorrect: true },
      { id: "c", text: "Adding pressure to close the sale", isCorrect: false },
      { id: "d", text: "Asking for the manager's help", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! Anchor means connecting your response back to what the customer told you they wanted—their stated needs, priorities, or pain points from the CNA.",
      incorrect: "Not quite. Anchor refers to connecting your response back to the customer's stated needs and priorities from your earlier conversation.",
    },
  },
  section2: {
    id: "kc2",
    question: "When a customer says 'I need to think about it,' what is typically the real underlying issue?",
    type: "single",
    options: [
      { id: "a", text: "They genuinely need more time to consider all options", isCorrect: false },
      { id: "b", text: "They have a specific unanswered question or unaddressed concern", isCorrect: true },
      { id: "c", text: "They want to negotiate a better price", isCorrect: false },
      { id: "d", text: "They're not interested in buying", isCorrect: false },
    ],
    feedback: {
      correct: "Right! 'I need to think about it' usually signals an unaddressed concern or unanswered question. The AEAIR framework helps you uncover and address that real objection.",
      incorrect: "Remember: 'I need to think about it' typically means there's a specific unaddressed concern or question. Use AEAIR to uncover the real objection.",
    },
  },
};

// Final Quiz
export const module3Quiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the correct order of steps in the AEAIR framework?",
    options: [
      { id: "a", text: "Anchor, Explain, Acknowledge, Invite, Reality", isCorrect: false },
      { id: "b", text: "Acknowledge, Explain, Anchor, Invite, Reality", isCorrect: true },
      { id: "c", text: "Ask, Explain, Answer, Invite, Resolve", isCorrect: false },
      { id: "d", text: "Acknowledge, Educate, Affirm, Inquire, Respond", isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "In the 'Acknowledge' step, what should you avoid doing?",
    options: [
      { id: "a", text: "Using empathetic language", isCorrect: false },
      { id: "b", text: "Pausing to show you're listening", isCorrect: false },
      { id: "c", text: "Dismissing or minimizing the customer's concern", isCorrect: true },
      { id: "d", text: "Validating their perspective", isCorrect: false },
    ],
  },
  {
    id: "q3",
    question: "What is the primary purpose of the 'Explain' step?",
    options: [
      { id: "a", text: "To argue with the customer's objection", isCorrect: false },
      { id: "b", text: "To provide context and education about the situation", isCorrect: true },
      { id: "c", text: "To immediately offer a discount", isCorrect: false },
      { id: "d", text: "To involve the sales manager", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "When using the 'Anchor' step, what should you reference?",
    options: [
      { id: "a", text: "The dealership's sales goals", isCorrect: false },
      { id: "b", text: "Other customers who bought similar vehicles", isCorrect: false },
      { id: "c", text: "The customer's earlier statements about their needs and priorities", isCorrect: true },
      { id: "d", text: "Online reviews of the vehicle", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "When should you use the 'Reality' step?",
    options: [
      { id: "a", text: "At the start of every objection response", isCorrect: false },
      { id: "b", text: "Only when genuinely applicable—never fabricate urgency", isCorrect: true },
      { id: "c", text: "Whenever you want to pressure the customer", isCorrect: false },
      { id: "d", text: "Only with difficult customers", isCorrect: false },
    ],
  },
  {
    id: "q6",
    question: "A customer says 'This is more than I wanted to spend.' What is the best first response?",
    options: [
      { id: "a", text: "Immediately offer a discount", isCorrect: false },
      { id: "b", text: "Explain why the price is fair", isCorrect: false },
      { id: "c", text: "Acknowledge their concern about budget and value", isCorrect: true },
      { id: "d", text: "Tell them this is the best price available", isCorrect: false },
    ],
  },
  {
    id: "q7",
    question: "What distinguishes a good 'Invite' from a pushy close?",
    options: [
      { id: "a", text: "Using open-ended questions and giving space to respond", isCorrect: true },
      { id: "b", text: "Demanding an immediate answer", isCorrect: false },
      { id: "c", text: "Repeating the same question multiple times", isCorrect: false },
      { id: "d", text: "Involving the manager for backup", isCorrect: false },
    ],
  },
  {
    id: "q8",
    question: "When a customer compares your price to a competitor, what should you emphasize?",
    options: [
      { id: "a", text: "That the competitor is dishonest", isCorrect: false },
      { id: "b", text: "The importance of comparing vehicles with similar condition, history, and inclusions", isCorrect: true },
      { id: "c", text: "That your dealership is the biggest in town", isCorrect: false },
      { id: "d", text: "That they should just trust you", isCorrect: false },
    ],
  },
];

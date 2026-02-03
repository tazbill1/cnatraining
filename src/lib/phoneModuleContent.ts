// Phone Sales Fundamentals Module Content
import { LearningObjective, KnowledgeCheck, QuizQuestion } from "./moduleContent";

export const phoneModuleSections = [
  "Inbound Call Handling",
  "Outbound Prospecting", 
  "Appointment Setting Techniques",
  "Phone Objection Handling",
];

export const phoneModuleObjectives: LearningObjective[] = [
  { id: "obj1", text: "Handle inbound calls professionally and gather key information" },
  { id: "obj2", text: "Execute effective outbound prospecting calls" },
  { id: "obj3", text: "Set quality appointments that show" },
  { id: "obj4", text: "Overcome common phone objections with confidence" },
];

export const phoneModuleOverview = "The phone is your most powerful tool for filling your pipeline. Master these techniques to convert more calls into showroom visits.";

export const phoneModuleKnowledgeChecks: Record<string, KnowledgeCheck> = {
  inbound: {
    id: "kc1",
    question: "When should you capture the caller's contact information?",
    type: "single",
    options: [
      { id: "a", text: "At the end of the call", isCorrect: false },
      { id: "b", text: "Within the first 2 minutes", isCorrect: true },
      { id: "c", text: "Only if they seem interested", isCorrect: false },
      { id: "d", text: "After you've answered all their questions", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! Get contact info early (within 2 minutes) in case you get disconnected and to ensure you can follow up.",
      incorrect: "Remember: Capture contact info early (within 2 minutes) in case you get disconnected and to ensure you can follow up.",
    },
  },
  outbound: {
    id: "kc2",
    question: "What are 'orphan owner' calls?",
    type: "single",
    options: [
      { id: "a", text: "Calls to customers with vehicle problems", isCorrect: false },
      { id: "b", text: "Calls to customers whose original salesperson left the dealership", isCorrect: true },
      { id: "c", text: "Calls to first-time buyers", isCorrect: false },
      { id: "d", text: "Calls to service department customers", isCorrect: false },
    ],
    feedback: {
      correct: "That's right! Orphan owners are customers who bought from salespeople no longer with the dealership. They're excellent prospects because they already have a relationship with your dealership.",
      incorrect: "Orphan owners are customers whose original salesperson left. They already have a relationship with your dealership, making them excellent prospects.",
    },
  },
  appointment: {
    id: "kc3",
    question: "What's the key to the 'Offer Alternatives' step in appointment setting?",
    type: "single",
    options: [
      { id: "a", text: "Ask if they want to come in sometime", isCorrect: false },
      { id: "b", text: "Give them a choice between two specific times", isCorrect: true },
      { id: "c", text: "Let them pick any time that works", isCorrect: false },
      { id: "d", text: "Suggest they check their calendar and call back", isCorrect: false },
    ],
    feedback: {
      correct: "Correct! Offering two specific times (choice close) moves the conversation from 'if' they'll come in to 'when' they'll come in. This creates a higher commitment level.",
      incorrect: "The key is giving a choice between two specific times, which moves the conversation from 'if' to 'when' they'll come in.",
    },
  },
  objections: {
    id: "kc4",
    question: "When a customer asks 'What's the price?' on the phone, you should:",
    type: "single",
    options: [
      { id: "a", text: "Give them the MSRP immediately", isCorrect: false },
      { id: "b", text: "Tell them you can't discuss pricing on the phone", isCorrect: false },
      { id: "c", text: "Explain pricing depends on factors and invite them in for accurate numbers", isCorrect: true },
      { id: "d", text: "Ask them to visit the website for pricing", isCorrect: false },
    ],
    feedback: {
      correct: "Perfect! Redirect price questions by explaining that accurate pricing depends on several factors (trade value, incentives, etc.) and invite them in for a personalized quote.",
      incorrect: "Redirect price questions by explaining that accurate pricing depends on factors like trade value and incentives, then invite them in for accurate numbers.",
    },
  },
};

export const phoneModuleQuiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the recommended timeframe to capture a caller's contact information?",
    options: [
      { id: "a", text: "At the end of the call", isCorrect: false },
      { id: "b", text: "Within the first 2 minutes", isCorrect: true },
      { id: "c", text: "After discussing vehicle options", isCorrect: false },
      { id: "d", text: "Only if they set an appointment", isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "What does CARE stand for in the inbound call framework?",
    options: [
      { id: "a", text: "Call, Ask, Recommend, End", isCorrect: false },
      { id: "b", text: "Capture, Ask, Recommend, Engage", isCorrect: true },
      { id: "c", text: "Connect, Assess, Respond, Exit", isCorrect: false },
      { id: "d", text: "Contact, Analyze, Review, Evaluate", isCorrect: false },
    ],
  },
  {
    id: "q3",
    question: "What are 'orphan owners'?",
    options: [
      { id: "a", text: "First-time car buyers", isCorrect: false },
      { id: "b", text: "Customers with vehicle problems", isCorrect: false },
      { id: "c", text: "Customers whose original salesperson left the dealership", isCorrect: true },
      { id: "d", text: "Customers who never respond to calls", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "When setting an appointment, you should:",
    options: [
      { id: "a", text: "Ask if they'd like to come in sometime", isCorrect: false },
      { id: "b", text: "Give them a choice between two specific times", isCorrect: true },
      { id: "c", text: "Tell them to come whenever convenient", isCorrect: false },
      { id: "d", text: "Wait for them to suggest a time", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "If a customer on the phone says 'Just email me the information,' you should:",
    options: [
      { id: "a", text: "Send the email and end the call", isCorrect: false },
      { id: "b", text: "Refuse to send emails", isCorrect: false },
      { id: "c", text: "Ask what they want, then redirect to an in-person visit", isCorrect: true },
      { id: "d", text: "Transfer them to another department", isCorrect: false },
    ],
  },
  {
    id: "q6",
    question: "How long should a voicemail be?",
    options: [
      { id: "a", text: "As long as needed to explain everything", isCorrect: false },
      { id: "b", text: "Under 30 seconds", isCorrect: true },
      { id: "c", text: "Exactly 1 minute", isCorrect: false },
      { id: "d", text: "At least 2 minutes", isCorrect: false },
    ],
  },
  {
    id: "q7",
    question: "What is the best approach when a caller asks for the price?",
    options: [
      { id: "a", text: "Give the MSRP immediately", isCorrect: false },
      { id: "b", text: "Say you can't discuss pricing on the phone", isCorrect: false },
      { id: "c", text: "Explain pricing depends on factors and invite them in", isCorrect: true },
      { id: "d", text: "Quote the lowest possible price", isCorrect: false },
    ],
  },
  {
    id: "q8",
    question: "The best days and times for outbound prospecting calls are:",
    options: [
      { id: "a", text: "Monday mornings", isCorrect: false },
      { id: "b", text: "Friday afternoons", isCorrect: false },
      { id: "c", text: "Tuesday-Thursday, 10am-12pm or 4pm-6pm", isCorrect: true },
      { id: "d", text: "Weekends only", isCorrect: false },
    ],
  },
  {
    id: "q9",
    question: "After setting an appointment, you should:",
    options: [
      { id: "a", text: "Wait for them to show up", isCorrect: false },
      { id: "b", text: "Send a text confirmation immediately", isCorrect: true },
      { id: "c", text: "Call them every hour to remind them", isCorrect: false },
      { id: "d", text: "Assume they'll remember", isCorrect: false },
    ],
  },
  {
    id: "q10",
    question: "When a customer says 'I'm not ready to buy yet,' the best response is:",
    options: [
      { id: "a", text: "End the call and follow up later", isCorrect: false },
      { id: "b", text: "Push harder for a commitment", isCorrect: false },
      { id: "c", text: "Remove pressure and still invite them in to gather information", isCorrect: true },
      { id: "d", text: "Offer a discount to close today", isCorrect: false },
    ],
  },
];

// Section content for display
export interface PhoneSectionStep {
  name: string;
  description: string;
  script?: string;
}

export interface PhoneSectionContent {
  type: "concept" | "script" | "process" | "tip";
  title: string;
  description?: string;
  script?: string;
  notes?: string[];
  items?: string[];
  steps?: PhoneSectionStep[];
}

export interface PhoneSection {
  title: string;
  content: PhoneSectionContent[];
  knowledgeCheckKey: string;
}

export const phoneSections: Record<string, PhoneSection> = {
  inbound: {
    title: "Inbound Call Handling",
    knowledgeCheckKey: "inbound",
    content: [
      {
        type: "concept",
        title: "The First 10 Seconds",
        description: "Your greeting sets the tone for the entire call. You have 10 seconds to establish professionalism and build rapport.",
      },
      {
        type: "script",
        title: "Standard Greeting Script",
        script: `"Thank you for calling [Dealership Name], this is [Your Name] in sales. How may I help you today?"`,
        notes: [
          "Smile when you answer - it comes through in your voice",
          "Speak clearly and at a moderate pace",
          "Use your first name only - it's more personal",
        ],
      },
      {
        type: "process",
        title: "The CARE Framework for Inbound Calls",
        steps: [
          {
            name: "Capture",
            description: "Get their name, phone number, and email within the first 2 minutes",
            script: `"Before we go further, may I get your name and the best number to reach you in case we get disconnected?"`,
          },
          {
            name: "Ask",
            description: "Ask about their vehicle needs using the CNA approach",
            script: `"What brings you to us today? Are you looking for something specific?"`,
          },
          {
            name: "Recommend",
            description: "Suggest 2-3 vehicles that match their needs",
            script: `"Based on what you've shared, I have two great options I'd love to show you..."`,
          },
          {
            name: "Engage",
            description: "Transition to appointment setting",
            script: `"The best way to see if this is the right fit is to come take a look. What works better for you - today or tomorrow?"`,
          },
        ],
      },
      {
        type: "tip",
        title: "Common Mistakes to Avoid",
        items: [
          "Don't quote prices over the phone - invite them in instead",
          "Don't let them hang up without getting contact info",
          "Don't answer questions about specific vehicles until you know their needs",
          "Don't put them on hold for more than 30 seconds",
        ],
      },
    ],
  },
  outbound: {
    title: "Outbound Prospecting",
    knowledgeCheckKey: "outbound",
    content: [
      {
        type: "concept",
        title: "Why Outbound Matters",
        description: "The best salespeople don't wait for leads - they create them. Outbound calls to orphan owners, service customers, and past inquiries can generate 3-5 additional sales per month.",
      },
      {
        type: "process",
        title: "The 3 Types of Outbound Calls",
        steps: [
          {
            name: "Orphan Owner Calls",
            description: "Customers who bought from salespeople no longer with the dealership",
            script: `"Hi [Name], this is [Your Name] from [Dealership]. I'm reaching out because I've been assigned as your new sales consultant. I wanted to introduce myself and see how your [Vehicle] is treating you?"`,
          },
          {
            name: "Service Follow-Up Calls",
            description: "Customers who recently had service work done",
            script: `"Hi [Name], this is [Your Name] from [Dealership]. I saw you were in for service recently and wanted to check - were you happy with how everything went? Also, have you thought about what you might drive next?"`,
          },
          {
            name: "Internet Lead Follow-Up",
            description: "Following up on leads that went cold",
            script: `"Hi [Name], this is [Your Name] from [Dealership]. You reached out to us a few weeks ago about a [Vehicle]. I wanted to follow up - are you still in the market?"`,
          },
        ],
      },
      {
        type: "tip",
        title: "Best Times to Call",
        items: [
          "Tuesday-Thursday: Highest contact rates",
          "10am-12pm: Good for reaching stay-at-home customers",
          "4pm-6pm: Good for reaching working professionals",
          "Avoid Monday mornings and Friday afternoons",
        ],
      },
      {
        type: "script",
        title: "Voicemail Script",
        script: `"Hi [Name], this is [Your Name] from [Dealership]. I have some information about the [Vehicle/Topic] you were interested in. Please call me back at [Number]. Again, that's [Your Name] at [Number]. Thanks!"`,
        notes: [
          "Keep voicemails under 30 seconds",
          "Speak slowly and clearly - especially your callback number",
          "Create curiosity but don't give everything away",
          "Repeat your name and number at the end",
        ],
      },
    ],
  },
  appointment: {
    title: "Appointment Setting Techniques",
    knowledgeCheckKey: "appointment",
    content: [
      {
        type: "concept",
        title: "The Goal: Firm Appointments That Show",
        description: "Anyone can set an appointment. The skill is setting appointments that actually show. This requires creating urgency, confirming commitment, and proper follow-up.",
      },
      {
        type: "process",
        title: "The 5-Step Appointment Formula",
        steps: [
          {
            name: "Create Value",
            description: "Give them a reason to come in",
            script: `"I have two vehicles that match exactly what you're looking for, and I've already pulled them aside for you to see."`,
          },
          {
            name: "Offer Alternatives",
            description: "Give them a choice between two times (not if, but when)",
            script: `"I have some availability today at 4pm or tomorrow morning at 10am. Which works better for your schedule?"`,
          },
          {
            name: "Confirm Commitment",
            description: "Get verbal commitment and address potential no-shows",
            script: `"Perfect, I'll put you down for 4pm today. Now, I'm going to prepare everything and have the vehicles ready - can I count on you to be here?"`,
          },
          {
            name: "Set Expectations",
            description: "Tell them what will happen when they arrive",
            script: `"When you arrive, ask for me by name at the front desk. I'll have everything ready, and we'll take about 30-45 minutes to find the right vehicle for you."`,
          },
          {
            name: "Confirm Details",
            description: "Repeat everything and get their contact info",
            script: `"Let me confirm: That's [Day] at [Time]. I'll send you a text confirmation. What's the best cell number to reach you?"`,
          },
        ],
      },
      {
        type: "script",
        title: "Handling 'I'm Just Looking' or 'Just Send Info'",
        script: `"I completely understand - you want to make sure this is worth your time. Here's what I can do: I'll have the vehicles you're interested in pulled up and ready. You can take a look, ask any questions, and there's absolutely no pressure. If it's not right for you, you're free to leave. Does [time] work?"`,
        notes: [
          "Acknowledge their hesitation",
          "Remove the pressure",
          "Make it easy and low-commitment",
          "Always end with a specific time",
        ],
      },
      {
        type: "tip",
        title: "Appointment Confirmation Best Practices",
        items: [
          "Send a text confirmation immediately after setting the appointment",
          "Call to confirm the morning of (or day before for morning appointments)",
          "Include your name, dealership address, and appointment time in the text",
          "If they don't confirm, call to reschedule rather than waiting for a no-show",
        ],
      },
    ],
  },
  objections: {
    title: "Phone Objection Handling",
    knowledgeCheckKey: "objections",
    content: [
      {
        type: "concept",
        title: "Phone Objections Are Different",
        description: "On the phone, you can't read body language or build rapport the same way. You have less time and need sharper responses. Most phone objections are about avoiding commitment.",
      },
      {
        type: "process",
        title: "Common Phone Objections & Responses",
        steps: [
          {
            name: `"What's the price?"`,
            description: "They want to know before committing to visit",
            script: `"Great question - pricing depends on a few factors like trade-in value and available incentives. I want to make sure I give you accurate numbers. The best way to do that is to spend about 15 minutes together so I can understand exactly what you need. Does [time] work for you?"`,
          },
          {
            name: `"Just email me the information"`,
            description: "They want to avoid the phone call",
            script: `"I'd be happy to send some info. What specifically would you like me to include? ... You know, honestly, an email can't answer your questions the way I can in person. Let me suggest this: come in for 15 minutes, and if it's not for you, I'll email you anything you need. Does [time] work?"`,
          },
          {
            name: `"I'm not ready to buy yet"`,
            description: "They feel pressured",
            script: `"No problem at all - there's no pressure. Most people aren't ready to buy on their first visit, and that's completely fine. This is just about gathering information and seeing what's out there. When would be a good time for you to take a look?"`,
          },
          {
            name: `"I'm still shopping around"`,
            description: "They want to compare options",
            script: `"That makes total sense - you should compare. In fact, why not add us to your list? We may have something that surprises you, and at least you'll have all the information you need to make the best decision. I have time today at [time] or tomorrow at [time]. Which is better?"`,
          },
          {
            name: `"I'm working with someone else"`,
            description: "They have an existing relationship",
            script: `"That's great - it sounds like you're in good hands. I just want to make sure you're aware of all your options. If you ever need a second opinion or want to see what else is available, I'm here. Can I at least send you my contact info in case anything changes?"`,
          },
        ],
      },
      {
        type: "tip",
        title: "The Phone Objection Mindset",
        items: [
          "Every objection is a request for more information",
          "Don't argue - acknowledge, then redirect to the appointment",
          "Keep your tone friendly and low-pressure",
          "If they say no twice, respect it and leave the door open",
          "Always ask for permission to follow up later",
        ],
      },
    ],
  },
};

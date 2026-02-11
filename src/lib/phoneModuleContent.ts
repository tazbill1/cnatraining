// Phone Sales Fundamentals Module Content — Inbound Calls Only
import { LearningObjective, KnowledgeCheck, QuizQuestion } from "./moduleContent";

export const phoneModuleSections = [
  "The First Impression",
  "The CARE Framework",
  "Setting the Appointment",
  "Handling Inbound Objections",
];

export const phoneModuleObjectives: LearningObjective[] = [
  { id: "obj1", text: "Deliver a professional greeting that sets the right tone in the first 10 seconds" },
  { id: "obj2", text: "Apply the CARE framework to capture info, qualify needs, and recommend vehicles" },
  { id: "obj3", text: "Convert inbound calls into firm appointments that show" },
  { id: "obj4", text: "Overcome common inbound call objections and keep the conversation moving forward" },
];

export const phoneModuleOverview = "Every inbound call is a customer raising their hand. Master these techniques to make a great first impression, gather key information, and convert more calls into showroom appointments.";

export const phoneModuleKnowledgeChecks: Record<string, KnowledgeCheck> = {
  firstImpression: {
    id: "kc1",
    question: "What should you do within the first 10 seconds of an inbound call?",
    type: "single",
    options: [
      { id: "a", text: "Ask if they've visited the website", isCorrect: false },
      { id: "b", text: "Deliver a warm, professional greeting with your name", isCorrect: true },
      { id: "c", text: "Ask what vehicle they want", isCorrect: false },
      { id: "d", text: "Transfer them to the internet department", isCorrect: false },
    ],
    feedback: {
      correct: "Exactly! A warm, professional greeting with your name sets the tone and builds immediate rapport.",
      incorrect: "Remember: the first 10 seconds are about a warm, professional greeting that includes your name. This sets the tone for the entire call.",
    },
  },
  care: {
    id: "kc2",
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
      correct: "Correct! Offering two specific times (choice close) moves the conversation from 'if' they'll come in to 'when' they'll come in.",
      incorrect: "The key is giving a choice between two specific times, which moves the conversation from 'if' to 'when' they'll come in.",
    },
  },
  objections: {
    id: "kc4",
    question: "When a caller asks 'What's the price?' on the phone, you should:",
    type: "single",
    options: [
      { id: "a", text: "Give them the MSRP immediately", isCorrect: false },
      { id: "b", text: "Tell them you can't discuss pricing on the phone", isCorrect: false },
      { id: "c", text: "Explain pricing depends on factors and invite them in for accurate numbers", isCorrect: true },
      { id: "d", text: "Ask them to visit the website for pricing", isCorrect: false },
    ],
    feedback: {
      correct: "Perfect! Redirect price questions by explaining that accurate pricing depends on several factors and invite them in for a personalized quote.",
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
    question: "What should you do in the first 10 seconds of an inbound call?",
    options: [
      { id: "a", text: "Ask about their trade-in", isCorrect: false },
      { id: "b", text: "Quote a price on their vehicle of interest", isCorrect: false },
      { id: "c", text: "Smile, greet warmly, and introduce yourself by first name", isCorrect: true },
      { id: "d", text: "Put them on hold to check inventory", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "When setting an appointment from an inbound call, you should:",
    options: [
      { id: "a", text: "Ask if they'd like to come in sometime", isCorrect: false },
      { id: "b", text: "Give them a choice between two specific times", isCorrect: true },
      { id: "c", text: "Tell them to come whenever convenient", isCorrect: false },
      { id: "d", text: "Wait for them to suggest a time", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "If a caller says 'Just email me the information,' you should:",
    options: [
      { id: "a", text: "Send the email and end the call", isCorrect: false },
      { id: "b", text: "Refuse to send emails", isCorrect: false },
      { id: "c", text: "Acknowledge, then redirect to a low-pressure in-person visit", isCorrect: true },
      { id: "d", text: "Transfer them to another department", isCorrect: false },
    ],
  },
  {
    id: "q6",
    question: "What is the best approach when a caller asks for the price?",
    options: [
      { id: "a", text: "Give the MSRP immediately", isCorrect: false },
      { id: "b", text: "Say you can't discuss pricing on the phone", isCorrect: false },
      { id: "c", text: "Explain pricing depends on factors and invite them in", isCorrect: true },
      { id: "d", text: "Quote the lowest possible price", isCorrect: false },
    ],
  },
  {
    id: "q7",
    question: "After setting an appointment from an inbound call, you should:",
    options: [
      { id: "a", text: "Wait for them to show up", isCorrect: false },
      { id: "b", text: "Send a text confirmation immediately", isCorrect: true },
      { id: "c", text: "Call them every hour to remind them", isCorrect: false },
      { id: "d", text: "Assume they'll remember", isCorrect: false },
    ],
  },
  {
    id: "q8",
    question: "When a caller says 'I'm not ready to buy yet,' the best response is:",
    options: [
      { id: "a", text: "End the call and follow up later", isCorrect: false },
      { id: "b", text: "Push harder for a commitment", isCorrect: false },
      { id: "c", text: "Remove pressure and still invite them in to gather information", isCorrect: true },
      { id: "d", text: "Offer a discount to close today", isCorrect: false },
    ],
  },
  {
    id: "q9",
    question: "What common mistake should you avoid on inbound calls?",
    options: [
      { id: "a", text: "Asking for the caller's name", isCorrect: false },
      { id: "b", text: "Quoting prices before understanding their needs", isCorrect: true },
      { id: "c", text: "Recommending vehicles", isCorrect: false },
      { id: "d", text: "Offering appointment times", isCorrect: false },
    ],
  },
  {
    id: "q10",
    question: "Why is smiling important when answering the phone?",
    options: [
      { id: "a", text: "It helps you remember the script", isCorrect: false },
      { id: "b", text: "It comes through in your voice and builds rapport", isCorrect: true },
      { id: "c", text: "It's required by the dealership", isCorrect: false },
      { id: "d", text: "It helps you speak faster", isCorrect: false },
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
  firstImpression: {
    title: "The First Impression",
    knowledgeCheckKey: "firstImpression",
    content: [
      {
        type: "concept",
        title: "The First 10 Seconds",
        description: "Your greeting sets the tone for the entire call. You have 10 seconds to establish professionalism and build rapport. A caller decides within moments whether they trust you enough to continue the conversation.",
      },
      {
        type: "script",
        title: "Standard Greeting Script",
        script: `"Thank you for calling [Dealership Name], this is [Your Name] in sales. How may I help you today?"`,
        notes: [
          "Smile when you answer — it comes through in your voice",
          "Speak clearly and at a moderate pace",
          "Use your first name only — it's more personal",
          "Stand up if possible — it gives your voice more energy",
        ],
      },
      {
        type: "tip",
        title: "Setting the Right Tone",
        items: [
          "Answer within 3 rings — every extra ring loses trust",
          "Match your energy to the caller — enthusiastic callers want enthusiasm, cautious callers want calm",
          "Never let the phone ring to voicemail during business hours",
          "Avoid background noise — step into a quiet area if needed",
        ],
      },
    ],
  },
  care: {
    title: "The CARE Framework",
    knowledgeCheckKey: "care",
    content: [
      {
        type: "concept",
        title: "What Is CARE?",
        description: "CARE is a 4-step framework for handling every inbound call: Capture contact info, Ask about their needs, Recommend vehicles, and Engage them toward an appointment. Following this structure ensures you never miss a critical step.",
      },
      {
        type: "process",
        title: "The CARE Steps",
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
            script: `"The best way to see if this is the right fit is to come take a look. What works better for you — today or tomorrow?"`,
          },
        ],
      },
      {
        type: "tip",
        title: "Common Mistakes to Avoid",
        items: [
          "Don't quote prices over the phone — invite them in instead",
          "Don't let them hang up without getting contact info",
          "Don't answer questions about specific vehicles until you know their needs",
          "Don't put them on hold for more than 30 seconds",
        ],
      },
    ],
  },
  appointment: {
    title: "Setting the Appointment",
    knowledgeCheckKey: "appointment",
    content: [
      {
        type: "concept",
        title: "The Goal: Firm Appointments That Show",
        description: "Anyone can set an appointment. The skill is setting appointments that actually show. This requires creating value, confirming commitment, and proper follow-up.",
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
            script: `"Perfect, I'll put you down for 4pm today. Now, I'm going to prepare everything and have the vehicles ready — can I count on you to be here?"`,
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
    title: "Handling Inbound Objections",
    knowledgeCheckKey: "objections",
    content: [
      {
        type: "concept",
        title: "Why Callers Object",
        description: "Most inbound call objections are about avoiding commitment. The caller is interested — they called you — but they want more information before taking the next step. Your job is to acknowledge their concern and redirect toward the appointment.",
      },
      {
        type: "process",
        title: "Common Inbound Objections & Responses",
        steps: [
          {
            name: `"What's the price?"`,
            description: "They want to know before committing to visit",
            script: `"Great question — pricing depends on a few factors like trade-in value and available incentives. I want to make sure I give you accurate numbers. The best way to do that is to spend about 15 minutes together so I can understand exactly what you need. Does [time] work for you?"`,
          },
          {
            name: `"Just email me the information"`,
            description: "They want to avoid committing to a visit",
            script: `"I'd be happy to send some info. What specifically would you like me to include? ... You know, honestly, an email can't answer your questions the way I can in person. Let me suggest this: come in for 15 minutes, and if it's not for you, I'll email you anything you need. Does [time] work?"`,
          },
          {
            name: `"I'm not ready to buy yet"`,
            description: "They feel pressured",
            script: `"No problem at all — there's no pressure. Most people aren't ready to buy on their first visit, and that's completely fine. This is just about gathering information and seeing what's out there. When would be a good time for you to take a look?"`,
          },
          {
            name: `"I'm still shopping around"`,
            description: "They want to compare options",
            script: `"That makes total sense — you should compare. In fact, why not add us to your list? We may have something that surprises you, and at least you'll have all the information you need to make the best decision. I have time today at [time] or tomorrow at [time]. Which is better?"`,
          },
        ],
      },
      {
        type: "tip",
        title: "The Inbound Objection Mindset",
        items: [
          "They called you — that means they're interested. Every objection is a request for more information.",
          "Don't argue — acknowledge, then redirect to the appointment",
          "Keep your tone friendly and low-pressure",
          "If they say no twice, respect it and leave the door open",
          "Always ask for permission to follow up later",
        ],
      },
    ],
  },
};

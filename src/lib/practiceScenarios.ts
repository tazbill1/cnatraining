import { PracticeScenarioData } from "@/components/learn/PracticeScenario";

// Module 1: Vehicle Selection Fundamentals
export const module1PracticeScenario: PracticeScenarioData = {
  id: "vs-price-objection",
  title: "The Online Price Comparison",
  customerSetup:
    "You've just completed a great vehicle presentation on a 2024 Honda CR-V. The customer seemed engaged and positive throughout. As you walk back inside, they pull out their phone.",
  customerQuote:
    "I found this exact same vehicle listed for $2,000 less at a dealership across town. Why should I pay more here?",
  decisionPoints: [
    {
      id: "dp1",
      prompt: "How do you respond to the price comparison?",
      options: [
        {
          id: "a",
          text: "\"That's a great find! Let me see if we can match that price for you.\"",
          quality: "good",
          feedback:
            "Acknowledging them is good, but immediately offering to match undermines your value proposition and invites a negotiation race to the bottom.",
          points: 1,
        },
        {
          id: "b",
          text: "\"I appreciate you sharing that. Online listings don't always tell the full story — there can be differences in condition, fees, and what's included. Let me walk you through exactly what you're getting here.\"",
          quality: "best",
          feedback:
            "This acknowledges without panic, reframes the conversation around value rather than price, and positions you as a guide — not a competitor.",
          points: 3,
        },
        {
          id: "c",
          text: "\"Those online prices are usually bait-and-switch. They add fees once you get there.\"",
          quality: "good",
          feedback:
            "While sometimes true, this sounds defensive and dismissive. It undermines trust rather than building it.",
          points: 1,
        },
      ],
    },
    {
      id: "dp2",
      prompt: "The customer listens but still looks skeptical. What's your next move?",
      context: "They haven't shut down, but they need more conviction.",
      options: [
        {
          id: "a",
          text: "Pull up the vehicle's condition report and walk them through the ACV-based pricing, showing how the value was determined by market data.",
          quality: "best",
          feedback:
            "Anchoring to third-party market data removes subjectivity and demonstrates transparency. This is the ACV approach in action — exactly what the module teaches.",
          points: 3,
        },
        {
          id: "b",
          text: "Offer to throw in free oil changes for a year to sweeten the deal.",
          quality: "good",
          feedback:
            "Adding value can work, but it skips the step of justifying the price first. You're solving a trust problem with incentives, which doesn't address the root concern.",
          points: 1,
        },
        {
          id: "c",
          text: "Ask what matters most to them about this purchase — is it strictly price, or is the overall experience and vehicle condition important too?",
          quality: "better",
          feedback:
            "This is a solid consultative move. It redirects the conversation to their priorities and opens the door to differentiate on value, not just dollars.",
          points: 2,
        },
      ],
    },
    {
      id: "dp3",
      prompt: "They seem more receptive now. How do you move toward a decision?",
      context: "The customer is no longer fixated on the other dealership's price.",
      options: [
        {
          id: "a",
          text: "\"Based on everything we've discussed, this vehicle checks every box for you. Let's take the next step and put the numbers together so you can see the full picture.\"",
          quality: "best",
          feedback:
            "This ties back to their needs, reinforces the value match, and transitions naturally to the next step without pressure. Clean, confident close.",
          points: 3,
        },
        {
          id: "b",
          text: "\"So, do you want to go ahead and buy it?\"",
          quality: "good",
          feedback:
            "Direct, but lacks finesse. It doesn't summarize the value built and can feel abrupt, especially after handling an objection.",
          points: 1,
        },
        {
          id: "c",
          text: "\"I don't want you to miss out — we've had a lot of interest in this one. Let me get the paperwork started.\"",
          quality: "good",
          feedback:
            "Urgency can work, but manufactured pressure erodes trust. The customer just pushed back on price — they need confidence, not pressure.",
          points: 1,
        },
      ],
    },
  ],
};

// Module 2: Trade Appraisal Process
export const module2PracticeScenario: PracticeScenarioData = {
  id: "ta-emotional-trade",
  title: "The Sentimental Trade-In",
  customerSetup:
    "A customer is trading in a 2016 Subaru Outback with 98,000 miles. It's in fair condition with some cosmetic wear. During the evaluation, they mention this was the car they drove their kids to school in for years.",
  customerQuote:
    "This car has been really good to us. I know the miles are up there, but it's been well-maintained. I'm hoping to get at least $12,000 for it.",
  decisionPoints: [
    {
      id: "dp1",
      prompt: "The customer just told you their expected trade value before you've started framing. How do you handle this?",
      options: [
        {
          id: "a",
          text: "\"I understand, and that's a fair expectation. Let's see what the appraisal comes back with.\"",
          quality: "good",
          feedback:
            "You're being polite, but you've just validated an expectation without framing the process. If the ACV comes in lower, they'll feel let down.",
          points: 1,
        },
        {
          id: "b",
          text: "\"I can tell this vehicle means a lot to you. Here's how our process works — we use a third-party evaluation system that looks at current market data and condition. It's the same for every vehicle. That way, we make sure the appraisal is fair and accurate.\"",
          quality: "best",
          feedback:
            "This acknowledges the emotional connection, then immediately sets the frame. By introducing the third-party system before any number, you prevent a personal reaction later.",
          points: 3,
        },
        {
          id: "c",
          text: "\"$12,000 might be tough — the market has been pretty soft on Outbacks lately.\"",
          quality: "good",
          feedback:
            "This is premature and creates adversarial tension. You're setting up a disappointment before the process has even started.",
          points: 1,
        },
      ],
    },
    {
      id: "dp2",
      prompt: "During the evaluation, you notice a panel gap on the rear quarter that suggests prior body work. The customer is watching you closely. What do you do?",
      options: [
        {
          id: "a",
          text: "Point it out to the customer and ask \"What happened here? Was it in an accident?\"",
          quality: "good",
          feedback:
            "Asking puts them on the defensive and introduces an uncomfortable conversation mid-evaluation. Document, don't interrogate.",
          points: 1,
        },
        {
          id: "b",
          text: "Take a photo of the panel gap, note it in your documentation, and continue the evaluation without comment.",
          quality: "best",
          feedback:
            "This follows the evaluation standard exactly: document what you see, make no commentary. Consistency and neutrality maintain credibility throughout.",
          points: 3,
        },
        {
          id: "c",
          text: "Skip it — it's minor and bringing it up might upset the customer.",
          quality: "good",
          feedback:
            "Ignoring it means the ACV could be inaccurate, leading to unexpected recon costs. Accuracy protects value — for everyone.",
          points: 1,
        },
      ],
    },
    {
      id: "dp3",
      prompt: "The ACV comes in at $8,500 — significantly below their $12,000 expectation. You're about to disclose. How do you present it?",
      options: [
        {
          id: "a",
          text: "\"So... the appraisal came back a bit lower than expected. It's $8,500. I know that's not what you were hoping for.\"",
          quality: "good",
          feedback:
            "Prefacing with 'lower than expected' and apologetic tone creates the very emotional response you're trying to avoid. You're inviting disappointment.",
          points: 1,
        },
        {
          id: "b",
          text: "\"Based on the market data and condition, your Outback appraises at $8,500. Combined with the pricing on the new vehicle, here's what the full picture looks like...\" and continue immediately into the purchase disclosure.",
          quality: "best",
          feedback:
            "This is textbook Step 3: state it as fact with no tone change, no pause, no apology. Then immediately transition to the purchase disclosure. Objections belong after the decision request, not during disclosure.",
          points: 3,
        },
        {
          id: "c",
          text: "\"The market value came in at $8,500. Let me explain how they arrived at that number...\"",
          quality: "better",
          feedback:
            "Better than apologizing, but explaining the number before presenting the full picture invites isolated negotiation on the trade before seeing the complete offer.",
          points: 2,
        },
      ],
    },
  ],
};

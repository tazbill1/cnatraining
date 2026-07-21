import type { DrillItem } from "@/components/drills/StreakDrill";

// Showroom Spot the Mistake — learners read a short scenario of a salesperson
// interacting with a customer and identify what the salesperson did wrong.
// Each mistake maps back to a step in the Road to the Sale: Meet & Greet,
// Rapport, Investigate, Walkaround, Bypass, etc.
export const spotTheMistakeDrillQuestions: DrillItem[] = [
  {
    id: "stm1",
    scenario:
      "A couple walks onto the lot. Before saying hello, the salesperson asks, \"Are you looking to buy today or just browsing?\"",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Qualifying before greeting — asking buying intent before building any rapport.",
        correct: true,
        why: "Rule one: greet first, qualify later. Leading with intent makes customers guard up and lie ('just looking').",
      },
      {
        text: "The salesperson didn't ask what vehicle they wanted.",
        correct: false,
        why: "That's the investigation step — it doesn't belong in the first 10 seconds either.",
      },
      {
        text: "The salesperson should have handed them a business card first.",
        correct: false,
        why: "A business card doesn't fix a bad opening. Warm human contact does.",
      },
    ],
  },
  {
    id: "stm2",
    scenario:
      "Customer says, \"I'm just looking today.\" Salesperson replies, \"Okay, well let me know if you have any questions,\" and walks away.",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "The salesperson bailed at the first sign of resistance instead of bypassing.",
        correct: true,
        why: "\"Just looking\" is a reflex, not a real answer. The move is to acknowledge and redirect, not retreat.",
      },
      {
        text: "The salesperson should have followed them silently to see what they liked.",
        correct: false,
        why: "Stalking is worse than bailing. The move is a warm bypass, not surveillance.",
      },
      {
        text: "The salesperson didn't offer a test drive.",
        correct: false,
        why: "You can't offer a test drive before you've even earned the right to a conversation.",
      },
    ],
  },
  {
    id: "stm3",
    scenario:
      "First 30 seconds on the lot, salesperson says, \"So what kind of monthly payment are you looking for?\"",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Talking money before building any value or fit.",
        correct: true,
        why: "Payment questions this early train the customer that the whole visit is a negotiation.",
      },
      {
        text: "The salesperson should have asked about their credit first.",
        correct: false,
        why: "Even worse — credit questions before rapport feel invasive and drive customers off the lot.",
      },
      {
        text: "The salesperson should have quoted a payment right away.",
        correct: false,
        why: "Quoting numbers without a vehicle picked or a trade valued is guaranteed rework.",
      },
    ],
  },
  {
    id: "stm4",
    scenario:
      "Customer points at a vehicle and says, \"How much is this one?\" Salesperson answers with the exact price on the sticker.",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Answered the price question instead of bypassing back to fit and value.",
        correct: true,
        why: "Once you throw out a number, the whole visit becomes a negotiation over that number.",
      },
      {
        text: "The salesperson should have quoted a lower price to hook them.",
        correct: false,
        why: "That's a bait-and-switch. It kills trust the second the real number shows up in the office.",
      },
      {
        text: "The salesperson should have refused to talk about price at all.",
        correct: false,
        why: "Refusing feels evasive. The right move is to acknowledge and redirect — not stonewall.",
      },
    ],
  },
  {
    id: "stm5",
    scenario:
      "During the walkaround, the salesperson lists every feature: \"This has AWD, heated seats, blind spot monitoring, adaptive cruise, a moonroof...\"",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Listing features instead of connecting features to the customer's needs (F.A.B.).",
        correct: true,
        why: "A feature dump is talking at a customer. F.A.B. connects each feature to a benefit that matters to them.",
      },
      {
        text: "The salesperson should have skipped the walkaround.",
        correct: false,
        why: "The walkaround is where value is built — you don't skip it, you do it better.",
      },
      {
        text: "The salesperson should have started with the engine specs.",
        correct: false,
        why: "Specs are features. Same problem — nothing tied to what the customer cares about.",
      },
    ],
  },
  {
    id: "stm6",
    scenario:
      "Customer says, \"I need to think about it.\" Salesperson says, \"Okay, here's my card — call me when you're ready,\" and lets them leave.",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Didn't investigate what they need to think about — just accepted the objection.",
        correct: true,
        why: "\"Think about it\" is code for an unaddressed concern. Ask what they'd like to think about, then handle it.",
      },
      {
        text: "The salesperson should have blocked the door.",
        correct: false,
        why: "Pressure loses the sale and the review. You investigate, you don't corner.",
      },
      {
        text: "The salesperson should have offered a bigger discount.",
        correct: false,
        why: "Discounts don't fix unaddressed concerns — they just teach the customer to ask for more.",
      },
    ],
  },
  {
    id: "stm7",
    scenario:
      "Customer says, \"My spouse isn't here — I can't make a decision without them.\" Salesperson replies, \"Okay, bring them back next time.\"",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Let them leave without confirming the appointment and getting the spouse on the phone.",
        correct: true,
        why: "The bypass is to acknowledge, offer to loop the spouse in now (call/FaceTime), and set a firm return appointment.",
      },
      {
        text: "The salesperson should have refused to talk to them alone.",
        correct: false,
        why: "You never refuse to help. You keep momentum and involve the spouse in the process.",
      },
      {
        text: "The salesperson should have insisted the spouse wasn't needed.",
        correct: false,
        why: "Overriding a customer's decision-making process destroys trust immediately.",
      },
    ],
  },
  {
    id: "stm8",
    scenario:
      "Salesperson takes the customer straight from the greeting to the manager's office to \"run numbers,\" skipping the walkaround and test drive.",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Skipped the value-building steps and jumped to negotiation with no emotional attachment to the vehicle.",
        correct: true,
        why: "Without a walkaround and test drive, there's no value built — every conversation becomes a fight over price.",
      },
      {
        text: "The salesperson should have gone to finance first.",
        correct: false,
        why: "Finance before value is even worse. You'd be selling a payment on a car they haven't fallen for.",
      },
      {
        text: "The salesperson should have skipped the manager entirely.",
        correct: false,
        why: "You need your manager involved — just not before the customer has picked a vehicle they love.",
      },
    ],
  },
  {
    id: "stm9",
    scenario:
      "Customer walks in referred by their friend. Salesperson launches straight into, \"So what are you looking for today?\" — never mentions the referral.",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Ignored the referral — a huge rapport and trust builder was left on the table.",
        correct: true,
        why: "A referral is instant credibility. \"How do you know so-and-so?\" opens rapport in seconds.",
      },
      {
        text: "The salesperson asked what they were looking for too soon.",
        correct: false,
        why: "The investigation question isn't the biggest miss here — the referral was.",
      },
      {
        text: "The salesperson should have called the referrer first.",
        correct: false,
        why: "You can text the referrer later. The immediate move is to use the connection in front of you.",
      },
    ],
  },
  {
    id: "stm10",
    scenario:
      "After a great test drive, the salesperson takes the customer back to the desk and immediately says, \"So do you want to buy it?\"",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Cold close with no trial close, no summary of value, and no transition.",
        correct: true,
        why: "A hard close after a test drive without a trial close and value recap feels abrupt and gets a reflex 'no'.",
      },
      {
        text: "The salesperson should have taken them on a second test drive first.",
        correct: false,
        why: "Test drives don't close the deal — transitioning from emotion to commitment does.",
      },
      {
        text: "The salesperson should have never asked at all.",
        correct: false,
        why: "You have to ask for the business. Just ask it well, after building to it.",
      },
    ],
  },
  {
    id: "stm11",
    scenario:
      "Customer says, \"I saw a lower price online at the dealer down the street.\" Salesperson replies, \"Yeah, but their cars are junk.\"",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Trashed the competition instead of acknowledging and building value in your own offer.",
        correct: true,
        why: "Bashing competitors makes you look small. Acknowledge, then differentiate on value, process, and service.",
      },
      {
        text: "The salesperson should have matched the price immediately.",
        correct: false,
        why: "Matching without investigating turns your dealership into the cheapest option — a race to the bottom.",
      },
      {
        text: "The salesperson should have told them to go buy from the other dealer.",
        correct: false,
        why: "Never send a live customer away. Handle the objection with a proper bypass.",
      },
    ],
  },
  {
    id: "stm12",
    scenario:
      "The customer's kid is climbing all over the showroom while the parent tries to talk to the salesperson. The salesperson keeps trying to push through the pitch, ignoring the chaos.",
    prompt: "What's the mistake?",
    choices: [
      {
        text: "Didn't address the real-world distraction — the parent can't focus, so no value is landing.",
        correct: true,
        why: "Great salespeople manage the environment: coloring books, snacks, a quiet space. A distracted parent buys nothing.",
      },
      {
        text: "The salesperson should have talked to the kid instead of the parent.",
        correct: false,
        why: "The kid isn't the decision-maker. But their comfort directly affects whether the parent can engage.",
      },
      {
        text: "The salesperson should have asked the parent to leave and come back alone.",
        correct: false,
        why: "You never send a live customer away — you accommodate the family and keep the process moving.",
      },
    ],
  },
];

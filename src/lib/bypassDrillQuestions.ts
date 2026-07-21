export interface DrillQuestion {
  id: string;
  objection: string;
  choices: {
    text: string;
    correct: boolean;
    why: string;
  }[];
}

// Each question presents a common customer objection.
// The "best" answer bypasses the objection without arguing, defending, or discounting —
// it acknowledges, redirects to value/fit, and keeps the process moving.
export const bypassDrillQuestions: DrillQuestion[] = [
  {
    id: "q1",
    objection: "\"What's your best price on this one?\"",
    choices: [
      {
        text: "\"I promise we'll get to numbers — but first, let's make sure this is even the right vehicle for you. Fair?\"",
        correct: true,
        why: "Acknowledges the question, earns permission to slow down, and redirects to fit before price.",
      },
      {
        text: "\"Our best price is right there on the window sticker.\"",
        correct: false,
        why: "Shuts the conversation down and forces you to defend the number instead of building value.",
      },
      {
        text: "\"Let me go grab my manager and see what we can do.\"",
        correct: false,
        why: "You're negotiating before you've built any value — you'll end up chasing price all day.",
      },
    ],
  },
  {
    id: "q2",
    objection: "\"I'm just looking, not buying today.\"",
    choices: [
      {
        text: "\"Totally fine — most people don't buy the first time they walk on a lot. Since you're here, mind if I show you a couple things most people miss?\"",
        correct: true,
        why: "Removes pressure, keeps rapport, and gets permission to keep the conversation going.",
      },
      {
        text: "\"Well, if you find something you love today, we can definitely make a deal.\"",
        correct: false,
        why: "Feels pushy — the customer just told you they aren't buying. You're arguing with them.",
      },
      {
        text: "\"Okay, let me know if you have any questions.\"",
        correct: false,
        why: "You just handed control of the visit to the customer and killed the process.",
      },
    ],
  },
  {
    id: "q3",
    objection: "\"I saw this car $2,000 cheaper online at another dealer.\"",
    choices: [
      {
        text: "\"That's great info — before we compare prices, let's make sure we're comparing the same car, options, and terms. Would that be helpful?\"",
        correct: true,
        why: "Doesn't defend price or attack the competitor — refocuses on apples-to-apples value.",
      },
      {
        text: "\"They're probably hiding fees — nobody actually sells for that price.\"",
        correct: false,
        why: "Trashing a competitor makes you look weak and puts the customer on the defensive.",
      },
      {
        text: "\"Let me see if we can match it.\"",
        correct: false,
        why: "You're discounting before you've built any value or verified the comparison is real.",
      },
    ],
  },
  {
    id: "q4",
    objection: "\"I need to talk to my spouse before I decide anything.\"",
    choices: [
      {
        text: "\"That makes sense — a decision like this should be made together. While you're here, let me gather everything you'll need so the conversation with them is easy.\"",
        correct: true,
        why: "Respects the objection, doesn't push, and still moves the process forward.",
      },
      {
        text: "\"Can you call them right now so we can wrap this up?\"",
        correct: false,
        why: "Too pushy — you'll trigger resistance and lose the customer's trust.",
      },
      {
        text: "\"No problem, just come back when you're both ready.\"",
        correct: false,
        why: "You gave up the opportunity to build value while they're in front of you.",
      },
    ],
  },
  {
    id: "q5",
    objection: "\"I want to think about it.\"",
    choices: [
      {
        text: "\"I get it — this is a big decision. Just so I know I did my job, what's the one thing you still want to think through?\"",
        correct: true,
        why: "Acknowledges the stall and gently surfaces the real objection without pressure.",
      },
      {
        text: "\"What's there to think about? Let's just do it.\"",
        correct: false,
        why: "Confrontational — pushes the customer away instead of bringing them closer.",
      },
      {
        text: "\"Okay, here's my card — call me when you're ready.\"",
        correct: false,
        why: "You just walked away from a live opportunity and gave up control.",
      },
    ],
  },
  {
    id: "q6",
    objection: "\"Can you just tell me the monthly payment?\"",
    choices: [
      {
        text: "\"Absolutely — payments matter. To give you a real number and not a guess, let me ask a couple quick questions first. Fair?\"",
        correct: true,
        why: "Acknowledges the ask, sets up the process, and earns the right to gather info.",
      },
      {
        text: "\"Probably around $500 a month.\"",
        correct: false,
        why: "Guessing a payment early anchors the customer and boxes you in later.",
      },
      {
        text: "\"We can't talk payments until you fill out a credit application.\"",
        correct: false,
        why: "Feels like a stall wall — you'll lose the customer's trust before you build any.",
      },
    ],
  },
  {
    id: "q7",
    objection: "\"I want to talk to the manager.\"",
    choices: [
      {
        text: "\"Happy to bring one over — before I do, help me understand what you're hoping they can help with, so I bring the right person.\"",
        correct: true,
        why: "Doesn't resist, but surfaces the real issue before escalating.",
      },
      {
        text: "\"You don't need to talk to the manager, I can handle everything.\"",
        correct: false,
        why: "Feels defensive — the customer will trust you less, not more.",
      },
      {
        text: "\"Sure, hold on.\" (walks away)",
        correct: false,
        why: "You gave up control of the deal without understanding what's happening.",
      },
    ],
  },
  {
    id: "q8",
    objection: "\"I've had a bad experience at dealerships before.\"",
    choices: [
      {
        text: "\"I'm sorry that happened — a lot of people feel that way. Here's what I do differently: [short version of your process]. Sound fair?\"",
        correct: true,
        why: "Validates the feeling and reframes with your process — builds trust fast.",
      },
      {
        text: "\"Well, we're not like other dealerships.\"",
        correct: false,
        why: "Every dealership says that — it's meaningless without proof.",
      },
      {
        text: "\"What happened?\" (settles in for a long story)",
        correct: false,
        why: "Wastes momentum reliving the old experience instead of building a new one.",
      },
    ],
  },
  {
    id: "q9",
    objection: "\"How much for my trade?\"",
    choices: [
      {
        text: "\"Great question — we'll get you a real number, not a guess. Let's find the right vehicle first so we're valuing the whole deal, not just one piece.\"",
        correct: true,
        why: "Acknowledges the ask and keeps trade out of the way until value is built.",
      },
      {
        text: "\"Probably around $10K — but I'd have to look at it.\"",
        correct: false,
        why: "Guessing a trade number anchors the customer and hurts you at the desk.",
      },
      {
        text: "\"We don't talk trade until you pick a car.\"",
        correct: false,
        why: "Blunt and rules-based — feels like a wall instead of a process.",
      },
    ],
  },
  {
    id: "q10",
    objection: "\"Just email me the out-the-door price.\"",
    choices: [
      {
        text: "\"I can absolutely do that — to make sure the number is accurate and not something we have to redo, let me confirm a couple things with you first.\"",
        correct: true,
        why: "Agrees to help, then earns time to qualify the vehicle, trade, and terms.",
      },
      {
        text: "\"We don't send prices by email.\"",
        correct: false,
        why: "You just lost the customer to a dealer who will.",
      },
      {
        text: "\"Sure, what's your email?\" (sends generic quote)",
        correct: false,
        why: "You gave up any chance to build value or a relationship — you're now just a quote.",
      },
    ],
  },
  {
    id: "q11",
    objection: "\"I'm not going to buy today no matter what.\"",
    choices: [
      {
        text: "\"Fair enough — my job today isn't to sell you a car, it's to help you figure out if this is the right one. Deal?\"",
        correct: true,
        why: "Removes pressure and repositions you as a guide, not a closer.",
      },
      {
        text: "\"You never know — the right deal might change your mind.\"",
        correct: false,
        why: "Argues with the customer and triggers resistance.",
      },
      {
        text: "\"Okay, well let me know if you need me.\" (walks away)",
        correct: false,
        why: "You just abandoned a real prospect who might buy tomorrow.",
      },
    ],
  },
  {
    id: "q12",
    objection: "\"I don't want to fill out anything or give you my info.\"",
    choices: [
      {
        text: "\"Totally understand — I don't need anything from you right now. Let's just look at some cars and see if there's even a fit first.\"",
        correct: true,
        why: "Respects the boundary, drops the pressure, and keeps the process alive.",
      },
      {
        text: "\"I have to get your info before I can show you anything.\"",
        correct: false,
        why: "That's a wall — the customer will leave and go to the next dealer.",
      },
      {
        text: "\"It's just for our records, it's no big deal.\"",
        correct: false,
        why: "Dismissive of a real concern — hurts trust before you've built any.",
      },
    ],
  },
];

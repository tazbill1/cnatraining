import type { DrillItem } from "@/components/drills/StreakDrill";

// Phone Opener Streak Drill — the first 30 seconds of an inbound sales call.
// The "best" answer greets warmly, controls the call, gets a name, and moves
// toward the appointment — without pitching price or product first.
export const phoneOpenerDrillQuestions: DrillItem[] = [
  {
    id: "po1",
    scenario: "Your phone rings. The caller ID shows an unknown local number. It's an inbound sales call.",
    promptLabel: "You pick up. What's the best opening?",
    prompt: "How should you answer the phone?",
    choices: [
      {
        text: "\"Thanks for calling My Auto Group, this is Jamie — how can I help you today?\"",
        correct: true,
        why: "Warm, branded, names yourself, and invites the customer to share why they called.",
      },
      {
        text: "\"Sales, this is Jamie.\"",
        correct: false,
        why: "Cold and transactional — no dealership brand, no welcome, no invitation to share.",
      },
      {
        text: "\"Hello?\"",
        correct: false,
        why: "Sounds like a personal phone. The customer has no idea they reached the right place.",
      },
    ],
  },
  {
    id: "po2",
    scenario: "Caller: \"Hi, I'm calling about the 2024 Outback you have listed online.\"",
    prompt: "What's the best next line?",
    choices: [
      {
        text: "\"Great — I can help with that. Before I pull it up, can I grab your name real quick?\"",
        correct: true,
        why: "Gets their name in the first 10 seconds. Without a name, you can't follow up if the call drops.",
      },
      {
        text: "\"Yep, it's still available. Want to come see it?\"",
        correct: false,
        why: "Skips the name and rushes to a close before you've earned any trust or built any value.",
      },
      {
        text: "\"Which Outback? We have a few.\"",
        correct: false,
        why: "Makes the customer do the work. You should be leading the call, not quizzing them.",
      },
    ],
  },
  {
    id: "po3",
    scenario: "You've greeted the caller and gotten their name (Sarah).",
    prompt: "What do you say next?",
    choices: [
      {
        text: "\"Sarah, so I can help you the best way possible — is this the number I can reach you back at if we get disconnected?\"",
        correct: true,
        why: "Locks in the callback number early. If the call drops (or they ghost), you have a way to reconnect.",
      },
      {
        text: "\"What's the best price you can do on that Outback, Sarah?\"",
        correct: false,
        why: "That's the customer's line, not yours. Don't hand them price control before you've built anything.",
      },
      {
        text: "\"Cool. So what's your budget?\"",
        correct: false,
        why: "Skips rapport and goes straight to money. You'll sound like every other salesperson.",
      },
    ],
  },
  {
    id: "po4",
    prompt: "\"What's your best price on that Outback?\"",
    choices: [
      {
        text: "\"That's a fair question — and I promise we'll get to numbers. First, let me make sure this is the right Outback for you. Sound good?\"",
        correct: true,
        why: "Acknowledges the question, earns permission to slow down, redirects to fit before price.",
      },
      {
        text: "\"Our best price is right there on the ad — $28,995.\"",
        correct: false,
        why: "Shuts the call down. Now they'll shop your number against every other dealer.",
      },
      {
        text: "\"Let me check with my manager and I'll call you back.\"",
        correct: false,
        why: "Loses control of the call and gives them a reason to hang up and shop elsewhere.",
      },
    ],
  },
  {
    id: "po5",
    scenario: "Caller: \"I'm just calling around to a few dealers to compare.\"",
    prompt: "Best response?",
    choices: [
      {
        text: "\"Smart move — most people do. What matters most to you as you compare: the vehicle, the payment, or the dealership experience?\"",
        correct: true,
        why: "Doesn't defend or push. Investigates what they're actually looking for so you can position value.",
      },
      {
        text: "\"Well, no one's going to beat our price.\"",
        correct: false,
        why: "Puts you in a price war before you've built any value. You just gave them permission to negotiate.",
      },
      {
        text: "\"Okay, well, let me know when you're ready.\"",
        correct: false,
        why: "You just gave up. They'll buy from whoever engages with them next.",
      },
    ],
  },
  {
    id: "po6",
    prompt: "\"Do you have the 2024 Outback Premium in silver?\"",
    choices: [
      {
        text: "\"Let me check the exact one you're looking at — while I pull that up, are you looking for the Premium specifically, or is the trim flexible?\"",
        correct: true,
        why: "Keeps them on the line, investigates real needs, and buys time to check inventory properly.",
      },
      {
        text: "\"I'm not sure, let me check and call you back.\"",
        correct: false,
        why: "Never let a hot caller off the phone. Once they hang up, most never answer again.",
      },
      {
        text: "\"Yep, we've got it.\" (without actually checking)",
        correct: false,
        why: "Lying about inventory blows up trust the moment they walk in and find out. Never bait-and-switch.",
      },
    ],
  },
  {
    id: "po7",
    scenario: "You've built rapport, gotten Sarah's name and callback number, and confirmed the vehicle fits.",
    prompt: "What's the goal of this call now?",
    choices: [
      {
        text: "Set a firm appointment with a specific day and time.",
        correct: true,
        why: "The purpose of a phone call is to set the appointment. Nothing sells over the phone — people buy in person.",
      },
      {
        text: "Give her a final price so she can decide from home.",
        correct: false,
        why: "Pricing over the phone kills the deal. She'll shop your number and never come in.",
      },
      {
        text: "Email her the full inventory list so she can browse.",
        correct: false,
        why: "Passive. You just handed her a shopping list and lost control of the process.",
      },
    ],
  },
  {
    id: "po8",
    prompt: "How should you ask for the appointment?",
    choices: [
      {
        text: "\"Sarah, I've got time at 5:30 today or 10:00 tomorrow — which one works better for you?\"",
        correct: true,
        why: "Assumes the appointment and offers two specific choices. Much stronger than 'when can you come in?'",
      },
      {
        text: "\"When would be a good time for you to stop by?\"",
        correct: false,
        why: "Too open. 'I'll think about it' or 'not sure' is the most common answer.",
      },
      {
        text: "\"Do you want to come see it sometime?\"",
        correct: false,
        why: "Weak and easy to say no to. 'Sometime' is never.",
      },
    ],
  },
  {
    id: "po9",
    scenario: "Sarah: \"I can't come in today, I'm at work.\"",
    prompt: "Best response?",
    choices: [
      {
        text: "\"Totally get it — what time do you get off? I'll block time for you so you're not waiting when you get here.\"",
        correct: true,
        why: "Acknowledges the objection, keeps momentum, and offers VIP treatment to lock the appointment.",
      },
      {
        text: "\"Okay, well, call me back when you're free.\"",
        correct: false,
        why: "You just gave the ball back to her. She won't call. Ever.",
      },
      {
        text: "\"That's fine, we're here all week.\"",
        correct: false,
        why: "Passive. No commitment, no next step, no reason for her to prioritize you.",
      },
    ],
  },
  {
    id: "po10",
    scenario: "You've set the appointment for 5:30 today.",
    prompt: "What's the final thing you should do before hanging up?",
    choices: [
      {
        text: "\"Great — I'll text you a confirmation with my direct number and the address. Ask for me when you walk in.\"",
        correct: true,
        why: "Confirms in writing, gives her a direct contact, and creates a personal expectation of you specifically.",
      },
      {
        text: "\"Perfect, see you then!\" (and hang up)",
        correct: false,
        why: "No confirmation, no direct contact, easy to blow off. Show rates drop without a text confirm.",
      },
      {
        text: "\"Okay, bye.\"",
        correct: false,
        why: "You just spent 10 minutes building rapport and ended it like a stranger. Reinforce the relationship.",
      },
    ],
  },
  {
    id: "po11",
    scenario: "Caller (angry tone): \"I already talked to someone yesterday and they never called me back!\"",
    prompt: "Best opening response?",
    choices: [
      {
        text: "\"I'm really sorry about that — that's not the experience we want you to have. I'll personally take care of you from here. Can I grab your name?\"",
        correct: true,
        why: "Owns it, resets the relationship, and takes control without blaming a coworker.",
      },
      {
        text: "\"That's weird, who did you talk to?\"",
        correct: false,
        why: "Interrogating an already-frustrated customer. They came for help, not an internal investigation.",
      },
      {
        text: "\"Sorry, we're really busy. What did you need?\"",
        correct: false,
        why: "Makes an excuse and dismisses the frustration. Guaranteed hang-up or bad review.",
      },
    ],
  },
  {
    id: "po12",
    scenario: "Caller: \"I just want to know if you take trade-ins.\"",
    prompt: "Best response?",
    choices: [
      {
        text: "\"Absolutely — we take trades every day. Are you thinking about replacing something specific? And what's your name so I can help you properly?\"",
        correct: true,
        why: "Answers the question, opens a conversation about the trade, and gets a name — all in one line.",
      },
      {
        text: "\"Yep.\"",
        correct: false,
        why: "One word won't build a customer. They'll hang up and keep shopping.",
      },
      {
        text: "\"Yes, but we won't know a value until we see it in person.\"",
        correct: false,
        why: "Technically true but shuts the conversation down. Use the trade question as an opening, not a wall.",
      },
    ],
  },
];

import type { DrillItem } from "@/components/drills/StreakDrill";

/**
 * Either/Or Close Match
 * Learners are shown a moment in the sale and pick the strongest either/or close.
 * Wrong answers are common weak asks: open-ended, yes/no, or "think about it" traps.
 */
export const eitherOrCloseQuestions: DrillItem[] = [
  {
    id: "eo-1",
    scenario: "You've built value, done the demo, and the customer is smiling in the showroom. Time to ask for the sale.",
    promptLabel: "Pick the strongest either/or close:",
    prompt: "Registration close",
    choices: [
      {
        text: "Would you like it registered as Bob or Robert?",
        correct: true,
        why: "Either/or on a minor point confirms the big commitment — you're closing on ownership without a yes/no.",
      },
      {
        text: "So, do you want to buy the car?",
        correct: false,
        why: "Yes/no closes give the customer an easy exit. Either/or forces a decision between two 'yeses.'",
      },
      {
        text: "What do you think so far?",
        correct: false,
        why: "Open-ended questions invite objections, not commitment. Get specific.",
      },
      {
        text: "Do you want to think about it?",
        correct: false,
        why: "Never hand the customer a stall — you'll get 'let me think about it' back every time.",
      },
    ],
  },
  {
    id: "eo-2",
    scenario: "Customer is seated at your desk after the demo, comfortable and engaged.",
    promptLabel: "Refreshments close:",
    prompt: "Which either/or gets them settling in?",
    choices: [
      {
        text: "Can I get you a coffee, water, or soda while we wrap this up?",
        correct: true,
        why: "The phrase 'wrap this up' assumes the deal. Choosing a drink is a micro-commitment to stay.",
      },
      {
        text: "Are you thirsty?",
        correct: false,
        why: "Yes/no. And it doesn't move the deal — it just asks about thirst.",
      },
      {
        text: "Want anything before you leave?",
        correct: false,
        why: "You just told them they're leaving. Language matters — assume the sale.",
      },
      {
        text: "We have a vending machine down the hall.",
        correct: false,
        why: "Not a close. You've handed the customer a task and lost the moment.",
      },
    ],
  },
  {
    id: "eo-3",
    scenario: "You're on the demo drive. You've just passed your landmark. The car is riding smooth.",
    promptLabel: "Landmark summary tie-down:",
    prompt: "Which is the best tie-down?",
    choices: [
      {
        text: "This drives great, doesn't it?",
        correct: true,
        why: "Tie-downs collect yes's. 45 yes's in 45 minutes ≈ 75% closing ratio.",
      },
      {
        text: "How do you feel about the ride?",
        correct: false,
        why: "Open-ended. Gives room for hesitation instead of a yes.",
      },
      {
        text: "Do you like it?",
        correct: false,
        why: "Weak and yes/no. Tie-downs are statements phrased as agreements — 'doesn't it?', 'don't you think?'",
      },
      {
        text: "This is probably a lot different from what you drive now.",
        correct: false,
        why: "Statement without a tie-down. No commitment attached.",
      },
    ],
  },
  {
    id: "eo-4",
    scenario: "You've pulled back onto the lot after the demo. The trade is parked at the side.",
    promptLabel: "Assumptive sold-line:",
    prompt: "Which line moves the deal forward?",
    choices: [
      {
        text: "Go ahead and pull up there on the sold row.",
        correct: true,
        why: "A confident statement — not a question. It either directs the buyer or flushes an early objection.",
      },
      {
        text: "Where would you like to park?",
        correct: false,
        why: "You handed the direction back to the customer. Lead the deal.",
      },
      {
        text: "Ready to head inside and see some numbers?",
        correct: false,
        why: "Skips the sold-line entirely. Miss the visual anchor of parking next to the trade.",
      },
      {
        text: "Want me to drive back?",
        correct: false,
        why: "Off-topic. Doesn't close, doesn't lead, doesn't build ownership.",
      },
    ],
  },
  {
    id: "eo-5",
    scenario: "Customer just verbally agreed to move forward with the deal.",
    promptLabel: "Strive for 5 — pick the best action-based close:",
    prompt: "What do you say next?",
    choices: [
      {
        text: "Can you please read me the VIN off your new car?",
        correct: true,
        why: "Action-based trial close — builds mental ownership of the new car. Classic Strive for 5.",
      },
      {
        text: "Do you want to sign now?",
        correct: false,
        why: "Yes/no. Also skips the ownership-transfer step that Strive for 5 is designed for.",
      },
      {
        text: "Cool, I'll go tell my manager.",
        correct: false,
        why: "You walked away from the customer at the peak moment. Keep them in motion with an action.",
      },
      {
        text: "So, ready?",
        correct: false,
        why: "Vague and yes/no. Strive for 5 uses concrete physical actions, not vague check-ins.",
      },
    ],
  },
  {
    id: "eo-6",
    scenario: "Customer likes the vehicle. Time to close on tint before they cool off.",
    promptLabel: "Accessories close:",
    prompt: "Which is the strongest ask?",
    choices: [
      {
        text: "Would you like the tint applied today, or would you prefer we schedule it next week?",
        correct: true,
        why: "Two 'yeses' — either answer confirms ownership of the vehicle.",
      },
      {
        text: "Do you want tint on it?",
        correct: false,
        why: "Yes/no invites 'no.' Either/or invites a preference.",
      },
      {
        text: "Tint is optional — let me know if you want it.",
        correct: false,
        why: "You just told the customer to take their time. Never leave a close open-ended.",
      },
      {
        text: "Everyone in this state gets tint.",
        correct: false,
        why: "Not a close, not personalized. No commitment being asked for.",
      },
    ],
  },
  {
    id: "eo-7",
    scenario: "Strive for 5 in motion. You've had them read the VIN. Next action.",
    promptLabel: "Strive for 5 — chain the next action:",
    prompt: "Pick the strongest next close:",
    choices: [
      {
        text: "Go ahead and place this sold tag on the front window so no one else looks at it.",
        correct: true,
        why: "Physical action + language of ownership. This is textbook Strive for 5.",
      },
      {
        text: "You should probably tell your spouse.",
        correct: false,
        why: "You just handed them an off-ramp to leave and 'think about it.'",
      },
      {
        text: "How does that feel?",
        correct: false,
        why: "Open-ended check-in. Kills momentum during the ownership transfer.",
      },
      {
        text: "Do you want to keep going?",
        correct: false,
        why: "Yes/no. And you've asked permission — never ask permission during Strive for 5.",
      },
    ],
  },
  {
    id: "eo-8",
    scenario: "Customer said 'let me think about it' after your first close attempt.",
    promptLabel: "You're on close #2 of 5. Do what?",
    prompt: "Which response is on-plan?",
    choices: [
      {
        text: "Mr. Customer, I guess my basic question is — do you like the car well enough to own it if I can get the numbers right?",
        correct: true,
        why: "The core close script. Reframes 'thinking about it' into the real question: is it the car, or the numbers?",
      },
      {
        text: "Okay, take my card and call me.",
        correct: false,
        why: "80% of sales close after the 5th attempt. You just stopped on #1.",
      },
      {
        text: "Sure, no pressure.",
        correct: false,
        why: "Kind — but 75% of salespeople stop after one attempt. Don't be one of them.",
      },
      {
        text: "Cool, let me know.",
        correct: false,
        why: "Zero closes attempted. The deal walks out the door.",
      },
    ],
  },
  {
    id: "eo-9",
    scenario: "Customer is at your desk. You need to confirm the buyer name on paperwork.",
    promptLabel: "Registration close:",
    prompt: "Best either/or:",
    choices: [
      {
        text: "Will this be registered in your name, or will someone else be listed too?",
        correct: true,
        why: "Either answer confirms the purchase. Perfect minor-point close.",
      },
      {
        text: "Who's buying the car?",
        correct: false,
        why: "Blunt and open-ended. Doesn't assume the sale.",
      },
      {
        text: "Just you, right?",
        correct: false,
        why: "Yes/no. And leading — customer may correct you defensively.",
      },
      {
        text: "You can figure that out later.",
        correct: false,
        why: "You just delayed the deal. Never postpone a close.",
      },
    ],
  },
  {
    id: "eo-10",
    scenario: "The 5 Penny Close reminder: pennies still in your left pocket.",
    promptLabel: "What does that tell you?",
    prompt: "What's the right move?",
    choices: [
      {
        text: "Keep asking — 80% of sales close after the 5th attempt.",
        correct: true,
        why: "That's the whole point of the 5 Penny system. Move a penny every close. Don't stop early.",
      },
      {
        text: "The customer isn't interested — wrap it up.",
        correct: false,
        why: "You're deciding for the customer. Ask again — differently.",
      },
      {
        text: "Give them space.",
        correct: false,
        why: "'Space' is where deals die. Change the approach, but keep closing.",
      },
      {
        text: "Bring in another salesperson.",
        correct: false,
        why: "A T.O. can help, but only after you've genuinely asked 5 times.",
      },
    ],
  },
  {
    id: "eo-11",
    scenario: "You're chaining Strive for 5. VIN read. Sold tag placed. Next.",
    promptLabel: "Move the ownership transfer forward:",
    prompt: "Best either/or or action close:",
    choices: [
      {
        text: "Go ahead and grab your registration and insurance out of your trade for me.",
        correct: true,
        why: "Physical action that pulls the customer out of the trade — releasing mental ownership of it.",
      },
      {
        text: "You still like the car, right?",
        correct: false,
        why: "Yes/no check-in mid-momentum. Trust the process — keep moving.",
      },
      {
        text: "Any last questions?",
        correct: false,
        why: "Invites hesitation. Ask for action, not questions.",
      },
      {
        text: "Should we take a break?",
        correct: false,
        why: "Never suggest a break during Strive for 5. Momentum is your ally.",
      },
    ],
  },
  {
    id: "eo-12",
    scenario: "You've earned commitment. Now the delivery hand-off.",
    promptLabel: "Wrap-up either/or:",
    prompt: "Which line closes with momentum?",
    choices: [
      {
        text: "Great — follow me. My manager will send you home in it right now. Can I get you a water or soda while we wrap this up?",
        correct: true,
        why: "Assumes ownership + directs movement + offers a micro-commitment. Textbook wrap.",
      },
      {
        text: "Alright, let me go run the paperwork. Be right back.",
        correct: false,
        why: "You've left the customer alone with their doubts. Keep them engaged.",
      },
      {
        text: "So what do you want to do?",
        correct: false,
        why: "You just re-opened the entire decision. Never invite the customer to re-decide.",
      },
      {
        text: "Cool, I'll email you the details.",
        correct: false,
        why: "Kills the deal. The customer is here, ready — never punt to email.",
      },
    ],
  },
];

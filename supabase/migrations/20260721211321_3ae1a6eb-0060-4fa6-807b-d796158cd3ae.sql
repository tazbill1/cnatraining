
DO $$
DECLARE
  v_dealership_id uuid := '8b22831e-9967-4a5f-b3f4-e1274bc5993c';
  v_module_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO dealership_modules (id, dealership_id, base_module_id, title, description, icon, sort_order, is_active, estimated_time, category)
  VALUES (v_module_id, v_dealership_id, 'showroom-turn-over', 'Showroom: The T.O. — Turn Over',
    'Use the Turn Over (T.O.) to keep control of the sale, save customers walking out the door, and get management involved at the right moments.',
    'Users', 10, true, '20-25 min', 'showroom');

  INSERT INTO dealership_module_sections (module_id, title, content_type, content_html, sort_order) VALUES
  (v_module_id, 'Why the T.O. Matters', 'text',
    '<h2>What is a T.O.?</h2>
<p>The <strong>Turn Over</strong> — commonly called the <strong>T.O.</strong> — is when you bring another person (usually a manager or team leader) into the sales process. It happens more than once in a good deal, and it does three things:</p>
<ul>
<li><strong>Keeps you in control</strong> of the process by involving leadership at planned moments.</li>
<li><strong>Gives the customer a second face</strong> — sometimes a different person unlocks trust or information they wouldn''t share with you.</li>
<li><strong>Moves stalled deals forward</strong> when your closes aren''t landing.</li>
</ul>
<blockquote>"A sale is not made by any one person, it is a group of people coming together with a common goal."</blockquote>
<p>There are three T.O. moments to master: <strong>Early Manager Involvement (E.M.I.)</strong>, the <strong>Lot T.O.</strong>, and the <strong>Move-the-Deal-Forward T.O.</strong></p>', 1),

  (v_module_id, 'The Early Manager Involvement (E.M.I.)', 'text',
    '<h2>Early Manager Involvement</h2>
<p>The E.M.I. is the most common T.O. and the easiest to build into your habit. It happens <strong>early in the process</strong> — usually when you head back to grab the keys for the vehicle you''re about to demo.</p>
<h3>When to trigger it</h3>
<ul>
<li>You''re heading to get keys for the demo vehicle.</li>
<li>The customer has landed on a specific vehicle and you''re about to walk out to it.</li>
</ul>
<h3>How to do it</h3>
<p>Alert your manager or team leader where you are in the process, then walk them over and make a warm introduction:</p>
<blockquote>"I just wanted to introduce you to <em>[Manager Name]</em>, one of the managers here. He/She loves to meet everyone that comes in."</blockquote>
<p>Then <strong>step back</strong> and let the manager lead. When the manager wraps up, you pick right back up with the sales process.</p>
<h3>Why it works</h3>
<ul>
<li>The customer meets a decision-maker <strong>before</strong> any negotiation starts.</li>
<li>Trust and credibility jump instantly.</li>
<li>Later T.O.s feel natural — the manager is already a familiar face.</li>
</ul>', 2),

  (v_module_id, 'The Lot T.O. — Saving the Walk-Out', 'text',
    '<h2>The Lot T.O.</h2>
<p>The <strong>Lot T.O.</strong> is one of the most critical moves to learn. Use it when a customer wants — or is about to — <strong>leave the lot</strong> without buying, and you can''t get the process back on track.</p>
<h3>Why it matters</h3>
<p>The reason the customer <em>says</em> they''re leaving is often not the real reason. A different face can uncover the true objection.</p>
<h3>The move</h3>
<p>Do <strong>not</strong> argue, plead, or try to close them one more time. Instead, use a quick, low-pressure line:</p>
<ul>
<li>"I have a great idea, follow me."</li>
<li>"Before you leave, come inside real quick so I can get you my business card and any other information you may need."</li>
</ul>
<p>Turn and walk. The customer will follow you inside. Alert the sales manager to what''s happening — where you are, what''s stalling — and let the manager take a run at uncovering what''s really going on.</p>
<h3>Do</h3>
<ul>
<li>Keep it casual and confident — no desperation.</li>
<li>Move first. Don''t ask permission.</li>
<li>Brief the manager <strong>before</strong> they engage the customer.</li>
</ul>
<h3>Don''t</h3>
<ul>
<li>Chase them across the lot.</li>
<li>Throw discounts at them in the parking lot.</li>
<li>Let them leave without at least one attempt at a Lot T.O.</li>
</ul>', 3),

  (v_module_id, 'Move the Deal Forward T.O.', 'text',
    '<h2>The "Move the Deal Forward" T.O.</h2>
<p>This T.O. is only used <strong>after</strong> you''ve done the work:</p>
<ol>
<li>Landmark summary close</li>
<li>Assumptive sold-line close</li>
<li>Handled objections with <strong>C.R.I.C.</strong></li>
</ol>
<p>If the objections still aren''t moving, it''s time to bring in the manager to turn.</p>
<h3>How to do it</h3>
<p>Alert your manager or team lead, tell them exactly where you are in the process and what the objection is, then walk them over.</p>
<p>If they haven''t met, introduce them:</p>
<blockquote>"I just wanted to introduce you to <em>[Manager Name]</em>, one of the managers here. He/She loves to meet everyone that comes in."</blockquote>
<p>If they already met during an E.M.I.:</p>
<blockquote>"You remember my manager <em>[Name]</em> from earlier — he just had a couple of questions."</blockquote>
<p>Then <strong>stay silent</strong> or fade back and wait for your manager to direct you.</p>
<h3>What NOT to do</h3>
<ul>
<li>Don''t turn the customer over as your first move — do the work first.</li>
<li>Don''t interrupt or "help" the manager once they''re engaged.</li>
<li>Don''t apologize for the T.O. — it''s part of the process, not a rescue.</li>
</ul>', 4),

  (v_module_id, 'Putting It Together', 'text',
    '<h2>The T.O. Rhythm</h2>
<p>In a good deal, your customer meets a manager <strong>at least twice</strong>:</p>
<ul>
<li><strong>Early</strong> — the E.M.I. as you head to the demo.</li>
<li><strong>Later</strong> — either a Lot T.O. (saving a walk-out) or a Move-the-Deal-Forward T.O. (breaking a stall).</li>
</ul>
<h3>Quick recap</h3>
<ul>
<li>E.M.I. = planned, early, warm intro. Builds trust before negotiation.</li>
<li>Lot T.O. = customer is walking. "Follow me" — get them inside, brief the manager.</li>
<li>Move Forward T.O. = closes attempted, objections handled, still stuck. Brief, introduce, fade back.</li>
</ul>
<p>The T.O. is not a rescue. It''s a <strong>team play</strong> you run on purpose.</p>', 5);

  INSERT INTO dealership_quiz_questions (module_id, question, options, explanation, sort_order) VALUES
  (v_module_id, 'What does T.O. stand for?',
    '[{"text":"Turn Over","correct":true},{"text":"Time Out","correct":false},{"text":"Take Over","correct":false},{"text":"Trade Offer","correct":false}]'::jsonb,
    'T.O. = Turn Over — bringing another person (usually a manager) into the sales process.', 1),
  (v_module_id, 'When is the best time to run an Early Manager Involvement (E.M.I.)?',
    '[{"text":"After the customer has said no three times","correct":false},{"text":"When you head back to grab the keys for the demo vehicle","correct":true},{"text":"Only if the customer specifically asks to speak to a manager","correct":false},{"text":"Right at the finance office","correct":false}]'::jsonb,
    'E.M.I. is a planned, early introduction — usually when you go grab the keys — so the customer meets a manager before any negotiation.', 2),
  (v_module_id, 'A customer says "I need to leave" and starts walking to their car. What''s the correct Lot T.O. move?',
    '[{"text":"Follow them out and try one more close in the parking lot","correct":false},{"text":"Offer a discount to keep them there","correct":false},{"text":"Say \"I have a great idea, follow me\" and walk toward the building","correct":true},{"text":"Let them go and text them tomorrow","correct":false}]'::jsonb,
    'The Lot T.O. is a confident, low-pressure redirect: move first, get them inside, and brief a manager who can uncover the real objection.', 3),
  (v_module_id, 'Which of these should you do BEFORE calling for a Move-the-Deal-Forward T.O.?',
    '[{"text":"Give the customer your cell phone number","correct":false},{"text":"Run the landmark summary close, assumptive sold-line close, and handle objections with C.R.I.C.","correct":true},{"text":"Drop the price by $1,000","correct":false},{"text":"Hand them a business card and let them leave","correct":false}]'::jsonb,
    'The Move Forward T.O. is not your first move — it comes after you''ve done the work of summarizing, closing, and handling objections.', 4),
  (v_module_id, 'After you introduce your manager during a T.O., what should you do?',
    '[{"text":"Keep pitching the vehicle to help the manager","correct":false},{"text":"Leave the room entirely","correct":false},{"text":"Stay silent or fade back and let the manager lead","correct":true},{"text":"Interrupt if the manager says something you disagree with","correct":false}]'::jsonb,
    'Once the T.O. is made, the manager leads. You stay silent or fade back until they direct you.', 5),
  (v_module_id, 'Why is the Lot T.O. so important?',
    '[{"text":"Managers always give bigger discounts than salespeople","correct":false},{"text":"The reason the customer says they''re leaving is often not the real reason","correct":true},{"text":"It''s required by state law","correct":false},{"text":"It gives the salesperson a break","correct":false}]'::jsonb,
    'A different face can uncover the real objection — customers will often tell a manager something they wouldn''t tell the original salesperson.', 6),
  (v_module_id, 'Which introduction line fits a Move-the-Deal-Forward T.O. when the manager already met the customer during the E.M.I.?',
    '[{"text":"\"You remember my manager from earlier — he just had a couple of questions.\"","correct":true},{"text":"\"I couldn''t close them, can you try?\"","correct":false},{"text":"\"They don''t want to buy — good luck.\"","correct":false},{"text":"\"I''m going on break, take over.\"","correct":false}]'::jsonb,
    'Reference the earlier meeting to keep continuity and keep the T.O. feeling natural, not like a rescue.', 7),
  (v_module_id, 'What is the ONE thing you should NOT do during a Lot T.O.?',
    '[{"text":"Move first and let the customer follow","correct":false},{"text":"Brief the manager before they engage","correct":false},{"text":"Chase the customer across the parking lot pleading","correct":true},{"text":"Use a low-pressure line like \"Follow me real quick\"","correct":false}]'::jsonb,
    'Chasing and pleading blows up the Lot T.O. Keep it casual, confident, and move first — the customer follows you inside.', 8);

  INSERT INTO custom_scenarios (dealership_id, module_id, name, description, category, buyer_type, difficulty, customer_name, personality, system_prompt, opening_line, estimated_time, is_active) VALUES
  (v_dealership_id, v_module_id,
    'The E.M.I. Warm-Up',
    'Practice the Early Manager Involvement. You''ve landed on a vehicle and are heading to grab keys — introduce the customer to the manager.',
    'showroom', 'ready', 'beginner', 'Dana',
    'Friendly, curious, generally agreeable. Enjoys chatting.',
    'You are Dana, a friendly customer at My Auto Group who has picked a vehicle you''re excited about. The salesperson is about to introduce you to their manager for an Early Manager Involvement (E.M.I.). Respond warmly, ask basic questions, and be receptive. Your job is to give the trainee a low-pressure rep of introducing a manager and stepping back. Stop the scene naturally after the introduction and a short conversation with the manager — do not push into negotiation. If the salesperson skips the introduction or gets pushy on numbers, gently redirect back to the intro.',
    'Great, I''m ready to take a look at that Outback! Are we heading out to it?',
    '5-7 min', true),
  (v_dealership_id, v_module_id,
    'The Lot T.O. — Walking Out',
    'Practice saving a customer who is heading for the door. Use a Lot T.O. line to get them back inside so a manager can uncover the real objection.',
    'showroom', 'skeptical', 'intermediate', 'Marcus',
    'Polite but done. Has an unspoken concern he hasn''t shared with the salesperson.',
    'You are Marcus. You''ve been on the lot for 40 minutes. You told the salesperson "I need to think about it" and are now walking toward your car. Your REAL concern is that you''re worried about your trade-in value and don''t want to look uninformed — but you have NOT told the salesperson this. If the salesperson chases, pleads, or throws discounts, stay firm and keep walking. If the salesperson uses a calm, confident Lot T.O. line ("Follow me real quick" / "Before you leave, come inside so I can get you my card"), agree and follow them. Stop the scene once you agree to come back inside — do NOT reveal the real objection to the salesperson (that''s for the manager). Keep responses short and realistic.',
    'Yeah, I appreciate your time, but I really just need to think about it. I''ll be in touch.',
    '5-8 min', true),
  (v_dealership_id, v_module_id,
    'Move the Deal Forward',
    'You''ve done the summary close, tried an assumptive close, and used C.R.I.C. on the objection — and the customer is still stuck. Call for the Move-the-Deal-Forward T.O.',
    'showroom', 'analytical', 'intermediate', 'Priya',
    'Analytical, polite, cautious. Won''t say yes without more comfort.',
    'You are Priya. You like the vehicle, but you have a lingering payment concern the salesperson has already tried to handle. You''re not walking out — you''re just stuck. If the salesperson tries to close you again themselves, politely decline. If the salesperson calls for a manager T.O. and introduces them properly ("You remember my manager from earlier..." or a fresh warm intro), engage with the manager. Stop the scene once the salesperson has made a proper T.O. introduction and stepped back — do not simulate the manager conversation in detail. Grade the trainee on: (1) briefing the manager before the intro, (2) using a warm, non-apologetic introduction, (3) stepping back / going silent after the intro.',
    'I don''t know... the payment is still higher than I was hoping. I just need a minute.',
    '6-9 min', true);

END $$;

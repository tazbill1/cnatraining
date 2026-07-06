DO $$
DECLARE
  v_dealership uuid := '8b22831e-9967-4a5f-b3f4-e1274bc5993c';
  v_module uuid := gen_random_uuid();
  v_next_sort int;
BEGIN
  SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_next_sort
  FROM public.dealership_modules WHERE dealership_id = v_dealership;

  INSERT INTO public.dealership_modules
    (id, dealership_id, title, description, icon, sort_order, is_active, estimated_time, video_url, video_title, category)
  VALUES (
    v_module, v_dealership,
    'Showroom: The Five-Point F.A.B. Walk-Around',
    'Achieving sales excellence with a structured walk-around: Hood, Passenger Side, Trunk, Driver Side, Interior — using F.A.B. tailored to S.P.A.C.E.D.',
    'Car', v_next_sort, true, '15 min',
    '/__l5e/assets-v1/2c2c2c93-9800-4e56-9065-00cddc59c45f/five-point-fab.mp4',
    'The Five-Point F.A.B. Walk-Around',
    'showroom'
  );

  INSERT INTO public.dealership_module_sections (module_id, title, content_type, content_html, sort_order) VALUES
  (v_module, 'Learning Objectives', 'text',
   '<p>By the end of this module, you will be able to:</p><ul><li>Execute a structured Five-Point Walk-Around: <strong>Hood → Passenger Side → Trunk → Driver Side → Interior</strong></li><li>Translate every feature into a <strong>Feature, Advantage, and Benefit</strong> the customer actually cares about</li><li>Match benefits to the six S.P.A.C.E.D. buyer motives</li><li>Use command + tie-down questions to build mental ownership</li><li>Finish the walk-around at the driver''s seat, ready for the demo drive</li></ul>', 0),

  (v_module, 'The Five-Point Route', 'text',
   '<p>Start where makes sense for the vehicle''s location — but <strong>where you FINISH matters most</strong>. Always end at the driver''s or passenger''s seat, ready for the demo.</p><ol><li><strong>Hood</strong> — engine, safety, performance features</li><li><strong>Passenger Side</strong> — comfort and convenience for the family/loved ones</li><li><strong>Trunk</strong> — cargo, utility, dependability</li><li><strong>Driver Side</strong> — driver-focused features, technology</li><li><strong>Interior</strong> — sit them down, hand them the keys</li></ol><p>Remember: <em>80% of buying and selling happens in the Presentation.</em> Where you start matters less than where you finish — build a picture the customer can relate to.</p>', 1),

  (v_module, 'F.A.B. — Feature, Advantage, Benefit', 'text',
   '<p>Every point on the walk-around should be delivered as F.A.B., tailored to what the customer cares about:</p><ul><li><strong>Feature</strong> — what it <em>is</em></li><li><strong>Advantage</strong> — what it <em>does</em></li><li><strong>Benefit</strong> — why <em>they</em> care (tied to S.P.A.C.E.D.)</li></ul><h4>Examples</h4><ul><li><strong>ABS Brakes</strong> — More reliable in emergencies, stops you quicker → <em>Safety</em></li><li><strong>Fuel Injection</strong> — Monitors fuel/air mixture for instant response → <em>Performance / Economy</em></li><li><strong>Seat Heater</strong> — Heats in 5-minute intervals, loosens sore muscles → <em>Comfort / Convenience</em></li><li><strong>Radial Tires</strong> — Computer-designed for greater traction, longer life → <em>Dependability</em></li></ul><p><em>Feature-only talk raises price; F.A.B. tailored to S.P.A.C.E.D. raises value.</em></p>', 2),

  (v_module, 'S.P.A.C.E.D. — Customer Needs to Listen For', 'text',
   '<p>Customers care about roughly <strong>20% of a vehicle''s features</strong> — the ones that solve <em>their</em> problem. Your job is to figure out which of these six drives them:</p><ul><li><strong>S</strong>afety</li><li><strong>P</strong>erformance</li><li><strong>A</strong>ppearance</li><li><strong>C</strong>omfort / Convenience</li><li><strong>E</strong>conomy</li><li><strong>D</strong>ependability</li></ul><p>Every benefit you deliver should tie back to one of these six words. If it doesn''t, you''re selling a feature they don''t care about.</p>', 3),

  (v_module, 'Command + Tie-Down: Build Mental Ownership', 'text',
   '<p>At every point, give a command that engages a sense (sound, smell, feel, touch), then immediately tie it down with a "yes" question:</p><ul><li>"Feel this leather. It feels great, doesn''t it?"</li><li>"Lift that hatch. It''s so convenient, isn''t it?"</li><li>"Push that button. That''s great, isn''t it?"</li><li>"Sit here. The seats are so comfortable, aren''t they?"</li></ul><p>Every "yes" is a small commitment that stacks toward ownership.</p>', 4),

  (v_module, 'Before You Start & How You Finish', 'text',
   '<h4>Vehicle-Ready Check</h4><ul><li>Clean, inside and out</li><li>Full (or near-full) tank</li><li>Battery / starts properly</li><li>Running smoothly</li></ul><h4>Transition to the Demo</h4><p>End at the driver''s/passenger''s seat.</p><ul><li>"Do you have a quick 5 minutes?"</li><li>"Buckle up…"</li></ul><p><strong>99% of buyers won''t buy without driving it first.</strong> The walk-around exists to earn the drive.</p>', 5),

  (v_module, 'Key Takeaways', 'text',
   '<ul><li>Five points: <strong>Hood, Passenger Side, Trunk, Driver Side, Interior</strong> — finish at the driver''s seat</li><li>Every point delivered as <strong>Feature → Advantage → Benefit</strong></li><li>Tie every benefit to one of the six S.P.A.C.E.D. motives</li><li>Use commands + tie-downs to build mental ownership</li><li>80% of the sale happens in the presentation — earn the drive</li></ul>', 6);

  INSERT INTO public.dealership_quiz_questions (module_id, question, options, explanation, sort_order) VALUES
  (v_module, 'What are the five points of the Five-Point Walk-Around, in the recommended order?',
   '[{"text":"Interior, Driver Side, Trunk, Passenger Side, Hood","correct":false},{"text":"Hood, Passenger Side, Trunk, Driver Side, Interior","correct":true},{"text":"Hood, Driver Side, Interior, Trunk, Passenger Side","correct":false},{"text":"It doesn''t matter — just cover them all","correct":false}]'::jsonb,
   'The route is Hood → Passenger Side → Trunk → Driver Side → Interior, so you finish at the driver''s/passenger''s seat ready for the demo.', 0),
  (v_module, 'What does F.A.B. stand for?',
   '[{"text":"Fast, Accurate, Bold","correct":false},{"text":"Feature, Advantage, Benefit","correct":true},{"text":"Find, Ask, Buy","correct":false},{"text":"Feature, Appearance, Brand","correct":false}]'::jsonb,
   'F.A.B. = Feature (what it is), Advantage (what it does), Benefit (why THEY care).', 1),
  (v_module, 'Which of the following is NOT one of the six S.P.A.C.E.D. buyer motives?',
   '[{"text":"Safety","correct":false},{"text":"Performance","correct":false},{"text":"Price","correct":true},{"text":"Dependability","correct":false}]'::jsonb,
   'S.P.A.C.E.D. = Safety, Performance, Appearance, Comfort/Convenience, Economy, Dependability. Price is not one of them.', 2),
  (v_module, 'A customer says "I just want something that will last." Which S.P.A.C.E.D. motive is that?',
   '[{"text":"Appearance","correct":false},{"text":"Economy","correct":false},{"text":"Dependability","correct":true},{"text":"Performance","correct":false}]'::jsonb,
   '"Last" is a Dependability cue. Tailor your F.A.B. to reliability and longevity features.', 3),
  (v_module, 'Why does where you FINISH the walk-around matter most?',
   '[{"text":"So you can end the conversation quickly","correct":false},{"text":"So you finish at the driver''s seat, ready for the demo drive","correct":true},{"text":"So the customer can leave easily","correct":false},{"text":"It only matters where you start","correct":false}]'::jsonb,
   'You finish at the driver''s/passenger''s seat so the natural next step is "Do you have a quick 5 minutes?" and the demo drive.', 4),
  (v_module, 'What is a "tie-down" in the walk-around?',
   '[{"text":"A price commitment","correct":false},{"text":"A yes-oriented question that follows a sensory command","correct":true},{"text":"A trade-in appraisal step","correct":false},{"text":"A finance disclosure","correct":false}]'::jsonb,
   'A tie-down is a "yes" question right after a sensory command — "Feel this leather. It feels great, doesn''t it?" — that builds mental ownership.', 5);
END $$;
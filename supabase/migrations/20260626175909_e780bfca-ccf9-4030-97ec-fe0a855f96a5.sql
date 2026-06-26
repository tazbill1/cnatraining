DO $$
DECLARE
  v_dealership uuid := '8b22831e-9967-4a5f-b3f4-e1274bc5993c';
  v_module uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.dealership_modules
    (id, dealership_id, title, description, icon, sort_order, is_active, estimated_time, video_url, video_title, category)
  VALUES (
    v_module, v_dealership,
    'Internet Skills – Module 1: Every Lead Deserves a Video',
    'Why personalized video crushes templated email — and the 30-second formula you can record today.',
    'Video', 5, true, '15 min',
    '/__l5e/assets-v1/58382bd5-d228-49d8-8b11-f120550ebf91/internet-module-1-video.mp4',
    'Every Lead Deserves a Video',
    'internet'
  );

  INSERT INTO public.dealership_module_sections (module_id, title, content_type, content_html, sort_order) VALUES
  (v_module, 'Learning Objectives', 'text',
   '<p>By the end of this module, you will be able to:</p><ul><li>Explain why personalized video outperforms templated email on every internet lead</li><li>Recite the 30-second video formula: <strong>Greet • Reference • Add One Thing • Invite Action</strong></li><li>Identify the do''s and don''ts that make a video feel real instead of cringy</li><li>Record and send a customer-ready video in under two minutes</li></ul>', 0),
  (v_module, 'Lesson 1: The Data Doesn''t Lie', 'text',
   '<p>Video isn''t a nice-to-have anymore — it''s the difference between a reply and radio silence.</p><ul><li><strong>81% lead-to-contact rate with video</strong> vs. ~30% industry average</li><li>Dealers using video sell <strong>2× more cars</strong> from the same lead volume</li><li><strong>3 of 4 shoppers expect a personalized video</strong> — but only 49% of dealers send one</li><li>Buyers watch ~20 videos before picking the two dealerships they''ll actually visit</li></ul><p>Translation: if you''re not sending video, you''re not even in the consideration set.</p>', 1),
  (v_module, 'Lesson 2: Why Video Works', 'text',
   '<h4>It''s Human</h4><p>A face and a voice build trust faster than any template. Buyers feel your energy before they shake your hand.</p><h4>It''s Different</h4><p>Every other dealer is sending "Just checking in." You''re sending a 30-second walkaround with their name on it. That''s how you stand out.</p><h4>It Gets Opened</h4><p>Emails with video see 2–3× higher open and engagement rates. People click play. They don''t click "Dear Valued Customer."</p><h4>It Creates Reciprocity</h4><p>When someone records a video just for you, you feel obligated to respond. That psychology works every single time.</p>', 2),
  (v_module, 'Lesson 3: The 30-Second Formula', 'text',
   '<p>Every video follows the same four-beat structure. Memorize it, then make it yours.</p><ol><li><strong>Greet by name</strong> — "Hey Sarah, this is Mike at My Auto Group." Immediately personal.</li><li><strong>Reference the vehicle</strong> — "Thanks for reaching out about the 2024 Tacoma." Prove you actually read the lead.</li><li><strong>Add one thing</strong> — "Great choice — this one has the TRD package and only 12K miles." Give them a reason to care.</li><li><strong>Invite action</strong> — "I''d love to answer your questions. Call, text, or just reply." Easy, not pushy.</li></ol><p><em>Sample track: "Hey [NAME], this is [YOU] over at My Auto Group. I saw you were checking out the [YEAR MODEL] — great choice. I pulled it up front so I could show you a couple things I think you''ll love. Give me a call or shoot me a text — I''m here to help. Talk soon!"</em></p>', 3),
  (v_module, 'Lesson 4: Do This, Not That', 'text',
   '<h4>Do This ✓</h4><ul><li>Shoot vertical (9:16) for text/email</li><li>Clean the car first — details matter on camera</li><li>Keep it under 60 seconds</li><li>Show your face — people buy from people</li></ul><h4>Not That ✗</h4><ul><li>Don''t wait for perfect — send it now</li><li>Don''t read from a script word-for-word</li><li>Don''t start with "Uhh, so, yeah…"</li><li>Don''t film in a dark showroom corner</li></ul>', 4),
  (v_module, 'Key Takeaways', 'text',
   '<ul><li>Video gets you in the buyer''s top-two consideration set</li><li>The formula is four beats: <strong>Greet • Reference • Add One Thing • Invite Action</strong></li><li>Real beats polished — under 60 seconds, vertical, your face on camera</li><li>If you didn''t send a video, you didn''t really respond to the lead</li></ul>', 5);

  INSERT INTO public.dealership_quiz_questions (module_id, question, options, explanation, sort_order) VALUES
  (v_module, 'What is the lead-to-contact rate when you use personalized video, vs. the industry average?',
   '[{"text":"About the same — 30%","correct":false},{"text":"81% with video vs. ~30% without","correct":true},{"text":"50% with video vs. 40% without","correct":false},{"text":"100% with video","correct":false}]'::jsonb,
   'Personalized video lifts lead-to-contact to roughly 81%, nearly triple the ~30% industry average.', 0),
  (v_module, 'Which is NOT one of the four beats of the 30-second video formula?',
   '[{"text":"Greet by name","correct":false},{"text":"Reference the vehicle","correct":false},{"text":"Quote your best price","correct":true},{"text":"Invite action","correct":false}]'::jsonb,
   'The four beats are Greet, Reference the Vehicle, Add One Thing, Invite Action. Pricing is never part of the video.', 1),
  (v_module, 'What orientation should you shoot a lead-response video in?',
   '[{"text":"Horizontal (16:9)","correct":false},{"text":"Vertical (9:16)","correct":true},{"text":"Square (1:1)","correct":false},{"text":"Doesn''t matter","correct":false}]'::jsonb,
   'Vertical (9:16) fills the screen on phones, which is where buyers open texts and emails.', 2),
  (v_module, 'A buyer watches roughly how many videos before they pick the two dealerships they''ll actually visit?',
   '[{"text":"2","correct":false},{"text":"5","correct":false},{"text":"20","correct":true},{"text":"50","correct":false}]'::jsonb,
   'CDK research shows buyers watch about 20 videos before short-listing two dealerships. If you''re not in the videos, you''re not in the short list.', 3),
  (v_module, 'You just got an internet lead on a 2024 Tacoma. What is the best first move?',
   '[{"text":"Send a templated thanks-for-your-interest email","correct":false},{"text":"Wait until you have a price quote ready","correct":false},{"text":"Record a 30-second personalized video with the vehicle in the background","correct":true},{"text":"Call once, leave a voicemail, move on","correct":false}]'::jsonb,
   'The fastest, highest-converting first response is a personalized video. Price and follow-up can come after you have created the human connection.', 4);

  INSERT INTO public.dealership_practice_scenarios
    (module_id, difficulty, title, customer_setup, customer_quote, decision_points, sort_order, category)
  VALUES (
    v_module, 'beginner',
    'Record Your First Lead-Response Video',
    'A fresh internet lead just came in. Sarah Mitchell submitted a request on a 2024 Toyota Tacoma TRD with 12K miles, listed at $38,900. She gave her name, email, and phone number — no other notes. You have the vehicle pulled up front and your phone in hand. Record the video she will actually watch.',
    'Hey, this is Sarah — I saw the Tacoma on your site. Is it still available?',
    '[
      {"label":"Greet by name","required":true,"hint":"Open with her first name and yours, plus the dealership."},
      {"label":"Reference the specific vehicle","required":true,"hint":"Name the year, model, and something specific from her lead."},
      {"label":"Add one thing that matters","required":true,"hint":"TRD package, low miles, color, fresh detail — pick one detail and call it out."},
      {"label":"Invite low-friction action","required":true,"hint":"Call, text, or reply — make it easy, not pushy."},
      {"label":"Keep it under 60 seconds and conversational","required":false,"hint":"No script reading. Real beats polished."}
    ]'::jsonb,
    0, 'internet'
  );
END $$;
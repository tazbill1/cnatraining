# Roadmap — Showroom courses match the handbook

## Backend hardening
- [ ] Custom per-user AI limiter — awaiting confirmation of custom-limiter tradeoff (30/minute, 1,000/day; Super Admin exempt)
- [x] Private training videos with authenticated signed access; logos remain public
- [x] Friendly AI credit/rate errors and clear missing-key diagnostics
- [x] Gateway transcription migration with unchanged voice contract and live speech test (200 with accurate spoken transcript)

## Invitation-only security
- [x] Enforce invitations for every new signup, including Google
- [x] Guard all five AI functions and display dealership-access errors
- [x] Test signup and AI access protections (six regression tests; live uninvited signup rollback and existing Super Admin access verified)

## Score integrity
- [x] Persist roleplay evaluations on the server
- [x] Validate and record game results and course quizzes on the server
- [x] Remove direct client score/completion writes and tighten grants/policies
- [x] Run security regression tests and verify access protections (13 tests; live forged-write denial, quiz failure, and signed-in game save/readback)

- [x] Reorder showroom courses to the desk card ("Road to the Sale") order
- [x] Rebuild "The Sales Process: The Big Picture" as the intro course
- [x] Cleaner, wider lesson layout
- [x] Rewrite 14 showroom courses from handbook chapters (lessons + 8-question quizzes)
- [ ] Leasing: kept existing content (handbook has little leasing material) — awaiting user decision
- [ ] User review of rewritten courses; roleplays to retune if needed
- Rules: keep roleplays, no manager sign-offs

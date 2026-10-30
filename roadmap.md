# Roadmap — Showroom courses match the handbook

## Consistency and recovery batch
- [x] One certification-progress definition across all displays (2/23 = 9% verified)
- [x] Shared dealership user/completed-session counts for Team and Admin (8 users, 3 completed sessions verified before scoring test)
- [x] Team course titles and consistent category breakdown
- [x] Source-derived Auth statistics and shared session titles/checklist label
- [x] Password recovery formats and 8-character minimum on reset/signup (existing session UI verified; PKCE/hash regression tested)
- [x] Structured evaluation with explicit failure and Retry (live Retry produced score and Results page)
- [x] Regression and signed-in flow verification (42 tests passed; new test sessions added, no pre-existing records modified)

## Backend hardening
- [x] Implement confirmed custom per-user AI limiter (30/minute, rolling 1,000/24 hours; Super Admin exempt)
- [x] Server-issued passing-course certificates and insert-only qualifying backfill (two recovered certificates: 88%, 100%)
- [x] Router-level signed-in and Team/Admin role guards (existing manager/super_admin roles)
- [x] Verify 30 regression tests, all five deployed administrator-exempt paths, certificates visible, signed-out redirects and Super Admin navigation
- [ ] Live concurrent cap/issuance integration test — blocked by unavailable service-role test credentials; retained SQL/Deno tests require privileged test environment
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

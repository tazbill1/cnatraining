// Shared helper: sends the "game-assigned" app email (initial or reminder)
// for one game_assignments row, then stamps notified_at / reminder_sent_at.
// Games live in the app code, not the database: the assignment key is the
// game's drill_scores drill_key. dealership_drills.title_override (stored
// under the registry id) wins over the built-in title.

import { sendAppEmail } from './sendAppEmail.ts'

const SITE_NAME = 'Automotive Sales Pro'
const SITE_URL = 'https://automotivesalespro.com'

export interface DrillMeta {
  /** Registry id used by dealership_drills overrides. */
  configKey: string
  title: string
  description: string
  href: string
}

// Mirrors the assignable entries of the frontend drill registry (src/lib/drills.ts).
export const DRILL_META: Record<string, DrillMeta> = {
  'phone_opener_drill_best_streak': {
    configKey: 'phone-opener',
    title: 'Phone Opener Streak Drill',
    description: 'Nail the first 30 seconds of an inbound call, over and over.',
    href: '/drills/phone-opener',
  },
  'bypass_drill_best_streak': {
    configKey: 'bypass',
    title: 'Bypass Streak Drill',
    description: 'Work past "just looking" and other quick objections.',
    href: '/drills/bypass',
  },
  'spot_the_mistake_drill_best_streak': {
    configKey: 'spot-the-mistake',
    title: 'Spot the Mistake',
    description: 'Catch the mistake in each real sales floor moment.',
    href: '/drills/spot-the-mistake',
  },
  'spaced_match_best_streak': {
    configKey: 'spaced-match',
    title: 'S.P.A.C.E.D. Match',
    description: 'Match each customer moment to the right S.P.A.C.E.D. step.',
    href: '/drills/spaced-match',
  },
  'either_or_close_best_streak': {
    configKey: 'either-or-close',
    title: 'Either/Or Close Match',
    description: 'Match the moment to the right either/or close.',
    href: '/drills/either-or-close',
  },
  'cric_match_best_streak': {
    configKey: 'cric-match',
    title: 'C.R.I.C. Category Match',
    description: 'Sort each objection into the right C.R.I.C. bucket.',
    href: '/drills/cric-match',
  },
  'hot_button_best_streak': {
    configKey: 'hot-button',
    title: 'Hot Button Detector',
    description: 'Find what the customer really cares about.',
    href: '/drills/hot-button',
  },
  'product_quiz_best_streak': {
    configKey: 'product-quiz',
    title: 'Timed Product Quiz',
    description: 'Timed product-knowledge questions for your dealership.',
    href: '/drills/product-quiz',
  },
  'wrong_claim_best_streak': {
    configKey: 'wrong-claim',
    title: 'Spot the Wrong Claim',
    description: "Find the false product claim before it costs you a deal.",
    href: '/drills/wrong-claim',
  },
  'comparison_best_streak': {
    configKey: 'comparison',
    title: 'Us vs Them',
    description: 'Know where your lineup beats the competition.',
    href: '/drills/comparison',
  },
  'awd_quiz_best_streak': {
    configKey: 'awd-quiz',
    title: 'Subaru AWD Know-How',
    description: 'Timed questions on Subaru AWD and rival systems.',
    href: '/drills/awd-quiz',
  },
}

export function getDrillMeta(key: string): DrillMeta | null {
  return DRILL_META[key] || null
}

export function formatDueDate(due: string | null | undefined): string {
  if (!due) return ''
  const d = new Date(`${due}T12:00:00Z`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export async function sendGameAssignmentEmail(
  // deno-lint-ignore no-explicit-any
  admin: any,
  _supabaseUrl: string,
  _serviceKey: string,
  assignment: {
    id: string
    user_id: string
    drill_key: string
    dealership_id: string | null
    due_date: string | null
    assigned_by: string | null
  },
  isReminder: boolean,
): Promise<boolean> {
  const meta = getDrillMeta(assignment.drill_key)
  if (!meta) return false
  const [{ data: profile }, { data: override }, { data: by }] = await Promise.all([
    admin.from('profiles').select('email, full_name').eq('user_id', assignment.user_id).maybeSingle(),
    assignment.dealership_id
      ? admin
          .from('dealership_drills')
          .select('title_override')
          .eq('dealership_id', assignment.dealership_id)
          .eq('drill_key', meta.configKey)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    assignment.assigned_by
      ? admin.from('profiles').select('full_name').eq('user_id', assignment.assigned_by).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  if (!profile?.email) return false
  const gameTitle = override?.title_override || meta.title

  const firstName = (profile.full_name || '').trim().split(/\s+/)[0] || ''
  const ok = await sendAppEmail({
    templateName: 'game-assigned',
    recipientEmail: profile.email,
    idempotencyKey: `game-${isReminder ? 'reminder' : 'assigned'}-${assignment.id}`,
    templateData: {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      firstName,
      gameTitle,
      gameDescription: meta.description,
      gameUrl: `${SITE_URL}${meta.href}`,
      dueDateLabel: formatDueDate(assignment.due_date),
      assignedByName: by?.full_name || '',
      isReminder,
    },
    metadata: { assignment_id: assignment.id, user_id: assignment.user_id, drill_key: assignment.drill_key },
  })
  if (!ok) return false
  await admin
    .from('game_assignments')
    .update(isReminder ? { reminder_sent_at: new Date().toISOString() } : { notified_at: new Date().toISOString() })
    .eq('id', assignment.id)
  return true
}

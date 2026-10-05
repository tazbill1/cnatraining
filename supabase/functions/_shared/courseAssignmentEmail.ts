// Shared helper: sends the "course-assigned" app email (initial or reminder)
// for one course_assignments row, then stamps notified_at / reminder_sent_at.

import { sendAppEmail } from './sendAppEmail.ts'

const SITE_NAME = 'Automotive Sales Pro'
const SITE_URL = 'https://automotivesalespro.com'

export function formatDueDate(due: string | null | undefined): string {
  if (!due) return ''
  const d = new Date(`${due}T12:00:00Z`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export async function sendCourseAssignmentEmail(
  // deno-lint-ignore no-explicit-any
  admin: any,
  _supabaseUrl: string,
  _serviceKey: string,
  assignment: { id: string; user_id: string; module_id: string; due_date: string | null; assigned_by: string | null },
  isReminder: boolean,
): Promise<boolean> {
  const [{ data: profile }, { data: mod }, { data: by }] = await Promise.all([
    admin.from('profiles').select('email, full_name').eq('user_id', assignment.user_id).maybeSingle(),
    admin.from('dealership_modules').select('title, description').eq('id', assignment.module_id).maybeSingle(),
    assignment.assigned_by
      ? admin.from('profiles').select('full_name').eq('user_id', assignment.assigned_by).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  if (!profile?.email || !mod) return false

  const firstName = (profile.full_name || '').trim().split(/\s+/)[0] || ''
  const ok = await sendAppEmail({
    templateName: 'course-assigned',
    recipientEmail: profile.email,
    idempotencyKey: `course-${isReminder ? 'reminder' : 'assigned'}-${assignment.id}`,
    templateData: {
      siteName: SITE_NAME,
      siteUrl: SITE_URL,
      firstName,
      courseTitle: mod.title,
      courseDescription: mod.description || '',
      courseUrl: `${SITE_URL}/learn/dealership/${assignment.module_id}`,
      dueDateLabel: formatDueDate(assignment.due_date),
      assignedByName: by?.full_name || '',
      isReminder,
    },
    metadata: { assignment_id: assignment.id, user_id: assignment.user_id, module_id: assignment.module_id },
  })
  if (!ok) return false
  await admin
    .from('course_assignments')
    .update(isReminder ? { reminder_sent_at: new Date().toISOString() } : { notified_at: new Date().toISOString() })
    .eq('id', assignment.id)
  return true
}

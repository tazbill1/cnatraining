import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'
import { sendCourseAssignmentEmail } from '../_shared/courseAssignmentEmail.ts'

// Managers (own dealership) and super admins assign a dealership course to the
// whole team or to individuals, and remove assignments. Each newly assigned
// person gets one "course-assigned" email.

const Assign = z.object({
  action: z.literal('assign'),
  dealershipId: z.string().uuid(),
  moduleId: z.string().uuid(),
  scope: z.enum(['team', 'individual']),
  userIds: z.array(z.string().uuid()).max(500).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
})
const Unassign = z.object({
  action: z.literal('unassign'),
  dealershipId: z.string().uuid(),
  moduleId: z.string().uuid(),
  userId: z.string().uuid().optional(), // omit = remove the whole-team assignment + all its rows
})
const Body = z.discriminatedUnion('action', [Assign, Unassign])

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.slice(7))
    const callerId = claims?.claims?.sub
    if (claimsErr || !callerId) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(url, svc)
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', callerId)
    const isSuper = (roles || []).some((r: { role: string }) => r.role === 'super_admin')
    const isManager = (roles || []).some((r: { role: string }) => r.role === 'manager')
    if (!isSuper && !isManager) return json({ error: 'Only managers can assign courses' }, 403)

    const parsed = Body.safeParse(await req.json())
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400)
    const body = parsed.data

    if (!isSuper) {
      const { data: me } = await admin.from('profiles').select('dealership_id').eq('user_id', callerId).maybeSingle()
      if (!me?.dealership_id || me.dealership_id !== body.dealershipId) {
        return json({ error: 'You can only assign courses in your own dealership' }, 403)
      }
    }

    const { data: mod } = await admin
      .from('dealership_modules')
      .select('id, dealership_id')
      .eq('id', body.moduleId)
      .maybeSingle()
    if (!mod || mod.dealership_id !== body.dealershipId) return json({ error: 'Course not found' }, 404)

    if (body.action === 'unassign') {
      if (body.userId) {
        await admin.from('course_assignments').delete().eq('module_id', body.moduleId).eq('user_id', body.userId)
      } else {
        await admin.from('course_assignments').delete().eq('module_id', body.moduleId).eq('dealership_id', body.dealershipId)
        await admin.from('course_team_assignments').delete().eq('module_id', body.moduleId).eq('dealership_id', body.dealershipId)
      }
      return json({ ok: true })
    }

    const dueDate = body.dueDate ?? null
    let teamAssignmentId: string | null = null
    let targetIds: string[] = []

    const { data: members } = await admin.from('profiles').select('user_id').eq('dealership_id', body.dealershipId)
    const memberIds = new Set((members || []).map((m: { user_id: string }) => m.user_id))

    if (body.scope === 'team') {
      const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z')
      const dueDays = dueDate
        ? Math.max(1, Math.round((new Date(dueDate + 'T00:00:00Z').getTime() - today.getTime()) / 86400000))
        : null
      const { data: team, error } = await admin
        .from('course_team_assignments')
        .upsert(
          { dealership_id: body.dealershipId, module_id: body.moduleId, due_date: dueDate, due_days: dueDays, assigned_by: callerId },
          { onConflict: 'dealership_id,module_id' },
        )
        .select('id')
        .single()
      if (error) throw error
      teamAssignmentId = team.id
      targetIds = [...memberIds]
    } else {
      targetIds = (body.userIds || []).filter((id) => memberIds.has(id))
      if (targetIds.length === 0) return json({ error: 'Pick at least one person on this team' }, 400)
    }

    // Existing assignments: update due date, don't re-email
    const { data: existing } = await admin
      .from('course_assignments')
      .select('user_id')
      .eq('module_id', body.moduleId)
      .in('user_id', targetIds.length ? targetIds : ['00000000-0000-0000-0000-000000000000'])
    const existingIds = new Set((existing || []).map((e: { user_id: string }) => e.user_id))

    if (existingIds.size > 0) {
      const patch: Record<string, unknown> = { due_date: dueDate, reminder_sent_at: null }
      if (teamAssignmentId) patch.team_assignment_id = teamAssignmentId
      await admin.from('course_assignments').update(patch).eq('module_id', body.moduleId).in('user_id', [...existingIds])
    }

    const newRows = targetIds
      .filter((id) => !existingIds.has(id))
      .map((user_id) => ({
        user_id,
        dealership_id: body.dealershipId,
        module_id: body.moduleId,
        team_assignment_id: teamAssignmentId,
        due_date: dueDate,
        assigned_by: callerId,
      }))

    let emailed = 0
    if (newRows.length > 0) {
      const { data: inserted, error } = await admin
        .from('course_assignments')
        .insert(newRows)
        .select('id, user_id, module_id, due_date, assigned_by')
      if (error) throw error
      for (const a of inserted || []) {
        if (await sendCourseAssignmentEmail(admin, url, svc, a, false)) emailed++
      }
    }

    return json({ ok: true, assigned: newRows.length, updated: existingIds.size, emailed })
  } catch (err) {
    console.error('assign-course error', err)
    return json({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500)
  }
})

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Runs on a daily cron. Sends:
//   - Manager weekly digest to admins/super_admins on Mondays
//   - Learning nudges to reps with modules started 3+ days ago but not completed
//
// Auth: cron calls with service-role key in the Authorization header. Also
// accepts a signed-in super_admin for manual test invocation.

const SITE_NAME = 'Automotive Sales Pro'
const SITE_URL = 'https://automotivesalespro.com'
const TEAM_URL = `${SITE_URL}/team`
const LEARN_URL = `${SITE_URL}/learn`
const NUDGE_DAYS = 3
const NUDGE_COOLDOWN_DAYS = 7

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return json({ error: 'Server configuration error' }, 500)
  }

  // Authorize: allow service_role (cron) or a super_admin user
  const authHeader = req.headers.get('Authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  let authorized = bearer === supabaseServiceKey
  if (!authorized && bearer) {
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData } = await userClient.auth.getUser()
    if (userData?.user) {
      const admin = createClient(supabaseUrl, supabaseServiceKey)
      const { data: roles } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
      if (roles?.some((r: any) => r.role === 'super_admin')) authorized = true
    }
  }
  if (!authorized) return json({ error: 'Unauthorized' }, 401)

  let opts: { forceDigest?: boolean; forceNudges?: boolean } = {}
  try {
    if (req.method === 'POST') opts = await req.json().catch(() => ({}))
  } catch {}

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const now = new Date()
  // Weekdays: 1 = Monday in ISO getUTCDay()? getUTCDay: 0=Sun. Use UTC Monday.
  const isMonday = now.getUTCDay() === 1

  const results = {
    digestsSent: 0,
    nudgesSent: 0,
    digestErrors: 0,
    nudgeErrors: 0,
  }

  // ---------- Manager Weekly Digest ----------
  if (isMonday || opts.forceDigest) {
    const weekStart = new Date(now.getTime() - 7 * 86400 * 1000)
    const weekLabel = formatWeekLabel(weekStart, now)

    const { data: dealerships } = await supabase
      .from('dealerships')
      .select('id, name')

    for (const d of dealerships || []) {
      try {
        // Reps in this dealership
        const { data: reps } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .eq('dealership_id', d.id)
        const repList = reps || []
        if (repList.length === 0) continue

        const repIds = repList.map((r: any) => r.user_id)

        const [sessionsRes, completionsRes, drillsRes] = await Promise.all([
          supabase
            .from('training_sessions')
            .select('user_id, completed_at')
            .in('user_id', repIds)
            .gte('completed_at', weekStart.toISOString())
            .eq('status', 'completed'),
          supabase
            .from('module_completions')
            .select('user_id, completed_at')
            .in('user_id', repIds)
            .gte('completed_at', weekStart.toISOString()),
          supabase
            .from('drill_scores')
            .select('user_id, plays, updated_at')
            .in('user_id', repIds)
            .gte('updated_at', weekStart.toISOString()),
        ])

        const perRep = new Map<string, { sessions: number; modules: number; drills: number }>()
        const bump = (uid: string, key: 'sessions' | 'modules' | 'drills', n = 1) => {
          const row = perRep.get(uid) || { sessions: 0, modules: 0, drills: 0 }
          row[key] += n
          perRep.set(uid, row)
        }
        for (const s of sessionsRes.data || []) bump(s.user_id, 'sessions')
        for (const c of completionsRes.data || []) bump(c.user_id, 'modules')
        // Drills: this week's plays are approximated by rows updated this week
        for (const dr of drillsRes.data || []) bump(dr.user_id, 'drills', dr.plays ?? 1)

        const totalSessions = (sessionsRes.data || []).length
        const totalModules = (completionsRes.data || []).length
        const totalDrills = (drillsRes.data || []).reduce(
          (acc: number, r: any) => acc + (r.plays ?? 1),
          0
        )
        const activeReps = perRep.size

        const nameFor = (uid: string) => {
          const r = repList.find((x: any) => x.user_id === uid)
          return r?.full_name || r?.email || 'Rep'
        }

        const topReps = Array.from(perRep.entries())
          .map(([uid, v]) => ({
            name: nameFor(uid),
            sessions: v.sessions,
            modulesCompleted: v.modules,
            drillsPlayed: v.drills,
          }))
          .sort(
            (a, b) =>
              b.sessions * 2 + b.modulesCompleted * 3 + b.drillsPlayed -
              (a.sessions * 2 + a.modulesCompleted * 3 + a.drillsPlayed)
          )
          .slice(0, 5)

        const inactiveReps = repList
          .filter((r: any) => !perRep.has(r.user_id))
          .map((r: any) => r.full_name || r.email)
          .slice(0, 10)

        // Managers for this dealership
        const { data: managerRoles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', repIds)
          .in('role', ['admin', 'super_admin'])
        const managerIds = new Set((managerRoles || []).map((r: any) => r.user_id))
        // Also include any super_admin regardless of dealership? Keep scope tight.
        const managers = repList.filter((r: any) => managerIds.has(r.user_id))
        if (managers.length === 0) continue

        for (const m of managers) {
          if (!m.email) continue
          const weekKey = weekStart.toISOString().slice(0, 10)
          const key = `weekly-digest-${d.id}-${m.user_id}-${weekKey}`
          const ok = await sendEmail(supabaseUrl, supabaseServiceKey, {
            templateName: 'manager-weekly-digest',
            recipientEmail: m.email,
            idempotencyKey: key,
            templateData: {
              siteName: SITE_NAME,
              siteUrl: SITE_URL,
              dealershipName: d.name || 'Your team',
              weekLabel,
              activeReps,
              totalReps: repList.length,
              totalSessions,
              totalModulesCompleted: totalModules,
              totalDrillsPlayed: totalDrills,
              topReps,
              inactiveReps,
              teamUrl: TEAM_URL,
            },
          })
          if (ok) results.digestsSent++
          else results.digestErrors++
        }
      } catch (err) {
        console.error('digest error for dealership', d.id, err)
        results.digestErrors++
      }
    }
  }

  // ---------- Learning Nudges ----------
  try {
    const threshold = new Date(now.getTime() - NUDGE_DAYS * 86400 * 1000)
    const cooldown = new Date(
      now.getTime() - NUDGE_COOLDOWN_DAYS * 86400 * 1000
    )

    // Progress rows older than threshold
    const { data: progress } = await supabase
      .from('module_section_progress')
      .select('user_id, module_id, updated_at')
      .lt('updated_at', threshold.toISOString())

    if (progress && progress.length > 0) {
      // For each (user, module), keep the most recent updated_at
      const latest = new Map<
        string,
        { user_id: string; module_id: string; updated_at: string }
      >()
      for (const p of progress) {
        const k = `${p.user_id}:${p.module_id}`
        const cur = latest.get(k)
        if (!cur || cur.updated_at < p.updated_at) latest.set(k, p as any)
      }

      const userIds = Array.from(new Set([...latest.values()].map((v) => v.user_id)))
      const moduleIds = Array.from(new Set([...latest.values()].map((v) => v.module_id)))

      const [completionsRes, modulesRes, profilesRes, recentSendsRes] = await Promise.all([
        supabase
          .from('module_completions')
          .select('user_id, module_id')
          .in('user_id', userIds)
          .in('module_id', moduleIds),
        supabase
          .from('dealership_modules')
          .select('id, title, is_active')
          .in('id', moduleIds),
        supabase
          .from('profiles')
          .select('user_id, full_name, email'),
        supabase
          .from('email_send_log')
          .select('recipient_email, metadata, created_at')
          .eq('template_name', 'learning-nudge')
          .gte('created_at', cooldown.toISOString()),
      ])

      const completedSet = new Set(
        (completionsRes.data || []).map((c: any) => `${c.user_id}:${c.module_id}`)
      )
      const modMap = new Map(
        (modulesRes.data || []).map((m: any) => [m.id, m])
      )
      const profileMap = new Map(
        (profilesRes.data || []).map((p: any) => [p.user_id, p])
      )
      // recentNudges: set of `${email}:${module_id}` sent within cooldown
      const recentNudges = new Set<string>()
      for (const row of recentSendsRes.data || []) {
        const mid = (row as any).metadata?.module_id
        if (mid && row.recipient_email) {
          recentNudges.add(`${row.recipient_email}:${mid}`)
        }
      }

      for (const p of latest.values()) {
        const mod = modMap.get(p.module_id) as any
        if (!mod || mod.is_active === false) continue
        if (completedSet.has(`${p.user_id}:${p.module_id}`)) continue
        const profile = profileMap.get(p.user_id) as any
        if (!profile?.email) continue
        if (recentNudges.has(`${profile.email}:${p.module_id}`)) continue

        const daysSince = Math.max(
          NUDGE_DAYS,
          Math.floor(
            (now.getTime() - new Date(p.updated_at).getTime()) / 86400000
          )
        )
        const firstName = (profile.full_name || '').split(' ')[0] || ''
        const dateKey = now.toISOString().slice(0, 10)
        const idempotencyKey = `learning-nudge-${p.user_id}-${p.module_id}-${dateKey}`

        const ok = await sendEmail(supabaseUrl, supabaseServiceKey, {
          templateName: 'learning-nudge',
          recipientEmail: profile.email,
          idempotencyKey,
          templateData: {
            siteName: SITE_NAME,
            siteUrl: SITE_URL,
            firstName,
            moduleTitle: mod.title || 'Your module',
            moduleUrl: `${LEARN_URL}/${p.module_id}`,
            daysSince,
          },
          metadata: { module_id: p.module_id, user_id: p.user_id },
        })
        if (ok) results.nudgesSent++
        else results.nudgeErrors++
      }
    }
  } catch (err) {
    console.error('nudge error', err)
    results.nudgeErrors++
  }

  return json({ ok: true, ...results }, 200)
})

async function sendEmail(
  supabaseUrl: string,
  serviceKey: string,
  body: Record<string, unknown>
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      console.error('send-transactional-email failed', res.status, t)
      return false
    }
    return true
  } catch (err) {
    console.error('send-transactional-email threw', err)
    return false
  }
}

function formatWeekLabel(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const s = start.toLocaleDateString('en-US', opts)
  const e = end.toLocaleDateString('en-US', opts)
  return `${s} – ${e}`
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

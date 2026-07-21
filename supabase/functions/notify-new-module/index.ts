import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Sends ONE email per user summarizing new (un-announced) modules for a
// dealership, then marks those modules as announced.
//
// Body:
//   { dealershipId: string, siteUrl?: string, moduleIds?: string[] }
// If moduleIds is provided, only those modules are announced. Otherwise
// all active un-announced modules for the dealership are batched.
//
// Auth: verify_jwt = true. Caller must be super_admin OR belong to the
// dealership.

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

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser()
  if (userErr || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let body: {
    dealershipId?: string
    moduleIds?: string[]
    siteUrl?: string
    // legacy
    moduleId?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey)

  // Resolve dealershipId — support legacy single moduleId payload
  let dealershipId = body.dealershipId
  let restrictIds: string[] | null = Array.isArray(body.moduleIds) && body.moduleIds.length
    ? body.moduleIds
    : null

  if (!dealershipId && body.moduleId) {
    const { data: m } = await admin
      .from('dealership_modules')
      .select('dealership_id')
      .eq('id', body.moduleId)
      .maybeSingle()
    dealershipId = m?.dealership_id
    restrictIds = [body.moduleId]
  }

  if (!dealershipId) {
    return json({ error: 'dealershipId is required' }, 400)
  }

  // Authorization
  const [{ data: roles }, { data: callerProfile }] = await Promise.all([
    admin.from('user_roles').select('role').eq('user_id', user.id),
    admin
      .from('profiles')
      .select('dealership_id')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])
  const isSuperAdmin =
    !!roles?.some((r: { role: string }) => r.role === 'super_admin')
  const sameDealership = callerProfile?.dealership_id === dealershipId
  if (!isSuperAdmin && !sameDealership) {
    return json({ error: 'Forbidden' }, 403)
  }

  // Load pending modules
  let modQuery = admin
    .from('dealership_modules')
    .select('id, title, description')
    .eq('dealership_id', dealershipId)
    .eq('is_active', true)
    .order('sort_order')
  if (restrictIds) {
    modQuery = modQuery.in('id', restrictIds)
  } else {
    modQuery = modQuery.is('announced_at', null)
  }
  const { data: pendingModules, error: modErr } = await modQuery
  if (modErr) {
    return json({ error: 'Failed to load modules' }, 500)
  }
  if (!pendingModules || pendingModules.length === 0) {
    return json({ success: true, sent: 0, failed: 0, total: 0, modules: 0 })
  }

  const { data: dealership } = await admin
    .from('dealerships')
    .select('name')
    .eq('id', dealershipId)
    .maybeSingle()

  const { data: recipients, error: recErr } = await admin
    .from('profiles')
    .select('email')
    .eq('dealership_id', dealershipId)
    .not('email', 'is', null)
  if (recErr) {
    return json({ error: 'Failed to load recipients' }, 500)
  }

  const emails = Array.from(
    new Set(
      (recipients ?? [])
        .map((r: { email: string | null }) => (r.email ?? '').trim().toLowerCase())
        .filter((e) => !!e),
    ),
  )

  const siteUrl = (body.siteUrl || '').replace(/\/$/, '')
  const base = siteUrl || 'https://automotivesalespro.com'
  const moduleItems = pendingModules.map((m: any) => ({
    title: m.title,
    description: m.description || '',
    url: `${base}/learn/dealership/${m.id}`,
  }))
  const moduleIdsCsv = pendingModules.map((m: any) => m.id).join(',')

  let sent = 0
  let failed = 0

  await Promise.all(
    emails.map(async (email) => {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/send-transactional-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseServiceKey,
            },
            body: JSON.stringify({
              templateName: 'new-module-notification',
              recipientEmail: email,
              idempotencyKey: `new-modules-${dealershipId}-${moduleIdsCsv}-${email}`,
              templateData: {
                siteName: 'Automotive Sales Pro',
                siteUrl: base,
                learnUrl: `${base}/learn`,
                dealershipName: dealership?.name,
                modules: moduleItems,
              },
            }),
          },
        )
        if (!res.ok) {
          failed++
          const t = await res.text()
          console.error('send-transactional-email failed', res.status, t)
        } else {
          sent++
        }
      } catch (err) {
        failed++
        console.error('send-transactional-email threw', err)
      }
    }),
  )

  // Mark modules as announced
  await admin
    .from('dealership_modules')
    .update({ announced_at: new Date().toISOString() })
    .in('id', pendingModules.map((m: any) => m.id))

  return json({
    success: true,
    sent,
    failed,
    total: emails.length,
    modules: pendingModules.length,
  })
})

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

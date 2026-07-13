import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Broadcasts a "new module available" email to every user in a dealership
// by invoking the shared send-transactional-email function once per user.
//
// Auth: verify_jwt = true. Caller must be a signed-in user who is either
// super_admin OR belongs to the module's dealership (defense in depth —
// dealerships table RLS is already enforced separately).

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

  // Client bound to the caller's JWT for identity check
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
    moduleId?: string
    siteUrl?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const moduleId = body.moduleId
  if (!moduleId || typeof moduleId !== 'string') {
    return json({ error: 'moduleId is required' }, 400)
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey)

  // Load the module
  const { data: moduleRow, error: moduleErr } = await admin
    .from('dealership_modules')
    .select('id, dealership_id, title, description')
    .eq('id', moduleId)
    .maybeSingle()

  if (moduleErr || !moduleRow) {
    return json({ error: 'Module not found' }, 404)
  }

  // Authorization: super_admin OR user belongs to the module's dealership
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
  const sameDealership =
    callerProfile?.dealership_id === moduleRow.dealership_id

  if (!isSuperAdmin && !sameDealership) {
    return json({ error: 'Forbidden' }, 403)
  }

  // Dealership name (for email body)
  const { data: dealership } = await admin
    .from('dealerships')
    .select('name')
    .eq('id', moduleRow.dealership_id)
    .maybeSingle()

  // Recipients: every profile in the dealership with an email
  const { data: recipients, error: recErr } = await admin
    .from('profiles')
    .select('email')
    .eq('dealership_id', moduleRow.dealership_id)
    .not('email', 'is', null)

  if (recErr) {
    console.error('Failed to load recipients', recErr)
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
  const moduleUrl = siteUrl
    ? `${siteUrl}/learn/dealership/${moduleRow.id}`
    : `/learn/dealership/${moduleRow.id}`

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
              idempotencyKey: `new-module-${moduleRow.id}-${email}`,
              templateData: {
                siteName: 'Automotive Sales Pro',
                siteUrl: siteUrl || 'https://automotivesalespro.com',
                moduleTitle: moduleRow.title,
                moduleDescription: moduleRow.description || '',
                moduleUrl,
                dealershipName: dealership?.name,
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

  return json({ success: true, sent, failed, total: emails.length })
})

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

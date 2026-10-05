// Sends a registered app email through the managed send helper and records
// the outcome in email_send_log (sent / suppressed / failed), like the old
// queue did. A log-write failure never changes the send result.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from './transactional-email-templates/send-email.ts'

let logClient: ReturnType<typeof createClient> | null = null
function getLogClient() {
  if (!logClient) {
    logClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  }
  return logClient
}

async function log(row: Record<string, unknown>) {
  const { error } = await getLogClient().from('email_send_log').insert(row)
  if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
}

export async function sendAppEmail(params: {
  templateName: string
  recipientEmail: string
  idempotencyKey: string
  templateData?: Record<string, unknown>
  metadata?: Record<string, unknown>
}): Promise<boolean> {
  const { templateName, recipientEmail, idempotencyKey, templateData, metadata } = params
  const base = { message_id: null, template_name: templateName, recipient_email: recipientEmail, metadata: metadata ?? null }
  try {
    const result = await sendTemplateEmail(templateName, recipientEmail, { templateData, idempotencyKey })
    if (result.sent) {
      await log({ ...base, status: 'sent' })
      return true
    }
    await log({ ...base, status: 'suppressed' })
    return false
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('app email send failed', { templateName, error: msg })
    await log({ ...base, status: 'failed', error_message: msg.slice(0, 1000) })
    return false
  }
}

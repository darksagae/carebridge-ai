import { z } from 'zod'
import { GatewayError, aiBrief, gatewayConfig } from '@/lib/gateway'
import { HttpError, assertSameOrigin, clientAddress, json, rateLimit, readJson } from '@/lib/http'
import { intakeSchema } from '@/lib/intake'

const requestSchema = z.object({
  intake: intakeSchema,
  consent: z.literal(true, { error: 'Please agree to send your notes to the AI service first.' }),
})

/** Tells the browser whether AI drafting is available, without revealing configuration. */
export function GET() {
  return json({ ai: gatewayConfig() !== null })
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    rateLimit(`brief:${clientAddress(request)}`, 10, 10 * 60_000)
    const parsed = requestSchema.safeParse(await readJson(request))
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Check your answers.')
    return json({ brief: await aiBrief(parsed.data.intake) })
  } catch (error) {
    if (error instanceof HttpError || error instanceof GatewayError) {
      return json({ error: error.message, code: error.code }, error.status)
    }
    console.error('Unexpected error while drafting a brief')
    return json({ error: 'Something went wrong. Try again or use the template.', code: 'server_error' }, 500)
  }
}

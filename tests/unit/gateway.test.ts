import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from '@/app/api/brief/route'
import { GATEWAY_URL, aiBrief } from '@/lib/gateway'
import { resetRateLimits } from '@/lib/http'
import { intake } from './fixtures'

const draft = {
  summary: 'I have had headaches most afternoons for two weeks and I feel tired.',
  tell: ['Headache, daily, 6/10, for two weeks'],
  questions: [
    { text: 'What could be causing my headaches?', priority: 'normal' },
    { text: 'Could my screen time be causing this?', priority: 'normal' },
  ],
  bring: ['My medicines'],
}

const reply = (content: unknown, status = 200) =>
  new Response(
    JSON.stringify({
      model: 'test/model',
      choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }],
    }),
    { status, headers: { 'content-type': 'application/json' } },
  )

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://localhost:3000/api/brief', {
    method: 'POST',
    headers: { host: 'localhost:3000', 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

beforeEach(() => {
  resetRateLimits()
  vi.stubEnv('AI_GATEWAY_API_KEY', 'test-only')
  vi.stubEnv('AI_GATEWAY_MODEL', 'test/model')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('AI gateway adapter', () => {
  it('sends the notes as data and keeps the person’s own questions first', async () => {
    const fetcher = vi.fn(async () => reply(draft))
    const brief = await aiBrief(intake, fetcher as unknown as typeof fetch)
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe(GATEWAY_URL)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-only')
    const sent = JSON.parse(String(init.body))
    expect(sent.messages[0].content).toMatch(/Do not diagnose/)
    expect(sent.messages[1].content).toContain('Could my screen time be causing this?')
    expect(brief.source).toBe('ai')
    expect(brief.model).toBe('test/model')
    expect(brief.questions[0]).toMatchObject({ text: 'Could my screen time be causing this?', priority: 'high' })
    expect(brief.questions.filter((q) => q.text.startsWith('Could my screen'))).toHaveLength(1)
  })

  it('accepts JSON wrapped in a code fence', async () => {
    const brief = await aiBrief(intake, (async () =>
      reply('```json\n' + JSON.stringify(draft) + '\n```')) as unknown as typeof fetch)
    expect(brief.summary).toBe(draft.summary)
  })

  it('rejects malformed or failed responses', async () => {
    await expect(aiBrief(intake, (async () => reply('not json')) as unknown as typeof fetch)).rejects.toThrow(
      /unusable/,
    )
    await expect(aiBrief(intake, (async () => reply({ summary: 'x' })) as unknown as typeof fetch)).rejects.toThrow(
      /unusable/,
    )
    await expect(aiBrief(intake, (async () => reply(draft, 429)) as unknown as typeof fetch)).rejects.toThrow(/busy/)
    await expect(
      aiBrief(intake, (async () => {
        throw new TypeError('network')
      }) as unknown as typeof fetch),
    ).rejects.toThrow(/could not be reached/)
  })
})

describe('/api/brief', () => {
  it('reports whether AI is available', async () => {
    expect(await (await GET()).json()).toEqual({ ai: true })
    vi.stubEnv('AI_GATEWAY_API_KEY', '')
    expect(await (await GET()).json()).toEqual({ ai: false })
  })

  it('requires consent, valid input and the same origin', async () => {
    expect((await POST(post({ intake, consent: false }))).status).toBe(400)
    expect((await POST(post({ intake: { ...intake, concern: 'x' }, consent: true }))).status).toBe(400)
    expect((await POST(post({ intake, consent: true }, { origin: 'https://evil.example' }))).status).toBe(403)
  })

  it('returns 503 when AI is not configured', async () => {
    vi.stubEnv('AI_GATEWAY_API_KEY', '')
    const response = await POST(post({ intake, consent: true }))
    expect(response.status).toBe(503)
    expect((await response.json()).code).toBe('ai_unavailable')
  })

  it('returns a validated AI brief', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => reply(draft)),
    )
    const response = await POST(post({ intake, consent: true }))
    expect(response.status).toBe(200)
    expect((await response.json()).brief.source).toBe('ai')
  })
})
